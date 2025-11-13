'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  authService, 
  LoginCredentials, 
  LoginResponse, 
  UserProfile,
  ApiServiceError 
} from '@/lib/services'
import tokenStorage from '@/lib/utils/token-storage'
import { useUserStore } from '@/hooks/use-user-store'

// Authentication context interface
interface AuthContextType {
  // State
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
  
  // User management
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Authentication provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  
  // State
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // User store integration
  const { login: userStoreLogin, logout: userStoreLogout, updateProfile: userStoreUpdateProfile } = useUserStore()

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Check if user is authenticated
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      
             // Check if we have a valid token
       if (tokenStorage.isAuthenticated()) {
        // Verify token with backend
        const response = await authService.verifyToken()
        if (response.success && response.data) {
          setUser(response.data)
          setIsAuthenticated(true)
        } else {
          // Token is invalid, clear auth
          await clearAuth()
        }
      } else {
        // No token, clear auth
        await clearAuth()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      await clearAuth()
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Clear authentication data
  const clearAuth = useCallback(async () => {
    try {
             // Call logout endpoint if we have a token
       if (tokenStorage.isAuthenticated()) {
        await authService.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of logout success
      setUser(null)
      setIsAuthenticated(false)
      authService.clearAuth()
      
      // Clear user store
      userStoreLogout()
    }
  }, [])

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await authService.login(credentials)
      
      if (response.success && response.data) {
        // Transform user data to match UserProfile interface
        const userData: UserProfile = {
          id: response.data.user.id,
          name: response.data.user.name,
          nip: response.data.user.nip,
          email: response.data.user.email,
          phone: response.data.user.phone,
          role: response.data.user.role,
          permissions: response.data.user.permissions,
          avatar: response.data.user.avatar || response.data.user.avatarUrl,
          avatarUrl: response.data.user.avatarUrl,
          lastLogin: response.data.user.lastLogin,
          status: response.data.user.status,
        }
        
        // Set user data
        setUser(userData)
        setIsAuthenticated(true)
        
        // Update user store
        userStoreLogin(userData)
        
        // Show success message (toast will be shown by login form)
        
        // Redirect to dashboard after a short delay to ensure state is updated
        setTimeout(() => {
          router.push('/dashboard')
        }, 100)
      } else {
        const errorMessage = response.message || 'Login failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Login error:', error)
      
      let errorMessage = 'Terjadi kesalahan saat login'
      
      if (error instanceof ApiServiceError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router, userStoreLogin])

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await clearAuth()
      
      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, clear local state
      await clearAuth()
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }, [clearAuth, router])

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken()
      
      if (response.success && response.data) {
        // Token refreshed successfully
        // User data remains the same
        return
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Token refresh failed, logout user
      await clearAuth()
      router.push('/login')
    }
  }, [clearAuth, router])

  // Update user profile
  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    try {
      setError(null)
      
      const response = await authService.updateProfile(profileData)
      
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        setError(response.message || 'Profile update failed')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      
      if (error instanceof ApiServiceError) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred while updating profile')
      }
    }
  }, [])

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      setError(null)
      
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword: newPassword
      })
      
      if (!response.success) {
        setError(response.message || 'Password change failed')
      }
    } catch (error) {
      console.error('Password change error:', error)
      
      if (error instanceof ApiServiceError) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred while changing password')
      }
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Setup token refresh interval
  useEffect(() => {
    if (isAuthenticated) {
      // Refresh token every 14 minutes (assuming 15-minute expiry)
      const refreshInterval = setInterval(refreshToken, 14 * 60 * 1000)
      
      return () => clearInterval(refreshInterval)
    }
  }, [isAuthenticated, refreshToken])

  // Setup token expiry check
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check token expiry every minute
      const expiryCheckInterval = setInterval(() => {
                 const token = tokenStorage.getAccessToken()
         if (token && tokenStorage.isTokenExpired()) {
          console.log('Token expired, logging out')
          logout()
        }
      }, 60 * 1000)
      
      return () => clearInterval(expiryCheckInterval)
    }
  }, [isAuthenticated, user, logout])

  // Context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    clearError,
    updateProfile,
    changePassword
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Export default provider
export default AuthProvider