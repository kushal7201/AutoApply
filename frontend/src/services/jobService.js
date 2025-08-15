import api from './api'

const jobService = {
  // Get all jobs with filters
  getJobs: async (filters = {}) => {
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
      
      const response = await api.get(`/jobs?${params.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get job by ID
  getJobById: async (jobId) => {
    try {
      const response = await api.get(`/jobs/${jobId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get search suggestions
  getSearchSuggestions: async (query) => {
    try {
      const response = await api.get(`/jobs/search/suggestions?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Save/unsave job
  saveJob: async (jobId) => {
    try {
      const response = await api.post(`/jobs/${jobId}/save`)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default jobService
