# Authorization System Documentation

## Overview

Sistem authorization yang komprehensif, modular, dan reusable untuk aplikasi manajemen obat pertanian. Sistem ini menyediakan:

- **Role-based Access Control (RBAC)**
- **Permission-based Authorization**
- **Resource-level Access Control**
- **Audit Logging**
- **Caching untuk Performance**
- **Rate Limiting**
- **Dynamic Permissions**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Authorization System                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Middleware    │  │  Permission     │  │  Resource   │  │
│  │   Layer         │  │  Manager        │  │  Guard      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  Authorization  │  │  Audit Logger   │  │  Cache      │  │
│  │  Service        │  │                 │  │  System     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│               Core Types & Constants                        │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Basic Setup

```typescript
import { AuthorizationService, requireRole, requirePermission } from '@/shared/authorization';

// Initialize service
const authService = AuthorizationService.getInstance();

// Use middleware in routes
app.get('/admin/users', 
  authenticate, 
  requireRole(UserRole.ADMIN),
  userController.getAll
);

app.post('/medicines', 
  authenticate,
  requirePermission('medicines', 'create'),
  medicineController.create
);
```

### 2. Permission Checking

```typescript
import { hasPermission, hasAnyPermission } from '@/shared/authorization';

// Check single permission
const canCreate = hasPermission(user, 'medicines', 'create');

// Check multiple permissions (any)
const canManage = hasAnyPermission(user, [
  { resource: 'medicines', action: 'create' },
  { resource: 'medicines', action: 'update' }
]);

// Check with authorization service
const result = await authService.checkPermission({
  user,
  resource: 'submissions',
  action: 'approve',
  context: { status: 'pending' }
});
```

### 3. Resource Access Control

```typescript
import { requireResourceAccess, ResourceGuard } from '@/shared/authorization';

// Middleware for resource access
app.get('/submissions/:id',
  authenticate,
  requireResourceAccess({
    resource: 'submissions',
    checkOwnership: true,
    ownershipField: 'created_by',
    allowedRoles: [UserRole.ADMIN, UserRole.DINAS]
  }),
  submissionController.getById
);

// Programmatic resource access
const resourceGuard = ResourceGuard.getInstance();
const canAccess = await resourceGuard.canAccessResource(
  user, 
  'submissions', 
  submissionId, 
  'read',
  submissionData
);
```

## Permission Matrix

### ADMIN Role
- **Users**: Full CRUD + management
- **Medicines**: Full CRUD + bulk operations
- **Inventory**: Full management
- **QR Codes**: Generate, scan, manage
- **Submissions**: Full workflow control
- **Transactions**: Full control
- **Reports**: Full access
- **System**: Settings & audit access

### DINAS Role
- **Medicines**: Read + limited update
- **Inventory**: Read + update
- **QR Codes**: Create, generate, scan
- **Submissions**: View all
- **Approvals**: **Main responsibility** - approve/reject
- **Transactions**: Create + verify
- **Reports**: Read + export

### POPT Role
- **Medicines**: Full CRUD
- **Inventory**: Full management
- **QR Codes**: Generate + scan
- **Submissions**: View only
- **Transactions**: Create + **distribute**
- **Reports**: Read only

### PPL Role
- **Medicines**: Read only
- **Inventory**: Read only
- **QR Codes**: Scan only
- **Submissions**: **Create + view own**
- **Transactions**: View own
- **Files**: Create + view own

## Advanced Features

### 1. Conditional Permissions

```typescript
// Permission with conditions
const permission: Permission = {
  resource: 'submissions',
  action: 'update',
  conditions: [
    {
      field: 'status',
      operator: 'eq',
      value: 'draft'
    },
    {
      field: 'created_by',
      operator: 'eq', 
      value: '${user.id}' // Dynamic value
    }
  ]
};
```

### 2. Dynamic Permissions

```typescript
// Grant temporary permission
await authService.grantDynamicPermission(
  userId,
  { resource: 'medicines', action: 'delete' },
  grantedByUserId,
  new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24h
);

// Revoke permission
await authService.revokeDynamicPermission(
  userId,
  'medicines',
  'delete',
  revokedByUserId
);
```

### 3. Audit Logging

```typescript
import { AuditLogger, withAuditLog } from '@/shared/authorization';

// Automatic audit logging middleware
app.post('/medicines',
  authenticate,
  requirePermission('medicines', 'create'),
  withAuditLog('create_medicine', 'medicines'),
  medicineController.create
);

// Manual audit logging
const auditLogger = AuditLogger.getInstance();
await auditLogger.logResourceOperation(
  userId,
  'create',
  'medicines',
  medicineId,
  'success',
  req
);
```

### 4. Caching

```typescript
import { PermissionCache } from '@/shared/authorization';

const cache = PermissionCache.getInstance();

// Cache user permissions
await cache.cacheUserPermissions(userId, role, permissions, 300); // 5 min TTL

// Invalidate cache
await cache.invalidateUserPermissions(userId);
await cache.invalidatePattern('permission:*:ADMIN:*');
```

