const Tour = require('../models/Tour');
const TourBooking = require('../models/TourBooking');
const User = require('../models/User');

// @route   GET /api/tours
// @desc    Get all tours with filtering
// @access  Public
const getAllTours = async (req, res) => {
  try {
    const {
      location,
      category,
      minPrice,
      maxPrice,
      duration,
      difficulty,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Only filter by isActive if showAll is not requested (for admin content management)
    if (!req.query.showAll) {
      filter.isActive = true;
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (duration) {
      filter.duration = { $lte: Number(duration) };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const tours = await Tour.find(filter)
      .populate('guide', 'name email profile.profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Add virtual properties to each tour
    const toursWithVirtuals = tours.map(tour => {
      const tourObj = tour.toObject();
      tourObj.isAvailable = tour.isAvailable;
      tourObj.availableSlots = tour.availableSlots;
      return tourObj;
    });

    // Get total count for pagination
    const total = await Tour.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tours: toursWithVirtuals,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalTours: total,
          hasNextPage: skip + tours.length < total,
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tours'
    });
  }
};

// @route   GET /api/tours/:id
// @desc    Get single tour by ID
// @access  Public
const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate('guide', 'name email profile.profilePicture profile.phone')
      .populate('reviews');

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Add virtual properties to the tour object
    const tourWithVirtuals = tour.toObject();
    tourWithVirtuals.isAvailable = tour.isAvailable;
    tourWithVirtuals.availableSlots = tour.availableSlots;

    res.json({
      success: true,
      data: { tour: tourWithVirtuals }
    });

  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tour'
    });
  }
};

// @route   POST /api/tours
// @desc    Create a new tour
// @access  Private (Guide only)
const createTour = async (req, res) => {
  try {
    // Create tour with guide ID from authenticated user
    const tourData = {
      ...req.body,
      guide: req.user.userId
    };

    const tour = new Tour(tourData);
    await tour.save();

    // Populate guide info
    await tour.populate('guide', 'name email profile.profilePicture');

    res.status(201).json({
      success: true,
      message: 'Tour created successfully',
      data: { tour }
    });

  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating tour'
    });
  }
};

// @route   PUT /api/tours/:id
// @desc    Update a tour
// @access  Private (Guide who owns the tour or Admin)
const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Check if user can update this tour
    if (tour.guide.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own tours.'
      });
    }

    // Update tour
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('guide', 'name email profile.profilePicture');

    res.json({
      success: true,
      message: 'Tour updated successfully',
      data: { tour: updatedTour }
    });

  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating tour'
    });
  }
};

// @route   DELETE /api/tours/:id
// @desc    Delete a tour
// @access  Private (Guide who owns the tour or Admin)
const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Check if user can delete this tour
    if (tour.guide.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own tours.'
      });
    }

    // Soft delete - just mark as inactive
    tour.isActive = false;
    await tour.save();

    res.json({
      success: true,
      message: 'Tour deleted successfully'
    });

  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting tour'
    });
  }
};

