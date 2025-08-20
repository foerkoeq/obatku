# 🔒 SECURITY USAGE GUIDE - COMPREHENSIVE

## Overview
This guide demonstrates how to use the enhanced security system for different scenarios, environments, and use cases. The system is designed to be modular, maintainable, and customizable.

## Quick Start

### 1. Basic Integration

```typescript
// main.ts or app.ts
import { SecurityIntegrationFactory } from './src/security/integration/security-integration';

async function setupSecurity() {
  // Create security integration based on environment
  const security = SecurityIntegrationFactory.forProduction();
  
  // Initialize security
  await security.initialize();
  
  // Apply to Express app
  security.applyToApp(app);
}

// Setup security before starting server
setupSecurity().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running with enhanced security`);
  });
});
```

### 2. Environment-Specific Setup

```typescript
// Development - Lenient security for testing
const devSecurity = SecurityIntegrationFactory.forDevelopment();

// Staging - Balanced security
const stagingSecurity = SecurityIntegrationFactory.forStaging();

// Production - Strict security
const prodSecurity = SecurityIntegrationFactory.forProduction();

// High Security - Maximum protection
const highSecurity = SecurityIntegrationFactory.forHighSecurity();
```

## Advanced Configuration

### 1. Custom Security Configuration

```typescript
import { SecurityConfigFactory } from './src/security/config/security.config';

// Create custom configuration
const customConfig = SecurityConfigFactory.custom()
  .forEnvironment('production')
  .withRateLimit(10 * 60 * 1000, 200) // 10 minutes, 200 requests
  .withAuthRateLimit(5 * 60 * 1000, 10) // 5 minutes, 10 auth attempts
  .withAPIRateLimit(60 * 1000, 100) // 1 minute, 100 API requests
  .withFileUploadLimits(20 * 1024 * 1024, ['image/jpeg', 'image/png', 'application/pdf'])
  .withCustomCSP({
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.example.com"]
  })
  .withFieldSanitization({
    name: { stripHtml: true, maxLength: 255 },
    email: { normalizeEmail: true, maxLength: 254 },
    phone: { escapeSpecialChars: false, maxLength: 20 },
    description: { stripHtml: true, maxLength: 1000 }
  })
  .withWhitelistIPs(['192.168.1.100', '10.0.0.50'])
  .withBlacklistIPs(['192.168.1.200'])
  .enableProgressiveLimiting(true)
  .enableSmartLimiting(true)
  .enableMalwareScanning(true)
  .build();

// Use custom configuration
const security = SecurityIntegrationFactory.custom(customConfig);
```

### 2. Route-Specific Security

```typescript
// Apply different security levels to different routes
app.use('/api/auth', security.createCustomSecurityMiddleware({
  securityLevel: 'critical',
  enableAllFeatures: true,
  customRateLimit: 5
}));

app.use('/api/admin', security.createCustomSecurityMiddleware({
  securityLevel: 'high',
  enableAllFeatures: true,
  customRateLimit: 20,
  whitelistIPs: ['192.168.1.100']
}));

app.use('/api/users', security.createCustomSecurityMiddleware({
  securityLevel: 'medium',
  enableSanitization: true,
  enableRateLimit: true,
  enableSQLPrevention: true,
  customRateLimit: 50
}));

app.use('/api/public', security.createCustomSecurityMiddleware({
  securityLevel: 'low',
  enableSanitization: true,
  enableRateLimit: true,
  enableSQLPrevention: false,
  enableFileValidation: false,
  customRateLimit: 100
}));
```

## Security Monitoring

### 1. Real-Time Monitoring

```typescript
// Get security metrics
app.get('/api/security/metrics', (req, res) => {
  const metrics = security.getSecurityMetrics();
  res.json(metrics);
});

// Get security alerts
app.get('/api/security/alerts', (req, res) => {
  const alerts = security.getSecurityAlerts();
  res.json(alerts);
});

// Get performance metrics
app.get('/api/security/performance', (req, res) => {
  const performance = security.getPerformanceMetrics();
  res.json(performance);
});
```

### 2. Alert Management

```typescript
// Acknowledge an alert
app.post('/api/security/alerts/:id/acknowledge', (req, res) => {
  const { id } = req.params;
  const { acknowledgedBy } = req.body;
  
  const success = security.getSecurityMonitoring().acknowledgeAlert(id, acknowledgedBy);
  
  if (success) {
    res.json({ success: true, message: 'Alert acknowledged' });
  } else {
    res.status(404).json({ success: false, error: 'Alert not found' });
  }
});

// Resolve an alert
app.post('/api/security/alerts/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { resolvedBy, notes } = req.body;
  
  const success = security.getSecurityMonitoring().resolveAlert(id, resolvedBy, notes);
  
  if (success) {
    res.json({ success: true, message: 'Alert resolved' });
  } else {
    res.status(404).json({ success: false, error: 'Alert not found' });
  }
});
```

## Performance Optimization

### 1. Performance Monitoring

```typescript
// Check if performance is acceptable
const isAcceptable = security.getSecurityPerformance().isPerformanceAcceptable();
console.log('Security performance acceptable:', isAcceptable);

