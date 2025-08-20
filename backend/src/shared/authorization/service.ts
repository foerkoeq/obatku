/**
 * Authorization Service
 * 
 * Main service class that orchestrates all authorization functionality.
 * This service provides a clean interface for the entire authorization system.
 */

import { UserRole } from '@prisma/client';
import {
  AuthenticatedUser,
  Permission,
  UserPermissions,
  PermissionCheckInput,
  PermissionCheckResult,
  AuthorizationOptions,
  AuthorizationConfig,
  DynamicPermission,
} from './types';
import { PermissionManager } from './permission-manager';
import { AuditLogger } from './audit-logger';
import { PermissionCache } from './cache';
import { createAuthorizationError } from './utils';
import {
  CACHE_SETTINGS,
  AUDIT_SETTINGS,
} from './constants';

export class AuthorizationService {
  private static instance: AuthorizationService;
  private permissionManager: PermissionManager;
  private auditLogger: AuditLogger;
  private permissionCache: PermissionCache;
  private config: AuthorizationConfig;

  private constructor(config?: Partial<AuthorizationConfig>) {
    this.permissionManager = PermissionManager.getInstance();
    this.auditLogger = AuditLogger.getInstance();
    this.permissionCache = PermissionCache.getInstance();
    
    this.config = {
      cache: {
        enabled: true,
        ttl: CACHE_SETTINGS.PERMISSION_TTL,
        maxSize: CACHE_SETTINGS.MAX_CACHE_SIZE,
        ...config?.cache,
      },
      audit: {
        enabled: AUDIT_SETTINGS.ENABLED,
        level: 'detailed',
        storage: 'database',
        ...config?.audit,
      },
      rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000,
        maxRequests: 100,
        ...config?.rateLimit,
      },
      security: {
        enableStrictMode: false,
        allowSuperAdminBypass: true,
        requireExplicitPermissions: false,
        ...config?.security,
      },
    };
  }

  public static getInstance(config?: Partial<AuthorizationConfig>): AuthorizationService {
    if (!AuthorizationService.instance) {
      AuthorizationService.instance = new AuthorizationService(config);
    }
    return AuthorizationService.instance;
  }

  // ================================================
  // MAIN AUTHORIZATION METHODS
  // ================================================

  /**
   * Check if user has permission to perform an action on a resource
   */
  public async checkPermission(input: PermissionCheckInput): Promise<PermissionCheckResult> {
    try {
      // Check cache first if enabled
      if (this.config.cache?.enabled) {
        const cacheKey = this.buildCacheKey(input);
        const cachedResult = await this.permissionCache.get<PermissionCheckResult>(cacheKey);
        
        if (cachedResult) {
          // Log cache hit if detailed auditing is enabled
          if (this.config.audit?.level === 'detailed' || this.config.audit?.level === 'full') {
            await this.auditLogger.logAccess({
              userId: input.user.id,
              action: 'permission_check_cached',
              resource: `${input.resource}:${input.action}`,
              result: cachedResult.allowed ? 'granted' : 'denied',
              reason: 'From cache',
            });
          }
          
          return cachedResult;
        }
      }

      // Perform permission check
      const result = this.permissionManager.checkPermission(input);

      // Cache the result if enabled
      if (this.config.cache?.enabled && result) {
        const cacheKey = this.buildCacheKey(input);
        await this.permissionCache.set(cacheKey, result, this.config.cache.ttl);
      }

      // Log the permission check if auditing is enabled
      if (this.config.audit?.enabled) {
        await this.auditLogger.logAuthorization(
          input.user.id,
          input.resource,
          input.action,
          result.allowed ? 'granted' : 'denied',
          result.reason
        );
      }

      return result;
    } catch (error) {
      console.error('Error checking permission:', error);
      
      // Log the error
      if (this.config.audit?.enabled) {
        await this.auditLogger.logAccess({
          userId: input.user.id,
          action: 'permission_check_error',
          resource: `${input.resource}:${input.action}`,
          result: 'denied',
          reason: 'System error during permission check',
          context: { error: error instanceof Error ? error.message : 'Unknown error' },
        });
      }
      
      throw createAuthorizationError('FORBIDDEN');
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  public async hasAnyPermission(
    user: AuthenticatedUser,
    permissions: Array<{ resource: string; action: string }>,
    options?: AuthorizationOptions
  ): Promise<boolean> {
    try {
      const results = await Promise.all(
        permissions.map(({ resource, action }) =>
          this.checkPermission({ user, resource, action, options })
        )
      );
      
      return results.some(result => result.allowed);
    } catch (error) {
      console.error('Error checking any permission:', error);
      return false;
    }
  }

  /**
   * Check if user has all of the specified permissions
   */
  public async hasAllPermissions(
    user: AuthenticatedUser,
    permissions: Array<{ resource: string; action: string }>,
    options?: AuthorizationOptions
  ): Promise<boolean> {
    try {
      const results = await Promise.all(
        permissions.map(({ resource, action }) =>
          this.checkPermission({ user, resource, action, options })
        )
      );
      
      return results.every(result => result.allowed);
    } catch (error) {
      console.error('Error checking all permissions:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a user
   */
  public async getUserPermissions(user: AuthenticatedUser): Promise<UserPermissions> {
    try {
      // Check cache first
      if (this.config.cache?.enabled) {
        const cacheKey = `user_permissions:${user.id}:${user.role}`;
        const cachedPermissions = await this.permissionCache.get<UserPermissions>(cacheKey);
        
        if (cachedPermissions) {
          return cachedPermissions;
        }
      }

      // Get permissions from manager
      const permissions = this.permissionManager.getUserPermissions(user.id, user.role);
      
      const userPermissions: UserPermissions = {
        userId: user.id,
        role: user.role,
        permissions,
        resourceAccess: [], // TODO: Implement resource-specific access
        customPermissions: [], // TODO: Implement custom permissions
      };

      // Cache the result
      if (this.config.cache?.enabled) {
        const cacheKey = `user_permissions:${user.id}:${user.role}`;
        await this.permissionCache.set(
          cacheKey,
          userPermissions,
          CACHE_SETTINGS.USER_PERMISSION_TTL
        );
      }

      return userPermissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      throw createAuthorizationError('FORBIDDEN');
    }
  }

  // ================================================
  // DYNAMIC PERMISSION MANAGEMENT
  // ================================================

  /**
   * Grant a dynamic permission to a user
   */
  public async grantDynamicPermission(
    targetUserId: string,
    permission: Permission,
    grantedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    try {
      const dynamicPermission: DynamicPermission = {
        id: this.generateId(),
        userId: targetUserId,
        permission,
        grantedBy,
        grantedAt: new Date(),
        expiresAt,
      };

      // Add to permission manager
      this.permissionManager.addDynamicPermission(targetUserId, permission);

      // Invalidate cache
      if (this.config.cache?.enabled) {
        await this.invalidateUserCache(targetUserId);
      }

      // Log the action
      if (this.config.audit?.enabled) {
        await this.auditLogger.logAccess({
          userId: grantedBy,
          action: 'grant_dynamic_permission',
          resource: 'permissions',
          resourceId: dynamicPermission.id,
          result: 'granted',
          context: {
            targetUserId,
            permission: `${permission.resource}:${permission.action}`,
            expiresAt,
          },
        });
      }

      // TODO: Persist to database
    } catch (error) {
      console.error('Error granting dynamic permission:', error);
      throw createAuthorizationError('FORBIDDEN');
    }
  }

  /**
   * Revoke a dynamic permission from a user
   */
  public async revokeDynamicPermission(
    targetUserId: string,
    resource: string,
    action: string,
    revokedBy: string
  ): Promise<void> {
    try {
      // Remove from permission manager
      this.permissionManager.removeDynamicPermission(targetUserId, resource, action);

      // Invalidate cache
      if (this.config.cache?.enabled) {
        await this.invalidateUserCache(targetUserId);
      }

      // Log the action
      if (this.config.audit?.enabled) {
        await this.auditLogger.logAccess({
          userId: revokedBy,
          action: 'revoke_dynamic_permission',
          resource: 'permissions',
          result: 'granted',
          context: {
            targetUserId,
            permission: `${resource}:${action}`,
          },
        });
      }

      // TODO: Update database
    } catch (error) {
      console.error('Error revoking dynamic permission:', error);
      throw createAuthorizationError('FORBIDDEN');
    }
  }

  // ================================================
  // ROLE MANAGEMENT
  // ================================================

  /**
   * Get permissions for a specific role
   */
  public getRolePermissions(role: UserRole): Permission[] {
    return this.permissionManager.getRolePermissions(role);
  }

  /**
   * Update permissions for a role
   */
  public async updateRolePermissions(
    role: UserRole,
    permissions: Permission[],
    updatedBy: string
  ): Promise<void> {
    try {
      // Validate permissions
      const invalidPermissions = permissions.filter(p => !this.permissionManager.validatePermission(p));
      if (invalidPermissions.length > 0) {
        throw createAuthorizationError('INVALID_PERMISSION');
      }

      // Update role permissions
      this.permissionManager.setRolePermissions(role, permissions);

      // Invalidate all caches for users with this role
      if (this.config.cache?.enabled) {
        await this.invalidateRoleCache(role);
      }

      // Log the action
      if (this.config.audit?.enabled) {
        await this.auditLogger.logAccess({
          userId: updatedBy,
          action: 'update_role_permissions',
          resource: 'roles',
          resourceId: role,
          result: 'granted',
          context: {
            role,
            permissionsCount: permissions.length,
            permissions: permissions.map(p => `${p.resource}:${p.action}`),
          },
        });
      }

      // TODO: Persist to database
    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw error;
    }
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  /**
   * Get permission matrix for all roles
   */
  public getPermissionMatrix(): Record<string, Record<string, string[]>> {
    return this.permissionManager.getPermissionMatrix();
  }

  /**
   * Validate a permission structure
   */
  public validatePermission(permission: Permission): boolean {
    return this.permissionManager.validatePermission(permission);
  }

  /**
   * Clear all dynamic permissions for a user
   */
  public async clearUserDynamicPermissions(userId: string, clearedBy: string): Promise<void> {
    try {
      this.permissionManager.clearDynamicPermissions(userId);
      
      if (this.config.cache?.enabled) {
        await this.invalidateUserCache(userId);
      }

      if (this.config.audit?.enabled) {
        await this.auditLogger.logAccess({
          userId: clearedBy,
          action: 'clear_dynamic_permissions',
          resource: 'permissions',
          result: 'granted',
          context: { targetUserId: userId },
        });
      }
    } catch (error) {
      console.error('Error clearing dynamic permissions:', error);
      throw createAuthorizationError('FORBIDDEN');
    }
  }

  // ================================================
  // CACHE MANAGEMENT
  // ================================================

  private buildCacheKey(input: PermissionCheckInput): string {
    const { user, resource, action, resourceId } = input;
    return `permission:${user.id}:${user.role}:${resource}:${action}:${resourceId || 'null'}`;
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `permission:${userId}:*`,
      `user_permissions:${userId}:*`,
    ];
    
    for (const pattern of patterns) {
      await this.permissionCache.invalidatePattern(pattern);
    }
  }

  private async invalidateRoleCache(role: UserRole): Promise<void> {
    const patterns = [
      `permission:*:${role}:*`,
      `user_permissions:*:${role}`,
    ];
    
    for (const pattern of patterns) {
      await this.permissionCache.invalidatePattern(pattern);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ================================================
  // SHUTDOWN
  // ================================================

  /**
   * Gracefully shutdown the authorization service
   */
  public async shutdown(): Promise<void> {
    await this.auditLogger.shutdown();
    // Additional cleanup if needed
  }
}
