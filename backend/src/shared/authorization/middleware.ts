/**
 * Authorization Middleware
 * 
 * Comprehensive middleware functions for protecting routes and resources.
 * These middleware functions provide role-based and permission-based access control.
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import {
  AuthenticatedUser as AuthorizationUser,
  PermissionMiddlewareOptions,
  ResourceMiddlewareOptions,
  AuthorizationOptions,
} from './types';
import { AuthenticatedUser as AuthUser } from '@/features/auth/auth.types';
import { PermissionManager } from './permission-manager';
import { AuditLogger } from './audit-logger';
import { createAuthorizationError } from './utils';

const permissionManager = PermissionManager.getInstance();
const auditLogger = AuditLogger.getInstance();

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Convert AuthUser to AuthorizationUser for compatibility
 */
function convertToAuthorizationUser(authUser: AuthUser): AuthorizationUser {
  return {
    id: authUser.id,
    email: authUser.email || '',
    role: authUser.role,
    status: authUser.status,
    permissions: authUser.permissions.map(p => ({ resource: '', action: p })),
  };
}

// ================================================
// AUTHENTICATION MIDDLEWARE
// ================================================

/**
 * Basic authentication middleware
 * Checks if user is authenticated
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const user = req.user as AuthUser;

    if (!user) {
      const error = createAuthorizationError('UNAUTHORIZED');
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTHENTICATION_ERROR',
    });
  }
}

// ================================================
// ROLE-BASED AUTHORIZATION
// ================================================

/**
 * Basic role authorization middleware
 * @param allowedRoles Array of roles that can access the resource
 */
export function authorize(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as AuthUser;

      if (!user) {
        const error = createAuthorizationError('UNAUTHORIZED');
        await auditLogger.logAccess({
          userId: 'anonymous',
          action: 'access_attempt',
          resource: req.route?.path || req.path,
          result: 'denied',
          reason: 'No authentication',
        }, req);
        
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      // Convert role enum to string for comparison
      const userRole = user.role.toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

      if (!normalizedAllowedRoles.includes(userRole)) {
        const error = createAuthorizationError('INSUFFICIENT_ROLE');
        await auditLogger.logAccess({
          userId: user.id,
          action: 'access_attempt',
          resource: req.route?.path || req.path,
          result: 'denied',
          reason: 'Insufficient role',
          context: {
            required: allowedRoles,
            current: user.role,
          },
        }, req);

        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
          details: {
            required: allowedRoles,
            current: user.role,
          },
        });
        return;
      }

      // Log successful access
      await auditLogger.logAccess({
        userId: user.id,
        action: 'access_granted',
        resource: req.route?.path || req.path,
        result: 'granted',
        reason: 'Role authorized',
      }, req);

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

/**
 * Require specific role(s)
 * @param roles Single role or array of roles
 */
export function requireRole(...roles: UserRole[]) {
  return authorize(roles);
}

// ================================================
// PERMISSION-BASED AUTHORIZATION
// ================================================

/**
 * Require specific permission
 * @param resource The resource being accessed
 * @param action The action being performed
 * @param options Additional options for permission checking
 */
export function requirePermission(
  resource: string,
  action: string,
  options: PermissionMiddlewareOptions = { resource, action }
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as AuthUser;

      if (!user) {
        const error = createAuthorizationError('UNAUTHORIZED');
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      // Check ownership if enabled
      if (options.allowOwner && options.ownershipField) {
        const resourceId = req.params['id']; // Use 'id' as default param
        if (await checkResourceOwnership(convertToAuthorizationUser(user), resource, resourceId, options.ownershipField)) {
          next();
          return;
        }
      }

      // Check permission
      const authOptions: AuthorizationOptions = {
        allowSuperAdmin: true,
        logAccess: true,
        context: {
          params: req.params,
          query: req.query,
          body: req.body,
        },
      };

      const result = permissionManager.checkPermission({
        user: convertToAuthorizationUser(user),
        resource,
        action,
        resourceId: req.params['id'],
        context: authOptions.context,
        options: authOptions,
      });

      if (!result.allowed) {
        const error = createAuthorizationError('INSUFFICIENT_PERMISSION');
        await auditLogger.logAccess({
          userId: user.id,
          action: 'permission_check',
          resource: `${resource}:${action}`,
          result: 'denied',
          reason: result.reason,
          context: {
            resource,
            action,
            resourceId: req.params['id'],
          },
        }, req);

        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
          details: {
            required: `${resource}:${action}`,
            reason: result.reason,
          },
        });
        return;
      }

      // Log successful permission check
      await auditLogger.logAccess({
        userId: user.id,
        action: 'permission_granted',
        resource: `${resource}:${action}`,
        result: 'granted',
        reason: result.reason,
      }, req);

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        code: 'PERMISSION_ERROR',
      });
    }
  };
}

/**
 * Require ANY of the specified permissions
 * @param permissions Array of permission objects
 */
export function requireAnyPermission(
  permissions: Array<{ resource: string; action: string }>
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as AuthUser;

      if (!user) {
        const error = createAuthorizationError('UNAUTHORIZED');
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      const hasAnyPermission = permissionManager.hasAnyPermission(
        user.id,
        user.role,
        permissions,
        { allowSuperAdmin: true }
      );

      if (!hasAnyPermission) {
        const error = createAuthorizationError('INSUFFICIENT_PERMISSION');
        await auditLogger.logAccess({
          userId: user.id,
          action: 'permission_check',
          resource: 'multiple_permissions',
          result: 'denied',
          reason: 'None of the required permissions found',
          context: { requiredAny: permissions },
        }, req);

        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
          details: {
            requiredAny: permissions.map(p => `${p.resource}:${p.action}`),
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Any permission middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        code: 'PERMISSION_ERROR',
      });
    }
  };
}

