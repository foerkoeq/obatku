# 🔐 Phase 4: Authentication & Security Implementation

## Overview

Phase 4 menambahkan sistem autentikasi dan keamanan yang komprehensif ke aplikasi Obatku. Sistem ini menyediakan:

- ✅ **JWT-based Authentication** - Token access dan refresh
- ✅ **Role-based Access Control (RBAC)** - Otorisasi berdasarkan role
- ✅ **Permission-based Authorization** - Kontrol akses granular
- ✅ **Password Management** - Reset password dengan default tanggal lahir
- ✅ **Session Management** - Tracking sesi user aktif
- ✅ **Security Features** - Rate limiting, audit logging, account lockout
- ✅ **Comprehensive Validation** - Validasi input dengan Zod
- ✅ **Modular Architecture** - Mudah maintenance dan customization

## Architecture

```
src/features/auth/
├── auth.types.ts          # Type definitions
├── auth.config.ts         # Configuration & permissions
├── auth.validation.ts     # Zod validation schemas
├── auth.repository.ts     # Data access layer
├── jwt.service.ts         # JWT token management
├── auth.service.ts        # Business logic
├── auth.controller.ts     # HTTP request handling
├── auth.routes.ts         # Route definitions
├── auth.test.ts          # Comprehensive tests
└── index.ts              # Module exports

src/shared/middleware/
├── auth.middleware.ts         # Authentication middleware
├── authorization.middleware.ts # Authorization middleware
└── rate-limiter.middleware.ts  # Rate limiting protection
```

## Authentication Flow

### 1. Login Process

```typescript
POST /api/v1/auth/login
{
  "nip": "12345",
  "password": "15081990", // Default: DDMMYYYY format
  "rememberMe": false
}

// Response
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "nip": "12345",
      "role": "PPL",
      "permissions": ["medicines:read", "inventory:read"]
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ...",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

### 2. Protected Route Access

```typescript
// Add Authorization header
Authorization: Bearer <access_token>

// Middleware akan validate token dan set req.user
req.user = {
  id: "user-123",
  name: "John Doe",
  role: "PPL",
  permissions: ["medicines:read", ...]
}
```

### 3. Token Refresh

```typescript
POST /api/v1/auth/refresh
{
  "refreshToken": "eyJ..."
}

// Response
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "new_eyJ...",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

## Role-Based Permissions

### ADMIN Role
- **Full Access** ke semua resources
- Dapat create, read, update, delete users
- Dapat reset password users
- Akses ke semua fitur sistem

### DINAS Role  
- **Management Access** 
- Dapat manage medicines, inventory, QR codes
- Dapat approve/reject submissions
- Dapat reset password users
- Akses ke reports dan analytics

### PPL (Penyuluh Pertanian Lapangan) Role
- **Field Staff Access**
- Dapat create submissions
- Read-only access ke medicines/inventory  
- Akses terbatas ke reports

### POPT Role
- **Observer Access**
- Read-only access ke sebagian besar resources
- Dapat view submissions yang terkait
- Akses sangat terbatas

## API Endpoints

### Authentication Endpoints

#### Public Routes
```typescript
POST   /api/v1/auth/login           # User login
POST   /api/v1/auth/refresh         # Token refresh  
GET    /api/v1/auth/health          # System health
```

#### Protected Routes (Requires Authentication)
```typescript
POST   /api/v1/auth/logout          # User logout
GET    /api/v1/auth/profile         # Get user profile
GET    /api/v1/auth/permissions     # Get user permissions
GET    /api/v1/auth/session         # Get session info
POST   /api/v1/auth/change-password # Change password
```

#### Admin Routes (Admin/Dinas Only)
```typescript
POST   /api/v1/auth/reset-password  # Reset user password
```

## Security Features

### 1. Rate Limiting

```typescript
// Login attempts: 5 per 15 minutes per IP
// Token refresh: 10 per 5 minutes per IP  
// Password change: 3 per 15 minutes per user
// Password reset: 5 per 30 minutes per user
```

### 2. Account Lockout

```typescript
// Account locked after 5 failed login attempts
// Lockout duration: 15 minutes
// Automatic cleanup of expired sessions
```

### 3. Password Policy

```typescript
// Default password: Birth date in DDMMYYYY format
// New password requirements:
// - Minimum 8 characters
// - At least 2 character types (uppercase, lowercase, numbers, special)
// - Cannot be common patterns
```

### 4. Session Management

```typescript
// JWT access token: 15 minutes expiry
// JWT refresh token: 7 days expiry  
// Session timeout: 8 hours of inactivity
// Support for logout from all devices
```

## Usage Examples

### 1. Protect Routes with Authentication

```typescript
import { createAuthMiddleware } from '@/shared/middleware/auth.middleware';
import { authSystem } from '@/core/server/routes';

const authMiddleware = createAuthMiddleware(authSystem.authService);

// Protect all routes
router.use(authMiddleware.authenticate);

// Optional authentication
router.use(authMiddleware.optionalAuthenticate);
```

### 2. Authorize by Role

```typescript
import { authorize } from '@/shared/middleware/authorization.middleware';

// Admin only
router.use(authorize(['admin']));

// Admin or Dinas
router.use(authorize(['admin', 'dinas']));

// Field staff
router.use(authorize(['ppl', 'popt']));
```

### 3. Authorize by Permission

