import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { adFormats, adSizes, deviceTypes } from "../data/adFormats";
import { AdFormat, AdSize, DeviceType } from "../types/AdFormat";
import { X, RefreshCw, ExternalLink, Monitor } from "lucide-react";
import { onCLS, onLCP, onINP, onFCP, onTTFB } from "web-vitals/attribution";

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

  // Logs state
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<HTMLPreElement>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const formatId = searchParams.get("format");
    const sizeParam = searchParams.get("size");
    const deviceId = searchParams.get("device");
    const url = searchParams.get("url");
    setTagScript(decodeURIComponent(searchParams.get("tag") || ""));
    const encodedAdTag = encodeURIComponent(searchParams.get("tag") || "");
    const urlParam = decodeURIComponent(searchParams.get("url") || "");
    setPreviewUrl(`/api/preview?url=${urlParam}&adTag=${encodedAdTag}`);

    if (formatId) {
      const foundFormat = adFormats.find((f) => f.id === formatId);
      setFormat(foundFormat || null);
    }
    if (sizeParam) {
      const [width, height] = sizeParam.split("x").map(Number);
      const foundSize = adSizes.find(
        (s) => s.width === width && s.height === height
      );
      setSize(foundSize || null);
    }
    if (deviceId) {
      const foundDevice = deviceTypes.find((d) => d.id === deviceId);
      setDevice(foundDevice || null);
    }
    if (url) {
      setSiteUrl(decodeURIComponent(url));
    }
  }, [searchParams]);

  const handleRefresh = () => {
    setIframeLoaded(false);
    setIframeError(false);
    setShowFallback(false);
    setLoadTime(Date.now());

    setLogs([
      `[INFO] Refreshing iframe container...`,
      `[INFO] Refreshing ad container inside iframe...`,
    ]);
  };

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleIframeLoad = () => {
    setIframeError(false);
    setIframeLoaded(true);

    const pageLoadTime = Date.now() - loadTime;
    addLog(`[INFO] Iframe loaded successfully`);
    addLog(`[INFO] Page Load Time: ${pageLoadTime} ms`);

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
        .catch(() => addLog(`[ERROR] Could not fetch iframe size`));
    }

    onLCP((metric) => addLog(`LCP: ${metric.value.toFixed(2)} ms`));
    onCLS((metric) => addLog(`CLS: ${metric.value.toFixed(3)}`));
    onINP((metric) => addLog(`INP: ${metric.value.toFixed(2)} ms`));
    onFCP((metric) => addLog(`First Contentful Paint: ${metric.value.toFixed(2)} ms`));
    onTTFB((metric) => addLog(`Time To First Byte: ${metric.value.toFixed(2)} ms`));

    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType("paint");
      paintEntries.forEach((entry: any) => {
        if (entry.name === "first-paint") {
          addLog(`First Paint: ${entry.startTime.toFixed(2)} ms`);
        }
      });

      const nav = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (nav) {
        addLog(`DOM Content Loaded: ${nav.domContentLoadedEventEnd.toFixed(2)} ms`);
        addLog(`Render Start Time: ${nav.responseStart.toFixed(2)} ms`);
      }
    }
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(true);
    setShowFallback(true);
    addLog(`[ERROR] Iframe failed to load. Showing fallback content.`);
  };

  if (!format || !size || !device) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="h-[60px] bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {/* Icon badge with lighter gradient */}
          <div className="p-2 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-xl shadow">
            <Monitor className="w-5 h-5 text-blue-700" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">Live Ad Preview</h1>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
              {format.name}
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
              {size.width}×{size.height}
            </span>
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
              {device.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button with new lighter teal gradient */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-lg text-sm shadow hover:from-emerald-500 hover:to-teal-500 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>

          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 text-sm hover:bg-slate-200 transition"
          >
            <ExternalLink className="w-4 h-4" /> Open Site
          </a>
          <button
            onClick={() => window.close()}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm shadow hover:bg-red-700 transition"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Preview Section */}
        <section className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
          <div className="h-10 px-4 flex items-center border-b border-slate-200 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
              Preview Window
            </h2>
          </div>
          <div className="flex-1 relative bg-slate-100">
            {!showFallback ? (
              <iframe
                key={loadTime}
                id="preview-iframe"
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-none"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title="Website Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-600">
                Fallback Content
              </div>
            )}

            {!iframeLoaded && !showFallback && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Loading website...</p>
                  <p className="text-sm text-slate-500 mt-1">
                    This may take a few moments
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Logs Section (20% narrower + dark mode) */}
        <aside className="w-full lg:w-72 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
          <div className="h-10 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Logs
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(logs.join("\n"));
                  addLog("[INFO] Logs copied to clipboard");
                }}
                className="px-2 py-1 text-xs bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition"
              >
                Copy
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([logs.join("\n")], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `logs-${new Date().toISOString()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  addLog("[INFO] Logs downloaded as file");
                }}
                className="px-2 py-1 text-xs bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition"
              >
                Download
              </button>
            </div>
          </div>
          <pre
            ref={logRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-slate-900 whitespace-pre-wrap"
          >
            {logs.join("\n")}
          </pre>
        </aside>
      </main>
    </div>
  );
};
