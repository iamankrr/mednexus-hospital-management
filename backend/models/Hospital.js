const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide hospital name'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please provide hospital type'],
    trim: true 
  },
  category: {
    type: String,
    enum: ['Private', 'Government', 'Charity', 'Public', 'private', 'government', 'charity', 'public'], 
    default: 'private'
  },
  description: {
    type: String
  },
  address: {
    street: String,
    area: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v) || /^0[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: {
    type: String,
    required: false
  },
  website: String,
  operatingHours: {
    monday: { type: String, default: '9:00 AM - 6:00 PM' },
    tuesday: { type: String, default: '9:00 AM - 6:00 PM' },
    wednesday: { type: String, default: '9:00 AM - 6:00 PM' },
    thursday: { type: String, default: '9:00 AM - 6:00 PM' },
    friday: { type: String, default: '9:00 AM - 6:00 PM' },
    saturday: { type: String, default: '9:00 AM - 2:00 PM' },
    sunday: { type: String, default: 'Closed' }
  },
  emergencyAvailable: {
    type: Boolean,
    default: false
  },
  facilities: [String],
  images: [String],
  googleRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  googleReviewCount: {
    type: Number,
    default: 0
  },
  
  // ==========================================
  // ✅ FIX: ADDED APP RATING FIELDS FOR HOME SCREEN
  // ==========================================
  appRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  appReviewCount: {
    type: Number,
    default: 0
  },

  googlePlaceId: String,
  isActive: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  appointmentsEnabled: {
    type: Boolean,
    default: false
  },
  themeColor: {
    type: String,
    default: '#2563EB'
  },
  establishedDate: {
    type: Date,
    required: false
  },
  tests: [{ type: String }],
  treatments: [{ type: String }],
  surgeries: [{ type: String }],
  procedures: [{ type: String }],
  therapies: [{ type: String }],
  managementServices: [{ type: String }],
  insuranceAccepted: [{ type: String }],
  numberOfBeds: {
    type: Number,
    default: 0
  },
  doctors: [{
    name: { type: String, required: true },
    photo: { type: String },
    specialization: { type: String, required: true },
    rating: { type: Number, default: 0 },
    experience: { type: String },
    qualification: { type: String },
    availability: { type: String },
    consultationFee: { type: Number }
  }],
  services: [{
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    price: { type: Number, default: null },
    duration: { type: String },
    description: { type: String },
    isAvailable: { type: Boolean, default: true }
  }],
  customServices: [{
    category: { type: String },
    name: { type: String }
  }]
}, {
  timestamps: true
});

hospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', hospitalSchema);