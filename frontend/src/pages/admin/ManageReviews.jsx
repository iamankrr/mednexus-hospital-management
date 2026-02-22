import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaUser } from 'react-icons/fa';
import axios from 'axios';

const ManageReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = 'http://localhost:3000/api/reviews';
      // Note: Backend needs to support this endpoint for admin
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        let reviewsData = response.data.data;
        
        // Apply filter
        if (filter === 'approved') {
          reviewsData = reviewsData.filter(r => r.isApproved);
        } else if (filter === 'pending') {
          reviewsData = reviewsData.filter(r => !r.isApproved);
        }
        
        setReviews(reviewsData);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Failed to load reviews');
      setReviews([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId, currentStatus) => {
    const action = currentStatus ? 'reject' : 'approve';
    if (!window.confirm(`Are you sure you want to ${action} this review?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Note: This endpoint needs to be added to backend
      await axios.put(
        `http://localhost:3000/api/reviews/${reviewId}`,
        { isApproved: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Review ${action}d successfully!`);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone!')) {
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
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending Approval
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
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaUser className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{review.user?.name || 'Anonymous'}</h3>
                      <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
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
                    For: <span className="font-medium">{review.hospital?.name || review.laboratory?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex gap-2">
                    {review.isApproved ? (
                      <FaCheckCircle className="text-green-500 text-2xl" />
                    ) : (
                      <FaTimesCircle className="text-orange-500 text-2xl" />
                    )}
                    <button
                      onClick={() => handleApprove(review._id, review.isApproved)}
                      className={`${
                        review.isApproved
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-green-500 hover:bg-green-600'
                      } text-white px-4 py-2 rounded-lg transition duration-200 font-medium`}
                    >
                      {review.isApproved ? 'Reject' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      Delete
                    </button>
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