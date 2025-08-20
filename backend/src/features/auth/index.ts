/**
 * Authentication Module Index
 * 
 * Central export point for all authentication-related functionality.
 * This provides a clean interface for importing auth components throughout the application.
 */

import { PrismaClient } from '@prisma/client';

// ================================================
// CORE SERVICES
// ================================================

export { AuthService } from './auth.service';
export { AuthRepository } from './auth.repository';
export { JWTService } from './jwt.service';
export { AuthController } from './auth.controller';

// ================================================
// ROUTES & MIDDLEWARE
// ================================================

export { createAuthRoutes } from './auth.routes';

// ================================================
// TYPES & INTERFACES
// ================================================

export type {
  // Request/Response types
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,

  // User & Session types
  AuthenticatedUser,
  UserSession,
  AuthTokens,
  JWTPayload,

  // Permission & Authorization types
  Permission,
  RolePermissions,

  // Validation types
  PasswordValidation,
  NipValidation,

  // Audit & Security types
  AuthAttempt,
  SecurityEvent,
  AuthError,

  // Utility types
  AuthMiddlewareRequest,
  AuthConfig,
} from './auth.types';

export { AuthErrorCodes } from './auth.types';

// ================================================
// CONFIGURATION & CONSTANTS
// ================================================

export {
  authConfig,
  rolePermissions,
  getPermissionsForRole,
  getPermissionStringsForRole,
  hasPermission,
  hasResourceAccess,
  generateDefaultPassword,
  isDefaultPassword,
  AUTH_CONSTANTS,
} from './auth.config';

// ================================================
// VALIDATION SCHEMAS
// ================================================

export {
  authValidationSchemas,
  validatePasswordStrength,
} from './auth.validation';

// ================================================
// FACTORY FUNCTIONS
// ================================================

/**
 * Create complete authentication system
 * This is the main factory function to initialize the auth module
 */
export function createAuthSystem(prisma: PrismaClient) {
  // Import classes locally to avoid circular dependencies
  const { AuthService } = require('./auth.service');
  const { AuthRepository } = require('./auth.repository');
  const { JWTService } = require('./jwt.service');
  const { AuthController } = require('./auth.controller');
  const { createAuthRoutes } = require('./auth.routes');

  // Initialize services
  const jwtService = new JWTService();
  const authRepository = new AuthRepository(prisma);
  const authService = new AuthService(authRepository, jwtService);
  const authController = new AuthController(authService);

  // Create routes
  const authRoutes = createAuthRoutes(authController);

  return {
    // Services
    authService,
    authRepository,
    jwtService,
    authController,
    
    // Routes
    authRoutes,
    
    // Utilities
    utilities: {
      validateToken: (token: string) => authService.validateToken(token),
      hasPermission: (user: any, resource: string, action: string) => 
        authService.hasPermission(user, resource, action),
      extractIpAddress: (req: any) => authService.extractIpAddress(req),
      extractUserAgent: (req: any) => authService.extractUserAgent(req),
    },
  };
}

/**
 * Create auth services only (without routes)
 * Useful for testing or when you need services in isolation
 */
export function createAuthServices(prisma: PrismaClient) {
  // Import classes locally to avoid circular dependencies
  const { AuthService } = require('./auth.service');
  const { AuthRepository } = require('./auth.repository');
  const { JWTService } = require('./jwt.service');

  const jwtService = new JWTService();
  const authRepository = new AuthRepository(prisma);
  const authService = new AuthService(authRepository, jwtService);

  return {
    authService,
    authRepository,
    jwtService,
  };
}

/**
 * Create auth controller with services
 */
export function createAuthController(prisma: PrismaClient) {
  const { authService } = createAuthServices(prisma);
  
  // Import controller locally to avoid circular dependencies
  const { AuthController } = require('./auth.controller');
  
  return new AuthController(authService);
}

// ================================================
// MIDDLEWARE EXPORTS
// ================================================

// Note: Middleware exports are available from shared/middleware/
// They require authService instance, so they're not re-exported here
// Import them directly from their files when needed

// ================================================
// VERSION INFO
// ================================================

export const AUTH_MODULE_VERSION = '1.0.0';
export const AUTH_MODULE_NAME = 'obatku-auth';

// ================================================
// MODULE METADATA
// ================================================

export const AUTH_MODULE_INFO = {
  name: AUTH_MODULE_NAME,
  version: AUTH_MODULE_VERSION,
  description: 'Comprehensive authentication and authorization module for Obatku backend',
  features: [
    'JWT-based authentication',
    'Role-based access control (RBAC)',
    'Permission-based authorization',
    'Session management',
    'Password management with default birth date passwords',
    'Rate limiting protection',
    'Security audit logging',
    'Token refresh mechanism',
    'Account lockout protection',
    'Comprehensive validation',
  ],
  dependencies: [
    '@prisma/client',
    'jsonwebtoken',
    'bcrypt',
    'zod',
    'express',
    'uuid',
  ],
  author: 'Obatku Team',
  license: 'MIT',
} as const;

// ================================================
// QUICK START EXAMPLE
// ================================================

/*
// Quick start example:

import { createAuthSystem } from './features/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const auth = createAuthSystem(prisma);

// Use in Express app
app.use('/api/auth', auth.authRoutes);

// Use middleware
import { createAuthMiddleware } from './shared/middleware/auth.middleware';
const authMiddleware = createAuthMiddleware(auth.authService);

// Protect routes
app.use('/api/protected', authMiddleware.authenticate);

// Check permissions
import { authorize } from './shared/middleware/authorization.middleware';
app.use('/api/admin', authorize(['admin']));
*/

export default {
  createAuthSystem,
  createAuthServices,
  createAuthController,
  AUTH_MODULE_INFO,
};
