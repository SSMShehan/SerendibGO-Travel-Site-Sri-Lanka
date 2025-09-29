import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Clock,
  User,
  Phone,
  Mail,
  Star,
  Plus,
  Trash2,
  Save,
  ArrowLeft
} from 'lucide-react';
import tripRequestService from '../../services/tripRequestService';
import hotelService from '../../services/hotelService';
import vehicleService from '../../services/vehicleService';
import { useAuth } from '../../contexts/AuthContext';

const TripRequestManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [tripRequest, setTripRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  
  // Edit form state
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    travelers: { adults: 1, children: 0, infants: 0 },
    budget: { minBudget: '', maxBudget: '', currency: 'LKR' },
    destinations: [],
    preferences: {},
    contactInfo: {},
    notes: ''
  });
  
  // Approval form state
  const [approvalData, setApprovalData] = useState({
    approvedCost: '',
    approvalNotes: '',
    approvedItinerary: ''
  });
  
  // Available hotels and vehicles for replacement
  const [availableHotels, setAvailableHotels] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    if (id) {
      loadTripRequest();
    }
  }, [id]);

  // Debug useEffect to monitor approving state
  useEffect(() => {
    console.log('Approving state changed to:', approving);
  }, [approving]);

  const loadTripRequest = async () => {
    try {
      setLoading(true);
      console.log('Loading trip request with ID:', id);
      const response = await tripRequestService.getTripRequestById(id);
      console.log('Trip request response:', response);
      
      if (response.success) {
        setTripRequest(response.data.tripRequest);
        // Initialize edit data
        setEditData({
          title: response.data.tripRequest.title || '',
          description: response.data.tripRequest.description || '',
          startDate: response.data.tripRequest.startDate ? new Date(response.data.tripRequest.startDate).toISOString().split('T')[0] : '',
          endDate: response.data.tripRequest.endDate ? new Date(response.data.tripRequest.endDate).toISOString().split('T')[0] : '',
          travelers: response.data.tripRequest.travelers || { adults: 1, children: 0, infants: 0 },
          budget: response.data.tripRequest.budget || { minBudget: '', maxBudget: '', currency: 'LKR' },
          destinations: response.data.tripRequest.destinations || [],
          preferences: response.data.tripRequest.preferences || {},
          contactInfo: response.data.tripRequest.contactInfo || {},
          notes: ''
        });
      } else {
        console.error('Failed to load trip request:', response.message);
        toast.error(response.message || 'Failed to load trip request');
        navigate('/staff/trip-requests');
      }
    } catch (error) {
      console.error('Error loading trip request:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Failed to load trip request: ${error.response?.data?.message || error.message}`);
      navigate('/staff/trip-requests');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableResources = async () => {
    try {
      setLoadingResources(true);
      const [hotelsRes, vehiclesRes] = await Promise.all([
        hotelService.getHotels(),
        vehicleService.getVehicles()
      ]);
      
      if (hotelsRes.success) {
        setAvailableHotels(hotelsRes.data?.hotels || []);
      }
      if (vehiclesRes.success) {
        setAvailableVehicles(vehiclesRes.data?.vehicles || vehiclesRes.vehicles || []);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    loadAvailableResources();
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const response = await tripRequestService.editTripRequest(id, editData);
      
      if (response.success) {
        toast.success('Trip request updated successfully');
        setTripRequest(response.data.tripRequest);
        setEditing(false);
      } else {
        toast.error(response.message || 'Failed to update trip request');
      }
    } catch (error) {
      console.error('Error updating trip request:', error);
      toast.error('Failed to update trip request');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    console.log('=== HANDLE APPROVE START ===');
    console.log('handleApprove called with:', approvalData);
    console.log('Current approving state:', approving);
    console.log('Trip request ID:', id);
    
    // Convert approvedCost to number
    const numericApprovedCost = parseFloat(approvalData.approvedCost);
    console.log('Numeric approved cost:', numericApprovedCost);
    
    if (!approvalData.approvedCost || numericApprovedCost <= 0 || isNaN(numericApprovedCost)) {
      console.log('Validation failed: Invalid approved cost');
      toast.error('Please enter a valid approved cost');
      return;
    }

    try {
      console.log('Setting approving to true');
      setApproving(true);
      console.log('Approving state should now be true');
      
      // Prepare approval data with numeric cost
      const approvalPayload = {
        ...approvalData,
        approvedCost: numericApprovedCost
      };
      
      console.log('About to call API with payload:', approvalPayload);
      console.log('API endpoint will be:', `/api/trip-requests/${id}/approve`);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Approval request timed out after 30 seconds')), 30000);
      });
      
      const apiPromise = tripRequestService.approveTripRequest(id, approvalPayload);
      
      console.log('Starting API call with timeout...');
      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log('API call completed, response:', response);
      
      if (response.success) {
        console.log('Approval successful, updating UI');
        toast.success('Trip request approved successfully');
        setTripRequest(response.data.tripRequest);
        setApprovalData({ approvedCost: '', approvalNotes: '', approvedItinerary: '' });
        setApproving(false); // Close the approval form
        console.log('Approval form should be closed now');
      } else {
        console.log('Approval failed:', response.message);
        toast.error(response.message || 'Failed to approve trip request');
      }
    } catch (error) {
      console.error('=== APPROVAL ERROR CAUGHT ===');
      console.error('Error approving trip request:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      toast.error(`Failed to approve trip request: ${error.response?.data?.message || error.message}`);
    } finally {
      console.log('=== FINALLY BLOCK EXECUTED ===');
      console.log('Setting approving to false in finally block');
      setApproving(false);
      console.log('Approving state should now be false');
    }
    console.log('=== HANDLE APPROVE END ===');
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await tripRequestService.updateTripRequestStatus(id, {
        status: 'rejected',
        notes: `Rejected: ${reason}`
      });
      
      if (response.success) {
        toast.success('Trip request rejected');
        setTripRequest(response.data.tripRequest);
      } else {
        toast.error(response.message || 'Failed to reject trip request');
      }
    } catch (error) {
      console.error('Error rejecting trip request:', error);
      toast.error('Failed to reject trip request');
    }
  };

  const addDestination = () => {
    setEditData(prev => ({
      ...prev,
      destinations: [...prev.destinations, { name: '', duration: 1, activities: [], accommodation: 'any', budget: '' }]
    }));
  };

  const removeDestination = (index) => {
    setEditData(prev => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== index)
    }));
  };

  const updateDestination = (index, field, value) => {
    setEditData(prev => ({
      ...prev,
      destinations: prev.destinations.map((dest, i) => 
        i === index ? { ...dest, [field]: value } : dest
      )
    }));
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip request...</p>
        </div>
      </div>
    );
  }

  if (!tripRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip Request Not Found</h1>
          <button
            onClick={() => navigate('/staff/trip-requests')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Trip Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/staff/trip-requests')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{tripRequest.title}</h1>
                <p className="text-gray-600">Trip Request Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tripRequest.status)}`}>
                {tripRequest.status?.charAt(0).toUpperCase() + tripRequest.status?.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(tripRequest.priority)}`}>
                {tripRequest.priority?.toUpperCase()} Priority
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{tripRequest.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {tripRequest.user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {tripRequest.contactInfo?.phone || tripRequest.user?.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Preferred Contact</p>
                  <p className="font-medium">{tripRequest.contactInfo?.preferredContactMethod || 'Email'}</p>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Trip Details
                </h2>
                {!editing && ['pending', 'under_review'].includes(tripRequest.status) && (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors flex items-center"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Details
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trip Title</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Travel Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={editData.startDate}
                        onChange={(e) => setEditData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={editData.endDate}
                        onChange={(e) => setEditData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Travelers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Travelers</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Adults</label>
                        <input
                          type="number"
                          min="1"
                          value={editData.travelers.adults}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            travelers: { ...prev.travelers, adults: parseInt(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Children</label>
                        <input
                          type="number"
                          min="0"
                          value={editData.travelers.children}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            travelers: { ...prev.travelers, children: parseInt(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Infants</label>
                        <input
                          type="number"
                          min="0"
                          value={editData.travelers.infants}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            travelers: { ...prev.travelers, infants: parseInt(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Min Budget</label>
                        <input
                          type="number"
                          value={editData.budget.minBudget}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            budget: { ...prev.budget, minBudget: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Max Budget</label>
                        <input
                          type="number"
                          value={editData.budget.maxBudget}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            budget: { ...prev.budget, maxBudget: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Currency</label>
                        <select
                          value={editData.budget.currency}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            budget: { ...prev.budget, currency: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="LKR">LKR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Destinations */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Destinations</label>
                      <button
                        type="button"
                        onClick={addDestination}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Destination
                      </button>
                    </div>
                    
                    {editData.destinations.map((destination, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Destination {index + 1}</h4>
                          {editData.destinations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDestination(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Name</label>
                            <input
                              type="text"
                              value={destination.name}
                              onChange={(e) => updateDestination(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Duration (days)</label>
                            <input
                              type="number"
                              min="1"
                              value={destination.duration}
                              onChange={(e) => updateDestination(index, 'duration', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Edit Notes</label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add notes about the changes made..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium">{formatDate(tripRequest.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium">{formatDate(tripRequest.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Travelers</p>
                      <p className="font-medium">
                        {tripRequest.travelers?.adults || 0} adults, {tripRequest.travelers?.children || 0} children, {tripRequest.travelers?.infants || 0} infants
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Budget Range</p>
                      <p className="font-medium">
                        {tripRequest.budget?.currency || 'LKR'} {tripRequest.budget?.minBudget?.toLocaleString() || '0'} - {tripRequest.budget?.maxBudget?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Description</p>
                    <p className="text-gray-900">{tripRequest.description}</p>
                  </div>

                  {tripRequest.destinations && tripRequest.destinations.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Destinations</p>
                      <div className="space-y-2">
                        {tripRequest.destinations.map((dest, index) => (
                          <div key={index} className="bg-gray-50 rounded-md p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{dest.name}</span>
                              <span className="text-sm text-gray-600">{dest.duration} days</span>
                            </div>
                            {dest.activities && dest.activities.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-600">Activities:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {dest.activities.map((activity, i) => (
                                    <span key={i} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                      {activity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Communications */}
            {tripRequest.communications && tripRequest.communications.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Communications
                </h2>
                <div className="space-y-3">
                  {tripRequest.communications.map((comm, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comm.sentBy?.name || 'System'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comm.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comm.message}</p>
                      <span className="text-xs text-gray-500 capitalize">{comm.type.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              {tripRequest.status === 'pending' && (
                <div className="space-y-3">
                  <button
                    onClick={() => setApproving(true)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Request
                  </button>
                  <button
                    onClick={handleReject}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Request
                  </button>
                </div>
              )}

              {tripRequest.status === 'under_review' && (
                <div className="space-y-3">
                  <button
                    onClick={() => setApproving(true)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Request
                  </button>
                  <button
                    onClick={handleReject}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Request
                  </button>
                </div>
              )}

              {tripRequest.status === 'approved' && (
                <div className="text-center">
                  <div className="text-green-600 mb-2">
                    <CheckCircle className="w-8 h-8 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600">Request approved</p>
                  {tripRequest.review?.approvedCost && (
                    <p className="font-medium text-green-600 mt-1">
                      {tripRequest.budget?.currency || 'LKR'} {tripRequest.review.approvedCost.toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Approval Form */}
            {approving && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Approve Request</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Approved Cost</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                        {tripRequest.budget?.currency || 'LKR'}
                      </span>
                      <input
                        type="number"
                        value={approvalData.approvedCost}
                        onChange={(e) => setApprovalData(prev => ({ ...prev, approvedCost: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter approved cost"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Approval Notes</label>
                    <textarea
                      value={approvalData.approvalNotes}
                      onChange={(e) => setApprovalData(prev => ({ ...prev, approvalNotes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add notes about the approval..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Approved Itinerary</label>
                    <textarea
                      value={approvalData.approvedItinerary}
                      onChange={(e) => setApprovalData(prev => ({ ...prev, approvedItinerary: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the approved itinerary..."
                    />
                  </div>

                  {/* Debug info */}
                  <div className="text-xs text-gray-500 mb-2">
                    Debug: approvedCost = "{approvalData.approvedCost}" (numeric: {parseFloat(approvalData.approvedCost)}), approving = {approving.toString()}
                  </div>

                  {/* Test buttons */}
                  <div className="mb-2 flex space-x-2">
                    <button
                      onClick={() => {
                        console.log('Test button clicked');
                        console.log('Current approvalData:', approvalData);
                        console.log('Current approving state:', approving);
                        toast.success('Test button works!');
                      }}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Test Button
                    </button>
                    <button
                      onClick={() => {
                        console.log('Resetting approving state');
                        setApproving(false);
                        // Force a re-render by updating approval data
                        setApprovalData(prev => ({ ...prev }));
                        toast.success('Approving state reset!');
                      }}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Reset State
                    </button>
                    <button
                      onClick={() => {
                        console.log('Force refresh - reloading page');
                        window.location.reload();
                      }}
                      className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Force Refresh
                    </button>
                    <button
                      onClick={async () => {
                        console.log('Direct approval attempt');
                        try {
                          const approvalPayload = {
                            approvedCost: parseFloat(approvalData.approvedCost),
                            approvalNotes: approvalData.approvalNotes,
                            approvedItinerary: approvalData.approvedItinerary
                          };
                          console.log('Direct approval payload:', approvalPayload);
                          const response = await tripRequestService.approveTripRequest(id, approvalPayload);
                          console.log('Direct approval response:', response);
                          if (response.success) {
                            toast.success('Trip request approved successfully!');
                            // Update the trip request state instead of reloading
                            setTripRequest(response.data.tripRequest);
                            setApprovalData({ approvedCost: '', approvalNotes: '', approvedItinerary: '' });
                            setApproving(false);
                            // Close the approval form by setting approving to false
                            console.log('Approval completed, UI updated');
                          } else {
                            toast.error(response.message || 'Failed to approve');
                          }
                        } catch (error) {
                          console.error('Direct approval error:', error);
                          toast.error('Direct approval failed');
                        }
                      }}
                      className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Direct Approve
                    </button>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={async () => {
                        console.log('Main approval attempt');
                        try {
                          const approvalPayload = {
                            approvedCost: parseFloat(approvalData.approvedCost),
                            approvalNotes: approvalData.approvalNotes,
                            approvedItinerary: approvalData.approvedItinerary
                          };
                          console.log('Main approval payload:', approvalPayload);
                          const response = await tripRequestService.approveTripRequest(id, approvalPayload);
                          console.log('Main approval response:', response);
                          if (response.success) {
                            toast.success('Trip request approved successfully!');
                            setTripRequest(response.data.tripRequest);
                            setApprovalData({ approvedCost: '', approvalNotes: '', approvedItinerary: '' });
                            setApproving(false);
                            console.log('Main approval completed, UI updated');
                          } else {
                            toast.error(response.message || 'Failed to approve');
                          }
                        } catch (error) {
                          console.error('Main approval error:', error);
                          toast.error('Main approval failed');
                        }
                      }}
                      disabled={!approvalData.approvedCost || parseFloat(approvalData.approvedCost) <= 0 || isNaN(parseFloat(approvalData.approvedCost))}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setApproving(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Request Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Info</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Request ID</p>
                  <p className="font-mono text-sm">{tripRequest._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="text-sm">{formatDate(tripRequest.createdAt)}</p>
                </div>
                {tripRequest.assignedTo && (
                  <div>
                    <p className="text-sm text-gray-600">Assigned To</p>
                    <p className="text-sm">{tripRequest.assignedTo.name}</p>
                  </div>
                )}
                {tripRequest.review?.reviewedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Last Reviewed</p>
                    <p className="text-sm">{formatDate(tripRequest.review.reviewedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripRequestManagementPage;
