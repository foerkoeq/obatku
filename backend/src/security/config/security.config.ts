// ======================================
// SECURITY CONFIGURATION - ENHANCED
// ======================================
// Centralized security configuration with enhanced modularity
// Dapat dikustomisasi per environment dan use case

import { SecurityConfig } from '../types/security.types';

export class SecurityConfigBuilder {
  private config: SecurityConfig;

  constructor() {
    this.config = this.getDefaultConfig();
  }

  private getDefaultConfig(): SecurityConfig {
    return {
      rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        standardHeaders: true,
        legacyHeaders: false,
        // Enhanced rate limiting options
        enableProgressiveLimiting: true,
        progressivePenalty: 2, // Multiply penalty for repeat offenders
        enableSmartLimiting: false,
        whitelistIPs: [],
        blacklistIPs: [],
        // Authentication specific limits
        authWindowMs: 5 * 60 * 1000, // 5 minutes for auth
        authMaxRequests: 5, // 5 login attempts per 5 minutes
        // API specific limits
        apiWindowMs: 1 * 60 * 1000, // 1 minute for API
        apiMaxRequests: 60, // 60 requests per minute
        // Upload specific limits
        uploadWindowMs: 10 * 60 * 1000, // 10 minutes for uploads
        uploadMaxRequests: 10, // 10 uploads per 10 minutes
      },
      sanitization: {
        stripHtml: true,
        normalizeEmail: true,
        escapeSpecialChars: true,
        maxStringLength: 10000,
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
        allowedAttributes: {
          'a': ['href', 'title'],
          'img': ['src', 'alt', 'title'],
          'p': ['class'],
          'span': ['class']
        },
        // Enhanced sanitization options
        enableXSSProtection: true,
        enableSQLInjectionProtection: true,
        enablePathTraversalProtection: true,
        enableCommandInjectionProtection: true,
        // Custom sanitization rules
        customRules: {
          email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            maxLength: 254
          },
          phone: {
            pattern: /^[\+]?[0-9\s\-\(\)]{8,15}$/,
            maxLength: 20
          },
          url: {
            pattern: /^https?:\/\/[^\s\/$.?#].[^\s]*$/i,
            maxLength: 2048
          },
          nip: {
            pattern: /^[0-9]{18,20}$/,
            maxLength: 20
          }
        },
        // Field-specific sanitization
        fieldSanitization: {
          name: { stripHtml: true, maxLength: 255 },
          email: { normalizeEmail: true, maxLength: 254 },
          phone: { escapeSpecialChars: false, maxLength: 20 },
          description: { stripHtml: true, maxLength: 1000 },
          notes: { stripHtml: true, maxLength: 2000 }
        }
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
        // Enhanced file validation
        enableMagicBytesCheck: true,
        enableFileSignatureValidation: true,
        enableContentTypeValidation: true,
        // File processing options
        enableImageProcessing: true,
        imageProcessingOptions: {
          resize: { maxWidth: 1920, maxHeight: 1080 },
          quality: 85,
          format: 'jpeg'
        },
        // Virus scanning configuration
        virusScanCommand: process.env.VIRUS_SCAN_COMMAND || 'clamscan',
        virusScanTimeout: 30000, // 30 seconds
        // Upload restrictions
        maxFilesPerRequest: 5,
        maxTotalSizePerRequest: 50 * 1024 * 1024, // 50MB total
        // Temporary file handling
        tempFolder: './uploads/temp',
        cleanupTempFiles: true,
        tempFileExpiry: 24 * 60 * 60 * 1000 // 24 hours
      },
      headers: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            workerSrc: ["'self'"],
            manifestSrc: ["'self'"]
          },
          reportOnly: false,
          reportUri: process.env.CSP_REPORT_URI
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
          usb: [],
          magnetometer: [],
          gyroscope: [],
          accelerometer: []
        },
        // Additional security headers
        crossOriginEmbedderPolicy: 'require-corp',
        crossOriginOpenerPolicy: 'same-origin',
        crossOriginResourcePolicy: 'same-origin',
        originAgentCluster: true,
        // Custom headers
        customHeaders: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'X-Download-Options': 'noopen',
          'X-Permitted-Cross-Domain-Policies': 'none'
        }
      },
      sqlPrevention: {
        enablePreparedStatements: true,
        enableQueryLogging: true,
        blockSuspiciousPatterns: true,
        suspiciousPatterns: [
          // SQL Injection patterns
          'union.*select',
          'drop.*table',
          'delete.*from',
          'insert.*into',
          'update.*set',
          'exec.*',
          'execute.*',
          'sp_.*',
          'xp_.*',
          '--.*',
          '/\\*.*\\*/',
          'waitfor.*delay',
          'benchmark.*',
          'sleep.*',
          // XSS patterns
          'script.*',
          'javascript:',
          'vbscript:',
          'onload.*=',
          'onerror.*=',
          'onclick.*=',
          'onmouseover.*=',
          // Command injection patterns
          '\\|.*',
          ';.*',
          '`.*`',
          '\\$\\(',
          'eval\\(',
          'exec\\(',
          // Path traversal patterns
          '\\.\\./',
          '\\.\\.\\\\',
          '%2e%2e%2f',
          '%2e%2e%5c',
          // Other dangerous patterns
          'data:text/html',
          'vbscript:',
          'expression\\(',
          'url\\('
        ],
        enableQueryValidation: true,
        // Enhanced SQL prevention
        enableParameterValidation: true,
        enableQueryLengthLimit: true,
        maxQueryLength: 10000,
        // Whitelist validation
        allowedFields: [
          'id', 'name', 'email', 'phone', 'description', 'notes',
          'title', 'content', 'status', 'type', 'category',
          'quantity', 'price', 'date', 'created_at', 'updated_at'
        ],
        // Query monitoring
        enableQueryMonitoring: true,
        suspiciousQueryThreshold: 5,
        // Prepared statement validation
        validatePreparedStatements: true,
        requireParameterizedQueries: true
      },
      testing: {
        enablePenetrationTesting: process.env.NODE_ENV === 'development',
        testFrequency: 'daily',
        reportPath: './logs/security-reports',
        alertThreshold: 5,
        // Enhanced testing options
        enableAutomatedTesting: true,
        testTypes: ['sql_injection', 'xss', 'file_upload', 'rate_limiting', 'authentication'],
        // Test configuration
        testTimeout: 30000, // 30 seconds
        maxTestConcurrency: 5,
        // Reporting options
        enableDetailedReports: true,
        enableEmailAlerts: false,
        alertEmailRecipients: [],
        // Test data
        testDataPath: './tests/fixtures/security',
        enableTestDataCleanup: true
      },
      // New: Monitoring and alerting
      monitoring: {
        enableSecurityMonitoring: true,
        enableRealTimeAlerts: true,
        alertChannels: ['log', 'email'], // 'log', 'email', 'webhook', 'slack'
        // Email alert configuration
        enableEmailAlerts: false,
        alertEmailRecipients: [],
        // Alert thresholds
        alertThresholds: {
          rateLimitViolations: 10,
          sqlInjectionAttempts: 3,
          xssAttempts: 5,
          fileUploadViolations: 5,
          authenticationFailures: 20
        },
        // Logging configuration
        enableDetailedLogging: true,
        logSecurityEvents: true,
        logRetentionDays: 90,
        // Performance monitoring
        enablePerformanceMonitoring: true,
        performanceThresholds: {
          responseTime: 5000, // 5 seconds
          memoryUsage: 80, // 80% of available memory
          cpuUsage: 90 // 90% of CPU
        }
      },
      // New: Advanced security features
      advanced: {
        enableRequestValidation: true,
        enableResponseSanitization: false,
        enableSessionSecurity: true,
        enableCSRFProtection: true,
        enableClickjackingProtection: true,
        enableMIMESniffingProtection: true,
        // Encryption options
        enableResponseEncryption: false,
        encryptionAlgorithm: 'AES-256-GCM',
        // Session security
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        sessionRenewalThreshold: 60 * 60 * 1000, // 1 hour
        maxConcurrentSessions: 3,
        // API security
        enableAPIVersioning: true,
        enableAPIDocumentation: true,
        enableAPIRateLimitPerUser: true,
        // Cache security
        enableCacheSecurity: true,
        cacheSecurityHeaders: true,
        preventCacheLeakage: true
      }
    };
  }

  // Enhanced fluent interface methods
  withRateLimit(windowMs: number, maxRequests: number): SecurityConfigBuilder {
    this.config.rateLimiting.windowMs = windowMs;
    this.config.rateLimiting.maxRequests = maxRequests;
    return this;
  }

  withAuthRateLimit(windowMs: number, maxRequests: number): SecurityConfigBuilder {
    this.config.rateLimiting.authWindowMs = windowMs;
    this.config.rateLimiting.authMaxRequests = maxRequests;
    return this;
  }

  withAPIRateLimit(windowMs: number, maxRequests: number): SecurityConfigBuilder {
    this.config.rateLimiting.apiWindowMs = windowMs;
    this.config.rateLimiting.apiMaxRequests = maxRequests;
    return this;
  }

  withUploadRateLimit(windowMs: number, maxRequests: number): SecurityConfigBuilder {
    this.config.rateLimiting.uploadWindowMs = windowMs;
    this.config.rateLimiting.uploadMaxRequests = maxRequests;
    return this;
  }

  withFileUploadLimits(maxSize: number, allowedTypes: string[]): SecurityConfigBuilder {
    this.config.fileUpload.maxFileSize = maxSize;
    this.config.fileUpload.allowedMimeTypes = allowedTypes;
    return this;
  }

  withCustomCSP(directives: Record<string, string[]>): SecurityConfigBuilder {
    this.config.headers.contentSecurityPolicy.directives = directives;
    return this;
  }

  withCustomSanitization(options: Partial<SecurityConfig['sanitization']>): SecurityConfigBuilder {
    this.config.sanitization = { ...this.config.sanitization, ...options };
    return this;
  }

  withFieldSanitization(fieldSanitization: Record<string, any>): SecurityConfigBuilder {
    this.config.sanitization.fieldSanitization = fieldSanitization;
    return this;
  }

  enableMalwareScanning(enable: boolean): SecurityConfigBuilder {
    this.config.fileUpload.scanForMalware = enable;
    return this;
  }

  withCustomSQLPatterns(patterns: string[]): SecurityConfigBuilder {
    this.config.sqlPrevention.suspiciousPatterns = patterns;
    return this;
  }

  withAllowedFields(fields: string[]): SecurityConfigBuilder {
    this.config.sqlPrevention.allowedFields = fields;
    return this;
  }

  withMonitoringOptions(options: Partial<SecurityConfig['monitoring']>): SecurityConfigBuilder {
    this.config.monitoring = { ...this.config.monitoring, ...options };
    return this;
  }

  withAdvancedOptions(options: Partial<SecurityConfig['advanced']>): SecurityConfigBuilder {
    this.config.advanced = { ...this.config.advanced, ...options };
    return this;
  }

  withWhitelistIPs(ips: string[]): SecurityConfigBuilder {
    this.config.rateLimiting.whitelistIPs = ips;
    return this;
  }

  withBlacklistIPs(ips: string[]): SecurityConfigBuilder {
    this.config.rateLimiting.blacklistIPs = ips;
    return this;
  }

  enableProgressiveLimiting(enable: boolean): SecurityConfigBuilder {
    this.config.rateLimiting.enableProgressiveLimiting = enable;
    return this;
  }

  enableSmartLimiting(enable: boolean): SecurityConfigBuilder {
    this.config.rateLimiting.enableSmartLimiting = enable;
    return this;
  }

  forEnvironment(env: 'development' | 'staging' | 'production'): SecurityConfigBuilder {
    switch (env) {
      case 'development':
        this.config.rateLimiting.maxRequests = 1000;
        this.config.rateLimiting.authMaxRequests = 20;
        this.config.rateLimiting.apiMaxRequests = 200;
        this.config.testing.enablePenetrationTesting = true;
        this.config.headers.contentSecurityPolicy.reportOnly = true;
        this.config.monitoring.enableDetailedLogging = true;
        this.config.advanced.enableAPIDocumentation = true;
        break;
      case 'staging':
        this.config.rateLimiting.maxRequests = 500;
        this.config.rateLimiting.authMaxRequests = 10;
        this.config.rateLimiting.apiMaxRequests = 100;
        this.config.testing.enablePenetrationTesting = true;
        this.config.monitoring.enableRealTimeAlerts = true;
        break;
      case 'production':
        this.config.rateLimiting.maxRequests = 100;
        this.config.rateLimiting.authMaxRequests = 5;
        this.config.rateLimiting.apiMaxRequests = 60;
        this.config.testing.enablePenetrationTesting = false;
        this.config.headers.hsts.preload = true;
        this.config.monitoring.enableRealTimeAlerts = true;
        this.config.advanced.enableResponseEncryption = false;
        this.config.advanced.enableAPIDocumentation = false;
        break;
    }
    return this;
  }

  build(): SecurityConfig {
    return { ...this.config };
  }
}

