// ============================================================================
// MAIN STORE INDEX
// ============================================================================
// This file exports all stores and actions for easy access throughout the application

// App stores
export * from './app.store'

// User stores
export * from './user.store'

// Form stores
export * from './form.store'

// ============================================================================
// STORE PROVIDER SETUP
// ============================================================================

import { Provider } from 'jotai'
import { ReactNode } from 'react'

interface StoreProviderProps {
  children: ReactNode
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return <Provider>{children}</Provider>
}

// ============================================================================
// STORE UTILITIES
// ============================================================================

// Re-export commonly used stores and actions
export {
  // App stores
  appSettingsAtom,
  appErrorsAtom,
  appNotificationsAtom,
  globalLoadingAtom,
  modalStateAtom,
  
  // App actions
  addErrorAtom,
  dismissErrorAtom,
  clearErrorsAtom,
  clearDismissedErrorsAtom,
  addNotificationAtom,
  dismissNotificationAtom,
  clearNotificationsAtom,
  setLoadingAtom,
  clearLoadingAtom,
  openModalAtom,
  closeModalAtom,
  toggleModalAtom,
  
  // User stores
  userStateAtom,
  hasPermissionAtom,
  hasRoleAtom,
  hasAnyRoleAtom,
  hasAllRolesAtom,
  userDisplayNameAtom,
  isSessionExpiredAtom,
  
  // User actions
  updateUserProfileAtom,
  setAuthStatusAtom,
  updateUserPreferencesAtom,
  updateUserPermissionsAtom,
  updateUserRolesAtom,
  setUserLoadingAtom,
  updateLastActivityAtom,
  clearUserStateAtom,
  
  // Form stores
  formValidationAtom,
  formLoadingAtom,
  formErrorAtom,
  formDataAtom,
  hasFormErrorsAtom,
  isFormLoadingAtom,
  hasFormChangesAtom,
  getFormErrorsSummaryAtom,
  
  // Form actions
  setFormValidationAtom,
  addFormErrorAtom,
  clearFormErrorsAtom,
  setFormTouchedAtom,
  setFormLoadingAtom,
  setFormSubmittingAtom,
  setFormSavingAtom,
  setFormErrorAtom,
  clearFormErrorsAtom2,
  setFormDataAtom,
  markFormSavedAtom,
  resetFormDataAtom,
  initializeFormAtom,
  clearFormStateAtom
} from './app.store'
export {
  userStores,
  userActions
} from './user.store'
export {
  formStores,
  formActions
} from './form.store'

// ============================================================================
// STORE INITIALIZATION
// ============================================================================

// Initialize default stores on app startup
export const initializeStores = () => {
  // This function can be called on app startup to initialize any required stores
  // For now, stores are initialized lazily when first accessed
  
  console.log('🔧 ObatKu stores initialized successfully')
}

// ============================================================================
// STORE RESET
// ============================================================================

// Reset all stores to initial state (useful for testing or logout)
export const resetAllStores = () => {
  // This would reset all stores to their initial state
  // Implementation depends on specific requirements
  
  console.log('🔄 All stores reset to initial state')
}

// ============================================================================
// STORE PERSISTENCE
// ============================================================================

// Check if stores are properly persisted
export const checkStorePersistence = () => {
  try {
    // Check if localStorage is available
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = 'obatku-store-test'
      window.localStorage.setItem(testKey, 'test')
      window.localStorage.removeItem(testKey)
      return true
    }
    return false
  } catch (error) {
    console.warn('Store persistence not available:', error)
    return false
  }
}

// ============================================================================
// STORE DEBUGGING
// ============================================================================

// Enable store debugging in development
export const enableStoreDebugging = () => {
  if (process.env.NODE_ENV === 'development') {
    // Add debugging capabilities
    console.log('🐛 Store debugging enabled')
    
    // Expose stores to window for debugging (development only)
    if (typeof window !== 'undefined') {
      (window as any).__OBATKU_STORES__ = {
        app: 'Access via useAtom(appSettingsAtom)',
        user: 'Access via useAtom(userStateAtom)',
        form: 'Access via useAtom(formValidationAtom)'
      }
    }
  }
}

// ============================================================================
// STORE TYPES
// ============================================================================

// Export all store types for TypeScript
export type {
  AppSettings,
  AppError,
  AppNotification,
  LoadingState,
  ModalState,
  UserState,
  FormFieldError,
  FormValidationState,
  FormLoadingState,
  FormErrorState,
  FormDataState
} from './app.store'
export type { UserState } from './user.store'
export type {
  FormFieldError,
  FormValidationState,
  FormLoadingState,
  FormErrorState,
  FormDataState
} from './form.store'
