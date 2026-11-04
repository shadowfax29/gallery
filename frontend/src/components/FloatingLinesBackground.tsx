import React, { useEffect, useRef } from "react";

interface FloatingLinesBackgroundProps {
  colorA?: string;
  colorB?: string;
  density?: number;          // ribbons count
  linesPerRibbon?: number;  // parallel lines per ribbon
  speed?: number;
  className?: string;
}

/**
 * FloatingLinesBackground (orange-only version)
 * - ReactBits style luminous ribbon waves
 * - Mouse interaction bends & brightens locally
 * - Canvas is non-interactive (won't block UI)
 */
const FloatingLinesBackground: React.FC<FloatingLinesBackgroundProps> = ({
  colorA = "rgba(255,120,60,0.95)",   // neon orange
  colorB = "rgba(255,190,110,0.95)",  // warm amber
  density = 2,
  linesPerRibbon = 9,
  speed = 0.9,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const onLeave = () => (mouseRef.current.active = false);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);

    const ribbons = Array.from({ length: density }).map((_, i) => ({
      baseY: 0.3 + i * (0.4 / Math.max(1, density - 1)),
      amp: 0.12 + Math.random() * 0.06,
      freq: 1.0 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      drift: 0.04 + Math.random() * 0.03,
      tilt: (Math.random() - 0.5) * 0.12,
    }));

    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const r of ribbons) {
        const centerY = r.baseY * h;
        const pts: Array<{ x: number; y: number }> = [];
        const steps = 90;

        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * w;
          const wave =
            Math.sin(i * 0.085 * r.freq + r.phase + t * 0.008 * speed) *
            r.amp *
            h;
          const drift =
            Math.sin(t * 0.002 * speed + r.phase) * r.drift * h;

          const m = mouseRef.current;
          const dx = m.x - x;
          const dy = m.y - (centerY + wave);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = m.active ? Math.max(0, 1 - dist / (h * 0.45)) : 0;
          const bend = influence * dy * 0.35;

          pts.push({
            x,
            y: centerY + wave + drift + bend + r.tilt * (x - w / 2),
          });
        }

        for (let k = 0; k < linesPerRibbon; k++) {
          const offset = (k - (linesPerRibbon - 1) / 2) * 6.2;

          const grad = ctx.createLinearGradient(0, 0, w, 0);
          grad.addColorStop(0, colorA);
          grad.addColorStop(0.5, "rgba(255,150,80,0.98)");
          grad.addColorStop(1, colorB);

          // outer glow
          ctx.beginPath();
          ctx.lineWidth = 10;
          ctx.strokeStyle = grad;
          ctx.globalAlpha = 0.12;
          ctx.shadowBlur = 55;
          ctx.shadowColor = "rgba(255,120,60,0.9)";
          ctx.moveTo(pts[0].x, pts[0].y + offset);
          for (let p = 1; p < pts.length; p++) ctx.lineTo(pts[p].x, pts[p].y + offset);
          ctx.stroke();

          // inner core
          ctx.beginPath();
          ctx.lineWidth = 1.7;
          ctx.strokeStyle = grad;
          ctx.globalAlpha = 0.85;
          ctx.shadowBlur = 14;
          ctx.shadowColor = "rgba(255,220,180,0.9)";
          ctx.moveTo(pts[0].x, pts[0].y + offset);
          for (let p = 1; p < pts.length; p++) ctx.lineTo(pts[p].x, pts[p].y + offset);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      t += 1;
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("blur", onLeave);
    };
  }, [colorA, colorB, density, linesPerRibbon, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
};

export default FloatingLinesBackground;
