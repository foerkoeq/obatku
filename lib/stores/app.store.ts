import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// ============================================================================
// APPLICATION SETTINGS STATE
// ============================================================================

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'id' | 'en'
  sidebarCollapsed: boolean
  notifications: {
    enabled: boolean
    sound: boolean
    desktop: boolean
  }
  tableSettings: {
    pageSize: number
    showPagination: boolean
    showSearch: boolean
  }
  dashboard: {
    showCharts: boolean
    showStats: boolean
    refreshInterval: number
  }
}

export const defaultAppSettings: AppSettings = {
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
    refreshInterval: 30000 // 30 seconds
  }
}

// Persistent app settings atom
export const appSettingsAtom = atomWithStorage<AppSettings>(
  'obatku-app-settings',
  defaultAppSettings
)

// ============================================================================
// ERROR HANDLING STATE
// ============================================================================

export interface AppError {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  details?: string
  timestamp: Date
  dismissed: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export const appErrorsAtom = atom<AppError[]>([])

// Error actions
export const addErrorAtom = atom(
  null,
  (get, set, error: Omit<AppError, 'id' | 'timestamp' | 'dismissed'>) => {
    const errors = get(appErrorsAtom)
    const newError: AppError = {
      ...error,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      dismissed: false
    }
    set(appErrorsAtom, [...errors, newError])
  }
)

export const dismissErrorAtom = atom(
  null,
  (get, set, errorId: string) => {
    const errors = get(appErrorsAtom)
    set(appErrorsAtom, errors.map(error => 
      error.id === errorId ? { ...error, dismissed: true } : error
    ))
  }
)

export const clearErrorsAtom = atom(
  null,
  (get, set) => {
    set(appErrorsAtom, [])
  }
)

export const clearDismissedErrorsAtom = atom(
  null,
  (get, set) => {
    const errors = get(appErrorsAtom)
    set(appErrorsAtom, errors.filter(error => !error.dismissed))
  }
)

// ============================================================================
// NOTIFICATION STATE
// ============================================================================

export interface AppNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  timestamp: Date
  dismissed: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export const appNotificationsAtom = atom<AppNotification[]>([])

// Notification actions
export const addNotificationAtom = atom(
  null,
  (get, set, notification: Omit<AppNotification, 'id' | 'timestamp' | 'dismissed'>) => {
    const notifications = get(appNotificationsAtom)
    const newNotification: AppNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      dismissed: false
    }
    set(appNotificationsAtom, [...notifications, newNotification])
    
    // Auto-dismiss after duration
    if (notification.duration) {
      setTimeout(() => {
        set(dismissNotificationAtom, newNotification.id)
      }, notification.duration)
    }
  }
)

export const dismissNotificationAtom = atom(
  null,
  (get, set, notificationId: string) => {
    const notifications = get(appNotificationsAtom)
    set(appNotificationsAtom, notifications.map(notification => 
      notification.id === notificationId ? { ...notification, dismissed: true } : notification
    ))
  }
)

export const clearNotificationsAtom = atom(
  null,
  (get, set) => {
    set(appNotificationsAtom, [])
  }
)

// ============================================================================
// LOADING STATE
// ============================================================================

export interface LoadingState {
  [key: string]: boolean
}

export const globalLoadingAtom = atom<LoadingState>({})

export const setLoadingAtom = atom(
  null,
  (get, set, { key, loading }: { key: string; loading: boolean }) => {
    const current = get(globalLoadingAtom)
    set(globalLoadingAtom, { ...current, [key]: loading })
  }
)

export const clearLoadingAtom = atom(
  null,
  (get, set, key?: string) => {
    if (key) {
      const current = get(globalLoadingAtom)
      const { [key]: removed, ...rest } = current
      set(globalLoadingAtom, rest)
    } else {
      set(globalLoadingAtom, {})
    }
  }
)

// ============================================================================
// MODAL STATE
// ============================================================================

export interface ModalState {
  [key: string]: boolean
}

export const modalStateAtom = atom<ModalState>({})

export const openModalAtom = atom(
  null,
  (get, set, modalKey: string) => {
    const current = get(modalStateAtom)
    set(modalStateAtom, { ...current, [modalKey]: true })
  }
)

export const closeModalAtom = atom(
  null,
  (get, set, modalKey: string) => {
    const current = get(modalStateAtom)
    set(modalStateAtom, { ...current, [modalKey]: false })
  }
)

export const toggleModalAtom = atom(
  null,
  (get, set, modalKey: string) => {
    const current = get(modalStateAtom)
    set(modalStateAtom, { ...current, [modalKey]: !current[modalKey] })
  }
)

// ============================================================================
// EXPORT ALL STORES
// ============================================================================

export const stores = {
  appSettings: appSettingsAtom,
  appErrors: appErrorsAtom,
  appNotifications: appNotificationsAtom,
  globalLoading: globalLoadingAtom,
  modalState: modalStateAtom
}

export const actions = {
  addError: addErrorAtom,
  dismissError: dismissErrorAtom,
  clearErrors: clearErrorsAtom,
  clearDismissedErrors: clearDismissedErrorsAtom,
  addNotification: addNotificationAtom,
  dismissNotification: dismissNotificationAtom,
  clearNotifications: clearNotificationsAtom,
  setLoading: setLoadingAtom,
  clearLoading: clearLoadingAtom,
  openModal: openModalAtom,
  closeModal: closeModalAtom,
  toggleModal: toggleModalAtom
}
