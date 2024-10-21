import React from 'react';
import { useNavigate } from 'react-router-dom';

function NavTemplate({ logo }) {
  const navigate = useNavigate();

  return (
    <nav>
      <div className="wrapper">
        <div className="gambar">
          {logo ? (
            <img src={logo} alt="Logo Bisnis" className="business-logo" />
          ) : (
            <p>Logo tidak tersedia</p>
          )}
         
        
        </div>
      </div>
    </nav>
  );
}

export default NavTemplate;