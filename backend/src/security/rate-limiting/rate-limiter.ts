// ======================================
// RATE LIMITING MODULE
// ======================================
// Advanced rate limiting dengan multiple strategies

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Request, Response } from 'express';
import { RateLimitConfig, RateLimitResult, SecurityViolation, ViolationType, RiskLevel } from '../types/security.types';

export class RateLimiter {
  private config: RateLimitConfig;
  private store?: any;

  constructor(config: RateLimitConfig, redisClient?: any) {
    this.config = config;
    if (redisClient) {
      this.store = new RedisStore({
        sendCommand: (...args: string[]) => redisClient.call(...args),
      });
    }
  }

  /**
   * Create basic rate limiter middleware
   */
  createBasicLimiter() {
    return rateLimit({
      windowMs: this.config.windowMs,
      max: this.config.maxRequests,
      standardHeaders: this.config.standardHeaders,
      legacyHeaders: this.config.legacyHeaders,
      store: this.store,
      keyGenerator: this.config.keyGenerator || this.defaultKeyGenerator,
      handler: this.config.handler || this.defaultHandler,
      skipSuccessfulRequests: this.config.skipSuccessfulRequests,
      skipFailedRequests: this.config.skipFailedRequests
    });
  }

  /**
   * Create authentication rate limiter (stricter)
   */
  createAuthLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      standardHeaders: true,
      legacyHeaders: false,
      store: this.store,
      keyGenerator: (req: Request) => {
        // Kombinasi IP + email untuk lebih spesifik
        const email = req.body?.email || 'anonymous';
        return `auth_${req.ip || 'unknown'}_${email}`;
      },
      handler: (req: Request, res: Response) => {
        const violation: SecurityViolation = {
          type: ViolationType.BRUTE_FORCE_ATTEMPT,
          severity: RiskLevel.HIGH,
          description: `Authentication rate limit exceeded from IP: ${req.ip || 'unknown'}`,
          action: 'Request blocked',
          timestamp: new Date()
        };

        this.logSecurityViolation(violation, req);

        res.status(429).json({
          error: 'Too many authentication attempts',
          message: 'Please try again later',
          retryAfter: Math.round(this.config.windowMs / 1000)
        });
      }
    });
  }

  /**
   * Create API rate limiter (per endpoint)
   */
  createAPILimiter(endpoint: string, maxRequests: number = 100) {
    return rateLimit({
      windowMs: this.config.windowMs,
      max: maxRequests,
      standardHeaders: true,
      legacyHeaders: false,
      store: this.store,
      keyGenerator: (req: Request) => `api_${endpoint}_${req.ip || 'unknown'}`,
      handler: (_req: Request, res: Response) => {
        res.status(429).json({
          error: 'API rate limit exceeded',
          endpoint,
          message: 'Too many requests to this endpoint',
          retryAfter: Math.round(this.config.windowMs / 1000)
        });
      }
    });
  }

  /**
   * Create file upload rate limiter
   */
  createUploadLimiter() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 uploads per hour
      standardHeaders: true,
      legacyHeaders: false,
      store: this.store,
      keyGenerator: (req: Request) => `upload_${req.ip || 'unknown'}`,
      handler: (_req: Request, res: Response) => {
        res.status(429).json({
          error: 'Upload rate limit exceeded',
          message: 'Too many file uploads. Please try again later',
          retryAfter: 3600 // 1 hour
        });
      }
    });
  }

  /**
   * Create progressive rate limiter (increases penalty on repeated violations)
   */
  createProgressiveLimiter() {
    const violationCounts = new Map<string, number>();

    return rateLimit({
      windowMs: this.config.windowMs,
      max: (req: Request) => {
        const key = req.ip || 'unknown';
        const violations = violationCounts.get(key) || 0;
        
        // Reduce allowed requests based on previous violations
        if (violations >= 3) return Math.max(1, this.config.maxRequests * 0.1); // 10% of normal
        if (violations >= 2) return Math.max(5, this.config.maxRequests * 0.3); // 30% of normal
        if (violations >= 1) return Math.max(10, this.config.maxRequests * 0.5); // 50% of normal
        
        return this.config.maxRequests;
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: this.store,
      handler: (req: Request, res: Response) => {
        const key = req.ip || 'unknown';
        const currentCount = violationCounts.get(key) || 0;
        violationCounts.set(key, currentCount + 1);

        // Clean up old violations after 24 hours
        setTimeout(() => {
          const newCount = violationCounts.get(key) || 0;
          if (newCount > 0) {
            violationCounts.set(key, newCount - 1);
          }
        }, 24 * 60 * 60 * 1000);

        res.status(429).json({
          error: 'Progressive rate limit exceeded',
          message: 'Too many violations. Your limit has been reduced.',
          retryAfter: Math.round(this.config.windowMs / 1000)
        });
      }
    });
  }

  /**
   * Create smart rate limiter (adapts based on user behavior)
   */
  createSmartLimiter() {
    const userProfiles = new Map<string, { 
      trustScore: number; 
      lastViolation: Date | null; 
      successfulRequests: number;
    }>();

    return rateLimit({
      windowMs: this.config.windowMs,
      max: (req: Request) => {
        const key = this.getUserKey(req);
        const profile = userProfiles.get(key) || { 
          trustScore: 100, 
          lastViolation: null, 
          successfulRequests: 0 
        };

        // Adjust limit based on trust score
        const multiplier = profile.trustScore / 100;
        return Math.max(1, Math.round(this.config.maxRequests * multiplier));
      },
      keyGenerator: (req: Request) => this.getUserKey(req),
      handler: (req: Request, res: Response) => {
        const key = this.getUserKey(req);
        const profile = userProfiles.get(key) || { 
          trustScore: 100, 
          lastViolation: null, 
          successfulRequests: 0 
        };

        // Decrease trust score
        profile.trustScore = Math.max(10, profile.trustScore - 20);
        profile.lastViolation = new Date();
        userProfiles.set(key, profile);

        res.status(429).json({
          error: 'Smart rate limit exceeded',
          message: 'Your trust score has been reduced due to violations.',
          retryAfter: Math.round(this.config.windowMs / 1000)
        });
      },
      skip: (req: Request) => {
        // Skip rate limiting for highly trusted users
        const key = this.getUserKey(req);
        const profile = userProfiles.get(key);
        return (profile?.trustScore ?? 0) >= 90 && (profile?.successfulRequests ?? 0) > 100;
      }
    });
  }

  /**
   * Check rate limit status for a key
   */
  async checkRateLimit(_key: string): Promise<RateLimitResult> {
    // Implementation depends on store type
    // This is a placeholder for manual rate limit checking
    return {
      allowed: true,
      remaining: this.config.maxRequests,
      resetTime: new Date(Date.now() + this.config.windowMs),
      totalHits: 0,
      limitType: 'general',
      penaltyLevel: 0,
      isWhitelisted: false,
      isBlacklisted: false
    };
  }

  /**
   * Reset rate limit for a key (admin function)
   */
  async resetRateLimit(key: string): Promise<void> {
    if (this.store && this.store.resetKey) {
      await this.store.resetKey(key);
    }
  }

  /**
   * Get user identifier for rate limiting
   */
  private getUserKey(req: Request): string {
    // Priority: User ID > Email > IP
    if (req.user?.id) return `user_${req.user.id}`;
    if (req.body?.email) return `email_${req.body.email}`;
    return `ip_${req.ip || 'unknown'}`;
  }

  /**
   * Default key generator
   */
  private defaultKeyGenerator = (req: Request): string => {
    return req.ip || 'unknown';
  };

  /**
   * Default rate limit handler
   */
  private defaultHandler = (req: Request, res: Response): void => {
    const violation: SecurityViolation = {
      type: ViolationType.RATE_LIMIT_EXCEEDED,
      severity: RiskLevel.MEDIUM,
      description: `Rate limit exceeded from IP: ${req.ip || 'unknown'}`,
      action: 'Request blocked',
      timestamp: new Date()
    };

    this.logSecurityViolation(violation, req);

    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(this.config.windowMs / 1000)
    });
  };

  /**
   * Log security violation
   */
  private logSecurityViolation(violation: SecurityViolation, req: Request): void {
    console.error('Security Violation:', {
      ...violation,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });

    // Here you could send to logging service, database, etc.
  }
}

