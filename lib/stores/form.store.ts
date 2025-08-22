import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// ============================================================================
// FORM VALIDATION STATE
// ============================================================================

export interface FormFieldError {
  field: string
  message: string
  type: 'error' | 'warning' | 'info'
}

export interface FormValidationState {
  [formId: string]: {
    isValid: boolean
    errors: FormFieldError[]
    touched: string[]
    dirty: boolean
    lastValidated: Date | null
  }
}

export const formValidationAtom = atom<FormValidationState>({})

// ============================================================================
// FORM LOADING STATE
// ============================================================================

export interface FormLoadingState {
  [formId: string]: {
    isSubmitting: boolean
    isLoading: boolean
    isSaving: boolean
    isDeleting: boolean
    isRefreshing: boolean
  }
}

export const formLoadingAtom = atom<FormLoadingState>({})

// ============================================================================
// FORM ERROR STATE
// ============================================================================

export interface FormErrorState {
  [formId: string]: {
    submitError: string | null
    validationErrors: string[]
    networkError: string | null
    serverError: string | null
    lastError: Date | null
  }
}

export const formErrorAtom = atom<FormErrorState>({})

// ============================================================================
// FORM DATA STATE
// ============================================================================

export interface FormDataState {
  [formId: string]: {
    initialData: any
    currentData: any
    hasChanges: boolean
    lastSaved: Date | null
    autoSave: boolean
    autoSaveInterval: number // in milliseconds
  }
}

export const formDataAtom = atom<FormDataState>({})

// ============================================================================
// FORM ACTIONS
// ============================================================================

// Validation actions
export const setFormValidationAtom = atom(
  null,
  (get, set, { formId, validation }: { formId: string; validation: FormValidationState[string] }) => {
    const current = get(formValidationAtom)
    set(formValidationAtom, {
      ...current,
      [formId]: validation
    })
  }
)

export const addFormErrorAtom = atom(
  null,
  (get, set, { formId, error }: { formId: string; error: FormFieldError }) => {
    const current = get(formValidationAtom)
    const formValidation = current[formId] || {
      isValid: false,
      errors: [],
      touched: [],
      dirty: false,
      lastValidated: null
    }
    
    set(formValidationAtom, {
      ...current,
      [formId]: {
        ...formValidation,
        errors: [...formValidation.errors, error],
        isValid: false,
        lastValidated: new Date()
      }
    })
  }
)

export const clearFormErrorsAtom = atom(
  null,
  (get, set, formId: string) => {
    const current = get(formValidationAtom)
    if (current[formId]) {
      set(formValidationAtom, {
        ...current,
        [formId]: {
          ...current[formId],
          errors: [],
          isValid: true
        }
      })
    }
  }
)

export const setFormTouchedAtom = atom(
  null,
  (get, set, { formId, field }: { formId: string; field: string }) => {
    const current = get(formValidationAtom)
    const formValidation = current[formId] || {
      isValid: false,
      errors: [],
      touched: [],
      dirty: false,
      lastValidated: null
    }
    
    if (!formValidation.touched.includes(field)) {
      set(formValidationAtom, {
        ...current,
        [formId]: {
          ...formValidation,
          touched: [...formValidation.touched, field]
        }
      })
    }
  }
)

// Loading actions
export const setFormLoadingAtom = atom(
  null,
  (get, set, { formId, loadingType, loading }: { formId: string; loadingType: keyof FormLoadingState[string]; loading: boolean }) => {
    const current = get(formLoadingAtom)
    const formLoading = current[formId] || {
      isSubmitting: false,
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      isRefreshing: false
    }
    
    set(formLoadingAtom, {
      ...current,
      [formId]: {
        ...formLoading,
        [loadingType]: loading
      }
    })
  }
)

export const setFormSubmittingAtom = atom(
  null,
  (get, set, { formId, isSubmitting }: { formId: string; isSubmitting: boolean }) => {
    set(setFormLoadingAtom, { formId, loadingType: 'isSubmitting', loading: isSubmitting })
  }
)

export const setFormSavingAtom = atom(
  null,
  (get, set, { formId, isSaving }: { formId: string; isSaving: boolean }) => {
    set(setFormLoadingAtom, { formId, loadingType: 'isSaving', loading: isSaving })
  }
)

// Error actions
export const setFormErrorAtom = atom(
  null,
  (get, set, { formId, errorType, error }: { formId: string; errorType: keyof FormErrorState[string]; error: string | null }) => {
    const current = get(formErrorAtom)
    const formError = current[formId] || {
      submitError: null,
      validationErrors: [],
      networkError: null,
      serverError: null,
      lastError: null
    }
    
    set(formErrorAtom, {
      ...current,
      [formId]: {
        ...formError,
        [errorType]: error,
        lastError: error ? new Date() : formError.lastError
      }
    })
  }
)

export const clearFormErrorsAtom2 = atom(
  null,
  (get, set, formId: string) => {
    const current = get(formErrorAtom)
    if (current[formId]) {
      set(formErrorAtom, {
        ...current,
        [formId]: {
          submitError: null,
          validationErrors: [],
          networkError: null,
          serverError: null,
          lastError: null
        }
      })
    }
  }
)

