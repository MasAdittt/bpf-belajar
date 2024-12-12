import React from 'react';
import SearchBar from './SearchBar';
import Search from './Search';
import '../style/Atas.css';
import atasBg from '../assets/image/atas.jpg'

const backgroundStyle = {
  backgroundImage: `url(${atasBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};
function Atas() {
  return (
    <section className="hero" style={backgroundStyle}>
      <div className="overlay">
        <div className="content-container">
          <div className="content">
            <h1 style={{ paddingBottom:'15px',paddingTop:'20px' }}>FIND YOUR PET FRIENDLY PLACES</h1>    
              <Search />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Atas;