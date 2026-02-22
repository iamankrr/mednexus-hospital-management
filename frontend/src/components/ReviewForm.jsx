import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { reviewAPI } from '../services/api';
import ReviewAge from './ReviewAge'; // ⬅️ IMPORTED

const ReviewForm = ({ facilityType, facilityId, onReviewSubmitted }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    title: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // States
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [checkingReview, setCheckingReview] = useState(false);
  
  // State for all reviews
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Check login
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (facilityId) {
      if (token) checkExistingReview();
      fetchReviews(); // Fetch all reviews to display
    }
  }, [facilityId]);

  const checkExistingReview = async () => {
    try {
      setCheckingReview(true);
      const response = await reviewAPI.checkReview(facilityType, facilityId);
      
      if (response.data.success) {
        setHasReviewed(response.data.hasReviewed);
        setExistingReview(response.data.review);
      }
    } catch (error) {
      console.error('Error checking review:', error);
    } finally {
      setCheckingReview(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getReviews(facilityType, facilityId);
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to write a review');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    if (!formData.comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await reviewAPI.create({
        facilityType,
        facilityId,
        rating: formData.rating,
        comment: formData.comment,
        title: formData.title
      });

      if (response.data.success) {
        alert('✅ Review submitted successfully!');
        setFormData({ rating: 5, comment: '', title: '' });
        
        setHasReviewed(true);
        setExistingReview({
          rating: formData.rating,
          comment: formData.comment,
          title: formData.title
        });

        fetchReviews(); // Refresh review list
        
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      }
    } catch (error) {
      console.error('Review error:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── FORM SECTION ── */}
      {!isLoggedIn ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Want to write a review?</h3>
          <p className="text-gray-600 mb-4">Please login to share your experience</p>
          <button
            onClick={() => {
              localStorage.setItem('redirectAfterLogin', window.location.pathname);
              navigate('/login');
            }}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            Login to Write Review
          </button>
          <p className="text-sm text-gray-500 mt-3">
            Don't have an account?{' '}
            <button
              onClick={() => {
                localStorage.setItem('redirectAfterLogin', window.location.pathname);
                navigate('/register');
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              Register here
            </button>
          </p>
        </div>
      ) : hasReviewed && existingReview ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            ✅ Your Review
          </h3>
          <div className="flex gap-1 mb-2">
            {[1,2,3,4,5].map(star => (
              <span key={star} className={`text-xl ${star <= existingReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
              </span>
            ))}
            <span className="ml-2 text-sm font-medium text-gray-600">
              {existingReview.rating}/5
            </span>
          </div>
          {existingReview.title && (
            <p className="font-medium text-gray-800 mb-1">{existingReview.title}</p>
          )}
          <p className="text-gray-700">{existingReview.comment}</p>
          <p className="text-xs text-gray-500 mt-3">
            You've already reviewed this facility. Only one review per facility allowed.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Write a Review</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <FaStar
                      className={`text-3xl ${
                        star <= (hoveredRating || formData.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-lg font-semibold text-gray-700">
                  {formData.rating} / 5
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief summary of your experience"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Share your experience with this facility..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || formData.comment.length < 10}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                submitting || formData.comment.length < 10
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* ── REVIEWS LIST SECTION ── */}
      {reviews.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-3">Patient Reviews</h3>
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="border border-gray-100 bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      {review.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{review.user?.name || 'Anonymous'}</p>
                      {/* ⬅️ REVIEW AGE DISPLAYED HERE */}
                      <ReviewAge timestamp={review.createdAt} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
                {review.title && (
                  <p className="font-semibold text-gray-800 mb-1">{review.title}</p>
                )}
                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;