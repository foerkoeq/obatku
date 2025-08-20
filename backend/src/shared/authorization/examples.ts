/**
 * Authorization System Example Usage
 * 
 * Comprehensive examples showing how to use the authorization system
 * in different scenarios and contexts.
 */

import express from 'express';
import { UserRole } from '@prisma/client';
import {
  AuthorizationService,
  PermissionManager,
  ResourceGuard,
  AuditLogger,
  authenticate,
  authorize,
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireResourceAccess,
  withAuditLog,
  withRateLimit,
  hasPermission,
  hasAllPermissions,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from './index';

// ================================================
// BASIC MIDDLEWARE USAGE
// ================================================

const app = express();

// Basic authentication check
app.use('/api', authenticate);

// Role-based protection
app.get('/admin/dashboard',
  authenticate,
  requireRole(UserRole.ADMIN),
  (_req, res) => {
    res.json({ message: 'Admin dashboard data' });
  }
);

// Multiple roles allowed
app.get('/management/overview',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.DINAS]),
  (_req, res) => {
    res.json({ message: 'Management overview' });
  }
);

// Permission-based protection
app.post('/medicines',
  authenticate,
  requirePermission(PERMISSION_RESOURCES.MEDICINES, PERMISSION_ACTIONS.CREATE),
  withAuditLog('create_medicine', PERMISSION_RESOURCES.MEDICINES),
  (_req, res) => {
    // Create medicine logic
    res.json({ success: true, message: 'Medicine created' });
  }
);

// Multiple permission options (any)
app.get('/inventory',
  authenticate,
  requireAnyPermission([
    { resource: PERMISSION_RESOURCES.MEDICINES, action: PERMISSION_ACTIONS.READ },
    { resource: PERMISSION_RESOURCES.INVENTORY, action: PERMISSION_ACTIONS.READ }
  ]),
  (_req, res) => {
    res.json({ inventory: [] });
  }
);

// Multiple permissions required (all)
app.post('/medicines/bulk-import',
  authenticate,
  requireAllPermissions([
    { resource: PERMISSION_RESOURCES.MEDICINES, action: PERMISSION_ACTIONS.CREATE },
    { resource: PERMISSION_RESOURCES.MEDICINES, action: PERMISSION_ACTIONS.BULK_CREATE }
  ]),
  withRateLimit(5, 60000), // 5 requests per minute
  withAuditLog('bulk_import_medicines', PERMISSION_RESOURCES.MEDICINES),
  (_req, res) => {
    // Bulk import logic
    res.json({ success: true, imported: 0 });
  }
);

// Resource-specific access control
app.get('/submissions/:id',
  authenticate,
  requireResourceAccess({
    resource: PERMISSION_RESOURCES.SUBMISSIONS,
    idParam: 'id',
    checkOwnership: true,
    ownershipField: 'created_by',
    allowedRoles: [UserRole.ADMIN, UserRole.DINAS]
  }),
  (_req, res) => {
    res.json({ submission: {} });
  }
);

// ================================================
// SERVICE LAYER EXAMPLES
// ================================================

class UserService {
  private auditLogger = AuditLogger.getInstance();

  async createUser(currentUser: any, userData: any) {
    // Check if current user can create users
    const canCreate = hasPermission(currentUser, PERMISSION_RESOURCES.USERS, PERMISSION_ACTIONS.CREATE);
    
    if (!canCreate) {
      throw new Error('Insufficient permissions to create user');
    }

    // Create user logic
    const newUser = {
      id: 'new-user-id',
      ...userData
    };

    // Log the action
    await this.auditLogger.logResourceOperation(
      currentUser.id,
      'create',
      PERMISSION_RESOURCES.USERS,
      newUser.id,
      'success'
    );

    return newUser;
  }

  async getUsers(currentUser: any, filters: any = {}) {
    // Check if user can view all users or only specific ones
    const canViewAll = hasPermission(currentUser, PERMISSION_RESOURCES.USERS, PERMISSION_ACTIONS.VIEW_ALL);
    
    if (canViewAll) {
      // Return all users
      return this.getAllUsers(filters);
    } else {
      // Check if user can view their own profile
      const canViewOwn = hasPermission(currentUser, PERMISSION_RESOURCES.USERS, PERMISSION_ACTIONS.READ);
      
      if (canViewOwn) {
        return this.getUserById(currentUser.id);
      } else {
        throw new Error('No permission to view users');
      }
    }
  }

  private async getAllUsers(_filters: any) {
    // Database query to get all users
    return [];
  }

  private async getUserById(_id: string) {
    // Database query to get specific user
    return {};
  }
}

// ================================================
// MEDICINE MANAGEMENT EXAMPLES
// ================================================

