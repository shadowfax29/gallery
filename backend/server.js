const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5042;
const IS_DEV = process.env.NODE_ENV !== 'production';

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));
app.use(express.json());

let eventLogs = [];

/*
  insertion bridge:
  - This script will be injected into preview HTML responses so the iframe can accept
    cross-origin postMessage requests of type INSERT_NODE / INSERT_ADTAG / INSERT_REMNANT_AD.
  - The bridge parses incoming HTML, recreates <script>, <link>, <style> elements
    and appends them into the target element (head/body) so scripts actually execute.
  - For REMNANT ads, it handles special placement logic (sidebar detection, H1 insertion).
  - We avoid double-injecting by checking for the marker string.
*/
const INSERTION_BRIDGE_SNIPPET = [
  '<script>',
  '  (function(){',
  '    if (window.__previewInsertionBridge) return;',
  '    window.__previewInsertionBridge = true;',
  '    console.log("[Bridge] ✅ Insertion bridge initialized and ready");',
  '',
  '    function insertHtml(doc, html, targetSelector){',
  '      try {',
  '        console.log("[Bridge] insertHtml called with targetSelector:", targetSelector);',
  '        var container = doc.querySelector(targetSelector) || doc.head || doc.body || doc.documentElement;',
  '        if (!container) {',
  '          console.warn("[Bridge] No container found for:", targetSelector);',
  '          return;',
  '        }',
  '        console.log("[Bridge] Found container:", container.tagName);',
  '        var template = doc.createElement("template");',
  '        template.innerHTML = html;',
  '        var children = Array.from(template.content.childNodes);',
  '        console.log("[Bridge] Processing", children.length, "child nodes");',
  '        children.forEach(function(node){',
  '          if (node.nodeType === Node.ELEMENT_NODE) {',
  '            var el = node;',
  '            var tag = el.tagName.toLowerCase();',
  '            if (tag === "script") {',
  '              var s = doc.createElement("script");',
  '              Array.from(el.attributes).forEach(function(a){ try { s.setAttribute(a.name, a.value); } catch(e){} });',
  '              if (el.src) {',
  '                s.src = el.getAttribute("src");',
  '                if (el.hasAttribute("async")) s.async = true;',
  '                if (el.hasAttribute("defer")) s.defer = true;',
  '              } else {',
  '                s.textContent = el.textContent;',
  '              }',
  '              container.appendChild(s);',
  '            } else if (tag === "link") {',
  '              var l = doc.createElement("link");',
  '              Array.from(el.attributes).forEach(function(a){ try { l.setAttribute(a.name, a.value); } catch(e){} });',
  '              container.appendChild(l);',
  '            } else if (tag === "style") {',
  '              var st = doc.createElement("style");',
  '              st.textContent = el.textContent || "";',
  '              Array.from(el.attributes).forEach(function(a){ try { st.setAttribute(a.name, a.value); } catch(e){} });',
  '              container.appendChild(st);',
  '            } else {',
  '              try {',
  '                container.appendChild(doc.importNode(el, true));',
  '              } catch (e) {',
  '                var fallback = doc.createElement("div");',
  '                fallback.innerHTML = el.outerHTML;',
  '                while (fallback.firstChild) container.appendChild(fallback.firstChild);',
  '              }',
  '            }',
  '          } else {',
  '            container.appendChild(doc.createTextNode(node.textContent || ""));',
  '          }',
  '        });',
  '        console.log("[Bridge] Ad tag inserted successfully");',
  '      } catch (e) {',
  '        console.warn("insertHtml error:", e);',
  '      }',
  '    }',
  '',
  '    function findSidebar(doc) {',
  '      var primarySelectors = [',
  '        "div[class*=\\"sidebar\\"]",',
  '        "aside[class*=\\"sidebar\\"]",',
  '        "div[class*=\\"aside\\"]",',
  '        "section[class*=\\"sidebar\\"]"',
  '      ];',
  '      for (var i = 0; i < primarySelectors.length; i++) {',
  '        var elements = doc.querySelectorAll(primarySelectors[i]);',
  '        for (var j = 0; j < elements.length; j++) {',
  '          var el = elements[j];',
  '          if (el && el.parentElement) {',
  '            var style = window.getComputedStyle(el);',
  '            if (style.display !== "none" && style.visibility !== "hidden") {',
  '              console.log("[Remnant] Found sidebar with selector: " + primarySelectors[i], el.className);',
  '              return el;',
  '            }',
  '          }',
  '        }',
  '      }',
  '      var secondarySelectors = [',
  '        "aside",',
  '        "[role=\\"complementary\\"]",',
  '        ".sidebar",',
  '        "#sidebar",',
  '        ".widget-area",',
  '        ".side-bar",',
  '        ".right-sidebar",',
  '        ".left-sidebar"',
  '      ];',
  '      for (var i = 0; i < secondarySelectors.length; i++) {',
  '        var el = doc.querySelector(secondarySelectors[i]);',
  '        if (el && el.parentElement) {',
  '          var style = window.getComputedStyle(el);',
  '          if (style.display !== "none" && style.visibility !== "hidden") {',
  '            console.log("[Remnant] Found sidebar with selector: " + secondarySelectors[i]);',
  '            return el;',
  '          }',
  '        }',
  '      }',
  '      console.log("[Remnant] No sidebar found");',
  '      return null;',
  '    }',
  '',
  '    function findH1(doc) {',
  '      var h1 = doc.querySelector("h1");',
  '      if (h1) {',
  '        console.log("[Remnant] Found H1");',
  '        return h1;',
  '      }',
  '      var selectors = [".entry-title", ".post-title", ".article-title", "header h2", ".content h2", ".title"];',
  '      for (var i = 0; i < selectors.length; i++) {',
  '        var el = doc.querySelector(selectors[i]);',
  '        if (el) {',
  '          console.log("[Remnant] Found heading with selector: " + selectors[i]);',
  '          return el;',
  '        }',
  '      }',
  '      console.log("[Remnant] No H1 or heading found");',
  '      return null;',
  '    }',
  '',
  '    function insertAfter(newNode, referenceNode) {',
  '      if (referenceNode && referenceNode.parentNode) {',
  '        if (referenceNode.nextSibling) {',
  '          referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);',
  '        } else {',
  '          referenceNode.parentNode.appendChild(newNode);',
  '        }',
  '        return true;',
  '      }',
  '      return false;',
  '    }',
  '',
  '    function createAdContainer(doc, html, size, position) {',
  '      var container = doc.createElement("div");',
  '      container.className = "remnant-ad-container remnant-ad-" + size.replace("x", "-") + " remnant-position-" + position;',
  '      container.setAttribute("data-ad-size", size);',
  '      container.setAttribute("data-ad-position", position);',
  '      if (position === "sidebar") {',
  '        container.style.cssText = "margin: 10px 0; text-align: center; display: block; width: 100%; box-sizing: border-box;";',
  '      } else {',
  '        container.style.cssText = "margin: 20px auto; text-align: center; clear: both; display: block; width: 100%;";',
  '      }',
  '      var template = doc.createElement("template");',
  '      template.innerHTML = html;',
  '      var children = Array.from(template.content.childNodes);',
  '      children.forEach(function(node){',
  '        if (node.nodeType === Node.ELEMENT_NODE) {',
  '          var el = node;',
  '          var tag = el.tagName.toLowerCase();',
  '          if (tag === "script") {',
  '            var s = doc.createElement("script");',
  '            Array.from(el.attributes).forEach(function(a){ try { s.setAttribute(a.name, a.value); } catch(e){} });',
  '            if (el.src) {',
  '              s.src = el.getAttribute("src");',
  '              if (el.hasAttribute("async")) s.async = true;',
  '              if (el.hasAttribute("defer")) s.defer = true;',
  '            } else {',
  '              s.textContent = el.textContent;',
  '            }',
  '            container.appendChild(s);',
  '          } else {',
  '            try {',
  '              container.appendChild(doc.importNode(el, true));',
  '            } catch (e) {',
  '              var fallback = doc.createElement("div");',
  '              fallback.innerHTML = el.outerHTML;',
  '              while (fallback.firstChild) container.appendChild(fallback.firstChild);',
  '            }',
  '          }',
  '        }',
  '      });',
  '      return container;',
  '    }',
  '',
  '    function insertRemnantAd(doc, html, size, deviceType, retryCount) {',
  '      retryCount = retryCount || 0;',
  '      var maxRetries = 3;',
  '      try {',
  '        console.log("[Remnant] Attempting insertion - Size: " + size + ", Device: " + deviceType + ", Retry: " + retryCount);',
  '        var isDesktop = deviceType === "desktop";',
  '        var isSidebarSize = (size === "300x250" || size === "300x600");',
  '        if (isDesktop && isSidebarSize) {',
  '          var sidebar = findSidebar(doc);',
  '          if (sidebar) {',
  '            var adContainer = createAdContainer(doc, html, size, "sidebar");',
  '            if (sidebar.firstElementChild) {',
  '              sidebar.insertBefore(adContainer, sidebar.firstElementChild);',
  '            } else {',
  '              sidebar.appendChild(adContainer);',
  '            }',
  '            console.log("[Remnant] Inserted " + size + " in sidebar");',
  '            return true;',
  '          } else {',
  '            console.log("[Remnant] Sidebar not found for " + size + ", falling back to H1");',
  '          }',
  '        }',
  '        var h1 = findH1(doc);',
  '        if (h1) {',
  '          var adContainer = createAdContainer(doc, html, size, "under-h1");',
  '          if (insertAfter(adContainer, h1)) {',
  '            console.log("[Remnant] Inserted " + size + " after H1");',
  '            return true;',
  '          }',
  '        }',
  '        var mainContent = doc.querySelector("main, article, .content, .post, .entry-content, #content, .main-content");',
  '        if (mainContent) {',
  '          var adContainer = createAdContainer(doc, html, size, "content");',
  '          if (mainContent.firstElementChild) {',
  '            mainContent.insertBefore(adContainer, mainContent.firstElementChild);',
  '          } else {',
  '            mainContent.appendChild(adContainer);',
  '          }',
  '          console.log("[Remnant] Inserted " + size + " in main content");',
  '          return true;',
  '        }',
  '        if (retryCount < maxRetries) {',
  '          console.log("[Remnant] No suitable location found, retrying in 500ms...");',
  '          setTimeout(function() {',
  '            insertRemnantAd(doc, html, size, deviceType, retryCount + 1);',
  '          }, 500);',
  '          return false;',
  '        }',
  '        if (doc.body && doc.body.firstElementChild) {',
  '          var adContainer = createAdContainer(doc, html, size, "body-top");',
  '          doc.body.insertBefore(adContainer, doc.body.firstElementChild);',
  '          console.log("[Remnant] Inserted " + size + " at body top (fallback)");',
  '          return true;',
  '        }',
  '        console.warn("[Remnant] Could not find suitable location for ad");',
  '        return false;',
  '      } catch (e) {',
  '        console.warn("[Remnant] insertRemnantAd error:", e);',
  '        return false;',
  '      }',
  '    }',
  '',
  '    function delayedInsertRemnantAd(doc, html, size, deviceType) {',
  '      if (doc.readyState === "complete" || doc.readyState === "interactive") {',
  '        setTimeout(function() {',
  '          insertRemnantAd(doc, html, size, deviceType, 0);',
  '        }, 100);',
  '      } else {',
  '        doc.addEventListener("DOMContentLoaded", function() {',
  '          setTimeout(function() {',
  '            insertRemnantAd(doc, html, size, deviceType, 0);',
  '          }, 100);',
  '        });',
  '      }',
  '    }',
  '',
  '    function observeVideoPlayer(bannerId, maxWait) {',
  '      maxWait = maxWait || 15000;',
  '      var start = Date.now();',
  '',
  '      function findPlayer() {',
  '        var selectors = ["video", "#player", ".player", "#video-player", ".video-player", "[id*=player]", "[class*=player]"];',
  '        for (var i = 0; i < selectors.length; i++) {',
  '          var el = document.querySelector(selectors[i]);',
  '          if (el) {',
  '            var rect = el.getBoundingClientRect();',
  '            if (rect.width > 0 && rect.height > 0) return el;',
  '          }',
  '        }',
  '        return null;',
  '      }',
  '',
  '      function attach() {',
  '        var player = findPlayer();',
  '        if (player) {',
  '          console.log("[Bridge] Found player element, attaching observer");',
  '          var observer = new IntersectionObserver(function(entries) {',
  '            entries.forEach(function(entry) {',
  '              var banner = document.getElementById(bannerId);',
  '              if (!banner) return;',
  '              if (entry.isIntersecting && entry.intersectionRatio > 0.4) {',
  '                banner.style.display = "none";',
  '              } else {',
  '                banner.style.display = "block";',
  '              }',
  '            });',
  '          }, { threshold: [0.4] });',
  '          observer.observe(player);',
  '          return true;',
  '        }',
  '        return false;',
  '      }',
  '',
  '      if (attach()) return;',
  '',
  '      var timer = setInterval(function() {',
  '        if (Date.now() - start > maxWait) {',
  '          clearInterval(timer);',
  '          console.warn("[Bridge] Timed out waiting for video player element");',
  '          return;',
  '        }',
  '        if (attach()) clearInterval(timer);',
  '      }, 500);',
  '    }',
  '',
  '    window.addEventListener("message", function(ev){',
  '      try {',
  '        var d = ev && ev.data;',
  '        if (!d || typeof d !== "object") return;',
  '        console.log("[Bridge] 📨 Received message:", d.__type || "unknown");',
  '        if (d.__type === "INSERT_NODE" || d.__type === "INSERT_ADTAG") {',
  '          console.log("[Bridge] Received INSERT_ADTAG message", d.__type);',
  '          console.log("[Bridge] HTML length:", (d.html || "").length);',
  '          console.log("[Bridge] Target:", d.targetSelector || "head");',
  '          insertHtml(document, d.html || "", d.targetSelector || "head");',
  '        }',
  '        if (d.__type === "INSERT_REMNANT_AD") {',
  '          console.log("[Remnant] Received INSERT_REMNANT_AD message", d);',
  '          delayedInsertRemnantAd(document, d.html || "", d.size || "300x250", d.deviceType || "desktop");',
  '        }',
  '        if (d.__type === "CHECK_SIDEBAR") {',
  '          var sidebar = findSidebar(document);',
  '          window.parent.postMessage({',
  '            __type: "SIDEBAR_STATUS",',
  '            hasSidebar: !!sidebar,',
  '            sidebarSelector: sidebar ? (sidebar.className || sidebar.id || sidebar.tagName) : null',
  '          }, "*");',
  '        }',
  '      } catch(e){',
  '        console.warn("[Bridge] postMessage handler error:", e);',
  '      }',
  '    }, false);',
  '',
  '    window.addEventListener("message", function(ev){',
  '',
  '        try {',
  '',
  '          var d = ev && ev.data;',
  '',
  '          if (!d || typeof d !== "object") return;',
  '',
  '          if (',
  '            d.__type === "INSERT_ADTAG" &&',
  '            d.format === "hybrid-video"',
  '          ) {',
  '',
  '            if (document.getElementById("hybrid-player-banner")) {',
  '              return;',
  '            }',
  '',
  '            console.log("hybrid slider loaded");',
  '',
  '            var hybridDiv = document.createElement("div");',
  '',
  '            hybridDiv.innerHTML = `',
  '',
  '              <div',
  '                id="hybrid-player-banner"',
  '                style="',
  '                  position: fixed;',
  '                  right: 0;',
  '                  bottom: 21px;',
  '                  width: 320px;',
  '                  background: #fff;',
  '                  border: 1px solid black;',
  '                  box-shadow: 0 4px 20px rgba(0,0,0,0.25);',
  '                  z-index: 999999999;',
  '                  overflow: visible;',
  '                  animation: slideInRight 0.4s ease;',
  '                "',
  '              >',
  '',
  '                <div',
  '                  style="',
  '                    position: absolute;',
  '                    top: -1px;',
  '                    right: 319px;',
  '                    width: 28px;',
  '                    height: 28px;',
  '                    background: #000;',
  '                    color: #fff;',
  '                    display: flex;',
  '                    align-items: center;',
  '                    justify-content: center;',
  '                    cursor: pointer;',
  '                    font-size: 16px;',
  '                    font-weight: bold;',
  '                    z-index: 99999;',
  '                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);',
  '                  "',
  '                  onclick="document.getElementById(\\\'hybrid-player-banner\\\').remove()"',
  '                >',
  '                  ×',
  '                </div>',
  '',
  '                <img',
  '                  src="/assets/pexels-photo-3183150.avif"',
  '                  style="',
  '                    width: 100%;',
  '                    display: block;',
  '                  "',
  '                />',
  '',
  '              </div>',
  '',
  '              <style>',
  '                @keyframes slideInRight {',
  '                  from {',
  '                    transform: translateX(100%);',
  '                  }',
  '                  to {',
  '                    transform: translateX(0);',
  '                  }',
  '                }',
  '              </style>',
  '            `;',
  '',
  '            document.body.appendChild(hybridDiv);',
  '            observeVideoPlayer("hybrid-player-banner");',
  '          }',
  '',
  '        } catch(e) {',
  '          console.warn(e);',
  '        }',
  '',
  '      }, false);',
  '',
  '    console.log("[Bridge] 🎧 Message listener registered and waiting for ad tags...");',
  '  })();',
  '</script>',
  '<style>',
  '  /* Font fallbacks to prevent CORS errors */',
  '  @font-face { font-family: "FontAwesome"; src: local("Arial"); font-display: swap; }',
  '  @font-face { font-family: "fontawesome"; src: local("Arial"); font-display: swap; }',
  '  @font-face { font-family: "Font Awesome 5 Free"; src: local("Arial"); font-display: swap; }',
  '  @font-face { font-family: "Font Awesome 5 Brands"; src: local("Arial"); font-display: swap; }',
  '  @font-face { font-family: "Linearicons-Free"; src: local("Arial"); font-display: swap; }',
  '  @font-face { font-family: "linearicons-free"; src: local("Arial"); font-display: swap; }',
  '  .fa, .fab, .fal, .far, .fas, .lnr { font-family: Arial, sans-serif !important; }',
  '</style>'
].join('\n');

