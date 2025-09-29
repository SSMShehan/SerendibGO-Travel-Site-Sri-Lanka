const CancellationRequest = require('../models/CancellationRequest');
const Booking = require('../models/Booking');
const TourBooking = require('../models/TourBooking');
const VehicleBooking = require('../models/VehicleBooking');
const GuideBooking = require('../models/GuideBooking');
const VehicleRental = require('../models/VehicleRental');

// @route   POST /api/cancellation-requests
// @desc    Create a cancellation request
// @access  Private (Authenticated users only)
const createCancellationRequest = async (req, res) => {
  try {
    const { bookingId, bookingType, reason, priority = 'medium' } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!bookingId || !bookingType || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, booking type, and reason are required'
      });
    }

    // Validate booking type
    const validBookingTypes = ['Booking', 'TourBooking', 'VehicleBooking', 'GuideBooking', 'VehicleRental'];
    if (!validBookingTypes.includes(bookingType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking type'
      });
    }

    // Check if booking exists and belongs to user
    let booking;
    switch (bookingType) {
      case 'Booking':
        booking = await Booking.findById(bookingId);
        break;
      case 'TourBooking':
        booking = await TourBooking.findById(bookingId);
        break;
      case 'VehicleBooking':
        booking = await VehicleBooking.findById(bookingId);
        break;
      case 'GuideBooking':
        booking = await GuideBooking.findById(bookingId);
        break;
      case 'VehicleRental':
        booking = await VehicleRental.findById(bookingId);
        break;
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    const bookingUserId = booking.user ? booking.user.toString() : booking.renter?.toString();
    const userIdStr = userId.toString();
    
    if (bookingUserId !== userIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only request cancellation for your own bookings.'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Check if there's already a pending cancellation request for this booking
    const existingRequest = await CancellationRequest.findOne({
      booking: bookingId,
      bookingType: bookingType,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A cancellation request is already pending for this booking'
      });
    }

    // Create cancellation request
    const cancellationRequest = new CancellationRequest({
      booking: bookingId,
      bookingType: bookingType,
      user: userId,
      reason: reason,
      priority: priority,
      requestedCancellationDate: new Date()
    });

    await cancellationRequest.save();

    // Populate the request for response
    await cancellationRequest.populate([
      { path: 'booking' },
      { path: 'user', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Cancellation request submitted successfully. Staff will review your request.',
      data: { cancellationRequest }
    });

  } catch (error) {
    console.error('Create cancellation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating cancellation request'
    });
  }
};

// @route   GET /api/cancellation-requests/my
// @desc    Get user's cancellation requests
// @access  Private (Authenticated users only)
const getMyCancellationRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    const requests = await CancellationRequest.getByUser(userId, status);

    res.json({
      success: true,
      data: { requests }
    });

  } catch (error) {
    console.error('Get my cancellation requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cancellation requests'
    });
  }
};

// @route   GET /api/cancellation-requests/pending
// @desc    Get pending cancellation requests (staff only)
// @access  Private (Staff/Admin only)
const getPendingCancellationRequests = async (req, res) => {
  try {
    // Check if user is staff or admin
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff or admin access required.'
      });
    }

    const requests = await CancellationRequest.getPendingRequests();

    res.json({
      success: true,
      data: { requests }
    });

  } catch (error) {
    console.error('Get pending cancellation requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending cancellation requests'
    });
  }
};

// @route   PUT /api/cancellation-requests/:id/review
// @desc    Review cancellation request (staff only)
// @access  Private (Staff/Admin only)
const reviewCancellationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staffNotes, refundAmount, refundMethod } = req.body;
    const reviewerId = req.user.userId;

    // Check if user is staff or admin
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff or admin access required.'
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const request = await CancellationRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Cancellation request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been reviewed'
      });
    }

    // Update request
    request.status = status;
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    request.staffNotes = staffNotes;
    request.refundAmount = refundAmount;
    request.refundMethod = refundMethod;

    await request.save();

    // If approved, actually cancel the booking
    if (status === 'approved') {
      await cancelBookingFromRequest(request);
      request.actualCancellationDate = new Date();
      request.status = 'cancelled';
      await request.save();
    }

    // Populate the request for response
    await request.populate([
      { path: 'booking' },
      { path: 'user', select: 'name email' },
      { path: 'reviewedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: `Cancellation request ${status} successfully`,
      data: { request }
    });

  } catch (error) {
    console.error('Review cancellation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reviewing cancellation request'
    });
  }
};

// Helper function to cancel booking from approved request
const cancelBookingFromRequest = async (request) => {
  try {
    let booking;
    
    switch (request.bookingType) {
      case 'Booking':
        booking = await Booking.findById(request.booking);
        break;
      case 'TourBooking':
        booking = await TourBooking.findById(request.booking);
        break;
      case 'VehicleBooking':
        booking = await VehicleBooking.findById(request.booking);
        break;
      case 'GuideBooking':
        booking = await GuideBooking.findById(request.booking);
        break;
      case 'VehicleRental':
        booking = await VehicleRental.findById(request.booking);
        break;
    }

    if (booking) {
      booking.status = 'cancelled';
      booking.cancellationReason = request.reason;
      booking.cancellationDate = new Date();
      booking.refundAmount = request.refundAmount;
      await booking.save();

      // Update related data (e.g., room availability, tour participants)
      await updateRelatedData(booking, request.bookingType);
    }
  } catch (error) {
    console.error('Error cancelling booking from request:', error);
    throw error;
  }
};

// Helper function to update related data when booking is cancelled
const updateRelatedData = async (booking, bookingType) => {
  try {
    switch (bookingType) {
      case 'TourBooking':
        if (booking.tour) {
          const Tour = require('../models/Tour');
          const tour = await Tour.findById(booking.tour);
          if (tour) {
            tour.currentParticipants = Math.max(0, tour.currentParticipants - booking.participants);
            await tour.save();
          }
        }
        break;
      
      case 'Booking':
        if (booking.hotel) {
          const Hotel = require('../models/Hotel');
          const hotel = await Hotel.findById(booking.hotel);
          if (hotel) {
            const roomIndex = hotel.rooms.findIndex(r => r._id.toString() === booking.room.toString());
            if (roomIndex !== -1) {
              hotel.rooms[roomIndex].availableRooms += 1;
              if (hotel.rooms[roomIndex].availableRooms > 0) {
                hotel.rooms[roomIndex].isAvailable = true;
              }
              await hotel.save();
            }
          }
        }
        break;
      
      // Add other booking types as needed
    }
  } catch (error) {
    console.error('Error updating related data:', error);
    // Don't throw error here as the main cancellation should still succeed
  }
};

// @route   GET /api/cancellation-requests/:id
// @desc    Get cancellation request by ID
// @access  Private (Authenticated users only)
const getCancellationRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const request = await CancellationRequest.findById(id)
      .populate('booking')
      .populate('user', 'name email')
      .populate('reviewedBy', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Cancellation request not found'
      });
    }

    // Check if user owns the request or is staff/admin
    if (request.user._id.toString() !== userId && !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { request }
    });

  } catch (error) {
    console.error('Get cancellation request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cancellation request'
    });
  }
};

module.exports = {
  createCancellationRequest,
  getMyCancellationRequests,
  getPendingCancellationRequests,
  reviewCancellationRequest,
  getCancellationRequestById
};
