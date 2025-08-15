import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import jobService from '../services/jobService'
import toast from 'react-hot-toast'

// Get jobs with filters
export const useJobs = (filters = {}) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.getJobs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  })
}

// Get single job
export const useJob = (jobId) => {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobService.getJobById(jobId),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000
  })
}

// Get search suggestions
export const useSearchSuggestions = (query) => {
  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => jobService.getSearchSuggestions(query),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000
  })
}

// Save job mutation
export const useSaveJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: jobService.saveJob,
    onSuccess: (data) => {
      toast.success(data.message || 'Job saved successfully')
      // Invalidate jobs queries to update save status
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save job')
    }
  })
}
