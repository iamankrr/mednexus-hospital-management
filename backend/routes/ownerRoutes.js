const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');

// POST /api/owner/register - Register as owner
router.post('/register', protect, async (req, res) => {
  try {
    const { facilityType, facilityId, phone, email, businessLicense, registrationNumber } = req.body;

    console.log('📝 Owner registration:', req.user.email);

    // Validation
    if (!facilityType || !facilityId || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if already owner
    if (req.user.role === 'owner' && req.user.ownerProfile?.facilityId) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as an owner'
      });
    }

    // Check facility
    const Model = facilityType === 'hospital' ? Hospital : Laboratory;
    const facility = await Model.findById(facilityId);

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // Check if facility already has an owner
    if (facility.owner) {
      return res.status(400).json({ success: false, message: 'Facility already has an owner' });
    }

    // ✅ Update user - DON'T change role to owner yet, only after admin approval
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        phone,
        email,
        ownerProfile: {
          facilityType,
          facilityId,
          isVerified: false, // ✅ Pending admin approval
          businessLicense,
          registrationNumber
        }
      },
      { new: true }
    ).select('-password');

    // Link owner to facility
    await Model.findByIdAndUpdate(facilityId, { owner: req.user.id });

    console.log('✅ Owner registration pending approval:', updatedUser.email);

    res.status(200).json({
      success: true,
      message: 'Registration submitted. Awaiting admin approval.',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Owner registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;