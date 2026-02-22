const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Laboratory name is required'],
    trim: true
  },
  
  // Theme Color
  themeColor: { 
    type: String, 
    default: '#059669' // Default Green for Labs
  },

  category: {
    type: String,
    enum: ['government', 'public', 'private', 'charity'],
    default: 'private',
    required: false
  },

  // Laboratory Type
  type: {
    type: String,
    required: true,
    enum: [
      'government',        
      'private',           
      'franchise',         
      'independent',       
      'hospital-attached', 
      'radiology',         
      'pathology'          
    ],
    default: 'independent'
  },

  email: {
    type: String,
    required: false,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  phone: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return !v || /^[0-9]{10}$/.test(v) || /^0[0-9]{10}$/.test(v);
      },
      message: 'Please enter a valid phone number (10 or 11 digits)'
    }
  },
  
  alternatePhone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Alternate phone must be 10 digits']
  },
  
  // Address
  address: {
    street: { type: String, required: false }, 
    area: { type: String, required: false },   
    city: { type: String, required: false },   
    state: { type: String, required: false },  
    pincode: { 
      type: String, 
      required: false,                         
      match: [/^[0-9]{6}$/, 'Pincode must be 6 digits']
    },
    landmark: { type: String, required: false }
  },

  googleMapsUrl: { 
    type: String 
  },
  
  location: {
    type: { type: String, default: 'Point' },
    coordinates: {
      type: [Number],
      default: [0, 0]  
    }
  },
  
  photos: [{
    url: { type: String, required: true },
    publicId: String
  }],

  images: [{ 
    type: String 
  }],
  
  services: [{
    name: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Pathology', 'Radiology', 'Cardiology', 'Other'],
      default: 'Pathology'
    },
    price: { type: Number, required: true },
    duration: { type: String },
    description: { type: String },
    isAvailable: { type: Boolean, default: true }
  }],
  
  testCategories: {
    type: [String],
    default: []
  },
  
  homeCollection: {
    type: Boolean,
    default: false
  },
  
  reportTime: {
    type: String 
  },

  accreditation: [String], 
  
  operatingHours: {
    monday: { type: String, default: '7:00 AM - 8:00 PM' },
    tuesday: { type: String, default: '7:00 AM - 8:00 PM' },
    wednesday: { type: String, default: '7:00 AM - 8:00 PM' },
    thursday: { type: String, default: '7:00 AM - 8:00 PM' },
    friday: { type: String, default: '7:00 AM - 8:00 PM' },
    saturday: { type: String, default: '7:00 AM - 5:00 PM' },
    sunday: { type: String, default: 'Closed' }
  },
  
  emergencyAvailable: {
    type: Boolean,
    default: false
  },
  
  googleRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  googleReviewCount: {
    type: Number,
    default: 0
  },
  
  websiteRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  totalReviews: {
    type: Number,
    default: 0
  },
  
  website: String,
  
  facilities: {
    type: [String],
    default: []
  },
  
  description: {
    type: String,
    required: false,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  establishedDate: {
    type: Date,
    required: false
  },

  // =====================================
  //       ✅ FIXED FIELDS HERE
  // =====================================
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

  // ✅ Changed this to a simple String Array
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

  customServices: [{
    category: { type: String },
    name: { type: String }
  }],
  // =====================================
  
  isApproved: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },

  appointmentsEnabled: {
    type: Boolean,
    default: false
  },
  
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// ========== INDEXES ==========
laboratorySchema.index({ location: '2dsphere' });  
laboratorySchema.index({ 'address.city': 1, 'address.area': 1 });
laboratorySchema.index({ name: 'text', 'address.city': 'text', 'address.area': 'text' });

// ========== METHODS ==========
laboratorySchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    {
      $match: { laboratory: this._id, isApproved: true }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.websiteRating = Math.round(stats[0].avgRating * 10) / 10;
    this.totalReviews = stats[0].count;
  } else {
    this.websiteRating = 0;
    this.totalReviews = 0;
  }
  
  await this.save();
};

module.exports = mongoose.model('Laboratory', laboratorySchema);