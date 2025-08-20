/**
 * Resource Guard
 * 
 * Advanced resource-level access control system.
 * This guard provides fine-grained control over resource access based on ownership, 
 * relationships, and custom rules.
 */

import { UserRole } from '@prisma/client';
import {
  AuthenticatedUser,
  ResourceGuardConfig,
  Permission,
  PermissionCondition,
  InheritanceRule,
} from './types';
import {
  PERMISSION_ACTIONS,
  OWNERSHIP_FIELDS,
} from './constants';
import { hasPermission, evaluateCondition } from './utils';

export class ResourceGuard {
  private static instance: ResourceGuard;
  private guardConfigs: Map<string, ResourceGuardConfig> = new Map();

  private constructor() {
    this.initializeDefaultGuards();
  }

  public static getInstance(): ResourceGuard {
    if (!ResourceGuard.instance) {
      ResourceGuard.instance = new ResourceGuard();
    }
    return ResourceGuard.instance;
  }

  // ================================================
  // GUARD CONFIGURATION
  // ================================================

  /**
   * Register a resource guard configuration
   */
  public registerGuard(config: ResourceGuardConfig): void {
    this.guardConfigs.set(config.resource, config);
  }

  /**
   * Get guard configuration for a resource
   */
  public getGuardConfig(resource: string): ResourceGuardConfig | undefined {
    return this.guardConfigs.get(resource);
  }

  /**
   * Initialize default guard configurations
   */
  private initializeDefaultGuards(): void {
    // Submissions guard - users can only access their own submissions
    this.registerGuard({
      resource: 'submissions',
      ownershipField: 'created_by',
      allowedRoles: [UserRole.ADMIN, UserRole.DINAS], // These roles can access all
      customPermissions: [
        {
          resource: 'submissions',
          action: PERMISSION_ACTIONS.VIEW_OWN,
          conditions: [
            {
              field: 'created_by',
              operator: 'eq',
              value: '${user.id}', // Dynamic value
            },
          ],
        },
      ],
    });

    // Transactions guard
    this.registerGuard({
      resource: 'transactions',
      ownershipField: 'created_by',
      allowedRoles: [UserRole.ADMIN, UserRole.DINAS, UserRole.POPT],
      customPermissions: [
        {
          resource: 'transactions',
          action: PERMISSION_ACTIONS.VIEW_OWN,
          conditions: [
            {
              field: 'created_by',
              operator: 'eq',
              value: '${user.id}',
            },
          ],
        },
      ],
    });

    // Files/Documents guard
    this.registerGuard({
      resource: 'files',
      ownershipField: 'uploaded_by',
      allowedRoles: [UserRole.ADMIN],
      customPermissions: [
        {
          resource: 'files',
          action: PERMISSION_ACTIONS.READ,
          conditions: [
            {
              field: 'uploaded_by',
              operator: 'eq',
              value: '${user.id}',
            },
          ],
        },
        {
          resource: 'files',
          action: PERMISSION_ACTIONS.DELETE,
          conditions: [
            {
              field: 'uploaded_by',
              operator: 'eq',
              value: '${user.id}',
            },
          ],
        },
      ],
    });

    // User management guard
    this.registerGuard({
      resource: 'users',
      allowedRoles: [UserRole.ADMIN],
      customPermissions: [
        {
          resource: 'users',
          action: PERMISSION_ACTIONS.READ,
          conditions: [
            {
              field: 'id',
              operator: 'eq',
              value: '${user.id}', // Users can read their own profile
            },
          ],
        },
        {
          resource: 'users',
          action: PERMISSION_ACTIONS.UPDATE,
          conditions: [
            {
              field: 'id',
              operator: 'eq',
              value: '${user.id}', // Users can update their own profile
            },
          ],
        },
      ],
    });
  }

  // ================================================
  // ACCESS CHECKING
  // ================================================

