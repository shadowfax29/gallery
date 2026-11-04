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
          width: '380px',
          height: '700px',
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
          width: '600px',
          height: '750px',
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
  const [tagScript, setTagScript] = useState<string>("");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadTime, setLoadTime] = useState(Date.now());

  // Logs state
  const [logs, setLogs] = useState<string[]>([]);
  const [logsCopied, setLogsCopied] = useState(false);
  const [logsDownloaded, setLogsDownloaded] = useState(false);
  const logRef = useRef<HTMLPreElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Progress bar states
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const progressInterval = useRef<number | null>(null);

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

    // Add initial logs
    addLog("Initializing preview session...");
    addLog("Loading configuration parameters...");
  }, [searchParams]);

  const handleRefresh = () => {
    setIframeLoaded(false);
    setIframeError(false);
    setShowFallback(false);
    setLoadTime(Date.now());
    setProgress(0);
    progressRef.current = 0;

    if (progressInterval.current !== null) {
      clearInterval(progressInterval.current);
    }

    // Start new interval
    progressInterval.current = window.setInterval(() => {
      if (progressRef.current < 90) {
        progressRef.current += Math.random() * 5;
        setProgress(Math.min(progressRef.current, 90));
      }
    }, 200);

    setLogs([
      `[INFO] Refreshing iframe container...`,
      `[INFO] Refreshing ad container inside iframe...`,
      `[INFO] Reloading preview with current configuration...`,
    ]);
  };

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleIframeLoad = () => {
    setIframeError(false);
    setIframeLoaded(true);
    setProgress(100);
    if (progressInterval.current) clearInterval(progressInterval.current);

    const pageLoadTime = Date.now() - loadTime;
    addLog(`✅ [SUCCESS] Iframe loaded successfully`);
    addLog(`[PERFORMANCE] Page Load Time: ${pageLoadTime} ms`);

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

    // Web Vitals
    onLCP((metric) => addLog(`[VITALS] LCP: ${metric.value.toFixed(2)} ms`));
    onCLS((metric) => addLog(`[VITALS] CLS: ${metric.value.toFixed(3)}`));
    onINP((metric) => addLog(`[VITALS] INP: ${metric.value.toFixed(2)} ms`));
    onFCP((metric) =>
      addLog(`[VITALS] First Contentful Paint: ${metric.value.toFixed(2)} ms`)
    );
    onTTFB((metric) =>
      addLog(`🌐 [VITALS] Time To First Byte: ${metric.value.toFixed(2)} ms`)
    );

    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType("paint");
      paintEntries.forEach((entry: any) => {
        if (entry.name === "first-paint") {
          addLog(`[VITALS] First Paint: ${entry.startTime.toFixed(2)} ms`);
        }
      });

      const nav = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (nav) {
        addLog(`[VITALS] DOM Content Loaded: ${nav.domContentLoadedEventEnd.toFixed(2)} ms`);
        addLog(`[VITALS] Render Start Time: ${nav.responseStart.toFixed(2)} ms`);
      }
    }
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(true);
    setShowFallback(true);
    addLog(`❌ [ERROR] Iframe failed to load. Showing fallback content.`);
  };

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

  // Enhanced fallback content (same as in old file)
  const renderFallbackContent = () => (
    <div className="w-full h-full bg-white overflow-y-auto">
      {/* Simulated Website Header */}
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
              <a href="#" className="hover:underline font-medium">Entertainment</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-red-700 px-3 py-1 rounded text-sm font-bold">LIVE</div>
            <div className="text-sm">Breaking News</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
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
                <p className="text-gray-700 mb-6 leading-relaxed">
                  The breakthrough, developed over five years of intensive research and testing, represents
                  what many experts are calling the most significant advancement in artificial intelligence
                  since the development of neural networks.
                </p>
              </div>
            </article>
          </div>

          {/* Sidebar */}
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
      {/* Header */}
      <header className="h-20 bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-200/50 flex items-center justify-between px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <Monitor className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
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
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Globe className="w-4 h-4" />
            <span>Open Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => window.close()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
        {/* Preview Section */}
        <section className="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden flex flex-col">
          {/* Preview Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-sm">
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

          {/* Device Preview Container */}
          <div className="flex-1 relative bg-gradient-to-br from-slate-100/50 to-slate-200/30 flex justify-center items-center p-4 overflow-hidden">
            {device.id === 'desktop' ? (
              // Full-screen desktop view
              <div className="w-full h-full relative bg-white rounded-lg overflow-hidden shadow-2xl border border-gray-700">
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
                  renderFallbackContent()
                )}

                {/* Loading Overlay */}
                {!iframeLoaded && !showFallback && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading website...</p>
                      <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Mobile/Tablet with device frame (matching old file)
              <DeviceFrame device={device}>
                <div className="w-full h-full relative bg-white">
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

            {/* Enhanced Loading Overlay for all devices when loading */}
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
                      <p className="text-sm text-blue-100">{Math.floor(progress)}% Complete</p>
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

        {/* Logs Section */}
        <aside className="w-full lg:w-80 flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
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