import apiService from './apiService';

class GuideReviewService {
  // Get guide reviews with filtering
  async getGuideReviews(params = {}) {
    try {
      console.log('=== GuideReviewService.getGuideReviews Debug ===');
      console.log('Query params:', params);

      const response = await apiService.get('/api/reviews', {
        ...params,
        guideId: params.guideId || undefined // Ensure we're filtering for guide reviews
      });

      console.log('Guide reviews response:', response);
      return response;
    } catch (error) {
      console.error('Error in guideReviewService.getGuideReviews:', error);
      throw error;
    }
  }

  // Get all reviews that have guide field (for admin)
  async getAllGuideReviews(params = {}) {
    try {
      console.log('=== GuideReviewService.getAllGuideReviews Debug ===');
      console.log('Query params:', params);

      // Fetch all reviews and filter client-side for those with guide field
      const response = await apiService.get('/api/reviews', {
        ...params,
        limit: params.limit || 100
      });

      if (response.success && response.data?.reviews) {
        // Filter for reviews that have a guide field
        const guideReviews = response.data.reviews.filter(review => review.guide);

        return {
          success: true,
          data: {
            ...response.data,
            reviews: guideReviews,
            total: guideReviews.length
          }
        };
      }

      return response;
    } catch (error) {
      console.error('Error in guideReviewService.getAllGuideReviews:', error);
      throw error;
    }
  }

  // Get reviews for a specific guide
  async getReviewsForGuide(guideId, params = {}) {
    try {
      console.log('=== GuideReviewService.getReviewsForGuide Debug ===');
      console.log('Guide ID:', guideId);
      console.log('Additional params:', params);

      const response = await apiService.get('/api/reviews', {
        ...params,
        guideId: guideId
      });

      console.log('Found', response.data?.reviews?.length || 0, 'reviews for guide', guideId);
      console.log('Average rating:', response.data?.averageRating);
      console.log('Total reviews:', response.data?.totalReviews);

      return response;
    } catch (error) {
      console.error('Error fetching reviews for guide:', guideId, error);
      throw error;
    }
  }

  // Create a new guide review
  async createGuideReview(reviewData) {
    try {
      console.log('=== GuideReviewService.createGuideReview Debug ===');
      console.log('Guide review data received:', reviewData);

      const response = await apiService.post('/api/reviews', {
        ...reviewData,
        guideId: reviewData.guideId
      });

      console.log('Guide review creation response:', response);
      return response;
    } catch (error) {
      console.error('Error in guideReviewService.createGuideReview:', error);
      throw error;
    }
  }

  // Update guide review
  async updateGuideReview(reviewId, updateData) {
    try {
      const response = await apiService.put(`/api/reviews/${reviewId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete guide review
  async deleteGuideReview(reviewId) {
    try {
      const response = await apiService.delete(`/api/reviews/${reviewId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Mark guide review as helpful
  async markGuideReviewHelpful(reviewId, helpful) {
    try {
      const response = await apiService.post(`/api/reviews/${reviewId}/helpful`, { helpful });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Calculate rating distribution for guide reviews
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
const guideReviewService = new GuideReviewService();
export default guideReviewService;