import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { adFormats, adSizes, deviceTypes } from "../data/adFormats";
import { AdFormat, AdSize, DeviceType } from "../types/AdFormat";
import {
  X, RefreshCw, ExternalLink, Monitor, Activity, Clock, Download, Copy, AlertCircle, CheckCircle, Zap, Globe
} from "lucide-react";
import { onCLS, onLCP, onINP, onFCP, onTTFB } from "web-vitals/attribution";

// Device Frame Component (fitting within viewport)
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
      {/* Home indicator for mobile */}
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
  const [tagScript, setTagScript] = useState<string>(""); // decoded adTag from query
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadTime, setLoadTime] = useState(Date.now());

  // Keep track of html/blob & mode
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const currentBlobUrl = useRef<string | null>(null);

  // New: UI toggle to force hosted-preview (useful for debugging)
  const [forceHostedPreview, setForceHostedPreview] = useState<boolean>(false);

  // Computed state: whether we will use hosted preview (iframe loads backend URL directly) or blob-mode
  const [useHostedPreview, setUseHostedPreview] = useState<boolean>(false);
  const [computedApiUrl, setComputedApiUrl] = useState<string>("");

  // Logs
  const [logs, setLogs] = useState<string[]>([]);
  const [logsCopied, setLogsCopied] = useState(false);
  const [logsDownloaded, setLogsDownloaded] = useState(false);
  const logRef = useRef<HTMLPreElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // OPTIONAL override if you host preview on different domain (recommended for production)
  const PREVIEW_HOST_OVERRIDE = (window as any).__PREVIEW_HOST_OVERRIDE__ || "";

  const getApiBaseUrl = () => {
    if (PREVIEW_HOST_OVERRIDE) {
      return PREVIEW_HOST_OVERRIDE;
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5042';
    }
    if (window.location.hostname === 'gallery.tapmind.io') {
      return 'https://gallery.tapmind.io/api';
    }
    return `${window.location.origin}/api`;
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Progress
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const startProgressSimulation = () => {
    setProgress(0);
    let currentProgress = 0;
    if (progressInterval.current) clearInterval(progressInterval.current);
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

  // Core: fetch preview content OR choose hosted preview mode
  const fetchPreviewContent = async (apiUrl: string) => {
    setIsLoadingContent(true);
    setIframeLoaded(false);
    addLog("Fetching preview content from server...");
    startProgressSimulation();

    try {
      // Determine preview hosting mode:
      let apiOrigin = "";
      try { apiOrigin = new URL(apiUrl).origin; } catch (e) { apiOrigin = ""; }

      const parentOrigin = window.location.origin;
      const backendDifferentOrigin = apiOrigin && apiOrigin !== parentOrigin;

      const finalHosted = Boolean(forceHostedPreview || backendDifferentOrigin || PREVIEW_HOST_OVERRIDE);
      setUseHostedPreview(finalHosted);
      setComputedApiUrl(apiUrl);

      if (finalHosted) {
        // HOSTED PREVIEW: simply set iframe src to backend preview URL.
        setPreviewUrl(apiUrl);
        setHtmlContent("");
        addLog("Using hosted preview mode: iframe will load the backend preview URL directly.");
      } else {
        // BLOB PREVIEW: fetch HTML, inject base href and storage polyfill, create blob URL.
        const response = await fetch(apiUrl);
        if (!response.ok) {
          let errText = `status: ${response.status}`;
          try { const txt = await response.text(); errText += ` body: ${txt.slice(0, 200)}`; } catch {}
          throw new Error(`HTTP error! ${errText}`);
        }

        let html = await response.text();
        setHtmlContent(html);

        // Extract original requested site URL from query param so we can set a base href
        let originalTarget = "";
        try {
          const parsed = new URL(apiUrl);
          const enc = parsed.searchParams.get("url") || "";
          if (enc) originalTarget = decodeURIComponent(enc);
        } catch (e) { originalTarget = ""; }

        if (originalTarget && /<head[^>]*>/i.test(html) && !/base\s+href=/i.test(html)) {
          html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${originalTarget}">`);
        }

        // Inject storage polyfill for sandboxed blob mode (prevents localStorage/sessionStorage SecurityError)
        const storagePolyfill = `
          <script>
            (function(){
              try {
                var test = '___storage_test___';
                try { window.localStorage && window.localStorage.setItem(test, test); window.localStorage.removeItem(test); return; } catch(e) {}
                function createStore(){
                  var store = Object.create(null);
                  return {
                    getItem: function(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
                    setItem: function(k, v){ store[k] = String(v); },
                    removeItem: function(k){ delete store[k]; },
                    clear: function(){ store = Object.create(null); },
                    key: function(i){ var keys = Object.keys(store); return keys[i] || null; },
                    get length(){ return Object.keys(store).length; }
                  };
                }
                try {
                  Object.defineProperty(window, 'localStorage', { value: createStore(), configurable: false, enumerable: false, writable: false });
                  Object.defineProperty(window, 'sessionStorage', { value: createStore(), configurable: false, enumerable: false, writable: false });
                } catch(e) {
                  window.localStorage = createStore();
                  window.sessionStorage = createStore();
                }
              } catch(e){}
            })();
          </script>
        `;

        if (/<head[^>]*>/i.test(html)) {
          html = html.replace(/<head([^>]*)>/i, `<head$1>${storagePolyfill}`);
        } else {
          html = storagePolyfill + html;
        }

        if (currentBlobUrl.current) {
          try { URL.revokeObjectURL(currentBlobUrl.current); } catch (e) {}
          currentBlobUrl.current = null;
        }
        const blob = new Blob([html], { type: "text/html" });
        const blobUrl = URL.createObjectURL(blob);
        currentBlobUrl.current = blobUrl;
        setPreviewUrl(blobUrl);
        addLog("Using blob preview mode (backend origin SAME as parent). Injected storage polyfill to prevent SecurityError.");
      }

      setIframeError(false);
      setIsLoadingContent(false);
      setProgress(100);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Failed to fetch preview:", error);
      addLog(`❌ Failed to fetch content: ${errorMessage}`);
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

    // Store decoded adTag so we can postMessage it into the iframe on load
    setTagScript(tagParam ? decodeURIComponent(tagParam) : "");
    const decodedUrl = url ? decodeURIComponent(url) : "";

    const apiBaseUrl = getApiBaseUrl();
    const apiUrl = `${apiBaseUrl.replace(/\/$/, "")}/preview?url=${encodeURIComponent(decodedUrl)}&adTag=${tagParam ? encodeURIComponent(tagParam) : ""}`;

    addLog("Initializing preview session...");
    addLog("Loading configuration parameters...");
    fetchPreviewContent(apiUrl);

    if (formatId) {
      const foundFormat = adFormats.find((f) => f.id === formatId);
      setFormat(foundFormat || null);
    }
    if (sizeParam) {
      const [w, h] = sizeParam.split("x").map(Number);
      const foundSize = adSizes.find((s) => s.width === w && s.height === h);
      setSize(foundSize || null);
    }
    if (deviceId) {
      const foundDevice = deviceTypes.find((d) => d.id === deviceId);
      setDevice(foundDevice || null);
    }
    if (url) setSiteUrl(decodeURIComponent(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send adTag into iframe via postMessage AFTER iframe finished loading.
  // The insertion bridge injected by server listens for messages of type INSERT_ADTAG / INSERT_NODE.
  const postAdTagToIframe = (attempts = 0) => {
    try {
      const iframe = iframeRef.current;
      const adHtml = tagScript || ""; // already decoded
      if (!adHtml) {
        addLog("No adTag to inject.");
        return;
      }
      if (!iframe) {
        if (attempts < 5) {
          // try again shortly if iframe not present yet
          setTimeout(() => postAdTagToIframe(attempts + 1), 200);
        } else {
          addLog("❌ iframe not available to postMessage adTag after retries.");
        }
        return;
      }
      const win = iframe.contentWindow;
      if (!win) {
        if (attempts < 5) {
          setTimeout(() => postAdTagToIframe(attempts + 1), 200);
        } else {
          addLog("❌ iframe.contentWindow not available to postMessage adTag after retries.");
        }
        return;
      }

      // Use a targetSelector that is safe: prefer '#injected-preview-ad-container' otherwise 'head'
      const message = {
        __type: 'INSERT_ADTAG',
        html: adHtml,
        targetSelector: '#injected-preview-ad-container' // insertion bridge will fallback to head/body if not found
      };

      // Post with wildcard origin; bridge will accept only object messages with __type
      win.postMessage(message, '*');
      addLog("📨 Posted adTag into iframe via postMessage (INSERT_ADTAG).");
    } catch (err) {
      addLog(`❌ Failed to postMessage adTag to iframe: ${(err && (err as Error).message) || String(err)}`);
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

    // Attempt to postMessage the ad tag into the iframe
    postAdTagToIframe();

    try {
      const iframe = iframeRef.current;
      console.log('iframe same-origin?', !!iframe?.contentDocument);
      if (iframe?.contentDocument) {
        console.log('iframe body snippet:', iframe.contentDocument.body?.innerHTML.slice(0, 300));
      }
    } catch (err) {
      console.warn('iframe cross-origin access error (expected for sandboxed/opaque):', err);
    }

    const pageLoadTime = Date.now() - loadTime;
    addLog(`✅ [SUCCESS] Iframe loaded successfully`);
    addLog(`[PERFORMANCE] Page Load Time: ${pageLoadTime} ms`);
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

    const urlParam = searchParams.get("url") || "";
    const tagParam = searchParams.get("tag") || "";
    const decodedUrl = urlParam ? decodeURIComponent(urlParam) : "";
    const encodedAdTag = tagParam ? encodeURIComponent(tagParam) : "";
    const apiBaseUrl = getApiBaseUrl();
    const apiUrl = `${apiBaseUrl.replace(/\/$/, "")}/preview?url=${encodeURIComponent(decodedUrl)}&adTag=${encodedAdTag}`;

    fetchPreviewContent(apiUrl);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (currentBlobUrl.current) {
        try { URL.revokeObjectURL(currentBlobUrl.current); } catch (e) {}
        currentBlobUrl.current = null;
      }
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

  // Simple fallback UI
  const renderFallbackContent = () => (
    <div className="w-full h-full bg-white overflow-y-auto">
      <div style={{ padding: 20 }}>Fallback preview (failed to load)</div>
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

  // Decide sandbox flags based on mode:
  const iframeSandboxAttr = useHostedPreview ? "allow-scripts allow-same-origin allow-popups" : "allow-scripts allow-popups";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="h-15 bg-white/95 backdrop-blur-xl shadow-md border-b border-slate-200/50 flex items-center justify-between px-6 relative text-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Live Ad Preview Studio</h1>
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

        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl">Refresh</button>
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white border rounded-xl text-slate-700">Open Site</a>

          {/* Hosted toggle (useful when debugging cross-origin sandbox issues) */}
          <label className="inline-flex items-center gap-2 px-3 py-1 bg-white border rounded-xl text-slate-700">
            <input type="checkbox" checked={forceHostedPreview} onChange={(e) => setForceHostedPreview(e.target.checked)} />
            <span className="text-xs">Force Hosted Preview</span>
          </label>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
        <section className="flex-1 bg-white/80 rounded-3xl border shadow-xl overflow-hidden flex flex-col">
          <div className="h-8 px-4 flex items-center justify-between border-b text-sm">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-slate-600" />
              <h2 className="text-lg font-bold">Live Preview Window</h2>
            </div>
            <div>
              {iframeLoaded && !iframeError && <span className="text-emerald-700">Connected</span>}
              {iframeError && <span className="text-red-700">Error</span>}
              {!iframeLoaded && !iframeError && <span className="text-amber-700">Loading</span>}
            </div>
          </div>

          <div className="flex-1 relative flex justify-center items-center p-4 overflow-hidden">
            {device.id === 'desktop' ? (
              <div className="w-full h-full relative bg-white rounded-lg overflow-hidden shadow-2xl border border-gray-200">
                {!showFallback ? (
                  <iframe
                    key={loadTime}
                    id="preview-iframe"
                    ref={iframeRef}
                    src={previewUrl}
                    className="w-full h-full border-none"
                    sandbox={iframeSandboxAttr}
                    allow="autoplay; fullscreen; payment"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    title="Website Preview"
                    style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}
                  />
                ) : (
                  renderFallbackContent()
                )}

                {!iframeLoaded && !showFallback && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <div className="text-center p-6 bg-white rounded-xl border shadow">
                      <div className="w-48 h-2 bg-slate-200 rounded-full mb-4">
                        <div style={{ width: `${progress}%` }} className="h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <p>Loading preview... {Math.round(progress)}%</p>
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
                      sandbox={iframeSandboxAttr}
                      allow="autoplay; fullscreen; payment"
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                      title="Website Preview"
                      style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}
                    />
                  ) : (
                    <div className="w-full h-full overflow-auto">{renderFallbackContent()}</div>
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
          </div>
        </section>

        <aside className="w-full lg:w-80 flex flex-col bg-slate-900 rounded-3xl border shadow overflow-hidden">
          <div className="h-8 px-4 flex items-center justify-between border-b bg-slate-800 text-sm">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-indigo-500 rounded"><Activity className="w-4 h-4 text-white" /></div>
              <h2 className="text-lg font-bold text-white">Logs</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopyLogs} className="px-3 py-1 text-xs bg-slate-700 text-white rounded">Copy</button>
              <button onClick={handleDownloadLogs} className="px-3 py-1 text-xs bg-slate-700 text-white rounded">Download</button>
            </div>
          </div>

          <pre ref={logRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-200 bg-slate-900">
            {logs.length === 0 ? <div className="text-slate-500">Waiting for activity...</div> : logs.join("\n")}
          </pre>

          <div className="px-4 py-3 border-t bg-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><span>Live monitoring</span></div>
              <span>{logs.length} entries</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};