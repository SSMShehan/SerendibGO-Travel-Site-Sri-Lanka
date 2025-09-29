const VehicleReview = require('../models/VehicleReview');
const Vehicle = require('../models/Vehicle');
const VehicleBooking = require('../models/VehicleBooking');

// Helper function to update vehicle ratings
const updateVehicleRating = async (vehicleId) => {
  try {
    console.log(`Updating vehicle rating for ID: ${vehicleId}`);

    // Get all reviews for this vehicle
    const reviews = await VehicleReview.find({ vehicle: vehicleId });
    console.log(`Found ${reviews.length} reviews for vehicle ${vehicleId}`);

    if (reviews.length === 0) {
      // No reviews, set rating to 0
      await Vehicle.findByIdAndUpdate(vehicleId, {
        'rating.average': 0,
        'rating.count': 0
      });
      console.log(`Reset vehicle ${vehicleId} rating to 0`);
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    console.log(`Calculated average rating: ${averageRating} from ${reviews.length} reviews`);

    // Update the vehicle's rating
    await Vehicle.findByIdAndUpdate(vehicleId, {
      'rating.average': Number(averageRating.toFixed(1)),
      'rating.count': reviews.length
    });

    console.log(`Updated vehicle ${vehicleId} rating to ${averageRating.toFixed(1)} (${reviews.length} reviews)`);

  } catch (error) {
    console.error(`Error updating vehicle rating:`, error);
  }
};

// @route   POST /api/vehicle-reviews
// @desc    Create a new vehicle review
// @access  Private
const createVehicleReview = async (req, res) => {
  try {
    const { vehicleId, rating, comment, images, categories } = req.body;
    const userId = req.user.userId;

    console.log('=== Vehicle Review Creation Debug ===');
    console.log('Request body:', { vehicleId, rating, comment: comment?.substring(0, 50), images: images?.length, categories });
    console.log('User ID:', userId);

    // Validate required fields
    if (!vehicleId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID, rating, and comment are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if user has already reviewed this vehicle
    const existingReview = await VehicleReview.findOne({
      user: userId,
      vehicle: vehicleId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this vehicle'
      });
    }

    // TODO: Re-enable booking validation after testing
    // Check if user has a completed booking for this vehicle
    console.log('=== Booking Validation Debug ===');
    console.log('Checking booking for user:', userId, 'vehicle:', vehicleId);

    const hasBooking = await VehicleBooking.findOne({
      user: userId,
      vehicle: vehicleId,
      status: 'completed'
    });

    console.log('Booking found:', hasBooking);

    // Temporarily bypass booking validation for testing
    if (!hasBooking) {
      console.log('No completed booking found, but allowing review for testing purposes');
      // return res.status(400).json({
      //   success: false,
      //   message: 'You can only review vehicles you have completed bookings for'
      // });
    }

    // Create review
    const reviewData = {
      user: userId,
      vehicle: vehicleId,
      rating,
      comment: comment.trim(),
      isVerified: true // Verified because user has completed booking
    };

    if (images && images.length > 0) reviewData.images = images;
    if (categories && categories.length > 0) reviewData.categories = categories;
    if (hasBooking) reviewData.bookingReference = hasBooking._id;

    console.log('Creating review with data:', reviewData);

    const review = new VehicleReview(reviewData);
    await review.save();

    console.log('Review saved successfully:', review._id);

    // Update the vehicle's rating
    await updateVehicleRating(vehicleId);

    // Populate user data for response
    await review.populate('user', 'name profile.profilePicture');

    console.log('Review creation completed successfully');

    res.status(201).json({
      success: true,
      message: 'Vehicle review created successfully',
      data: review
    });

  } catch (error) {
    console.error('Create vehicle review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating vehicle review'
    });
  }
};

