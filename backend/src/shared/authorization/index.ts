/**
 * Authorization System - Main Entry Point
 * 
 * Comprehensive, modular, and reusable authorization system for role-based access control.
 * This system can be easily adapted for other applications.
 * 
 * @features:
 * - Role-based middleware
 * - Permission checking
 * - Route protection
 * - Resource access control
 * - Audit logging
 * - Dynamic permission system
 * 
 * @author Backend Team
 * @version 1.0.0
 */

// Core Authorization Components
export * from './types';
export * from './constants';
export * from './permissions';
export * from './middleware';
export * from './decorators';
export * from './audit-logger';
export * from './cache';
export * from './utils';

// Main Authorization Classes
export { AuthorizationService } from './service';
export { PermissionManager } from './permission-manager';
export { AuditLogger } from './audit-logger';
export { ResourceGuard } from './resource-guard';

// Middleware Functions
export {
  authenticate,
  authorize,
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireResourceAccess,
  withAuditLog,
  withRateLimit,
} from './middleware';

// Utility Functions
export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessResource,
  getUserPermissions,
  validatePermissionStructure,
} from './utils';

// Permission Decorators (for future use with classes)
export {
  RequireRole,
  RequirePermission,
  AuditAction,
  RateLimit,
} from './decorators';
