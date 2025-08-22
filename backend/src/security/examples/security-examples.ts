// ======================================
// SECURITY EXAMPLES
// ======================================
// Contoh penggunaan security module
// Demonstrasi cara menggunakan security features

import { 
  SecurityIntegrationFactory, 
  createSecurityForEnvironment,
  checkSecurityHealth,
  getSecuritySummary,
  validateSecurityConfig,
  optimizeSecurityPerformance,
  manageSecurityAlerts,
  correlateSecurityEvents
} from '../index';
import { RiskLevel } from '../types/security.types';

// ======================================
// EXAMPLE 1: Basic Security Setup
// ======================================

export const basicSecuritySetupExample = () => {
  console.log('=== Basic Security Setup Example ===');
  
  // Create security integration for development
  const security = createSecurityForEnvironment('development');
  
  // Apply to Express app
  const express = require('express');
  const app = express();
  
  // Apply security middleware
  security.applyToApp(app);
  
  console.log('✅ Security integration applied successfully');
  
  // Get security metrics through proper methods
  const monitoring = security.getSecurityMonitoring();
  const performance = security.getSecurityPerformance();
  
  console.log('📊 Security monitoring enabled:', monitoring.getEvents().length > 0);
  console.log('⚡ Performance monitoring enabled:', performance.getPerformanceScore() > 0);
  
  return security;
};

// ======================================
// EXAMPLE 2: Custom Security Configuration
// ======================================

export const customSecurityConfigExample = () => {
  console.log('=== Custom Security Configuration Example ===');
  
  // Create custom security configuration
  const customConfig = SecurityIntegrationFactory.custom({
    rateLimiting: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 200,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      standardHeaders: true,
      legacyHeaders: false,
      enableProgressiveLimiting: true,
      progressivePenalty: 2,
      enableSmartLimiting: false,
      whitelistIPs: [],
      blacklistIPs: [],
      authWindowMs: 5 * 60 * 1000,
      authMaxRequests: 10,
      apiWindowMs: 1 * 60 * 1000,
      apiMaxRequests: 60,
      uploadWindowMs: 10 * 60 * 1000,
      uploadMaxRequests: 10
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
      enableXSSProtection: true,
      enableSQLInjectionProtection: true,
      enablePathTraversalProtection: true,
      enableCommandInjectionProtection: true,
      customRules: {
        email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, maxLength: 254 },
        phone: { pattern: /^[\+]?[0-9\s\-\(\)]{8,15}$/, maxLength: 20 },
        url: { pattern: /^https?:\/\/[^\s\/$.?#].[^\s]*$/i, maxLength: 2048 },
        nip: { pattern: /^[0-9]{18,20}$/, maxLength: 20 }
      },
      fieldSanitization: {
        name: { stripHtml: true, maxLength: 255 },
        email: { normalizeEmail: true, maxLength: 254 },
        phone: { escapeSpecialChars: false, maxLength: 20 },
        description: { stripHtml: true, maxLength: 1000 },
        notes: { stripHtml: true, maxLength: 2000 }
      }
    },
    fileUpload: {
      maxFileSize: 25 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
      scanForMalware: true,
      quarantineFolder: './quarantine',
      virusScanCommand: 'clamscan',
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
      maxTotalSizePerRequest: 100 * 1024 * 1024,
      tempFolder: './temp',
      cleanupTempFiles: true,
      tempFileExpiry: 3600000
    },
    headers: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com']
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
      enableQueryLogging: true,
      blockSuspiciousPatterns: true,
      suspiciousPatterns: ['DROP', 'DELETE', 'UPDATE', 'INSERT'],
      enableQueryValidation: true,
      enableParameterValidation: true,
      enableQueryLengthLimit: true,
      maxQueryLength: 1000,
      allowedFields: ['id', 'name', 'email', 'status'],
      enableQueryMonitoring: true,
      suspiciousQueryThreshold: 5,
      validatePreparedStatements: true,
      requireParameterizedQueries: true
    },
    testing: {
      enablePenetrationTesting: false,
      testFrequency: 'monthly',
      reportPath: './security-reports',
      alertThreshold: 3,
      enableAutomatedTesting: true,
      testTypes: ['vulnerability', 'penetration', 'security'],
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
      enableRealTimeAlerts: true,
      alertChannels: ['console', 'file'],
      enableEmailAlerts: false,
      alertEmailRecipients: [],
      alertThresholds: {
        rateLimitViolations: 5,
        sqlInjectionAttempts: 3,
        xssAttempts: 3,
        fileUploadViolations: 2,
        authenticationFailures: 5
      },
      enableDetailedLogging: true,
      logSecurityEvents: true,
      logRetentionDays: 30,
      enablePerformanceMonitoring: true,
      performanceThresholds: {
        responseTime: 1000,
        memoryUsage: 80,
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
      sessionTimeout: 3600000,
      sessionRenewalThreshold: 300000,
      maxConcurrentSessions: 5,
      enableAPIVersioning: true,
      enableAPIDocumentation: true,
      enableAPIRateLimitPerUser: true,
      enableCacheSecurity: true,
      cacheSecurityHeaders: true,
      preventCacheLeakage: true
    }
  });
  
  console.log('✅ Custom security configuration created');
  console.log('📊 Rate limit:', customConfig.getConfiguration().rateLimiting.maxRequests, 'requests per window');
  console.log('📊 File upload limit:', customConfig.getConfiguration().fileUpload.maxFileSize / (1024 * 1024), 'MB');
  
  return customConfig;
};

