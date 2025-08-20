/**
 * Authentication Configuration
 * 
 * Centralized configuration for authentication system including:
 * - JWT settings
 * - Password policies
 * - Security settings
 * - Role-based permissions
 */

import { UserRole } from '@prisma/client';
import { AuthConfig, RolePermissions, Permission } from './auth.types';

// ================================================
// MAIN AUTH CONFIGURATION
// ================================================

export const authConfig: AuthConfig = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'obatku-access-secret-dev',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'obatku-refresh-secret-dev',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m', // 15 minutes
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // 7 days
    issuer: process.env.JWT_ISSUER || 'obatku-api',
    audience: process.env.JWT_AUDIENCE || 'obatku-client',
  },
  password: {
    saltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS || '12'),
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
    maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH || '128'),
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL === 'true',
  },
  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '15'), // 15 minutes
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '480'), // 8 hours
    enableAuditLog: process.env.ENABLE_AUDIT_LOG !== 'false',
  },
};

// ================================================
// ROLE-BASED PERMISSIONS
// ================================================

/**
 * Permission mapping for each role
 * Format: resource:action
 */
export const rolePermissions: RolePermissions = {
  [UserRole.ADMIN]: [
    // User management
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    { resource: 'users', action: 'reset_password' },
    { resource: 'users', action: 'activate' },
    { resource: 'users', action: 'deactivate' },
    
    // Medicine & Inventory
    { resource: 'medicines', action: 'create' },
    { resource: 'medicines', action: 'read' },
    { resource: 'medicines', action: 'update' },
    { resource: 'medicines', action: 'delete' },
    { resource: 'inventory', action: 'create' },
    { resource: 'inventory', action: 'read' },
    { resource: 'inventory', action: 'update' },
    { resource: 'inventory', action: 'delete' },
    
    // QR Code management
    { resource: 'qrcode', action: 'create' },
    { resource: 'qrcode', action: 'read' },
    { resource: 'qrcode', action: 'update' },
    { resource: 'qrcode', action: 'delete' },
    { resource: 'qrcode', action: 'generate_bulk' },
    
    // Submissions & Approvals
    { resource: 'submissions', action: 'create' },
    { resource: 'submissions', action: 'read' },
    { resource: 'submissions', action: 'update' },
    { resource: 'submissions', action: 'delete' },
    { resource: 'submissions', action: 'approve' },
    { resource: 'submissions', action: 'reject' },
    
    // Transactions
    { resource: 'transactions', action: 'create' },
    { resource: 'transactions', action: 'read' },
    { resource: 'transactions', action: 'update' },
    { resource: 'transactions', action: 'delete' },
    { resource: 'transactions', action: 'verify' },
    { resource: 'transactions', action: 'distribute' },
    
    // Reports & Analytics
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'export' },
    { resource: 'analytics', action: 'read' },
    
    // System settings
    { resource: 'settings', action: 'read' },
    { resource: 'settings', action: 'update' },
    { resource: 'audit_logs', action: 'read' },
  ],

  [UserRole.DINAS]: [
    // User management (limited)
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'reset_password' }, // Can reset passwords
    
    // Medicine & Inventory
    { resource: 'medicines', action: 'create' },
    { resource: 'medicines', action: 'read' },
    { resource: 'medicines', action: 'update' },
    { resource: 'inventory', action: 'create' },
    { resource: 'inventory', action: 'read' },
    { resource: 'inventory', action: 'update' },
    
    // QR Code management
    { resource: 'qrcode', action: 'create' },
    { resource: 'qrcode', action: 'read' },
    { resource: 'qrcode', action: 'update' },
    { resource: 'qrcode', action: 'generate_bulk' },
    
    // Submissions & Approvals (full access)
    { resource: 'submissions', action: 'create' },
    { resource: 'submissions', action: 'read' },
    { resource: 'submissions', action: 'update' },
    { resource: 'submissions', action: 'approve' },
    { resource: 'submissions', action: 'reject' },
    
    // Transactions
    { resource: 'transactions', action: 'create' },
    { resource: 'transactions', action: 'read' },
    { resource: 'transactions', action: 'update' },
    { resource: 'transactions', action: 'verify' },
    { resource: 'transactions', action: 'distribute' },
    
    // Reports
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'export' },
  ],

  [UserRole.PPL]: [
    // User management (very limited)
    { resource: 'users', action: 'read', conditions: { scope: 'own_profile' } },
    
    // Medicine & Inventory (read only)
    { resource: 'medicines', action: 'read' },
    { resource: 'inventory', action: 'read' },
    
    // QR Code (read only)
    { resource: 'qrcode', action: 'read' },
    
    // Submissions (full access to own submissions)
    { resource: 'submissions', action: 'create' },
    { resource: 'submissions', action: 'read', conditions: { scope: 'own_submissions' } },
    { resource: 'submissions', action: 'update', conditions: { scope: 'own_submissions', status: 'DRAFT' } },
    
    // Transactions (limited access)
    { resource: 'transactions', action: 'read', conditions: { scope: 'related_transactions' } },
    
    // Reports (limited)
    { resource: 'reports', action: 'read', conditions: { scope: 'own_reports' } },
  ],

  [UserRole.POPT]: [
    // User management (profile only)
    { resource: 'users', action: 'read', conditions: { scope: 'own_profile' } },
    
    // Medicine & Inventory (read only)
    { resource: 'medicines', action: 'read' },
    { resource: 'inventory', action: 'read' },
    
    // QR Code (read only)
    { resource: 'qrcode', action: 'read' },
    
    // Submissions (limited - can view related submissions)
    { resource: 'submissions', action: 'read', conditions: { scope: 'related_submissions' } },
    
    // Transactions (view only)
    { resource: 'transactions', action: 'read', conditions: { scope: 'related_transactions' } },
    
    // Reports (very limited)
    { resource: 'reports', action: 'read', conditions: { scope: 'basic_reports' } },
  ],
};

