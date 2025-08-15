import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import authService from '@/services/authService'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (token) {
          // Verify token and get user data
          const userData = await authService.getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Remove invalid token
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await authService.login(credentials)
      
      if (response.success) {
        const { user: userData, token, refreshToken } = response.data
        
        // Store tokens
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)
        
        // Set user data
        setUser(userData)
        
        // Show success message
        toast.success(`Welcome back, ${userData.firstName}!`)
        
        // Redirect to dashboard or intended page
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from, { replace: true })
        
        return { success: true }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authService.register(userData)
      
      if (response.success) {
        const { user: newUser, token, refreshToken } = response.data
        
        // Store tokens
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)
        
        // Set user data
        setUser(newUser)
        
        // Show success message
        toast.success(`Welcome to AutoApply, ${newUser.firstName}!`)
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true })
        
        return { success: true }
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async (showMessage = true) => {
    try {
      // Call logout API
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      setUser(null)
      
      if (showMessage) {
        toast.success('Logged out successfully')
      }
      
      navigate('/', { replace: true })
    }
  }

  // Update user function
  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }))
  }

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role
  }

  // Check if user can perform action
  const canPerform = (action) => {
    if (!user) return false
    
    // Define role permissions
    const permissions = {
      admin: ['all'],
      moderator: ['moderate', 'view_analytics'],
      user: ['apply_jobs', 'manage_profile']
    }
    
    const userPermissions = permissions[user.role] || []
    return userPermissions.includes('all') || userPermissions.includes(action)
  }

  const value = {
    user,
    loading,
    initialized,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    canPerform
  }

  // Don't render children until auth is initialized
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