class MedicineService {
  private resourceGuard = ResourceGuard.getInstance();
  private permissionManager = PermissionManager.getInstance();

  async updateMedicine(user: any, medicineId: string, updateData: any) {
    // Complex permission checking with conditions
    const result = this.permissionManager.checkPermission({
      user,
      resource: PERMISSION_RESOURCES.MEDICINES,
      action: PERMISSION_ACTIONS.UPDATE,
      resourceId: medicineId,
      context: {
        medicine: { status: 'active' }, // Medicine must be active to update
        ...updateData
      }
    });

    if (!result.allowed) {
      throw new Error(`Update not allowed: ${result.reason}`);
    }

    // Update medicine
    return { id: medicineId, ...updateData };
  }

  async deleteMedicine(user: any, medicineId: string) {
    // Check multiple conditions for deletion
    const requiredPermissions = [
      { resource: PERMISSION_RESOURCES.MEDICINES, action: PERMISSION_ACTIONS.DELETE },
      { resource: PERMISSION_RESOURCES.INVENTORY, action: PERMISSION_ACTIONS.READ }
    ];

    if (!hasAllPermissions(user, requiredPermissions)) {
      throw new Error('Insufficient permissions for deletion');
    }

    // Additional business logic check
    const medicine = await this.getMedicine(medicineId);
    if (medicine.current_stock > 0) {
      throw new Error('Cannot delete medicine with existing stock');
    }

    // Proceed with deletion
    return { deleted: true };
  }

  async getMedicines(user: any, filters: any = {}) {
    // Use resource guard to filter accessible medicines
    const allMedicines = await this.getAllMedicinesFromDB(filters);
    
    const accessibleMedicines = await this.resourceGuard.filterAccessibleResources(
      user,
      PERMISSION_RESOURCES.MEDICINES,
      allMedicines,
      PERMISSION_ACTIONS.READ
    );

    return accessibleMedicines;
  }

  private async getMedicine(id: string) {
    return { id, current_stock: 0 };
  }

  private async getAllMedicinesFromDB(_filters: any) {
    return [];
  }
}

// ================================================
// SUBMISSION WORKFLOW EXAMPLES
// ================================================

class SubmissionService {
  private authService = AuthorizationService.getInstance();
  private auditLogger = AuditLogger.getInstance();

  async createSubmission(user: any, submissionData: any) {
    // Only PPL can create submissions
    if (user.role !== UserRole.PPL) {
      throw new Error('Only PPL can create submissions');
    }

    // Check permission
    if (!hasPermission(user, PERMISSION_RESOURCES.SUBMISSIONS, PERMISSION_ACTIONS.CREATE)) {
      throw new Error('No permission to create submissions');
    }

    const submission = {
      id: 'submission-id',
      ...submissionData,
      created_by: user.id,
      status: 'pending'
    };

    // Log submission creation
    await this.auditLogger.logResourceOperation(
      user.id,
      'create',
      PERMISSION_RESOURCES.SUBMISSIONS,
      submission.id,
      'success'
    );

    return submission;
  }

  async approveSubmission(user: any, submissionId: string) {
    // Only DINAS can approve
    if (user.role !== UserRole.DINAS) {
      throw new Error('Only DINAS can approve submissions');
    }

    // Check permission with context
    const result = await this.authService.checkPermission({
      user,
      resource: PERMISSION_RESOURCES.APPROVALS,
      action: PERMISSION_ACTIONS.APPROVE,
      resourceId: submissionId,
      context: {
        submission: { status: 'pending' }
      }
    });

    if (!result.allowed) {
      throw new Error(`Approval not allowed: ${result.reason}`);
    }

    // Update submission status
    const updatedSubmission = {
      id: submissionId,
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date()
    };

    // Log approval
    await this.auditLogger.logResourceOperation(
      user.id,
      'approve',
      PERMISSION_RESOURCES.SUBMISSIONS,
      submissionId,
      'success'
    );

    return updatedSubmission;
  }

  async getSubmissions(user: any, filters: any = {}) {
    const canViewAll = hasPermission(user, PERMISSION_RESOURCES.SUBMISSIONS, PERMISSION_ACTIONS.VIEW_ALL);
    
    if (canViewAll) {
      // ADMIN and DINAS can see all submissions
      return this.getAllSubmissions(filters);
    } else {
      // PPL can only see their own submissions
      return this.getUserSubmissions(user.id, filters);
    }
  }

  private async getAllSubmissions(_filters: any) {
    return [];
  }

  private async getUserSubmissions(_userId: string, _filters: any) {
    return [];
  }
}

// ================================================
// DYNAMIC PERMISSION EXAMPLES
// ================================================

class PermissionManagementService {
  private authService = AuthorizationService.getInstance();

