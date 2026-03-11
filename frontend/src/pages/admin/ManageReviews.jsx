import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaUser, FaPhone, FaEnvelope, FaTrash, FaClock } from 'react-icons/fa';
import axios from 'axios';

const ManageReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const url = `http://localhost:3000/api/reviews/admin/all?status=${filter}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Failed to load reviews.');
      setReviews([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this review as ${newStatus}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:3000/api/reviews/${reviewId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Review ${newStatus} successfully!`);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update review status');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review? This action cannot be undone!')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:3000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Review deleted successfully!');
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-white hover:text-yellow-200 mb-4"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <FaStar className="text-4xl" />
            <div>
              <h1 className="text-4xl font-bold">Manage Reviews</h1>
              <p className="text-yellow-100 mt-2">Approve, reject, and manage user reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending Approval
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Reviews
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reviews found in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-200 hover:shadow-lg transition duration-300"
                   style={{ borderLeftColor: review.status === 'approved' ? '#22c55e' : review.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-3 rounded-full mt-1">
                      <FaUser className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{review.user?.name || 'Anonymous'}</h3>
                      {review.user?.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <FaPhone className="text-xs" /> {review.user.phone}
                        </p>
                      )}
                      {review.user?.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <FaEnvelope className="text-xs" /> {review.user.email}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={index < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">{review.title}</h4>
                )}

                <p className="text-gray-600 mb-4">{review.comment}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    For: <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded capitalize">
                      {review.facilityId?.name || 'Unknown Facility'} ({review.facilityType})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mr-2 ${
                      review.status === 'approved' ? 'bg-green-100 text-green-700' :
                      review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {review.status}
                    </span>

                    {/* Pending -> Show Approve/Reject. If Approved/Rejected -> Show Delete */}
                    {review.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleStatusChange(review._id, 'approved')}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium flex items-center gap-1"
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(review._id, 'rejected')}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium flex items-center gap-1"
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Option to revert back to pending if they made a mistake */}
                        <button
                          onClick={() => handleStatusChange(review._id, 'pending')}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg transition duration-200 font-medium flex items-center gap-1 text-sm"
                        >
                          <FaClock /> Revert
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg transition duration-200 font-medium flex items-center gap-1 ml-2"
                        >
                          <FaTrash /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageReviews;