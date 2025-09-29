import apiService from './apiService';
import API_CONFIG from '../config/api';

class CancellationRequestService {
  // Create a cancellation request
  async createCancellationRequest(bookingId, bookingType, reason, priority = 'medium') {
    try {
      const response = await apiService.post('/api/cancellation-requests', {
        bookingId,
        bookingType,
        reason,
        priority
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user's cancellation requests
  async getMyCancellationRequests(status = null) {
    try {
      const params = status ? { status } : {};
      const response = await apiService.get('/api/cancellation-requests/my', params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get cancellation request by ID
  async getCancellationRequestById(requestId) {
    try {
      const response = await apiService.get(`/api/cancellation-requests/${requestId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get pending cancellation requests (staff only)
  async getPendingCancellationRequests() {
    try {
      const response = await apiService.get('/api/cancellation-requests/pending');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Review cancellation request (staff only)
  async reviewCancellationRequest(requestId, status, staffNotes = '', refundAmount = 0, refundMethod = 'original_payment') {
    try {
      const response = await apiService.put(`/api/cancellation-requests/${requestId}/review`, {
        status,
        staffNotes,
        refundAmount,
        refundMethod
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Format status for display
  formatStatus(status) {
    const statusMap = {
      pending: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  }

  // Get status color for UI
  getStatusColor(status) {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  // Format priority for display
  formatPriority(priority) {
    const priorityMap = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent'
    };
    return priorityMap[priority] || priority;
  }

  // Get priority color for UI
  getPriorityColor(priority) {
    const priorityColors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return priorityColors[priority] || 'bg-gray-100 text-gray-800';
  }

  // Check if booking can be cancelled directly (unpaid bookings)
  canCancelDirectly(booking) {
    // Only unpaid bookings can be cancelled directly
    return booking.paymentStatus === 'pending' || booking.paymentStatus === 'failed';
  }

  // Check if booking requires cancellation request (paid bookings)
  requiresCancellationRequest(booking) {
    // Paid bookings require staff approval
    return booking.paymentStatus === 'paid';
  }

  // Get booking type from booking object
  getBookingType(booking) {
    // Check for tour booking (either has tour field or tripRequest field)
    if (booking.tour || booking.tripRequest || booking.participants) return 'TourBooking';
    if (booking.guide) return 'GuideBooking';
    if (booking.vehicle && booking.renter) return 'VehicleRental';
    if (booking.vehicle) return 'VehicleBooking';
    if (booking.hotel) return 'Booking';
    return 'Booking'; // Default fallback
  }
}

// Create and export a single instance
const cancellationRequestService = new CancellationRequestService();
export default cancellationRequestService;
