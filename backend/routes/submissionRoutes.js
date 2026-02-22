const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const FacilitySubmission = require('../models/FacilitySubmission');

// ===== SUBMIT FACILITY (User) =====
router.post('/', protect, async (req, res) => {
  try {
    const { facilityType, name, address, phone, email, additionalInfo } = req.body;

    console.log('📝 New facility submission:', name);

    // Validation
    if (!facilityType || !name || !address?.street || !address?.city || !address?.state) {
      return res.status(400).json({
        success: false,
        message: 'Facility type, name, street, city, and state are required'
      });
    }

    // Create submission
    const submission = await FacilitySubmission.create({
      submittedBy: req.user.id,
      facilityType,
      name,
      address,
      phone,
      email,
      additionalInfo,
      status: 'pending'
    });

    console.log('✅ Submission created:', submission._id);

    res.status(201).json({
      success: true,
      message: 'Facility submitted for admin review',
      data: submission
    });

  } catch (error) {
    console.error('❌ Submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== GET ALL SUBMISSIONS (Admin) =====
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }

    const { status } = req.query; // 'pending' or 'approved'
    
    let filter = {};
    if (status === 'pending') {
      filter.status = 'pending';
    } else if (status === 'approved') {
      filter.status = 'approved';
    }

    const submissions = await FacilitySubmission.find(filter)
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name email');

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== GET USER'S SUBMISSIONS =====
router.get('/my-submissions', protect, async (req, res) => {
  try {
    const submissions = await FacilitySubmission.find({ submittedBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });

  } catch (error) {
    console.error('❌ Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== GET SINGLE SUBMISSION (User can view own) =====
router.get('/:id', protect, async (req, res) => {
  try {
    const submission = await FacilitySubmission.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check permission
    if (req.user.role !== 'admin' && submission.submittedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('❌ Get submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== APPROVE SUBMISSION (Admin) =====
router.put('/:id/approve', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }

    const submission = await FacilitySubmission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Mark as approved
    submission.status = 'approved';
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();
    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Submission approved successfully',
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== DELETE SUBMISSION (User can delete own if pending) =====
router.delete('/:id', protect, async (req, res) => {
  try {
    const submission = await FacilitySubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Only allow deletion if pending and user owns it, or if admin
    if (req.user.role !== 'admin' && submission.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (req.user.role !== 'admin' && submission.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete already reviewed submission'
      });
    }

    await submission.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Submission deleted'
    });

  } catch (error) {
    console.error('❌ Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;