// controllers/reviewController.js

const Review = require('../models/Review');
const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');

// ========== @desc    Add review for hospital or lab
// ========== @route   POST /api/reviews
// ========== @access  Private (Logged in users only)
exports.addReview = async (req, res) => {
  try {
    const { hospital, laboratory, rating, comment, title } = req.body;
    
    // Validation: Must provide either hospital or lab
    if (!hospital && !laboratory) {
      return res.status(400).json({
        success: false,
        message: 'Please specify either hospital or laboratory'
      });
    }
    
    if (hospital && laboratory) {
      return res.status(400).json({
        success: false,
        message: 'Cannot review both hospital and laboratory at once'
      });
    }
    
    // Check if hospital/lab exists
    if (hospital) {
      const hospitalExists = await Hospital.findById(hospital);
      if (!hospitalExists) {
        return res.status(404).json({
          success: false,
          message: 'Hospital not found'
        });
      }
    }
    
    if (laboratory) {
      const labExists = await Laboratory.findById(laboratory);
      if (!labExists) {
        return res.status(404).json({
          success: false,
          message: 'Laboratory not found'
        });
      }
    }
    
    // Check if user already reviewed
    const existingReview = await Review.findOne({
      user: req.user.id,
      ...(hospital && { hospital }),
      ...(laboratory && { laboratory })
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this facility. Please edit your existing review.'
      });
    }
    
    // Create review
    const review = await Review.create({
      user: req.user.id,
      hospital,
      laboratory,
      rating,
      comment,
      title
    });
    
    // Populate user details
    await review.populate('user', 'name avatar');
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review
    });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message
    });
  }
};

// ========== @desc    Get reviews for hospital or lab
// ========== @route   GET /api/reviews?hospital=ID or ?laboratory=ID
// ========== @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { hospital, laboratory, limit = 10, page = 1 } = req.query;
    
    if (!hospital && !laboratory) {
      return res.status(400).json({
        success: false,
        message: 'Please provide hospital or laboratory ID'
      });
    }
    
    const filter = { isApproved: true };
    if (hospital) filter.hospital = hospital;
    if (laboratory) filter.laboratory = laboratory;
    
    const reviews = await Review.find(filter)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Review.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
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

// ========== @desc    Get single review
// ========== @route   GET /api/reviews/:id
// ========== @access  Public
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('hospital', 'name')
      .populate('laboratory', 'name');
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: review
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
};

// ========== @desc    Update review
// ========== @route   PUT /api/reviews/:id
// ========== @access  Private (Review owner only)
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user owns this review
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }
    
    const { rating, comment, title } = req.body;
    
    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment, title },
      { new: true, runValidators: true }
    ).populate('user', 'name avatar');
    
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

// ========== @desc    Delete review
// ========== @route   DELETE /api/reviews/:id
// ========== @access  Private (Review owner or admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check authorization
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }
    
    await review.remove();
    
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

// ========== @desc    Mark review as helpful
// ========== @route   PUT /api/reviews/:id/helpful
// ========== @access  Public
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Marked as helpful',
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

// ========== @desc    Get user's reviews
// ========== @route   GET /api/reviews/my-reviews
// ========== @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('hospital', 'name photos')
      .populate('laboratory', 'name photos')
      .sort({ createdAt: -1 });
    
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

// ========== ADMIN ONLY ==========

// ========== @desc    Approve/Reject review
// ========== @route   PUT /api/reviews/:id/approve
// ========== @access  Private/Admin
exports.approveReview = async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
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

// ========== @desc    Get all reviews (for admin)
// ========== @route   GET /api/reviews/admin/all
// ========== @access  Private/Admin
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = {};
    if (status === 'pending') filter.isApproved = false;
    if (status === 'approved') filter.isApproved = true;
    
    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('hospital', 'name')
      .populate('laboratory', 'name')
      .sort({ createdAt: -1 });
    
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