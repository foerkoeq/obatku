// ======================================
// SECURITY INTEGRATION HELPERS
// ======================================
// Helper functions untuk security integration
// Memudahkan setup dan konfigurasi integration

import { SecurityConfig } from '../types/security.types';
import { SecurityIntegration } from './security-integration';

// Helper untuk validate integration configuration
export const validateIntegrationConfig = (config: SecurityConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingComponents: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingComponents: string[] = [];

  // Check required components
  if (!config.rateLimiting) {
    missingComponents.push('Rate limiting configuration');
  }

  if (!config.sanitization) {
    missingComponents.push('Input sanitization configuration');
  }

  if (!config.fileUpload) {
    missingComponents.push('File upload configuration');
  }

  // Check for potential issues
  if (config.rateLimiting?.maxRequests && config.rateLimiting.maxRequests > 1000) {
    warnings.push('High rate limit may impact security');
  }

  if (config.fileUpload?.maxFileSize && config.fileUpload.maxFileSize > 100 * 1024 * 1024) {
    warnings.push('Very large file upload limit may impact performance');
  }

  // Check for missing security features
  if (!config.advanced?.enableCSRFProtection) {
    warnings.push('CSRF protection not enabled');
  }

  if (!config.advanced?.enableClickjackingProtection) {
    warnings.push('Clickjacking protection not enabled');
  }

  if (!config.monitoring?.enableRealTimeAlerts) {
    warnings.push('Real-time alerts not enabled');
  }

  return {
    isValid: errors.length === 0 && missingComponents.length === 0,
    errors,
    warnings,
    missingComponents
  };
};

