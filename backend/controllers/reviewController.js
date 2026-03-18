// controllers/reviewController.js

const Review = require('../models/Review');
const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');

// Helper Function: Force calculate and save rating
const forceUpdateRating = async (facilityType, facilityId) => {
  try {
    const approvedReviews = await Review.find({ facilityId, status: 'approved' });
    const totalReviews = approvedReviews.length;
    let avgRating = 0;
    
    if (totalReviews > 0) {
      const sum = approvedReviews.reduce((acc, rev) => acc + rev.rating, 0);
      avgRating = parseFloat((sum / totalReviews).toFixed(1));
    }

    if (facilityType.toLowerCase() === 'hospital') {
      await Hospital.findByIdAndUpdate(facilityId, { websiteRating: avgRating, totalReviews });
    } else {
      await Laboratory.findByIdAndUpdate(facilityId, { websiteRating: avgRating, totalReviews });
    }
  } catch (err) {
    console.error('Failed to force update rating:', err);
  }
};

// ========== @desc    Add review for hospital or lab
// ========== @route   POST /api/reviews
// ========== @access  Private
exports.addReview = async (req, res) => {
  try {
    const { facilityType, facilityId, rating, title, comment } = req.body;

    if (!facilityType || !facilityId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (comment.length < 10) {
      return res.status(400).json({ success: false, message: 'Review must be at least 10 characters' });
    }

    const existingReview = await Review.findOne({ user: req.user.id, facilityId: facilityId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this facility.', alreadyReviewed: true });
    }

    const hospital = facilityType === 'hospital' ? facilityId : undefined;
    const laboratory = facilityType === 'laboratory' ? facilityId : undefined;

    // ✅ Auto-approve review for immediate reflection
    const review = await Review.create({
      user: req.user.id, facilityType, facilityId, hospital, laboratory,
      rating, title: title || '', comment, status: 'approved'
    });

    // ✅ DIRECT SYNC RATING
    await forceUpdateRating(facilityType, facilityId);

    await review.populate('user', 'name avatar phone email');

    res.status(201).json({ success: true, message: 'Review posted successfully! MedNexus rating updated.', data: review });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Already reviewed.', alreadyReviewed: true });
    res.status(500).json({ success: false, message: 'Error submitting review', error: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ facilityId: req.params.id, status: 'approved' }).populate('user', 'name avatar').sort('-createdAt');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.checkReview = async (req, res) => {
  try {
    const existingReview = await Review.findOne({ user: req.user.id, facilityId: req.params.id });
    res.status(200).json({ success: true, hasReviewed: !!existingReview, review: existingReview || null });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getAllReviewsAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
    let filter = req.query.status && req.query.status !== 'all' ? { status: req.query.status } : {};
    const reviews = await Review.find(filter).populate('user', 'name email').populate('hospital', 'name').sort('-createdAt');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });

    await forceUpdateRating(review.facilityType, review.facilityId);
    res.status(200).json({ success: true, message: `Review ${req.body.status}`, data: review });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    
    review.rating = req.body.rating;
    review.comment = req.body.comment;
    review.title = req.body.title;
    review.status = 'approved'; // Auto-approve edits for simplicity
    await review.save(); 

    await forceUpdateRating(review.facilityType, review.facilityId);
    res.status(200).json({ success: true, message: 'Updated', data: review });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.ownerReply = async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ success: false, message: 'Not authorized' });
    const review = await Review.findByIdAndUpdate(req.params.id, { ownerReply: { text: req.body.text, date: new Date() } }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, message: 'Replied', data: review });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    
    const facilityType = review.facilityType;
    const facilityId = review.facilityId;
    await review.deleteOne();
    
    await forceUpdateRating(facilityType, facilityId);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};