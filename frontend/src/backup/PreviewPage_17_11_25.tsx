import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { adFormats, adSizes, deviceTypes, intAdSizes, sliderAdSizes, stayOnAdSizes } from "../data/adFormats";
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
          border: '8px solid #010D23',
          background: '#010D23',
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
          border: '6px solid #010D23',
          background: '#010D23',
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
  
  // Missing state declarations - FIXED
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Logs state
  const [logs, setLogs] = useState<string[]>([]);
  const [logsCopied, setLogsCopied] = useState(false);
  const [logsDownloaded, setLogsDownloaded] = useState(false);
  const logRef = useRef<HTMLPreElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const getApiBaseUrl = () => {
    if (window.location.hostname === 'gallery.tapmind.io') {
      return 'https://preview.tapmind.io';
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

  // Progress bar states - Fixed implementation
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const isInitializing = useRef(false);
  const hasInitialized = useRef(false);

  // Function to fetch HTML content - Use direct URL instead of blob for proper origin isolation
  const fetchPreviewContent = async (url: string) => {
    setIsLoadingContent(true);
    setIframeLoaded(false);
    addLog("Setting up preview with proper origin isolation...");
    startProgressSimulation();

    try {
      // Replace gallery.tapmind.io/api with preview.tapmind.io
      let previewServerUrl = url.replace(
        'https://gallery.tapmind.io/api/preview',
        'https://preview.tapmind.io/preview'
      ).replace(
        'http://localhost:5042/preview',
        'http://localhost:5042/preview'
      );
      
      // Add cache-busting parameter to force reload on refresh
      const separator = previewServerUrl.includes('?') ? '&' : '?';
      previewServerUrl = `${previewServerUrl}${separator}_t=${Date.now()}`;
      
      //addLog("✅ Preview URL configured with proper origin");
      //addLog(`🔄 Loading with cache-buster: ${Date.now()}`);
      
      // Set the preview URL directly - no blob creation needed
      setPreviewUrl(previewServerUrl);
      
      setIframeError(false);
      setIsLoadingContent(false);
      
      // DON'T clear progress interval here - let it continue until iframe loads
      // Progress will be completed by handleIframeLoad
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Failed to setup preview:", error);
      addLog(`❌ Failed to setup preview: ${errorMessage}`);
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

  // Fixed progress simulation function
  const startProgressSimulation = () => {
    setProgress(0);
    let currentProgress = 0;

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      // FIXED: Use proper Math.random() syntax
      const randomIncrement = Math.random() * 8 + 2; // Random increment between 2-10
      currentProgress += randomIncrement;
      
      if (currentProgress >= 95) {
        currentProgress = 95;
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      }
      
      setProgress(Math.min(currentProgress, 95));
    }, 150);
  };

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (isInitializing.current || hasInitialized.current) {
      return;
    }
    
    isInitializing.current = true;

    const formatId = searchParams.get("format");
    const sizeParam = searchParams.get("size");
    const deviceId = searchParams.get("device");
    const url = searchParams.get("url");
    
    // searchParams.get() already decodes the value automatically
    const tagParam = searchParams.get("tag") || "";
    setTagScript(tagParam);
    // Just encode it once for the API call
    const encodedAdTag = tagParam ? encodeURIComponent(tagParam) : "";
    
    const urlParam = searchParams.get("url") || "";
    const decodedUrl = urlParam; // Already decoded by searchParams.get()
    
    // Set format, size, device first
    if (formatId) {
      const foundFormat = adFormats.find((f) => f.id === formatId);
      setFormat(foundFormat || null);
    }
    if (sizeParam) {
      const [width, height] = sizeParam.split("x").map(Number);
      
      // Look in the correct size array based on format
      let foundSize = null;
      if (formatId === 'interstitial') {
        foundSize = intAdSizes.find((s) => s.width === width && s.height === height);
      } else if (formatId === 'slider') {
        foundSize = sliderAdSizes.find((s) => s.width === width && s.height === height);
      } else if (formatId === 'stay-on') {
        foundSize = stayOnAdSizes.find((s) => s.width === width && s.height === height);
      } else {
        foundSize = adSizes.find((s) => s.width === width && s.height === height);
      }
      
      // Fallback: create size object if not found
      if (!foundSize) {
        foundSize = { width, height, label: `${width}x${height}`, type: 'custom' };
        addLog(`⚠️ Size ${width}x${height} not found in predefined sizes, creating custom size`);
      }
      
      setSize(foundSize);
    }
    if (deviceId) {
      const foundDevice = deviceTypes.find((d) => d.id === deviceId);
      setDevice(foundDevice || null);
    }
    if (url) {
      setSiteUrl(url); // Already decoded by searchParams.get()
    }

    // Only fetch preview content once after all params are set
    const apiBaseUrl = getApiBaseUrl();
    const apiUrl = `${apiBaseUrl}/preview?url=${encodeURIComponent(decodedUrl)}&adTag=${encodedAdTag}`;

    //addLog("Initializing preview session...");
    //addLog("Loading configuration parameters...");
    //addLog(`Decoded tag length: ${tagParam.length} characters`);
    
    // Mark as initialized before fetching to prevent race conditions
    hasInitialized.current = true;
    fetchPreviewContent(apiUrl);
  }, [searchParams]);

  const handleRefresh = () => {
    addLog(`[INFO] Refresh button clicked`);
    
    // Reset all loading states
    setIframeLoaded(false);
    setIframeError(false);
    setShowFallback(false);
    hasLoadedOnce.current = false; // Reset the flag so handleIframeLoad can run again

    // Start progress simulation
    startProgressSimulation();

    //addLog(`[INFO] Refreshing iframe container...`);
    //addLog(`[INFO] Refreshing ad container inside iframe...`);
    //addLog(`[INFO] Reloading preview with current configuration...`);
    
    // Re-fetch content by recreating API URL from search params
    const apiBaseUrl = getApiBaseUrl();
    const urlParam = searchParams.get("url") || "";
    const tagParam = searchParams.get("tag") || "";
    const encodedAdTag = tagParam ? encodeURIComponent(tagParam) : "";
    const apiUrl = `${apiBaseUrl}/preview?url=${encodeURIComponent(urlParam)}&adTag=${encodedAdTag}`;

    //addLog(`Decoded tag length: ${tagParam.length} characters`);
    
    // Fetch new content - this will update previewUrl which triggers iframe reload
    fetchPreviewContent(apiUrl);
  };

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasLoadedOnce = useRef(false);

  const handleIframeLoad = () => {
    // Prevent double execution
    if (hasLoadedOnce.current) {
      return;
    }
    hasLoadedOnce.current = true;

    setIframeError(false);
    
    // Smoothly complete progress to 100% before showing iframe
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    
    // Animate progress from current to 100%
    setProgress((currentProgress) => {
      const remaining = 100 - currentProgress;
      let step = 0;
      const animationInterval = setInterval(() => {
        step += 1;
        const newProgress = currentProgress + (remaining * (step / 10));
        
        if (step >= 10) {
          clearInterval(animationInterval);
          setProgress(100);
          // Wait a brief moment at 100% before revealing iframe
          setTimeout(() => {
            setIframeLoaded(true);
          }, 300);
        } else {
          setProgress(newProgress);
        }
      }, 50);
      
      return currentProgress;
    });

    // Check if iframe is same-origin and accessible
    try {
      const iframe = iframeRef.current;
      console.log('iframe same-origin?', !!iframe?.contentDocument);
      if (iframe?.contentDocument) {
        console.log('iframe body snippet:', iframe.contentDocument.body?.innerHTML.slice(0, 300));
      }
    } catch (err) {
      console.warn('iframe cross-origin access error:', err);
    }

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

    // Web Vitals - only register once
    try {
      onLCP((metric) => addLog(`[VITALS] LCP: ${metric.value.toFixed(2)} ms`), { reportAllChanges: false });
      onCLS((metric) => addLog(`[VITALS] CLS: ${metric.value.toFixed(3)}`), { reportAllChanges: false });
      onINP((metric) => addLog(`[VITALS] INP: ${metric.value.toFixed(2)} ms`), { reportAllChanges: false });
      onFCP((metric) =>
        addLog(`[VITALS] First Contentful Paint: ${metric.value.toFixed(2)} ms`), { reportAllChanges: false }
      );
      onTTFB((metric) =>
        addLog(`🌐 [VITALS] Time To First Byte: ${metric.value.toFixed(2)} ms`), { reportAllChanges: false }
      );
    } catch (e) {
      console.warn('Web Vitals error:', e);
    }

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
    setProgress(100);
    
    // Clear progress interval on error
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    
    addLog(`❌ [ERROR] Iframe failed to load. Showing fallback content.`);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#010D23] via-slate-900 to-[#010D23]">
        <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FE5F00] border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-white mb-2">Initializing Preview</h2>
          <p className="text-orange-200">Loading configuration and setting up environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50">
      {/* Header */}
      <header className="h-15 bg-white/95 backdrop-blur-xl shadow-md border-b border-[#010D23]/20 flex items-center justify-between px-6 relative text-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FE5F00]/5 to-[#FF7E01]/5"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-2 bg-gradient-to-br from-[#FE5F00] to-[#FE5200] rounded-xl shadow-md">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-[#010D23] to-slate-600 bg-clip-text text-transparent">
              Live Ad Preview Studio
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-[#FE5F00] px-2 py-0.5 rounded-full font-semibold border border-[#FE5F00]/30 text-xs" style={{ marginTop: '-5px' }}>
                  {format.name}
                </span>
                <span className="bg-gradient-to-r from-slate-100 to-slate-200 text-[#010D23] px-2 py-0.5 rounded-full font-semibold border border-[#010D23]/30 text-xs" style={{ marginTop: '-5px' }}>
                  {size.width}×{size.height}
                </span>
                <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-[#FE5200] px-2 py-0.5 rounded-full font-semibold border border-[#FE5200]/30 text-xs" style={{ marginTop: '-5px' }}>
                  {device.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#FE5F00] to-[#FF7E01] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#FE5200] hover:to-[#FE5F00] transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-[#010D23]/30 rounded-xl text-[#010D23] font-semibold hover:bg-slate-50 hover:border-[#010D23]/50 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Globe className="w-4 h-4" />
            <span>Open Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => window.close()}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden max-h-[calc(100vh-4rem)]">
        {/* Preview Section */}
        <section className="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl border border-[#010D23]/20 shadow-xl overflow-hidden flex flex-col min-h-0">
          {/* Preview Header */}
          <div className="h-8 px-4 flex items-center justify-between border-b border-[#010D23]/20 bg-gradient-to-r from-slate-50 to-orange-50/30 text-sm">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-gradient-to-br from-[#FE5F00] to-[#FE5200] rounded-lg shadow-sm">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-[#010D23]">Live Preview Window</h2>
            </div>
            
            <div className="flex items-center gap-4">
              {iframeLoaded && !iframeError && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#FE5F00]" />
                  <span className="text-sm font-semibold text-[#FE5F00]">Connected</span>
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
                    id="preview-iframe"
                    ref={iframeRef}
                    src={previewUrl}
                    className={`w-full h-full border-none transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                    sandbox="allow-scripts allow-popups allow-same-origin allow-forms allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
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
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  renderFallbackContent()
                )}

                {/* Loading Overlay */}
                {!iframeLoaded && !showFallback && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white via-orange-50/50 to-white z-10 transition-opacity duration-500">
                    <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl border border-[#010D23]/20 shadow-2xl max-w-md w-full mx-4">
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner mb-6">
                        <div
                          className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-[#FE5F00] via-[#FF7E01] to-[#FE5200]"
                          style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(254, 95, 0, 0.5)" }}
                        ></div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-[#FE5F00] to-[#FE5200] rounded-2xl text-white shadow-lg">
                          <Zap className="w-8 h-8 mx-auto mb-2" />
                          <p className="font-bold text-lg">Loading Preview</p>
                          <p className="text-sm text-orange-100">{Math.round(progress)}% Complete</p>
                        </div>
                        
                        <div className="text-slate-600">
                          <p className="text-sm font-medium mb-2">Initializing ad environment...</p>
                          <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-[#FE5F00] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-2 h-2 bg-[#FF7E01] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="w-2 h-2 bg-[#FE5200] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Mobile/Tablet with device frame
              <DeviceFrame device={device}>
                <div className="w-full h-full relative bg-white">
                  {!showFallback ? (
                    <iframe
                      id="preview-iframe"
                      ref={iframeRef}
                      src={previewUrl}
                      className={`w-full h-full border-none transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                      sandbox="allow-scripts allow-popups allow-same-origin allow-forms allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
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
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full overflow-auto">
                      {renderFallbackContent()}
                    </div>
                  )}

                  {!iframeLoaded && !showFallback && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FE5F00] mx-auto mb-3"></div>
                        <p className="text-gray-600 text-sm">Loading...</p>
                      </div>
                    </div>
                  )}
                </div>
              </DeviceFrame>
            )}

            {/* Enhanced Loading Overlay for all devices when loading */}
            {!iframeLoaded && !showFallback && device.id !== 'desktop' && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white via-orange-50/50 to-white z-10 transition-opacity duration-500">
                <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl border border-[#010D23]/20 shadow-2xl max-w-md w-full mx-4">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner mb-6">
                    <div
                      className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-[#FE5F00] via-[#FF7E01] to-[#FE5200]"
                      style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(254, 95, 0, 0.5)" }}
                    ></div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-[#FE5F00] to-[#FE5200] rounded-2xl text-white shadow-lg">
                      <Zap className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-bold text-lg">Loading Preview</p>
                      <p className="text-sm text-orange-100">{Math.round(progress)}% Complete</p>
                    </div>
                    
                    <div className="text-slate-600">
                      <p className="text-sm font-medium mb-2">Initializing ad environment...</p>
                      <div className="flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-[#FE5F00] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-[#FF7E01] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-[#FE5200] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Logs Section */}
        <aside className="w-full lg:w-80 flex flex-col bg-gradient-to-b from-[#010D23] to-slate-800 rounded-3xl border border-[#010D23]/50 shadow-2xl overflow-hidden min-h-0 max-h-full">
          <div className="h-8 px-4 flex items-center justify-between border-b border-[#010D23]/50 bg-gradient-to-r from-slate-800 to-[#010D23] text-sm">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-gradient-to-br from-[#FE5F00] to-[#FE5200] rounded-lg shadow-lg">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#ffffff' }}>Logs</h2>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCopyLogs}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                  logsCopied
                    ? 'bg-[#FE5F00] text-white shadow-lg'
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
                    ? 'bg-[#FF7E01] text-white shadow-lg'
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
            className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-gradient-to-b from-[#010D23] to-slate-800 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent min-h-0"
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

          <div className="px-4 py-3 border-t border-[#010D23]/50 bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FE5F00] rounded-full animate-pulse"></div>
                <span className="text-xs font-medium" style={{ color: '#ffffff' }}>Live monitoring active</span> 
              </div>
              <span className="text-xs text-slate-500">{logs.length} entries</span>
            </div>
          </div>
        </aside>
      </main> 
    </div>
  );
};