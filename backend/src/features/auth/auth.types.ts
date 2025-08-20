/**
 * Authentication Module Types
 * 
 * Comprehensive type definitions for authentication system including:
 * - Login/logout interfaces
 * - JWT token types
 * - Password reset types
 * - User session management
 */

import { UserRole, UserStatus } from '@prisma/client';

// ================================================
// LOGIN & AUTHENTICATION TYPES
// ================================================

export interface LoginRequest {
  nip: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthenticatedUser;
    tokens: AuthTokens;
  };
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  nip: string;
  email?: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  lastLogin?: Date;
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: 'Bearer';
}

// ================================================
// JWT TOKEN TYPES
// ================================================

export interface JWTPayload {
  sub: string; // user id
  nip: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data?: {
    tokens: AuthTokens;
  };
}

// ================================================
// PASSWORD MANAGEMENT TYPES
// ================================================

export interface ResetPasswordRequest {
  targetNip: string;
  adminPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    temporaryPassword: string;
    mustChangePassword: boolean;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// ================================================
// SESSION MANAGEMENT TYPES
// ================================================

export interface UserSession {
  userId: string;
  sessionId: string;
  nip: string;
  role: UserRole;
  permissions: string[];
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface LogoutRequest {
  sessionId?: string;
  logoutAll?: boolean; // logout from all devices
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ================================================
// PERMISSION & AUTHORIZATION TYPES
// ================================================

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  [UserRole.ADMIN]: Permission[];
  [UserRole.DINAS]: Permission[];
  [UserRole.PPL]: Permission[];
  [UserRole.POPT]: Permission[];
}

// ================================================
// VALIDATION TYPES
// ================================================

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export interface NipValidation {
  isValid: boolean;
  errors: string[];
  isUnique: boolean;
}

// ================================================
// AUDIT & SECURITY TYPES
// ================================================

export interface AuthAttempt {
  id: string;
  nip: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  attemptTime: Date;
  failureReason?: string;
}

export interface SecurityEvent {
  type: 'login' | 'logout' | 'password_reset' | 'password_change' | 'failed_login' | 'token_refresh';
  userId?: string;
  nip: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success?: boolean;
  details?: Record<string, any>;
}

// ================================================
// ERROR TYPES
// ================================================

export interface AuthError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, any>;
}

export enum AuthErrorCodes {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_INACTIVE = 'USER_INACTIVE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS'
}

// ================================================
// UTILITY TYPES
// ================================================

export type AuthMiddlewareRequest = Express.Request & {
  user?: AuthenticatedUser;
  session?: UserSession;
  permissions?: string[];
};

export interface AuthConfig {
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
  };
  password: {
    saltRounds: number;
    minLength: number;
    maxLength: number;
    requireSpecialChars: boolean;
  };
  security: {
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    sessionTimeout: number; // minutes
    enableAuditLog: boolean;
  };
}
