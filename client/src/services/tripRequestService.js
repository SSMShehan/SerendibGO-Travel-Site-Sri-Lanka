import apiService from './apiService';
import API_CONFIG from '../config/api';

class TripRequestService {
  static async createTripRequest(tripData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.CREATE, tripData);
      return response;
    } catch (error) {
      console.error('Error creating trip request:', error);
      throw error;
    }
  }

  static async getMyTripRequests(page = 1, limit = 10, status = '') {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.MY_REQUESTS, {
        params: {
          page,
          limit,
          status
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching my trip requests:', error);
      throw error;
    }
  }

  static async getTripRequestById(id) {
    try {
      console.log('Fetching trip request with ID:', id);
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.DETAIL(id));
      console.log('Trip request service response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching trip request details:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  static async getAllTripRequests(params = {}) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.ADMIN_ALL, {
        params
      });
      return response;
    } catch (error) {
      console.error('Error fetching all trip requests:', error);
      throw error;
    }
  }

  static async updateTripRequestStatus(id, statusData) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.UPDATE_STATUS(id), statusData);
      return response;
    } catch (error) {
      console.error('Error updating trip request status:', error);
      throw error;
    }
  }

  static async approveTripRequest(id, approvalData) {
    try {
      console.log('Service: Approving trip request with ID:', id, 'Data:', approvalData);
      console.log('Service: API endpoint:', API_CONFIG.ENDPOINTS.TRIP_REQUESTS.APPROVE(id));
      const response = await apiService.put(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.APPROVE(id), approvalData);
      console.log('Service: Approval response:', response);
      return response;
    } catch (error) {
      console.error('Service: Error approving trip request:', error);
      console.error('Service: Error response:', error.response?.data);
      console.error('Service: Error status:', error.response?.status);
      throw error;
    }
  }

  static async editTripRequest(id, editData) {
    try {
      const response = await apiService.put(`/api/trip-requests/${id}/edit`, editData);
      return response;
    } catch (error) {
      console.error('Error editing trip request:', error);
      throw error;
    }
  }

  static async assignTripRequest(id, assignmentData) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.ASSIGN(id), assignmentData);
      return response;
    } catch (error) {
      console.error('Error assigning trip request:', error);
      throw error;
    }
  }

  static async addCommunication(id, communicationData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.ADD_COMMUNICATION(id), communicationData);
      return response;
    } catch (error) {
      console.error('Error adding communication:', error);
      throw error;
    }
  }

  static async getTripRequestStats() {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.STATS);
      return response;
    } catch (error) {
      console.error('Error fetching trip request stats:', error);
      throw error;
    }
  }

  static async deleteTripRequest(id) {
    try {
      const response = await apiService.delete(API_CONFIG.ENDPOINTS.TRIP_REQUESTS.DETAIL(id));
      return response;
    } catch (error) {
      console.error('Error deleting trip request:', error);
      throw error;
    }
  }

  static async createBookingFromTripRequest(id) {
    try {
      const response = await apiService.post(`/api/trip-requests/${id}/create-booking`);
      return response;
    } catch (error) {
      console.error('Error creating booking from trip request:', error);
      throw error;
    }
  }

  static async getBookingDetails(bookingId) {
    try {
      const response = await apiService.get(`/api/bookings/${bookingId}/details?type=trip-request`);
      return response;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  }
}

export default TripRequestService;
