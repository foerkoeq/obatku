/**
 * Authorization Utilities
 * 
 * Utility functions for the authorization system.
 * These functions provide common functionality used across the authorization system.
 */

import { UserRole } from '@prisma/client';
import {
  Permission,
  AuthenticatedUser,
  AuthorizationError,
  AuthorizationErrorCode,
  PermissionCondition,
} from './types';
import {
  AUTHORIZATION_ERRORS,
  ROLE_HIERARCHY,
  SUPER_ADMIN_ROLES,
  CONDITION_OPERATORS,
  VALIDATION_PATTERNS,
} from './constants';

// ================================================
// PERMISSION UTILITIES
// ================================================

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: AuthenticatedUser,
  resource: string,
  action: string,
  context?: any
): boolean {
  try {
    const userPermissions = getUserPermissions(user);
    
    return userPermissions.some(permission => {
      // Check basic permission match
      if (!isPermissionMatch(permission, resource, action)) {
        return false;
      }
      
      // Check conditions if any
      if (permission.conditions && permission.conditions.length > 0) {
        return evaluateConditions(permission.conditions, context);
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: AuthenticatedUser,
  permissions: Array<{ resource: string; action: string }>,
  context?: any
): boolean {
  return permissions.some(({ resource, action }) =>
    hasPermission(user, resource, action, context)
  );
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  user: AuthenticatedUser,
  permissions: Array<{ resource: string; action: string }>,
  context?: any
): boolean {
  return permissions.every(({ resource, action }) =>
    hasPermission(user, resource, action, context)
  );
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: AuthenticatedUser): Permission[] {
  // This would typically come from the PermissionManager
  // For now, return user's attached permissions if any
  return user.permissions || [];
}

/**
 * Check if user can access a specific resource
 */
export function canAccessResource(
  user: AuthenticatedUser,
  resource: string,
  resourceId?: string,
  context?: any
): boolean {
  // Check read permission as minimum access
  return hasPermission(user, resource, 'read', { ...context, resourceId });
}

// ================================================
// ROLE UTILITIES
// ================================================

/**
 * Check if user has sufficient role level
 */
export function hasRoleLevel(user: AuthenticatedUser, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[user.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user: AuthenticatedUser): boolean {
  return SUPER_ADMIN_ROLES.includes(user.role);
}

/**
 * Get role hierarchy level
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role] || 0;
}

/**
 * Compare role levels
 */
export function compareRoles(role1: UserRole, role2: UserRole): number {
  const level1 = getRoleLevel(role1);
  const level2 = getRoleLevel(role2);
  
  return level1 - level2;
}

// ================================================
// PERMISSION MATCHING
// ================================================

/**
 * Check if a permission matches the requested resource and action
 */
export function isPermissionMatch(
  permission: Permission,
  resource: string,
  action: string
): boolean {
  // Wildcard permissions
  if (permission.resource === '*' && permission.action === '*') {
    return true;
  }
  
  if (permission.resource === '*') {
    return permission.action === action;
  }
  
  if (permission.action === '*') {
    return permission.resource === resource;
  }
  
  // Exact match
  return permission.resource === resource && permission.action === action;
}

/**
 * Evaluate permission conditions
 */
export function evaluateConditions(
  conditions: PermissionCondition[],
  context?: any
): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }
  
  return conditions.every(condition => evaluateCondition(condition, context));
}

/**
 * Evaluate a single condition
 */
export function evaluateCondition(condition: PermissionCondition, context?: any): boolean {
  if (!context) {
    return condition.operator === CONDITION_OPERATORS.EXISTS ? false : true;
  }
  
  const actualValue = getValueFromPath(context, condition.field);
  
  switch (condition.operator) {
    case CONDITION_OPERATORS.EQUALS:
      return actualValue === condition.value;
    case CONDITION_OPERATORS.NOT_EQUALS:
      return actualValue !== condition.value;
    case CONDITION_OPERATORS.IN:
      return Array.isArray(condition.value) && condition.value.includes(actualValue);
    case CONDITION_OPERATORS.NOT_IN:
      return Array.isArray(condition.value) && !condition.value.includes(actualValue);
    case CONDITION_OPERATORS.GREATER_THAN:
      return actualValue > condition.value;
    case CONDITION_OPERATORS.GREATER_THAN_EQUAL:
      return actualValue >= condition.value;
    case CONDITION_OPERATORS.LESS_THAN:
      return actualValue < condition.value;
    case CONDITION_OPERATORS.LESS_THAN_EQUAL:
      return actualValue <= condition.value;
    case CONDITION_OPERATORS.CONTAINS:
      return typeof actualValue === 'string' && actualValue.includes(condition.value);
    case CONDITION_OPERATORS.EXISTS:
      return actualValue !== undefined && actualValue !== null;
    default:
      return false;
  }
}

// ================================================
// VALIDATION UTILITIES
// ================================================

/**
 * Validate permission structure
 */
export function validatePermissionStructure(permission: Permission): boolean {
  if (!permission.resource || !permission.action) {
    return false;
  }
  
  // Validate resource format
  if (!VALIDATION_PATTERNS.RESOURCE_FORMAT.test(permission.resource) && permission.resource !== '*') {
    return false;
  }
  
  // Validate action format
  if (!VALIDATION_PATTERNS.ACTION_FORMAT.test(permission.action) && permission.action !== '*') {
    return false;
  }
  
  // Validate conditions if present
  if (permission.conditions) {
    return permission.conditions.every(validateCondition);
  }
  
  return true;
}

/**
 * Validate a permission condition
 */
export function validateCondition(condition: PermissionCondition): boolean {
  if (!condition.field || !condition.operator) {
    return false;
  }
  
  // Validate operator
  const validOperators = Object.values(CONDITION_OPERATORS);
  if (!validOperators.includes(condition.operator as any)) {
    return false;
  }
  
  // Validate value based on operator
  switch (condition.operator) {
    case CONDITION_OPERATORS.IN:
    case CONDITION_OPERATORS.NOT_IN:
      return Array.isArray(condition.value);
    case CONDITION_OPERATORS.EXISTS:
      return condition.value === undefined || condition.value === null;
    default:
      return condition.value !== undefined;
  }
}

// ================================================
// ERROR UTILITIES
// ================================================

/**
 * Create authorization error
 */
export function createAuthorizationError(code: AuthorizationErrorCode, details?: any): AuthorizationError {
  const errorInfo = AUTHORIZATION_ERRORS[code];
  
  const error = new Error(errorInfo.message) as AuthorizationError;
  error.code = errorInfo.code;
  error.statusCode = errorInfo.statusCode;
  error.details = details;
  
  return error;
}

/**
 * Check if error is authorization error
 */
export function isAuthorizationError(error: any): error is AuthorizationError {
  return error && typeof error.code === 'string' && typeof error.statusCode === 'number';
}

// ================================================
// CONTEXT UTILITIES
// ================================================

/**
 * Get value from object path (supports dot notation)
 */
export function getValueFromPath(obj: any, path: string): any {
  if (!obj || !path) {
    return undefined;
  }
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * Set value in object path (supports dot notation)
 */
export function setValueInPath(obj: any, path: string, value: any): void {
  if (!obj || !path) {
    return;
  }
  
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  let current = obj;
  
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

// ================================================
// FORMATTING UTILITIES
// ================================================

/**
 * Format permission as string
 */
export function formatPermission(permission: Permission): string {
  let formatted = `${permission.resource}:${permission.action}`;
  
  if (permission.conditions && permission.conditions.length > 0) {
    const conditionStrs = permission.conditions.map(c => 
      `${c.field} ${c.operator} ${JSON.stringify(c.value)}`
    );
    formatted += ` [${conditionStrs.join(', ')}]`;
  }
  
  return formatted;
}

/**
 * Parse permission from string
 */
export function parsePermission(permissionStr: string): Permission | null {
  try {
    const match = permissionStr.match(VALIDATION_PATTERNS.PERMISSION_FORMAT);
    if (!match) {
      return null;
    }
    
    const [resource, action] = permissionStr.split(':');
    
    return {
      resource: resource.trim(),
      action: action.trim(),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Format permissions list
 */
export function formatPermissionsList(permissions: Permission[]): string[] {
  return permissions.map(formatPermission);
}

/**
 * Group permissions by resource
 */
export function groupPermissionsByResource(permissions: Permission[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  for (const permission of permissions) {
    if (!grouped[permission.resource]) {
      grouped[permission.resource] = [];
    }
    grouped[permission.resource].push(permission.action);
  }
  
  return grouped;
}

// ================================================
// SANITIZATION UTILITIES
// ================================================

/**
 * Sanitize user input for permission checking
 */
export function sanitizePermissionInput(input: {
  resource?: string;
  action?: string;
  context?: any;
}): { resource: string; action: string; context?: any } {
  const sanitized = {
    resource: sanitizeString(input.resource || ''),
    action: sanitizeString(input.action || ''),
    context: input.context,
  };
  
  // Remove potentially dangerous context fields
  if (sanitized.context && typeof sanitized.context === 'object') {
    sanitized.context = sanitizeObject(sanitized.context);
  }
  
  return sanitized;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, ''); // Only allow alphanumeric and underscore
}

/**
 * Sanitize object by removing potentially dangerous fields
 */
export function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const sanitized = { ...obj };
  
  // Remove dangerous fields
  const dangerousFields = ['__proto__', 'constructor', 'prototype'];
  for (const field of dangerousFields) {
    delete sanitized[field];
  }
  
  return sanitized;
}

// ================================================
// DEBUG UTILITIES
// ================================================

/**
 * Debug permission check
 */
export function debugPermissionCheck(
  user: AuthenticatedUser,
  resource: string,
  action: string,
  context?: any
): any {
  const userPermissions = getUserPermissions(user);
  
  const debug = {
    user: {
      id: user.id,
      role: user.role,
      permissionCount: userPermissions.length,
    },
    requested: {
      resource,
      action,
    },
    context,
    matching: userPermissions.filter(p => isPermissionMatch(p, resource, action)),
    evaluation: userPermissions.map(permission => ({
      permission: formatPermission(permission),
      matches: isPermissionMatch(permission, resource, action),
      conditionsPass: permission.conditions 
        ? evaluateConditions(permission.conditions, context)
        : true,
    })),
  };
  
  return debug;
}
