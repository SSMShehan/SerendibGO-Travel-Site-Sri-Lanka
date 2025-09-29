const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getAllUsers, getUserById, updateUserStatus, deleteUser, updateProfile, changePassword, uploadAvatar, upload } = require('../controllers/userController');

const router = express.Router();

// All routes require authentication and admin role
router.use(authMiddleware);

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Apply admin check to all routes
router.use(adminOnly);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private (Admin)
router.get('/:id', getUserById);

// @route   PUT /api/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', updateUserStatus);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', deleteUser);

// Profile management routes (for authenticated users)
// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateProfile);

// @route   PUT /api/users/profile/password
// @desc    Change user password
// @access  Private
router.put('/profile/password', changePassword);

// @route   POST /api/users/profile/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/profile/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;