// Data actions
export const setFormDataAtom = atom(
  null,
  (get, set, { formId, data, isInitial = false }: { formId: string; data: any; isInitial?: boolean }) => {
    const current = get(formDataAtom)
    const formData = current[formId] || {
      initialData: null,
      currentData: null,
      hasChanges: false,
      lastSaved: null,
      autoSave: false,
      autoSaveInterval: 30000
    }
    
    if (isInitial) {
      set(formDataAtom, {
        ...current,
        [formId]: {
          ...formData,
          initialData: data,
          currentData: data,
          hasChanges: false
        }
      })
    } else {
      const hasChanges = JSON.stringify(data) !== JSON.stringify(formData.initialData)
      set(formDataAtom, {
        ...current,
        [formId]: {
          ...formData,
          currentData: data,
          hasChanges
        }
      })
    }
  }
)

export const markFormSavedAtom = atom(
  null,
  (get, set, formId: string) => {
    const current = get(formDataAtom)
    if (current[formId]) {
      set(formDataAtom, {
        ...current,
        [formId]: {
          ...current[formId],
          hasChanges: false,
          lastSaved: new Date()
        }
      })
    }
  }
)

export const resetFormDataAtom = atom(
  null,
  (get, set, formId: string) => {
    const current = get(formDataAtom)
    if (current[formId]) {
      set(formDataAtom, {
        ...current,
        [formId]: {
          ...current[formId],
          currentData: current[formId].initialData,
          hasChanges: false
        }
      })
    }
  }
)

// ============================================================================
// FORM SELECTORS
// ============================================================================

// Check if form has errors
export const hasFormErrorsAtom = atom(
  (get) => (formId: string) => {
    const validation = get(formValidationAtom)[formId]
    const errors = get(formErrorAtom)[formId]
    
    if (!validation && !errors) return false
    
    const hasValidationErrors = validation?.errors.length > 0
    const hasFormErrors = errors?.submitError || errors?.networkError || errors?.serverError
    
    return hasValidationErrors || hasFormErrors
  }
)

// Check if form is loading
export const isFormLoadingAtom = atom(
  (get) => (formId: string) => {
    const loading = get(formLoadingAtom)[formId]
    if (!loading) return false
    
    return loading.isSubmitting || loading.isLoading || loading.isSaving || loading.isDeleting || loading.isRefreshing
  }
)

// Check if form has changes
export const hasFormChangesAtom = atom(
  (get) => (formId: string) => {
    const data = get(formDataAtom)[formId]
    return data?.hasChanges || false
  }
)

// Get form errors summary
export const getFormErrorsSummaryAtom = atom(
  (get) => (formId: string) => {
    const validation = get(formValidationAtom)[formId]
    const errors = get(formErrorAtom)[formId]
    
    const allErrors: string[] = []
    
    if (validation?.errors) {
      allErrors.push(...validation.errors.map(e => e.message))
    }
    
    if (errors?.submitError) allErrors.push(errors.submitError)
    if (errors?.networkError) allErrors.push(errors.networkError)
    if (errors?.serverError) allErrors.push(errors.serverError)
    
    return allErrors
  }
)

// ============================================================================
// FORM UTILITIES
// ============================================================================

// Initialize form state
export const initializeFormAtom = atom(
  null,
  (get, set, { formId, initialData, autoSave = false, autoSaveInterval = 30000 }: {
    formId: string
    initialData: any
    autoSave?: boolean
    autoSaveInterval?: number
  }) => {
    // Set initial data
    set(setFormDataAtom, { formId, data: initialData, isInitial: true })
    
    // Initialize validation state
    set(setFormValidationAtom, {
      formId,
      validation: {
        isValid: true,
        errors: [],
        touched: [],
        dirty: false,
        lastValidated: null
      }
    })
    
    // Initialize loading state
    set(setFormLoadingAtom, {
      formId,
      loadingType: 'isLoading',
      loading: false
    })
    
    // Initialize error state
    set(setFormErrorAtom, {
      formId,
      errorType: 'submitError',
      error: null
    })
    
    // Set auto-save if enabled
    if (autoSave) {
      const current = get(formDataAtom)
      set(formDataAtom, {
        ...current,
        [formId]: {
          ...current[formId],
          autoSave: true,
          autoSaveInterval
        }
      })
    }
  }
)

// Clear form state
export const clearFormStateAtom = atom(
  null,
  (get, set, formId: string) => {
    // Clear validation
    set(clearFormErrorsAtom, formId)
    
    // Clear loading
    set(setFormLoadingAtom, { formId, loadingType: 'isLoading', loading: false })
    
    // Clear errors
    set(clearFormErrorsAtom2, formId)
    
    // Clear data
    const current = get(formDataAtom)
    if (current[formId]) {
      const { [formId]: removed, ...rest } = current
      set(formDataAtom, rest)
    }
  }
)

// ============================================================================
// EXPORT ALL FORM STORES
// ============================================================================

export const formStores = {
  formValidation: formValidationAtom,
  formLoading: formLoadingAtom,
  formError: formErrorAtom,
  formData: formDataAtom,
  hasFormErrors: hasFormErrorsAtom,
  isFormLoading: isFormLoadingAtom,
  hasFormChanges: hasFormChangesAtom,
  getFormErrorsSummary: getFormErrorsSummaryAtom
}

export const formActions = {
  setFormValidation: setFormValidationAtom,
  addFormError: addFormErrorAtom,
  clearFormErrors: clearFormErrorsAtom,
  setFormTouched: setFormTouchedAtom,
  setFormLoading: setFormLoadingAtom,
  setFormSubmitting: setFormSubmittingAtom,
  setFormSaving: setFormSavingAtom,
  setFormError: setFormErrorAtom,
  clearFormErrors2: clearFormErrorsAtom2,
  setFormData: setFormDataAtom,
  markFormSaved: markFormSavedAtom,
  resetFormData: resetFormDataAtom,
  initializeForm: initializeFormAtom,
  clearFormState: clearFormStateAtom
}
