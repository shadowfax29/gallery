import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  AdFormat, AdSize, DeviceType, StayOnAdSize, SliderAdSize, IntAdSize
} from '../types/AdFormat';
import {
  adSizes, deviceTypes, stayOnAdSizes, sliderAdSizes, intAdSizes,
  intAdTags, stayOnAdTags, sliderAdTags, remnantAdTags
} from '../data/adFormats';
import {
  X, Monitor, Smartphone, Tablet, ArrowRight, Globe, Code, RotateCw
} from 'lucide-react';

interface PreviewModalProps {
  format: AdFormat;
  onClose: () => void;
  /** Skip the settings popup: open the live preview straight away with the defaults. The settings live in the preview page's floating panel. */
  autoLaunch?: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ format, onClose, autoLaunch }) => {
  const [siteUrl, setSiteUrl] = useState('https://dev.tapmind.io/new_demo/index.html');
  const [selectedSize, setSelectedSize] = useState<AdSize | StayOnAdSize | SliderAdSize | IntAdSize>(
    format.id === 'stay-on' ? stayOnAdSizes[0] : format.id === 'slider' ? sliderAdSizes[0] : format.id === 'interstitial' ? intAdSizes[0] : adSizes[0]
  );
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(
    format.id === 'ribbon-player' || (typeof window !== 'undefined' && window.innerWidth < 768)
      ? deviceTypes.find(d => d.id === 'mobile') || deviceTypes[0]
      : deviceTypes[0]
  );
  const [selectedExample, setSelectedExample] = useState(format.examples[0]);
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [tagScript, setTagScript] = useState('');
  const [adContent, setAdContent] = useState(format.id === 'inread-player' ? `
    <div id='tmsrv-9428'>
	<script async src='https://vsrv.tmadsrv.com/tmCore.js'></script>
		<script>
		window.tmsrv=window.tmsrv || {cmd: []};
		window.tmsrv.cmd.push(function(adObj) {
			adObj.AdSlot('tmsrv-9428');
			adObj.Meta('/tmsrvptr507/tmsrvplr2529/tmsrvadu9428/demo-inread-player-20feb2026-vid');
			adObj.CacheBuster('%%CACHEBUSTER%%');
			adObj.UserConsent('0');
			adObj.Domain('streamlyn.com');
			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
			adObj.ViewURL('%%VIEW_URL_UNESC%%');
			adObj.Execute();
		});
	</script>
</div>
        ` : format.id === 'inread-floating' ? `
       <div id='tmsrv-9429'>
	<script async src='https://vsrv.tmadsrv.com/tmCore.js'></script>
		<script>
		window.tmsrv=window.tmsrv || {cmd: []};
		window.tmsrv.cmd.push(function(adObj) {
			adObj.AdSlot('tmsrv-9429');
			adObj.Meta('/tmsrvptr507/tmsrvplr2529/tmsrvadu9429/demo-inread-floating-20feb2026-vid');
			adObj.CacheBuster('%%CACHEBUSTER%%');
			adObj.UserConsent('0');
			adObj.Domain('streamlyn.com');
			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
			adObj.ViewURL('%%VIEW_URL_UNESC%%');
			adObj.Execute();
		});
	</script>
</div>
    ` : format.id === 'ribbon-player' ? `<div id='tmsrv-9430'>
  <script async src='https://dev.tapmind.io/gallery/tmCore.js'></script>
    <script>
    window.tmsrv=window.tmsrv || {cmd: []};
    window.tmsrv.cmd.push(function(adObj) {
      adObj.AdSlot('tmsrv-9430');
      adObj.Meta('/tmsrvptr507/tmsrvplr2529/tmsrvadu9430/demo-inread-floating-onadribbon-20feb2026-vid');
      adObj.CacheBuster('%%CACHEBUSTER%%');
      adObj.UserConsent('0');
      adObj.Domain('streamlyn.com');
      adObj.ClickUrl('%%CLICK_URL_UNESC%%');
      adObj.ViewURL('%%VIEW_URL_UNESC%%');
      adObj.Execute();
    });
  </script>
</div>
        ` : format.id === 'sidebar' ? `<div id='tmsrv-9445'>
    <script src='https://srv-qa.tmadsrv.com/9445.js'></script>
    <script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
        <script>
        window.tmsrv=window.tmsrv || {cmd: []};
        window.tmsrv.cmd.push(function(adObj) {
            adObj.AdSlot('tmsrv-9445');
            adObj.Meta('/tmsrvptr507/tmsrvplr2656/tmsrvadu9445/Demo-STDB-300x250-1');
            adObj.CacheBuster('%%CACHEBUSTER%%');
            adObj.UserConsent('0');
            adObj.Domain('Demo-OCt');
            adObj.ClickUrl('%%CLICK_URL_UNESC%%');
            adObj.ViewURL('%%VIEW_URL_UNESC%%');
            adObj.Execute();
        });
    </script>
</div>` : format.id === 'hybrid-video' ? `
<div id='tmsrv-9428'>
	<script async src='https://vsrv.tmadsrv.com/tmCore.js'></script>
		<script>
		window.tmsrv=window.tmsrv || {cmd: []};
		window.tmsrv.cmd.push(function(adObj) {
			adObj.AdSlot('tmsrv-9428');
			adObj.Meta('/tmsrvptr507/tmsrvplr2529/tmsrvadu9428/demo-inread-player-20feb2026-vid');
			adObj.CacheBuster('%%CACHEBUSTER%%');
			adObj.UserConsent('0');
			adObj.Domain('streamlyn.com');
			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
			adObj.ViewURL('%%VIEW_URL_UNESC%%');
			adObj.Execute();
		});
	</script>
</div>
` : '');

  const filteredAdTags = useMemo(() => {
    let adTags: { label: string; tag: string }[] = [];
    if (format.id === 'stay-on') adTags = stayOnAdTags;
    if (format.id === 'slider') adTags = sliderAdTags;
    if (format.id === 'interstitial') adTags = intAdTags;
    if (format.id === 'remnant') adTags = remnantAdTags;

    if (format.id === 'stay-on') {
      if (selectedDevice.id === 'desktop') adTags = adTags.filter(t => ['728x90', '970x90', '300x250'].includes(t.label));
      if (selectedDevice.id === 'mobile') adTags = adTags.filter(t => ['320x50', '320x100', '300x250'].includes(t.label));
      if (selectedDevice.id === 'tablet') adTags = adTags.filter(t => ['320x50', '320x100', '300x250', '728x90'].includes(t.label));
    }
    if (format.id === 'slider') adTags = adTags.filter(t => ['300x250', '300x600'].includes(t.label));
    if (format.id === 'interstitial') adTags = adTags.filter(t => ['320x480', '300x250', '300x600', '360x480'].includes(t.label));
    if (format.id === 'remnant') {
      if (selectedDevice.id === 'desktop') adTags = adTags.filter(t => ['300x250', '728x90', '300x600'].includes(t.label));
      if (selectedDevice.id === 'mobile') adTags = adTags.filter(t => ['300x250', '320x50'].includes(t.label));
      if (selectedDevice.id === 'tablet') adTags = adTags.filter(t => ['300x250', '320x50'].includes(t.label));
    }

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
    const previewUrl = `/preview?${new URLSearchParams({
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

  // autoLaunch: wait a tick for the default size and ad tag to be picked, then open the preview and close
  const launched = useRef(false);
  useEffect(() => {
    if (!autoLaunch || launched.current) return;
    const ready = Boolean(adContent || tagScript);
    const timer = window.setTimeout(() => {
      if (launched.current) return;
      launched.current = true;
      handlePreview();
      onClose();
    }, ready ? 0 : 250);
    return () => window.clearTimeout(timer);
  }, [autoLaunch, adContent, tagScript, selectedSize]);

  const getDeviceIcon = (deviceId: string) => {
    switch (deviceId) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const popularSites = [
    { name: 'Default', url: 'https://dev.tapmind.io/new_demo/index.html' },
    // { name: 'CCN', url: 'https://www.ccn.com/' },
    // { name: 'Vox', url: 'https://www.vox.com/' },
    { name: 'CNET', url: 'https://www.cnet.com/' },
    { name: 'Lifehacker', url: 'https://lifehacker.com/' },
    // { name: 'The Verge', url: 'https://www.theverge.com/' },
    { name: 'Default 2', url: "https://dev.tapmind.io/new_demo/index-dark.html" },
    // { name: 'TickTick', url: 'https://www.ticktick.com/' },
  ];

  const [closing, setClosing] = useState(false);
  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 340);
  };

  if (autoLaunch) return null;

  const label = 'text-[11px] font-bold uppercase tracking-[0.16em]';
  const chip = (on: boolean): React.CSSProperties => ({
    backgroundColor: on ? '#0b0b0b' : 'rgba(255,255,255,0.14)',
    color: '#ffffff',
    border: `1px solid ${on ? '#0b0b0b' : 'rgba(255,255,255,0.45)'}`,
  });
  const tile = (on: boolean): React.CSSProperties => ({
    backgroundColor: on ? '#ffffff' : 'rgba(255,255,255,0.14)',
    color: on ? '#c2410c' : '#ffffff',
    border: `1px solid ${on ? '#ffffff' : 'rgba(255,255,255,0.45)'}`,
  });

  return (
    <div
      className={`pm-overlay fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-black/60 backdrop-blur-sm ${closing ? 'pm-out' : ''}`}
      onClick={requestClose}
      style={{ fontFamily: "'Geist', system-ui, sans-serif" }}
    >
      <style>{`
        .pm-overlay { animation: pmFade .35s ease both; }
        .pm-overlay.pm-out { animation: pmFadeOut .34s ease both; }
        .pm-panel { animation: pmRise .7s cubic-bezier(.22,1,.36,1) both; transform-origin: 50% 100%; }
        .pm-out .pm-panel { animation: pmDrop .34s cubic-bezier(.5,0,.75,0) both; }
        /* Wide screens: a true circle, cut off by the bottom edge of the screen */
        @media (min-width: 768px) {
          .pm-panel { --D: min(1240px, 130vw); --V: min(90vh, 780px); width: var(--D); height: var(--D); border-radius: 50%; margin-bottom: calc(var(--V) - var(--D)); flex: none; }
          .pm-inner { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: min(680px, 72%); height: var(--V); overflow-y: auto; padding: 104px 0 32px; scrollbar-width: none; }
          .pm-inner::-webkit-scrollbar { display: none; }
        }
        /* Phones: a full-width sheet with a shallow dome */
        @media (max-width: 767px) {
          .pm-panel { width: 100%; max-height: 94vh; overflow-y: auto; border-radius: 50% 50% 0 0 / 56px 56px 0 0; }
        }
        .pm-item { animation: pmUp .55s cubic-bezier(.22,1,.36,1) both; animation-delay: calc(.28s + var(--i, 0) * .07s); }
        @keyframes pmFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pmFadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes pmRise { from { transform: translateY(55%) scale(.92); } to { transform: none; } }
        @keyframes pmDrop { from { transform: none; } to { transform: translateY(55%) scale(.94); } }
        @keyframes pmUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .pm-overlay, .pm-panel, .pm-item { animation-duration: .001ms !important; animation-delay: 0ms !important; } }
      `}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${format.name} preview settings`}
        onClick={(e) => e.stopPropagation()}
        className="pm-panel relative text-white shadow-2xl"
        style={{ background: 'linear-gradient(180deg, #f26a1b 0%, #e8541a 100%)' }}
      >
        {/* Close */}
        <button
          onClick={requestClose}
          aria-label="Close"
          className="absolute z-20 top-8 left-1/2 -translate-x-1/2 flex items-center justify-center w-11 h-11 rounded-full transition-transform hover:scale-105"
          style={{ backgroundColor: '#f6ecdf', color: '#0b0b0b' }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pm-inner px-6 pt-24 pb-10 text-center">
          <h2 className="pm-item font-bold tracking-[-0.03em] leading-tight" style={{ ['--i' as string]: 1, color: '#ffffff', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
            {format.name}
          </h2>
          <p className="pm-item mt-1 text-sm capitalize" style={{ ['--i' as string]: 2, color: 'rgba(255,255,255,0.85)' }}>{format.type} format</p>

          <div className="pm-item mt-7 mx-auto max-w-[560px] text-left" style={{ ['--i' as string]: 3 } as React.CSSProperties}>
            {/* Website URL */}
            <div className={`${label} mb-2 flex items-center gap-2`} style={{ color: 'rgba(255,255,255,0.9)' }}>
              <Globe className="w-3.5 h-3.5" /> Website URL
            </div>
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="w-full h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/40"
              style={{ color: '#0b0b0b' }}
              placeholder="Enter website URL"
              aria-label="Website URL"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {popularSites.map((site) => (
                <button
                  key={site.name}
                  onClick={() => setSiteUrl(site.url)}
                  className="!px-3.5 !py-1.5 text-xs font-semibold rounded-full transition-colors"
                  style={chip(siteUrl === site.url)}
                >
                  {site.name}
                </button>
              ))}
            </div>

            {/* Device Type */}
            <div className={`${label} mt-7 mb-2 flex items-center gap-2`} style={{ color: 'rgba(255,255,255,0.9)' }}>
              <Monitor className="w-3.5 h-3.5" /> Device type
            </div>
            <div className="grid grid-cols-3 gap-2">
              {deviceTypes.map((device) => {
                if (format.id === 'ribbon-player' && device.id === 'desktop') return null;
                const on = selectedDevice.id === device.id;
                return (
                  <button
                    key={device.id}
                    onClick={() => {
                      setSelectedDevice(device);
                      setOrientation('vertical');
                    }}
                    className="!p-3 text-center transition-colors"
                    style={tile(on)}
                  >
                    <div className="flex justify-center mb-1.5">{getDeviceIcon(device.id)}</div>
                    <div className="text-xs font-semibold">{device.name}</div>
                    <div className="text-[11px] opacity-75 mt-0.5">{device.width}×{device.height}</div>
                  </button>
                );
              })}
            </div>

            {/* Orientation */}
            {(selectedDevice.id === 'mobile' || selectedDevice.id === 'tablet') && (
              <>
                <div className={`${label} mt-7 mb-2 flex items-center gap-2`} style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <RotateCw className="w-3.5 h-3.5" /> Orientation
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([['vertical', 'Vertical', Smartphone], ['horizontal', 'Horizontal', RotateCw]] as const).map(([key, name, Icon]) => (
                    <button
                      key={key}
                      onClick={() => setOrientation(key)}
                      className="!p-3 text-center transition-colors"
                      style={tile(orientation === key)}
                    >
                      <div className="flex justify-center mb-1.5"><Icon className="w-4 h-4" /></div>
                      <div className="text-xs font-semibold">{name}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Ad size (display formats) */}
            {format.type === 'display' && (
              <>
                <div className={`${label} mt-7 mb-2 flex items-center gap-2`} style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <Code className="w-3.5 h-3.5" /> Ad size
                </div>
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
                        className="!px-3.5 !py-1.5 text-xs font-semibold rounded-full transition-colors"
                        style={chip(isSelected)}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Launch */}
          <div className="pm-item mt-9 flex justify-center" style={{ ['--i' as string]: 5 } as React.CSSProperties}>
            <button
              onClick={handlePreview}
              className="inline-flex items-center gap-4 !pl-7 !pr-2 !py-2 rounded-full text-sm font-bold uppercase tracking-[0.1em] transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: '#0b0b0b', color: '#ffffff' }}
            >
              Launch preview
              <span className="flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: '#ffffff', color: '#0b0b0b' }}>
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
