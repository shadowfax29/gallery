import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * A curved carousel of format mockups. The centred card is enlarged and plays its ad once;
 * when the ad has been shown, the next card slides into the centre.
 */

// ms = how long the scene takes to show its ad, plus a short hold
const ITEMS = [
  { id: 'interstitial', name: 'Interstitial Ads', ms: 6200 },
  { id: 'slider', name: 'Slider Ads', ms: 4600 },
  { id: 'stay-on', name: 'StayOn Ads', ms: 6200 },
  { id: 'remnant', name: 'Remnant Ads', ms: 4600 },
  { id: 'inread-player', name: 'InRead Player', ms: 4600 },
  { id: 'inread-floating', name: 'InRead + Floating Player', ms: 7200 },
  { id: 'ribbon-player', name: 'Ribbon Player', ms: 7200 },
  { id: 'hybrid-video', name: 'Hybrid Video', ms: 7200 },
];

// Wide screens: laptop + phone cards. Small screens: tall phone-only cards.
const WIDE = { w: 680, h: 380 };
const COMPACT = { w: 240, h: 470 };
const ARRIVE_MS = 650; // the slide takes about this long before the ad starts

export const FormatCarousel: React.FC = () => {
  const n = ITEMS.length;
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [scale, setScale] = useState(1);
  const [compact, setCompact] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<HTMLDivElement>(null);
  const frames = useRef<(HTMLIFrameElement | null)[]>([]);

  const reduced = useMemo(
    () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Fit the cards to the space we have, both width and height
  useEffect(() => {
    const el = arcRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || 450;
      const small = w < 640;
      const dims = small ? COMPACT : WIDE;
      setCompact(small);
      setScale(Math.max(0.3, Math.min(small ? 1.25 : 1, (w * (small ? 1.5 : 0.78)) / dims.w / (small ? 1.6 : 1), (h - 16) / (dims.h * 1.14 + 8))));
    };
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(el);
    window.addEventListener('resize', fit);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  // Play the centred card once it has arrived
  useEffect(() => {
    activeRef.current = active;
    const t = window.setTimeout(() => {
      frames.current[active]?.contentWindow?.postMessage({ type: 'tm-play' }, '*');
    }, ARRIVE_MS);
    return () => window.clearTimeout(t);
  }, [active]);

  // After the ad has been shown, bring in the next one
  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % n), ARRIVE_MS + ITEMS[active].ms);
    return () => window.clearTimeout(t);
  }, [active, reduced, n]);

  const CARD_W = compact ? COMPACT.w : WIDE.w;
  const CARD_H = compact ? COMPACT.h : WIDE.h;

  const delta = (i: number) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  return (
    <div
      ref={boxRef}
      className="w-full h-full flex flex-col"
      role="region"
      aria-roledescription="carousel"
      aria-label="Ad format examples"
    >
      <div ref={arcRef} className="relative mx-auto overflow-hidden w-full flex-1 min-h-0">
        {ITEMS.map((item, i) => {
          const d = delta(i);
          const ad = Math.abs(d);
          const isActive = d === 0;
          const x = d * CARD_W * (compact ? 0.72 : 0.78) * scale;
          const y = d * d * 34 * scale;
          const rot = d * 6;
          const sc = (isActive ? 1.14 : 1 - ad * 0.13) * scale;
          return (
            <div
              key={item.id}
              aria-hidden={!isActive}
              className="absolute bg-white border border-[#e4e0da] overflow-hidden"
              style={{
                width: CARD_W,
                height: CARD_H,
                left: '50%',
                top: 8,
                marginLeft: -CARD_W / 2,
                borderRadius: compact ? 28 : 14,
                transformOrigin: '50% 0',
                transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc})`,
                opacity: ad > 2 ? 0 : isActive ? 1 : 0.9 - ad * 0.22,
                zIndex: 10 - ad,
                boxShadow: isActive ? '0 30px 80px rgba(0,0,0,0.22)' : '0 12px 34px rgba(0,0,0,0.12)',
                transition: 'transform .7s cubic-bezier(.22,1,.36,1), opacity .7s ease, box-shadow .7s ease',
                pointerEvents: ad > 2 ? 'none' : 'auto',
              }}
            >
              <iframe
                ref={(el) => { frames.current[i] = el; }}
                src={`/format-design.html?format=${item.id}&card=1${compact ? '&only=phone' : ''}`}
                title={`${item.name} example`}
                tabIndex={-1}
                onLoad={() => { if (i === activeRef.current) frames.current[i]?.contentWindow?.postMessage({ type: 'tm-play' }, '*'); }}
                className="border-0 block"
                style={{ width: CARD_W, height: CARD_H, pointerEvents: 'none', background: '#fff' }}
              />
            </div>
          );
        })}
      </div>

      <div className="py-2 text-center text-sm font-bold flex-none" style={{ color: '#0b0b0b', fontFamily: "'Geist', system-ui, sans-serif" }} aria-live="polite">
        {ITEMS[active].name}
      </div>
    </div>
  );
};
