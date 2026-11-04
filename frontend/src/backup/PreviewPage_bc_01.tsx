import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DeviceFrame } from './DeviceFrame';
import { AdPreview } from './AdPreview';
import { adFormats, adSizes, deviceTypes } from '../data/adFormats';
import { AdFormat, AdSize, DeviceType } from '../types/AdFormat';
import { X, RefreshCw, ExternalLink, AlertTriangle, Monitor } from 'lucide-react';
import {onCLS, onLCP, onINP, onFCP, onTTFB,} from 'web-vitals/attribution';

export const PreviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [format, setFormat] = useState<AdFormat | null>(null);
  const [size, setSize] = useState<AdSize | null>(null);
  const [device, setDevice] = useState<DeviceType | null>(null);
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [tagScript, setTagScript] = useState<string>('');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadTime, setLoadTime] = useState(Date.now());

  //Logs state
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<HTMLPreElement>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  //Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const formatId = searchParams.get('format');
    const sizeParam = searchParams.get('size');
    const deviceId = searchParams.get('device');
    const url = searchParams.get('url');
    setTagScript(decodeURIComponent(searchParams.get('tag') || ''));
    const encodedAdTag = encodeURIComponent(searchParams.get('tag') || '');
    const urlParam = decodeURIComponent(searchParams.get('url') || '');
    setPreviewUrl(`http://localhost:5042/preview?url=${urlParam}&adTag=${encodedAdTag}`);
    console.log('Preview URL:', previewUrl,urlParam,encodedAdTag);

    if (formatId) {
      const foundFormat = adFormats.find(f => f.id === formatId);
      setFormat(foundFormat || null);
    }
    if (sizeParam) {
      const [width, height] = sizeParam.split('x').map(Number);
      const foundSize = adSizes.find(s => s.width === width && s.height === height);
      setSize(foundSize || null);
    }
    if (deviceId) {
      const foundDevice = deviceTypes.find(d => d.id === deviceId);
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
    addLog(`[INFO] Refreshing iframe...`);
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleIframeLoad = () => {
    setIframeError(false);
    setIframeLoaded(true);

    const pageLoadTime = Date.now() - loadTime;
    addLog(`[INFO] Iframe loaded successfully`);
    addLog(`[INFO] Page Load Time: ${pageLoadTime} ms`);

    //Core Web Vitals (measured on host page)
    onLCP(metric => addLog(`LCP: ${metric.value.toFixed(2)} ms`));
    onCLS(metric => addLog(`CLS: ${metric.value.toFixed(3)}`));
    onINP(metric => addLog(`INP: ${metric.value.toFixed(2)} ms`));
    onFCP(metric => addLog(`First Contentful Paint: ${metric.value.toFixed(2)} ms`));
    onTTFB(metric => addLog(`Time To First Byte: ${metric.value.toFixed(2)} ms`)); 

    // Paint & Navigation timings
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry: any) => {
        if (entry.name === 'first-paint') {
          addLog(`First Paint: ${entry.startTime.toFixed(2)} ms`);
        }
      });

      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 shadow-xl border-b border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold text-white">Live Ad Preview</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded font-medium">
                {format.name}
              </span>
              <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded font-medium">
                {size.width}×{size.height}
              </span>
              <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded font-medium">
                {device.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 border border-gray-600 text-sm">
              <ExternalLink className="w-3 h-3" /> Open Site
            </a>
            <button onClick={() => window.close()} className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
              <X className="w-3 h-3" /> Close
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-row py-4">
        {/* Main Preview Area (80%) */}
        <div className="flex-[0.8] flex justify-center items-center pr-4">
          <div className="w-full h-full relative bg-white rounded-lg overflow-hidden shadow-2xl border border-gray-700">
            {!showFallback ? (
              <iframe
                id="preview-iframe" 
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-none overflow-hidden"
                style={{ overflow: "hidden", scrollbarWidth: "none" }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title="Website Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-700">Fallback Content</div>
            )}

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
        </div>

        {/* Sidebar (20%) */}
        <div className="flex-[0.2] bg-gray-900 text-green-400 rounded-lg p-3 shadow-inner font-mono text-sm overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-2">
            {/* <h2 className="text-gray-300 font-bold text-xs uppercase tracking-wider">Logs</h2> */}
            <div className="flex gap-2">
              {/* Copy Logs */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(logs.join("\n"));
                  addLog("[INFO] Logs copied to clipboard");
                }}
                className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                Copy
              </button>

              {/* Download Logs */}
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
                className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                Download
              </button>
            </div>
            <h2 className="text-gray-300 font-bold text-xs uppercase tracking-wider" style={{ color: "#959595" }}>Logs</h2> 
          </div>

          {/* Logs content */}
          <pre ref={logRef} className="whitespace-pre-wrap leading-relaxed max-h-full overflow-y-auto">
            {logs.join("\n")}
          </pre>
        </div>

      </div>
    </div>
  );
};
