import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Menu, Phone, Instagram, Globe } from 'lucide-react';
import Navbaru from '../components/Navbaru';
import { ref, onValue, off, get, set, serverTimestamp } from 'firebase/database';
import { database } from '../config/firebase';
import ReviewComponent from '../components/ReviewComponent';
import Bawah from '../components/Bawah';
import Loading from '../components/Loading';
import Featuredbawah from '../components/Featuredbawah';
import ExploreAreaMap from '../kebutuhan/Explore';

const PublicTemplate = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const listingRef = ref(database, `listings/${id}`);
    const ratingsRef = ref(database, `ratings/${id}`);
    
    const recordClick = async () => {
      const today = new Date().toISOString().split('T')[0];
      const clickRef = ref(database, `listings/${id}/clicks/${today}`);
      
      try {
        const snapshot = await get(clickRef);
        const currentCount = snapshot.exists() ? snapshot.val().count : 0;
        
        await set(clickRef, {
          count: currentCount + 1,
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error("Error recording click:", error);
      }
    };

    recordClick();

    const listingListener = onValue(
      listingRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setListing(data);
        } else {
          setError("Listing not found");
        }
        setLoading(false);
      },
      (error) => {
        setError("Error fetching listing data");
        setLoading(false);
      }
    );

    const ratingsListener = onValue(
      ratingsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const ratingsArray = Object.values(data);
          setRatings(ratingsArray);
        }
      },
      (error) => {
        console.error("Error fetching ratings", error);
      }
    );

    return () => {
      off(listingRef);
      off(ratingsRef);
    };
  }, [id]);

  const handleScroll = (event) => {
    const scrollContainer = event.target;
    const scrollPosition = scrollContainer.scrollLeft;
    const imageWidth = scrollContainer.clientWidth;
    const newIndex = Math.round(scrollPosition / imageWidth);
    
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

  if (loading) return <Loading />;
  if (error) return <div className="flex justify-center items-center min-h-screen">Error: {error}</div>;
  if (!listing) return <div className="flex justify-center items-center min-h-screen">Listing not found</div>;

  const imageUrls = listing.imageUrls || Array(5).fill("/api/placeholder/800/600");
  const websiteUrl = getWebsiteUrl(listing?.website);
  const instagramUrl = getWebsiteUrl(listing?.instagram) || "https://www.instagram.com";
  const menuUrl = getWebsiteUrl(listing?.menuLink);

  return (
    <>
      <Navbaru />
      <div className="min-h-full bg-[#F2F2F2] flex flex-col pt-[90px]">
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
                className={`w-full object-cover rounded-xl ${
                  index === 0 ? 'col-span-4 h-80' :
                  index === 1 ? 'col-span-2 h-80' :
                  'col-span-2 h-60'
                }`}
                loading="lazy"
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[400px] mt-4">
            <div className="md:col-span-2 flex flex-col mt-4">
              <div className="mb-6 min-h-[200px] flex-grow">
                <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-bold text-[#3A3A3A] mb-4" style={{fontFamily:'ADELIA'}}>            
                  {listing.title}
                </h2>
                <p className="mb-4 font-lexend text-sm font-light text-justify whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
              {/* Updated Action Links Container */}
              <div className="overflow-x-auto">
                <div className="flex items-center gap-4 py-4 font-lexend text-[#3A3A3A] whitespace-nowrap min-w-max">
                  {listing.menuLink && (
                    <>
                      <ActionLink href={menuUrl} icon={<Menu size={16} />} text="Menu" />
                      <Separator />
                    </>
                  )}
                  {listing.phone && (
                    <>
                      <ActionLink href={getWhatsAppUrl()} icon={<Phone size={16} />} text="Contact" />
                      <Separator />
                    </>
                  )}
                  <ActionLink href={instagramUrl} icon={<Instagram size={16} />} text="Instagram" />
                  {websiteUrl && (
                    <>
                      <Separator />
                      <ActionLink href={websiteUrl} icon={<Globe size={16} />} text="Website" />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="w-full">
              <div className="h-full">
                <ExploreAreaMap location={listing.location} address={listing.address} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Featuredbawah />
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
    className="flex items-center gap-1 sm:gap-2 hover:text-blue-800 text-xs sm:text-sm font-bold"
  >
    {icon} {text}
  </a>
);

const Separator = () => (
  <span className="text-sm font-bold" style={{color:'black'}}>•</span>
);

export default PublicTemplate;