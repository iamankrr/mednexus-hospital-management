// controllers/hospitalController.js

const Hospital = require('../models/Hospital');

// ========== @desc    Get all hospitals
// ========== @route   GET /api/hospitals
// ========== @access  Public
exports.getAllHospitals = async (req, res) => {
  try {
    // Saare hospitals ko fetch karo
    const hospitals = await Hospital.find({ isActive: true })
      .populate('tests.testId', 'name category avgPrice')  // Test details bhi laao
      .select('-__v')                                       // __v field mat bhejo
      .sort({ rating: -1 });                                // Rating ke hisaab se sort (highest first)
    
    // Success response
    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
    
  } catch (error) {
    // Error response
    res.status(500).json({
      success: false,
      message: 'Error fetching hospitals',
      error: error.message
    });
  }
};

// ========== @desc    Get single hospital by ID
// ========== @route   GET /api/hospitals/:id
// ========== @access  Public
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate('tests.testId');
    
    // Agar hospital nahi mila
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: hospital
    });
    
  } catch (error) {
    // Agar invalid ID format hai
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid hospital ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching hospital',
      error: error.message
    });
  }
};

// ========== @desc    Search hospitals (by name, city, test)
// ========== @route   GET /api/hospitals/search?query=xray&city=delhi
// ========== @access  Public
exports.searchHospitals = async (req, res) => {
  try {
    const { query, city, minRating, maxPrice } = req.query;
    
    // Filter object banao
    let filter = { isActive: true };
    
    // City filter
    if (city) {
      filter['address.city'] = new RegExp(city, 'i');  // Case-insensitive search
    }
    
    // Rating filter
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };  // Greater than or equal
    }
    
    // Text search (name ya description mein)
    if (query) {
      filter.$or = [
        { name: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { facilities: new RegExp(query, 'i') }
      ];
    }
    
    const hospitals = await Hospital.find(filter)
      .populate('tests.testId')
      .sort({ rating: -1 });
    
    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching hospitals',
      error: error.message
    });
  }
};

// ========== @desc    Find nearby hospitals (location-based)
// ========== @route   GET /api/hospitals/nearby?lat=28.7041&lng=77.1025&distance=5000
// ========== @access  Public
exports.getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, distance } = req.query;
    
    // Validation
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseInt(distance) || 5000;  // Default 5km
    
    // Geospatial query
    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]  // [lng, lat] order important!
          },
          $maxDistance: maxDistance  // meters mein
        }
      },
      isActive: true
    })
    .populate('tests.testId')
    .limit(20);  // Maximum 20 results
    
    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding nearby hospitals',
      error: error.message
    });
  }
};

// ========== @desc    Create new hospital (Admin only)
// ========== @route   POST /api/hospitals
// ========== @access  Private/Admin
exports.createHospital = async (req, res) => {
  try {
    // Request body se data lo
    const hospital = await Hospital.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Hospital created successfully',
      data: hospital
    });
    
  } catch (error) {
    // Validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    // Duplicate key error (email/phone already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Hospital with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating hospital',
      error: error.message
    });
  }
};

// ========== @desc    Update hospital
// ========== @route   PUT /api/hospitals/:id
// ========== @access  Private/Admin
exports.updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,              // Updated document return karo
        runValidators: true     // Validation rules check karo
      }
    );
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Hospital updated successfully',
      data: hospital
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating hospital',
      error: error.message
    });
  }
};

// ========== @desc    Delete hospital
// ========== @route   DELETE /api/hospitals/:id
// ========== @access  Private/Admin
exports.deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Hospital deleted successfully',
      data: {}
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting hospital',
      error: error.message
    });
  }
};