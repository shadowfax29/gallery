import React, { useEffect, useRef } from "react";

interface SilkOrangeBackgroundProps {
  /** base colors (orange silk) */
  light?: string;
  dark?: string;
  /** animation speed */
  speed?: number;
  /** grain intensity 0–0.2 */
  grain?: number;
  className?: string;
}

/**
 * SilkOrangeBackground
 * - soft flowing “fabric” bands
 * - orange-only palette
 * - subtle grain noise
 * - mouse interaction = local warp + brightening
 *
 * Perf: uses canvas 2D (no shaders).
 */
const SilkOrangeBackground: React.FC<SilkOrangeBackgroundProps> = ({
  light = "#FF7A2F",
  dark = "#120F0D",
  speed = 0.9,
  grain = 0.06,
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

    const drawGrain = (w: number, h: number) => {
      if (grain <= 0) return;
      const img = ctx.getImageData(0, 0, w, h);
      const data = img.data;
      for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() - 0.5) * 255 * grain;
        data[i] += n;
        data[i + 1] += n;
        data[i + 2] += n;
      }
      ctx.putImageData(img, 0, 0);
    };

    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // base vertical gradient
      const base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, light);
      base.addColorStop(1, dark);
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      // silk bands — multiple soft sine-warped “sheets”
      const bands = 7;
      for (let b = 0; b < bands; b++) {
        const amp = (0.06 + b * 0.018) * h;
        const freq = 0.0022 * (1 + b * 0.35);
        const phase = t * 0.006 * speed + b * 1.3;

        ctx.globalAlpha = 0.10 + b * 0.035;
        ctx.globalCompositeOperation = "soft-light";

        ctx.beginPath();
        ctx.moveTo(0, 0);

        for (let x = 0; x <= w; x += 8) {
          const y =
            h * 0.45 +
            Math.sin(x * freq + phase) * amp +
            Math.sin(x * freq * 0.7 - phase * 0.9) * amp * 0.55;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const bandGrad = ctx.createLinearGradient(0, 0, w, h);
        bandGrad.addColorStop(0, "rgba(255,140,70,1)");
        bandGrad.addColorStop(0.6, "rgba(50,20,10,1)");
        bandGrad.addColorStop(1, "rgba(255,120,50,1)");
        ctx.fillStyle = bandGrad;
        ctx.fill();
      }

      // mouse warp highlight
      if (mouseRef.current.active) {
        const { x, y } = mouseRef.current;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, h * 0.5);
        glow.addColorStop(0, "rgba(255,160,90,0.35)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 1;
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      drawGrain(w, h);

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
  }, [light, dark, speed, grain]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none", // never block clicks
      }}
    />
  );
};

export default SilkOrangeBackground;
