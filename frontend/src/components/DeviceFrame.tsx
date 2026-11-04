import React, { useState, useEffect } from 'react';
import { DeviceType } from '../types/AdFormat';

interface DeviceFrameProps {
  device: DeviceType;
  children: React.ReactNode;
  orientation?: 'vertical' | 'horizontal';
  siteUrl?: string;
  size?: {
    width: number;
    height: number;
  };
}


// Get scale factor based on viewport
const getScaleFactor = (): number => {
  if (typeof window === 'undefined') return 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Mobile viewport
  if (width < 768) {
    return Math.min(width / 500, height / 950, 0.65);
  }
  // Tablet viewport
  if (width < 1024) {
    return Math.min(width / 700, height / 950, 0.8);
  }
  // Desktop
  return 1;
};

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  device,
  children,
  orientation = 'vertical',
  siteUrl,
  size
}) => {
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const updateScale = () => setScaleFactor(getScaleFactor());
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  if (!device.hasFrame || device.id === 'desktop') {
    return <div className="w-full h-full">{children}</div>;
  }

  // iPhone 14 Pro Max Style - Premium Design (Fixed realistic size)
  if (device.id === 'mobile') {
    const isHorizontal = orientation === 'horizontal';

    // Fixed phone-like dimensions (similar to a real phone preview)
    // const frameWidth = isHorizontal ? 580 : 280;
    // const frameHeight = isHorizontal ? 280 : 580;
    const frameWidth = isHorizontal ? 700 : 340;
    const frameHeight = isHorizontal ? 340 : 700;
    const borderRadius = isHorizontal ? 32 : 38;
    const innerRadius = isHorizontal ? 26 : 32;
    const bezelSize = 8;

    return (
      <div
        className="relative mx-auto transition-all duration-500"
        style={{
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
          minHeight: size?.height
            ? `${size.height + 100}px`
            : undefined,
          maxWidth: '100%',

        }}
      >
        {/* Outer Device Frame */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: `${borderRadius}px`,
            background: 'linear-gradient(145deg, #1e1e20 0%, #0f0f10 50%, #1e1e20 100%)',
            boxShadow: `
              0 30px 60px -10px rgba(0, 0, 0, 0.7),
              0 0 0 ${bezelSize}px #0a0a0b,
              inset 0 0 0 1px rgba(255, 255, 255, 0.06)
            `,
          }}
        />

        {/* Inner Screen Bezel */}
        <div
          className="absolute bg-black"
          style={{
            inset: `${bezelSize}px`,
            borderRadius: `${innerRadius}px`,
            boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.03)',
          }}
        />

        {/* Dynamic Island - Vertical */}
        {!isHorizontal && (
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 z-40"
            style={{ marginTop: '5px' }}
          >
            <div
              className="bg-black rounded-full"
              style={{
                width: '72px',
                height: '22px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Camera */}
              <div
                className="absolute top-1/2 transform -translate-y-1/2 rounded-full"
                style={{
                  left: '15px',
                  width: '6px',
                  height: '6px',
                  background: 'radial-gradient(circle, #1a2535 0%, #0a0a0f 70%)',
                  boxShadow: '0 0 6px rgba(59, 130, 246, 0.5)',
                }}
              />
              {/* Face ID Sensor */}
              <div
                className="absolute top-1/2 transform -translate-y-1/2 rounded-full bg-[#0d0d10]"
                style={{
                  right: '15px',
                  width: '6px',
                  height: '3px',
                  opacity: 0.7,
                }}
              />
            </div>
          </div>
        )}

        {/* Dynamic Island - Horizontal */}
        {isHorizontal && (
          <div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-40"
            style={{ marginLeft: '5px' }}
          >
            <div
              className="bg-black rounded-full"
              style={{
                width: '22px',
                height: '72px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
              }}
            >
              <div
                className="absolute left-1/2 transform -translate-x-1/2 rounded-full"
                style={{
                  top: '15px',
                  width: '6px',
                  height: '6px',
                  background: 'radial-gradient(circle, #1a2535 0%, #0a0a0f 70%)',
                  boxShadow: '0 0 6px rgba(59, 130, 246, 0.5)',
                }}
              />
            </div>
          </div>
        )}

        {/* Screen Content Area */}
        <div
          className="absolute inset-0 bg-white overflow-clip"
          style={{
            borderRadius: `${innerRadius}px`,
            margin: `${bezelSize}px`,
            boxShadow: 'inset 0 0 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {children}
        </div>

        {/* Home Indicator */}
        <div
          className="absolute z-30 bg-black/25 rounded-full"
          style={
            isHorizontal
              ? {
                right: '5px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '3px',
                height: '90px',
              }
              : {
                bottom: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90px',
                height: '3px',
              }
          }
        />

        {/* Physical Buttons */}
        {/* Volume Buttons */}
        <div
          className="absolute bg-[#1e1e20] rounded-r shadow-sm"
          style={
            isHorizontal
              ? { top: '90px', left: '-2px', width: '2px', height: '20px' }
              : { left: '-2px', top: '110px', width: '2px', height: '20px' }
          }
        />
        <div
          className="absolute bg-[#1e1e20] rounded-r shadow-sm"
          style={
            isHorizontal
              ? { top: '120px', left: '-2px', width: '2px', height: '36px' }
              : { left: '-2px', top: '140px', width: '2px', height: '36px' }
          }
        />

        {/* Power Button */}
        <div
          className="absolute bg-[#1e1e20] rounded-l shadow-sm"
          style={
            isHorizontal
              ? { top: '115px', right: '-2px', width: '2px', height: '54px' }
              : { right: '-2px', top: '140px', width: '2px', height: '54px' }
          }
        />
      </div>
    );
  }

  // iPad Pro 12.9" Style - Premium Design (Aggressively viewport-contained)
  if (device.id === 'tablet') {
    const isHorizontal = orientation === 'horizontal';

    // Reduced base dimensions to eliminate scrollbars
    // const baseWidth = isHorizontal ? 900 : 880;
    // const baseHeight = isHorizontal ? 700 : 900;
    const isTallTabletAd =
      size?.height &&
      size.height >= 600;

    const minTabletHeight =
      size?.height
        ? size.height + 140
        : 900;

    const baseWidth =
      isHorizontal
        ? 900
        : isTallTabletAd
          ? 920
          : 880;

    const baseHeight =
      isHorizontal
        ? 700
        : Math.max(900, minTabletHeight);
    const borderRadius = isHorizontal ? 36 : 40;
    const innerRadius = isHorizontal ? 28 : 32;
    const bezelSize = 12;

    // Ultra-conservative viewport constraints (85% max, 10px margins)
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth - 20 : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight - 20 : 800;

    const maxFrameWidth = Math.floor(viewportWidth * 0.85);
    const maxFrameHeight = Math.floor(viewportHeight * 0.95);

    const frameWidth = Math.min(baseWidth, maxFrameWidth, maxFrameHeight * (baseWidth / baseHeight));
    let frameHeight = Math.min(baseHeight, maxFrameHeight, maxFrameWidth * (baseHeight / baseWidth));
    if (
      size?.height &&
      frameHeight < size.height
    ) {
      frameHeight = size.height + 100;
    }
    const scale = Math.min(frameWidth / baseWidth, frameHeight / baseHeight);

    return (
      <div
        className="relative mx-auto transition-all duration-500 "
        style={{
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
          minHeight: size?.height
            ? `${size.height + 100}px`
            : undefined,
          maxWidth: `${viewportWidth}px`,
          maxHeight: `${viewportHeight}px`,
          margin: '10px',
        }}
      >
        {/* Outer Device Frame */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: `${borderRadius * scale}px`,
            background: 'linear-gradient(145deg, #1e1e20 0%, #0f0f10 50%, #1e1e20 100%)',
            boxShadow: `
              0 ${Math.max(25 * scale, 10)}px ${Math.max(50 * scale, 20)}px -10px rgba(0, 0, 0, 0.6),
              0 0 0 ${bezelSize * scale}px #0a0a0b,
              inset 0 0 0 1px rgba(255, 255, 255, 0.06)
            `,
          }}
        />

        {/* Inner Screen Bezel */}
        <div
          className="absolute bg-black"
          style={{
            inset: `${bezelSize * scale}px`,
            borderRadius: `${innerRadius * scale}px`,
            boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.03)',
          }}
        />

        {/* Front Camera */}
        {!isHorizontal ? (
          <div
            className="absolute left-1/2 -translate-x-1/2 z-40"
            style={{ top: `${Math.max(4 * scale, 3)}px` }}
          >
            <div
              className="rounded-full"
              style={{
                width: `${Math.max(9 * scale, 6)}px`,
                height: `${Math.max(9 * scale, 6)}px`,
                background: 'radial-gradient(circle, #1a2535 0%, #0a0a0f 70%)',
                boxShadow: '0 0 6px rgba(59, 130, 246, 0.4), inset 0 1px 2px rgba(100, 150, 255, 0.2)',
              }}
            />
          </div>
        ) : (
          <div
            className="absolute top-1/2 -translate-y-1/2 z-40"
            style={{ left: `${Math.max(4 * scale, 3)}px` }}
          >
            <div
              className="rounded-full"
              style={{
                width: `${Math.max(9 * scale, 6)}px`,
                height: `${Math.max(9 * scale, 6)}px`,
                background: 'radial-gradient(circle, #1a2535 0%, #0a0a0f 70%)',
                boxShadow: '0 0 6px rgba(59, 130, 246, 0.4), inset 0 1px 2px rgba(100, 150, 255, 0.2)',
              }}
            />
          </div>
        )}

        {/* Screen Content Area - Critical overflow hidden */}
        <div
          className="absolute inset-0 bg-white overflow-auto"
          style={{
            borderRadius: `${innerRadius * scale}px`,
            margin: `${bezelSize * scale}px`,
            boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          {children}
        </div>

        {/* Home Indicator */}
        <div
          className="absolute z-30 bg-black/20 rounded-full"
          style={
            isHorizontal
              ? {
                right: `${Math.max(5 * scale, 4)}px`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: `${Math.max(3 * scale, 2)}px`,
                height: `${Math.max(100 * scale, 80)}px`,
              }
              : {
                bottom: `${Math.max(5 * scale, 4)}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                width: `${Math.max(120 * scale, 100)}px`,
                height: `${Math.max(3 * scale, 2)}px`,
              }
          }
        />

        {/* Speaker Grilles - Simplified 4 dots to reduce visual clutter */}
        {!isHorizontal ? (
          <div
            className="absolute left-1/2 -translate-x-1/2 flex gap-0.5"
            style={{ top: `${Math.max(4 * scale, 3)}px`, marginLeft: `-${Math.max(45 * scale, 35)}px` }}
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={`speaker-left-${i}`}
                className="rounded-full bg-[#1a1a1c]"
                style={{
                  width: `${Math.max(2.5 * scale, 2)}px`,
                  height: `${Math.max(2.5 * scale, 2)}px`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>
        ) : (
          <div
            className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-0.5"
            style={{ left: `${Math.max(4 * scale, 3)}px`, marginTop: `-${Math.max(45 * scale, 35)}px` }}
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={`speaker-top-${i}`}
                className="rounded-full bg-[#1a1a1c]"
                style={{
                  width: `${Math.max(2.5 * scale, 2)}px`,
                  height: `${Math.max(2.5 * scale, 2)}px`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>
        )}

        {/* Physical Buttons - Scaled down */}
        <div
          className="absolute bg-[#1e1e20] rounded-r shadow-sm"
          style={
            isHorizontal
              ? {
                top: `${160 * scale}px`,
                left: '-1.5px',
                width: '1.5px',
                height: `${50 * scale}px`
              }
              : {
                left: '-1.5px',
                top: `${150 * scale}px`,
                width: '1.5px',
                height: `${50 * scale}px`
              }
          }
        />
        <div
          className="absolute bg-[#1e1e20] rounded-l shadow-sm"
          style={
            isHorizontal
              ? {
                top: `${160 * scale}px`,
                right: '-1.5px',
                width: '1.5px',
                height: `${38 * scale}px`
              }
              : {
                right: '-1.5px',
                top: `${100 * scale}px`,
                width: '1.5px',
                height: `${38 * scale}px`
              }
          }
        />
      </div>
    );
  }

  return <div className="w-full h-full">{children}</div>;
};