import api from './api'

const profileService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/profile')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update personal information
  updatePersonalInfo: async (personalInfo) => {
    try {
      const response = await api.put('/profile/personal', personalInfo)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update skills
  updateSkills: async (skills) => {
    try {
      const response = await api.put('/profile/skills', { skills })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Upload resume
  uploadResume: async (formData) => {
    try {
      const response = await api.post('/profile/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get resumes
  getResumes: async () => {
    try {
      const response = await api.get('/profile/resumes')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Set default resume
  setDefaultResume: async (resumeId) => {
    try {
      const response = await api.put(`/profile/resume/${resumeId}/default`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Download resume
  downloadResume: async (resumeId) => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Create download URL with token as query parameter
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const downloadUrl = `${baseUrl}/api/profile/resume/${resumeId}/download?token=${token}`
      
      // Create a temporary link and click it
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = '' // This will use the filename from Content-Disposition header
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      return { success: true }
    } catch (error) {
      throw error
    }
  },

  // Delete resume
  deleteResume: async (resumeId) => {
    try {
      const response = await api.delete(`/profile/resume/${resumeId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Add work experience
  addWorkExperience: async (experience) => {
    try {
      const response = await api.post('/profile/experience', experience)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update work experience
  updateWorkExperience: async (experienceId, experience) => {
    try {
      const response = await api.put(`/profile/experience/${experienceId}`, experience)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete work experience
  deleteWorkExperience: async (experienceId) => {
    try {
      const response = await api.delete(`/profile/experience/${experienceId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Add education
  addEducation: async (education) => {
    try {
      const response = await api.post('/profile/education', education)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update education
  updateEducation: async (educationId, education) => {
    try {
      const response = await api.put(`/profile/education/${educationId}`, education)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete education
  deleteEducation: async (educationId) => {
    try {
      const response = await api.delete(`/profile/education/${educationId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update job preferences
  updateJobPreferences: async (preferences) => {
    try {
      const response = await api.put('/profile/preferences', preferences)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get profile completion status
  getProfileCompletion: async () => {
    try {
      const response = await api.get('/profile/completion')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default profileService
