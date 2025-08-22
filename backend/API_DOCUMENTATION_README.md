# 📚 API Documentation Guide
## ObatKu Pharmacy Management System

### 🎯 Overview
This directory contains comprehensive API documentation for the ObatKu backend system. All documentation is designed to support frontend integration and development.

---

## 📁 Documentation Files

### 1. **`swagger.yaml`** - OpenAPI/Swagger Specification
- **Purpose**: Complete API specification in OpenAPI 3.0.3 format
- **Usage**: 
  - Import into Swagger UI for interactive documentation
  - Use with code generation tools
  - Reference for frontend developers
- **Features**:
  - All endpoint definitions
  - Request/response schemas
  - Authentication details
  - Rate limiting information
  - Examples and descriptions

### 2. **`ObatKu_API_Collection.postman_collection.json`** - Postman Collection
- **Purpose**: Ready-to-use Postman collection for API testing
- **Usage**:
  - Import into Postman
  - Test all endpoints
  - Automatically handle authentication
  - Environment variables setup
- **Features**:
  - Organized by feature (Auth, Users, etc.)
  - Pre-configured requests
  - Auto-token management
  - Sample data included

### 3. **`API_RESPONSE_STANDARDS.md`** - Response Format Standards
- **Purpose**: Detailed specification of all API response formats
- **Usage**: 
  - Frontend integration reference
  - Error handling guidelines
  - Data format standards
- **Features**:
  - Success/error response structures
  - HTTP status codes
  - Pagination standards
  - Search and filter parameters

---

## 🚀 Getting Started

### Step 1: View API Documentation
1. **Swagger UI** (Recommended for developers):
   ```bash
   # Install swagger-ui-express if not already installed
   npm install swagger-ui-express
   
   # Add to your Express app
   import swaggerUi from 'swagger-ui-express';
   import YAML from 'yamljs';
   
   const swaggerDocument = YAML.load('./swagger.yaml');
   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
   ```

2. **Direct YAML viewing**:
   - Use VS Code with YAML extension
   - Online YAML viewers
   - GitHub's built-in YAML renderer

### Step 2: Test with Postman
1. **Import Collection**:
   - Open Postman
   - Click "Import" → "File" → Select `ObatKu_API_Collection.postman_collection.json`

2. **Setup Environment**:
   - Create new environment in Postman
   - Set variables:
     - `base_url`: `http://localhost:3001/api/v1`
     - `access_token`: (leave empty, will be set automatically)
     - `refresh_token`: (leave empty, will be set automatically)

3. **Start Testing**:
   - Begin with "System Health Check"
   - Use "User Login" to get tokens
   - Tokens will be automatically set
   - Test other endpoints

### Step 3: Understand Response Formats
1. **Read `API_RESPONSE_STANDARDS.md`**:
   - Understand success/error structures
   - Learn pagination format
   - Review error codes

2. **Frontend Integration**:
   - Use response standards for type definitions
   - Implement error handling
   - Handle pagination properly

---

## 🔐 Authentication Flow

