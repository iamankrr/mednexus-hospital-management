const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facilityType: {
    type: String,
    // Added capitalized versions to the enum to pass validation after the setter runs
    enum: ['Hospital', 'Laboratory', 'Lab', 'hospital', 'laboratory', 'lab'],
    required: true,
    set: function(val) {
      // Automatically capitalizes the string so refPath matches your Model names perfectly
      if (!val) return val;
      const lowerVal = val.toLowerCase();
      // If your lab model is strictly named 'Lab', change 'Laboratory' to 'Lab' below
      if (lowerVal === 'laboratory' || lowerVal === 'lab') return 'Laboratory'; 
      return lowerVal.charAt(0).toUpperCase() + lowerVal.slice(1); // 'hospital' -> 'Hospital'
    }
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'facilityType',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientAge: {
    type: Number,
    required: true
  },
  patientGender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  phone: {
    type: String,
    required: true,
    // Allows 10 digits, or 11 digits starting with 0 (Standard Indian formats)
    match: [/^(0)?[0-9]{10}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    required: false,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  cancellationReason: {
    type: String,
    required: false
  },
  notes: {
    type: String
  },
  createdBy: {
    type: String,
    enum: ['user', 'admin', 'owner'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Index for faster queries
appointmentSchema.index({ user: 1, appointmentDate: -1 });
appointmentSchema.index({ facility: 1, appointmentDate: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);