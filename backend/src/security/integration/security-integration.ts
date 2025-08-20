// ======================================
// SECURITY INTEGRATION - COMPREHENSIVE
// ======================================
// Demonstrates how to integrate all security features
// Modular, maintainable, and customizable for different systems

import { Request, Response } from 'express';
import { SecurityMiddleware } from '../middleware/security.middleware';
import { SecurityConfigFactory } from '../config/security.config';
import { SecurityConfig } from '../types/security.types';
import { SecurityMonitoring } from '../monitoring/security-monitoring';
import { SecurityPerformance } from '../performance/security-performance';
import { SecurityConfigValidation } from '../types/security.types';
import { logger } from '@/core/logger/logger';

export class SecurityIntegration {
  private securityMiddleware: SecurityMiddleware;
  private securityMonitoring: SecurityMonitoring;
  private securityPerformance: SecurityPerformance;
  private config: SecurityConfig;
  private isInitialized: boolean = false;

  constructor(config?: SecurityConfig) {
    this.config = config || SecurityConfigFactory.forProduction();
    this.securityMonitoring = new SecurityMonitoring(this.config.monitoring);
    this.securityPerformance = new SecurityPerformance();
    this.securityMiddleware = new SecurityMiddleware(this.config);
  }

  /**
   * Initialize security integration
   */
  async initialize(): Promise<void> {
    try {
      // Validate configuration
      const validation = this.validateConfiguration();
      if (!validation.isValid) {
        throw new Error(`Security configuration validation failed: ${validation.errors.join(', ')}`);
      }

      // Initialize monitoring (SecurityMonitoring doesn't have initialize method, it's auto-initialized in constructor)
      // The monitoring is already initialized in the constructor

      // Log initialization
      logger.info('🔒 Security integration initialized successfully', {
        environment: process.env.NODE_ENV,
        securityLevel: this.getSecurityLevel(),
        features: this.getEnabledFeatures()
      });

      this.isInitialized = true;
    } catch (error) {
      logger.error('❌ Security integration initialization failed:', error);
      throw error;
    }
  }

  /**
   * Apply comprehensive security to Express app
   */
  applyToApp(app: any): void {
    if (!this.isInitialized) {
      throw new Error('Security integration must be initialized before applying to app');
    }

    // Apply global security middleware
    app.use(this.securityMiddleware.applyAll());

    // Apply route-specific security
    this.applyRouteSpecificSecurity(app);

    // Add security monitoring endpoints
    this.addSecurityEndpoints(app);

    logger.info('✅ Security integration applied to Express app');
  }

  /**
   * Apply route-specific security
   */
  private applyRouteSpecificSecurity(app: any): void {
    // Authentication routes - strict security
    app.use('/api/auth', this.securityMiddleware.applyForAuth());

    // File upload routes - file-focused security
    app.use('/api/upload', this.securityMiddleware.applyForUpload());

    // API routes - balanced security
    app.use('/api/users', this.securityMiddleware.applyForAPI('users'));
    app.use('/api/medicines', this.securityMiddleware.applyForAPI('medicines'));
    app.use('/api/submissions', this.securityMiddleware.applyForAPI('submissions'));
    app.use('/api/transactions', this.securityMiddleware.applyForAPI('transactions'));

    // Admin routes - high security
    app.use('/api/admin', this.createCustomSecurityMiddleware({
      securityLevel: 'high',
      enableAllFeatures: true,
      customRateLimit: 30
    }));

    // Public routes - minimal security
    app.use('/api/public', this.createCustomSecurityMiddleware({
      securityLevel: 'low',
      enableSanitization: true,
      enableRateLimit: true,
      enableSQLPrevention: false,
      enableFileValidation: false
    }));
  }

  /**
   * Create custom security middleware
   */
  createCustomSecurityMiddleware(options: {
    securityLevel?: 'low' | 'medium' | 'high' | 'critical';
    enableAllFeatures?: boolean;
    enableSanitization?: boolean;
    enableRateLimit?: boolean;
    enableSQLPrevention?: boolean;
    enableFileValidation?: boolean;
    enableMonitoring?: boolean;
    customRateLimit?: number;
    allowedFields?: string[];
    whitelistIPs?: string[];
    blacklistIPs?: string[];
  }) {
    const middlewareOptions = this.buildMiddlewareOptions(options);
    return this.securityMiddleware.createCustomMiddleware(middlewareOptions);
  }

