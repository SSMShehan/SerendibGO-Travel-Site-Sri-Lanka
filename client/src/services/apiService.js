import API_CONFIG from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
    this.requestCache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  // Get headers with auth token if available
  getHeaders() {
    const token = this.getAuthToken();
    return {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      timeout: this.timeout,
      ...options
    };

    // Create cache key for GET requests
    const cacheKey = options.method === 'GET' ? `${url}_${JSON.stringify(config.headers)}` : null;
    
    // Check cache for GET requests
    if (cacheKey && this.requestCache.has(cacheKey)) {
      const cached = this.requestCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('ApiService: Using cached response for:', url);
        return cached.data;
      } else {
        this.requestCache.delete(cacheKey);
      }
    }

    console.log('ApiService: Making request to:', url);
    // console.log('ApiService: Config:', config);

    try {
      const response = await fetch(url, config);
      // console.log('ApiService: Response status:', response.status);
      // console.log('ApiService: Response headers:', response.headers);
      
      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Don't log 401 errors as they're expected for unauthenticated users
        if (response.status !== 401) {
          console.error('ApiService: HTTP error response:', errorData);
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        // console.log('ApiService: Response data:', data);
        
        // Cache successful GET responses
        if (cacheKey) {
          this.requestCache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        }
        
        return data;
      }
      
      const textData = await response.text();
      // console.log('ApiService: Response text:', textData);
      return textData;
    } catch (error) {
      console.error('ApiService: Request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;
