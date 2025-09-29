const mongoose = require('mongoose');

const cancellationRequestSchema = new mongoose.Schema({
  // Reference to the booking being cancelled
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'bookingType',
    required: [true, 'Booking reference is required']
  },
  
  // Type of booking (for polymorphic reference)
  bookingType: {
    type: String,
    enum: ['Booking', 'TourBooking', 'VehicleBooking', 'GuideBooking', 'VehicleRental'],
    required: [true, 'Booking type is required']
  },
  
  // User requesting cancellation
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // Cancellation reason provided by customer
  reason: {
    type: String,
    required: [true, 'Cancellation reason is required'],
    trim: true,
    maxlength: [1000, 'Reason cannot exceed 1000 characters']
  },
  
  // Status of the cancellation request
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  // Staff member who reviewed the request
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  // Review date
  reviewedAt: {
    type: Date,
    required: false
  },
  
  // Staff notes/comments
  staffNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Staff notes cannot exceed 500 characters']
  },
  
  // Refund amount (calculated by staff)
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative'],
    required: false
  },
  
  // Refund method
  refundMethod: {
    type: String,
    enum: ['original_payment', 'bank_transfer', 'cash', 'credit'],
    required: false
  },
  
  // Additional documents or attachments
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Requested cancellation date
  requestedCancellationDate: {
    type: Date,
    required: true
  },
  
  // Actual cancellation date (when staff processes it)
  actualCancellationDate: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
cancellationRequestSchema.index({ user: 1, status: 1 });
cancellationRequestSchema.index({ booking: 1, bookingType: 1 });
cancellationRequestSchema.index({ status: 1, createdAt: -1 });
cancellationRequestSchema.index({ reviewedBy: 1 });

// Virtual for formatted status
cancellationRequestSchema.virtual('formattedStatus').get(function() {
  const statusMap = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for priority color
cancellationRequestSchema.virtual('priorityColor').get(function() {
  const colorMap = {
    low: 'green',
    medium: 'yellow',
    high: 'orange',
    urgent: 'red'
  };
  return colorMap[this.priority] || 'gray';
});

// Method to check if request can be modified
cancellationRequestSchema.methods.canBeModified = function() {
  return this.status === 'pending';
};

// Method to check if request can be cancelled
cancellationRequestSchema.methods.canBeCancelled = function() {
  return this.status === 'pending';
};

// Static method to get requests by user
cancellationRequestSchema.statics.getByUser = function(userId, status = null) {
  const query = { user: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .populate('booking')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get pending requests for staff
cancellationRequestSchema.statics.getPendingRequests = function() {
  return this.find({ status: 'pending' })
    .populate('booking')
    .populate('user', 'name email phone')
    .sort({ priority: -1, createdAt: 1 });
};

module.exports = mongoose.model('CancellationRequest', cancellationRequestSchema);