### 5. Rate Limiting

```typescript
import { withRateLimit } from '@/shared/authorization';

// Add rate limiting
app.post('/login',
  withRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  authController.login
);
```

## Usage Examples

### Express Route Protection

```typescript
import express from 'express';
import {
  authenticate,
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireResourceAccess,
  withAuditLog,
  withRateLimit
} from '@/shared/authorization';

const router = express.Router();

// User management routes
router.get('/users',
  authenticate,
  requireRole(UserRole.ADMIN),
  withAuditLog('list_users', 'users'),
  userController.getAll
);

router.post('/users',
  authenticate,
  requirePermission('users', 'create'),
  withRateLimit(10, 60000), // 10 per minute
  withAuditLog('create_user', 'users'),
  userController.create
);

// Medicine management
router.get('/medicines',
  authenticate,
  requireAnyPermission([
    { resource: 'medicines', action: 'read' },
    { resource: 'inventory', action: 'read' }
  ]),
  medicineController.getAll
);

router.put('/medicines/:id',
  authenticate,
  requirePermission('medicines', 'update'),
  requireResourceAccess({
    resource: 'medicines',
    idParam: 'id'
  }),
  withAuditLog('update_medicine', 'medicines'),
  medicineController.update
);

// Submission workflow
router.post('/submissions',
  authenticate,
  requireRole(UserRole.PPL),
  withAuditLog('create_submission', 'submissions'),
  submissionController.create
);

router.get('/submissions/:id',
  authenticate,
  requireResourceAccess({
    resource: 'submissions',
    checkOwnership: true,
    ownershipField: 'created_by',
    allowedRoles: [UserRole.ADMIN, UserRole.DINAS]
  }),
  submissionController.getById
);

router.put('/submissions/:id/approve',
  authenticate,
  requireRole(UserRole.DINAS),
  requirePermission('approvals', 'approve'),
  withAuditLog('approve_submission', 'approvals'),
  approvalController.approve
);
```

### Service Layer Integration

```typescript
import { AuthorizationService, hasPermission } from '@/shared/authorization';

class SubmissionService {
  private authService = AuthorizationService.getInstance();

  async createSubmission(user: AuthenticatedUser, data: any) {
    // Check permission
    if (!hasPermission(user, 'submissions', 'create')) {
      throw new ForbiddenError('Cannot create submission');
    }

    // Business logic
    const submission = await this.submissionRepository.create({
      ...data,
      created_by: user.id,
      status: 'pending'
    });

    return submission;
  }

  async getSubmissions(user: AuthenticatedUser, filters: any) {
    // Check what user can access
    const result = await this.authService.checkPermission({
      user,
      resource: 'submissions',
      action: 'view_all'
    });

    if (result.allowed) {
      // User can see all submissions
      return this.submissionRepository.findAll(filters);
    } else {
      // User can only see own submissions
      return this.submissionRepository.findAll({
        ...filters,
        created_by: user.id
      });
    }
  }
}
```

### Custom Permission Checking

```typescript
import { 
  hasPermission, 
  hasAllPermissions,
  ResourceGuard,
  debugPermissionCheck 
} from '@/shared/authorization';

class MedicineService {
  private resourceGuard = ResourceGuard.getInstance();

  async updateMedicine(user: AuthenticatedUser, id: string, data: any) {
    // Multiple permission checks
    const requiredPermissions = [
      { resource: 'medicines', action: 'update' },
      { resource: 'inventory', action: 'read' }
    ];

    if (!hasAllPermissions(user, requiredPermissions)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    // Resource-specific access control
    const canAccess = await this.resourceGuard.canAccessResource(
      user,
      'medicines',
      id,
      'update',
      { status: 'active' } // Additional context
    );

    if (!canAccess) {
      throw new NotFoundError('Medicine not found'); // Don't reveal unauthorized access
    }

    // Debug permission check (development only)
    if (process.env.NODE_ENV === 'development') {
      const debug = debugPermissionCheck(user, 'medicines', 'update');
      console.log('Permission check debug:', debug);
    }

    // Proceed with update
    return this.medicineRepository.update(id, data);
  }
}
```

## Configuration

### Environment Variables

```env
# Authorization Configuration
AUTH_CACHE_ENABLED=true
AUTH_CACHE_TTL=300
AUTH_CACHE_MAX_SIZE=1000

AUTH_AUDIT_ENABLED=true
AUTH_AUDIT_LEVEL=detailed
AUTH_AUDIT_RETENTION_DAYS=365

AUTH_RATE_LIMIT_ENABLED=true
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=100

AUTH_STRICT_MODE=false
AUTH_ALLOW_SUPER_ADMIN_BYPASS=true
```

### Service Configuration

