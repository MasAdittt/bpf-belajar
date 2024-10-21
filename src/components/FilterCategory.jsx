import React from 'react';
import Checkbox from '../data/Checkbox';

const FilterCategory = ({ categories, selectedCategories, onCategoryChange }) => {
  const locations = ['Denpasar', 'Kuta', 'Seminyak', 'Canggu', 'Ubud', 'Sanur'];
  const places = ['Cafe', 'Restaurant', 'Mall', 'Hotel', 'Villa', 'Bar'];

  return (
    <div className="filter-category" >
      <h2 className="filter-title" style={{ paddingBottom:'10px', fontWeight:700  }}>Location</h2>
      {locations.map((location) => (
        <div key={location} className="filter-item" style={{ display: 'flex' }}>
          <Checkbox
            id={`location-${location}`}
            checked={selectedCategories.includes(location)}
            onCheckedChange={() => onCategoryChange(location)}
          />
          <label htmlFor={`location-${location}`} style={{ marginLeft: '8px' }}>{location}</label>
        </div>
      ))}

      <h2 className="filter-title" style={{ paddingBottom:'10px',fontWeight:700 }}>Places</h2>
      {places.map((place) => (
        <div key={place} className="filter-item" style={{ display: 'flex' }}>
          <Checkbox
            id={`place-${place}`}
            checked={selectedCategories.includes(place)}
            onCheckedChange={() => onCategoryChange(place)}
          />
          <label htmlFor={`place-${place}`} style={{ marginLeft: '8px' }}>{place}</label>
        </div>
      ))}
    </div>
  );
};

export default FilterCategory;
