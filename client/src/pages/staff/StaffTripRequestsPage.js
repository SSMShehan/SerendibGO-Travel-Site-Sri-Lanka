import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import tripRequestService from '../../services/tripRequestService';
import { useAuth } from '../../contexts/AuthContext';

const StaffTripRequestsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tripRequests, setTripRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadTripRequests();
  }, [currentPage, statusFilter, priorityFilter]);

  const loadTripRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        priority: priorityFilter
      };

      const response = await tripRequestService.getAllTripRequests(params);
      
      if (response.success) {
        setTripRequests(response.data.tripRequests);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to load trip requests');
      }
    } catch (error) {
      console.error('Error loading trip requests:', error);
      toast.error('Failed to load trip requests');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await tripRequestService.getTripRequestStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    loadTripRequests();
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePriorityChange = (priority) => {
    setPriorityFilter(priority);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      booked: 'bg-purple-100 text-purple-800'
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredRequests = tripRequests.filter(request => 
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && tripRequests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trip Request Management</h1>
          <p className="text-gray-600">Manage and review customer trip requests</p>
        </div>

        {/* Stats */}
        {stats.statusStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.statusStats.map((stat) => (
              <div key={stat._id} className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600 capitalize">{stat._id || 'Unknown'}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search trip requests..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="booked">Booked</option>
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
            </div>
          </div>
        </div>

        {/* Trip Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trip requests found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter || priorityFilter 
                ? 'Try adjusting your search criteria'
                : 'No trip requests have been submitted yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Request Info */}
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority?.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="w-4 h-4 mr-2" />
                            <span>{request.user?.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>{request.budget?.currency || 'LKR'} {request.budget?.maxBudget?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{formatDate(request.createdAt)}</span>
                          </div>
                        </div>

                        {request.destinations && request.destinations.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">Destinations:</p>
                            <div className="flex flex-wrap gap-1">
                              {request.destinations.slice(0, 3).map((dest, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                  {dest.name}
                                </span>
                              ))}
                              {request.destinations.length > 3 && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                  +{request.destinations.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {request.assignedTo && (
                          <div className="text-sm text-gray-500">
                            <span>Assigned to: </span>
                            <span className="font-medium">{request.assignedTo.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => navigate(`/staff/trip-requests/${request._id}`)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    
                    {['pending', 'under_review'].includes(request.status) && (
                      <button
                        onClick={() => navigate(`/staff/trip-requests/${request._id}`)}
                        className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800 border border-green-300 rounded-md hover:bg-green-50 transition-colors flex items-center"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Manage
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
          <div className="mt-8 flex justify-center">
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
      </div>
    </div>
  );
};

export default StaffTripRequestsPage;
