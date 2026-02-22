const mongoose = require('mongoose');

const facilitySubmissionSchema = new mongoose.Schema({
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facilityType: {
    type: String,
    enum: ['hospital', 'laboratory'],
    required: true
  },
  
  // ✅ Added facilityData field to store dynamic form data
  facilityData: {
    type: mongoose.Schema.Types.Mixed,
    required: false 
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: { type: String, required: true },
    area: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: false },
    landmark: { type: String, required: false }
  },
  phone: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  additionalInfo: {
    type: String,
    required: false
  },
  
  // ✅ Added isApproved field
  isApproved: {
    type: Boolean,
    default: false
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  adminNotes: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  approvedFacilityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'facilityType'
  }
}, {
  timestamps: true
});

// Index for faster queries
facilitySubmissionSchema.index({ submittedBy: 1, status: 1 });
facilitySubmissionSchema.index({ status: 1, createdAt: -1 });

// Exporting as FacilitySubmission to match your existing route imports
module.exports = mongoose.model('FacilitySubmission', facilitySubmissionSchema);