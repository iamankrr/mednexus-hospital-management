// routes/comparisonRoutes.js - Comparison System Routes

const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');

// ========== @desc    Compare Hospitals
// ========== @route   POST /api/compare/hospitals
// ========== @access  Public
router.post('/hospitals', async (req, res) => {
  try {
    const { hospitalIds } = req.body;

    if (!hospitalIds || !Array.isArray(hospitalIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of hospital IDs'
      });
    }

    if (hospitalIds.length < 2 || hospitalIds.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Please select 2 or 3 hospitals to compare'
      });
    }

    const hospitals = await Hospital.find({
      _id: { $in: hospitalIds }
    }).populate('tests');

    if (hospitals.length !== hospitalIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more hospitals not found'
      });
    }

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error comparing hospitals',
      error: error.message
    });
  }
});

// ========== @desc    Compare Laboratories
// ========== @route   POST /api/compare/labs
// ========== @access  Public
router.post('/labs', async (req, res) => {
  try {
    const { labIds } = req.body;

    if (!labIds || !Array.isArray(labIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of lab IDs'
      });
    }

    if (labIds.length < 2 || labIds.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Please select 2 or 3 labs to compare'
      });
    }

    const labs = await Laboratory.find({
      _id: { $in: labIds }
    });

    if (labs.length !== labIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more labs not found'
      });
    }

    res.status(200).json({
      success: true,
      count: labs.length,
      data: labs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error comparing labs',
      error: error.message
    });
  }
});

module.exports = router;