// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API client class
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('accessToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('accessToken');
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          this.setToken(null);
        }
        
        // Create proper error message
        let errorMessage;
        if (typeof data === 'object' && data.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // File upload
  async upload(endpoint, formData, options = {}) {
    const token = this.getToken();
    const config = {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }
}

// Create and export API client instance
const apiClient = new ApiClient();

// Authentication API calls
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post(`/auth/reset-password/${token}`, { password }),
  getMe: () => apiClient.get('/auth/me'),
};

// Profile API calls
export const profileAPI = {
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (profileData) => apiClient.put('/profile', profileData),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return apiClient.upload('/profile/resume', formData);
  },
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return apiClient.upload('/profile/photo', formData);
  },
  getResumes: () => apiClient.get('/profile/resumes'),
  deleteResume: (resumeId) => apiClient.delete(`/profile/resume/${resumeId}`),
  setPrimaryResume: (resumeId) => apiClient.put(`/profile/resume/${resumeId}/primary`),
};

// Jobs API calls
export const jobsAPI = {
  searchJobs: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/jobs/search?${queryString}`);
  },
  getJob: (jobId) => apiClient.get(`/jobs/${jobId}`),
  saveJob: (jobId) => apiClient.post(`/jobs/${jobId}/save`),
  unsaveJob: (jobId) => apiClient.delete(`/jobs/${jobId}/save`),
  getSavedJobs: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/jobs/saved?${queryString}`);
  },
};

// Applications API calls
export const applicationsAPI = {
  applyToJob: (jobId, applicationData) => apiClient.post(`/applications/apply/${jobId}`, applicationData),
  getApplications: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/applications?${queryString}`);
  },
  getApplication: (applicationId) => apiClient.get(`/applications/${applicationId}`),
  retryApplication: (applicationId) => apiClient.post(`/applications/${applicationId}/retry`),
  cancelApplication: (applicationId) => apiClient.delete(`/applications/${applicationId}`),
  startRapidApply: (config) => apiClient.post('/applications/rapid-apply/start', config),
  stopRapidApply: () => apiClient.post('/applications/rapid-apply/stop'),
  getRapidApplyStatus: () => apiClient.get('/applications/rapid-apply/status'),
  getApplicationStats: () => apiClient.get('/applications/stats'),
};

// Export the API client for direct use if needed
export default apiClient;
