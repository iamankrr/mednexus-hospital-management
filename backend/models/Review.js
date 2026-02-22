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
      refPath: 'facilityType' // Dynamic reference based on facilityType
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

    // Admin approval
    isApproved: {
      type: Boolean,
      default: true // Auto-approve
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

    // Admin response (optional)
    adminResponse: {
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

// ✅ FAKE RATING PREVENTION
// One review per user per facility
reviewSchema.index(
  { user: 1, facilityType: 1, facilityId: 1 },
  { unique: true }
);

// Indexes for faster querying
reviewSchema.index({ facilityType: 1, facilityId: 1 });
reviewSchema.index({ createdAt: -1 });

// ========== MIDDLEWARE ==========

// Auto update facility rating AFTER saving a review
reviewSchema.post('save', async function() {
  await updateFacilityRating(this.facilityType, this.facilityId);
});

// Auto update facility rating AFTER deleting a review
// Note: 'deleteOne' document middleware works when document.deleteOne() is called
reviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  await updateFacilityRating(this.facilityType, this.facilityId);
});

// Also handle query middleware for findOneAndDelete / findByIdAndDelete
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await updateFacilityRating(doc.facilityType, doc.facilityId);
  }
});

// ========== HELPER FUNCTIONS ==========

// Calculate and update facility rating
async function updateFacilityRating(facilityType, facilityId) {
  try {
    // We need to access the model directly to run aggregate
    // Note: 'this' inside static context or accessing via mongoose.model
    const Review = mongoose.model('Review');
    
    const stats = await Review.aggregate([
      {
        $match: {
          facilityId: new mongoose.Types.ObjectId(facilityId), // Ensure ID is ObjectId
          facilityType: facilityType,
          isApproved: true
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
      await Hospital.findByIdAndUpdate(facilityId, {
        websiteRating: avgRating,
        totalReviews: totalReviews
      });
    } else if (facilityType === 'laboratory') {
      const Laboratory = mongoose.model('Laboratory');
      await Laboratory.findByIdAndUpdate(facilityId, {
        websiteRating: avgRating,
        totalReviews: totalReviews
      });
    }

    console.log(`✅ Updated ${facilityType} ${facilityId} rating: ${avgRating} (${totalReviews} reviews)`);
  } catch (error) {
    console.error('Error updating facility rating:', error);
  }
}

module.exports = mongoose.model('Review', reviewSchema);