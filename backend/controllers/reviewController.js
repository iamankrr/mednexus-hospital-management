// controllers/reviewController.js

const Review = require('../models/Review');
const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');

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

    // Convert string to proper DB reference
    const hospital = facilityType === 'hospital' ? facilityId : undefined;
    const laboratory = facilityType === 'laboratory' ? facilityId : undefined;

    // CHECK FAKE RATING - One review per user per facility
    const existingReview = await Review.findOne({
      user: req.user.id,
      ...(hospital ? { hospital: hospital } : { laboratory: laboratory })
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
      hospital: hospital,
      laboratory: laboratory,
      rating: rating,
      title: title || '',
      comment: comment,
      status: 'pending' // Default to pending
    });

    await review.populate('user', 'name avatar phone email');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It is pending admin approval.',
      data: review
    });
  } catch (error) {
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

    const filter = { status: 'approved' }; // Only show approved to public
    if (type === 'hospital') filter.hospital = id;
    if (type === 'laboratory') filter.laboratory = id;

    const reviews = await Review.find(filter)
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

    const filter = { user: req.user.id };
    if (type === 'hospital') filter.hospital = id;
    if (type === 'laboratory') filter.laboratory = id;

    const existingReview = await Review.findOne(filter);

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

    // ✅ FIX: Correctly populating hospital and laboratory names to prevent crash
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

    // Instantly syncs Home Screen Rating
    await Review.updateFacilityRating(review.hospital, review.laboratory);

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

// ========== @desc    Update review (user editing their own)
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
    review.status = 'pending'; // Reset to pending if edited
    
    await review.save(); // This triggers the middleware which auto updates rating

    res.status(200).json({
      success: true,
      message: 'Review updated successfully and sent for approval',
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

// ========== @desc    Delete review (user's own or Admin)
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
    
    const hospitalId = review.hospital;
    const labId = review.laboratory;

    await review.deleteOne();
    
    // Safety check recalculation
    await Review.updateFacilityRating(hospitalId, labId);

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