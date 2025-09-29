import apiService from './apiService';

class HotelReviewService {
  // Create a new hotel review
  async createHotelReview(reviewData) {
    try {
      console.log('=== HotelReviewService.createHotelReview Debug ===');
      console.log('Hotel review data received:', reviewData);
      console.log('Making POST request to /api/hotel-reviews');

      const response = await apiService.post('/api/hotel-reviews', reviewData);

      console.log('Hotel review creation response:', response);
      return response;
    } catch (error) {
      console.error('=== HotelReviewService.createHotelReview Error ===');
      console.error('Error in hotelReviewService.createHotelReview:', error);
      console.error('Request data was:', reviewData);
      throw error;
    }
  }

  // Get hotel reviews with filtering
  async getHotelReviews(params = {}) {
    try {
      console.log('=== HotelReviewService.getHotelReviews Debug ===');
      console.log('Query params:', params);

      const response = await apiService.get('/api/hotel-reviews', params);
      console.log('Hotel reviews response:', response);
      return response;
    } catch (error) {
      console.error('Error in hotelReviewService.getHotelReviews:', error);
      throw error;
    }
  }

  // Get hotel review by ID
  async getHotelReviewById(reviewId) {
    try {
      const response = await apiService.get(`/api/hotel-reviews/${reviewId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get reviews for a specific hotel
  async getReviewsForHotel(hotelId, params = {}) {
    try {
      console.log('=== HotelReviewService.getReviewsForHotel Debug ===');
      console.log('Hotel ID:', hotelId);
      console.log('Additional params:', params);

      const queryParams = {
        ...params,
        hotelId
      };
      const queryString = new URLSearchParams(queryParams).toString();
      const url = `/api/hotel-reviews?${queryString}`;

      console.log('Making GET request to:', url);
      const response = await apiService.get(url);

      console.log('Found', response.data?.reviews?.length || 0, 'reviews for hotel', hotelId);
      console.log('Average rating:', response.data?.averageRating);
      console.log('Total reviews:', response.data?.totalReviews);

      return response;
    } catch (error) {
      console.error('Error fetching reviews for hotel:', hotelId, error);
      throw error;
    }
  }

  // Get reviews by user
  async getUserHotelReviews(userId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`/api/hotel-reviews/user/${userId}?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update hotel review
  async updateHotelReview(reviewId, updateData) {
    try {
      const response = await apiService.put(`/api/hotel-reviews/${reviewId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete hotel review
  async deleteHotelReview(reviewId) {
    try {
      const response = await apiService.delete(`/api/hotel-reviews/${reviewId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Mark hotel review as helpful
  async markHotelReviewHelpful(reviewId, helpful) {
    try {
      const response = await apiService.post(`/api/hotel-reviews/${reviewId}/helpful`, { helpful });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Calculate rating distribution for hotel reviews
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

  // Get rating display text
  getRatingDisplayText(rating) {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Very Good';
    if (rating >= 2.5) return 'Good';
    if (rating >= 1.5) return 'Fair';
    return 'Poor';
  }

  // Get rating color class
  getRatingColorClass(rating) {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-green-500';
    if (rating >= 2.5) return 'text-yellow-500';
    if (rating >= 1.5) return 'text-orange-500';
    return 'text-red-500';
  }
}

// Create and export a single instance
const hotelReviewService = new HotelReviewService();
export default hotelReviewService;