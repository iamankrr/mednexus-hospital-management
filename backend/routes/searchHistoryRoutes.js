// routes/searchHistoryRoutes.js - Search History Routes

const express = require('express');
const router = express.Router();
const SearchHistory = require('../models/SearchHistory');
const { protect } = require('../middleware/authMiddleware');

// ========== @desc    Save search to history
// ========== @route   POST /api/search-history
// ========== @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { query, location, pinCode, searchType, resultsCount } = req.body;

    // Don't save empty searches
    if (!query && !location && !pinCode) {
      return res.status(400).json({
        success: false,
        message: 'No search data provided'
      });
    }

    const searchHistory = await SearchHistory.create({
      user: req.user.id,
      query: query || '',
      location: location || '',
      pinCode: pinCode || '',
      searchType: searchType || 'text',
      resultsCount: resultsCount || 0
    });

    res.status(201).json({
      success: true,
      data: searchHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving search history',
      error: error.message
    });
  }
});

// ========== @desc    Get user's search history
// ========== @route   GET /api/search-history
// ========== @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const searchHistory = await SearchHistory.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(20);

    res.status(200).json({
      success: true,
      count: searchHistory.length,
      data: searchHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching search history',
      error: error.message
    });
  }
});

// ========== @desc    Clear search history
// ========== @route   DELETE /api/search-history
// ========== @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await SearchHistory.deleteMany({ user: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Search history cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing search history',
      error: error.message
    });
  }
});

// ========== @desc    Delete single search
// ========== @route   DELETE /api/search-history/:id
// ========== @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const search = await SearchHistory.findById(req.params.id);

    if (!search) {
      return res.status(404).json({
        success: false,
        message: 'Search not found'
      });
    }

    // Check ownership
    if (search.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await search.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Search deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting search',
      error: error.message
    });
  }
});

module.exports = router;