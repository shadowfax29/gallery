import React, { useState } from 'react';
import { AdFormat, AdSize, DeviceType, PreviewSettings, StayOnAdSize, SliderAdSize, IntAdSize, } from '../types/AdFormat';
import { adSizes, deviceTypes, stayOnAdSizes, sliderAdSizes, intAdSizes, intAdTags, stayOnAdTags, sliderAdTags } from '../data/adFormats';
import { X, Monitor, Smartphone, Tablet, ExternalLink, Globe, Zap, Code } from 'lucide-react';

interface PreviewModalProps {
  format: AdFormat;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ format, onClose }) => {
  //const [siteUrl, setSiteUrl] = useState('https://preview.colorlib.com/theme/aznews/latest_news.html');
  const [siteUrl, setSiteUrl] = useState('https://dev.streamlyn.com/new_demo/HIS/index.html');
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

  const handlePreview = () => {
    // const previewSettings: PreviewSettings = {
    //   adFormat: format,
    //   adSize: selectedSize,
    //   deviceType: selectedDevice,
    //   siteUrl: siteUrl || selectedExample.siteUrl,
    //   tagScript: tagScript || adContent
    // };

    // Create preview URL with parameters
    let tagScriptTag = tagScript || adContent;
    const previewUrl = `/preview?${new URLSearchParams({
      format: format.id,
      size: `${selectedSize.width}x${selectedSize.height}`,
      device: selectedDevice.id,
      url: encodeURIComponent(siteUrl || selectedExample.siteUrl),
      example: selectedExample.id,
      tag: encodeURIComponent(tagScriptTag)
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
    { name: 'US News', url: 'https://www.usnews.com/' },
    { name: 'CBS News', url: 'https://www.cbsnews.com/' },
    { name: 'Sky News', url: 'https://news.sky.com/' },
    { name: 'CCN', url: 'https://www.ccn.com/' },
    { name: 'TickTick', url: 'https://www.ticktick.com/' },
    { name: 'The Verge', url: 'https://www.theverge.com/' },
    { name: 'Wired', url: 'https://www.wired.com/' },
    { name: 'The Guardian', url: 'https://www.theguardian.com/' },
    { name: 'The New York Times', url: 'https://www.nytimes.com/' },
    { name: 'The Washington Post', url: 'https://www.washingtonpost.com/' },
    { name: 'The Independent', url: 'https://www.independent.co.uk/' },
    { name: 'Bloomberg', url: 'https://www.bloomberg.com/' },
    { name: 'Financial Times', url: 'https://www.ft.com/' },
    { name: 'The Economist', url: 'https://www.economist.com/' },
    { name: 'Business Insider', url: 'https://www.businessinsider.com/' },
    { name: 'HuffPost', url: 'https://www.huffpost.com/' },
    { name: 'Vice', url: 'https://www.vice.com/' },
    { name: 'Mashable', url: 'https://mashable.com/' },
    { name: 'Gizmodo', url: 'https://gizmodo.com/' },
    { name: 'Ars Technica', url: 'https://arstechnica.com/' },
    { name: 'CNET', url: 'https://www.cnet.com/' },
    { name: 'ZDNet', url: 'https://www.zdnet.com/' },
    { name: 'PCMag', url: 'https://www.pcmag.com/' },
    { name: 'Tom’s Hardware', url: 'https://www.tomshardware.com/' },
    { name: 'Lifehacker', url: 'https://lifehacker.com/' },
    { name: 'Vox', url: 'https://www.vox.com/' },
    { name: 'Quartz', url: 'https://qz.com/' },
    { name: 'Axios', url: 'https://www.axios.com/' },
    { name: 'Politico', url: 'https://www.politico.com/' },
    { name: 'NPR', url: 'https://www.npr.org/' },
    { name: 'NPR News', url: 'https://www.npr.org/sections/news/' },
    { name: 'NPR Politics', url: 'https://www.npr.org/sections/politics/' },
    { name: 'NPR World', url: 'https://www.npr.org/sections/world/' },
    { name: 'NPR Arts & Life', url: 'https://www.npr.org/sections/arts/' },
    { name: 'NPR Music', url: 'https://www.npr.org/sections/music/' },
    { name: 'NPR Science', url: 'https://www.npr.org/sections/science/' },
    { name: 'NPR Technology', url: 'https://www.npr.org/sections/technology/' },
    { name: 'NPR Health', url: 'https://www.npr.org/sections/health/' },
    { name: 'NPR Business', url: 'https://www.npr.org/sections/business/' },
    { name: 'NPR Education', url: 'https://www.npr.org/sections/education/' },
    { name: 'BSRV', url: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html' },
    { name: 'Meranda', url: 'https://preview.colorlib.com/theme/meranda/blog-single.html' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Live Preview Setup</h2>
                <p className="text-gray-400">{format.name} - {format.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Website URL
                </label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="https://www.example.com"
                />
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Quick select popular sites:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularSites.map((site) => (
                      <button
                        key={site.name}
                        onClick={() => setSiteUrl(site.url)}
                        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-md transition-colors border border-gray-600"
                      >
                        {site.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Device Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {deviceTypes.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => setSelectedDevice(device)}
                      className={`p-4 text-center rounded-lg border-2 transition-all ${selectedDevice.id === device.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                        }`}
                    >
                      <div className="flex justify-center mb-2 text-gray-300">
                        {getDeviceIcon(device.id)}
                      </div>
                      <div className="font-medium text-sm text-white">{device.name}</div>
                      <div className="text-xs text-gray-400">{device.width}×{device.height}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="space-y-6">
              {format.type === 'display' &&
                <div>
                  <div className="mt-3 mb-3">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Quick Select Ad Tags here based on Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {format.id === 'stay-on' ? (
                        stayOnAdTags
                          .filter((item) => {
                            if (selectedDevice.id === "desktop") {
                              return item.label === "728x90" || item.label === "970x90";
                            }
                            if (selectedDevice.id === "mobile") {
                              return ["300x250", "320x50", "320x100"].includes(item.label);
                            }
                            if (selectedDevice.id === "tablet") {
                              return ["300x250", "320x50", "320x100", "728x90"].includes(item.label);
                            }
                            return true;
                          })
                          .map((item) => (
                            <button
                              key={item.label}
                              onClick={() => setTagScript(item.tag)}
                              className={`px-3 text-gray-500 py-1 text-center hover:text-white hover:border-white rounded-lg border-2 transition-all ${
                                tagScript === item.tag
                                  ? "border-blue-500 bg-blue-500/20 text-white"
                                  : "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))
                      ) : format.id === 'slider' ? (
                        sliderAdTags.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => setTagScript(item.tag)}
                               className={`px-3 text-gray-500 py-1 text-center hover:text-white hover:border-white rounded-lg border-2 transition-all ${tagScript === item.tag
                              ? 'border-blue-500 bg-blue-500/20 text-white'
                              : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                              }`}
                          >
                            {item.label}
                          </button>
                        ))
                      ) : (
                        intAdTags.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => setTagScript(item.tag)}
                           className={`px-3 text-gray-500 py-1 text-center hover:text-white hover:border-white rounded-lg border-2 transition-all ${tagScript === item.tag
                              ? 'border-blue-500 bg-blue-500/20 text-white'
                              : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                              }`}
                          >
                            {item.label}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    <Code className="w-4 h-4 inline mr-2" />
                    Place Your Ad Tag here
                  </label>
                  <textarea
                    rows={5}
                    value={adContent}
                    onChange={(e) => setAdContent(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    placeholder="Paste here your Ad Tag script"
                  />
                </div>
              }
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Preview Configuration</h3>
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-3 border border-gray-600">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Format:</span>
                    <span className="text-sm font-medium text-white">{format.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Type:</span>
                    <span className="text-sm font-medium text-white capitalize">{format.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Size:</span>
                    <span className="text-sm font-medium text-white">{selectedSize.width}×{selectedSize.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Device:</span>
                    <span className="text-sm font-medium text-white">{selectedDevice.name}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-600">
                    <span className="text-sm text-gray-400">URL:</span>
                    <div className="text-sm font-medium text-white break-all mt-1 bg-gray-800 p-2 rounded">
                      {siteUrl || 'No URL specified'}
                    </div>
                  </div>
                </div>
              </div>

              {/* <div>
                <h3 className="text-lg font-semibold text-white mb-4">Example Sites</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {format.examples.map((example) => (
                    <button
                      key={example.id}
                      onClick={() => {
                        setSelectedExample(example);
                        setSiteUrl(example.siteUrl);
                      }}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${selectedExample.id === example.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={example.previewImage}
                          alt={example.title}
                          className="w-12 h-12 object-cover rounded border border-gray-600"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-white">{example.title}</div>
                          <div className="text-xs text-gray-400 mt-1">{example.description}</div>
                          <div className="text-xs text-blue-400 mt-1 font-mono">{example.siteUrl}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div> */}

              <button
                onClick={handlePreview}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-4 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3 shadow-lg" style={{ background: "#c5c5f5", paddingTop: "12px" }}
              >
                <ExternalLink className="w-5 h-5" />
                Launch Live Preview
                <span className="text-xs bg-white/20 px-2 py-1 rounded">New Window</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};