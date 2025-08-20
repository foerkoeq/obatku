# 🔒 Security Module

Comprehensive security module untuk aplikasi backend dengan fitur-fitur keamanan tingkat enterprise.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Security module ini menyediakan solusi keamanan yang komprehensif untuk aplikasi backend dengan fitur:

- **Rate Limiting**: Proteksi terhadap DDoS dan brute force attacks
- **Input Sanitization**: Proteksi terhadap XSS, SQL Injection, dan serangan lainnya
- **File Upload Security**: Validasi dan scanning file upload
- **Security Headers**: HTTP security headers otomatis
- **Monitoring & Alerting**: Real-time security monitoring
- **Performance Tracking**: Monitoring dampak security pada performa
- **Integration**: Mudah diintegrasikan dengan Express.js

## ✨ Features

### 🔐 Core Security Features

- **Rate Limiting**
  - Configurable rate limits per endpoint
  - Progressive limiting untuk repeat offenders
  - IP whitelist/blacklist
  - Different limits untuk auth, API, dan upload

- **Input Sanitization**
  - XSS protection
  - SQL injection prevention
  - Path traversal protection
  - Command injection protection
  - Custom sanitization rules

- **File Upload Security**
  - MIME type validation
  - File size limits
  - Malware scanning (optional)
  - Content validation
  - Safe file storage

- **Security Headers**
  - Content Security Policy (CSP)
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - HSTS (HTTP Strict Transport Security)

### 📊 Monitoring & Analytics

- **Real-time Monitoring**
  - Security events tracking
  - Alert generation
  - Performance metrics
  - Health checks

- **Security Metrics**
  - Security score calculation
  - Violation tracking
  - Request/response analysis
  - Performance impact measurement

- **Alert Management**
  - Multi-level alerts (low, medium, high, critical)
  - Alert acknowledgment
  - Alert resolution
  - Event correlation

### ⚡ Performance Features

- **Performance Tracking**
  - Response time impact measurement
  - Memory usage monitoring
  - CPU overhead tracking
  - Throughput analysis

- **Optimization**
  - Performance recommendations
  - Bottleneck identification
  - Resource usage optimization
  - Caching strategies

## 🚀 Quick Start

### Basic Setup

```typescript
import { createSecurityForEnvironment } from './security';

// Create security integration for development
const security = createSecurityForEnvironment('development');

// Apply to Express app
const express = require('express');
const app = express();
security.applyToApp(app);
```

### Custom Configuration

```typescript
import { SecurityIntegrationFactory } from './security';

// Create custom security configuration
const customConfig = SecurityIntegrationFactory.custom()
  .withRateLimit(15 * 60 * 1000, 200) // 200 requests per 15 minutes
  .withAuthRateLimit(5 * 60 * 1000, 10) // 10 login attempts per 5 minutes
  .withFileUploadLimits(25 * 1024 * 1024, ['image/jpeg', 'image/png', 'application/pdf'])
  .enableMalwareScanning(true)
  .forEnvironment('production')
  .build();

const security = new SecurityIntegrationFactory(customConfig);
```

### Health Monitoring

```typescript
import { checkSecurityHealth, getSecuritySummary } from './security';

// Check security health
const health = await checkSecurityHealth(security);
console.log('Security Health:', health.status);

// Get detailed summary
const summary = getSecuritySummary(security);
console.log('Security Score:', summary.overview.securityScore);
```

## ⚙️ Configuration

### Environment-Specific Configurations

#### Development
```typescript
const devConfig = {
  rateLimiting: {
    maxRequests: 1000,
    enableProgressiveLimiting: false,
    whitelistIPs: ['127.0.0.1', '::1']
  },
  fileUpload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    scanForMalware: false
  },
  monitoring: {
    enableRealTimeAlerts: false,
    logLevel: 'debug'
  }
};
```

#### Production
```typescript
const prodConfig = {
  rateLimiting: {
    maxRequests: 100,
    enableProgressiveLimiting: true,
    enableSmartLimiting: true
  },
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    scanForMalware: true,
    validateFileContent: true
  },
  monitoring: {
    enableRealTimeAlerts: true,
    enableSecurityMetrics: true,
    logLevel: 'warn'
  },
  advanced: {
    enableCSRFProtection: true,
    enableXSSProtection: true,
    enableContentSecurityPolicy: true,
    enableHSTS: true
  }
};
```