// Enhanced factory methods
export class SecurityConfigFactory {
  static forDevelopment(): SecurityConfig {
    return new SecurityConfigBuilder()
      .forEnvironment('development')
      .withRateLimit(60 * 1000, 1000) // 1 minute, 1000 requests
      .withAuthRateLimit(5 * 60 * 1000, 20) // 5 minutes, 20 auth attempts
      .withAPIRateLimit(60 * 1000, 200) // 1 minute, 200 API requests
      .enableProgressiveLimiting(false)
      .enableSmartLimiting(false)
      .build();
  }

  static forStaging(): SecurityConfig {
    return new SecurityConfigBuilder()
      .forEnvironment('staging')
      .withRateLimit(5 * 60 * 1000, 500) // 5 minutes, 500 requests
      .withAuthRateLimit(5 * 60 * 1000, 10) // 5 minutes, 10 auth attempts
      .withAPIRateLimit(60 * 1000, 100) // 1 minute, 100 API requests
      .enableProgressiveLimiting(true)
      .enableSmartLimiting(true)
      .build();
  }

  static forProduction(): SecurityConfig {
    return new SecurityConfigBuilder()
      .forEnvironment('production')
      .withRateLimit(15 * 60 * 1000, 100) // 15 minutes, 100 requests
      .withAuthRateLimit(5 * 60 * 1000, 5) // 5 minutes, 5 auth attempts
      .withAPIRateLimit(60 * 1000, 60) // 1 minute, 60 API requests
      .enableMalwareScanning(true)
      .enableProgressiveLimiting(true)
      .enableSmartLimiting(true)
      .build();
  }

  static forHighSecurity(): SecurityConfig {
    return new SecurityConfigBuilder()
      .forEnvironment('production')
      .withRateLimit(15 * 60 * 1000, 50) // 15 minutes, 50 requests
      .withAuthRateLimit(5 * 60 * 1000, 3) // 5 minutes, 3 auth attempts
      .withAPIRateLimit(60 * 1000, 30) // 1 minute, 30 API requests
      .enableMalwareScanning(true)
      .enableProgressiveLimiting(true)
      .enableSmartLimiting(true)
      .withCustomCSP({
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      })
      .build();
  }

  static custom(): SecurityConfigBuilder {
    return new SecurityConfigBuilder();
  }
}

// Export main config instance based on environment
export const securityConfig = process.env.NODE_ENV === 'production' 
  ? SecurityConfigFactory.forProduction()
  : process.env.NODE_ENV === 'staging'
  ? SecurityConfigFactory.forStaging()
  : SecurityConfigFactory.forDevelopment();
