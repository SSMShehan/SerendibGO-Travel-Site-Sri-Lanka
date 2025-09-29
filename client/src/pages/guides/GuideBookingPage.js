import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Users, Star, Calendar, ArrowLeft, Sparkles, Shield, Clock, CheckCircle, MessageSquare, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import guideService from '../../services/guideService';
import guideBookingService from '../../services/guideBookingService';
import { useAuth } from '../../contexts/AuthContext';
import PaymentModal from '../../components/payment/PaymentModal';

const GuideBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    participants: 1,
    tourType: 'cultural',
    specialRequests: '',
    meetingPoint: '',
    paymentMethod: 'credit_card'
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBookingData, setPaymentBookingData] = useState(null);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        const response = await guideService.getGuideById(id);
        
        if (response.success) {
          setGuide(response.guide);
          // Pre-fill dates if passed from previous page
          if (location.state?.startDate) {
            setBookingData(prev => ({
              ...prev,
              startDate: location.state.startDate,
              endDate: location.state.endDate || ''
            }));
          }
        } else {
          setError('Guide not found');
        }
      } catch (err) {
        console.error('Error fetching guide:', err);
        setError('Failed to load guide details');
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [id, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSuccess = (paymentData) => {
    toast.success('Payment completed successfully!');
    navigate(`/payment/success/${paymentData.bookingId}`);
  };

  const calculateTotalPrice = () => {
    if (!guide || !bookingData.startDate || !bookingData.endDate) return 0;
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    console.log('Guide booking calculation:', {
      guide: guide,
      dailyRate: guide.pricing?.daily,
      duration: duration,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate
    });
    
    return (guide.pricing?.daily || 0) * duration;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to book a guide');
      navigate('/login');
      return;
    }

    if (!bookingData.startDate || !bookingData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    if (new Date(bookingData.startDate) <= new Date()) {
      toast.error('Start date must be in the future');
      return;
    }

    if (new Date(bookingData.endDate) <= new Date(bookingData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    if (bookingData.participants > guide.maxCapacity) {
      toast.error(`Maximum ${guide.maxCapacity} participants allowed`);
      return;
    }

    setSubmitting(true);
    try {
      const bookingResponse = await guideBookingService.createGuideBooking({
        guideId: id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        participants: bookingData.participants,
        tourType: bookingData.tourType,
        specialRequests: bookingData.specialRequests,
        meetingPoint: bookingData.meetingPoint,
        paymentMethod: bookingData.paymentMethod
      });

      if (bookingResponse.success) {
        console.log('Guide booking created successfully:', bookingResponse.data);
        console.log('Total price for payment:', totalPrice);
        
        // Set booking data for payment modal
        setPaymentBookingData({
          bookingId: bookingResponse.data._id,
          bookingType: 'guide',
          amount: totalPrice,
          totalAmount: totalPrice,
          currency: 'LKR',
          guide: guide,
          booking: bookingResponse.data
        });
        
        // Show payment modal
        setShowPaymentModal(true);
      } else {
        toast.error(bookingResponse.message || 'Failed to create guide booking');
      }
    } catch (err) {
      console.error('Error booking guide:', err);
      toast.error('Failed to book guide. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price, currency = 'LKR') => {
    return `${currency} ${price?.toLocaleString() || '0'}`;
  };

  const tourTypeOptions = [
    { value: 'cultural', label: 'Cultural' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'nature', label: 'Nature' },
    { value: 'beach', label: 'Beach' },
    { value: 'wildlife', label: 'Wildlife' },
    { value: 'historical', label: 'Historical' },
    { value: 'religious', label: 'Religious' },
    { value: 'food', label: 'Food' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'custom', label: 'Custom' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading guide details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Guide Not Found</h2>
            <p className="text-gray-600 mb-8">{error || 'The guide you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/guides')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              Back to Guides
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const duration = bookingData.startDate && bookingData.endDate 
    ? Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/guides/${id}`)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-indigo-200/50 hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Guide
          </button>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Book Guide: {guide.name}
            </h1>
            <p className="text-lg text-gray-600">Complete your booking details below</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-indigo-600" />
                Booking Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      <Calendar className="inline w-5 h-5 mr-2 text-indigo-600" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={bookingData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-4 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      <Calendar className="inline w-5 h-5 mr-2 text-indigo-600" />
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={bookingData.endDate}
                      onChange={handleInputChange}
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-4 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      required
                    />
                  </div>
                </div>

                {/* Participants and Tour Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      <Users className="inline w-5 h-5 mr-2 text-indigo-600" />
                      Number of Participants
                    </label>
                    <input
                      type="number"
                      name="participants"
                      value={bookingData.participants}
                      onChange={handleInputChange}
                      min="1"
                      max={guide.maxCapacity}
                      className="w-full px-4 py-4 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-2 font-medium">
                      Max: {guide.maxCapacity} participants
                    </p>
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      Tour Type
                    </label>
                    <select
                      name="tourType"
                      value={bookingData.tourType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      required
                    >
                      {tourTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Meeting Point */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    <MapPin className="inline w-5 h-5 mr-2 text-indigo-600" />
                    Meeting Point
                  </label>
                  <input
                    type="text"
                    name="meetingPoint"
                    value={bookingData.meetingPoint}
                    onChange={handleInputChange}
                    placeholder="e.g., Hotel lobby, Airport, City center"
                    className="w-full px-4 py-4 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                  />
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Any special requirements or requests..."
                    className="w-full px-4 py-4 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={bookingData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-2xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Creating Booking...
                    </div>
                  ) : (
                    'Book Guide'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Guide Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8 sticky top-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Sparkles className="w-6 h-6 mr-3 text-indigo-600" />
                Guide Summary
              </h3>
              
              {/* Guide Image */}
              {guide.images && guide.images[0] && (
                <img
                  src={guide.images[0].url}
                  alt={guide.name}
                  className="w-full h-64 object-cover rounded-2xl mb-6 shadow-lg"
                />
              )}

              {/* Guide Details */}
              <div className="space-y-4 mb-8">
                <h4 className="text-2xl font-bold text-gray-900">{guide.name}</h4>
                <div className="flex items-center text-gray-600 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50">
                  <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="font-medium">{guide.location}</span>
                </div>
                <div className="flex items-center text-gray-600 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                  <Users className="w-5 h-5 mr-3 text-green-600" />
                  <span className="font-medium">Max {guide.maxCapacity} participants</span>
                </div>
                <div className="flex items-center text-gray-600 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/50">
                  <Star className="w-5 h-5 mr-3 text-yellow-500" />
                  <span className="font-medium">{guide.rating?.average || 'N/A'} ({guide.rating?.count || 0} reviews)</span>
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-t border-indigo-200/50 pt-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Price Summary</h4>
                <div className="space-y-3 text-lg">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50">
                    <span className="font-medium text-gray-700">Daily Rate:</span>
                    <span className="font-bold text-indigo-600">{formatPrice(guide.dailyRate, guide.currency)}</span>
                  </div>
                  {duration > 0 && (
                    <>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
                        <span className="font-medium text-gray-700">Duration:</span>
                        <span className="font-bold text-purple-600">{duration} day{duration > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl border border-pink-200/50">
                        <span className="font-medium text-gray-700">Participants:</span>
                        <span className="font-bold text-pink-600">{bookingData.participants}</span>
                      </div>
                      <div className="border-t border-indigo-200/50 pt-4">
                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl border border-indigo-200/50">
                          <span className="text-xl font-bold text-gray-800">Total:</span>
                          <span className="text-2xl font-bold text-indigo-600">{formatPrice(totalPrice, guide.currency)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Specialties */}
              {guide.specialties && guide.specialties.length > 0 && (
                <div className="border-t border-indigo-200/50 pt-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {guide.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm rounded-2xl font-semibold border border-indigo-200"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && paymentBookingData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          bookingData={paymentBookingData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default GuideBookingPage;
