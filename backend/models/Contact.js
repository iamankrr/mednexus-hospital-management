const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    default: 'general_inquiry' 
  },
  subject: { 
    type: String 
  },
  message: { 
    type: String, 
    required: true 
  },
  organizationType: { 
    type: String 
  },
  organizationName: { 
    type: String 
  },
  address: { 
    type: String 
  },
  website: { 
    type: String 
  },
  // ✅ FIX: Added status field for Admin Flow (Pending, In Progress, Resolved, Rejected)
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  adminNotes: { 
    type: String 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Contact', contactSchema);