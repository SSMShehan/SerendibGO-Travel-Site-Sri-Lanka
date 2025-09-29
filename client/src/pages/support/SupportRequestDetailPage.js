import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SupportService from '../../services/supportService';

const SupportRequestDetailPage = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newResponse, setNewResponse] = useState('');

  useEffect(() => {
    loadSupportRequest();
  }, [id]);

  const loadSupportRequest = async () => {
    setLoading(true);
    try {
      const response = await SupportService.getSupportRequest(id);
      if (response.success) {
        setRequest(response.data);
      } else {
        toast.error(response.message || 'Failed to load support request');
      }
    } catch (error) {
      console.error('Error loading support request:', error);
      toast.error('Failed to load support request');
    } finally {
      setLoading(false);
    }
  };

  const handleAddResponse = async (e) => {
    e.preventDefault();
    
    if (!newResponse.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    try {
      const response = await SupportService.addResponse(id, newResponse);
      if (response.success) {
        toast.success('Response added successfully');
        setNewResponse('');
        loadSupportRequest(); // Reload to get updated data
      } else {
        toast.error(response.message || 'Failed to add response');
      }
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error('Failed to add response');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const colors = SupportService.getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = SupportService.getPriorityColor(priority);
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading support request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Support Request Not Found</h2>
          <p className="text-gray-600 mb-6">The support request you're looking for doesn't exist or you don't have access to it.</p>
          <Link
            to="/support/my-requests"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Back to My Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Link to="/support/my-requests" className="hover:text-gray-700">
                  My Support Requests
                </Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900">Request Details</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">{request.subject}</h1>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(request.status)}
              {getPriorityBadge(request.priority)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900">{SupportService.getCategoryLabel(request.category)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{request.message}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-gray-900">{formatDate(request.createdAt)}</p>
                  </div>
                  
                  {request.lastResponseAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Response</label>
                      <p className="text-gray-900">{formatDate(request.lastResponseAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Responses */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Support Responses ({request.responses ? request.responses.length : 0})
                </h2>
                {request.status === 'open' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Awaiting Response
                  </span>
                )}
                {request.status === 'in_progress' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    In Progress
                  </span>
                )}
                {request.status === 'resolved' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Resolved
                  </span>
                )}
                {request.status === 'closed' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Closed
                  </span>
                )}
              </div>
              
              {request.responses && request.responses.length > 0 ? (
                <div className="space-y-6">
                  {request.responses.map((response, index) => (
                    <div key={index} className={`border-l-4 pl-4 py-3 ${
                      response.responseType === 'admin_response' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            response.responseType === 'admin_response' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {response.responseType === 'admin_response' ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900">
                              {response.responseType === 'admin_response' ? 'Staff Response' : 'System Update'}
                            </span>
                            {response.respondedBy && (
                              <p className="text-xs text-gray-600">
                                by {response.respondedBy.name} • {response.respondedBy.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(response.createdAt)}
                        </span>
                      </div>
                      <div className={`rounded-md p-4 ${
                        response.responseType === 'admin_response' 
                          ? 'bg-white border border-green-200' 
                          : 'bg-white border border-blue-200'
                      }`}>
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{response.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
                  <p className="text-gray-600 mb-4">Our support team will respond to your request soon.</p>
                  <div className="text-sm text-gray-500">
                    <p>• We typically respond within 24 hours</p>
                    <p>• You'll receive an email notification when we reply</p>
                    <p>• Check back here for updates</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{request.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{request.email}</p>
                </div>
                {request.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{request.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Related Information */}
            {(request.relatedBooking || request.relatedTour) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information</h3>
                <div className="space-y-3">
                  {request.relatedBooking && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Related Booking</label>
                      <p className="text-gray-900">
                        {request.relatedBookingType} - Status: {request.relatedBooking.status}
                      </p>
                    </div>
                  )}
                  {request.relatedTour && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Related Tour</label>
                      <p className="text-gray-900">{request.relatedTour.title}</p>
                      <p className="text-sm text-gray-600">{request.relatedTour.location}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/support/contact"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Request
                </Link>
                <Link
                  to="/support/my-requests"
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Back to Requests
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportRequestDetailPage;