```typescript
import { requirePermission } from '@/shared/middleware/authorization.middleware';

// Specific permission
router.use(requirePermission('medicines', 'create'));

// Multiple permissions (all required)
router.use(requireAllPermissions([
  { resource: 'medicines', action: 'read' },
  { resource: 'inventory', action: 'update' }
]));
```

### 4. Check Permissions in Code

```typescript
// In controller
if (!authService.hasPermission(req.user, 'medicines', 'create')) {
  return res.status(403).json({
    success: false,
    message: 'Insufficient permissions'
  });
}
```

## Default Passwords

Sistem menggunakan tanggal lahir sebagai password default:

```typescript
// Format: DDMMYYYY
// Contoh:
// Lahir: 15 Agustus 1990 → Password: 15081990  
// Lahir: 3 Desember 1985 → Password: 03121985
// Lahir: 1 Januari 2000 → Password: 01012000
```

### Reset Password Flow

1. **Admin/Dinas** dapat reset password user lain
2. Password direset ke default (tanggal lahir)
3. User harus ubah password saat pertama login
4. Sistem akan detect jika masih menggunakan default password

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-64-chars
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-64-chars  
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=obatku-api
JWT_AUDIENCE=obatku-client

# Password Configuration
PASSWORD_SALT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
PASSWORD_MAX_LENGTH=128
PASSWORD_REQUIRE_SPECIAL=false

# Security Configuration  
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=15
SESSION_TIMEOUT=480
ENABLE_AUDIT_LOG=true
```

## Testing

### Run Auth Tests

```bash
# Run all auth tests
npm test auth

# Run specific test file
npm test auth.test.ts

# Run with coverage
npm run test:coverage
```

### Test Coverage

- ✅ JWT Service tests
- ✅ Auth Repository tests  
- ✅ Auth Service tests
- ✅ Controller tests
- ✅ Middleware tests
- ✅ Integration tests
- ✅ Validation tests

## Error Handling

### Error Response Format

```typescript
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details"?: any
}
```

### Common Error Codes

```typescript
INVALID_CREDENTIALS     // Wrong NIP/password
USER_NOT_FOUND         // User doesn't exist
USER_INACTIVE          // Account deactivated
TOKEN_EXPIRED          // Token has expired
TOKEN_INVALID          // Malformed token
INSUFFICIENT_PERMISSIONS // No access rights
ACCOUNT_LOCKED         // Too many failed attempts
SESSION_EXPIRED        // Session timeout
TOO_MANY_REQUESTS      // Rate limit exceeded
```

## Security Best Practices

### 1. Token Management
- Access tokens short-lived (15 minutes)
- Refresh tokens longer-lived (7 days)
- Store refresh tokens securely
- Implement token rotation

### 2. Password Security
- Bcrypt with 12 rounds
- Default passwords based on birth date
- Force password change for default passwords
- Password strength validation

### 3. Rate Limiting
- Different limits for different endpoints
- IP-based and user-based limiting
- Gradual backoff for repeated failures

### 4. Audit Logging
- Log all authentication attempts
- Track password changes
- Monitor suspicious activities
- Store security events

## Integration with Existing Features

### Update User Routes

```typescript
// Existing user routes now require authentication
import { createAuthMiddleware } from '@/shared/middleware/auth.middleware';
import { authorize } from '@/shared/middleware/authorization.middleware';

// Apply authentication to all user routes
router.use(authMiddleware.authenticate);

// Apply role-based authorization
router.use('/admin', authorize(['admin']));
```

### Future Feature Integration

Saat menambahkan fitur baru:

1. **Import auth middleware**
2. **Apply authentication** ke protected routes
3. **Add authorization** berdasarkan role/permission
4. **Check permissions** di business logic
5. **Add rate limiting** untuk sensitive operations

## Maintenance & Monitoring

### Health Check

```typescript
GET /api/v1/auth/health

// Response
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": true,
    "activeTokens": 150,
    "activeSessions": 45
  }
}
```

### Cleanup Tasks

```typescript
// Automatic cleanup (implement as cron job)
authService.cleanupExpiredData();

// Manual cleanup via API (admin only)
POST /api/v1/auth/cleanup
```

## Performance Considerations

### 1. In-Memory Session Storage
- Current: Map-based storage
- Production: Consider Redis for scalability
- Auto-cleanup of expired sessions

### 2. Token Verification
- JWT verification is CPU-intensive
- Consider caching user data
- Implement token blacklisting if needed

### 3. Database Queries
- Efficient user lookups by NIP
- Index on frequently queried fields
- Connection pooling for performance

## Migration & Deployment

### 1. Database Migration
- No additional tables required
- Uses existing User table
- Add audit tables if needed

### 2. Environment Setup
- Update .env with new JWT secrets
- Configure security settings
- Set up rate limiting parameters

### 3. Testing in Production
- Test authentication flow
- Verify rate limiting works
- Check token refresh mechanism
- Monitor error rates

## Conclusion

Phase 4 Authentication & Security implementation provides:

✅ **Complete authentication system** dengan JWT tokens  
✅ **Granular authorization** dengan RBAC dan permissions  
✅ **Security features** untuk production readiness  
✅ **Modular architecture** untuk easy maintenance  
✅ **Comprehensive testing** untuk reliability  
✅ **Flexible configuration** untuk different environments  

Sistem ini ready untuk production dan dapat easily dikustomisasi sesuai kebutuhan spesifik aplikasi Obatku.