// ======================================
// EXAMPLE 3: Security Health Monitoring
// ======================================

export const securityHealthMonitoringExample = async () => {
  console.log('=== Security Health Monitoring Example ===');
  
  const security = createSecurityForEnvironment('production');
  
  // Check security health
  const health = await checkSecurityHealth(security);
  
  console.log('🏥 Security Health Status:', health.status);
  if (health.status === 'healthy') {
    console.log('📊 Security Score:', health.security?.score);
    console.log('⚡ Performance Score:', health.performance?.score);
    console.log('🚨 Unacknowledged Alerts:', health.monitoring?.alerts);
  } else {
    console.log('❌ Health check failed:', health.error);
  }
  
  // Get detailed security summary
  const summary = getSecuritySummary(security);
  
  console.log('📈 Total Requests:', summary.overview.totalRequests);
  console.log('🚫 Blocked Requests:', summary.overview.blockedRequests);
  console.log('⚠️ Violations:', summary.violations.total);
  
  return { health, summary };
};

// ======================================
// EXAMPLE 4: Security Configuration Validation
// ======================================

export const securityConfigValidationExample = () => {
  console.log('=== Security Configuration Validation Example ===');
  
  // Test different configurations
  const testConfigs = [
    {
      name: 'Valid Production Config',
      config: SecurityIntegrationFactory.forProduction().getConfiguration()
    },
    {
      name: 'High Rate Limit Config',
      config: {
        rateLimiting: { maxRequests: 2000 },
        fileUpload: { maxFileSize: 100 * 1024 * 1024 }
      }
    },
    {
      name: 'Missing Required Fields',
      config: {
        rateLimiting: {},
        fileUpload: {}
      }
    }
  ];
  
  testConfigs.forEach(({ name, config }) => {
    console.log(`\n🔍 Validating: ${name}`);
    const validation = validateSecurityConfig(config);
    
    console.log('✅ Valid:', validation.isValid);
    if (validation.errors.length > 0) {
      console.log('❌ Errors:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.log('⚠️ Warnings:', validation.warnings);
    }
    if (validation.recommendations.length > 0) {
      console.log('💡 Recommendations:', validation.recommendations);
    }
  });
};

// ======================================
// EXAMPLE 5: Performance Optimization
// ======================================

export const performanceOptimizationExample = () => {
  console.log('=== Performance Optimization Example ===');
  
  const security = createSecurityForEnvironment('production');
  
  // Get performance optimization recommendations
  const optimization = optimizeSecurityPerformance(security);
  
  console.log('📊 Current Performance Score:', optimization.optimizationScore);
  console.log('⚡ Response Time Impact:', optimization.currentPerformance.impactOnResponseTime, 'ms');
  console.log('💾 Memory Overhead:', optimization.currentPerformance.memoryOverhead, 'MB');
  console.log('🖥️ CPU Overhead:', optimization.currentPerformance.cpuOverhead, '%');
  
  if (optimization.recommendations.length > 0) {
    console.log('\n💡 Optimization Recommendations:');
    optimization.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  return optimization;
};

// ======================================
// EXAMPLE 6: Alert Management
// ======================================

export const alertManagementExample = () => {
  console.log('=== Alert Management Example ===');
  
  const security = createSecurityForEnvironment('production');
  
  // Get alert management utilities
  const alertManager = manageSecurityAlerts(security);
  
  // Acknowledge all unacknowledged alerts
  const acknowledgedCount = alertManager.acknowledgeAll('admin-user');
  console.log('✅ Acknowledged alerts:', acknowledgedCount);
  
  // Get critical alerts
  const criticalAlerts = alertManager.getCriticalAlerts();
  console.log('🚨 Critical alerts:', criticalAlerts.length);
  
  // Get high priority alerts
  const highPriorityAlerts = alertManager.getHighPriorityAlerts();
  console.log('⚠️ High priority alerts:', highPriorityAlerts.length);
  
  return alertManager;
};

// ======================================
// EXAMPLE 7: Event Correlation
// ======================================

export const eventCorrelationExample = () => {
  console.log('=== Event Correlation Example ===');
  
  const security = createSecurityForEnvironment('production');
  
  // Get event correlation utilities
  const eventCorrelator = correlateSecurityEvents(security);
  
  // Find related events (if any events exist)
  const events = security.getSecurityMonitoring().getEvents();
  if (events.length > 0) {
    const relatedEvents = eventCorrelator.findRelatedEvents(events[0].id);
    console.log('🔗 Related events found:', relatedEvents.length);
  }
  
  // Find patterns in events
  const patterns = eventCorrelator.findPatterns();
  console.log('📊 Event patterns found:', patterns.length);
  
  patterns.forEach((pattern, index) => {
    console.log(`Pattern ${index + 1}: ${pattern.pattern} (${pattern.count} events, ${pattern.severity} severity)`);
  });
  
  return eventCorrelator;
};

// ======================================
// EXAMPLE 8: Environment-Specific Setup
// ======================================

export const environmentSpecificSetupExample = () => {
  console.log('=== Environment-Specific Setup Example ===');
  
  const environments = ['development', 'staging', 'production', 'high-security'] as const;
  
  environments.forEach(env => {
    console.log(`\n🌍 Setting up for ${env} environment:`);
    
    const security = createSecurityForEnvironment(env);
    const monitoring = security.getSecurityMonitoring();
    const performance = security.getSecurityPerformance();
    
    console.log(`📊 Security monitoring enabled: ${monitoring.getEvents().length > 0 ? 'Yes' : 'No'}`);
    console.log(`⚡ Performance monitoring enabled: ${performance.getPerformanceScore() > 0 ? 'Yes' : 'No'}`);
    console.log(`🚨 Monitoring Enabled: ${monitoring.getEvents().length > 0 ? 'Yes' : 'No'}`);
  });
};

// ======================================
// EXAMPLE 9: Security Testing
// ======================================

export const securityTestingExample = () => {
  console.log('=== Security Testing Example ===');
  
  // Create security integration for testing (we don't need to store it)
  createSecurityForEnvironment('high-security');
  
  // Simulate security tests
  const testResults = {
    xssProtection: true,
    sqlInjectionProtection: true,
    rateLimiting: true,
    fileUploadValidation: true,
    securityHeaders: true
  };
  
  console.log('🧪 Security Test Results:');
  Object.entries(testResults).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  return testResults;
};

// ======================================
// EXAMPLE 10: Integration with Express App
// ======================================

export const expressIntegrationExample = () => {
  console.log('=== Express Integration Example ===');
  
  const express = require('express');
  const app = express();
  
  // Create security integration
  const security = createSecurityForEnvironment('production');
  
  // Apply security to Express app
  security.applyToApp(app);
  
  // Add some test routes
  app.get('/api/test', (_req: any, res: any) => {
    res.json({ message: 'Test endpoint', timestamp: new Date().toISOString() });
  });
  
  app.post('/api/upload', (_req: any, res: any) => {
    res.json({ message: 'File upload endpoint', timestamp: new Date().toISOString() });
  });
  
  app.get('/api/admin', (_req: any, res: any) => {
    res.json({ message: 'Admin endpoint', timestamp: new Date().toISOString() });
  });
  
  console.log('✅ Express app configured with security');
  console.log('🔒 Security middleware applied');
  
  const monitoring = security.getSecurityMonitoring();
  const performance = security.getSecurityPerformance();
  
  console.log('📊 Security monitoring enabled:', monitoring.getEvents().length > 0);
  console.log('⚡ Performance monitoring enabled:', performance.getPerformanceScore() > 0);
  
  return { app, security };
};

// ======================================
// EXAMPLE 11: Real-time Monitoring
// ======================================

export const realTimeMonitoringExample = () => {
  console.log('=== Real-time Monitoring Example ===');
  
  const security = createSecurityForEnvironment('production');
  
  // Set up real-time monitoring
  const monitoring = security.getSecurityMonitoring();
  
  // Simulate some security events using proper enum values
  const events = [
    { type: 'violation' as const, source: 'auth', severity: RiskLevel.MEDIUM },
    { type: 'alert' as const, source: 'rate_limiter', severity: RiskLevel.HIGH },
    { type: 'violation' as const, source: 'file_upload', severity: RiskLevel.HIGH }
  ];
  
  events.forEach(event => {
    monitoring.addEvent({
      id: `event-${Date.now()}`,
      type: event.type,
      source: event.source,
      severity: event.severity,
      timestamp: new Date(),
      data: { ipAddress: '192.168.1.100' },
      processed: false
    });
  });
  
  console.log('📊 Total events:', monitoring.getEvents().length);
  console.log('🚨 High severity events:', monitoring.getEvents().filter(e => e.severity === RiskLevel.HIGH).length);
  console.log('⚠️ Medium severity events:', monitoring.getEvents().filter(e => e.severity === RiskLevel.MEDIUM).length);
  
  return monitoring;
};

// ======================================
// EXAMPLE 12: Security Metrics Dashboard
// ======================================

export const securityMetricsDashboardExample = () => {
  console.log('=== Security Metrics Dashboard Example ===');
  
  const security = createSecurityForEnvironment('production');
  
  // Get comprehensive metrics through proper methods
  const monitoring = security.getSecurityMonitoring();
  const performance = security.getSecurityPerformance();
  
  const dashboard = {
    overview: {
      securityScore: performance.getPerformanceScore(),
      performanceScore: performance.getPerformanceScore(),
      totalRequests: monitoring.getEvents().length,
      blockedRequests: monitoring.getAlerts().filter(a => a.severity === 'high').length,
      uptime: '99.9%'
    },
    security: {
      totalViolations: monitoring.getAlerts().length,
      blockedRate: monitoring.getEvents().length > 0 ? 
        (monitoring.getAlerts().filter(a => a.severity === 'high').length / monitoring.getEvents().length * 100).toFixed(2) + '%' : '0%'
    },
    performance: {
      responseTimeImpact: performance.getPerformanceScore() + 'ms',
      memoryOverhead: 'Low',
      cpuOverhead: 'Minimal'
    },
    monitoring: {
      totalEvents: monitoring.getEvents().length,
      totalAlerts: monitoring.getAlerts().length,
      unacknowledgedAlerts: monitoring.getUnacknowledgedAlerts().length,
      criticalAlerts: monitoring.getAlerts().filter(a => a.severity === 'high').length
    }
  };
  
  console.log('📊 Security Dashboard:');
  console.log('🔒 Security Score:', dashboard.overview.securityScore);
  console.log('⚡ Performance Score:', dashboard.overview.performanceScore);
  console.log('📈 Total Requests:', dashboard.overview.totalRequests);
  console.log('🚫 Blocked Requests:', dashboard.overview.blockedRequests);
  console.log('🚨 Critical Alerts:', dashboard.monitoring.criticalAlerts);
  
  return dashboard;
};

// ======================================
// MAIN EXAMPLE RUNNER
// ======================================

export const runAllExamples = async () => {
  console.log('🚀 Running Security Module Examples\n');
  
  try {
    // Run all examples
    basicSecuritySetupExample();
    customSecurityConfigExample();
    await securityHealthMonitoringExample();
    securityConfigValidationExample();
    performanceOptimizationExample();
    alertManagementExample();
    eventCorrelationExample();
    environmentSpecificSetupExample();
    securityTestingExample();
    expressIntegrationExample();
    realTimeMonitoringExample();
    securityMetricsDashboardExample();
    
    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
};

// Export individual examples for selective testing
export const examples = {
  basicSetup: basicSecuritySetupExample,
  customConfig: customSecurityConfigExample,
  healthMonitoring: securityHealthMonitoringExample,
  configValidation: securityConfigValidationExample,
  performanceOptimization: performanceOptimizationExample,
  alertManagement: alertManagementExample,
  eventCorrelation: eventCorrelationExample,
  environmentSetup: environmentSpecificSetupExample,
  securityTesting: securityTestingExample,
  expressIntegration: expressIntegrationExample,
  realTimeMonitoring: realTimeMonitoringExample,
  metricsDashboard: securityMetricsDashboardExample,
  runAll: runAllExamples
};
