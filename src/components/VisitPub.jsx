import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../style/Visit.css';

const VisitPub = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleCards, setVisibleCards] = useState(4);
  const navigate = useNavigate();

  const cards = [
    { imageUrl: './src/assets/image/Denpasar.jpeg', title: 'DENPASAR', category: 'Denpasar' },
    { imageUrl: './src/assets/image/Kuta.jpg', title: 'KUTA', category: 'Kuta' },
    { imageUrl: './src/assets/image/Seminyak.jpg', title: 'SEMINYAK', category: 'Seminyak' },
    { imageUrl: './src/assets/image/Canggu.jpg', title: 'CANGGU', category: 'Canggu' },
    { imageUrl: './src/assets/image/Ubud.jpeg', title: 'UBUD', category: 'Ubud' },
    { imageUrl: './src/assets/image/Sanur.jpg', title: 'SANUR', category: 'Sanur' },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setVisibleCards(3);
      } else {
        setVisibleCards(4);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setStartIndex((prevIndex) => (prevIndex + 1) % cards.length);
    }
  };

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setStartIndex((prevIndex) =>
        prevIndex === 0 ? cards.length - 1 : prevIndex - 1
      );
    }
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const getVisibleCards = () => {
    const visibleCardsArray = [];
    for (let i = 0; i < visibleCards; i++) {
      const index = (startIndex + i) % cards.length;
      visibleCardsArray.push(cards[index]);
    }
    return visibleCardsArray;
  };

  const handleCardClick = (category) => {
    navigate(`/Public?category=${category}`);
  };

  return (
    <div className="perks-section" style={{backgroundColor:'#F2F2F2'}}>
      <h1 className="visit-judul">Popular areas to visit</h1>
      <div className="cards-container relative overflow-hidden">
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-10 sm:hidden"
          disabled={isAnimating}
        >
          <ChevronLeft size={24} />
        </button>
        <div
          className="cards-wrapper flex transition-transform duration-300 ease-in-out"
          style={{ gap: '10px' }}
        >
          {getVisibleCards().map((card, index) => (
            <Card key={index} {...card} onClick={() => handleCardClick(card.category)} />
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="next-button absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-10"
          disabled={isAnimating}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

const Card = ({ imageUrl, title, onClick }) => {
  return (
    <div className="card flex-1 min-w-0 cursor-pointer" onClick={onClick}>
      <img src={imageUrl} alt={title} className="card-image w-full h-full object-cover" />
      <div className="card-content">
        <h2 className="card-title">{title}</h2>
      </div>
    </div>
  );
};

export default VisitPub;