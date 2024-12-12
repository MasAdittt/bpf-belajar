import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessModal = ({ isOpen, userId }) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const handleClose = () => {
    navigate(`/personal/${userId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{zIndex:999}}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 transform transition-all shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 text-[#1DA19E]" />
          </div>
          
          <div className="text-gray-600 mb-6 space-y-2 font-lexend">
            <p>"Great! Your data is saved. Continue to profile to make posts..."</p>
          </div>
          
          <button
            onClick={handleClose}
            className="bg-[#1DA19E] text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors duration-200 font-lexend"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;