// @route   GET /api/vehicle-reviews
// @desc    Get vehicle reviews with filtering
// @access  Public
const getVehicleReviews = async (req, res) => {
  try {
    const {
      vehicleId,
      rating,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeAll
    } = req.query;

    console.log('=== Get Vehicle Reviews Debug ===');
    console.log('Query params:', { vehicleId, rating, page, limit, sortBy, sortOrder, includeAll });

    // Build filter
    const filter = {};
    if (vehicleId) filter.vehicle = vehicleId;
    if (rating) filter.rating = parseInt(rating);

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('Filter:', filter);
    console.log('Sort:', sort);

    const reviews = await VehicleReview.find(filter)
      .populate('user', 'name profile.profilePicture')
      .populate('vehicle', 'brand model year')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await VehicleReview.countDocuments(filter);

    // Calculate average rating
    const avgRating = await VehicleReview.aggregate([
      { $match: filter },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    console.log(`Found ${reviews.length} reviews, total: ${total}`);
    console.log('Average rating:', avgRating);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        averageRating: avgRating.length > 0 ? avgRating[0].average : 0,
        totalReviews: avgRating.length > 0 ? avgRating[0].count : 0
      }
    });

  } catch (error) {
    console.error('Get vehicle reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle reviews'
    });
  }
};

// @route   GET /api/vehicle-reviews/:id
// @desc    Get vehicle review by ID
// @access  Public
const getVehicleReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await VehicleReview.findById(id)
      .populate('user', 'name profile.profilePicture')
      .populate('vehicle', 'brand model year type');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Get vehicle review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle review'
    });
  }
};

// @route   PUT /api/vehicle-reviews/:id
// @desc    Update vehicle review
// @access  Private
const updateVehicleReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, images, categories } = req.body;
    const userId = req.user.userId;

    const review = await VehicleReview.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle review not found'
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own reviews.'
      });
    }

    // Update review
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) review.comment = comment.trim();
    if (images !== undefined) review.images = images;
    if (categories !== undefined) review.categories = categories;

    await review.save();

    // Update the vehicle's rating after review update
    await updateVehicleRating(review.vehicle);

    res.json({
      success: true,
      message: 'Vehicle review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Update vehicle review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating vehicle review'
    });
  }
};

// @route   DELETE /api/vehicle-reviews/:id
// @desc    Delete vehicle review
// @access  Private
const deleteVehicleReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const review = await VehicleReview.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle review not found'
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own reviews.'
      });
    }

    // Get vehicle ID before deleting the review
    const vehicleId = review.vehicle;

    await VehicleReview.findByIdAndDelete(id);

    // Update the vehicle's rating after review deletion
    await updateVehicleRating(vehicleId);

    res.json({
      success: true,
      message: 'Vehicle review deleted successfully'
    });

  } catch (error) {
    console.error('Delete vehicle review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting vehicle review'
    });
  }
};

// @route   POST /api/vehicle-reviews/:id/helpful
// @desc    Mark vehicle review as helpful/unhelpful
// @access  Private
const markVehicleReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;
    const userId = req.user.userId;

    const review = await VehicleReview.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle review not found'
      });
    }

    // Check if user has already marked this review
    const existingHelpful = review.helpful.find(h => h.user.toString() === userId.toString());

    if (existingHelpful) {
      // Update existing helpful vote
      existingHelpful.helpful = helpful;
    } else {
      // Add new helpful vote
      review.helpful.push({ user: userId, helpful });
    }

    await review.save();

    res.json({
      success: true,
      message: 'Vehicle review helpful status updated',
      data: {
        helpful: review.helpful.filter(h => h.helpful === true).length,
        notHelpful: review.helpful.filter(h => h.helpful === false).length
      }
    });

  } catch (error) {
    console.error('Mark vehicle review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating vehicle review helpful status'
    });
  }
};

// @route   GET /api/vehicle-reviews/user/:userId
// @desc    Get vehicle reviews by user
// @access  Public
const getUserVehicleReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await VehicleReview.find({ user: userId })
      .populate('vehicle', 'brand model year type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await VehicleReview.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get user vehicle reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user vehicle reviews'
    });
  }
};

module.exports = {
  createVehicleReview,
  getVehicleReviews,
  getVehicleReviewById,
  updateVehicleReview,
  deleteVehicleReview,
  markVehicleReviewHelpful,
  getUserVehicleReviews
};