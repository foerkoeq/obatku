/**
 * Permission Configuration
 * 
 * Centralized permission definitions for all resources and roles.
 * This file defines the complete permission matrix for the application.
 */

import { UserRole } from '@prisma/client';
import {
  Permission,
  RolePermissions,
  PermissionMatrix,
} from './types';
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from './constants';

// ================================================
// ROLE-BASED PERMISSION MATRIX
// ================================================

/**
 * Complete permission matrix for all roles
 * This defines what each role can do with each resource
 */
export const ROLE_PERMISSION_MATRIX: PermissionMatrix = {
  [UserRole.ADMIN]: {
    // User Management - Full control
    [PERMISSION_RESOURCES.USERS]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
      PERMISSION_ACTIONS.ACTIVATE,
      PERMISSION_ACTIONS.DEACTIVATE,
      PERMISSION_ACTIONS.RESET_PASSWORD,
      PERMISSION_ACTIONS.VIEW_ALL,
      PERMISSION_ACTIONS.MANAGE,
    ],
    
    // Medicine Management - Full control
    [PERMISSION_RESOURCES.MEDICINES]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
      PERMISSION_ACTIONS.VIEW_ALL,
      PERMISSION_ACTIONS.MANAGE,
      PERMISSION_ACTIONS.BULK_CREATE,
      PERMISSION_ACTIONS.BULK_UPDATE,
      PERMISSION_ACTIONS.IMPORT,
      PERMISSION_ACTIONS.EXPORT,
    ],
    
    // Inventory Management - Full control
    [PERMISSION_RESOURCES.INVENTORY]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
      PERMISSION_ACTIONS.VIEW_ALL,
      PERMISSION_ACTIONS.MANAGE,
      PERMISSION_ACTIONS.BULK_UPDATE,
      PERMISSION_ACTIONS.EXPORT,
    ],
    
    // QR Code Management - Full control
    [PERMISSION_RESOURCES.QRCODE]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
      PERMISSION_ACTIONS.GENERATE,
      PERMISSION_ACTIONS.BULK_CREATE,
      PERMISSION_ACTIONS.SCAN,
      PERMISSION_ACTIONS.VIEW_ALL,
      PERMISSION_ACTIONS.MANAGE,
    ],
    
    // Submission Management - Full control
    [PERMISSION_RESOURCES.SUBMISSIONS]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
      PERMISSION_ACTIONS.APPROVE,
      PERMISSION_ACTIONS.REJECT,
      PERMISSION_ACTIONS.VIEW_ALL,
      PERMISSION_ACTIONS.MANAGE,
    ],
    
    // Approval Management - Full control
    [PERMISSION_RESOURCES.APPROVALS]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.APPROVE,
      PERMISSION_ACTIONS.REJECT,
      PERMISSION_ACTIONS.VIEW_ALL,
      PERMISSION_ACTIONS.MANAGE,
    ],
    
    // Transaction Management - Full control
    [PERMISSION_RESOURCES.TRANSACTIONS]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
      PERMISSION_ACTIONS.VERIFY,
      PERMISSION_ACTIONS.DISTRIBUTE,
      PERMISSION_ACTIONS.VIEW_ALL,
      PERMISSION_ACTIONS.MANAGE,
    ],
    
    // Reports & Analytics - Full access
    [PERMISSION_RESOURCES.REPORTS]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.EXPORT,
      PERMISSION_ACTIONS.VIEW_ALL,
    ],
    
    [PERMISSION_RESOURCES.ANALYTICS]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.VIEW_ALL,
    ],
    
    // System Management
    [PERMISSION_RESOURCES.SETTINGS]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.MANAGE,
    ],
    
    [PERMISSION_RESOURCES.AUDIT]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.VIEW_ALL,
    ],
    
    // File Management
    [PERMISSION_RESOURCES.FILES]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
      PERMISSION_ACTIONS.VIEW_ALL,
    ],
  },

  [UserRole.DINAS]: {
    // Medicine Management - Read and limited update
    [PERMISSION_RESOURCES.MEDICINES]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.VIEW_ALL,
      PERMISSION_ACTIONS.EXPORT,
    ],
    
    // Inventory Management - Read and update
    [PERMISSION_RESOURCES.INVENTORY]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.VIEW_ALL,
      PERMISSION_ACTIONS.EXPORT,
    ],
    
    // QR Code Management - Limited access
    [PERMISSION_RESOURCES.QRCODE]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.GENERATE,
      PERMISSION_ACTIONS.SCAN,
      PERMISSION_ACTIONS.VIEW_ALL,
    ],
    
    // Submission Management - View and approve
    [PERMISSION_RESOURCES.SUBMISSIONS]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.VIEW_ALL,
    ],
    
    // Approval Management - Main responsibility
    [PERMISSION_RESOURCES.APPROVALS]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.APPROVE,
      PERMISSION_ACTIONS.REJECT,
      PERMISSION_ACTIONS.VIEW_ALL,
    ],
    
    // Transaction Management - Create and verify
    [PERMISSION_RESOURCES.TRANSACTIONS]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.VERIFY,
      PERMISSION_ACTIONS.VIEW_ALL,
    ],
    
    // Reports - Read and export
    [PERMISSION_RESOURCES.REPORTS]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.EXPORT,
    ],
    
    // Files - Read own uploads
    [PERMISSION_RESOURCES.FILES]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.VIEW_OWN,
    ],
  },

  [UserRole.POPT]: {
    // Medicine Management - Full CRUD
    [PERMISSION_RESOURCES.MEDICINES]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
      PERMISSION_ACTIONS.VIEW_ALL,
      PERMISSION_ACTIONS.BULK_CREATE,
      PERMISSION_ACTIONS.EXPORT,
    ],
    
    // Inventory Management - Full control
    [PERMISSION_RESOURCES.INVENTORY]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
      PERMISSION_ACTIONS.VIEW_ALL,
      PERMISSION_ACTIONS.BULK_UPDATE,
      PERMISSION_ACTIONS.EXPORT,
    ],
    
    // QR Code Management - Generate and scan
    [PERMISSION_RESOURCES.QRCODE]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.GENERATE,
      PERMISSION_ACTIONS.SCAN,
      PERMISSION_ACTIONS.VIEW_ALL,
    ],
    
    // Submission Management - View only
    [PERMISSION_RESOURCES.SUBMISSIONS]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.VIEW_ALL,
    ],
    
    // Transaction Management - Create and distribute
    [PERMISSION_RESOURCES.TRANSACTIONS]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.DISTRIBUTE,
      PERMISSION_ACTIONS.VIEW_ALL,
    ],
    
    // Reports - Read only
    [PERMISSION_RESOURCES.REPORTS]: [
      PERMISSION_ACTIONS.READ,
    ],
    
    // Files - Read and create
    [PERMISSION_RESOURCES.FILES]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.VIEW_OWN,
    ],
  },

  [UserRole.PPL]: {
    // Medicine Management - Read only
    [PERMISSION_RESOURCES.MEDICINES]: [
      PERMISSION_ACTIONS.READ,
    ],
    
    // Inventory Management - Read only
    [PERMISSION_RESOURCES.INVENTORY]: [
      PERMISSION_ACTIONS.READ,
    ],
    
    // QR Code Management - Scan only
    [PERMISSION_RESOURCES.QRCODE]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.SCAN,
    ],
    
    // Submission Management - Create and view own
    [PERMISSION_RESOURCES.SUBMISSIONS]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.VIEW_OWN,
    ],
    
    // Transaction Management - View own
    [PERMISSION_RESOURCES.TRANSACTIONS]: [
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.VIEW_OWN,
    ],
    
    // Files - Create and view own
    [PERMISSION_RESOURCES.FILES]: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.VIEW_OWN,
    ],
  },
};

