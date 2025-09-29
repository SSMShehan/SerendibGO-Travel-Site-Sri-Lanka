import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Bed, 
  Wifi, 
  Car, 
  Utensils, 
  Pool, 
  Sparkles, 
  Award, 
  Shield, 
  Clock, 
  TrendingUp,
  Heart,
  Globe,
  Camera
} from 'lucide-react';
import hotelService from '../services/hotelService';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStarRating, setSelectedStarRating] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Load hotels when component mounts
  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await hotelService.getHotels();
      
      if (response.success) {
        setHotels(response.data.hotels);
      } else {
        setError(response.message || 'Failed to load hotels');
      }
    } catch (err) {
      setError('Error loading hotels. Please try again.');
      console.error('Load hotels error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter hotels based on search criteria
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location?.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || hotel.category === selectedCategory;
    const matchesStarRating = !selectedStarRating || hotel.starRating >= parseInt(selectedStarRating);
    const matchesPrice = !priceRange.min || hotel.averageRoomPrice >= parseInt(priceRange.min);
    const matchesMaxPrice = !priceRange.max || hotel.averageRoomPrice <= parseInt(priceRange.max);
    
    return matchesSearch && matchesCategory && matchesStarRating && matchesPrice && matchesMaxPrice;
  });

  const categories = ['luxury', 'business', 'resort', 'boutique', 'budget', 'family'];
  const starRatings = [5, 4, 3, 2, 1];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Discovering amazing hotels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Oops!</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={loadHotels}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 md:px-8 py-20 md:py-24">
          <div className="text-center text-white">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium Hotel Collection
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
              Discover Amazing Hotels
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Find the perfect accommodation for your stay in Sri Lanka. Experience luxury, comfort, and unforgettable memories.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-3 flex items-center shadow-2xl border border-white/30">
                <Search className="text-gray-400 ml-4 mr-3" size={24} />
                <input
                  type="text"
                  placeholder="Search for hotels, locations, or amenities..."
                  className="flex-1 p-4 text-gray-800 outline-none bg-transparent text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  onClick={loadHotels}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold text-lg"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-2000"></div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Our Hotels?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Experience the best of Sri Lankan hospitality with our curated selection of premium accommodations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Quality</h3>
              <p className="text-gray-600 leading-relaxed">Handpicked hotels that meet our high standards for comfort, service, and amenities</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Safe & Secure</h3>
              <p className="text-gray-600 leading-relaxed">All hotels are verified and follow strict safety protocols for your peace of mind</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600 leading-relaxed">Round-the-clock customer support to assist you throughout your stay</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-8 py-12">
        {/* Filters Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 p-8 mb-8">
          <div className="flex items-center mb-6">
            <Filter className="w-6 h-6 text-emerald-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Filter Hotels</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                <Bed className="inline w-5 h-5 mr-2 text-emerald-600" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Star Rating Filter */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                <Star className="inline w-5 h-5 mr-2 text-emerald-600" />
                Star Rating
              </label>
              <select
                value={selectedStarRating}
                onChange={(e) => setSelectedStarRating(e.target.value)}
                className="w-full px-4 py-3 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
              >
                <option value="">All Ratings</option>
                {starRatings.map(rating => (
                  <option key={rating} value={rating}>{rating}+ Stars</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                <TrendingUp className="inline w-5 h-5 mr-2 text-emerald-600" />
                Price Range (LKR)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full px-3 py-3 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-3 py-3 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                <Globe className="inline w-5 h-5 mr-2 text-emerald-600" />
                Sort By
              </label>
              <select className="w-full px-4 py-3 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg">
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="location">Location</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedStarRating('');
                  setPriceRange({ min: '', max: '' });
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Available Hotels</h3>
                <p className="text-gray-600">
                  Showing {filteredHotels.length} of {hotels.length} hotels
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Live Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hotels Grid */}
        {filteredHotels.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Bed className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No hotels found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your search criteria or filters to find the perfect accommodation
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedStarRating('');
                setPriceRange({ min: '', max: '' });
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHotels.map((hotel) => (
              <motion.div
                key={hotel._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
              >
                {/* Hotel Image */}
                <div className="relative h-64">
                  {hotel.images && hotel.images.length > 0 ? (
                    <img
                      src={hotel.images[0].url}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                      <Camera className="w-12 h-12 text-emerald-500" />
                    </div>
                  )}
                  
                  {/* Star Rating Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-2 rounded-2xl text-sm font-bold shadow-lg">
                    <Star className="w-4 h-4 inline mr-1" />
                    {hotel.starRating}
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-2 rounded-2xl text-xs font-semibold shadow-lg">
                    {hotel.category?.replace('_', ' ').toUpperCase()}
                  </div>

                  {/* Favorite Button */}
                  <button className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg">
                    <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                  </button>
                </div>

                {/* Hotel Info */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{hotel.name}</h3>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                    <span className="font-medium">
                      {hotel.location?.address?.city}, {hotel.location?.address?.state}
                    </span>
                  </div>

                  <p className="text-gray-700 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {hotel.description}
                  </p>

                  {/* Amenities Preview */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {hotelService.formatAmenityName(amenity)}
                          </span>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <span className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                            +{hotel.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-emerald-600">
                        {hotel.averageRoomPrice ? `LKR ${hotel.averageRoomPrice.toLocaleString()}` : 'Price on request'}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">per night</div>
                    </div>
                    
                    <Link
                      to={`/hotels/${hotel._id}`}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelsPage;
