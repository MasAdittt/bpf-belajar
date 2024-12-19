import React, { useEffect, useState, useMemo } from 'react';
import { ref, onValue, off, set } from 'firebase/database';
import { database } from '../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Menu, Phone, Instagram, Globe, X, Heart, MapPin } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import Navbaru from '../components/Navbaru';
import Bawah from '../components/Bawah';
import Loading from '../components/Loading';
import Visit from '../components/Visit';
import FilterCategory from '../components/FilterCategory';
import FeaturedPlace from '../components/Featured';
import LoginNotificationModal from '../kebutuhan/LoginNotif';
import LatestPlaces from '../components/Latest';
import pet from '../assets/image/pet.svg';

const ListingCard = ({ listing, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="listing-card relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-col lg:flex-row h-auto md:h-auto lg:h-[292px] bg-white"
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
                onToggleFavorite(listing.id);
              }}
              className="bg-gray-100 p-1.5 rounded-lg hover:bg-white transition-all"
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
            {listing.city}, {listing.district}  <span className="px-1 text-[#6B6B6B]">•</span>  {listing.businessHours ? `${listing.businessHours.opening} - ${listing.businessHours.closing}` : 'Hours Not Available'} WITA
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
  );
};
function PublicListing() {
  const [listings, setListings] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredListing, setFeaturedListing] = useState(null);
  const [favorites, setFavorites] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);


  useEffect(() => {
    if (!auth.currentUser) return;

    const favoritesRef = ref(database, `favorites/${auth.currentUser.uid}`);
    const favoritesListener = onValue(favoritesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setFavorites(data);
    });

    return () => off(favoritesRef, 'value', favoritesListener);
  }, [auth.currentUser]);

  const [currentPage, setCurrentPage] = useState(1);
const cardsPerPage = 6;

const getCurrentCards = (cards) => {
const indexOfLastCard = currentPage * cardsPerPage;
const indexOfFirstCard = indexOfLastCard - cardsPerPage;
return cards.slice(indexOfFirstCard, indexOfLastCard);
};
const PaginationButtons = ({ totalCards }) => {
const totalPages = Math.ceil(totalCards / cardsPerPage);

return (
  <div className="flex justify-center items-center mt-6 space-x-2">
    {[...Array(totalPages)].map((_, index) => (
      <button
        key={index}
        onClick={() => setCurrentPage(index + 1)}
        className={`px-3 py-1 md:px-4 md:py-2 rounded-lg transition-colors text-sm ${
          currentPage === index + 1 
            ? 'bg-[#1DA19E] text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        style={{fontFamily: 'Lexend'}}
      >
        {index + 1}
      </button>
    ))}
  </div>
);
};

  const handleToggleFavorite = async (listingId) => {
    if (!auth.currentUser) {
      setIsLoginModalOpen(true);
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

  useEffect(() => {
    // Get search term from URL
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }

    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [location]);

  useEffect(() => {
    const listingsRef = ref(database, 'listings/');
    setIsLoading(true);
    setError(null);

    const listingsListener = onValue(listingsRef, (snapshot) => {
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
        
        // Set the first listing as featured, or one with highest rating
        const featured = listingArray.reduce((prev, current) => 
          (current.averageRating > (prev?.averageRating || 0)) ? current : prev
        );
        setFeaturedListing(featured);
      } else {
        setListings([]);
        setFeaturedListing(null);
      }
      setIsLoading(false);
    }, (error) => {
      setError(error.message);
      setIsLoading(false);
    });

    return () => {
      off(listingsRef, 'value', listingsListener);
    };
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prevCategories => {
      if (prevCategories.includes(category)) {
        return prevCategories.filter(c => c !== category);
      } else {
        return [...prevCategories, category];
      }
    });
  };

  const shouldShowFeaturedAndLatest = useMemo(() => {
    return searchTerm === '' && selectedCategories.length === 0;
  }, [searchTerm, selectedCategories]);

  const handleClearSearch = () => {
    setSearchTerm('');
    navigate('/Public');
    setSelectedCategories([]);
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

  const calculateAverageRating = (reviews) => {
    if (!reviews || Object.keys(reviews).length === 0) return 0;
    const totalRating = Object.values(reviews).reduce((sum, review) => sum + review.rating, 0);
    return totalRating / Object.keys(reviews).length;
  };

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesCategories = selectedCategories.length === 0 || 
        selectedCategories.includes(listing.city) || 
        selectedCategories.includes(listing.category);

      const matchesSearch = searchTerm === '' || 
        listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.category?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategories && matchesSearch;
    });
  }, [listings, selectedCategories, searchTerm]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Navbaru />
      <div className="all-listings-container" style={{paddingTop:'100px'}}>
      <div className="xl:hidden mt-4 flex justify-center items-center w-full px-2">
  <div className="w-full xl:w-full">
    <FilterCategory 
      categories={[]}
      selectedCategories={selectedCategories}
      onCategoryChange={handleCategoryChange}
    />
  </div>
</div>
        <div className="listings-layout">
          
        <aside className="hidden xl:block  w-64 flex-shrink-0 px-4">
                                <FilterCategory 
                          categories={[]}
                          selectedCategories={selectedCategories}
                          onCategoryChange={handleCategoryChange}
                      />
                  </aside>
        
          <main className="listings-main">
          {shouldShowFeaturedAndLatest && (
<>
  {featuredListing && <FeaturedPlace listing={featuredListing} />}
  <LatestPlaces 
    listings={listings}
    onToggleFavorite={handleToggleFavorite}
    favorites={favorites}
  />
</>
)}
            {searchTerm && (
              <div className="search-results-header" style={{ 
                padding: '20px', 
                fontFamily: 'Quicksand',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h2 style={{fontFamily:'Lexend',fontWeight:500,fontSize:'20px',lineHeight:'24px',color:'#3A3A3A'}}>Search result for"{searchTerm}"</h2>
                </div>
                <button
                  onClick={handleClearSearch}
                  className="clear-search-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: 'none'
                  }}
                >
                  <X size={30} className="mr-2" />
                </button>
              </div>
            )}

            <div className="listings-grid" style={{
              display: 'flex',
              minHeight: '40vh',
              marginLeft:'7px'
            }}>
              {filteredListings.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  width:'100%',
                  margin:'0 auto',
                  maxWidth:'376px',
                  padding:'0 20px'
                }}>
                  <img 
                    src={pet}
                    alt="No listings found" 
                    style={{ 
                      width: '110px',
                      marginBottom: '20px'
                    }} 
                  />
                  <p style={{ fontFamily:'Lexend',color:'#3A3A3A33',lineHeight:'24px',fontSize: 'clamp(14px, 4vw, 16px)',wordBreak:'break-word' }}>
                    {searchTerm 
                      ? `Maaf, tidak ada hasil untuk pencarian "${searchTerm}"`
                      : 'Oops! It looks like there are no matching places. Try a different search or reset your filters.'}
                  </p>
                </div>
              ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 w-full">
                  {getCurrentCards(filteredListings).map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={!!favorites[listing.id]}
                    />
                  ))}
                </div>
                <PaginationButtons totalCards={filteredListings.length} />
              </>
            )}
            </div>
          </main>
        </div>
      </div>
      <Visit />
      <Bawah />
      <LoginNotificationModal 
    isOpen={isLoginModalOpen}
    onClose={() => setIsLoginModalOpen(false)}
  />
    </>
  );
}

export default PublicListing;

