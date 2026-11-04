import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { adFormats, adSizes, deviceTypes, intAdSizes, sliderAdSizes, stayOnAdSizes, intAdTags, sliderAdTags, stayOnAdTags, remnantAdTags } from "../data/adFormats";
import { AdFormat, AdSize, DeviceType, StayOnAdSize, SliderAdSize, IntAdSize } from "../types/AdFormat";
import { DeviceFrame } from "./DeviceFrame";
import {
  X, RefreshCw, ExternalLink, Monitor, Activity, Clock, Download, Copy, AlertCircle, CheckCircle, Zap, Globe, ChevronDown, ChevronUp, RotateCw, Smartphone, Tablet, Code, Minus, Maximize2, GripVertical, PanelRight, PanelRightOpen, PictureInPicture2
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

export const PreviewPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const formatParam = searchParams.get("format");
  const [format, setFormat] = useState<AdFormat | null>(null);
  const [size, setSize] = useState<AdSize | StayOnAdSize | SliderAdSize | IntAdSize | null>(null);
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
  const [availableSizes, setAvailableSizes] = useState<(AdSize | StayOnAdSize | SliderAdSize | IntAdSize)[]>([]);
  const [selectedDisplaySize, setSelectedDisplaySize] = useState<AdSize | StayOnAdSize | SliderAdSize | IntAdSize | null>(null);
  const [filteredAdTags, setFilteredAdTags] = useState<{ label: string; tag: string }[]>([]);
  const [currentDeviceCategory, setCurrentDeviceCategory] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const [logs, setLogs] = useState<string[]>([]);
  const [logsCopied, setLogsCopied] = useState(false);
  const [logsDownloaded, setLogsDownloaded] = useState(false);
  const logRef = useRef<HTMLPreElement>(null);
  // Add this hook near your other refs/state
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const [desktopScale, setDesktopScale] = useState(1);

  // Floating control panel: position, minimised state and drag bookkeeping
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const [narrow, setNarrow] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [panelMin, setPanelMin] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [dockMode, setDockMode] = useState<'right' | 'float'>('right');
  const [dockWidth, setDockWidth] = useState(380);
  const resizingRef = useRef(false);
  const [urlDraft, setUrlDraft] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [panelPos, setPanelPos] = useState<{ x: number; y: number }>(() => ({
    x: typeof window === 'undefined' ? 16 : Math.max(8, window.innerWidth - 340 - 24),
    y: 20,
  }));

  // Add this useEffect to compute scale
  useEffect(() => {
    const computeScale = () => {
      const headerHeight = 0;
      const padding = 48;
      const dockOff = dockMode === 'right' ? (panelMin ? 44 : narrow ? 0 : dockWidth) : 0;
      const availableWidth = window.innerWidth - dockOff - 100;
      const availableHeight = window.innerHeight - headerHeight - padding;
      const targetWidth = Math.min(device?.width ? device.width * 1.1 : 1200, availableWidth);
      const targetHeight = Math.min(device?.height ? device.height * 1.1 : 800, availableHeight);
      const scaleX = availableWidth / targetWidth;
      const scaleY = availableHeight / targetHeight;
      setDesktopScale(Math.min(scaleX, scaleY, 1));
    };
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, [device, dockMode, dockWidth, panelMin, narrow]);

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

  // useEffect(() => {
  //   if (formatParam === "hybrid-video") {
  //     const urlParam = searchParams.get("url") || "";
  //     const tagParam = searchParams.get("tag") || "";

  //     const previewUrl = `https://preview.tapmind.io/preview?url=${encodeURIComponent(
  //       urlParam
  //     )}&adTag=${encodeURIComponent(tagParam)}`;

  //     window.location.href = previewUrl; // 🔥 FULL redirect
  //   }
  // }, []);
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
  const injectionAttempted = useRef(false);

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
    injectionAttempted.current = false;

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
        addLog(`✅ [DEBUG] Ad tag updated`);
      }

      // Set the new preview URL - this will trigger iframe reload via key prop
      console.log('Preview URL:', previewServerUrl);

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

      let sizes: (AdSize | StayOnAdSize | SliderAdSize | IntAdSize)[] = [];
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
        if (formatId === 'stay-on') {
          if (deviceId === 'desktop') {
            sizes = sizes.filter(s => ['728x90', '970x90', '300x250'].includes(s.label || ''));
          } else if (deviceId === 'mobile') {
            sizes = sizes.filter(s => ['320x50', '320x100', '300x250'].includes(s.label || ''));
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
      }

      setAvailableSizes(sizes);
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
        foundSize = { width, height, label: `${width}x${height}`, type: 'rectangle' as const };
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
    injectionAttempted.current = false;

    startProgressSimulation();

    const apiBaseUrl = getApiBaseUrl();
    const urlParam = searchParams.get("url") || "";
    const tagParam = searchParams.get("tag") || "";
    const encodedAdTag = tagParam ? encodeURIComponent(tagParam) : "";

    const timestamp = Date.now();
    const random = Math.random();
    const apiUrl =
      `${apiBaseUrl}/preview?url=${encodeURIComponent(urlParam)}` +
      `&adTag=${encodedAdTag}` +
      `&_t=${timestamp}&_r=${random}`;

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

    // Force reset all states
    setIframeLoaded(false);
    setIframeError(false);
    setShowFallback(false);
    hasLoadedOnce.current = false;
    injectionAttempted.current = false;
    setPreviewUrl("");

    // Update size and tag states
    setSize(newSize);
    setSelectedDisplaySize(newSize);
    setTagScript(newTag);

    // Update URL parameters
    const currentUrl = searchParams.get('url') || siteUrl;
    const newParams = new URLSearchParams();
    newParams.set('format', format?.id || '');
    newParams.set('size', `${newSize.width}x${newSize.height}`);
    newParams.set('device', device?.id || '');
    newParams.set('url', currentUrl);
    newParams.set('tag', newTag);
    newParams.set('orientation', orientation);

    setSearchParams(newParams, { replace: true });

    // Start loading animation
    startProgressSimulation();

    // Small delay to ensure state updates are processed
    setTimeout(() => {
      const apiBaseUrl = getApiBaseUrl();
      const encodedUrl = encodeURIComponent(currentUrl);
      const encodedTag = encodeURIComponent(newTag);
      const timestamp = Date.now();
      const random = Math.random();
      const apiUrl = `${apiBaseUrl}/preview?url=${encodedUrl}&adTag=${encodedTag}&_t=${timestamp}&_r=${random}`;

      fetchPreviewContent(apiUrl, newTag);
    }, 100);
  };

  const popularSites = [
    { name: 'Default', url: 'https://dev.tapmind.io/new_demo/index.html' },
    { name: 'CNET', url: 'https://www.cnet.com/' },
    { name: 'Lifehacker', url: 'https://lifehacker.com/' },
    { name: 'Default 2', url: 'https://dev.tapmind.io/new_demo/index-dark.html' },
  ];

  // Same ad-tag rules the launch popup uses, so a device change can pick a valid size
  const computeTags = (fid: string, did: string) => {
    let adTags: { label: string; tag: string }[] = [];
    if (fid === 'stay-on') adTags = stayOnAdTags;
    if (fid === 'slider') adTags = sliderAdTags;
    if (fid === 'interstitial') adTags = intAdTags;
    if (fid === 'remnant') adTags = remnantAdTags;
    if (fid === 'stay-on') {
      if (did === 'desktop') adTags = adTags.filter(t => ['728x90', '970x90', '300x250'].includes(t.label));
      if (did === 'mobile') adTags = adTags.filter(t => ['300x250', '320x50', '320x100'].includes(t.label));
      if (did === 'tablet') adTags = adTags.filter(t => ['300x250', '320x50', '320x100', '728x90'].includes(t.label));
    }
    if (fid === 'slider') adTags = adTags.filter(t => ['300x250', '300x600'].includes(t.label));
    if (fid === 'interstitial') adTags = adTags.filter(t => ['300x250', '320x480', '300x600', '360x480'].includes(t.label));
    if (fid === 'remnant') {
      if (did === 'desktop') adTags = adTags.filter(t => ['300x250', '728x90', '300x600'].includes(t.label));
      if (did === 'mobile') adTags = adTags.filter(t => ['300x250', '320x50'].includes(t.label));
      if (did === 'tablet') adTags = adTags.filter(t => ['300x250', '320x50'].includes(t.label));
    }
    return adTags.filter((item, idx, arr) => idx === arr.findIndex(t => t.label === item.label));
  };

  // Change the website, device, size or tag and reload the preview with the new settings
  const applyChange = (c: { url?: string; device?: DeviceType; size?: AdSize; tag?: string; orientation?: 'vertical' | 'horizontal' }) => {
    if (!format) return;
    const nextUrl = c.url ?? (searchParams.get('url') || siteUrl);
    const nextDevice = c.device ?? device;
    const nextSize = c.size ?? size;
    const nextTag = c.tag ?? (searchParams.get('tag') || tagScript);
    const nextOrientation = c.orientation ?? orientation;
    if (!nextDevice || !nextSize) return;

    setIframeLoaded(false);
    setIframeError(false);
    setShowFallback(false);
    hasLoadedOnce.current = false;
    injectionAttempted.current = false;
    setPreviewUrl("");

    if (c.url) setSiteUrl(c.url);
    if (c.device) setDevice(c.device);
    if (c.orientation) setOrientation(c.orientation);
    if (c.size) {
      setSize(c.size);
      setSelectedDisplaySize(c.size);
    }
    setTagScript(nextTag);

    const params = new URLSearchParams();
    params.set('format', format.id);
    params.set('size', `${nextSize.width}x${nextSize.height}`);
    params.set('device', nextDevice.id);
    params.set('url', nextUrl);
    params.set('tag', nextTag);
    params.set('orientation', nextOrientation);
    setSearchParams(params, { replace: true });

    startProgressSimulation();
    setTimeout(() => {
      const apiUrl = `${getApiBaseUrl()}/preview?url=${encodeURIComponent(nextUrl)}&adTag=${encodeURIComponent(nextTag)}&_t=${Date.now()}&_r=${Math.random()}`;
      fetchPreviewContent(apiUrl, nextTag);
    }, 100);
  };

  const handleDeviceChange = (d: DeviceType) => {
    if (!format) return;
    addLog(`🔄 [CHANGE] Device ${device?.id} → ${d.id}`);
    const tags = computeTags(format.id, d.id);
    const current = size ? `${size.width}x${size.height}` : '';
    if (tags.length > 0 && !tags.some((t) => t.label === current)) {
      const [w, h] = tags[0].label.split('x').map(Number);
      applyChange({ device: d, orientation: 'vertical', size: { width: w, height: h, label: tags[0].label, type: 'rectangle' as const } as AdSize, tag: tags[0].tag });
    } else {
      applyChange({ device: d, orientation: 'vertical' });
    }
  };

  useEffect(() => {
    setUrlDraft(null);
  }, [siteUrl]);

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
            addLog(`✅ [IFRAME] Iframe is now visible, waiting for bridge initialization...`);

            // CRITICAL FIX: Wait longer for the insertion bridge to initialize
            // The bridge script needs time to execute and set up the postMessage listener
            setTimeout(() => {
              addLog(`🚀 [BRIDGE] Bridge should be ready, starting ad injection...`);
              injectAdTag();
            }, 1500); // Increased delay to ensure bridge is ready
          }, 300);
        } else {
          setProgress(newProgress);
        }
      }, 50);

      return currentProgress;
    });

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
  };



  // CRITICAL FIX: Improved ad tag injection with retry mechanism and better timing
  const injectAdTag = () => {

    if (injectionAttempted.current) {
      addLog(`⚠️ [SKIP] Ad tag injection already attempted`);
      return;
    }


    injectionAttempted.current = true;

    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) {
      addLog(`⚠️ [WARNING] Cannot inject ad tag - iframe not accessible`);
      // Retry after delay
      setTimeout(() => {
        injectionAttempted.current = false;
        injectAdTag();
      }, 1000);
      return;
    }

    if (!tagScript) {
      addLog(`⚠️ [WARNING] No ad tag to inject`);
      return;
    }

    try {
      const currentSize = size ? `${size.width}x${size.height}` : '300x250';

      addLog(`📦 [AD] Attempting to inject ad tag...`);

      addLog(`📦 [AD] Format: ${format?.id}, Size: ${currentSize}, Device: ${device?.id}`);
      addLog(`📦 [AD] Tag length: ${tagScript.length} characters`);

      if (format?.id === 'remnant') {
        // Use INSERT_REMNANT_AD for remnant ads with retry
        const sendRemnantAd = (retryCount = 0) => {
          if (retryCount > 3) {
            addLog(`❌ [AD] Failed to inject remnant ad after ${retryCount} attempts`);
            return;
          }

          try {
            iframe.contentWindow?.postMessage({
              __type: 'INSERT_REMNANT_AD',
              html: tagScript,
              format: format?.id || formatParam,
              size: currentSize,
              deviceType: device?.id || 'desktop'
            }, '*');
            addLog(`✅ [AD] Sent Remnant Ad message (${currentSize}) - Attempt ${retryCount + 1}`);

            // Retry if needed
            // if (retryCount < 2) {
            //   setTimeout(() => sendRemnantAd(retryCount + 1), 1000);
            // }
          } catch (err) {
            addLog(`⚠️ [AD] Remnant injection error on attempt ${retryCount + 1}`);
            setTimeout(() => sendRemnantAd(retryCount + 1), 1000);
          }
        };

        sendRemnantAd(0);
      } else {
        // For other ad formats, use multiple injection strategies

        // Strategy 1: PostMessage to head (standard approach)
        const sendToHead = () => {
          try {
            iframe.contentWindow?.postMessage({
              __type: 'INSERT_ADTAG',
              html: tagScript,
              format: format?.id || formatParam,
              targetSelector: 'head'
            }, '*');
            addLog(`✅ [AD] Sent ad tag to HEAD via postMessage`);
          } catch (err) {
            addLog(`⚠️ [AD] Failed to send to HEAD`);
          }
        };

        // Strategy 2: PostMessage to body
        const sendToBody = () => {
          try {
            iframe.contentWindow?.postMessage({
              __type: 'INSERT_ADTAG',
              html: tagScript,
              format: format?.id || formatParam,
              targetSelector: 'body'
            }, '*');
            addLog(`✅ [AD] Sent ad tag to BODY via postMessage`);
          } catch (err) {
            addLog(`⚠️ [AD] Failed to send to BODY`);
          }
        };

        // Execute strategies with delays
        sendToHead();
        setTimeout(sendToBody, 500);

        // Strategy 3: Retry head injection
        setTimeout(sendToHead, 1500);

        // Strategy 4: Final retry
        setTimeout(() => {
          sendToHead();
          addLog(`🔄 [AD] Final injection attempt completed`);
        }, 3000);
      }

      // Verify injection after delay
      setTimeout(() => {
        addLog(`🔍 [AD] Ad scripts should be executing now...`);
        addLog(`💡 [TIP] Check browser console for ad server responses`);
      }, 4000);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      addLog(`❌ [ERROR] Failed to inject ad tag: ${errorMsg}`);
      console.error('Ad injection error:', err);
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
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
        <div className="text-center px-8 py-10 border border-[#e4e0da] bg-white max-w-sm w-full mx-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FF7E01] border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-lg font-bold mb-1" style={{ color: '#0b0b0b' }}>Initializing preview</h2>
          <p className="text-sm" style={{ color: '#666661' }}>Loading configuration and setting up the environment...</p>
        </div>
      </div>
    );
  }

  const dockOffset = dockMode === 'right' ? (panelMin ? 44 : narrow ? 0 : dockWidth) : 0;

  const controlsBody = (
          <div className="p-4 space-y-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 text-[11px] font-semibold border" style={{ color: '#FF7E01', borderColor: '#FF7E01' }}>
                {format.name}
              </span>
              {format.type === 'display' && (
                <span className="px-2 py-0.5 text-[11px] font-semibold border border-[#e4e0da]" style={{ color: '#4a4a46' }}>
                  {size.width}×{size.height}
                </span>
              )}
              <span className="px-2 py-0.5 text-[11px] font-semibold border border-[#e4e0da]" style={{ color: '#4a4a46' }}>
                {device.name}
              </span>
            </div>

            {/* Website URL */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-1.5" style={{ color: '#E86F00' }}>
                <Globe className="w-3 h-3" /> Website URL
              </div>
              <form
                className="flex"
                onSubmit={(e) => {
                  e.preventDefault();
                  const next = (urlDraft ?? siteUrl).trim();
                  if (next && next !== siteUrl) applyChange({ url: next });
                }}
              >
                <input
                  type="url"
                  value={urlDraft ?? siteUrl}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  aria-label="Website URL"
                  className="flex-1 min-w-0 h-9 px-3 text-xs border border-[#e4e0da] focus:outline-none focus:border-[#FF7E01]"
                  style={{ color: '#0b0b0b' }}
                  placeholder="Enter website URL"
                />
                <button
                  type="submit"
                  className="!px-3 text-xs font-semibold transition-colors hover:!bg-[#E86F00]"
                  style={{ backgroundColor: '#FF7E01', color: '#ffffff' }}
                >
                  Go
                </button>
              </form>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {popularSites.map((site) => {
                  const on = siteUrl === site.url;
                  return (
                    <button
                      key={site.name}
                      onClick={() => {
                        setUrlDraft(site.url);
                        if (!on) applyChange({ url: site.url });
                      }}
                      className="!px-3 !py-1 text-[11px] font-semibold rounded-full border transition-colors"
                      style={{
                        backgroundColor: on ? '#FF7E01' : '#ffffff',
                        color: on ? '#ffffff' : '#0b0b0b',
                        borderColor: on ? '#FF7E01' : '#e4e0da',
                      }}
                    >
                      {site.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Device type */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-1.5" style={{ color: '#E86F00' }}>
                <Monitor className="w-3 h-3" /> Device type
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {deviceTypes.map((d) => {
                  if (format.id === 'ribbon-player' && d.id === 'desktop') return null;
                  const on = device.id === d.id;
                  const Icon = d.id === 'mobile' ? Smartphone : d.id === 'tablet' ? Tablet : Monitor;
                  return (
                    <button
                      key={d.id}
                      onClick={() => { if (!on) handleDeviceChange(d); }}
                      className="!p-2.5 text-center border transition-colors"
                      style={{
                        backgroundColor: on ? '#FF7E01' : '#ffffff',
                        color: on ? '#ffffff' : '#0b0b0b',
                        borderColor: on ? '#FF7E01' : '#e4e0da',
                      }}
                    >
                      <div className="flex justify-center mb-1"><Icon className="w-4 h-4" /></div>
                      <div className="text-[11px] font-semibold">{d.name}</div>
                      <div className="text-[10px] opacity-70">{d.width}×{d.height}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orientation */}
            {(device?.id === 'mobile' || device?.id === 'tablet') && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-1.5" style={{ color: '#E86F00' }}>
                  <RotateCw className="w-3 h-3" /> Orientation
                </div>
                <div className="grid grid-cols-2 border border-[#e4e0da]">
                  {(['vertical', 'horizontal'] as const).map((o) => (
                    <button
                      key={o}
                      onClick={() => setOrientation(o)}
                      className="!px-3 !py-2 text-xs font-semibold capitalize transition-colors"
                      style={{
                        backgroundColor: orientation === o ? '#FF7E01' : '#ffffff',
                        color: orientation === o ? '#ffffff' : '#4a4a46',
                      }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ad size */}
            {(['interstitial', 'slider', 'stay-on', 'remnant'].includes(format?.id)) && filteredAdTags.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-1.5" style={{ color: '#E86F00' }}>
                  <Code className="w-3 h-3" /> Ad size
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {filteredAdTags.map((item, idx) => {
                    const [w, h] = item.label.split('x').map(Number);
                    const isSelected = size && size.width === w && size.height === h;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          const newSize = { width: w, height: h, label: item.label, type: 'rectangle' as const };
                          handleSizeChange(newSize, item.tag);
                        }}
                        className="!px-3 !py-1.5 text-xs font-semibold rounded-full border transition-colors"
                        style={{
                          backgroundColor: isSelected ? '#FF7E01' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#0b0b0b',
                          borderColor: isSelected ? '#FF7E01' : '#e4e0da',
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleRefresh}
              className="w-full inline-flex items-center justify-center gap-2 !px-4 !py-2.5 text-xs font-semibold transition-colors hover:!bg-[#E86F00]"
              style={{ backgroundColor: '#FF7E01', color: '#ffffff' }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh preview
            </button>
          </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f4f1', paddingRight: dockOffset, transition: 'padding-right .2s' }}>
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

      {dockMode === 'right' && (
        <aside
          className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-white border-l border-[#FF7E01]"
          style={{ width: panelMin ? 44 : narrow ? '100vw' : dockWidth, fontFamily: "'Geist', system-ui, sans-serif", boxShadow: '-10px 0 30px rgba(0,0,0,0.08)', transition: resizingRef.current ? 'none' : 'width .2s' }}
        >
          {!panelMin && (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panel"
              className="absolute left-0 top-0 bottom-0 w-2 -translate-x-1/2 z-10 cursor-ew-resize hover:bg-[#E86F00]/40"
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => {
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                resizingRef.current = true;
              }}
              onPointerMove={(e) => {
                if (!resizingRef.current) return;
                const max = Math.min(640, window.innerWidth * 0.6);
                setDockWidth(Math.max(300, Math.min(window.innerWidth - e.clientX, max)));
              }}
              onPointerUp={() => { resizingRef.current = false; }}
              onPointerCancel={() => { resizingRef.current = false; }}
            />
          )}

          {panelMin ? (
            <div className="flex flex-col items-center gap-3 py-3 h-full" style={{ background: 'linear-gradient(180deg, #FF7E01, #FF7E01)' }}>
              <button
                onClick={() => setPanelMin(false)}
                aria-label="Expand controls"
                title="Expand"
                className="flex items-center justify-center w-8 h-8 transition-colors hover:!bg-white/20"
                style={{ color: '#ffffff' }}
              >
                <PanelRightOpen className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold tracking-wide" style={{ color: '#ffffff', writingMode: 'vertical-rl' }}>Live ad preview</span>
              <div className="flex-1" />
              <button
                onClick={() => window.close()}
                aria-label="Close preview"
                title="Close preview"
                className="flex items-center justify-center w-8 h-8 transition-colors hover:!bg-white/20"
                style={{ color: '#ffffff' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-2.5 select-none" style={{ background: 'linear-gradient(135deg, #FF7E01, #FF7E01)' }}>
                <span className="text-sm font-bold tracking-[-0.01em] truncate" style={{ color: '#ffffff' }}>Live ad preview</span>
                <div className="flex-1" />
                <button
                  onClick={() => setDockMode('float')}
                  aria-label="Undock into a floating panel"
                  title="Undock"
                  className="flex items-center justify-center w-7 h-7 transition-colors hover:!bg-white/20"
                  style={{ color: '#ffffff' }}
                >
                  <PictureInPicture2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPanelMin(true)}
                  aria-label="Minimise controls"
                  title="Minimise"
                  className="flex items-center justify-center w-7 h-7 transition-colors hover:!bg-white/20"
                  style={{ color: '#ffffff' }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.close()}
                  aria-label="Close preview"
                  title="Close preview"
                  className="flex items-center justify-center w-7 h-7 transition-colors hover:!bg-white/20"
                  style={{ color: '#ffffff' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">{controlsBody}</div>
            </>
          )}
        </aside>
      )}

      {dockMode === 'float' && (
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Preview controls"
        className="fixed z-50 w-[360px] max-w-[calc(100vw-16px)] bg-white border border-[#FF7E01]"
        style={{
          left: panelPos.x,
          top: panelPos.y,
          boxShadow: dragging ? '0 22px 60px rgba(0,0,0,0.28)' : '0 12px 40px rgba(0,0,0,0.18)',
          fontFamily: "'Geist', system-ui, sans-serif",
          transition: dragging ? 'none' : 'box-shadow .2s',
        }}
      >
        {/* Title bar (drag handle) */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 select-none"
          style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none', background: 'linear-gradient(135deg, #FF7E01, #FF7E01)' }}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            dragRef.current = { dx: e.clientX - panelPos.x, dy: e.clientY - panelPos.y };
            setDragging(true);
          }}
          onPointerMove={(e) => {
            if (!dragRef.current) return;
            const w = panelRef.current?.offsetWidth ?? 340;
            const h = panelRef.current?.offsetHeight ?? 48;
            const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));
            setPanelPos({
              x: clamp(e.clientX - dragRef.current.dx, 8, window.innerWidth - w - 8),
              y: clamp(e.clientY - dragRef.current.dy, 8, window.innerHeight - h - 8),
            });
          }}
          onPointerUp={() => {
            dragRef.current = null;
            setDragging(false);
          }}
          onPointerCancel={() => {
            dragRef.current = null;
            setDragging(false);
          }}
        >
          <GripVertical className="w-4 h-4 flex-none" style={{ color: 'rgba(255,255,255,0.75)' }} />
          <span className="text-sm font-bold tracking-[-0.01em] truncate" style={{ color: '#ffffff' }}>Live ad preview</span>
          <div className="flex-1" />
          <button
            onClick={() => setDockMode('right')}
            aria-label="Dock to the right"
            title="Dock to the right"
            className="flex items-center justify-center w-7 h-7 transition-colors hover:!bg-white/20"
            style={{ color: '#ffffff' }}
          >
            <PanelRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPanelMin((m) => !m)}
            aria-label={panelMin ? 'Expand controls' : 'Minimise controls'}
            title={panelMin ? 'Expand' : 'Minimise'}
            className="flex items-center justify-center w-7 h-7 transition-colors hover:!bg-white/20"
            style={{ color: '#ffffff' }}
          >
            {panelMin ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </button>
          <button
            onClick={() => window.close()}
            aria-label="Close preview"
            title="Close preview"
            className="flex items-center justify-center w-7 h-7 transition-colors hover:!bg-white/20"
            style={{ color: '#ffffff' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!panelMin && (
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 110px)' }}>
            {controlsBody}
          </div>
        )}
      </div>
      )}

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">

        <section className="relative z-10 flex items-center justify-center w-full h-full">
          <div className="relative">
            {device.id === 'desktop' ? (
              (() => {
                // Calculate actual available space
                const headerHeight = 0; // the controls float, so no header space is reserved
                const padding = 48; // p-6 on main = 24px top + 24px bottom
                const availH = window.innerHeight - headerHeight - padding;
                const availW = window.innerWidth - dockOffset - 100;
                const frameW = Math.min(device.width * 1.1, availW);
                const minDesktopHeight =
                  size?.height
                    ? size.height + 120
                    : 720;

                const frameH = Math.max(
                  minDesktopHeight,
                  Math.min(device.height * 1.1, availH)
                );

                return (
                  <div
                    ref={desktopContainerRef}
                    className="bg-white rounded-xl shadow-[0_24px_70px_rgba(0,0,0,0.16)] border border-[#e4e0da] overflow-hidden relative"
                    style={{
                      width: `${frameW}px`,
                      height: `${frameH}px`,
                      transform: `scale(${desktopScale})`,
                      transformOrigin: 'top center',
                    }}
                  >
                    {/* Address bar */}
                    <div className="h-8 flex items-center px-4 gap-2 flex-shrink-0 border-b border-[#e4e0da]" style={{ backgroundColor: '#f5f4f1' }}>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#d9d7d2]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#d9d7d2]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#d9d7d2]"></div>
                      </div>
                      <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs flex items-center gap-2" style={{ color: '#666661' }}>
                        <Globe className="w-3 h-3" />
                        <span className="truncate">{siteUrl}</span>
                      </div>
                    </div>

                    {/* Content area — scrollable so tall ads don't get clipped */}
                    <div className="relative w-full overflow-hidden" style={{ height: 'calc(100% - 2rem)' }}>
                      {previewUrl && (
                        <iframe
                          ref={iframeRef}
                          src={previewUrl}
                          key={previewUrl}
                          className="border-0"
                          title="Ad Preview"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-modals"
                          allow="fullscreen; autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
                          allowFullScreen
                          onLoad={handleIframeLoad}
                          onError={handleIframeError}
                          style={{
                            display: 'block',
                            width: 'calc(100% + 24px)',
                            maxWidth: 'none',
                            opacity: iframeLoaded ? 1 : 0,
                            height: `${frameH - 32}px`,  // fill full content area height
                            minHeight: '100%',
                          }}
                        />
                      )}

                      {showFallback && (
                        <div className="absolute inset-0 overflow-hidden">
                          {renderFallbackContent()}
                        </div>
                      )}

                      {!iframeLoaded && !showFallback && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
                          <div className="text-center p-8 bg-white border border-[#e4e0da] max-w-md w-full mx-4" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
                            <div className="w-full h-1 bg-[#ecebe7] overflow-hidden mb-5">
                              <div className="h-1 transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: '#FF7E01' }}></div>
                            </div>
                            <p className="font-bold text-lg" style={{ color: '#0b0b0b' }}>Loading creative preview</p>
                            <p className="mt-1 text-sm" style={{ color: '#666661' }}>{Math.round(progress)}% complete</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <DeviceFrame
                device={device}
                siteUrl={siteUrl}
                orientation={orientation}
                size={size}

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
                          <div className="text-center p-6 bg-white border border-[#e4e0da] max-w-sm w-full mx-2" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
                            <div className="w-full h-1 bg-[#ecebe7] overflow-hidden mb-5">
                              <div className="h-1 transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: '#FF7E01' }}></div>
                            </div>
                            <p className="font-bold text-sm" style={{ color: '#0b0b0b' }}>Loading creative preview</p>
                            <p className="mt-1 text-xs" style={{ color: '#666661' }}>{Math.round(progress)}% complete</p>
                          </div>
                        </div>
                  )}
                </div>
              </DeviceFrame>
            )}
          </div>
        </section>
        {/* logs modal */}
        {/* <div className={`fixed top-0 right-0 bottom-0 z-50 transition-all duration-300 ease-in-out ${logsExpanded ? 'w-96' : 'w-12'
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

          <div className={`h-full bg-white border-l-4 border-[#FF6B2C] shadow-2xl transition-all duration-300 flex flex-col ${logsExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
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
        </div> */}
      </main>
    </div>
  );
};