/**
 * Require ALL of the specified permissions
 * @param permissions Array of permission objects
 */
export function requireAllPermissions(
  permissions: Array<{ resource: string; action: string }>
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as AuthUser;

      if (!user) {
        const error = createAuthorizationError('UNAUTHORIZED');
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      const hasAllPermissions = permissionManager.hasAllPermissions(
        user.id,
        user.role,
        permissions,
        { allowSuperAdmin: true }
      );

      if (!hasAllPermissions) {
        const error = createAuthorizationError('INSUFFICIENT_PERMISSION');
        await auditLogger.logAccess({
          userId: user.id,
          action: 'permission_check',
          resource: 'multiple_permissions',
          result: 'denied',
          reason: 'Not all required permissions found',
          context: { requiredAll: permissions },
        }, req);

        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
          details: {
            requiredAll: permissions.map(p => `${p.resource}:${p.action}`),
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('All permissions middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        code: 'PERMISSION_ERROR',
      });
    }
  };
}

// ================================================
// RESOURCE-SPECIFIC AUTHORIZATION
// ================================================

/**
 * Require access to a specific resource
 * @param options Resource access options
 */
export function requireResourceAccess(options: ResourceMiddlewareOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as AuthUser;

      if (!user) {
        const error = createAuthorizationError('UNAUTHORIZED');
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      const resourceId = req.params[options.idParam || 'id'];
      
      if (!resourceId) {
        res.status(400).json({
          success: false,
          message: 'Resource ID is required',
          code: 'MISSING_RESOURCE_ID',
        });
        return;
      }

      // Check ownership if enabled
      if (options.checkOwnership && options.ownershipField) {
        const isOwner = await checkResourceOwnership(
          convertToAuthorizationUser(user),
          options.resource,
          resourceId,
          options.ownershipField
        );
        
        if (isOwner) {
          next();
          return;
        }
      }

      // Check role-based access
      if (options.allowedRoles && options.allowedRoles.includes(user.role)) {
        next();
        return;
      }

      // If no access granted
      const error = createAuthorizationError('RESOURCE_NOT_FOUND');
      await auditLogger.logAccess({
        userId: user.id,
        action: 'resource_access',
        resource: options.resource,
        resourceId,
        result: 'denied',
        reason: 'Resource access denied',
      }, req);

      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
      });
    } catch (error) {
      console.error('Resource access middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        code: 'RESOURCE_ACCESS_ERROR',
      });
    }
  };
}

// ================================================
// AUDIT LOGGING MIDDLEWARE
// ================================================

/**
 * Add audit logging to any route
 * @param action The action being performed
 * @param resource The resource being accessed
 */
export function withAuditLog(action: string, resource?: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as AuthUser;
    const resourceName = resource || req.route?.path || req.path;
    
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(body: any) {
      // Determine result based on status code
      const result = res.statusCode >= 200 && res.statusCode < 300 ? 'granted' : 'denied';
      
      // Log the action
      auditLogger.logAccess({
        userId: user?.id || 'anonymous',
        action,
        resource: resourceName,
        result,
        context: {
          method: req.method,
          params: req.params,
          query: req.query,
          statusCode: res.statusCode,
        },
      }, req).catch(console.error);
      
      return originalJson.call(this, body);
    };
    
    next();
  };
}

// ================================================
// RATE LIMITING MIDDLEWARE
// ================================================

/**
 * Add rate limiting to routes
 * @param windowMs Time window in milliseconds
 * @param maxRequests Maximum requests per window
 * @param identifier Custom identifier function
 */
export function withRateLimit(
  windowMs: number = 15 * 60 * 1000,
  maxRequests: number = 100,
  identifier?: (req: Request) => string
) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as AuthUser;
    const key = identifier ? identifier(req) : user?.id || req.ip || 'anonymous';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [k, v] of requests.entries()) {
      if (now > v.resetTime) {
        requests.delete(k);
      }
    }
    
    // Check current request
    const current = requests.get(key);
    if (!current) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }
    
    if (current.count >= maxRequests) {
      const error = createAuthorizationError('RATE_LIMIT_EXCEEDED');
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
        details: {
          limit: maxRequests,
          windowMs,
          resetTime: current.resetTime,
        },
      });
      return;
    }
    
    current.count++;
    next();
  };
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Check if user owns a resource
 */
async function checkResourceOwnership(
  user: AuthorizationUser,
  resource: string,
  resourceId: string,
  ownershipField: string
): Promise<boolean> {
  try {
    // This would typically query the database to check ownership
    // For now, we'll implement a basic check
    // In a real implementation, you'd inject a database service
    
    // TODO: Implement actual database check using parameters
    // user.id, resource, resourceId, ownershipField would be used here
    // const record = await databaseService.findOne(resource, resourceId);
    // return record && record[ownershipField] === user.id;
    
    console.log(`Checking ownership for user ${user.id} on ${resource}:${resourceId} using field ${ownershipField}`);
    return false; // Placeholder - implement actual ownership check
  } catch (error) {
    console.error('Error checking resource ownership:', error);
    return false;
  }
}
