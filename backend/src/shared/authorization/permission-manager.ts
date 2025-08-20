/**
 * Permission Manager
 * 
 * Centralized permission management system that handles:
 * - Role-based permissions
 * - Dynamic permissions
 * - Permission inheritance
 * - Permission validation
 */

import { UserRole } from '@prisma/client';
import {
  Permission,
  RolePermissions,
  PermissionCheckInput,
  PermissionCheckResult,
  AuthorizationOptions,
  PermissionCondition,
  ConditionResult,
} from './types';
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  PERMISSION_TEMPLATES,
  SUPER_ADMIN_ROLES,
  CONDITION_OPERATORS,
} from './constants';

export class PermissionManager {
  private static instance: PermissionManager;
  private rolePermissions: RolePermissions = {};
  private dynamicPermissions: Map<string, Permission[]> = new Map();

  private constructor() {
    this.initializeDefaultPermissions();
  }

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  // ================================================
  // PERMISSION INITIALIZATION
  // ================================================

  private initializeDefaultPermissions(): void {
    // Admin permissions - Full access to everything
    this.rolePermissions[UserRole.ADMIN] = [
      // User management
      ...PERMISSION_TEMPLATES.FULL_MANAGEMENT(PERMISSION_RESOURCES.USERS),
      
      // Medicine & Inventory management
      ...PERMISSION_TEMPLATES.FULL_MANAGEMENT(PERMISSION_RESOURCES.MEDICINES),
      ...PERMISSION_TEMPLATES.FULL_MANAGEMENT(PERMISSION_RESOURCES.INVENTORY),
      
      // QR Code management
      ...PERMISSION_TEMPLATES.FULL_MANAGEMENT(PERMISSION_RESOURCES.QRCODE),
      { resource: PERMISSION_RESOURCES.QRCODE, action: PERMISSION_ACTIONS.GENERATE },
      { resource: PERMISSION_RESOURCES.QRCODE, action: PERMISSION_ACTIONS.BULK_CREATE },
      
      // Full submission and approval workflow
      ...PERMISSION_TEMPLATES.FULL_MANAGEMENT(PERMISSION_RESOURCES.SUBMISSIONS),
      ...PERMISSION_TEMPLATES.APPROVAL_WORKFLOW(PERMISSION_RESOURCES.APPROVALS),
      
      // Transaction management
      ...PERMISSION_TEMPLATES.FULL_MANAGEMENT(PERMISSION_RESOURCES.TRANSACTIONS),
      { resource: PERMISSION_RESOURCES.TRANSACTIONS, action: PERMISSION_ACTIONS.VERIFY },
      { resource: PERMISSION_RESOURCES.TRANSACTIONS, action: PERMISSION_ACTIONS.DISTRIBUTE },
      
      // Reports and analytics
      ...PERMISSION_TEMPLATES.READ_ONLY(PERMISSION_RESOURCES.REPORTS),
      { resource: PERMISSION_RESOURCES.REPORTS, action: PERMISSION_ACTIONS.EXPORT },
      ...PERMISSION_TEMPLATES.READ_ONLY(PERMISSION_RESOURCES.ANALYTICS),
      
      // System settings and audit
      ...PERMISSION_TEMPLATES.FULL_MANAGEMENT(PERMISSION_RESOURCES.SETTINGS),
      ...PERMISSION_TEMPLATES.READ_ONLY(PERMISSION_RESOURCES.AUDIT),
    ];

    // DINAS permissions - Approval and monitoring
    this.rolePermissions[UserRole.DINAS] = [
      // Medicine & Inventory (read/update only)
      { resource: PERMISSION_RESOURCES.MEDICINES, action: PERMISSION_ACTIONS.READ },
      { resource: PERMISSION_RESOURCES.MEDICINES, action: PERMISSION_ACTIONS.UPDATE },
      { resource: PERMISSION_RESOURCES.INVENTORY, action: PERMISSION_ACTIONS.READ },
      { resource: PERMISSION_RESOURCES.INVENTORY, action: PERMISSION_ACTIONS.UPDATE },
      
      // QR Code (limited management)
      { resource: PERMISSION_RESOURCES.QRCODE, action: PERMISSION_ACTIONS.READ },
      { resource: PERMISSION_RESOURCES.QRCODE, action: PERMISSION_ACTIONS.CREATE },
      { resource: PERMISSION_RESOURCES.QRCODE, action: PERMISSION_ACTIONS.GENERATE },
      
      // Submission approval workflow
      { resource: PERMISSION_RESOURCES.SUBMISSIONS, action: PERMISSION_ACTIONS.READ },
      { resource: PERMISSION_RESOURCES.SUBMISSIONS, action: PERMISSION_ACTIONS.VIEW_ALL },
      ...PERMISSION_TEMPLATES.APPROVAL_WORKFLOW(PERMISSION_RESOURCES.APPROVALS),
      
      // Transaction processing
      { resource: PERMISSION_RESOURCES.TRANSACTIONS, action: PERMISSION_ACTIONS.READ },
      { resource: PERMISSION_RESOURCES.TRANSACTIONS, action: PERMISSION_ACTIONS.CREATE },
      { resource: PERMISSION_RESOURCES.TRANSACTIONS, action: PERMISSION_ACTIONS.VERIFY },
      { resource: PERMISSION_RESOURCES.TRANSACTIONS, action: PERMISSION_ACTIONS.VIEW_ALL },
      
      // Reports (read and export)
      ...PERMISSION_TEMPLATES.READ_ONLY(PERMISSION_RESOURCES.REPORTS),
      { resource: PERMISSION_RESOURCES.REPORTS, action: PERMISSION_ACTIONS.EXPORT },
    ];

    // POPT permissions - Operational management
    this.rolePermissions[UserRole.POPT] = [
      // Medicine & Inventory management
      ...PERMISSION_TEMPLATES.CRUD_ALL(PERMISSION_RESOURCES.MEDICINES),
      ...PERMISSION_TEMPLATES.CRUD_ALL(PERMISSION_RESOURCES.INVENTORY),
      
      // QR Code management
      { resource: PERMISSION_RESOURCES.QRCODE, action: PERMISSION_ACTIONS.READ },
      { resource: PERMISSION_RESOURCES.QRCODE, action: PERMISSION_ACTIONS.CREATE },
      { resource: PERMISSION_RESOURCES.QRCODE, action: PERMISSION_ACTIONS.GENERATE },
      { resource: PERMISSION_RESOURCES.QRCODE, action: PERMISSION_ACTIONS.SCAN },
      
      // View submissions (no approval)
      { resource: PERMISSION_RESOURCES.SUBMISSIONS, action: PERMISSION_ACTIONS.READ },
      { resource: PERMISSION_RESOURCES.SUBMISSIONS, action: PERMISSION_ACTIONS.VIEW_ALL },
      
      // Transaction distribution
      { resource: PERMISSION_RESOURCES.TRANSACTIONS, action: PERMISSION_ACTIONS.READ },
      { resource: PERMISSION_RESOURCES.TRANSACTIONS, action: PERMISSION_ACTIONS.CREATE },
      { resource: PERMISSION_RESOURCES.TRANSACTIONS, action: PERMISSION_ACTIONS.DISTRIBUTE },
      { resource: PERMISSION_RESOURCES.TRANSACTIONS, action: PERMISSION_ACTIONS.VIEW_ALL },
      
      // Reports (read only)
      ...PERMISSION_TEMPLATES.READ_ONLY(PERMISSION_RESOURCES.REPORTS),
    ];

    // PPL permissions - Limited submission and viewing
    this.rolePermissions[UserRole.PPL] = [
      // View medicines (read only)
      { resource: PERMISSION_RESOURCES.MEDICINES, action: PERMISSION_ACTIONS.READ },
      { resource: PERMISSION_RESOURCES.INVENTORY, action: PERMISSION_ACTIONS.READ },
      
      // QR Code scanning
      { resource: PERMISSION_RESOURCES.QRCODE, action: PERMISSION_ACTIONS.READ },
      { resource: PERMISSION_RESOURCES.QRCODE, action: PERMISSION_ACTIONS.SCAN },
      
      // Submission creation and own submissions
      { resource: PERMISSION_RESOURCES.SUBMISSIONS, action: PERMISSION_ACTIONS.CREATE },
      { resource: PERMISSION_RESOURCES.SUBMISSIONS, action: PERMISSION_ACTIONS.READ },
      { resource: PERMISSION_RESOURCES.SUBMISSIONS, action: PERMISSION_ACTIONS.VIEW_OWN },
      
      // View own transactions
      { resource: PERMISSION_RESOURCES.TRANSACTIONS, action: PERMISSION_ACTIONS.READ },
      { resource: PERMISSION_RESOURCES.TRANSACTIONS, action: PERMISSION_ACTIONS.VIEW_OWN },
    ];
  }

