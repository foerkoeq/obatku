/**
 * Authorization Constants
 * 
 * Centralized constants for the authorization system.
 * These constants ensure consistency across the application.
 */

import { UserRole } from '@prisma/client';
import { AuthorizationErrorCode } from './types';

// ================================================
// PERMISSION CONSTANTS
// ================================================

export const PERMISSION_ACTIONS = {
  // CRUD Operations
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  
  // Business Operations
  APPROVE: 'approve',
  REJECT: 'reject',
  SUBMIT: 'submit',
  CANCEL: 'cancel',
  VERIFY: 'verify',
  DISTRIBUTE: 'distribute',
  
  // Administrative Operations
  ACTIVATE: 'activate',
  DEACTIVATE: 'deactivate',
  RESET_PASSWORD: 'reset_password',
  EXPORT: 'export',
  IMPORT: 'import',
  
  // Special Operations
  BULK_CREATE: 'bulk_create',
  BULK_UPDATE: 'bulk_update',
  BULK_DELETE: 'bulk_delete',
  GENERATE: 'generate',
  SCAN: 'scan',
  
  // Access Operations
  VIEW_ALL: 'view_all',
  VIEW_OWN: 'view_own',
  MANAGE: 'manage',
  EXECUTE: 'execute',
} as const;

export const PERMISSION_RESOURCES = {
  // Core Resources
  USERS: 'users',
  MEDICINES: 'medicines',
  INVENTORY: 'inventory',
  QRCODE: 'qrcode',
  
  // Business Resources
  SUBMISSIONS: 'submissions',
  APPROVALS: 'approvals',
  TRANSACTIONS: 'transactions',
  DISTRIBUTIONS: 'distributions',
  
  // System Resources
  REPORTS: 'reports',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  AUDIT: 'audit',
  
  // File Resources
  FILES: 'files',
  UPLOADS: 'uploads',
  DOCUMENTS: 'documents',
} as const;

// ================================================
// ROLE HIERARCHY
// ================================================

export const ROLE_HIERARCHY = {
  [UserRole.ADMIN]: 100,
  [UserRole.DINAS]: 75,
  [UserRole.POPT]: 50,
  [UserRole.PPL]: 25,
} as const;

export const SUPER_ADMIN_ROLES: UserRole[] = [UserRole.ADMIN];

// ================================================
// ERROR MESSAGES
// ================================================

export const AUTHORIZATION_ERRORS = {
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED' as AuthorizationErrorCode,
    message: 'Authentication required',
    statusCode: 401,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN' as AuthorizationErrorCode,
    message: 'Access denied',
    statusCode: 403,
  },
  INSUFFICIENT_ROLE: {
    code: 'INSUFFICIENT_ROLE' as AuthorizationErrorCode,
    message: 'Insufficient role privileges',
    statusCode: 403,
  },
  INSUFFICIENT_PERMISSION: {
    code: 'INSUFFICIENT_PERMISSION' as AuthorizationErrorCode,
    message: 'Insufficient permissions',
    statusCode: 403,
  },
  RESOURCE_NOT_FOUND: {
    code: 'RESOURCE_NOT_FOUND' as AuthorizationErrorCode,
    message: 'Resource not found or access denied',
    statusCode: 404,
  },
  INVALID_PERMISSION: {
    code: 'INVALID_PERMISSION' as AuthorizationErrorCode,
    message: 'Invalid permission structure',
    statusCode: 400,
  },
  PERMISSION_EXPIRED: {
    code: 'PERMISSION_EXPIRED' as AuthorizationErrorCode,
    message: 'Permission has expired',
    statusCode: 403,
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED' as AuthorizationErrorCode,
    message: 'Rate limit exceeded',
    statusCode: 429,
  },
  AUDIT_LOG_FAILED: {
    code: 'AUDIT_LOG_FAILED' as AuthorizationErrorCode,
    message: 'Failed to log audit entry',
    statusCode: 500,
  },
} as const;

// ================================================
// CACHE SETTINGS
// ================================================

export const CACHE_SETTINGS = {
  PERMISSION_TTL: 300, // 5 minutes
  USER_PERMISSION_TTL: 600, // 10 minutes
  ROLE_PERMISSION_TTL: 3600, // 1 hour
  MAX_CACHE_SIZE: 1000,
  CACHE_KEY_PREFIX: 'auth:',
} as const;

