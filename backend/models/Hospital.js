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
  
  // 🚑 Emergency Info (Upgraded)
  emergencyAvailable: { type: Boolean, default: false },
  emergencyDetails: {
    contactNumber: String,
    traumaCenter: { type: Boolean, default: false },
    ambulanceCount: { type: Number, default: 0 },
    doctors24x7: { type: Boolean, default: false }
  },

  facilities: [String],
  images: [String],
  
  googleRating: { type: Number, min: 0, max: 5, default: 0 },
  googleReviewCount: { type: Number, default: 0 },
  appRating: { type: Number, min: 0, max: 5, default: 0 },
  appReviewCount: { type: Number, default: 0 },
  googlePlaceId: String,
  
  isActive: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appointmentsEnabled: { type: Boolean, default: false },
  themeColor: { type: String, default: '#2563EB' },
  establishedDate: { type: Date, required: false },
  
  // Service Arrays
  tests: [{ type: String }],
  treatments: [{ type: String }],
  surgeries: [{ type: String }],
  procedures: [{ type: String }],
  therapies: [{ type: String }],
  managementServices: [{ type: String }],
  insuranceAccepted: [{ type: String }],
  
  numberOfBeds: { type: Number, default: 0 },

  // 🧑‍⚕️ Doctors Section (Upgraded)
  doctors: [{
    name: { type: String, required: true },
    photo: { type: String },
    specialization: { type: String, required: true },
    rating: { type: Number, default: 0 },
    experience: { type: String }, // e.g., "18 Years"
    qualification: { type: String }, // e.g., "MBBS, MD"
    availability: { type: String }, // e.g., "Mon-Sat 10AM-2PM"
    consultationFee: { type: Number },
    languages: [{ type: String }] // e.g., ["English", "Hindi"]
  }],

  // 🏢 Departments
  departments: [{
    name: { type: String },
    description: { type: String },
    headDoctor: { type: String }
  }],

  // 💰 Packages & Price List
  packages: [{
    name: { type: String }, // e.g., "Full Body Checkup"
    price: { type: Number },
    includedTests: [{ type: String }],
    duration: { type: String }
  }],

  // 🛏️ Room Types
  roomTypes: [{
    type: { type: String }, // e.g., "General Ward", "ICU"
    pricePerDay: { type: Number },
    facilities: [{ type: String }]
  }],

  // 🧑‍💼 Staff & Management
  staffAndManagement: {
    medicalDirector: String,
    chiefSurgeon: String,
    nursingHead: String,
    adminManager: String
  },

  // 🧪 Diagnostic Center Details
  diagnosticCenterDetails: {
    labAvailable: { type: Boolean, default: false },
    nablCertified: { type: Boolean, default: false },
    reportTime: String,
    homeSampleCollection: { type: Boolean, default: false }
  },

  // 📄 Documents / Certificates
  documents: {
    nabhAccreditation: { type: Boolean, default: false },
    isoCertification: { type: Boolean, default: false },
    governmentApproval: { type: Boolean, default: false },
    awards: [{ type: String }]
  },

  // 📱 Social Media
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String
  },

  // 🔔 Announcements
  announcements: [{
    title: String,
    description: String,
    date: { type: Date, default: Date.now }
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