# API Foundation Setup Guide

## Overview

This guide covers the comprehensive API Foundation implementation that provides:

- ✅ Standardized API response format
- ✅ Enhanced pagination utilities
- ✅ Advanced sorting & filtering helpers
- ✅ API documentation structure with OpenAPI generation
- ✅ Comprehensive security measures

## Quick Start

### 1. Basic Controller Implementation

```typescript
import { BaseApiController } from '@/shared/controllers/base-api.controller';
import { ApiRequest } from '@/shared/types/api.types';
import { Response } from 'express';

export class MyController extends BaseApiController {
  constructor() {
    super({
      pagination: {
        defaultLimit: 20,
        maxLimit: 100
      },
      sorting: {
        allowedFields: ['id', 'name', 'createdAt'],
        defaultField: 'createdAt',
        defaultDirection: 'desc'
      },
      filtering: {
        allowedFields: ['id', 'name', 'status'],
        searchFields: ['name'],
        fieldTypes: {
          'name': 'string',
          'status': 'string',
          'createdAt': 'date'
        }
      }
    });
  }

  public getAll = this.asyncHandler(async (req: ApiRequest, res: Response) => {
    const parsedQuery = this.parseQuery(req);
    const queryOptions = this.buildQueryOptions(parsedQuery);

    const { data, total } = await this.fetchData(queryOptions);

    return this.successPaginated(
      res,
      data,
      total,
      parsedQuery.pagination.page,
      parsedQuery.pagination.limit,
      'Data retrieved successfully'
    );
  });
}
```

### 2. API Documentation with Decorators

```typescript
import { 
  ApiController, 
  ApiEndpoint, 
  ApiSchema, 
  ApiProperty 
} from '@/shared/utils/api-documentation.util';

@ApiSchema('Item', 'Item entity schema')
class ItemDto {
  @ApiProperty({
    type: 'string',
    description: 'Item ID',
    example: 'item_123'
  })
  id!: string;

  @ApiProperty({
    type: 'string',
    description: 'Item name',
    example: 'Sample Item'
  })
  name!: string;
}

@ApiController('Items', 'Item management endpoints')
export class ItemsController extends BaseApiController {
  @ApiEndpoint({
    summary: 'Get all items',
    method: 'GET',
    path: '/items',
    responses: {
      '200': {
        description: 'Items retrieved successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiPaginatedResponse' }
          }
        }
      }
    }
  })
  public getAll = this.asyncHandler(async (req: ApiRequest, res: Response) => {
    // Implementation
  });
}
```

### 3. Security Setup

```typescript
import express from 'express';
import { ApiSecurityUtil } from '@/shared/utils/api-security.util';

const app = express();

// Apply comprehensive security middleware
const securityMiddleware = ApiSecurityUtil.createSecurityStack({
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per window
  },
  cors: {
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    credentials: true
  },
  enableRequestId: true,
  enableLogging: true,
  enableSanitization: true,
  contentTypes: ['application/json'],
  maxRequestSize: '10mb'
});

app.use(securityMiddleware);
```

### 4. OpenAPI Documentation Generation

```typescript
import { OpenAPIGenerator } from '@/shared/utils/openapi-generator.util';
import { Router } from 'express';

const apiRouter = Router();
// Add your routes...

const openApiGenerator = new OpenAPIGenerator({
  title: 'Obatku API',
  version: '1.0.0',
  description: 'Comprehensive API for Obatku application',
  baseUrl: 'http://localhost:8000/api'
});

openApiGenerator.addRouter(apiRouter, '/api');

// Generate and serve OpenAPI spec
app.get('/api/docs/openapi.json', (req, res) => {
  res.json(openApiGenerator.generate());
});

// Export to file
await openApiGenerator.exportToFile('./docs/openapi.json');
await openApiGenerator.exportToYaml('./docs/openapi.yaml');
```

## Features in Detail

### 1. Standardized API Responses

All API responses follow a consistent format:

#### Success Response
```json
{
  "success": true,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "requestId": "req_1234567890_abc123",
  "version": "1.0.0",
  "data": { /* your data */ },
  "message": "Operation successful",
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "processingTime": 45,
    "source": "obatku-api"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "requestId": "req_1234567890_abc123",
  "version": "1.0.0",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { /* error details */ }
  },
  "path": "/api/users",
  "method": "POST"
}
```