  // ================================================
  // PERMISSION CHECKING
  // ================================================

  public checkPermission(input: PermissionCheckInput): PermissionCheckResult {
    const { user, resource, action, resourceId, context, options = {} } = input;

    // Super admin bypass
    if (options.allowSuperAdmin && SUPER_ADMIN_ROLES.includes(user.role)) {
      return {
        allowed: true,
        reason: 'Super admin access',
        appliedPermissions: [{ resource: '*', action: '*' }],
      };
    }

    // Get user permissions
    const userPermissions = this.getUserPermissions(user.id, user.role);
    
    // Find matching permissions
    const matchingPermissions = userPermissions.filter(permission => {
      return this.isPermissionMatch(permission, resource, action);
    });

    if (matchingPermissions.length === 0) {
      return {
        allowed: false,
        reason: 'No matching permissions found',
      };
    }

    // Evaluate conditions if any
    const conditionResults: ConditionResult[] = [];
    
    for (const permission of matchingPermissions) {
      if (permission.conditions && permission.conditions.length > 0) {
        const results = this.evaluateConditions(
          permission.conditions,
          context,
          resourceId
        );
        conditionResults.push(...results);
        
        // If any condition fails, permission is denied
        if (results.some(r => !r.result)) {
          continue;
        }
      }
      
      // Permission granted
      return {
        allowed: true,
        reason: 'Permission granted',
        evaluatedConditions: conditionResults,
        appliedPermissions: [permission],
      };
    }

    return {
      allowed: false,
      reason: 'Permission conditions not met',
      evaluatedConditions: conditionResults,
    };
  }

