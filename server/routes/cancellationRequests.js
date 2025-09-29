const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const cancellationRequestController = require('../controllers/cancellationRequestController');

// All routes require authentication
router.use(authMiddleware);

// @route   POST /api/cancellation-requests
// @desc    Create a cancellation request
// @access  Private (Authenticated users only)
router.post('/', cancellationRequestController.createCancellationRequest);

// @route   GET /api/cancellation-requests/my
// @desc    Get user's cancellation requests
// @access  Private (Authenticated users only)
router.get('/my', cancellationRequestController.getMyCancellationRequests);

// Staff/Admin only routes - these must come before /:id to avoid conflicts
router.use('/pending', requireRole('admin', 'staff'));
router.get('/pending', cancellationRequestController.getPendingCancellationRequests);

router.use('/:id/review', requireRole('admin', 'staff'));
router.put('/:id/review', cancellationRequestController.reviewCancellationRequest);

// @route   GET /api/cancellation-requests/:id
// @desc    Get cancellation request by ID
// @access  Private (Authenticated users only)
router.get('/:id', cancellationRequestController.getCancellationRequestById);

module.exports = router;
