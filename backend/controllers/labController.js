// controllers/labController.js

const Laboratory = require('../models/Laboratory');

// ========== @desc    Get all laboratories
// ========== @route   GET /api/labs
// ========== @access  Public
exports.getAllLabs = async (req, res) => {
  try {
    const { search, city, area, emergency, minRating } = req.query;
    
    let filter = { isActive: true, isApproved: true };
    
    // Search by name, city, or area
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
        { 'address.area': new RegExp(search, 'i') }
      ];
    }
    
    // Filter by city
    if (city) {
      filter['address.city'] = new RegExp(city, 'i');
    }
    
    // Filter by area
    if (area) {
      filter['address.area'] = new RegExp(area, 'i');
    }
    
    // Filter by emergency availability
    if (emergency === 'true') {
      filter.emergencyAvailable = true;
    }
    
    // Filter by minimum rating
    if (minRating) {
      filter.websiteRating = { $gte: parseFloat(minRating) };
    }
    
    const labs = await Laboratory.find(filter)
      .select('-__v')
      .sort({ websiteRating: -1, totalReviews: -1 });
    
    res.status(200).json({
      success: true,
      count: labs.length,
      data: labs
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching laboratories',
      error: error.message
    });
  }
};

// ========== @desc    Get single laboratory
// ========== @route   GET /api/labs/:id
// ========== @access  Public
exports.getLabById = async (req, res) => {
  try {
    const lab = await Laboratory.findById(req.params.id)
      .populate('addedBy', 'name email');
    
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lab
    });
    
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid laboratory ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching laboratory',
      error: error.message
    });
  }
};

// ========== @desc    Get nearby laboratories
// ========== @route   GET /api/labs/nearby?lat=28.7041&lng=77.1025&distance=5000
// ========== @access  Public
exports.getNearbyLabs = async (req, res) => {
  try {
    const { lat, lng, distance } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseInt(distance) || 5000;  // Default 5km
    
    const labs = await Laboratory.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      },
      isActive: true,
      isApproved: true
    })
    .select('-__v')
    .limit(20);
    
    res.status(200).json({
      success: true,
      count: labs.length,
      data: labs
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding nearby laboratories',
      error: error.message
    });
  }
};

// ========== @desc    Create new laboratory
// ========== @route   POST /api/labs
// ========== @access  Private/Admin
exports.createLab = async (req, res) => {
  try {
    // Add user who created this
    req.body.addedBy = req.user?.id;
    
    const lab = await Laboratory.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Laboratory created successfully',
      data: lab
    });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Laboratory with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating laboratory',
      error: error.message
    });
  }
};

// ========== @desc    Update laboratory
// ========== @route   PUT /api/labs/:id
// ========== @access  Private/Admin
exports.updateLab = async (req, res) => {
  try {
    const lab = await Laboratory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Laboratory updated successfully',
      data: lab
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating laboratory',
      error: error.message
    });
  }
};

// ========== @desc    Delete laboratory
// ========== @route   DELETE /api/labs/:id
// ========== @access  Private/Admin
exports.deleteLab = async (req, res) => {
  try {
    const lab = await Laboratory.findByIdAndDelete(req.params.id);
    
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Laboratory deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting laboratory',
      error: error.message
    });
  }
};