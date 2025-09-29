import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Star, MapPin, Calendar, Users, Shield, Sparkles, CheckCircle } from 'lucide-react';
import BookingForm from '../../components/booking/BookingForm';
import hotelService from '../../services/hotelService';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotelAndRoom = async () => {
      try {
        setLoading(true);
        
        // Extract hotelId and roomId from the URL parameter
        // Expected format: /booking/hotelId:roomId
        const [hotelId, roomId] = id.split(':');
        
        if (!hotelId || !roomId) {
          throw new Error('Invalid booking URL. Please select a room from the hotel page.');
        }

        // Fetch hotel data (which includes embedded rooms)
        const hotelResponse = await hotelService.getHotelById(hotelId);

        if (hotelResponse.success) {
          const hotelData = hotelResponse.data.hotel;
          setHotel(hotelData);
          
          // Find the specific room within the hotel's rooms array
          const selectedRoom = hotelData.rooms?.find(r => r._id === roomId);
          
          if (selectedRoom) {
            setRoom(selectedRoom);
          } else {
            throw new Error('Room not found in this hotel');
          }
        } else {
          throw new Error('Failed to load hotel information');
        }
      } catch (error) {
        console.error('Error fetching hotel/room:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHotelAndRoom();
    }
  }, [id]);

  const handleBookingSuccess = (booking) => {
    toast.success('Booking created successfully!');
    // Navigate to payment page or booking confirmation
    navigate(`/payment/${booking._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Your Booking</h2>
            <p className="text-lg text-gray-600">Please wait while we prepare your booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Booking Error</h2>
            <p className="text-lg text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => navigate('/hotels')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
            >
              Browse Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Hotel or Room Not Found</h2>
            <p className="text-lg text-gray-600 mb-8">The requested hotel or room could not be found.</p>
            <button
              onClick={() => navigate('/hotels')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
            >
              Browse Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/hotels')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hotels
          </button>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Book Your Stay
            </h1>
            <p className="text-lg text-gray-600">Complete your booking for {hotel.name}</p>
          </div>
        </div>

        {/* Hotel Information */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-200/50 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            {hotel.images && hotel.images[0] && (
              <img
                src={hotel.images[0].url}
                alt={hotel.name}
                className="w-32 h-32 object-cover rounded-2xl shadow-lg"
              />
            )}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h2>
              <div className="flex items-center justify-center md:justify-start text-gray-600 mb-3">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">{hotel.location}</span>
              </div>
              {hotel.starRating && (
                <div className="flex items-center justify-center md:justify-start">
                  <div className="flex items-center">
                    {[...Array(hotel.starRating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 font-medium">{hotel.starRating} stars</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BookingForm
              hotel={hotel}
              room={room}
              onBookingSuccess={handleBookingSuccess}
            />
          </div>
          
          {/* Room Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-200/50 p-8 sticky top-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Sparkles className="w-6 h-6 mr-3 text-blue-600" />
                Room Details
              </h3>
              
              {room.images && room.images[0] && (
                <img
                  src={room.images[0].url}
                  alt={room.name}
                  className="w-full h-64 object-cover rounded-2xl mb-6 shadow-lg"
                />
              )}
              
              <h4 className="text-2xl font-bold text-gray-900 mb-3">{room.name}</h4>
              <p className="text-gray-600 mb-4 font-medium">{room.description}</p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50">
                  <span className="text-gray-700 font-medium">Room Type:</span>
                  <span className="font-bold text-blue-600">{room.type}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                  <span className="text-gray-700 font-medium">Capacity:</span>
                  <span className="font-bold text-green-600">{room.capacity} guests</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
                  <span className="text-gray-700 font-medium">Price per night:</span>
                  <span className="font-bold text-purple-600">
                    {room.currency} {room.price?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/50">
                  <span className="text-gray-700 font-medium">Available:</span>
                  <span className="font-bold text-yellow-600">
                    {room.availableRooms} of {room.totalRooms}
                  </span>
                </div>
              </div>

              {room.amenities && room.amenities.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-lg font-bold text-gray-900 mb-3">Amenities</h5>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm rounded-2xl font-semibold border border-indigo-200"
                      >
                        {amenity.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Availability Status */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-gray-700">Status:</span>
                  <div className="flex items-center">
                    {room.isAvailable && room.availableRooms > 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <Shield className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className={`text-lg font-bold ${
                      room.isAvailable && room.availableRooms > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {room.isAvailable && room.availableRooms > 0 ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
                {room.occupancyRate !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span className="font-medium">Occupancy Rate</span>
                      <span className="font-bold">{room.occupancyRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${room.occupancyRate}%` }}
                      ></div>
                    </div>
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

export default BookingPage;
