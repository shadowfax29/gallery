import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { adFormats, adSizes, deviceTypes, intAdSizes, sliderAdSizes, stayOnAdSizes, intAdTags, sliderAdTags, stayOnAdTags, remnantAdTags } from "../data/adFormats";
import { AdFormat, AdSize, DeviceType } from "../types/AdFormat";
import { DeviceFrame } from "./DeviceFrame";
import { 
  X, RefreshCw, ExternalLink, Monitor, Activity, Clock, Download, Copy, AlertCircle, CheckCircle, Zap, Globe, ChevronDown, ChevronUp, RotateCw, Smartphone 
} from "lucide-react";
import { onCLS, onLCP, onINP, onFCP, onTTFB } from "web-vitals/attribution";

// Device detection helper
const getDeviceCategory = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export const PreviewPages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [format, setFormat] = useState<AdFormat | null>(null);
  const [size, setSize] = useState<AdSize | null>(null);
  const [device, setDevice] = useState<DeviceType | null>(null);
  const [siteUrl, setSiteUrl] = useState<string>("");
  const [tagScript, setTagScript] = useState<string>("");
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadTime, setLoadTime] = useState(Date.now());
  const [logsExpanded, setLogsExpanded] = useState(false);
  const [availableSizes, setAvailableSizes] = useState<AdSize[]>([]);
  const [selectedDisplaySize, setSelectedDisplaySize] = useState<AdSize | null>(null);
  const [filteredAdTags, setFilteredAdTags] = useState<{ label: string; tag: string }[]>([]);
  const [currentDeviceCategory, setCurrentDeviceCategory] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const [logs, setLogs] = useState<string[]>([]);
  const [logsCopied, setLogsCopied] = useState(false);
  const [logsDownloaded, setLogsDownloaded] = useState(false);
  const logRef = useRef<HTMLPreElement>(null);

  // Filter device types based on current device
  const filteredDeviceTypes = useMemo(() => {
    if (currentDeviceCategory === 'mobile') {
      return deviceTypes.filter(d => d.id === 'mobile');
    }
    if (currentDeviceCategory === 'tablet') {
      return deviceTypes.filter(d => d.id !== 'desktop');
    }
    return deviceTypes;
  }, [currentDeviceCategory]);

  // Detect device category on mount and resize
  useEffect(() => {
    const detectDevice = () => setCurrentDeviceCategory(getDeviceCategory());
    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

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

  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const isInitializing = useRef(false);
  const hasInitialized = useRef(false);

  // Filter ad tags based on format and device type (same logic as PreviewModal)
  useEffect(() => {
    if (!format || !device) return;

    let adTags: { label: string; tag: string }[] = [];
    
    if (format.id === 'stay-on') adTags = stayOnAdTags;
    if (format.id === 'slider') adTags = sliderAdTags;
    if (format.id === 'interstitial') adTags = intAdTags;
    if (format.id === 'remnant') adTags = remnantAdTags;

    if (format.id === 'stay-on') {
      if (device.id === 'desktop') adTags = adTags.filter(t => ['728x90', '970x90', '300x250'].includes(t.label));
      if (device.id === 'mobile') adTags = adTags.filter(t => ['300x250', '320x50', '320x100'].includes(t.label));
      if (device.id === 'tablet') adTags = adTags.filter(t => ['300x250', '320x50', '320x100', '728x90'].includes(t.label));
    }
    if (format.id === 'slider') adTags = adTags.filter(t => ['300x250', '300x600'].includes(t.label));
    if (format.id === 'interstitial') adTags = adTags.filter(t => ['300x250', '320x480', '300x600', '360x480'].includes(t.label));
    if (format.id === 'remnant') {
      if (device.id === 'desktop') adTags = adTags.filter(t => ['300x250', '728x90', '300x600'].includes(t.label));
      if (device.id === 'mobile') adTags = adTags.filter(t => ['300x250', '320x50'].includes(t.label));
      if (device.id === 'tablet') adTags = adTags.filter(t => ['300x250', '320x50'].includes(t.label));
    }

    const uniqueTags = adTags.filter((item, idx, arr) => idx === arr.findIndex(t => t.label === item.label));
    setFilteredAdTags(uniqueTags);
  }, [format, device]);

  const fetchPreviewContent = async (url: string, newTag?: string) => {
    addLog("🔧 [START] Fetching preview content...");
    setIsLoadingContent(true);
    setIframeLoaded(false);
    
    if (!progressInterval.current) {
      startProgressSimulation();
    }

    try {
      let previewServerUrl = url.replace(
        'https://gallery.tapmind.io/api/preview',
        'https://preview.tapmind.io/preview'
      ).replace(
        'http://localhost:5042/preview',
        'http://localhost:5042/preview'
      );
      
      addLog(`🌐 [DEBUG] Server URL: ${previewServerUrl.substring(0, 120)}...`);
      
      if (newTag) {
        setTagScript(newTag);
        //addLog(`✅ [DEBUG] Ad tag set successfully`);
      }
      
      // Set the new preview URL - this will trigger iframe reload via key prop
      console.log(previewServerUrl)
      setPreviewUrl(previewServerUrl);
      setIframeError(false);
      setIsLoadingContent(false);
      
      addLog(`✅ [SUCCESS] Preview URL updated, iframe will reload...`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Failed to setup preview:", error);
      addLog(`❌ [ERROR] Failed to setup preview: ${errorMessage}`);
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
  const isMobilePreview = device?.id === 'mobile';

  const startProgressSimulation = () => {
    setProgress(0);
    let currentProgress = 0;

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      const randomIncrement = Math.random() * 8 + 2;
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
    if (isInitializing.current || hasInitialized.current) {
      return;
    }
    
    isInitializing.current = true;

    const formatId = searchParams.get("format");
    const sizeParam = searchParams.get("size");
    const deviceId = searchParams.get("device");
    const url = searchParams.get("url");
    
    const tagParam = searchParams.get("tag") || "";
    setTagScript(tagParam);
    const encodedAdTag = tagParam ? encodeURIComponent(tagParam) : "";
    
    const urlParam = searchParams.get("url") || "";
    const decodedUrl = urlParam;
    
    if (deviceId) {
      const foundDevice = deviceTypes.find((d) => d.id === deviceId);
      setDevice(foundDevice || null);
    }
    
    if (formatId) {
      const foundFormat = adFormats.find((f) => f.id === formatId);
      setFormat(foundFormat || null);
      
      let sizes: AdSize[] = [];
      if (formatId === 'interstitial') {
        sizes = intAdSizes;
      } else if (formatId === 'slider') {
        sizes = sliderAdSizes;
      } else if (formatId === 'stay-on') {
        sizes = stayOnAdSizes;
      } else if (formatId === 'display') {
        sizes = adSizes;
      } else {
        sizes = adSizes;
      }
      
      if (deviceId) {
        //addLog(`🔍 [DEBUG] Filtering sizes for format: ${formatId}, device: ${deviceId}`);
        
        if (formatId === 'stay-on') {
          if (deviceId === 'desktop') {
            sizes = sizes.filter(s => ['728x90', '970x90', '300x250'].includes(s.label || ''));
          } else if (deviceId === 'mobile') {
            sizes = sizes.filter(s => ['320x50', '320x100','300x250'].includes(s.label || ''));
          } else if (deviceId === 'tablet') {
            sizes = sizes.filter(s => ['320x50', '320x100', '300x250', '728x90'].includes(s.label || '')); 
          }
        } else if (formatId === 'slider') {
          sizes = sizes.filter(s => ['300x250', '300x600'].includes(s.label || ''));
        } else if (formatId === 'interstitial') {
          sizes = sizes.filter(s => ['300x250', '320x480', '300x600', '360x480'].includes(s.label || ''));
        } else if (formatId === 'display') {
          if (deviceId === 'desktop') {
            sizes = sizes.filter(s => ['728x90', '970x90', '300x250'].includes(s.label || ''));
          } else if (deviceId === 'mobile') {
            sizes = sizes.filter(s => ['320x50', '320x100', '300x250'].includes(s.label || ''));
          } else if (deviceId === 'tablet') {
            sizes = sizes.filter(s => ['320x50', '320x100', '300x250', '728x90'].includes(s.label || ''));
          }
        }
        
        //addLog(`🔍 [DEBUG] Filtered sizes: ${sizes.length} available`);
      }
      
      setAvailableSizes(sizes);
      //addLog(`📋 [INFO] Available sizes set: ${sizes.length} options`);
    }
    if (sizeParam) {
      const [width, height] = sizeParam.split("x").map(Number);
      
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
      
      if (!foundSize) {
        foundSize = { width, height, label: `${width}x${height}`, type: 'custom' };
        addLog(`⚠️ Size ${width}x${height} not found in predefined sizes, creating custom size`);
      }
      
      setSize(foundSize);
      setSelectedDisplaySize(foundSize);
    }
    if (url) {
      setSiteUrl(url);
    }
    
    const orientationParam = searchParams.get("orientation");
    if (orientationParam === 'horizontal' || orientationParam === 'vertical') {
      setOrientation(orientationParam);
    }

    const apiBaseUrl = getApiBaseUrl();
    const apiUrl = `${apiBaseUrl}/preview?url=${encodeURIComponent(decodedUrl)}&adTag=${encodedAdTag}`;

    hasInitialized.current = true;
    fetchPreviewContent(apiUrl);
  }, [searchParams]);

  const handleRefresh = () => {
    addLog(`[INFO] Refresh button clicked`);

    setIframeLoaded(false);
    setIframeError(false);
    setShowFallback(false);
    hasLoadedOnce.current = false;

    startProgressSimulation();

    const apiBaseUrl = getApiBaseUrl();
    const urlParam = searchParams.get("url") || "";
    const tagParam = searchParams.get("tag") || "";
    const encodedAdTag = tagParam ? encodeURIComponent(tagParam) : "";

    // ✅ add cache buster so previewUrl changes every refresh
    const timestamp = Date.now();
    const random = Math.random();
    const apiUrl =
      `${apiBaseUrl}/preview?url=${encodeURIComponent(urlParam)}` +
      `&adTag=${encodedAdTag}` +
      `&_t=${timestamp}&_r=${random}`;

    // optional: reset load time for perf logs
    setLoadTime(Date.now());

    fetchPreviewContent(apiUrl);
  };


  const handleSizeChange = (newSize: AdSize, newTag: string) => {
    if (!newSize || !newTag) {
      addLog(`⚠️ [ERROR] Invalid size or tag provided`);
      return;
    }
    
    if (newSize.width === size?.width && newSize.height === size?.height) {
      addLog(`⚠️ [SKIP] Size unchanged: ${newSize.width}×${newSize.height}`);
      return;
    }
    
    addLog(`🔄 [CHANGE] Starting size change from ${size?.width}×${size?.height} to ${newSize.width}×${newSize.height}`);
    addLog(`📝 [DEBUG] Using tag for size ${newSize.width}×${newSize.height}`);
    
    // Force reset all states
    setIframeLoaded(false);
    setIframeError(false);
    setShowFallback(false);
    hasLoadedOnce.current = false;
    setPreviewUrl(""); // Clear URL first
    
    // Update size and tag states
    setSize(newSize);
    setSelectedDisplaySize(newSize);
    setTagScript(newTag);
    
    //addLog(`📝 [DEBUG] States updated - Size: ${newSize.width}×${newSize.height}`);
    
    // Update URL parameters
    const currentUrl = searchParams.get('url') || siteUrl;
    const newParams = new URLSearchParams();
    newParams.set('format', format?.id || '');
    newParams.set('size', `${newSize.width}x${newSize.height}`);
    newParams.set('device', device?.id || '');
    newParams.set('url', currentUrl);
    newParams.set('tag', newTag);
    newParams.set('orientation', orientation);
    
    //addLog(`🔗 [DEBUG] New URL params: ${newParams.toString()}`);
    
    // Update browser URL
    setSearchParams(newParams, { replace: true });
    
    // Start loading animation
    startProgressSimulation();
    
    // Small delay to ensure state updates are processed
    setTimeout(() => {
      // Construct API URL
      const apiBaseUrl = getApiBaseUrl();
      const encodedUrl = encodeURIComponent(currentUrl);
      const encodedTag = encodeURIComponent(newTag);
      const timestamp = Date.now();
      const random = Math.random();
      const apiUrl = `${apiBaseUrl}/preview?url=${encodedUrl}&adTag=${encodedTag}&_t=${timestamp}&_r=${random}`;
      
      //addLog(`🚀 [DEBUG] Fetching new preview...`);
      //addLog(`📍 [DEBUG] API: ${apiUrl.substring(0, 150)}...`);
      
      // Trigger preview reload
      fetchPreviewContent(apiUrl, newTag);
    }, 100);
  };

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasLoadedOnce = useRef(false);

  const handleIframeLoad = () => {
    if (hasLoadedOnce.current) {
      return;
    }
    hasLoadedOnce.current = true;

    setIframeError(false);
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    
    setProgress((currentProgress) => {
      const remaining = 100 - currentProgress;
      let step = 0;
      const animationInterval = setInterval(() => {
        step += 1;
        const newProgress = currentProgress + (remaining * (step / 10));
        
        if (step >= 10) {
          clearInterval(animationInterval);
          setProgress(100);
          setTimeout(() => {
            setIframeLoaded(true);
          }, 300);
        } else {
          setProgress(newProgress);
        }
      }, 50);
      
      return currentProgress;
    });

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

    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        const docHTML = iframe.contentDocument.documentElement.outerHTML;
        const sizeBytes = new Blob([docHTML]).size;
        const sizeKB = (sizeBytes / 1024).toFixed(2);
        addLog(`[INFO] Iframe Content Size: ${sizeKB} KB`);
      } else if (previewUrl) {
        fetch(previewUrl, { method: "HEAD" })
          .then((res) => {
            const size = res.headers.get("content-length");
            if (size) {
              const kb = (parseInt(size, 10) / 1024).toFixed(2);
              addLog(`[INFO] Iframe File Size: ${kb} KB`);
            } else {
              addLog(`[INFO] Iframe File Size: Calculating...`);
              return fetch(previewUrl).then(r => r.blob());
            }
          })
          .then((blob) => {
            if (blob) {
              const kb = (blob.size / 1024).toFixed(2);
              addLog(`[INFO] Iframe File Size: ${kb} KB`);
            }
          })
          .catch(() => addLog(`⚠️ [WARNING] Could not determine iframe size`));
      }
    } catch (err) {
      addLog(`⚠️ [WARNING] Could not access iframe content for size calculation`);
    }

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

    // Inject ad tag after iframe loads
    injectAdTag();
  };

  // Function to inject ad tag into iframe via postMessage
  const injectAdTag = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) {
      addLog(`⚠️ [WARNING] Cannot inject ad tag - iframe not accessible`);
      return;
    }

    if (!tagScript) {
      addLog(`⚠️ [WARNING] No ad tag to inject`);
      return;
    }

    try {
      // Determine the size from the current selected size or tag
      const currentSize = size ? `${size.width}x${size.height}` : '300x250';
      
      if (format?.id === 'remnant') {
        // Use INSERT_REMNANT_AD for remnant ads
        iframe.contentWindow.postMessage({
          __type: 'INSERT_REMNANT_AD',
          html: tagScript,
          size: currentSize,
          deviceType: device?.id || 'desktop'
        }, '*');
        //addLog(`📦 [AD] Injected Remnant Ad (${currentSize}) for ${device?.id || 'desktop'}`);
      } else {
        // Use INSERT_ADTAG for other ad formats (inject into head)
        iframe.contentWindow.postMessage({
          __type: 'INSERT_ADTAG',
          html: tagScript,
          targetSelector: 'head'
        }, '*');
        //addLog(`📦 [AD] Injected Ad Tag into head`);
      }
    } catch (err) {
      addLog(`❌ [ERROR] Failed to inject ad tag: ${err}`);
    }
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
              <a href="#" className="hover:underline font-medium">Entertainment</a>
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
                <p className="text-gray-700 mb-6 leading-relaxed">
                  The breakthrough, developed over five years of intensive research and testing, represents
                  what many experts are calling the most significant advancement in artificial intelligence
                  since the development of neural networks.
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF6B2C] via-slate-900 to-[#FF6B2C]">
        <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B2C] border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-white mb-2">Initializing Preview</h2>
          <p className="text-orange-200">Loading configuration and setting up environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50">
      <style>{`
        /* Hide scrollbar for mobile and tablet iframes */
        ${device.id === 'mobile' || device.id === 'tablet' ? `
          iframe::-webkit-scrollbar {
            display: none;
          }
          iframe {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        ` : ''}
      `}</style>
      
      <header className="h-auto bg-white/95 backdrop-blur-xl shadow-md border-b border-[#FF6B2C]/20 px-6 py-3 relative text-sm">
        <div className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-r from-[#FF6B2C]/5 to-[#FF8C42]/5"></div>
        
        {/* Top Row - Logo and Title */}
        <div className="flex items-center gap-4 relative z-10 mb-3">
          <img 
            src="https://assts.tmadsrv.com/logos/Tapmind-Logo-dark.png" 
            alt="Tapmind Logo" 
            className="h-7 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="flex-1">
            <h1 className="text-base font-semibold bg-gradient-to-r from-[#FF6B2C] to-slate-600 bg-clip-text text-transparent">
              Live Ad Preview Studio
            </h1>
          </div>
          
          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {(device?.id === 'mobile' || device?.id === 'tablet') && (
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#FF6B2C]/30 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-xs font-semibold text-gray-600">Device Orientation:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrientation('vertical')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      orientation === 'vertical'
                        ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white shadow-sm'
                        : 'text-gray-600 hover:text-[#FF6B2C] hover:bg-gray-100'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                      <line x1="12" y1="18" x2="12.01" y2="18"/>
                    </svg>
                    <span>Vertical</span>
                  </button>
                  <button
                    onClick={() => setOrientation('horizontal')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      orientation === 'horizontal'
                        ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white shadow-sm'
                        : 'text-gray-600 hover:text-[#FF6B2C] hover:bg-gray-100'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
                      <line x1="6" y1="12" x2="6.01" y2="12"/>
                    </svg>
                    <span>Horizontal</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#FF8C42] hover:to-[#FF6B2C] transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            {/* <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-[#FF6B2C]/30 rounded-xl text-[#FF6B2C] font-semibold hover:bg-slate-50 hover:border-[#FF6B2C]/50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Globe className="w-4 h-4" />
              <span>Open Site</span>
              <ExternalLink className="w-3 h-3" />
            </a> */}

            <button
              onClick={() => window.close()}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Second Row - Format, Size, Device Info */}
        <div className="relative z-10 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-[#FF6B2C] px-2 py-0.5 rounded-full font-semibold border border-[#FF6B2C]/30 text-xs">
              {format.name}
            </span>
            
            {/* Ad Size - Only show for display units */}
            {format.type === 'display' && (
              <span className="bg-gradient-to-r from-slate-100 to-slate-200 text-[#FF6B2C] px-2 py-0.5 rounded-full font-semibold border border-[#FF6B2C]/30 text-xs">
                {size.width}×{size.height}
              </span>
            )}
            
            <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-[#FF8C42] px-2 py-0.5 rounded-full font-semibold border border-[#FF8C42]/30 text-xs">
              {device.name}
            </span>
          </div>
          
          {/* Available Sizes - Inline with badges */}
          {(['interstitial', 'slider', 'stay-on', 'remnant'].includes(format?.id)) && filteredAdTags.length > 0 && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs font-semibold text-gray-600">Available Sizes:</span>
              <div className="flex flex-wrap gap-2">
                {filteredAdTags.map((item, idx) => {
                  const [w, h] = item.label.split('x').map(Number);
                  const isSelected = size && size.width === w && size.height === h;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        const newSize = { width: w, height: h, label: item.label, type: 'standard' as const };
                        //addLog(`🔄 [CHANGE] Ad size button clicked: ${w}×${h}`);
                        handleSizeChange(newSize, item.tag);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white border-[#FF6B2C] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#FF6B2C] hover:bg-[#FF7E01]/5'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <section className="relative z-10 flex items-center justify-center w-full h-full">
          <div className="relative">
            {device.id === 'desktop' ? (
              <div 
                className="bg-white rounded-2xl shadow-2xl border-4 border-gray-800 overflow-hidden relative"
                style={{ 
                  width: `${Math.min(device.width * 1.1, window.innerWidth - 100)}px`, 
                  height: `${Math.min(device.height * 1.1, window.innerHeight - 200)}px`,
                }}
              >
                <div className="bg-gray-800 h-8 flex items-center px-4 gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-300 flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    <span className="truncate">{siteUrl}</span>
                  </div>
                </div>

                <div className="relative w-full h-[calc(100%-2rem)] bg-white overflow-hidden">
                  {previewUrl && (
                    <iframe
                      ref={iframeRef}
                      src={previewUrl}
                      key={previewUrl}
                      className="w-full h-full border-0"
                      title="Ad Preview"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-modals"
                      allow="fullscreen; autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
                      allowFullScreen
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                      style={{ display: iframeLoaded ? 'block' : 'none' }}
                    />
                  )}

                  {showFallback && (
                    <div className="absolute inset-0 overflow-hidden">
                      {renderFallbackContent()}
                    </div>
                  )}

                  {!iframeLoaded && !showFallback && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
                      <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl border border-[#FF6B2C]/20 shadow-2xl max-w-md w-full mx-4">
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner mb-6">
                          <div
                            className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-[#FF6B2C] via-[#FF8C42] to-[#FF8C42]"
                            style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(254, 95, 0, 0.5)" }}
                          ></div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] rounded-2xl text-white shadow-lg">
                            <Zap className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-bold text-lg">Loading Preview</p>
                            <p className="text-sm text-orange-100">{Math.round(progress)}% Complete</p>
                          </div>
                          
                          <div className="text-slate-600">
                            <p className="text-sm font-medium mb-2">Initializing ad environment...</p>
                            <div className="flex justify-center space-x-1">
                              <div className="w-2 h-2 bg-[#FF6B2C] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                              <div className="w-2 h-2 bg-[#FF8C42] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                              <div className="w-2 h-2 bg-[#FF8C42] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <DeviceFrame 
                device={device}
                siteUrl={siteUrl}
                orientation={orientation}
              >
                <div
                  className="relative bg-white overflow-hidden"
                  style={
                    isMobilePreview
                      ? {
                          width: '200%',
                          height: '200%',
                          transform: 'scale(0.5)',
                          transformOrigin: 'top left',
                        }
                      : {
                          width: '100%',
                          height: '100%',
                        }
                  }
                >
                  {previewUrl && (
                    <iframe
                      ref={iframeRef}
                      src={previewUrl}
                      key={previewUrl}
                      className="w-full h-full border-0"
                      title="Ad Preview"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-modals"
                      allow="fullscreen; autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
                      allowFullScreen
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                      style={{ display: iframeLoaded ? 'block' : 'none' }}
                    />
                  )}

                  {showFallback && (
                    <div className="absolute inset-0 overflow-hidden">
                      {renderFallbackContent()}
                    </div>
                  )}

                  {!iframeLoaded && !showFallback && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
                      <div className="text-center p-6 bg-white/90 backdrop-blur-lg rounded-2xl border border-[#FF6B2C]/20 shadow-xl max-w-sm w-full mx-2">
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner mb-4">
                          <div
                            className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-[#FF6B2C] via-[#FF8C42] to-[#FF8C42]"
                            style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(254, 95, 0, 0.5)" }}
                          ></div>
                        </div>

                        <div className="space-y-3">
                          <div className="p-3 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] rounded-xl text-white shadow-lg">
                            <Zap className="w-6 h-6 mx-auto mb-1" />
                            <p className="font-bold text-sm">Loading Preview</p>
                            <p className="text-xs text-orange-100">{Math.round(progress)}%</p>
                          </div>
                          
                          <div className="text-slate-600">
                            <p className="text-xs font-medium mb-2">Initializing...</p>
                            <div className="flex justify-center space-x-1">
                              <div className="w-2 h-2 bg-[#FF6B2C] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                              <div className="w-2 h-2 bg-[#FF8C42] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                              <div className="w-2 h-2 bg-[#FF8C42] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </DeviceFrame>
            )}
          </div>
        </section>

        <div className={`fixed top-0 right-0 bottom-0 z-50 transition-all duration-300 ease-in-out ${
          logsExpanded ? 'w-96' : 'w-12'
        }`}>
          <button
            onClick={() => setLogsExpanded(!logsExpanded)}
            className="absolute left-0 top-1/2 -translate-y-1/2 h-40 w-14 bg-gradient-to-b from-[#FF6B2C] to-[#FF8C42] hover:from-[#FF8C42] hover:to-[#FF6B2C] text-white flex flex-col items-center justify-center gap-3 shadow-lg transition-all duration-300 rounded-l-2xl border-l-2 border-t-2 border-b-2 border-white/20 group"
          >
            <div className="relative">
              <Activity className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-[#FF6B2C]">{logs.length}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-1" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              <span className="text-sm font-bold tracking-wider">
                {logsExpanded ? 'HIDE' : 'LOGS'}
              </span>
            </div>

            <div className={`transition-transform duration-300 ${logsExpanded ? 'rotate-180' : 'rotate-0'}`}>
              <svg 
                className="w-5 h-5 animate-pulse" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M9 5l7 7-7 7" 
                  className={`transition-all duration-300 ${!logsExpanded ? 'opacity-100' : 'opacity-60'}`}
                />
              </svg>
            </div>

            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-l-2xl transition-all duration-300"></div>
          </button>

          <div className={`h-full bg-white border-l-4 border-[#FF6B2C] shadow-2xl transition-all duration-300 flex flex-col ${
            logsExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
          }`}>
            <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-[#FF6B2C]/10 to-[#FF8C42]/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#FF6B2C] to-[#FF8C42] rounded-lg shadow-sm">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Activity Logs</h3>
                    <p className="text-xs text-gray-500">Real-time monitoring</p>
                  </div>
                </div>
                <button
                  onClick={() => setLogsExpanded(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyLogs();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    logsCopied
                      ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {logsCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{logsCopied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadLogs();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    logsDownloaded
                      ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {logsDownloaded ? <CheckCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  <span>{logsDownloaded ? 'Downloaded!' : 'Download'}</span>
                </button>
              </div> */}
            </div>

            <pre
              ref={logRef}
              className="flex-1 overflow-y-auto p-4 font-mono text-xs text-gray-700 leading-relaxed bg-gray-50 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-[#FF6B2C] scrollbar-track-gray-200"
            >
              {logs.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Waiting for activity...</p>
                </div>
              ) : (
                logs.join("\n")
              )}
            </pre>

            <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FF6B2C] rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Live monitoring</span>
              </div>
              <span className="text-xs text-gray-500">{logs.length} entries</span>
            </div>
          </div>
        </div>
      </main> 
    </div>
  );
};