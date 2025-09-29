import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  Filter,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Hotel,
  Car,
  UserCheck,
  Calendar,
  User,
  MessageSquare,
  X,
  Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import hotelReviewService from '../../services/hotelReviewService';
import vehicleReviewService from '../../services/vehicleReviewService';
import guideReviewService from '../../services/guideReviewService';
import reviewService from '../../services/reviewService';

// Simple loading component
const LoadingSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    ))}
  </div>
);

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // all, hotel, vehicle, guide
  const [selectedRating, setSelectedRating] = useState('all'); // all, 1, 2, 3, 4, 5
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, rating-high, rating-low
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingReview, setEditingReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    hotels: 0,
    vehicles: 0,
    guides: 0,
    averageRating: 0,
    flagged: 0
  });

  // Load reviews with filtering
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);

      // Combine reviews from different sources - get all reviews, filter on frontend
      const [hotelReviews, vehicleReviews, guideReviews] = await Promise.all([
        hotelReviewService.getHotelReviews({
          page: 1,
          limit: 100, // Get more reviews for admin filtering
          includeAll: true // Admin flag to get all statuses
        }),
        vehicleReviewService.getVehicleReviews({
          page: 1,
          limit: 100, // Get more reviews for admin filtering
          includeAll: true // Admin flag to get all statuses
        }),
        guideReviewService.getAllGuideReviews({
          page: 1,
          limit: 100, // Get more reviews for admin filtering
        })
      ]);

      let allReviews = [];

      // Process hotel reviews
      if (hotelReviews.success && hotelReviews.data?.reviews) {
        const processedHotelReviews = hotelReviews.data.reviews.map(review => ({
          ...review,
          type: 'hotel',
          entityName: review.hotel?.name || 'Unknown Hotel',
          entityId: review.hotel?._id || review.hotelId
        }));
        allReviews.push(...processedHotelReviews);
      }

      // Process vehicle reviews
      if (vehicleReviews.success && vehicleReviews.data?.reviews) {
        const processedVehicleReviews = vehicleReviews.data.reviews.map(review => ({
          ...review,
          type: 'vehicle',
          entityName: review.vehicle ? `${review.vehicle.brand} ${review.vehicle.model}` : 'Unknown Vehicle',
          entityId: review.vehicle?._id || review.vehicleId
        }));
        allReviews.push(...processedVehicleReviews);
      }

      // Process guide reviews
      if (guideReviews.success && guideReviews.data?.reviews) {
        const processedGuideReviews = guideReviews.data.reviews.map(review => ({
          ...review,
          type: 'guide',
          entityName: review.guide?.name || 'Unknown Guide',
          entityId: review.guide?._id || review.guideId
        }));
        allReviews.push(...processedGuideReviews);
      }

      // Apply all filters
      let filteredReviews = allReviews;

      // Filter by type
      if (selectedType !== 'all') {
        filteredReviews = filteredReviews.filter(review => review.type === selectedType);
      }

      // Filter by rating
      if (selectedRating !== 'all') {
        const targetRating = parseInt(selectedRating);
        filteredReviews = filteredReviews.filter(review => review.rating === targetRating);
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filteredReviews = filteredReviews.filter(review => {
          return (
            review.comment?.toLowerCase().includes(searchLower) ||
            review.entityName?.toLowerCase().includes(searchLower) ||
            review.user?.name?.toLowerCase().includes(searchLower)
          );
        });
      }

      // Sort reviews
      filteredReviews.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          case 'rating-high':
            return b.rating - a.rating;
          case 'rating-low':
            return a.rating - b.rating;
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });

      // Calculate stats from ALL reviews (unfiltered)
      const hotelCount = allReviews.filter(r => r.type === 'hotel').length;
      const vehicleCount = allReviews.filter(r => r.type === 'vehicle').length;
      const guideCount = allReviews.filter(r => r.type === 'guide').length;
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

      setStats({
        total: allReviews.length,
        hotels: hotelCount,
        vehicles: vehicleCount,
        guides: guideCount,
        averageRating: avgRating,
        flagged: 0 // Placeholder for flagged reviews
      });

      // Set the filtered reviews for display
      setReviews(filteredReviews);

    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedType, selectedRating, sortBy]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Handle review deletion
  const handleDeleteReview = async (reviewId, reviewType) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      if (reviewType === 'hotel') {
        await hotelReviewService.deleteHotelReview(reviewId);
      } else if (reviewType === 'vehicle') {
        await vehicleReviewService.deleteVehicleReview(reviewId);
      } else if (reviewType === 'guide') {
        await guideReviewService.deleteGuideReview(reviewId);
      }

      toast.success('Review deleted successfully');
      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  // Handle review edit
  const handleEditReview = (review) => {
    setEditingReview({
      ...review,
      originalComment: review.comment,
      originalRating: review.rating
    });
    setShowEditModal(true);
  };

  // Save edited review
  const handleSaveEdit = async () => {
    if (!editingReview) return;

    try {
      const updateData = {
        comment: editingReview.comment,
        rating: editingReview.rating
      };

      if (editingReview.type === 'hotel') {
        await hotelReviewService.updateHotelReview(editingReview._id, updateData);
      } else if (editingReview.type === 'vehicle') {
        await vehicleReviewService.updateVehicleReview(editingReview._id, updateData);
      } else if (editingReview.type === 'guide') {
        await guideReviewService.updateGuideReview(editingReview._id, updateData);
      }

      toast.success('Review updated successfully');
      setShowEditModal(false);
      setEditingReview(null);
      loadReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'hotel':
        return Hotel;
      case 'vehicle':
        return Car;
      case 'guide':
        return UserCheck;
      default:
        return MessageSquare;
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'hotel':
        return 'bg-blue-100 text-blue-800';
      case 'vehicle':
        return 'bg-green-100 text-green-800';
      case 'guide':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-600 mt-2">Manage and moderate customer reviews across the platform</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hotel Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.hotels}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Hotel className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vehicle Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.vehicles}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Car className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Guide Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.guides}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="hotel">Hotels</option>
              <option value="vehicle">Vehicles</option>
              <option value="guide">Guides</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reviews ({stats.total})</h3>
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={5} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No reviews found</p>
            <p className="text-gray-400">Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => {
              const TypeIcon = getTypeIcon(review.type);

              return (
                <div key={`${review.type}-${review._id}`} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Review Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {review.user?.name || 'Anonymous User'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(review.type)}`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {review.type.charAt(0).toUpperCase() + review.type.slice(1)}
                          </span>
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">({review.rating}/5)</span>
                        </div>
                      </div>

                      {/* Entity Name */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          Reviewed: <span className="font-medium text-gray-900">{review.entityName}</span>
                        </p>
                      </div>

                      {/* Review Content */}
                      <div className="mb-3">
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>

                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex space-x-2 mb-3">
                          {review.images.slice(0, 3).map((image, index) => (
                            <img
                              key={index}
                              src={image.url}
                              alt={`Review image ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                          ))}
                          {review.images.length > 3 && (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                              <span className="text-xs text-gray-500">+{review.images.length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Helpful Votes */}
                      {(review.helpfulVotes?.helpful > 0 || review.helpfulVotes?.unhelpful > 0) && (
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                            {review.helpfulVotes?.helpful || 0} helpful
                          </span>
                          <span className="flex items-center">
                            <X className="w-4 h-4 mr-1 text-red-500" />
                            {review.helpfulVotes?.unhelpful || 0} unhelpful
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit Review"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id, review.type)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Review Modal */}
      {showEditModal && editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Review</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReview(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Review Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {editingReview.user?.name || 'Anonymous User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {editingReview.entityName} • {formatDate(editingReview.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setEditingReview({ ...editingReview, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= editingReview.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({editingReview.rating}/5)
                  </span>
                </div>
              </div>

              {/* Comment Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Review comment..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingReview(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;