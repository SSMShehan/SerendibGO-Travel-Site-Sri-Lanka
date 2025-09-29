import apiService from './apiService';

class ReviewService {
  // Create a new review
  async createReview(reviewData) {
    try {
      console.log('=== ReviewService.createReview Debug ===');
      console.log('Review data received:', reviewData);
      console.log('Making POST request to /api/reviews');

      const response = await apiService.post('/api/reviews', reviewData);

      console.log('Review creation response:', response);
      return response;
    } catch (error) {
      console.error('=== ReviewService.createReview Error ===');
      console.error('Error in reviewService.createReview:', error);
      console.error('Request data was:', reviewData);
      throw error;
    }
  }

  // Get reviews with filtering
  async getReviews(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`/api/reviews?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get review by ID
  async getReviewById(reviewId) {
    try {
      const response = await apiService.get(`/api/reviews/${reviewId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get reviews for a specific guide
  async getGuideReviews(guideId, params = {}) {
    try {
      const queryParams = {
        ...params,
        guideId
      };
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await apiService.get(`/api/reviews?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get reviews for a specific hotel
  async getHotelReviews(hotelId, params = {}) {
    try {
      const queryParams = {
        ...params,
        hotelId
      };
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await apiService.get(`/api/reviews?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get reviews for a specific tour
  async getTourReviews(tourId, params = {}) {
    try {
      const queryParams = {
        ...params,
        tourId
      };
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await apiService.get(`/api/reviews?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get reviews for a specific vehicle
  async getVehicleReviews(vehicleId, params = {}) {
    try {
      const queryParams = {
        ...params,
        vehicleId
      };
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await apiService.get(`/api/reviews?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get reviews by user
  async getUserReviews(userId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`/api/reviews/user/${userId}?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update review
  async updateReview(reviewId, updateData) {
    try {
      const response = await apiService.put(`/api/reviews/${reviewId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete review
  async deleteReview(reviewId) {
    try {
      const response = await apiService.delete(`/api/reviews/${reviewId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Mark review as helpful
  async markReviewHelpful(reviewId, helpful) {
    try {
      const response = await apiService.post(`/api/reviews/${reviewId}/helpful`, { helpful });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Calculate rating distribution
  calculateRatingDistribution(reviews) {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
        totalRating += review.rating;
      }
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

    return {
      distribution,
      averageRating: parseFloat(averageRating),
      totalReviews
    };
  }

  // Format review date
  formatReviewDate(date) {
    const reviewDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  }
}

// Create and export a single instance
const reviewService = new ReviewService();
export default reviewService;