// ================================================
// PERMISSION CONVERSION FUNCTIONS
// ================================================

/**
 * Convert permission matrix to role permissions array
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  const roleMatrix = ROLE_PERMISSION_MATRIX[role];
  if (!roleMatrix) return [];

  const permissions: Permission[] = [];
  
  Object.entries(roleMatrix).forEach(([resource, actions]) => {
    actions.forEach(action => {
      permissions.push({ resource, action });
    });
  });

  return permissions;
}

/**
 * Get all role permissions as RolePermissions object
 */
export function getAllRolePermissions(): RolePermissions {
  const rolePermissions: RolePermissions = {};
  
  Object.values(UserRole).forEach(role => {
    rolePermissions[role] = getPermissionsForRole(role);
  });

  return rolePermissions;
}

// ================================================
// RESOURCE-SPECIFIC PERMISSIONS
// ================================================

/**
 * Medicine-specific permissions with conditions
 */
export const MEDICINE_PERMISSIONS: Permission[] = [
  {
    resource: PERMISSION_RESOURCES.MEDICINES,
    action: PERMISSION_ACTIONS.UPDATE,
    conditions: [
      {
        field: 'status',
        operator: 'eq',
        value: 'active',
      },
    ],
  },
  {
    resource: PERMISSION_RESOURCES.MEDICINES,
    action: PERMISSION_ACTIONS.DELETE,
    conditions: [
      {
        field: 'current_stock',
        operator: 'eq',
        value: 0,
      },
    ],
  },
];

