import React, { useEffect, useState, useMemo } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { ref, onValue } from "firebase/database";
  import { database } from '../config/firebase';
  import { getAuth, onAuthStateChanged } from 'firebase/auth';
  import { Star, MapPin, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbaru from '../components/Navbaru';
  import Loading from '../components/Loading';
  import FilterCategory from '../components/FilterCategory';
  import pet from '../assets/image/pet.svg';
  import ResponsivePagination from '../components/ui/Page';

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
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    // Firebase Auth and Data Fetching Effects remain the same
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

    
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

      // Mobile-specific handlers
      const toggleMobileFilter = () => {
        setIsMobileFilterOpen(!isMobileFilterOpen);
    };


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
      // Reset to first page when category changes
      setCurrentPage(1);
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

   // Pagination calculations
const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
const paginatedListings = useMemo(() => {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  return filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
}, [filteredListings, currentPage]);
    // Pagination handler
    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };

    const renderPaginationButtons = () => {
      if (totalPages <= 1) return null;
  
      const buttons = [];
      const showEllipsis = totalPages > 5;
      
      // Always show first page
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`w-[40px] h-[33px] rounded-md transition-colors duration-200 font-['Quicksand'] text-[14px] flex items-center justify-center ${
            currentPage === 1
              ? 'bg-[#1DA19E] text-white border-0'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[1px] border-[#6B6B6B33]'
          }`}
          style={{ fontWeight: 600 }}
        >
          1
        </button>
      );
  
      if (showEllipsis) {
        let leftEllipsis = currentPage > 4;
        let rightEllipsis = currentPage < totalPages - 3;
  
        if (leftEllipsis) {
          buttons.push(
            <span key="left-ellipsis" className="px-2 text-gray-700">
              ...
            </span>
          );
        }
  
        // Show pages around current page
        let start, end;
      
        if (currentPage <= 3) {
          start = 2;
          end = 3;
        } else if (currentPage >= totalPages - 2) {
          start = totalPages - 2;
          end = totalPages - 1;
        } else {
          start = currentPage;
          end = currentPage + 1;
        }
    
        for (let i = start; i <= end; i++) {
          buttons.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`w-[40px] h-[33px] rounded-md transition-colors duration-200 font-['Quicksand'] text-[14px] flex items-center justify-center ${
                currentPage === i
                  ? 'bg-[#1DA19E] text-white border-0'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[1px] border-[#6B6B6B33]'
              }`}
              style={{ fontWeight: 600 }}
            >
              {i}
            </button>
          );
        }
  
        if (rightEllipsis) {
          buttons.push(
            <span key="right-ellipsis" className="px-2 text-gray-700">
              ...
            </span>
          );
        }
      } else {
        // If few pages, show all
        for (let i = 2; i < totalPages; i++) {
          buttons.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`w-[40px] h-[33px] rounded-md transition-colors duration-200 font-['Quicksand'] text-[14px] flex items-center justify-center ${
                currentPage === i
                  ? 'bg-[#1DA19E] text-white border-0'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[1px] border-[#6B6B6B33]'
              }`}
              style={{ fontWeight: 600 }}
            >
              {i}
            </button>
          );
        }
      }
  
      // Always show last page
      if (totalPages > 1) {
        buttons.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className={`w-[40px] h-[33px] rounded-md transition-colors duration-200 font-['Quicksand'] text-[14px] flex items-center justify-center ${
              currentPage === totalPages
                ? 'bg-[#1DA19E] text-white border-0'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[1px] border-[#6B6B6B33]'
            }`}
            style={{ fontWeight: 600 }}
          >
            {totalPages}
          </button>
        );
      }
  
      return (
        <div className="flex justify-center items-center flex-wrap gap-3 mt-8 mb-6">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-[40px] h-[33px] rounded-md transition-colors duration-200 flex items-center justify-center ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[1px] border-[#6B6B6B33]'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          
          {buttons}
          
          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`w-[40px] h-[33px] rounded-md transition-colors duration-200 flex items-center justify-center ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[1px] border-[#6B6B6B33]'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      );
    };

    if (isLoading) return <Loading />;
    if (error) return <div>Error: {error.message}</div>;
    if (!user) return <div>Anda harus login untuk mengakses halaman ini.</div>;
    

    return (
        <div className="min-h-screen flex flex-col">
        <div className="flex-grow w-full">
          {/* Mobile Filter - Only visible on mobile */}
          <div className="xl:hidden mt-4 flex justify-center items-center w-full px-2 md:px-7">
  <div className="w-full xl:w-full">
    <FilterCategory 
      categories={[]}
      selectedCategories={selectedCategories}
      onCategoryChange={handleCategoryChange}
    />
  </div>
</div>
                
              <div className="flex flex-col md:flex-row" style={{marginTop:'20px'}}>
                  {/* Desktop Sidebar - Hidden on mobile */}
                  <aside className="hidden xl:block w-64 flex-shrink-0 px-4">
                      <FilterCategory 
                          categories={[]}
                          selectedCategories={selectedCategories}
                          onCategoryChange={handleCategoryChange}
                      />
                  </aside>
                  
                  <main className="flex-grow px-4 lg:px-2 md:px-7">
                      {searchTerm && (
                          <div className="px-4 py-5 font-['Quicksand']">
                              <h2 className="text-xl font-semibold">Hasil pencarian untuk "{searchTerm}"</h2>
                              <p className="text-gray-600">{filteredListings.length} hasil ditemukan</p>
                          </div>
                      )}
                      
                      <div className="flex justify-center items-center min-h-[40vh]">
                          {filteredListings.length === 0 ? (
                              <div className="flex flex-col items-center justify-center text-center w-full max-w-md mx-auto">
                                  <img 
                                      src={pet} 
                                      alt="No listings found" 
                                      className="w-28 md:w-40 mb-6 mt-20"
                                  />
                                  <p 
                                      className="text-base md:text-lg"
                                      style={{
                                          fontFamily:'Lexend',
                                          color:'#3A3A3A33'
                                      }}
                                  >
                                      {searchTerm 
                                          ? `Maaf, tidak ada hasil untuk pencarian "${searchTerm}"`
                                          : 'You havent added any listings yet. Click "Add Listing" and start adding places to showcase them here!'}
                                  </p>
                              </div>
                          ) : (
                              <div className="w-full space-y-4">
                                  {paginatedListings.map((listing) => (
                                      <div 
                                          key={listing.id}
                                          className="listing-card relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row h-auto md:h-[292px] bg-white" style={{borderRadius:'16px'}}
                                      >
                                          {/* Mobile & Desktop Image Section */}
                                          <div className="w-full md:w-96 flex-shrink-0">
                                              <div className="relative h-48 md:h-full">
                                                  <img 
                                                      src={listing.imageUrls?.[0] || '/placeholder-image.jpg'} 
                                                      alt={listing.title} 
                                                      className="w-full h-full object-cover" style={{borderRadius:'16px'}}
                                                  />
                                                  
                                                  {/* Category Badge */}
                                                  <div className="absolute top-4 left-4 flex gap-2">
                                                      <div 
                                                          className="bg-gray-100 px-3 py-1 rounded-lg text-sm"
                                                          style={{fontFamily: 'Lexend'}}
                                                      >
                                                          {listing.category}
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      
                                          {/* Content Section */}
                                        <div className="flex-grow flex flex-col p-4 md:p-4 lg:p-6">
                                            <div className="flex flex-col -space-y-1">
                                              <h3 
                                                className="text-lg md:text-xl font-medium mb-3"
                                                style={{fontFamily: 'Lexend'}}
                                              >
                                                {listing.title}
                                              </h3>
                                              
                                              <div className="flex items-center ">
                                                <MapPin size={12} color="#6B6B6B" className="mr-1" />
                                                <span 
                                         className="text-xs md:text-sm leading-none pb-1"  style={{
                                                    fontFamily: 'Lexend',
                                                    color: '#6B6B6B',
                                                    fontWeight: 300
                                                  }}
                                                >
                                                  {listing.city}, {listing.district}  <span className="px-1 text-[#6B6B6B]">•</span>  {listing.businessHours ? `${listing.businessHours.opening} - ${listing.businessHours.closing}` : 'Hours Not Available'} WITA
                                                </span>
                                              </div>
                                        
                                              <p 
                                         className="text-xs md:text-sm leading-none pb-3"    style={{
                                                  fontFamily: 'Lexend',
                                                  color: '#6B6B6B',
                                                  fontWeight: 300
                                                }}
                                              >
                                                {listing.foodCategory}, {listing.halalStatus}
                                              </p>
                                        
                                              {/* <p 
                                                className="text-xs md:text-sm line-clamp-3 leading-tight p-0 pb-5"
                                                style={{
                                                  fontFamily: 'Lexend',
                                                  color: '#6B6B6B',
                                                  fontWeight: 300
                                                }}
                                              >
                                                "{listing.tags}"
                                              </p> */}
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
                                                  onClick={() => navigate(`/Private/${listing.id}`)}
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
                                  
                                  {totalPages > 1 && (
  <ResponsivePagination 
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={handlePageChange}
  />
)}
                              </div>
                          )}
                      </div>
                  </main>
              </div>
          </div>
      </div>
  );
}

export default AllListings;