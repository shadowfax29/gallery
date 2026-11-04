import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { adFormats, adSizes, deviceTypes } from "../data/adFormats";
import { AdFormat, AdSize, DeviceType } from "../types/AdFormat";
import {
  X, RefreshCw, ExternalLink, Monitor, Activity, Clock, Download, Copy, AlertCircle, CheckCircle, Zap, Globe
} from "lucide-react";
import { onCLS, onLCP, onINP, onFCP, onTTFB } from "web-vitals/attribution";

/*
  PreviewPage with ad-injection interception and iframe-forwarding.

  Key behaviour:
  - Installs a narrow DOM interceptor that redirects script/link/style insertions
    matching specified patterns (e.g. bsrv.bidsxchange.com) from the parent into
    the preview iframe.
  - Queues insertions until iframe is ready and flushes on iframe load.
  - Restores DOM methods on unmount.
  - Uses previewUrl as iframe src (so iframe runs on preview server origin).
*/

type Pattern = RegExp | string;

function installAdScriptRedirect(
  iframeRef: React.RefObject<HTMLIFrameElement>,
  patterns: Pattern[] = []
) {
  const matches = (src: string | null | undefined) => {
    if (!src) return false;
    return patterns.some((p) => (p instanceof RegExp ? p.test(src) : src.includes(p)));
  };

  const pendingHtml: string[] = [];
  let isDestroyed = false;

  // Save originals
  const origAppend = (Element.prototype as any).appendChild;
  const origInsertBefore = (Element.prototype as any).insertBefore;
  const origReplaceChild = (Element.prototype as any).replaceChild;

  const postToIframe = (html: string) => {
    try {
      const win = iframeRef.current?.contentWindow;
      if (win) {
        // If same-origin, we will try direct insertion; otherwise postMessage
        try {
          // If accessible (same-origin), insert directly into iframe head
          const doc = iframeRef.current?.contentDocument;
          if (doc && doc.head) {
            const wrap = doc.createElement("div");
            wrap.innerHTML = html;
            while (wrap.firstChild) {
              doc.head.appendChild(wrap.firstChild);
            }
            return;
          }
        } catch {
          // cross-origin or other error -> fallback to postMessage
        }
        win.postMessage({ __type: "INSERT_NODE", html, targetSelector: "head" }, "*");
      } else {
        pendingHtml.push(html);
      }
    } catch (e) {
      // fallback: queue until iframe ready
      pendingHtml.push(html);
    }
  };

  const shouldProxy = (target: Element | Node, node: Node) => {
    try {
      if (target === document.head || target === document.body) {
        if (node && (node as Element).tagName) {
          const tag = ((node as Element).tagName || "").toLowerCase();
          if (tag === "script" || tag === "link" || tag === "style") {
            if (tag === "script") {
              const src = (node as HTMLScriptElement).src;
              if (matches(src)) return true;
              // also proxy inline scripts that have suspicious content? skipping for safety
            } else if (tag === "link") {
              const href = (node as HTMLLinkElement).href;
              if (matches(href)) return true;
            } else if (tag === "style") {
              // currently don't proxy style by default
              return false;
            }
          }
        }
      }
    } catch (err) {
      // ignore
    }
    return false;
  };

  // Patch DOM methods
  (Element.prototype as any).appendChild = function (node: Node) {
    try {
      if (!isDestroyed && shouldProxy(this, node)) {
        const html = (node as Element).outerHTML || node.textContent || "";
        postToIframe(html);
        // return node to satisfy caller
        return node;
      }
    } catch (e) {
      // fallthrough
    }
    return origAppend.call(this, node);
  };

  (Element.prototype as any).insertBefore = function (newNode: Node, referenceNode: Node | null) {
    try {
      if (!isDestroyed && shouldProxy(this, newNode)) {
        const html = (newNode as Element).outerHTML || newNode.textContent || "";
        postToIframe(html);
        return newNode;
      }
    } catch (e) {}
    return origInsertBefore.call(this, newNode, referenceNode);
  };

  (Element.prototype as any).replaceChild = function (newChild: Node, oldChild: Node) {
    try {
      if (!isDestroyed && shouldProxy(this, newChild)) {
        const html = (newChild as Element).outerHTML || newChild.textContent || "";
        postToIframe(html);
        return oldChild;
      }
    } catch (e) {}
    return origReplaceChild.call(this, newChild, oldChild);
  };

  const flushPending = () => {
    try {
      const win = iframeRef.current?.contentWindow;
      if (!win || pendingHtml.length === 0) return;
      // Try direct insertion if same-origin
      try {
        const doc = iframeRef.current?.contentDocument;
        if (doc && doc.head) {
          pendingHtml.forEach((html) => {
            const wrap = doc.createElement("div");
            wrap.innerHTML = html;
            while (wrap.firstChild) doc.head.appendChild(wrap.firstChild);
          });
          pendingHtml.length = 0;
          return;
        }
      } catch {
        // cross-origin, fallback to postMessage
      }
      pendingHtml.forEach((html) => {
        try {
          win.postMessage({ __type: "INSERT_NODE", html, targetSelector: "head" }, "*");
        } catch {}
      });
      pendingHtml.length = 0;
    } catch (e) {}
  };

  const restore = () => {
    if (isDestroyed) return;
    isDestroyed = true;
    try {
      (Element.prototype as any).appendChild = origAppend;
      (Element.prototype as any).insertBefore = origInsertBefore;
      (Element.prototype as any).replaceChild = origReplaceChild;
    } catch (e) {
      // ignore
    }
  };

  return { restore, flushPending, _pending: pendingHtml };
}

