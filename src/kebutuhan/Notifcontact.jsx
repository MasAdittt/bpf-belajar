import React from 'react';
import { CheckCircle } from 'lucide-react';

const NotifContact = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg py-12 max-w-md w-full  mx-4 transform transition-all shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 text-[#1DA19E]" />
          </div>
          
         
          
          <div className="text-gray-600 mb-6 space-y-2 font-lexend">
    <p>Thank you for reaching out! We've received your message and will get back to you shortly.</p>
  </div>
          
          <button
            onClick={onClose}
            className="bg-[#1DA19E] text-white px-6 py-2 rounded-lg font-lexend"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotifContact;