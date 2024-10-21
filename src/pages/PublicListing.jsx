import React, { useEffect, useState, useMemo } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';
import Navbaru from '../components/Navbaru';
import Bawah from '../components/Bawah';
import VisitPub from '../components/VisitPub';
import Loading from '../components/Loading';
import FilterCategory from '../components/FilterCategory';
import '../style/All.css';

function PublicListing() {
  const [listings, setListings] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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
      } else {
        setListings([]);
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
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.category.toLowerCase().includes(searchTerm.toLowerCase());

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
      <div className="all-listings-container">
        <div className="listings-layout">
          <aside className="filter-sidebar">
            <FilterCategory 
              categories={[]}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
            />
          </aside>
          <main className="listings-main">
            {searchTerm && (
              <div className="search-results-header" style={{ padding: '20px', fontFamily: 'Quicksand' }}>
                <h2>Hasil pencarian untuk "{searchTerm}"</h2>
                <p>{filteredListings.length} hasil ditemukan</p>
              </div>
            )}
            <div className="listings-grid" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '40vh',
              
            }}>
              {filteredListings.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}>
                  <img 
                    src='./src/assets/image/Problem.svg' 
                    alt="No listings found" 
                    style={{ 
                      width: '300px',
                      marginBottom: '20px'
                    }} 
                  />
                  <p style={{ fontFamily:'Quicksand' }}>
                    {searchTerm 
                      ? `Maaf, tidak ada hasil untuk pencarian "${searchTerm}"`
                      : 'Maaf, Listing yang anda cari saat ini belum tersedia'}
                  </p>
                </div>
              ) : (
                filteredListings.map((listing) => (
                  <div 
                    key={listing.id} 
                    className="listing-card" 
                    style={{ height: '252px' }}
                  >
                    <div className="listing-gambar">
                      <img 
                        src={listing.imageUrls?.[0] || 'default-image-url.jpg'} 
                        alt={listing.title} 
                        onError={(e) => e.target.src = 'default-image-url.jpg'}
                      />
                    </div>
                    <div className="listing-info" style={{paddingTop:'20px', paddingBottom:'15px'}}>
                      <h3 style={{ fontWeight: 700, fontSize: '25px', lineHeight: '24px' }}>{listing.title}</h3>
                      <div>
                        <p>{listing.city} - {listing.category}</p>
                        <p>"{listing.tags}"</p>
                      </div>
                      <div className="listing-footer">
                        <span>{listing.time}</span>
                        <span>{listing.cuisine}</span>
                        <div className="flex items-center" style={{ paddingTop:'8px', fontFamily:'Quicksand', paddingRight:'5px',width:'450px'}}>
                          {renderStars(listing.averageRating)}
                          <p className="flex items-center" style={{ fontSize: '14px',color: '#666666', marginLeft:'15px'}}>
                            {listing.reviews ? Object.keys(listing.reviews).length : 0} Reviews
                          </p>
                          <button 
                            className="see-more-btn" 
                            style={{
                              cursor:'pointer',
                            }}
                            onClick={() => navigate(`/PubTemplate/${listing.id}`)}
                          >
                            See More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
      <VisitPub />
      <Bawah />
    </>
  );
}

export default PublicListing;