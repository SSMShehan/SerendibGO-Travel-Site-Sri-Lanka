import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  AlertCircle,
  Mail,
  Phone,
  Tag,
  Flag,
  Send
} from 'lucide-react';
import SupportService from '../../services/supportService';
import StaffLayout from '../../components/layout/StaffLayout';

const SupportRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    loadSupportRequests();
  }, [currentPage, statusFilter, categoryFilter, priorityFilter]);

  const loadSupportRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(priorityFilter && { priority: priorityFilter })
      };

      const response = await SupportService.getAllSupportRequests(params);
      
      if (response.success) {
        setRequests(response.data.requests);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        toast.error('Failed to load support requests');
      }
    } catch (error) {
      console.error('Error loading support requests:', error);
      toast.error('Failed to load support requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const handlePriorityChange = (priority) => {
    setPriorityFilter(priority);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleReply = async (requestId) => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setReplying(true);
    try {
      const response = await SupportService.addResponse(requestId, replyMessage);
      
      if (response.success) {
        toast.success('Reply sent successfully');
        setReplyMessage('');
        setSelectedRequest(null);
        loadSupportRequests(); // Reload requests
      } else {
        toast.error(response.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await SupportService.updateStatus(requestId, newStatus);
      
      if (response.success) {
        toast.success('Status updated successfully');
        loadSupportRequests(); // Reload requests
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      general_inquiry: 'General Inquiry',
      booking_help: 'Booking Help',
      payment_issue: 'Payment Issue',
      technical_support: 'Technical Support',
      cancellation_request: 'Cancellation Request',
      feedback: 'Feedback',
      complaint: 'Complaint',
      other: 'Other'
    };
    return labels[category] || category;
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

  // Get filtered requests based on current filters
  const getFilteredRequests = () => {
    let filtered = requests;

    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(request => request.status === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Get status statistics
  const getStatusStats = () => {
    const stats = {
      all: requests.length,
      open: requests.filter(r => r.status === 'open').length,
      in_progress: requests.filter(r => r.status === 'in_progress').length,
      resolved: requests.filter(r => r.status === 'resolved').length,
      closed: requests.filter(r => r.status === 'closed').length
    };
    return stats;
  };

  const filteredRequests = getFilteredRequests();
  const statusStats = getStatusStats();

  return (
    <StaffLayout 
      title="Customer Support" 
      subtitle="Manage customer support requests and inquiries"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{statusStats.all}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Open</p>
            <p className="text-2xl font-bold text-blue-600">{statusStats.open}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">{statusStats.in_progress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{statusStats.resolved}</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'all', label: 'All Requests', icon: '📋' },
                { id: 'open', label: 'Open', icon: '🔓' },
                { id: 'in_progress', label: 'In Progress', icon: '⏳' },
                { id: 'resolved', label: 'Resolved', icon: '✅' },
                { id: 'closed', label: 'Closed', icon: '🔒' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setStatusFilter(tab.id === 'all' ? '' : tab.id);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {statusStats[tab.id] > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {statusStats[tab.id]}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search support requests..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="general_inquiry">General Inquiry</option>
                  <option value="booking_help">Booking Help</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="technical_support">Technical Support</option>
                  <option value="cancellation_request">Cancellation Request</option>
                  <option value="feedback">Feedback</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveTab('all');
                  setStatusFilter('');
                  setCategoryFilter('');
                  setPriorityFilter('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Support Requests List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading support requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No support requests found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || activeTab !== 'all' || categoryFilter || priorityFilter 
                ? 'Try adjusting your search criteria or filters'
                : 'No support requests have been submitted yet'
              }
            </p>
            {(searchTerm || activeTab !== 'all' || categoryFilter || priorityFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveTab('all');
                  setStatusFilter('');
                  setCategoryFilter('');
                  setPriorityFilter('');
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  {/* Request Info */}
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.subject}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority?.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{request.message}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="w-4 h-4 mr-2" />
                            <span>{request.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-2" />
                            <span>{request.email}</span>
                          </div>
                          {request.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-4 h-4 mr-2" />
                              <span>{request.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-500">
                            <Tag className="w-4 h-4 mr-2" />
                            <span>{getCategoryLabel(request.category)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(request.createdAt)}</span>
                          </div>
                          {request.responseCount > 0 && (
                            <div className="flex items-center text-sm text-gray-500">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              <span>{request.responseCount} response(s)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    
                    {request.status === 'open' && (
                      <button
                        onClick={() => handleStatusUpdate(request._id, 'in_progress')}
                        className="px-4 py-2 text-sm font-medium text-yellow-600 hover:text-yellow-800 border border-yellow-300 rounded-md hover:bg-yellow-50 transition-colors flex items-center"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Start Progress
                      </button>
                    )}
                    
                    {request.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(request._id, 'resolved')}
                        className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800 border border-green-300 rounded-md hover:bg-green-50 transition-colors flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Reply Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Support Request Details</h3>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Request Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{selectedRequest.subject}</h4>
                    <p className="text-gray-600 mb-3">{selectedRequest.message}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">From:</span> {selectedRequest.name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedRequest.email}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {getCategoryLabel(selectedRequest.category)}
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                          {selectedRequest.priority?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reply Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reply Message
                    </label>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type your reply here..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(selectedRequest._id)}
                      disabled={replying || !replyMessage.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {replying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default SupportRequestsPage;
