import React from 'react';
import { AdFormat, AdSize } from '../types/AdFormat';

interface AdPreviewProps {
  format: AdFormat;
  size: AdSize;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'floating';
  adTagContent?: string;
}

export const AdPreview: React.FC<AdPreviewProps> = ({ format, size, position,adTagContent }) => {
  const getPositionStyles = () => {
    const baseStyles = {
      width: `${size.width}px`,
      height: `${size.height}px`,
      position: 'absolute' as const,
      zIndex: 9999,
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column' as const,
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backdropFilter: 'blur(20px)',
      animation: 'adSlideIn 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    };

    switch (position) {
      case 'top':
        return { ...baseStyles, top: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { ...baseStyles, bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'left':
        return { ...baseStyles, left: '20px', top: '50%', transform: 'translateY(-50%)' };
      case 'right':
        return { ...baseStyles, right: '20px', top: '50%', transform: 'translateY(-50%)' };
      case 'floating':
        return { ...baseStyles, top: '20px', right: '20px' };
      default:
        return { ...baseStyles, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  console.log('AdPreview rendered with format:', format, 'size:', size, 'position:', position, 'adTagContent:', adTagContent);

  const getAdContent = () => {
    if (format.type === 'video') {
      return (
        <div className="w-full h-full relative overflow-hidden group">
          {/* Dynamic Video Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 left-6 w-20 h-20 bg-white/5 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
          </div>

          {/* Video Content */}
          <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-sm font-bold uppercase tracking-wider">Live Video</span>
              </div>
              <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                {Math.floor(size.width / 15)}s
              </div>
            </div>

            {/* Main Content */}
            <div className="text-center flex-1 flex flex-col justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5v10l7-5-7-5z" />
                </svg>
              </div>

              <h3 className="font-bold text-xl mb-2 drop-shadow-lg">Premium Experience</h3>
              <p className="text-white/90 text-sm mb-4 leading-relaxed">Discover the future of entertainment</p>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 inline-block shadow-lg">
                <span className="text-sm font-bold">{format.name}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/70 font-medium">{size.width}×{size.height}</div>
              <button className="bg-white text-purple-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Watch Now
              </button>
            </div>
          </div>

          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      );
    }

    return (
      // <div className="w-full h-full relative overflow-hidden group">
      //   {/* Dynamic Display Background */}
      //   <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-95"></div>
      //   <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10"></div>

      //   {/* Animated Background Pattern */}
      //   <div className="absolute inset-0">
      //     <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full transform translate-x-20 -translate-y-20"></div>
      //     <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full transform -translate-x-16 translate-y-16"></div>
      //     <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full animate-pulse"></div>

      //     {/* Floating particles */}
      //     <div className="absolute top-6 right-8 w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
      //     <div className="absolute bottom-8 left-6 w-1 h-1 bg-white/30 rounded-full animate-ping"></div>
      //     <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/50 rounded-full animate-pulse"></div>
      //   </div>

      //   {/* Display Content */}
      //   <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
      //     {/* Header */}
      //     <div className="flex items-center justify-between">
      //       <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
      //         Sponsored
      //       </div>
      //       <div className="text-xs text-white/80 font-medium">Premium Ad</div>
      //     </div>

      //     {/* Main Content */}
      //     <div className="text-center flex-1 flex flex-col justify-center">
      //       <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl mb-4 mx-auto flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
      //         <svg className="w-8 h-8 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
      //           <path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
      //         </svg>
      //       </div>

      //       <h3 className="font-bold text-lg mb-2 drop-shadow-lg">Premium Brand</h3>
      //       <p className="text-white/90 text-sm mb-4 leading-relaxed">Elevate your lifestyle today</p>

      //       <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 inline-block shadow-lg">
      //         <span className="text-sm font-bold">{format.name}</span>
      //       </div>
      //     </div>

      //     {/* Footer */}
      //     <div className="flex items-center justify-between">
      //       <div className="text-xs text-white/70 font-medium">{size.width}×{size.height}</div>
      //       <button className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
      //         Learn More
      //       </button>
      //     </div>
      //   </div>

      //   {/* Hover Effect Overlay */}
      //   <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      //   {/* Subtle Border Glow */}
      //   <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>
      // </div>

      <iframe src="about:blank" allow="autoplay;fullscreen;" 
      scrolling="yes" srcDoc={adTagContent} style={{ width: '100%', minHeight: '50vh', overflow: 'auto', border: '1px solid #ced4da', borderRadius: '0.25rem' }}></iframe>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes adSlideIn {
            from {
              opacity: 0;
              transform: ${position === 'center' ? 'translate(-50%, -50%) scale(0.8) rotateY(15deg)' :
            position === 'top' ? 'translateX(-50%) translateY(-50px) scale(0.9)' :
              position === 'bottom' ? 'translateX(-50%) translateY(50px) scale(0.9)' :
                position === 'left' ? 'translateY(-50%) translateX(-50px) scale(0.9)' :
                  position === 'right' ? 'translateY(-50%) translateX(50px) scale(0.9)' :
                    'translateY(-50px) scale(0.9)'};
              filter: blur(10px);
            }
            60% {
              opacity: 0.8;
              transform: ${position === 'center' ? 'translate(-50%, -50%) scale(1.05) rotateY(0deg)' :
            position === 'top' ? 'translateX(-50%) translateY(0) scale(1.02)' :
              position === 'bottom' ? 'translateX(-50%) translateY(0) scale(1.02)' :
                position === 'left' ? 'translateY(-50%) translateX(0) scale(1.02)' :
                  position === 'right' ? 'translateY(-50%) translateX(0) scale(1.02)' :
                    'translateY(0) scale(1.02)'};
              filter: blur(2px);
            }
            to {
              opacity: 1;
              transform: ${position === 'center' ? 'translate(-50%, -50%) scale(1) rotateY(0deg)' :
            position === 'top' ? 'translateX(-50%) translateY(0) scale(1)' :
              position === 'bottom' ? 'translateX(-50%) translateY(0) scale(1)' :
                position === 'left' ? 'translateY(-50%) translateX(0) scale(1)' :
                  position === 'right' ? 'translateY(-50%) translateX(0) scale(1)' :
                    'translateY(0) scale(1)'};
              filter: blur(0px);
            }
          }
        `}
      </style>
      <div
        // style={getPositionStyles()}
        className="hover:scale-105 hover:shadow-2xl"
        onClick={() => console.log('Ad clicked!')}
      >
        {getAdContent()}
      </div>
    </>
  );
};