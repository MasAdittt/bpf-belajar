import React, { useState, useEffect } from 'react';
import { ref, query, orderByChild, equalTo, onValue, update, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../components/Loading';

function Admin() {
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const listingsRef = ref(database, 'listings');
    const pendingQuery = query(listingsRef, orderByChild('status'), equalTo('pending'));
    
    const unsubscribe = onValue(pendingQuery, (snapshot) => {
      const listings = [];
      snapshot.forEach((childSnapshot) => {
        listings.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setPendingListings(listings);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pending listings:", error);
      toast.error("Failed to load pending listings");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const approveListing = (listingId) => {
    const listingRef = ref(database, `listings/${listingId}`);
    update(listingRef, { status: 'approved', isPublic: true })
      .then(() => {
        toast.success('Listing approved and published!');
        setPendingListings(prevListings => prevListings.filter(listing => listing.id !== listingId));
      })
      .catch((error) => {
        console.error("Error approving listing:", error);
        toast.error('Error approving listing. Please try again.');
      });
  };

  const rejectListing = (listingId) => {
    if (window.confirm("Are you sure you want to reject this listing? This action cannot be undone.")) {
      const listingRef = ref(database, `listings/${listingId}`);
      remove(listingRef)
        .then(() => {
          toast.success('Listing rejected and removed.');
          setPendingListings(prevListings => prevListings.filter(listing => listing.id !== listingId));
        })
        .catch((error) => {
          console.error("Error rejecting listing:", error);
          toast.error('Error rejecting listing. Please try again.');
        });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard - Pending Listings</h1>
      {pendingListings.length === 0 ? (
        <p className="text-lg text-gray-600">No pending listings at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition duration-300 ease-in-out transform hover:scale-105" onClick={() => navigate(`/PubTemplate/${listing.id}`)}>
              <div className="h-48 overflow-hidden">
                {listing.imageUrls && listing.imageUrls.length > 0 && (
                  <img src={listing.imageUrls[0]} alt="Listing preview" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">{listing.title}</h2>
                <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Category:</span> {listing.category}</p>
                <p className="text-sm text-gray-600 mb-1"><span className="font-medium">City:</span> {listing.city}</p>
                <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Description:</span> {listing.description.substring(0, 100)}...</p>
                <p className="text-sm text-gray-600 mb-4"><span className="font-medium">Submitted by:</span> {listing.userEmail}</p>
                
                <div className="flex justify-between">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      approveListing(listing.id);
                    }} 
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                  >
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      rejectListing(listing.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}   
        </div>
      )}
    </div>
  );
}

export default Admin;