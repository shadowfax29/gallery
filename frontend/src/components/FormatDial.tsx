import React, { useEffect, useRef, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

/**
 * Small-screen format picker: a bottom sheet with a semicircle dial.
 * Slide along the arc (or tap a dot) to bring a format to the top, then tap "Show this format".
 */

export type DialItem = { key: string; name: string; desc: string; flagship: boolean };

const STEP = 24; // degrees between two dots
const VISIBLE = 3; // dots shown on each side of the centred one

export const FormatDial: React.FC<{
  open: boolean;
  items: DialItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}> = ({ open, items, selectedKey, onSelect, onClose }) => {
  const n = items.length;
  const [pos, setPos] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [width, setWidth] = useState(340);
  const areaRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; pos: number } | null>(null);

  const clamp = (v: number) => Math.max(0, Math.min(n - 1, v));

  // Start on the format that is currently shown
  useEffect(() => {
    if (!open) return;
    const i = items.findIndex((it) => it.key === selectedKey);
    setPos(i < 0 ? 0 : i);
  }, [open, items, selectedKey]);

  useEffect(() => {
    if (!open) return;
    const el = areaRef.current;
    if (!el) return;
    const fit = () => setWidth(Math.min(el.clientWidth || 340, 440));
    fit();
    window.addEventListener('resize', fit);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setPos((p) => clamp(Math.round(p) + 1));
      if (e.key === 'ArrowLeft') setPos((p) => clamp(Math.round(p) - 1));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, n]);

  if (!open || n === 0) return null;

  const R = width / 2 - 30;
  const H = R + 66;
  const cx = width / 2;
  const cy = R + 32;
  const px = (R * STEP * Math.PI) / 180; // pixels of drag that move the dial by one dot
  const cur = items[Math.round(clamp(pos))];

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Choose an ad format">
      <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={onClose} />
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl px-5 pt-3 pb-6"
        style={{ boxShadow: '0 -16px 50px rgba(0,0,0,0.25)', fontFamily: "'Geist', system-ui, sans-serif", animation: 'dialUp .35s cubic-bezier(.22,1,.36,1)' }}
      >
        <style>{`@keyframes dialUp { from { transform: translateY(100%); } to { transform: none; } }`}</style>
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[#e4e0da]" />
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold" style={{ color: '#0b0b0b' }}>Choose an ad format</h3>
          <button onClick={onClose} aria-label="Close" className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: '#f5f4f1', color: '#0b0b0b' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs mt-0.5" style={{ color: '#8a8780' }}>Slide along the arc, then tap Show this format.</p>

        {/* the dial */}
        <div
          ref={areaRef}
          className="relative mx-auto mt-2 select-none"
          style={{ width: '100%', maxWidth: 440, height: H, touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, pos };
            setDragging(true);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            setPos(clamp(drag.current.pos - (e.clientX - drag.current.x) / px));
          }}
          onPointerUp={() => {
            drag.current = null;
            setDragging(false);
            setPos((p) => Math.round(clamp(p)));
          }}
          onPointerCancel={() => {
            drag.current = null;
            setDragging(false);
            setPos((p) => Math.round(clamp(p)));
          }}
        >
          <svg width={width} height={H} className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none" aria-hidden="true">
            <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="#e4e0da" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
            <path d={`M ${cx - R + 16} ${cy} A ${R - 16} ${R - 16} 0 0 1 ${cx + R - 16} ${cy}`} fill="none" stroke="#f1efea" strokeWidth="1" />
          </svg>

          <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ width, height: H }}>
            {items.map((it, i) => {
              const d = i - pos;
              if (Math.abs(d) > VISIBLE + 0.6) return null;
              const a = ((90 - d * STEP) * Math.PI) / 180;
              const x = cx + R * Math.cos(a);
              const y = cy - R * Math.sin(a);
              const on = Math.round(pos) === i;
              const size = on ? 52 : 38;
              return (
                <button
                  key={it.key}
                  aria-label={it.name}
                  aria-current={on}
                  onClick={() => setPos(i)}
                  className="absolute flex items-center justify-center rounded-full font-bold"
                  style={{
                    left: x - size / 2,
                    top: y - size / 2,
                    width: size,
                    height: size,
                    fontSize: on ? 16 : 13,
                    backgroundColor: on ? '#FF7E01' : '#ffffff',
                    color: on ? '#ffffff' : '#0b0b0b',
                    border: `1.5px solid ${on ? '#FF7E01' : '#d9d6cf'}`,
                    boxShadow: on ? '0 8px 20px rgba(255,126,1,0.4)' : '0 2px 6px rgba(0,0,0,0.08)',
                    opacity: Math.max(0, 1 - Math.max(0, Math.abs(d) - 1.5) / 1.6),
                    transition: dragging ? 'none' : 'all .3s cubic-bezier(.22,1,.36,1)',
                    padding: 0,
                  }}
                >
                  {i + 1}
                </button>
              );
            })}

            {/* the chosen format, in the hollow of the arc */}
            <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none" style={{ top: cy - R * 0.72, width: R * 1.1 }}>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[17px] font-bold leading-tight" style={{ color: '#0b0b0b' }}>{cur.name}</span>
              </div>
              {cur.flagship && (
                <span className="inline-block mt-1.5 text-[8px] font-bold tracking-[0.1em] px-1.5 py-0.5" style={{ backgroundColor: '#0b0b0b', color: '#ffffff' }}>
                  FLAGSHIP
                </span>
              )}
              <p className="mt-1.5 text-[11px] leading-snug line-clamp-3" style={{ color: '#666661' }}>{cur.desc}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            onSelect(cur.key);
            onClose();
          }}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 !py-3 text-sm font-semibold"
          style={{ backgroundColor: '#FF7E01', color: '#ffffff' }}
        >
          Show this format <ArrowRight className="w-4 h-4" color="#ffffff" />
        </button>
      </div>
    </div>
  );
};