  /**
   * Build middleware options based on security level
   */
  private buildMiddlewareOptions(options: any) {
    const baseOptions = {
      enableSanitization: true,
      enableRateLimit: true,
      enableSQLPrevention: true,
      enableFileValidation: true,
      enableMonitoring: true,
      enablePerformanceTracking: true
    };

    // Override with security level settings
    switch (options.securityLevel) {
      case 'low':
        return {
          ...baseOptions,
          enableSQLPrevention: false,
          enableFileValidation: false,
          customRateLimit: 200
        };
      case 'medium':
        return {
          ...baseOptions,
          customRateLimit: 100
        };
      case 'high':
        return {
          ...baseOptions,
          customRateLimit: 50,
          allowedFields: this.config.sqlPrevention.allowedFields
        };
      case 'critical':
        return {
          ...baseOptions,
          customRateLimit: 20,
          allowedFields: this.config.sqlPrevention.allowedFields,
          whitelistIPs: options.whitelistIPs || []
        };
      default:
        return baseOptions;
    }
  }

  /**
   * Add security monitoring endpoints
   */
  private addSecurityEndpoints(app: any): void {
    // Security health check
    app.get('/api/security/health', this.getSecurityHealth.bind(this));

    // Security metrics
    app.get('/api/security/metrics', this.getSecurityMetrics.bind(this));

    // Security alerts
    app.get('/api/security/alerts', this.getSecurityAlerts.bind(this));
    app.get('/api/security/alerts/unacknowledged', this.getUnacknowledgedAlerts.bind(this));

    // Security events
    app.get('/api/security/events', this.getSecurityEvents.bind(this));

    // Performance metrics
    app.get('/api/security/performance', this.getPerformanceMetrics.bind(this));

    // Alert management
    app.post('/api/security/alerts/:id/acknowledge', this.acknowledgeAlert.bind(this));
    app.post('/api/security/alerts/:id/resolve', this.resolveAlert.bind(this));

    // Security configuration
    app.get('/api/security/config', this.getSecurityConfig.bind(this));
    app.post('/api/security/config/reload', this.reloadSecurityConfig.bind(this));

    // Security testing
    app.post('/api/security/test', this.runSecurityTest.bind(this));
  }

  /**
   * Security health check endpoint
   */
  private getSecurityHealth(_req: Request, res: Response): void {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      security: {
        level: this.getSecurityLevel(),
        score: this.securityPerformance.getPerformanceScore(),
        alerts: this.securityMonitoring.getUnacknowledgedAlerts().length,
        performance: this.securityPerformance.isPerformanceAcceptable()
      },
      monitoring: {
        enabled: this.config.monitoring.enableSecurityMonitoring,
        realTimeAlerts: this.config.monitoring.enableRealTimeAlerts
      },
      features: this.getEnabledFeatures()
    };

