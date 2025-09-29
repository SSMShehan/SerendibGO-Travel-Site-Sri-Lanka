import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Calendar, Users, CreditCard, MessageSquare, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import bookingService from '../../services/bookingService';
import PaymentModal from '../payment/PaymentModal';

const BookingForm = ({ hotel, room, onBookingSuccess }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: {
      adults: 1,
      children: 0,
      infants: 0
    },
    specialRequests: '',
    paymentMethod: 'credit_card'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availability, setAvailability] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  // Calculate total amount when dates or guests change
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && room) {
      const total = bookingService.calculateTotalAmount(
        room.price,
        formData.checkIn,
        formData.checkOut,
        formData.guests
      );
      setTotalAmount(total);
    }
  }, [formData.checkIn, formData.checkOut, formData.guests, room]);

  const checkRoomAvailability = useCallback(async () => {
    try {
      const response = await bookingService.checkAvailability({
        hotelId: hotel._id,
        roomId: room._id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests.adults + formData.guests.children + formData.guests.infants
      });

      if (response.success) {
        setAvailability(response.data);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  }, [formData.checkIn, formData.checkOut, hotel, room, formData.guests]);

  // Check availability when dates change
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && hotel && room) {
      checkRoomAvailability();
    }
  }, [formData.checkIn, formData.checkOut, hotel, room, checkRoomAvailability]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError(name);
  };

  const handleGuestChange = (type, value) => {
    const newValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      guests: {
        ...prev.guests,
        [type]: newValue
      }
    }));
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!formData.checkOut) newErrors.checkOut = 'Check-out date is required';
    if (formData.guests.adults < 1) newErrors.adults = 'At least 1 adult is required';

    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const now = new Date();

      if (checkIn <= now) {
        newErrors.checkIn = 'Check-in date must be in the future';
      }

      if (checkOut <= checkIn) {
        newErrors.checkOut = 'Check-out date must be after check-in date';
      }
    }

    if (formData.guests.adults + formData.guests.children + formData.guests.infants > room.capacity) {
      newErrors.guests = `Maximum ${room.capacity} guests allowed for this room`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to make a booking');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (availability && !availability.isAvailable) {
      toast.error('Room is not available for the selected dates');
      return;
    }

    setLoading(true);

    try {
      const bookingRequestData = {
        hotelId: hotel._id,
        roomId: room._id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        specialRequests: formData.specialRequests,
        paymentMethod: formData.paymentMethod
      };

      const response = await bookingService.createBooking(bookingRequestData);

      if (response.success) {
        // Set booking data for payment modal
        setBookingData({
          bookingId: response.data.booking._id,
          bookingType: 'hotel',
          amount: totalAmount,
          totalAmount: totalAmount,
          currency: 'LKR',
          hotel: hotel,
          room: room,
          booking: response.data.booking
        });
        
        // Show payment modal
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    toast.success('Payment completed successfully!');
    if (onBookingSuccess) {
      onBookingSuccess(bookingData.booking);
    }
    // Reset form
    setFormData({
      checkIn: '',
      checkOut: '',
      guests: { adults: 1, children: 0, infants: 0 },
      specialRequests: '',
      paymentMethod: 'credit_card'
    });
    setShowPaymentModal(false);
    setBookingData(null);
  };

  const getMinCheckOutDate = () => {
    if (!formData.checkIn) return '';
    const checkIn = new Date(formData.checkIn);
    const nextDay = new Date(checkIn);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  };

  const getMinCheckInDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!room) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-200/50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-lg text-gray-600 font-medium">Please select a room to make a booking</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-200/50 p-8">
      <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
        <Sparkles className="w-8 h-8 mr-3 text-blue-600" />
        Book This Room
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Room Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
          <h4 className="text-xl font-bold text-gray-900 mb-3">{room.name}</h4>
          <p className="text-gray-600 mb-3 font-medium">
            Capacity: {room.capacity} guests • {room.type} room
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {room.currency} {room.price.toLocaleString()} per night
          </p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="checkIn" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Check-in Date
            </label>
            <input
              type="date"
              id="checkIn"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleInputChange}
              min={getMinCheckInDate()}
              className={`w-full px-4 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm font-medium text-lg ${
                errors.checkIn ? 'border-red-500' : 'border-blue-200'
              }`}
            />
            {errors.checkIn && <p className="text-red-500 text-sm mt-2 font-medium">{errors.checkIn}</p>}
          </div>

          <div>
            <label htmlFor="checkOut" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Check-out Date
            </label>
            <input
              type="date"
              id="checkOut"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleInputChange}
              min={getMinCheckOutDate()}
              className={`w-full px-4 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm font-medium text-lg ${
                errors.checkOut ? 'border-red-500' : 'border-blue-200'
              }`}
            />
            {errors.checkOut && <p className="text-red-500 text-sm mt-2 font-medium">{errors.checkOut}</p>}
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Guests
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="adults" className="block text-sm font-medium text-gray-600 mb-2">Adults</label>
              <select
                id="adults"
                value={formData.guests.adults}
                onChange={(e) => handleGuestChange('adults', e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="children" className="block text-sm font-medium text-gray-600 mb-2">Children</label>
              <select
                id="children"
                value={formData.guests.children}
                onChange={(e) => handleGuestChange('children', e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm font-medium"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="infants" className="block text-sm font-medium text-gray-600 mb-2">Infants</label>
              <select
                id="infants"
                value={formData.guests.infants}
                onChange={(e) => handleGuestChange('infants', e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm font-medium"
              >
                {[0, 1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
          {errors.guests && <p className="text-red-500 text-sm mt-2 font-medium">{errors.guests}</p>}
        </div>

        {/* Special Requests */}
        <div>
          <label htmlFor="specialRequests" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleInputChange}
            rows={4}
            placeholder="Any special requests or requirements..."
            className="w-full px-4 py-4 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm font-medium text-lg"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="paymentMethod" className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            className="w-full px-4 py-4 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm font-medium text-lg"
          >
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        {/* Availability Status */}
        {availability && (
          <div className={`p-4 rounded-2xl border ${
            availability.isAvailable 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
          }`}>
            <div className="flex items-center">
              {availability.isAvailable ? (
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              )}
              <p className={`text-lg font-medium ${
                availability.isAvailable ? 'text-green-800' : 'text-red-800'
              }`}>
                {availability.isAvailable 
                  ? `✅ Available for ${availability.nights} nights` 
                  : '❌ Not available for selected dates'
                }
              </p>
            </div>
          </div>
        )}

        {/* Total Amount */}
        {totalAmount > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xl font-bold text-gray-900">Total Amount:</span>
              <span className="text-3xl font-bold text-blue-600">
                {room.currency} {totalAmount.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {formData.checkIn && formData.checkOut && (
                `${availability?.nights || 0} nights × ${room.currency} ${room.price.toLocaleString()}`
              )}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !availability?.isAvailable}
          className={`w-full py-4 px-8 rounded-2xl font-bold text-white transition-all duration-300 transform ${
            loading || !availability?.isAvailable
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 focus:ring-2 focus:ring-blue-500 shadow-lg'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Creating Booking...
            </div>
          ) : (
            'Book Now'
          )}
        </button>

        {!isAuthenticated && (
          <p className="text-center text-lg text-gray-600 font-medium">
            Please <button 
              type="button" 
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 hover:underline font-bold"
            >
              log in
            </button> to make a booking
          </p>
        )}
      </form>

      {/* Payment Modal */}
      {showPaymentModal && bookingData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          bookingData={bookingData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default BookingForm;
