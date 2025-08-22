import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  appSettingsAtom,
  appErrorsAtom,
  appNotificationsAtom,
  globalLoadingAtom,
  modalStateAtom,
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
  type AppSettings,
  type AppError,
  type AppNotification,
  type LoadingState,
  type ModalState
} from '@/lib/stores'

// ============================================================================
// APP SETTINGS HOOK
// ============================================================================

export const useAppSettings = () => {
  const [settings, setSettings] = useAtom(appSettingsAtom)
  
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings({ ...settings, ...updates })
  }
  
  const resetSettings = () => {
    setSettings({
      theme: 'system',
      language: 'id',
      sidebarCollapsed: false,
      notifications: {
        enabled: true,
        sound: true,
        desktop: false
      },
      tableSettings: {
        pageSize: 10,
        showPagination: true,
        showSearch: true
      },
      dashboard: {
        showCharts: true,
        showStats: true,
        refreshInterval: 30000
      }
    })
  }
  
  return {
    settings,
    updateSettings,
    resetSettings
  }
}

// ============================================================================
// APP ERRORS HOOK
// ============================================================================

export const useAppErrors = () => {
  const errors = useAtomValue(appErrorsAtom)
  const addError = useSetAtom(addErrorAtom)
  const dismissError = useSetAtom(dismissErrorAtom)
  const clearErrors = useSetAtom(clearErrorsAtom)
  const clearDismissedErrors = useSetAtom(clearDismissedErrorsAtom)
  
  const activeErrors = errors.filter(error => !error.dismissed)
  const dismissedErrors = errors.filter(error => error.dismissed)
  
  const createError = (error: Omit<AppError, 'id' | 'timestamp' | 'dismissed'>) => {
    addError(error)
  }
  
  const createSimpleError = (title: string, message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    createError({ title, message, type })
  }
  
  return {
    errors: activeErrors,
    dismissedErrors,
    allErrors: errors,
    createError,
    createSimpleError,
    dismissError,
    clearErrors,
    clearDismissedErrors,
    hasErrors: activeErrors.length > 0
  }
}

// ============================================================================
// APP NOTIFICATIONS HOOK
// ============================================================================

export const useAppNotifications = () => {
  const notifications = useAtomValue(appNotificationsAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const dismissNotification = useSetAtom(dismissNotificationAtom)
  const clearNotifications = useSetAtom(clearNotificationsAtom)
  
  const activeNotifications = notifications.filter(notification => !notification.dismissed)
  
  const createNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'dismissed'>) => {
    addNotification(notification)
  }
  
  const createSimpleNotification = (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration?: number
  ) => {
    createNotification({ title, message, type, duration })
  }
  
  const createSuccessNotification = (title: string, message: string, duration = 5000) => {
    createSimpleNotification(title, message, 'success', duration)
  }
  
  const createErrorNotification = (title: string, message: string, duration = 10000) => {
    createSimpleNotification(title, message, 'error', duration)
  }
  
  const createWarningNotification = (title: string, message: string, duration = 8000) => {
    createSimpleNotification(title, message, 'warning', duration)
  }
  
  const createInfoNotification = (title: string, message: string, duration = 5000) => {
    createSimpleNotification(title, message, 'info', duration)
  }
  
  return {
    notifications: activeNotifications,
    allNotifications: notifications,
    createNotification,
    createSimpleNotification,
    createSuccessNotification,
    createErrorNotification,
    createWarningNotification,
    createInfoNotification,
    dismissNotification,
    clearNotifications,
    hasNotifications: activeNotifications.length > 0
  }
}

// ============================================================================
// GLOBAL LOADING HOOK
// ============================================================================

export const useGlobalLoading = () => {
  const loadingState = useAtomValue(globalLoadingAtom)
  const setLoading = useSetAtom(setLoadingAtom)
  const clearLoading = useSetAtom(clearLoadingAtom)
  
  const isLoading = Object.values(loadingState).some(loading => loading)
  const loadingKeys = Object.keys(loadingState).filter(key => loadingState[key])
  
  const startLoading = (key: string) => setLoading({ key, loading: true })
  const stopLoading = (key: string) => setLoading({ key, loading: false })
  const clearAllLoading = () => clearLoading()
  
  const withLoading = async <T>(key: string, operation: () => Promise<T>): Promise<T> => {
    try {
      startLoading(key)
      return await operation()
    } finally {
      stopLoading(key)
    }
  }
  
  return {
    loadingState,
    isLoading,
    loadingKeys,
    startLoading,
    stopLoading,
    clearAllLoading,
    withLoading
  }
}

// ============================================================================
// MODAL STATE HOOK
// ============================================================================

export const useModalState = () => {
  const modalState = useAtomValue(modalStateAtom)
  const openModal = useSetAtom(openModalAtom)
  const closeModal = useSetAtom(closeModalAtom)
  const toggleModal = useSetAtom(toggleModalAtom)
  
  const isModalOpen = (key: string) => modalState[key] || false
  
  const openModalWithKey = (key: string) => openModal(key)
  const closeModalWithKey = (key: string) => closeModal(key)
  const toggleModalWithKey = (key: string) => toggleModal(key)
  
  return {
    modalState,
    isModalOpen,
    openModal: openModalWithKey,
    closeModal: closeModalWithKey,
    toggleModal: toggleModalWithKey
  }
}

// ============================================================================
// COMBINED APP STORE HOOK
// ============================================================================

export const useAppStore = () => {
  const appSettings = useAppSettings()
  const appErrors = useAppErrors()
  const appNotifications = useAppNotifications()
  const globalLoading = useGlobalLoading()
  const modalState = useModalState()
  
  return {
    settings: appSettings,
    errors: appErrors,
    notifications: appNotifications,
    loading: globalLoading,
    modals: modalState
  }
}