const DeviceFrame: React.FC<{ device: DeviceType; children: React.ReactNode }> = ({ device, children }) => {
  const getDeviceStyle = () => {
    switch (device.id) {
      case 'mobile':
        return {
          width: '330px',
          height: '580px',
          maxHeight: '75vh',
          borderRadius: '40px',
          border: '8px solid #1f2937',
          background: '#1f2937',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative' as const,
          flexShrink: 0
        };
      case 'tablet':
        return {
          width: '490px',
          height: '600px',
          maxHeight: '80vh',
          borderRadius: '20px',
          border: '6px solid #374151',
          background: '#374151',
          boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.2)',
          position: 'relative' as const,
          flexShrink: 0
        };
      default:
        return {};
    }
  };

  const style = getDeviceStyle();

  if (device.id === 'desktop') {
    return <>{children}</>;
  }

  return (
    <div style={style}>
      {device.id === 'mobile' && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '134px',
            height: '5px',
            backgroundColor: 'white',
            borderRadius: '3px'
          }}
        />
      )}
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: device.id === 'mobile' ? '32px' : '14px',
        overflow: 'hidden'
      }}>
        {children}
      </div>
    </div>
  );
};

export const PreviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [format, setFormat] = useState<AdFormat | null>(null);
  const [size, setSize] = useState<AdSize | null>(null);
  const [device, setDevice] = useState<DeviceType | null>(null);
  const [siteUrl, setSiteUrl] = useState<string>("");
  const [tagScript, setTagScript] = useState<string>("");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadTime, setLoadTime] = useState(Date.now());

  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const [logs, setLogs] = useState<string[]>([]);
  const [logsCopied, setLogsCopied] = useState(false);
  const [logsDownloaded, setLogsDownloaded] = useState(false);
  const logRef = useRef<HTMLPreElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => {
      if (prev[prev.length - 1]?.includes(message)) return prev;
      return [...prev, `[${timestamp}] ${message}`];
    });
  };

  const getApiBaseUrl = () => {
    if (window.location.hostname === 'gallery.tapmind.io') {
      return 'https://gallery.tapmind.io/api';
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5042';
    }
    return `${window.location.origin}/api`;
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const redirectHandleRef = useRef<any>(null);

  // Patterns to intercept (add more domains if required)
  const adPatterns: Pattern[] = [
    /bsrv\.bidsxchange\.com/i,
    // add other domains if you'd like to intercept them too
    // /googlesyndication\.com/i,
  ];

  // Install redirect on mount
  useEffect(() => {
    if (!redirectHandleRef.current) {
      redirectHandleRef.current = installAdScriptRedirect(iframeRef, adPatterns);
      addLog("🔒 Ad insertion interceptor installed");
    }
    return () => {
      try {
        redirectHandleRef.current?.restore();
        redirectHandleRef.current = null;
        addLog("🔓 Ad insertion interceptor removed");
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startProgressSimulation = () => {
    setProgress(0);
    let currentProgress = 0;

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      const randomIncrement = Math.random() * 8 + 2;
      currentProgress += randomIncrement;

      if (currentProgress >= 90) {
        currentProgress = 90;
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      }

      setProgress(Math.min(currentProgress, 90));
    }, 150);
  };

  // Fetch preview content (we use src pointing to previewUrl; server should return full HTML)
  const fetchPreviewContent = async (url: string) => {
    setIsLoadingContent(true);
    setIframeLoaded(false);
    setIframeError(false);
    addLog("Fetching preview content from server...");
    startProgressSimulation();

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      setHtmlContent(html);
      setIsLoadingContent(false);
      setProgress(100);
      addLog("✅ Preview HTML fetched (server will load resources inside iframe)");
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    } catch (err: any) {
      console.error("fetchPreviewContent error", err);
      addLog(`❌ Failed to fetch preview: ${err?.message || err}`);
      setIframeError(true);
      setShowFallback(true);
      setIsLoadingContent(false);
      setProgress(100);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }
  };

  useEffect(() => {
    const formatId = searchParams.get("format");
    const sizeParam = searchParams.get("size");
    const deviceId = searchParams.get("device");
    const url = searchParams.get("url");
    const tagParam = searchParams.get("tag");

    setTagScript(tagParam ? decodeURIComponent(tagParam) : "");
    const encodedAdTag = tagParam ? encodeURIComponent(tagParam) : "";

    const urlParam = searchParams.get("url");
    const decodedUrl = urlParam ? decodeURIComponent(urlParam) : "";

    const apiBaseUrl = getApiBaseUrl();
    const apiUrl = `${apiBaseUrl}/preview?url=${encodeURIComponent(decodedUrl)}&adTag=${encodedAdTag}`;
    setPreviewUrl(apiUrl);

    if (formatId) {
      const foundFormat = adFormats.find((f) => f.id === formatId);
      setFormat(foundFormat || null);
    }
    if (sizeParam) {
      const [width, height] = sizeParam.split("x").map(Number);
      const foundSize = adSizes.find((s) => s.width === width && s.height === height);
      setSize(foundSize || null);
    }
    if (deviceId) {
      const foundDevice = deviceTypes.find((d) => d.id === deviceId);
      setDevice(foundDevice || null);
    }
    if (url) {
      setSiteUrl(decodeURIComponent(url));
    }

    addLog("Initializing preview session...");
    addLog("Loading configuration parameters...");

    if (apiUrl) {
      fetchPreviewContent(apiUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleRefresh = () => {
    setIframeLoaded(false);
    setIframeError(false);
    setShowFallback(false);
    setLoadTime(Date.now());
    startProgressSimulation();
    setLogs([
      `[INFO] Refreshing iframe container...`,
      `[INFO] Refreshing ad container inside iframe...`,
      `[INFO] Reloading preview with current configuration...`,
    ]);
    if (previewUrl) {
      fetchPreviewContent(previewUrl);
    }
  };

  const handleIframeLoad = () => {
    setIframeError(false);
    setIframeLoaded(true);
    setProgress(100);

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    try {
      const iframe = iframeRef.current;
      if (iframe?.contentDocument) {
        console.log('iframe same-origin?', !!iframe.contentDocument);
        console.log('iframe snippet:', iframe.contentDocument.body?.innerHTML.slice(0, 200));
      }
    } catch (err) {
      console.warn('iframe cross-origin access error:', err);
    }

    const pageLoadTime = Date.now() - loadTime;
    addLog(`✅ [SUCCESS] Iframe loaded successfully (${pageLoadTime} ms)`);

    // Flush any pending redirected insertions to iframe
    try {
      redirectHandleRef.current?.flushPending();
      addLog("📤 Flushed pending redirected insertions to iframe");
    } catch (e) {
      // ignore
    }

    // Send adTag to iframe via postMessage as a fallback (iframe should have a message listener)
    try {
      const iframeWin = iframeRef.current?.contentWindow;
      if (iframeWin && tagScript) {
        iframeWin.postMessage({ __type: 'INSERT_ADTAG', html: tagScript, targetSelector: '#injected-preview-ad-container' }, "*");
        addLog("📨 Sent adTag to iframe for insertion");
      }
    } catch (err) {
      addLog(`❌ Failed to send adTag to iframe: ${String(err)}`);
    }

    // Web vitals reporting
    onLCP((metric) => addLog(`[VITALS] LCP: ${metric.value.toFixed(2)} ms`));
    onCLS((metric) => addLog(`[VITALS] CLS: ${metric.value.toFixed(3)}`));
    onINP((metric) => addLog(`[VITALS] INP: ${metric.value.toFixed(2)} ms`));
    onFCP((metric) =>
      addLog(`[VITALS] First Contentful Paint: ${metric.value.toFixed(2)} ms`)
    );
    onTTFB((metric) =>
      addLog(`🌐 [VITALS] Time To First Byte: ${metric.value.toFixed(2)} ms`)
    );

    try {
      if (previewUrl) {
        fetch(previewUrl, { method: "HEAD" })
          .then((res) => {
            const size = res.headers.get("content-length");
            if (size) {
              const kb = (parseInt(size, 10) / 1024).toFixed(2);
              addLog(`[INFO] Iframe File Size: ${kb} KB`);
            } else {
              addLog(`[INFO] Iframe File Size: Not available`);
            }
          })
          .catch(() => addLog(`❌ [ERROR] Could not fetch iframe size`));
      }
    } catch {}
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(true);
    setShowFallback(true);
    setProgress(100);

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    addLog(`❌ [ERROR] Iframe failed to load. Showing fallback content.`);
  };

  useEffect(() => {
    if (format && size && device) {
      startProgressSimulation();
    }
  }, [format, size, device]);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      try {
        redirectHandleRef.current?.restore();
      } catch {}
    };
  }, []);

  const handleCopyLogs = async () => {
    try {
      await navigator.clipboard.writeText(logs.join("\n"));
      setLogsCopied(true);
      addLog("📋 [INFO] Logs copied to clipboard");
      setTimeout(() => setLogsCopied(false), 2000);
    } catch (err) {
      addLog("❌ [ERROR] Failed to copy logs to clipboard");
    }
  };

  const handleDownloadLogs = () => {
    try {
      const blob = new Blob([logs.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logs-${new Date().toISOString()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setLogsDownloaded(true);
      addLog("💾 [INFO] Logs downloaded as file");
      setTimeout(() => setLogsDownloaded(false), 2000);
    } catch (err) {
      addLog("❌ [ERROR] Failed to download logs");
    }
  };

  const renderFallbackContent = () => (
    <div className="w-full h-full bg-white overflow-y-auto">
      <header className="bg-red-600 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold">CNN</h1>
            <nav className="hidden md:flex gap-8">
              <a href="#" className="hover:underline font-medium">World</a>
              <a href="#" className="hover:underline font-medium">Politics</a>
              <a href="#" className="hover:underline font-medium">Business</a>
              <a href="#" className="hover:underline font-medium">Tech</a>
              <a href="#" className="hover:underline font-medium">Sports</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-red-700 px-3 py-1 rounded text-sm font-bold">LIVE</div>
            <div className="text-sm">Breaking News</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <article className="mb-10">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Revolutionary AI Breakthrough Changes Everything We Know About Computing
              </h1>
              <img
                src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600"
                alt="Technology breakthrough"
                className="w-full h-80 object-cover rounded-xl mb-8 shadow-lg"
              />
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  In a groundbreaking announcement that has sent shockwaves through the technology industry,
                  researchers at leading institutions have unveiled an artificial intelligence system that
                  demonstrates unprecedented capabilities in problem-solving and creative thinking.
                </p>
              </div>
            </article>
          </div>

          <aside className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-xl text-gray-900 mb-6">Trending Now</h3>
              <div className="space-y-4">
                {[
                  "Global Markets Surge on AI News",
                  "Climate Summit Reaches Historic Agreement",
                  "Space Mission Discovers New Planets"
                ].map((headline, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {index + 1}
                    </div>
                    <a href="#" className="text-gray-900 hover:text-blue-600 font-medium text-sm leading-relaxed">
                      {headline}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );

  if (!format || !size || !device) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-white mb-2">Initializing Preview</h2>
          <p className="text-blue-200">Loading configuration and setting up environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <header className="h-15 bg-white/95 backdrop-blur-xl shadow-md border-b border-slate-200/50 flex items-center justify-between px-6 relative text-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Live Ad Preview Studio
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full font-semibold border border-blue-200">
                  {format.name}
                </span>
                <span className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-1 rounded-full font-semibold border border-slate-300">
                  {size.width}×{size.height}
                </span>
                <span className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-200">
                  {device.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Globe className="w-4 h-4" />
            <span>Open Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => window.close()}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
        <section className="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden flex flex-col">
          <div className="h-8 px-4 flex items-center justify-between border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100/50 text-sm">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-sm">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Live Preview Window</h2>
            </div>

            <div className="flex items-center gap-4">
              {iframeLoaded && !iframeError && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700">Connected</span>
                </div>
              )}
              {iframeError && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-700">Error</span>
                </div>
              )}
              {!iframeLoaded && !iframeError && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                  <span className="text-sm font-semibold text-amber-700">Loading</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 relative bg-gradient-to-br from-slate-100/50 to-slate-200/30 flex justify-center items-center p-4 overflow-hidden">
            {device.id === 'desktop' ? (
              <div className="w-full h-full relative bg-white rounded-lg overflow-hidden shadow-2xl border border-gray-700">
                {!showFallback ? (
                  <iframe
                    key={loadTime}
                    id="preview-iframe"
                    ref={iframeRef}
                    src={previewUrl}
                    className="w-full h-full border-none"
                    // include allow-same-origin because the iframe is loaded from preview server origin
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    allow="autoplay; fullscreen; payment"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    style={{
                      transform: 'scale(0.8)',
                      transformOrigin: 'top left',
                      width: '125%',
                      height: '125%'
                    }}
                    title="Website Preview"
                  />
                ) : (
                  renderFallbackContent()
                )}

                {!iframeLoaded && !showFallback && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white via-blue-50/50 to-white z-10">
                    <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl border border-slate-200/50 shadow-2xl max-w-md w-full mx-4">
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner mb-6">
                        <div
                          className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
                          style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)" }}
                        ></div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg">
                          <Zap className="w-8 h-8 mx-auto mb-2" />
                          <p className="font-bold text-lg">Loading Preview</p>
                          <p className="text-sm text-blue-100">{Math.round(progress)}% Complete</p>
                        </div>

                        <div className="text-slate-600">
                          <p className="text-sm font-medium mb-2">Initializing ad environment...</p>
                          <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <DeviceFrame device={device}>
                <div className="w-full h-full relative bg-white">
                  {!showFallback ? (
                    <iframe
                      key={loadTime}
                      id="preview-iframe"
                      ref={iframeRef}
                      src={previewUrl}
                      className="w-full h-full border-none"
                      sandbox="allow-scripts allow-same-origin allow-popups"
                      allow="autoplay; fullscreen; payment"
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                      title="Website Preview"
                      style={{
                        transform: 'scale(0.8)',
                        transformOrigin: 'top left',
                        width: '125%',
                        height: '125%'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full overflow-auto">
                      {renderFallbackContent()}
                    </div>
                  )}

                  {!iframeLoaded && !showFallback && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                        <p className="text-gray-600 text-sm">Loading...</p>
                      </div>
                    </div>
                  )}
                </div>
              </DeviceFrame>
            )}

            {!iframeLoaded && !showFallback && device.id !== 'desktop' && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white via-blue-50/50 to-white z-10">
                <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl border border-slate-200/50 shadow-2xl max-w-md w-full mx-4">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner mb-6">
                    <div
                      className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
                      style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)" }}
                    ></div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg">
                      <Zap className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-bold text-lg">Loading Preview</p>
                      <p className="text-sm text-blue-100">{Math.round(progress)}% Complete</p>
                    </div>

                    <div className="text-slate-600">
                      <p className="text-sm font-medium mb-2">Initializing ad environment...</p>
                      <div className="flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="w-full lg:w-80 flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="h-8 px-4 flex items-center justify-between border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900 text-sm">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Logs</h2>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLogs}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                  logsCopied
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600 shadow-md'
                }`}
              >
                {logsCopied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{logsCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadLogs}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                  logsDownloaded
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600 shadow-md'
                }`}
              >
                {logsDownloaded ? <CheckCircle className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                <span>{logsDownloaded ? 'Downloaded' : 'Download'}</span>
              </button>
            </div>
          </div>

          <pre
            ref={logRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-gradient-to-b from-slate-900 to-slate-800 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
          >
            {logs.length === 0 ? (
              <div className="text-center text-slate-500 mt-8">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Waiting for activity...</p>
              </div>
            ) : (
              logs.join("\n")
            )}
          </pre>

          <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-white">Live monitoring active</span>
              </div>
              <span className="text-xs text-slate-500">{logs.length} entries</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default PreviewPage;