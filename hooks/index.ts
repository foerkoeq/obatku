// ============================================================================
// HOOKS INDEX
// ============================================================================
// This file exports all custom hooks for easy access throughout the application

// Store hooks
export * from './use-app-store'
export * from './use-user-store'
export * from './use-form-store'

// Existing hooks
export * from './use-add-medicine-form'
export * from './use-mutation-observer'
export * from './use-mounted'
export * from './use-mobile-menu'
export * from './use-menu-hover'
export * from './use-media-query'
export * from './use-config'

// ============================================================================
// HOOKS DOCUMENTATION
// ============================================================================

/**
 * Available Hooks:
 * 
 * Store Hooks:
 * - useAppStore() - Access to all app store functionality
 * - useAppSettings() - App settings management
 * - useAppErrors() - Error handling and display
 * - useAppNotifications() - Notification management
 * - useGlobalLoading() - Global loading state management
 * - useModalState() - Modal state management
 * 
 * User Hooks:
 * - useUserStore() - Complete user state management
 * - useUserState() - User profile and preferences
 * - useUserPermissions() - Permission and role checking
 * - useUserDisplay() - User display information
 * - useUserAuthActions() - Authentication actions
 * - useUserPreferences() - User preferences management
 * - useUserSession() - Session management
 * 
 * Form Hooks:
 * - useFormStore(formId) - Complete form state management
 * - useFormValidation(formId) - Form validation state
 * - useFormLoading(formId) - Form loading states
 * - useFormError(formId) - Form error handling
 * - useFormData(formId) - Form data management
 * - useFormState(formId) - Combined form state
 * - useFormUtils() - Form utility functions
 * 
 * Existing Hooks:
 * - useAddMedicineForm() - Medicine form management
 * - useMounted() - Component mount state
 * - useMobileMenu() - Mobile menu state
 * - useMenuHover() - Menu hover effects
 * - useMediaQuery() - Media query management
 * - useConfig() - Configuration management
 */

// ============================================================================
// HOOK USAGE EXAMPLES
// ============================================================================

/**
 * Basic Usage Examples:
 * 
 * // App Store
 * const { settings, notifications } = useAppStore()
 * 
 * // User Store
 * const { profile, isAuthenticated, hasPermission } = useUserStore()
 * 
 * // Form Store
 * const { validation, loading, errors, data } = useFormStore('medicine-form')
 * 
 * // Individual Hooks
 * const { createSuccessNotification } = useAppNotifications()
 * const { hasRole } = useUserPermissions()
 * const { startSubmitting } = useFormLoading('form-id')
 */