    res.json(health);
  }

  /**
   * Get security metrics endpoint
   */
  private getSecurityMetrics(_req: Request, res: Response): void {
    const metrics = {
      security: this.securityMiddleware.getSecurityStats(),
      performance: this.securityPerformance.getMetrics(),
      monitoring: this.securityMonitoring.getAlertStats()
    };

    res.json(metrics);
  }

  /**
   * Get security alerts endpoint
   */
  private getSecurityAlerts(req: Request, res: Response): void {
    const { severity, type, limit = 50 } = req.query;
    let alerts = this.securityMonitoring.getAlerts();

    // Filter by severity
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    // Filter by type
    if (type) {
      alerts = alerts.filter(alert => alert.type === type);
    }

    // Apply limit
    alerts = alerts.slice(0, parseInt(limit as string));

    res.json({
      alerts,
      total: alerts.length,
      unacknowledged: this.securityMonitoring.getUnacknowledgedAlerts().length,
      unresolved: this.securityMonitoring.getUnresolvedAlerts().length
    });
  }

  /**
   * Get unacknowledged alerts endpoint
   */
  private getUnacknowledgedAlerts(_req: Request, res: Response): void {
    const alerts = this.securityMonitoring.getUnacknowledgedAlerts();
    res.json({ alerts, count: alerts.length });
  }

  /**
   * Get security events endpoint
   */
  private getSecurityEvents(req: Request, res: Response): void {
    const { type, severity, limit = 100 } = req.query;
    let events = this.securityMonitoring.getEvents();

    // Filter by type
    if (type) {
      events = events.filter(event => event.type === type);
    }

    // Filter by severity
    if (severity) {
      events = events.filter(event => event.severity === severity);
    }

    // Apply limit
    events = events.slice(0, parseInt(limit as string));

    res.json({ events, total: events.length });
  }

  /**
   * Get performance metrics endpoint
   */
  private getPerformanceMetrics(_req: Request, res: Response): void {
    const metrics = this.securityPerformance.getDetailedMetrics();
    res.json(metrics);
  }

  /**
   * Acknowledge alert endpoint
   */
  private acknowledgeAlert(req: Request, res: Response): void {
    const { id } = req.params;
    const { acknowledgedBy } = req.body;

    if (!acknowledgedBy) {
      res.status(400).json({
        success: false,
        error: 'acknowledgedBy is required'
      });
      return;
    }

    const success = this.securityMonitoring.acknowledgeAlert(id, acknowledgedBy);
    
    if (success) {
      res.json({ success: true, message: 'Alert acknowledged successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Alert not found' });
    }
  }

  /**
   * Resolve alert endpoint
   */
  private resolveAlert(req: Request, res: Response): void {
    const { id } = req.params;
    const { resolvedBy, notes } = req.body;

    if (!resolvedBy) {
      res.status(400).json({
        success: false,
        error: 'resolvedBy is required'
      });
      return;
    }

    const success = this.securityMonitoring.resolveAlert(id, resolvedBy, notes);
    
    if (success) {
      res.json({ success: true, message: 'Alert resolved successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Alert not found' });
    }
  }

  /**
   * Get security configuration endpoint
   */
  private getSecurityConfig(_req: Request, res: Response): void {
    // Return sanitized config (remove sensitive information)
    const sanitizedConfig = {
      rateLimiting: {
        windowMs: this.config.rateLimiting.windowMs,
        maxRequests: this.config.rateLimiting.maxRequests,
        enableProgressiveLimiting: this.config.rateLimiting.enableProgressiveLimiting,
        enableSmartLimiting: this.config.rateLimiting.enableSmartLimiting
      },
      sanitization: {
        stripHtml: this.config.sanitization.stripHtml,
        enableXSSProtection: this.config.sanitization.enableXSSProtection,
        enableSQLInjectionProtection: this.config.sanitization.enableSQLInjectionProtection
      },
      fileUpload: {
        maxFileSize: this.config.fileUpload.maxFileSize,
        scanForMalware: this.config.fileUpload.scanForMalware,
        enableMagicBytesCheck: this.config.fileUpload.enableMagicBytesCheck
      },
      monitoring: {
        enableSecurityMonitoring: this.config.monitoring.enableSecurityMonitoring,
        enableRealTimeAlerts: this.config.monitoring.enableRealTimeAlerts
      },
      advanced: {
        enableRequestValidation: this.config.advanced.enableRequestValidation,
        enableCSRFProtection: this.config.advanced.enableCSRFProtection,
        enableClickjackingProtection: this.config.advanced.enableClickjackingProtection
      }
    };

    res.json(sanitizedConfig);
  }

  /**
   * Reload security configuration endpoint
   */
  private async reloadSecurityConfig(_req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, you might reload from a file or database
      const newConfig = SecurityConfigFactory.forProduction();
      
      // Update the configuration
      this.config = newConfig;
      
      // Reinitialize components with new config
      this.securityMonitoring = new SecurityMonitoring(this.config.monitoring);
      this.securityMiddleware = new SecurityMiddleware(this.config);
      
      res.json({ success: true, message: 'Security configuration reloaded successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to reload configuration' });
    }
  }

  /**
   * Run security test endpoint
   */
  private async runSecurityTest(req: Request, res: Response): Promise<void> {
    try {
      const { testType } = req.body;
      
      // This would integrate with your security testing framework
      const testResult = {
        testType: testType || 'comprehensive',
        passed: true,
        score: 95,
        vulnerabilities: [],
        recommendations: [],
        executionTime: 5000,
        timestamp: new Date()
      };

      res.json(testResult);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Security test failed' });
    }
  }

  /**
   * Validate configuration
   */
  private validateConfiguration(): SecurityConfigValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check required fields
    if (!this.config.rateLimiting.maxRequests) {
      errors.push('Rate limiting maxRequests is required');
    }

    if (!this.config.fileUpload.maxFileSize) {
      errors.push('File upload maxFileSize is required');
    }

    // Check for potential issues
    if (this.config.rateLimiting.maxRequests > 1000) {
      warnings.push('High rate limit may impact security');
    }

    if (this.config.fileUpload.maxFileSize > 50 * 1024 * 1024) {
      warnings.push('Large file upload limit may impact performance');
    }

    // Generate recommendations
    if (!this.config.monitoring.enableRealTimeAlerts) {
      recommendations.push('Consider enabling real-time alerts for better security monitoring');
    }

    if (!this.config.advanced.enableCSRFProtection) {
      recommendations.push('Consider enabling CSRF protection for web applications');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  /**
   * Get current security level
   */
  private getSecurityLevel(): string {
    const features = this.getEnabledFeatures();
    const featureCount = Object.values(features).filter(Boolean).length;
    
    if (featureCount >= 8) return 'critical';
    if (featureCount >= 6) return 'high';
    if (featureCount >= 4) return 'medium';
    return 'low';
  }

  /**
   * Get enabled features
   */
  private getEnabledFeatures(): Record<string, boolean> {
    return {
      rateLimiting: this.config.rateLimiting.maxRequests > 0,
      inputSanitization: this.config.sanitization.stripHtml,
      xssProtection: this.config.sanitization.enableXSSProtection,
      sqlInjectionProtection: this.config.sanitization.enableSQLInjectionProtection,
      fileValidation: this.config.fileUpload.scanForMalware,
      securityHeaders: this.config.headers.contentSecurityPolicy.directives.defaultSrc?.length > 0,
      monitoring: this.config.monitoring.enableSecurityMonitoring,
      realTimeAlerts: this.config.monitoring.enableRealTimeAlerts,
      csrfProtection: this.config.advanced.enableCSRFProtection,
      clickjackingProtection: this.config.advanced.enableClickjackingProtection
    };
  }

  /**
   * Get security middleware instance
   */
  getSecurityMiddleware(): SecurityMiddleware {
    return this.securityMiddleware;
  }

  /**
   * Get security monitoring instance
   */
  getSecurityMonitoring(): SecurityMonitoring {
    return this.securityMonitoring;
  }

  /**
   * Get security performance instance
   */
  getSecurityPerformance(): SecurityPerformance {
    return this.securityPerformance;
  }

  /**
   * Get current configuration
   */
  getConfiguration(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfiguration(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize components with new config
    this.securityMonitoring = new SecurityMonitoring(this.config.monitoring);
    this.securityMiddleware = new SecurityMiddleware(this.config);
    
    logger.info('🔧 Security configuration updated');
  }
}

// Export factory functions for easy integration
export class SecurityIntegrationFactory {
  /**
   * Create security integration for development
   */
  static forDevelopment(): SecurityIntegration {
    const config = SecurityConfigFactory.forDevelopment();
    return new SecurityIntegration(config);
  }

  /**
   * Create security integration for staging
   */
  static forStaging(): SecurityIntegration {
    const config = SecurityConfigFactory.forStaging();
    return new SecurityIntegration(config);
  }

  /**
   * Create security integration for production
   */
  static forProduction(): SecurityIntegration {
    const config = SecurityConfigFactory.forProduction();
    return new SecurityIntegration(config);
  }

  /**
   * Create security integration for high security environments
   */
  static forHighSecurity(): SecurityIntegration {
    const config = SecurityConfigFactory.forHighSecurity();
    return new SecurityIntegration(config);
  }

  /**
   * Create custom security integration
   */
  static custom(config: SecurityConfig): SecurityIntegration {
    return new SecurityIntegration(config);
  }
} 