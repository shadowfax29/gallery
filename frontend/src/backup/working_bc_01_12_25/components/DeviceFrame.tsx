import React from 'react';
import { DeviceType } from '../types/AdFormat';

interface DeviceFrameProps {
  device: DeviceType;
  children: React.ReactNode;
  orientation?: 'vertical' | 'horizontal';
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, children, orientation = 'vertical' }) => {
  if (!device.hasFrame || device.id === 'desktop') {
    return <div className="w-full h-full">{children}</div>;
  }

  // iPhone 14 Pro Max Style - Premium Design (Responsive)
  if (device.id === 'mobile') {
    const isHorizontal = orientation === 'horizontal';
    
    return (
      <div 
        className={`relative mx-auto transition-all duration-500 ${
          isHorizontal ? 'max-w-full' : 'max-h-[85vh]'
        }`}
        style={{ 
          width: isHorizontal ? '932px' : '480px', 
          height: isHorizontal ? '480px' : '932px',
          maxWidth: '100%',
          aspectRatio: isHorizontal ? '932/430' : '430/932',
        }}
      >
        {/* Outer Device Frame */}
        <div 
          className={`absolute inset-0 ${isHorizontal ? 'rounded-[58px]' : 'rounded-[68px]'}`}
          style={{ 
            background: 'linear-gradient(145deg, #1e1e20 0%, #0f0f10 50%, #1e1e20 100%)',
            boxShadow: `
              0 50px 100px -20px rgba(0, 0, 0, 0.7),
              0 0 0 14px #0a0a0b,
              inset 0 0 0 1px rgba(255, 255, 255, 0.06)
            `,
          }}
        >
          {/* Inner Screen Bezel */}
          <div 
            className={`absolute inset-[14px] ${isHorizontal ? 'rounded-[46px]' : 'rounded-[56px]'} bg-black`}
            style={{
              boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.03)'
            }}
          >
            {/* Dynamic Island - Vertical */}
            {!isHorizontal && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-40" style={{ marginTop: '8px' }}>
                <div 
                  className="bg-black rounded-full"
                  style={{
                    width: '125px',
                    height: '36px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {/* Camera */}
                  <div 
                    className="absolute top-1/2 left-[26px] transform -translate-y-1/2 w-[10px] h-[10px] rounded-full"
                    style={{
                      background: 'radial-gradient(circle, #1a2535 0%, #0a0a0f 70%)',
                      boxShadow: '0 0 6px rgba(59, 130, 246, 0.5), inset 0 1px 2px rgba(100, 150, 255, 0.2)'
                    }}
                  ></div>
                  
                  {/* Face ID Sensor */}
                  <div 
                    className="absolute top-1/2 right-[26px] transform -translate-y-1/2 w-[10px] h-[5px] rounded-full bg-[#0d0d10]"
                    style={{ opacity: 0.7 }}
                  ></div>
                </div>
              </div>
            )}

            {/* Dynamic Island - Horizontal */}
            {isHorizontal && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-40" style={{ marginLeft: '8px' }}>
                <div 
                  className="bg-black rounded-full"
                  style={{
                    width: '36px',
                    height: '125px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  <div 
                    className="absolute top-[26px] left-1/2 transform -translate-x-1/2 w-[10px] h-[10px] rounded-full"
                    style={{
                      background: 'radial-gradient(circle, #1a2535 0%, #0a0a0f 70%)',
                      boxShadow: '0 0 6px rgba(59, 130, 246, 0.5)'
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Screen Content Area */}
            <div 
              className={`absolute inset-0 ${isHorizontal ? 'rounded-[46px]' : 'rounded-[56px]'} bg-white overflow-hidden`}
              style={{
                boxShadow: 'inset 0 0 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {children}
            </div>

            {/* Home Indicator */}
            <div 
              className={`absolute z-30 ${
                isHorizontal 
                  ? 'right-2 top-1/2 -translate-y-1/2 w-[3px] h-[150px]' 
                  : 'bottom-[6px] left-1/2 -translate-x-1/2 w-[150px] h-[3px]'
              } bg-black/25 rounded-full`}
            ></div>
          </div>
        </div>

        {/* Physical Buttons */}
        {/* Volume Buttons */}
        <div 
          className={`absolute ${isHorizontal ? 'top-[150px] left-[-2px]' : 'left-[-2px] top-[180px]'} w-[2px] h-[32px] bg-[#1e1e20] rounded-r shadow-sm`}
        ></div>
        <div 
          className={`absolute ${isHorizontal ? 'top-[195px] left-[-2px]' : 'left-[-2px] top-[230px]'} w-[2px] h-[60px] bg-[#1e1e20] rounded-r shadow-sm`}
        ></div>
        
        {/* Power Button */}
        <div 
          className={`absolute ${isHorizontal ? 'top-[185px] right-[-2px]' : 'right-[-2px] top-[230px]'} w-[2px] h-[90px] bg-[#1e1e20] rounded-l shadow-sm`}
        ></div>
      </div>
    );
  }

  // iPad Pro 12.9" Style - Premium Design (Responsive)
  if (device.id === 'tablet') {
    const isHorizontal = orientation === 'horizontal';
    
    return (
      <div 
        className={`relative mx-auto transition-all duration-500 ${
          isHorizontal ? 'max-w-full' : 'max-h-[85vh]'
        }`}
        style={{ 
          width: isHorizontal ? '900px' : '650px', 
          height: isHorizontal ? '650px' : '900px',
          maxWidth: '100%',
          aspectRatio: isHorizontal ? '900/650' : '650/900',
        }}
      >
        {/* Outer Device Frame */}
        <div 
          className={`absolute inset-0 ${isHorizontal ? 'rounded-[48px]' : 'rounded-[52px]'}`}
          style={{ 
            background: 'linear-gradient(145deg, #1e1e20 0%, #0f0f10 50%, #1e1e20 100%)',
            boxShadow: `
              0 60px 120px -20px rgba(0, 0, 0, 0.7),
              0 0 0 16px #0a0a0b,
              inset 0 0 0 1px rgba(255, 255, 255, 0.06)
            `,
          }}
        >
          {/* Inner Screen Bezel */}
          <div 
            className={`absolute inset-[16px] ${isHorizontal ? 'rounded-[34px]' : 'rounded-[38px]'} bg-black`}
            style={{
              boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.03)'
            }}
          >
            {/* Front Camera */}
            <div className={`absolute ${isHorizontal ? 'left-1/2 top-2 -translate-x-1/2' : 'top-2 left-1/2 -translate-x-1/2'} z-40`}>
              <div 
                className="w-[12px] h-[12px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, #1a2535 0%, #0a0a0f 70%)',
                  boxShadow: '0 0 8px rgba(59, 130, 246, 0.4), inset 0 1px 2px rgba(100, 150, 255, 0.2)'
                }}
              ></div>
            </div>

            {/* Screen Content Area */}
            <div 
              className={`absolute inset-0 ${isHorizontal ? 'rounded-[34px]' : 'rounded-[38px]'} bg-white overflow-hidden`}
              style={{
                boxShadow: 'inset 0 0 12px rgba(0, 0, 0, 0.12)'
              }}
            >
              {children}
            </div>

            {/* Home Indicator */}
            <div 
              className={`absolute z-30 ${
                isHorizontal 
                  ? 'right-2 top-1/2 -translate-y-1/2 w-[4px] h-[160px]' 
                  : 'bottom-[8px] left-1/2 -translate-x-1/2 w-[180px] h-[4px]'
              } bg-black/25 rounded-full`}
            ></div>

            {/* Speaker Grilles */}
            {!isHorizontal && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1.5 ml-8">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-[3px] h-[3px] rounded-full bg-[#1a1a1c]"
                    style={{ opacity: 0.4 }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Physical Buttons */}
        {/* Volume Button */}
        <div 
          className={`absolute ${isHorizontal ? 'top-[280px] left-[-2px]' : 'left-[-2px] top-[320px]'} w-[2px] h-[80px] bg-[#1e1e20] rounded-r shadow-sm`}
        ></div>
        
        {/* Power Button */}
        <div 
          className={`absolute ${isHorizontal ? 'top-[300px] right-[-2px]' : 'right-[-2px] top-[340px]'} w-[2px] h-[60px] bg-[#1e1e20] rounded-l shadow-sm`}
        ></div>
      </div>
    );
  }

  return <div className="w-full h-full">{children}</div>;
};