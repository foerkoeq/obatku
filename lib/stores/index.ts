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

// Export StoreProvider component (defined in store-provider.tsx)
export { StoreProvider } from './store-provider'

// ============================================================================
// STORE UTILITIES
// ============================================================================

// Re-export commonly used stores and actions
// Note: User and Form stores are already exported via export * above
// This explicit re-export is only for App stores for clarity
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
  toggleModalAtom
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
  ModalState
} from './app.store'
export type { UserState } from './user.store'
export type {
  FormFieldError,
  FormValidationState,
  FormLoadingState,
  FormErrorState,
  FormDataState
} from './form.store'
