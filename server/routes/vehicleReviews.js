const express = require('express');
const router = express.Router();
const {
  createVehicleReview,
  getVehicleReviews,
  getVehicleReviewById,
  updateVehicleReview,
  deleteVehicleReview,
  markVehicleReviewHelpful,
  getUserVehicleReviews
} = require('../controllers/vehicleReviewController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', getVehicleReviews);
router.get('/user/:userId', getUserVehicleReviews);
router.get('/:id', getVehicleReviewById);

// Protected routes
router.post('/', authMiddleware, createVehicleReview);
router.put('/:id', authMiddleware, updateVehicleReview);
router.delete('/:id', authMiddleware, deleteVehicleReview);
router.post('/:id/helpful', authMiddleware, markVehicleReviewHelpful);

module.exports = router;