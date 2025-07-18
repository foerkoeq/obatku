// ================================
// API SECURITY MIDDLEWARE
// ================================

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { ApiResponseUtil } from './api-response.util';

/**
 * Rate Limiting Configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

/**
 * CORS Configuration
 */
export interface CorsConfig {
  origin?: string | string[] | boolean | RegExp | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

/**
 * Helmet Security Configuration
 */
export interface SecurityConfig {
  contentSecurityPolicy?: boolean | any;
  crossOriginEmbedderPolicy?: boolean;
  crossOriginOpenerPolicy?: boolean;
  crossOriginResourcePolicy?: boolean | { policy: "cross-origin" | "same-origin" | "same-site" };
  dnsPrefetchControl?: boolean | { allow: boolean };
  frameguard?: boolean | { action: "deny" | "sameorigin" };
  hidePoweredBy?: boolean;
  hsts?: boolean | any;
  ieNoOpen?: boolean;
  noSniff?: boolean;
  originAgentCluster?: boolean;
  permittedCrossDomainPolicies?: boolean | { permittedPolicies: "none" | "master-only" | "by-content-type" | "all" };
  referrerPolicy?: boolean | { policy: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url" | ("no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url")[] };
  xssFilter?: boolean;
}

/**
 * API Key Configuration
 */
export interface ApiKeyConfig {
  header: string; // Header name for API key
  validKeys: string[]; // Array of valid API keys
  required: boolean; // Whether API key is required
}

/**
 * Enhanced API Security Utility
 * Provides comprehensive security middleware for API endpoints
 */
export class ApiSecurityUtil {
  /**
   * Create rate limiting middleware
   */
  static createRateLimit(config: RateLimitConfig) {
    return rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: config.message || 'Too many requests from this IP, please try again later',
      standardHeaders: config.standardHeaders ?? true,
      legacyHeaders: config.legacyHeaders ?? false,
      skipSuccessfulRequests: config.skipSuccessfulRequests ?? false,
      skipFailedRequests: config.skipFailedRequests ?? false,
      keyGenerator: config.keyGenerator || ((req: Request) => req.ip || 'unknown'),
      handler: (req: Request, res: Response) => {
        const retryAfter = Math.round(config.windowMs / 1000);
        ApiResponseUtil.tooManyRequests(res, config.message, {
          requestId: req.headers['x-request-id'] as string,
          path: req.path,
          method: req.method,
          retryAfter
        });
      }
    });
  }

  /**
   * Create CORS middleware
   */
  static createCors(config: CorsConfig) {
    return cors({
      origin: config.origin || true,
      methods: config.methods || ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: config.allowedHeaders || [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
        'X-Request-ID'
      ],
      exposedHeaders: config.exposedHeaders || ['X-Request-ID', 'X-Rate-Limit-Remaining'],
      credentials: config.credentials ?? true,
      maxAge: config.maxAge || 86400, // 24 hours
      preflightContinue: config.preflightContinue ?? false,
      optionsSuccessStatus: config.optionsSuccessStatus || 204
    });
  }

  /**
   * Create security headers middleware (Helmet)
   */
  static createSecurityHeaders(config: SecurityConfig = {}) {
    return helmet({
      contentSecurityPolicy: config.contentSecurityPolicy ?? {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: config.crossOriginEmbedderPolicy ?? false,
      crossOriginOpenerPolicy: config.crossOriginOpenerPolicy ?? true,
      crossOriginResourcePolicy: config.crossOriginResourcePolicy ?? { policy: "cross-origin" },
      dnsPrefetchControl: config.dnsPrefetchControl ?? { allow: false },
      frameguard: config.frameguard ?? { action: 'deny' },
      hidePoweredBy: config.hidePoweredBy ?? true,
      hsts: config.hsts ?? {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      ieNoOpen: config.ieNoOpen ?? true,
      noSniff: config.noSniff ?? true,
      originAgentCluster: config.originAgentCluster ?? true,
      permittedCrossDomainPolicies: config.permittedCrossDomainPolicies ?? { permittedPolicies: "none" },
      referrerPolicy: config.referrerPolicy ?? { policy: "no-referrer" },
      xssFilter: config.xssFilter ?? true
    });
  }

  /**
   * Create API key validation middleware
   */
  static createApiKeyValidator(config: ApiKeyConfig): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const apiKey = req.headers[config.header.toLowerCase()] as string;

      if (config.required && !apiKey) {
        ApiResponseUtil.unauthorized(res, 'API key is required', {
          requestId: req.headers['x-request-id'] as string,
          path: req.path,
          method: req.method
        });
        return;
      }

      if (apiKey && !config.validKeys.includes(apiKey)) {
        ApiResponseUtil.unauthorized(res, 'Invalid API key', {
          requestId: req.headers['x-request-id'] as string,
          path: req.path,
          method: req.method
        });
        return;
      }

      next();
    };
  }

