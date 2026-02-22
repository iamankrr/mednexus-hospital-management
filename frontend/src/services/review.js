import api from './api';

// ========== REVIEW APIs ==========

export const reviewAPI = {
  // Get reviews for hospital or lab
  getReviews: (type, id, params = {}) => {
    const queryParam = type === 'hospital' ? `hospital=${id}` : `laboratory=${id}`;
    const queryString = new URLSearchParams({ ...params }).toString();
    return api.get(`/reviews?${queryParam}${queryString ? '&' + queryString : ''}`);
  },

  // Add review
  addReview: (reviewData) => api.post('/reviews', reviewData),

  // Get single review
  getReviewById: (id) => api.get(`/reviews/${id}`),

  // Update review
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),

  // Delete review
  deleteReview: (id) => api.delete(`/reviews/${id}`),

  // Mark review as helpful
  markHelpful: (id) => api.put(`/reviews/${id}/helpful`),

  // Get my reviews
  getMyReviews: () => api.get('/reviews/user/my-reviews')
};

export default reviewAPI;