  async grantTemporaryAccess(
    adminUser: any,
    targetUserId: string,
    resource: string,
    action: string,
    durationHours: number = 24
  ) {
    // Only admin can grant permissions
    if (adminUser.role !== UserRole.ADMIN) {
      throw new Error('Only admins can grant permissions');
    }

    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    await this.authService.grantDynamicPermission(
      targetUserId,
      { resource, action },
      adminUser.id,
      expiresAt
    );

    return {
      granted: true,
      resource,
      action,
      expiresAt,
      grantedBy: adminUser.id
    };
  }

  async revokeAccess(adminUser: any, targetUserId: string, resource: string, action: string) {
    if (adminUser.role !== UserRole.ADMIN) {
      throw new Error('Only admins can revoke permissions');
    }

    await this.authService.revokeDynamicPermission(
      targetUserId,
      resource,
      action,
      adminUser.id
    );

    return { revoked: true };
  }
}

// ================================================
// AUDIT AND MONITORING EXAMPLES
// ================================================

class SecurityMonitoringService {
  private auditLogger = AuditLogger.getInstance();

  async logSecurityEvent(user: any, event: string, details: any, req?: any) {
    await this.auditLogger.logSecurityEvent(
      user?.id || 'anonymous',
      event as any,
      details,
      req
    );
  }

  async getSecurityEvents(filters: any = {}) {
    return this.auditLogger.getSecurityEvents({
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: filters.limit || 100
    });
  }

  async getUserAuditLog(userId: string, filters: any = {}) {
    return this.auditLogger.getAuditLogsForUser(userId, {
      startDate: filters.startDate,
      endDate: filters.endDate,
      actions: filters.actions,
      limit: filters.limit || 50
    });
  }
}

// ================================================
// ERROR HANDLING EXAMPLES
// ================================================

class AuthorizationErrorHandler {
  static handleAuthError(error: any, _req: any, res: any, _next: any) {
    if (error.code === 'UNAUTHORIZED') {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: error.code
      });
    }

    if (error.code === 'INSUFFICIENT_ROLE' || error.code === 'INSUFFICIENT_PERMISSION') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        code: error.code,
        details: error.details
      });
    }

    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      return res.status(429).json({
        success: false,
        message: 'Too many requests',
        code: error.code,
        retryAfter: error.details?.resetTime
      });
    }

    // Log unexpected errors
    console.error('Unexpected authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

// ================================================
// TESTING EXAMPLES
// ================================================

export class AuthorizationTestHelpers {
  static createMockUser(role: UserRole, id: string = 'test-user'): any {
    return {
      id,
      email: `${id}@test.com`,
      role,
      status: 'active'
    };
  }

  static async testPermission(user: any, resource: string, action: string): Promise<boolean> {
    return hasPermission(user, resource, action);
  }

  static async testResourceAccess(
    user: any,
    resource: string,
    resourceId: string,
    action: string,
    resourceData?: any
  ): Promise<boolean> {
    const resourceGuard = ResourceGuard.getInstance();
    return resourceGuard.canAccessResource(user, resource, resourceId, action, resourceData);
  }

  static createMockRequest(user: any, params: any = {}, body: any = {}): any {
    return {
      user,
      params,
      body,
      method: 'GET',
      path: '/test',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'test-agent'
      }
    };
  }
}

// ================================================
// INTEGRATION EXAMPLES
// ================================================

// Express app with full authorization setup
export function createAuthorizedApp() {
  const app = express();

  // Global middleware
  app.use(express.json());
  app.use('/api', authenticate);

  // Error handling
  app.use(AuthorizationErrorHandler.handleAuthError);

  // Protected routes
  const userRoutes = express.Router();
  userRoutes.get('/', requireRole(UserRole.ADMIN), (_req, res) => {
    res.json({ users: [] });
  });
  userRoutes.post('/', 
    requirePermission(PERMISSION_RESOURCES.USERS, PERMISSION_ACTIONS.CREATE),
    withAuditLog('create_user', PERMISSION_RESOURCES.USERS),
    (_req, res) => {
      res.json({ success: true });
    }
  );

  app.use('/api/users', userRoutes);

  return app;
}

// Database integration example
export class DatabaseAuthorizationHelper {
  static buildUserQuery(user: any, resource: string): any {
    const resourceGuard = ResourceGuard.getInstance();
    return resourceGuard.buildAccessQuery(user, resource, 'read');
  }

  static async filterUserData(user: any, data: any[], resource: string): Promise<any[]> {
    const resourceGuard = ResourceGuard.getInstance();
    return resourceGuard.filterAccessibleResources(user, resource, data, 'read');
  }
}

export {
  UserService,
  MedicineService,
  SubmissionService,
  PermissionManagementService,
  SecurityMonitoringService,
  AuthorizationErrorHandler
};
