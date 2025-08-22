import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  formValidationAtom,
  formLoadingAtom,
  formErrorAtom,
  formDataAtom,
  hasFormErrorsAtom,
  isFormLoadingAtom,
  hasFormChangesAtom,
  getFormErrorsSummaryAtom,
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
  clearFormStateAtom,
  type FormFieldError,
  type FormValidationState,
  type FormLoadingState,
  type FormErrorState,
  type FormDataState
} from '@/lib/stores'

// ============================================================================
// FORM VALIDATION HOOK
// ============================================================================

export const useFormValidation = (formId: string) => {
  const validation = useAtomValue(formValidationAtom)[formId]
  const setValidation = useSetAtom(setFormValidationAtom)
  const addError = useSetAtom(addFormErrorAtom)
  const clearErrors = useSetAtom(clearFormErrorsAtom)
  const setTouched = useSetAtom(setFormTouchedAtom)
  
  const addFieldError = (field: string, message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    addError({
      formId,
      error: { field, message, type }
    })
  }
  
  const clearFieldErrors = () => {
    clearErrors(formId)
  }
  
  const markFieldTouched = (field: string) => {
    setTouched({ formId, field })
  }
  
  const isFieldTouched = (field: string) => {
    return validation?.touched.includes(field) || false
  }
  
  const hasFieldError = (field: string) => {
    return validation?.errors.some(error => error.field === field) || false
  }
  
  const getFieldError = (field: string) => {
    return validation?.errors.find(error => error.field === field) || null
  }
  
  const getFieldErrorMessage = (field: string) => {
    const error = getFieldError(field)
    return error?.message || ''
  }
  
  const validateForm = (isValid: boolean) => {
    setValidation({
      formId,
      validation: {
        ...validation,
        isValid,
        lastValidated: new Date()
      }
    })
  }
  
  return {
    validation,
    isValid: validation?.isValid ?? true,
    errors: validation?.errors ?? [],
    touched: validation?.touched ?? [],
    dirty: validation?.dirty ?? false,
    lastValidated: validation?.lastValidated ?? null,
    addFieldError,
    clearFieldErrors,
    markFieldTouched,
    isFieldTouched,
    hasFieldError,
    getFieldError,
    getFieldErrorMessage,
    validateForm
  }
}

// ============================================================================
// FORM LOADING HOOK
// ============================================================================

export const useFormLoading = (formId: string) => {
  const loading = useAtomValue(formLoadingAtom)[formId]
  const setLoading = useSetAtom(setFormLoadingAtom)
  const setSubmitting = useSetAtom(setFormSubmittingAtom)
  const setSaving = useSetAtom(setFormSavingAtom)
  
  const startLoading = (type: keyof FormLoadingState[string] = 'isLoading') => {
    setLoading({ formId, loadingType: type, loading: true })
  }
  
  const stopLoading = (type: keyof FormLoadingState[string] = 'isLoading') => {
    setLoading({ formId, loadingType: type, loading: false })
  }
  
  const startSubmitting = () => {
    setSubmitting({ formId, isSubmitting: true })
  }
  
  const stopSubmitting = () => {
    setSubmitting({ formId, isSubmitting: false })
  }
  
  const startSaving = () => {
    setSaving({ formId, isSaving: true })
  }
  
  const stopSaving = () => {
    setSaving({ formId, isSaving: false })
  }
  
  const withLoading = async <T>(
    type: keyof FormLoadingState[string],
    operation: () => Promise<T>
  ): Promise<T> => {
    try {
      startLoading(type)
      return await operation()
    } finally {
      stopLoading(type)
    }
  }
  
  const withSubmitting = async <T>(operation: () => Promise<T>): Promise<T> => {
    try {
      startSubmitting()
      return await operation()
    } finally {
      stopSubmitting()
    }
  }
  
  const withSaving = async <T>(operation: () => Promise<T>): Promise<T> => {
    try {
      startSaving()
      return await operation()
    } finally {
      stopSaving()
    }
  }
  
  return {
    loading,
    isSubmitting: loading?.isSubmitting ?? false,
    isLoading: loading?.isLoading ?? false,
    isSaving: loading?.isSaving ?? false,
    isDeleting: loading?.isDeleting ?? false,
    isRefreshing: loading?.isRefreshing ?? false,
    startLoading,
    stopLoading,
    startSubmitting,
    stopSubmitting,
    startSaving,
    stopSaving,
    withLoading,
    withSubmitting,
    withSaving
  }
}

// ============================================================================
// FORM ERROR HOOK
// ============================================================================

