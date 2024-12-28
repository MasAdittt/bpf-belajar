import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import Checkbox from '../data/Checkbox';

const FilterCategory = ({ categories, selectedCategories, onCategoryChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const locations = ['Badung', 'Bangli', 'Buleleng', 'Denpasar', 'Gianyar', 'Jembrana', 'Karangasem', 'Klungkung', 'Tabanan','jimbaran','uluwatu'];
  const places = ['Cafe', 'Restaurant', 'Mall', 'Hotel', 'Villa', 'Bar'];

  // Handle body scroll lock
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="relative w-full">
      {/* Mobile & Tablet Filter Button */}
      <div className="xl:hidden sticky top-0 left-0 right-0 z-10 bg-white shadow-sm rounded-md">
        <button
          onClick={toggleMenu}
          className="w-full py-4 px-6 flex items-center justify-between"
        >
          <div className="flex items-start space-x-2">
            <span className="font-lexend font-medium text-lg text-[#3A3A3A]">Filters</span>
            {selectedCategories.length > 0 && (
              <span className="bg-[#1DA19E] text-white text-sm px-2 py-1 rounded-full">
                {selectedCategories.length}
              </span>
            )}
          </div>
          <ChevronDown 
            className={`transform transition-transform duration-300 ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Overlay with fade transition */}
      <div 
        className={`
          fixed inset-0 bg-black xl:hidden transition-opacity duration-300 ease-in-out
          ${isMenuOpen ? 'opacity-50 z-40 visible' : 'opacity-0 invisible'}
        `}
        onClick={toggleMenu}
      />

      {/* Filter Content Container */}
      <div 
        className={`
          fixed inset-x-0 bottom-0 z-50 xl:relative xl:block
          transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-y-0' : 'translate-y-full xl:translate-y-0'}
          ${!isMenuOpen && 'xl:visible'}
        `}
      >
        {/* Mobile & Tablet Drawer */}
        <div className="xl:hidden bg-white rounded-t-[20px] h-[80vh] overflow-y-auto">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
            <h2 className="font-lexend font-medium text-xl">Filters</h2>
            <button 
              onClick={toggleMenu}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="p-6">
            {/* Locations */}
            <div>
              <h2 className="font-lexend font-medium text-xl text-[#3A3A3A] mb-4">
                Location
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {locations.map((location) => (
                  <div key={location} className="flex items-start">
                    <Checkbox
                      id={`location-${location}-mobile`}
                      checked={selectedCategories.includes(location)}
                      onCheckedChange={() => onCategoryChange(location)}
                    />
                    <label 
                      htmlFor={`location-${location}-mobile`} 
                      className="ml-3 font-quicksand text-gray-700"
                    >
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Places */}
            <div className="mt-8">
              <h2 className="font-lexend font-medium text-xl text-[#3A3A3A] mb-4">
                Places
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {places.map((place) => (
                  <div key={place} className="flex items-start">
                    <Checkbox
                      id={`place-${place}-mobile`}
                      checked={selectedCategories.includes(place)}
                      onCheckedChange={() => onCategoryChange(place)}
                    />
                    <label 
                      htmlFor={`place-${place}-mobile`} 
                      className="ml-3 font-quicksand text-gray-700"
                    >
                      {place}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-3 mt-8 sticky bottom-0 bg-white py-4">
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => {
                    selectedCategories.forEach(category => onCategoryChange(category));
                    toggleMenu();
                  }}
                  className="flex-1 py-3 px-4 text-red-500 border border-red-500 rounded-lg font-quicksand font-medium transition-colors hover:bg-red-50"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={toggleMenu}
                className="flex-1 py-3 px-4 bg-[#1DA19E] text-white rounded-lg font-quicksand font-medium transition-colors hover:bg-[#178784]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="hidden xl:block bg-white rounded-[6px] p-[34px_28px]">
          <p className="font-lexend font-light text-lg text-[#3A3A3A]">Filters</p>
          
          {/* Locations */}
          <div className="mt-3">
            <h2 className="font-lexend font-medium text-xl text-[#3A3A3A] mb-4">
              Location
            </h2>
            <div className="space-y-3">
              {locations.map((location) => (
                <div key={location} className="flex items-start">
                  <Checkbox
                    id={`location-${location}-desktop`}
                    checked={selectedCategories.includes(location)}
                    onCheckedChange={() => onCategoryChange(location)}
                  />
                  <label 
                    htmlFor={`location-${location}-desktop`} 
                    className="ml-2 font-quicksand text-gray-700"
                  >
                    {location}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Places */}
          <div className="mt-6">
            <h2 className="font-lexend font-medium text-xl text-[#3A3A3A] mb-4">
              Places
            </h2>
            <div className="space-y-3">
              {places.map((place) => (
                <div key={place} className="flex items-start">
                  <Checkbox
                    id={`place-${place}-desktop`}
                    checked={selectedCategories.includes(place)}
                    onCheckedChange={() => onCategoryChange(place)}
                  />
                  <label 
                    htmlFor={`place-${place}-desktop`} 
                    className="ml-2 font-quicksand text-gray-700"
                  >
                    {place}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterCategory;