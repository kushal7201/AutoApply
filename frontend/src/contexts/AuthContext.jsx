import { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { authAPI } from '../services/api';

// Create Auth Context
const AuthContext = createContext({});

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      console.log('🔐 InitAuth - Token exists:', !!token);
      
      if (token) {
        try {
          // Set token in API client
          apiClient.setToken(token);
          console.log('📡 InitAuth - Making /auth/me request...');
          
          const response = await authAPI.getMe();
          console.log('✅ InitAuth - Success:', response);
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('❌ Failed to get user:', error);
          console.log('🧹 InitAuth - Clearing invalid token');
          localStorage.removeItem('accessToken');
          apiClient.setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('🚫 InitAuth - No token found');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Transform firstName + lastName to name for backend
      const registrationData = {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: userData.password
      };
      
      const response = await authAPI.register(registrationData);
      
      if (response.success) {
        const { user, accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        apiClient.setToken(accessToken);
        setUser(user);
        setIsAuthenticated(true);
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔑 Login - Attempting login...');
      const response = await authAPI.login(credentials);
      console.log('📥 Login - Response received:', response);
      
      if (response.success) {
        const { user, accessToken } = response.data;
        console.log('💾 Login - Storing token in localStorage');
        localStorage.setItem('accessToken', accessToken);
        apiClient.setToken(accessToken);
        setUser(user);
        setIsAuthenticated(true);
        console.log('✅ Login - Success!');
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      console.error('❌ Login - Failed:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Try to call logout API, but don't fail if it errors
      await authAPI.logout();
    } catch (error) {
      // Ignore logout API errors - we'll clean up locally anyway
      console.warn('Logout API call failed (this is ok):', error.message);
    } finally {
      // Always clear local state regardless of API call result
      localStorage.removeItem('accessToken');
      apiClient.setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.forgotPassword(email);
      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Failed to send reset email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.resetPassword(token, password);
      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Failed to reset password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Clear error function
  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    clearError,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
