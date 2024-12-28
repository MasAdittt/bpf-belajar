import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Menu, Phone, Instagram, Globe } from 'lucide-react';
import Navbaru from '../components/Navbaru';
import { ref, onValue, off, remove, update } from 'firebase/database';
import { database } from '../config/firebase';
import ReviewComponent from '../components/ReviewComponent';
import Bawah from '../components/Bawah';
import Swal from 'sweetalert2';
import ExploreAreaMap from '../kebutuhan/Explore';
import Loading from '../components/Loading';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

const Listingbaru = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  // Improved scroll handler with debounce
  const handleScroll = (event) => {
    const scrollContainer = event.target;
    const scrollPosition = scrollContainer.scrollLeft;
    const imageWidth = scrollContainer.clientWidth;
    const newIndex = Math.round(scrollPosition / imageWidth);
    
    // Prevent unnecessary state updates
    if (newIndex !== currentImageIndex) {
      setCurrentImageIndex(newIndex);
    }
  };

  const getWebsiteUrl = (url) => {
    if (url) {
      return url.startsWith('http') ? url : `https://${url}`;
    }
    return null;
  };

  const getWhatsAppUrl = () => {
    if (listing?.phone) {
      const phone = listing.phone;
      const message = `Halo, saya tertarik dengan ${listing.title}`;
      return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
    return null;
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // First, delete all images from storage
          if (listing.imageUrls && listing.imageUrls.length > 0) {
            const deletePromises = listing.imageUrls.map(async (imageUrl) => {
              // Extract the file path from the URL
              // Assuming your storage URLs follow a pattern like:
              // https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[filepath]?token=[token]
              const decodedUrl = decodeURIComponent(imageUrl);
              const startIndex = decodedUrl.indexOf('/o/') + 3;
              const endIndex = decodedUrl.indexOf('?');
              const filePath = decodedUrl.substring(startIndex, endIndex !== -1 ? endIndex : undefined);
              
              if (filePath) {
                const imageRef = storageRef(storage, filePath);
                try {
                  await deleteObject(imageRef);
                } catch (error) {
                  console.error(`Error deleting image ${filePath}:`, error);
                  // Continue with other deletions even if one fails
                }
              }
            });
  
            // Wait for all image deletions to complete
            await Promise.all(deletePromises);
          }
  
          // Then delete the database entry
          const listingRef = ref(database, `listings/${id}`);
          await remove(listingRef);
  
          Swal.fire(
            'Deleted!',
            'Your listing and associated images have been deleted.',
            'success'
          );
          navigate('/');
        } catch (error) {
          console.error("Error during deletion:", error);
          Swal.fire(
            'Error!',
            'There was an error deleting the listing or its images.',
            'error'
          );
        }
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

  if (loading) return <Loading />;
  if (error) return <div className="flex justify-center items-center min-h-screen">Error: {error}</div>;
  if (!listing) return <Loading />;


  const imageUrls = listing.imageUrls || Array(5).fill("/api/placeholder/800/600");
  const websiteUrl = getWebsiteUrl(listing?.website);
  const instagramUrl = getWebsiteUrl(listing?.instagram) || "https://www.instagram.com";
  const menuUrl = getWebsiteUrl(listing?.menuLink);

  return (
    <>
      <Navbaru />
      <div className="min-h-screen bg-[#F2F2F2] flex flex-col pt-[90px]">
        <div className="w-full max-w-6xl mx-auto p-4">
          {/* Mobile Image Carousel */}
          <div className="relative block md:hidden mb-6">
            <div
              className="flex overflow-x-auto snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
              onScroll={handleScroll}
            >
              {imageUrls.map((url, index) => (
                <div 
                  key={index} 
                  className="flex-none w-full snap-center"
                >
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-64 object-cover rounded"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1}/{imageUrls.length}
            </div>
          </div>

          {/* Desktop Image Grid */}
          <div className="hidden md:grid md:grid-cols-6 gap-4 mb-8">
            {imageUrls.slice(0, 5).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Image ${index + 1}`}
                className={`w-full object-cover rounded ${
                  index === 0 ? 'col-span-4 h-80' :
                  index === 1 ? 'col-span-2 h-80' :
                  'col-span-2 h-60'
                }`}
                loading="lazy"
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mb-6">
            <button
              onClick={handleDelete}
              className="bg-transparent text-[#3A3A3A] border-2 border-[#EC8E2E] px-4 py-2 rounded-lg hover:bg-[#EC8E2E] hover:text-white transition-colors duration-300 font-lexend"
              >
              Delete
            </button>
            <button
      onClick={handleEdit}
      className="bg-transparent text-[#3A3A3A] border-2 border-[#3A3A3A] px-4 py-2 rounded-lg hover:bg-[#3A3A3A] hover:text-white transition-colors duration-300 font-lexend"
    >
      Edit
    </button>
            <button
              onClick={handlePost}
              className="bg-transparent text-[#3A3A3A] border-2 border-[#1DA19E] px-4 py-2 rounded-lg hover:bg-[#1DA19E] hover:text-white transition-colors duration-300 font-lexend"
              >
              Post for Approval
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[400px]">
            <div className="md:col-span-2 flex flex-col">
              <div className="mb-6 min-h-[200px] flex-grow">
                <h1 className="text-2xl md:text-4xl font-bold text-[#3A3A3A] mb-8">
                  {listing.title}
                </h1>
                <p className="mb-4 font-['Quicksand'] text-[15px] font-light text-justify whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

                {/* Updated Action Links */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4 py-2 md:py-4 font-['Quicksand'] text-[#3A3A3A]">
              {listing.menuLink && (
                <>
                  <ActionLink 
                    href={menuUrl} 
                    icon={<Menu size={14} className="md:w-4 md:h-4" />} 
                    text="Menu" 
                  />
                  <Separator />
                </>
              )}
              {listing.phone && (
                <>
                  <ActionLink 
                    href={getWhatsAppUrl()} 
                    icon={<Phone size={14} className="md:w-4 md:h-4" />} 
                    text="Contact" 
                  />
                  <Separator />
                </>
              )}
              <ActionLink 
                href={instagramUrl} 
                icon={<Instagram size={14} className="md:w-4 md:h-4" />} 
                text="Instagram" 
              />
              {websiteUrl && (
                <>
                  <Separator />
                  <ActionLink 
                    href={websiteUrl} 
                    icon={<Globe size={14} className="md:w-4 md:h-4" />} 
                    text="Website" 
                  />
                </>
              )}
            </div>
          
            </div>

            {/* Map Section */}
            <div className="w-full h-full">
             
              <ExploreAreaMap location={listing.location} address={listing.address} />
            
            </div>
          </div>

        
        </div>
      </div>
      <Bawah />
    </>
  );
};

// Helper Components
const ActionLink = ({ href, icon, text }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="flex items-center gap-1 md:gap-2 hover:text-blue-800 text-xs md:text-sm font-bold"  >
    {icon} {text}
  </a>
);

const Separator = () => (
  <span className="text-sm font-bold" style={{color:'black'}}>•</span>
);

export default Listingbaru;