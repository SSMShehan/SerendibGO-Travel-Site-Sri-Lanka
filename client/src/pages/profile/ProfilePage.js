import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Camera, 
  Save, 
  Edit3,
  Lock,
  Eye,
  EyeOff,
  Settings,
  Bell,
  CreditCard,
  Star,
  Award,
  TrendingUp,
  Activity,
  Clock,
  Globe,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Crown,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Map,
  Compass,
  Camera as CameraIcon,
  Palette,
  Sparkles,
  Gift,
  Trophy,
  Bookmark,
  History,
  Calendar as CalendarIcon,
  Filter,
  Search,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  RefreshCw,
  Trash2,
  Copy,
  ExternalLink,
  HelpCircle,
  LogOut
} from 'lucide-react';
import UserService from '../../services/userService';
import authService from '../../services/authService';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showStats, setShowStats] = useState(true);
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    website: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsUpdates: false,
      darkMode: false,
      language: 'en'
    }
  });

  // Password change form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile picture
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // Mock data for enhanced features
  const [profileStats] = useState({
    totalBookings: 24,
    completedTours: 18,
    totalSpent: 125000,
    loyaltyPoints: 2450,
    reviewsGiven: 12,
    reviewsReceived: 8,
    averageRating: 4.7,
    memberSince: '2023-03-15',
    favoriteDestinations: ['Kandy', 'Galle', 'Sigiriya'],
    achievements: [
      { id: 1, name: 'Explorer', description: 'Visited 5+ destinations', icon: '🗺️', earned: true },
      { id: 2, name: 'Reviewer', description: 'Left 10+ reviews', icon: '⭐', earned: true },
      { id: 3, name: 'Loyal Customer', description: 'Booked 20+ tours', icon: '💎', earned: true },
      { id: 4, name: 'Social Butterfly', description: 'Shared 5+ experiences', icon: '🦋', earned: false }
    ]
  });

  const [recentActivity] = useState([
    { id: 1, type: 'booking', title: 'Booked Kandy Cultural Tour', date: '2024-01-15', status: 'confirmed' },
    { id: 2, type: 'review', title: 'Reviewed Sigiriya Rock Fortress', date: '2024-01-10', rating: 5 },
    { id: 3, type: 'payment', title: 'Payment completed for Galle Tour', date: '2024-01-08', amount: 15000 },
    { id: 4, type: 'cancellation', title: 'Cancelled Ella Train Journey', date: '2024-01-05', refund: 8000 }
  ]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        nationality: user.nationality || '',
        website: user.website || '',
        socialLinks: user.socialLinks || {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: ''
        },
        preferences: user.preferences || {
          notifications: true,
          emailUpdates: true,
          smsUpdates: false,
          darkMode: false,
          language: 'en'
        }
      });
      setProfilePicturePreview(user.avatar || null);
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await UserService.updateProfile(profileData);
      
      if (response.success) {
        if (profilePicture) {
          const formData = new FormData();
          formData.append('avatar', profilePicture);
          await UserService.uploadProfilePicture(formData);
        }

        const updatedUser = { ...user, ...profileData };
        if (profilePicturePreview) {
          updatedUser.avatar = profilePicturePreview;
        }
        
        updateUser(updatedUser);
        authService.updateUserInStorage(updatedUser);
        
        toast.success('Profile updated successfully!');
        setEditing(false);
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await UserService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      staff: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      hotel_owner: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
      guide: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      user: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    };
    return colors[role] || colors.user;
  };

  const getActivityIcon = (type) => {
    const icons = {
      booking: <Calendar className="w-4 h-4 text-blue-500" />,
      review: <Star className="w-4 h-4 text-yellow-500" />,
      payment: <CreditCard className="w-4 h-4 text-green-500" />,
      cancellation: <AlertCircle className="w-4 h-4 text-red-500" />
    };
    return icons[type] || <Activity className="w-4 h-4 text-gray-500" />;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-600">Manage your account and preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {profilePicturePreview ? (
                      <img 
                        src={profilePicturePreview} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-2xl object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  {editing && (
                    <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name || 'User'}</h2>
                <p className="text-gray-600 mb-3">{user?.email}</p>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(user?.role)} shadow-lg`}>
                  <Crown className="w-4 h-4 mr-1" />
                  {user?.role?.replace('_', ' ').toUpperCase() || 'USER'}
                </div>
                
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center justify-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Joined {formatDate(user?.createdAt)}</span>
                  </div>
                  {user?.isVerified && (
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>Verified Account</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600">Total Bookings</span>
                  </div>
                  <span className="font-semibold text-gray-900">{profileStats.totalBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-600">Completed Tours</span>
                  </div>
                  <span className="font-semibold text-gray-900">{profileStats.completedTours}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Award className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-600">Loyalty Points</span>
                  </div>
                  <span className="font-semibold text-gray-900">{profileStats.loyaltyPoints}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="text-sm text-gray-600">Average Rating</span>
                  </div>
                  <span className="font-semibold text-gray-900">{profileStats.averageRating}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">{profileStats.totalBookings}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{profileStats.completedTours}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900">Rs. {profileStats.totalSpent.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Rating</p>
                        <p className="text-2xl font-bold text-gray-900">{profileStats.averageRating}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      Recent Activity
                    </h3>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center p-4 bg-gray-50/50 rounded-xl">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-4 shadow-sm">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{formatDate(activity.date)}</p>
                        </div>
                        <div className="text-right">
                          {activity.rating && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="text-sm font-medium">{activity.rating}</span>
                            </div>
                          )}
                          {activity.amount && (
                            <p className="text-sm font-medium text-green-600">Rs. {activity.amount.toLocaleString()}</p>
                          )}
                          {activity.refund && (
                            <p className="text-sm font-medium text-red-600">Refund: Rs. {activity.refund.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Favorite Destinations */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Map className="w-5 h-5 mr-2 text-blue-600" />
                    Favorite Destinations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {profileStats.favoriteDestinations.map((destination, index) => (
                      <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">{destination}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Profile Information
                  </h3>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setEditing(false);
                          setProfileData({
                            name: user.name || '',
                            email: user.email || '',
                            phone: user.phone || '',
                            address: user.address || '',
                            bio: user.bio || '',
                            dateOfBirth: user.dateOfBirth || '',
                            gender: user.gender || '',
                            nationality: user.nationality || '',
                            website: user.website || '',
                            socialLinks: user.socialLinks || {
                              facebook: '',
                              twitter: '',
                              instagram: '',
                              linkedin: ''
                            },
                            preferences: user.preferences || {
                              notifications: true,
                              emailUpdates: true,
                              smsUpdates: false,
                              darkMode: false,
                              language: 'en'
                            }
                          });
                          setProfilePicture(null);
                          setProfilePicturePreview(user.avatar || null);
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        disabled={!editing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        disabled={!editing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        disabled={!editing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleProfileChange}
                        disabled={!editing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleProfileChange}
                        disabled={!editing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={profileData.nationality}
                        onChange={handleProfileChange}
                        disabled={!editing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      disabled={!editing}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      disabled={!editing}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                    />
                  </div>

                  {editing && (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Activity Timeline
                  </h3>
                  <div className="space-y-6">
                    {recentActivity.map((activity, index) => (
                      <div key={activity.id} className="relative">
                        {index !== recentActivity.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                        )}
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 shadow-lg border border-gray-100">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 bg-gray-50/50 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{formatDate(activity.date)}</p>
                            {activity.rating && (
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                <span className="text-sm font-medium">{activity.rating} stars</span>
                              </div>
                            )}
                            {activity.amount && (
                              <p className="text-sm font-medium text-green-600">Amount: Rs. {activity.amount.toLocaleString()}</p>
                            )}
                            {activity.refund && (
                              <p className="text-sm font-medium text-red-600">Refund: Rs. {activity.refund.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-blue-600" />
                    Achievements & Badges
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileStats.achievements.map((achievement) => (
                      <div key={achievement.id} className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        achievement.earned 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}>
                        <div className="flex items-center mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 ${
                            achievement.earned ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gray-300'
                          }`}>
                            {achievement.icon}
                          </div>
                          <div>
                            <h4 className={`font-semibold ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                              {achievement.name}
                            </h4>
                            <p className={`text-sm ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        {achievement.earned && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Earned</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Password Change */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-blue-600" />
                    Change Password
                  </h3>
                  
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Preferences */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-blue-600" />
                    Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates via SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Dark Mode</h4>
                        <p className="text-sm text-gray-600">Switch to dark theme</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
