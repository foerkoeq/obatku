// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ResponseUtil } from '../shared/utils/response.util';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      ResponseUtil.unauthenticated(res, 'Access token is required');
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
    
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid token';
    
    if (errorMessage.includes('expired')) {
      ResponseUtil.error(res, 'TOKEN_EXPIRED', 'Token has expired', null, 401);
    } else if (errorMessage.includes('invalid')) {
      ResponseUtil.error(res, 'INVALID_TOKEN', 'Invalid token', null, 401);
    } else {
      ResponseUtil.unauthenticated(res, 'Authentication failed');
    }
  }
};

/**
 * Optional authentication middleware
 * Tries to authenticate but doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without user
      next();
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    next();
  } catch (error) {
    // Token is invalid, but don't fail - continue without user
    next();
  }
};

/**
 * Generate JWT token utility
 */
export const generateToken = (payload: JwtPayload): string => {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Refresh token utility
 */
export const refreshToken = (req: Request, res: Response): void => {
  try {
    if (!req.user) {
      ResponseUtil.unauthenticated(res, 'User not authenticated');
      return;
    }

    const newToken = generateToken({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name
    });

    ResponseUtil.success(res, { 
      token: newToken,
      user: req.user 
    }, 'Token refreshed successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
    ResponseUtil.internalError(res, errorMessage);
  }
};
