// controllers/testController.js

const Test = require('../models/Test');

// ========== @desc    Get all tests
// ========== @route   GET /api/tests
// ========== @access  Public
exports.getAllTests = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let filter = { isActive: true };
    
    // Category filter
    if (category) {
      filter.category = category;
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { keywords: new RegExp(search, 'i') }
      ];
    }
    
    const tests = await Test.find(filter)
      .sort({ name: 1 });  // Alphabetical order
    
    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tests',
      error: error.message
    });
  }
};

// ========== @desc    Get single test by ID
// ========== @route   GET /api/tests/:id
// ========== @access  Public
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: test
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching test',
      error: error.message
    });
  }
};

// ========== @desc    Create new test
// ========== @route   POST /api/tests
// ========== @access  Private/Admin
exports.createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: test
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
      message: 'Error creating test',
      error: error.message
    });
  }
};

// ========== @desc    Update test
// ========== @route   PUT /api/tests/:id
// ========== @access  Private/Admin
exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      data: test
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating test',
      error: error.message
    });
  }
};

// ========== @desc    Delete test
// ========== @route   DELETE /api/tests/:id
// ========== @access  Private/Admin
exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Test deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting test',
      error: error.message
    });
  }
};