// ================================================
// AUDIT SETTINGS
// ================================================

export const AUDIT_SETTINGS = {
  ENABLED: true,
  BATCH_SIZE: 100,
  FLUSH_INTERVAL: 5000, // 5 seconds
  MAX_QUEUE_SIZE: 1000,
  RETENTION_DAYS: 365,
  SENSITIVE_FIELDS: ['password', 'token', 'secret', 'key'],
} as const;

// ================================================
// RATE LIMITING
// ================================================

export const RATE_LIMIT_SETTINGS = {
  DEFAULT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  DEFAULT_MAX_REQUESTS: 100,
  STRICT_ENDPOINTS: {
    LOGIN: { windowMs: 15 * 60 * 1000, max: 5 },
    PASSWORD_RESET: { windowMs: 60 * 60 * 1000, max: 3 },
    CREATE_USER: { windowMs: 60 * 60 * 1000, max: 10 },
  },
} as const;

// ================================================
// PERMISSION TEMPLATES
// ================================================

export const PERMISSION_TEMPLATES = {
  // Basic CRUD permissions
  CRUD_ALL: (resource: string) => [
    { resource, action: PERMISSION_ACTIONS.CREATE },
    { resource, action: PERMISSION_ACTIONS.READ },
    { resource, action: PERMISSION_ACTIONS.UPDATE },
    { resource, action: PERMISSION_ACTIONS.DELETE },
  ],
  
  // Read-only permissions
  READ_ONLY: (resource: string) => [
    { resource, action: PERMISSION_ACTIONS.READ },
  ],
  
  // Create and read permissions
  CREATE_READ: (resource: string) => [
    { resource, action: PERMISSION_ACTIONS.CREATE },
    { resource, action: PERMISSION_ACTIONS.READ },
  ],
  
  // Full management permissions
  FULL_MANAGEMENT: (resource: string) => [
    { resource, action: PERMISSION_ACTIONS.CREATE },
    { resource, action: PERMISSION_ACTIONS.READ },
    { resource, action: PERMISSION_ACTIONS.UPDATE },
    { resource, action: PERMISSION_ACTIONS.DELETE },
    { resource, action: PERMISSION_ACTIONS.MANAGE },
    { resource, action: PERMISSION_ACTIONS.VIEW_ALL },
  ],
  
  // Approval workflow permissions
  APPROVAL_WORKFLOW: (resource: string) => [
    { resource, action: PERMISSION_ACTIONS.READ },
    { resource, action: PERMISSION_ACTIONS.APPROVE },
    { resource, action: PERMISSION_ACTIONS.REJECT },
    { resource, action: PERMISSION_ACTIONS.VIEW_ALL },
  ],
} as const;

// ================================================
// RESOURCE OWNERSHIP FIELDS
// ================================================

export const OWNERSHIP_FIELDS = {
  [PERMISSION_RESOURCES.SUBMISSIONS]: 'created_by',
  [PERMISSION_RESOURCES.TRANSACTIONS]: 'created_by',
  [PERMISSION_RESOURCES.UPLOADS]: 'uploaded_by',
  [PERMISSION_RESOURCES.DOCUMENTS]: 'created_by',
  DEFAULT: 'user_id',
} as const;

// ================================================
// CONDITION OPERATORS
// ================================================

export const CONDITION_OPERATORS = {
  EQUALS: 'eq',
  NOT_EQUALS: 'ne',
  IN: 'in',
  NOT_IN: 'nin',
  GREATER_THAN: 'gt',
  GREATER_THAN_EQUAL: 'gte',
  LESS_THAN: 'lt',
  LESS_THAN_EQUAL: 'lte',
  CONTAINS: 'contains',
  EXISTS: 'exists',
} as const;

// ================================================
// SPECIAL PERMISSIONS
// ================================================

export const SPECIAL_PERMISSIONS = {
  SUPER_ADMIN: '*:*', // Access to everything
  SYSTEM_ADMIN: 'system:*', // Access to system resources
  SELF_MANAGEMENT: 'self:*', // Access to own resources
} as const;

// ================================================
// VALIDATION PATTERNS
// ================================================

export const VALIDATION_PATTERNS = {
  PERMISSION_FORMAT: /^[a-z_]+:[a-z_]+$/,
  RESOURCE_FORMAT: /^[a-z_]+$/,
  ACTION_FORMAT: /^[a-z_]+$/,
} as const;
