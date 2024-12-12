import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { 
  ref, 
  get, 
  query, 
  orderByChild, 
  equalTo, 
  push, 
  set,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  limitToLast
} from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { database } from '../config/firebase';
import Swal from 'sweetalert2';

const ReviewComponent = ({ listingId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [user, setUser] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkUserReview(currentUser.uid);
      } else {
        setUserReview(null);
      }
    });

    const reviewsRef = ref(database, `listings/${listingId}/reviews`);
    const recentReviewsQuery = query(reviewsRef, limitToLast(10));

    get(recentReviewsQuery).then((snapshot) => {
      const reviewsData = [];
      snapshot.forEach((childSnapshot) => {
        reviewsData.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setReviews(reviewsData.reverse());
      setLoading(false);
    });

    const unsubscribeAdded = onChildAdded(reviewsRef, (snapshot) => {
      setReviews((prevReviews) => [{ id: snapshot.key, ...snapshot.val() }, ...prevReviews]);
    });

    const unsubscribeChanged = onChildChanged(reviewsRef, (snapshot) => {
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === snapshot.key ? { id: snapshot.key, ...snapshot.val() } : review
        )
      );
    });

    const unsubscribeRemoved = onChildRemoved(reviewsRef, (snapshot) => {
      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== snapshot.key));
    });

    return () => {
      unsubscribeAuth();
      unsubscribeAdded();
      unsubscribeChanged();
      unsubscribeRemoved();
    };
  }, [listingId]);

  const checkUserReview = async (userId) => {
    const reviewsRef = ref(database, `listings/${listingId}/reviews`);
    const userReviewQuery = query(reviewsRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await get(userReviewQuery);
    if (snapshot.exists()) {
      const userReviewData = Object.values(snapshot.val())[0];
      setUserReview({ id: Object.keys(snapshot.val())[0], ...userReviewData });
    } else {
      setUserReview(null);
    }
  };

  const handleAddReview = async () => {
    if (!user) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Silakan login terlebih dahulu untuk memberikan review.',
      });
      return;
    }

    if (userReview) {
      Swal.fire({
        icon: 'warning',
        title: 'Review Sudah Ada',
        text: 'Anda sudah memberikan review untuk listing ini.',
      });
      return;
    }

    if (newReview && newRating > 0) {
      const reviewsRef = ref(database, `listings/${listingId}/reviews`);
      const newReviewRef = push(reviewsRef);
      const review = {
        name: user.displayName || user.email,
        userId: user.uid,
        rating: newRating,
        comment: newReview,
        date: new Date().toISOString(),
      };

      try {
        await set(newReviewRef, review);
        setNewReview('');
        setNewRating(0);
        setUserReview(review);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Review Anda telah berhasil ditambahkan.',
        });
      } catch (error) {
        console.error("Error adding review: ", error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Terjadi kesalahan saat menambahkan review. Silakan coba lagi.',
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Review Tidak Lengkap',
        text: 'Pastikan Anda telah memberikan rating dan menulis review.',
      });
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', options);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="min-h-auto flex flex-col" style={{ color: '#3A3A3A', fontFamily: 'Quicksand' }}>
      <h1 className="text-2xl md:text-4xl font-bold mb-6">RATINGS</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow md:sticky md:top-0 h-fit">
          <p className="text-sm font-semibold mb-2">Total Reviews</p>
          <p className="text-3xl font-bold mb-4">{reviews.length} Reviews</p>
          <p className="text-sm font-semibold mb-2">Rating</p>
          <div className="flex items-center">
            <span className="text-3xl font-bold mr-2" style={{ color: '#3A3A3A' }}>{averageRating}</span>
            <div className="flex">{renderStars(Math.round(averageRating))}</div>
          </div>
        </div>

        <div className="md:col-span-3">
          {loading ? (
            <div className="bg-white p-4 rounded-lg shadow">Memuat review...</div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Tambah Rating</h2>
                {user ? (
                  <>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={24}
                          className={`cursor-pointer ${star <= newRating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          onClick={() => setNewRating(star)}
                        />
                      ))}
                    </div>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="3"
                      placeholder="Tulis review Anda di sini..."
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      style={{ backgroundColor: '#F2F2F2' }}
                    />
                    <button
                      className="mt-2 bg-[#1DA19E] text-white px-4 py-2 rounded hover:bg-[#189693]"
                      onClick={handleAddReview}
                    >
                      Kirim Review
                    </button>
                  </>
                ) : (
                  <p className="text-gray-600">Silakan login untuk memberikan review.</p>
                )}
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center mb-2">
                      <span className="font-semibold mr-2" style={{ color: '#3A3A3A' }}>
                        {review.name}
                      </span>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                    <p className="text-xs text-gray-400">{formatDate(review.date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewComponent;