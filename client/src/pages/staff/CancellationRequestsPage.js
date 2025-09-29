import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import cancellationRequestService from '../../services/cancellationRequestService';
import StaffLayout from '../../components/layout/StaffLayout';
import { 
  Filter, 
  Search, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  XCircle,
  MapPin,
  Car,
  Users,
  Building
} from 'lucide-react';

const CancellationRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    staffNotes: '',
    refundAmount: 0,
    refundMethod: 'original_payment'
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'all', // all, tour, hotel, vehicle, guide
    status: 'all', // all, pending, approved, rejected
    priority: 'all', // all, low, medium, high, urgent
    search: ''
  });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await cancellationRequestService.getPendingCancellationRequests();
      if (response.success) {
        setRequests(response.data.requests);
      } else {
        toast.error('Failed to load cancellation requests');
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load cancellation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (requestId) => {
    try {
      const response = await cancellationRequestService.reviewCancellationRequest(
        requestId,
        reviewData.status,
        reviewData.staffNotes,
        reviewData.refundAmount,
        reviewData.refundMethod
      );

      if (response.success) {
        toast.success(`Cancellation request ${reviewData.status} successfully`);
        setSelectedRequest(null);
        setReviewData({
          status: 'approved',
          staffNotes: '',
          refundAmount: 0,
          refundMethod: 'original_payment'
        });
        loadPendingRequests();
      } else {
        toast.error(response.message || 'Failed to review request');
      }
    } catch (error) {
      console.error('Error reviewing request:', error);
      toast.error('Failed to review cancellation request');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price, currency = 'LKR') => {
    return `${currency} ${price?.toLocaleString() || '0'}`;
  };

  // Filter requests based on current filters
  const getFilteredRequests = () => {
    let filtered = requests;

    // Filter by category (booking type)
    if (filters.category !== 'all') {
      filtered = filtered.filter(request => {
        switch (filters.category) {
          case 'tour':
            return request.bookingType === 'TourBooking';
          case 'hotel':
            return request.bookingType === 'Booking';
          case 'vehicle':
            return request.bookingType === 'VehicleBooking' || request.bookingType === 'VehicleRental';
          case 'guide':
            return request.bookingType === 'GuideBooking';
          default:
            return true;
        }
      });
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(request => request.priority === filters.priority);
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(request => 
        request.reason.toLowerCase().includes(searchTerm) ||
        request.user?.name.toLowerCase().includes(searchTerm) ||
        request.bookingType.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };

  // Get category statistics
  const getCategoryStats = () => {
    const stats = {
      all: requests.length,
      tour: requests.filter(r => r.bookingType === 'TourBooking').length,
      hotel: requests.filter(r => r.bookingType === 'Booking').length,
      vehicle: requests.filter(r => r.bookingType === 'VehicleBooking' || r.bookingType === 'VehicleRental').length,
      guide: requests.filter(r => r.bookingType === 'GuideBooking').length
    };
    return stats;
  };

  // Get booking type icon
  const getBookingTypeIcon = (bookingType) => {
    switch (bookingType) {
      case 'TourBooking':
        return MapPin;
      case 'Booking':
        return Building;
      case 'VehicleBooking':
      case 'VehicleRental':
        return Car;
      case 'GuideBooking':
        return Users;
      default:
        return FileText;
    }
  };

  // Get booking type name
  const getBookingTypeName = (bookingType) => {
    switch (bookingType) {
      case 'TourBooking':
        return 'Tour';
      case 'Booking':
        return 'Hotel';
      case 'VehicleBooking':
        return 'Vehicle Booking';
      case 'VehicleRental':
        return 'Vehicle Rental';
      case 'GuideBooking':
        return 'Guide';
      default:
        return bookingType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cancellation requests...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredRequests = getFilteredRequests();
  const categoryStats = getCategoryStats();

  return (
    <StaffLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cancellation Requests</h1>
          <p className="text-gray-600">Review and process customer cancellation requests</p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'all', label: 'All Requests', count: categoryStats.all },
                { id: 'tour', label: 'Tours', count: categoryStats.tour },
                { id: 'hotel', label: 'Hotels', count: categoryStats.hotel },
                { id: 'vehicle', label: 'Vehicles', count: categoryStats.vehicle },
                { id: 'guide', label: 'Guides', count: categoryStats.guide }
              ].map((tab) => {
                const Icon = tab.id === 'all' ? XCircle : getBookingTypeIcon(tab.label);
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setFilters(prev => ({ ...prev, category: tab.id }));
                    }}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      filters.category === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">High Priority</p>
            <p className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.priority === 'high' || r.priority === 'urgent').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">This Week</p>
            <p className="text-2xl font-bold text-blue-600">
              {requests.filter(r => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(r.createdAt) > weekAgo;
              }).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by reason, user, or booking type..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
            </div>

            {/* Filter Options */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <button
                onClick={() => setFilters({ category: 'all', status: 'all', priority: 'all', search: '' })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">No pending cancellation requests</p>
            <p className="text-gray-400">All cancellation requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const BookingTypeIcon = getBookingTypeIcon(request.bookingType);
              return (
              <div key={request._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Request Info */}
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-2xl">📋</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {request.bookingType} Cancellation Request
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Requested by: {request.user?.name || 'Unknown User'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📅 {formatDate(request.createdAt)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${cancellationRequestService.getPriorityColor(request.priority)}`}>
                            {cancellationRequestService.formatPriority(request.priority)} Priority
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${cancellationRequestService.getStatusColor(request.status)}`}>
                            {cancellationRequestService.formatStatus(request.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex flex-col lg:items-end space-y-2">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(request.booking?.totalAmount, request.booking?.currency)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Booking ID: {request.booking?._id?.slice(-8)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Cancellation Reason:</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{request.reason}</p>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Review Request
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Review Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Review Cancellation Request</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                  <select
                    value={reviewData.status}
                    onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Staff Notes</label>
                  <textarea
                    value={reviewData.staffNotes}
                    onChange={(e) => setReviewData({ ...reviewData, staffNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes about this decision..."
                  />
                </div>

                {reviewData.status === 'approved' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Refund Amount</label>
                      <input
                        type="number"
                        value={reviewData.refundAmount}
                        onChange={(e) => setReviewData({ ...reviewData, refundAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Refund Method</label>
                      <select
                        value={reviewData.refundMethod}
                        onChange={(e) => setReviewData({ ...reviewData, refundMethod: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="original_payment">Original Payment Method</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="credit">Account Credit</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReviewRequest(selectedRequest._id)}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                      reviewData.status === 'approved' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {reviewData.status === 'approved' ? 'Approve' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </StaffLayout>
  );
};

export default CancellationRequestsPage;