#### Paginated Response
```json
{
  "success": true,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "requestId": "req_1234567890_abc123",
  "version": "1.0.0",
  "data": [ /* array of items */ ],
  "message": "Data retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false,
    "links": {
      "first": "/api/users?page=1&limit=20",
      "current": "/api/users?page=1&limit=20",
      "next": "/api/users?page=2&limit=20",
      "last": "/api/users?page=5&limit=20"
    }
  }
}
```

### 2. Enhanced Pagination

#### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

#### Usage
```typescript
const { page, limit } = ApiPaginationUtil.parseQuery(req.query);
const paginationMeta = ApiPaginationUtil.createMeta(page, limit, total);
```

### 3. Advanced Sorting

#### Query Parameters
- `sort`: Combined format (`field:direction,field2:direction`)
- `sortBy`: Field name
- `sortOrder`: `asc` or `desc`

#### Examples
```
GET /api/users?sort=name:asc,createdAt:desc
GET /api/users?sortBy=name&sortOrder=desc
```

#### Usage
```typescript
const sortConfig = {
  allowedFields: ['id', 'name', 'email', 'createdAt'],
  defaultField: 'createdAt',
  defaultDirection: 'desc',
  fieldMapping: { 'name': 'full_name' } // Map API fields to DB fields
};

const sortResult = ApiSortingUtil.parseQuery(req.query, sortConfig);
```

### 4. Comprehensive Filtering

#### Query Parameters
- `search`: Global search across specified fields
- `filter`: Structured filters (`field:operator:value`)
- `where`: Complex filter object
- `dateFrom`, `dateTo`: Date range filtering

#### Filter Operators
- `eq`, `ne`: Equals, Not equals
- `gt`, `gte`, `lt`, `lte`: Comparison operators
- `contains`, `startsWith`, `endsWith`: String operations
- `in`, `notIn`: Array operations
- `isNull`, `isNotNull`: Null checks

#### Examples
```
GET /api/users?search=john
GET /api/users?filter=role:eq:admin,status:ne:inactive
GET /api/users?dateFrom=2024-01-01&dateTo=2024-12-31
```

### 5. Security Features

#### Rate Limiting
```typescript
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests'
};
```

#### CORS Configuration
```typescript
const corsConfig = {
  origin: ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};
```

#### Security Headers (Helmet)
- Content Security Policy
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

#### Input Sanitization
- XSS protection
- Script tag removal
- Event handler removal

### 6. API Documentation

#### Automatic OpenAPI Generation
- Route discovery from Express routers
- Schema generation from decorators
- Interactive documentation
- Export to JSON/YAML

#### Documentation Decorators
```typescript
@ApiController('Users', 'User management')
@ApiEndpoint({
  summary: 'Create user',
  method: 'POST',
  requestBody: { /* schema */ },
  responses: { /* responses */ }
})
@ApiParam({ name: 'id', in: 'path', required: true })
@ApiSchema('User', 'User entity')
@ApiProperty({ type: 'string', description: 'User name' })
```

## Best Practices

### 1. Controller Structure
- Extend `BaseApiController` for common functionality
- Use `asyncHandler` for error handling
- Implement proper authorization checks
- Transform data to exclude sensitive fields

### 2. Error Handling
```typescript
// Validation
if (!this.validateRequired(req, res, ['name', 'email'])) {
  return; // Response already sent
}

// Authorization
if (!this.authorize(req, res, ['users:create'])) {
  return; // Response already sent
}

// Business logic errors
try {
  const result = await someOperation();
  return this.success(res, result);
} catch (error) {
  return this.internalError(res, 'Operation failed', error);
}
```

### 3. Database Integration
```typescript
const parsedQuery = this.parseQuery(req);
const queryOptions = this.buildQueryOptions(parsedQuery);

// For Prisma
const users = await prisma.user.findMany({
  ...queryOptions,
  where: {
    ...queryOptions.where,
    // Additional conditions
  }
});
```

### 4. Response Transformation
```typescript
// Exclude sensitive fields
const transformedData = this.transformData(
  userData,
  [], // include fields (empty = include all)
  ['password', 'passwordHash'] // exclude fields
);

return this.success(res, transformedData);
```

## Integration Examples

See `src/shared/examples/users.controller.ts` for a complete implementation example demonstrating all features.

## Migration from Existing Code

1. **Update imports**: Replace existing utility imports with new API Foundation utilities
2. **Extend BaseApiController**: Convert existing controllers to extend the base class
3. **Use new response methods**: Replace manual response formatting with utility methods
4. **Add documentation**: Apply API documentation decorators
5. **Configure security**: Apply security middleware stack

This API Foundation provides a robust, scalable, and maintainable structure for your API endpoints while ensuring consistency, security, and comprehensive documentation.
