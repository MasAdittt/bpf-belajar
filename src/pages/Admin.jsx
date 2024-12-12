import React, { useState, useEffect } from 'react';
import { ref, query, orderByChild, equalTo, onValue, update, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import AdminDashboard from './AdminDashboard';
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
    
   <>
      <ToastContainer />
      <AdminDashboard />
      </>
  );
}

export default Admin;