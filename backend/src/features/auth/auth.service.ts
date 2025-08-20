/**
 * Authentication Service
 * 
 * Business logic layer for authentication operations including:
 * - User authentication (login/logout)
 * - Password management
 * - Session management
 * - Token operations
 * - Security validations
 */

import { UserRole, UserStatus } from '@prisma/client';
import {
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
  AuthenticatedUser,
  AuthError,
  AuthErrorCodes,
  SecurityEvent,
} from './auth.types';
import { AuthRepository } from './auth.repository';
import { JWTService } from './jwt.service';
import { 
  getPermissionStringsForRole, 
  AUTH_CONSTANTS 
} from './auth.config';
import { validatePasswordStrength } from './auth.validation';

export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JWTService
  ) {}

  // ================================================
  // AUTHENTICATION OPERATIONS
  // ================================================

  /**
   * Authenticate user with NIP and password
   */
  async login(
    loginData: LoginRequest,
    ipAddress: string,
    userAgent: string
  ): Promise<LoginResponse> {
    const { nip, password } = loginData;

    try {
      // Check if account is locked
      const isLocked = await this.authRepository.isAccountLocked(nip);
      if (isLocked) {
        await this.logSecurityEvent('login', {
          nip,
          ipAddress,
          userAgent,
          success: false,
          details: { reason: 'account_locked' },
        });

        return {
          success: false,
          message: 'Akun terkunci karena terlalu banyak percobaan login yang gagal',
        };
      }

      // Find user by NIP
      const user = await this.authRepository.findUserByNip(nip);
      if (!user) {
        await this.logFailedAttempt(nip, ipAddress, userAgent, 'user_not_found');
        return {
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.LOGIN_FAILED,
        };
      }

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        await this.logFailedAttempt(nip, ipAddress, userAgent, 'user_inactive');
        return {
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.USER_INACTIVE,
        };
      }

      // Verify password
      const isValidPassword = await this.authRepository.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        await this.logFailedAttempt(nip, ipAddress, userAgent, 'invalid_password');
        return {
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.LOGIN_FAILED,
        };
      }

      // Create authenticated user object
      const permissions = getPermissionStringsForRole(user.role);
      const authenticatedUser = this.authRepository.toAuthenticatedUser(user, permissions);

      // Generate tokens
      const tokens = this.jwtService.generateTokenPair(authenticatedUser);

      // Create session
      const sessionId = this.authRepository.createSession(
        user.id,
        user.nip,
        user.role,
        permissions,
        ipAddress,
        userAgent
      );

      // Update last login
      await this.authRepository.updateLastLogin(user.id);

      // Log successful login
      await this.logSecurityEvent('login', {
        userId: user.id,
        nip,
        ipAddress,
        userAgent,
        success: true,
        details: { sessionId },
      });

      // Check if user is using default password
      const usingDefaultPassword = await this.authRepository.isDefaultPassword(user.id, password);

      return {
        success: true,
        message: AUTH_CONSTANTS.MESSAGES.LOGIN_SUCCESS,
        data: {
          user: {
            ...authenticatedUser,
            mustChangePassword: usingDefaultPassword,
          } as AuthenticatedUser & { mustChangePassword?: boolean },
          tokens,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      await this.logFailedAttempt(nip, ipAddress, userAgent, 'system_error');
      
      return {
        success: false,
        message: 'Terjadi kesalahan sistem. Silakan coba lagi.',
      };
    }
  }

  /**
   * Logout user
   */
  async logout(
    logoutData: LogoutRequest,
    userId: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LogoutResponse> {
    try {
      if (logoutData.logoutAll) {
        // Logout from all devices
        this.authRepository.invalidateAllUserSessions(userId);
        this.jwtService.revokeAllRefreshTokens(userId);
      } else if (sessionId) {
        // Logout from current session
        this.authRepository.invalidateSession(sessionId);
      }

      // Log logout event
      if (ipAddress && userAgent) {
        await this.logSecurityEvent('logout', {
          userId,
          nip: '', // We don't have NIP in logout, could get from session
          ipAddress,
          userAgent,
          success: true,
          details: { logoutAll: logoutData.logoutAll },
        });
      }

      return {
        success: true,
        message: AUTH_CONSTANTS.MESSAGES.LOGOUT_SUCCESS,
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat logout',
      };
    }
  }

  // ================================================
  // TOKEN OPERATIONS
  // ================================================

  /**
   * Refresh access token
   */
  async refreshToken(refreshData: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      const { refreshToken } = refreshData;

      // Verify refresh token
      const payload = this.jwtService.verifyRefreshToken(refreshToken);

      // Get current user data
      const user = await this.authRepository.findUserById(payload.sub);
      if (!user) {
        throw this.createAuthError(
          AuthErrorCodes.USER_NOT_FOUND,
          'User not found',
          401
        );
      }

      // Check if user is still active
      if (user.status !== UserStatus.ACTIVE) {
        throw this.createAuthError(
          AuthErrorCodes.USER_INACTIVE,
          'User account is inactive',
          401
        );
      }

      // Create authenticated user object
      const permissions = getPermissionStringsForRole(user.role);
      const authenticatedUser = this.authRepository.toAuthenticatedUser(user, permissions);

      // Generate new access token
      const tokens = this.jwtService.refreshAccessToken(refreshToken, authenticatedUser);

      return {
        success: true,
        message: AUTH_CONSTANTS.MESSAGES.TOKEN_REFRESHED,
        data: { tokens },
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      
      if (error instanceof Error && 'code' in error) {
        const authError = error as AuthError;
        return {
          success: false,
          message: authError.message,
        };
      }

      return {
        success: false,
        message: 'Token tidak valid atau telah kadaluarsa',
      };
    }
  }

  /**
   * Validate access token and get user data
   */
  async validateToken(token: string): Promise<AuthenticatedUser | null> {
    try {
      // Verify token
      const payload = this.jwtService.verifyAccessToken(token);

      // Get current user data
      const user = await this.authRepository.findUserById(payload.sub);
      if (!user) {
        return null;
      }

      // Check if user is still active
      if (user.status !== UserStatus.ACTIVE) {
        return null;
      }

      // Return authenticated user
      const permissions = getPermissionStringsForRole(user.role);
      return this.authRepository.toAuthenticatedUser(user, permissions);
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }

  // ================================================
  // PASSWORD MANAGEMENT
  // ================================================

  /**
   * Change user password
   */
  async changePassword(
    passwordData: ChangePasswordRequest,
    userId: string
  ): Promise<ChangePasswordResponse> {
    try {
      const { currentPassword, newPassword } = passwordData;

      // Get user data
      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User tidak ditemukan',
        };
      }

      // Verify current password
      const isValidCurrentPassword = await this.authRepository.verifyPassword(
        currentPassword,
        user.passwordHash
      );

      if (!isValidCurrentPassword) {
        return {
          success: false,
          message: 'Password lama tidak benar',
        };
      }

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.errors.join(', '),
        };
      }

      // Check if new password is different from current
      const isSamePassword = await this.authRepository.verifyPassword(
        newPassword,
        user.passwordHash
      );

      if (isSamePassword) {
        return {
          success: false,
          message: 'Password baru harus berbeda dari password lama',
        };
      }

      // Update password
      await this.authRepository.changePassword(userId, newPassword);

      // Log password change event
      await this.logSecurityEvent('password_change', {
        userId,
        nip: user.nip,
        ipAddress: '', // Should be passed from controller
        userAgent: '', // Should be passed from controller
        success: true,
      });

      return {
        success: true,
        message: AUTH_CONSTANTS.MESSAGES.PASSWORD_CHANGED,
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat mengubah password',
      };
    }
  }

  /**
   * Reset user password to default (admin/dinas only)
   */
  async resetPassword(
    resetData: ResetPasswordRequest,
    adminUserId: string
  ): Promise<ResetPasswordResponse> {
    try {
      const { targetNip, adminPassword } = resetData;

      // Verify admin credentials
      const adminUser = await this.authRepository.findUserById(adminUserId);
      if (!adminUser) {
        return {
          success: false,
          message: 'Admin tidak ditemukan',
        };
      }

      // Check admin permissions
      if (adminUser.role !== UserRole.ADMIN && adminUser.role !== UserRole.DINAS) {
        return {
          success: false,
          message: 'Anda tidak memiliki izin untuk reset password',
        };
      }

      // Verify admin password
      const isValidAdminPassword = await this.authRepository.verifyPassword(
        adminPassword,
        adminUser.passwordHash
      );

      if (!isValidAdminPassword) {
        return {
          success: false,
          message: 'Password admin tidak benar',
        };
      }

      // Reset target user password
      const temporaryPassword = await this.authRepository.resetPasswordToDefault(targetNip);

      // Log password reset event
      await this.logSecurityEvent('password_reset', {
        userId: adminUserId,
        nip: adminUser.nip,
        ipAddress: '', // Should be passed from controller
        userAgent: '', // Should be passed from controller
        success: true,
        details: { targetNip },
      });

      return {
        success: true,
        message: AUTH_CONSTANTS.MESSAGES.PASSWORD_RESET_SUCCESS,
        data: {
          temporaryPassword,
          mustChangePassword: true,
        },
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat reset password',
      };
    }
  }

  // ================================================
  // SECURITY & VALIDATION
  // ================================================

  /**
   * Check user permissions
   */
  hasPermission(user: AuthenticatedUser, resource: string, action: string): boolean {
    const requiredPermission = `${resource}:${action}`;
    return user.permissions.includes(requiredPermission);
  }

  /**
   * Check multiple permissions (requires all)
   */
  hasAllPermissions(user: AuthenticatedUser, permissions: Array<{ resource: string; action: string }>): boolean {
    return permissions.every(({ resource, action }) => 
      this.hasPermission(user, resource, action)
    );
  }

  /**
   * Check multiple permissions (requires any)
   */
  hasAnyPermission(user: AuthenticatedUser, permissions: Array<{ resource: string; action: string }>): boolean {
    return permissions.some(({ resource, action }) => 
      this.hasPermission(user, resource, action)
    );
  }

  /**
   * Get user session
   */
  getSession(sessionId: string) {
    return this.authRepository.getSession(sessionId);
  }

  /**
   * Update session activity
   */
  updateSessionActivity(sessionId: string): void {
    this.authRepository.updateSessionActivity(sessionId);
  }

  // ================================================
  // AUDIT & LOGGING
  // ================================================

  /**
   * Log failed authentication attempt
   */
  private async logFailedAttempt(
    nip: string,
    ipAddress: string,
    userAgent: string,
    reason: string
  ): Promise<void> {
    await this.authRepository.logAuthAttempt({
      nip,
      success: false,
      ipAddress,
      userAgent,
      attemptTime: new Date(),
      failureReason: reason,
    });
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    type: SecurityEvent['type'],
    details: Partial<SecurityEvent>
  ): Promise<void> {
    await this.authRepository.logSecurityEvent({
      type,
      nip: details.nip || '',
      ipAddress: details.ipAddress || '',
      userAgent: details.userAgent || '',
      timestamp: new Date(),
      userId: details.userId,
      details: details.details,
    } as SecurityEvent);
  }

  // ================================================
  // MAINTENANCE OPERATIONS
  // ================================================

  /**
   * Cleanup expired sessions and tokens
   */
  async cleanupExpiredData(): Promise<void> {
    try {
      // Cleanup expired sessions
      this.authRepository.cleanupExpiredSessions();

      // Cleanup expired refresh tokens
      this.jwtService.cleanupExpiredTokens();

      console.log('Cleanup completed successfully');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<{
    database: boolean;
    activeTokens: number;
    activeSessions: number;
  }> {
    try {
      const databaseHealth = await this.authRepository.healthCheck();
      const activeTokens = this.jwtService.getActiveRefreshTokenCount();
      // Note: In production, implement session counting in repository
      const activeSessions = 0;

      return {
        database: databaseHealth,
        activeTokens,
        activeSessions,
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        database: false,
        activeTokens: 0,
        activeSessions: 0,
      };
    }
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  /**
   * Create standardized auth error
   */
  private createAuthError(code: AuthErrorCodes, message: string, statusCode: number): AuthError {
    const error = new Error(message) as AuthError;
    error.code = code;
    error.statusCode = statusCode;
    return error;
  }

  /**
   * Extract IP address from request
   */
  extractIpAddress(req: any): string {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           (req.connection?.socket?.remoteAddress) || 
           '127.0.0.1';
  }

  /**
   * Extract User Agent from request
   */
  extractUserAgent(req: any): string {
    return req.get('User-Agent') || 'Unknown';
  }
}