  /**
   * Create request ID middleware
   */
  static createRequestId(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const requestId = req.headers['x-request-id'] as string || 
                       req.headers['x-correlation-id'] as string ||
                       this.generateRequestId();
      
      req.headers['x-request-id'] = requestId;
      res.setHeader('X-Request-ID', requestId);
      
      next();
    };
  }

  /**
   * Create request logging middleware
   */
  static createRequestLogger(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const requestId = req.headers['x-request-id'] as string;

      // Log request
      console.log(`[${new Date().toISOString()}] ${requestId} ${req.method} ${req.path} - Request started`);

      // Override res.json to log response
      const originalJson = res.json;
      res.json = function(obj: any) {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${requestId} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
        return originalJson.call(this, obj);
      };

      next();
    };
  }

  /**
   * Create input sanitization middleware
   */
  static createInputSanitizer(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, _res: Response, next: NextFunction) => {
      // Sanitize query parameters
      if (req.query) {
        req.query = this.sanitizeObject(req.query);
      }

      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = this.sanitizeObject(req.body);
      }

      next();
    };
  }

  /**
   * Create content type validation middleware
   */
  static createContentTypeValidator(allowedTypes: string[] = ['application/json']): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];
        
        if (!contentType) {
          ApiResponseUtil.badRequest(res, 'Content-Type header is required', null, {
            requestId: req.headers['x-request-id'] as string,
            path: req.path,
            method: req.method
          });
          return;
        }

        const isAllowed = allowedTypes.some(type => 
          contentType.toLowerCase().includes(type.toLowerCase())
        );

        if (!isAllowed) {
          ApiResponseUtil.badRequest(res, `Unsupported Content-Type. Allowed types: ${allowedTypes.join(', ')}`, null, {
            requestId: req.headers['x-request-id'] as string,
            path: req.path,
            method: req.method
          });
          return;
        }
      }

      next();
    };
  }

  /**
   * Create IP whitelist middleware
   */
  static createIpWhitelist(allowedIps: string[]): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string;
      
      if (!clientIp || !allowedIps.includes(clientIp)) {
        ApiResponseUtil.forbidden(res, 'Access denied from this IP address', {
          requestId: req.headers['x-request-id'] as string,
          path: req.path,
          method: req.method
        });
        return;
      }

      next();
    };
  }

  /**
   * Create request size limiter middleware
   */
  static createRequestSizeLimiter(maxSize: string = '10mb'): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const contentLength = req.headers['content-length'];
      
      if (contentLength) {
        const maxBytes = this.parseSize(maxSize);
        const requestSize = parseInt(contentLength);
        
        if (requestSize > maxBytes) {
          ApiResponseUtil.badRequest(res, `Request size exceeds maximum allowed size of ${maxSize}`, null, {
            requestId: req.headers['x-request-id'] as string,
            path: req.path,
            method: req.method
          });
          return;
        }
      }

      next();
    };
  }

  /**
   * Create comprehensive security middleware stack
   */
  static createSecurityStack(options: {
    rateLimit?: RateLimitConfig;
    cors?: CorsConfig;
    security?: SecurityConfig;
    apiKey?: ApiKeyConfig;
    enableRequestId?: boolean;
    enableLogging?: boolean;
    enableSanitization?: boolean;
    contentTypes?: string[];
    ipWhitelist?: string[];
    maxRequestSize?: string;
  } = {}) {
    const middlewares: any[] = [];

    // Security headers (always first)
    middlewares.push(this.createSecurityHeaders(options.security));

    // CORS
    middlewares.push(this.createCors(options.cors || {}));

    // Request ID
    if (options.enableRequestId !== false) {
      middlewares.push(this.createRequestId());
    }

    // Request logging
    if (options.enableLogging) {
      middlewares.push(this.createRequestLogger());
    }

    // Rate limiting
    if (options.rateLimit) {
      middlewares.push(this.createRateLimit(options.rateLimit));
    }

    // IP whitelist
    if (options.ipWhitelist && options.ipWhitelist.length > 0) {
      middlewares.push(this.createIpWhitelist(options.ipWhitelist));
    }

    // Request size limiter
    if (options.maxRequestSize) {
      middlewares.push(this.createRequestSizeLimiter(options.maxRequestSize));
    }

    // Content type validation
    if (options.contentTypes) {
      middlewares.push(this.createContentTypeValidator(options.contentTypes));
    }

    // Input sanitization
    if (options.enableSanitization !== false) {
      middlewares.push(this.createInputSanitizer());
    }

    // API key validation
    if (options.apiKey) {
      middlewares.push(this.createApiKeyValidator(options.apiKey));
    }

    return middlewares;
  }

  /**
   * Generate unique request ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize object by removing potentially dangerous characters
   */
  private static sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Parse size string to bytes
   */
  private static parseSize(size: string): number {
    const units: Record<string, number> = {
      b: 1,
      kb: 1024,
      mb: 1024 * 1024,
      gb: 1024 * 1024 * 1024
    };

    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
    if (!match) {
      throw new Error(`Invalid size format: ${size}`);
    }

    const [, value, unit = 'b'] = match;
    return parseFloat(value) * units[unit];
  }
}

export default ApiSecurityUtil;
