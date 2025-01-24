import React, { useEffect, useState } from 'react';
import { ref, onValue, off, set } from 'firebase/database';
import { database } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { Star, Heart,MapPin } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbaru from '../components/Navbaru';
import Bawah from '../components/Bawah';
import Loading from '../components/Loading';
import pet from '../assets/image/pet.svg'; // Updated import path


import '../style/All.css';

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

function FavoriteListings() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    const userId = auth.currentUser.uid;
    const favoritesRef = ref(database, `favorites/${userId}`);
    const listingsRef = ref(database, 'listings/');
    setIsLoading(true);
    setError(null);

    const favoritesListener = onValue(favoritesRef, (favSnapshot) => {
      const favoritesData = favSnapshot.val() || {};
      
      const listingsListener = onValue(listingsRef, (listSnapshot) => {
        const listingsData = listSnapshot.val();
        if (listingsData) {
          const favoriteListings = Object.keys(listingsData)
            .filter(key => favoritesData[key])
            .map(key => {
              const listing = { id: key, ...listingsData[key] };
              listing.averageRating = calculateAverageRating(listing.reviews);
              return listing;
            })
            .filter(listing => listing.isPublic);
          
          setListings(favoriteListings);
        } else {
          setListings([]);
        }
        setIsLoading(false);
      }, (error) => {
        setError(error.message);
        setIsLoading(false);
      });

      return () => off(listingsRef, 'value', listingsListener);
    });

    return () => {
      off(favoritesRef, 'value', favoritesListener);
    };
  }, [auth.currentUser, navigate]);

  const calculateAverageRating = (reviews) => {
    if (!reviews || Object.keys(reviews).length === 0) return 0;
    const totalRating = Object.values(reviews).reduce((sum, review) => sum + review.rating, 0);
    return totalRating / Object.keys(reviews).length;
  };

  const handleToggleFavorite = async (e, listingId) => {
    e.stopPropagation();
    if (!auth.currentUser) {
      alert('Please login to manage favorites');
      return;
    }

    const userId = auth.currentUser.uid;
    const favoriteRef = ref(database, `favorites/${userId}/${listingId}`);

    try {
      await set(favoriteRef, null);
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to update favorite');
    }
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

  const totalPages = Math.ceil(listings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedListings = listings.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

 
  return (
    <>
      <Navbaru />
      <section className="w-full sm:px-6 md:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Listings Grid */}
          <div className="Area-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
            {listings.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center" >
                <img 
                  src={pet} 
                  alt="pet logo" 
                  className="max-w-[100px] sm:max-w-[300px] mb-6"
                />
                
                <p className="font-['Lexend'] text-[#3A3A3A33] mb-4 max-w-[470px] mx-auto text-sm sm:text-base">
                  You haven't added any places to your favorites yet. Start exploring and save your top picks here!
                </p>
                <button 
                  onClick={() => navigate('/Public')}
                  className="px-4 sm:px-6 py-2 bg-[#1DA19E] text-white rounded-md hover:bg-[#178784] transition-colors font-['Lexend'] text-sm sm:text-base"
                >
                  Explore Places
                </button>
              </div>
            ) : (
              paginatedListings.map((listing) => (
                <div 
                  className="kotak relative bg-transparent rounded-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02]"
                  key={listing.id} 
                  onClick={() => navigate(`/PubTemplate/${listing.id}`)}
                >
                  {/* Category Label */}
                  <div className="absolute left-4 top-4 z-10">
                    <span className="px-2 py-1 rounded-md font-['Lexend'] text-xs sm:text-sm" style={{ color: '#3A3A3A', backgroundColor: '#F2F2F2' }}>
                      {listing.category}
                    </span>
                  </div>
                  
                  {/* Favorite Button */}
                  <div className="absolute right-4 top-4 z-10">
                    <button
                      onClick={(e) => handleToggleFavorite(e, listing.id)}
                      className="hover:bg-opacity-100 transition-all rounded-lg p-2"
                      style={{ backgroundColor: '#F2F2F2' }}
                    >
                      <Heart size={16} className="text-red-500 fill-current" />
                    </button>
                  </div>

                  {/* Image */}
                  <img 
                    src={listing.imageUrls?.[0] || 'default-image-url.jpg'}
                    alt={listing.title}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover"
                    onError={(e) => e.target.src = 'default-image-url.jpg'}
                  />

                  {/* Content */}
                  <div className="flex flex-col -space-y-2">
                    <div className="flex items-center justify-between mt-2">
                      <h6 className="font-['Lexend'] text-base md:text-lg flex-1 p-0 m-0">
                        {listing.title}
                      </h6>
                      {listing.location?.googleData && renderRating(listing.location.googleData)}
                    </div>
                    <div className="flex items-center -mb-2">
                      <MapPin className="w-4 h-4 text-[#6B6B6B]" />
                      <p className="font-['Lexend'] text-sm leading-none">
                        {listing.city ? listing.city : 'Unknown'}, {listing.district}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-3 my-6">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-8 sm:w-[40px] h-8 sm:h-[33px] rounded-md transition-colors duration-200 font-['Quicksand'] text-xs sm:text-sm flex items-center justify-center ${
                    currentPage === index + 1
                      ? 'bg-[#1DA19E] text-white border-0'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-[1px] border-[#6B6B6B33]'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default FavoriteListings;