// Get performance score
const score = security.getSecurityPerformance().getPerformanceScore();
console.log('Security performance score:', score);

// Get performance alerts
const alerts = security.getSecurityPerformance().getPerformanceAlerts();
alerts.forEach(alert => {
  console.log(`Performance alert: ${alert.metric} exceeded threshold`);
});
```

### 2. Performance Tuning

```typescript
// Set custom performance thresholds
security.getSecurityPerformance().setPerformanceThresholds({
  maxSanitizationTime: 50,    // 50ms
  maxValidationTime: 25,      // 25ms
  maxRateLimitTime: 5,        // 5ms
  maxFileScanTime: 2000,      // 2 seconds
  maxSqlPreventionTime: 10,   // 10ms
  maxTotalOverhead: 100       // 100ms
});
```

## Use Cases

### 1. E-commerce Application

```typescript
// High security for payment processing
app.use('/api/payments', security.createCustomSecurityMiddleware({
  securityLevel: 'critical',
  enableAllFeatures: true,
  customRateLimit: 10,
  whitelistIPs: ['payment-gateway-ip'],
  allowedFields: ['amount', 'currency', 'paymentMethod', 'customerId']
}));

// Medium security for product catalog
app.use('/api/products', security.createCustomSecurityMiddleware({
  securityLevel: 'medium',
  enableSanitization: true,
  enableRateLimit: true,
  enableSQLPrevention: true,
  customRateLimit: 100
}));

// Low security for public product search
app.use('/api/search', security.createCustomSecurityMiddleware({
  securityLevel: 'low',
  enableSanitization: true,
  enableRateLimit: true,
  enableSQLPrevention: false,
  customRateLimit: 200
}));
```

### 2. Healthcare Application

```typescript
// Maximum security for patient data
app.use('/api/patients', security.createCustomSecurityMiddleware({
  securityLevel: 'critical',
  enableAllFeatures: true,
  customRateLimit: 5,
  whitelistIPs: ['hospital-network-ips'],
  allowedFields: ['patientId', 'name', 'dateOfBirth', 'medicalHistory']
}));

// High security for medical records
app.use('/api/records', security.createCustomSecurityMiddleware({
  securityLevel: 'high',
  enableAllFeatures: true,
  customRateLimit: 20,
  allowedFields: ['recordId', 'patientId', 'diagnosis', 'treatment']
}));

// Medium security for appointments
app.use('/api/appointments', security.createCustomSecurityMiddleware({
  securityLevel: 'medium',
  enableSanitization: true,
  enableRateLimit: true,
  enableSQLPrevention: true,
  customRateLimit: 50
}));
```

### 3. Banking Application

```typescript
// Critical security for transactions
app.use('/api/transactions', security.createCustomSecurityMiddleware({
  securityLevel: 'critical',
  enableAllFeatures: true,
  customRateLimit: 5,
  whitelistIPs: ['bank-network-ips'],
  allowedFields: ['accountId', 'amount', 'transactionType', 'recipientId']
}));

// High security for account management
app.use('/api/accounts', security.createCustomSecurityMiddleware({
  securityLevel: 'high',
  enableAllFeatures: true,
  customRateLimit: 15,
  allowedFields: ['accountId', 'balance', 'accountType', 'status']
}));

// Medium security for statements
app.use('/api/statements', security.createCustomSecurityMiddleware({
  securityLevel: 'medium',
  enableSanitization: true,
  enableRateLimit: true,
  enableSQLPrevention: true,
  customRateLimit: 30
}));
```

## Integration with Existing Systems

### 1. Express.js Integration

```typescript
// app.ts
import express from 'express';
import { SecurityIntegrationFactory } from './src/security/integration/security-integration';

const app = express();

// Setup security before other middleware
async function setupSecurity() {
  const security = SecurityIntegrationFactory.forProduction();
  await security.initialize();
  security.applyToApp(app);
}

// Apply security first
await setupSecurity();

// Then apply other middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Your routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
```

### 2. Next.js API Routes Integration

```typescript
// pages/api/_middleware.ts
import { SecurityIntegrationFactory } from '../../../src/security/integration/security-integration';

let security: any = null;

