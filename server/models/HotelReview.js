const mongoose = require('mongoose');

const hotelReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
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
    url: { type: String, required: true },
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  categories: [{
    type: String,
    enum: ['service', 'cleanliness', 'comfort', 'location', 'value', 'amenities']
  }],
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: {
      type: Boolean,
      required: true
    }
  }],
  response: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  bookingReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true,
  collection: 'hotelReviews' // Explicitly specify collection name
});

// Create compound index to prevent duplicate reviews from same user for same hotel
hotelReviewSchema.index({ user: 1, hotel: 1 }, { unique: true });

// Index for efficient querying
hotelReviewSchema.index({ hotel: 1, createdAt: -1 });
hotelReviewSchema.index({ user: 1, createdAt: -1 });
hotelReviewSchema.index({ rating: 1 });
hotelReviewSchema.index({ status: 1 });

// Calculate helpful score
hotelReviewSchema.virtual('helpfulScore').get(function() {
  if (!this.helpful || this.helpful.length === 0) return 0;
  return this.helpful.filter(h => h.helpful === true).length;
});

// Calculate not helpful score
hotelReviewSchema.virtual('notHelpfulScore').get(function() {
  if (!this.helpful || this.helpful.length === 0) return 0;
  return this.helpful.filter(h => h.helpful === false).length;
});

// Pre-save middleware to validate rating
hotelReviewSchema.pre('save', function(next) {
  if (this.rating < 1 || this.rating > 5) {
    return next(new Error('Rating must be between 1 and 5'));
  }
  next();
});

// Pre-save middleware to trim and validate comment
hotelReviewSchema.pre('save', function(next) {
  if (this.comment) {
    this.comment = this.comment.trim();
    if (this.comment.length === 0) {
      return next(new Error('Comment cannot be empty'));
    }
  }
  next();
});

module.exports = mongoose.model('HotelReview', hotelReviewSchema);