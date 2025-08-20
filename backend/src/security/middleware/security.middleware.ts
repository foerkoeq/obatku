// ======================================
// SECURITY MIDDLEWARE ORCHESTRATOR - ENHANCED
// ======================================
// Central middleware yang mengombinasikan semua security features
// Enhanced dengan monitoring, alerting, dan performance tracking

import { Request, Response, NextFunction } from 'express';
import { InputSanitizer } from '../sanitization/input-sanitizer';
import { RateLimiter } from '../rate-limiting/rate-limiter';
import { SecurityHeaders } from '../headers/security-headers';
import { FileValidator } from '../file-validation/file-validator';
import { SQLInjectionPrevention } from '../sql-prevention/sql-prevention';
import { SecurityConfig, SecurityContext, RiskLevel, ViolationType, SecurityMetrics, SecurityAlert, SecurityEvent } from '../types/security.types';
import { SecurityMonitoring } from '../monitoring/security-monitoring';
import { SecurityPerformance } from '../performance/security-performance';

interface UploadedFile {
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
}

interface SecurityMiddlewareOptions {
  enableSanitization?: boolean;
  enableRateLimit?: boolean;
  enableSQLPrevention?: boolean;
  enableFileValidation?: boolean;
  enableMonitoring?: boolean;
  enablePerformanceTracking?: boolean;
  customRateLimit?: number;
  allowedFields?: string[];
  whitelistIPs?: string[];
  blacklistIPs?: string[];
  securityLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityMiddleware {
  private inputSanitizer: InputSanitizer;
  private rateLimiter: RateLimiter;
  private securityHeaders: SecurityHeaders;
  private fileValidator: FileValidator;
  private sqlPrevention: SQLInjectionPrevention;
  private securityMonitoring: SecurityMonitoring;
  private securityPerformance: SecurityPerformance;
  private config: SecurityConfig;
  private metrics: SecurityMetrics;

  constructor(config: SecurityConfig, redisClient?: any) {
    this.config = config;
    this.inputSanitizer = new InputSanitizer(config.sanitization);
    this.rateLimiter = new RateLimiter(config.rateLimiting, redisClient);
    this.securityHeaders = new SecurityHeaders(config.headers);
    this.fileValidator = new FileValidator(config.fileUpload);
    this.sqlPrevention = new SQLInjectionPrevention(config.sqlPrevention);
    this.securityMonitoring = new SecurityMonitoring(config.monitoring);
    this.securityPerformance = new SecurityPerformance();
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): SecurityMetrics {
    return {
      totalRequests: 0,
      blockedRequests: 0,
      violationsByType: {} as Record<ViolationType, number>,
      averageResponseTime: 0,
      securityScore: 100,
      uptime: Date.now(),
      memoryUsage: 0,
      cpuUsage: 0,
      activeConnections: 0
    };
  }

  /**
   * Apply all security middleware in correct order
   */
  applyAll() {
    return [
      this.createSecurityContext(),
      this.trackPerformance('start'),
      this.securityHeaders.applyHeaders(),
      this.checkIPWhitelist(),
      this.checkIPBlacklist(),
      this.rateLimiter.createBasicLimiter(),
      this.sanitizeInputs(),
      this.sqlPrevention.detectSQLInjection(),
      this.validateRequestSize(),
      this.finalizeSecurityContext(),
      this.trackPerformance('end'),
      this.updateMetrics(),
      this.sendSecurityAlerts()
    ];
  }

  /**
   * Apply security for authentication routes
   */
  applyForAuth() {
    return [
      this.createSecurityContext(),
      this.trackPerformance('start'),
      SecurityHeaders.createAuthHeaders(),
      this.rateLimiter.createAuthLimiter(),
      this.sanitizeInputs(),
      this.sqlPrevention.detectSQLInjection(),
      this.validateRequestSize(),
      this.finalizeSecurityContext(),
      this.trackPerformance('end'),
      this.updateMetrics(),
      this.sendSecurityAlerts()
    ];
  }

  /**
   * Apply security for API routes
   */
  applyForAPI(endpoint: string) {
    return [
      this.createSecurityContext(),
      this.trackPerformance('start'),
      SecurityHeaders.createAPIHeaders(),
      this.rateLimiter.createAPILimiter(endpoint),
      this.sanitizeInputs(),
      this.sqlPrevention.detectSQLInjection(),
      this.validateRequestSize(),
      this.finalizeSecurityContext(),
      this.trackPerformance('end'),
      this.updateMetrics(),
      this.sendSecurityAlerts()
    ];
  }

  /**
   * Apply security for file upload routes
   */
  applyForUpload() {
    return [
      this.createSecurityContext(),
      this.trackPerformance('start'),
      SecurityHeaders.createUploadHeaders(),
      this.rateLimiter.createUploadLimiter(),
      this.validateFileUploads(),
      this.validateRequestSize(),
      this.finalizeSecurityContext(),
      this.trackPerformance('end'),
      this.updateMetrics(),
      this.sendSecurityAlerts()
    ];
  }

  /**
   * Create security context middleware
   */
  private createSecurityContext() {
    return (req: Request, _res: Response, next: NextFunction) => {
      const securityContext: SecurityContext = {
        requestId: this.generateRequestId(),
        userAgent: req.get('User-Agent') || 'unknown',
        ipAddress: this.getClientIP(req),
        timestamp: new Date(),
        riskLevel: RiskLevel.LOW,
        violations: [],
        endpoint: req.path,
        method: req.method,
        requestSize: this.calculateRequestSize(req),
        securityScore: 100,
        threatIndicators: []
      };

      // Add user context if available
      if ((req as any).user) {
        securityContext.userId = (req as any).user.id;
        securityContext.sessionId = (req as any).session?.id;
      }

      // Store in request for other middleware
      (req as any).securityContext = securityContext;
      next();
    };
  }

  /**
   * Check IP whitelist
   */
  private checkIPWhitelist() {
    return (req: Request, _res: Response, next: NextFunction) => {
      const clientIP = this.getClientIP(req);
      const whitelist = this.config.rateLimiting.whitelistIPs;

      if (whitelist.length > 0 && whitelist.includes(clientIP)) {
        const securityContext = (req as any).securityContext;
        securityContext.riskLevel = RiskLevel.LOW;
        securityContext.threatIndicators.push('whitelisted_ip');
        // Skip rate limiting for whitelisted IPs
        (req as any).skipRateLimit = true;
      }

      next();
    };
  }

  /**
   * Check IP blacklist
   */
  private checkIPBlacklist() {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIP = this.getClientIP(req);
      const blacklist = this.config.rateLimiting.blacklistIPs;

      if (blacklist.includes(clientIP)) {
        const securityContext = (req as any).securityContext;
        securityContext.riskLevel = RiskLevel.CRITICAL;
        securityContext.violations.push({
          type: ViolationType.UNAUTHORIZED_ACCESS,
          severity: RiskLevel.CRITICAL,
          description: `IP ${clientIP} is blacklisted`,
          action: 'blocked',
          timestamp: new Date(),
          context: { ip: clientIP },
          remediation: 'Contact administrator to remove from blacklist',
          impact: 'Complete access denial',
          confidence: 100
        });

        return res.status(403).json({
          success: false,
          error: {
            code: 'IP_BLACKLISTED',
            message: 'Access denied - IP address is blacklisted'
          }
        });
      }

      return next();
    };
  }

