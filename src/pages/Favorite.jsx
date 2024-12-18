import React, { useEffect, useState } from 'react';
import { ref, onValue, off, set } from 'firebase/database';
import { database } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbaru from '../components/Navbaru';
import Bawah from '../components/Bawah';
import Loading from '../components/Loading';
import pet from '../assets/image/pet.svg'; // Updated import path

import '../style/All.css';

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
      <section className="w-full px-4 sm:px-6 md:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Listings Grid */}
          <div className="Area-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
            {listings.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center" >
                <img 
                  src={pet} 
                  alt="pet logo" 
                  className="max-w-[250px] sm:max-w-[300px] mb-6"
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
                  <div className="p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h6 className="font-['Lexend'] text-base sm:text-lg font-semibold truncate pr-2">{listing.title}</h6>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="font-['Lexend'] text-xs sm:text-sm text-gray-700 flex items-center">
                        <FontAwesomeIcon icon={faLocationDot} className="mr-1.5"/>
                        {listing.city ? listing.city : 'Unknown'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 font-['Quicksand'] italic truncate">
                        "{listing.tags}"
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
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[1px] border-[#6B6B6B33]'
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