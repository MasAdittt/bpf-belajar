import React, { useState, useEffect } from 'react';

const AlertNotification = ({ message, type = 'error', duration = 8000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
        px-6 py-3 rounded-full shadow-lg
        animate-fadeIn transition-all duration-500 ease-in-out
        ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
    >
      <div className="flex items-center gap-2">
        {type === 'error' && (
          <svg 
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        <span className="font-lexend text-sm font-medium">
          {message}
        </span>
      </div>
    </div>
  );
};

export default AlertNotification;