// Helper untuk setup integration berdasarkan environment
export const setupIntegrationForEnvironment = (
  environment: 'development' | 'staging' | 'production' | 'test'
): {
  config: Partial<SecurityConfig>;
  recommendations: string[];
  warnings: string[];
} => {
  const recommendations: string[] = [];
  const warnings: string[] = [];

  let config: Partial<SecurityConfig> = {};

  switch (environment) {
    case 'development':
      config = {
        rateLimiting: {
          windowMs: 15 * 60 * 1000,
          maxRequests: 1000,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
          standardHeaders: true,
          legacyHeaders: false,
          enableProgressiveLimiting: false,
          progressivePenalty: 1,
          enableSmartLimiting: false,
          whitelistIPs: ['127.0.0.1', '::1'],
          blacklistIPs: [],
          authWindowMs: 5 * 60 * 1000,
          authMaxRequests: 10,
          apiWindowMs: 1 * 60 * 1000,
          apiMaxRequests: 100,
          uploadWindowMs: 10 * 60 * 1000,
          uploadMaxRequests: 20
        },
        sanitization: {
          stripHtml: true,
          normalizeEmail: true,
          escapeSpecialChars: true,
          maxStringLength: 10000,
          allowedTags: [],
          allowedAttributes: {},
          enableXSSProtection: true,
          enableSQLInjectionProtection: true,
          enablePathTraversalProtection: true,
          enableCommandInjectionProtection: true,
          customRules: {
            email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, maxLength: 255 },
            phone: { pattern: /^[\d\s\-\+\(\)]+$/, maxLength: 20 },
            url: { pattern: /^https?:\/\/.+/, maxLength: 500 },
            nip: { pattern: /^\d{18,20}$/, maxLength: 20 }
          },
          fieldSanitization: {}
        },
        fileUpload: {
          maxFileSize: 50 * 1024 * 1024,
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ],
          allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
          scanForMalware: false,
          quarantineFolder: './quarantine',
          enableMagicBytesCheck: true,
          enableFileSignatureValidation: true,
          enableContentTypeValidation: true,
          enableImageProcessing: false,
          imageProcessingOptions: {
            resize: { maxWidth: 1920, maxHeight: 1080 },
            quality: 80,
            format: 'jpeg'
          },
          virusScanTimeout: 30000,
          maxFilesPerRequest: 5,
          maxTotalSizePerRequest: 100 * 1024 * 1024,
          tempFolder: './temp',
          cleanupTempFiles: true,
          tempFileExpiry: 3600000
        },
        monitoring: {
          enableSecurityMonitoring: false,
          enableRealTimeAlerts: false,
          enableEmailAlerts: false,
          alertEmailRecipients: [],
          alertChannels: [],
          alertThresholds: {
            rateLimitViolations: 10,
            sqlInjectionAttempts: 5,
            xssAttempts: 5,
            fileUploadViolations: 5,
            authenticationFailures: 10
          },
          enableDetailedLogging: false,
          logSecurityEvents: false,
          logRetentionDays: 30,
          enablePerformanceMonitoring: false,
          performanceThresholds: {
            responseTime: 1000,
            memoryUsage: 80,
            cpuUsage: 80
          }
        },
        advanced: {
          enableRequestValidation: false,
          enableResponseSanitization: false,
          enableSessionSecurity: false,
          enableCSRFProtection: false,
          enableClickjackingProtection: false,
          enableMIMESniffingProtection: false,
          enableResponseEncryption: false,
          encryptionAlgorithm: 'AES-256',
          sessionTimeout: 3600000,
          sessionRenewalThreshold: 300000,
          maxConcurrentSessions: 5,
          enableAPIVersioning: false,
          enableAPIDocumentation: false,
          enableAPIRateLimitPerUser: false,
          enableCacheSecurity: false,
          cacheSecurityHeaders: false,
          preventCacheLeakage: false
        }
      };
      recommendations.push('Development mode: Security features relaxed for easier development');
      break;

    case 'staging':
      config = {
        rateLimiting: {
          windowMs: 15 * 60 * 1000,
          maxRequests: 500,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
          standardHeaders: true,
          legacyHeaders: false,
          enableProgressiveLimiting: true,
          progressivePenalty: 2,
          enableSmartLimiting: true,
          whitelistIPs: [],
          blacklistIPs: [],
          authWindowMs: 5 * 60 * 1000,
          authMaxRequests: 5,
          apiWindowMs: 1 * 60 * 1000,
          apiMaxRequests: 60,
          uploadWindowMs: 10 * 60 * 1000,
          uploadMaxRequests: 15
        },
        sanitization: {
          stripHtml: true,
          normalizeEmail: true,
          escapeSpecialChars: true,
          maxStringLength: 5000,
          allowedTags: [],
          allowedAttributes: {},
          enableXSSProtection: true,
          enableSQLInjectionProtection: true,
          enablePathTraversalProtection: true,
          enableCommandInjectionProtection: true,
          customRules: {
            email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, maxLength: 255 },
            phone: { pattern: /^[\d\s\-\+\(\)]+$/, maxLength: 20 },
            url: { pattern: /^https?:\/\/.+/, maxLength: 500 },
            nip: { pattern: /^\d{18,20}$/, maxLength: 20 }
          },
          fieldSanitization: {}
        },
        fileUpload: {
          maxFileSize: 25 * 1024 * 1024,
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ],
          allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
          scanForMalware: true,
          quarantineFolder: './quarantine',
          enableMagicBytesCheck: true,
          enableFileSignatureValidation: true,
          enableContentTypeValidation: true,
          enableImageProcessing: true,
          imageProcessingOptions: {
            resize: { maxWidth: 1920, maxHeight: 1080 },
            quality: 85,
            format: 'jpeg'
          },
          virusScanTimeout: 30000,
          maxFilesPerRequest: 3,
          maxTotalSizePerRequest: 50 * 1024 * 1024,
          tempFolder: './temp',
          cleanupTempFiles: true,
          tempFileExpiry: 1800000
        },
        monitoring: {
          enableSecurityMonitoring: true,
          enableRealTimeAlerts: true,
          enableEmailAlerts: true,
          alertEmailRecipients: ['admin@staging.com'],
          alertChannels: ['console', 'file'],
          alertThresholds: {
            rateLimitViolations: 5,
            sqlInjectionAttempts: 3,
            xssAttempts: 3,
            fileUploadViolations: 3,
            authenticationFailures: 5
          },
          enableDetailedLogging: true,
          logSecurityEvents: true,
          logRetentionDays: 60,
          enablePerformanceMonitoring: true,
          performanceThresholds: {
            responseTime: 500,
            memoryUsage: 70,
            cpuUsage: 70
          }
        },
        advanced: {
          enableRequestValidation: true,
          enableResponseSanitization: true,
          enableSessionSecurity: true,
          enableCSRFProtection: true,
          enableClickjackingProtection: true,
          enableMIMESniffingProtection: true,
          enableResponseEncryption: false,
          encryptionAlgorithm: 'AES-256',
          sessionTimeout: 1800000,
          sessionRenewalThreshold: 300000,
          maxConcurrentSessions: 3,
          enableAPIVersioning: true,
          enableAPIDocumentation: true,
          enableAPIRateLimitPerUser: true,
          enableCacheSecurity: true,
          cacheSecurityHeaders: true,
          preventCacheLeakage: true
        }
      };
      recommendations.push('Staging mode: Security features enabled for testing');
      break;

    case 'production':
      config = {
        rateLimiting: {
          windowMs: 15 * 60 * 1000,
          maxRequests: 100,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
          standardHeaders: true,
          legacyHeaders: false,
          enableProgressiveLimiting: true,
          progressivePenalty: 3,
          enableSmartLimiting: true,
          whitelistIPs: [],
          blacklistIPs: [],
          authWindowMs: 5 * 60 * 1000,
          authMaxRequests: 3,
          apiWindowMs: 1 * 60 * 1000,
          apiMaxRequests: 30,
          uploadWindowMs: 10 * 60 * 1000,
          uploadMaxRequests: 10
        },
        sanitization: {
          stripHtml: true,
          normalizeEmail: true,
          escapeSpecialChars: true,
          maxStringLength: 2000,
          allowedTags: [],
          allowedAttributes: {},
          enableXSSProtection: true,
          enableSQLInjectionProtection: true,
          enablePathTraversalProtection: true,
          enableCommandInjectionProtection: true,
          customRules: {
            email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, maxLength: 255 },
            phone: { pattern: /^[\d\s\-\+\(\)]+$/, maxLength: 20 },
            url: { pattern: /^https?:\/\/.+/, maxLength: 500 },
            nip: { pattern: /^\d{18,20}$/, maxLength: 20 }
          },
          fieldSanitization: {}
        },
        fileUpload: {
          maxFileSize: 10 * 1024 * 1024,
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf'
          ],
          allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
          scanForMalware: true,
          quarantineFolder: './quarantine',
          enableMagicBytesCheck: true,
          enableFileSignatureValidation: true,
          enableContentTypeValidation: true,
          enableImageProcessing: true,
          imageProcessingOptions: {
            resize: { maxWidth: 1280, maxHeight: 720 },
            quality: 90,
            format: 'jpeg'
          },
          virusScanTimeout: 60000,
          maxFilesPerRequest: 2,
          maxTotalSizePerRequest: 20 * 1024 * 1024,
          tempFolder: './temp',
          cleanupTempFiles: true,
          tempFileExpiry: 900000
        },
        monitoring: {
          enableSecurityMonitoring: true,
          enableRealTimeAlerts: true,
          enableEmailAlerts: true,
          alertEmailRecipients: ['security@production.com', 'admin@production.com'],
          alertChannels: ['console', 'file', 'email'],
          alertThresholds: {
            rateLimitViolations: 3,
            sqlInjectionAttempts: 1,
            xssAttempts: 1,
            fileUploadViolations: 1,
            authenticationFailures: 3
          },
          enableDetailedLogging: true,
          logSecurityEvents: true,
          logRetentionDays: 90,
          enablePerformanceMonitoring: true,
          performanceThresholds: {
            responseTime: 300,
            memoryUsage: 60,
            cpuUsage: 60
          }
        },
        advanced: {
          enableRequestValidation: true,
          enableResponseSanitization: true,
          enableSessionSecurity: true,
          enableCSRFProtection: true,
          enableClickjackingProtection: true,
          enableMIMESniffingProtection: true,
          enableResponseEncryption: true,
          encryptionAlgorithm: 'AES-256-GCM',
          sessionTimeout: 900000,
          sessionRenewalThreshold: 300000,
          maxConcurrentSessions: 2,
          enableAPIVersioning: true,
          enableAPIDocumentation: false,
          enableAPIRateLimitPerUser: true,
          enableCacheSecurity: true,
          cacheSecurityHeaders: true,
          preventCacheLeakage: true
        }
      };
      recommendations.push('Production mode: Maximum security features enabled');
      break;

    case 'test':
      config = {
        rateLimiting: {
          windowMs: 15 * 60 * 1000,
          maxRequests: 2000,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
          standardHeaders: true,
          legacyHeaders: false,
          enableProgressiveLimiting: false,
          progressivePenalty: 1,
          enableSmartLimiting: false,
          whitelistIPs: ['127.0.0.1', '::1'],
          blacklistIPs: [],
          authWindowMs: 5 * 60 * 1000,
          authMaxRequests: 20,
          apiWindowMs: 1 * 60 * 1000,
          apiMaxRequests: 200,
          uploadWindowMs: 10 * 60 * 1000,
          uploadMaxRequests: 50
        },
        sanitization: {
          stripHtml: true,
          normalizeEmail: true,
          escapeSpecialChars: true,
          maxStringLength: 10000,
          allowedTags: [],
          allowedAttributes: {},
          enableXSSProtection: true,
          enableSQLInjectionProtection: true,
          enablePathTraversalProtection: true,
          enableCommandInjectionProtection: true,
          customRules: {
            email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, maxLength: 255 },
            phone: { pattern: /^[\d\s\-\+\(\)]+$/, maxLength: 20 },
            url: { pattern: /^https?:\/\/.+/, maxLength: 500 },
            nip: { pattern: /^\d{18,20}$/, maxLength: 20 }
          },
          fieldSanitization: {}
        },
        fileUpload: {
          maxFileSize: 100 * 1024 * 1024,
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ],
          allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
          scanForMalware: false,
          quarantineFolder: './quarantine',
          enableMagicBytesCheck: false,
          enableFileSignatureValidation: false,
          enableContentTypeValidation: true,
          enableImageProcessing: false,
          imageProcessingOptions: {
            resize: { maxWidth: 1920, maxHeight: 1080 },
            quality: 80,
            format: 'jpeg'
          },
          virusScanTimeout: 15000,
          maxFilesPerRequest: 10,
          maxTotalSizePerRequest: 200 * 1024 * 1024,
          tempFolder: './temp',
          cleanupTempFiles: true,
          tempFileExpiry: 7200000
        },
        monitoring: {
          enableSecurityMonitoring: false,
          enableRealTimeAlerts: false,
          enableEmailAlerts: false,
          alertEmailRecipients: [],
          alertChannels: [],
          alertThresholds: {
            rateLimitViolations: 20,
            sqlInjectionAttempts: 10,
            xssAttempts: 10,
            fileUploadViolations: 10,
            authenticationFailures: 20
          },
          enableDetailedLogging: false,
          logSecurityEvents: false,
          logRetentionDays: 7,
          enablePerformanceMonitoring: false,
          performanceThresholds: {
            responseTime: 2000,
            memoryUsage: 90,
            cpuUsage: 90
          }
        },
        advanced: {
          enableRequestValidation: false,
          enableResponseSanitization: false,
          enableSessionSecurity: false,
          enableCSRFProtection: false,
          enableClickjackingProtection: false,
          enableMIMESniffingProtection: false,
          enableResponseEncryption: false,
          encryptionAlgorithm: 'AES-256',
          sessionTimeout: 7200000,
          sessionRenewalThreshold: 600000,
          maxConcurrentSessions: 10,
          enableAPIVersioning: false,
          enableAPIDocumentation: true,
          enableAPIRateLimitPerUser: false,
          enableCacheSecurity: false,
          cacheSecurityHeaders: false,
          preventCacheLeakage: false
        }
      };
      recommendations.push('Test mode: Security features relaxed for testing');
      break;
  }

  return {
    config,
    recommendations,
    warnings
  };
};

