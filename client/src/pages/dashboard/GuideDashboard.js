import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCheck, 
  Calendar, 
  DollarSign, 
  Star, 
  Edit,
  BarChart3,
  Settings,
  MapPin,
  Clock,
  CheckCircle,
  Users,
  Sparkles,
  Award,
  Shield,
  TrendingUp,
  Heart,
  Globe
} from 'lucide-react';
import guideService from '../../services/guideService';
import { toast } from 'react-hot-toast';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const GuideDashboard = () => {
  const [guideProfile, setGuideProfile] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
    completedTours: 0,
    upcomingTours: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load guide profile
      const profileResponse = await guideService.getMyProfile();
      if (profileResponse.success) {
        setGuideProfile(profileResponse.data);
      }

      // Load guide bookings for recent display (5 items)
      const recentBookingsResponse = await guideService.getMyGuideBookings({ page: 1, limit: 5 });
      if (recentBookingsResponse.success) {
        setRecentBookings(recentBookingsResponse.data.bookings || []);
      }

      // Load all bookings for stats calculation
      const allBookingsResponse = await guideService.getMyGuideBookings({ page: 1, limit: 1000 });
      if (allBookingsResponse.success) {
        setStats(prev => ({
          ...prev,
          totalBookings: allBookingsResponse.data.pagination?.totalBookings || 0
        }));
        // Calculate stats from all bookings
        calculateStats(allBookingsResponse.data.bookings || []);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookings) => {
    let totalEarnings = 0;
    let completedTours = 0;
    let upcomingTours = 0;
    let totalRating = 0;
    let ratingCount = 0;

    bookings.forEach(booking => {
      if (booking.status === 'completed') {
        completedTours++;
        if (booking.totalAmount) {
          totalEarnings += booking.totalAmount;
        }
      } else if (booking.status === 'confirmed') {
        upcomingTours++;
      }
      
      if (booking.rating) {
        totalRating += booking.rating;
        ratingCount++;
      }
    });

    setStats(prev => ({
      ...prev,
      totalEarnings,
      completedTours,
      upcomingTours,
      averageRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const createGuideProfile = async () => {
    try {
      const response = await guideService.createMyProfile();
      if (response.success) {
        toast.success('Guide profile created successfully!');
        // Reload dashboard data
        loadDashboardData();
      } else {
        toast.error(response.message || 'Failed to create guide profile');
      }
    } catch (error) {
      console.error('Error creating guide profile:', error);
      toast.error('Failed to create guide profile');
    }
  };

  const toggleAvailability = async () => {
    try {
      const currentStatus = guideProfile?.availability?.isAvailable || false;
      const newStatus = !currentStatus;
      
      const response = await guideService.updateAvailability({
        isAvailable: newStatus
      });
      
      if (response.success) {
        toast.success(`You are now ${newStatus ? 'available' : 'unavailable'} for bookings`);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading your dashboard...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <LoadingSkeleton type="stats" count={5} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LoadingSkeleton type="card" count={2} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl text-lg font-semibold mb-6 border border-indigo-200/50">
            <Sparkles className="w-6 h-6 mr-3 text-indigo-600" />
            Guide Dashboard
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Welcome Back!
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">Manage your guide services and bookings with ease</p>
        </div>

        {/* Profile Status */}
        {guideProfile && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={guideProfile.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                    alt={guideProfile.user?.name || 'Guide'}
                    className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-lg"
                  />
                  {guideProfile.isVerified && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-800">{guideProfile.user?.name || 'Guide'}</h2>
                  <p className="text-gray-700 text-lg">{guideProfile.profile?.specializations?.join(', ') || 'No specializations set'}</p>
                  <div className="flex items-center mt-3">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-gray-700 font-medium">
                      {guideProfile.rating?.average || 'No rating yet'} ({guideProfile.rating?.count || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
                  guideProfile.isVerified ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {guideProfile.isVerified ? 'Verified Guide' : 'Pending Verification'}
                </span>
                <div className="mt-4">
                  <button
                    onClick={toggleAvailability}
                    className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      guideProfile?.availability?.isAvailable 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl' 
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:shadow-xl'
                    }`}
                  >
                    {guideProfile?.availability?.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                </div>
                <p className="text-sm text-gray-700 mt-3">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {guideProfile.location || guideProfile.services?.locations?.[0]?.city || 'Location not specified'}
                </p>
                {guideProfile.isNewProfile && (
                  <button
                    onClick={createGuideProfile}
                    className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Create Guide Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl">
                <Calendar className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-700">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-green-200/50 p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-700">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-800">{formatCurrency(stats.totalEarnings)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-yellow-200/50 p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-700">Avg Rating</p>
                <p className="text-3xl font-bold text-gray-800">{stats.averageRating}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-200/50 p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-700">Completed</p>
                <p className="text-3xl font-bold text-gray-800">{stats.completedTours}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-200/50 p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-700">Upcoming</p>
                <p className="text-3xl font-bold text-gray-800">{stats.upcomingTours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Bookings */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50">
            <div className="px-8 py-6 border-b border-indigo-200/30">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-indigo-600" />
                  Recent Bookings
                </h2>
                <Link 
                  to="/guide/bookings" 
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold bg-indigo-50 px-4 py-2 rounded-2xl hover:bg-indigo-100 transition-all duration-300"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-8">
              {recentBookings.length > 0 ? (
                <div className="space-y-6">
                  {recentBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-2xl border border-indigo-100/50 hover:shadow-lg transition-all duration-300">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{booking.tour?.title || 'Custom Tour'}</h3>
                        <p className="text-sm text-gray-700 mt-1">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </p>
                        <p className="text-sm text-gray-700">
                          <Users className="w-4 h-4 inline mr-2" />
                          {booking.participants} participants
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 text-lg">{formatCurrency(booking.totalAmount)}</p>
                        <span className={`px-3 py-1 rounded-2xl text-xs font-semibold ${
                          booking.status === 'completed' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' :
                          booking.status === 'confirmed' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200' :
                          booking.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200' :
                          'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">No bookings yet</h3>
                  <p className="text-gray-700">Bookings will appear here once customers book your services</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Management */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50">
            <div className="px-8 py-6 border-b border-indigo-200/30">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <UserCheck className="w-6 h-6 mr-3 text-indigo-600" />
                Profile Management
              </h2>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <Link
                  to="/guide/profile/edit"
                  className="flex items-center p-6 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-2xl hover:from-indigo-100/80 hover:to-purple-100/80 transition-all duration-300 border border-indigo-100/50 hover:shadow-lg"
                >
                  <Edit className="w-8 h-8 text-indigo-600 mr-4" />
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">Edit Profile</p>
                    <p className="text-sm text-gray-700">Update your information</p>
                  </div>
                </Link>

                <Link
                  to="/guide/services"
                  className="flex items-center p-6 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-2xl hover:from-green-100/80 hover:to-emerald-100/80 transition-all duration-300 border border-green-100/50 hover:shadow-lg"
                >
                  <UserCheck className="w-8 h-8 text-green-600 mr-4" />
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">Manage Services</p>
                    <p className="text-sm text-gray-700">Update your tour offerings</p>
                  </div>
                </Link>

                <Link
                  to="/guide/availability"
                  className="flex items-center p-6 bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-2xl hover:from-purple-100/80 hover:to-pink-100/80 transition-all duration-300 border border-purple-100/50 hover:shadow-lg"
                >
                  <Calendar className="w-8 h-8 text-purple-600 mr-4" />
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">Set Availability</p>
                    <p className="text-sm text-gray-700">Manage your schedule</p>
                  </div>
                </Link>

                <Link
                  to="/guide/reviews"
                  className="flex items-center p-6 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 rounded-2xl hover:from-yellow-100/80 hover:to-orange-100/80 transition-all duration-300 border border-yellow-100/50 hover:shadow-lg"
                >
                  <Star className="w-8 h-8 text-yellow-600 mr-4" />
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">Reviews</p>
                    <p className="text-sm text-gray-700">View customer feedback</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50">
          <div className="px-8 py-6 border-b border-indigo-200/30">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Sparkles className="w-6 h-6 mr-3 text-indigo-600" />
              Quick Actions
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Link
                to="/guide/profile/edit"
                className="flex items-center p-6 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-2xl hover:from-indigo-100/80 hover:to-purple-100/80 transition-all duration-300 border border-indigo-100/50 hover:shadow-lg"
              >
                <Edit className="w-8 h-8 text-indigo-600 mr-4" />
                <div>
                  <p className="font-semibold text-gray-800">Edit Profile</p>
                  <p className="text-sm text-gray-700">Update info</p>
                </div>
              </Link>

              <Link
                to="/guide/bookings"
                className="flex items-center p-6 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-2xl hover:from-green-100/80 hover:to-emerald-100/80 transition-all duration-300 border border-green-100/50 hover:shadow-lg"
              >
                <Calendar className="w-8 h-8 text-green-600 mr-4" />
                <div>
                  <p className="font-semibold text-gray-800">Bookings</p>
                  <p className="text-sm text-gray-700">Manage tours</p>
                </div>
              </Link>

              <Link
                to="/guide/analytics"
                className="flex items-center p-6 bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-2xl hover:from-purple-100/80 hover:to-pink-100/80 transition-all duration-300 border border-purple-100/50 hover:shadow-lg"
              >
                <BarChart3 className="w-8 h-8 text-purple-600 mr-4" />
                <div>
                  <p className="font-semibold text-gray-800">Analytics</p>
                  <p className="text-sm text-gray-700">View reports</p>
                </div>
              </Link>

              <Link
                to="/guide/settings"
                className="flex items-center p-6 bg-gradient-to-r from-gray-50/80 to-gray-100/80 rounded-2xl hover:from-gray-100/80 hover:to-gray-200/80 transition-all duration-300 border border-gray-100/50 hover:shadow-lg"
              >
                <Settings className="w-8 h-8 text-gray-600 mr-4" />
                <div>
                  <p className="font-semibold text-gray-800">Settings</p>
                  <p className="text-sm text-gray-700">Account settings</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard;