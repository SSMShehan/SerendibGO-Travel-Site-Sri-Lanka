import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Play, Star, MapPin, Clock, Users, Shield, Award } from 'lucide-react';
import tourService from '../services/tourService';
import vehicleService from '../services/vehicleService';

const HomePage = () => {
  const [tours, setTours] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(true); // Start as true to show video immediately
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // Sample data as fallback
  const sampleTours = [
    {
      _id: 'sample-1',
      title: 'Cultural Triangle Tour',
      description: 'Explore the ancient cities of Anuradhapura, Polonnaruwa, and Sigiriya',
      price: 25000,
      currency: 'LKR',
      duration: 3,
      category: 'cultural',
      location: 'Cultural Triangle',
      rating: { average: 4.8, count: 156 },
      images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500' }]
    },
    {
      _id: 'sample-2',
      title: 'Hill Country Adventure',
      description: 'Discover the beautiful tea plantations and cool climate of Nuwara Eliya',
      price: 18000,
      currency: 'LKR',
      duration: 2,
      category: 'nature',
      location: 'Nuwara Eliya',
      rating: { average: 4.6, count: 89 },
      images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500' }]
    },
    {
      _id: 'sample-3',
      title: 'Beach Paradise',
      description: 'Relax on pristine beaches and enjoy water sports in Mirissa',
      price: 12000,
      currency: 'LKR',
      duration: 1,
      category: 'beach',
      location: 'Mirissa',
      rating: { average: 4.9, count: 203 },
      images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500' }]
    }
  ];

  const sampleVehicles = [
    {
      _id: 'sample-v1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      capacity: 4,
      type: 'sedan',
      pricing: { daily: 8000 },
      status: 'active',
      location: { city: 'Colombo' },
      rating: { average: 4.7, count: 45 },
      description: 'Comfortable sedan perfect for city tours'
    },
    {
      _id: 'sample-v2',
      brand: 'Nissan',
      model: 'Sunny',
      year: 2021,
      capacity: 5,
      type: 'sedan',
      pricing: { daily: 7500 },
      status: 'active',
      location: { city: 'Kandy' },
      rating: { average: 4.5, count: 32 },
      description: 'Reliable vehicle for family trips'
    }
  ];

  // Ensure video plays immediately
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Video autoplay prevented:', error);
        // Video will still show, just won't autoplay in some browsers
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch tours and vehicles in parallel with timeout
        const fetchWithTimeout = (promise, timeout = 5000) => {
          return Promise.race([
            promise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ]);
        };

        const [toursResponse, vehiclesResponse] = await Promise.allSettled([
          fetchWithTimeout(tourService.getTours({ limit: 6 })),
          fetchWithTimeout(vehicleService.getVehicles({ limit: 6 }))
        ]);

        // Handle tours response
        if (toursResponse.status === 'fulfilled' && toursResponse.value?.success) {
          setTours(toursResponse.value.data?.tours || toursResponse.value.tours || []);
        } else if (toursResponse.status === 'rejected') {
          console.warn('Tours fetch failed:', toursResponse.reason);
          setTours(sampleTours); // Use sample data as fallback
          setUsingSampleData(true);
        }

        // Handle vehicles response
        if (vehiclesResponse.status === 'fulfilled' && vehiclesResponse.value?.success) {
          setVehicles(vehiclesResponse.value.data?.vehicles || vehiclesResponse.value.vehicles || []);
        } else if (vehiclesResponse.status === 'rejected') {
          console.warn('Vehicles fetch failed:', vehiclesResponse.reason);
          setVehicles(sampleVehicles); // Use sample data as fallback
          setUsingSampleData(true);
        }

        // Only set error if both requests failed AND we have no sample data
        if (toursResponse.status === 'rejected' && vehiclesResponse.status === 'rejected') {
          console.log('Using sample data due to API connection issues');
          setUsingSampleData(true);
          // Don't set error, just use sample data
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        // Use sample data instead of showing error
        setTours(sampleTours);
        setVehicles(sampleVehicles);
        setUsingSampleData(true);
        console.log('Using sample data due to connection issues');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center text-gray-800 px-4 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <div className="text-4xl">⚠</div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Connection Issue</h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">{error}</p>
          
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-8 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Quick Fix:</h3>
            <div className="text-left text-gray-600 space-y-2">
              <p>1. Make sure the backend server is running on port 5001</p>
              <p>2. Check if MongoDB is connected</p>
              <p>3. Verify CORS settings allow localhost:3000</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => window.location.reload()} 
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              🔄 Try Again
            </button>
            <button 
              onClick={() => {
                setError(null);
                setTours([]);
                setVehicles([]);
                setLoading(false);
              }} 
              className="px-8 py-3 bg-white/80 backdrop-blur-sm text-gray-800 rounded-full hover:bg-white transition-all duration-300 transform hover:scale-105 border border-gray-200 font-semibold shadow-lg"
            >
              🏠 Continue Without Data
          </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Sample Data Notification */}
      {usingSampleData && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-500/90 backdrop-blur-sm text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          📡 Using sample data - Backend offline
        </div>
      )}
      
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-100"
          onError={(e) => {
            console.error('Video failed to load:', e);
            setVideoError(true);
            setVideoLoaded(false);
          }}
          onLoadStart={() => console.log('Video loading started')}
          onCanPlay={() => {
            console.log('Video can play');
            setVideoLoaded(true);
            setVideoError(false);
          }}
          onLoadedData={() => {
            console.log('Video data loaded');
            setVideoLoaded(true);
          }}
        >
          <source src="/videos/homepage-background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Fallback Background Image - Only show on actual video error */}
        <div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 z-0 transition-opacity duration-500 ${videoError ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className="absolute inset-0 bg-black bg-opacity-20 z-10"></div>
        
        {/* Gradient Overlay for Better Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 z-20"></div>
        
        {/* Hero Content */}
        <div className="relative z-30 text-center text-white px-6 md:px-8 lg:px-12 max-w-6xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
              SerendibGo
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-10 text-gray-100 max-w-4xl mx-auto leading-relaxed px-4">
              Discover the Pearl of the Indian Ocean. Your gateway to authentic Sri Lankan experiences, 
              from ancient temples to pristine beaches, lush mountains to vibrant cities.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-16 px-4">
              <Link 
                to="/tours" 
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl font-semibold text-lg"
              >
                <MapPin className="inline w-5 h-5 mr-2" />
                Explore Tours
              </Link>
              <Link 
                to="/plan-trip" 
                className="group px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-105 border border-white/30 font-semibold text-lg shadow-lg"
              >
                <Play className="inline w-5 h-5 mr-2" />
                Plan Your Journey
              </Link>
            </div>
            
            {/* Scroll Indicator */}
            <div className="animate-bounce">
              <ChevronDown className="w-8 h-8 mx-auto text-white/80" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Why Choose <span className="text-blue-600">SerendibGo</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience Sri Lanka like never before with our comprehensive travel platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Curated Tours</h3>
              <p className="text-gray-600">Handpicked experiences from local experts</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Safe & Secure</h3>
              <p className="text-gray-600">Verified guides and secure bookings</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Local Guides</h3>
              <p className="text-gray-600">Connect with authentic local experiences</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Premium Service</h3>
              <p className="text-gray-600">24/7 support and quality assurance</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Actions Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Start Your <span className="text-blue-600">Adventure</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for the perfect Sri Lankan getaway
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <Link to="/tours" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-sm border border-blue-200 rounded-2xl p-8 text-center hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <div className="text-4xl mb-4">🗺</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Explore Tours</h3>
                <p className="text-gray-600 text-sm">Discover amazing destinations</p>
              </div>
            </Link>
            
            <Link to="/hotels" className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm border border-green-200 rounded-2xl p-8 text-center hover:from-green-100 hover:to-emerald-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <div className="text-4xl mb-4">🏨</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Find Hotels</h3>
                <p className="text-gray-600 text-sm">Comfortable accommodations</p>
              </div>
            </Link>
            
            <Link to="/vehicles" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-sm border border-purple-200 rounded-2xl p-8 text-center hover:from-purple-100 hover:to-pink-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <div className="text-4xl mb-4">🚗</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Rent Vehicles</h3>
                <p className="text-gray-600 text-sm">Freedom to explore</p>
              </div>
            </Link>
            
            <Link to="/guides" className="group">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 backdrop-blur-sm border border-orange-200 rounded-2xl p-8 text-center hover:from-orange-100 hover:to-red-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <div className="text-4xl mb-4">👨‍💼</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Hire Guides</h3>
                <p className="text-gray-600 text-sm">Local expertise</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
          
          {/* Featured Tours Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Featured <span className="text-blue-600">Tours</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the best of Sri Lanka with our handpicked tour experiences
            </p>
          </div>
          
            {tours.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">No Tours Available</h3>
              <p className="text-gray-600 text-lg">Check back soon for amazing tour experiences!</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {tours.map((tour) => (
                <Link key={tour._id} to={`/tours/${tour._id}`} className="group">
                  <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={tour.images && tour.images[0] ? tour.images[0].url : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      
                      {/* Duration Badge */}
                      <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        <Clock className="inline w-4 h-4 mr-1" />
                        {tour.duration} day{tour.duration > 1 ? 's' : ''}
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {tour.category}
                      </div>
                    </div>
                    
                      <div className="p-6 md:p-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                          {tour.title}
                        </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                          {tour.description}
                        </p>
                      
                      <div className="flex justify-between items-center mb-4">
                          <span className="text-2xl font-bold text-blue-600">
                            {tour.currency} {tour.price?.toLocaleString()}
                          </span>
                          <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                            {tour.rating?.average?.toFixed(1) || 0.0} ({tour.rating?.count || 0})
                            </span>
                          </div>
                      </div>
                      
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {tour.location}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          
          {/* View All Tours Button */}
          {tours.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/tours"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl font-semibold text-lg"
              >
                <MapPin className="w-5 h-5 mr-2" />
                View All Tours
                <ChevronDown className="ml-2 w-5 h-5 rotate-[-90deg]" />
              </Link>
              </div>
            )}
          </div>
      </section>


          {/* Featured Vehicles Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Featured <span className="text-purple-600">Vehicles</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore Sri Lanka at your own pace with our premium vehicle rentals
            </p>
          </div>
          
            {vehicles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-4xl">🚗</div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">No Vehicles Available</h3>
              <p className="text-gray-600 text-lg">Check back soon for amazing vehicle options!</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {vehicles.map((vehicle) => {
                  const vehicleIcon = vehicleService.getVehicleTypeIcon(vehicle.type);
                  const vehicleTypeName = vehicleService.getVehicleTypeDisplayName(vehicle.type);
                  
                  return (
                  <Link key={vehicle._id} to={`/vehicles/${vehicle._id}`} className="group">
                    <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden hover:border-purple-300 transition-all duration-300 transform hover:scale-105 shadow-lg">
                      <div className="relative h-64 overflow-hidden">
                          {vehicle.images && vehicle.images[0] ? (
                            <img 
                              src={vehicle.images[0].url}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                              <div className="text-6xl">{vehicleIcon}</div>
                            </div>
                          )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                          
                          {/* Vehicle Type Badge */}
                        <div className="absolute top-4 left-4 bg-purple-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                            {vehicleIcon} {vehicleTypeName}
                          </div>
                          
                          {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                              vehicle.status === 'active' 
                              ? 'text-green-700 bg-green-100' 
                              : 'text-red-700 bg-red-100'
                            }`}>
                              {vehicle.status === 'active' ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6 md:p-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                        <p className="text-gray-600 mb-3 text-sm">
                            {vehicle.year} • {vehicle.capacity} passenger{vehicle.capacity > 1 ? 's' : ''}
                          </p>
                          
                          {vehicle.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                              {vehicle.description}
                            </p>
                          )}
                          
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold text-purple-600">
                              LKR {vehicle.pricing?.daily?.toLocaleString() || 0}
                            </span>
                            <span className="text-sm text-gray-500">per day</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            {vehicle.location?.city || 'Location'}
                          </div>
                            <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">
                                {vehicle.rating?.average?.toFixed(1) || 0.0} ({vehicle.rating?.count || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* View All Vehicles Button */}
          {vehicles.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/vehicles"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-2xl font-semibold text-lg"
              >
                <div className="text-xl mr-2">🚗</div>
                View All Vehicles
                <ChevronDown className="ml-2 w-5 h-5 rotate-[-90deg]" />
              </Link>
            </div>
          )}
          </div>
      </section>

      
      {/* Footer CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-6 md:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Ready to Explore <span className="text-blue-600">Sri Lanka</span>?
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Join thousands of travelers who have discovered the magic of Sri Lanka with SerendibGo. 
              Your adventure awaits!
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link 
                to="/plan-trip" 
                className="group px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl font-bold text-lg sm:text-xl"
              >
                <Play className="inline w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3" />
                Start Planning Now
              </Link>
              <Link 
                to="/tours" 
                className="group px-8 sm:px-10 py-4 sm:py-5 bg-white/80 backdrop-blur-sm text-gray-800 rounded-full hover:bg-white transition-all duration-300 transform hover:scale-105 border border-gray-200 font-bold text-lg sm:text-xl shadow-lg"
              >
                <MapPin className="inline w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3" />
                Browse Tours
              </Link>
            </div>
        </div>
      </div>
      </section>
    </div>
  );
};

export default HomePage;