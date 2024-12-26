import React, { useState, useEffect } from 'react';
import { ref, onValue, off, set, get } from 'firebase/database';
import { database } from '../config/firebase';
import { Heart, MapPin, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { MoveRight, MoveLeft } from 'lucide-react';
import LoginNotificationModal from '../kebutuhan/LoginNotif';

const FeaturedPlaceCard = ({ listing, onClick, isFavorite, onToggleFavorite, clickCount }) => {
  return (
    <div 
      className="w-full md:flex-1 relative group cursor-pointer min-w-[300px] md:min-w-[374px] mb-4 md:mb-0"
      onClick={onClick}
    >
      <div className="relative h-[200px] md:h-[232px] rounded-lg overflow-hidden">
        <img
          src={listing.imageUrls?.[0] || '/api/placeholder/400/300'}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-[10px] md:px-[14px] py-[4px] md:py-[6px] bg-white text-xs md:text-sm font-medium" 
                style={{borderRadius:'6px',fontFamily:'Lexend',color:'#3A3A3A'}}>
            {listing.category}
          </span>
        </div>

        <div className="absolute top-4 right-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(listing.id);
            }}
            className="p-1 bg-white/80 hover:bg-white transition-colors"
            style={{borderRadius:'6px'}}
          >
            <div className="flex items-center justify-center">
              <Heart 
                size={16}
                className={`transition-colors ${
                  isFavorite ? "text-red-500 fill-current" : "text-gray-600"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
          <h3 className="text-base md:text-xl" style={{fontFamily:'Lexend',fontWeight:500}}>{listing.title}</h3>
          <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <MapPin className="w-3 h-3 md:w-4 md:h-4" />
            <span style={{fontFamily:'Lexend',color:'#F2F2F2'}}>{listing.city}</span>
          </div>
          <p className="text-xs md:text-sm opacity-90 line-clamp-2 font-lexend">"{listing.tags}"</p> 
        </div>
      </div>
    </div>
  );
};
const Featuredbawah = () => {
    const [featuredListings, setFeaturedListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState({});
    const [clickCounts, setClickCounts] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();
    const auth = getAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
    // Responsive items per page
    const getItemsPerPage = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) return 1; // mobile
        if (window.innerWidth < 1024) return 2; // tablet
        return 3; // desktop
      }
      return 3; // default
    };
  
    const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());
  
    useEffect(() => {
      const handleResize = () => {
        setItemsPerPage(getItemsPerPage());
      };
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    useEffect(() => {
      if (!auth.currentUser) return;
  
      const favoritesRef = ref(database, `favorites/${auth.currentUser.uid}`);
      const favoritesListener = onValue(favoritesRef, (snapshot) => {
        const data = snapshot.val() || {};
        setFavorites(data);
      });
  
      return () => off(favoritesRef, 'value', favoritesListener);
    }, [auth.currentUser]);
  
    const fetchClicksForListing = async (listingId) => {
      try {
        const clicksRef = ref(database, `listings/${listingId}/clicks`);
        const snapshot = await get(clicksRef);
        
        if (snapshot.exists()) {
          const clickData = snapshot.val();
          let totalClickCount = 0;
          
          Object.entries(clickData).forEach(([dateKey, dateData]) => {
            if (dateKey !== 'lastUpdated') {
              totalClickCount += dateData.count || 0;
            }
          });
          
          return totalClickCount;
        }
        return 0;
      } catch (error) {
        console.error('Error fetching clicks for listing:', error);
        return 0;
      }
    };
  
    useEffect(() => {
      const listingsRef = ref(database, 'listings/');
      
      const unsubscribe = onValue(listingsRef, async (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const processedListings = Object.entries(data)
              .map(([id, listing]) => ({
                id,
                ...listing
              }))
              .filter(listing => 
                listing && 
                listing.isPublic === true && 
                listing.status === 'approved'
              );
  
            const clickPromises = processedListings.map(async (listing) => {
              const clicks = await fetchClicksForListing(listing.id);
              return { ...listing, totalClicks: clicks };
            });
  
            const listingsWithClicks = await Promise.all(clickPromises);
            
            const sortedListings = listingsWithClicks
              .sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0));
  
            const clickCountsObj = {};
            sortedListings.forEach(listing => {
              clickCountsObj[listing.id] = listing.totalClicks;
            });
  
            setFeaturedListings(sortedListings);
            setClickCounts(clickCountsObj);
          }
          setLoading(false);
        } catch (error) {
          console.error('Error processing listings data:', error);
          setLoading(false);
          setFeaturedListings([]);
        }
      });
  
      return () => unsubscribe();
    }, []);
  
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
  
    const handleListingClick = (listingId) => {
      navigate(`/PubTemplate/${listingId}`);
    };
  
    const handleNext = () => {
      if (featuredListings.length <= itemsPerPage) return;
      
      const nextIndex = currentIndex + itemsPerPage;
      if (nextIndex >= featuredListings.length) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(nextIndex);
      }
    };
  
    const handlePrev = () => {
      if (featuredListings.length <= itemsPerPage) return;
      
      const prevIndex = currentIndex - itemsPerPage;
      if (prevIndex < 0) {
        const lastValidIndex = Math.floor((featuredListings.length - 1) / itemsPerPage) * itemsPerPage;
        setCurrentIndex(lastValidIndex);
      } else {
        setCurrentIndex(prevIndex);
      }
    };
  
    if (loading) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
          <div className="animate-pulse">
            <div className="h-6 md:h-8 bg-gray-200 rounded w-1/4 mb-4 md:mb-6"></div>
            <div className="flex flex-col md:flex-row gap-4">
              {[...Array(itemsPerPage)].map((_, i) => (
                <div key={i} className="flex-1 h-48 md:h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  
    const visibleListings = featuredListings.slice(currentIndex, currentIndex + itemsPerPage);
    const displayListings = [...visibleListings];
    if (displayListings.length < itemsPerPage && featuredListings.length > 0) {
      const remainingCount = itemsPerPage - displayListings.length;
      const additionalListings = featuredListings.slice(0, remainingCount);
      displayListings.push(...additionalListings);
    }
  
    return (
        <>
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
        <h2 className="mb-4 md:mb-6 text-xl md:text-2xl" 
            style={{fontFamily:'Lexend',color:'#3A3A3A',fontWeight:500}}>
          See Featured Places
        </h2>
        
        <div className="relative">
          <div className="flex flex-col md:flex-row gap-4">
            {displayListings.map((listing) => (
              <FeaturedPlaceCard
                key={listing.id}
                listing={listing}
                onClick={() => handleListingClick(listing.id)}
                isFavorite={!!favorites[listing.id]}
                onToggleFavorite={handleToggleFavorite}
                clickCount={clickCounts[listing.id]}
              />
            ))}
          </div>
          
          {featuredListings.length > itemsPerPage && (
            <div className="flex justify-center gap-2 mt-4 md:mt-[40px]">
              <button
                onClick={handlePrev}
                className="p-1.5 md:p-2 bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                style={{borderRadius:'10px'}}
              >
                 <MoveLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 md:p-2 bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                style={{borderRadius:'10px'}}
              >
               <MoveRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
      <LoginNotificationModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      </>
    );
  };
  
  export default Featuredbawah;