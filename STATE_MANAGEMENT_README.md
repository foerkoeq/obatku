# 🚀 State Management System - ObatKu

## 📋 Overview

ObatKu menggunakan **Jotai** sebagai state management solution yang modern, performant, dan developer-friendly. Sistem ini menyediakan atomic state management dengan persistence, type safety, dan hooks yang mudah digunakan.

## 🏗️ Architecture

```
lib/stores/
├── app.store.ts          # Application-wide state
├── user.store.ts         # User state dan preferences
├── form.store.ts         # Form state management
└── index.ts              # Main store exports

hooks/
├── use-app-store.ts      # App store hooks
├── use-user-store.ts     # User store hooks
├── use-form-store.ts     # Form store hooks
└── index.ts              # Hooks exports

providers/
└── StoreProvider         # Jotai provider wrapper
```

## 🎯 Key Features

### ✨ **Modern & Performant**
- **Jotai**: Atomic state management dengan minimal re-renders
- **TypeScript**: Full type safety untuk semua state dan actions
- **Persistence**: Automatic localStorage persistence untuk critical state
- **Optimization**: Built-in optimization dengan atomic updates

### 🔧 **Developer Experience**
- **Custom Hooks**: Easy-to-use hooks untuk semua state operations
- **Type Safety**: IntelliSense dan compile-time error checking
- **Debugging**: Development tools dan debugging support
- **Testing**: Easy to test dengan atomic state management

### 📱 **Application Features**
- **Global State**: App settings, errors, notifications, loading
- **User State**: Authentication, profile, preferences, permissions
- **Form State**: Validation, loading, errors, data tracking
- **Real-time Updates**: Automatic state synchronization

## 🚀 Quick Start

### 1. Basic Usage

```tsx
import { useAppStore, useUserStore, useFormStore } from '@/hooks'

function MyComponent() {
  // App state
  const { settings, notifications } = useAppStore()
  
  // User state
  const { profile, isAuthenticated } = useUserStore()
  
  // Form state
  const { validation, loading, errors } = useFormStore('my-form')
  
  return <div>Hello {profile?.firstName}!</div>
}
```

### 2. State Updates

```tsx
function SettingsComponent() {
  const { settings, updateSettings } = useAppStore()
  
  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })
  }
  
  return (
    <button onClick={toggleTheme}>
      Current: {settings.theme}
    </button>
  )
}
```

### 3. Form Management

```tsx
function MedicineForm() {
  const form = useFormStore('medicine-form')
  
  useEffect(() => {
    // Initialize form with data
    form.initialize({
      name: '',
      category: '',
      price: 0
    })
  }, [])
  
  const handleSubmit = async (data: any) => {
    await form.loading.withSubmitting(async () => {
      // Submit form data
      await submitMedicine(data)
      form.markAsSaved()
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={!form.canSubmit}>
        {form.loading.isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

## 📚 Store Details

### 🏪 App Store (`app.store.ts`)

**Purpose**: Application-wide state management

**Features**:
- Theme management (light/dark/system)
- Language settings (ID/EN)
- UI preferences (sidebar, tables, dashboard)
- Notification settings
- Global loading states
- Modal state management

**Usage**:
```tsx
const { settings, updateSettings } = useAppSettings()
const { createSuccessNotification } = useAppNotifications()
const { startLoading, stopLoading } = useGlobalLoading()
```

### 👤 User Store (`user.store.ts`)

**Purpose**: User state dan preferences management

**Features**:
- User profile data
- Authentication state
- Role-based permissions
- User preferences
- Session management
- Activity tracking

**Usage**:
```tsx
const { profile, updateProfile } = useUserState()
const { hasPermission, hasRole } = useUserPermissions()
const { preferences, updatePreferences } = useUserPreferences()
```

### 📝 Form Store (`form.store.ts`)

**Purpose**: Form state management dengan validation

**Features**:
- Field validation state
- Loading states (submit, save, delete)
- Error handling (field, submit, network)
- Data tracking dengan change detection
- Auto-save functionality
- Form utilities

**Usage**:
```tsx
const { validation, loading, errors, data } = useFormStore('form-id')
const { addFieldError, clearFieldErrors } = useFormValidation('form-id')
const { startSubmitting, withSubmitting } = useFormLoading('form-id')
```

## 🔧 Custom Hooks

### App Store Hooks

```tsx
// Complete app store access
const appStore = useAppStore()

// Individual hooks
const { settings, updateSettings } = useAppSettings()
const { errors, createError } = useAppErrors()
const { notifications, createSuccessNotification } = useAppNotifications()
const { isLoading, withLoading } = useGlobalLoading()
const { isModalOpen, openModal } = useModalState()
```

### User Store Hooks

```tsx
// Complete user store access
const userStore = useUserStore()

// Individual hooks
const { profile, updateProfile } = useUserState()
const { hasPermission, hasRole } = useUserPermissions()
const { displayName, isSessionExpired } = useUserDisplay()
const { login, logout } = useUserAuthActions()
const { preferences, updatePreferences } = useUserPreferences()
const { sessionTimeout, refreshActivity } = useUserSession()
```

### Form Store Hooks

```tsx
// Complete form store access
const form = useFormStore('form-id')