export async function middleware(req: any, res: any) {
  // Initialize security if not already done
  if (!security) {
    security = SecurityIntegrationFactory.forProduction();
    await security.initialize();
  }

  // Apply security middleware
  const securityMiddleware = security.getSecurityMiddleware();
  const middlewareChain = securityMiddleware.applyAll();

  // Execute security middleware
  for (const middleware of middlewareChain) {
    await new Promise((resolve, reject) => {
      middleware(req, res, (err: any) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }
}
```

### 3. Fastify Integration

```typescript
// server.ts
import Fastify from 'fastify';
import { SecurityIntegrationFactory } from './src/security/integration/security-integration';

const fastify = Fastify();

// Setup security
async function setupSecurity() {
  const security = SecurityIntegrationFactory.forProduction();
  await security.initialize();
  
  // Apply security as Fastify hooks
  fastify.addHook('preHandler', async (request, reply) => {
    // Apply security checks here
    const securityMiddleware = security.getSecurityMiddleware();
    // Implementation would need to be adapted for Fastify
  });
}

await setupSecurity();
```

## Testing

### 1. Security Testing

```typescript
// tests/security.test.ts
import { SecurityIntegrationFactory } from '../src/security/integration/security-integration';

describe('Security Integration', () => {
  let security: any;

  beforeEach(async () => {
    security = SecurityIntegrationFactory.forDevelopment();
    await security.initialize();
  });

  test('should block SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    // Test implementation
  });

  test('should block XSS attempts', async () => {
    const maliciousInput = "<script>alert('xss')</script>";
    // Test implementation
  });

  test('should enforce rate limiting', async () => {
    // Test rate limiting
  });

  test('should validate file uploads', async () => {
    // Test file validation
  });
});
```

### 2. Performance Testing

```typescript
// tests/performance.test.ts
describe('Security Performance', () => {
  test('should maintain acceptable performance', () => {
    const performance = security.getSecurityPerformance();
    expect(performance.isPerformanceAcceptable()).toBe(true);
    expect(performance.getPerformanceScore()).toBeGreaterThan(80);
  });

  test('should not exceed performance thresholds', () => {
    const metrics = security.getPerformanceMetrics();
    expect(metrics.current.impactOnResponseTime).toBeLessThan(20);
    expect(metrics.current.memoryOverhead).toBeLessThan(10);
    expect(metrics.current.cpuOverhead).toBeLessThan(10);
  });
});
```

## Maintenance and Updates

### 1. Regular Security Audits

```typescript
// scripts/security-audit.ts
import { SecurityIntegrationFactory } from '../src/security/integration/security-integration';

async function runSecurityAudit() {
  const security = SecurityIntegrationFactory.forProduction();
  await security.initialize();

  // Get security metrics
  const metrics = security.getSecurityMetrics();
  const alerts = security.getSecurityAlerts();
  const performance = security.getPerformanceMetrics();

  // Generate audit report
  const report = {
    timestamp: new Date(),
    securityScore: metrics.securityScore,
    totalAlerts: alerts.length,
    unacknowledgedAlerts: alerts.filter(a => !a.acknowledged).length,
    performanceScore: security.getSecurityPerformance().getPerformanceScore(),
    recommendations: performance.recommendations
  };

  console.log('Security Audit Report:', report);
}

runSecurityAudit();
```

### 2. Configuration Updates

```typescript
// Update security configuration based on monitoring
function updateSecurityConfig() {
  const security = SecurityIntegrationFactory.forProduction();
  const metrics = security.getSecurityMetrics();
  const alerts = security.getSecurityAlerts();

  // Adjust rate limiting based on traffic patterns
  if (metrics.totalRequests > 10000) {
    security.updateConfiguration({
      rateLimiting: {
        ...security.getConfiguration().rateLimiting,
        maxRequests: 150 // Increase limit
      }
    });
  }

  // Adjust file upload limits based on usage
  if (alerts.filter(a => a.type === 'file_upload_violation').length > 10) {
    security.updateConfiguration({
      fileUpload: {
        ...security.getConfiguration().fileUpload,
        maxFileSize: 5 * 1024 * 1024 // Reduce limit
      }
    });
  }
}
```

## Best Practices

### 1. Security Level Selection

- **Critical**: Financial transactions, healthcare data, government systems
- **High**: User authentication, admin panels, sensitive data
- **Medium**: Regular API endpoints, user data
- **Low**: Public information, read-only data

### 2. Performance Optimization

- Monitor security overhead regularly
- Adjust thresholds based on application needs
- Use caching for repeated security checks
- Implement security measures asynchronously where possible

### 3. Monitoring and Alerting

- Set up real-time alerts for critical security events
- Regularly review security metrics
- Correlate security events with application logs
- Maintain security incident response procedures

### 4. Configuration Management

- Use environment-specific configurations
- Version control security configurations
- Document security policy changes
- Test configuration changes in staging

## Troubleshooting

### Common Issues

1. **High Performance Impact**
   - Reduce security feature complexity
   - Implement caching
   - Use async processing where possible

2. **False Positives**
   - Adjust sanitization rules
   - Whitelist legitimate patterns
   - Fine-tune detection thresholds

3. **Rate Limiting Too Strict**
   - Increase limits for legitimate traffic
   - Implement progressive limiting
   - Use IP whitelisting for trusted sources

4. **File Upload Issues**
   - Check MIME type mappings
   - Verify file size limits
   - Review allowed extensions

### Debug Mode

```typescript
// Enable debug logging
process.env.DEBUG_SECURITY = 'true';

// This will provide detailed logs for troubleshooting
```

## Conclusion

This enhanced security system provides comprehensive protection while maintaining flexibility and performance. The modular design allows for easy customization and integration with existing systems. Regular monitoring and maintenance ensure optimal security posture. 