export const useFormError = (formId: string) => {
  const errors = useAtomValue(formErrorAtom)[formId]
  const setError = useSetAtom(setFormErrorAtom)
  const clearErrors = useSetAtom(clearFormErrorsAtom2)
  
  const setSubmitError = (error: string | null) => {
    setError({ formId, errorType: 'submitError', error })
  }
  
  const setNetworkError = (error: string | null) => {
    setError({ formId, errorType: 'networkError', error })
  }
  
  const setServerError = (error: string | null) => {
    setError({ formId, errorType: 'serverError', error })
  }
  
  const addValidationError = (error: string) => {
    const currentErrors = errors?.validationErrors ?? []
    setError({
      formId,
      errorType: 'validationErrors',
      error: [...currentErrors, error].join('; ')
    })
  }
  
  const clearAllErrors = () => {
    clearErrors(formId)
  }
  
  const hasAnyError = () => {
    return !!(errors?.submitError || errors?.networkError || errors?.serverError || errors?.validationErrors?.length)
  }
  
  const getErrorSummary = () => {
    const allErrors: string[] = []
    
    if (errors?.submitError) allErrors.push(errors.submitError)
    if (errors?.networkError) allErrors.push(errors.networkError)
    if (errors?.serverError) allErrors.push(errors.serverError)
    if (errors?.validationErrors?.length) allErrors.push(...errors.validationErrors)
    
    return allErrors
  }
  
  return {
    errors,
    submitError: errors?.submitError ?? null,
    networkError: errors?.networkError ?? null,
    serverError: errors?.serverError ?? null,
    validationErrors: errors?.validationErrors ?? [],
    lastError: errors?.lastError ?? null,
    setSubmitError,
    setNetworkError,
    setServerError,
    addValidationError,
    clearAllErrors,
    hasAnyError,
    getErrorSummary
  }
}

// ============================================================================
// FORM DATA HOOK
// ============================================================================

export const useFormData = (formId: string) => {
  const data = useAtomValue(formDataAtom)[formId]
  const setData = useSetAtom(setFormDataAtom)
  const markSaved = useSetAtom(markFormSavedAtom)
  const resetData = useSetAtom(resetFormDataAtom)
  
  const setInitialData = (initialData: any) => {
    setData({ formId, data: initialData, isInitial: true })
  }
  
  const updateData = (newData: any) => {
    setData({ formId, data: newData, isInitial: false })
  }
  
  const updateField = (field: string, value: any) => {
    if (data?.currentData) {
      const updatedData = {
        ...data.currentData,
        [field]: value
      }
      updateData(updatedData)
    }
  }
  
  const resetToInitial = () => {
    resetData(formId)
  }
  
  const markAsSaved = () => {
    markSaved(formId)
  }
  
  return {
    data,
    initialData: data?.initialData ?? null,
    currentData: data?.currentData ?? null,
    hasChanges: data?.hasChanges ?? false,
    lastSaved: data?.lastSaved ?? null,
    autoSave: data?.autoSave ?? false,
    autoSaveInterval: data?.autoSaveInterval ?? 30000,
    setInitialData,
    updateData,
    updateField,
    resetToInitial,
    markAsSaved
  }
}

// ============================================================================
// FORM STATE HOOK
// ============================================================================

export const useFormState = (formId: string) => {
  const validation = useFormValidation(formId)
  const loading = useFormLoading(formId)
  const errors = useFormError(formId)
  const data = useFormData(formId)
  
  const hasErrors = useAtomValue(hasFormErrorsAtom)(formId)
  const isLoading = useAtomValue(isFormLoadingAtom)(formId)
  const hasChanges = useAtomValue(hasFormChangesAtom)(formId)
  const errorSummary = useAtomValue(getFormErrorsSummaryAtom)(formId)
  
  const initializeForm = useSetAtom(initializeFormAtom)
  const clearForm = useSetAtom(clearFormStateAtom)
  
  const initialize = (initialData: any, options?: { autoSave?: boolean; autoSaveInterval?: number }) => {
    initializeForm({
      formId,
      initialData,
      autoSave: options?.autoSave ?? false,
      autoSaveInterval: options?.autoSaveInterval ?? 30000
    })
  }
  
  const clear = () => {
    clearForm(formId)
  }
  
  const isFormValid = () => {
    return validation.isValid && !hasErrors
  }
  
  const canSubmit = () => {
    return isFormValid() && !loading.isSubmitting && !loading.isLoading
  }
  
  const canSave = () => {
    return hasChanges && !loading.isSaving && !loading.isLoading
  }
  
  return {
    // State
    hasErrors,
    isLoading,
    hasChanges,
    errorSummary,
    isFormValid: isFormValid(),
    canSubmit: canSubmit(),
    canSave: canSave(),
    
    // Actions
    initialize,
    clear,
    
    // Sub-hooks
    validation,
    loading,
    errors,
    data
  }
}

// ============================================================================
// FORM UTILITIES HOOK
// ============================================================================

export const useFormUtils = () => {
  const initializeForm = useSetAtom(initializeFormAtom)
  const clearFormState = useSetAtom(clearFormStateAtom)
  
  const createForm = (formId: string, initialData: any, options?: { autoSave?: boolean; autoSaveInterval?: number }) => {
    initializeForm({
      formId,
      initialData,
      autoSave: options?.autoSave ?? false,
      autoSaveInterval: options?.autoSaveInterval ?? 30000
    })
  }
  
  const destroyForm = (formId: string) => {
    clearFormState(formId)
  }
  
  const resetAllForms = () => {
    // This would reset all forms - implementation depends on requirements
    console.log('Resetting all forms')
  }
  
  return {
    createForm,
    destroyForm,
    resetAllForms
  }
}

// ============================================================================
// COMBINED FORM STORE HOOK
// ============================================================================

export const useFormStore = (formId: string) => {
  const formState = useFormState(formId)
  const formUtils = useFormUtils()
  
  return {
    ...formState,
    ...formUtils
  }
}