### 1. Login Process
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "nip": "198501012010012001",
  "password": "password123"
}
```

### 2. Token Management
- **Access Token**: Short-lived (1 hour), used for API calls
- **Refresh Token**: Long-lived (7 days), used to get new access tokens
- **Auto-refresh**: Postman collection handles this automatically

### 3. Protected Endpoints
```http
GET /api/v1/users
Authorization: Bearer <access_token>
```

---

## 📊 API Endpoints Overview

### 🔐 Authentication (`/api/v1/auth`)
- `POST /login` - User authentication
- `POST /refresh` - Token refresh
- `POST /logout` - User logout
- `GET /profile` - Current user profile
- `GET /permissions` - User permissions
- `POST /change-password` - Change password

### 👥 User Management (`/api/v1/users`)
- `GET /` - List all users (paginated)
- `POST /` - Create new user
- `GET /{id}` - Get user by ID
- `PUT /{id}` - Update user
- `DELETE /{id}` - Delete user
- `GET /profile` - Current user profile
- `PUT /profile` - Update current profile
- `GET /stats` - User statistics
- `GET /check-nip/{nip}` - Check NIP existence
- `POST /{id}/reset-password` - Reset password
- `PUT /{id}/role` - Change user role
- `PUT /{id}/status` - Toggle user status
- `POST /bulk` - Bulk create users

### 🏥 Health Check
- `GET /health` - System health status

---

## 🧪 Testing Scenarios

### Basic Testing Flow
1. **Health Check** → Verify API is running
2. **Login** → Get authentication tokens
3. **Get Profile** → Verify authentication works
4. **Create User** → Test user creation
5. **Get Users** → Test user listing with pagination
6. **Update User** → Test user modification
7. **Delete User** → Test user deletion

### Error Testing
1. **Invalid Login** → Test authentication failure
2. **Invalid Token** → Test token validation
3. **Missing Fields** → Test validation errors
4. **Duplicate NIP** → Test conflict handling
5. **Rate Limiting** → Test security measures

### Advanced Testing
1. **Bulk Operations** → Test multiple user creation
2. **Search & Filter** → Test query parameters
3. **Pagination** → Test large dataset handling
4. **Role Changes** → Test authorization

---

## 🔧 Development Setup

### Backend Requirements
- Node.js 18+
- Express.js
- JWT authentication
- Rate limiting
- CORS enabled
- Validation middleware

### Frontend Integration
- HTTP client (Axios, Fetch, etc.)
- JWT token storage
- Error handling
- Loading states
- Form validation

---

## 📋 Response Format Examples

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "GET"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
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

## 🚨 Common Issues & Solutions

### CORS Issues
- **Problem**: Frontend can't access backend
- **Solution**: Verify CORS configuration in backend

### Authentication Issues
- **Problem**: 401 Unauthorized errors
- **Solution**: Check token validity and refresh if needed

### Validation Errors
- **Problem**: 400 Bad Request with validation details
- **Solution**: Review error details and fix input data

### Rate Limiting
- **Problem**: 429 Too Many Requests
- **Solution**: Implement exponential backoff and retry logic

---

## 📚 Additional Resources

### Documentation Tools
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Postman](https://www.postman.com/)
- [OpenAPI Generator](https://openapi-generator.tech/)

### Testing Tools
- [Jest](https://jestjs.io/) - Unit testing
- [Supertest](https://github.com/visionmedia/supertest) - API testing
- [Newman](https://learning.postman.com/docs/collections/using-newman-cli/) - Postman CLI

### Frontend Integration
- [Axios](https://axios-http.com/) - HTTP client
- [React Query](https://tanstack.com/query) - Data fetching
- [Zustand](https://github.com/pmndrs/zustand) - State management

---

## 🔄 Updates & Maintenance

### Version Control
- All documentation is version-controlled
- Changes should be documented in commit messages
- Major changes require version bump

### Contributing
1. Update relevant documentation files
2. Test with Postman collection
3. Verify Swagger specification
4. Update examples if needed

---

## 📞 Support

### Development Team
- **Backend**: Check backend source code and tests
- **Frontend**: Review integration examples
- **Documentation**: Update this README as needed

### Issues
- Report bugs in the main repository
- Suggest improvements via pull requests
- Ask questions in team discussions

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Complete authentication system documentation
- ✅ User management endpoints
- ✅ Response format standards
- ✅ Postman collection
- ✅ Swagger specification

### Future Versions
- 🔄 Inventory management endpoints
- 🔄 Transaction management endpoints
- 🔄 Reporting and analytics endpoints
- 🔄 File upload endpoints
- 🔄 Real-time notifications

---

*Last Updated: January 15, 2024*
*Version: 1.0.0*
*Status: ✅ Active - Ready for Frontend Integration*
