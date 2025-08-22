import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { UserProfile, UserRole, UserPermission } from '@/lib/types'

// ============================================================================
// USER PROFILE STATE
// ============================================================================

export interface UserState {
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  lastActivity: Date | null
  preferences: {
    dashboardLayout: 'grid' | 'list' | 'compact'
    defaultPageSize: number
    showTutorials: boolean
    language: 'id' | 'en'
    timezone: string
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
    currency: 'IDR' | 'USD'
  }
  permissions: UserPermission[]
  roles: UserRole[]
  sessionTimeout: number // in minutes
}

export const defaultUserPreferences = {
  dashboardLayout: 'grid' as const,
  defaultPageSize: 10,
  showTutorials: true,
  language: 'id' as const,
  timezone: 'Asia/Jakarta',
  dateFormat: 'DD/MM/YYYY' as const,
  currency: 'IDR' as const
}

export const defaultUserState: UserState = {
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  lastActivity: null,
  preferences: defaultUserPreferences,
  permissions: [],
  roles: [],
  sessionTimeout: 30 // 30 minutes
}

// User state atom
export const userStateAtom = atomWithStorage<UserState>(
  'obatku-user-state',
  defaultUserState
)

// ============================================================================
// USER ACTIONS
// ============================================================================

// Update user profile
export const updateUserProfileAtom = atom(
  null,
  (get, set, profile: Partial<UserProfile>) => {
    const current = get(userStateAtom)
    set(userStateAtom, {
      ...current,
      profile: current.profile ? { ...current.profile, ...profile } : null
    })
  }
)

// Set authentication status
export const setAuthStatusAtom = atom(
  null,
  (get, set, { isAuthenticated, profile }: { isAuthenticated: boolean; profile?: UserProfile }) => {
    const current = get(userStateAtom)
    set(userStateAtom, {
      ...current,
      isAuthenticated,
      profile: profile || current.profile,
      lastActivity: new Date(),
      isLoading: false
    })
  }
)

// Update user preferences
export const updateUserPreferencesAtom = atom(
  null,
  (get, set, preferences: Partial<UserState['preferences']>) => {
    const current = get(userStateAtom)
    set(userStateAtom, {
      ...current,
      preferences: { ...current.preferences, ...preferences }
    })
  }
)

// Update user permissions
export const updateUserPermissionsAtom = atom(
  null,
  (get, set, permissions: UserPermission[]) => {
    const current = get(userStateAtom)
    set(userStateAtom, {
      ...current,
      permissions
    })
  }
)

// Update user roles
export const updateUserRolesAtom = atom(
  null,
  (get, set, roles: UserRole[]) => {
    const current = get(userStateAtom)
    set(userStateAtom, {
      ...current,
      roles
    })
  }
)

// Set loading state
export const setUserLoadingAtom = atom(
  null,
  (get, set, isLoading: boolean) => {
    const current = get(userStateAtom)
    set(userStateAtom, {
      ...current,
      isLoading
    })
  }
)

// Update last activity
export const updateLastActivityAtom = atom(
  null,
  (get, set) => {
    const current = get(userStateAtom)
    set(userStateAtom, {
      ...current,
      lastActivity: new Date()
    })
  }
)

// Clear user state (logout)
export const clearUserStateAtom = atom(
  null,
  (get, set) => {
    set(userStateAtom, defaultUserState)
  }
)

// ============================================================================
// USER SELECTORS
// ============================================================================

// Check if user has specific permission
export const hasPermissionAtom = atom(
  (get) => (permission: UserPermission) => {
    const userState = get(userStateAtom)
    return userState.permissions.includes(permission)
  }
)

// Check if user has specific role
export const hasRoleAtom = atom(
  (get) => (role: UserRole) => {
    const userState = get(userStateAtom)
    return userState.roles.includes(role)
  }
)

// Check if user has any of the specified roles
export const hasAnyRoleAtom = atom(
  (get) => (roles: UserRole[]) => {
    const userState = get(userStateAtom)
    return roles.some(role => userState.roles.includes(role))
  }
)

// Check if user has all of the specified roles
export const hasAllRolesAtom = atom(
  (get) => (roles: UserRole[]) => {
    const userState = get(userStateAtom)
    return roles.every(role => userState.roles.includes(role))
  }
)

// Get user display name
export const userDisplayNameAtom = atom(
  (get) => {
    const userState = get(userStateAtom)
    if (!userState.profile) return 'Guest'
    
    if (userState.profile.firstName && userState.profile.lastName) {
      return `${userState.profile.firstName} ${userState.profile.lastName}`
    }
    
    return userState.profile.username || userState.profile.email || 'User'
  }
)

// Check if session is expired
export const isSessionExpiredAtom = atom(
  (get) => {
    const userState = get(userStateAtom)
    if (!userState.lastActivity) return true
    
    const now = new Date()
    const lastActivity = new Date(userState.lastActivity)
    const diffInMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60)
    
    return diffInMinutes > userState.sessionTimeout
  }
)

// ============================================================================
// EXPORT ALL USER STORES
// ============================================================================

export const userStores = {
  userState: userStateAtom,
  hasPermission: hasPermissionAtom,
  hasRole: hasRoleAtom,
  hasAnyRole: hasAnyRoleAtom,
  hasAllRoles: hasAllRolesAtom,
  userDisplayName: userDisplayNameAtom,
  isSessionExpired: isSessionExpiredAtom
}

export const userActions = {
  updateUserProfile: updateUserProfileAtom,
  setAuthStatus: setAuthStatusAtom,
  updateUserPreferences: updateUserPreferencesAtom,
  updateUserPermissions: updateUserPermissionsAtom,
  updateUserRoles: updateUserRolesAtom,
  setUserLoading: setUserLoadingAtom,
  updateLastActivity: updateLastActivityAtom,
  clearUserState: clearUserStateAtom
}
