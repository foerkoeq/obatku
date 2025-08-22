/**
 * Authentication Middleware
 * 
 * Express middleware for:
 * - JWT token validation
 * - User authentication
 * - Session management
 * - Request context enhancement
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from '../../features/auth/auth.types';
import { AuthService } from '../../features/auth/auth.service';
import { AUTH_CONSTANTS } from '../../features/auth/auth.config';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionId?: string;
    }
  }
}

export class AuthMiddleware {
  constructor(private authService: AuthService) {}

  /**
   * Main authentication middleware
   * Validates JWT token and sets user context
   */
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract token from Authorization header
      const authHeader = req.get('Authorization');
      if (!authHeader || !authHeader.startsWith(AUTH_CONSTANTS.TOKEN_PREFIX)) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
          code: 'MISSING_TOKEN',
        });
        return;
      }

      const token = authHeader.substring(AUTH_CONSTANTS.TOKEN_PREFIX.length);

      // Validate token and get user data
      const user = await this.authService.validateToken(token);
      if (!user) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
          code: 'INVALID_TOKEN',
        });
        return;
      }

      // Add user to request context
      req.user = user;

      // Update session activity if session exists
      const sessionId = req.get('X-Session-ID');
      if (sessionId) {
        req.sessionId = sessionId;
        this.authService.updateSessionActivity(sessionId);
      }

      next();
    } catch (error) {
      console.error('Authentication middleware error:', error);
      res.status(401).json({
        success: false,
        message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
        code: 'TOKEN_ERROR',
      });
    }
  };

  /**
   * Optional authentication middleware
   * Sets user context if token is valid, but doesn't block request
   */
  optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.get('Authorization');
      if (authHeader && authHeader.startsWith(AUTH_CONSTANTS.TOKEN_PREFIX)) {
        const token = authHeader.substring(AUTH_CONSTANTS.TOKEN_PREFIX.length);
        
        try {
          const user = await this.authService.validateToken(token);
          if (user) {
            req.user = user;
            
            // Update session activity if session exists
            const sessionId = req.get('X-Session-ID');
            if (sessionId) {
              req.sessionId = sessionId;
              this.authService.updateSessionActivity(sessionId);
            }
          }
        } catch (error) {
          // Don't block request if token is invalid
          console.warn('Optional authentication failed:', error);
        }
      }

      next();
    } catch (error) {
      console.error('Optional authentication middleware error:', error);
      next(); // Continue anyway
    }
  };

  /**
   * Session validation middleware
   * Additional validation for session-based authentication
   */
  validateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
          code: 'NO_USER_CONTEXT',
        });
        return;
      }

      const sessionId = req.sessionId;
      if (!sessionId) {
        // If no session ID provided, continue with token-only auth
        next();
        return;
      }

      // Validate session
      const session = this.authService.getSession(sessionId);
      if (!session || !session.isActive) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.SESSION_EXPIRED,
          code: 'INVALID_SESSION',
        });
        return;
      }

      // Ensure session belongs to authenticated user
      if (session.userId !== req.user.id) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
          code: 'SESSION_MISMATCH',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Session validation middleware error:', error);
      res.status(401).json({
        success: false,
        message: AUTH_CONSTANTS.MESSAGES.SESSION_EXPIRED,
        code: 'SESSION_ERROR',
      });
    }
  };

  /**
   * Active user check middleware
   * Ensures user account is still active
   */
  checkActiveUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.UNAUTHORIZED,
          code: 'NO_USER_CONTEXT',
        });
        return;
      }

      // Check if user status is active
      if (req.user.status !== 'ACTIVE') {
        res.status(401).json({
          success: false,
          message: AUTH_CONSTANTS.MESSAGES.USER_INACTIVE,
          code: 'USER_INACTIVE',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Active user check middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan sistem',
        code: 'SYSTEM_ERROR',
      });
    }
  };

  /**
   * Request logging middleware
   * Logs authenticated requests for audit purposes
   */
  logAuthenticatedRequest = (req: Request, _res: Response, next: NextFunction): void => {
    if (req.user) {
      const logData = {
        userId: req.user.id,
        nip: req.user.nip,
        role: req.user.role,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      };

      // In production, you might want to log this to a proper audit system
      console.log('Authenticated Request:', logData);
    }

    next();
  };

  /**
   * Token refresh check middleware
   * Checks if token is close to expiration and adds refresh hint
   */
  checkTokenExpiration = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.get('Authorization');
      if (authHeader && authHeader.startsWith(AUTH_CONSTANTS.TOKEN_PREFIX)) {
        // Extract token for potential future use (commented out for now)
        // const token = authHeader.substring(AUTH_CONSTANTS.TOKEN_PREFIX.length);
        
        // This would require access to JWTService
        // For now, we'll add a header to suggest token refresh
        // if the token is older than a certain threshold
        
        // Add custom header to suggest token refresh
        res.set('X-Token-Refresh-Suggested', 'false');
      }

      next();
    } catch (error) {
      console.error('Token expiration check error:', error);
      next(); // Continue anyway
    }
  };
}

// ================================================
// FACTORY FUNCTION
// ================================================

/**
 * Create authentication middleware instance
 */
export function createAuthMiddleware(authService: AuthService) {
  return new AuthMiddleware(authService);
}

// ================================================
// STANDALONE MIDDLEWARE FUNCTIONS
// ================================================

/**
 * Standalone authenticate function (for backward compatibility)
 */
export const authenticate = (authService: AuthService) => 
  new AuthMiddleware(authService).authenticate;

/**
 * Standalone optional authenticate function
 */
export const optionalAuthenticate = (authService: AuthService) => 
  new AuthMiddleware(authService).optionalAuthenticate;

/**
 * Standalone session validation function
 */
export const validateSession = (authService: AuthService) => 
  new AuthMiddleware(authService).validateSession;

/**
 * Standalone active user check function
 */
export const checkActiveUser = (authService: AuthService) => 
  new AuthMiddleware(authService).checkActiveUser;

// ================================================
// MIDDLEWARE COMPOSITION HELPER
// ================================================

/**
 * Compose multiple auth middlewares
 */
export function composeAuthMiddleware(
  authService: AuthService,
  options: {
    requireAuth?: boolean;
    requireSession?: boolean;
    checkActive?: boolean;
    logRequests?: boolean;
  } = {}
) {
  const middleware = new AuthMiddleware(authService);
  const middlewares: Array<(req: Request, res: Response, next: NextFunction) => void> = [];

  // Add authentication
  if (options.requireAuth !== false) {
    middlewares.push(middleware.authenticate);
  } else {
    middlewares.push(middleware.optionalAuthenticate);
  }

  // Add session validation
  if (options.requireSession) {
    middlewares.push(middleware.validateSession);
  }

  // Add active user check
  if (options.checkActive !== false) {
    middlewares.push(middleware.checkActiveUser);
  }

  // Add request logging
  if (options.logRequests) {
    middlewares.push(middleware.logAuthenticatedRequest);
  }

  // Add token expiration check
  middlewares.push(middleware.checkTokenExpiration);

  return middlewares;
}

export default AuthMiddleware;
