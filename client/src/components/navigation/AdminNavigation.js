import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Car,
  MapPin,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  FileText,
  Shield,
  Building2,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AdminNavigation = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: Home,
      description: 'Overview and statistics'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      description: 'Manage user accounts'
    },
    {
      name: 'Reviews',
      href: '/admin/reviews',
      icon: Star,
      description: 'Manage customer reviews',
      badge: 'new'
    },
    {
      name: 'Content',
      href: '/admin/content',
      icon: FileText,
      description: 'Manage platform content'
    },
    {
      name: 'Trip Requests',
      href: '/admin/trip-requests',
      icon: MapPin,
      description: 'Manage custom trip requests',
      badge: 'pending'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Site statistics and reports'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'Admin settings and preferences'
    },
    {
      name: 'Admin',
      href: '/admin',
      icon: Shield,
      description: 'Admin panel access'
    }
  ];

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'pending':
        return Clock;
      case 'new':
        return CheckCircle;
      case 'urgent':
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white/95 lg:backdrop-blur-xl lg:border-r lg:border-gray-200/50 lg:shadow-xl lg:shadow-blue-500/5">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SerendibGo</h1>
              <p className="text-xs text-gray-500 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const BadgeIcon = item.badge ? getBadgeIcon(item.badge) : null;
            const isItemActive = isActive(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isItemActive
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-r-2 border-blue-700 shadow-md shadow-blue-500/10'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 hover:text-gray-900 hover:shadow-md'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 transition-all duration-300 ${isItemActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-600 group-hover:scale-110'}`} />
                <span className="flex-1 group-hover:font-semibold transition-all duration-300">{item.name}</span>
                {item.badge && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300 group-hover:scale-110 ${getBadgeColor(item.badge)}`}>
                    {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-1" />}
                    {item.badge}
                  </span>
                )}
                {!isItemActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Info & Logout */}
        <div className="px-4 py-4 border-t border-gray-200/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Admin</p>
              <p className="text-xs text-gray-500 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">SerendibGo Admin</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="group w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600 group-hover:scale-110 transition-all duration-300" />
            <span className="group-hover:font-semibold transition-all duration-300">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 flex items-center justify-between shadow-lg shadow-blue-500/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">SerendibGo</h1>
              <p className="text-xs text-gray-500 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Admin Portal</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="group p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 hover:shadow-md"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <Menu className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-xl shadow-blue-500/5 animate-in slide-in-from-top-2 duration-300">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const BadgeIcon = item.badge ? getBadgeIcon(item.badge) : null;
                const isItemActive = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      isItemActive
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 shadow-md shadow-blue-500/10'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 hover:text-gray-900 hover:shadow-md'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 transition-all duration-300 ${isItemActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-600 group-hover:scale-110'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="group-hover:font-semibold transition-all duration-300">{item.name}</span>
                        {item.badge && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300 group-hover:scale-110 ${getBadgeColor(item.badge)}`}>
                            {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-1" />}
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-600 transition-colors duration-300">{item.description}</p>
                    </div>
                    {!isItemActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </Link>
                );
              })}
              
              {/* Mobile Logout */}
              <div className="border-t border-gray-200/50 pt-3 mt-3">
                <button
                  onClick={handleLogout}
                  className="group w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600 group-hover:scale-110 transition-all duration-300" />
                  <span className="group-hover:font-semibold transition-all duration-300">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminNavigation;