  /**
   * Check if user can access a specific resource
   */
  public async canAccessResource(
    user: AuthenticatedUser,
    resource: string,
    resourceId: string,
    action: string,
    resourceData?: any
  ): Promise<boolean> {
    try {
      const guardConfig = this.getGuardConfig(resource);
      
      if (!guardConfig) {
        // No specific guard config, fall back to standard permission check
        return hasPermission(user, resource, action);
      }

      // Check if user has role-based access
      if (guardConfig.allowedRoles && guardConfig.allowedRoles.includes(user.role)) {
        return true;
      }

      // Check ownership if configured
      if (guardConfig.ownershipField) {
        const isOwner = await this.checkOwnership(
          user,
          resource,
          resourceId,
          guardConfig.ownershipField,
          resourceData
        );
        
        if (isOwner) {
          return true;
        }
      }

      // Check custom permissions
      if (guardConfig.customPermissions) {
        for (const permission of guardConfig.customPermissions) {
          if (permission.action === action || permission.action === '*') {
            if (await this.evaluateCustomPermission(user, permission, resourceData)) {
              return true;
            }
          }
        }
      }

      // Check inheritance rules
      if (guardConfig.inheritanceRules) {
        for (const rule of guardConfig.inheritanceRules) {
          if (await this.evaluateInheritanceRule(user, rule, resourceId, resourceData)) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking resource access:', error);
      return false;
    }
  }

  /**
   * Check resource ownership
   */
  public async checkOwnership(
    user: AuthenticatedUser,
    resource: string,
    _resourceId: string,
    ownershipField?: string,
    resourceData?: any
  ): Promise<boolean> {
    try {
      const field = ownershipField || OWNERSHIP_FIELDS[resource as keyof typeof OWNERSHIP_FIELDS] || OWNERSHIP_FIELDS.DEFAULT;
      
      // If resource data is provided, check directly
      if (resourceData && resourceData[field]) {
        return resourceData[field] === user.id;
      }

      // Otherwise, would need to fetch from database
      // TODO: Implement database lookup
      // const record = await this.databaseService.findById(resource, resourceId);
      // return record && record[field] === user.id;
      
      return false; // Placeholder
    } catch (error) {
      console.error('Error checking ownership:', error);
      return false;
    }
  }

  /**
   * Evaluate custom permission with dynamic values
   */
  private async evaluateCustomPermission(
    user: AuthenticatedUser,
    permission: Permission,
    resourceData?: any
  ): Promise<boolean> {
    if (!permission.conditions || permission.conditions.length === 0) {
      return true;
    }

    for (const condition of permission.conditions) {
      const resolvedCondition = this.resolveDynamicValues(condition, user, resourceData);
      
      if (!evaluateCondition(resolvedCondition, resourceData)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate inheritance rule
   */
  private async evaluateInheritanceRule(
    user: AuthenticatedUser,
    rule: InheritanceRule,
    resourceId: string,
    resourceData?: any
  ): Promise<boolean> {
    try {
      // Check if user has access to parent resource
      const hasParentAccess = await this.canAccessResource(
        user,
        rule.parentResource,
        resourceId, // Assuming same ID for simplicity
        'read'
      );

      if (!hasParentAccess) {
        return false;
      }

      // Check relationship condition if specified
      if (rule.condition) {
        const resolvedCondition = this.resolveDynamicValues(rule.condition, user, resourceData);
        return evaluateCondition(resolvedCondition, resourceData);
      }

      // Check relationship type
      switch (rule.relationship) {
        case 'owner':
          return await this.checkOwnership(user, rule.parentResource, resourceId, undefined, resourceData);
        case 'member':
          // TODO: Implement membership checking
          return false;
        case 'viewer':
          // TODO: Implement viewer relationship
          return false;
        case 'custom':
          // Custom logic would be implemented here
          return false;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error evaluating inheritance rule:', error);
      return false;
    }
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  /**
   * Resolve dynamic values in conditions (e.g., ${user.id})
   */
  private resolveDynamicValues(
    condition: PermissionCondition,
    user: AuthenticatedUser,
    resourceData?: any
  ): PermissionCondition {
    let resolvedValue = condition.value;

    if (typeof condition.value === 'string' && condition.value.includes('${')) {
      resolvedValue = condition.value.replace(/\$\{([^}]+)\}/g, (match, path) => {
        const parts = path.split('.');
        
        if (parts[0] === 'user') {
          let value = user as any;
          for (let i = 1; i < parts.length; i++) {
            value = value?.[parts[i]];
          }
          return value;
        }
        
        if (parts[0] === 'resource' && resourceData) {
          let value = resourceData;
          for (let i = 1; i < parts.length; i++) {
            value = value?.[parts[i]];
          }
          return value;
        }
        
        return match; // Return original if not resolved
      });
    }

    return {
      ...condition,
      value: resolvedValue,
    };
  }

  /**
   * Get accessible resources for a user
   */
  public async getAccessibleResources(
    _user: AuthenticatedUser,
    _resource: string,
    _action: string = 'read'
  ): Promise<string[]> {
    // This would typically query the database to find all resources
    // that the user can access based on their permissions and ownership
    
    // TODO: Implement database query
    // const allResources = await this.databaseService.findAll(resource);
    // const accessibleResources = [];
    
    // for (const resourceData of allResources) {
    //   if (await this.canAccessResource(user, resource, resourceData.id, action, resourceData)) {
    //     accessibleResources.push(resourceData.id);
    //   }
    // }
    
    // return accessibleResources;
    
    return []; // Placeholder
  }

  /**
   * Filter resources based on user access
   */
  public async filterAccessibleResources<T extends { id: string }>(
    user: AuthenticatedUser,
    resource: string,
    resources: T[],
    action: string = 'read'
  ): Promise<T[]> {
    const accessibleResources: T[] = [];

    for (const resourceData of resources) {
      if (await this.canAccessResource(user, resource, resourceData.id, action, resourceData)) {
        accessibleResources.push(resourceData);
      }
    }

    return accessibleResources;
  }

  /**
   * Build database query conditions for user access
   */
  public buildAccessQuery(
    user: AuthenticatedUser,
    resource: string,
    action: string = 'read'
  ): any {
    const guardConfig = this.getGuardConfig(resource);
    
    if (!guardConfig) {
      // No guard config, return empty conditions (allow all if user has permission)
      return {};
    }

    const conditions: any[] = [];

    // Add role-based conditions
    if (guardConfig.allowedRoles && guardConfig.allowedRoles.includes(user.role)) {
      // User has role-based access to all resources
      return {}; // No additional filtering needed
    }

    // Add ownership conditions
    if (guardConfig.ownershipField) {
      conditions.push({
        [guardConfig.ownershipField]: user.id,
      });
    }

    // Add custom permission conditions
    if (guardConfig.customPermissions) {
      for (const permission of guardConfig.customPermissions) {
        if (permission.action === action || permission.action === '*') {
          if (permission.conditions) {
            for (const condition of permission.conditions) {
              const resolved = this.resolveDynamicValues(condition, user);
              conditions.push({
                [condition.field]: this.convertConditionToQuery(resolved),
              });
            }
          }
        }
      }
    }

    // Combine conditions with OR logic
    if (conditions.length === 0) {
      return { id: null }; // No access
    }
    
    if (conditions.length === 1) {
      return conditions[0];
    }
    
    return { $or: conditions };
  }

  /**
   * Convert permission condition to database query format
   */
  private convertConditionToQuery(condition: PermissionCondition): any {
    switch (condition.operator) {
      case 'eq':
        return condition.value;
      case 'ne':
        return { $ne: condition.value };
      case 'in':
        return { $in: condition.value };
      case 'nin':
        return { $nin: condition.value };
      case 'gt':
        return { $gt: condition.value };
      case 'gte':
        return { $gte: condition.value };
      case 'lt':
        return { $lt: condition.value };
      case 'lte':
        return { $lte: condition.value };
      case 'contains':
        return { $regex: condition.value, $options: 'i' };
      case 'exists':
        return { $exists: true };
      default:
        return condition.value;
    }
  }
}
