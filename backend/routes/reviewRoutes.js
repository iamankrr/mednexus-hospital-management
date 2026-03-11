// routes/reviewRoutes.js - Review Routes

const express = require('express');
const router = express.Router();
const {
  addReview, 
  getReviews, 
  checkReview, 
  deleteReview, 
  updateReview,
  getAllReviewsAdmin, 
  updateReviewStatus, 
  ownerReply
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// STATIC ROUTES (Must be at the top)
// ==========================================

// Admin - Get all reviews
router.get('/admin/all', protect, getAllReviewsAdmin);

// ==========================================
// DYNAMIC ROUTES
// ==========================================

// Public - Get reviews for facility
router.get('/:type/:id', getReviews);

// User - Create review
router.post('/', protect, addReview);

// User - Check existing review
router.get('/check/:type/:id', protect, checkReview);

// User - Update own review
router.put('/:id', protect, updateReview);

// User/Admin - Delete review
router.delete('/:id', protect, deleteReview);

// Admin - Update review status (Approve/Reject)
router.put('/:id/status', protect, updateReviewStatus);

// Owner - Reply to a review
router.post('/:id/reply', protect, ownerReply);

module.exports = router;