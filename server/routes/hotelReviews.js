const express = require('express');
const router = express.Router();
const {
  createHotelReview,
  getHotelReviews,
  getHotelReviewById,
  getReviewsForHotel,
  updateHotelReview,
  deleteHotelReview,
  markHotelReviewHelpful,
  getUserHotelReviews
} = require('../controllers/hotelReviewController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', getHotelReviews);
router.get('/hotel/:hotelId', getReviewsForHotel);
router.get('/user/:userId', getUserHotelReviews);
router.get('/:id', getHotelReviewById);

// Protected routes
router.post('/', authMiddleware, createHotelReview);
router.put('/:id', authMiddleware, updateHotelReview);
router.delete('/:id', authMiddleware, deleteHotelReview);
router.post('/:id/helpful', authMiddleware, markHotelReviewHelpful);

module.exports = router;