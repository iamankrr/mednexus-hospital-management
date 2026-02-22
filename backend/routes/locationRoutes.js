// routes/locationRoutes.js - Location Hierarchy Routes

const express = require('express');
const router = express.Router();
const { getStates, getDistricts, getCities } = require('../data/locations');

// ========== @desc    Get all states
// ========== @route   GET /api/locations/states
// ========== @access  Public
router.get('/states', (req, res) => {
  try {
    const states = getStates();
    
    res.status(200).json({
      success: true,
      count: states.length,
      data: states
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching states',
      error: error.message
    });
  }
});

// ========== @desc    Get districts by state
// ========== @route   GET /api/locations/districts/:state
// ========== @access  Public
router.get('/districts/:state', (req, res) => {
  try {
    const { state } = req.params;
    const districts = getDistricts(state);
    
    res.status(200).json({
      success: true,
      count: districts.length,
      data: districts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching districts',
      error: error.message
    });
  }
});

// ========== @desc    Get cities by state and district
// ========== @route   GET /api/locations/cities/:state/:district
// ========== @access  Public
router.get('/cities/:state/:district', (req, res) => {
  try {
    const { state, district } = req.params;
    const cities = getCities(state, district);
    
    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cities',
      error: error.message
    });
  }
});

module.exports = router;