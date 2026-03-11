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

    // Fields for Hospital or Laboratory
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    laboratory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory'
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

    // Status for Admin Flow (Pending -> Approved/Rejected)
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

    // Owner Reply Field
    ownerReply: {
      text: {
        type: String,
        maxlength: 500
      },
      date: {
        type: Date
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster querying
reviewSchema.index({ hospital: 1, laboratory: 1 });
reviewSchema.index({ createdAt: -1 });

// ========== STATIC HELPER FUNCTION ==========

// Calculate and update facility rating correctly (Only counts Approved reviews)
reviewSchema.statics.updateFacilityRating = async function(hospitalId, labId) {
  try {
    const matchQuery = { status: 'approved' };
    let facilityType = null;
    let facilityId = null;

    if (hospitalId) {
      matchQuery.hospital = hospitalId;
      facilityType = 'hospital';
      facilityId = hospitalId;
    } else if (labId) {
      matchQuery.laboratory = labId;
      facilityType = 'laboratory';
      facilityId = labId;
    }

    if (!facilityId) return;

    // Use .find() instead of aggregate to avoid ObjectId casting bugs
    const approvedReviews = await this.find(matchQuery);
    
    const count = approvedReviews.length;
    const sum = approvedReviews.reduce((acc, rev) => acc + (rev.rating || 0), 0);
    const avgRating = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;

    // Updates both Website Rating and App Rating so Home Screen shows accurate data instantly!
    if (facilityType === 'hospital') {
      const Hospital = mongoose.model('Hospital');
      await Hospital.findByIdAndUpdate(facilityId, {
        websiteRating: avgRating,
        totalReviews: count,
        appRating: avgRating,
        appReviewCount: count
      });
    } else if (facilityType === 'laboratory') {
      const Laboratory = mongoose.model('Laboratory');
      await Laboratory.findByIdAndUpdate(facilityId, {
        websiteRating: avgRating,
        totalReviews: count,
        appRating: avgRating,
        appReviewCount: count
      });
    }

    console.log(`✅ Updated ${facilityType} ${facilityId} rating: ${avgRating} (${count} reviews)`);
  } catch (error) {
    console.error('Error updating facility rating:', error);
  }
};

// ========== MIDDLEWARE ==========

reviewSchema.post('save', async function() {
  await this.constructor.updateFacilityRating(this.hospital, this.laboratory);
});

reviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  await this.constructor.updateFacilityRating(this.hospital, this.laboratory);
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.updateFacilityRating(doc.hospital, doc.laboratory);
  }
});

module.exports = mongoose.model('Review', reviewSchema);