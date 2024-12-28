import React, { useEffect, useState, useMemo } from 'react';
import { ref, onValue, off, set } from 'firebase/database';
import { database } from '../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Heart, MapPin } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import LoginNotificationModal from '../kebutuhan/LoginNotif';

import '../style/Area.css';
import Loading from './Loading';

function Area() {
  const [listings, setListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState({});
  const itemsPerPage = 6;
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const [showLoginNotification, setShowLoginNotification] = useState(false);

  // Updated categories array with combined Hotel & Villa
  const categories = ['All', 'Hotel & Villa', 'Cafe', 'Mall', 'Restaurant', 'Bar'];

  useEffect(() => {
    if (!auth.currentUser) return;

    const favoritesRef = ref(database, `favorites/${auth.currentUser.uid}`);
    const favoritesListener = onValue(favoritesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setFavorites(data);
    });

    return () => off(favoritesRef, 'value', favoritesListener);
  }, [auth.currentUser]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromQuery = queryParams.get('category');
    const pageFromQuery = parseInt(queryParams.get('page')) || 1;
    
    // Handle the combined category in the URL
    if (categoryFromQuery === 'Hotel & Villa') {
      setSelectedCategory('Hotel & Villa');
    } else {
      setSelectedCategory(categoryFromQuery || 'All');
    }
    setCurrentPage(pageFromQuery);

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

  const handleToggleFavorite = async (e, listingId) => {
    e.stopPropagation();

    if (!auth.currentUser) {
      setShowLoginNotification(true);
      return;
    }

    const userId = auth.currentUser.uid;
    const favoriteRef = ref(database, `favorites/${userId}/${listingId}`);

    try {
      if (favorites[listingId]) {
        await set(favoriteRef, null);
      } else {
        await set(favoriteRef, true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite');
    }
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

  // Modified filtering logic with improved handling of Hotel & Villa category
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      if (selectedCategory === 'All') {
        return true;
      }
      if (selectedCategory === 'Hotel & Villa') {
        return listing.category === 'Hotel' || listing.category === 'Villa';
      }
      return listing.category === selectedCategory;
    });
  }, [listings, selectedCategory]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  const handleCategoryClick = (category) => {
    // Ensure the category is properly encoded in the URL
    const encodedCategory = encodeURIComponent(category);
    navigate(`?category=${encodedCategory}&page=1`);
    setCurrentPage(1);
    setSelectedCategory(category);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('page', page);
    navigate(`?${queryParams.toString()}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <section className="w-full" style={{backgroundColor:'#F2F2F2'}}>
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-4 md:py-8">
          <div className="text-center max-w-[772px] mx-auto pt-8 pb-6 md:pb-[24px]">
            <h3 className="font-[ADELIA] text-[28px] md:text-[39px] text-[#3A3A3A] font-normal leading-[36px] md:leading-[48px] pb-4 md:pb-[24px]">
              Our Top Curated places
            </h3>
            <p className="font-['Lexend'] font-light text-[14px] md:text-[16px] text-[#6B6B6B] leading-[20px] md:leading-[24px] text-justify w-full md:w-[588px] px-0 md:px-5 mx-auto">
              We're committed to carefully curating a list of ideal spots, hand-picked by pet parents just like you, to ensure every pet and pet parent can enjoy quality time together in the best locations.
            </p>
          </div>

          <div className="category-area flex flex-wrap justify-center gap-2 md:gap-1">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-3 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-full transition-all h-[33px] flex items-center justify-center ${
                  selectedCategory === category 
                    ? 'active bg-[#1DA19E] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="Area-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
            {paginatedListings.map((listing) => (
              <div 
                className="kotak relative bg-transparent rounded-lg overflow-hidden cursor-pointer"
                key={listing.id} 
                onClick={() => navigate(`/PubTemplate/${listing.id}`)}
              >
                <div className="absolute left-4 z-10" style={{marginTop:'15px'}}>
                  <span className="px-2 py-1 rounded-md font-['Lexend']" style={{color:'#3A3A3A',backgroundColor:'#F2F2F2',fontSize:'12px'}}>
                    {listing.category}
                  </span>
                </div>
                
                <div className="absolute right-4 z-10">
                  <button
                    onClick={(e) => handleToggleFavorite(e, listing.id)}
                    className="hover:bg-opacity-100 transition-all"
                    style={{borderRadius:'8px',marginTop:'15px',padding:'4px 6px',backgroundColor:'#F2F2F2'}}
                  >
                    <Heart
                      size={18}
                      className={`transition-colors ${
                        favorites[listing.id]
                          ? "text-red-500 fill-current"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                </div>

                <div className="overflow-hidden group">
                  <img 
                    src={listing.imageUrls?.[0] || 'default-image-url.jpg'}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                    onError={(e) => e.target.src = 'default-image-url.jpg'}
                  />
                </div>

                <div>
                  <div className="flex flex-col -space-y-2">
                    <h6 className="font-['Lexend'] text-base md:text-lg leading-none pb-1">{listing.title}</h6>
                    <div className="flex items-center -mb-2">
                      <MapPin className="w-4 h-4 text-[#6B6B6B]" />
                      <p className="font-['Lexend'] text-sm leading-none">
                        {listing.city ? listing.city : 'Unknown'}, {listing.district}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center flex-wrap gap-3 mt-8 mb-6">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-[40px] h-[33px] rounded-md transition-colors duration-200 font-['Quicksand'] text-[14px] flex items-center justify-center ${
                    currentPage === index + 1
                      ? 'bg-[#1DA19E] text-white border-0'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[1px] border-[#6B6B6B33]'
                  }`}
                  style={{fontWeight:600}}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      <LoginNotificationModal 
        isOpen={showLoginNotification}
        onClose={() => setShowLoginNotification(false)}
      />
    </>
  );
}

export default Area;