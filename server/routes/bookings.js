const express = require('express');
const router = express.Router();
const { authMiddleware, requireHotelOwner, requireAdmin } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  updateBookingStatus,
  getHotelBookings,
  checkAvailability,
  modifyBooking,
  getBookingModificationHistory,
  getBookingDetailsByType,
  sendBookingConfirmationEmail
} = require('../controllers/bookingController');

// Public routes
router.post('/check-availability', checkAvailability);

// Protected routes (authenticated users only)
router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, getMyBookings);
// Specific routes must come before parameterized routes
router.get('/:id/details', authMiddleware, getBookingDetailsByType);
router.get('/:id/modification-history', authMiddleware, getBookingModificationHistory);
router.post('/:id/send-confirmation', authMiddleware, sendBookingConfirmationEmail);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id', authMiddleware, updateBooking);
router.put('/:id/cancel', authMiddleware, cancelBooking);
router.put('/:id/modify', authMiddleware, modifyBooking);

// Hotel owner and admin routes
router.put('/:id/status', authMiddleware, requireHotelOwner, updateBookingStatus);
router.get('/hotel/:hotelId', authMiddleware, requireHotelOwner, getHotelBookings);

module.exports = router;
