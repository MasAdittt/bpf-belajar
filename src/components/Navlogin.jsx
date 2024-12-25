import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/image/Logo.svg';

const SimpleNavbar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex justify-between items-center">
        <div className="cursor-pointer ml-2 sm:ml-0">
          <img 
            src={Logo}
            alt="Bali Pet Friendly Logo"
            onClick={() => navigate('/')}
            className="h-8 w-24 sm:h-10 sm:w-28 md:h-[43px] md:w-[132px] object-contain"
          />
        </div>

        <button 
          onClick={() => navigate('/Coba')}
          className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2 text-sm sm:text-base rounded-lg bg-[#1DA19E] text-white hover:bg-[#198784] transition-colors duration-200 mr-2 sm:mr-0"
          style={{fontFamily:'Lexend'}}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default SimpleNavbar;