/**
 * Inject the insertion bridge snippet into an HTML string.
 * - If HTML already contains the bridge marker, do nothing.
 * - Prefer to insert right after <head> opening tag; fallback to top of <body>; fallback to prepend.
 */
function injectInsertionBridgeIntoHtml(html) {
  if (typeof html !== 'string' || !html) return html;
  try {
    if (html.indexOf('window.__previewInsertionBridge') !== -1) {
      return html;
    }
    if (/<head[^>]*>/i.test(html)) {
      return html.replace(/<head([^>]*)>/i, '<head$1>' + INSERTION_BRIDGE_SNIPPET);
    }
    if (/<body[^>]*>/i.test(html)) {
      return html.replace(/<body([^>]*)>/i, '<body$1>' + INSERTION_BRIDGE_SNIPPET);
    }
    return INSERTION_BRIDGE_SNIPPET + html;
  } catch (e) {
    console.warn('injectInsertionBridgeIntoHtml error:', e);
    return html;
  }
}

/**
 * Inject chosum.css into an HTML string.
 */
function injectChosumCss(html) {
  if (typeof html !== 'string' || !html) return html;
  try {
    if (html.indexOf('__chosum_css_injected__') !== -1) return html;
    const cssPath = path.join(__dirname, '..', 'frontend', 'src', 'chosum.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    const styleTag = '<style id="chosum-styles">\n' + cssContent + '\n</style>';
    const marker = '<!-- __chosum_css_injected__ -->';
    if (/<head[^>]*>/i.test(html)) {
      return html.replace(/<head([^>]*)>/i, '<head$1>' + marker + styleTag);
    }
    if (/<body[^>]*>/i.test(html)) {
      return html.replace(/<body([^>]*)>/i, '<body$1>' + marker + styleTag);
    }
    return marker + styleTag + html;
  } catch (e) {
    console.warn('injectChosumCss error:', e.message);
    return html;
  }
}

// Main preview endpoint
app.get("/preview", async (req, res) => {
  const { url, adTag } = req.query;

  if (!url) return res.status(400).send("Missing URL");

  const FALLBACK_URL = "https://dev.tapmind.io/new_demo/index.html";
  const TIMEOUT_LIMIT = 60000; // 60 seconds
  let useFallback = false;
  const originalUrl = url;

  // Main URL processing function
  const processUrl = async (targetUrl, adTagParam) => {
    const startTime = Date.now();
    let browser = null;
    let context = null;
    let page = null;

    try {
      browser = await Promise.race([
        chromium.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-blink-features=AutomationControlled",
            "--disable-web-security",
            "--disable-features=VizDisplayCompositor",
            "--disable-extensions",
            "--disable-plugins",
            "--disable-dev-shm-usage",
            "--no-zygote",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu",
            "--disable-background-timer-throttling",
            "--disable-renderer-backgrounding",
            "--disable-backgrounding-occluded-windows",
            "--force-device-scale-factor=1",
            "--disable-ipc-flooding-protection",
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
            "--disable-http2"
          ]
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Browser launch timeout')), 15000)
        )
      ]);

      context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        locale: "en-US",
        bypassCSP: true,
        ignoreHTTPSErrors: true,
        viewport: { width: 1920, height: 1080 },
        extraHTTPHeaders: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      page = await context.newPage();

      // anti-bot / environment tweaks (kept as-is)
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => false });
        window.chrome = window.chrome || { runtime: {}, app: { isInstalled: false }, webstore: {} };
        Object.defineProperty(navigator, "plugins", { get: () => [{ name: "Chrome PDF Plugin", length: 1 }] });
        Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
        );
        try { delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array; } catch (e) { }
      });

      // routing and blocking
      // const targetHost = new URL(targetUrl).hostname;
      function getBaseDomain(hostname) {
        const parts = hostname.split('.');
        return parts.length > 2 ? parts.slice(-2).join('.') : hostname;
      }
      const targetBaseDomain = getBaseDomain(new URL(targetUrl).hostname);
      await page.route("**/*", async (route) => {
        const req = route.request();
        const reqUrl = req.url();
        try {
          if (Date.now() - startTime > TIMEOUT_LIMIT) return route.abort();

          const blockedDomains = [
            "googlesyndication.com",
            "doubleclick.net",
            "adservice.google.com",
            "google-analytics.com",
            "googletagmanager.com",
            "facebook.net",
            "ads-twitter.com",
            "taboola.com",
            "outbrain.com",
            "playstream.media",
            "ads.playstream.media",
            "googleadservices.com",
            "adsystem.com",
            "amazon-adsystem.com",
            "scorecardresearch.com",
            "quantserve.com"
          ];
          if (blockedDomains.some((d) => reqUrl.includes(d))) {
            console.log(`[BLOCKED-AD] ${reqUrl.substring(0, 120)}`);
            return route.abort();
          }

          const reqHost = new URL(reqUrl).hostname;
          const allowedCDNs = [
            "cdnjs.cloudflare.com",
            "cdn.jsdelivr.net",
            "unpkg.com",
            "fonts.googleapis.com",
            "fonts.gstatic.com",
            "ajax.googleapis.com",
            "bidsxchange.com",
            "bsrv.bidsxchange.com",
            "play.bidsxchange.com",
            "tapmind.io",
            "image.chosun.com",
            "cloudfront-ap-northeast-1.images.arcpublishing.com",
            "images.pexels.com",
            "images.unsplash.com"
          ];

          const reqBaseDomain = getBaseDomain(reqHost);
          const isTargetOrSubdomain = reqBaseDomain === targetBaseDomain;
          const isKnownCDN = allowedCDNs.some(d => reqHost === d || reqHost.endsWith('.' + d));

          if (!isTargetOrSubdomain && !isKnownCDN) {
            console.log(`[BLOCKED] ${reqHost} | ${reqUrl.substring(0, 120)}`);
            return route.abort();
          }
          await route.continue();
        } catch (error) {
          console.log(`Route error for ${reqUrl}:`, error && error.message);
          try { return route.abort(); } catch (e) { }
        }
      });

      // navigation strategies
      let navigationSuccess = false;
      const navigationStrategies = [
        { waitUntil: "domcontentloaded", timeout: 20000 },
        { waitUntil: "load", timeout: 30000 },
        { waitUntil: "networkidle", timeout: 40000 }
      ];

      for (const strategy of navigationStrategies) {
        try {
          if (Date.now() - startTime > TIMEOUT_LIMIT) throw new Error('Global timeout exceeded during navigation');

          await Promise.race([
            page.goto(targetUrl, strategy),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Navigation timeout with ${strategy.waitUntil}`)), strategy.timeout)
            )
          ]);

          navigationSuccess = true;
          break;
        } catch (navError) {
          if (Date.now() - startTime > TIMEOUT_LIMIT - 10000) throw new Error('Approaching timeout limit, aborting navigation attempts');
          if (strategy === navigationStrategies[navigationStrategies.length - 1]) throw navError;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!navigationSuccess) throw new Error('All navigation strategies failed');

      await Promise.race([page.waitForTimeout(3000), new Promise(resolve => setTimeout(resolve, 3000))]);

      // SAFE: decode adTag with try/catch + limit
      let decodedTag = null;
      if (adTagParam) {
        try {
          // adTagParam may already be a decoded string (express), guard double decoding
          decodedTag = typeof adTagParam === 'string' ? decodeURIComponent(adTagParam) : String(adTagParam);
        } catch (e) {
          console.warn("adTag decode failed, using raw value:", e && e.message);
          decodedTag = String(adTagParam);
        }
        // limit size to avoid huge payloads
        if (decodedTag.length > 200000) {
          decodedTag = decodedTag.slice(0, 200000);
          console.warn("adTag truncated due to size limit");
        }

        // Attempt injection (wrapped in try/catch to avoid blowing up)
        try {
          await page.evaluate((html) => {
            try {
              let container = document.querySelector("#injected-preview-ad-container");
              if (!container) {
                container = document.createElement("div");
                container.id = "injected-preview-ad-container";
                if (document.body) {
                  document.body.appendChild(container);
                } else {
                  const newBody = document.createElement("body");
                  document.documentElement.appendChild(newBody);
                  newBody.appendChild(container);
                }
              }
              container.innerHTML = "";
              const wrapper = document.createElement("div");
              wrapper.innerHTML = html;
              wrapper.style.display = "none";
              wrapper.style.position = "relative";
              wrapper.style.zIndex = "999999";
              container.appendChild(wrapper);
              wrapper.querySelectorAll("script").forEach((oldScript) => {
                const newScript = document.createElement("script");
                for (let attr of oldScript.attributes) {
                  try { newScript.setAttribute(attr.name, attr.value); } catch (e) { }
                }
                if (oldScript.src) {
                  newScript.src = oldScript.src;
                } else {
                  newScript.textContent = oldScript.textContent;
                }
                oldScript.replaceWith(newScript);
              });
              console.log("✅ Ad injected inside iframe container only");
            } catch (err) {
              console.warn("Injection runtime error:", err);
            }
          }, decodedTag);
        } catch (injectError) {
          console.log("❌ Ad tag injection failed (evaluate):", injectError && injectError.message);
        }
      }

      // CLEANUP: always run cleanup (even if no adTag)
      try {
        await page.evaluate(() => {
          try {
            const makeAbsolute = (path) => {
              try { return new URL(path, window.location.href).href; } catch { return path; }
            };

            document.querySelectorAll("[src]").forEach((el) => {
              try { el.src = makeAbsolute(el.src); } catch (e) { }
            });

            document.querySelectorAll("[href]").forEach((el) => {
              try { el.href = makeAbsolute(el.href); } catch (e) { }
            });

            document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]').forEach((el) => el.remove());
            document.querySelectorAll('meta[http-equiv="X-Frame-Options"]').forEach((el) => el.remove());
            document.querySelectorAll('meta[http-equiv="Strict-Transport-Security"]').forEach((el) => el.remove());

            // Force desktop viewport so responsive CSS always shows desktop layout
            const vp = document.querySelector('meta[name="viewport"]');
            if (vp) vp.setAttribute('content', 'width=1920');
            else { const m = document.createElement('meta'); m.name = 'viewport'; m.content = 'width=1920'; document.head.appendChild(m); }

            document.querySelectorAll("script").forEach((script) => {
              const c = script.textContent || "";
              if (c.includes("top != self") || c.includes("top !== self") || c.includes("top.location") || c.includes("parent.location") || c.includes("frameElement") || c.includes("window.top")) {
                script.remove();
              }
            });

            document.querySelectorAll("video, audio").forEach((el) => el.remove());

            document.querySelectorAll("iframe").forEach((el) => {
              const src = el.src || "";
              const s = src.toLowerCase();
              if (s.includes("youtube") || s.includes("vimeo") || s.includes("dailymotion") || s.includes("jwplayer") || s.includes("brightcove") || s.includes("player")) {
                el.remove();
              }
            });

            document.querySelectorAll('[class*="video"], [id*="video"], [class*="player"], [id*="player"]').forEach((el) => el.remove());

            // keep X-Frame-Options allowall meta for embedding
            const allowFrame = document.createElement("meta");
            allowFrame.httpEquiv = "X-Frame-Options";
            allowFrame.content = "ALLOWALL";
            if (document.head) document.head.appendChild(allowFrame);
          } catch (cleanupError) {
            console.log("cleanup error:", cleanupError);
          }
        });
      } catch (e) {
        console.warn("page.evaluate cleanup failed:", e && e.message);
      }

      // final content and return
      const finalContent = await page.content();
      const processingTime = Date.now() - startTime;
      console.log(`✅ Preview processed in ${processingTime}ms`);
      return finalContent;
    } catch (error) {
      console.error("processUrl error:", error && (error.stack || error.message || error));
      throw error;
    } finally {
      // ensure resources are closed
      try {
        if (page) await page.close().catch(() => { });
      } catch (e) { }
      try {
        if (context) await context.close().catch(() => { });
      } catch (e) { }
      try {
        if (browser) await browser.close().catch(() => { });
      } catch (e) { }
    }
  };

  // Function to handle fallback
  const handleFallback = async (reason) => {
    console.log(`Falling back to demo URL. Reason: ${reason}`);
    useFallback = true;
    return await processUrl(FALLBACK_URL, adTag);
  };

  // Main execution with fallback logic
  try {
    const result = await Promise.race([
      processUrl(originalUrl, adTag),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Global operation timeout')), TIMEOUT_LIMIT + 5000)
      )
    ]);

    const finalHtml = injectChosumCss(injectInsertionBridgeIntoHtml(result || ""));

    res.setHeader("Content-Type", "text/html");
    res.removeHeader("X-Frame-Options");
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    if (useFallback) {
      res.setHeader("X-Fallback-Used", "true");
      res.setHeader("X-Original-URL", originalUrl);
    }

    res.send(finalHtml);
  } catch (primaryError) {
    console.error("Primary URL failed:", primaryError && (primaryError.stack || primaryError.message || primaryError));
    // Try fallback if not already used
    if (!useFallback) {
      try {
        const fallbackResult = await handleFallback(primaryError.message || String(primaryError));
        const finalFallbackHtml = injectChosumCss(injectInsertionBridgeIntoHtml(fallbackResult || ""));

        res.setHeader("Content-Type", "text/html");
        res.removeHeader("X-Frame-Options");
        res.setHeader("Content-Security-Policy", "frame-ancestors *");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("X-Fallback-Used", "true");
        res.setHeader("X-Original-URL", originalUrl);
        res.setHeader("X-Fallback-Reason", primaryError.message || String(primaryError));

        res.send(finalFallbackHtml);
        return;
      } catch (fallbackError) {
        console.error("Fallback URL also failed:", fallbackError && (fallbackError.stack || fallbackError.message || fallbackError));
        const errorMessage = `Both primary URL (${originalUrl}) and fallback URL failed`;
        const payload = {
          error: "Preview generation failed",
          message: errorMessage,
          primaryError: primaryError.message || String(primaryError),
          fallbackError: fallbackError.message || String(fallbackError),
          originalUrl,
          fallbackUrl: FALLBACK_URL,
          timestamp: new Date().toISOString()
        };
        if (IS_DEV) {
          res.status(500).json(payload);
        } else {
          res.status(500).json({ error: "Preview generation failed" });
        }
        return;
      }
    } else {
      const errorMessage = primaryError.message || "Preview generation failed";
      const statusCode = primaryError.message?.includes('net::ERR_') ? 502 : 500;
      const body = IS_DEV ? { error: "Preview generation failed", message: errorMessage } : { error: "Preview generation failed" };
      res.status(statusCode).json(body);
    }
  }
});

// Event logging endpoints
app.post("/log", (req, res) => {
  eventLogs.push({
    ...req.body,
    serverTimestamp: new Date().toISOString()
  });
  console.log("[Event Log]", req.body);
  res.sendStatus(200);
});

app.get("/report", (req, res) => {
  const report = eventLogs
    .map((event) => {
      return `Type: ${event.type}, X: ${event.x}, Y: ${event.y}, Time: ${new Date(
        event.timestamp
      ).toLocaleString()}, Server Time: ${event.serverTimestamp || 'N/A'}`;
    })
    .join("\n");

  res.setHeader("Content-Disposition", "attachment; filename=event-log.txt");
  res.setHeader("Content-Type", "text/plain");
  res.send(report);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Express error:", err && (err.stack || err.message || err));
  res.status(500).json({
    error: "Internal server error",
    message: IS_DEV ? (err && err.message) : undefined,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});