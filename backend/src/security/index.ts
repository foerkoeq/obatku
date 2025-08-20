// ======================================
// SECURITY MODULE - MAIN EXPORT - ENHANCED
// ======================================
// Central export untuk semua security utilities
// Enhanced dengan monitoring, performance tracking, dan integration

// Import SecurityIntegrationFactory for default export
import { SecurityIntegrationFactory } from './integration/security-integration';

// Core Security Components
export { SecurityConfigFactory, securityConfig } from './config/security.config';
export { InputSanitizer } from './sanitization/input-sanitizer';
export { RateLimiter } from './rate-limiting/rate-limiter';
export { SecurityHeaders } from './headers/security-headers';
export { FileValidator } from './file-validation/file-validator';
export { SQLInjectionPrevention } from './sql-prevention/sql-prevention';
export { SecurityMiddleware } from './middleware/security.middleware';
export { SecurityTester } from './testing/security-tester';

// Enhanced Security Components
export { SecurityMonitoring } from './monitoring/security-monitoring';
export { SecurityPerformance } from './performance/security-performance';
export { SecurityIntegration, SecurityIntegrationFactory } from './integration/security-integration';

// Security Types
export * from './types/security.types';

// Security Utils
export * from './utils/security.utils';

// Security Examples
export * from './examples/security-implementation.example';
export * from './examples/security-examples';

// Security Testing
export * from './testing/security-tester';

// Security Testing Utilities
export * from './testing/security-test-utils';

// Security Configuration Helpers
export * from './config/security-helpers';

// Security Monitoring Helpers
export * from './monitoring/security-monitoring-helpers';

// Security Performance Helpers
export * from './performance/security-performance-helpers';

// Security Integration Helpers
export * from './integration/security-integration-helpers';

// Quick Setup Functions
export const createSecurityForEnvironment = (env: 'development' | 'staging' | 'production' | 'high-security') => {
  switch (env) {
    case 'development':
      return SecurityIntegrationFactory.forDevelopment();
    case 'staging':
      return SecurityIntegrationFactory.forStaging();
    case 'production':
      return SecurityIntegrationFactory.forProduction();
    case 'high-security':
      return SecurityIntegrationFactory.forHighSecurity();
    default:
      return SecurityIntegrationFactory.forProduction();
  }
};

