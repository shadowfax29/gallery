import React, { useState, useMemo, useEffect } from 'react';
import { 
  AdFormat, AdSize, DeviceType, StayOnAdSize, SliderAdSize, IntAdSize 
} from '../types/AdFormat';
import { 
  adSizes, deviceTypes, stayOnAdSizes, sliderAdSizes, intAdSizes, 
  intAdTags, stayOnAdTags, sliderAdTags 
} from '../data/adFormats';
import { 
  X, Monitor, Smartphone, Tablet, ExternalLink, Globe, Code, RotateCw, Play
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
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
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
    if (format.id === 'interstitial') adTags = adTags.filter(t => ['320x480', '300x250', '300x600', '360x480'].includes(t.label));

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
    const previewUrl = `/dev/preview?${new URLSearchParams({ 
      format: format.id,
      size: `${selectedSize.width}x${selectedSize.height}`,
      device: selectedDevice.id,
      url: siteUrl || selectedExample.siteUrl,
      example: selectedExample.id,
      tag: tag,
      orientation: orientation
    }).toString()}`;

    window.open(previewUrl, '_blank');
  };

  const getDeviceIcon = (deviceId: string) => {
    switch (deviceId) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
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
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] shadow-2xl border border-[#FF6B2C] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-[#FF6B2C] to-[#FF8C42] rounded-full"></div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{format.name}</h2>
                  <p className="text-xs text-gray-500">{format.type} format</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Two Column Layout */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            
            {/* LEFT COLUMN */}
            <div className="space-y-5">
              
              {/* Website URL */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#FF6B2C]/50 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-[#FF6B2C]/10 rounded-md">
                    <Globe className="w-4 h-4 text-[#FF6B2C]" />
                  </div>
                  <label className="text-sm font-semibold text-gray-900">Website URL</label>
                </div>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6B2C]/20 focus:border-[#FF6B2C] text-gray-700 placeholder-gray-400 text-sm transition-all"
                  placeholder="Enter website URL"
                />
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-500 mb-2">Quick Select</label>
                  <div className="flex flex-wrap gap-2">
                    {popularSites.map((site) => (
                      <button
                        key={site.name}
                        onClick={() => setSiteUrl(site.url)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                          siteUrl === site.url
                            ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white border-[#FF6B2C] shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#FF6B2C] hover:bg-[#FF7E01]/5'
                        }`}
                      >
                        {site.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Device Type */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#FF6B2C]/50 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-[#FF6B2C]/10 rounded-md">
                    <Monitor className="w-4 h-4 text-[#FF6B2C]" />
                  </div>
                  <label className="text-sm font-semibold text-gray-900">Device Type</label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {deviceTypes.map(device => (
                    <button
                      key={device.id}
                      onClick={() => {
                        setSelectedDevice(device);
                        setOrientation('vertical'); // Reset orientation when device changes
                      }}
                      className={`p-3 text-center rounded-lg border transition-all ${
                        selectedDevice.id === device.id
                          ? 'bg-gradient-to-br from-[#FF6B2C] to-[#FF8C42] text-white border-[#FF6B2C] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#FF6B2C] hover:bg-[#FF7E01]/5'
                      }`}
                    >
                      <div className="flex justify-center mb-1.5">
                        {getDeviceIcon(device.id)}
                      </div>
                      <div className="font-medium text-xs">{device.name}</div>
                      <div className="text-xs opacity-70 mt-0.5">{device.width}×{device.height}</div>
                    </button>
                  ))}
                </div>

                {/* Orientation - Show only for mobile and tablet */}
                {(selectedDevice.id === 'mobile' || selectedDevice.id === 'tablet') && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-[#FF6B2C]/10 rounded-md">
                        <RotateCw className="w-4 h-4 text-[#FF6B2C]" />
                      </div>
                      <label className="text-sm font-semibold text-gray-900">Orientation</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setOrientation('vertical')}
                        className={`p-3 text-center rounded-lg border transition-all ${
                          orientation === 'vertical'
                            ? 'bg-gradient-to-br from-[#FF6B2C] to-[#FF8C42] text-white border-[#FF6B2C] shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#FF6B2C] hover:bg-[#FF7E01]/5'
                        }`}
                      >
                        <div className="flex justify-center mb-1.5">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div className="font-medium text-xs">Vertical</div>
                      </button>
                      <button
                        onClick={() => setOrientation('horizontal')}
                        className={`p-3 text-center rounded-lg border transition-all ${
                          orientation === 'horizontal'
                            ? 'bg-gradient-to-br from-[#FF6B2C] to-[#FF8C42] text-white border-[#FF6B2C] shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#FF6B2C] hover:bg-[#FF7E01]/5'
                        }`}
                      >
                        <div className="flex justify-center mb-1.5">
                          <RotateCw className="w-4 h-4" />
                        </div>
                        <div className="font-medium text-xs">Horizontal</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Ad Configuration (Display Only) */}
              {format.type === 'display' && (
                <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#FF6B2C]/50 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-[#FF6B2C]/10 rounded-md">
                      <Code className="w-4 h-4 text-[#FF6B2C]" />
                    </div>
                    <label className="text-sm font-semibold text-gray-900">Ad Configuration</label>
                  </div>

                  {/* Ad Sizes */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Ad Size</label>
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
                            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
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

                  {/* Ad Tag */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Ad Tag</label>
                    <textarea
                      rows={4}
                      value={adContent}
                      onChange={(e) => setAdContent(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6B2C]/20 focus:border-[#FF6B2C] text-gray-700 placeholder-gray-400 font-mono text-xs resize-none transition-all"
                      placeholder="Paste your ad tag here..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN - Preview Configuration */}
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-[#FF6B2C]/5 to-[#FF8C42]/5 rounded-lg p-5 border border-[#FF6B2C]/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-white rounded-md shadow-sm">
                    <Play className="w-4 h-4 text-[#FF6B2C]" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Preview Configuration</h3>
                </div>
                
                <div className="space-y-3">
                  {/* Format */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">Format</span>
                      <span className="text-sm font-semibold text-gray-900">{format.name}</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">Category</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-[#FF6B2C]/10 text-[#FF6B2C] border border-[#FF6B2C]/20">
                        {format.type}
                      </span>
                    </div>
                  </div>

                  {/* Device */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">Device</span>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(selectedDevice.id)}
                        <span className="text-sm font-semibold text-gray-900">{selectedDevice.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Orientation - Only show if mobile or tablet */}
                  {(selectedDevice.id === 'mobile' || selectedDevice.id === 'tablet') && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">Orientation</span>
                        <div className="flex items-center gap-2">
                          {orientation === 'vertical' ? <Smartphone className="w-4 h-4 text-[#FF6B2C]" /> : <RotateCw className="w-4 h-4 text-[#FF6B2C]" />}
                          <span className="text-sm font-semibold text-gray-900 capitalize">{orientation}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Size */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">Ad Size</span>
                      <span className="text-sm font-semibold text-[#FF6B2C]">{selectedSize.width}×{selectedSize.height}</span>
                    </div>
                  </div>

                  {/* Resolution */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">Viewport</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedDevice.width}×{selectedDevice.height}</span>
                    </div>
                  </div>

                  {/* URL Preview */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-gray-500">Target URL</span>
                      <p className="text-xs text-gray-700 truncate" title={siteUrl}>{siteUrl}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4 p-3 bg-white/50 rounded-lg border border-[#FF6B2C]/20">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {format.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 rounded-b-2xl bg-gray-50">
          <div className="flex justify-center">
            <button
              onClick={handlePreview}
              className="bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white font-semibold py-2.5 px-8 rounded-lg hover:shadow-lg hover:shadow-[#FF6B2C]/30 transition-all duration-300 transform hover:scale-[1.02] group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>

              <div className="relative flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                <span>Launch Preview</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};