  public hasPermission(
    userId: string,
    role: UserRole,
    resource: string,
    action: string,
    options?: AuthorizationOptions
  ): boolean {
    const result = this.checkPermission({
      user: { id: userId, role } as any,
      resource,
      action,
      options,
    });
    
    return result.allowed;
  }

  public hasAnyPermission(
    userId: string,
    role: UserRole,
    permissions: Array<{ resource: string; action: string }>,
    options?: AuthorizationOptions
  ): boolean {
    return permissions.some(({ resource, action }) =>
      this.hasPermission(userId, role, resource, action, options)
    );
  }

  public hasAllPermissions(
    userId: string,
    role: UserRole,
    permissions: Array<{ resource: string; action: string }>,
    options?: AuthorizationOptions
  ): boolean {
    return permissions.every(({ resource, action }) =>
      this.hasPermission(userId, role, resource, action, options)
    );
  }

  // ================================================
  // PERMISSION MANAGEMENT
  // ================================================

  public getUserPermissions(userId: string, role: UserRole): Permission[] {
    const rolePermissions = this.rolePermissions[role] || [];
    const dynamicPermissions = this.dynamicPermissions.get(userId) || [];
    
    return [...rolePermissions, ...dynamicPermissions];
  }

  public addDynamicPermission(userId: string, permission: Permission): void {
    const existingPermissions = this.dynamicPermissions.get(userId) || [];
    const updatedPermissions = [...existingPermissions, permission];
    this.dynamicPermissions.set(userId, updatedPermissions);
  }

  public removeDynamicPermission(userId: string, resource: string, action: string): void {
    const existingPermissions = this.dynamicPermissions.get(userId) || [];
    const filteredPermissions = existingPermissions.filter(
      p => !(p.resource === resource && p.action === action)
    );
    this.dynamicPermissions.set(userId, filteredPermissions);
  }

