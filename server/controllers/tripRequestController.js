const TripRequest = require('../models/TripRequest');
const TourBooking = require('../models/TourBooking');
const User = require('../models/User');

// @route   POST /api/trip-requests
// @desc    Create a new trip request
// @access  Private (Authenticated users)
const createTripRequest = async (req, res) => {
  try {
    console.log('=== CREATE TRIP REQUEST START ===');
    console.log('User:', req.user);
    console.log('Request body:', req.body);
    
    const {
      title,
      description,
      startDate,
      endDate,
      travelers,
      budget,
      destinations,
      preferences,
      contactInfo,
      tags,
      source
    } = req.body;

    console.log('Meal Plan Value:', preferences?.mealPlan);
    console.log('Preferences:', preferences);

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !travelers || !budget || !destinations) {
      console.log('Missing required fields:', {
        title: !!title,
        description: !!description,
        startDate: !!startDate,
        endDate: !!endDate,
        travelers: !!travelers,
        budget: !!budget,
        destinations: !!destinations
      });
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, startDate, endDate, travelers, budget, destinations'
      });
    }

    // Validate dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (startDateObj < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }
    
    if (endDateObj <= startDateObj) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Validate budget - only if both are provided and greater than 0
    console.log('Budget validation:', {
      minBudget: budget.minBudget,
      maxBudget: budget.maxBudget,
      minBudgetType: typeof budget.minBudget,
      maxBudgetType: typeof budget.maxBudget
    });
    
    if (budget.minBudget > 0 && budget.maxBudget > 0 && budget.minBudget > budget.maxBudget) {
      console.log('Budget validation failed: min > max');
      return res.status(400).json({
        success: false,
        message: 'Minimum budget cannot be greater than maximum budget'
      });
    }

    // Validate travelers
    if (travelers.adults < 1) {
      return res.status(400).json({
        success: false,
        message: 'At least 1 adult traveler is required'
      });
    }

    // Create trip request
    const tripRequest = new TripRequest({
      user: req.user.userId,
      title,
      description,
      startDate: startDateObj,
      endDate: endDateObj,
      travelers,
      budget,
      destinations,
      preferences: preferences || {},
      contactInfo: {
        ...contactInfo,
        email: contactInfo.email || req.user.email, // Use provided email or authenticated user's email
        phone: contactInfo.phone || req.user.phone
      },
      tags: tags || [],
      source: source || 'website',
      review: {
        reviewedBy: null,
        reviewedAt: null,
        notes: '',
        estimatedCost: null,
        approvedCost: null,
        approvedItinerary: null,
        approvalNotes: ''
      }
    });

    console.log('Trip request object before save:', tripRequest);
    await tripRequest.save();
    console.log('Trip request saved successfully');
    await tripRequest.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Trip request submitted successfully! Our team will review it and get back to you soon.',
      data: {
        tripRequest: tripRequest.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('=== CREATE TRIP REQUEST ERROR ===');
    console.error('Create trip request error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating trip request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/trip-requests/my
// @desc    Get user's trip requests
// @access  Private (Authenticated users)
const getMyTripRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { user: req.user.userId };
    if (status) {
      filter.status = status;
    } else {
      // Exclude booked trip requests by default since they appear in tour bookings
      filter.status = { $ne: 'booked' };
    }

    const tripRequests = await TripRequest.find(filter)
      .populate('assignedTo', 'name email')
      .populate('review.reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await TripRequest.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tripRequests: tripRequests.map(tr => tr.getPublicProfile()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalRequests: totalCount,
          requestsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my trip requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip requests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/trip-requests/:id
// @desc    Get trip request by ID
// @access  Private (User or Admin)
const getTripRequestById = async (req, res) => {
  try {
    const tripRequest = await TripRequest.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .populate('review.reviewedBy', 'name email')
      .populate('communications.sentBy', 'name email')
      .populate('attachments.uploadedBy', 'name email');

    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    // Check if user can access this trip request
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && tripRequest.user._id.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own trip requests.'
      });
    }

    res.json({
      success: true,
      data: {
        tripRequest
      }
    });

  } catch (error) {
    console.error('Get trip request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/trip-requests/admin/all
// @desc    Get all trip requests (Admin only)
// @access  Private (Admin only)
const getAllTripRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assignedTo,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tripRequests = await TripRequest.find(filter)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('review.reviewedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await TripRequest.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tripRequests: tripRequests.map(tr => tr.getPublicProfile()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalRequests: totalCount,
          requestsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all trip requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip requests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   PUT /api/trip-requests/:id/status
// @desc    Update trip request status (Admin/Staff only)
// @access  Private (Admin/Staff only)
const updateTripRequestStatus = async (req, res) => {
  try {
    const { status, notes, estimatedCost, approvedCost, approvedItinerary, approvalNotes } = req.body;

    const tripRequest = await TripRequest.findById(req.params.id);
    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    // Update status and review information
    tripRequest.status = status;
    tripRequest.review.reviewedBy = req.user.userId;
    tripRequest.review.reviewedAt = new Date();
    
    if (notes) tripRequest.review.notes = notes;
    if (estimatedCost) tripRequest.review.estimatedCost = estimatedCost;
    if (approvedCost) tripRequest.review.approvedCost = approvedCost;
    if (approvedItinerary) tripRequest.review.approvedItinerary = approvedItinerary;
    if (approvalNotes) tripRequest.review.approvalNotes = approvalNotes;

    await tripRequest.save();
    await tripRequest.populate('user', 'name email phone');
    await tripRequest.populate('review.reviewedBy', 'name email');

    res.json({
      success: true,
      message: 'Trip request status updated successfully',
      data: {
        tripRequest: tripRequest.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update trip request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating trip request status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   PUT /api/trip-requests/:id/approve
// @desc    Approve trip request with pricing (Admin/Staff only)
// @access  Private (Admin/Staff only)
const approveTripRequest = async (req, res) => {
  try {
    const { approvedCost, approvedItinerary, approvalNotes } = req.body;
    console.log('=== APPROVAL REQUEST START ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    console.log('Approval request:', { id: req.params.id, approvedCost, approvedItinerary, approvalNotes });

    if (!approvedCost || approvedCost <= 0) {
      console.log('Validation failed: Invalid approved cost');
      return res.status(400).json({
        success: false,
        message: 'Approved cost is required and must be greater than 0'
      });
    }

    const tripRequest = await TripRequest.findById(req.params.id);
    if (!tripRequest) {
      console.log('Trip request not found');
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    console.log('Trip request found:', tripRequest.status, tripRequest.review);

    if (tripRequest.status !== 'pending' && tripRequest.status !== 'under_review') {
      console.log('Invalid status for approval:', tripRequest.status);
      return res.status(400).json({
        success: false,
        message: 'Only pending or under review trip requests can be approved'
      });
    }

    // Initialize review object if it doesn't exist or is incomplete
    if (!tripRequest.review || typeof tripRequest.review !== 'object') {
      tripRequest.review = {};
    }
    
    // Ensure all review fields exist
    if (!tripRequest.review.reviewedBy) tripRequest.review.reviewedBy = null;
    if (!tripRequest.review.reviewedAt) tripRequest.review.reviewedAt = null;
    if (!tripRequest.review.notes) tripRequest.review.notes = '';
    if (!tripRequest.review.estimatedCost) tripRequest.review.estimatedCost = null;
    if (!tripRequest.review.approvedCost) tripRequest.review.approvedCost = null;
    if (!tripRequest.review.approvedItinerary) tripRequest.review.approvedItinerary = null;
    if (!tripRequest.review.approvalNotes) tripRequest.review.approvalNotes = '';

    // Update status to approved and set pricing
    tripRequest.status = 'approved';
    tripRequest.review.reviewedBy = req.user.userId;
    tripRequest.review.reviewedAt = new Date();
    tripRequest.review.approvedCost = approvedCost;
    
    if (approvedItinerary) tripRequest.review.approvedItinerary = approvedItinerary;
    if (approvalNotes) tripRequest.review.approvalNotes = approvalNotes;

    console.log('Saving trip request with review:', tripRequest.review);
    await tripRequest.save();
    await tripRequest.populate('user', 'name email phone');
    await tripRequest.populate('review.reviewedBy', 'name email');

    console.log('Trip request approved successfully');
    console.log('=== APPROVAL REQUEST END ===');

    res.json({
      success: true,
      message: 'Trip request approved successfully',
      data: {
        tripRequest: tripRequest.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('=== APPROVAL ERROR ===');
    console.error('Approve trip request error:', error);
    console.error('Error stack:', error.stack);
    console.error('=== APPROVAL ERROR END ===');
    res.status(500).json({
      success: false,
      message: 'Server error while approving trip request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   PUT /api/trip-requests/:id/assign
// @desc    Assign trip request to staff member (Admin only)
// @access  Private (Admin only)
const assignTripRequest = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const tripRequest = await TripRequest.findById(req.params.id);
    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    // Verify assigned user exists and is staff
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser || !['admin', 'staff'].includes(assignedUser.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff member for assignment'
      });
    }

    tripRequest.assignedTo = assignedTo;
    await tripRequest.save();
    await tripRequest.populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Trip request assigned successfully',
      data: {
        tripRequest: tripRequest.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Assign trip request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning trip request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   POST /api/trip-requests/:id/communication
// @desc    Add communication log (Admin only)
// @access  Private (Admin only)
const addCommunication = async (req, res) => {
  try {
    const { type, message, recipient } = req.body;

    const tripRequest = await TripRequest.findById(req.params.id);
    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    tripRequest.communications.push({
      type,
      message,
      recipient,
      sentBy: req.user.userId
    });

    await tripRequest.save();
    await tripRequest.populate('communications.sentBy', 'name email');

    res.json({
      success: true,
      message: 'Communication log added successfully',
      data: {
        tripRequest: tripRequest.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Add communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding communication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   GET /api/trip-requests/stats/overview
// @desc    Get trip request statistics (Admin only)
// @access  Private (Admin only)
const getTripRequestStats = async (req, res) => {
  try {
    const stats = await TripRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await TripRequest.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await TripRequest.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        priorityStats: priorityStats,
        monthlyStats: monthlyStats
      }
    });

  } catch (error) {
    console.error('Get trip request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   DELETE /api/trip-requests/:id
// @desc    Delete trip request (User or Admin)
// @access  Private (User or Admin)
const deleteTripRequest = async (req, res) => {
  try {
    const tripRequest = await TripRequest.findById(req.params.id);

    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    // Check if user can delete this trip request
    if (req.user.role !== 'admin' && tripRequest.user.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own trip requests.'
      });
    }

    // Only allow deletion if status is pending or cancelled
    if (!['pending', 'cancelled'].includes(tripRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete trip request. Only pending or cancelled requests can be deleted.'
      });
    }

    await TripRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Trip request deleted successfully'
    });

  } catch (error) {
    console.error('Delete trip request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting trip request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   PUT /api/trip-requests/:id/edit
// @desc    Edit trip request details (Admin/Staff only)
// @access  Private (Admin/Staff only)
const editTripRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      travelers,
      budget,
      destinations,
      preferences,
      contactInfo,
      tags,
      notes
    } = req.body;

    const tripRequest = await TripRequest.findById(req.params.id);
    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    // Only allow editing if status is pending or under_review
    if (!['pending', 'under_review'].includes(tripRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only pending or under review trip requests can be edited'
      });
    }

    // Update trip request fields
    if (title) tripRequest.title = title;
    if (description) tripRequest.description = description;
    if (startDate) tripRequest.startDate = new Date(startDate);
    if (endDate) tripRequest.endDate = new Date(endDate);
    if (travelers) tripRequest.travelers = travelers;
    if (budget) tripRequest.budget = budget;
    if (destinations) tripRequest.destinations = destinations;
    if (preferences) tripRequest.preferences = preferences;
    if (contactInfo) tripRequest.contactInfo = contactInfo;
    if (tags) tripRequest.tags = tags;

    // Add edit note to communications
    tripRequest.communications.push({
      type: 'internal_note',
      message: notes || 'Trip request details updated by staff',
      sentBy: req.user.userId
    });

    // Update status to under_review if it was pending
    if (tripRequest.status === 'pending') {
      tripRequest.status = 'under_review';
    }

    await tripRequest.save();
    await tripRequest.populate('user', 'name email phone');
    await tripRequest.populate('communications.sentBy', 'name email');

    res.json({
      success: true,
      message: 'Trip request updated successfully',
      data: {
        tripRequest: tripRequest.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Edit trip request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while editing trip request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @route   POST /api/trip-requests/:id/create-booking
// @desc    Create a tour booking from approved trip request
// @access  Private (Authenticated users)
const createBookingFromTripRequest = async (req, res) => {
  try {
    console.log('=== CREATE BOOKING FROM TRIP REQUEST START ===');
    console.log('Trip Request ID:', req.params.id);
    console.log('User:', req.user);
    
    const tripRequest = await TripRequest.findById(req.params.id);
    
    console.log('Trip Request found:', tripRequest);
    
    if (!tripRequest) {
      console.log('Trip request not found');
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    // Check if user can create booking from this trip request
    if (tripRequest.user.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create bookings from your own trip requests.'
      });
    }

    // Check if trip request is approved
    if (tripRequest.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved trip requests can be converted to bookings'
      });
    }

    // Check if approved cost is set
    if (!tripRequest.review?.approvedCost) {
      return res.status(400).json({
        success: false,
        message: 'Trip request must have an approved cost before creating a booking'
      });
    }

    // Create a custom tour booking from the trip request
    console.log('Creating tour booking with data:', {
      tour: null,
      user: req.user.userId,
      participants: tripRequest.travelers.adults + tripRequest.travelers.children + tripRequest.travelers.infants,
      startDate: tripRequest.startDate,
      endDate: tripRequest.endDate,
      totalAmount: tripRequest.review.approvedCost,
      currency: tripRequest.budget?.currency || 'LKR',
      specialRequests: tripRequest.preferences?.specialRequirements?.join(', ') || '',
      status: 'pending',
      paymentStatus: 'pending',
      notes: `Custom trip booking created from trip request: ${tripRequest.title}. ${tripRequest.review.approvalNotes || ''}`,
      tripRequest: tripRequest._id
    });

    const tourBooking = new TourBooking({
      tour: null, // Custom tour - no specific tour ID
      user: req.user.userId,
      participants: tripRequest.travelers.adults + tripRequest.travelers.children + tripRequest.travelers.infants,
      startDate: tripRequest.startDate,
      endDate: tripRequest.endDate,
      totalAmount: tripRequest.review.approvedCost,
      currency: tripRequest.budget?.currency || 'LKR',
      specialRequests: tripRequest.preferences?.specialRequirements?.join(', ') || '',
      status: 'pending', // Will be confirmed after payment
      paymentStatus: 'pending',
      notes: `Custom trip booking created from trip request: ${tripRequest.title}. ${tripRequest.review.approvalNotes || ''}`,
      // Store trip request reference for tracking
      tripRequest: tripRequest._id
    });

    console.log('Saving tour booking...');
    try {
      await tourBooking.save();
      console.log('Tour booking saved successfully');
    } catch (saveError) {
      console.error('Error saving tour booking:', saveError);
      if (saveError.name === 'ValidationError') {
        console.error('Validation errors:', saveError.errors);
        return res.status(400).json({
          success: false,
          message: 'Validation error while creating booking',
          errors: Object.values(saveError.errors).map(err => err.message)
        });
      }
      throw saveError; // Re-throw if it's not a validation error
    }

    // Update trip request status to indicate booking was created but payment is pending
    tripRequest.status = 'pending_payment';
    tripRequest.bookingId = tourBooking._id;
    console.log('Updating trip request status...');
    await tripRequest.save();
    console.log('Trip request status updated successfully');

    // Populate user details for response
    await tourBooking.populate('user', 'name email');

    console.log('=== BOOKING CREATION SUCCESS ===');
    console.log('Booking created:', tourBooking);
    console.log('Trip request updated:', tripRequest);
    console.log('=== END BOOKING CREATION SUCCESS ===');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully! Please complete payment to confirm your trip.',
      data: {
        booking: tourBooking,
        tripRequest: {
          _id: tripRequest._id,
          title: tripRequest.title,
          status: tripRequest.status
        },
        requiresPayment: true
      }
    });

  } catch (error) {
    console.error('=== CREATE BOOKING FROM TRIP REQUEST ERROR ===');
    console.error('Create booking from trip request error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END CREATE BOOKING FROM TRIP REQUEST ERROR ===');
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking from trip request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createTripRequest,
  getMyTripRequests,
  getTripRequestById,
  getAllTripRequests,
  updateTripRequestStatus,
  approveTripRequest,
  editTripRequest,
  assignTripRequest,
  addCommunication,
  getTripRequestStats,
  deleteTripRequest,
  createBookingFromTripRequest
};
