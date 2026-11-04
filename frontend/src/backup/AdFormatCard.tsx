import React, { useState, useEffect } from 'react';
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

  const getTypeColor = () =>
    'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200';
  const getHeaderGradient = () => 'from-blue-500 to-indigo-500';

  // Auto-rotation interval for carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % format.examples.length);
    }, 2500); // rotates every 2.5s

    return () => clearInterval(interval);
  }, [format.examples.length]);

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
        isCenter: i === 0,
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
      {/* Header */}
      <div className={`h-36 p-5 bg-gradient-to-br ${getHeaderGradient()} relative overflow-hidden flex flex-col justify-between`}>
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

                let translateX = position * 45; // spacing
                let scale = isCenter ? 1 : 0.7;
                let zIndex = isCenter ? 10 : 5 - Math.abs(position);
                let opacity = Math.max(0.3, 1 - Math.abs(position) * 0.3);

                return (
                  <div
                    key={`${example.id}-${index}`}
                    className={`absolute transition-all duration-500 ease-in-out cursor-pointer`}
                    style={{
                      transform: `translateX(${translateX}px) scale(${scale})`,
                      zIndex,
                      opacity,
                    }}
                    onClick={() => {
                      if (!isCenter) {
                        setCurrentImageIndex((currentImageIndex + position + format.examples.length) % format.examples.length);
                      }
                    }}
                  >
                    <div className={`relative overflow-hidden rounded-full shadow-sm border-2 transition-all duration-300 ${
                      isCenter ? 'border-blue-300 shadow-lg' : 'border-slate-200'
                    }`}>
                      <img
                        src={example.previewImage}
                        alt={example.title}
                        className="w-16 h-16 object-cover rounded-full transition-transform duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation arrows */}
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
        </div>

        {/* Action Button */}
        <button
          onClick={() => onPreview(format)}
          className={`w-full bg-gradient-to-r ${getHeaderGradient()} text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group/btn relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
          <div className="relative flex items-center justify-center gap-2">
            <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
            <span className="text-sm">Preview Format</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </div>
        </button>
      </div>

      <div className={`h-1 bg-gradient-to-r ${getHeaderGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </div>
  );
};
