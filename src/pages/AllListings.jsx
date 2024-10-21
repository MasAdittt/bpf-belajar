  import React, { useEffect, useState, useMemo } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { ref, onValue } from "firebase/database";
  import { database } from '../config/firebase';
  import { getAuth, onAuthStateChanged } from 'firebase/auth';
  import Navbaru from '../components/Navbaru';
  import Loading from '../components/Loading';
  import '../style/All.css';
  import Bawah from '../components/Bawah';
  import FilterCategory from '../components/FilterCategory';

  function AllListings() {
    const [listings, setListings] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const auth = getAuth();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });

      return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
      if (!user) return;

      const listingsRef = ref(database, 'listings');
      setIsLoading(true);

      const unsubscribe = onValue(listingsRef, (snapshot) => {
        setIsLoading(false);
        const data = snapshot.val();
        console.log("Data dari Firebase:", data);

        if (data) {
          const listingsArray = Object.entries(data).map(([id, value]) => ({ id, ...value }));
          const userListings = listingsArray.filter((listing) => listing.userEmail === user.email);
          setListings(userListings);

          const uniqueCategories = [...new Set(userListings.map(listing => listing.category))];
          setCategories(['All', ...uniqueCategories]);
        } else {
          setListings([]);
          setCategories(['All']);
        }
      }, (error) => {
        setIsLoading(false);
        setError(error);
        console.error("Error fetching listings:", error);
      });

      return () => unsubscribe();
    }, [user]);

    const handleCategoryChange = (category) => {
      setSelectedCategories(prevCategories => {
        if (category === 'All') {
          return ['All'];
        }
        const newCategories = prevCategories.includes(category)
          ? prevCategories.filter(c => c !== category)
          : [...prevCategories.filter(c => c !== 'All'), category];
        return newCategories.length ? newCategories : ['All'];
      });
    };

    const filteredListings = useMemo(() => {
      let result = listings;
      if (selectedCategories.length > 0 && !selectedCategories.includes('All')) {
        result = result.filter(listing => 
          selectedCategories.includes(listing.category) || 
          selectedCategories.includes(listing.city)
        );
      }
      if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        result = result.filter(listing =>
          listing.title.toLowerCase().includes(lowercasedTerm) ||
          listing.description.toLowerCase().includes(lowercasedTerm)
        );
      }
      return result;
    }, [selectedCategories, listings, searchTerm]);

    const navigateToListing = (listingId) => {
      navigate(`/baru/${listingId}`);
    };

    if (isLoading) return <Loading />;
    if (error) return <div>Error: {error.message}</div>;
    if (!user) return <div>Anda harus login untuk mengakses halaman ini.</div>;

    return (
      <>
        <Navbaru />
        <div className="all-listings-container">
            <div className="judul-all">
                <h1>My Listings</h1>
              </div>
          <div className="listings-layout">
            <aside className="filter-sidebar">
              <FilterCategory 
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />
            </aside>
            <main className="listings-main">
            
              <div className="listings-grid" style={{ gap:'14px' }}>
                {filteredListings.map(listing => (
                  <div 
                    key={listing.id} 
                    className={`listing-card ${listing.isPosted ? 'posted' : ''}`} 
                    onClick={() => navigateToListing(listing.id)}
                    style={{ height:'252px' }}
                  >
                    <div className="listing-gambar">
                      <img src={listing.imageUrls?.[0] || 'default-image-url.jpg'} alt={listing.title} />
                    </div>                 
                    <div className="listing-info">
                      <h3 style={{ fontWeight:700, fontSize:'20px', lineHeight:'24px' }}>{listing.title}</h3>
                      <p>{listing.city} {listing.category}</p>
                      <p>{listing.description}</p>
                      <div className="listing-footer">
                        <span>{listing.time}</span>
                        <span>{listing.cuisine}</span>
                      </div>
                     
      
                      <div className="see-more-container">
      <button className="see-more-btn">Settings</button>
    </div>                  </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
        <Bawah />
      </>
    );
  }

  export default AllListings;