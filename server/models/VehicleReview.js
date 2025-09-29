const mongoose = require('mongoose');

const vehicleReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  images: [{
    url: String,
    caption: String
  }],
  categories: [{
    type: String,
    enum: ['service', 'cleanliness', 'value', 'location', 'staff', 'facilities']
  }],
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: Boolean
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved' // Vehicle reviews are auto-approved for now
  },
  bookingReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VehicleBooking'
  }
}, {
  timestamps: true,
  collection: 'vehicleReviews' // Explicitly set collection name
});

// Ensure only one review per user per vehicle
vehicleReviewSchema.index({ user: 1, vehicle: 1 }, { unique: true });

// Indexes for better query performance
vehicleReviewSchema.index({ vehicle: 1, createdAt: -1 });
vehicleReviewSchema.index({ rating: 1 });
vehicleReviewSchema.index({ isVerified: 1 });

// Virtual for helpful count
vehicleReviewSchema.virtual('helpfulCount').get(function() {
  return this.helpful.filter(h => h.helpful === true).length;
});

// Virtual for not helpful count
vehicleReviewSchema.virtual('notHelpfulCount').get(function() {
  return this.helpful.filter(h => h.helpful === false).length;
});

// Ensure virtuals are included when converting to JSON
vehicleReviewSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('VehicleReview', vehicleReviewSchema);