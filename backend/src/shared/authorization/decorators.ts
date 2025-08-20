/**
 * Authorization Decorators
 * 
 * Decorators for adding authorization to class methods and controllers.
 * These decorators provide a clean way to add authorization without cluttering business logic.
 * 
 * Note: These decorators can be used with future class-based controllers or services.
 */

import 'reflect-metadata';
import { UserRole } from '@prisma/client';

// Metadata keys for storing decorator information
const REQUIRE_ROLE_KEY = Symbol('requireRole');
const REQUIRE_PERMISSION_KEY = Symbol('requirePermission');
const AUDIT_ACTION_KEY = Symbol('auditAction');
const RATE_LIMIT_KEY = Symbol('rateLimit');

// ================================================
// ROLE-BASED DECORATORS
// ================================================

/**
 * Decorator to require specific roles for method access
 * @param roles Array of required roles
 */
export function RequireRole(...roles: UserRole[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(REQUIRE_ROLE_KEY, roles, target, propertyKey);
    
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // In a real implementation, you would:
      // 1. Extract user from context (req.user)
      // 2. Check if user has required role
      // 3. Throw error if not authorized
      // 4. Call original method if authorized
      
      console.log(`[RequireRole] Checking roles: ${roles.join(', ')} for method: ${propertyKey}`);
      
      // TODO: Implement actual role checking logic
      // const user = extractUserFromContext(args);
      // if (!hasRequiredRole(user, roles)) {
      //   throw new AuthorizationError('INSUFFICIENT_ROLE');
      // }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Decorator to require admin role
 */
export function RequireAdmin() {
  return RequireRole(UserRole.ADMIN);
}

/**
 * Decorator to require DINAS role or higher
 */
export function RequireDinas() {
  return RequireRole(UserRole.ADMIN, UserRole.DINAS);
}

/**
 * Decorator to require POPT role or higher
 */
export function RequirePOPT() {
  return RequireRole(UserRole.ADMIN, UserRole.DINAS, UserRole.POPT);
}

// ================================================
// PERMISSION-BASED DECORATORS
// ================================================

/**
 * Decorator to require specific permission for method access
 * @param resource The resource being accessed
 * @param action The action being performed
 */
export function RequirePermission(resource: string, action: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(REQUIRE_PERMISSION_KEY, { resource, action }, target, propertyKey);
    
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      console.log(`[RequirePermission] Checking permission: ${resource}:${action} for method: ${propertyKey}`);
      
      // TODO: Implement actual permission checking logic
      // const user = extractUserFromContext(args);
      // const permissionService = getPermissionService();
      // 
      // if (!await permissionService.hasPermission(user, resource, action)) {
      //   throw new AuthorizationError('INSUFFICIENT_PERMISSION');
      // }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Decorator for read permission
 */
export function RequireRead(resource: string) {
  return RequirePermission(resource, 'read');
}

/**
 * Decorator for write permission
 */
export function RequireWrite(resource: string) {
  return RequirePermission(resource, 'create');
}

/**
 * Decorator for update permission
 */
export function RequireUpdate(resource: string) {
  return RequirePermission(resource, 'update');
}

/**
 * Decorator for delete permission
 */
export function RequireDelete(resource: string) {
  return RequirePermission(resource, 'delete');
}

// ================================================
// AUDIT DECORATORS
// ================================================

/**
 * Decorator to add audit logging to methods
 * @param action The action being performed
 * @param resource The resource being accessed (optional)
 */
export function AuditAction(action: string, resource?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(AUDIT_ACTION_KEY, { action, resource }, target, propertyKey);
    
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let result: any;
      let error: any;
      
      try {
        console.log(`[AuditAction] Starting: ${action} on ${resource || 'unknown'} - method: ${propertyKey}`);
        
        result = await originalMethod.apply(this, args);
        
        // TODO: Implement actual audit logging
        // const user = extractUserFromContext(args);
        // const auditLogger = getAuditLogger();
        // 
        // await auditLogger.logAction({
        //   userId: user.id,
        //   action,
        //   resource: resource || propertyKey,
        //   result: 'success',
        //   duration: Date.now() - startTime,
        //   context: extractContextFromArgs(args)
        // });
        
        return result;
      } catch (err) {
        error = err;
        
        // TODO: Log failed action
        // await auditLogger.logAction({
        //   userId: user?.id || 'unknown',
        //   action,
        //   resource: resource || propertyKey,
        //   result: 'failure',
        //   error: err.message,
        //   duration: Date.now() - startTime
        // });
        
        throw err;
      } finally {
        const duration = Date.now() - startTime;
        console.log(`[AuditAction] Completed: ${action} - duration: ${duration}ms - result: ${error ? 'failure' : 'success'}`);
      }
    };
    
    return descriptor;
  };
}

// ================================================
// RATE LIMITING DECORATORS
// ================================================

/**
 * Decorator to add rate limiting to methods
 * @param maxRequests Maximum requests per window
 * @param windowMs Time window in milliseconds
 */
export function RateLimit(maxRequests: number, windowMs: number = 60000) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(RATE_LIMIT_KEY, { maxRequests, windowMs }, target, propertyKey);
    
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // TODO: Extract user ID from context
      // const user = extractUserFromContext(args);
      // const key = `${user.id}:${target.constructor.name}:${propertyKey}`;
      const key = `default:${target.constructor.name}:${propertyKey}`; // Placeholder
      
      const now = Date.now();
      const current = requestCounts.get(key);
      
      if (!current) {
        requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      } else if (now > current.resetTime) {
        requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      } else if (current.count >= maxRequests) {
        const error = new Error('Rate limit exceeded');
        (error as any).statusCode = 429;
        throw error;
      } else {
        current.count++;
      }
      
      console.log(`[RateLimit] ${key}: ${requestCounts.get(key)?.count}/${maxRequests}`);
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

// ================================================
// COMPOSITE DECORATORS
// ================================================

/**
 * Decorator that combines role requirement and audit logging
 * @param roles Required roles
 * @param action Audit action name
 * @param resource Resource name for audit
 */
export function SecureAction(roles: UserRole[], action: string, resource?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Apply role requirement
    RequireRole(...roles)(target, propertyKey, descriptor);
    
    // Apply audit logging
    AuditAction(action, resource)(target, propertyKey, descriptor);
    
    return descriptor;
  };
}

