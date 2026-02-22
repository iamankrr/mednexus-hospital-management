const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  // ✅ Fixed: Phone is properly made optional
  phone: {
    type: String,
    required: false,
    match: [/^[0-9]{10}$/, 'Phone must be 10 digits']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'owner'],
    default: 'user'
  },
  ownerProfile: {
    facilityType: {
      type: String,
      enum: ['hospital', 'laboratory'],
      required: function() { return this.role === 'owner'; }
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'ownerProfile.facilityType',
      required: function() { return this.role === 'owner'; }
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDocuments: [{
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    businessLicense: String,
    registrationNumber: String
  },
  // ✅ Favorites field pehle se hi yahan perfectly added hai
  favorites: {
    hospitals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    }],
    laboratories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory'
    }]
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ========== PASSWORD ENCRYPTION ==========
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ========== PASSWORD COMPARISON ==========
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ========== GET PUBLIC PROFILE ==========
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isActive: this.isActive,
    isVerified: this.isVerified
  };
};

module.exports = mongoose.model('User', userSchema);