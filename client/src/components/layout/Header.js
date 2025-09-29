import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, LogOut, ChevronDown, MapPin, Home, Building, Car, Calendar, HeadphonesIcon } from 'lucide-react';
import authService from '../../services/authService';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setShowUserMenu(false);
      navigate('/');
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white/80 via-blue-50/60 to-cyan-50/80 backdrop-blur-2xl border-b border-white/20 shadow-2xl shadow-blue-500/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="group transition-all duration-500 transform hover:scale-105">
              <Logo size="default" className="group-hover:opacity-90" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`group relative flex items-center px-5 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                isActiveRoute('/') 
                  ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
              }`}
            >
              <Home className={`w-4 h-4 mr-2 transition-transform duration-300 ${isActiveRoute('/') ? '' : 'group-hover:scale-110'}`} />
              <span className="font-medium">Home</span>
              {!isActiveRoute('/') && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Link>
            <Link 
              to="/tours" 
              className={`group relative flex items-center px-5 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                isActiveRoute('/tours') 
                  ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
              }`}
            >
              <MapPin className={`w-4 h-4 mr-2 transition-transform duration-300 ${isActiveRoute('/tours') ? '' : 'group-hover:scale-110'}`} />
              <span className="font-medium">Tours</span>
              {!isActiveRoute('/tours') && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Link>
            <Link 
              to="/hotels" 
              className={`group relative flex items-center px-5 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                isActiveRoute('/hotels') 
                  ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
              }`}
            >
              <Building className={`w-4 h-4 mr-2 transition-transform duration-300 ${isActiveRoute('/hotels') ? '' : 'group-hover:scale-110'}`} />
              <span className="font-medium">Hotels</span>
              {!isActiveRoute('/hotels') && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Link>
            <Link 
              to="/vehicles" 
              className={`group relative flex items-center px-5 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                isActiveRoute('/vehicles') 
                  ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
              }`}
            >
              <Car className={`w-4 h-4 mr-2 transition-transform duration-300 ${isActiveRoute('/vehicles') ? '' : 'group-hover:scale-110'}`} />
              <span className="font-medium">Vehicles</span>
              {!isActiveRoute('/vehicles') && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Link>
            <Link 
              to="/guides" 
              className={`group relative flex items-center px-5 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                isActiveRoute('/guides') 
                  ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
              }`}
            >
              <User className={`w-4 h-4 mr-2 transition-transform duration-300 ${isActiveRoute('/guides') ? '' : 'group-hover:scale-110'}`} />
              <span className="font-medium">Guides</span>
              {!isActiveRoute('/guides') && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Link>
            <Link 
              to="/plan-trip" 
              className={`group relative flex items-center px-5 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                isActiveRoute('/plan-trip') 
                  ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
              }`}
            >
              <Calendar className={`w-4 h-4 mr-2 transition-transform duration-300 ${isActiveRoute('/plan-trip') ? '' : 'group-hover:scale-110'}`} />
              <span className="font-medium">Plan Trip</span>
              {!isActiveRoute('/plan-trip') && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Link>
            {isAuthenticated && (
              <Link 
                to="/bookings" 
                className={`group relative flex items-center px-5 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isActiveRoute('/bookings') 
                    ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
                }`}
              >
                <Calendar className={`w-4 h-4 mr-2 transition-transform duration-300 ${isActiveRoute('/bookings') ? '' : 'group-hover:scale-110'}`} />
                <span className="font-medium">My Bookings</span>
                {!isActiveRoute('/bookings') && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              /* Authenticated User Menu */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="group flex items-center space-x-2 bg-white/60 hover:bg-white/80 px-5 py-3 rounded-2xl transition-all duration-300 border border-white/30 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300">
                    <span className="text-white text-sm font-medium">
                      {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-gray-700 font-medium group-hover:text-blue-600 transition-colors duration-300">{currentUser?.name || 'User'}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-all duration-300 group-hover:text-blue-600 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-blue-500/20 border border-white/30 py-4 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100/50">
                      <p className="text-sm font-semibold text-gray-800">{currentUser?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 capitalize bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{currentUser?.role || 'User'}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="group flex items-center px-5 py-3 mx-2 text-sm text-gray-700 hover:bg-white/60 hover:backdrop-blur-sm rounded-2xl transition-all duration-300 hover:text-blue-600"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      My Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="group flex items-center px-5 py-3 mx-2 text-sm text-gray-700 hover:bg-white/60 hover:backdrop-blur-sm rounded-2xl transition-all duration-300 hover:text-blue-600"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Calendar className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      Dashboard
                    </Link>
                    <Link
                      to="/support/my-requests"
                      className="group flex items-center px-5 py-3 mx-2 text-sm text-gray-700 hover:bg-white/60 hover:backdrop-blur-sm rounded-2xl transition-all duration-300 hover:text-blue-600"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <HeadphonesIcon className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      My Support Requests
                    </Link>
                    {currentUser?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="group flex items-center px-5 py-3 mx-2 text-sm text-gray-700 hover:bg-white/60 hover:backdrop-blur-sm rounded-2xl transition-all duration-300 hover:text-blue-600"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Building className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100/50 my-3 mx-2"></div>
                    <button
                      onClick={handleLogout}
                      className="group flex items-center w-full px-5 py-3 mx-2 text-sm text-red-600 hover:bg-red-50/60 hover:backdrop-blur-sm rounded-2xl transition-all duration-300 hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest User Buttons */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="group text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium px-5 py-3 rounded-2xl hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-105"
                >
                  <span className="group-hover:font-semibold transition-all duration-300">Login</span>
                </Link>
                <Link
                  to="/register"
                  className="group bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 font-medium backdrop-blur-sm"
                >
                  <span className="group-hover:font-semibold transition-all duration-300">Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden group p-3 rounded-2xl hover:bg-white/60 hover:backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors duration-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gradient-to-r from-white/90 via-blue-50/80 to-cyan-50/90 backdrop-blur-2xl border-t border-white/20 shadow-2xl shadow-blue-500/10 animate-in slide-in-from-top-2 duration-300">
          <div className="container mx-auto px-4 py-6">
            <nav className="space-y-3">
              <Link 
                to="/" 
                className={`group flex items-center px-5 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isActiveRoute('/') 
                    ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActiveRoute('/') ? '' : 'group-hover:scale-110'}`} />
                <span className="font-medium">Home</span>
              </Link>
              <Link 
                to="/tours" 
                className={`group flex items-center px-5 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isActiveRoute('/tours') 
                    ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MapPin className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActiveRoute('/tours') ? '' : 'group-hover:scale-110'}`} />
                <span className="font-medium">Tours</span>
              </Link>
              <Link 
                to="/hotels" 
                className={`group flex items-center px-5 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isActiveRoute('/hotels') 
                    ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Building className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActiveRoute('/hotels') ? '' : 'group-hover:scale-110'}`} />
                <span className="font-medium">Hotels</span>
              </Link>
              <Link 
                to="/vehicles" 
                className={`group flex items-center px-5 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isActiveRoute('/vehicles') 
                    ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Car className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActiveRoute('/vehicles') ? '' : 'group-hover:scale-110'}`} />
                <span className="font-medium">Vehicles</span>
              </Link>
              <Link 
                to="/guides" 
                className={`group flex items-center px-5 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isActiveRoute('/guides') 
                    ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActiveRoute('/guides') ? '' : 'group-hover:scale-110'}`} />
                <span className="font-medium">Guides</span>
              </Link>
              <Link 
                to="/plan-trip" 
                className={`group flex items-center px-5 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isActiveRoute('/plan-trip') 
                    ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Calendar className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActiveRoute('/plan-trip') ? '' : 'group-hover:scale-110'}`} />
                <span className="font-medium">Plan Trip</span>
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/bookings" 
                  className={`group flex items-center px-5 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    isActiveRoute('/bookings') 
                      ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Calendar className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActiveRoute('/bookings') ? '' : 'group-hover:scale-110'}`} />
                  <span className="font-medium">My Bookings</span>
                </Link>
              )}
              <Link 
                to="/support/contact" 
                className={`group flex items-center px-5 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isActiveRoute('/support') 
                    ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HeadphonesIcon className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActiveRoute('/support') ? '' : 'group-hover:scale-110'}`} />
                <span className="font-medium">Support</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;