/**
 * Decorator for admin-only actions with audit logging
 * @param action Audit action name
 * @param resource Resource name for audit
 */
export function AdminAction(action: string, resource?: string) {
  return SecureAction([UserRole.ADMIN], action, resource);
}

/**
 * Decorator for protected CRUD operations
 * @param resource The resource being accessed
 * @param operation The CRUD operation (create, read, update, delete)
 * @param roles Required roles (optional, defaults to resource-specific roles)
 */
export function ProtectedCRUD(
  resource: string,
  operation: 'create' | 'read' | 'update' | 'delete',
  roles?: UserRole[]
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Apply permission requirement
    RequirePermission(resource, operation)(target, propertyKey, descriptor);
    
    // Apply audit logging
    AuditAction(`${operation}_${resource}`, resource)(target, propertyKey, descriptor);
    
    // Apply role requirement if specified
    if (roles) {
      RequireRole(...roles)(target, propertyKey, descriptor);
    }
    
    return descriptor;
  };
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Get role requirements from method metadata
 */
export function getRoleRequirements(target: any, propertyKey: string): UserRole[] | undefined {
  return Reflect.getMetadata(REQUIRE_ROLE_KEY, target, propertyKey);
}

/**
 * Get permission requirements from method metadata
 */
export function getPermissionRequirements(target: any, propertyKey: string): { resource: string; action: string } | undefined {
  return Reflect.getMetadata(REQUIRE_PERMISSION_KEY, target, propertyKey);
}

/**
 * Get audit action from method metadata
 */
export function getAuditAction(target: any, propertyKey: string): { action: string; resource?: string } | undefined {
  return Reflect.getMetadata(AUDIT_ACTION_KEY, target, propertyKey);
}

/**
 * Get rate limit settings from method metadata
 */
export function getRateLimit(target: any, propertyKey: string): { maxRequests: number; windowMs: number } | undefined {
  return Reflect.getMetadata(RATE_LIMIT_KEY, target, propertyKey);
}

/**
 * Check if method has authorization decorators
 */
export function hasAuthorizationDecorators(target: any, propertyKey: string): boolean {
  return !!(
    getRoleRequirements(target, propertyKey) ||
    getPermissionRequirements(target, propertyKey)
  );
}

// ================================================
// EXAMPLE USAGE
// ================================================

/*
// Example controller class using decorators:

class UserController {
  @RequireAdmin()
  @AuditAction('create_user', 'users')
  @RateLimit(10, 60000) // 10 requests per minute
  async createUser(userData: any) {
    // Create user logic
  }
  
  @RequirePermission('users', 'read')
  async getUser(id: string) {
    // Get user logic
  }
  
  @ProtectedCRUD('users', 'update')
  async updateUser(id: string, data: any) {
    // Update user logic
  }
  
  @SecureAction([UserRole.ADMIN, UserRole.DINAS], 'delete_user', 'users')
  async deleteUser(id: string) {
    // Delete user logic
  }
}

// Example service class:

class InventoryService {
  @RequirePOPT()
  @AuditAction('update_stock', 'inventory')
  async updateStock(medicineId: string, quantity: number) {
    // Update stock logic
  }
  
  @RequireRead('inventory')
  async getStock(medicineId: string) {
    // Get stock logic
  }
}
*/
