import api from './api'

const applicationService = {
  // Get all applications
  getApplications: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
          } else {
            params.append(key, value)
          }
        }
      })
      
      const response = await api.get(`/applications?${params.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get application by ID
  getApplicationById: async (applicationId) => {
    try {
      const response = await api.get(`/applications/${applicationId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Create new application
  createApplication: async (applicationData) => {
    try {
      const response = await api.post('/applications', applicationData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update application status
  updateApplicationStatus: async (applicationId, status, description) => {
    try {
      const response = await api.put(`/applications/${applicationId}/status`, {
        status,
        description
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update application
  updateApplication: async (applicationId, updateData) => {
    try {
      const response = await api.put(`/applications/${applicationId}`, updateData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Add note to application
  addNote: async (applicationId, note) => {
    try {
      const response = await api.post(`/applications/${applicationId}/notes`, note)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Archive/unarchive application
  archiveApplication: async (applicationId, archived = true) => {
    try {
      const response = await api.put(`/applications/${applicationId}/archive`, { archived })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete application
  deleteApplication: async (applicationId) => {
    try {
      const response = await api.delete(`/applications/${applicationId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get application analytics
  getAnalytics: async (period = '30d') => {
    try {
      const response = await api.get(`/applications/analytics/overview?period=${period}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default applicationService
