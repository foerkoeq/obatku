// ======================================
// SECURITY CONFIGURATION HELPERS
// ======================================
// Helper functions untuk security configuration
// Memudahkan setup dan konfigurasi security

import { SecurityConfig } from '../types/security.types';

// Helper untuk validasi environment
export const validateEnvironment = (env: string): boolean => {
  const validEnvironments = ['development', 'staging', 'production', 'test'];
  return validEnvironments.includes(env);
};

// Helper untuk generate default security config berdasarkan environment
export const getDefaultConfigForEnvironment = (env: string): Partial<SecurityConfig> => {
  switch (env) {
    case 'development':
      return {
        rateLimiting: {
          windowMs: 15 * 60 * 1000,
          maxRequests: 1000,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
          standardHeaders: true,
          legacyHeaders: false,
          enableProgressiveLimiting: false,
          progressivePenalty: 2,
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
        fileUpload: {
          maxFileSize: 50 * 1024 * 1024, // 50MB untuk development
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
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
          scanForMalware: false, // Disable untuk development
          quarantineFolder: './uploads/quarantine',
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
          maxFilesPerRequest: 5,
          maxTotalSizePerRequest: 50 * 1024 * 1024,
          tempFolder: './uploads/temp',
          cleanupTempFiles: true,
          tempFileExpiry: 24 * 60 * 60 * 1000
        },
        monitoring: {
          enableSecurityMonitoring: true,
          enableRealTimeAlerts: false,
          alertChannels: ['log'],
          alertThresholds: {
            rateLimitViolations: 10,
            sqlInjectionAttempts: 3,
            xssAttempts: 5,
            fileUploadViolations: 5,
            authenticationFailures: 20
          },
          enableDetailedLogging: true,
          logSecurityEvents: true,
          logRetentionDays: 30,
          enablePerformanceMonitoring: false,
          performanceThresholds: {
            responseTime: 5000,
            memoryUsage: 80,
            cpuUsage: 90
          }
        }
      };

    case 'staging':
      return {
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
          uploadMaxRequests: 10
        },
        fileUpload: {
          maxFileSize: 25 * 1024 * 1024, // 25MB
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
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
          scanForMalware: true,
          quarantineFolder: './uploads/quarantine',
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
          maxFilesPerRequest: 5,
          maxTotalSizePerRequest: 25 * 1024 * 1024,
          tempFolder: './uploads/temp',
          cleanupTempFiles: true,
          tempFileExpiry: 24 * 60 * 60 * 1000
        },
        monitoring: {
          enableSecurityMonitoring: true,
          enableRealTimeAlerts: true,
          alertChannels: ['log', 'email'],
          alertThresholds: {
            rateLimitViolations: 8,
            sqlInjectionAttempts: 2,
            xssAttempts: 3,
            fileUploadViolations: 3,
            authenticationFailures: 15
          },
          enableDetailedLogging: true,
          logSecurityEvents: true,
          logRetentionDays: 60,
          enablePerformanceMonitoring: true,
          performanceThresholds: {
            responseTime: 3000,
            memoryUsage: 70,
            cpuUsage: 80
          }
        }
      };

    case 'production':
      return {
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
          uploadMaxRequests: 5
        },
        fileUpload: {
          maxFileSize: 10 * 1024 * 1024, // 10MB
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
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
          scanForMalware: true,
          quarantineFolder: './uploads/quarantine',
          enableMagicBytesCheck: true,
          enableFileSignatureValidation: true,
          enableContentTypeValidation: true,
          enableImageProcessing: true,
          imageProcessingOptions: {
            resize: { maxWidth: 1920, maxHeight: 1080 },
            quality: 90,
            format: 'jpeg'
          },
          virusScanTimeout: 30000,
          maxFilesPerRequest: 3,
          maxTotalSizePerRequest: 10 * 1024 * 1024,
          tempFolder: './uploads/temp',
          cleanupTempFiles: true,
          tempFileExpiry: 12 * 60 * 60 * 1000
        },
        monitoring: {
          enableSecurityMonitoring: true,
          enableRealTimeAlerts: true,
          alertChannels: ['log', 'email', 'webhook'],
          alertThresholds: {
            rateLimitViolations: 5,
            sqlInjectionAttempts: 1,
            xssAttempts: 2,
            fileUploadViolations: 2,
            authenticationFailures: 10
          },
          enableDetailedLogging: true,
          logSecurityEvents: true,
          logRetentionDays: 90,
          enablePerformanceMonitoring: true,
          performanceThresholds: {
            responseTime: 2000,
            memoryUsage: 60,
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
          encryptionAlgorithm: 'AES-256-GCM',
          sessionTimeout: 24 * 60 * 60 * 1000,
          sessionRenewalThreshold: 60 * 60 * 1000,
          maxConcurrentSessions: 2,
          enableAPIVersioning: true,
          enableAPIDocumentation: false,
          enableAPIRateLimitPerUser: true,
          enableCacheSecurity: true,
          cacheSecurityHeaders: true,
          preventCacheLeakage: true
        }
      };

    default:
      return {};
  }
};

