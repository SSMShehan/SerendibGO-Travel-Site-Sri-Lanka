import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import PaymentModal from '../../components/payment/PaymentModal';
import tripRequestService from '../../services/tripRequestService';

const TripRequestPaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [tripRequest, setTripRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING BOOKING DETAILS ===');
      console.log('Booking ID:', bookingId);
      
      // Fetch booking details from trip request service
      const bookingResponse = await tripRequestService.getBookingDetails(bookingId);
      console.log('=== BOOKING RESPONSE DEBUG ===');
      console.log('Full response:', bookingResponse);
      console.log('Response success:', bookingResponse.success);
      console.log('Response data:', bookingResponse.data);
      console.log('Response message:', bookingResponse.message);
      console.log('=== END BOOKING RESPONSE DEBUG ===');
      
      if (bookingResponse.success) {
        setBookingDetails(bookingResponse.data.booking);
        
        // Fetch trip request details
        if (bookingResponse.data.tripRequest) {
          setTripRequest(bookingResponse.data.tripRequest);
        }
      } else {
        console.error('Booking response failed:', bookingResponse.message);
        
        // Check if this might be a trip request ID instead of a booking ID
        console.log('Checking if ID is a trip request ID...');
        try {
          const tripRequestResponse = await tripRequestService.getTripRequestById(bookingId);
          if (tripRequestResponse.success && tripRequestResponse.data.tripRequest.status === 'approved') {
            console.log('Found trip request, creating booking...');
            const createBookingResponse = await tripRequestService.createBookingFromTripRequest(bookingId);
            if (createBookingResponse.success) {
              console.log('Booking created successfully, redirecting...');
              navigate(`/payment/trip-request/${createBookingResponse.data.booking._id}`);
              return;
            }
          }
        } catch (tripError) {
          console.log('Not a trip request ID or error:', tripError.message);
        }
        
        toast.error(bookingResponse.message || 'Failed to load booking details');
        navigate('/bookings');
      }
    } catch (error) {
      console.error('=== ERROR LOADING BOOKING DETAILS ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('=== END ERROR DEBUG ===');
      
      // Check if this might be a trip request ID instead of a booking ID
      console.log('Checking if ID is a trip request ID in catch block...');
      try {
        const tripRequestResponse = await tripRequestService.getTripRequestById(bookingId);
        if (tripRequestResponse.success && tripRequestResponse.data.tripRequest.status === 'approved') {
          console.log('Found trip request, creating booking...');
          const createBookingResponse = await tripRequestService.createBookingFromTripRequest(bookingId);
          if (createBookingResponse.success) {
            console.log('Booking created successfully, redirecting...');
            navigate(`/payment/trip-request/${createBookingResponse.data.booking._id}`);
            return;
          }
        }
      } catch (tripError) {
        console.log('Not a trip request ID or error:', tripError.message);
      }
      
      toast.error(error.response?.data?.message || error.message || 'Failed to load booking details');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    toast.success('Payment completed successfully!');
    navigate(`/payment/success/${bookingId}`);
  };

  const handlePayNow = () => {
    if (!bookingDetails) {
      toast.error('Booking details not loaded');
      return;
    }
    setShowPaymentModal(true);
  };


  const formatCurrency = (amount, currency = 'LKR') => {
    // Handle undefined, null, or NaN values
    if (amount === undefined || amount === null || isNaN(amount)) {
      return `${currency} 0`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'LKR' ? 'LKR' : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Bookings
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Trip Payment</h1>
          <p className="text-gray-600">Secure payment for your custom trip booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Complete Your Trip Payment</h2>
                <p className="text-gray-600 mb-6">
                  Your custom trip has been approved and is ready for payment. Click the button below to proceed with secure Stripe payment.
                </p>
                
                <button
                  onClick={handlePayNow}
                  className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center space-x-2 mx-auto"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Pay {formatCurrency(bookingDetails.totalAmount, bookingDetails.currency)}</span>
                </button>
                  </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">🗺️</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{tripRequest?.title || 'Custom Trip'}</h4>
                    <p className="text-sm text-gray-600">
                      {tripRequest?.startDate && tripRequest?.endDate && (
                        <>
                          {new Date(tripRequest.startDate).toLocaleDateString()} - {new Date(tripRequest.endDate).toLocaleDateString()}
                        </>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {tripRequest?.totalTravelers} travelers
                    </p>
                  </div>
                </div>

                {tripRequest?.destinations && tripRequest.destinations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Destinations:</p>
                    <div className="space-y-1">
                      {tripRequest.destinations.map((destination, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>{destination.name} ({destination.duration} days)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trip Cost</span>
                    <span className="text-gray-900">{formatCurrency(bookingDetails.totalAmount, bookingDetails.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="text-gray-900">{formatCurrency(0, bookingDetails.currency)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-blue-600">{formatCurrency(bookingDetails.totalAmount, bookingDetails.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-green-600 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Stripe Secure Payment</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-600 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>PCI DSS Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingData={{
          bookingId: bookingId,
          bookingType: 'trip-request',
          totalAmount: bookingDetails?.totalAmount,
          currency: bookingDetails?.currency || 'LKR',
          tourTitle: tripRequest?.title || 'Custom Trip',
          participants: bookingDetails?.participants,
          startDate: bookingDetails?.startDate,
          customerName: tripRequest?.contactInfo?.name || 'Customer',
          customerEmail: tripRequest?.contactInfo?.email || 'customer@example.com'
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default TripRequestPaymentPage;
