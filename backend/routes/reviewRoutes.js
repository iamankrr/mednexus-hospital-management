// routes/reviewRoutes.js - Review Routes

const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/authMiddleware');

// ========== @desc    Get ALL reviews (Admin only - FIXED ROUTE)
// ========== @route   GET /api/reviews/admin/all
// ========== @access  Private/Admin
router.get('/admin/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { status } = req.query;
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Populate user and the dynamic facilityId
    const reviews = await Review.find(filter)
      .populate('user', 'name email phone')
      .populate('facilityId', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching all reviews',
      error: error.message
    });
  }
});

// ========== @desc    Create review
// ========== @route   POST /api/reviews
// ========== @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { facilityType, facilityId, rating, title, comment } = req.body;

    if (!facilityType || !facilityId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (comment.length < 10) {
      return res.status(400).json({ success: false, message: 'Review must be at least 10 characters' });
    }

    const existingReview = await Review.findOne({
      user: req.user.id,
      facilityType,
      facilityId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this facility. You can only submit one review per facility.',
        alreadyReviewed: true
      });
    }

    const review = await Review.create({
      user: req.user.id,
      facilityType,
      facilityId,
      rating,
      title: title || '',
      comment
    });

    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this facility.', alreadyReviewed: true });
    }
    res.status(500).json({ success: false, message: 'Error submitting review', error: error.message });
  }
});

// ========== @desc    Get reviews for facility
// ========== @route   GET /api/reviews/:type/:id
// ========== @access  Public
router.get('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;

    const reviews = await Review.find({
      facilityType: type,
      facilityId: id,
      status: 'approved' // Only show approved to public!
    })
      .populate('user', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
  }
});

// ========== @desc    Check if user already reviewed
// ========== @route   GET /api/reviews/check/:type/:id
// ========== @access  Private
router.get('/check/:type/:id', protect, async (req, res) => {
  try {
    const { type, id } = req.params;
    const existingReview = await Review.findOne({ user: req.user.id, facilityType: type, facilityId: id });

    res.status(200).json({ success: true, hasReviewed: !!existingReview, review: existingReview || null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking review status', error: error.message });
  }
});

// ========== @desc    Admin Approve/Reject Route
// ========== @route   PUT /api/reviews/:id/status
// ========== @access  Private/Admin
router.put('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Update the average rating on the facility immediately
    await Review.updateFacilityRating(review.facilityType, review.facilityId);

    res.status(200).json({ success: true, message: `Review ${status} successfully`, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating status', error: error.message });
  }
});

// ========== @desc    Owner Reply Route
// ========== @route   POST /api/reviews/:id/reply
// ========== @access  Private/Owner
router.post('/:id/reply', protect, async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const { text } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { 
      ownerReply: { text, date: new Date() } 
    }, { new: true });
    
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    res.status(200).json({ success: true, message: 'Reply posted successfully', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error posting reply', error: error.message });
  }
});

// ========== @desc    Delete review (user's own or Admin)
// ========== @route   DELETE /api/reviews/:id
// ========== @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const facilityType = review.facilityType;
    const facilityId = review.facilityId;

    await review.deleteOne(); // triggers middleware
    
    // Safety check recalculation
    await Review.updateFacilityRating(facilityType, facilityId);

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting review', error: error.message });
  }
});

module.exports = router;