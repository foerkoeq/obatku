# 📋 API Response Format Standards
## ObatKu Pharmacy Management System

### 🎯 Overview
This document defines the standardized response format for all ObatKu API endpoints. Consistent response structures ensure predictable behavior across the frontend and improve developer experience.

---

## 📊 Standard Response Structure

### ✅ Success Response Format
All successful API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data goes here
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "GET"
}
```

### ❌ Error Response Format
All error responses follow this structure:

```json
{
  "success": false,
  "message": "An error occurred",
  "code": "ERROR_CODE",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "POST"
}
```

---

## 🔐 Authentication Response Formats

### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "nip": "198501012010012001",
      "email": "john.doe@example.com",
      "phone": "+6281234567890",
      "role": "admin",
      "status": "active",
      "avatarUrl": "https://example.com/avatar.jpg",
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "permissions": ["users:read", "users:write", "inventory:read"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/login",
  "method": "POST"
}
```

### Refresh Token Response
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/refresh",
  "method": "POST"
}
```

### User Profile Response
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "nip": "198501012010012001",
    "email": "john.doe@example.com",
    "phone": "+6281234567890",
    "role": "admin",
    "status": "active",
    "avatarUrl": "https://example.com/avatar.jpg",
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "permissions": ["users:read", "users:write", "inventory:read"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/profile",
  "method": "GET"
}
```

---

## 👥 User Management Response Formats

### User List Response (Paginated)
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "John Doe",
        "nip": "198501012010012001",
        "role": "admin",
        "status": "active",
        "lastLogin": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "GET"
}
```

### Single User Response
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "nip": "198501012010012001",
    "phone": "+6281234567890",
    "role": "admin",
    "status": "active",
    "birthDate": "1985-01-01",
    "avatarUrl": "https://example.com/avatar.jpg",
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "createdBy": "123e4567-e89b-12d3-a456-426614174000"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000",
  "method": "GET"
}
```

### User Statistics Response
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalUsers": 100,
    "activeUsers": 85,
    "inactiveUsers": 15,
    "usersByRole": {
      "admin": 5,
      "ppl": 50,
      "dinas": 30,
      "popt": 15
    },
    "recentRegistrations": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "John Doe",
        "nip": "198501012010012001",
        "role": "admin",
        "status": "active",
        "lastLogin": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users/stats",
  "method": "GET"
}
```

### NIP Check Response
```json
{
  "success": true,
  "message": "NIP check completed",
  "data": {
    "exists": false,
    "nip": "199001012010012002"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users/check-nip/199001012010012002",
  "method": "GET"
}
```

### Password Reset Response
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "temporaryPassword": "temp123456",
    "mustChangePassword": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000/reset-password",
  "method": "POST"
}
```

### Bulk Create Response
```json
{
  "success": true,
  "message": "Users created successfully",
  "data": {
    "created": 5,
    "failed": 0,
    "results": [
      {
        "success": true,
        "user": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Jane Doe",
          "nip": "199001012010012002"
        }
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users/bulk",
  "method": "POST"
}
```

---

## 🚨 Error Response Formats

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "nip",
      "message": "NIP must be exactly 18 characters"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "POST"
}
```

### Authentication Error
```json
{
  "success": false,
  "message": "Invalid credentials",
  "code": "AUTHENTICATION_FAILED",
  "details": [],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/login",
  "method": "POST"
}
```

### Authorization Error
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "code": "FORBIDDEN",
  "details": [],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "GET"
}
```

### Resource Not Found
```json
{
  "success": false,
  "message": "User not found",
  "code": "NOT_FOUND",
  "details": [],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users/999e4567-e89b-12d3-a456-426614174000",
  "method": "GET"
}
```

### Rate Limit Error
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": [],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/login",
  "method": "POST"
}
```

### Conflict Error
```json
{
  "success": false,
  "message": "User with NIP already exists",
  "code": "CONFLICT",
  "details": [
    {
      "field": "nip",
      "message": "NIP 198501012010012001 is already registered"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "POST"
}
```

---

## 📋 HTTP Status Codes

### Success Status Codes
- **200 OK**: Request successful (GET, PUT, DELETE)
- **201 Created**: Resource created successfully (POST)
- **204 No Content**: Request successful, no content to return

### Client Error Status Codes
- **400 Bad Request**: Invalid request data or validation failed
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Authentication successful but insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate NIP)
- **422 Unprocessable Entity**: Semantic errors
- **429 Too Many Requests**: Rate limit exceeded

### Server Error Status Codes
- **500 Internal Server Error**: Unexpected server error
- **502 Bad Gateway**: Gateway error
- **503 Service Unavailable**: Service temporarily unavailable

---

## 🔧 Response Headers

### Standard Headers
```
Content-Type: application/json
X-Request-ID: req-123e4567-e89b-12d3-a456-426614174000
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642239000
```

### CORS Headers
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
```

---

## 📊 Pagination Standards

### Query Parameters
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 20, min: 1, max: 100)
- `sortBy`: Sort field (default: created_at)
- `sortOrder`: Sort direction (asc/desc, default: desc)

### Pagination Response Structure
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔍 Search and Filter Standards

### Search Parameters
- `search`: Search by name or NIP (case-insensitive)
- `role`: Filter by user role (admin, ppl, dinas, popt)
- `status`: Filter by user status (active, inactive)
- `dateFrom`: Filter by creation date (ISO 8601)
- `dateTo`: Filter by creation date (ISO 8601)

### Example Search Query
```
GET /api/v1/users?search=admin&role=admin&status=active&page=1&limit=10
```

---

## 📝 Data Format Standards

### Date Formats
- **ISO 8601**: `2024-01-15T10:30:00.000Z` (UTC)
- **Date Only**: `2024-01-15` (YYYY-MM-DD)
- **Time Only**: `10:30:00` (HH:mm:ss)

### UUID Format
- **Standard UUID v4**: `123e4567-e89b-12d3-a456-426614174000`

### Phone Number Format
- **International Format**: `+6281234567890`
- **Local Format**: `081234567890`

### NIP Format
- **Fixed Length**: 18 characters
- **Example**: `198501012010012001`

---

## 🚀 Implementation Guidelines

### Frontend Integration
1. **Always check `success` field** before processing data
2. **Handle errors gracefully** using `code` and `details`
3. **Use pagination data** for navigation controls
4. **Implement retry logic** for rate limit errors
5. **Store tokens securely** and handle refresh automatically

### Backend Implementation
1. **Use consistent response structure** across all endpoints
2. **Include all required fields** in every response
3. **Validate input data** and return detailed error messages
4. **Implement proper error handling** with appropriate HTTP status codes
5. **Add request logging** for debugging and monitoring

---

## 📚 Examples

### Complete API Flow Example

#### 1. Login Request
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "nip": "198501012010012001",
  "password": "password123"
}
```

#### 2. Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

#### 3. Get Users Request (with token)
```http
GET /api/v1/users?page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 4. Get Users Response
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [ ... ],
    "pagination": { ... }
  }
}
```

---

## 🔄 Versioning

### API Versioning
- **Current Version**: v1
- **Base Path**: `/api/v1`
- **Version Header**: `Accept: application/vnd.obatku.v1+json`

### Backward Compatibility
- New fields may be added to responses
- Existing fields will not be removed without deprecation notice
- Breaking changes require new API version

---

*Last Updated: January 15, 2024*
*Version: 1.0.0*
*Status: ✅ Active*
