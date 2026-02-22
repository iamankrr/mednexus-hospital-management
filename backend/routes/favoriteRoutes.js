const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');

// ===== GET USER FAVORITES (with populated data) =====
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favorites.hospitals',
        select: 'name type address location phone email googleRating googleReviewCount facilities images distance'
      })
      .populate({
        path: 'favorites.laboratories',
        select: 'name type address location phone email googleRating googleReviewCount facilities images distance reportTime homeCollection'
      });

    if (!user.favorites) {
      user.favorites = { hospitals: [], laboratories: [] };
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: user.favorites || { hospitals: [], laboratories: [] }
    });
  } catch (error) {
    console.error('❌ Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== ADD TO FAVORITES =====
router.post('/add', protect, async (req, res) => {
  try {
    const { facilityId, facilityType } = req.body;
    const userId = req.user._id;

    console.log('📍 Add to favorites:', { facilityId, facilityType, userId });

    // Validate inputs
    if (!facilityId || !facilityType) {
      return res.status(400).json({
        success: false,
        message: 'Facility ID and type are required'
      });
    }

    if (!['hospital', 'laboratory'].includes(facilityType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid facility type'
      });
    }

    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize favorites if doesn't exist
    if (!user.favorites) {
      user.favorites = { hospitals: [], laboratories: [] };
    }

    // Get the appropriate array
    const favArray = facilityType === 'hospital' 
      ? user.favorites.hospitals 
      : user.favorites.laboratories;

    // Check if already exists
    const exists = favArray.some(id => id.toString() === facilityId);
    
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Already added to favorites'
      });
    }

    // Verify facility exists
    const Model = facilityType === 'hospital' ? Hospital : Laboratory;
    const facility = await Model.findById(facilityId);
    
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: `${facilityType} not found`
      });
    }

    // Add to favorites
    favArray.push(facilityId);
    await user.save();

    console.log('✅ Added to favorites successfully');

    // Populate and return
    await user.populate('favorites.hospitals favorites.laboratories');

    res.status(200).json({
      success: true,
      message: 'Added to favorites',
      data: user.favorites
    });
  } catch (error) {
    console.error('❌ Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== REMOVE FROM FAVORITES =====
router.post('/remove', protect, async (req, res) => {
  try {
    const { facilityId, facilityType } = req.body;
    const userId = req.user._id;

    console.log('📍 Remove from favorites:', { facilityId, facilityType, userId });

    // Validate inputs
    if (!facilityId || !facilityType) {
      return res.status(400).json({
        success: false,
        message: 'Facility ID and type are required'
      });
    }

    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize favorites if doesn't exist
    if (!user.favorites) {
      user.favorites = { hospitals: [], laboratories: [] };
    }

    // Remove from appropriate array
    if (facilityType === 'hospital') {
      user.favorites.hospitals = user.favorites.hospitals.filter(
        id => id.toString() !== facilityId
      );
    } else {
      user.favorites.laboratories = user.favorites.laboratories.filter(
        id => id.toString() !== facilityId
      );
    }

    await user.save();

    console.log('✅ Removed from favorites successfully');

    // Populate and return
    await user.populate('favorites.hospitals favorites.laboratories');

    res.status(200).json({
      success: true,
      message: 'Removed from favorites',
      data: user.favorites
    });
  } catch (error) {
    console.error('❌ Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== CHECK IF FAVORITE =====
router.get('/check/:facilityType/:facilityId', protect, async (req, res) => {
  try {
    const { facilityType, facilityId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    
    if (!user || !user.favorites) {
      return res.status(200).json({
        success: true,
        isFavorite: false
      });
    }

    const favArray = facilityType === 'hospital' 
      ? user.favorites.hospitals 
      : user.favorites.laboratories;

    const isFavorite = favArray.some(id => id.toString() === facilityId);

    res.status(200).json({
      success: true,
      isFavorite
    });
  } catch (error) {
    console.error('❌ Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;