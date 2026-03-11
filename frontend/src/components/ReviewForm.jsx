import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaPhone, FaEnvelope, FaEdit, FaTrash, FaReply } from 'react-icons/fa';
import { reviewAPI } from '../services/api';
import ReviewAge from './ReviewAge';
import axios from 'axios'; 

const ReviewForm = ({ facilityType, facilityId, onReviewSubmitted }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    title: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [checkingReview, setCheckingReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [reviews, setReviews] = useState([]);
  const [expandedContacts, setExpandedContacts] = useState([]);
  
  // ✅ FIX: Owner Reply States
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    setIsLoggedIn(!!token);
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }

    if (facilityId) {
      if (token) checkExistingReview();
      fetchReviews(); 
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
      let url = `http://localhost:3000/api/reviews/${facilityType}/${facilityId}`;
      const response = await axios.get(url);

      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleRatingClick = (rating) => { setFormData({ ...formData, rating }); };
  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleEditClick = () => {
    setFormData({ rating: existingReview.rating, comment: existingReview.comment, title: existingReview.title || '' });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({ rating: 5, comment: '', title: '' });
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/reviews/${existingReview._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('🗑️ Review deleted successfully!');
      setHasReviewed(false);
      setExistingReview(null);
      setFormData({ rating: 5, comment: '', title: '' });
      fetchReviews();
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (error) {
      alert('Failed to delete review');
    }
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

    if (!formData.comment.trim()) { alert('Please write a review comment'); return; }

    setSubmitting(true);
    try {
      let response;
      if (isEditing) {
        response = await axios.put(`http://localhost:3000/api/reviews/${existingReview._id}`, {
          rating: formData.rating, comment: formData.comment, title: formData.title
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        response = await reviewAPI.create({
          facilityType, facilityId, rating: formData.rating, comment: formData.comment, title: formData.title
        });
      }

      if (response.data.success) {
        alert(isEditing ? '✅ Review updated!' : '✅ Review submitted! It is pending admin approval.');
        setIsEditing(false);
        setHasReviewed(true);
        setExistingReview(response.data.data); 
        setTimeout(() => setFormData({ rating: 5, comment: '', title: '' }), 100);
        fetchReviews(); 
        if (onReviewSubmitted) onReviewSubmitted();
      }
    } catch (error) {
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

  const toggleContactInfo = (reviewId) => {
    setExpandedContacts(prev => prev.includes(reviewId) ? prev.filter(id => id !== reviewId) : [...prev, reviewId]);
  };

  // ✅ FIX: Submit Owner Reply logic
  const handleOwnerReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;
    
    try {
      setSubmittingReply(true);
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/reviews/${reviewId}/reply`, { text: replyText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Reply posted successfully!');
      setReplyingTo(null);
      setReplyText('');
      fetchReviews();
    } catch (error) {
      alert('Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const isRestrictedRole = currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner');
  // Check if current logged in user owns this exact facility
  const isFacilityOwner = currentUser?.role === 'owner' && currentUser?.ownerProfile?.facilityId === facilityId;

  return (
    <div className="space-y-8">
      {/* ── FORM SECTION ── */}
      {isRestrictedRole ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Review Access Restricted</h3>
          <p className="text-gray-600">You are logged in as an <b>{currentUser.role.toUpperCase()}</b>. Only standard users can post reviews.</p>
        </div>
      ) : !isLoggedIn ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Want to write a review?</h3>
          <p className="text-gray-600 mb-4">Please login to share your experience</p>
          <button
            onClick={() => { localStorage.setItem('redirectAfterLogin', window.location.pathname); navigate('/login'); }}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            Login to Write Review
          </button>
        </div>
      ) : hasReviewed && existingReview && !isEditing ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={handleEditClick} className="p-2 bg-white text-blue-600 rounded-full shadow hover:bg-blue-50 transition" title="Edit Review"><FaEdit /></button>
            <button onClick={handleDeleteReview} className="p-2 bg-white text-red-600 rounded-full shadow hover:bg-red-50 transition" title="Delete Review"><FaTrash /></button>
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            {existingReview.status === 'pending' ? '⏳ Your Review (Pending Approval)' : existingReview.status === 'rejected' ? '❌ Your Review (Rejected)' : '✅ Your Review'}
          </h3>
          <div className="flex gap-1 mb-2">
            {[1,2,3,4,5].map(star => (<span key={star} className={`text-xl ${star <= existingReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>))}
            <span className="ml-2 text-sm font-medium text-gray-600">{existingReview.rating}/5</span>
          </div>
          {existingReview.title && <p className="font-medium text-gray-800 mb-1">{existingReview.title}</p>}
          <p className="text-gray-700">{existingReview.comment}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 relative">
          {isEditing && <button onClick={handleCancelEdit} className="absolute top-4 right-4 text-sm font-bold text-gray-500 hover:text-gray-800 underline">Cancel Edit</button>}
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{isEditing ? 'Edit Your Review' : 'Write a Review'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => handleRatingClick(star)} onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)} className="focus:outline-none transition-transform hover:scale-110">
                    <FaStar className={`text-3xl ${star <= (hoveredRating || formData.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
                <span className="ml-3 text-lg font-semibold text-gray-700">{formData.rating} / 5</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Title (Optional)</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Brief summary of your experience" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review *</label>
              <textarea name="comment" value={formData.comment} onChange={handleChange} required rows={5} placeholder="Share your experience with this facility..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-gray-500 mt-1">Minimum 10 characters</p>
            </div>
            <button type="submit" disabled={submitting || formData.comment.length < 10} className={`w-full py-3 rounded-lg font-semibold text-white transition ${submitting || formData.comment.length < 10 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {submitting ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Review' : 'Submit Review')}
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
              <div key={review._id} className="border border-gray-100 bg-white p-5 rounded-xl shadow-sm hover:shadow transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mt-1">
                      {review.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{review.user?.name || 'Anonymous'}</p>
                      
                      {currentUser && currentUser.role === 'admin' && (
                        <div className="mt-1 mb-1">
                          <button 
                            onClick={() => toggleContactInfo(review._id)}
                            className="text-[10px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition border border-gray-200 uppercase tracking-wide cursor-pointer"
                          >
                            {expandedContacts.includes(review._id) ? 'Hide Contact Info' : 'Patient Contact Info'}
                          </button>
                          
                          {expandedContacts.includes(review._id) && (
                            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 text-xs text-gray-700 shadow-inner">
                              {review.user?.phone ? (
                                <p className="flex items-center gap-1"><FaPhone className="text-blue-500"/> {review.user.phone}</p>
                              ) : (
                                <p className="text-gray-400">No phone provided</p>
                              )}
                              {review.user?.email && (
                                <p className="flex items-center gap-1 mt-1"><FaEnvelope className="text-blue-500"/> {review.user.email}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <ReviewAge timestamp={review.createdAt} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                {review.title && (
                  <p className="font-semibold text-gray-800 mb-1">{review.title}</p>
                )}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{review.comment}</p>

                {/* ✅ FIX: OWNER REPLY UI */}
                {review.ownerReply && review.ownerReply.text ? (
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500 ml-4 md:ml-12 mt-3 relative">
                    <p className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wide flex items-center gap-1">
                      <FaReply /> Response from Owner
                    </p>
                    <p className="text-sm text-gray-700">{review.ownerReply.text}</p>
                  </div>
                ) : isFacilityOwner ? (
                  <div className="ml-4 md:ml-12 mt-2">
                    {replyingTo === review._id ? (
                      <div className="flex flex-col gap-2">
                        <textarea 
                          value={replyText} 
                          onChange={(e) => setReplyText(e.target.value)} 
                          placeholder="Type your reply to the patient here..."
                          className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          rows="3"
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setReplyingTo(null)} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                          <button onClick={() => handleOwnerReplySubmit(review._id)} disabled={submittingReply || !replyText.trim()} className="px-4 py-1.5 text-sm font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                            {submittingReply ? 'Posting...' : 'Post Reply'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setReplyingTo(review._id)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition">
                        <FaReply /> Reply as Owner
                      </button>
                    )}
                  </div>
                ) : null}

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;