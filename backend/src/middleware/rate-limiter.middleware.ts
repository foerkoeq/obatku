/**
 * Rate Limiter Middleware
 * Provides rate limiting functionality for API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../shared/utils/response.util';

export interface RateLimitOptions {
  windowMs: number;  // Time window in milliseconds
  max: number;        // Maximum requests per window
  message?: string;   // Custom error message
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean;     // Skip counting failed requests
}

// In-memory store for rate limiting (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiter middleware factory
 */
export const rateLimiter = (options: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.ip || 'unknown';
      const now = Date.now();
      const windowStart = now - options.windowMs;

      // Get current request count for this IP
      const current = requestCounts.get(key);
      
      if (!current || current.resetTime < now) {
        // First request in this window or window expired
        requestCounts.set(key, {
          count: 1,
          resetTime: now + options.windowMs
        });
        return next();
      }

      if (current.count >= options.max) {
        // Rate limit exceeded
        const message = options.message || 'Too many requests from this IP';
        return ResponseUtil.tooManyRequests(res, message, {
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        });
      }

      // Increment request count
      current.count++;
      requestCounts.set(key, current);
      
      next();
    } catch (error) {
      // If rate limiting fails, allow the request to proceed
      console.error('Rate limiter error:', error);
      next();
    }
  };
};

/**
 * Strict rate limiter for sensitive endpoints
 */
export const strictRateLimiter = (options: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `${req.ip}-${req.path}`;
      const now = Date.now();
      const windowStart = now - options.windowMs;

      const current = requestCounts.get(key);
      
      if (!current || current.resetTime < now) {
        requestCounts.set(key, {
          count: 1,
          resetTime: now + options.windowMs
        });
        return next();
      }

      if (current.count >= options.max) {
        const message = options.message || 'Rate limit exceeded for this endpoint';
        return ResponseUtil.tooManyRequests(res, message, {
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        });
      }

      current.count++;
      requestCounts.set(key, current);
      
      next();
    } catch (error) {
      console.error('Strict rate limiter error:', error);
      next();
    }
  };
};

/**
 * User-specific rate limiter (for authenticated endpoints)
 */
export const userRateLimiter = (options: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.ip || 'unknown';
      const key = `user-${userId}`;
      const now = Date.now();
      const windowStart = now - options.windowMs;

      const current = requestCounts.get(key);
      
      if (!current || current.resetTime < now) {
        requestCounts.set(key, {
          count: 1,
          resetTime: now + options.windowMs
        });
        return next();
      }

      if (current.count >= options.max) {
        const message = options.message || 'Too many requests from this user';
        return ResponseUtil.tooManyRequests(res, message, {
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        });
      }

      current.count++;
      requestCounts.set(key, current);
      
      next();
    } catch (error) {
      console.error('User rate limiter error:', error);
      next();
    }
  };
};

/**
 * Clean up expired rate limit records
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (value.resetTime < now) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean up every minute
