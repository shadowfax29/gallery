const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");

const app = express();
const PORT = 5042;

app.use(cors());
app.use(express.json());

let eventLogs = [];

app.get("/preview", async (req, res) => {
  const { url, adTag } = req.query;

  if (!url) return res.status(400).send("Missing URL");

  try {
    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled"
      ]
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36",
      locale: "en-US",
      bypassCSP: true
    });

    const page = await context.newPage();

    // Anti-bot tweaks
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"]
      });
    });

    // ✅ Block ads/trackers & third-party except whitelisted CDNs
    const targetHost = new URL(url).hostname;
    await page.route("**/*", (route) => {
      const req = route.request();
      const reqUrl = req.url();

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
        "ads.playstream.media"
      ];

      if (blockedDomains.some((d) => reqUrl.includes(d))) {
        return route.abort();
      }

      try {
        const reqHost = new URL(reqUrl).hostname;
        const allowedCDNs = [
          "cdnjs.cloudflare.com",
          "cdn.jsdelivr.net",
          "unpkg.com"
        ];

        if (reqHost !== targetHost && !allowedCDNs.includes(reqHost)) {
          return route.abort();
        }
      } catch {
        return route.abort();
      }

      return route.continue();
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Inject ad tag if provided
    if (adTag) {
      const decodedTag = decodeURIComponent(adTag);
      await page.evaluate((html) => {
        const container = document.createElement("div");
        container.innerHTML = html;
        container.id = "injected-ad-tag";
        document.head.appendChild(container);

        container.querySelectorAll("script").forEach((script) => {
          const newScript = document.createElement("script");
          if (script.src) newScript.src = script.src;
          else newScript.textContent = script.innerText;
          script.parentNode.replaceChild(newScript, script);
        });
      }, decodedTag);
    }

    // Fix assets, remove CSP, and remove video players
    await page.evaluate(() => {
      const makeAbsolute = (path) => {
        try {
          return new URL(path, window.location.href).href;
        } catch {
          return path;
        }
      };

      // Convert asset URLs to absolute
      document.querySelectorAll("[src]").forEach((el) => (el.src = makeAbsolute(el.src)));
      document.querySelectorAll("[href]").forEach((el) => (el.href = makeAbsolute(el.href)));

      // Remove CSP
      document
        .querySelectorAll('meta[http-equiv="Content-Security-Policy"]')
        .forEach((el) => el.remove());

      // 🚫 Remove video players
      document.querySelectorAll("video, audio").forEach((el) => el.remove());
      document.querySelectorAll("iframe").forEach((el) => {
        const src = el.src || "";
        if (
          src.includes("youtube.com") ||
          src.includes("vimeo.com") ||
          src.includes("dailymotion.com") ||
          src.includes("jwplayer") ||
          src.includes("brightcove")
        ) {
          el.remove();
        }
      });
      document.querySelectorAll('[class*="video"], [id*="video"]').forEach((el) => el.remove());
    });

    const finalContent = await page.content();
    await browser.close();

    res.setHeader("Content-Type", "text/html");
    res.send(finalContent);
  } catch (err) {
    console.error("Playwright error:", err);
    res.status(500).send("Preview generation failed.");
  }
});

// Event logging endpoints
app.post("/log", (req, res) => {
  eventLogs.push(req.body);
  console.log("[Event Log]", req.body);
  res.sendStatus(200);
});

app.get("/report", (req, res) => {
  const report = eventLogs
    .map((event) => {
      return `Type: ${event.type}, X: ${event.x}, Y: ${event.y}, Time: ${new Date(
        event.timestamp
      ).toLocaleString()}`;
    })
    .join("\n");

  res.setHeader("Content-Disposition", "attachment; filename=event-log.txt");
  res.setHeader("Content-Type", "text/plain");
  res.send(report);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
