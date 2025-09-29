import apiService from './apiService';

class VehicleReviewService {
  // Create a new vehicle review
  async createVehicleReview(reviewData) {
    try {
      console.log('=== VehicleReviewService.createVehicleReview Debug ===');
      console.log('Vehicle review data received:', reviewData);
      console.log('Making POST request to /api/vehicle-reviews');

      const response = await apiService.post('/api/vehicle-reviews', reviewData);

      console.log('Vehicle review creation response:', response);
      return response;
    } catch (error) {
      console.error('=== VehicleReviewService.createVehicleReview Error ===');
      console.error('Error in vehicleReviewService.createVehicleReview:', error);
      console.error('Request data was:', reviewData);
      throw error;
    }
  }

  // Get vehicle reviews with filtering
  async getVehicleReviews(params = {}) {
    try {
      console.log('=== VehicleReviewService.getVehicleReviews Debug ===');
      console.log('Query params:', params);

      const response = await apiService.get('/api/vehicle-reviews', params);
      console.log('Vehicle reviews response:', response);
      return response;
    } catch (error) {
      console.error('Error in vehicleReviewService.getVehicleReviews:', error);
      throw error;
    }
  }

  // Get vehicle review by ID
  async getVehicleReviewById(reviewId) {
    try {
      const response = await apiService.get(`/api/vehicle-reviews/${reviewId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get reviews for a specific vehicle
  async getReviewsForVehicle(vehicleId, params = {}) {
    try {
      console.log('=== VehicleReviewService.getReviewsForVehicle Debug ===');
      console.log('Vehicle ID:', vehicleId);
      console.log('Additional params:', params);

      const queryParams = {
        ...params,
        vehicleId
      };
      const queryString = new URLSearchParams(queryParams).toString();
      const url = `/api/vehicle-reviews?${queryString}`;

      console.log('Making GET request to:', url);
      const response = await apiService.get(url);

      console.log('Found', response.data?.reviews?.length || 0, 'reviews for vehicle', vehicleId);
      console.log('Average rating:', response.data?.averageRating);
      console.log('Total reviews:', response.data?.totalReviews);

      return response;
    } catch (error) {
      console.error('Error fetching reviews for vehicle:', vehicleId, error);
      throw error;
    }
  }

  // Get reviews by user
  async getUserVehicleReviews(userId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`/api/vehicle-reviews/user/${userId}?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update vehicle review
  async updateVehicleReview(reviewId, updateData) {
    try {
      const response = await apiService.put(`/api/vehicle-reviews/${reviewId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete vehicle review
  async deleteVehicleReview(reviewId) {
    try {
      const response = await apiService.delete(`/api/vehicle-reviews/${reviewId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Mark vehicle review as helpful
  async markVehicleReviewHelpful(reviewId, helpful) {
    try {
      const response = await apiService.post(`/api/vehicle-reviews/${reviewId}/helpful`, { helpful });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Calculate rating distribution for vehicle reviews
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
const vehicleReviewService = new VehicleReviewService();
export default vehicleReviewService;