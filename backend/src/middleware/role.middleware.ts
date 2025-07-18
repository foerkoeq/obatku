// src/middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../shared/utils/response.util';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  USER = 'USER'
}

/**
 * Role hierarchy for permission checking
 */
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 5,
  [UserRole.ADMIN]: 4,
  [UserRole.MANAGER]: 3,
  [UserRole.STAFF]: 2,
  [UserRole.USER]: 1
};

/**
 * Check if user has required role or higher
 */
export const requireRole = (requiredRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        ResponseUtil.unauthenticated(res, 'Authentication required');
        return;
      }

      const userRole = req.user.role as UserRole;
      const requiredRolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      // Check if user has any of the required roles
      const hasRequiredRole = requiredRolesArray.some(role => {
        const userLevel = roleHierarchy[userRole] || 0;
        const requiredLevel = roleHierarchy[role] || 0;
        return userLevel >= requiredLevel;
      });

      if (!hasRequiredRole) {
        ResponseUtil.forbidden(res, 'Insufficient permissions for this action');
        return;
      }

      next();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Role validation failed';
      ResponseUtil.internalError(res, errorMessage);
    }
  };
};

/**
 * Check if user has exact role
 */
export const requireExactRole = (allowedRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        ResponseUtil.unauthenticated(res, 'Authentication required');
        return;
      }

      const userRole = req.user.role as UserRole;
      const allowedRolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!allowedRolesArray.includes(userRole)) {
        ResponseUtil.forbidden(res, 'Insufficient permissions for this action');
        return;
      }

      next();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Role validation failed';
      ResponseUtil.internalError(res, errorMessage);
    }
  };
};

/**
 * Admin only access
 */
export const requireAdmin = requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

/**
 * Manager or higher access
 */
export const requireManager = requireRole([UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN]);

/**
 * Staff or higher access
 */
export const requireStaff = requireRole([UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN]);

/**
 * Super admin only access
 */
export const requireSuperAdmin = requireExactRole(UserRole.SUPER_ADMIN);

/**
 * Check if user can access resource owned by specific user
 */
export const requireOwnershipOrRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        ResponseUtil.unauthenticated(res, 'Authentication required');
        return;
      }

      const userRole = req.user.role as UserRole;
      const userId = req.user.id;
      const resourceUserId = req.params.userId || req.body.userId || req.query.userId;

      // Allow if user is accessing their own resource
      if (userId === resourceUserId) {
        next();
        return;
      }

      // Allow if user has required role or higher
      const userLevel = roleHierarchy[userRole] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;

      if (userLevel >= requiredLevel) {
        next();
        return;
      }

      ResponseUtil.forbidden(res, 'You can only access your own resources or need higher permissions');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ownership validation failed';
      ResponseUtil.internalError(res, errorMessage);
    }
  };
};

/**
 * Check if user can modify resource (stricter than view)
 */
export const requireModifyPermission = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      ResponseUtil.unauthenticated(res, 'Authentication required');
      return;
    }

    const userRole = req.user.role as UserRole;
    
    // Only staff and above can modify resources
    if (roleHierarchy[userRole] < roleHierarchy[UserRole.STAFF]) {
      ResponseUtil.forbidden(res, 'Modification requires staff level permissions or higher');
      return;
    }

    next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Permission validation failed';
    ResponseUtil.internalError(res, errorMessage);
  }
};

/**
 * Resource-specific permissions
 */
export const inventoryPermissions = {
  read: requireStaff,
  write: requireStaff,
  delete: requireManager,
  admin: requireAdmin
};

export const qrcodePermissions = {
  read: requireStaff,
  generate: requireStaff,
  scan: requireStaff,
  admin: requireManager
};

export const userPermissions = {
  read: requireStaff,
  write: requireManager,
  delete: requireAdmin,
  admin: requireSuperAdmin
};
