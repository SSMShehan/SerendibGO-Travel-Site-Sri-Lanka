import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Users, Star, Calendar, Shield, CheckCircle, MessageSquare, X, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import vehicleService from '../../services/vehicleService';
import vehicleReviewService from '../../services/vehicleReviewService';
import { useAuth } from '../../contexts/AuthContext';
import ReviewForm from '../../components/reviews/ReviewForm';
import ReviewList from '../../components/reviews/ReviewList';
import RatingOverview from '../../components/reviews/RatingOverview';
// Simple loading component
const LoadingSkeleton = ({ type, count = 1 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Review functions
  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await vehicleReviewService.getReviewsForVehicle(id);

      if (response.success) {
        setReviews(response.data.reviews || []);

        // Calculate rating statistics
        const stats = vehicleReviewService.calculateRatingDistribution(response.data.reviews || []);
        setRatingStats(stats);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    console.log('=== VehicleDetailPage Review Submission Debug ===');
    console.log('Received review data from form:', reviewData);

    try {
      const data = {
        vehicleId: id,
        rating: reviewData.rating,
        comment: reviewData.review || reviewData.comment,
        images: reviewData.images
      };

      console.log('Sending review data to API:', data);

      if (editingReview) {
        await vehicleReviewService.updateVehicleReview(editingReview._id, data);
        toast.success('Review updated successfully!');
      } else {
        await vehicleReviewService.createVehicleReview(data);
        toast.success('Review submitted successfully!');
      }

      setShowReviewForm(false);
      setEditingReview(null);
      await loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await vehicleReviewService.deleteVehicleReview(reviewId);
        toast.success('Review deleted successfully!');
        await loadReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review');
      }
    }
  };

  const handleHelpfulVote = async (reviewId, isHelpful) => {
    try {
      await vehicleReviewService.markVehicleReviewHelpful(reviewId, isHelpful);
      await loadReviews();
    } catch (error) {
      console.error('Error voting on review:', error);
      toast.error('Failed to record your vote');
    }
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await vehicleService.getVehicleById(id);
        
        if (response.success) {
          setVehicle(response.vehicle);
          // Load reviews after vehicle is loaded
          loadReviews();
        } else {
          setError(response.message || 'Failed to load vehicle details');
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        setError('Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicle();
    }
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a vehicle');
      navigate('/login', { state: { from: location } });
      return;
    }

    // Navigate to booking page with vehicle ID
    navigate(`/vehicles/${id}/book`);
  };

  const formatPrice = (price, currency = 'LKR') => {
    if (!price) return `${currency} 0`;
    return `${currency} ${price.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The vehicle you are looking for does not exist.'}</p>
          <button 
            onClick={() => navigate('/vehicles')} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  const formattedVehicle = vehicleService.formatVehicleData(vehicle);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/vehicles')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                🚗 Vehicles
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-sm font-medium text-gray-500">{vehicle.brand} {vehicle.model}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
              {vehicle.images && vehicle.images.length > 0 ? (
                <img
                  src={vehicle.images[selectedImage]?.url}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                  <div className="text-8xl">🚗</div>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                  {formattedVehicle.statusDisplay}
                </span>
              </div>

              {/* Rating Badge */}
              {(vehicle.rating?.count > 0 || ratingStats.totalReviews > 0) && (
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-3 py-1 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-800">
                    {vehicle.rating?.average
                      ? `${vehicle.rating.average.toFixed(1)} (${vehicle.rating.count})`
                      : `${ratingStats.averageRating.toFixed(1)} (${ratingStats.totalReviews})`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {vehicle.images && vehicle.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${vehicle.brand} ${vehicle.model} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {vehicle.brand} {vehicle.model}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {vehicle.year}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {vehicle.capacity} passengers
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {vehicle.location?.city || 'Location not specified'}
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Daily Rate</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(vehicle.pricing?.daily, vehicle.pricing?.currency)}
                  </span>
                </div>
                {vehicle.pricing?.weekly && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Weekly Rate</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(vehicle.pricing.weekly, vehicle.pricing.currency)}
                    </span>
                  </div>
                )}
                {vehicle.pricing?.monthly && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Rate</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(vehicle.pricing.monthly, vehicle.pricing.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {vehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 capitalize">{feature.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {/* Insurance */}
            {vehicle.insurance?.hasInsurance && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 text-green-600">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Fully Insured</span>
                </div>
                <p className="text-gray-600 mt-2 text-sm">
                  This vehicle is fully insured for your safety and peace of mind.
                </p>
              </div>
            )}

            {/* Rating Summary */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Write Review
                  </button>
                )}
              </div>

              {(vehicle.rating?.count > 0 || ratingStats.totalReviews > 0) ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {vehicle.rating?.average
                        ? vehicle.rating.average.toFixed(1)
                        : ratingStats.averageRating.toFixed(1)}
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(vehicle.rating?.average || ratingStats.averageRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        {vehicle.rating?.count || ratingStats.totalReviews} {(vehicle.rating?.count || ratingStats.totalReviews) === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = ratingStats.distribution[rating] || 0;
                      const percentage = ratingStats.totalReviews > 0 ? Math.round((count / ratingStats.totalReviews) * 100) : 0;

                      return (
                        <div key={rating} className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 w-12">
                            <span className="text-sm text-gray-600">{rating}</span>
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-8 text-right">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* View All Reviews Button */}
                  {ratingStats.totalReviews > 0 && (
                    <button
                      onClick={() => document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' })}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All Reviews →
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No reviews yet</p>
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Write the First Review
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/vehicles')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Back to Vehicles
              </button>

              <button
                onClick={handleBookNow}
                disabled={!formattedVehicle.isAvailable}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                  formattedVehicle.isAvailable
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {formattedVehicle.isAvailable ? 'Book Now' : 'Not Available'}
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Reviews Section */}
        <div id="reviews-section" className="mt-12">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Reviews</h2>

            {reviewsLoading ? (
              <div className="space-y-4">
                <LoadingSkeleton type="text" count={3} />
              </div>
            ) : (
              <ReviewList
                reviews={reviews}
                onHelpfulVote={handleHelpfulVote}
                currentUserId={user?._id || user?.userId}
                onReviewUpdate={handleEditReview}
              />
            )}
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingReview ? 'Edit Review' : 'Write a Review'}
              </h3>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ReviewForm
                booking={{ id: vehicle._id, title: `${vehicle.brand} ${vehicle.model}` }}
                initialData={editingReview ? {
                  rating: editingReview.rating,
                  review: editingReview.comment,
                  images: editingReview.images || []
                } : null}
                onSubmit={handleSubmitReview}
                onCancel={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailPage;

