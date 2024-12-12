import React, { useEffect, useState, useMemo } from 'react';
import { ref, onValue, off, set } from 'firebase/database';
import { database } from '../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, X, Heart, MapPin } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import Navbaru from '../components/Navbaru';
import Bawah from '../components/Bawah';
import Loading from '../components/Loading';
import Visit from '../components/Visit';
import FilterCategory from '../components/FilterCategory';
import FeaturedPlace from '../components/Featured';

const ListingCard = ({ listing, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate();
  
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ));
  };

  return (
    <div 
      className="listing-card relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
      style={{ height: '252px' }}
    >
      <div className="listing-gambar relative h-[140px]">
        <img 
          src={listing.imageUrls?.[0] || 'default-image-url.jpg'} 
          alt={listing.title} 
          className="w-full h-full object-cover"
          onError={(e) => e.target.src = 'default-image-url.jpg'}
        />
        
        {/* Category Badge */}
        <div 
          className="absolute top-4 left-4 bg-[#F2F2F2]"
          style={{
            padding: '4px 14px',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'Lexend'
          }}
        >
          {listing.category}
        </div>

        {/* Heart Icon */}
        <div className="absolute top-4 right-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(listing.id);
            }}
            className="hover:bg-opacity-100 transition-all"
            style={{
              borderRadius: '8px',
              padding: '4px 6px',
              backgroundColor: '#F2F2F2'
            }}
          >
            <Heart 
              size={18}
              className={`transition-colors ${
                isFavorite ? "text-red-500 fill-current" : "text-gray-600"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="listing-info p-4">
        <h3 style={{ 
          fontWeight: 500, 
          fontSize: '20px', 
          lineHeight: '24px',
          fontFamily: 'Lexend',
          marginBottom: '4px'
        }}>
          {listing.title}
        </h3>
        
        <div className="flex items-center mb-2">
          <MapPin size={16} className="mr-1" />
          <span style={{
            fontSize: '14px',
            color: '#666666',
            fontFamily: 'Quicksand'
          }}>
            {listing.city}
          </span>
        </div>

        <p style={{
          fontSize: '14px',
          color: '#666666',
          fontFamily: 'Quicksand',
          marginBottom: '8px'
        }}>
          "{listing.tags}"
        </p>

        <div className="listing-footer flex items-center justify-between">
          <div className="flex items-center">
            {renderStars(listing.averageRating)}
            <span className="ml-2 text-sm text-gray-600">
              {listing.reviews ? Object.keys(listing.reviews).length : 0} Reviews
            </span>
          </div>
          
          <button 
            className="see-more-btn bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => navigate(`/PubTemplate/${listing.id}`)}
          >
            See More
          </button>
        </div>
      </div>
    </div>
  );
};