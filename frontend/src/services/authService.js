import api from './api'

const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response
    } catch (error) {
      throw error
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data.user
    } catch (error) {
      throw error
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout')
      return response
    } catch (error) {
      throw error
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken })
      return response
    } catch (error) {
      throw error
    }
  },

  // Update password
  updatePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/password', passwordData)
      return response
    } catch (error) {
      throw error
    }
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/auth/preferences', { preferences })
      return response
    } catch (error) {
      throw error
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response
    } catch (error) {
      throw error
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password })
      return response
    } catch (error) {
      throw error
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token })
      return response
    } catch (error) {
      throw error
    }
  },

  // Resend verification email
  resendVerification: async () => {
    try {
      const response = await api.post('/auth/resend-verification')
      return response
    } catch (error) {
      throw error
    }
  }
}

export default authService