// Helper untuk check integration health
export const checkIntegrationHealth = (integration: SecurityIntegration): {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
  metrics: {
    totalRequests: number;
    blockedRequests: number;
    securityScore: number;
    performanceScore: number;
  };
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  try {
    const monitoring = integration.getSecurityMonitoring();
    const performance = integration.getSecurityPerformance();
    
         // Get basic metrics from monitoring
     const alerts = monitoring.getAlerts();
     const events = monitoring.getEvents();
    
    // Calculate basic metrics
    const totalRequests = events.length;
    const blockedRequests = alerts.filter(alert => 
      alert.type === 'rate_limit_exceeded' || 
      alert.type === 'malicious_input' || 
      alert.type === 'suspicious_file'
    ).length;
    
    // Calculate security score based on configuration and alerts
    const config = integration.getConfiguration();
    let securityScore = 100;
    
    if (!config.advanced.enableCSRFProtection) securityScore -= 10;
    if (!config.advanced.enableClickjackingProtection) securityScore -= 10;
    if (!config.monitoring.enableRealTimeAlerts) securityScore -= 15;
    if (!config.fileUpload.scanForMalware) securityScore -= 20;
    if (blockedRequests > totalRequests * 0.1) securityScore -= 25;
    
    // Check for potential issues
    if (blockedRequests > totalRequests * 0.1) {
      issues.push('High rate of blocked requests (>10%)');
      recommendations.push('Review rate limiting configuration');
    }
    
    if (securityScore < 70) {
      issues.push('Low security score');
      recommendations.push('Review security configuration and implement missing features');
    }
    
    // Check performance metrics
    const performanceScore = performance.getPerformanceScore();
    if (performanceScore < 70) {
      issues.push('Low performance score');
      recommendations.push('Review performance configuration and optimize bottlenecks');
    }
    
    // Check for critical issues
    if (blockedRequests > totalRequests * 0.5) {
      issues.push('Critical: Very high rate of blocked requests (>50%)');
      recommendations.push('Immediately review and adjust rate limiting settings');
    }
    
    const status = issues.some(i => i.includes('Critical')) ? 'critical' :
                   issues.length > 0 ? 'warning' : 'healthy';
    
    return {
      status,
      issues,
      recommendations,
      metrics: {
        totalRequests,
        blockedRequests,
        securityScore: Math.max(0, securityScore),
        performanceScore
      }
    };
  } catch (error) {
    return {
      status: 'critical',
      issues: ['Integration health check failed'],
      recommendations: ['Check integration configuration and restart if necessary'],
      metrics: {
        totalRequests: 0,
        blockedRequests: 0,
        securityScore: 0,
        performanceScore: 0
      }
    };
  }
};

