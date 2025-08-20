/**
 * Authorization System Types
 * 
 * Comprehensive type definitions for the authorization system.
 * These types ensure type safety and make the system easily extensible.
 */

import { UserRole } from '@prisma/client';

// ================================================
// CORE AUTHORIZATION TYPES
// ================================================

export interface Permission {
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'exists';
  value: any;
}

export interface ResourcePermission {
  resource: string;
  actions: string[];
  conditions?: PermissionCondition[];
}

export interface RolePermissions {
  [key: string]: Permission[];
}

export interface UserPermissions {
  userId: string;
  role: UserRole;
  permissions: Permission[];
  resourceAccess: ResourceAccess[];
  customPermissions?: Permission[];
}

export interface ResourceAccess {
  resource: string;
  resourceId?: string;
  actions: string[];
  conditions?: PermissionCondition[];
}

// ================================================
// MIDDLEWARE TYPES
// ================================================

export interface AuthorizedRequest extends Request {
  user: AuthenticatedUser;
  permissions?: UserPermissions;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  status: string;
  permissions?: Permission[];
  iat?: number;
  exp?: number;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  missingPermissions?: Permission[];
  context?: any;
}

export interface AuthorizationOptions {
  strict?: boolean; // If true, requires exact permission match
  context?: any; // Additional context for permission evaluation
  allowSuperAdmin?: boolean; // If true, super admin bypasses all checks
  logAccess?: boolean; // If true, logs access attempts
}

// ================================================
// PERMISSION CHECKING TYPES
// ================================================

export interface PermissionCheckInput {
  user: AuthenticatedUser;
  resource: string;
  action: string;
  resourceId?: string;
  context?: any;
  options?: AuthorizationOptions;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  evaluatedConditions?: ConditionResult[];
  appliedPermissions?: Permission[];
}

export interface ConditionResult {
  condition: PermissionCondition;
  result: boolean;
  actualValue?: any;
  expectedValue?: any;
}

// ================================================
// AUDIT LOGGING TYPES
// ================================================

export interface AuditLogEntry {
  id?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'granted' | 'denied';
  reason?: string;
  context?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AuditLogOptions {
  includeContext?: boolean;
  includeHeaders?: boolean;
  includeBody?: boolean;
  excludeFields?: string[];
  level?: 'basic' | 'detailed' | 'full';
}

// ================================================
// RESOURCE GUARD TYPES
// ================================================

export interface ResourceGuardConfig {
  resource: string;
  ownershipField?: string; // Field that indicates ownership (e.g., 'userId', 'createdBy')
  allowedRoles?: UserRole[];
  customPermissions?: Permission[];
  inheritanceRules?: InheritanceRule[];
}

export interface InheritanceRule {
  parentResource: string;
  relationship: 'owner' | 'member' | 'viewer' | 'custom';
  condition?: PermissionCondition;
}

// ================================================
// PERMISSION MANAGER TYPES
// ================================================

export interface PermissionSet {
  name: string;
  description: string;
  permissions: Permission[];
  metadata?: Record<string, any>;
}

export interface DynamicPermission {
  id: string;
  userId: string;
  permission: Permission;
  expiresAt?: Date;
  grantedBy: string;
  grantedAt: Date;
  metadata?: Record<string, any>;
}

// ================================================
// CACHE TYPES
// ================================================

export interface PermissionCacheEntry {
  userId: string;
  permissions: Permission[];
  cachedAt: Date;
  expiresAt: Date;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  maxSize?: number; // Maximum cache size
  enableInvalidation?: boolean;
}

// ================================================
// ERROR TYPES
// ================================================

export interface AuthorizationError extends Error {
  code: string;
  statusCode: number;
  details?: any;
}

export type AuthorizationErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN' 
  | 'INSUFFICIENT_ROLE'
  | 'INSUFFICIENT_PERMISSION'
  | 'RESOURCE_NOT_FOUND'
  | 'INVALID_PERMISSION'
  | 'PERMISSION_EXPIRED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'AUDIT_LOG_FAILED';

// ================================================
// CONFIGURATION TYPES
// ================================================

export interface AuthorizationConfig {
  cache?: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  audit?: {
    enabled: boolean;
    level: 'basic' | 'detailed' | 'full';
    storage: 'database' | 'file' | 'external';
  };
  rateLimit?: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
  security?: {
    enableStrictMode: boolean;
    allowSuperAdminBypass: boolean;
    requireExplicitPermissions: boolean;
  };
}

// ================================================
// UTILITY TYPES
// ================================================

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'reject' | string;

export type PermissionResource = 
  | 'users' | 'medicines' | 'inventory' | 'qrcode' | 'submissions' 
  | 'approvals' | 'transactions' | 'reports' | 'settings' | 'audit'
  | string;

export interface PermissionMatrix {
  [role: string]: {
    [resource: string]: PermissionAction[];
  };
}

// ================================================
// EXPRESS MIDDLEWARE TYPES
// ================================================

export interface AuthMiddlewareOptions {
  required?: boolean;
  allowGuest?: boolean;
  skipInDevelopment?: boolean;
}

export interface RoleMiddlewareOptions extends AuthMiddlewareOptions {
  roles: string[] | UserRole[];
  strict?: boolean;
}

export interface PermissionMiddlewareOptions extends AuthMiddlewareOptions {
  resource: string;
  action: string | string[];
  allowOwner?: boolean;
  ownershipField?: string;
}

export interface ResourceMiddlewareOptions extends AuthMiddlewareOptions {
  resource: string;
  idParam?: string; // Parameter name in req.params (default: 'id')
  checkOwnership?: boolean;
  ownershipField?: string;
  allowedRoles?: UserRole[];
}
