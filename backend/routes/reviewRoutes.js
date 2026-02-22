// routes/reviewRoutes.js - Review Routes

const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/authMiddleware');

// ========== @desc    Create review
// ========== @route   POST /api/reviews
// ========== @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { facilityType, facilityId, rating, title, comment } = req.body;

    // Validate inputs
    if (!facilityType || !facilityId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (comment.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Review must be at least 10 characters'
      });
    }

    // ✅ CHECK FAKE RATING - One review per user per facility
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

    // Create review
    const review = await Review.create({
      user: req.user.id,
      facilityType,
      facilityId,
      rating,
      title: title || '',
      comment
    });

    // Populate user info
    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    // Handle duplicate key error (backup check)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this facility.',
        alreadyReviewed: true
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message
    });
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
      isApproved: true
    })
      .populate('user', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// ========== @desc    Check if user already reviewed
// ========== @route   GET /api/reviews/check/:type/:id
// ========== @access  Private
router.get('/check/:type/:id', protect, async (req, res) => {
  try {
    const { type, id } = req.params;

    const existingReview = await Review.findOne({
      user: req.user.id,
      facilityType: type,
      facilityId: id
    });

    res.status(200).json({
      success: true,
      hasReviewed: !!existingReview,
      review: existingReview || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking review status',
      error: error.message
    });
  }
});

// ========== @desc    Mark review as helpful
// ========== @route   POST /api/reviews/:id/helpful
// ========== @access  Private
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if already voted
    const alreadyVoted = review.helpfulVotes.includes(req.user.id);

    if (alreadyVoted) {
      // Remove vote
      review.helpfulVotes = review.helpfulVotes.filter(
        id => id.toString() !== req.user.id
      );
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add vote
      review.helpfulVotes.push(req.user.id);
      review.helpfulCount += 1;
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: alreadyVoted ? 'Removed helpful vote' : 'Marked as helpful',
      helpfulCount: review.helpfulCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating helpful count',
      error: error.message
    });
  }
});

// ========== @desc    Delete review (user's own)
// ========== @route   DELETE /api/reviews/:id
// ========== @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
});

module.exports = router;