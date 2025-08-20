/**
 * Authentication Controller
 * 
 * HTTP request/response handling for authentication endpoints including:
 * - Login/logout endpoints
 * - Token refresh endpoints
 * - Password management endpoints
 * - User profile endpoints
 */

import { Request, Response } from 'express';
import {
  LoginRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  LogoutRequest,
} from './auth.types';
import { AuthService } from './auth.service';
import { authValidationSchemas } from './auth.validation';
import { AUTH_CONSTANTS } from './auth.config';

export class AuthController {
  constructor(private authService: AuthService) {}

  // ================================================
  // AUTHENTICATION ENDPOINTS
  // ================================================

  /**
   * POST /api/auth/login
   * Authenticate user with NIP and password
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validation = authValidationSchemas.login.safeParse(req);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Data tidak valid',
          errors: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      const loginData: LoginRequest = validation.data.body;
      const ipAddress = this.authService.extractIpAddress(req);
      const userAgent = this.authService.extractUserAgent(req);

      // Perform login
      const result = await this.authService.login(loginData, ipAddress, userAgent);

      if (result.success && result.data) {
        // Set refresh token as HTTP-only cookie if remember me is enabled
        if (loginData.rememberMe) {
          res.cookie(AUTH_CONSTANTS.COOKIE_NAME, result.data.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });
        }

        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            user: result.data.user,
            tokens: {
              accessToken: result.data.tokens.accessToken,
              expiresIn: result.data.tokens.expiresIn,
              tokenType: result.data.tokens.tokenType,
              // Don't send refresh token in response if remember me is enabled
              ...(loginData.rememberMe ? {} : { refreshToken: result.data.tokens.refreshToken }),
            },
          },
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
      });
    }
  };

  /**
   * POST /api/auth/logout
   * Logout user and invalidate session/tokens
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validation = authValidationSchemas.logout.safeParse(req);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Data tidak valid',
          errors: validation.error.errors,
        });
        return;
      }

      const logoutData: LogoutRequest = validation.data.body;
      const userId = req.user?.id;
      const sessionId = req.sessionId;
      const ipAddress = this.authService.extractIpAddress(req);
      const userAgent = this.authService.extractUserAgent(req);

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi',
        });
        return;
      }

      // Perform logout
      const result = await this.authService.logout(
        logoutData,
        userId,
        sessionId,
        ipAddress,
        userAgent
      );

      // Clear refresh token cookie
      res.clearCookie(AUTH_CONSTANTS.COOKIE_NAME);

      res.status(200).json(result);
    } catch (error) {
      console.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
      });
    }
  };

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get refresh token from body or cookie
      let refreshToken = req.body.refreshToken;
      if (!refreshToken && req.cookies[AUTH_CONSTANTS.COOKIE_NAME]) {
        refreshToken = req.cookies[AUTH_CONSTANTS.COOKIE_NAME];
      }

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token tidak ditemukan',
        });
        return;
      }

      // Validate request
      const validation = authValidationSchemas.refreshToken.safeParse({
        body: { refreshToken },
      });

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Token tidak valid',
        });
        return;
      }

      const refreshData: RefreshTokenRequest = validation.data.body;

      // Perform token refresh
      const result = await this.authService.refreshToken(refreshData);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            tokens: {
              accessToken: result.data.tokens.accessToken,
              expiresIn: result.data.tokens.expiresIn,
              tokenType: result.data.tokens.tokenType,
            },
          },
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Refresh token controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
      });
    }
  };

  // ================================================
  // PASSWORD MANAGEMENT ENDPOINTS
  // ================================================

  /**
   * POST /api/auth/change-password
   * Change user password (requires authentication)
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validation = authValidationSchemas.changePassword.safeParse(req);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Data tidak valid',
          errors: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      const passwordData: ChangePasswordRequest = validation.data.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi',
        });
        return;
      }

      // Perform password change
      const result = await this.authService.changePassword(passwordData, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Change password controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
      });
    }
  };

  /**
   * POST /api/auth/reset-password
   * Reset user password to default (admin/dinas only)
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validation = authValidationSchemas.resetPassword.safeParse(req);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Data tidak valid',
          errors: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      const resetData: ResetPasswordRequest = validation.data.body;
      const adminUserId = req.user?.id;

      if (!adminUserId) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi',
        });
        return;
      }

      // Check permissions
      const hasPermission = this.authService.hasPermission(req.user!, 'users', 'reset_password');
      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk reset password',
        });
        return;
      }

      // Perform password reset
      const result = await this.authService.resetPassword(resetData, adminUserId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Reset password controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
      });
    }
  };

  // ================================================
  // USER PROFILE ENDPOINTS
  // ================================================

  /**
   * GET /api/auth/profile
   * Get current user profile
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile berhasil diambil',
        data: {
          user: {
            id: user.id,
            name: user.name,
            nip: user.nip,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            avatarUrl: user.avatarUrl,
            lastLogin: user.lastLogin,
            permissions: user.permissions,
          },
        },
      });
    } catch (error) {
      console.error('Get profile controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
      });
    }
  };

  /**
   * GET /api/auth/permissions
   * Get current user permissions
   */
  getPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Permissions berhasil diambil',
        data: {
          permissions: user.permissions,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Get permissions controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
      });
    }
  };

  // ================================================
  // SESSION MANAGEMENT ENDPOINTS
  // ================================================

  /**
   * GET /api/auth/session
   * Get current session information
   */
  getSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId = req.sessionId;

      if (!sessionId) {
        res.status(401).json({
          success: false,
          message: 'Session tidak ditemukan',
        });
        return;
      }

      const session = this.authService.getSession(sessionId);

      if (!session) {
        res.status(401).json({
          success: false,
          message: 'Session tidak valid atau telah kadaluarsa',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Session information retrieved successfully',
        data: {
          session: {
            sessionId: session.sessionId,
            loginTime: session.loginTime,
            lastActivity: session.lastActivity,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            isActive: session.isActive,
          },
        },
      });
    } catch (error) {
      console.error('Get session controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
      });
    }
  };

  // ================================================
  // SYSTEM ENDPOINTS
  // ================================================

  /**
   * GET /api/auth/health
   * Get authentication system health status
   */
  getHealth = async (res: Response): Promise<void> => {
    try {
      const healthStatus = await this.authService.getHealthStatus();

      res.status(200).json({
        success: true,
        message: 'Health status retrieved successfully',
        data: {
          status: healthStatus.database ? 'healthy' : 'unhealthy',
          database: healthStatus.database,
          activeTokens: healthStatus.activeTokens,
          activeSessions: healthStatus.activeSessions,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Get health controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        data: {
          status: 'unhealthy',
          database: false,
          activeTokens: 0,
          activeSessions: 0,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

}