### Configuration Options

#### Rate Limiting
```typescript
rateLimiting: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // requests per window
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  enableProgressiveLimiting: true,
  enableSmartLimiting: true,
  whitelistIPs: [],
  blacklistIPs: [],
  authWindowMs: 5 * 60 * 1000,
  authMaxRequests: 5,
  apiWindowMs: 1 * 60 * 1000,
  apiMaxRequests: 60,
  uploadWindowMs: 10 * 60 * 1000,
  uploadMaxRequests: 10
}
```

#### Input Sanitization
```typescript
sanitization: {
  stripHtml: true,
  normalizeEmail: true,
  escapeSpecialChars: true,
  maxStringLength: 1000,
  allowedTags: ['b', 'i', 'em', 'strong'],
  allowedAttributes: {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'title']
  },
  enableXSSProtection: true,
  enableSQLInjectionProtection: true,
  enablePathTraversalProtection: true,
  enableCommandInjectionProtection: true,
  customRules: {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 254
    }
  }
}
```

#### File Upload
```typescript
fileUpload: {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
  scanForMalware: true,
  validateFileContent: true
}
```

## 📚 API Reference

### Core Functions

#### `createSecurityForEnvironment(env)`
Creates security integration for specific environment.

```typescript
const security = createSecurityForEnvironment('production');
```

#### `checkSecurityHealth(security)`
Checks the health status of security integration.

```typescript
const health = await checkSecurityHealth(security);
// Returns: { status, security, performance, monitoring }
```

#### `getSecuritySummary(security)`
Gets comprehensive security summary.

```typescript
const summary = getSecuritySummary(security);
// Returns: { overview, violations, alerts, performance }
```

#### `validateSecurityConfig(config)`
Validates security configuration.

```typescript
const validation = validateSecurityConfig(config);
// Returns: { isValid, errors, warnings, recommendations }
```

#### `optimizeSecurityPerformance(security)`
Gets performance optimization recommendations.

```typescript
const optimization = optimizeSecurityPerformance(security);
// Returns: { currentPerformance, recommendations, optimizationScore }
```

### Security Integration Methods

#### `security.getSecurityMetrics()`
Gets current security metrics.

```typescript
const metrics = security.getSecurityMetrics();
// Returns: { totalRequests, blockedRequests, securityScore, violationsByType }
```

#### `security.getSecurityPerformance()`
Gets performance metrics.

```typescript
const performance = security.getSecurityPerformance();
const score = performance.getPerformanceScore();
```

#### `security.getSecurityMonitoring()`
Gets monitoring interface.

```typescript
const monitoring = security.getSecurityMonitoring();
const events = monitoring.getEvents();
const alerts = monitoring.getAlerts();
```

#### `security.applyToApp(app)`
Applies security middleware to Express app.

```typescript
const app = express();
security.applyToApp(app);
```

## 🧪 Examples

### Basic Examples

```typescript
import { examples } from './security/examples';

// Run all examples
await examples.runAll();

// Run specific examples
examples.basicSetup();
examples.customConfig();
await examples.healthMonitoring();
```

### Advanced Examples

```typescript
import { 
  basicSecuritySetupExample,
  customSecurityConfigExample,
  securityHealthMonitoringExample
} from './security/examples';

// Basic setup
const security = basicSecuritySetupExample();

// Custom configuration
const customSecurity = customSecurityConfigExample();

// Health monitoring
const health = await securityHealthMonitoringExample();
```

## 🧪 Testing

### Test Utilities

```typescript
import { 
  generateTestSecurityConfig,
  generateTestSecurityEvents,
  generateTestInputs,
  createMockSecurityIntegration
} from './security/testing/security-test-utils';

// Generate test configuration
const testConfig = generateTestSecurityConfig();

// Generate test events
const events = generateTestSecurityEvents(10);

// Generate test inputs
const testInputs = generateTestInputs();

// Create mock integration
const mockSecurity = createMockSecurityIntegration();
```

