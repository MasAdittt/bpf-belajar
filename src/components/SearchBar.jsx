import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set, remove, query, orderByChild, startAt, endAt, push } from "firebase/database";
import { useAuth } from '../config/Auth';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchRef = useRef(null);
  const timeoutIdRef = useRef(null);

  // Improved normalize text function to handle edge cases
  const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // Fetch search history from Firebase
  const fetchSearchHistory = async () => {
    if (!user?.uid) return;

    const db = getDatabase();
    const historyRef = ref(db, `users/${user.uid}/searchHistory`);

    try {
      const snapshot = await get(historyRef);
      if (snapshot.exists()) {
        const history = snapshot.val();
        setSearchHistory(Array.isArray(history) ? history : Object.values(history));
      } else {
        setSearchHistory([]);
      }
    } catch (error) {
      console.error("Error fetching search history:", error);
      setSearchHistory([]);
    }
  };

  // Modified fetchRecommendations function with improved search
  const fetchRecommendations = async (input) => {
    if (!input || input.length < 2) {
      setRecommendations([]);
      return;
    }

    setIsLoading(true);
    const db = getDatabase();
    const listingsRef = ref(db, 'listings');
    const searchTerm = normalizeText(input);

    try {
      // Get all listings and filter on client side
      const snapshot = await get(listingsRef);
      const results = [];

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const listing = child.val();
          // Validate listing data
          if (listing && listing.title && typeof listing.title === 'string') {
            const normalizedListingTitle = normalizeText(listing.title);
            // Check if the normalized title includes our search term
            if (normalizedListingTitle.includes(searchTerm)) {
              results.push({
                id: child.key,
                title: listing.title,
                description: listing.description || '',
                city: listing.city || '',
                imageUrls: listing.imageUrls || [],
                category: listing.category || '',
                normalizedTitle: normalizedListingTitle
              });
            }
          }
        });
      }

      // Sort results by relevance (exact matches first)
      results.sort((a, b) => {
        const aExact = a.normalizedTitle === searchTerm;
        const bExact = b.normalizedTitle === searchTerm;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.title.length - b.title.length; // Shorter titles first
      });

      setRecommendations(results.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add data validation before saving to Firebase
  const addListing = async (listingData) => {
    if (!listingData.title || typeof listingData.title !== 'string') {
      console.error('Invalid listing data: title is required and must be a string');
      return;
    }
    
    const db = getDatabase();
    const listingsRef = ref(db, 'listings');
    const newListingRef = push(listingsRef);
    
    const normalizedTitle = normalizeText(listingData.title);
    
    const validatedData = {
      title: listingData.title,
      description: listingData.description || '',
      userEmail: listingData.userEmail || '',
      city: listingData.city || '',
      category: listingData.category || '',
      normalizedTitle,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      await set(newListingRef, validatedData);
      return newListingRef.key;
    } catch (error) {
      console.error('Error adding listing:', error);
      throw error;
    }
  };

  // Save search term to history
  const saveToHistory = async (searchTerm) => {
    if (!user?.uid || !searchTerm.trim()) return;

    const db = getDatabase();
    const historyRef = ref(db, `users/${user.uid}/searchHistory`);

    try {
      const snapshot = await get(historyRef);
      let currentHistory = snapshot.exists() ? Object.values(snapshot.val()) : [];

      // Add new term and remove duplicates
      currentHistory = [searchTerm, ...currentHistory.filter(term => term !== searchTerm)]
        .slice(0, 5);

      // Save as object format for validation rules
      const historyObject = {};
      currentHistory.forEach((term, index) => {
        historyObject[`item${index}`] = term;
      });

      await set(historyRef, historyObject);
      setSearchHistory(currentHistory);
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };

  // Delete single history item
  const deleteHistoryItem = async (termToDelete) => {
    if (!user?.uid) return;

    const db = getDatabase();
    const historyRef = ref(db, `users/${user.uid}/searchHistory`);

    try {
      const updatedHistory = searchHistory.filter(term => term !== termToDelete);
      const historyObject = {};
      updatedHistory.forEach((term, index) => {
        historyObject[`item${index}`] = term;
      });

      await set(historyRef, historyObject);
      setSearchHistory(updatedHistory);
    } catch (error) {
      console.error("Error deleting history item:", error);
    }
  };

  // Clear all search history
  const clearAllHistory = async () => {
    if (!user?.uid) return;

    const db = getDatabase();
    const historyRef = ref(db, `users/${user.uid}/searchHistory`);

    try {
      await remove(historyRef);
      setSearchHistory([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  // Handle input changes with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    timeoutIdRef.current = setTimeout(() => {
      fetchRecommendations(value);
    }, 300);
  };

  

  const handleSearch = (term, id) => {
    const searchTerm = term || searchQuery;
    if (id) {
      // Jika ID tersedia (klik suggestion), navigasi ke pubtemplate
      navigate(`/pubtemplate/${id}`);
    } else if (searchTerm.trim() && searchTerm.length >= 2) {
      // Jika tidak ada ID (pencarian manual), navigasi ke PublicListing dengan query
      saveToHistory(searchTerm);
      setSearchQuery(searchTerm);
      navigate(`/public-listing?search=${encodeURIComponent(searchTerm.trim())}`);
    }
    setShowSuggestions(false);
  };

  // Handle delete click with event propagation prevention
  const handleDeleteClick = (e, term) => {
    e.stopPropagation();
    deleteHistoryItem(term);
  };

  // Effect for initial history fetch
  useEffect(() => {
    if (user?.uid) {
      fetchSearchHistory();
    }
  }, [user]);

  // Effect for click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }} 
        className="search-nav flex items-center bg-white shadow-sm border border-gray-200"
      >
        <button 
          type="submit" 
          disabled={searchQuery.length < 2}
          className={`p-2 ${searchQuery.length < 2 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
          style={{ outline: 'none' }}
        >
          <i className="fas fa-search"></i>
        </button>
        <input
          type="text"
          placeholder="Minimal 2 karakter untuk mencari..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          className="w-full p-2 outline-none rounded-r-lg"
        />
      </form>

      {showSuggestions && searchQuery.length >= 2 && (
        <div className="absolute w-full bg-white mt-1 rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <span>Mencari...</span>
            </div>
          ) : (
            <>
              {recommendations.length > 0 && (
                <div className="p-2">
                  <div className="text-sm text-gray-500 px-3 py-1">Saran Pencarian</div>
                  {recommendations.map((item) => (
                    <div
                      key={item.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                      onClick={() => handleSearch(item.title, item.id)} // Pass both title and id
                    >
                      <div className="flex items-center">
                        <i className="fas fa-search text-gray-400 mr-2"></i>
                        {Array.isArray(item.imageUrls) && item.imageUrls.length > 0 && (
                                 <img 
                  src={item.imageUrls[0]} 
                          alt=""
                  className="w-8 h-8 object-cover rounded mr-2"
                  onError={(e) => e.target.style.display = 'none'}
                        />
                                    )}
                        <span style={{fontFamily:'Quicksand', fontWeight:600, color:'#3A3A3A'}}>{item.title}</span>
                      </div>
                      {(item.city || item.category) && (
        <span className="text-sm text-gray-400">
          {[item.city, item.category].filter(Boolean).join(' - ')}
        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {searchHistory.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="flex items-center justify-between px-3 py-1">
                    <div className="text-sm text-gray-500">Riwayat Pencarian</div>
                    <button
                      onClick={clearAllHistory}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Hapus Semua
                    </button>
                  </div>
                  {searchHistory.map((term, index) => (
                    <div
                      key={`history-${index}`}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between group"
                      onClick={() => handleSearch(term)}
                    >
                      <div className="flex items-center flex-grow">
                        <i className="fas fa-history text-gray-400 mr-2"></i>
                        {term}
                      </div>
                      <button
                        onClick={(e) => handleDeleteClick(e, term)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && recommendations.length === 0 && searchQuery.trim() !== '' && (
                <div className="p-4 text-center text-gray-500">
                  <span>Tidak ada hasil ditemukan</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;