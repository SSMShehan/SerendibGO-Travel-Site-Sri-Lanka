import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Star, 
  MessageSquare, 
  X, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Heart, 
  Share2, 
  Camera, 
  Wifi, 
  Car, 
  Utensils, 
  Waves, 
  Bed, 
  Shield, 
  Clock, 
  Award,
  Sparkles,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import hotelService from '../../services/hotelService';
import hotelReviewService from '../../services/hotelReviewService';
import { useAuth } from '../../contexts/AuthContext';
import BookingForm from '../../components/booking/BookingForm';
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

const HotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

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

  // Load hotel data
  const loadHotel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading hotel with ID:', id);
      const response = await hotelService.getHotelById(id);
      console.log('Hotel API response:', response);
      
      if (response.success) {
        setHotel(response.data.hotel);
        if (response.data.hotel.images && response.data.hotel.images.length > 0) {
          setSelectedImage(0);
        }
        // Load reviews after hotel is loaded
        loadReviews();
      } else {
        setError(response.message || 'Failed to load hotel details');
      }
    } catch (err) {
      console.error('Load hotel error:', err);
      setError(`Error loading hotel details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Review functions
  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await hotelReviewService.getReviewsForHotel(id);

      if (response.success) {
        setReviews(response.data.reviews || []);

        // Calculate rating statistics
        const stats = hotelReviewService.calculateRatingDistribution(response.data.reviews || []);
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
    console.log('=== HotelDetailPage Review Submission Debug ===');
    console.log('Received review data from form:', reviewData);

    try {
      const data = {
        hotelId: id,
        rating: reviewData.rating,
        comment: reviewData.review || reviewData.comment,
        images: reviewData.images
      };

      console.log('Sending review data to API:', data);

      if (editingReview) {
        await hotelReviewService.updateHotelReview(editingReview._id, data);
        toast.success('Review updated successfully!');
      } else {
        await hotelReviewService.createHotelReview(data);
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
        await hotelReviewService.deleteHotelReview(reviewId);
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
      await hotelReviewService.markHotelReviewHelpful(reviewId, isHelpful);
      await loadReviews();
    } catch (error) {
      console.error('Error voting on review:', error);
      toast.error('Failed to record your vote');
    }
  };

  useEffect(() => {
    loadHotel();
  }, [loadHotel]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Oops!</h2>
            <p className="text-gray-600 mb-8">{error || 'Hotel not found'}</p>
            <button
              onClick={() => navigate('/hotels')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              Back to Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/hotels')}
            className="inline-flex items-center text-emerald-600 hover:text-emerald-800 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hotels
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hotel Images */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 overflow-hidden mb-8">
              <div className="relative h-96">
                {hotel.images && hotel.images.length > 0 ? (
                  <img
                    src={hotel.images[selectedImage].url}
                    alt={hotel.name}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                    onClick={() => setShowImageModal(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                    <Camera className="w-16 h-16 text-emerald-500" />
                  </div>
                )}
                
                {/* Image Navigation */}
                {hotel.images && hotel.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {hotel.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === selectedImage 
                            ? 'bg-white shadow-lg' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                {/* Favorite Button */}
                <button className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg">
                  <Heart className="w-6 h-6 text-gray-600 hover:text-red-500" />
                </button>
                
                {/* Share Button */}
                <button className="absolute top-4 right-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg">
                  <Share2 className="w-6 h-6 text-gray-600 hover:text-emerald-500" />
                </button>
              </div>
            </div>

            {/* Hotel Information */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{hotel.name}</h1>
                  <div className="flex items-center space-x-6 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                      <span className="font-medium">
                        {hotel.location?.address?.city}, {hotel.location?.address?.state}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-500" />
                      <span className="font-medium">{hotel.starRating} Stars</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-4 py-2 rounded-2xl text-sm font-semibold border border-emerald-200">
                      {hotel.category?.replace('_', ' ').toUpperCase()}
                    </span>
                    {hotel.isVerified ? (
                      <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verified Hotel
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                        <XCircle className="w-4 h-4 mr-2" />
                        Pending Verification
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating Display */}
              {(hotel.rating?.count > 0 || ratingStats.totalReviews > 0) && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-3xl font-bold text-gray-900 mr-4">
                        {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : 'No rating'}
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.round(ratingStats.averageRating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">
                          Based on {ratingStats.totalReviews} reviews
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
                    >
                      Write Review
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About This Hotel</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {hotel.description}
                </p>
              </div>

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotel.amenities.map((amenity, index) => (
                      <div key={index} className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200/50">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center mr-3">
                            {amenity === 'wifi' && <Wifi className="w-4 h-4 text-emerald-600" />}
                            {amenity === 'parking' && <Car className="w-4 h-4 text-emerald-600" />}
                            {amenity === 'restaurant' && <Utensils className="w-4 h-4 text-emerald-600" />}
                            {amenity === 'pool' && <Waves className="w-4 h-4 text-emerald-600" />}
                            {amenity === 'gym' && <Bed className="w-4 h-4 text-emerald-600" />}
                            {!['wifi', 'parking', 'restaurant', 'pool', 'gym'].includes(amenity) && <Award className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <span className="font-medium text-gray-800">
                            {hotelService.formatAmenityName(amenity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg"
                >
                  Book Now
                </button>
                <button className="border-2 border-emerald-200 text-emerald-700 px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-all duration-300 font-semibold text-lg">
                  Contact Hotel
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 mb-8">
              <div className="border-b border-emerald-200/50">
                <nav className="flex space-x-8 px-8">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'rooms', label: 'Rooms & Rates' },
                    { id: 'amenities', label: 'Amenities' },
                    { id: 'reviews', label: 'Reviews' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-6 px-1 border-b-3 font-semibold text-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-emerald-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">About This Hotel</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">{hotel.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Highlights</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>• {hotel.starRating}-star luxury accommodation</li>
                          <li>• Located in {hotel.location?.address?.city}</li>
                          <li>• {hotel.amenities?.length || 0} premium amenities</li>
                          <li>• {hotel.rooms?.length || 0} room types available</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Contact Information</h4>
                        <div className="space-y-2 text-gray-600">
                          <div className="flex items-center">
                            <span className="mr-2">📞</span>
                            {hotel.contact?.phone}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">✉️</span>
                            {hotel.contact?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rooms Tab */}
                {activeTab === 'rooms' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Rooms</h3>
                    {hotel.rooms && hotel.rooms.length > 0 ? (
                      <div className="space-y-4">
                        {hotel.rooms.map(room => (
                          <div key={room._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-800">{room.name}</h4>
                                <p className="text-sm text-gray-600">{room.type} • {room.capacity} guests</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-blue-600">
                                  LKR {room.price.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">per night</div>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">{room.description}</p>
                            
                            {/* Room Amenities */}
                            {room.amenities && room.amenities.length > 0 && (
                              <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                  {room.amenities.slice(0, 6).map((amenity, index) => (
                                    <span
                                      key={index}
                                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                                    >
                                      {amenity.replace('_', ' ')}
                                    </span>
                                  ))}
                                  {room.amenities.length > 6 && (
                                    <span className="text-gray-500 text-xs">
                                      +{room.amenities.length - 6} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Room Status and Booking Button */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                  <span className={`w-2 h-2 rounded-full ${
                                    room.isAvailable && room.availableRooms > 0 
                                      ? 'bg-green-500' 
                                      : 'bg-red-500'
                                  }`}></span>
                                  <span className={room.isAvailable && room.availableRooms > 0 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                  }>
                                    {room.isAvailable && room.availableRooms > 0 
                                      ? `${room.availableRooms} available` 
                                      : 'Not available'
                                    }
                                  </span>
                                </div>
                                {room.occupancyRate !== undefined && (
                                  <span className="text-gray-500">
                                    {room.occupancyRate}% occupied
                                  </span>
                                )}
                              </div>
                              
                              <button
                                onClick={() => navigate(`/booking/${hotel._id}:${room._id}`)}
                                disabled={!room.isAvailable || room.availableRooms === 0}
                                className={`px-6 py-2 rounded-md font-medium text-white transition-colors ${
                                  room.isAvailable && room.availableRooms > 0
                                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                                    : 'bg-gray-400 cursor-not-allowed'
                                }`}
                              >
                                {room.isAvailable && room.availableRooms > 0 ? 'Book Now' : 'Not Available'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No room information available.</p>
                    )}
                  </div>
                )}

                {/* Amenities Tab */}
                {activeTab === 'amenities' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Hotel Amenities</h3>
                    {hotel.amenities && hotel.amenities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hotel.amenities.map(amenity => (
                          <div key={amenity} className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm">✓</span>
                            </div>
                            <span className="text-gray-700">{hotelService.formatAmenityName(amenity)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No amenities information available.</p>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">Guest Reviews</h3>
                      {isAuthenticated && (
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Write Review
                        </button>
                      )}
                    </div>

                    {(hotel.rating?.count > 0 || ratingStats.totalReviews > 0) ? (
                      <div className="space-y-6">
                        {/* Rating Overview */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="text-3xl font-bold text-gray-900">
                              {hotel.rating?.average
                                ? hotel.rating.average.toFixed(1)
                                : ratingStats.averageRating.toFixed(1)}
                            </div>
                            <div>
                              <div className="flex items-center mb-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= Math.round(hotel.rating?.average || ratingStats.averageRating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-gray-600">
                                {hotel.rating?.count || ratingStats.totalReviews} {(hotel.rating?.count || ratingStats.totalReviews) === 1 ? 'review' : 'reviews'}
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
                        </div>

                        {/* Reviews List */}
                        {reviewsLoading ? (
                          <LoadingSkeleton type="text" count={3} />
                        ) : (
                          <ReviewList
                            reviews={reviews}
                            onHelpfulVote={handleHelpfulVote}
                            currentUserId={user?._id || user?.userId}
                            onReviewUpdate={handleEditReview}
                          />
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
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Room Selection and Booking */}
            <div className="sticky top-4 space-y-8">
              {/* Price Summary */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Price Summary</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">Starting from</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {hotel.averageRoomPrice ? `LKR ${hotel.averageRoomPrice.toLocaleString()}` : 'Price on request'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">per night</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">Star Rating</span>
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                        <span className="font-bold text-gray-800">{hotel.starRating}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Premium Quality</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">Location</span>
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-sm text-gray-600">
                      {hotel.location?.address?.city}, {hotel.location?.address?.state}
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Selection */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h3>
                <div className="space-y-6">
                  {hotel.rooms && hotel.rooms.length > 0 ? (
                    hotel.rooms.map((room) => (
                      <div key={room._id} className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-gray-900 text-lg">{room.name}</h4>
                          <span className="text-xl font-bold text-emerald-600">
                            {room.currency} {room.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4 leading-relaxed">{room.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Capacity: {room.capacity} guests</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            room.isAvailable && room.availableRooms > 0 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {room.isAvailable && room.availableRooms > 0 
                              ? `${room.availableRooms} available` 
                              : 'Not available'
                            }
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bed className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No rooms available</p>
                    </div>
                  )}
                </div>
              </div>

                             {/* Booking Form */}
               {hotel.rooms && hotel.rooms.length > 0 && (
                 <div id="booking-form">
                   <BookingForm 
                     hotel={hotel} 
                     room={hotel.rooms[0]} 
                     onBookingSuccess={(booking) => {
                       console.log('Booking successful:', booking);
                       // You can add navigation to bookings page or show success message
                     }}
                   />
                 </div>
               )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">📞</span>
                  <span className="text-gray-700">{hotel.contact?.phone}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">✉️</span>
                  <span className="text-gray-700">{hotel.contact?.email}</span>
                </div>
              </div>
            </div>
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
                booking={{ id: hotel._id, title: hotel.name }}
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

      {/* Image Modal */}
      {showImageModal && hotel.images && hotel.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={hotel.images[selectedImage].url}
              alt={hotel.name}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            >
              ×
            </button>
            {hotel.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(prev => prev === 0 ? hotel.images.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300"
                >
                  ‹
                </button>
                <button
                  onClick={() => setSelectedImage(prev => prev === hotel.images.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetailPage;
