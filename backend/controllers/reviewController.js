// controllers/reviewController.js

const Review = require('../models/Review');
const Hospital = require('../models/Hospital'); // Ensure Hospital model is available if needed internally

// ========== @desc    Add review for hospital or lab
// ========== @route   POST /api/reviews
// ========== @access  Private (Logged in users only)
exports.addReview = async (req, res) => {
  try {
    const { facilityType, facilityId, rating, title, comment } = req.body;

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

    // Checking if already reviewed
    const existingReview = await Review.findOne({
      user: req.user.id,
      facilityId: facilityId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this facility. You can only submit one review per facility.',
        alreadyReviewed: true
      });
    }

    const hospital = facilityType === 'hospital' ? facilityId : undefined;
    const laboratory = facilityType === 'laboratory' ? facilityId : undefined;

    // ✅ FIX: Set status to 'approved' for Instant Sync
    const review = await Review.create({
      user: req.user.id,
      facilityType: facilityType,
      facilityId: facilityId,
      hospital: hospital,
      laboratory: laboratory,
      rating: rating,
      title: title || '',
      comment: comment,
      status: 'approved' // <--- INSTANT APPROVAL
    });

    // ✅ FIX: Force rating recalculation on the parent document instantly!
    if (Review.updateFacilityRating) {
      await Review.updateFacilityRating(facilityType, facilityId);
    }

    await review.populate('user', 'name avatar phone email');

    res.status(201).json({
      success: true,
      message: 'Review posted successfully! MedNexus rating updated.',
      data: review
    });
  } catch (error) {
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
};

// ========== @desc    Get reviews for facility
// ========== @route   GET /api/reviews/:type/:id
// ========== @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { type, id } = req.params;

    const reviews = await Review.find({
      facilityId: id,
      status: 'approved'
    })
      .populate('user', 'name avatar phone email')
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
};

// ========== @desc    Check if user already reviewed
// ========== @route   GET /api/reviews/check/:type/:id
// ========== @access  Private
exports.checkReview = async (req, res) => {
  try {
    const { type, id } = req.params;

    const existingReview = await Review.findOne({
      user: req.user.id,
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
};

// ========== @desc    Get all reviews (for admin)
// ========== @route   GET /api/reviews/admin/all
// ========== @access  Private/Admin
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { status } = req.query;
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const reviews = await Review.find(filter)
      .populate('user', 'name email phone avatar')
      .populate('hospital', 'name')
      .populate('laboratory', 'name')
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
};

// ========== @desc    Admin Approve/Reject Route
// ========== @route   PUT /api/reviews/:id/status
// ========== @access  Private/Admin
exports.updateReviewStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { status: status }, { new: true });
    
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (Review.updateFacilityRating) {
      await Review.updateFacilityRating(review.facilityType, review.facilityId);
    }

    res.status(200).json({
      success: true,
      message: `Review ${status} successfully`,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

// ========== @desc    Update review
// ========== @route   PUT /api/reviews/:id
// ========== @access  Private 
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }
    
    const { rating, comment, title } = req.body;
    
    review.rating = rating;
    review.comment = comment;
    review.title = title;
    
    await review.save(); 

    if (Review.updateFacilityRating) {
      await Review.updateFacilityRating(review.facilityType, review.facilityId);
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// ========== @desc    Owner Reply Route
// ========== @route   POST /api/reviews/:id/reply
// ========== @access  Private/Owner
exports.ownerReply = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const { text } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { 
      ownerReply: { text: text, date: new Date() } 
    }, { new: true });
    
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    res.status(200).json({
      success: true,
      message: 'Reply posted successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error posting reply',
      error: error.message
    });
  }
};

// ========== @desc    Delete review
// ========== @route   DELETE /api/reviews/:id
// ========== @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }
    
    const facilityType = review.facilityType;
    const facilityId = review.facilityId;

    await review.deleteOne();
    
    if (Review.updateFacilityRating) {
      await Review.updateFacilityRating(facilityType, facilityId);
    }

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
};