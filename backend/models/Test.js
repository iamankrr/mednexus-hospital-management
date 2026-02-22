// models/Test.js

const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    // Test Information
    name: {
      type: String,
      required: [true, 'Test name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Test name cannot exceed 100 characters']
    },
    
    // Category
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Radiology', 'Pathology', 'Cardiology', 'Neurology', 'General', 'Other'],
        message: '{VALUE} is not a valid category'
      }
    },
    
    // Description
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // Preparation Instructions
    preparation: {
      type: String,
      default: 'No special preparation required'
    },
    
    // Average Price (for reference)
    avgPrice: {
      type: Number,
      required: [true, 'Average price is required'],
      min: [0, 'Price cannot be negative']
    },
    
    // Duration (in minutes)
    duration: {
      type: Number,
      default: 30,
      min: [1, 'Duration must be at least 1 minute']
    },
    
    // Fasting Required?
    fastingRequired: {
      type: Boolean,
      default: false
    },
    
    // Sample Type (for pathology tests)
    sampleType: {
      type: String,
      enum: ['Blood', 'Urine', 'Stool', 'Tissue', 'Scan', 'X-Ray', 'MRI', 'CT Scan', 'Other', 'N/A'],
      default: 'N/A'
    },
    
    // Report Time (in hours)
    reportTime: {
      type: Number,
      default: 24,  // 24 hours
      min: [1, 'Report time must be at least 1 hour']
    },
    
    // Search Keywords (for better search)
    keywords: {
      type: [String],
      default: []
    },
    
    // Active Status
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// ========== Indexes ==========
testSchema.index({ name: 'text', category: 'text', keywords: 'text' });

// ========== Methods ==========
testSchema.methods.getInfo = function() {
  return {
    name: this.name,
    category: this.category,
    avgPrice: this.avgPrice,
    duration: `${this.duration} minutes`,
    reportTime: `${this.reportTime} hours`
  };
};

module.exports = mongoose.model('Test', testSchema);