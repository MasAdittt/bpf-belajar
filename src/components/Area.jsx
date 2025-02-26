import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ref, onValue, off, set } from 'firebase/database';
import { database } from '../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Heart, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import LoginNotificationModal from '../kebutuhan/LoginNotif';
import '../style/Area.css';
import Loading from './Loading';
import ResponsivePagination from '../components/ui/Page';
import ScrollToTop from './ui/Hook';

// Google Logo component unchanged
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
  const areaRef = useRef(null);

  const categories = ['All', 'Hotel & Villa', 'Cafe', 'Mall', 'Restaurant', 'Bar'];

  // Favorites handling
  useEffect(() => {
    if (!auth.currentUser) return;

    const favoritesRef = ref(database, `favorites/${auth.currentUser.uid}`);
    const favoritesListener = onValue(favoritesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setFavorites(data);
    });

    return () => off(favoritesRef, 'value', favoritesListener);
  }, [auth.currentUser]);

  // URL parameters and listings fetch
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromQuery = queryParams.get('category');
    const pageFromQuery = parseInt(queryParams.get('page')) || 1;
    
    if (categoryFromQuery) {
      setSelectedCategory(categoryFromQuery);
    }
    
    if (pageFromQuery) {
      setCurrentPage(pageFromQuery);
    }

    const listingsRef = ref(database, 'listings/');
    setIsLoading(true);
    setError(null);

    const listener = onValue(listingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listingArray = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key]
          }))
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

  const filteredListings = useMemo(() => {
    if (selectedCategory === 'All') {
      return listings;
    } else if (selectedCategory === 'Hotel & Villa') {
      return listings.filter(listing => 
        listing.category?.toLowerCase() === 'hotel' || 
        listing.category?.toLowerCase() === 'villa'
      );
    } else {
      return listings.filter(listing => listing.category === selectedCategory);
    }
  }, [listings, selectedCategory]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  const handleCategoryClick = (category) => {
    // Update the URL with the new category and page without full navigation
    const newCategory = encodeURIComponent(category);
    const newUrl = `?category=${newCategory}&page=1`;
    
    // Use window.history to change URL without page reload
    window.history.pushState(
      { category: category, page: 1 }, 
      '', 
      newUrl
    );
    
    // Update the state directly
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    
    // Update URL without page reload
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('page', page);
    const newUrl = `?${queryParams.toString()}`;
    
    window.history.pushState(
      { category: selectedCategory, page: page }, 
      '', 
      newUrl
    );
    
    // Update state directly
    setCurrentPage(page);
  };

  const handleListingClick = (listing) => {
    window.scrollTo(0, 0);
    // Navigate to the listing detail page with state info
    navigate(`/${listing.category}/${listing.title.toLowerCase().replace(/\s+/g, '-')}/${listing.id}`, {
      state: { 
        fromArea: true,
        category: selectedCategory,
        page: currentPage
      }
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
    <ScrollToTop />
      <section ref={areaRef} className="w-full" style={{ backgroundColor: '#F2F2F2' }}>
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
                onClick={() => handleListingClick(listing)}              
              >
                <div className="absolute left-4 z-10" style={{ marginTop: '15px' }}>
                  <span className="px-2 py-1 rounded-md font-['Lexend']" style={{ color: '#3A3A3A', backgroundColor: '#F2F2F2', fontSize: '12px' }}>
                    {listing.category}
                  </span>
                </div>

                <div className="absolute right-4 z-10">
                  <button
                    onClick={(e) => handleToggleFavorite(e, listing.id)}
                    className="hover:bg-opacity-100 transition-all"
                    style={{ borderRadius: '8px', marginTop: '15px', padding: '4px 6px', backgroundColor: '#F2F2F2' }}
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

                <div className="overflow-hidden group rounded-lg">
                  <img
                    src={listing.imageUrls?.[0] || 'default-image-url.jpg'}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 rounded-lg"
                    onError={(e) => e.target.src = 'default-image-url.jpg'}
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center justify-between mt-2">
                    <h6 className="font-['Lexend'] text-base md:text-lg flex-1 p-0 m-0">
                      {listing.title}
                    </h6>
                    {listing.location?.googleData && renderRating(listing.location.googleData)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-[#6B6B6B]" />
                    <p className="font-['Lexend'] text-sm">
                      {listing.city ? listing.city : 'Unknown'}, {listing.district}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <ResponsivePagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
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