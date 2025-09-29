import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Users, Star, Globe, BookOpen, Camera, Mountain, Utensils, Heart, Sparkles, Award, Shield, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import guideService from '../services/guideService';

const GuidesPage = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    language: '',
    tourType: ''
  });
  const [sortBy, setSortBy] = useState('rating');

  const specializations = [
    { value: 'cultural', label: 'Cultural', icon: BookOpen },
    { value: 'historical', label: 'Historical', icon: Globe },
    { value: 'wildlife', label: 'Wildlife', icon: Mountain },
    { value: 'adventure', label: 'Adventure', icon: Mountain },
    { value: 'culinary', label: 'Culinary', icon: Utensils },
    { value: 'photography', label: 'Photography', icon: Camera },
    { value: 'nature', label: 'Nature', icon: Heart },
    { value: 'religious', label: 'Religious', icon: BookOpen },
    { value: 'archaeological', label: 'Archaeological', icon: Globe },
    { value: 'eco-tourism', label: 'Eco-Tourism', icon: Heart }
  ];

  const tourTypes = [
    'private', 'group', 'custom', 'day-trip', 'multi-day', 'luxury', 'budget', 'family', 'couple', 'solo'
  ];

  const languages = [
    'English', 'Sinhala', 'Tamil', 'German', 'French', 'Spanish', 'Italian', 'Chinese', 'Japanese', 'Korean'
  ];

  const fetchGuides = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching guides...');
      
      const params = {};
      
      if (filters.specialization) params.specialization = filters.specialization;
      if (filters.city) params.city = filters.city;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.language) params.language = filters.language;
      if (filters.tourType) params.tourType = filters.tourType;
      params.sortBy = sortBy;

      console.log('API params:', params);
      const response = await guideService.getGuides(params);
      console.log('API response:', response);
      
      setGuides(response.guides || []);
      console.log('Guides set:', response.guides?.length || 0);
    } catch (error) {
      console.error('Error fetching guides:', error);
      console.error('Error details:', error.message);
      toast.error(`Error loading guides: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGuideSelect = (guideId) => {
    navigate(`/guides/${guideId}`);
  };

  const clearFilters = () => {
    setFilters({
      specialization: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      language: '',
      tourType: ''
    });
    setSortBy('rating');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Discovering amazing guides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 md:px-8 py-20 md:py-24">
          <div className="text-center text-white">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium Guide Services
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Find Your Perfect Guide
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover Sri Lanka with expert local guides. Choose from our certified professionals for an unforgettable experience.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-3 flex items-center shadow-2xl border border-white/30">
                <Search className="text-gray-400 ml-4 mr-3" size={24} />
                <input
                  type="text"
                  placeholder="Search for guides, specializations, or locations..."
                  className="flex-1 p-4 text-gray-800 outline-none bg-transparent text-lg"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
                <button
                  onClick={fetchGuides}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold text-lg"
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why Choose Our Guides?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Professional, certified, and passionate about sharing Sri Lanka's beauty</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Certified Professionals</h3>
              <p className="text-gray-600">All guides are professionally certified and experienced</p>
            </div>
            
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Safe & Reliable</h3>
              <p className="text-gray-600">Verified guides with excellent safety records</p>
            </div>
            
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Top Rated</h3>
              <p className="text-gray-600">Highly rated by thousands of satisfied travelers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center text-gray-800">
                  <Filter size={24} className="mr-3 text-indigo-600" />
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium bg-indigo-50 px-3 py-1 rounded-full"
                >
                  Clear All
                </button>
              </div>

              {/* Specialization Filter */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-gray-800 text-lg">Specialization</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                  {specializations.map((spec) => {
                    const IconComponent = spec.icon;
                    return (
                      <label key={spec.value} className="flex items-center space-x-3 cursor-pointer hover:bg-indigo-50/80 p-3 rounded-xl transition-all duration-300 border border-transparent hover:border-indigo-200/50">
                        <input
                          type="radio"
                          name="specialization"
                          value={spec.value}
                          checked={filters.specialization === spec.value}
                          onChange={(e) => handleFilterChange('specialization', e.target.value)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <IconComponent size={16} className="text-indigo-600" />
                        </div>
                        <span className="text-gray-700 font-medium">{spec.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Tour Type Filter */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-gray-800 text-lg">Tour Type</h4>
                <select
                  value={filters.tourType}
                  onChange={(e) => handleFilterChange('tourType', e.target.value)}
                  className="w-full p-4 border border-indigo-200 rounded-2xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 font-medium"
                >
                  <option value="">Any Tour Type</option>
                  {tourTypes.map(type => (
                    <option key={type} value={type} className="capitalize">
                      {type.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Filter */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-gray-800 text-lg">Language</h4>
                <select
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="w-full p-4 border border-indigo-200 rounded-2xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 font-medium"
                >
                  <option value="">Any Language</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-gray-800 text-lg">Price Range (LKR)</h4>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full p-4 border border-indigo-200 rounded-2xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full p-4 border border-indigo-200 rounded-2xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 font-medium"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h4 className="font-semibold mb-4 text-gray-800 text-lg">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-4 border border-indigo-200 rounded-2xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 font-medium"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="experience">Most Experienced</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Guides Grid */}
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Available Guides
                </h2>
                <p className="text-lg text-gray-600">
                  {guides.length} professional guides ready to show you Sri Lanka
                </p>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-indigo-200/50">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Updated just now</span>
              </div>
            </div>

            {guides.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Globe size={48} className="text-indigo-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">No guides found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Try adjusting your filters or search criteria to find the perfect guide for your adventure</p>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {guides.map((guide) => (
                  <div
                    key={guide._id}
                    className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer group"
                    onClick={() => handleGuideSelect(guide._id)}
                  >
                    {/* Guide Image */}
                    <div className="relative h-56 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                      {guide.profile?.profileImage?.url ? (
                        <img
                          src={guide.profile.profileImage.url}
                          alt={guide.profile.profileImage.caption}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="w-20 h-20 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl flex items-center justify-center">
                            <Globe size={32} className="text-indigo-600" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg">
                        {guide.profile?.specializations?.[0]?.toUpperCase() || 'GUIDE'}
                      </div>
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl text-sm font-medium text-gray-700">
                        <Star className="w-4 h-4 inline mr-1 text-yellow-500" />
                        {guide.rating?.average?.toFixed(1) || 'N/A'}
                      </div>
                    </div>

                    {/* Guide Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {guide.user?.name || 'Professional Guide'}
                      </h3>
                      
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin size={18} className="mr-2 text-indigo-600" />
                        <span className="font-medium">
                          {guide.services?.locations?.[0]?.city || 'Location not specified'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-gray-600">
                          <Users size={18} className="mr-2 text-indigo-600" />
                          <span className="font-medium">
                            {guide.services?.groupSize?.min}-{guide.services?.groupSize?.max} people
                          </span>
                        </div>
                        <div className="flex items-center text-yellow-500">
                          <Star size={18} className="mr-1" />
                          <span className="font-bold">{guide.rating?.average?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
                          {guide.profile?.bio || 'Professional tour guide with extensive experience.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          LKR {guide.pricing?.daily?.toLocaleString()}
                        </div>
                        <span className="text-gray-600 text-sm font-medium">per day</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mb-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/guides/${guide._id}`);
                          }}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-2xl hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 text-sm font-semibold border border-indigo-200 hover:border-indigo-300"
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/guides/${guide._id}/book`);
                          }}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-sm font-semibold shadow-lg"
                        >
                          Book Now
                        </button>
                      </div>

                      {/* Specializations Tags */}
                      {guide.profile?.specializations && guide.profile.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {guide.profile.specializations.slice(0, 3).map((spec) => (
                            <span
                              key={spec}
                              className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 rounded-xl text-xs font-semibold capitalize border border-indigo-200"
                            >
                              {spec.replace('-', ' ')}
                            </span>
                          ))}
                          {guide.profile.specializations.length > 3 && (
                            <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 rounded-xl text-xs font-semibold border border-indigo-200">
                              +{guide.profile.specializations.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Languages */}
                      {guide.profile?.languages && guide.profile.languages.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-gray-600 font-medium">
                            Languages: {guide.profile.languages.map(l => l.language).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidesPage;

// Add custom styles for scrollbar
const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #6366f1, #8b5cf6);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #4f46e5, #7c3aed);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}