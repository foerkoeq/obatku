import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  userStateAtom,
  hasPermissionAtom,
  hasRoleAtom,
  hasAnyRoleAtom,
  hasAllRolesAtom,
  userDisplayNameAtom,
  isSessionExpiredAtom,
  updateUserProfileAtom,
  setAuthStatusAtom,
  updateUserPreferencesAtom,
  updateUserPermissionsAtom,
  updateUserRolesAtom,
  setUserLoadingAtom,
  updateLastActivityAtom,
  clearUserStateAtom,
  type UserState
} from '@/lib/stores'

// ============================================================================
// USER STATE HOOK
// ============================================================================

export const useUserState = () => {
  const [userState, setUserState] = useAtom(userStateAtom)
  
  const updateProfile = (profileData: Partial<UserState['profile']>) => {
    setUserState(prev => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...profileData } : null
    }))
  }
  
  const updatePreferences = (preferences: Partial<UserState['preferences']>) => {
    setUserState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferences }
    }))
  }
  
  const updatePermissions = (permissions: UserState['permissions']) => {
    setUserState(prev => ({
      ...prev,
      permissions
    }))
  }
  
  const updateRoles = (roles: UserState['roles']) => {
    setUserState(prev => ({
      ...prev,
      roles
    }))
  }
  
  const setLoading = (isLoading: boolean) => {
    setUserState(prev => ({
      ...prev,
      isLoading
    }))
  }
  
  const updateActivity = () => {
    setUserState(prev => ({
      ...prev,
      lastActivity: new Date()
    }))
  }
  
  const resetUserState = () => {
    setUserState({
      profile: null,
      isAuthenticated: false,
      isLoading: true,
      lastActivity: null,
      preferences: {
        dashboardLayout: 'grid',
        defaultPageSize: 10,
        showTutorials: true,
        language: 'id',
        timezone: 'Asia/Jakarta',
        dateFormat: 'DD/MM/YYYY',
        currency: 'IDR'
      },
      permissions: [],
      roles: [],
      sessionTimeout: 30
    })
  }
  
  return {
    userState,
    profile: userState.profile,
    isAuthenticated: userState.isAuthenticated,
    isLoading: userState.isLoading,
    lastActivity: userState.lastActivity,
    preferences: userState.preferences,
    permissions: userState.permissions,
    roles: userState.roles,
    sessionTimeout: userState.sessionTimeout,
    updateProfile,
    updatePreferences,
    updatePermissions,
    updateRoles,
    setLoading,
    updateActivity,
    resetUserState
  }
}

// ============================================================================
// USER PERMISSIONS HOOK
// ============================================================================

export const useUserPermissions = () => {
  const hasPermission = useAtomValue(hasPermissionAtom)
  const hasRole = useAtomValue(hasRoleAtom)
  const hasAnyRole = useAtomValue(hasAnyRoleAtom)
  const hasAllRoles = useAtomValue(hasAllRolesAtom)
  
  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles
  }
}

// ============================================================================
// USER DISPLAY HOOK
// ============================================================================

export const useUserDisplay = () => {
  const displayName = useAtomValue(userDisplayNameAtom)
  const isSessionExpired = useAtomValue(isSessionExpiredAtom)
  
  return {
    displayName,
    isSessionExpired
  }
}

// ============================================================================
// USER AUTH ACTIONS HOOK
// ============================================================================

export const useUserAuthActions = () => {
  const setAuthStatus = useSetAtom(setAuthStatusAtom)
  const setUserLoading = useSetAtom(setUserLoadingAtom)
  const updateLastActivity = useSetAtom(updateLastActivityAtom)
  const clearUserState = useSetAtom(clearUserStateAtom)
  
  const login = (profile: UserState['profile']) => {
    setAuthStatus({ isAuthenticated: true, profile })
    updateLastActivity()
  }
  
  const logout = () => {
    setAuthStatus({ isAuthenticated: false })
    clearUserState()
  }
  
  const setLoading = (isLoading: boolean) => {
    setUserLoading(isLoading)
  }
  
  const refreshActivity = () => {
    updateLastActivity()
  }
  
  return {
    login,
    logout,
    setLoading,
    refreshActivity
  }
}

// ============================================================================
// USER PREFERENCES HOOK
// ============================================================================

export const useUserPreferences = () => {
  const { preferences, updatePreferences } = useUserState()
  
  const updateDashboardLayout = (layout: UserState['preferences']['dashboardLayout']) => {
    updatePreferences({ dashboardLayout: layout })
  }
  
  const updatePageSize = (pageSize: number) => {
    updatePreferences({ defaultPageSize: pageSize })
  }
  
  const toggleTutorials = () => {
    updatePreferences({ showTutorials: !preferences.showTutorials })
  }
  
  const updateLanguage = (language: UserState['preferences']['language']) => {
    updatePreferences({ language })
  }
  
  const updateTimezone = (timezone: string) => {
    updatePreferences({ timezone })
  }
  
  const updateDateFormat = (dateFormat: UserState['preferences']['dateFormat']) => {
    updatePreferences({ dateFormat })
  }
  
  const updateCurrency = (currency: UserState['preferences']['currency']) => {
    updatePreferences({ currency })
  }
  
  return {
    preferences,
    updateDashboardLayout,
    updatePageSize,
    toggleTutorials,
    updateLanguage,
    updateTimezone,
    updateDateFormat,
    updateCurrency,
    updatePreferences
  }
}

// ============================================================================
// USER SESSION HOOK
// ============================================================================

export const useUserSession = () => {
  const { sessionTimeout, lastActivity, isAuthenticated } = useUserState()
  const { isSessionExpired } = useUserDisplay()
  const { refreshActivity } = useUserAuthActions()
  
  const getSessionTimeRemaining = () => {
    if (!lastActivity || !isAuthenticated) return 0
    
    const now = new Date()
    const lastActivityTime = new Date(lastActivity)
    const elapsedMinutes = (now.getTime() - lastActivityTime.getTime()) / (1000 * 60)
    
    return Math.max(0, sessionTimeout - elapsedMinutes)
  }
  
  const getSessionProgress = () => {
    if (!isAuthenticated) return 0
    
    const timeRemaining = getSessionTimeRemaining()
    return ((sessionTimeout - timeRemaining) / sessionTimeout) * 100
  }
  
  const isSessionExpiringSoon = () => {
    const timeRemaining = getSessionTimeRemaining()
    return timeRemaining <= 5 // 5 minutes warning
  }
  
  return {
    sessionTimeout,
    lastActivity,
    isAuthenticated,
    isSessionExpired,
    getSessionTimeRemaining,
    getSessionProgress,
    isSessionExpiringSoon,
    refreshActivity
  }
}

// ============================================================================
// COMBINED USER STORE HOOK
// ============================================================================

export const useUserStore = () => {
  const userState = useUserState()
  const permissions = useUserPermissions()
  const display = useUserDisplay()
  const authActions = useUserAuthActions()
  const preferences = useUserPreferences()
  const session = useUserSession()
  
  return {
    ...userState,
    ...permissions,
    ...display,
    ...authActions,
    ...preferences,
    ...session
  }
}