### Test Examples

```typescript
import { createSecurityTestUtils } from './security/testing/security-test-utils';

const testUtils = createSecurityTestUtils();

// Test XSS protection
const xssResults = testUtils.testXSSProtection(sanitizer);

// Test SQL injection protection
const sqlResults = testUtils.testSQLInjectionProtection(validator);

// Test rate limiting
const rateLimitResults = testUtils.testRateLimiting(limiter, 100);

// Test file upload validation
const fileResults = testUtils.testFileUploadValidation(validator, allowedTypes, maxSize);
```

## 🏆 Best Practices

### 1. Environment-Specific Configuration
```typescript
// Use appropriate configuration for each environment
const security = createSecurityForEnvironment(process.env.NODE_ENV);
```

### 2. Regular Health Checks
```typescript
// Implement regular health checks
setInterval(async () => {
  const health = await checkSecurityHealth(security);
  if (health.status === 'critical') {
    // Send alert
  }
}, 5 * 60 * 1000); // Every 5 minutes
```

### 3. Performance Monitoring
```typescript
// Monitor performance impact
const optimization = optimizeSecurityPerformance(security);
if (optimization.optimizationScore < 70) {
  // Implement optimizations
}
```

### 4. Alert Management
```typescript
// Regularly check and acknowledge alerts
const alertManager = manageSecurityAlerts(security);
const criticalAlerts = alertManager.getCriticalAlerts();
if (criticalAlerts.length > 0) {
  // Handle critical alerts immediately
}
```

### 5. Configuration Validation
```typescript
// Validate configuration before deployment
const validation = validateSecurityConfig(config);
if (!validation.isValid) {
  throw new Error(`Invalid security config: ${validation.errors.join(', ')}`);
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. High Rate of Blocked Requests
```typescript
// Check rate limiting configuration
const metrics = security.getSecurityMetrics();
if (metrics.blockedRequests > metrics.totalRequests * 0.1) {
  // Adjust rate limits or investigate attacks
}
```

#### 2. Performance Issues
```typescript
// Check performance impact
const performance = security.getSecurityPerformance();
if (performance.getPerformanceScore() < 70) {
  // Implement optimizations
}
```

#### 3. Configuration Errors
```typescript
// Validate configuration
const validation = validateSecurityConfig(config);
if (validation.errors.length > 0) {
  console.error('Configuration errors:', validation.errors);
}
```

#### 4. Monitoring Issues
```typescript
// Check monitoring health
const monitoring = security.getSecurityMonitoring();
const events = monitoring.getEvents();
if (events.length === 0) {
  // Check if monitoring is properly configured
}
```

### Debug Mode

```typescript
// Enable debug mode for development
const security = createSecurityForEnvironment('development');
// Debug information will be logged to console
```

## 📈 Performance Considerations

### 1. Rate Limiting Impact
- Rate limiting adds minimal overhead (~1-2ms per request)
- Use appropriate limits for your use case
- Consider using progressive limiting for better protection

### 2. Input Sanitization
- Sanitization adds ~0.5-1ms per request
- Use field-specific sanitization for better performance
- Cache sanitized results when possible

### 3. File Upload Validation
- File validation can be resource-intensive
- Use appropriate file size limits
- Consider async validation for large files

### 4. Monitoring Overhead
- Monitoring adds ~0.1-0.5ms per request
- Disable in development if not needed
- Use appropriate log levels

## 🔄 Updates & Maintenance

### Version Compatibility
- This module is compatible with Node.js 18+
- Express.js 4.x+
- TypeScript 4.x+

### Regular Updates
- Keep security configurations updated
- Monitor for new security threats
- Update rate limits based on traffic patterns
- Review and adjust file upload policies

### Security Audits
- Regular security audits recommended
- Monitor security metrics
- Review blocked requests patterns
- Update security policies as needed

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the examples
3. Validate your configuration
4. Check the test utilities for debugging

## 📄 License

This security module is part of the ObatKu backend application and follows the same licensing terms.
