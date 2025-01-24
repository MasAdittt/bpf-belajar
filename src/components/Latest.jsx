import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import LoginNotificationModal from '../kebutuhan/LoginNotif';

const GoogleLogo = () => (
  <div className="ml-1">
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  </div>
);

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

  const renderRating = (googleData) => {
    if (!googleData) return null;
    
    return (
      <div className="flex items-center gap-1 ml-auto">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="font-medium text-gray-600 font-lexend">{googleData.rating}</span>
        <span className="text-gray-600 font-lexend">
          ({new Intl.NumberFormat('id-ID').format(googleData.user_ratings_total)})
        </span>
        <GoogleLogo />
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-medium mb-6" style={{ fontFamily: 'Lexend' }}>
        Latest Places
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        {latestListings.map((listing) => (
          <div 
            key={listing.id}
            className="relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-col lg:flex-row h-auto lg:h-[292px] bg-white"
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
              <div className="flex flex-col -space-y-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 
                    className="text-lg md:text-xl font-medium"
                    style={{fontFamily: 'Lexend'}}
                  >
                    {listing.title}
                  </h3>
                  {listing.location?.googleData && renderRating(listing.location.googleData)}
                </div>
                
                <div className="flex items-center">
                  <MapPin size={12} color="#6B6B6B" className="mr-1" />
                  <span className="text-xs md:text-sm leading-none pb-1" style={{
                    fontFamily: 'Lexend',
                    color: '#6B6B6B',
                    fontWeight: 300
                  }}>
                    {listing.city}, {listing.district}  
                    <span className="px-1 text-[#6B6B6B]">•</span>  
                    {listing.businessHours ? `${listing.businessHours.opening} - ${listing.businessHours.closing}` : 'Hours Not Available'} WITA
                  </span>
                </div>

                <p 
                  className="text-xs md:text-sm leading-none pb-3"    
                  style={{
                    fontFamily: 'Lexend',
                    color: '#6B6B6B',
                    fontWeight: 300
                  }}
                >
                  {listing.foodCategory}, {listing.halalStatus}
                </p>
              </div>

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
                    className="bg-[#1DA19E] text-white px-4 py-2 rounded-lg hover:bg-[#178784] transition-colors text-sm"
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