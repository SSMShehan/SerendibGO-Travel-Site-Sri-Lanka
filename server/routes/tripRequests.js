const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const tripRequestController = require('../controllers/tripRequestController');

const router = express.Router();

// @route   POST /api/trip-requests
// @desc    Create a new trip request
// @access  Private (Authenticated users)
router.post('/', authMiddleware, tripRequestController.createTripRequest);

// @route   GET /api/trip-requests/my
// @desc    Get user's trip requests
// @access  Private (Authenticated users)
router.get('/my', authMiddleware, tripRequestController.getMyTripRequests);

// Admin/Staff routes - Must be before /:id route to avoid conflicts
// @route   GET /api/trip-requests/admin/all
// @desc    Get all trip requests (Admin and Staff)
// @access  Private (Admin and Staff)
router.get('/admin/all', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Staff role required.'
    });
  }
  next();
}, tripRequestController.getAllTripRequests);

// @route   GET /api/trip-requests/stats/overview
// @desc    Get trip request statistics (Admin and Staff)
// @access  Private (Admin and Staff)
router.get('/stats/overview', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Staff role required.'
    });
  }
  next();
}, tripRequestController.getTripRequestStats);

// @route   GET /api/trip-requests/:id
// @desc    Get trip request by ID
// @access  Private (User, Admin, or Staff)
router.get('/:id', authMiddleware, tripRequestController.getTripRequestById);

// @route   PUT /api/trip-requests/:id/status
// @desc    Update trip request status (Admin and Staff)
// @access  Private (Admin and Staff)
router.put('/:id/status', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Staff role required.'
    });
  }
  next();
}, tripRequestController.updateTripRequestStatus);

// @route   PUT /api/trip-requests/:id/approve
// @desc    Approve trip request with pricing (Admin and Staff)
// @access  Private (Admin and Staff)
router.put('/:id/approve', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Staff role required.'
    });
  }
  next();
}, tripRequestController.approveTripRequest);

// @route   PUT /api/trip-requests/:id/edit
// @desc    Edit trip request details (Admin and Staff)
// @access  Private (Admin and Staff)
router.put('/:id/edit', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Staff role required.'
    });
  }
  next();
}, tripRequestController.editTripRequest);

// @route   PUT /api/trip-requests/:id/assign
// @desc    Assign trip request to staff member (Admin only)
// @access  Private (Admin only)
router.put('/:id/assign', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
}, tripRequestController.assignTripRequest);

// @route   POST /api/trip-requests/:id/communication
// @desc    Add communication log (Admin and Staff)
// @access  Private (Admin and Staff)
router.post('/:id/communication', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Staff role required.'
    });
  }
  next();
}, tripRequestController.addCommunication);

// @route   DELETE /api/trip-requests/:id
// @desc    Delete trip request (User or Admin)
// @access  Private (User or Admin)
router.delete('/:id', authMiddleware, tripRequestController.deleteTripRequest);

// @route   POST /api/trip-requests/:id/create-booking
// @desc    Create a tour booking from approved trip request
// @access  Private (Authenticated users)
router.post('/:id/create-booking', authMiddleware, tripRequestController.createBookingFromTripRequest);

module.exports = router;
