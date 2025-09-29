const HotelReview = require('../models/HotelReview');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

// Helper function to update hotel ratings
const updateHotelRating = async (hotelId) => {
  try {
    console.log(`Updating hotel rating for ID: ${hotelId}`);

    // Get all reviews for this hotel
    const reviews = await HotelReview.find({ hotel: hotelId, status: 'approved' });
    console.log(`Found ${reviews.length} approved reviews for hotel ${hotelId}`);

    if (reviews.length === 0) {
      // No reviews, set rating to 0
      await Hotel.findByIdAndUpdate(hotelId, {
        'rating.average': 0,
        'rating.count': 0
      });
      console.log(`Reset hotel ${hotelId} rating to 0`);
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    console.log(`Calculated average rating: ${averageRating} from ${reviews.length} reviews`);

    // Update the hotel's rating
    await Hotel.findByIdAndUpdate(hotelId, {
      'rating.average': Number(averageRating.toFixed(1)),
      'rating.count': reviews.length
    });

    console.log(`Updated hotel ${hotelId} rating to ${averageRating.toFixed(1)} (${reviews.length} reviews)`);

  } catch (error) {
    console.error(`Error updating hotel rating:`, error);
  }
};

// @route   POST /api/hotel-reviews
// @desc    Create a new hotel review
// @access  Private
const createHotelReview = async (req, res) => {
  try {
    const { hotelId, rating, comment, images, categories } = req.body;
    const userId = req.user.userId;

    console.log('=== Hotel Review Creation Debug ===');
    console.log('Request body:', { hotelId, rating, comment: comment?.substring(0, 50), images: images?.length, categories });
    console.log('User ID:', userId);

    // Validate required fields
    if (!hotelId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Hotel ID, rating, and comment are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check if user has already reviewed this hotel
    const existingReview = await HotelReview.findOne({
      user: userId,
      hotel: hotelId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this hotel'
      });
    }

    // Optional: Check if user has a completed booking for this hotel
    console.log('=== Booking Validation Debug ===');
    console.log('Checking booking for user:', userId, 'hotel:', hotelId);

    const hasBooking = await Booking.findOne({
      user: userId,
      hotel: hotelId,
      status: 'completed'
    });

    console.log('Booking found:', hasBooking);

    // For now, allow reviews without completed bookings (you can enable this later)
    if (!hasBooking) {
      console.log('No completed booking found, but allowing review for testing purposes');
      // Uncomment below to require completed booking:
      // return res.status(400).json({
      //   success: false,
      //   message: 'You can only review hotels you have completed bookings for'
      // });
    }

    // Create review
    const reviewData = {
      user: userId,
      hotel: hotelId,
      rating,
      comment: comment.trim(),
      isVerified: hasBooking ? true : false, // Verified if has booking
      status: 'approved' // Auto-approve for now
    };

    if (images && images.length > 0) reviewData.images = images;
    if (categories && categories.length > 0) reviewData.categories = categories;
    if (hasBooking) reviewData.bookingReference = hasBooking._id;

    console.log('Creating review with data:', reviewData);

    const review = new HotelReview(reviewData);
    await review.save();

    console.log('Review saved successfully:', review._id);

    // Update the hotel's rating
    await updateHotelRating(hotelId);

    // Populate user data for response
    await review.populate('user', 'name profile.profilePicture');

    console.log('Hotel review creation completed successfully');

    res.status(201).json({
      success: true,
      message: 'Hotel review created successfully',
      data: review
    });

  } catch (error) {
    console.error('Create hotel review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating hotel review'
    });
  }
};

