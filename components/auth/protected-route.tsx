'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth.provider'
import { Loader } from '@/components/ui/loader'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  requiredPermissions?: string[]
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermissions = [],
  fallback
}) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // User is not authenticated, redirect to login
      router.push('/login')
      return
    }

    if (!isLoading && isAuthenticated && user) {
      // Check role requirement
      if (requiredRole && user.role !== requiredRole) {
        // User doesn't have required role, redirect to unauthorized page
        router.push('/unauthorized')
        return
      }

      // Check permissions requirement
      if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = requiredPermissions.every(permission =>
          user.permissions.includes(permission)
        )

        if (!hasRequiredPermissions) {
          // User doesn't have required permissions, redirect to unauthorized page
          router.push('/unauthorized')
          return
        }
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, requiredPermissions, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8" />
        <span className="ml-2 text-gray-600">Checking authentication...</span>
      </div>
    )
  }

  // Show loading spinner while redirecting
  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8" />
        <span className="ml-2 text-gray-600">Redirecting to login...</span>
      </div>
    )
  }

  // Check role requirement
  if (requiredRole && user?.role !== requiredRole) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8" />
        <span className="ml-2 text-gray-600">Checking permissions...</span>
      </div>
    )
  }

  // Check permissions requirement
  if (requiredPermissions.length > 0 && user) {
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      user.permissions.includes(permission)
    )

    if (!hasRequiredPermissions) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8" />
          <span className="ml-2 text-gray-600">Checking permissions...</span>
        </div>
      )
    }
  }

  // User is authenticated and has required permissions, render children
  return <>{children}</>
}

// Higher-order component for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string,
  requiredPermissions?: string[]
) => {
  const ProtectedComponent: React.FC<P> = (props) => (
    <ProtectedRoute requiredRole={requiredRole} requiredPermissions={requiredPermissions}>
      <Component {...props} />
    </ProtectedRoute>
  )

  ProtectedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  return ProtectedComponent
}

// Hook for checking permissions
export const usePermissions = () => {
  const { user } = useAuth()

  const hasRole = (role: string): boolean => {
    return user?.role === role
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  const isAdmin = (): boolean => {
    return hasRole('admin')
  }

  const isManager = (): boolean => {
    return hasRole('manager') || isAdmin()
  }

  const isStaff = (): boolean => {
    return hasRole('staff') || isManager()
  }

  return {
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isManager,
    isStaff,
    user
  }
}
