# Authentication Module Validation Architecture

## Overview

This document explains the proper validation architecture for the authentication module and why certain functions are deprecated.

## Validation Layers

### 1. Input Validation (Zod Schemas) ✅
**Location**: `auth.validation.ts`  
**Purpose**: Validate request body, query parameters, and headers  
**Examples**: Login forms, password changes, user creation

```typescript
// ✅ CORRECT: Input validation with Zod
export const loginSchema = z.object({
  body: z.object({
    nip: z.string().min(1).max(50).regex(/^[0-9]+$/),
    password: z.string().min(1).max(100),
  }),
});
```

### 2. Business Logic Validation (Service Layer) ✅
**Location**: `auth.service.ts`  
**Purpose**: Validate business rules, permissions, and workflows  
**Examples**: User authentication, role checks, session management

```typescript
// ✅ CORRECT: Business logic validation
async login(credentials: LoginRequest, ipAddress: string, userAgent: string) {
  // Validate user exists
  const user = await this.authRepository.findUserByNip(credentials.nip);
  if (!user) throw new AuthError('Invalid credentials', 401);
  
  // Validate password
  const isValidPassword = await this.authRepository.verifyPassword(user.id, credentials.password);
  if (!isValidPassword) throw new AuthError('Invalid credentials', 401);
  
  // Validate account status
  if (await this.authRepository.isAccountLocked(credentials.nip)) {
    throw new AuthError('Account is locked', 423);
  }
}
```

### 3. Data Validation (Repository Layer) ✅
**Location**: `auth.repository.ts`  
**Purpose**: Validate data integrity, uniqueness, and database constraints  
**Examples**: NIP uniqueness, email uniqueness, data relationships

```typescript
// ✅ CORRECT: Data validation in repository
async validateNipUniqueness(nip: string, excludeUserId?: string): Promise<NipValidation> {
  const existingUser = await this.prisma.user.findUnique({
    where: { nip },
    select: { id: true },
  });

  const isUnique = !existingUser || (excludeUserId ? existingUser.id === excludeUserId : false);

  return {
    isValid: isUnique,
    errors: isUnique ? [] : ['NIP sudah digunakan oleh user lain'],
    isUnique,
  };
}
```

## Deprecated Functions

### ❌ `validateNipUniqueness` in `auth.validation.ts` - **REMOVED**

**Status**: Function has been completely removed from validation layer

**Why Removed:**
- **Separation of Concerns**: Validation layer should not contain database logic
- **Architecture Violation**: Mixing input validation with data validation
- **Dependency Issues**: Validation layer should not depend on database
- **Testing Complexity**: Harder to test validation without database
- **Clean Architecture**: Validation layer now only contains input validation schemas

**Use Instead:**
```typescript
// ✅ CORRECT: Use repository for data validation
const authRepository = new AuthRepository(prisma);
const validation = await authRepository.validateNipUniqueness(nip, excludeUserId);

if (!validation.isValid) {
  throw new ValidationError(validation.errors.join(', '));
}
```

## Best Practices

### 1. Input Validation (Zod)
```typescript
// ✅ Validate request structure and format
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(255),
    email: z.string().email().optional(),
    nip: z.string().regex(/^[0-9]+$/),
    role: z.nativeEnum(UserRole),
  }),
});
```

### 2. Business Logic Validation (Service)
```typescript
// ✅ Validate business rules and workflows
async createUser(userData: CreateUserData) {
  // Check permissions
  if (!this.hasPermission(currentUser, 'users', 'create')) {
    throw new AuthError('Insufficient permissions', 403);
  }
  
  // Validate business rules
  if (userData.role === 'admin' && !this.isSuperAdmin(currentUser)) {
    throw new AuthError('Only super admins can create admin users', 403);
  }
  
  // Delegate to repository for data validation
  const user = await this.authRepository.createUser(userData);
  return user;
}
```

### 3. Data Validation (Repository)
```typescript
// ✅ Validate data integrity and constraints
async createUser(userData: CreateUserData): Promise<User> {
  // Check NIP uniqueness
  const nipValidation = await this.validateNipUniqueness(userData.nip);
  if (!nipValidation.isValid) {
    throw new ValidationError(nipValidation.errors.join(', '));
  }
  
  // Check email uniqueness (if provided)
  if (userData.email) {
    const isEmailUnique = await this.validateEmailUniqueness(userData.email);
    if (!isEmailUnique) {
      throw new ValidationError('Email sudah digunakan');
    }
  }
  
  // Create user
  return this.prisma.user.create({
    data: userData,
  });
}
```

## Migration Guide

### From Deprecated Function to Repository

**Before (Deprecated):**
```typescript
import { validateNipUniqueness } from './auth.validation';

// ❌ WRONG: Using deprecated function
const validation = await validateNipUniqueness(nip, excludeUserId);
```

**After (Correct):**
```typescript
import { AuthRepository } from './auth.repository';

// ✅ CORRECT: Using repository
const authRepository = new AuthRepository(prisma);
const validation = await authRepository.validateNipUniqueness(nip, excludeUserId);
```

### In Service Classes
```typescript
export class AuthService {
  constructor(private authRepository: AuthRepository) {}
  
  async createUser(userData: CreateUserData) {
    // ✅ Use injected repository
    const nipValidation = await this.authRepository.validateNipUniqueness(userData.nip);
    if (!nipValidation.isValid) {
      throw new ValidationError(nipValidation.errors.join(', '));
    }
    
    return this.authRepository.createUser(userData);
  }
}
```

## Testing

### Unit Testing Validation Schemas
```typescript
describe('Login Schema', () => {
  test('should validate correct login data', () => {
    const validData = {
      body: {
        nip: '12345',
        password: 'password123',
      },
    };
    
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  test('should reject invalid NIP format', () => {
    const invalidData = {
      body: {
        nip: 'abc123', // Invalid: contains letters
        password: 'password123',
      },
    };
    
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

### Integration Testing Repository Validation
```typescript
describe('AuthRepository.validateNipUniqueness', () => {
  test('should detect duplicate NIP', async () => {
    // Create user with NIP
    await prisma.user.create({
      data: { nip: '12345', name: 'User 1', /* ... */ },
    });
    
    // Try to validate same NIP
    const validation = await authRepository.validateNipUniqueness('12345');
    
    expect(validation.isValid).toBe(false);
    expect(validation.isUnique).toBe(false);
    expect(validation.errors).toContain('NIP sudah digunakan oleh user lain');
  });
});
```

## Summary

- **✅ Input Validation**: Use Zod schemas in `auth.validation.ts`
- **✅ Business Logic**: Use service layer for workflow validation
- **✅ Data Validation**: Use repository layer for database constraints
- **❌ Mixed Validation**: Don't put database logic in validation layer
- **✅ Clean Architecture**: Validation layer now only contains input validation schemas
- **🔄 Migration**: Use repository methods for data validation (no deprecated functions)

This architecture ensures:
- Clear separation of concerns
- Easy testing and mocking
- Proper dependency management
- Scalable and maintainable code
