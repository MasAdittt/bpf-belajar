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
        setError("Unable to fetch user data. Invalid user ID.");
        setIsLoading(false);
        return;
      }

      try {
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserName(`${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User');
        } else {
          setUserName('User');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserName('User');
      }
    };

    const fetchReviews = () => {
      setIsLoading(true);
      const listingsRef = ref(database, 'listings');
      
      return onValue(listingsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (!data) {
            setReviews([]);
            setIsLoading(false);
            return;
          }

          const allReviews = [];
          Object.entries(data).forEach(([listingId, listing]) => {
            if (listing.reviews) {
              Object.entries(listing.reviews).forEach(([reviewId, review]) => {
                if (review.userId === userId) {
                  allReviews.push({
                    id: reviewId,
                    listingId,
                    listingTitle: listing.title || 'Unknown Listing',
                    imageUrls: listing.imageUrls || [],
                    ...review
                  });
                }
              });
            }
          });

          // Sort reviews by date (most recent first)
          allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
          setReviews(allReviews);
        } catch (error) {
          console.error("Error processing reviews:", error);
          setError("Error loading reviews. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }, (error) => {
        console.error("Error fetching reviews:", error);
        setError("Failed to load reviews. Please try again later.");
        setIsLoading(false);
      });
    };

    const unsubscribeReviews = fetchReviews();
    fetchUserData();

    return () => {
      unsubscribeReviews();
    };
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
          alt="Listing"
          className="w-full h-48 object-cover rounded-md mb-2"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/320'; // Fallback image
            e.target.alt = 'Image not available';
          }}
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

  // Calculate paginated reviews
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500 text-center">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md" style={{ fontFamily: 'Quicksand', color: '#3A3A3A' }}>
      <h2 className="text-2xl font-semibold mb-6">Reviews</h2>
      
      {paginatedReviews.length > 0 ? (
        <>
          {paginatedReviews.map((review) => (
            <div key={review.id} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold" style={{ color: '#3A3A3A', fontSize: '20px' }}>
                    {userName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.date)}
                  </span>
                </div>
                <div className="flex mb-2">{renderStars(review.rating)}</div>
                {renderImage(review.imageUrls)}
                <p className="text-gray-800" style={{ fontFamily: 'Quicksand', fontSize: '16px', fontWeight: 300 }}>
                  {review.comment}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Reviewed: {review.listingTitle}
                </p>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              <span className="text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-center">This user hasn't written any reviews yet.</p>
      )}
    </div>
  );
};

export default UserReviewsComponent;