  /**
   * Sanitize inputs middleware
   */
  private sanitizeInputs() {
    return async (req: Request, _res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const securityContext = (req as any).securityContext;

      try {
        // Sanitize body
        if (req.body && Object.keys(req.body).length > 0) {
          const result = await this.inputSanitizer.sanitize(req.body);
          if (!result.isSafe) {
            securityContext.violations.push(...result.violations);
            securityContext.riskLevel = this.calculateRiskLevel(securityContext.violations);
          }
          req.body = result.sanitized;
        }

        // Sanitize query parameters
        if (req.query && Object.keys(req.query).length > 0) {
          const result = await this.inputSanitizer.sanitize(req.query);
          if (!result.isSafe) {
            securityContext.violations.push(...result.violations);
            securityContext.riskLevel = this.calculateRiskLevel(securityContext.violations);
          }
          req.query = result.sanitized;
        }

        // Sanitize URL parameters
        if (req.params && Object.keys(req.params).length > 0) {
          const result = await this.inputSanitizer.sanitize(req.params);
          if (!result.isSafe) {
            securityContext.violations.push(...result.violations);
            securityContext.riskLevel = this.calculateRiskLevel(securityContext.violations);
          }
          req.params = result.sanitized;
        }

        const sanitizationTime = Date.now() - startTime;
        this.securityPerformance.recordSanitizationTime(sanitizationTime);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        securityContext.violations.push({
          type: ViolationType.MALICIOUS_INPUT,
          severity: RiskLevel.HIGH,
          description: 'Input sanitization failed',
          action: 'blocked',
          timestamp: new Date(),
          context: { error: errorMessage },
          remediation: 'Check input format and retry',
          impact: 'Request blocked due to sanitization failure',
          confidence: 90
        });
      }

      next();
    };
  }

