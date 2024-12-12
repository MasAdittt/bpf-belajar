import React, { useState, useEffect } from 'react';
import { ref, onValue, off, set, get } from 'firebase/database';
import { database } from '../config/firebase';
import { Heart, MapPin, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import LoginNotificationModal from '../kebutuhan/LoginNotif';
const FeaturedPlaceCard = ({ listing, onClick, isFavorite, onToggleFavorite, clickCount }) => {
  return (
    <div 
      className="relative rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
    >
      <div className="relative h-[268px] w-full">
        <img
          src={listing.imageUrls?.[0] || '/api/placeholder/400/320'}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-[#F2F2F2]" 
          style={{padding:'4px 14px',borderRadius:'8px',fontSize:'14px',fontFamily:'Lexend'}}>
          {listing.category}
        </div>

        {/* View Count Badge */}
        <div className="absolute top-4 left-32 bg-[#F2F2F2] flex items-center gap-1" 
          style={{padding:'4px 14px',borderRadius:'8px',fontSize:'14px',fontFamily:'Lexend'}}>
          <Eye size={16} />
          {clickCount || 0}
        </div>

        {/* Heart Icon Container */}
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

        {/* Content Overlay */}
        <div className="absolute left-0 right-0 text-white" style={{ bottom: '20px', padding: '0 20px' }}>
          <h3 style={{
            fontFamily:'Quicksand',
            fontWeight:700,
            fontSize:'20px',
            lineHeight:'24px',
            color:'#F2F2F2',
            paddingBottom:'4px'
          }}>
            {listing.title}
          </h3>
          <div className="flex items-center text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span style={{
              fontSize:'12px',
              color:'#F2F2F2',
              fontWeight:600,
              lineHeight:'18px',
              fontFamily:'Quicksand'
            }}>
              {listing.city}
            </span>
          </div>
          <p className="text-sm text-white/90 line-clamp-2" style={{
            fontFamily:'Quicksand',
            fontWeight:500,
            lineHeight:'18px'
          }}>
            "{listing.tags}"
          </p>
        </div>
      </div>
    </div>
  );
};

const FeaturedPlaces = () => {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const [clickCounts, setClickCounts] = useState({});
  const [totalViews, setTotalViews] = useState(0);
  const [averageViews, setAverageViews] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (!auth.currentUser) return;

    // Load user's favorites
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

          // Fetch click counts for each listing
          const clickPromises = processedListings.map(async (listing) => {
            const clicks = await fetchClicksForListing(listing.id);
            return { ...listing, totalClicks: clicks };
          });

          const listingsWithClicks = await Promise.all(clickPromises);
          
          // Sort by total clicks and take top 4
          const sortedListings = listingsWithClicks
            .sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0))
            .slice(0, 4);

          // Calculate totals
          const clickCountsObj = {};
          let totalClickCount = 0;
          
          sortedListings.forEach(listing => {
            clickCountsObj[listing.id] = listing.totalClicks;
            totalClickCount += listing.totalClicks;
          });

          const avgClicks = sortedListings.length > 0 
            ? Math.round((totalClickCount / sortedListings.length) * 10) / 10 
            : 0;

          setFeaturedListings(sortedListings);
          setClickCounts(clickCountsObj);
          setTotalViews(totalClickCount);
          setAverageViews(avgClicks);
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
      setIsModalOpen(true);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4" style={{marginTop:'10px',paddingBottom:'40px'}}>
      <div className="mb-6">
        <h2 style={{ fontFamily: 'Lexend',fontSize:'20px',fontWeight:500,lineHeight:'24px',color:'#3A3A3A' }}>
          Featured place
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredListings.map((listing) => (
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

      <LoginNotificationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default FeaturedPlaces;