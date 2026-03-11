// models/Review.js - Review Model

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // User who wrote the review
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },

    // Dynamic facility reference (Hospital or Laboratory)
    facilityType: {
      type: String,
      enum: ['hospital', 'laboratory'],
      required: [true, 'Facility type is required']
    },
    
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Facility ID is required'],
      refPath: 'facilityType' 
    },

    // Rating (1-5 stars)
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },

    // Review title (optional)
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: ''
    },

    // Review comment
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [500, 'Review cannot exceed 500 characters']
    },

    // ✅ FIX: Changed to status for Admin Flow (Pending -> Approve/Reject)
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },

    // Helpful count
    helpfulCount: {
      type: Number,
      default: 0
    },

    // Users who marked helpful (prevents multiple votes)
    helpfulVotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    // ✅ FIX: Added Owner Reply field
    ownerReply: {
      text: { type: String, maxlength: 500 },
      date: { type: Date }
    }
  },
  {
    timestamps: true
  }
);

// One review per user per facility
reviewSchema.index(
  { user: 1, facilityType: 1, facilityId: 1 },
  { unique: true }
);

// Indexes for faster querying
reviewSchema.index({ facilityType: 1, facilityId: 1 });
reviewSchema.index({ createdAt: -1 });


// ========== STATIC HELPER FUNCTION ==========
// Calculate and update facility rating correctly
reviewSchema.statics.updateFacilityRating = async function(facilityType, facilityId) {
  try {
    const objectId = typeof facilityId === 'string' ? new mongoose.Types.ObjectId(facilityId) : facilityId;

    const stats = await this.aggregate([
      {
        $match: {
          facilityId: objectId,
          facilityType: facilityType,
          status: 'approved' // Only count approved reviews!
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    const avgRating = stats.length > 0 ? parseFloat(stats[0].avgRating.toFixed(1)) : 0;
    const totalReviews = stats.length > 0 ? stats[0].count : 0;

    if (facilityType === 'hospital') {
      const Hospital = mongoose.model('Hospital');
      await Hospital.findByIdAndUpdate(objectId, {
        websiteRating: avgRating,
        totalReviews: totalReviews,
        appRating: avgRating,       // Sync for Home Screen
        appReviewCount: totalReviews // Sync for Home Screen
      });
    } else if (facilityType === 'laboratory') {
      const Laboratory = mongoose.model('Laboratory');
      await Laboratory.findByIdAndUpdate(objectId, {
        websiteRating: avgRating,
        totalReviews: totalReviews,
        appRating: avgRating,       // Sync for Home Screen
        appReviewCount: totalReviews // Sync for Home Screen
      });
    }

    console.log(`✅ Updated ${facilityType} ${facilityId} rating: ${avgRating} (${totalReviews} reviews)`);
  } catch (error) {
    console.error('Error updating facility rating:', error);
  }
};

// ========== MIDDLEWARE ==========
reviewSchema.post('save', async function() {
  await this.constructor.updateFacilityRating(this.facilityType, this.facilityId);
});

reviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  await this.constructor.updateFacilityRating(this.facilityType, this.facilityId);
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.updateFacilityRating(doc.facilityType, doc.facilityId);
  }
});

module.exports = mongoose.model('Review', reviewSchema);