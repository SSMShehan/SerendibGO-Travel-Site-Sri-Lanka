import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock,
  User,
  Phone,
  Mail,
  Star,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Utensils,
  Car,
  Bed,
  Plane
} from 'lucide-react';
import tripRequestService from '../services/tripRequestService';
import { useAuth } from '../contexts/AuthContext';

const TripRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tripRequest, setTripRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingBooking, setCreatingBooking] = useState(false);

  useEffect(() => {
    if (id) {
      loadTripRequest();
    }
  }, [id]);

  const loadTripRequest = async () => {
    try {
      setLoading(true);
      const response = await tripRequestService.getTripRequestById(id);
      
      if (response.success) {
        setTripRequest(response.data.tripRequest);
      } else {
        toast.error(response.message || 'Failed to load trip request');
        navigate('/bookings');
      }
    } catch (error) {
      console.error('Error loading trip request:', error);
      toast.error('Failed to load trip request');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (!user) {
      toast.error('Please log in to book this trip');
      navigate('/login');
      return;
    }

    // If booking already exists (pending_payment status), go directly to payment
    if (tripRequest.status === 'pending_payment' && tripRequest.bookingId) {
      console.log('Booking already exists, redirecting to payment...');
      navigate(`/payment/trip-request/${tripRequest.bookingId}`);
      return;
    }

    setCreatingBooking(true);
    try {
      console.log('=== CREATING BOOKING FROM TRIP REQUEST ===');
      console.log('Trip Request ID:', tripRequest._id);
      console.log('Trip Request:', tripRequest);
      
      const response = await tripRequestService.createBookingFromTripRequest(tripRequest._id);
      
      console.log('=== BOOKING CREATION RESPONSE ===');
      console.log('Response:', response);
      console.log('=== END BOOKING CREATION RESPONSE ===');
      
      if (response.success) {
        toast.success('Booking created! Please complete payment to confirm your trip.');
        navigate(`/payment/trip-request/${response.data.booking._id}`);
      } else {
        console.error('Booking creation failed:', response.message);
        toast.error(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('=== BOOKING CREATION ERROR ===');
      console.error('Error creating booking:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('=== END BOOKING CREATION ERROR ===');
      toast.error('Failed to create booking');
    } finally {
      setCreatingBooking(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'LKR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'LKR' ? 'LKR' : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, text: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' },
      pending_payment: { color: 'bg-orange-100 text-orange-800', icon: Clock, text: 'Payment Pending' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
      booked: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, text: 'Booked' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', text: 'Low Priority' },
      medium: { color: 'bg-yellow-100 text-yellow-800', text: 'Medium Priority' },
      high: { color: 'bg-orange-100 text-orange-800', text: 'High Priority' },
      urgent: { color: 'bg-red-100 text-red-800', text: 'Urgent Priority' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tripRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Request Not Found</h2>
          <p className="text-gray-600 mb-6">The trip request you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/bookings"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Link to="/bookings" className="hover:text-gray-700">
                  My Bookings
                </Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900">Trip Request Details</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">{tripRequest.title}</h1>
              <p className="text-gray-600 mt-2">{tripRequest.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(tripRequest.status)}
              {getPriorityBadge(tripRequest.priority)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium">{formatDate(tripRequest.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium">{formatDate(tripRequest.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Travelers</p>
                      <p className="font-medium">
                        {tripRequest.totalTravelers} people
                        {tripRequest.travelers && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({tripRequest.travelers.adults} adults, {tripRequest.travelers.children} children, {tripRequest.travelers.infants} infants)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Budget Range</p>
                      <p className="font-medium">
                        {formatCurrency(tripRequest.budget?.minBudget || 0, tripRequest.budget?.currency)} - {formatCurrency(tripRequest.budget?.maxBudget || 0, tripRequest.budget?.currency)}
                      </p>
                    </div>
                  </div>
                  {tripRequest.review?.approvedCost && (
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Approved Cost</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(tripRequest.review.approvedCost, tripRequest.budget?.currency)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium">
                        {Math.ceil((new Date(tripRequest.endDate) - new Date(tripRequest.startDate)) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Destinations */}
            {tripRequest.destinations && tripRequest.destinations.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Destinations</h2>
                <div className="space-y-3">
                  {tripRequest.destinations.map((destination, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div className="flex-1">
                        <p className="font-medium">{destination.name}</p>
                        <p className="text-sm text-gray-600">{destination.duration} days</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            {tripRequest.preferences && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tripRequest.preferences.accommodationType && (
                    <div className="flex items-center space-x-3">
                      <Bed className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Accommodation</p>
                        <p className="font-medium capitalize">{tripRequest.preferences.accommodationType.replace('-', ' ')}</p>
                      </div>
                    </div>
                  )}
                  {tripRequest.preferences.mealPlan && tripRequest.preferences.mealPlan !== 'any' && (
                    <div className="flex items-center space-x-3">
                      <Utensils className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Meal Plan</p>
                        <p className="font-medium capitalize">{tripRequest.preferences.mealPlan.replace('-', ' ')}</p>
                      </div>
                    </div>
                  )}
                  {tripRequest.preferences.transportation && tripRequest.preferences.transportation !== 'any' && (
                    <div className="flex items-center space-x-3">
                      <Car className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Transportation</p>
                        <p className="font-medium capitalize">{tripRequest.preferences.transportation}</p>
                      </div>
                    </div>
                  )}
                  {tripRequest.preferences.interests && tripRequest.preferences.interests.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Interests</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tripRequest.preferences.interests.map((interest, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Special Requirements */}
            {tripRequest.specialRequirements && tripRequest.specialRequirements.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Requirements</h2>
                <div className="space-y-2">
                  {tripRequest.specialRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm">{requirement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approval Details */}
            {tripRequest.review && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Approval Details</h2>
                <div className="space-y-4">
                  {tripRequest.review.approvalNotes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Approval Notes</p>
                      <p className="text-gray-900">{tripRequest.review.approvalNotes}</p>
                    </div>
                  )}
                  {tripRequest.review.approvedItinerary && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Approved Itinerary</p>
                      <p className="text-gray-900">{tripRequest.review.approvedItinerary}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Approved on</p>
                      <p className="font-medium">{formatDate(tripRequest.review.approvedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{user?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{tripRequest.contactInfo?.email || user?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">
                      {tripRequest.contactInfo?.countryCode} {tripRequest.contactInfo?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
                {tripRequest.contactInfo?.preferredContactMethod && (
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Preferred Contact</p>
                      <p className="font-medium capitalize">{tripRequest.contactInfo.preferredContactMethod}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Request Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h3>
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
              </div>
            </div>

            {/* Action Buttons */}
            {(tripRequest.status === 'approved' || tripRequest.status === 'pending_payment') && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {tripRequest.status === 'pending_payment' ? 'Complete Payment' : 'Ready to Book?'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {tripRequest.status === 'pending_payment' 
                    ? 'Your booking is created but payment is pending. Complete payment to confirm your trip.'
                    : 'Your trip request has been approved! Complete your booking by making the payment.'
                  }
                </p>
                <button
                  onClick={handleBookNow}
                  disabled={creatingBooking}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {creatingBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Booking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>{tripRequest.status === 'pending_payment' ? 'Complete Payment' : 'Book Now'}</span>
                    </>
                  )}
                </button>
                {tripRequest.review?.approvedCost && (
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Total: {formatCurrency(tripRequest.review.approvedCost, tripRequest.budget?.currency)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripRequestDetailPage;
