import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, User, CheckCircle, Filter } from 'lucide-react';
import reviewService from '../../services/reviewService';
import { toast } from 'react-hot-toast';

const ReviewList = ({ reviews, onHelpfulVote, currentUserId, onReviewUpdate }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [expandedReviews, setExpandedReviews] = useState({});

  // Sort reviews based on selected option
  const sortReviews = (reviewsToSort) => {
    const sorted = [...reviewsToSort];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return sorted.sort((a, b) => {
          const aHelpful = a.helpful?.filter(h => h.helpful).length || 0;
          const bHelpful = b.helpful?.filter(h => h.helpful).length || 0;
          return bHelpful - aHelpful;
        });
      default:
        return sorted;
    }
  };

  // Filter reviews by rating
  const filterReviews = (reviewsToFilter) => {
    if (filterRating === 'all') return reviewsToFilter;
    return reviewsToFilter.filter(review => review.rating === parseInt(filterRating));
  };

  // Process reviews
  const processedReviews = sortReviews(filterReviews(reviews));

  // Toggle review expansion
  const toggleExpanded = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  // Handle helpful vote
  const handleHelpfulVote = async (reviewId, isHelpful) => {
    if (!currentUserId) {
      toast.error('Please login to vote on reviews');
      return;
    }

    try {
      const response = await reviewService.markReviewHelpful(reviewId, isHelpful);
      if (response.success) {
        onHelpfulVote(reviewId, response.data);
        toast.success('Vote recorded');
      }
    } catch (error) {
      toast.error('Failed to record vote');
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
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}.0</span>
      </div>
    );
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="text-sm border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">
          Showing {processedReviews.length} of {reviews.length} reviews
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {processedReviews.map((review) => {
          const helpfulCount = review.helpful?.filter(h => h.helpful).length || 0;
          const notHelpfulCount = review.helpful?.filter(h => !h.helpful).length || 0;
          const isExpanded = expandedReviews[review._id];
          const isLongReview = review.comment?.length > 200;

          return (
            <div key={review._id} className="border-b pb-6 last:border-0">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {review.user?.profile?.profilePicture ? (
                      <img
                        src={review.user.profile.profilePicture}
                        alt={review.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {/* User Info and Rating */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {review.user?.name || 'Anonymous'}
                      </h4>
                      {review.isVerified && (
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Verified Booking
                        </span>
                      )}
                    </div>
                    {renderStars(review.rating)}
                    <p className="text-sm text-gray-500 mt-1">
                      {reviewService.formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Edit/Delete Options for Own Reviews */}
                {currentUserId === review.user?._id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onReviewUpdate && onReviewUpdate(review)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Review Comment */}
              <div className="ml-13 mt-3">
                <p className={`text-gray-700 ${!isExpanded && isLongReview ? 'line-clamp-3' : ''}`}>
                  {review.comment}
                </p>
                {isLongReview && (
                  <button
                    onClick={() => toggleExpanded(review._id)}
                    className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="ml-13 mt-3 flex gap-2 flex-wrap">
                  {review.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={image.caption || `Review image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(image.url, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful Votes */}
              <div className="ml-13 mt-4 flex items-center gap-4">
                <span className="text-sm text-gray-600">Was this review helpful?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleHelpfulVote(review._id, true)}
                    className="flex items-center gap-1 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{helpfulCount}</span>
                  </button>
                  <button
                    onClick={() => handleHelpfulVote(review._id, false)}
                    className="flex items-center gap-1 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{notHelpfulCount}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button (if needed) */}
      {reviews.length > 10 && processedReviews.length === 10 && (
        <div className="text-center pt-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;