```typescript
const authConfig = {
  cache: {
    enabled: true,
    ttl: 300,
    maxSize: 1000
  },
  audit: {
    enabled: true,
    level: 'detailed',
    storage: 'database'
  },
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000,
    maxRequests: 100
  },
  security: {
    enableStrictMode: false,
    allowSuperAdminBypass: true,
    requireExplicitPermissions: false
  }
};

const authService = AuthorizationService.getInstance(authConfig);
```

## Best Practices

### 1. Security

- **Always validate input** before permission checks
- **Use resource guards** for sensitive operations
- **Log all authorization failures** for security monitoring
- **Implement rate limiting** on sensitive endpoints
- **Never expose unauthorized data** in error messages

### 2. Performance

- **Enable caching** for frequently checked permissions
- **Use bulk permission checks** when possible
- **Implement efficient database queries** for resource access
- **Monitor audit log performance**

### 3. Maintainability

- **Use descriptive permission names**
- **Group related permissions** by resource
- **Document permission requirements** in code
- **Test permission scenarios** thoroughly
- **Use TypeScript** for type safety

### 4. Development

```typescript
// Good: Descriptive and specific
requirePermission('medicines', 'bulk_import')

// Bad: Vague and unclear
requirePermission('data', 'process')

// Good: Clear resource ownership
requireResourceAccess({
  resource: 'submissions',
  checkOwnership: true,
  ownershipField: 'created_by'
})

// Good: Comprehensive error handling
try {
  const result = await authService.checkPermission({ user, resource, action });
  if (!result.allowed) {
    throw new ForbiddenError(result.reason);
  }
} catch (error) {
  await auditLogger.logSecurityEvent(user.id, 'unauthorized_access', { error });
  throw error;
}
```

## Testing

### Unit Tests

```typescript
import { hasPermission, PermissionManager } from '@/shared/authorization';

describe('Authorization System', () => {
  const adminUser = { id: '1', role: UserRole.ADMIN } as AuthenticatedUser;
  const pplUser = { id: '2', role: UserRole.PPL } as AuthenticatedUser;

  test('admin should have all permissions', () => {
    expect(hasPermission(adminUser, 'users', 'create')).toBe(true);
    expect(hasPermission(adminUser, 'medicines', 'delete')).toBe(true);
  });

  test('PPL should only create submissions', () => {
    expect(hasPermission(pplUser, 'submissions', 'create')).toBe(true);
    expect(hasPermission(pplUser, 'submissions', 'approve')).toBe(false);
  });

  test('permission conditions work correctly', async () => {
    const permissionManager = PermissionManager.getInstance();
    const result = permissionManager.checkPermission({
      user: pplUser,
      resource: 'submissions',
      action: 'update',
      context: { created_by: '2', status: 'draft' }
    });
    
    expect(result.allowed).toBe(true);
  });
});
```

### Integration Tests

```typescript
import request from 'supertest';
import app from '@/app';

describe('Authorization Integration', () => {
  test('protected route requires authentication', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .expect(401);
    
    expect(response.body.code).toBe('UNAUTHORIZED');
  });

  test('admin can access user management', async () => {
    const adminToken = await getAuthToken(adminUser);
    
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });

  test('PPL cannot access admin routes', async () => {
    const pplToken = await getAuthToken(pplUser);
    
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${pplToken}`)
      .expect(403);
    
    expect(response.body.code).toBe('INSUFFICIENT_ROLE');
  });
});
```

## Migration Guide

Jika ingin menggunakan sistem ini di aplikasi lain:

### 1. Copy Core Files
```bash
# Copy authorization system
cp -r src/shared/authorization /path/to/new-project/src/shared/

# Install dependencies
npm install reflect-metadata
```

### 2. Update Types
```typescript
// Update UserRole enum to match your application
enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}
```

### 3. Configure Permissions
```typescript
// Update permission matrix in permissions.ts
export const ROLE_PERMISSION_MATRIX: PermissionMatrix = {
  [UserRole.SUPER_ADMIN]: {
    // Define permissions for your application
  }
};
```

### 4. Initialize Service
```typescript
// In your app.ts or main.ts
import { AuthorizationService } from '@/shared/authorization';

const authService = AuthorizationService.getInstance({
  // Your configuration
});

// Use middleware in routes
app.use('/api', authenticate);
app.use('/api/admin', requireRole(UserRole.ADMIN));
```

## Support

Sistem authorization ini dirancang untuk:
- ✅ **Reusability** - Mudah digunakan di aplikasi lain
- ✅ **Scalability** - Mendukung aplikasi besar dengan banyak user
- ✅ **Security** - Implementasi best practices keamanan
- ✅ **Performance** - Caching dan optimisasi database
- ✅ **Maintainability** - Kode yang clean dan terdokumentasi
- ✅ **Flexibility** - Mudah dikustomisasi sesuai kebutuhan

Sistem ini dapat digunakan sebagai foundation untuk sistem authorization di aplikasi Node.js/TypeScript lainnya dengan sedikit modifikasi.
