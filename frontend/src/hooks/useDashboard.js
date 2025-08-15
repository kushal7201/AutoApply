import { useQuery } from '@tanstack/react-query'
import dashboardService from '../services/dashboardService'

// Get dashboard overview
export const useDashboardOverview = (period = '30d') => {
  return useQuery({
    queryKey: ['dashboard-overview', period],
    queryFn: () => dashboardService.getOverview(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  })
}

// Get market insights
export const useMarketInsights = () => {
  return useQuery({
    queryKey: ['market-insights'],
    queryFn: dashboardService.getMarketInsights,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000 // 1 hour
  })
}

// Get recommendations
export const useRecommendations = () => {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: dashboardService.getRecommendations,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 20 * 60 * 1000 // 20 minutes
  })
}

// Combined dashboard hook
export const useDashboard = (period = '30d') => {
  const overview = useDashboardOverview(period)
  const insights = useMarketInsights()
  const recommendations = useRecommendations()

  return {
    overview,
    insights,
    recommendations,
    isLoading: overview.isLoading || insights.isLoading || recommendations.isLoading,
    error: overview.error || insights.error || recommendations.error
  }
}
