import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ThumbnailSlider = ({ 
  items, 
  activeIndex, 
  onThumbnailClick,
  visibleThumbnails = 3
}) => {
  const [startIndex, setStartIndex] = useState(0);
  
  // Recalculate startIndex when activeIndex changes
  useEffect(() => {
    if (activeIndex < startIndex) {
      setStartIndex(activeIndex);
    } else if (activeIndex >= startIndex + visibleThumbnails) {
      setStartIndex(activeIndex - visibleThumbnails + 1);
    }
  }, [activeIndex, startIndex, visibleThumbnails]);

  const handleNext = () => {
    if (startIndex + visibleThumbnails < items.length) {
      setStartIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    }
  };

  return (
    <div className="absolute right-8 top-8 flex flex-col gap-4">
      <div className="flex justify-end gap-2 mb-2">
        <button
          onClick={handlePrev}
          disabled={startIndex === 0}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
            ${startIndex === 0 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-white/20 hover:bg-white text-white hover:text-black'
            }`}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={handleNext}
          disabled={startIndex + visibleThumbnails >= items.length}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
            ${startIndex + visibleThumbnails >= items.length
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-white/20 hover:bg-white text-white hover:text-black'
            }`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="flex flex-col gap-4 overflow-hidden">
        {items.slice(startIndex, startIndex + visibleThumbnails).map((item, idx) => (
          <div
            key={`${item.title}-${idx}`}
            className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300
              ${activeIndex === startIndex + idx 
                ? 'ring-2 ring-orange-500 scale-105' 
                : 'hover:scale-105'
              }`}
            onClick={() => onThumbnailClick(startIndex + idx)}
            style={{
              width: '200px',
              height: '120px',
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-end p-3">
              <div>
                <h4 className="text-white text-sm font-medium">{item.title}</h4>
                <p className="text-gray-300 text-xs">Explore Now</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThumbnailSlider;