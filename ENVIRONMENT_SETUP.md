# 🚀 Environment Setup Guide
## ObatKu Frontend - Phase 1.3

### 📋 Overview
This guide covers the complete environment setup for ObatKu Frontend, including environment variables, proxy configuration, and development setup.

---

## 🎯 What We've Accomplished

### ✅ Environment Variables Setup
- [x] `.env.local` template for development
- [x] `.env.production` template for production
- [x] Centralized environment configuration utility
- [x] Environment validation system

### ✅ Proxy Configuration Setup
- [x] Next.js API routes proxy for development
- [x] CORS configuration
- [x] Development middleware for API proxying
- [x] Image handling for local development

### ✅ API Client Setup
- [x] Custom HTTP client with interceptors
- [x] Authentication token management
- [x] Error handling and timeout management
- [x] File upload support

---

## 🚀 Quick Start

### 1. Run Environment Setup Script
```bash
npm run setup:env
```

This interactive script will:
- Create `.env.local` with your development settings
- Create `.env.production` template
- Create `.env.example` for reference
- Configure API endpoints and feature flags

### 2. Validate Environment Configuration
```bash
npm run validate:env
```

This will check your environment configuration and report any issues.

### 3. Start Development Server
```bash
npm run dev
```

---

## 📁 File Structure

```
├── .env.local                 # Development environment (auto-generated)
├── .env.production           # Production environment (auto-generated)
├── .env.example              # Example configuration
├── next.config.mjs           # Next.js configuration with proxy
├── middleware.ts              # Development proxy middleware
├── lib/
│   └── config/
│       ├── env.ts            # Environment configuration utility
│       └── validation.ts     # Environment validation
├── lib/
│   └── api/
│       └── client.ts         # API client with interceptors
└── scripts/
    └── setup-env.js          # Environment setup script
```

---

## 🔧 Configuration Details

### Environment Variables

#### Required Variables
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001/api

# Authentication
NEXT_PUBLIC_JWT_STORAGE_KEY=obatku_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=obatku_refresh_token
```

#### Optional Variables
```bash
# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_DEBUG_MODE=true

# External Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Development vs Production

| Setting | Development | Production |
|---------|-------------|------------|
| Debug Mode | ✅ Enabled | ❌ Disabled |
| Log Level | `debug` | `error` |
| HTTPS | ❌ Disabled | ✅ Enabled |
| Compression | ❌ Disabled | ✅ Enabled |
| Analytics | ❌ Disabled | ✅ Enabled |

---

## 🌐 Proxy Configuration

### API Routes Proxy
- **Development**: `/api/*` → `http://localhost:3001/api/*`
- **Production**: Direct backend calls

### Uploads Proxy
- **Development**: `/uploads/*` → `http://localhost:3001/uploads/*`
- **Production**: Direct backend calls

### CORS Configuration
- **Development**: Allows `http://localhost:3001`
- **Production**: Allows production backend domain

---

## 🔐 Authentication Setup

### JWT Token Management
- Automatic token inclusion in API requests
- Token storage in localStorage
- Auto-logout on 401 responses
- Redirect to login on authentication failure

### Token Storage Keys
```typescript
// Default storage keys
JWT_STORAGE_KEY: 'obatku_token'
REFRESH_TOKEN_KEY: 'obatku_refresh_token'
```

---

## 📤 File Upload Configuration

### Supported File Types
- Images: `jpg`, `jpeg`, `png`
- Documents: `pdf`, `doc`, `docx`

### File Size Limits
- **Development**: 5MB
- **Production**: 10MB

### Upload Endpoints
- **Development**: `http://localhost:3001/api/upload`
- **Production**: `https://api.obatku.com/api/upload`

---

## 🧪 Testing Your Setup

### 1. Check Environment Variables
```bash
npm run validate:env
```

### 2. Test API Connection
```typescript
import { api } from '@/lib/api/client';

// Test connection
try {
  const response = await api.get('/health');
  console.log('✅ Backend connection successful:', response);
} catch (error) {
  console.error('❌ Backend connection failed:', error);
}
```

### 3. Test File Upload
```typescript
import { api } from '@/lib/api/client';

// Test file upload
const file = new File(['test'], 'test.txt', { type: 'text/plain' });
try {
  const response = await api.upload('/upload', file);
  console.log('✅ File upload successful:', response);
} catch (error) {
  console.error('❌ File upload failed:', error);
}
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Frontend can't access backend
**Solution**: 
- Check backend CORS configuration
- Verify `CORS_ORIGIN` in backend `.env`
- Ensure proxy is working in development

#### 2. Environment Variables Not Loading
**Problem**: `process.env.NEXT_PUBLIC_*` is undefined
**Solution**:
- Restart development server after creating `.env.local`
- Check variable names (must start with `NEXT_PUBLIC_`)
- Verify file is in project root

#### 3. API Proxy Not Working
**Problem**: API calls still go to frontend
**Solution**:
- Check `next.config.mjs` rewrites configuration
- Verify backend is running on correct port
- Check middleware configuration

#### 4. Authentication Issues
**Problem**: Tokens not being sent
**Solution**:
- Check localStorage for token
- Verify token storage key configuration
- Check Authorization header in network tab

---

## 🔄 Next Steps

### Phase 2: Core Integration Setup
1. **API Service Layer**: Create service files for each module
2. **Authentication Integration**: Connect login forms to backend
3. **State Management**: Setup global state management

### Phase 3: Form Integration
1. **User Management Forms**: Connect user CRUD operations
2. **Inventory Forms**: Connect medicine management
3. **Transaction Forms**: Connect sales/purchase operations

---

## 📚 Additional Resources

### Documentation
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Next.js Middleware](https://nextjs.org/docs/middleware)

### Configuration Files
- `next.config.mjs` - Next.js configuration
- `middleware.ts` - Development proxy middleware
- `lib/config/env.ts` - Environment configuration
- `lib/api/client.ts` - API client setup

---

## 🎉 Success Checklist

- [x] Environment variables configured
- [x] Proxy configuration working
- [x] CORS issues resolved
- [x] API client ready
- [x] File upload configured
- [x] Authentication setup ready
- [x] Development environment working
- [x] Production environment template ready

**Status**: 🚀 Phase 1.3 Complete - Ready for Phase 2!

---

*Last Updated: January 15, 2024*
*Next Phase: Core Integration Setup*