// Helper untuk merge configuration
export const mergeSecurityConfig = (
  baseConfig: SecurityConfig,
  overrideConfig: Partial<SecurityConfig>
): SecurityConfig => {
  return {
    ...baseConfig,
    ...overrideConfig,
    rateLimiting: {
      ...baseConfig.rateLimiting,
      ...overrideConfig.rateLimiting
    },
    sanitization: {
      ...baseConfig.sanitization,
      ...overrideConfig.sanitization
    },
    fileUpload: {
      ...baseConfig.fileUpload,
      ...overrideConfig.fileUpload
    },
    monitoring: {
      ...baseConfig.monitoring,
      ...overrideConfig.monitoring
    },
    advanced: {
      ...baseConfig.advanced,
      ...overrideConfig.advanced
    }
  };
};

// Helper untuk validasi security config
export const validateSecurityConfigHelper = (config: SecurityConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validasi rate limiting
  if (!config.rateLimiting?.maxRequests || config.rateLimiting.maxRequests <= 0) {
    errors.push('Rate limiting maxRequests must be greater than 0');
  }

  if (config.rateLimiting?.maxRequests > 1000) {
    warnings.push('High rate limit may impact security');
  }

  // Validasi file upload
  if (!config.fileUpload?.maxFileSize || config.fileUpload.maxFileSize <= 0) {
    errors.push('File upload maxFileSize must be greater than 0');
  }

  if (config.fileUpload?.maxFileSize > 100 * 1024 * 1024) {
    warnings.push('Very large file upload limit may impact performance');
  }

  // Validasi sanitization
  if (!config.sanitization?.maxStringLength || config.sanitization.maxStringLength <= 0) {
    errors.push('Sanitization maxStringLength must be greater than 0');
  }

  // Validasi monitoring
  if (config.monitoring?.enableRealTimeAlerts && !config.monitoring?.enableDetailedLogging) {
    warnings.push('Real-time alerts enabled but detailed logging not specified');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Helper untuk generate security report
export const generateSecurityConfigReport = (config: SecurityConfig): {
  summary: {
    environment: string;
    securityLevel: 'low' | 'medium' | 'high' | 'critical';
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
  };
  details: {
    rateLimiting: {
      enabled: boolean;
      maxRequests: number;
      progressiveLimiting: boolean;
      smartLimiting: boolean;
    };
    fileUpload: {
      enabled: boolean;
      maxFileSize: number;
      malwareScanning: boolean;
      contentValidation: boolean;
    };
    sanitization: {
      enabled: boolean;
      xssProtection: boolean;
      sqlInjectionProtection: boolean;
      maxStringLength: number;
    };
    monitoring: {
      enabled: boolean;
      realTimeAlerts: boolean;
      performanceTracking: boolean;
      securityMetrics: boolean;
    };
    advanced: {
      csrfProtection: boolean;
      xssProtection: boolean;
      contentSecurityPolicy: boolean;
      hsts: boolean;
      frameOptions: boolean;
    };
  };
} => {
  const rateLimiting = config.rateLimiting;
  const fileUpload = config.fileUpload;
  const sanitization = config.sanitization;
  const monitoring = config.monitoring;
  const advanced = config.advanced;

  // Calculate security level
  let totalChecks = 0;
  let passedChecks = 0;

  // Rate limiting checks
  totalChecks += 3;
  if (rateLimiting?.maxRequests && rateLimiting.maxRequests <= 100) passedChecks++;
  if (rateLimiting?.enableProgressiveLimiting) passedChecks++;
  if (rateLimiting?.enableSmartLimiting) passedChecks++;

  // File upload checks
  totalChecks += 3;
  if (fileUpload?.maxFileSize && fileUpload.maxFileSize <= 25 * 1024 * 1024) passedChecks++;
  if (fileUpload?.scanForMalware) passedChecks++;
  if (fileUpload?.enableMagicBytesCheck) passedChecks++;

  // Sanitization checks
  totalChecks += 3;
  if (sanitization?.enableXSSProtection) passedChecks++;
  if (sanitization?.enableSQLInjectionProtection) passedChecks++;
  if (sanitization?.maxStringLength && sanitization.maxStringLength <= 10000) passedChecks++;

  // Monitoring checks
  totalChecks += 2;
  if (monitoring?.enableRealTimeAlerts) passedChecks++;
  if (monitoring?.enableSecurityMonitoring) passedChecks++;

  // Advanced checks
  totalChecks += 5;
  if (advanced?.enableCSRFProtection) passedChecks++;
  if (advanced?.enableClickjackingProtection) passedChecks++;
  if (advanced?.enableMIMESniffingProtection) passedChecks++;
  if (advanced?.enableSessionSecurity) passedChecks++;
  if (advanced?.enableRequestValidation) passedChecks++;

  const securityLevel = passedChecks / totalChecks >= 0.8 ? 'high' :
                       passedChecks / totalChecks >= 0.6 ? 'medium' :
                       passedChecks / totalChecks >= 0.4 ? 'low' : 'critical';

  return {
    summary: {
      environment: process.env.NODE_ENV || 'development',
      securityLevel,
      totalChecks,
      passedChecks,
      failedChecks: totalChecks - passedChecks
    },
    details: {
      rateLimiting: {
        enabled: !!rateLimiting?.maxRequests,
        maxRequests: rateLimiting?.maxRequests || 0,
        progressiveLimiting: !!rateLimiting?.enableProgressiveLimiting,
        smartLimiting: !!rateLimiting?.enableSmartLimiting
      },
      fileUpload: {
        enabled: !!fileUpload?.maxFileSize,
        maxFileSize: fileUpload?.maxFileSize || 0,
        malwareScanning: !!fileUpload?.scanForMalware,
        contentValidation: !!fileUpload?.enableMagicBytesCheck
      },
      sanitization: {
        enabled: !!sanitization?.enableXSSProtection || !!sanitization?.enableSQLInjectionProtection,
        xssProtection: !!sanitization?.enableXSSProtection,
        sqlInjectionProtection: !!sanitization?.enableSQLInjectionProtection,
        maxStringLength: sanitization?.maxStringLength || 0
      },
      monitoring: {
        enabled: !!monitoring?.enableRealTimeAlerts || !!monitoring?.enableSecurityMonitoring,
        realTimeAlerts: !!monitoring?.enableRealTimeAlerts,
        performanceTracking: !!monitoring?.enablePerformanceMonitoring,
        securityMetrics: !!monitoring?.enableSecurityMonitoring
      },
      advanced: {
        csrfProtection: !!advanced?.enableCSRFProtection,
        xssProtection: !!advanced?.enableClickjackingProtection,
        contentSecurityPolicy: !!advanced?.enableMIMESniffingProtection,
        hsts: !!advanced?.enableSessionSecurity,
        frameOptions: !!advanced?.enableRequestValidation
      }
    }
  };
};

// Helper untuk quick security setup
export const quickSecuritySetup = (environment: 'development' | 'staging' | 'production') => {
  const defaultConfig = getDefaultConfigForEnvironment(environment);
  const validation = validateSecurityConfigHelper(defaultConfig as SecurityConfig);
  
  return {
    config: defaultConfig,
    validation,
    recommendations: validation.warnings.map(warning => `⚠️ ${warning}`)
  };
};
