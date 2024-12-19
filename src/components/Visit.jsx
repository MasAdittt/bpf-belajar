import React, { useState } from 'react';
import { MoveRight, MoveLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tanah from '../assets/image/tnahlot.jpg';
import Lovina from '../assets/image/lovina.jpg';
import Kuta from '../assets/image/kutabagus.jpg';
import pengli from '../assets/image/pengli.jpg';
import Denpasar from '../assets/image/Denpasar.jpeg';
import Tirta from '../assets/image/tirta.jpg';
import Nusa from '../assets/image/nusa.jpg';
import Ubud from '../assets/image/ubudgianyar.jpg';
import Barat from '../assets/image/barat.jpg';
import Bedugul from '../assets/image/bedugul.jpg';

const Visit = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const areas = [
    {
      imageUrl: Tanah,
      title: 'Tanah Lot',
      location: 'Tabanan',
      description: 'Visit this iconic sea temple during sunset'
    },
    {
      imageUrl: Lovina,
      title: 'Pantai Lovina',
      location: 'Buleleng',
      description: 'Visit this iconic sea temple during sunset'
    },
    {
      imageUrl: Kuta,
      title: 'Kuta',
      location: 'Badung',
      description: 'Enjoy the pristine white sand beaches'
    },
    {
      imageUrl: pengli,
      title: 'Penglipuran Village',
      location: 'Bangli',
      description: 'Enjoy the pristine white sand beaches'
    },
    {
      imageUrl: Denpasar,
      title: 'Renon',
      location: 'Denpasar',
      description: 'Enjoy the pristine white sand beaches'
    },
    {
      imageUrl: Tirta ,
      title: 'Tirta Empul ',
      location: 'Karangasem',
      description: 'Enjoy the pristine white sand beaches'
    },
    {
      imageUrl: Nusa,
      title: 'Nusa Penida ',
      location: 'Klungkung',
      description: 'Enjoy the pristine white sand beaches'
    },
    {
      imageUrl: Ubud,
      title: 'Ubud',
      location: 'Gianyar',
      description: 'Enjoy the pristine white sand beaches'
    },
    {
      imageUrl: Barat,
      title: 'Taman Nasiobal Bali barat',
      location: 'Jembrana',
      description: 'Enjoy the pristine white sand beaches'
    },
    {
      imageUrl: Bedugul,
      title: 'Bedugul',
      location: 'Tabanan',
      description: 'Enjoy the pristine white sand beaches'
    }
  ];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % areas.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + areas.length) % areas.length);
  };

  const handleThumbnailClick = (index, area) => {
    if (index === 1) {
      navigate(`/Public?category=${area.location}`);
    }
  };

  const getVisibleAreas = () => {
    const beforeActive = activeIndex === 0 ? areas.length - 1 : activeIndex - 1;
    const afterActive = (activeIndex + 1) % areas.length;
    return [beforeActive, activeIndex, afterActive].map(index => areas[index]);
  };

  return (
    <div className="w-full bg-transparent py-8 lg:py-16 px-4 lg:px-8"> 
      {/* Header */}
      <div className="w-full lg:w-[601px] px-4 lg:px-0" style={{margin:'0 auto'}}>
        <h2 className="text-3xl lg:text-[39px] text-center lg:text-left text-gray-800 mb-4" 
            style={{fontFamily:'ADELIA',fontWeight:400}}>
          POPULAR AREAS TO VISIT
        </h2>
        <p className="text-gray-600" 
           style={{textAlign:'justify',fontSize:'16px',lineHeight:'24px',fontFamily:'Lexend',fontWeight:300}}>
          Explore our most popular destinations where you'll find many pet-friendly places in Bali.
        </p>
      </div>

      {/* Main Container for Thumbnails and Navigation */}
      <div className="flex flex-col items-center max-w-6xl mx-auto mt-12 lg:mt-[80px]">
        {/* Thumbnails Container */}
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-6 w-full">
          {getVisibleAreas().map((area, index) => (
            <div
              key={area.title}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 shadow-xl
                ${index === 1 ? 
                  'w-full lg:w-[390px] h-[300px] lg:h-[400px] lg:transform lg:-translate-y-9 cursor-pointer' : 
                  'hidden lg:block lg:w-[374px] lg:h-[361px]'}`}
              onClick={() => handleThumbnailClick(index, area)}
            >
              <img
                src={area.imageUrl}
                alt={area.title}
                className="w-full h-full object-cover"
              />
              {index === 1 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="absolute bottom-6 left-0 right-0 text-center text-white">
                    <h3 style={{fontFamily:'Lexend',fontWeight:500,fontSize:'20px',lineHeight:'24px'}}>{area.title}</h3>
                    <p style={{fontFamily:'Lexend',fontSize:'14px',lineHeight:'21px',fontWeight:300}}>{area.location}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Buttons - Now positioned below thumbnails */}
        <div className="flex gap-[12px] justify-center mt-8">
          <button
            onClick={handlePrev}
            className="w-9 h-9 bg-[#1DA19E] text-white flex items-center justify-center hover:bg-[#0ea5e9] transition-colors"
            style={{borderRadius:'8px'}}
            aria-label="Previous slide"
          >
            <MoveLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 bg-[#1DA19E] text-white flex items-center justify-center hover:bg-[#0ea5e9] transition-colors"
            style={{borderRadius:'8px'}}
            aria-label="Next slide"
          >
            <MoveRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Visit;
