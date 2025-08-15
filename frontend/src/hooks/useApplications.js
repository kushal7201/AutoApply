import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import applicationService from '../services/applicationService'
import toast from 'react-hot-toast'

// Get applications with filters
export const useApplications = (filters = {}) => {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => applicationService.getApplications(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Get single application
export const useApplication = (applicationId) => {
  return useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => applicationService.getApplicationById(applicationId),
    enabled: !!applicationId,
    staleTime: 2 * 60 * 1000
  })
}

// Get application analytics
export const useApplicationAnalytics = (period = '30d') => {
  return useQuery({
    queryKey: ['application-analytics', period],
    queryFn: () => applicationService.getAnalytics(period),
    staleTime: 5 * 60 * 1000
  })
}

// Create application mutation
export const useCreateApplication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: applicationService.createApplication,
    onSuccess: (data) => {
      toast.success(data.message || 'Application created successfully')
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] }) // To update application status on jobs
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create application')
    }
  })
}

// Update application status mutation
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicationId, status, description }) => 
      applicationService.updateApplicationStatus(applicationId, status, description),
    onSuccess: (data) => {
      toast.success(data.message || 'Application status updated')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update application status')
    }
  })
}

// Update application mutation
export const useUpdateApplication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicationId, updateData }) => 
      applicationService.updateApplication(applicationId, updateData),
    onSuccess: (data) => {
      toast.success(data.message || 'Application updated successfully')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update application')
    }
  })
}

// Add note mutation
export const useAddNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicationId, note }) => 
      applicationService.addNote(applicationId, note),
    onSuccess: (data) => {
      toast.success(data.message || 'Note added successfully')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add note')
    }
  })
}

// Archive application mutation
export const useArchiveApplication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicationId, archived }) => 
      applicationService.archiveApplication(applicationId, archived),
    onSuccess: (data) => {
      toast.success(data.message || 'Application archived successfully')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to archive application')
    }
  })
}

// Delete application mutation
export const useDeleteApplication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: applicationService.deleteApplication,
    onSuccess: (data) => {
      toast.success(data.message || 'Application deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete application')
    }
  })
}
