const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facilityType: {
    type: String,
    enum: ['Hospital', 'Laboratory', 'Lab', 'hospital', 'laboratory', 'lab'],
    required: true,
    set: function(val) {
      if (!val) return val;
      const lowerVal = val.toLowerCase();
      if (lowerVal === 'laboratory' || lowerVal === 'lab') return 'Laboratory'; 
      return lowerVal.charAt(0).toUpperCase() + lowerVal.slice(1);
    }
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'facilityType',
    required: true
  },
  // ✅ NEW FIELD: Stores specific doctor info if selected
  doctor: {
    id: { type: String, required: false },
    name: { type: String, required: false }
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

appointmentSchema.index({ user: 1, appointmentDate: -1 });
appointmentSchema.index({ facility: 1, appointmentDate: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);