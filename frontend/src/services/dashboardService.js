import api from './api'

const dashboardService = {
  // Get dashboard overview
  getOverview: async (period = '30d') => {
    try {
      const response = await api.get(`/dashboard/overview?period=${period}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get market insights
  getMarketInsights: async () => {
    try {
      const response = await api.get('/dashboard/market-insights')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get recommendations
  getRecommendations: async () => {
    try {
      const response = await api.get('/dashboard/recommendations')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default dashboardService