/**
 * Submission-specific permissions with ownership
 */
export const SUBMISSION_PERMISSIONS: Permission[] = [
  {
    resource: PERMISSION_RESOURCES.SUBMISSIONS,
    action: PERMISSION_ACTIONS.VIEW_OWN,
    conditions: [
      {
        field: 'created_by',
        operator: 'eq',
        value: '${user.id}',
      },
    ],
  },
  {
    resource: PERMISSION_RESOURCES.SUBMISSIONS,
    action: PERMISSION_ACTIONS.UPDATE,
    conditions: [
      {
        field: 'status',
        operator: 'eq',
        value: 'draft',
      },
      {
        field: 'created_by',
        operator: 'eq',
        value: '${user.id}',
      },
    ],
  },
];

/**
 * Transaction-specific permissions
 */
export const TRANSACTION_PERMISSIONS: Permission[] = [
  {
    resource: PERMISSION_RESOURCES.TRANSACTIONS,
    action: PERMISSION_ACTIONS.VIEW_OWN,
    conditions: [
      {
        field: 'created_by',
        operator: 'eq',
        value: '${user.id}',
      },
    ],
  },
  {
    resource: PERMISSION_RESOURCES.TRANSACTIONS,
    action: PERMISSION_ACTIONS.DISTRIBUTE,
    conditions: [
      {
        field: 'status',
        operator: 'eq',
        value: 'approved',
      },
    ],
  },
];

// ================================================
// CONDITIONAL PERMISSIONS
// ================================================

/**
 * Get conditional permissions for a specific role and resource
 */
export function getConditionalPermissions(role: UserRole, resource: string): Permission[] {
  const conditionalPermissions: Record<UserRole, Record<string, Permission[]>> = {
    [UserRole.ADMIN]: {
      // Admin has no conditional restrictions
    },
    [UserRole.DINAS]: {
      [PERMISSION_RESOURCES.SUBMISSIONS]: [
        {
          resource: PERMISSION_RESOURCES.SUBMISSIONS,
          action: PERMISSION_ACTIONS.APPROVE,
          conditions: [
            {
              field: 'status',
              operator: 'eq',
              value: 'pending',
            },
          ],
        },
      ],
    },
    [UserRole.POPT]: {
      [PERMISSION_RESOURCES.TRANSACTIONS]: [
        {
          resource: PERMISSION_RESOURCES.TRANSACTIONS,
          action: PERMISSION_ACTIONS.DISTRIBUTE,
          conditions: [
            {
              field: 'status',
              operator: 'eq',
              value: 'approved',
            },
          ],
        },
      ],
    },
    [UserRole.PPL]: {
      [PERMISSION_RESOURCES.SUBMISSIONS]: SUBMISSION_PERMISSIONS,
      [PERMISSION_RESOURCES.TRANSACTIONS]: TRANSACTION_PERMISSIONS,
    },
  };

  return conditionalPermissions[role]?.[resource] || [];
}

