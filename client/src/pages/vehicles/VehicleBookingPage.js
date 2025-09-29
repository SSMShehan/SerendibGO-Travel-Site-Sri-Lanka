import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Shield, ArrowLeft, Calendar, Users, MessageSquare, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import vehicleService from '../../services/vehicleService';
import vehicleBookingService from '../../services/vehicleBookingService';
import { useAuth } from '../../contexts/AuthContext';
import PaymentModal from '../../components/payment/PaymentModal';

const VehicleBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: '',
    paymentMethod: 'credit_card'
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBookingData, setPaymentBookingData] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await vehicleService.getVehicleById(id);
        
        if (response.success) {
          setVehicle(response.vehicle);
          // Pre-fill dates if they were passed from the previous page
          if (location.state?.checkIn) {
            setBookingData(prev => ({ ...prev, checkIn: location.state.checkIn }));
          }
          if (location.state?.checkOut) {
            setBookingData(prev => ({ ...prev, checkOut: location.state.checkOut }));
          }
        } else {
          setError(response.message || 'Failed to load vehicle details');
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        setError('Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicle();
    }
  }, [id, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotalPrice = () => {
    if (!vehicle || !bookingData.checkIn || !bookingData.checkOut) return 0;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return days * (vehicle.pricing?.daily || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to book a vehicle');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const now = new Date();

    if (checkIn <= now) {
      toast.error('Check-in date must be in the future');
      return;
    }

    if (checkOut <= checkIn) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    setSubmitting(true);

    try {
      // Create the actual vehicle booking
      const bookingResponse = await vehicleBookingService.createVehicleBooking({
        vehicleId: id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        specialRequests: bookingData.specialRequests,
        paymentMethod: bookingData.paymentMethod
      });

      if (bookingResponse.success) {
        console.log('Vehicle booking created successfully:', bookingResponse.data);
        console.log('Total price for payment:', totalPrice);
        
        // Set booking data for payment modal
        setPaymentBookingData({
          bookingId: bookingResponse.data._id,
          bookingType: 'vehicle',
          amount: totalPrice,
          totalAmount: totalPrice,
          currency: 'LKR',
          vehicle: vehicle,
          booking: bookingResponse.data
        });
        
        // Show payment modal
        setShowPaymentModal(true);
      } else {
        toast.error(bookingResponse.message || 'Failed to create vehicle booking');
      }
    } catch (err) {
      console.error('Error booking vehicle:', err);
      toast.error('Failed to book vehicle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    toast.success('Payment completed successfully!');
    navigate(`/payment/success/${paymentData.bookingId}`);
  };

  const formatPrice = (price, currency = 'LKR') => {
    if (!price) return `${currency} 0`;
    return `${currency} ${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Vehicle Details</h2>
            <p className="text-lg text-gray-600">Please wait while we prepare your booking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Vehicle Not Found</h2>
            <p className="text-lg text-gray-600 mb-8">{error || 'The vehicle you are looking for does not exist.'}</p>
            <button 
              onClick={() => navigate('/vehicles')} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
            >
              Back to Vehicles
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const days = totalPrice > 0 ? Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/vehicles/${id}`)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vehicle Details
          </button>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Book This Vehicle</h1>
            <p className="text-lg text-gray-600">Complete your vehicle rental booking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vehicle Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-200/50 overflow-hidden">
              {vehicle.images && vehicle.images[0] && (
                <img
                  src={vehicle.images[0].url}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50">
                    <span className="font-medium">{vehicle.year} • {vehicle.capacity} passengers</span>
                  </div>
                  <div className="flex items-center text-gray-600 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                    <MapPin className="w-5 h-5 mr-3 text-green-600" />
                    <span className="font-medium">{vehicle.location?.city || 'Location not specified'}</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
                    <span className="text-gray-700 font-medium">Daily Rate</span>
                    <span className="font-bold text-purple-600">
                      {formatPrice(vehicle.pricing?.daily, vehicle.pricing?.currency)}
                    </span>
                  </div>
                  {vehicle.pricing?.weekly && (
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/50">
                      <span className="text-gray-700 font-medium">Weekly</span>
                      <span className="font-bold text-yellow-600">{formatPrice(vehicle.pricing.weekly, vehicle.pricing.currency)}</span>
                    </div>
                  )}
                  {vehicle.pricing?.monthly && (
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200/50">
                      <span className="text-gray-700 font-medium">Monthly</span>
                      <span className="font-bold text-indigo-600">{formatPrice(vehicle.pricing.monthly, vehicle.pricing.currency)}</span>
                    </div>
                  )}
                </div>

                {vehicle.insurance?.hasInsurance && (
                  <div className="flex items-center text-green-600 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                    <Shield className="w-5 h-5 mr-3" />
                    <span className="font-medium">Fully Insured</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-200/50 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <Calendar className="w-8 h-8 mr-3 text-blue-600" />
                Booking Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      value={bookingData.checkIn}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-4 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      value={bookingData.checkOut}
                      onChange={handleInputChange}
                      min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-4 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      required
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Number of Passengers
                  </label>
                  <select
                    name="guests"
                    value={bookingData.guests}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                  >
                    {[...Array(vehicle.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'passenger' : 'passengers'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Any special requests or requirements..."
                    className="w-full px-4 py-4 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={bookingData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                {/* Price Summary */}
                {totalPrice > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200/50">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Price Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
                        <span className="font-medium text-gray-700">Daily Rate</span>
                        <span className="font-bold text-purple-600">{formatPrice(vehicle.pricing?.daily, vehicle.pricing?.currency)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/50">
                        <span className="font-medium text-gray-700">Duration</span>
                        <span className="font-bold text-yellow-600">{days} day{days > 1 ? 's' : ''}</span>
                      </div>
                      <div className="border-t border-blue-200/50 pt-4">
                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl border border-blue-200/50">
                          <span className="text-xl font-bold text-gray-800">Total</span>
                          <span className="text-2xl font-bold text-blue-600">{formatPrice(totalPrice, vehicle.pricing?.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !bookingData.checkIn || !bookingData.checkOut}
                  className={`w-full py-4 px-8 rounded-2xl font-bold text-white transition-all duration-300 transform ${
                    submitting || !bookingData.checkIn || !bookingData.checkOut
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 focus:ring-2 focus:ring-blue-500 shadow-lg'
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Processing...
                    </div>
                  ) : (
                    'Book Now'
                  )}
                </button>

                {!isAuthenticated && (
                  <p className="text-center text-lg text-gray-600 font-medium">
                    Please <button
                      type="button"
                      onClick={() => navigate('/login', { state: { from: location } })}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-bold"
                    >
                      log in
                    </button> to make a booking
                  </p>
                )}
              </form>
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

export default VehicleBookingPage;
