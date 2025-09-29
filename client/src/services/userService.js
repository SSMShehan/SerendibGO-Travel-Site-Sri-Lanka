import apiService from './apiService';
import API_CONFIG from '../config/api';

class UserService {
  // Get all users (Admin only)
  static async getAllUsers(params = {}) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.USERS.LIST, {
        params
      });
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID (Admin only)
  static async getUserById(id) {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.USERS.DETAIL(id));
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Update user status (Admin only)
  static async updateUserStatus(id, statusData) {
    try {
      const response = await apiService.put(`${API_CONFIG.ENDPOINTS.USERS.DETAIL(id)}/status`, statusData);
      return response;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Delete user (Admin only)
  static async deleteUser(id) {
    try {
      const response = await apiService.delete(API_CONFIG.ENDPOINTS.USERS.DETAIL(id));
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Verify user (Admin only)
  static async verifyUser(id) {
    try {
      const response = await this.updateUserStatus(id, { isVerified: true });
      return response;
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  // Suspend user (Admin only)
  static async suspendUser(id) {
    try {
      const response = await this.updateUserStatus(id, { isActive: false });
      return response;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }

  // Activate user (Admin only)
  static async activateUser(id) {
    try {
      const response = await this.updateUserStatus(id, { isActive: true });
      return response;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  // Update user profile (User can update their own profile)
  static async updateProfile(userData) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE, userData);
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(passwordData) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData);
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Upload profile picture
  static async uploadProfilePicture(formData) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.USERS.UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }
}

export default UserService;
