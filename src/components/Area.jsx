import React, { useEffect, useState, useMemo } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';
import { faUser, faStar, faMapMarkerAlt, faEnvelope, faPhone, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import '../style/Area.css';
import Loading from './Loading';

function Area() {
  const [listings, setListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = ['All', 'Villa', 'Cafe', 'Hotel', 'Mall', 'Restaurant', 'Bar'];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromQuery = queryParams.get('category');
    setSelectedCategory(categoryFromQuery || 'All');

    const listingsRef = ref(database, 'listings/');
    setIsLoading(true);
    setError(null);

    const listener = onValue(listingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listingArray = Object.keys(data)
          .map(key => {
            const listing = { id: key, ...data[key] };
            listing.averageRating = calculateAverageRating(listing.reviews);
            return listing;
          })
          .filter(listing => listing.isPublic);
        setListings(listingArray);
      } else {
        setListings([]);
      }
      setIsLoading(false);
    }, (error) => {
      setError(error.message);
      setIsLoading(false);
    });

    return () => off(listingsRef, 'value', listener);
  }, [location.search]);

  const calculateAverageRating = (reviews) => {
    if (!reviews || Object.keys(reviews).length === 0) return 0;
    const totalRating = Object.values(reviews).reduce((sum, review) => sum + review.rating, 0);
    return totalRating / Object.keys(reviews).length;
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ));
  };

  const filteredListings = useMemo(() => {
    return listings.filter(listing => 
      selectedCategory === 'All' || listing.category === selectedCategory
    );
  }, [listings, selectedCategory]);

  const handleCategoryClick = (category) => {
    navigate(`?category=${category}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section className="Area">
      <div className="category-area">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={selectedCategory === category ? 'active' : ''}
          >
            {category}    
          </button>
        ))}
      </div>
      <div className='Area-list'>
        {filteredListings.map((listing) => (
          <div className='kotak' key={listing.id} onClick={() => navigate(`/PubTemplate/${listing.id}`)}>
            <img 
              src={listing.imageUrls?.[0] || 'default-image-url.jpg'} 
              alt={listing.title}
              onError={(e) => e.target.src = 'default-image-url.jpg'}
              style={{cursor: 'pointer'}}
            />
            <div className="flex justify-between items-start">
              <h6>{listing.title}</h6>
              <div className="flex items-center" style={{ paddingTop:'8px', fontFamily:'Quicksand',paddingRight:'5px' }}>
                <FontAwesomeIcon icon={faStar} className="mr-1 text-yellow-400" />
                <span style={{ color:'#3A3A3A', fontWeight:600 }}>{listing.averageRating.toFixed(1)}</span>
              </div>
            </div>
            <p style={{ fontFamily:'Quicksand'}}>{listing.category}</p>
            <p>Hosted by {listing.username ? listing.username : 'Unknown'}</p>
            <p> {listing.city ? listing.city : 'Unknown'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Area;