// ================================================
// PERMISSION HELPER FUNCTIONS
// ================================================

/**
 * Get permissions for a specific role
 */
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  return rolePermissions[role] || [];
};

/**
 * Get permission strings for a role (for JWT payload)
 */
export const getPermissionStringsForRole = (role: UserRole): string[] => {
  const permissions = getPermissionsForRole(role);
  return permissions.map(p => `${p.resource}:${p.action}`);
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (
  role: UserRole, 
  resource: string, 
  action: string
): boolean => {
  const permissions = getPermissionsForRole(role);
  return permissions.some(p => p.resource === resource && p.action === action);
};

/**
 * Check if a role has any permission for a resource
 */
export const hasResourceAccess = (role: UserRole, resource: string): boolean => {
  const permissions = getPermissionsForRole(role);
  return permissions.some(p => p.resource === resource);
};

// ================================================
// DEFAULT PASSWORD CONFIGURATION
// ================================================

/**
 * Generate default password from birth date
 * Format: DDMMYYYY (e.g., 15081990 for August 15, 1990)
 */
export const generateDefaultPassword = (birthDate: Date): string => {
  const day = String(birthDate.getDate()).padStart(2, '0');
  const month = String(birthDate.getMonth() + 1).padStart(2, '0');
  const year = String(birthDate.getFullYear());
  
  return `${day}${month}${year}`;
};

/**
 * Validate if password matches default pattern
 */
export const isDefaultPassword = (password: string, birthDate: Date): boolean => {
  const defaultPassword = generateDefaultPassword(birthDate);
  return password === defaultPassword;
};

// ================================================
// SECURITY CONSTANTS
// ================================================

export const AUTH_CONSTANTS = {
  TOKEN_PREFIX: 'Bearer ',
  HEADER_NAME: 'Authorization',
  COOKIE_NAME: 'obatku_refresh_token',
  SESSION_COOKIE_NAME: 'obatku_session',
  
  // Rate limiting
  LOGIN_ATTEMPTS_WINDOW: 15 * 60 * 1000, // 15 minutes in milliseconds
  PASSWORD_RESET_COOLDOWN: 5 * 60 * 1000, // 5 minutes in milliseconds
  
  // Password validation patterns
  PASSWORD_PATTERNS: {
    UPPERCASE: /[A-Z]/,
    LOWERCASE: /[a-z]/,
    NUMBERS: /[0-9]/,
    SPECIAL_CHARS: /[!@#$%^&*(),.?":{}|<>]/,
  },
  
  // Default messages
  MESSAGES: {
    LOGIN_SUCCESS: 'Login berhasil',
    LOGIN_FAILED: 'NIP atau password salah',
    LOGOUT_SUCCESS: 'Logout berhasil',
    TOKEN_REFRESHED: 'Token berhasil diperbaharui',
    PASSWORD_RESET_SUCCESS: 'Password berhasil direset',
    PASSWORD_CHANGED: 'Password berhasil diubah',
    UNAUTHORIZED: 'Anda tidak memiliki akses',
    FORBIDDEN: 'Akses ditolak',
    USER_INACTIVE: 'Akun tidak aktif',
    SESSION_EXPIRED: 'Sesi telah berakhir',
  },
};

export default authConfig;
