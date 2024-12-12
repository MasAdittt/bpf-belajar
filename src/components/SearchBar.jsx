import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set, remove, query, orderByChild } from "firebase/database";
import { useAuth } from '../config/Auth';
import { styled } from '@stitches/react';

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
    const formRef = useRef(null);

  const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

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

  // Modified fetchRecommendations to filter by approved status
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
      const snapshot = await get(listingsRef);
      const results = [];

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const listing = child.val();
          // Validate listing data and check for approved status
          if (
            listing && 
            listing.title && 
            typeof listing.title === 'string' && 
            listing.status === 'approved' // Add status check
          ) {
            const normalizedListingTitle = normalizeText(listing.title);
            if (normalizedListingTitle.includes(searchTerm)) {
              results.push({
                id: child.key,
                title: listing.title,
                description: listing.description || '',
                city: listing.city || '',
                imageUrls: listing.imageUrls || [],
                category: listing.category || '',
                status: listing.status, // Include status in results
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
        return a.title.length - b.title.length;
      });

      setRecommendations(results.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Modified addListing to include status
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
      status: listingData.status || 'pending', // Add default status
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

  const saveToHistory = async (searchTerm) => {
    if (!user?.uid || !searchTerm.trim()) return;

    const db = getDatabase();
    const historyRef = ref(db, `users/${user.uid}/searchHistory`);

    try {
      const snapshot = await get(historyRef);
      let currentHistory = snapshot.exists() ? Object.values(snapshot.val()) : [];

      currentHistory = [searchTerm, ...currentHistory.filter(term => term !== searchTerm)]
        .slice(0, 5);

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
      navigate(`/pubtemplate/${id}`);
    } else if (searchTerm.trim() && searchTerm.length >= 2) {
      saveToHistory(searchTerm);
      setSearchQuery(searchTerm);
      navigate(`/public-listing?search=${encodeURIComponent(searchTerm.trim())}`);
    }
    setShowSuggestions(false);
  };

  const handleDeleteClick = (e, term) => {
    e.stopPropagation();
    deleteHistoryItem(term);
  };

  useEffect(() => {
    if (user?.uid) {
      fetchSearchHistory();
    }
  }, [user]);

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
<div className="relative w-full px-2 md:px-4 lg:pl-8 lg:pr-0 py-3 md:py-6">

<form 
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
          className='justfy-center'
        }} 
         >
        <div className="flex items-center w-full md:w-[586px] border rounded-lg overflow-hidden bg-white p-1 md:p-0" style={{border:"none"}}>
          <input
            type="text"
            placeholder="Find your favourite place"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            className="w-full py-2 px-2 md:py-3 md:px-3 text-sm md:text-base outline-none text-[#6B6B6B] placeholder:text-[#6B6B6B4D]"
            style={{
              fontFamily: 'Lexend',
              border: 'none',
              fontWeight: 300,
            }}
          />
          <button 
            type="submit" 
            disabled={searchQuery.length < 2}
            className="flex items-center justify-center flex-shrink-0 bg-[#1DA19E] hover:bg-[#178784] mx-1 md:mx-4"
            style={{ 
              outline: 'none',
              width: '28px',
              height: '28px',
              borderRadius: '8px'
            }}
          >
            <i className="fas fa-search text-xs md:text-sm text-white" style={{cursor:'pointer'}}></i>
          </button>
        </div>
      </form>

      {showSuggestions && searchQuery.length >= 2 && (
        <div 
          className="absolute bg-white mt-1 rounded-lg shadow-lg border border-gray-200 max-h-[60vh] overflow-y-auto z-50 w-[calc(100%-1rem)] md:w-[586px] left-2 md:left-4 lg:left-8"
        >
          {isLoading ? (
            <div className="p-2 md:p-4 text-center text-gray-500">
              <span className="text-xs md:text-sm">Mencari...</span>
            </div>
          ) : (
            <>
              {recommendations.length > 0 && (
                <div className="p-2">
                  <div className="text-xs md:text-sm text-gray-500 px-2 md:px-3 py-1">Saran Pencarian</div>
                  {recommendations.map((item) => (
                    <div
                      key={item.id}
                      className="px-2 md:px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between gap-2"
                      onClick={() => handleSearch(item.title, item.id)}
                    >
                      <div className="flex items-center flex-1 min-w-0 gap-2">
                        <i className="fas fa-search text-gray-400 text-xs"></i>
                        {Array.isArray(item.imageUrls) && item.imageUrls.length > 0 && (
                          <img 
                            src={item.imageUrls[0]} 
                            alt=""
                            className="w-6 h-6 md:w-8 md:h-8 object-cover rounded flex-shrink-0"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <span className="truncate text-xs md:text-sm" style={{fontFamily:'Quicksand', fontWeight:600, color:'#3A3A3A'}}>
                          {item.title}
                        </span>
                      </div>
                      {(item.city || item.category) && (
                        <span className="hidden md:block text-xs text-gray-400 truncate flex-shrink-0">
                          {[item.city, item.category].filter(Boolean).join(' - ')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {searchHistory.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="flex items-center justify-between px-2 md:px-3 py-1">
                    <div className="text-xs md:text-sm text-gray-500" style={{fontFamily:'Quicksand'}}>History</div>
                    <button
                      onClick={clearAllHistory}
                      className="text-xs md:text-sm text-blue-600 hover:text-blue-800"
                      style={{fontFamily:'Quicksand'}}
                    >
                      Hapus Semua
                    </button>
                  </div>
                  {searchHistory.map((term, index) => (
                    <div
                      key={`history-${index}`}
                      className="px-2 md:px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between group"
                      onClick={() => handleSearch(term)}
                    >
                      <div className="flex items-center flex-1 min-w-0 gap-2">
                        <i className="fas fa-history text-gray-400 text-xs md:text-sm flex-shrink-0"></i>
                        <span className="truncate text-xs md:text-sm">{term}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteClick(e, term)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-2 flex-shrink-0"
                      >
                        <i className="fas fa-times text-xs md:text-sm"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && recommendations.length === 0 && searchQuery.trim() !== '' && (
                <div className="p-2 md:p-4 text-center text-gray-500">
                  <span className="text-xs md:text-sm" style={{fontFamily:'Quicksand', color:'#6B6B6B'}}>
                    Tidak ada hasil ditemukan
                  </span>
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