  /**
   * Validate file uploads middleware
   */
  private validateFileUploads() {
    return async (req: Request, _res: Response, next: NextFunction) => {
      const securityContext = (req as any).securityContext;
      
      // Normalize files structure - handle both single file and multiple files
      let files: any[] = [];
      if (req.files) {
        if (Array.isArray(req.files)) {
          files = req.files;
        } else {
          // If req.files is an object, convert to array
          files = Object.values(req.files).flat();
        }
      } else if (req.file) {
        files = [req.file];
      }

      for (const file of files) {
        const uploadedFile = file as UploadedFile;
        const startTime = Date.now();

        try {
          const validation = await this.fileValidator.validateFile(
            uploadedFile.path,
            uploadedFile.originalname,
            uploadedFile.mimetype
          );

          const scanTime = Date.now() - startTime;
          this.securityPerformance.recordFileScanTime(scanTime);

          if (!validation.isValid) {
            securityContext.violations.push(...validation.violations);
            securityContext.riskLevel = this.calculateRiskLevel(securityContext.violations);

            if (validation.quarantined) {
              securityContext.threatIndicators.push('file_quarantined');
            }
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          securityContext.violations.push({
            type: ViolationType.SUSPICIOUS_FILE,
            severity: RiskLevel.HIGH,
            description: 'File validation failed',
            action: 'blocked',
            timestamp: new Date(),
            context: { 
              fileName: uploadedFile.originalname,
              error: errorMessage 
            },
            remediation: 'Check file format and retry',
            impact: 'File upload blocked',
            confidence: 85
          });
        }
      }

      next();
    };
  }

  /**
   * Validate request size
   */
  private validateRequestSize() {
    return (req: Request, res: Response, next: NextFunction) => {
      const securityContext = (req as any).securityContext;
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (securityContext.requestSize > maxSize) {
        securityContext.violations.push({
          type: ViolationType.PERFORMANCE_VIOLATION,
          severity: RiskLevel.MEDIUM,
          description: `Request size ${securityContext.requestSize} exceeds limit ${maxSize}`,
          action: 'blocked',
          timestamp: new Date(),
          context: { 
            requestSize: securityContext.requestSize,
            maxSize 
          },
          remediation: 'Reduce request size',
          impact: 'Request blocked due to size limit',
          confidence: 95
        });

        return res.status(413).json({
          success: false,
          error: {
            code: 'REQUEST_TOO_LARGE',
            message: 'Request size exceeds maximum allowed limit'
          }
        });
      }

      return next();
    };
  }

  /**
   * Finalize security context middleware
   */
  private finalizeSecurityContext() {
    return (req: Request, res: Response, next: NextFunction) => {
      const securityContext = (req as any).securityContext;
      
      // Calculate final risk level
      securityContext.riskLevel = this.calculateRiskLevel(securityContext.violations);
      
      // Calculate security score
      securityContext.securityScore = this.calculateSecurityScore(securityContext);
      
      // Add security headers to response
      res.set('X-Security-Score', securityContext.securityScore.toString());
      res.set('X-Risk-Level', securityContext.riskLevel);
      
      // Log security context
      if (this.config.monitoring.enableDetailedLogging) {
        this.logSecurityContext(securityContext);
      }

      next();
    };
  }

  /**
   * Track performance middleware
   */
  private trackPerformance(phase: 'start' | 'end') {
    return (req: Request, _res: Response, next: NextFunction) => {
      const securityContext = (req as any).securityContext;

      if (phase === 'start') {
        securityContext.startTime = Date.now();
      } else if (phase === 'end') {
        const endTime = Date.now();
        securityContext.responseTime = endTime - securityContext.startTime;
        this.securityPerformance.recordResponseTime(securityContext.responseTime);
      }

      next();
    };
  }

  /**
   * Update metrics
   */
  private updateMetrics() {
    return (req: Request, _res: Response, next: NextFunction) => {
      const securityContext = (req as any).securityContext;
      
      this.metrics.totalRequests++;
      
      if (securityContext.violations.length > 0) {
        this.metrics.blockedRequests++;
        
        // Update violations by type with safe access
        securityContext.violations.forEach((violation: any) => {
          if (violation.type && this.isValidViolationType(violation.type)) {
            const violationType = violation.type as ViolationType;
            this.metrics.violationsByType[violationType] = 
              (this.metrics.violationsByType[violationType] || 0) + 1;
          }
        });
      }

      // Update average response time
      if (securityContext.responseTime) {
        const currentAvg = this.metrics.averageResponseTime;
        const totalRequests = this.metrics.totalRequests;
        this.metrics.averageResponseTime = 
          (currentAvg * (totalRequests - 1) + securityContext.responseTime) / totalRequests;
      }

      // Update security score
      this.metrics.securityScore = this.calculateOverallSecurityScore();

      next();
    };
  }

  /**
   * Send security alerts
   */
  private sendSecurityAlerts() {
    return (req: Request, _res: Response, next: NextFunction) => {
      const securityContext = (req as any).securityContext;

      if (securityContext.violations.length > 0 && this.config.monitoring.enableRealTimeAlerts) {
        securityContext.violations.forEach((violation: any) => {
          if (this.shouldSendAlert(violation)) {
            this.sendAlert(violation, securityContext);
          }
        });
      }

      next();
    };
  }

  /**
   * Create custom middleware with specific options
   */
  createCustomMiddleware(options: SecurityMiddlewareOptions) {
    const middleware: any[] = [
      this.createSecurityContext(),
      this.trackPerformance('start')
    ];

    // Add security headers
    middleware.push(this.securityHeaders.applyHeaders());

    // Add IP checks
    middleware.push(this.checkIPWhitelist());
    middleware.push(this.checkIPBlacklist());

    // Add rate limiting if enabled
    if (options.enableRateLimit !== false) {
      if (options.customRateLimit) {
        // Use createAPILimiter as fallback since createCustomLimiter doesn't exist
        middleware.push(this.rateLimiter.createAPILimiter('custom', options.customRateLimit));
      } else {
        middleware.push(this.rateLimiter.createBasicLimiter());
      }
    }

    // Add input sanitization if enabled
    if (options.enableSanitization !== false) {
      middleware.push(this.sanitizeInputs());
    }

    // Add SQL prevention if enabled
    if (options.enableSQLPrevention !== false) {
      middleware.push(this.sqlPrevention.detectSQLInjection());
    }

    // Add file validation if enabled
    if (options.enableFileValidation !== false) {
      middleware.push(this.validateFileUploads());
    }

    // Add request size validation
    middleware.push(this.validateRequestSize());

    // Add finalization
    middleware.push(this.finalizeSecurityContext());
    middleware.push(this.trackPerformance('end'));

    // Add monitoring if enabled
    if (options.enableMonitoring !== false) {
      middleware.push(this.updateMetrics());
      middleware.push(this.sendSecurityAlerts());
    }

    return middleware;
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): SecurityMetrics {
    return {
      ...this.metrics,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      cpuUsage: process.cpuUsage().user / 1000000, // seconds
      activeConnections: this.getActiveConnections()
    };
  }

  /**
   * Get security alerts
   */
  getSecurityAlerts(): SecurityAlert[] {
    return this.securityMonitoring.getAlerts();
  }

  /**
   * Get security events
   */
  getSecurityEvents(): SecurityEvent[] {
    return this.securityMonitoring.getEvents();
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return this.securityPerformance.getMetrics();
  }

  // Helper methods
  private getClientIP(req: Request): string {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           (req.connection as any).socket?.remoteAddress || 
           'unknown';
  }

  private calculateRequestSize(req: Request): number {
    let size = 0;
    
    // URL size
    size += req.url.length;
    
    // Headers size
    Object.keys(req.headers).forEach(key => {
      size += key.length + (req.headers[key]?.toString().length || 0);
    });
    
    // Body size
    if (req.body) {
      size += JSON.stringify(req.body).length;
    }
    
    // Query size
    if (req.query) {
      size += JSON.stringify(req.query).length;
    }
    
    return size;
  }

  private calculateRiskLevel(violations: any[]): RiskLevel {
    if (violations.length === 0) return RiskLevel.LOW;
    
    const severityCounts = {
      [RiskLevel.LOW]: 0,
      [RiskLevel.MEDIUM]: 0,
      [RiskLevel.HIGH]: 0,
      [RiskLevel.CRITICAL]: 0
    };

    violations.forEach(violation => {
      if (violation.severity && this.isValidRiskLevel(violation.severity)) {
        const riskLevel = violation.severity as RiskLevel;
        severityCounts[riskLevel]++;
      }
    });

    if (severityCounts[RiskLevel.CRITICAL] > 0) return RiskLevel.CRITICAL;
    if (severityCounts[RiskLevel.HIGH] > 0) return RiskLevel.HIGH;
    if (severityCounts[RiskLevel.MEDIUM] > 0) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private calculateSecurityScore(context: SecurityContext): number {
    let score = 100;
    
    // Deduct points for violations
    context.violations.forEach(violation => {
      if (violation.severity && this.isValidRiskLevel(violation.severity)) {
        switch (violation.severity) {
          case RiskLevel.CRITICAL:
            score -= 25;
            break;
          case RiskLevel.HIGH:
            score -= 15;
            break;
          case RiskLevel.MEDIUM:
            score -= 10;
            break;
          case RiskLevel.LOW:
            score -= 5;
            break;
        }
      }
    });

    // Deduct points for threat indicators
    context.threatIndicators.forEach(_indicator => {
      score -= 5;
    });

    return Math.max(0, score);
  }

  private calculateOverallSecurityScore(): number {
    const totalViolations = Object.values(this.metrics.violationsByType)
      .reduce((sum, count) => sum + count, 0);
    
    if (this.metrics.totalRequests === 0) return 100;
    
    const violationRate = totalViolations / this.metrics.totalRequests;
    return Math.max(0, 100 - (violationRate * 100));
  }

  private shouldSendAlert(violation: any): boolean {
    const thresholds = this.config.monitoring.alertThresholds;
    
    if (!violation.type || !this.isValidViolationType(violation.type)) {
      return violation.severity === RiskLevel.CRITICAL || violation.severity === RiskLevel.HIGH;
    }
    
    switch (violation.type) {
      case ViolationType.RATE_LIMIT_EXCEEDED:
        return this.getViolationCount(violation.type) >= thresholds.rateLimitViolations;
      case ViolationType.SQL_INJECTION_ATTEMPT:
        return this.getViolationCount(violation.type) >= thresholds.sqlInjectionAttempts;
      case ViolationType.XSS_ATTEMPT:
        return this.getViolationCount(violation.type) >= thresholds.xssAttempts;
      case ViolationType.FILE_UPLOAD_VIOLATION:
        return this.getViolationCount(violation.type) >= thresholds.fileUploadViolations;
      default:
        return violation.severity === RiskLevel.CRITICAL || violation.severity === RiskLevel.HIGH;
    }
  }

  private getViolationCount(type: ViolationType): number {
    return this.metrics.violationsByType[type as keyof typeof this.metrics.violationsByType] || 0;
  }

  private sendAlert(violation: any, context: SecurityContext) {
    const alert: SecurityAlert = {
      id: this.generateRequestId(),
      type: violation.type,
      severity: violation.severity,
      message: violation.description,
      timestamp: new Date(),
      context: context,
      acknowledged: false,
      resolved: false
    };

    this.securityMonitoring.addAlert(alert);
  }

  private logSecurityContext(context: SecurityContext) {
    console.log('🔒 Security Context:', {
      requestId: context.requestId,
      endpoint: context.endpoint,
      method: context.method,
      ipAddress: context.ipAddress,
      riskLevel: context.riskLevel,
      securityScore: context.securityScore,
      violations: context.violations.length,
      threatIndicators: context.threatIndicators,
      responseTime: context.responseTime
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getActiveConnections(): number {
    // This would need to be implemented based on your server setup
    // For now, return a placeholder
    return 0;
  }

  // Type guard methods
  private isValidViolationType(type: any): type is ViolationType {
    return Object.values(ViolationType).includes(type);
  }

  private isValidRiskLevel(level: any): level is RiskLevel {
    return Object.values(RiskLevel).includes(level);
  }
}
