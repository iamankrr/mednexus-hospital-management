const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facilityType: {
    type: String,
    enum: ['hospital', 'laboratory'],
    required: true
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
    match: [/^[0-9]{10}$/, 'Phone must be 10 digits']
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