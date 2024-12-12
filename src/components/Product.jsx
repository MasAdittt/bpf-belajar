import React, { useState, useEffect } from 'react';
import { ref, onValue, update, remove,get } from 'firebase/database';
import { database } from '../config/firebase';
import { Search, Filter, Check, X, Mail, Calendar, Trash2, Eye, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClicksChart from './Klik';

const ProductListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const navigate = useNavigate();

  const handleImageClick = (listingId) => {
    setSelectedListingForStats(listingId);
    navigate(`/pubadmin/${listingId}`);
  };

  const handleViewStats = (listingId) => {
    if (selectedListingForStats === listingId) {
      setSelectedListingForStats(null);
    } else {
      setSelectedListingForStats(listingId);
    }
  };

  const handleCloseStats = () => {
    setSelectedListingForStats(null);
  };

  const formatEmail = (email) => {
    if (!email) return '';
    if (email.length > 50) {
      return email.substring(0, 50) + '...';
    }
    return email;
  };

  

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  useEffect(() => {
    const listingsRef = ref(database, 'listings');
    
    const unsubscribe = onValue(listingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listingsArray = Object.entries(data).map(([id, listing]) => ({
          id,
          ...listing,
          createdAt: listing.createdAt || Date.now(),
          isEdited: listing.isEdited || false,
          editStatus: listing.editStatus || 'pending', // 'pending' or 'approved'
          editHistory: listing.editHistory || [] // Tambahkan ini
        }));
        setListings(listingsArray);
        setFilteredListings(listingsArray);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = [...listings];

    if (searchTerm) {
      result = result.filter(listing => 
        listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      result = result.filter(listing => listing.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      result = result.filter(listing => listing.status === filterStatus);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredListings(result);
  }, [listings, searchTerm, filterCategory, filterStatus, sortBy]);

  const handleStatusUpdate = async (listingId, newStatus) => {
    try {
      const listingRef = ref(database, `listings/${listingId}`);
      await update(listingRef, {
        status: newStatus,
        isPublic: newStatus === 'approved',
        editStatus: 'approved', // Approve the edit when approving the listing
      });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleEditApprove = async (listingId) => {
    try {
      const listingRef = ref(database, `listings/${listingId}`);
      const snapshot = await get(listingRef);
      const listingData = snapshot.val();
  
      if (listingData.isEdited && listingData.status === 'approved' && listingData.editStatus === 'pending'){
                // Ambil perubahan terakhir dari edit history
        const lastEditHistory = listingData.editHistory[listingData.editHistory.length - 1];
        
        // Perbarui data dengan perubahan yang disetujui
        const approvedChanges = {
          ...lastEditHistory.changes,
          isEdited: false,
          editStatus: 'approved',
          editHistory: listingData.editHistory.map(entry => 
            entry === lastEditHistory 
              ? {...entry, status: 'approved'} 
              : entry
          )
        };
  
        await update(listingRef, approvedChanges);
        toast.success("Perubahan berhasil disetujui");
      } else if (listingData.status !== 'approved') {
        toast.info("Listing must be approved first before approving edits");
      }else {
        toast.info("Tidak ada perubahan yang perlu disetujui");
      }
    } catch (error) {
      console.error('Error menyetujui edit:', error);
      toast.error('Gagal menyetujui perubahan');
    }
  };

  const [selectedListingForStats, setSelectedListingForStats] = useState(null);
  
  const handleDelete = async () => {
    if (!selectedListing) return;

    try {
      const listingRef = ref(database, `listings/${selectedListing.id}`);
      await remove(listingRef);
      setShowDeleteDialog(false);
      setSelectedListing(null);
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. Please try again.');
    }
  };

  

  const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, listing }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{listing?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  const renderChangedFields = (changes) => {
    return (
      <div className="bg-gray-100 p-4 rounded-md mt-2">
        <h4 className="font-semibold mb-2">Perubahan yang Diusulkan:</h4>
        {Object.entries(changes).map(([key, value]) => (
          <div key={key} className="mb-1">
            <span className="font-medium capitalize">{key}: </span>
            <span>{JSON.stringify(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" style={{marginTop:'30px'}}>
      <div className="mb-6">
        {selectedListingForStats && (
          <div className="mb-6">
            <ClicksChart listingId={selectedListingForStats} onClose={handleCloseStats}/>
          </div>
        )}
        <h2 className="text-2xl font-bold mb-6" style={{fontFamily:'Quicksand'}}>Product Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{fontFamily:'Quicksand', fontWeight:500}}
            />
          </div>

          <select
            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{fontFamily:'Quicksand', fontWeight:600,color:'#6B6B6B'}}
          >
            <option value="all">All Categories</option>
            <option value="Cafe">Cafe</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Hotel">Hotel</option>
            <option value="Tourist Spot">Tourist Spot</option>
          </select>

          <select
            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{fontFamily:'Quicksand', fontWeight:600,color:'#6B6B6B'}}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{fontFamily:'Quicksand', fontWeight:600,color:'#6B6B6B'}}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden border">
            <div className="h-48 overflow-hidden relative">
              {listing.imageUrls && listing.imageUrls.length > 0 && (
                <img 
                  src={listing.imageUrls[0]} 
                  alt={listing.title} 
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => handleImageClick(listing.id)}
                />
              )}
                 <div className="absolute top-4 left-4 flex gap-2">
                  <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm" style={{fontFamily: 'Lexend'}}>
                    {listing.category}
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm" style={{fontFamily: 'Lexend'}}>
                    {formatDate(listing.createdAt)}
                  </div>
                </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold" style={{fontFamily:'Quicksand', fontWeight:600}}>
                    {listing.title}
                  </h3>
    
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
  listing.status === 'approved' 
    ? 'bg-green-100 text-green-800' 
    : listing.status === 'rejected'
    ? 'bg-red-100 text-red-800'
    : listing.status === 'pending'  // Add this condition
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-gray-100 text-gray-800'  // Add default style
}`} style={{fontFamily:'Quicksand', fontWeight:600}}>
  {listing.status}
</span>
              </div>
              <span 
                  className="text-xs md:text-sm"
                  style={{
                    fontFamily: 'Lexend',
                    color: '#6B6B6B',
                    fontWeight: 300
                  }}
                >
                  {listing.district}, {listing.city}  <span className="px-1 text-[#6B6B6B]">•</span>  {listing.businessHours ? `${listing.businessHours.opening} - ${listing.businessHours.closing}` : 'Hours Not Available'} WITA
                </span>

                <p 
                className="text-xs md:text-sm mb-2"
                style={{
                  fontFamily: 'Lexend',
                  color: '#6B6B6B',
                  fontWeight: 300
                }}
              >
                {listing.foodCategory}, {listing.halalStatus}
              </p>

              <p 
                className="text-xs md:text-sm mb-4"
                style={{
                  fontFamily: 'Lexend',
                  color: '#6B6B6B',
                  fontWeight: 300,
                  width:'360px'
                }}
              >
                "{listing.tags}"
              </p>

              
              <div className="mt-4 space-y-1" style={{fontFamily:'Quicksand'}}>
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-blue-600">{formatEmail(listing.userEmail)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-green-500" />
                  <span className="text-green-600">{formatDate(listing.createdAt)}</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                {listing.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(listing.id, 'approved')}
                      className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(listing.id, 'rejected')}
                      className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </>
                )}

                
{listing.status === 'approved' && listing.isEdited && listing.editStatus === 'pending' && (
                <button
                  onClick={() => handleEditApprove(listing.id)}
                  className="flex items-center px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve Edit
                </button>
              )}
                {listing.status === 'approved' && (
                  <button
                    onClick={() => handleViewStats(listing.id)}
                    className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Stats
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedListing(listing);
                    setShowDeleteDialog(true);
                  }}
                  className="flex items-center px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No listings found matching your criteria.</p>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
            setShowDeleteDialog(false);
            setSelectedListing(null);
          }}
          onConfirm={handleDelete}
          listing={selectedListing}
        />
      </div>
    );
  };
  
  export default ProductListings;