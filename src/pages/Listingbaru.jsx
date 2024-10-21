import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbaru from '../components/Navbaru';
import { ref, onValue, off, remove, update } from 'firebase/database';
import { database } from '../config/firebase';
import ReviewComponent from '../components/ReviewComponent';
import Bawah from '../components/Bawah';
import Swal from 'sweetalert2';

const Listingbaru = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const listingRef = ref(database, `listings/${id}`);

    const listingListener = onValue(listingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setListing(data);
      } else {
        setError("Listing not found");
      }
      setLoading(false);
    }, (error) => {
      setError("Error fetching listing data");
      setLoading(false);
    });

    return () => {
      off(listingRef, 'value', listingListener);
    };
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!listing) return <div>Listing not found</div>;

  const handleDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const listingRef = ref(database, `listings/${id}`);
        remove(listingRef)
          .then(() => {
            Swal.fire(
              'Deleted!',
              'Your listing has been deleted.',
              'success'
            );
            navigate('/');
          })
          .catch((error) => {
            console.error("Error deleting listing:", error);
            Swal.fire(
              'Error!',
              'There was an error deleting the listing.',
              'error'
            );
          });
      }
    });
  };

  const handleEdit = () => {
    navigate(`/edit-listing/${id}`);
  };

  const handlePost = () => {
    Swal.fire({
      title: 'Post Listing',
      text: "Are you sure you want to post this listing for admin approval?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, post it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const listingRef = ref(database, `listings/${id}`);
        update(listingRef, { status: 'pending' })
          .then(() => {
            Swal.fire(
              'Posted!',
              'Your listing has been sent for admin approval.',
              'success'
            );
          })
          .catch((error) => {
            console.error("Error posting listing:", error);
            Swal.fire(
              'Error!',
              'There was an error posting the listing.',
              'error'
            );
          });
      }
    });
  };

  return (
    <>
      <Navbaru />
      <div className="min-h-screen bg-[#F2F2F2] flex flex-col">
      <div className="max-w-6xl mx-auto p-4 flex-grow">
      <div className="grid grid-cols-6 gap-4" style={{ paddingBottom:'46px' }}>
  {/* Gambar pertama (sedikit lebih pendek) */}
  <img 
    src={listing.imageUrls?.[0] || "/api/placeholder/800/600"} 
    alt="Gambar Utama" 
    className="col-span-4 w-full h-80 object-cover rounded" 
  />

  {/* Gambar kedua hingga kelima (lebih kecil di bawah) */}
  <img 
    src={listing.imageUrls?.[1] || "/api/placeholder/400/300"} 
    alt="Gambar 2" 
    className="col-span-2 w-full h-80 object-cover rounded" 
  />
  <img 
    src={listing.imageUrls?.[2] || "/api/placeholder/400/300"} 
    alt="Gambar 3" 
    className="col-span-2 w-full h-48 object-cover rounded" 
  />
  <img 
    src={listing.imageUrls?.[3] || "/api/placeholder/400/300"} 
    alt="Gambar 4" 
    className="col-span-2 w-full h-48 object-cover rounded" 
  />
  <img 
    src={listing.imageUrls?.[4] || "/api/placeholder/400/300"} 
    alt="Gambar 5" 
    className="col-span-2 w-full h-48 object-cover rounded" 
  />
</div>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={handleEdit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={handlePost}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Post for Approval
            </button>
          </div>

          <h1 className="text-4xl font-bold text-[#3A3A3A] pb-8">{listing.title}</h1>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <p className="mb-4" style={{ whiteSpace:'pre-line', fontFamily:'Quicksand',fontSize:'15px', fontWeight:300 }}>{listing.description}</p>
              
              <div className="flex items-center space-x-4 py-4 my-6" style={{ fontFamily:'Quicksand', color:'#3A3A3A',fontSize:'14px',fontWeight:500 }}>
      <a href="#menu" className="hover:text-blue-800" style={{ fontSize:'14px',fontWeight:700 }}>Menu</a>
      <span style={{ fontSize:'14px',fontWeight:700,color:'#3A3A3A' }}>•</span>
      <a href="#contact" className="hover:text-blue-800" style={{ fontSize:'14px',fontWeight:700 }}>Contact</a>
      <span style={{ fontSize:'14px',fontWeight:700,color:'#3A3A3A' }}>•</span>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800" style={{ fontSize:'14px',fontWeight:700 }}>Instagram</a>
      <span style={{ fontSize:'14px',fontWeight:700,color:'#3A3A3A' }}>•</span>
      <a href="#website" className="hover:text-blue-800" style={{ fontSize:'14px',fontWeight:700 }}>Website</a>
    </div>
            </div>  

            <div>
              <h3 className="text-xl font-bold mb-4">Explore the Area</h3>
              <img src="/api/placeholder/400/400" alt="Map" className="w-full h-64 object-cover rounded mb-4" />
            </div>
          </div>
          
          {/* Updated ReviewComponent usage */}
          <ReviewComponent listingId={id} />
        </div>
      </div>
      <Bawah />
    </>
  );
};

export default Listingbaru;