import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Atas.css';

function Atas() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
    // navigate(`/search?query=${searchQuery}`);
  };

  return (
    <section className="hero" style={{backgroundColor:'#F2F2F2 !important'}}>
      <div className="overlay">
        <div className="content-container">
          <div className="content">
            <h1>FIND YOUR PET FRIENDLY PLACES</h1>    
            <form onSubmit={handleSearch} className="search-bar">
              <input
                type="text"
                placeholder="Find your favorite place"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                <i className="fas fa-search"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Atas;