// ================================================
// PERMISSION VALIDATION
// ================================================

/**
 * Validate if a permission is allowed for a role
 */
export function isPermissionAllowedForRole(role: UserRole, resource: string, action: string): boolean {
  const roleMatrix = ROLE_PERMISSION_MATRIX[role];
  if (!roleMatrix) return false;

  const resourceActions = roleMatrix[resource];
  if (!resourceActions) return false;

  return resourceActions.includes(action);
}

/**
 * Get missing permissions for a role to perform an action
 */
export function getMissingPermissions(
  role: UserRole,
  requiredPermissions: Array<{ resource: string; action: string }>
): Array<{ resource: string; action: string }> {
  return requiredPermissions.filter(
    ({ resource, action }) => !isPermissionAllowedForRole(role, resource, action)
  );
}

/**
 * Check if role has all required permissions
 */
export function hasAllRequiredPermissions(
  role: UserRole,
  requiredPermissions: Array<{ resource: string; action: string }>
): boolean {
  return getMissingPermissions(role, requiredPermissions).length === 0;
}

// ================================================
// PERMISSION UTILITIES
// ================================================

/**
 * Get readable permission description
 */
export function getPermissionDescription(resource: string, action: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    [PERMISSION_RESOURCES.USERS]: {
      [PERMISSION_ACTIONS.CREATE]: 'Create new users',
      [PERMISSION_ACTIONS.READ]: 'View user information',
      [PERMISSION_ACTIONS.UPDATE]: 'Update user profiles',
      [PERMISSION_ACTIONS.DELETE]: 'Delete user accounts',
      [PERMISSION_ACTIONS.RESET_PASSWORD]: 'Reset user passwords',
    },
    [PERMISSION_RESOURCES.MEDICINES]: {
      [PERMISSION_ACTIONS.CREATE]: 'Add new medicines',
      [PERMISSION_ACTIONS.READ]: 'View medicine information',
      [PERMISSION_ACTIONS.UPDATE]: 'Update medicine details',
      [PERMISSION_ACTIONS.DELETE]: 'Remove medicines',
      [PERMISSION_ACTIONS.BULK_CREATE]: 'Bulk import medicines',
    },
    [PERMISSION_RESOURCES.INVENTORY]: {
      [PERMISSION_ACTIONS.CREATE]: 'Add inventory items',
      [PERMISSION_ACTIONS.READ]: 'View inventory status',
      [PERMISSION_ACTIONS.UPDATE]: 'Update stock levels',
      [PERMISSION_ACTIONS.DELETE]: 'Remove inventory items',
    },
    [PERMISSION_RESOURCES.SUBMISSIONS]: {
      [PERMISSION_ACTIONS.CREATE]: 'Create submission requests',
      [PERMISSION_ACTIONS.READ]: 'View submissions',
      [PERMISSION_ACTIONS.APPROVE]: 'Approve submission requests',
      [PERMISSION_ACTIONS.REJECT]: 'Reject submission requests',
    },
    [PERMISSION_RESOURCES.TRANSACTIONS]: {
      [PERMISSION_ACTIONS.CREATE]: 'Create transactions',
      [PERMISSION_ACTIONS.READ]: 'View transaction history',
      [PERMISSION_ACTIONS.DISTRIBUTE]: 'Distribute medicines',
      [PERMISSION_ACTIONS.VERIFY]: 'Verify transactions',
    },
  };

  return descriptions[resource]?.[action] || `${action} ${resource}`;
}

/**
 * Get permission summary for a role
 */
export function getPermissionSummary(role: UserRole): Record<string, string[]> {
  const permissions = getPermissionsForRole(role);
  const summary: Record<string, string[]> = {};

  permissions.forEach(permission => {
    if (!summary[permission.resource]) {
      summary[permission.resource] = [];
    }
    summary[permission.resource].push(permission.action);
  });

  return summary;
}
