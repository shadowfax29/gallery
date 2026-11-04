import React, { useState, useRef } from 'react';
import { AdFormat } from '../types/AdFormat';
import { Play, Monitor, Smartphone, Eye, ArrowRight, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdFormatCardProps {
  format: AdFormat;
  onPreview: (format: AdFormat) => void;
}

export const AdFormatCard: React.FC<AdFormatCardProps> = ({ format, onPreview }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const getIcon = () => {
    if (format.type === 'video') return <Play className="w-6 h-6" />;
    if (format.category === 'Display') return <Monitor className="w-6 h-6" />;
    return <Smartphone className="w-6 h-6" />;
  };

  // Inside AdFormatCard.tsx
const getTypeColor = () => {
  // Both display/video types now use a blue theme
  return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200';
};

const getHeaderGradient = () => {
  // Card header gradient in blue
  return 'from-blue-500 to-indigo-500';
};

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % format.examples.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + format.examples.length) % format.examples.length);
  };

  const getCarouselImages = () => {
    const images = format.examples;
    const result = [];
    
    for (let i = -2; i <= 2; i++) {
      const index = (currentImageIndex + i + images.length) % images.length;
      result.push({
        ...images[index],
        position: i,
        isCenter: i === 0
      });
    }
    
    return result;
  };

  return (
    <div 
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden border border-slate-200 hover:border-slate-300 transform hover:-translate-y-1 hover:scale-[1.01]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header with gradient background - Fixed height */}
      <div className={`h-36 p-5 bg-gradient-to-br ${getHeaderGradient()} relative overflow-hidden flex flex-col justify-between`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-3 -right-3 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex-1 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                {getIcon()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg text-white mb-1 group-hover:text-gray-100 transition-colors line-clamp-1">
                  {format.name}
                </h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor()} backdrop-blur-sm shadow-sm`}>
                  <Zap className="w-2 h-2 mr-1" />
                  {format.category}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-white/90 leading-relaxed font-medium text-sm line-clamp-2 mt-2">
            {format.description}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Circular Carousel Gallery */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-800 text-base">Preview Examples</h4>
            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-semibold">
              {format.examples.length} examples
            </span>
          </div>
          
          {/* Carousel Container */}
          <div className="relative h-24 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {getCarouselImages().map((example, index) => {
                const position = example.position;
                const isCenter = position === 0;
                
                let translateX = position * 45; // Spacing between cards
                let scale = isCenter ? 1 : 0.7;
                let zIndex = isCenter ? 10 : 5 - Math.abs(position);
                let opacity = Math.max(0.3, 1 - Math.abs(position) * 0.3);
                
                return (
                  <div
                    key={`${example.id}-${index}`}
                    className={`absolute transition-all duration-500 ease-in-out cursor-pointer ${
                      isCenter ? 'hover:scale-110' : 'hover:scale-80'
                    }`}
                    style={{
                      transform: `translateX(${translateX}px) scale(${scale})`,
                      zIndex,
                      opacity
                    }}
                    onClick={() => {
                      if (!isCenter) {
                        setCurrentImageIndex((currentImageIndex + position + format.examples.length) % format.examples.length);
                      }
                    }}
                  >
                    <div className={`relative overflow-hidden rounded-xl shadow-sm border-2 transition-all duration-300 ${
                      isCenter ? 'border-blue-300 shadow-lg' : 'border-slate-200'
                    }`}>
                      <img 
                        src={example.previewImage} 
                        alt={example.title}
                        className="w-16 h-16 object-cover transition-transform duration-500"
                      />
                      {isCenter && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                          <p className="text-white text-xs font-semibold p-1.5 leading-tight line-clamp-2" style={{ color: "#ffffff" }}>
                            {example.title}
                          </p>
                        </div>
                      )}
                      <div className={`absolute top-1 right-1 p-0.5 bg-white/90 backdrop-blur-sm rounded-full transition-opacity duration-300 shadow-sm ${
                        isCenter ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <Eye className="w-2.5 h-2.5 text-slate-700" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation arrows - only show on hover */}
            {isHovering && format.examples.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 z-20"
                >
                  <ChevronLeft className="w-3 h-3 text-slate-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 z-20"
                >
                  <ChevronRight className="w-3 h-3 text-slate-700" />
                </button>
              </>
            )}
          </div>
          
          {/* Pagination dots */}
          <div className="flex justify-center mt-3 gap-1">
            {format.examples.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-blue-500 scale-125' 
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
          
          {format.examples.length > 5 && (
            <div className="mt-3 text-center">
              <span className="text-xs text-slate-500 font-medium">
                +{format.examples.length - 5} more examples available
              </span>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <button 
          onClick={() => onPreview(format)}
          className={`w-full bg-gradient-to-r ${getHeaderGradient()} text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group/btn relative overflow-hidden`}
        >
          {/* Button background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
          
          <div className="relative flex items-center justify-center gap-2">
            <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
            <span className="text-sm">Preview Format</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </div>
        </button>
      </div>

      {/* Bottom accent line */}
      <div className={`h-1 bg-gradient-to-r ${getHeaderGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </div>
  );
};