// Rate limiter factory with common presets
export class RateLimiterFactory {
  /**
   * Create rate limiter for general API usage
   */
  static createGeneral(config: RateLimitConfig, redisClient?: any): RateLimiter {
    return new RateLimiter(config, redisClient);
  }

  /**
   * Create strict rate limiter for sensitive operations
   */
  static createStrict(redisClient?: any): RateLimiter {
    const config: RateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      standardHeaders: true,
      legacyHeaders: false,
      enableProgressiveLimiting: false,
      progressivePenalty: 0,
      enableSmartLimiting: false,
      whitelistIPs: [],
      blacklistIPs: [],
      authWindowMs: 15 * 60 * 1000,
      authMaxRequests: 5,
      apiWindowMs: 15 * 60 * 1000,
      apiMaxRequests: 100,
      uploadWindowMs: 60 * 60 * 1000,
      uploadMaxRequests: 10
    };
    return new RateLimiter(config, redisClient);
  }

  /**
   * Create lenient rate limiter for development
   */
  static createLenient(redisClient?: any): RateLimiter {
    const config: RateLimitConfig = {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 1000,
      skipSuccessfulRequests: true,
      skipFailedRequests: false,
      standardHeaders: true,
      legacyHeaders: false,
      enableProgressiveLimiting: false,
      progressivePenalty: 0,
      enableSmartLimiting: false,
      whitelistIPs: [],
      blacklistIPs: [],
      authWindowMs: 15 * 60 * 1000,
      authMaxRequests: 5,
      apiWindowMs: 60 * 1000,
      apiMaxRequests: 1000,
      uploadWindowMs: 60 * 60 * 1000,
      uploadMaxRequests: 10
    };
    return new RateLimiter(config, redisClient);
  }
}