// Security Health Check
export const checkSecurityHealth = async (security: any) => {
  try {
    const metrics = security.getSecurityMetrics();
    const performance = security.getSecurityPerformance();
    const monitoring = security.getSecurityMonitoring();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      security: {
        score: metrics.securityScore,
        blockedRequests: metrics.blockedRequests,
        totalRequests: metrics.totalRequests
      },
      performance: {
        score: performance.getPerformanceScore(),
        acceptable: performance.isPerformanceAcceptable(),
        overhead: metrics.impactOnResponseTime
      },
      monitoring: {
        alerts: monitoring.getUnacknowledgedAlerts().length,
        events: monitoring.getEvents().length
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Security Metrics Summary
export const getSecuritySummary = (security: any) => {
  const metrics = security.getSecurityMetrics();
  const performance = security.getSecurityPerformance();
  const alerts = security.getSecurityAlerts();

  return {
    overview: {
      totalRequests: metrics.totalRequests,
      blockedRequests: metrics.blockedRequests,
      securityScore: metrics.securityScore,
      performanceScore: performance.getPerformanceScore()
    },
    violations: {
      byType: metrics.violationsByType,
      total: Object.values(metrics.violationsByType).reduce((a: any, b: any) => a + b, 0)
    },
    alerts: {
      total: alerts.length,
      unacknowledged: alerts.filter((a: any) => !a.acknowledged).length,
      critical: alerts.filter((a: any) => a.severity === 'critical').length
    },
    performance: {
      impactOnResponseTime: metrics.impactOnResponseTime,
      memoryOverhead: metrics.memoryOverhead,
      cpuOverhead: metrics.cpuOverhead
    }
  };
};

// Security Configuration Validation
export const validateSecurityConfig = (config: any) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Validate required fields
  if (!config.rateLimiting?.maxRequests) {
    errors.push('Rate limiting maxRequests is required');
  }

  if (!config.fileUpload?.maxFileSize) {
    errors.push('File upload maxFileSize is required');
  }

  // Check for potential issues
  if (config.rateLimiting?.maxRequests > 1000) {
    warnings.push('High rate limit may impact security');
  }

  if (config.fileUpload?.maxFileSize > 50 * 1024 * 1024) {
    warnings.push('Large file upload limit may impact performance');
  }

  // Generate recommendations
  if (!config.monitoring?.enableRealTimeAlerts) {
    recommendations.push('Consider enabling real-time alerts for better security monitoring');
  }

  if (!config.advanced?.enableCSRFProtection) {
    recommendations.push('Consider enabling CSRF protection for web applications');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations
  };
};

// Security Performance Optimization
export const optimizeSecurityPerformance = (security: any) => {
  const performance = security.getSecurityPerformance();
  const metrics = performance.getDetailedMetrics();
  const recommendations = [];

  // Check performance thresholds
  if (metrics.current.impactOnResponseTime > 20) {
    recommendations.push('Consider implementing security measures asynchronously');
  }

  if (metrics.current.memoryOverhead > 10) {
    recommendations.push('Consider implementing memory-efficient security measures');
  }

  if (metrics.current.cpuOverhead > 10) {
    recommendations.push('Consider distributing security checks across multiple CPU cores');
  }

  // Check individual component performance
  Object.entries(metrics.measurements).forEach(([component, metric]) => {
    const metricData = metric as any;
    if (metricData.threshold && metricData.average > metricData.threshold) {
      recommendations.push(`Optimize ${component} performance (current: ${metricData.average}ms, threshold: ${metricData.threshold}ms)`);
    }
  });

  return {
    currentPerformance: metrics.current,
    recommendations,
    optimizationScore: performance.getPerformanceScore()
  };
};

// Security Alert Management
export const manageSecurityAlerts = (security: any) => {
  const monitoring = security.getSecurityMonitoring();
  const alerts = monitoring.getAlerts();

  return {
    acknowledgeAll: (acknowledgedBy: string) => {
      const unacknowledged = monitoring.getUnacknowledgedAlerts();
      unacknowledged.forEach((alert: any) => {
        monitoring.acknowledgeAlert(alert.id, acknowledgedBy);
      });
      return unacknowledged.length;
    },
    resolveAll: (resolvedBy: string, notes?: string) => {
      const unresolved = monitoring.getUnresolvedAlerts();
      unresolved.forEach((alert: any) => {
        monitoring.resolveAlert(alert.id, resolvedBy, notes);
      });
      return unresolved.length;
    },
    getCriticalAlerts: () => {
      return alerts.filter((alert: any) => alert.severity === 'critical');
    },
    getHighPriorityAlerts: () => {
      return alerts.filter((alert: any) => alert.severity === 'high' || alert.severity === 'critical');
    }
  };
};

// Security Event Correlation
export const correlateSecurityEvents = (security: any) => {
  const monitoring = security.getSecurityMonitoring();
  const events = monitoring.getEvents();

  return {
    findRelatedEvents: (eventId: string) => {
      const event = events.find((e: any) => e.id === eventId);
      if (!event) return [];

      return events.filter((e: any) => 
        e.id !== eventId && 
        e.source === event.source &&
        Math.abs(e.timestamp.getTime() - event.timestamp.getTime()) < 60 * 60 * 1000 // Within 1 hour
      );
    },
    findPatterns: () => {
      const patterns: any[] = [];
      const eventTypes = new Map();

      events.forEach((event: any) => {
        const key = `${event.type}_${event.source}`;
        if (!eventTypes.has(key)) {
          eventTypes.set(key, []);
        }
        eventTypes.get(key).push(event);
      });

      eventTypes.forEach((events, key) => {
        if (events.length >= 3) {
          patterns.push({
            pattern: key,
            count: events.length,
            firstOccurrence: events[0].timestamp,
            lastOccurrence: events[events.length - 1].timestamp,
            severity: events.some((e: any) => e.severity === 'critical') ? 'critical' : 'high'
          });
        }
      });

      return patterns;
    }
  };
};

// Export default security integration for easy use
export default SecurityIntegrationFactory;
