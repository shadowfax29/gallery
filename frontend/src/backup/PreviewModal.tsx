import React, { useState, useMemo, useEffect } from 'react';
import { 
  AdFormat, AdSize, DeviceType, StayOnAdSize, SliderAdSize, IntAdSize 
} from '../types/AdFormat';
import { 
  adSizes, deviceTypes, stayOnAdSizes, sliderAdSizes, intAdSizes, 
  intAdTags, stayOnAdTags, sliderAdTags 
} from '../data/adFormats';
import { 
  X, Monitor, Smartphone, Tablet, ExternalLink, Globe, Zap, Code, Settings, Sparkles, Play 
} from 'lucide-react';

interface PreviewModalProps {
  format: AdFormat;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ format, onClose }) => {
  const [siteUrl, setSiteUrl] = useState('https://dev.tapmind.io/new_demo/index.html');
  const [selectedSize, setSelectedSize] = useState<AdSize | StayOnAdSize | SliderAdSize | IntAdSize>(
    format.id === 'stay-on' ? stayOnAdSizes[0] : format.id === 'slider' ? sliderAdSizes[0] : format.id === 'interstitial' ? intAdSizes[0] : adSizes[0]
  );
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(deviceTypes[0]);
  const [selectedExample, setSelectedExample] = useState(format.examples[0]);
  const [tagScript, setTagScript] = useState('');
  const [adContent, setAdContent] = useState(format.id === 'inread-player' ? `
  <!-- BEGIN :: Publisher product test pag-inread-04aug25-->
  <div id='bsrv-8475'>
          <script async src='https://play.bidsxchange.com/AdCode.js'></script>
                  <script>
                  window.bsrvtag_video=window.bsrvtag_video || {cmd: []};
                  window.bsrvtag_video.cmd.push(function(adObj) {
                          adObj.AdSlot('bsrv-8475');
                          adObj.Meta('/bsrvptr507/bsrvplr2216/bsrvadu8475/Publisher product test pag-inread-04aug25');
                          adObj.CacheBuster('%%CACHEBUSTER%%');
                          adObj.UserConsent('0');
                          adObj.Domain('test12.com');
                          adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                          adObj.ViewURL('%%VIEW_URL_UNESC%%');
                          adObj.Execute();
                  });
          </script>
  </div>
  <!-- END :: Publisher product test pag-inread-04aug25-->
      ` : format.id === 'inread-floating' ? `
      <!-- BEGIN :: Publisher product test pag-inread+floater-04aug25-->
  <div id='bsrv-8476'>
          <script async src='https://play.bidsxchange.com/AdCode.js'></script>
                  <script>
                  window.bsrvtag_video=window.bsrvtag_video || {cmd: []};
                  window.bsrvtag_video.cmd.push(function(adObj) {
                          adObj.AdSlot('bsrv-8476');
                          adObj.Meta('/bsrvptr507/bsrvplr2216/bsrvadu8476/Publisher product test pag-inread+floater-04aug25');
                          adObj.CacheBuster('%%CACHEBUSTER%%');
                          adObj.UserConsent('0');
                          adObj.Domain('test12.com');
                          adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                          adObj.ViewURL('%%VIEW_URL_UNESC%%');
                          adObj.Execute();
                  });
          </script>
  </div>
  <!-- END :: Publisher product test pag-inread+floater-04aug25-->
      ` : format.id === 'sidebar' ? `
     <!-- BEGIN :: Publisher product test pag-sidebar-04aug25-->
  <div id='bsrv-8477'>
          <script async src='https://play.bidsxchange.com/AdCode.js'></script>
                  <script>
                  window.bsrvtag_video=window.bsrvtag_video || {cmd: []};
                  window.bsrvtag_video.cmd.push(function(adObj) {
                          adObj.AdSlot('bsrv-8477');
                          adObj.Meta('/bsrvptr507/bsrvplr2216/bsrvadu8477/Publisher product test pag-sidebar-04aug25');
                          adObj.CacheBuster('%%CACHEBUSTER%%');
                          adObj.UserConsent('0');
                          adObj.Domain('test12.com');
                          adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                          adObj.ViewURL('%%VIEW_URL_UNESC%%');
                          adObj.Execute();
                  });
          </script>
  </div>
  <!-- END :: Publisher product test pag-sidebar-04aug25-->
      ` : '');

  // Filter ad tags based on format and device
  const filteredAdTags = useMemo(() => {
    let adTags: { label: string; tag: string }[] = [];
    if (format.id === 'stay-on') adTags = stayOnAdTags;
    if (format.id === 'slider') adTags = sliderAdTags;
    if (format.id === 'interstitial') adTags = intAdTags;

    if (format.id === 'stay-on') {
      if (selectedDevice.id === 'desktop') adTags = adTags.filter(t => ['728x90', '970x90', '300x250'].includes(t.label));
      if (selectedDevice.id === 'mobile') adTags = adTags.filter(t => ['300x250', '320x50', '320x100'].includes(t.label));
      if (selectedDevice.id === 'tablet') adTags = adTags.filter(t => ['300x250', '320x50', '320x100', '728x90'].includes(t.label));
    } else if (format.id === 'slider') {
      adTags = adTags.filter(t => ['300x250', '300x600'].includes(t.label));
    } else if (format.id === 'interstitial') {
      adTags = adTags.filter(t => ['300x250', '320x480', '300x600', '360x480'].includes(t.label));
    }

    // Deduplicate by label
    return adTags.filter((item, idx, arr) => idx === arr.findIndex(t => t.label === item.label));
  }, [format.id, selectedDevice.id]);

  // Auto-update tagScript & selectedSize when device changes, preserving user input
  useEffect(() => {
    if (adContent) return; // preserve user-entered tag
    if (filteredAdTags.length > 0) {
      const firstTag = filteredAdTags[0];
      setTagScript(firstTag.tag);
      const [w, h] = firstTag.label.split('x').map(Number);
      setSelectedSize({ width: w, height: h } as AdSize);
    }
  }, [filteredAdTags, adContent]);

  const handlePreview = () => {
    const tag = adContent || tagScript;
    const previewUrl = `/preview?${new URLSearchParams({
      format: format.id,
      size: `${selectedSize.width}x${selectedSize.height}`,
      device: selectedDevice.id,
      url: encodeURIComponent(siteUrl || selectedExample.siteUrl),
      example: selectedExample.id,
      tag: encodeURIComponent(tag)
    }).toString()}`;

    window.open(previewUrl, '_blank');
  };

  const getDeviceIcon = (deviceId: string) => {
    switch (deviceId) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const popularSites = [
    { name: 'Default', url: 'https://dev.tapmind.io/new_demo/index.html' },
    { name: 'CCN', url: 'https://www.ccn.com/' },
    { name: 'Vox', url: 'https://www.vox.com/' },
    { name: 'CNET', url: 'https://www.cnet.com/' },
    { name: 'Lifehacker', url: 'https://lifehacker.com/' },
    { name: 'TickTick', url: 'https://www.ticktick.com/' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-xl shadow-lg">
                <Sparkles className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Live Preview Setup</h2>
                <div className="flex items-center gap-2 text-sm">
                  <p className="text-slate-600 font-medium">{format.name}</p>
                  <span className="text-slate-400">•</span>
                  <p className="text-slate-500">{format.description}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-5">
            {/* Website URL */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <Globe className="w-4 h-4 text-green-600" />
                </div>
                <label className="text-base font-bold text-slate-800">Website URL</label>
              </div>
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder-slate-400 font-medium shadow-sm transition-all text-sm"
                placeholder="https://www.example.com"
              />
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-600 mb-3">Quick select popular sites:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {popularSites.map(site => (
                    <button
                      key={site.name}
                      onClick={() => setSiteUrl(site.url)}
                      className="px-3 py-1.5 text-xs bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 hover:border-blue-200 font-medium"
                    >
                      {site.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Device Type */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Settings className="w-4 h-4 text-purple-600" />
                </div>
                <label className="text-base font-bold text-slate-800">Device Type</label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {deviceTypes.map(device => (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`p-4 text-center rounded-xl border-2 transition-all duration-300 ${selectedDevice.id === device.id ? 'border-blue-500 bg-blue-50 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-sm'}`}
                  >
                    <div className={`flex justify-center mb-2 ${selectedDevice.id === device.id ? 'text-blue-600' : 'text-slate-500'}`}>{getDeviceIcon(device.id)}</div>
                    <div className={`font-bold text-xs mb-1 ${selectedDevice.id === device.id ? 'text-blue-800' : 'text-slate-700'}`}>{device.name}</div>
                    <div className={`text-xs ${selectedDevice.id === device.id ? 'text-blue-600' : 'text-slate-500'}`}>{device.width}×{device.height}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-5">
            {format.type === 'display' && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                {/* Ad Configuration Section */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <Code className="w-4 h-4 text-orange-600" />
                  </div>
                  <label className="text-base font-bold text-slate-800">Ad Configuration</label>
                </div>

                {/* Quick Select Ad Tags */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-3">Quick Select Ad Tags by Size</label>
                  <div className="flex flex-wrap gap-2">
                    {filteredAdTags.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTagScript(item.tag);
                          const [w, h] = item.label.split('x').map(Number);
                          setSelectedSize({ width: w, height: h } as AdSize);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all duration-300 ${
                          tagScript === item.tag
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ad Tag Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-3">Place Your Ad Tag Here</label>
                  <textarea
                    rows={4}
                    value={adContent}
                    onChange={(e) => setAdContent(e.target.value)}
                    className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder-slate-400 font-mono text-xs shadow-sm transition-all resize-none"
                    placeholder="Paste your Ad Tag script here..."
                  />
                </div>
              </div>
            )}

            {/* Preview Configuration Section */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <Zap className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Preview Configuration</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 px-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-600">Format:</span>
                  <span className="text-xs font-bold text-slate-800">{format.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-600">Type:</span>
                  <span className="text-xs font-bold text-slate-800 capitalize">{format.type}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-600">Size:</span>
                  <span className="text-xs font-bold text-slate-800">{selectedSize.width}×{selectedSize.height}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-600">Device:</span>
                  <span className="text-xs font-bold text-slate-800">{selectedDevice.name}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-600 block mb-2">Target URL:</span>
                  <div className="text-xs font-mono text-slate-700 break-all bg-slate-50 p-2 rounded-lg border border-slate-200">
                    {siteUrl || 'No URL specified'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex-shrink-0 rounded-b-2xl">
          <button
            onClick={handlePreview}
            className="w-[50%] mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3 relative overflow-hidden text-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-lg hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block text-lg leading-tight">Launch Live Preview</span>
                <p className="text-sm text-blue-100 font-medium">Opens in new window</p>
              </div>
              <ExternalLink className="w-6 h-6 transition-transform duration-300" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