// @route   POST /api/tours/:id/book
// @desc    Book a tour
// @access  Private (Authenticated users only)
const bookTour = async (req, res) => {
  try {
    console.log('=== TOUR BOOKING ATTEMPT ===');
    console.log('Request received:', {
      tourId: req.params.id,
      body: req.body,
      user: req.user,
      headers: req.headers.authorization ? 'Bearer token present' : 'No auth header'
    });
    
    // Check if tour ID is valid
    if (!req.params.id) {
      console.log('No tour ID provided');
      return res.status(400).json({
        success: false,
        message: 'Tour ID is required'
      });
    }

    const { id } = req.params;
    const { participants, startDate, specialRequests } = req.body;

    // Validate required fields
    if (!participants || !startDate) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Participants and start date are required'
      });
    }

    // Check if tour exists and is active
    const tour = await Tour.findById(id);
    console.log('Tour found:', {
      exists: !!tour,
      isActive: tour?.isActive,
      isAvailable: tour?.isAvailable,
      maxParticipants: tour?.maxParticipants,
      currentParticipants: tour?.currentParticipants
    });

    if (!tour || !tour.isActive) {
      console.log('Tour not found or inactive');
      return res.status(404).json({
        success: false,
        message: 'Tour not found or inactive'
      });
    }

    // Check if tour is available
    // Calculate availability manually to ensure accuracy
    const isAvailable = tour.isActive && (tour.currentParticipants || 0) < tour.maxParticipants;
    console.log('Manual availability calculation:', {
      isActive: tour.isActive,
      currentParticipants: tour.currentParticipants || 0,
      maxParticipants: tour.maxParticipants,
      isAvailable: isAvailable
    });
    
    if (!isAvailable) {
      console.log('Tour is not available for booking');
      return res.status(400).json({
        success: false,
        message: 'Tour is not available for booking'
      });
    }

    // Check if requested participants exceed available slots
    const availableSlots = Math.max(0, tour.maxParticipants - (tour.currentParticipants || 0));
    if (participants > availableSlots) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableSlots} slots available for this tour`
      });
    }

    // Update tour participants
    tour.currentParticipants += participants;
    await tour.save();

    // Calculate end date based on tour duration
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + tour.duration);

    // Calculate total amount
    const totalAmount = tour.price * participants;

    // Create tour booking
    const tourBooking = new TourBooking({
      tour: tour._id,
      user: req.user.userId,
      participants,
      startDate: startDateObj,
      endDate: endDateObj,
      totalAmount,
      currency: tour.currency,
      specialRequests,
      status: 'pending', // Set to pending until payment is completed
      paymentStatus: 'pending' // Set to pending until payment is completed
    });

    await tourBooking.save();

    // Populate tour details for response
    await tourBooking.populate('tour', 'title location images');

    res.status(201).json({
      success: true,
      message: 'Tour booking created successfully. Please complete payment to confirm your booking.',
      data: {
        _id: tourBooking._id,
        tour: tourBooking.tour,
        participants,
        startDate: startDateObj,
        endDate: endDateObj,
        totalAmount,
        currency: tour.currency,
        status: tourBooking.status,
        paymentStatus: tourBooking.paymentStatus,
        specialRequests,
        requiresPayment: true // Payment is required
      }
    });

  } catch (error) {
    console.error('=== TOUR BOOKING ERROR ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    console.error('=== END TOUR BOOKING ERROR ===');
    res.status(500).json({
      success: false,
      message: 'Server error while booking tour'
    });
  }
};

// @route   GET /api/tours/:id/test-availability
// @desc    Test tour availability (for debugging)
// @access  Public
const testTourAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id);
    
    if (!tour) {
      return res.json({
        success: false,
        message: 'Tour not found',
        tourId: id
      });
    }
    
    const isAvailable = tour.isActive && (tour.currentParticipants || 0) < tour.maxParticipants;
    
    res.json({
      success: true,
      data: {
        tourId: tour._id,
        title: tour.title,
        isActive: tour.isActive,
        isAvailable: tour.isAvailable,
        manualIsAvailable: isAvailable,
        maxParticipants: tour.maxParticipants,
        currentParticipants: tour.currentParticipants,
        availableSlots: tour.availableSlots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing tour availability',
      error: error.message
    });
  }
};

// @route   GET /api/tours/:id/availability
// @desc    Check tour availability
// @access  Public
const checkTourAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const tour = await Tour.findById(id);
    if (!tour || !tour.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found or inactive'
      });
    }

    const availableSlots = Math.max(0, tour.maxParticipants - (tour.currentParticipants || 0));
    const isAvailable = tour.isActive && availableSlots > 0;

    res.json({
      success: true,
      data: {
        tourId: tour._id,
        title: tour.title,
        maxParticipants: tour.maxParticipants,
        currentParticipants: tour.currentParticipants || 0,
        availableSlots: availableSlots,
        isAvailable: isAvailable,
        price: tour.price,
        currency: tour.currency
      }
    });

  } catch (error) {
    console.error('Check tour availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking tour availability'
    });
  }
};

// @route   PUT /api/tours/:id/reset-availability
// @desc    Reset tour availability (for testing/admin purposes)
// @access  Private (Admin only)
const resetTourAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Reset participants to 0
    tour.currentParticipants = 0;
    await tour.save();

    res.json({
      success: true,
      message: 'Tour availability reset successfully',
      data: {
        tourId: tour._id,
        title: tour.title,
        maxParticipants: tour.maxParticipants,
        currentParticipants: tour.currentParticipants,
        availableSlots: tour.availableSlots,
        isAvailable: tour.isAvailable
      }
    });

  } catch (error) {
    console.error('Reset tour availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting tour availability'
    });
  }
};

// @route   GET /api/tours/bookings/my
// @desc    Get user's tour bookings
// @access  Private (Authenticated users only)
const getMyTourBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const bookings = await TourBooking.find({ user: userId })
      .populate('tour', 'title location images price currency duration')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bookings }
    });

  } catch (error) {
    console.error('Get my tour bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tour bookings'
    });
  }
};

// @route   PUT /api/tours/bookings/:id/cancel
// @desc    Cancel a tour booking
// @access  Private (Authenticated users only)
const cancelTourBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user.userId;

    const booking = await TourBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Tour booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own bookings.'
      });
    }

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

    // Check if booking can be cancelled (at least 24 hours before start)
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);
    
    if (hoursUntilStart < 24) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled. Must be cancelled at least 24 hours before tour start.'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.cancellationDate = new Date();

    await booking.save();

    // Update tour participants count
    if (booking.tour) {
      const tour = await Tour.findById(booking.tour);
      if (tour) {
        tour.currentParticipants = Math.max(0, tour.currentParticipants - booking.participants);
        await tour.save();
      }
    }

    res.json({
      success: true,
      message: 'Tour booking cancelled successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Cancel tour booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling tour booking'
    });
  }
};

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  bookTour,
  testTourAvailability,
  checkTourAvailability,
  resetTourAvailability,
  getMyTourBookings,
  cancelTourBooking
};
