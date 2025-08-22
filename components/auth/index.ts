/**
 * Auth Components Index
 * Centralized export for all authentication components
 */

// Main components
export { default as LoginForm } from './login-form'
export { ProtectedRoute, withAuth, usePermissions } from './protected-route'

// Re-export auth provider
export { AuthProvider, useAuth } from '@/providers/auth.provider'
