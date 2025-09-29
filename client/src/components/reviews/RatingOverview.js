import React from 'react';
import { Star } from 'lucide-react';

const RatingOverview = ({ averageRating, totalReviews, distribution }) => {
  // Calculate percentage for each rating
  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  // Render stars with decimal rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            return (
              <Star
                key={star}
                className="w-5 h-5 text-yellow-400 fill-current"
              />
            );
          } else if (star === fullStars + 1 && hasHalfStar) {
            return (
              <div key={star} className="relative">
                <Star className="w-5 h-5 text-gray-300" />
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
              </div>
            );
          } else {
            return (
              <Star
                key={star}
                className="w-5 h-5 text-gray-300"
              />
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 border">
      <h3 className="text-xl font-semibold mb-6">Customer Reviews</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Average Rating */}
        <div className="text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="mb-2">
              {renderStars(averageRating)}
            </div>
            <p className="text-gray-600">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = distribution[rating] || 0;
            const percentage = getPercentage(count);

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 min-w-[60px]">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="min-w-[40px] text-sm text-gray-600 text-right">
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Summary Stats */}
      <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {getPercentage((distribution[5] || 0) + (distribution[4] || 0))}%
          </div>
          <p className="text-sm text-gray-600">Recommend</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {distribution[5] || 0}
          </div>
          <p className="text-sm text-gray-600">5 Star Reviews</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700">
            {totalReviews}
          </div>
          <p className="text-sm text-gray-600">Total Reviews</p>
        </div>
      </div>
    </div>
  );
};

export default RatingOverview;