// @route   GET /api/hotel-reviews
// @desc    Get hotel reviews with filtering
// @access  Public
const getHotelReviews = async (req, res) => {
  try {
    const {
      hotelId,
      rating,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeAll
    } = req.query;

    console.log('=== Get Hotel Reviews Debug ===');
    console.log('Query params:', { hotelId, rating, page, limit, sortBy, sortOrder, includeAll });

    // Build filter
    const filter = {};
    // Only filter by approved status if not includeAll (admin access)
    if (!includeAll || includeAll === 'false') {
      filter.status = 'approved';
    }
    if (hotelId) filter.hotel = hotelId;
    if (rating) filter.rating = parseInt(rating);

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('Filter:', filter);
    console.log('Sort:', sort);

    const reviews = await HotelReview.find(filter)
      .populate('user', 'name profile.profilePicture')
      .populate('hotel', 'name category starRating')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await HotelReview.countDocuments(filter);

    // Calculate average rating
    const avgRating = await HotelReview.aggregate([
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
    console.error('Get hotel reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hotel reviews'
    });
  }
};

// @route   GET /api/hotel-reviews/:id
// @desc    Get hotel review by ID
// @access  Public
const getHotelReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await HotelReview.findById(id)
      .populate('user', 'name profile.profilePicture')
      .populate('hotel', 'name category starRating location');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Hotel review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Get hotel review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hotel review'
    });
  }
};

// @route   GET /api/hotel-reviews/hotel/:hotelId
// @desc    Get reviews for a specific hotel
// @access  Public
const getReviewsForHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    console.log('=== Get Reviews for Hotel Debug ===');
    console.log('Hotel ID:', hotelId);
    console.log('Query params:', { page, limit, sortBy, sortOrder });

    const filter = { hotel: hotelId, status: 'approved' };
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await HotelReview.find(filter)
      .populate('user', 'name profile.profilePicture')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await HotelReview.countDocuments(filter);

    // Calculate rating statistics
    const ratingStats = await HotelReview.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    let distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratingDistribution.forEach(rating => {
        distribution[rating]++;
      });
    }

    console.log(`Found ${reviews.length} reviews for hotel ${hotelId}`);
    console.log('Rating distribution:', distribution);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        averageRating: ratingStats.length > 0 ? ratingStats[0].averageRating : 0,
        totalReviews: ratingStats.length > 0 ? ratingStats[0].totalReviews : 0,
        ratingDistribution: distribution
      }
    });

  } catch (error) {
    console.error('Error fetching reviews for hotel:', hotelId, error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hotel reviews'
    });
  }
};

// @route   PUT /api/hotel-reviews/:id
// @desc    Update hotel review
// @access  Private
const updateHotelReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, images, categories } = req.body;
    const userId = req.user.userId;

    const review = await HotelReview.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Hotel review not found'
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

    // Update the hotel's rating after review update
    await updateHotelRating(review.hotel);

    res.json({
      success: true,
      message: 'Hotel review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Update hotel review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating hotel review'
    });
  }
};

// @route   DELETE /api/hotel-reviews/:id
// @desc    Delete hotel review
// @access  Private
const deleteHotelReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const review = await HotelReview.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Hotel review not found'
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own reviews.'
      });
    }

    // Get hotel ID before deleting the review
    const hotelId = review.hotel;

    await HotelReview.findByIdAndDelete(id);

    // Update the hotel's rating after review deletion
    await updateHotelRating(hotelId);

    res.json({
      success: true,
      message: 'Hotel review deleted successfully'
    });

  } catch (error) {
    console.error('Delete hotel review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting hotel review'
    });
  }
};

// @route   POST /api/hotel-reviews/:id/helpful
// @desc    Mark hotel review as helpful/unhelpful
// @access  Private
const markHotelReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;
    const userId = req.user.userId;

    const review = await HotelReview.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Hotel review not found'
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
      message: 'Hotel review helpful status updated',
      data: {
        helpful: review.helpful.filter(h => h.helpful === true).length,
        notHelpful: review.helpful.filter(h => h.helpful === false).length
      }
    });

  } catch (error) {
    console.error('Mark hotel review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating hotel review helpful status'
    });
  }
};

// @route   GET /api/hotel-reviews/user/:userId
// @desc    Get hotel reviews by user
// @access  Public
const getUserHotelReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await HotelReview.find({ user: userId })
      .populate('hotel', 'name category starRating location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await HotelReview.countDocuments({ user: userId });

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
    console.error('Get user hotel reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user hotel reviews'
    });
  }
};

module.exports = {
  createHotelReview,
  getHotelReviews,
  getHotelReviewById,
  getReviewsForHotel,
  updateHotelReview,
  deleteHotelReview,
  markHotelReviewHelpful,
  getUserHotelReviews
};