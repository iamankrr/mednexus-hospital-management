// models/Booking.js

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // User Reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    
    // Hospital Reference
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital is required']
    },
    
    // Test Reference
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: [true, 'Test is required']
    },
    
    // Booking Details
    bookingDate: {
      type: Date,
      required: [true, 'Booking date is required']
    },
    
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required']
    },
    
    // Patient Information
    patientName: {
      type: String,
      required: [true, 'Patient name is required']
    },
    
    patientAge: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [1, 'Age must be at least 1'],
      max: [120, 'Invalid age']
    },
    
    patientGender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Patient gender is required']
    },
    
    // Payment
    totalPrice: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Wallet', 'Net Banking'],
      default: 'Cash'
    },
    
    // Booking Status
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    
    // Additional Notes
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    
    // Cancellation
    cancelledAt: {
      type: Date
    },
    
    cancellationReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// ========== Indexes ==========
bookingSchema.index({ user: 1, bookingDate: -1 });
bookingSchema.index({ hospital: 1, status: 1 });

// ========== Methods ==========
bookingSchema.methods.cancelBooking = function(reason) {
  this.status = 'Cancelled';
  this.cancelledAt = Date.now();
  this.cancellationReason = reason;
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);

