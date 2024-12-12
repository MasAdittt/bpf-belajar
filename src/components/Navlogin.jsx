import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/image/Logo.svg';

const SimpleNavbar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="cursor-pointer">
          <img 
            src={Logo}
            alt="Bali Pet Friendly Logo"
            onClick={() => navigate('/')}
            className="h-[43px] w-[132px]"
          />
        </div>

        <button 
          onClick={() => navigate('/Coba')}
          className="px-6 py-2 rounded-lg bg-[#1DA19E] text-white"
          style={{fontFamily:'Lexend'}}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default SimpleNavbar;