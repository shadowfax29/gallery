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

  const filteredAdTags = useMemo(() => {
    let adTags: { label: string; tag: string }[] = [];
    if (format.id === 'stay-on') adTags = stayOnAdTags;
    if (format.id === 'slider') adTags = sliderAdTags;
    if (format.id === 'interstitial') adTags = intAdTags;

    if (format.id === 'stay-on') {
      if (selectedDevice.id === 'desktop') adTags = adTags.filter(t => ['728x90', '970x90', '300x250'].includes(t.label));
      if (selectedDevice.id === 'mobile') adTags = adTags.filter(t => ['300x250', '320x50', '320x100'].includes(t.label));
      if (selectedDevice.id === 'tablet') adTags = adTags.filter(t => ['300x250', '320x50', '320x100', '728x90'].includes(t.label));
    }
    if (format.id === 'slider') adTags = adTags.filter(t => ['300x250', '300x600'].includes(t.label));
    if (format.id === 'interstitial') adTags = adTags.filter(t => ['300x250', '320x480', '300x600', '360x480'].includes(t.label));

    return adTags.filter((item, idx, arr) => idx === arr.findIndex(t => t.label === item.label));
  }, [format.id, selectedDevice.id]);

  useEffect(() => {
    if (adContent) return;
    if (filteredAdTags.length > 0) {
      const firstTag = filteredAdTags[0];
      setTagScript(firstTag.tag);
      const [w, h] = firstTag.label.split('x').map(Number);
      setSelectedSize({ width: w, height: h } as AdSize);
    }
  }, [filteredAdTags, adContent]);

  const handlePreview = () => {
    const tag = adContent || tagScript;
    // FIXED: URLSearchParams already handles encoding, no need for encodeURIComponent
    const previewUrl = `/preview?${new URLSearchParams({
      format: format.id,
      size: `${selectedSize.width}x${selectedSize.height}`,
      device: selectedDevice.id,
      url: siteUrl || selectedExample.siteUrl,
      example: selectedExample.id,
      tag: tag
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
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] shadow-2xl border-2 border-[#010D23] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b-2 border-[#010D23] bg-gradient-to-r from-[#FE5F00] via-[#FF7E01] to-[#FE5200] flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Live Preview Setup</h2>
                <div className="flex items-center gap-2 text-sm">
                  <p className="text-white/90 font-medium">{format.name}</p>
                  <span className="text-white/70">•</span>
                  <p className="text-white/80">{format.description}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gradient-to-br from-orange-50/30 to-white">
          {/* Configuration Panel */}
          <div className="space-y-5">
            {/* Website URL */}
            <div className="bg-white rounded-2xl p-5 border-2 border-[#010D23] shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gradient-to-br from-[#FE5F00]/20 to-[#FF7E01]/20 rounded-lg border border-[#FE5F00]/30">
                  <Globe className="w-4 h-4 text-[#FE5F00]" />
                </div>
                <label className="text-base font-bold text-[#010D23]">Website URL</label>
              </div>
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-[#010D23] rounded-xl focus:ring-2 focus:ring-[#FE5F00]/40 focus:border-[#FE5F00] text-[#010D23] placeholder-gray-400 font-medium shadow-sm transition-all text-sm"
                placeholder="https://www.example.com"
              />
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-3">Quick select popular sites:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {popularSites.map(site => (
                    <button
                      key={site.name}
                      onClick={() => setSiteUrl(site.url)}
                      className={`
                        px-3 py-1.5 text-xs rounded-lg transition-all border-2 font-medium shadow-sm hover:shadow-md
                        ${siteUrl === site.url
                          ? 'bg-gradient-to-r from-[#FE5F00] to-[#FF7E01] text-white border-[#FE5F00] shadow-lg scale-105'
                          : 'bg-white hover:bg-orange-50 text-[#010D23] border-[#010D23]'
                        }
                      `}
                    >
                      {site.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Device Type */}
            <div className="bg-white rounded-2xl p-5 border-2 border-[#010D23] shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gradient-to-br from-[#FE5F00]/20 to-[#FF7E01]/20 rounded-lg border border-[#FE5F00]/30">
                  <Settings className="w-4 h-4 text-[#FE5F00]" />
                </div>
                <label className="text-base font-bold text-[#010D23]">Device Type</label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {deviceTypes.map(device => (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`
                      p-4 text-center rounded-xl border-2 transition-all duration-300 shadow-sm
                      ${selectedDevice.id === device.id
                        ? 'border-[#FE5F00] bg-gradient-to-br from-[#FE5F00] to-[#FF7E01] text-white shadow-lg scale-105'
                        : 'border-[#010D23] bg-white hover:bg-orange-50 text-[#010D23]'
                      }
                    `}
                  >
                    <div className="flex justify-center mb-2">
                      {getDeviceIcon(device.id)}
                    </div>
                    <div className="font-bold text-xs">{device.name}</div>
                    <div className="text-xs opacity-80">{device.width}×{device.height}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-5">
            {/* Ad Config */}
            {format.type === 'display' && (
              <div className="bg-white rounded-2xl p-5 border-2 border-[#010D23] shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-gradient-to-br from-[#FE5F00]/20 to-[#FF7E01]/20 rounded-lg border border-[#FE5F00]/30">
                    <Code className="w-4 h-4 text-[#FE5F00]" />
                  </div>
                  <label className="text-base font-bold text-[#010D23]">Ad Configuration</label>
                </div>

                {/* Quick size select */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 mb-3">Ad Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {filteredAdTags.map((item, idx) => {
                      const [w, h] = item.label.split('x').map(Number);
                      const isSelected = selectedSize.width === w && selectedSize.height === h;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setTagScript(item.tag);
                            setSelectedSize({ width: w, height: h } as AdSize);
                          }}
                          className={`
                            px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all shadow-sm
                            ${isSelected
                              ? 'border-[#FE5F00] bg-gradient-to-r from-[#FE5F00] to-[#FF7E01] text-white shadow-md'
                              : 'border-[#010D23] bg-white hover:bg-orange-50 text-[#010D23]'
                            }
                          `}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ad tag input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-3">Paste Your Ad Tag</label>
                  <textarea
                    rows={4}
                    value={adContent}
                    onChange={(e) => setAdContent(e.target.value)}
                    className="w-full px-3 py-3 bg-white border-2 border-[#010D23] rounded-xl focus:ring-2 focus:ring-[#FE5F00]/40 focus:border-[#FE5F00] text-[#010D23] placeholder-gray-400 font-mono text-xs shadow-sm transition-all resize-none"
                    placeholder="Paste Ad tag here..."
                  />
                </div>
              </div>
            )}

            {/* Preview Configuration */}
            <div className="bg-white rounded-2xl p-5 border-2 border-[#010D23] shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gradient-to-br from-[#FE5F00]/20 to-[#FF7E01]/20 rounded-lg border border-[#FE5F00]/30">
                  <Zap className="w-4 h-4 text-[#FE5F00]" />
                </div>
                <h3 className="text-base font-bold text-[#010D23]">Preview Configuration</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-orange-50 to-white border-2 border-[#010D23] rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-gray-600">Format:</span>
                  <span className="text-xs font-bold text-[#FE5F00]">{format.name}</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-orange-50 to-white border-2 border-[#010D23] rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-gray-600">Type:</span>
                  <span className="text-xs font-bold text-[#FE5F00]">{format.type}</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-orange-50 to-white border-2 border-[#010D23] rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-gray-600">Size:</span>
                  <span className="text-xs font-bold text-[#FE5F00]">{selectedSize.width}×{selectedSize.height}</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-orange-50 to-white border-2 border-[#010D23] rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-gray-600">Device:</span>
                  <span className="text-xs font-bold text-[#FE5F00]">{selectedDevice.name}</span>
                </div>

                <div className="p-3 bg-gradient-to-r from-orange-50 to-white border-2 border-[#010D23] rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-gray-600 block mb-2">Target URL:</span>
                  <div className="text-xs font-mono text-[#010D23] break-all bg-white p-2 rounded-lg border-2 border-[#010D23]">
                    {siteUrl || 'No URL specified'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Preview Button */}
        <div className="p-5 border-t-2 border-[#010D23] bg-gradient-to-r from-orange-50 to-white flex-shrink-0 rounded-b-2xl">
          {/* Container to center the button */}
          <div className="flex justify-center items-center">
            <button
              onClick={handlePreview}
              className="
                w-full max-w-2xl bg-gradient-to-r from-[#FF9A3D] via-[#FF7A1A] to-[#FE6A00]
                text-white font-bold py-3 px-4 rounded-xl
                hover:shadow-lg transition-all duration-300
                transform hover:scale-[1.02] group/btn relative overflow-hidden
                border border-[#010D23]
              "
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>

              <div className="relative flex items-center justify-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Play className="w-6 h-6 text-white" />
                </div>

                <div className="text-left">
                  <span className="block text-lg leading-tight font-extrabold">Launch Live Preview</span>
                  <p className="text-xs text-white/90 font-medium">Opens in a new window</p>
                </div>

                <ExternalLink className="w-6 h-6 text-white" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};