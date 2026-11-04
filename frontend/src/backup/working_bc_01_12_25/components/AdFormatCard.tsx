import React, { useRef } from 'react';
import { AdFormat } from '../types/AdFormat';
import { Play, Monitor, Smartphone, Eye, ArrowRight } from 'lucide-react';

interface AdFormatCardProps {
  format: AdFormat;
  onPreview: (format: AdFormat) => void;
}

export const AdFormatCard: React.FC<AdFormatCardProps> = ({ format, onPreview }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const getIcon = () => {
    if (format.type === 'video') return <Play className="w-5 h-5" />;
    if (format.category === 'Display') return <Monitor className="w-5 h-5" />;
    return <Smartphone className="w-5 h-5" />;
  };

  const getHeaderGradient = () => {
    return 'from-[#FF6B2C] to-[#FF8C42]';
  };

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = panelRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;

    const glow = card.querySelector('.holo-glow') as HTMLElement;
    if (glow) {
      glow.style.left = `${x - 75}px`;
      glow.style.top = `${y - 75}px`;
    }
  };

  const resetTilt = () => {
    const card = panelRef.current;
    if (!card) return;

    card.style.transform = `perspective(600px) rotateX(0) rotateY(0) scale(1)`;

    const glow = card.querySelector('.holo-glow') as HTMLElement;
    if (glow) {
      glow.style.left = `50%`;
      glow.style.top = `50%`;
    }
  };

  return (
    <>
      {/* INLINE CSS */}
      <style>
        {`
          .tilt-panel {
            transition: transform 0.2s ease-out;
            will-change: transform;
          }

          .holo-glow {
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, rgba(255,110,50,0.35), transparent);
            position: absolute;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            pointer-events: none;
            transition: all 0.15s ease-out;
          }

          .holo-scan {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to bottom,
              transparent,
              rgba(255, 130, 60, 0.12),
              transparent
            );
            animation: holoScan 2.5s infinite linear;
            pointer-events: none;
          }

          @keyframes holoScan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
        `}
      </style>

      <div
        className="
          group bg-white rounded-2xl border border-[#FF6B2C]/40 
          hover:border-[#FF6B2C] transition-all duration-300 overflow-hidden 
          shadow-md hover:shadow-xl transform hover:scale-[1.03] hover:-translate-y-1
          hover:bg-[#FFF4EC]
        "
      >
        {/* Gradient top bar */}
        <div
          className={`h-1 bg-gradient-to-r ${getHeaderGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="p-2 bg-gray-100 rounded-lg text-gray-600 
                group-hover:bg-gradient-to-r group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42]
                group-hover:text-white transition-all"
              >
                {getIcon()}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-base text-gray-900 group-hover:text-[#FF6B2C] transition-colors line-clamp-1">
                  {format.name}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 mt-1">
                  {format.category}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm line-clamp-2">{format.description}</p>
        </div>

        {/* 🔥 3D Tilt Hologram Panel */}
        <div className="p-5">
          <div
            ref={panelRef}
            className="
              tilt-panel relative overflow-hidden rounded-xl p-6 cursor-pointer
              bg-gradient-to-br from-[#0f0f0f] via-[#1b1b1b] to-[#0f0f0f]
              border border-[#FF6B2C]/40 shadow-xl
            "
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
          >
            {/* Moving glow */}
            <div className="holo-glow"></div>

            {/* Scan light */}
            <div className="holo-scan"></div>

            {/* Hologram content */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-3 pointer-events-none">
              <div
                className="
                  w-20 h-20 bg-gradient-to-br from-[#FF6B2C] to-[#FF8C42] 
                  rounded-lg shadow-lg shadow-[#FF6B2C]/40 animate-float
                "
              ></div>
              <p className="text-xs text-gray-300 tracking-wider uppercase opacity-80">
                Interactive Hologram
              </p>
            </div>
          </div>

          {/* Preview Button */}
          <button
            onClick={() => onPreview(format)}
            className="
              w-full bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] 
              text-white font-medium py-2.5 px-4 rounded-lg 
              hover:shadow-lg hover:shadow-[#FF6B2C]/30 transition-all duration-300 
              transform hover:scale-[1.02] group/btn relative overflow-hidden text-sm mt-5
            "
          >
            <div
              className="
                absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 
                -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] 
                transition-transform duration-700
              "
            ></div>

            <div className="relative flex items-center justify-center gap-2">
              <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
              <span>Preview Format</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
