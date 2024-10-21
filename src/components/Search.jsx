import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getDatabase, ref, get, query, orderByChild, startAt, endAt } from "firebase/database";

function SearchResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('query');

    if (searchQuery) {
      searchListings(searchQuery);
    }
  }, [location]);

  const searchListings = async (searchQuery) => {
    setLoading(true);
    const db = getDatabase();
    const listingsRef = ref(db, 'listings');
    const searchTerm = searchQuery.toLowerCase();
    
    try {
      const queryRef = query(
        listingsRef,
        orderByChild('title'),
        startAt(searchTerm),
        endAt(searchTerm + "\uf8ff")
      );

      const snapshot = await get(queryRef);
      
      if (snapshot.exists()) {
        const listings = [];
        snapshot.forEach((childSnapshot) => {
          listings.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        setResults(listings);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error searching listings:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Search Results</h2>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : results.length > 0 ? (
        <div className="grid gap-6">
          {results.map((listing) => (
            <div 
              key={listing.id} 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
              <p className="text-gray-600">{listing.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">
          <p>No results found.</p>
        </div>
      )}
    </div>
  );
}

export default SearchResults;