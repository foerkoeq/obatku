/**
 * Rate Limiter Middleware
 * 
 * Express middleware for rate limiting specific to authentication operations:
 * - Login attempt protection
 * - Token refresh limiting
 * - Password change/reset protection
 * - General API rate limiting
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// ================================================
// RATE LIMITER CONFIGURATIONS
// ================================================

/**
 * Login attempt rate limiter
 * Protects against brute force attacks
 */
export const loginAttempt = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by IP address
    return req.ip || 'unknown';
  },
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
    code: 'TOO_MANY_LOGIN_ATTEMPTS',
    retryAfter: 15 * 60, // seconds
  },
  handler: (req: Request, res: Response) => {
    console.warn(`Login rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      retryAfter: 15 * 60,
    });
  },
  skip: (_req: Request) => {
    // Skip rate limiting for health checks or specific IPs if needed
    return false;
  },
});

/**
 * Token refresh rate limiter
 * Prevents token refresh abuse
 */
export const tokenRefresh = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 refresh attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by IP address
    return req.ip || 'unknown';
  },
  message: {
    success: false,
    message: 'Terlalu banyak permintaan refresh token. Silakan coba lagi dalam 5 menit.',
    code: 'TOO_MANY_REFRESH_ATTEMPTS',
    retryAfter: 5 * 60,
  },
  handler: (req: Request, res: Response) => {
    console.warn(`Token refresh rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak permintaan refresh token. Silakan coba lagi dalam 5 menit.',
      code: 'TOO_MANY_REFRESH_ATTEMPTS',
      retryAfter: 5 * 60,
    });
  },
});

/**
 * Password change rate limiter
 * Prevents password change abuse
 */
export const passwordChange = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 password changes per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by user ID if available, otherwise by IP
    const user = (req as any).user;
    return user?.id || req.ip || 'unknown';
  },
  message: {
    success: false,
    message: 'Terlalu banyak percobaan ubah password. Silakan coba lagi dalam 15 menit.',
    code: 'TOO_MANY_PASSWORD_CHANGES',
    retryAfter: 15 * 60,
  },
  handler: (req: Request, res: Response) => {
    const user = (req as any).user;
    console.warn(`Password change rate limit exceeded for user: ${user?.id || 'unknown'}, IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan ubah password. Silakan coba lagi dalam 15 menit.',
      code: 'TOO_MANY_PASSWORD_CHANGES',
      retryAfter: 15 * 60,
    });
  },
});

/**
 * Password reset rate limiter
 * Prevents password reset abuse
 */
export const passwordReset = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 password resets per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by user ID if available, otherwise by IP
    const user = (req as any).user;
    return user?.id || req.ip || 'unknown';
  },
  message: {
    success: false,
    message: 'Terlalu banyak percobaan reset password. Silakan coba lagi dalam 30 menit.',
    code: 'TOO_MANY_PASSWORD_RESETS',
    retryAfter: 30 * 60,
  },
  handler: (req: Request, res: Response) => {
    const user = (req as any).user;
    console.warn(`Password reset rate limit exceeded for user: ${user?.id || 'unknown'}, IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan reset password. Silakan coba lagi dalam 30 menit.',
      code: 'TOO_MANY_PASSWORD_RESETS',
      retryAfter: 30 * 60,
    });
  },
});

/**
 * General API rate limiter
 * General protection for all API endpoints
 */