// Individual hooks
const { validation, addFieldError } = useFormValidation('form-id')
const { loading, withSubmitting } = useFormLoading('form-id')
const { errors, setSubmitError } = useFormError('form-id')
const { data, updateData } = useFormData('form-id')
const { hasErrors, canSubmit } = useFormState('form-id')
```

## 🎨 Integration Examples

### 1. Theme Toggle

```tsx
function ThemeToggle() {
  const { settings, updateSettings } = useAppSettings()
  
  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light'
    updateSettings({ theme: newTheme })
  }
  
  return (
    <button onClick={toggleTheme}>
      {settings.theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

### 2. Permission-based Rendering

```tsx
function AdminPanel() {
  const { hasPermission } = useUserPermissions()
  
  if (!hasPermission('admin:access')) {
    return <div>Access Denied</div>
  }
  
  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin content */}
    </div>
  )
}
```

### 3. Form with Validation

```tsx
function MedicineForm() {
  const form = useFormStore('medicine-form')
  
  const handleSubmit = async (data: any) => {
    if (!form.canSubmit) return
    
    try {
      await form.loading.withSubmitting(async () => {
        await submitMedicine(data)
        form.markAsSaved()
        form.errors.clearAllErrors()
      })
    } catch (error) {
      form.errors.setSubmitError(error.message)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        onBlur={() => form.validation.markFieldTouched('name')}
      />
      {form.validation.hasFieldError('name') && (
        <span>{form.validation.getFieldErrorMessage('name')}</span>
      )}
      
      <button disabled={!form.canSubmit}>
        {form.loading.isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

### 4. Global Loading

```tsx
function DataTable() {
  const { isLoading, withLoading } = useGlobalLoading()
  
  const refreshData = async () => {
    await withLoading('data-refresh', async () => {
      await fetchData()
    })
  }
  
  return (
    <div>
      <button onClick={refreshData} disabled={isLoading}>
        {isLoading ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  )
}
```

## 🔒 Security & Best Practices

### 1. **State Isolation**
- Each form has unique ID untuk isolation
- User state terpisah dari app state
- Sensitive data tidak disimpan di localStorage

### 2. **Type Safety**
- Full TypeScript support
- Interface definitions untuk semua state
- Compile-time error checking

### 3. **Performance**
- Atomic updates untuk minimal re-renders
- Lazy loading untuk large state
- Automatic cleanup untuk unused state

### 4. **Error Handling**
- Structured error management
- User-friendly error messages
- Error recovery mechanisms

## 🧪 Testing

### 1. **Unit Testing**
```tsx
import { renderHook } from '@testing-library/react'
import { useAppStore } from '@/hooks/use-app-store'

test('should update settings', () => {
  const { result } = renderHook(() => useAppStore())
  
  act(() => {
    result.current.settings.updateSettings({ theme: 'dark' })
  })
  
  expect(result.current.settings.settings.theme).toBe('dark')
})
```

### 2. **Integration Testing**
```tsx
test('should handle form submission', async () => {
  const { result } = renderHook(() => useFormStore('test-form'))
  
  await act(async () => {
    await result.current.loading.withSubmitting(async () => {
      await submitForm()
    })
  })
  
  expect(result.current.loading.isSubmitting).toBe(false)
})
```

## 🚀 Migration Guide

### From Context API

```tsx
// Before (Context API)
const { user } = useContext(UserContext)

// After (Jotai)
const { profile } = useUserStore()
```

### From useState

```tsx
// Before (useState)
const [theme, setTheme] = useState('light')

// After (Jotai)
const { settings, updateSettings } = useAppSettings()
const theme = settings.theme
const setTheme = (newTheme: string) => updateSettings({ theme: newTheme })
```

### From useReducer

```tsx
// Before (useReducer)
const [state, dispatch] = useReducer(formReducer, initialState)

// After (Jotai)
const form = useFormStore('form-id')
// State dan actions tersedia langsung
```

## 📚 API Reference

### Store Actions

```tsx
// App Store
addError(error: AppError)
dismissError(errorId: string)
addNotification(notification: AppNotification)
setLoading(key: string, loading: boolean)

// User Store
updateProfile(profile: Partial<UserProfile>)
updatePreferences(preferences: Partial<UserPreferences>)
updatePermissions(permissions: UserPermission[])

// Form Store
initializeForm(formId: string, data: any)
setFormValidation(formId: string, validation: FormValidation)
setFormLoading(formId: string, type: string, loading: boolean)
```

### Store Selectors

```tsx
// App Store
appSettingsAtom
appErrorsAtom
appNotificationsAtom
globalLoadingAtom

// User Store
userStateAtom
hasPermissionAtom
hasRoleAtom
userDisplayNameAtom

// Form Store
formValidationAtom
formLoadingAtom
formErrorAtom
formDataAtom
```

## 🎉 Conclusion

State management system ObatKu menyediakan:

✅ **Modern Architecture**: Jotai dengan atomic state management
✅ **Type Safety**: Full TypeScript support
✅ **Developer Experience**: Easy-to-use hooks dan utilities
✅ **Performance**: Optimized dengan minimal re-renders
✅ **Scalability**: Modular design untuk easy expansion
✅ **Testing**: Easy to test dan debug
✅ **Documentation**: Comprehensive guides dan examples

Sistem ini siap untuk Phase 3: Form Integration dan dapat dengan mudah diintegrasikan dengan semua komponen yang ada.

---

**Next Steps**: 
1. Integrate form stores dengan existing forms
2. Add notification system integration
3. Implement error boundary dengan error stores
4. Add loading indicators dengan loading stores
