import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Mail, Calendar, MapPin, Users, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateItineraryPDF, formatCurrency } from '../../utils/pdfUtils';
import { generateSimpleItineraryPDF } from '../../utils/simplePdfUtils';
import apiService from '../../services/apiService';

const PaymentSuccessPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [tripRequestData, setTripRequestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      
      // Try different booking types in order of priority
      const bookingTypes = ['tour', 'trip-request', 'vehicle', 'guide', 'hotel'];
      
      for (const type of bookingTypes) {
        try {
          console.log(`Trying to fetch booking details for type: ${type}`);
          const response = await apiService.get(`/api/bookings/${bookingId}/details?type=${type}`);
          if (response.success) {
            console.log(`Successfully fetched booking details for type: ${type}`, response.data);
            setBookingDetails(response.data.booking);
            
            // If it's a trip-request, also set trip request data
            if (type === 'trip-request' && response.data.tripRequest) {
              setTripRequestData(response.data.tripRequest);
            }
            break;
          }
        } catch (error) {
          console.log(`Failed to fetch booking details for type: ${type}`, error.message);
          // Continue to next type
          continue;
        }
      }
      
      // If no booking found, try to get payment details to determine booking type
      if (!bookingDetails) {
        try {
          console.log('No booking found, trying to fetch payment details...');
          const paymentResponse = await apiService.get(`/api/payments/history`);
          if (paymentResponse.success && paymentResponse.data.payments) {
            const recentPayment = paymentResponse.data.payments.find(p => 
              p.bookingId === bookingId || p._id === bookingId
            );
            
            if (recentPayment) {
              console.log('Found payment details:', recentPayment);
              // Create fallback booking details based on payment data
              const fallbackDetails = {
                id: bookingId,
                type: recentPayment.bookingType || 'guide',
                title: recentPayment.metadata?.tourTitle || 'Booking Confirmation',
                totalAmount: recentPayment.amount || 0,
                amount: recentPayment.amount || 0,
                currency: recentPayment.currency || 'LKR',
                paymentId: recentPayment._id,
                paymentStatus: recentPayment.status,
                date: new Date().toISOString().split('T')[0],
                guests: 1,
                duration: '1 day',
                location: 'Sri Lanka',
                confirmationNumber: `CONF-${Date.now().toString().slice(-8)}`
              };
              setBookingDetails(fallbackDetails);
            }
          }
        } catch (paymentError) {
          console.log('Failed to fetch payment details:', paymentError.message);
        }
        
        // Final fallback - generic booking confirmation
        if (!bookingDetails) {
          setBookingDetails({
            id: bookingId,
            type: 'booking',
            title: 'Booking Confirmation',
            amount: 0,
            currency: 'LKR',
            date: new Date().toISOString().split('T')[0],
            guests: 1,
            duration: '1 day',
            location: 'Sri Lanka',
            confirmationNumber: `CONF-${Date.now().toString().slice(-8)}`,
            paymentId: `PAY-${Date.now().toString().slice(-8)}`
          });
        }
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details');
      
      // Use generic fallback data
      setBookingDetails({
        id: bookingId,
        type: 'booking',
        title: 'Booking Confirmation',
        amount: 0,
        currency: 'LKR',
        date: new Date().toISOString().split('T')[0],
        guests: 1,
        duration: '1 day',
        location: 'Sri Lanka',
        confirmationNumber: `CONF-${Date.now().toString().slice(-8)}`,
        paymentId: `PAY-${Date.now().toString().slice(-8)}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadItinerary = async () => {
    if (!bookingDetails) {
      toast.error('Booking details not available');
      return;
    }
    
    try {
      setIsDownloading(true);
      
      console.log('Starting PDF generation...');
      console.log('Booking details:', bookingDetails);
      console.log('Trip request data:', tripRequestData);
      console.log('Booking type detected:', bookingDetails.guide ? 'guide' : bookingDetails.vehicle ? 'vehicle' : bookingDetails.hotel ? 'hotel' : 'tour');
      
      // Generate filename
      const tripTitle = tripRequestData?.title || bookingDetails.title || 'Trip';
      const sanitizedTitle = tripTitle.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `itinerary_${sanitizedTitle}_${bookingId}.pdf`;
      
      console.log('Generated filename:', filename);
      
      // Generate and download PDF
      try {
        await generateItineraryPDF(bookingDetails, tripRequestData, filename);
      } catch (error) {
        console.log('Complex PDF failed, trying simple PDF:', error.message);
        await generateSimpleItineraryPDF(bookingDetails, tripRequestData, filename);
      }
      
      console.log('PDF generation completed successfully');
      toast.success('Itinerary downloaded successfully!');
    } catch (error) {
      console.error('Error downloading itinerary:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        bookingDetails,
        tripRequestData
      });
      toast.error(`Failed to download itinerary: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const sendEmailConfirmation = async () => {
    if (!bookingDetails) {
      toast.error('Booking details not available');
      return;
    }
    
    try {
      setIsSendingEmail(true);
      
      console.log('Sending confirmation email for booking:', bookingId);
      console.log('Booking details:', bookingDetails);
      console.log('Trip request data:', tripRequestData);
      console.log('Booking type detected:', bookingDetails.guide ? 'guide' : bookingDetails.vehicle ? 'vehicle' : bookingDetails.hotel ? 'hotel' : 'tour');
      
      const response = await apiService.post(`/api/bookings/${bookingId}/send-confirmation`);
      
      if (response.success) {
        toast.success('Confirmation email sent successfully!');
        console.log('Email sent with message ID:', response.messageId);
      } else {
        toast.error(response.message || 'Failed to send confirmation email');
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      toast.error('Failed to send confirmation email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Your booking has been confirmed. Welcome to SerendibGo! 🎉
          </p>
        </div>

        {/* Confirmation Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Booking Confirmation</h2>
            <p className="text-gray-600">Confirmation #{bookingDetails.confirmationNumber || bookingDetails.id}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Travel Date</p>
                  <p className="font-medium text-gray-900">{bookingDetails.startDate ? new Date(bookingDetails.startDate).toLocaleDateString() : bookingDetails.date}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Number of Guests</p>
                  <p className="font-medium text-gray-900">{bookingDetails.participants || bookingDetails.guests} people</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{tripRequestData?.location || bookingDetails.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{tripRequestData?.duration || bookingDetails.duration}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {bookingDetails.type === 'guide' ? 'Guide Service Details' :
               bookingDetails.type === 'vehicle' ? 'Vehicle Rental Details' :
               bookingDetails.type === 'hotel' ? 'Hotel Booking Details' :
               bookingDetails.type === 'trip-request' ? 'Custom Trip Details' :
               'Tour Details'}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{tripRequestData?.title || bookingDetails.title}</h4>
              <p className="text-gray-600 text-sm">
                {tripRequestData?.description || 
                 bookingDetails.type === 'guide' ? 'Professional guide service for your Sri Lankan adventure.' :
                 bookingDetails.type === 'vehicle' ? 'Vehicle rental service for your travel needs.' :
                 bookingDetails.type === 'hotel' ? 'Accommodation booking for your stay in Sri Lanka.' :
                 bookingDetails.type === 'trip-request' ? 'Custom trip designed specifically for you.' :
                 'Experience the beauty of Sri Lanka with our carefully curated travel experiences.'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID</span>
              <span className="font-medium text-gray-900">{bookingDetails.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(bookingDetails.totalAmount || bookingDetails.amount, bookingDetails.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium text-gray-900">Credit Card</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status</span>
              <span className="font-medium text-green-600">Completed</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">What's Next?</h3>
          <div className="space-y-3 text-sm text-blue-800">
            {bookingDetails.type === 'guide' ? (
              <>
                <p>• You will receive guide contact details via email within 24 hours</p>
                <p>• Your guide will contact you 48 hours before your service for final arrangements</p>
                <p>• Please arrive at the agreed meeting point 15 minutes early</p>
                <p>• Don't forget to bring comfortable walking shoes and water</p>
              </>
            ) : bookingDetails.type === 'vehicle' ? (
              <>
                <p>• You will receive vehicle pickup details via email within 24 hours</p>
                <p>• Our team will contact you 48 hours before pickup for final arrangements</p>
                <p>• Please bring a valid driving license and ID for vehicle collection</p>
                <p>• Check the vehicle condition before departure</p>
              </>
            ) : bookingDetails.type === 'hotel' ? (
              <>
                <p>• You will receive hotel confirmation details via email within 24 hours</p>
                <p>• Our team will contact you 48 hours before check-in for final arrangements</p>
                <p>• Please arrive at the hotel during check-in hours</p>
                <p>• Don't forget to bring valid ID for hotel registration</p>
              </>
            ) : bookingDetails.type === 'trip-request' ? (
              <>
                <p>• You will receive a detailed custom itinerary via email within 24 hours</p>
                <p>• Our team will contact you 48 hours before your trip for final arrangements</p>
                <p>• Please arrive 15 minutes before the scheduled start time</p>
                <p>• Don't forget to bring comfortable clothing and sunscreen</p>
              </>
            ) : (
              <>
                <p>• You will receive a detailed itinerary via email within 24 hours</p>
                <p>• Our team will contact you 48 hours before your tour for final arrangements</p>
                <p>• Please arrive 15 minutes before the scheduled start time</p>
                <p>• Don't forget to bring comfortable clothing and sunscreen</p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={downloadItinerary}
            disabled={isDownloading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download Itinerary</span>
              </>
            )}
          </button>
          
          <button
            onClick={sendEmailConfirmation}
            disabled={isSendingEmail}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {isSendingEmail ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Sending Email...</span>
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                <span>Send Email Confirmation</span>
              </>
            )}
          </button>
          
          <Link
            to="/bookings"
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>View My Bookings</span>
          </Link>
        </div>

        {/* Support Information */}
        <div className="text-center mt-8 p-6 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 text-sm mb-3">
            Our customer support team is available 24/7 to assist you
          </p>
          <div className="space-y-1 text-sm text-gray-600">
            <p>📧 support@serendibgo.lk</p>
            <p>📞 +94 11 234 5678</p>
            <p>💬 Use our AI chatbot for instant assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