  public clearDynamicPermissions(userId: string): void {
    this.dynamicPermissions.delete(userId);
  }

  // ================================================
  // ROLE MANAGEMENT
  // ================================================

  public getRolePermissions(role: UserRole): Permission[] {
    return this.rolePermissions[role] || [];
  }

  public setRolePermissions(role: UserRole, permissions: Permission[]): void {
    this.rolePermissions[role] = permissions;
  }

  public addRolePermission(role: UserRole, permission: Permission): void {
    if (!this.rolePermissions[role]) {
      this.rolePermissions[role] = [];
    }
    this.rolePermissions[role].push(permission);
  }

  public removeRolePermission(role: UserRole, resource: string, action: string): void {
    if (!this.rolePermissions[role]) return;
    
    this.rolePermissions[role] = this.rolePermissions[role].filter(
      p => !(p.resource === resource && p.action === action)
    );
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  private isPermissionMatch(permission: Permission, resource: string, action: string): boolean {
    // Wildcard permissions
    if (permission.resource === '*' || permission.action === '*') {
      return true;
    }
    
    // Exact match
    return permission.resource === resource && permission.action === action;
  }

  private evaluateConditions(
    conditions: PermissionCondition[],
    context: any,
    resourceId?: string
  ): ConditionResult[] {
    return conditions.map(condition => {
      const actualValue = this.getValueFromContext(condition.field, context, resourceId);
      const result = this.evaluateCondition(condition, actualValue);
      
      return {
        condition,
        result,
        actualValue,
        expectedValue: condition.value,
      };
    });
  }

  private evaluateCondition(condition: PermissionCondition, actualValue: any): boolean {
    const { operator, value } = condition;
    
    switch (operator) {
      case CONDITION_OPERATORS.EQUALS:
        return actualValue === value;
      case CONDITION_OPERATORS.NOT_EQUALS:
        return actualValue !== value;
      case CONDITION_OPERATORS.IN:
        return Array.isArray(value) && value.includes(actualValue);
      case CONDITION_OPERATORS.NOT_IN:
        return Array.isArray(value) && !value.includes(actualValue);
      case CONDITION_OPERATORS.GREATER_THAN:
        return actualValue > value;
      case CONDITION_OPERATORS.GREATER_THAN_EQUAL:
        return actualValue >= value;
      case CONDITION_OPERATORS.LESS_THAN:
        return actualValue < value;
      case CONDITION_OPERATORS.LESS_THAN_EQUAL:
        return actualValue <= value;
      case CONDITION_OPERATORS.CONTAINS:
        return typeof actualValue === 'string' && actualValue.includes(value);
      case CONDITION_OPERATORS.EXISTS:
        return actualValue !== undefined && actualValue !== null;
      default:
        return false;
    }
  }

  private getValueFromContext(field: string, context: any, resourceId?: string): any {
    if (!context) return undefined;
    
    // Handle dot notation for nested fields
    const fieldParts = field.split('.');
    let value = context;
    
    for (const part of fieldParts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    // Special handling for resourceId
    if (field === 'id' && resourceId) {
      return resourceId;
    }
    
    return value;
  }

  public validatePermission(permission: Permission): boolean {
    if (!permission.resource || !permission.action) {
      return false;
    }
    
    // Validate resource and action format
    const resourceValid = /^[a-z_*]+$/.test(permission.resource);
    const actionValid = /^[a-z_*]+$/.test(permission.action);
    
    return resourceValid && actionValid;
  }

  public getPermissionMatrix(): Record<string, Record<string, string[]>> {
    const matrix: Record<string, Record<string, string[]>> = {};
    
    Object.entries(this.rolePermissions).forEach(([role, permissions]) => {
      matrix[role] = {};
      
      permissions.forEach(permission => {
        if (!matrix[role][permission.resource]) {
          matrix[role][permission.resource] = [];
        }
        matrix[role][permission.resource].push(permission.action);
      });
    });
    
    return matrix;
  }
}
