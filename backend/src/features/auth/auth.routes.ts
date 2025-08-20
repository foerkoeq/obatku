/**
 * Authentication Routes
 * 
 * Express router configuration for authentication endpoints including:
 * - Public routes (login, refresh token)
 * - Protected routes (logout, change password, profile)
 * - Admin routes (reset password)
 * - System routes (health check)
 */

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/authorization.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { rateLimiter } from '../../shared/middleware/rate-limiter.middleware';
import { authValidationSchemas } from './auth.validation';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  // ================================================
  // PUBLIC ROUTES (No authentication required)
  // ================================================

  /**
   * @route   POST /api/auth/login
   * @desc    Authenticate user with NIP and password
   * @access  Public
   * @rateLimit 5 requests per 15 minutes per IP
   */
  router.post(
    '/login',
    rateLimiter.loginAttempt, // Protect against brute force
    validateRequest({ body: authValidationSchemas.login.shape.body }),
    authController.login
  );

  /**
   * @route   POST /api/auth/refresh
   * @desc    Refresh access token using refresh token
   * @access  Public
   * @rateLimit 10 requests per 5 minutes per IP
   */
  router.post(
    '/refresh',
    rateLimiter.tokenRefresh,
    validateRequest({ body: authValidationSchemas.refreshToken.shape.body }),
    authController.refreshToken
  );

  /**
   * @route   GET /api/auth/health
   * @desc    Get authentication system health status
   * @access  Public
   */
  router.get('/health', authController.getHealth);

  // ================================================
  // PROTECTED ROUTES (Authentication required)
  // ================================================

  // Apply authentication middleware to all routes below
  router.use(authenticate);

  /**
   * @route   POST /api/auth/logout
   * @desc    Logout user and invalidate session/tokens
   * @access  Private
   */
  router.post(
    '/logout',
    validateRequest({ body: authValidationSchemas.logout.shape.body }),
    authController.logout
  );

  /**
   * @route   GET /api/auth/profile
   * @desc    Get current user profile
   * @access  Private
   */
  router.get('/profile', authController.getProfile);

  /**
   * @route   GET /api/auth/permissions
   * @desc    Get current user permissions
   * @access  Private
   */
  router.get('/permissions', authController.getPermissions);

  /**
   * @route   GET /api/auth/session
   * @desc    Get current session information
   * @access  Private
   */
  router.get('/session', authController.getSession);

  /**
   * @route   POST /api/auth/change-password
   * @desc    Change user password
   * @access  Private
   * @rateLimit 3 requests per 15 minutes per user
   */
  router.post(
    '/change-password',
    rateLimiter.passwordChange,
    validateRequest({ body: authValidationSchemas.changePassword.shape.body }),
    authController.changePassword
  );

  // ================================================
  // ADMIN ROUTES (Admin/Dinas permission required)
  // ================================================

  /**
   * @route   POST /api/auth/reset-password
   * @desc    Reset user password to default (admin/dinas only)
   * @access  Private (Admin/Dinas only)
   * @rateLimit 5 requests per 30 minutes per user
   */
  router.post(
    '/reset-password',
    rateLimiter.passwordReset,
    authorize(['admin', 'dinas']),
    validateRequest({ body: authValidationSchemas.resetPassword.shape.body }),
    authController.resetPassword
  );

  return router;
}

// ================================================
// ROUTE DOCUMENTATION
// ================================================

/**
 * Authentication API Routes Documentation
 * 
 * BASE URL: /api/auth
 * 
 * PUBLIC ROUTES:
 * POST   /login           - User authentication
 * POST   /refresh         - Token refresh
 * GET    /health          - System health check
 * 
 * PROTECTED ROUTES (Requires valid access token):
 * POST   /logout          - User logout
 * GET    /profile         - Get user profile
 * GET    /permissions     - Get user permissions
 * GET    /session         - Get session info
 * POST   /change-password - Change password
 * 
 * ADMIN ROUTES (Requires admin/dinas role):
 * POST   /reset-password  - Reset user password
 * 
 * AUTHENTICATION:
 * - Use Bearer token in Authorization header
 * - Format: "Authorization: Bearer <access_token>"
 * 
 * RATE LIMITING:
 * - Login: 5 attempts per 15 minutes per IP
 * - Token refresh: 10 requests per 5 minutes per IP
 * - Password change: 3 requests per 15 minutes per user
 * - Password reset: 5 requests per 30 minutes per user
 * 
 * ERROR RESPONSES:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (invalid/expired token)
 * - 403: Forbidden (insufficient permissions)
 * - 429: Too Many Requests (rate limit exceeded)
 * - 500: Internal Server Error
 * 
 * SUCCESS RESPONSES:
 * - 200: OK (successful operation)
 * - 201: Created (resource created)
 * 
 * RESPONSE FORMAT:
 * {
 *   "success": boolean,
 *   "message": string,
 *   "data"?: any,
 *   "errors"?: array
 * }
 */

export default createAuthRoutes;