// Helper untuk generate integration report
export const generateIntegrationReport = (integration: SecurityIntegration): {
  summary: {
    status: string;
    timestamp: string;
    uptime: string;
    version: string;
  };
  security: {
    score: number;
    totalRequests: number;
    blockedRequests: number;
    violationsByType: Record<string, number>;
  };
  performance: {
    score: number;
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  monitoring: {
    totalEvents: number;
    totalAlerts: number;
    unacknowledgedAlerts: number;
  };
  recommendations: string[];
} => {
  try {
    const monitoring = integration.getSecurityMonitoring();
    const performance = integration.getSecurityPerformance();
    const config = integration.getConfiguration();
    
    const performanceMetrics = performance.getDetailedMetrics();
    const events = monitoring.getEvents();
    const alerts = monitoring.getAlerts();
    
         // Calculate security metrics
     const totalRequests = events.length;
     const blockedRequests = alerts.filter(alert =>  
      alert.type === 'rate_limit_exceeded' || 
      alert.type === 'malicious_input' || 
      alert.type === 'suspicious_file'
    ).length;
    
    // Calculate security score
    let securityScore = 100;
    if (!config.advanced.enableCSRFProtection) securityScore -= 10;
    if (!config.advanced.enableClickjackingProtection) securityScore -= 10;
    if (!config.monitoring.enableRealTimeAlerts) securityScore -= 15;
    if (!config.fileUpload.scanForMalware) securityScore -= 20;
    if (blockedRequests > totalRequests * 0.1) securityScore -= 25;
    
    // Group violations by type
    const violationsByType: Record<string, number> = {};
    alerts.forEach(alert => {
      violationsByType[alert.type] = (violationsByType[alert.type] || 0) + 1;
    });
    
    const recommendations: string[] = [];
    
    // Generate recommendations based on metrics
    if (securityScore < 80) {
      recommendations.push('Improve security score by enabling additional security features');
    }
    
    if (performanceMetrics.current.impactOnResponseTime > 50) {
      recommendations.push('Optimize security measures to reduce response time impact');
    }
    
    if (alerts.filter((a: any) => !a.acknowledged).length > 5) {
      recommendations.push('Review and acknowledge pending security alerts');
    }
    
    return {
      summary: {
        status: 'operational',
        timestamp: new Date().toISOString(),
        uptime: '24h', // This would be calculated from actual uptime
        version: '1.0.0'
      },
      security: {
        score: Math.max(0, securityScore),
        totalRequests,
        blockedRequests,
        violationsByType
      },
      performance: {
        score: performance.getPerformanceScore(),
        responseTime: performanceMetrics.current.impactOnResponseTime,
        memoryUsage: performanceMetrics.current.memoryOverhead,
        cpuUsage: performanceMetrics.current.cpuOverhead
      },
      monitoring: {
        totalEvents: events.length,
        totalAlerts: alerts.length,
        unacknowledgedAlerts: alerts.filter((a: any) => !a.acknowledged).length
      },
      recommendations
    };
  } catch (error) {
    return {
      summary: {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: '0h',
        version: '1.0.0'
      },
      security: {
        score: 0,
        totalRequests: 0,
        blockedRequests: 0,
        violationsByType: {}
      },
      performance: {
        score: 0,
        responseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      monitoring: {
        totalEvents: 0,
        totalAlerts: 0,
        unacknowledgedAlerts: 0
      },
      recommendations: ['Check integration configuration and restart if necessary']
    };
  }
};

// Helper untuk quick integration setup
export const quickIntegrationSetup = (
  environment: 'development' | 'staging' | 'production' | 'test'
): {
  config: Partial<SecurityConfig>;
  validation: ReturnType<typeof validateIntegrationConfig>;
  setup: {
    recommendations: string[];
    warnings: string[];
    nextSteps: string[];
  };
} => {
  const setup = setupIntegrationForEnvironment(environment);
  const validation = validateIntegrationConfig(setup.config as SecurityConfig);
  
  const nextSteps = [
    'Import SecurityIntegrationFactory from security module',
    'Create integration instance with configuration',
    'Apply integration to Express app',
    'Test security features',
    'Monitor performance and adjust as needed'
  ];
  
  return {
    config: setup.config,
    validation,
    setup: {
      recommendations: setup.recommendations,
      warnings: setup.warnings,
      nextSteps
    }
  };
};
