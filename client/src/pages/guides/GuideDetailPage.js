import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowLeft,
  Phone,
  Mail,
  X,
  Edit2,
  Sparkles,
  Award,
  Shield,
  Heart,
  Calendar,
  Globe
} from 'lucide-react';
import guideService from '../../services/guideService';
import messageService from '../../services/messageService';
import reviewService from '../../services/reviewService';
import { toast } from 'react-hot-toast';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ReviewForm from '../../components/reviews/ReviewForm';
import ReviewList from '../../components/reviews/ReviewList';
import RatingOverview from '../../components/reviews/RatingOverview';
import { useAuth } from '../../contexts/AuthContext';

const GuideDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [messageData, setMessageData] = useState({
    subject: '',
    message: '',
    contactMethod: 'email'
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const loadGuide = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await guideService.getGuideById(id);
      
      if (response.success) {
        setGuide(response.guide);
      } else {
        setError('Guide not found');
      }
    } catch (err) {
      console.error('Error loading guide:', err);
      setError('Failed to load guide details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGuide();
  }, [loadGuide]);

  useEffect(() => {
    if (guide) {
      loadReviews();
    }
  }, [guide]);

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await reviewService.getGuideReviews(id, {
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 100
      });

      if (response.success && response.data) {
        setReviews(response.data.reviews || []);

        // Calculate rating statistics
        const stats = reviewService.calculateRatingDistribution(response.data.reviews || []);
        setRatingStats(stats);

        // Update guide rating if different
        if (guide && stats.averageRating !== guide.rating?.average) {
          setGuide(prev => ({
            ...prev,
            rating: {
              average: stats.averageRating,
              count: stats.totalReviews
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    console.log('=== GuideDetailPage Review Submission Debug ===');
    console.log('Received review data from form:', reviewData);

    try {
      const data = {
        guideId: id,
        rating: reviewData.rating,
        comment: reviewData.review || reviewData.comment,
        images: reviewData.images
      };

      console.log('Formatted data for API:', data);
      console.log('Guide ID:', id);
      console.log('Is editing review?', !!editingReview);

      let response;
      if (editingReview) {
        console.log('Updating existing review:', editingReview._id);
        response = await reviewService.updateReview(editingReview._id, data);
      } else {
        console.log('Creating new review...');
        response = await reviewService.createReview(data);
      }

      console.log('API Response:', response);

      if (response.success) {
        console.log('Review submission successful');
        toast.success(editingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
        setShowReviewForm(false);
        setEditingReview(null);
        console.log('Reloading reviews...');
        await loadReviews();
        console.log('Reviews reloaded successfully');
      } else {
        console.error('API returned failure:', response.message);
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('=== Review Submission Error ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error stack:', error.stack);

      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }

      throw error;
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await reviewService.deleteReview(reviewId);
      if (response.success) {
        toast.success('Review deleted successfully');
        await loadReviews();
      }
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleHelpfulVote = async (reviewId, voteData) => {
    // Update the review in the list with new vote data
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review._id === reviewId
          ? { ...review, helpful: voteData.helpful, notHelpful: voteData.notHelpful }
          : review
      )
    );
  };

  const formatPrice = (price, currency = 'LKR') => {
    return `${currency} ${price?.toLocaleString()}`;
  };

  const getSpecializationColor = (specialization) => {
    const colors = {
      cultural: 'bg-purple-100 text-purple-800',
      historical: 'bg-blue-100 text-blue-800',
      wildlife: 'bg-green-100 text-green-800',
      adventure: 'bg-orange-100 text-orange-800',
      culinary: 'bg-red-100 text-red-800',
      photography: 'bg-pink-100 text-pink-800',
      nature: 'bg-emerald-100 text-emerald-800',
      religious: 'bg-indigo-100 text-indigo-800',
      archaeological: 'bg-yellow-100 text-yellow-800',
      'eco-tourism': 'bg-teal-100 text-teal-800',
      medical: 'bg-cyan-100 text-cyan-800',
      language: 'bg-violet-100 text-violet-800'
    };
    return colors[specialization] || 'bg-gray-100 text-gray-800';
  };

  const getLanguageProficiency = (proficiency) => {
    const levels = {
      basic: 'Basic',
      conversational: 'Conversational',
      fluent: 'Fluent',
      native: 'Native'
    };
    return levels[proficiency] || proficiency;
  };

  const handleSendMessage = () => {
    setShowMessageModal(true);
    // Pre-fill subject with guide's name
    setMessageData(prev => ({
      ...prev,
      subject: `Inquiry about ${guide?.user?.name || 'Guide'} services`
    }));
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();

    if (!messageData.subject.trim() || !messageData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSendingMessage(true);
    try {
      const response = await messageService.sendMessage({
        guideId: id,
        subject: messageData.subject,
        message: messageData.message,
        contactMethod: messageData.contactMethod
      });

      if (response.success) {
        toast.success('Message sent successfully! The guide will contact you soon.');
        setShowMessageModal(false);
        setMessageData({
          subject: '',
          message: '',
          contactMethod: 'email'
        });
      } else {
        toast.error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMessageInputChange = (e) => {
    const { name, value } = e.target;
    setMessageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading guide details...</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LoadingSkeleton type="card" count={3} />
            </div>
            <div>
              <LoadingSkeleton type="card" count={2} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mb-8">
              <button
                onClick={() => navigate('/guides')}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Guides
              </button>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Guide Not Found</h2>
              <p className="text-gray-600 mb-8">Failed to load guide details</p>
              <button
                onClick={() => navigate('/guides')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
              >
                Back to Guides
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Guide Not Found</h2>
            <p className="text-gray-600 mb-8">The guide you're looking for doesn't exist</p>
            <button
              onClick={() => navigate('/guides')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              Back to Guides
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/guides')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-indigo-200/50 hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Guides
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Guide Header */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8">
              <div className="flex items-start space-x-8">
                <div className="relative">
                  <img
                    src={guide.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                    alt={guide.user?.name || 'Guide'}
                    className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-lg"
                  />
                  {guide.isVerified && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-4xl font-bold text-gray-900">
                      {guide.user?.name || 'Guide'}
                    </h1>
                    {guide.isVerified ? (
                      <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verified Guide
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                        <XCircle className="w-4 h-4 mr-2" />
                        Pending Verification
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                      <span className="font-medium">{guide.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-500" />
                      <span className="font-medium">
                        {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : 'No rating'} ({ratingStats.totalReviews} reviews)
                      </span>
                    </div>
                  </div>

                  {guide.profile?.bio && (
                    <p className="text-gray-700 mb-6 text-lg leading-relaxed">{guide.profile.bio}</p>
                  )}

                  {/* Specializations */}
                  {guide.profile?.specializations && guide.profile.specializations.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h3>
                      <div className="flex flex-wrap gap-3">
                        {guide.profile.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className={`px-4 py-2 rounded-2xl text-sm font-semibold ${getSpecializationColor(spec)} border`}
                          >
                            {spec.charAt(0).toUpperCase() + spec.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {guide.profile?.languages && guide.profile.languages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-3">
                        {guide.profile.languages.map((lang, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200"
                          >
                            {lang.language} ({getLanguageProficiency(lang.proficiency)})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Experience & Education */}
            {(guide.profile?.experience || guide.profile?.education) && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Award className="w-6 h-6 mr-3 text-indigo-600" />
                  Background
                </h2>
                
                {guide.profile?.experience && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience</h3>
                    <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50">
                      <Clock className="w-6 h-6 text-indigo-600 mr-3" />
                      <p className="text-gray-700 font-medium">{guide.profile.experience} years of guiding experience</p>
                    </div>
                  </div>
                )}

                {guide.profile?.education && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                    <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
                      <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
                      <p className="text-gray-700 font-medium">{guide.profile.education}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Services */}
            {guide.services && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Heart className="w-6 h-6 mr-3 text-indigo-600" />
                  Services
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Tour Types */}
                  {guide.services.tourTypes && guide.services.tourTypes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tour Types</h3>
                      <div className="flex flex-wrap gap-3">
                        {guide.services.tourTypes.map((type, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Group Size */}
                  {guide.services.groupSize && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Size</h3>
                      <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50">
                        <Users className="w-6 h-6 text-blue-600 mr-3" />
                        <span className="text-gray-700 font-medium">
                          {guide.services.groupSize.min} - {guide.services.groupSize.max} people
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Duration */}
                  {guide.services.duration && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Duration</h3>
                      <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200/50">
                        <Clock className="w-6 h-6 text-orange-600 mr-3" />
                        <span className="text-gray-700 font-medium">
                          {guide.services.duration.min} - {guide.services.duration.max} days
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Pricing */}
          {guide.pricing && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-indigo-600" />
                Pricing
              </h2>
              
              <div className="space-y-4">
                {guide.pricing.hourly > 0 && (
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50">
                    <span className="text-gray-700 font-medium">Hourly</span>
                    <span className="font-bold text-lg text-indigo-600">{formatPrice(guide.pricing.hourly, guide.pricing.currency)}</span>
                  </div>
                )}
                {guide.pricing.daily > 0 && (
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
                    <span className="text-gray-700 font-medium">Daily</span>
                    <span className="font-bold text-lg text-purple-600">{formatPrice(guide.pricing.daily, guide.pricing.currency)}</span>
                  </div>
                )}
                {guide.pricing.weekly > 0 && (
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl border border-pink-200/50">
                    <span className="text-gray-700 font-medium">Weekly</span>
                    <span className="font-bold text-lg text-pink-600">{formatPrice(guide.pricing.weekly, guide.pricing.currency)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews & Ratings Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Star className="w-6 h-6 mr-3 text-indigo-600" />
                Reviews
              </h2>
              {user && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl hover:bg-indigo-100 transition-all duration-300 font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Write Review
                </button>
              )}
            </div>

            {/* Rating Summary */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(ratingStats.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-4xl font-bold text-gray-800">
                  {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : '0.0'}
                </span>
              </div>
              <p className="text-gray-600 font-medium">
                Based on {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution Bars */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingStats.distribution[rating] || 0;
                const percentage = ratingStats.totalReviews > 0
                  ? Math.round((count / ratingStats.totalReviews) * 100)
                  : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-4 font-medium">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-10 text-right font-medium">{percentage}%</span>
                  </div>
                );
              })}
            </div>

            {/* View All Reviews Button */}
            {ratingStats.totalReviews > 0 && (
              <button
                onClick={() => document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' })}
                className="mt-6 w-full text-sm text-indigo-600 hover:text-indigo-700 font-semibold bg-indigo-50 px-4 py-3 rounded-2xl hover:bg-indigo-100 transition-all duration-300"
              >
                View All Reviews →
              </button>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-indigo-600" />
              Contact
            </h2>
            
            <div className="space-y-4">
              {guide.user?.email && (
                <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50">
                  <Mail className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-gray-700 font-medium">{guide.user.email}</span>
                </div>
              )}
              {guide.user?.profile?.phone && (
                <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                  <Phone className="w-6 h-6 text-green-600 mr-3" />
                  <span className="text-gray-700 font-medium">{guide.user.profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8">
            <div className="space-y-4">
              <Link
                to={`/guides/${id}/book`}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 text-center block font-semibold text-lg shadow-lg"
              >
                Book This Guide
              </Link>
              
              <button 
                onClick={handleSendMessage}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg"
              >
                <MessageSquare className="w-5 h-5 inline mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reviews Section */}
      <div id="reviews-section" className="mt-16">
        <div className="container mx-auto px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-200/50 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Star className="w-8 h-8 mr-3 text-indigo-600" />
              All Reviews
            </h2>

            {reviewsLoading ? (
              <div className="space-y-6">
                <LoadingSkeleton type="text" count={3} />
              </div>
            ) : (
              <ReviewList
                reviews={reviews}
                onHelpfulVote={handleHelpfulVote}
                currentUserId={user?._id || user?.userId}
                onReviewUpdate={handleEditReview}
              />
            )}
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-indigo-200/50">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-indigo-200/50 px-8 py-6 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingReview ? 'Edit Review' : 'Write a Review'}
              </h3>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-2xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <ReviewForm
                booking={{
                  id: id,
                  title: guide?.user?.name || 'Guide',
                  type: 'guide'
                }}
                initialData={editingReview ? {
                  rating: editingReview.rating,
                  review: editingReview.comment,
                  images: editingReview.images || []
                } : null}
                onSubmit={handleSubmitReview}
                onCancel={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-indigo-200/50">
            <div className="flex items-center justify-between p-8 border-b border-indigo-200/50">
              <h3 className="text-2xl font-bold text-gray-900">
                Send Message to {guide?.user?.name || 'Guide'}
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-2xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleMessageSubmit} className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={messageData.subject}
                    onChange={handleMessageInputChange}
                    className="w-full px-4 py-3 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium"
                    placeholder="Enter message subject"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Contact Method
                  </label>
                  <select
                    name="contactMethod"
                    value={messageData.contactMethod}
                    onChange={handleMessageInputChange}
                    className="w-full px-4 py-3 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={messageData.message}
                    onChange={handleMessageInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium"
                    placeholder="Tell the guide about your requirements, preferred dates, group size, etc."
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                >
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default GuideDetailPage;
