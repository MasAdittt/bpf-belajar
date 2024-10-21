import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { ref, onValue, query, get } from 'firebase/database';
import { database } from '../config/firebase';

const UserReviewsComponent = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const reviewsPerPage = 5;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError("User ID is missing. Please ensure you're logged in.");
        setIsLoading(false);
        return;
      }

      try {
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserName(`${userData.firstName || ''} ${userData.lastName || ''}`.trim());
        } else {
          setUserName('User');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserName('User');
      }
    };

    const fetchReviews = () => {
      const listingsRef = ref(database, 'listings');
      const listingsQuery = query(listingsRef);
      
      const unsubscribe = onValue(listingsQuery, 
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const allReviews = [];
            Object.entries(data).forEach(([listingId, listing]) => {
              if (listing.reviews) {
                Object.entries(listing.reviews).forEach(([reviewId, review]) => {
                  if (review.userId === userId) {
                    allReviews.push({
                      id: reviewId,
                      listingId: listingId,
                      listingTitle: listing.title || 'Unknown Listing',
                      imageUrls: listing.imageUrls || [], // Add this line to include imageUrls
                      ...review
                    });
                  }
                });
              }
            });
            setReviews(allReviews);
          } else {
            setReviews([]);
          }
          setIsLoading(false);
        },
        (error) => {
          setError("Failed to fetch reviews. Please try again later.");
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    };

    fetchUserData();
    fetchReviews();
  }, [userId]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ));
  };

  const renderImage = (imageUrls) => {
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      return (
        <img
          src={imageUrls[0]}
          alt="Review image"
          className="w-full h-48 object-cover rounded-md mb-2"
        />
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const paginatedReviews = reviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);

  if (isLoading) {
    return <p className="text-gray-500">Loading reviews...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md" style={{ fontFamily: 'Quicksand', color: '#3A3A3A' }}>
      {paginatedReviews.length > 0 ? (
        <>
          {paginatedReviews.map((review) => (
            <div key={review.id} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
              <div className="items-center mb-2">
                <span className="font-semibold mr-2" style={{ color:'#3A3A3A', fontSize:'20px'}}>{userName}</span>
                <div className="flex">{renderStars(review.rating)}</div>
                <p style={{ fontFamily:'Quicksand', fontSize:'16px', fontWeight:300 }}>{review.comment}</p>
              </div>
              {renderImage(review.imageUrls)}
              <p className="text-sm text-gray-600 ">{review.listingTitle}</p>
              <p className="text-xs text-gray-400">{formatDate(review.date)}</p>
            </div>
          ))}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center text-blue-500 disabled:text-gray-300"
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            <span className="text-gray-500">Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={paginatedReviews.length < reviewsPerPage}
              className="flex items-center text-blue-500 disabled:text-gray-300"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">You haven't written any reviews yet.</p>
      )}
    </div>
  );
};

export default UserReviewsComponent;