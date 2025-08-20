// ======================================
// SECURITY HEADERS MODULE
// ======================================
// Comprehensive security headers implementation

import { Request, Response, NextFunction } from 'express';
import { SecurityHeadersConfig } from '../types/security.types';

export class SecurityHeaders {
  private config: SecurityHeadersConfig;

  constructor(config: SecurityHeadersConfig) {
    this.config = config;
  }

  /**
   * Apply all security headers middleware
   */
  applyHeaders() {
    return (_req: Request, res: Response, next: NextFunction) => {
      this.setContentSecurityPolicy(res);
      this.setHSTS(res);
      this.setFrameOptions(res);
      this.setContentTypeOptions(res);
      this.setXSSProtection(res);
      this.setReferrerPolicy(res);
      this.setPermissionsPolicy(res);
      this.setAdditionalHeaders(res);
      next();
    };
  }

  /**
   * Set Content Security Policy
   */
  private setContentSecurityPolicy(res: Response): void {
    const csp = this.config.contentSecurityPolicy;
    const directives = Object.entries(csp.directives)
      .map(([directive, sources]) => `${this.camelToKebab(directive)} ${sources.join(' ')}`)
      .join('; ');

    const headerName = csp.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
    res.setHeader(headerName, directives);

    // Add report URI if specified
    if (csp.reportUri) {
      const reportDirective = `report-uri ${csp.reportUri}`;
      res.setHeader(headerName, `${directives}; ${reportDirective}`);
    }
  }

  /**
   * Set HTTP Strict Transport Security
   */
  private setHSTS(res: Response): void {
    const hsts = this.config.hsts;
    let hstsValue = `max-age=${hsts.maxAge}`;

    if (hsts.includeSubDomains) {
      hstsValue += '; includeSubDomains';
    }

    if (hsts.preload) {
      hstsValue += '; preload';
    }

    res.setHeader('Strict-Transport-Security', hstsValue);
  }

  /**
   * Set X-Frame-Options
   */
  private setFrameOptions(res: Response): void {
    res.setHeader('X-Frame-Options', this.config.frameOptions);
  }

  /**
   * Set X-Content-Type-Options
   */
  private setContentTypeOptions(res: Response): void {
    if (this.config.contentTypeOptions) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }

  /**
   * Set X-XSS-Protection
   */
  private setXSSProtection(res: Response): void {
    if (this.config.xssProtection) {
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }
  }

  /**
   * Set Referrer-Policy
   */
  private setReferrerPolicy(res: Response): void {
    res.setHeader('Referrer-Policy', this.config.referrerPolicy);
  }

  /**
   * Set Permissions-Policy
   */
  private setPermissionsPolicy(res: Response): void {
    const permissions = Object.entries(this.config.permissionsPolicy)
      .map(([feature, allowlist]) => {
        if (allowlist.length === 0) {
          return `${feature}=()`;
        }
        return `${feature}=(${allowlist.join(' ')})`;
      })
      .join(', ');

    if (permissions) {
      res.setHeader('Permissions-Policy', permissions);
    }
  }

  /**
   * Set additional security headers
   */
  private setAdditionalHeaders(res: Response): void {
    // Remove server information
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', 'Obatku-API');

    // Cache control for sensitive data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // Cross-Origin headers
    res.setHeader('Cross-Origin-Embedder-Policy', this.config.crossOriginEmbedderPolicy);
    res.setHeader('Cross-Origin-Opener-Policy', this.config.crossOriginOpenerPolicy);
    res.setHeader('Cross-Origin-Resource-Policy', this.config.crossOriginResourcePolicy);

    // Origin Agent Cluster
    if (this.config.originAgentCluster) {
      res.setHeader('Origin-Agent-Cluster', '?1');
    }

    // Additional security headers
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    // Set custom headers
    Object.entries(this.config.customHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  }

  /**
   * Convert camelCase to kebab-case for CSP directives
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Create CSP middleware for specific routes
   */
  static createCSPForRoute(directives: Record<string, string[]>) {
    return (_req: Request, res: Response, next: NextFunction) => {
      const directiveString = Object.entries(directives)
        .map(([directive, sources]) => `${directive.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()} ${sources.join(' ')}`)
        .join('; ');

      res.setHeader('Content-Security-Policy', directiveString);
      next();
    };
  }

  /**
   * Create middleware for file upload routes
   */
  static createUploadHeaders() {
    return (_req: Request, res: Response, next: NextFunction) => {
      // Stricter CSP for upload endpoints
      res.setHeader('Content-Security-Policy', "default-src 'none'; form-action 'self';");
      
      // Additional upload security
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      
      next();
    };
  }

  /**
   * Create middleware for API endpoints
   */
  static createAPIHeaders() {
    return (_req: Request, res: Response, next: NextFunction) => {
      // API-specific headers
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-store');
      
      next();
    };
  }

  /**
   * Create middleware for authentication routes
   */
  static createAuthHeaders() {
    return (_req: Request, res: Response, next: NextFunction) => {
      // Strict security for auth endpoints
      res.setHeader('Content-Security-Policy', "default-src 'none'; form-action 'self';");
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      
      next();
    };
  }
}

// Security headers factory
export class SecurityHeadersFactory {
  /**
   * Create headers for production environment
   */
  static forProduction(): SecurityHeaders {
    const config: SecurityHeadersConfig = {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"]
        },
        reportOnly: false
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      frameOptions: 'DENY',
      contentTypeOptions: true,
      xssProtection: true,
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
        'usb': [],
        'magnetometer': [],
        'gyroscope': [],
        'accelerometer': []
      },
      crossOriginEmbedderPolicy: 'require-corp',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginResourcePolicy: 'same-origin',
      originAgentCluster: true,
      customHeaders: {
        'X-DNS-Prefetch-Control': 'off',
        'X-Download-Options': 'noopen',
        'X-Permitted-Cross-Domain-Policies': 'none'
      }
    };

    return new SecurityHeaders(config);
  }

  /**
   * Create headers for development environment
   */
  static forDevelopment(): SecurityHeaders {
    const config: SecurityHeadersConfig = {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          connectSrc: ["'self'", "ws:", "wss:"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        },
        reportOnly: true // Report only in development
      },
      hsts: {
        maxAge: 3600, // 1 hour in development
        includeSubDomains: false,
        preload: false
      },
      frameOptions: 'SAMEORIGIN',
      contentTypeOptions: true,
      xssProtection: true,
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: []
      },
      crossOriginEmbedderPolicy: 'unsafe-none',
      crossOriginOpenerPolicy: 'unsafe-none',
      crossOriginResourcePolicy: 'cross-origin',
      originAgentCluster: false,
      customHeaders: {
        'X-DNS-Prefetch-Control': 'off',
        'X-Download-Options': 'noopen'
      }
    };

    return new SecurityHeaders(config);
  }

  /**
   * Create custom headers
   */
  static custom(config: SecurityHeadersConfig): SecurityHeaders {
    return new SecurityHeaders(config);
  }
}
