import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import profileService from '../services/profileService'
import toast from 'react-hot-toast'

// Hook for fetching profile data
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// Hook for updating personal information
export const useUpdatePersonalInfo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileService.updatePersonalInfo,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['profile'])
      toast.success('Personal information updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update personal information')
    }
  })
}

// Hook for updating skills
export const useUpdateSkills = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileService.updateSkills,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile'])
      toast.success('Skills updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update skills')
    }
  })
}

// Hook for resume operations
export const useResumes = () => {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: profileService.getResumes,
    staleTime: 5 * 60 * 1000,
  })
}

export const useUploadResume = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileService.uploadResume,
    onSuccess: () => {
      queryClient.invalidateQueries(['resumes'])
      queryClient.invalidateQueries(['profile'])
      toast.success('Resume uploaded successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload resume')
    }
  })
}

export const useSetDefaultResume = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileService.setDefaultResume,
    onSuccess: () => {
      queryClient.invalidateQueries(['resumes'])
      queryClient.invalidateQueries(['profile'])
      toast.success('Default resume updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to set default resume')
    }
  })
}

export const useDeleteResume = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileService.deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries(['resumes'])
      queryClient.invalidateQueries(['profile'])
      toast.success('Resume deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete resume')
    }
  })
}

// Hook for work experience operations
export const useAddWorkExperience = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileService.addWorkExperience,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile'])
      toast.success('Work experience added successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add work experience')
    }
  })
}

export const useUpdateWorkExperience = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ experienceId, experience }) => 
      profileService.updateWorkExperience(experienceId, experience),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile'])
      toast.success('Work experience updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update work experience')
    }
  })
}

export const useDeleteWorkExperience = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileService.deleteWorkExperience,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile'])
      toast.success('Work experience deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete work experience')
    }
  })
}

// Hook for education operations
export const useAddEducation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileService.addEducation,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile'])
      toast.success('Education added successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add education')
    }
  })
}

export const useUpdateEducation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ educationId, education }) => 
      profileService.updateEducation(educationId, education),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile'])
      toast.success('Education updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update education')
    }
  })
}

export const useDeleteEducation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileService.deleteEducation,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile'])
      toast.success('Education deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete education')
    }
  })
}

// Hook for job preferences
export const useUpdateJobPreferences = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileService.updateJobPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile'])
      toast.success('Job preferences updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update job preferences')
    }
  })
}

// Hook for profile completion
export const useProfileCompletion = () => {
  return useQuery({
    queryKey: ['profile-completion'],
    queryFn: profileService.getProfileCompletion,
    staleTime: 5 * 60 * 1000,
  })
}
