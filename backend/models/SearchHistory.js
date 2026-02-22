// models/SearchHistory.js - User Search History

const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    query: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    pinCode: {
      type: String,
      default: ''
    },
    searchType: {
      type: String,
      enum: ['text', 'pincode'],
      default: 'text'
    },
    resultsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
searchHistorySchema.index({ user: 1, createdAt: -1 });

// Limit to last 50 searches per user
searchHistorySchema.pre('save', async function(next) {
  const count = await mongoose.model('SearchHistory').countDocuments({ user: this.user });
  
  if (count >= 50) {
    // Delete oldest search
    await mongoose.model('SearchHistory')
      .findOneAndDelete({ user: this.user })
      .sort({ createdAt: 1 });
  }
  
  next();
});

module.exports = mongoose.model('SearchHistory', searchHistorySchema);