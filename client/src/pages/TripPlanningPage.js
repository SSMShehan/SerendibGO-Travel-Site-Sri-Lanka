import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Star, Search, Plane, Hotel, Car, Map, Heart, Plus, Send, X, Sparkles, Compass, Globe, Zap, Shield, CheckCircle, ArrowRight, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import tourService from '../services/tourService';
import hotelService from '../services/hotelService';
import vehicleService from '../services/vehicleService';
import tripRequestService from '../services/tripRequestService';
import { useAuth } from '../contexts/AuthContext';

const TripPlanningPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Check if we're in edit mode
  const isEditMode = location.state?.editMode || false;
  const tripRequestData = location.state?.tripRequestData || null;
  
  const [searchParams, setSearchParams] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    guests: 1,
    budget: '',
    interests: []
  });

  const [recommendations, setRecommendations] = useState({
    tours: [],
    hotels: [],
    vehicles: []
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Custom Trip Request State
  const [showCustomForm, setShowCustomForm] = useState(true);
  const [customTripData, setCustomTripData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    travelers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    budget: {
      minBudget: '',
      maxBudget: '',
      currency: 'LKR'
    },
    destinations: [{ name: '', duration: 1, activities: [], accommodation: 'any', budget: '' }],
    preferences: {
      accommodation: 'any',
      transportation: 'any',
      mealPlan: 'any',
      specialRequirements: []
    },
    contactInfo: {
      phone: '',
      countryCode: '+94',
      preferredContactMethod: 'email',
      timeZone: 'Asia/Colombo'
    },
    tags: []
  });
  const [submittingCustomTrip, setSubmittingCustomTrip] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Country codes and phone number patterns
  const countryCodes = [
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', pattern: /^[0-9]{9}$/, maxLength: 9, placeholder: '77 123 4567' },
    { code: '+1', country: 'United States', flag: '🇺🇸', pattern: /^[0-9]{10}$/, maxLength: 10, placeholder: '555 123 4567' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧', pattern: /^[0-9]{10,11}$/, maxLength: 11, placeholder: '20 7946 0958' },
    { code: '+91', country: 'India', flag: '🇮🇳', pattern: /^[0-9]{10}$/, maxLength: 10, placeholder: '98765 43210' },
    { code: '+86', country: 'China', flag: '🇨🇳', pattern: /^[0-9]{11}$/, maxLength: 11, placeholder: '138 0013 8000' },
    { code: '+81', country: 'Japan', flag: '🇯🇵', pattern: /^[0-9]{10,11}$/, maxLength: 11, placeholder: '90 1234 5678' },
    { code: '+61', country: 'Australia', flag: '🇦🇺', pattern: /^[0-9]{9}$/, maxLength: 9, placeholder: '412 345 678' },
    { code: '+49', country: 'Germany', flag: '🇩🇪', pattern: /^[0-9]{10,12}$/, maxLength: 12, placeholder: '30 12345678' },
    { code: '+33', country: 'France', flag: '🇫🇷', pattern: /^[0-9]{9}$/, maxLength: 9, placeholder: '1 23 45 67 89' },
    { code: '+39', country: 'Italy', flag: '🇮🇹', pattern: /^[0-9]{9,10}$/, maxLength: 10, placeholder: '312 345 6789' },
    { code: '+34', country: 'Spain', flag: '🇪🇸', pattern: /^[0-9]{9}$/, maxLength: 9, placeholder: '612 345 678' },
    { code: '+971', country: 'UAE', flag: '🇦🇪', pattern: /^[0-9]{9}$/, maxLength: 9, placeholder: '50 123 4567' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', pattern: /^[0-9]{9}$/, maxLength: 9, placeholder: '50 123 4567' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬', pattern: /^[0-9]{8}$/, maxLength: 8, placeholder: '8123 4567' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾', pattern: /^[0-9]{9,10}$/, maxLength: 10, placeholder: '12 345 6789' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭', pattern: /^[0-9]{9}$/, maxLength: 9, placeholder: '81 234 5678' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳', pattern: /^[0-9]{9,10}$/, maxLength: 10, placeholder: '91 234 5678' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩', pattern: /^[0-9]{10}$/, maxLength: 10, placeholder: '1712 345678' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰', pattern: /^[0-9]{10}$/, maxLength: 10, placeholder: '301 234 5678' },
    { code: '+93', country: 'Afghanistan', flag: '🇦🇫', pattern: /^[0-9]{9}$/, maxLength: 9, placeholder: '70 123 4567' }
  ];

  // Validation functions
  const validatePhoneNumber = (phone, countryCode) => {
    if (!phone || !countryCode) return false;
    
    const country = countryCodes.find(c => c.code === countryCode);
    if (!country) return false;
    
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if phone matches the country pattern and length
    return country.pattern.test(cleanPhone) && cleanPhone.length <= country.maxLength;
  };

  const formatPhoneNumber = (phone, countryCode) => {
    if (!phone || !countryCode) return phone;
    
    const country = countryCodes.find(c => c.code === countryCode);
    if (!country) return phone;
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Limit to max length
    const limitedPhone = cleanPhone.substring(0, country.maxLength);
    
    return limitedPhone;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};

    // Required field validations
    if (!customTripData.title.trim()) {
      errors.title = 'Trip title is required';
    }

    if (!customTripData.description.trim()) {
      errors.description = 'Trip description is required';
    }

    if (!customTripData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!customTripData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (!customTripData.contactInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      // More lenient phone validation - just check if it has some digits
      const phoneDigits = customTripData.contactInfo.phone.replace(/\D/g, '');
      if (phoneDigits.length < 7) {
        errors.phone = 'Please enter a valid phone number with at least 7 digits';
      }
    }

    // Date validations
    if (customTripData.startDate && customTripData.endDate) {
      const startDate = new Date(customTripData.startDate);
      const endDate = new Date(customTripData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }

      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }

    // Budget validations - Make them optional but validate if provided
    if (customTripData.budget.minBudget && customTripData.budget.minBudget !== '') {
      const minBudget = parseFloat(customTripData.budget.minBudget);
      if (isNaN(minBudget) || minBudget < 0) {
        errors.minBudget = 'Minimum budget must be a valid positive number';
      }
    }

    if (customTripData.budget.maxBudget && customTripData.budget.maxBudget !== '') {
      const maxBudget = parseFloat(customTripData.budget.maxBudget);
      if (isNaN(maxBudget) || maxBudget < 0) {
        errors.maxBudget = 'Maximum budget must be a valid positive number';
      }
    }

    // Only validate min vs max if both are provided
    if (customTripData.budget.minBudget && customTripData.budget.maxBudget && 
        customTripData.budget.minBudget !== '' && customTripData.budget.maxBudget !== '') {
      const minBudget = parseFloat(customTripData.budget.minBudget);
      const maxBudget = parseFloat(customTripData.budget.maxBudget);
      if (!isNaN(minBudget) && !isNaN(maxBudget) && minBudget > maxBudget) {
        errors.maxBudget = 'Maximum budget must be greater than minimum budget';
      }
    }

    // Travelers validation
    if (!customTripData.travelers.adults || customTripData.travelers.adults < 1) {
      errors.adults = 'At least 1 adult is required';
    }

    // Destinations validation - only validate if destination has some content
    customTripData.destinations.forEach((dest, index) => {
      // Only validate if user has started filling this destination
      if (dest.name.trim() || dest.duration > 0) {
        if (!dest.name.trim()) {
          errors[`destination_${index}_name`] = 'Destination name is required';
        }
        if (!dest.duration || dest.duration < 1) {
          errors[`destination_${index}_duration`] = 'Duration must be at least 1 day';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (isEditMode && tripRequestData) {
      setCustomTripData({
        title: tripRequestData.title || '',
        description: tripRequestData.description || '',
        startDate: tripRequestData.startDate ? new Date(tripRequestData.startDate).toISOString().split('T')[0] : '',
        endDate: tripRequestData.endDate ? new Date(tripRequestData.endDate).toISOString().split('T')[0] : '',
        travelers: tripRequestData.travelers || {
          adults: 1,
          children: 0,
          infants: 0
        },
        budget: tripRequestData.budget || {
          minBudget: '',
          maxBudget: '',
          currency: 'LKR'
        },
        destinations: tripRequestData.destinations || [{ name: '', duration: 1, activities: [], accommodation: 'any', budget: '' }],
        preferences: tripRequestData.preferences || {
          accommodation: 'any',
          transportation: 'any',
          mealPlan: 'any',
          specialRequirements: []
        },
        contactInfo: tripRequestData.contactInfo || {
          phone: '',
          countryCode: '+94',
          preferredContactMethod: 'email',
          timeZone: 'Asia/Colombo'
        },
        tags: tripRequestData.tags || []
      });
    }
  }, [isEditMode, tripRequestData]);

  const interestOptions = [
    'beach', 'mountain', 'culture', 'adventure', 'wildlife', 'food', 'history', 'nature', 'photography', 'relaxation'
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const [toursRes, hotelsRes, vehiclesRes] = await Promise.all([
        tourService.getTours(),
        hotelService.getHotels(),
        vehicleService.getVehicles()
      ]);

      setRecommendations({
        tours: toursRes.success ? (toursRes.data?.tours || []) : [],
        hotels: hotelsRes.success ? (hotelsRes.data?.hotels || []) : [],
        vehicles: vehiclesRes.success ? (vehiclesRes.data?.vehicles || vehiclesRes.vehicles || []) : []
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    setSearchParams(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const calculateTripDuration = () => {
    if (searchParams.startDate && searchParams.endDate) {
      const start = new Date(searchParams.startDate);
      const end = new Date(searchParams.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const handleCustomTripSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      toast.error('Please log in to submit a trip request');
      return;
    }
    
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setSubmittingCustomTrip(true);

    // Prepare data for submission with proper data types
    const submissionData = {
        title: customTripData.title.trim(),
        description: customTripData.description.trim(),
        startDate: customTripData.startDate,
        endDate: customTripData.endDate,
        travelers: {
          adults: parseInt(customTripData.travelers.adults),
          children: parseInt(customTripData.travelers.children) || 0,
          infants: parseInt(customTripData.travelers.infants) || 0
        },
        budget: {
          minBudget: customTripData.budget.minBudget ? parseFloat(customTripData.budget.minBudget) : 0,
          maxBudget: customTripData.budget.maxBudget ? parseFloat(customTripData.budget.maxBudget) : 0,
          currency: customTripData.budget.currency
        },
        destinations: customTripData.destinations.map(dest => ({
          name: dest.name.trim(),
          duration: parseInt(dest.duration),
          activities: dest.activities || [],
          accommodation: dest.accommodation || 'any',
          budget: dest.budget ? parseFloat(dest.budget) : undefined
        })),
        preferences: {
          accommodation: customTripData.preferences.accommodation,
          transportation: customTripData.preferences.transportation,
          mealPlan: customTripData.preferences.mealPlan,
          specialRequirements: customTripData.preferences.specialRequirements || []
        },
        contactInfo: {
          phone: customTripData.contactInfo.phone.trim(),
          countryCode: customTripData.contactInfo.countryCode,
          email: user?.email || '', // Include user email
          preferredContactMethod: customTripData.contactInfo.preferredContactMethod,
          timeZone: customTripData.contactInfo.timeZone
        },
        tags: customTripData.tags || []
      };

    try {
      console.log('=== SUBMISSION DATA ===');
      console.log('User:', user);
      console.log('Meal Plan Value:', customTripData.preferences.mealPlan);
      console.log('Submission Data:', JSON.stringify(submissionData, null, 2));
      console.log('=== END SUBMISSION DATA ===');

      let response;
      
      if (isEditMode && tripRequestData) {
        // Update existing trip request
        response = await tripRequestService.updateTripRequestStatus(tripRequestData._id, {
          ...submissionData,
          status: 'pending' // Reset to pending when edited
        });
      } else {
        // Create new trip request
        response = await tripRequestService.createTripRequest(submissionData);
      }

      console.log('=== RESPONSE ===');
      console.log('Response:', response);
      console.log('=== END RESPONSE ===');

      if (response.success) {
        const successMessage = isEditMode 
          ? 'Trip request updated successfully! We\'ll review your changes and get back to you soon.'
          : 'Custom trip request submitted successfully! We\'ll get back to you soon.';
        
        toast.success(successMessage);
        
        // Reset form only if creating new request
        if (!isEditMode) {
          setCustomTripData({
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            travelers: {
              adults: 1,
              children: 0,
              infants: 0
            },
            budget: {
              minBudget: '',
              maxBudget: '',
              currency: 'LKR'
            },
            destinations: [{ name: '', duration: 1, activities: [], accommodation: 'any', budget: '' }],
            preferences: {
              accommodation: 'any',
              transportation: 'any',
              mealPlan: 'any',
              specialRequirements: []
            },
            contactInfo: {
              phone: '',
              countryCode: '+94',
              preferredContactMethod: 'email',
              timeZone: 'Asia/Colombo'
            },
            tags: []
          });
        }
      } else {
        toast.error(response.message || `Failed to ${isEditMode ? 'update' : 'submit'} trip request`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'submitting'} trip request:`, error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        submissionData: submissionData
      });
      
      // Handle specific error responses
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        setValidationErrors(serverErrors);
        toast.error('Please fix the validation errors');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'submit'} trip request. Please try again.`);
      }
    } finally {
      setSubmittingCustomTrip(false);
    }
  };

  const addDestination = () => {
    setCustomTripData(prev => ({
      ...prev,
      destinations: [...prev.destinations, { name: '', duration: 1, activities: [], accommodation: 'any', budget: '' }]
    }));
  };

  const removeDestination = (index) => {
    setCustomTripData(prev => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== index)
    }));
  };

  const updateDestination = (index, field, value) => {
    setCustomTripData(prev => ({
      ...prev,
      destinations: prev.destinations.map((dest, i) => 
        i === index ? { ...dest, [field]: value } : dest
      )
    }));
  };

  const toggleDestinationActivity = (destIndex, activity) => {
    setCustomTripData(prev => ({
      ...prev,
      destinations: prev.destinations.map((dest, i) => 
        i === destIndex 
          ? { 
              ...dest, 
              activities: dest.activities.includes(activity)
                ? dest.activities.filter(a => a !== activity)
                : [...dest.activities, activity]
            }
          : dest
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-8">
              <Compass className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Plan Your Perfect Trip
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
              Discover amazing destinations, find the best accommodations, and create unforgettable memories with our comprehensive trip planning platform
            </p>

            {/* Quick Search */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="block text-white font-semibold mb-3">Destination</label>
                    <input
                      type="text"
                      value={searchParams.destination}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                      placeholder="Where to?"
                      className="w-full px-6 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50 font-medium text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-3">Check-in</label>
                    <input
                      type="date"
                      value={searchParams.startDate}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-6 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-white/50 font-medium text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-3">Check-out</label>
                    <input
                      type="date"
                      value={searchParams.endDate}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-6 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-white/50 font-medium text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-3">Guests</label>
                    <input
                      type="number"
                      min="1"
                      value={searchParams.guests}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                      className="w-full px-6 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-white/50 font-medium text-lg"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                    ) : (
                      <Search className="w-6 h-6 mr-3" />
                    )}
                    {loading ? 'Searching...' : 'Search Trips'}
                  </button>

                  <button
                    onClick={() => setShowCustomForm(!showCustomForm)}
                    className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 border border-white/30 flex items-center justify-center"
                  >
                    <Sparkles className="w-6 h-6 mr-3" />
                    {showCustomForm ? 'Hide Custom Trip Form' : 'Request Custom Trip'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-2000"></div>
      </div>

      {/* Custom Trip Request Form */}
      {showCustomForm && (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Form Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl mb-8">
                {isEditMode ? <Edit3 className="w-10 h-10 text-white" /> : <Sparkles className="w-10 h-10 text-white" />}
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {isEditMode ? 'Edit Custom Trip Request' : 'Request Custom Trip'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isEditMode 
                  ? 'Update your trip request details and we\'ll review your changes'
                  : 'Tell us your dream trip and we\'ll create a personalized itinerary just for you'
                }
              </p>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 p-8">
              <form onSubmit={handleCustomTripSubmit} className="space-y-10">
                {/* Basic Trip Information */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-200/50">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Compass className="w-6 h-6 mr-3 text-blue-600" />
                    Basic Trip Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Trip Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={customTripData.title}
                        onChange={(e) => setCustomTripData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Romantic Beach Getaway to Galle"
                        className={`w-full px-6 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg ${
                          validationErrors.title ? 'border-red-500' : 'border-blue-200'
                        }`}
                      />
                      {validationErrors.title && (
                        <p className="text-red-500 text-sm mt-2">{validationErrors.title}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Contact Phone *
                      </label>
                      <div className="flex gap-2">
                        {/* Country Code Selector */}
                        <select
                          value={customTripData.contactInfo.countryCode}
                          onChange={(e) => {
                            const newCountryCode = e.target.value;
                            setCustomTripData(prev => ({
                              ...prev,
                              contactInfo: { 
                                ...prev.contactInfo, 
                                countryCode: newCountryCode,
                                phone: '' // Clear phone when country changes
                              }
                            }));
                          }}
                          className="px-4 py-4 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg min-w-[120px]"
                        >
                          {countryCodes.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        
                        {/* Phone Number Input */}
                        <input
                          type="tel"
                          required
                          value={customTripData.contactInfo.phone}
                          onChange={(e) => {
                            const country = countryCodes.find(c => c.code === customTripData.contactInfo.countryCode);
                            const formattedPhone = formatPhoneNumber(e.target.value, customTripData.contactInfo.countryCode);
                            setCustomTripData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, phone: formattedPhone }
                            }));
                          }}
                          placeholder={countryCodes.find(c => c.code === customTripData.contactInfo.countryCode)?.placeholder || 'Phone number'}
                          maxLength={countryCodes.find(c => c.code === customTripData.contactInfo.countryCode)?.maxLength || 15}
                          className={`flex-1 px-6 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg ${
                            validationErrors.phone ? 'border-red-500' : 'border-blue-200'
                          }`}
                        />
                      </div>
                      {validationErrors.phone && (
                        <p className="text-red-500 text-sm mt-2">{validationErrors.phone}</p>
                      )}
                      <p className="text-gray-500 text-sm mt-2">
                        Format: {countryCodes.find(c => c.code === customTripData.contactInfo.countryCode)?.placeholder || 'Enter phone number'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      Trip Description *
                    </label>
                    <textarea
                      required
                      value={customTripData.description}
                      onChange={(e) => setCustomTripData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your ideal trip, what you want to see, do, and experience..."
                      rows={5}
                      className={`w-full px-6 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg ${
                        validationErrors.description ? 'border-red-500' : 'border-blue-200'
                      }`}
                    />
                    {validationErrors.description && (
                      <p className="text-red-500 text-sm mt-2">{validationErrors.description}</p>
                    )}
                  </div>
                </div>

                {/* Travel Dates and Group */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200/50">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-green-600" />
                    Travel Dates & Group Size
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={customTripData.startDate}
                        onChange={(e) => setCustomTripData(prev => ({ ...prev, startDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-6 py-4 border rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg ${
                          validationErrors.startDate ? 'border-red-500' : 'border-green-200'
                        }`}
                      />
                      {validationErrors.startDate && (
                        <p className="text-red-500 text-sm mt-2">{validationErrors.startDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={customTripData.endDate}
                        onChange={(e) => setCustomTripData(prev => ({ ...prev, endDate: e.target.value }))}
                        min={customTripData.startDate || new Date().toISOString().split('T')[0]}
                        className={`w-full px-6 py-4 border rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg ${
                          validationErrors.endDate ? 'border-red-500' : 'border-green-200'
                        }`}
                      />
                      {validationErrors.endDate && (
                        <p className="text-red-500 text-sm mt-2">{validationErrors.endDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Adults *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={customTripData.travelers.adults}
                        onChange={(e) => setCustomTripData(prev => ({
                          ...prev,
                          travelers: { ...prev.travelers, adults: parseInt(e.target.value) }
                        }))}
                        className={`w-full px-6 py-4 border rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg ${
                          validationErrors.adults ? 'border-red-500' : 'border-green-200'
                        }`}
                      />
                      {validationErrors.adults && (
                        <p className="text-red-500 text-sm mt-2">{validationErrors.adults}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Children
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={customTripData.travelers.children}
                        onChange={(e) => setCustomTripData(prev => ({
                          ...prev,
                          travelers: { ...prev.travelers, children: parseInt(e.target.value) }
                        }))}
                        className="w-full px-6 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Budget */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-200/50">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Star className="w-6 h-6 mr-3 text-purple-600" />
                    Budget Range
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Minimum Budget
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={customTripData.budget.minBudget}
                        onChange={(e) => setCustomTripData(prev => ({
                          ...prev,
                          budget: { ...prev.budget, minBudget: e.target.value }
                        }))}
                        placeholder="50000"
                        className={`w-full px-6 py-4 border rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg ${
                          validationErrors.minBudget ? 'border-red-500' : 'border-purple-200'
                        }`}
                      />
                      {validationErrors.minBudget && (
                        <p className="text-red-500 text-sm mt-2">{validationErrors.minBudget}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Maximum Budget
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={customTripData.budget.maxBudget}
                        onChange={(e) => setCustomTripData(prev => ({
                          ...prev,
                          budget: { ...prev.budget, maxBudget: e.target.value }
                        }))}
                        placeholder="200000"
                        className={`w-full px-6 py-4 border rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg ${
                          validationErrors.maxBudget ? 'border-red-500' : 'border-purple-200'
                        }`}
                      />
                      {validationErrors.maxBudget && (
                        <p className="text-red-500 text-sm mt-2">{validationErrors.maxBudget}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Currency
                      </label>
                      <select
                        value={customTripData.budget.currency}
                        onChange={(e) => setCustomTripData(prev => ({
                          ...prev,
                          budget: { ...prev.budget, currency: e.target.value }
                        }))}
                        className="w-full px-6 py-4 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      >
                        <option value="LKR">LKR (Sri Lankan Rupee)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Destinations */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <MapPin className="w-6 h-6 mr-3 text-orange-600" />
                      Destinations & Activities
                    </h3>
                    <button
                      type="button"
                      onClick={addDestination}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center font-semibold text-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Destination
                    </button>
                  </div>

                  {customTripData.destinations.map((destination, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-orange-200/50">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold text-gray-900">Destination {index + 1}</h4>
                        {customTripData.destinations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDestination(index)}
                            className="text-red-600 hover:text-red-700 text-lg font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-3">
                            Destination Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={destination.name}
                            onChange={(e) => updateDestination(index, 'name', e.target.value)}
                            placeholder="e.g., Kandy, Galle, Ella"
                            className={`w-full px-6 py-4 border rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg ${
                              validationErrors[`destination_${index}_name`] ? 'border-red-500' : 'border-orange-200'
                            }`}
                          />
                          {validationErrors[`destination_${index}_name`] && (
                            <p className="text-red-500 text-sm mt-2">{validationErrors[`destination_${index}_name`]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-3">
                            Duration (days) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={destination.duration}
                            onChange={(e) => updateDestination(index, 'duration', parseInt(e.target.value))}
                            className={`w-full px-6 py-4 border rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg ${
                              validationErrors[`destination_${index}_duration`] ? 'border-red-500' : 'border-orange-200'
                            }`}
                          />
                          {validationErrors[`destination_${index}_duration`] && (
                            <p className="text-red-500 text-sm mt-2">{validationErrors[`destination_${index}_duration`]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-3">
                            Accommodation Type
                          </label>
                          <select
                            value={destination.accommodation}
                            onChange={(e) => updateDestination(index, 'accommodation', e.target.value)}
                            className="w-full px-6 py-4 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                          >
                            <option value="any">Any</option>
                            <option value="hotel">Hotel</option>
                            <option value="guesthouse">Guesthouse</option>
                            <option value="resort">Resort</option>
                            <option value="villa">Villa</option>
                            <option value="hostel">Hostel</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-3">
                            Budget for this destination
                          </label>
                          <input
                            type="number"
                            value={destination.budget}
                            onChange={(e) => updateDestination(index, 'budget', e.target.value)}
                            placeholder="Optional"
                            className="w-full px-6 py-4 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                          />
                        </div>
                      </div>

                      {/* Activities */}
                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          Activities & Interests
                        </label>
                        <div className="flex flex-wrap gap-3 mb-3">
                          {interestOptions.map((interest) => (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => toggleDestinationActivity(index, interest)}
                              className={`px-4 py-3 rounded-2xl text-lg font-semibold transition-all duration-300 ${
                                destination.activities.includes(interest)
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                                  : 'bg-white/80 text-gray-700 border border-orange-200 hover:bg-orange-50'
                              }`}
                            >
                              {interest.charAt(0).toUpperCase() + interest.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Preferences */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-3xl p-8 border border-teal-200/50">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Heart className="w-6 h-6 mr-3 text-teal-600" />
                    Preferences & Requirements
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Accommodation Preference
                      </label>
                      <select
                        value={customTripData.preferences.accommodation}
                        onChange={(e) => setCustomTripData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, accommodation: e.target.value }
                        }))}
                        className="w-full px-6 py-4 border border-teal-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      >
                        <option value="any">Any</option>
                        <option value="luxury">Luxury</option>
                        <option value="mid-range">Mid-range</option>
                        <option value="budget">Budget</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Transportation Preference
                      </label>
                      <select
                        value={customTripData.preferences.transportation}
                        onChange={(e) => setCustomTripData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, transportation: e.target.value }
                        }))}
                        className="w-full px-6 py-4 border border-teal-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      >
                        <option value="any">Any</option>
                        <option value="private">Private Vehicle</option>
                        <option value="public">Public Transport</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Meal Plan Preference
                      </label>
                      <select
                        value={customTripData.preferences.mealPlan}
                        onChange={(e) => setCustomTripData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, mealPlan: e.target.value }
                        }))}
                        className="w-full px-6 py-4 border border-teal-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      >
                        <option value="any">Any</option>
                        <option value="bed-breakfast">Bed & Breakfast</option>
                        <option value="half-board">Half Board</option>
                        <option value="full-board">Full Board</option>
                        <option value="breakfast-only">Breakfast Only</option>
                        <option value="all-inclusive">All Inclusive</option>
                      </select>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      Special Requirements
                    </label>
                    <textarea
                      value={customTripData.preferences.specialRequirements.join(', ')}
                      onChange={(e) => setCustomTripData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          specialRequirements: e.target.value.split(',').map(req => req.trim()).filter(req => req)
                        }
                      }))}
                      placeholder="e.g., wheelchair accessible, vegetarian meals, airport pickup..."
                      rows={4}
                      className="w-full px-6 py-4 border border-teal-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                    />
                  </div>
                </div>

                {/* Contact Preferences */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-3xl p-8 border border-indigo-200/50">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-indigo-600" />
                    Contact Preferences
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Preferred Contact Method
                      </label>
                      <select
                        value={customTripData.contactInfo.preferredContactMethod}
                        onChange={(e) => setCustomTripData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, preferredContactMethod: e.target.value }
                        }))}
                        className="w-full px-6 py-4 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Time Zone
                      </label>
                      <select
                        value={customTripData.contactInfo.timeZone}
                        onChange={(e) => setCustomTripData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, timeZone: e.target.value }
                        }))}
                        className="w-full px-6 py-4 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium text-lg"
                      >
                        <option value="Asia/Colombo">Asia/Colombo (Sri Lanka)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                        <option value="Australia/Sydney">Australia/Sydney</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center space-x-6 pt-8 border-t border-gray-200/50">
                  <button
                    type="submit"
                    disabled={submittingCustomTrip}
                    className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center text-lg"
                  >
                    {submittingCustomTrip ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    ) : (
                      <Send className="w-6 h-6 mr-3" />
                    )}
                    {submittingCustomTrip 
                      ? (isEditMode ? 'Updating...' : 'Submitting...') 
                      : (isEditMode ? 'Update Trip Request' : 'Submit Custom Trip Request')
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {(recommendations.tours.length > 0 || recommendations.hotels.length > 0 || recommendations.vehicles.length > 0) && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Recommended for You</h2>
            <p className="text-xl text-gray-600">Based on your search preferences</p>
          </div>

          {/* Tours */}
          {recommendations.tours.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Map className="w-6 h-6 mr-3 text-blue-600" />
                Popular Tours
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.tours.slice(0, 6).map((tour) => (
                  <div key={tour._id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    {tour.images && tour.images[0] && (
                      <img
                        src={tour.images[0].url}
                        alt={tour.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{tour.name}</h4>
                      <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="ml-1 text-sm font-medium">{tour.rating?.average || 'N/A'}</span>
                        </div>
                        <Link
                          to={`/tours/${tour._id}`}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotels */}
          {recommendations.hotels.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Hotel className="w-6 h-6 mr-3 text-green-600" />
                Recommended Hotels
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.hotels.slice(0, 6).map((hotel) => (
                  <div key={hotel._id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-green-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    {hotel.images && hotel.images[0] && (
                      <img
                        src={hotel.images[0].url}
                        alt={hotel.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h4>
                      <p className="text-gray-600 mb-4 line-clamp-2">{hotel.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {[...Array(hotel.starRating || 0)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <Link
                          to={`/hotels/${hotel._id}`}
                          className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-2xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 flex items-center"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vehicles */}
          {recommendations.vehicles.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Car className="w-6 h-6 mr-3 text-purple-600" />
                Available Vehicles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.vehicles.slice(0, 6).map((vehicle) => (
                  <div key={vehicle._id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    {vehicle.images && vehicle.images[0] && (
                      <img
                        src={vehicle.images[0].url}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{vehicle.brand} {vehicle.model}</h4>
                      <p className="text-gray-600 mb-4">{vehicle.year} • {vehicle.capacity} passengers</p>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-purple-600">
                          LKR {vehicle.pricing?.daily?.toLocaleString()}/day
                        </div>
                        <Link
                          to={`/vehicles/${vehicle._id}`}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Why Choose Our Trip Planning Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Trip Planning?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the difference with our comprehensive travel planning platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Recommendations</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered suggestions based on your preferences, budget, and travel style for the perfect trip.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Reliable</h3>
              <p className="text-gray-600 leading-relaxed">
                Book with confidence knowing your payments and personal information are protected.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Global Coverage</h3>
              <p className="text-gray-600 leading-relaxed">
                Access to thousands of destinations, accommodations, and experiences worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanningPage;