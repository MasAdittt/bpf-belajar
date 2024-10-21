import React from 'react';

const LocationDisplay = ({ address }) => {
  return (
    <div className="location-display">
      <h3>Lokasi</h3>
      <p>{address}</p>
      <a 
        href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Lihat di OpenStreetMap
      </a>
    </div>
  );
};

export default LocationDisplay;