import React, { useState, useEffect } from 'react';
import { Heart, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import LoginNotificationModal from '../kebutuhan/LoginNotif';

const LatestPlaces = ({ onToggleFavorite, favorites }) => {
  const navigate = useNavigate();
  const [latestListings, setLatestListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const listingsRef = ref(database, 'listings/');
    
    const listingsListener = onValue(listingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listingsArray = Object.entries(data).map(([id, listing]) => ({
          id,
          ...listing,
          createdAt: listing.createdAt || Date.now(),
        }));

        const sortedListings = listingsArray
          .filter(listing => listing.isPublic)
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 4);

        setLatestListings(sortedListings);
      }
    });

    return () => off(listingsRef, 'value', listingsListener);
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const handleFavoriteClick = (listingId) => {
    if (!auth.currentUser) {
      setIsModalOpen(true);
      return;
    }
    onToggleFavorite(listingId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-medium mb-6" style={{ fontFamily: 'Lexend' }}>
        Latest Places
      </h2>
      
      <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 lg:space-y-6 lg:block">
        {latestListings.map((listing) => (
          <div 
            key={listing.id}
            className="listing-card relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex md:flex-col lg:flex lg:flex-row h-auto md:h-auto lg:h-[292px] bg-white"
            style={{borderRadius: '16px'}}
          >
            {/* Image Section */}
            <div className="w-full md:w-full lg:w-96 flex-shrink-0">
              <div className="relative h-48 md:h-48 lg:h-full">
                <img 
                  src={listing.imageUrls?.[0] || '/placeholder-image.jpg'} 
                  alt={listing.title} 
                  className="w-full h-full object-cover"
                  style={{borderRadius: '16px'}}
                />
                
                {/* Category and Date Badge */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div 
                    className="bg-gray-100 px-3 py-1 rounded-lg text-sm"
                    style={{fontFamily: 'Lexend'}}
                  >
                    {listing.category}
                  </div>
                  <div 
                    className="bg-gray-100 px-3 py-1 rounded-lg text-sm"
                    style={{fontFamily: 'Lexend'}}
                  >
                    {formatDate(listing.createdAt)}
                  </div>
                </div>
          
                {/* Heart Icon */}
                <div className="absolute top-3 right-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteClick(listing.id);
                    }}
                    className="bg-gray-100 p-1.5 rounded-lg hover:bg-white transition-all"
                  >
                    <Heart 
                      size={18}
                      className={`transition-colors ${
                        favorites[listing.id] ? "text-red-500 fill-current" : "text-gray-600"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          
            {/* Content Section */}
            <div className="flex-grow flex flex-col p-4 md:p-4 lg:p-6">
              <h3 
                className="text-lg font-medium mb-1"
                style={{fontFamily: 'Lexend'}}
              >
                {listing.title}
              </h3>
              
              <div className="flex items-center mb-2">
                <MapPin size={12} color="#6B6B6B" className="mr-1" />
                <span 
                  className="text-sm"
                  style={{
                    fontFamily: 'Lexend',
                    color: '#6B6B6B',
                    fontWeight: 300
                  }}
                >
                  {listing.city}  <span className="px-1 text-[#6B6B6B]">•</span>  {listing.businessHours ? `${listing.businessHours.opening} - ${listing.businessHours.closing}` : 'Hours Not Available'} WITA
                </span>
              </div>

              <p 
                className="text-sm"
                style={{
                  fontFamily: 'Lexend',
                  color: '#6B6B6B',
                  fontWeight: 300
                }}
              >
                {listing.foodCategory}, {listing.halalStatus}
              </p>

              <p 
                className="text-sm"
                style={{
                  fontFamily: 'Lexend',
                  color: '#6B6B6B',
                  fontWeight: 300,
                  width: '100%',
                  maxWidth: '360px'
                }}
              >
                "{listing.tags}"
              </p>
          
              <div className="mt-auto">
                <div 
                  className="flex flex-wrap items-center gap-2 mb-4 text-sm"
                  style={{
                    fontFamily: 'Lexend',
                    color: '#3A3A3A',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <a className="hover:text-blue-800">Maps</a>
                  <span className="text-gray-700">•</span>
                  <a className="hover:text-blue-800">Contact</a>
                  <span className="text-gray-700">•</span>
                  <a className="hover:text-blue-800">Instagram</a>
                  <span className="text-gray-700">•</span>
                  <a className="hover:text-blue-800">Website</a>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => navigate(`/PubTemplate/${listing.id}`)}
                    className="bg-[#1DA19E] text-white px-4 py-2 rounded-lg hover:bg-[#178784] transition-colors text-base"
                    style={{fontFamily: "Lexend"}}
                  >
                    See More
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <LoginNotificationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default LatestPlaces;