export const generalApi = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by IP address
    return req.ip || 'unknown';
  },
  message: {
    success: false,
    message: 'Terlalu banyak permintaan API. Silakan coba lagi nanti.',
    code: 'TOO_MANY_REQUESTS',
    retryAfter: 15 * 60,
  },
  handler: (req: Request, res: Response) => {
    console.warn(`General API rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak permintaan API. Silakan coba lagi nanti.',
      code: 'TOO_MANY_REQUESTS',
      retryAfter: 15 * 60,
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
});

/**
 * Strict rate limiter for sensitive operations
 * Extra protection for admin operations
 */
export const strictApi = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by user ID if available, otherwise by IP
    const user = (req as any).user;
    return user?.id || req.ip || 'unknown';
  },
  message: {
    success: false,
    message: 'Terlalu banyak permintaan untuk operasi sensitif. Silakan coba lagi dalam 1 jam.',
    code: 'TOO_MANY_SENSITIVE_REQUESTS',
    retryAfter: 60 * 60,
  },
  handler: (req: Request, res: Response) => {
    const user = (req as any).user;
    console.warn(`Strict API rate limit exceeded for user: ${user?.id || 'unknown'}, IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak permintaan untuk operasi sensitif. Silakan coba lagi dalam 1 jam.',
      code: 'TOO_MANY_SENSITIVE_REQUESTS',
      retryAfter: 60 * 60,
    });
  },
});

// ================================================
// DYNAMIC RATE LIMITERS
// ================================================

/**
 * Create custom rate limiter
 */
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
  code: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req: Request) => req.ip || 'unknown'),
    message: {
      success: false,
      message: options.message,
      code: options.code,
      retryAfter: Math.floor(options.windowMs / 1000),
    },
    handler: (req: Request, res: Response) => {
      console.warn(`Rate limit exceeded: ${options.code}, IP: ${req.ip}, Path: ${req.path}`);
      res.status(429).json({
        success: false,
        message: options.message,
        code: options.code,
        retryAfter: Math.floor(options.windowMs / 1000),
      });
    },
    skip: options.skip,
  });
}

/**
 * User-specific rate limiter
 * Rate limit based on authenticated user
 */
export function createUserRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
  code: string;
}) {
  return createRateLimiter({
    ...options,
    keyGenerator: (req: Request) => {
      const user = (req as any).user;
      return user?.id || req.ip || 'unknown';
    },
  });
}

/**
 * IP-based rate limiter
 * Rate limit based on IP address only
 */
export function createIpRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
  code: string;
}) {
  return createRateLimiter({
    ...options,
    keyGenerator: (req: Request) => req.ip || 'unknown',
  });
}

// ================================================
// RATE LIMITER UTILITIES
// ================================================

/**
 * Get current rate limit status for debugging
 */
export function getRateLimitStatus(req: Request): {
  limit?: number;
  remaining?: number;
  reset?: Date;
  retryAfter?: number;
} {
  const headers = req.res?.getHeaders() || {};
  
  return {
    limit: headers['x-ratelimit-limit'] as number,
    remaining: headers['x-ratelimit-remaining'] as number,
    reset: headers['x-ratelimit-reset'] ? new Date(headers['x-ratelimit-reset'] as number * 1000) : undefined,
    retryAfter: (() => {
      const retryAfter = headers['retry-after'];
      if (typeof retryAfter === 'string') return parseInt(retryAfter);
      if (typeof retryAfter === 'number') return retryAfter;
      return undefined;
    })(),
  };
}

/**
 * Check if request is rate limited
 */
export function isRateLimited(req: Request): boolean {
  const remaining = req.res?.getHeader('x-ratelimit-remaining') as number;
  return remaining !== undefined && remaining <= 0;
}

// ================================================
// MIDDLEWARE COMPOSITION
// ================================================

/**
 * Apply multiple rate limiters
 */
export function applyRateLimiters(...limiters: any[]) {
  return (req: Request, res: Response, next: any) => {
    let index = 0;

    function runNext(): void {
      if (index >= limiters.length) {
        next();
        return;
      }

      const limiter = limiters[index++];
      limiter(req, res, runNext);
    }

    runNext();
  };
}

// ================================================
// EXPORT RATE LIMITERS
// ================================================

export const rateLimiter = {
  loginAttempt,
  tokenRefresh,
  passwordChange,
  passwordReset,
  generalApi,
  strictApi,
  createRateLimiter,
  createUserRateLimiter,
  createIpRateLimiter,
  applyRateLimiters,
  getRateLimitStatus,
  isRateLimited,
};

export default rateLimiter;
