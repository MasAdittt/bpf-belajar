import React, { useState, useEffect } from 'react';

const SmoothScroll = () => {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle scroll visibility and progress
  const handleScroll = () => {
    const scrolled = document.documentElement.scrollTop;
    const maxHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrolled / maxHeight) * 100;
    
    setScrollProgress(scrollPercent);
    setVisible(scrolled > 300);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative">
      {/* Progress bar */}
      <div 
        className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50"
      >
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`
          fixed bottom-8 right-8 
          p-3 rounded-full 
          bg-blue-500 hover:bg-blue-600 
          text-white shadow-lg 
          transition-all duration-300 transform
          ${visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
        `}
        aria-label="Scroll to top"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>

      {/* Scroll animations for sections */}
      <div className="space-y-4">
        {['Area', 'Visit', 'Start'].map((section, index) => (
          <div
            key={section}
            className={`
              opacity-0 transform translate-y-10
              transition-all duration-700 delay-${index * 100}
              scroll-trigger
            `}
          >
            {/* Your section content goes here */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmoothScroll;