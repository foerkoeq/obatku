/**
 * Authorization Middleware
 * 
 * Express middleware for:
 * - Role-based access control
 * - Permission-based authorization
 * - Resource-specific access control
 * - Conditional permissions
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../features/auth/auth.types';
import { hasPermission, hasResourceAccess } from '../../features/auth/auth.config';
import { AUTH_CONSTANTS } from '../../features/auth/auth.config';

// ================================================
// ROLE-BASED AUTHORIZATION
// ================================================

/**
 * Authorize based on user roles
 * @param allowedRoles Array of roles that can access the resource
 */
export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user as AuthenticatedUser;

      if (!user) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
          code: 'NO_USER_CONTEXT',
        });
        return;
      }

      // Convert role enum to string for comparison
      const userRole = user.role.toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

      if (!normalizedAllowedRoles.includes(userRole)) {
        res.status(403).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.FORBIDDEN,
          code: 'INSUFFICIENT_ROLE',
          details: {
            required: allowedRoles,
            current: user.role,
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Authorization middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        code: 'AUTHORIZATION_ERROR',
      });
    }
  };
}

// ================================================
// PERMISSION-BASED AUTHORIZATION
// ================================================

/**
 * Authorize based on specific permissions
 * @param resource The resource being accessed
 * @param action The action being performed
 */
export function requirePermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user as AuthenticatedUser;

      if (!user) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
          code: 'NO_USER_CONTEXT',
        });
        return;
      }

      const hasRequiredPermission = hasPermission(user.role, resource, action);

      if (!hasRequiredPermission) {
        res.status(403).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.FORBIDDEN,
          code: 'INSUFFICIENT_PERMISSION',
          details: {
            required: `${resource}:${action}`,
            userRole: user.role,
            userPermissions: user.permissions,
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        code: 'PERMISSION_ERROR',
      });
    }
  };
}

/**
 * Authorize based on multiple permissions (requires ALL)
 */
export function requireAllPermissions(permissions: Array<{ resource: string; action: string }>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user as AuthenticatedUser;

      if (!user) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
          code: 'NO_USER_CONTEXT',
        });
        return;
      }

      const missingPermissions = permissions.filter(
        ({ resource, action }) => !hasPermission(user.role, resource, action)
      );

      if (missingPermissions.length > 0) {
        res.status(403).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.FORBIDDEN,
          code: 'INSUFFICIENT_PERMISSIONS',
          details: {
            missing: missingPermissions.map(p => `${p.resource}:${p.action}`),
            userRole: user.role,
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Multiple permissions authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        code: 'PERMISSIONS_ERROR',
      });
    }
  };
}

/**
 * Authorize based on multiple permissions (requires ANY)
 */
export function requireAnyPermission(permissions: Array<{ resource: string; action: string }>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user as AuthenticatedUser;

      if (!user) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
          code: 'NO_USER_CONTEXT',
        });
        return;
      }

      const hasAnyPermission = permissions.some(
        ({ resource, action }) => hasPermission(user.role, resource, action)
      );

      if (!hasAnyPermission) {
        res.status(403).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.FORBIDDEN,
          code: 'NO_REQUIRED_PERMISSION',
          details: {
            required: permissions.map(p => `${p.resource}:${p.action}`),
            userRole: user.role,
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Any permission authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        code: 'PERMISSION_CHECK_ERROR',
      });
    }
  };
}

// ================================================
// RESOURCE-BASED AUTHORIZATION
// ================================================

/**
 * Authorize based on resource access
 */
export function requireResourceAccess(resource: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user as AuthenticatedUser;

      if (!user) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
          code: 'NO_USER_CONTEXT',
        });
        return;
      }

      const hasAccess = hasResourceAccess(user.role, resource);

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.FORBIDDEN,
          code: 'NO_RESOURCE_ACCESS',
          details: {
            resource,
            userRole: user.role,
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Resource authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        code: 'RESOURCE_ERROR',
      });
    }
  };
}

// ================================================
// OWNERSHIP-BASED AUTHORIZATION
// ================================================

/**
 * Authorize based on resource ownership
 * Allows access if user owns the resource or has admin privileges
 */
export function requireOwnership(getResourceOwnerId: (req: Request) => string | Promise<string>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as AuthenticatedUser;

      if (!user) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
          code: 'NO_USER_CONTEXT',
        });
        return;
      }

      // Admin users bypass ownership checks
      if (user.role === UserRole.ADMIN) {
        next();
        return;
      }

      // Get resource owner ID
      const resourceOwnerId = await getResourceOwnerId(req);

      if (user.id !== resourceOwnerId) {
        res.status(403).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.FORBIDDEN,
          code: 'NOT_RESOURCE_OWNER',
          details: {
            userId: user.id,
            resourceOwnerId,
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Ownership authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        code: 'OWNERSHIP_ERROR',
      });
    }
  };
}

// ================================================
// CONDITIONAL AUTHORIZATION
// ================================================

/**
 * Authorize based on custom condition
 */
export function requireCondition(
  condition: (user: AuthenticatedUser, req: Request) => boolean | Promise<boolean>,
  errorMessage = 'Access denied'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as AuthenticatedUser;

      if (!user) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
          code: 'NO_USER_CONTEXT',
        });
        return;
      }

      const isAllowed = await condition(user, req);

      if (!isAllowed) {
        res.status(403).json({
          success: false,
          message: errorMessage,
          code: 'CONDITION_NOT_MET',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Conditional authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        code: 'CONDITION_ERROR',
      });
    }
  };
}

// ================================================
// ADMIN-ONLY SHORTCUTS
// ================================================

/**
 * Shortcut for admin-only access
 */
export const adminOnly = authorize(['admin']);

/**
 * Shortcut for admin or dinas access
 */
export const adminOrDinas = authorize(['admin', 'dinas']);

/**
 * Shortcut for field staff (PPL, POPT)
 */
export const fieldStaff = authorize(['ppl', 'popt']);

// ================================================
// COMBINED AUTHORIZATION MIDDLEWARE
// ================================================

/**
 * Combine multiple authorization checks
 */
export function combineAuthorization(...middlewares: Array<(req: Request, res: Response, next: NextFunction) => void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let currentIndex = 0;

    function runNext(error?: any): void {
      if (error) {
        next(error);
        return;
      }

      if (currentIndex >= middlewares.length) {
        next();
        return;
      }

      const middleware = middlewares[currentIndex++];
      
      try {
        middleware(req, res, runNext);
      } catch (err) {
        next(err);
      }
    }

    runNext();
  };
}

// ================================================
// AUTHORIZATION HELPERS
// ================================================

/**
 * Check if user has permission without middleware
 */
export function checkUserPermission(
  user: AuthenticatedUser,
  resource: string,
  action: string
): boolean {
  return hasPermission(user.role, resource, action);
}

/**
 * Get user's effective permissions
 */
export function getUserPermissions(user: AuthenticatedUser): string[] {
  return user.permissions;
}

/**
 * Check if user can perform action on specific resource type
 */
export function canUserAccess(
  user: AuthenticatedUser,
  resource: string,
  action: string
): boolean {
  return user.permissions.includes(`${resource}:${action}`);
}

// ================================================
// MIDDLEWARE FACTORY
// ================================================

/**
 * Create authorization middleware based on configuration
 */
export function createAuthorizationMiddleware(config: {
  roles?: string[];
  permissions?: Array<{ resource: string; action: string }>;
  requireAll?: boolean;
  resource?: string;
  customCondition?: (user: AuthenticatedUser, req: Request) => boolean | Promise<boolean>;
}) {
  const middlewares: Array<(req: Request, res: Response, next: NextFunction) => void> = [];

  // Add role-based authorization
  if (config.roles && config.roles.length > 0) {
    middlewares.push(authorize(config.roles));
  }

  // Add permission-based authorization
  if (config.permissions && config.permissions.length > 0) {
    if (config.requireAll) {
      middlewares.push(requireAllPermissions(config.permissions));
    } else {
      middlewares.push(requireAnyPermission(config.permissions));
    }
  }

  // Add resource access check
  if (config.resource) {
    middlewares.push(requireResourceAccess(config.resource));
  }

  // Add custom condition
  if (config.customCondition) {
    middlewares.push(requireCondition(config.customCondition));
  }

  // If no specific configuration, return a pass-through middleware
  if (middlewares.length === 0) {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  // If only one middleware, return it directly
  if (middlewares.length === 1) {
    return middlewares[0];
  }

  // Combine multiple middlewares
  return combineAuthorization(...middlewares);
}

export default {
  authorize,
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  requireResourceAccess,
  requireOwnership,
  requireCondition,
  adminOnly,
  adminOrDinas,
  fieldStaff,
  combineAuthorization,
  createAuthorizationMiddleware,
};
