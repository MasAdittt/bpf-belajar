import React from 'react';
import { AlertCircle } from 'lucide-react';

const NotifListing = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{zIndex:99999999999}}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 transform transition-all shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <AlertCircle className="w-16 h-16 text-[#FF6B6B]" />
          </div>
          
          <div className="text-gray-600 mb-6 space-y-2 font-lexend">
            <h3 className="text-xl font-medium mb-2">Login Required</h3>
            <p>Please log in to add this listing to your favorites and access all features.</p>
            <p className="text-sm text-gray-500">Join our community to save your favorite places and get personalized recommendations!</p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => onClose()}
              className="text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-lexend"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                window.location.href = '/Coba';
              }}
              className="bg-[#1DA19E] text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors duration-200 font-lexend"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotifListing;