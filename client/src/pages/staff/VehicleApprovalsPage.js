import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  Car,
  MapPin,
  Star,
  Settings
} from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import StaffLayout from '../../components/layout/StaffLayout';

const VehicleApprovalsPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadVehicles();
  }, [currentPage, statusFilter, typeFilter]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        showAll: true, // Show all vehicles including inactive ones
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter })
      };

      const response = await vehicleService.getVehicles(params);
      
      if (response.success) {
        setVehicles(response.data.vehicles || response.data);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to load vehicles');
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleTypeChange = (type) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleVehicleAction = async (vehicleId, action) => {
    try {
      const newStatus = action === 'approve' ? 'active' : 
                       action === 'suspend' ? 'suspended' : 
                       action === 'maintenance' ? 'maintenance' : 'inactive';
      
      const response = await vehicleService.updateVehicle(vehicleId, { status: newStatus });
      
      if (response.success) {
        toast.success(`Vehicle ${action}d successfully`);
        loadVehicles(); // Reload vehicles
      } else {
        toast.error(response.message || `Failed to ${action} vehicle`);
      }
    } catch (error) {
      console.error(`Error ${action}ing vehicle:`, error);
      toast.error(`Failed to ${action} vehicle`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price, currency = 'LKR') => {
    return `${currency} ${price?.toLocaleString() || '0'}`;
  };

  // Get filtered vehicles based on current filters
  const getFilteredVehicles = () => {
    let filtered = vehicles;

    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vehicle => 
        vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Get status statistics
  const getStatusStats = () => {
    const stats = {
      all: vehicles.length,
      active: vehicles.filter(v => v.status === 'active').length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length,
      inactive: vehicles.filter(v => v.status === 'inactive').length,
      suspended: vehicles.filter(v => v.status === 'suspended').length
    };
    return stats;
  };

  const filteredVehicles = getFilteredVehicles();
  const statusStats = getStatusStats();

  return (
    <StaffLayout 
      title="Vehicle Management" 
      subtitle="Review and manage vehicle registrations and status"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Vehicles</p>
            <p className="text-2xl font-bold text-gray-900">{statusStats.all}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">{statusStats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Maintenance</p>
            <p className="text-2xl font-bold text-yellow-600">{statusStats.maintenance}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Suspended</p>
            <p className="text-2xl font-bold text-red-600">{statusStats.suspended}</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'all', label: 'All Vehicles', icon: '🚗' },
                { id: 'active', label: 'Active', icon: '✅' },
                { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
                { id: 'inactive', label: 'Inactive', icon: '⏸️' },
                { id: 'suspended', label: 'Suspended', icon: '🚫' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setStatusFilter(tab.id === 'all' ? '' : tab.id);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {statusStats[tab.id] > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {statusStats[tab.id]}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search vehicles..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="bus">Bus</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bicycle">Bicycle</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveTab('all');
                  setStatusFilter('');
                  setTypeFilter('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Vehicles List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading vehicles...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || activeTab !== 'all' || typeFilter 
                ? 'Try adjusting your search criteria or filters'
                : 'No vehicles have been registered yet'
              }
            </p>
            {(searchTerm || activeTab !== 'all' || typeFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveTab('all');
                  setStatusFilter('');
                  setTypeFilter('');
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{vehicle.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status?.charAt(0).toUpperCase() + vehicle.status?.slice(1)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>{vehicle.owner?.name || 'Unknown Owner'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{vehicle.location?.city}, {vehicle.location?.country}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>{formatPrice(vehicle.pricing?.daily)}/day</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2" />
                    <span>{vehicle.rating?.average?.toFixed(1) || '0.0'} ({vehicle.rating?.count || 0} reviews)</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Added {formatDate(vehicle.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => window.open(`/vehicles/${vehicle._id}`, '_blank')}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  
                  {vehicle.status === 'inactive' && (
                    <button
                      onClick={() => handleVehicleAction(vehicle._id, 'approve')}
                      className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-800 border border-green-300 rounded-md hover:bg-green-50 transition-colors flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                  )}
                  
                  {vehicle.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleVehicleAction(vehicle._id, 'suspend')}
                        className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Suspend
                      </button>
                      <button
                        onClick={() => handleVehicleAction(vehicle._id, 'maintenance')}
                        className="px-3 py-1 text-sm font-medium text-yellow-600 hover:text-yellow-800 border border-yellow-300 rounded-md hover:bg-yellow-50 transition-colors flex items-center"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Maintenance
                      </button>
                    </>
                  )}
                  
                  {vehicle.status === 'suspended' && (
                    <button
                      onClick={() => handleVehicleAction(vehicle._id, 'approve')}
                      className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-800 border border-green-300 rounded-md hover:bg-green-50 transition-colors flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Reactivate
                    </button>
                  )}
                  
                  {vehicle.status === 'maintenance' && (
                    <button
                      onClick={() => handleVehicleAction(vehicle._id, 'approve')}
                      className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-800 border border-green-300 rounded-md hover:bg-green-50 transition-colors flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default VehicleApprovalsPage;
