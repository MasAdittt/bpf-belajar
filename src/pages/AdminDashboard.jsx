import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, query, orderByChild, equalTo, onValue, update, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`flex h-screen bg-gray-100 ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ToastContainer />
      
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 flex-shrink-0 ${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
        <div className="p-4">
          <Link to="/" className="text-xl font-bold">Admin Dashboard</Link>
        </div>
        <nav className="mt-8">
          <Link to="/admin" className="block py-2 px-4 text-sm hover:bg-gray-700">Dashboard</Link>
          {/* Add more menu items here */}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between p-4">
            <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none focus:text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center">
              {/* Add user profile or other navbar items here */}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <h3 className="text-gray-700 text-3xl font-medium">Pending Listings</h3>
            
            <div className="mt-8">
              {loading ? (
                <p>Loading...</p>
              ) : pendingListings.length === 0 ? (
                <p>No pending listings at the moment.</p>
              ) : (
                <div className="flex flex-col mt-8">
                  <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">City</th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Submitted by</th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {pendingListings.map((listing) => (
                            <tr key={listing.id}>
                              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                <div className="text-sm leading-5 font-medium text-gray-900">{listing.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                <div className="text-sm leading-5 text-gray-900">{listing.category}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                <div className="text-sm leading-5 text-gray-900">{listing.city}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                <div className="text-sm leading-5 text-gray-900">{listing.userEmail}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 font-medium">
                                <button onClick={() => approveListing(listing.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Approve</button>
                                <button onClick={() => rejectListing(listing.id)} className="text-red-600 hover:text-red-900">Reject</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white shadow mt-8 py-4">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center">
              <div>
                <strong className="text-gray-700">Copyright © 2023 YourCompany.</strong> All rights reserved.
              </div>
              <div className="text-sm text-gray-500">
                <span>Version</span> <strong>1.0.0</strong>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AdminDashboard;