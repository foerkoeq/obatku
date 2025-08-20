// ======================================
// SECURITY PERFORMANCE TRACKING
// ======================================
// Tracks performance impact of security measures
// Provides metrics for optimization and tuning

import { SecurityPerformanceMetrics } from '../types/security.types';

// Define types for detailed metrics
interface MetricMeasurement {
  count: number;
  average: number;
  max: number;
  min: number;
  threshold?: number; // Make threshold optional
}

interface DetailedMetrics {
  current: SecurityPerformanceMetrics;
  measurements: {
    sanitization: MetricMeasurement;
    validation: MetricMeasurement;
    rateLimit: MetricMeasurement;
    fileScan: MetricMeasurement;
    sqlPrevention: MetricMeasurement;
    responseTime: MetricMeasurement;
  };
  thresholds: {
    maxSanitizationTime: number;
    maxValidationTime: number;
    maxRateLimitTime: number;
    maxFileScanTime: number;
    maxSqlPreventionTime: number;
    maxTotalOverhead: number;
  };
  recommendations: string[];
}

interface PerformanceAlert {
  type: string;
  metric: string;
  current: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high';
}

export class SecurityPerformance {
  private metrics: SecurityPerformanceMetrics = {
    sanitizationTime: 0,
    validationTime: 0,
    rateLimitCheckTime: 0,
    fileScanTime: 0,
    sqlPreventionTime: 0,
    totalSecurityOverhead: 0,
    impactOnResponseTime: 0,
    memoryOverhead: 0,
    cpuOverhead: 0
  };

  private measurements: {
    sanitization: number[];
    validation: number[];
    rateLimit: number[];
    fileScan: number[];
    sqlPrevention: number[];
    responseTime: number[];
  } = {
    sanitization: [],
    validation: [],
    rateLimit: [],
    fileScan: [],
    sqlPrevention: [],
    responseTime: []
  };

  private startTimes: Map<string, number> = new Map();
  private performanceThresholds = {
    maxSanitizationTime: 100, // ms
    maxValidationTime: 50,    // ms
    maxRateLimitTime: 10,     // ms
    maxFileScanTime: 5000,    // ms
    maxSqlPreventionTime: 20, // ms
    maxTotalOverhead: 200     // ms
  };

  /**
   * Start timing a security operation
   */
  startTiming(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }

  /**
   * End timing a security operation
   */
  endTiming(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.startTimes.delete(operation);

    // Record the measurement
    this.recordMeasurement(operation, duration);

    // Check if it exceeds threshold
    this.checkPerformanceThreshold(operation, duration);

    return duration;
  }

  /**
   * Record a measurement
   */
  private recordMeasurement(operation: string, duration: number): void {
    switch (operation) {
      case 'sanitization':
        this.measurements.sanitization.push(duration);
        this.metrics.sanitizationTime = this.calculateAverage(this.measurements.sanitization);
        break;
      case 'validation':
        this.measurements.validation.push(duration);
        this.metrics.validationTime = this.calculateAverage(this.measurements.validation);
        break;
      case 'rateLimit':
        this.measurements.rateLimit.push(duration);
        this.metrics.rateLimitCheckTime = this.calculateAverage(this.measurements.rateLimit);
        break;
      case 'fileScan':
        this.measurements.fileScan.push(duration);
        this.metrics.fileScanTime = this.calculateAverage(this.measurements.fileScan);
        break;
      case 'sqlPrevention':
        this.measurements.sqlPrevention.push(duration);
        this.metrics.sqlPreventionTime = this.calculateAverage(this.measurements.sqlPrevention);
        break;
      case 'responseTime':
        this.measurements.responseTime.push(duration);
        break;
    }

    // Keep only last 1000 measurements
    this.trimMeasurements();
  }

  /**
   * Record sanitization time
   */
  recordSanitizationTime(time: number): void {
    this.measurements.sanitization.push(time);
    this.metrics.sanitizationTime = this.calculateAverage(this.measurements.sanitization);
    this.trimMeasurements();
  }

  /**
   * Record validation time
   */
  recordValidationTime(time: number): void {
    this.measurements.validation.push(time);
    this.metrics.validationTime = this.calculateAverage(this.measurements.validation);
    this.trimMeasurements();
  }

  /**
   * Record rate limit check time
   */
  recordRateLimitCheckTime(time: number): void {
    this.measurements.rateLimit.push(time);
    this.metrics.rateLimitCheckTime = this.calculateAverage(this.measurements.rateLimit);
    this.trimMeasurements();
  }

  /**
   * Record file scan time
   */
  recordFileScanTime(time: number): void {
    this.measurements.fileScan.push(time);
    this.metrics.fileScanTime = this.calculateAverage(this.measurements.fileScan);
    this.trimMeasurements();
  }

  /**
   * Record SQL prevention time
   */
  recordSqlPreventionTime(time: number): void {
    this.measurements.sqlPrevention.push(time);
    this.metrics.sqlPreventionTime = this.calculateAverage(this.measurements.sqlPrevention);
    this.trimMeasurements();
  }

  /**
   * Record response time
   */
  recordResponseTime(time: number): void {
    this.measurements.responseTime.push(time);
    this.trimMeasurements();
  }

  /**
   * Get performance metrics
   */
  getMetrics(): SecurityPerformanceMetrics {
    // Calculate total security overhead
    this.metrics.totalSecurityOverhead = 
      this.metrics.sanitizationTime +
      this.metrics.validationTime +
      this.metrics.rateLimitCheckTime +
      this.metrics.fileScanTime +
      this.metrics.sqlPreventionTime;

    // Calculate impact on response time
    const avgResponseTime = this.calculateAverage(this.measurements.responseTime);
    this.metrics.impactOnResponseTime = avgResponseTime > 0 
      ? (this.metrics.totalSecurityOverhead / avgResponseTime) * 100 
      : 0;

    // Calculate memory overhead (simplified)
    this.metrics.memoryOverhead = this.calculateMemoryOverhead();

    // Calculate CPU overhead (simplified)
    this.metrics.cpuOverhead = this.calculateCpuOverhead();

    return { ...this.metrics };
  }

  /**
   * Get detailed performance breakdown
   */
  getDetailedMetrics(): DetailedMetrics {
    return {
      current: this.getMetrics(),
      measurements: {
        sanitization: {
          count: this.measurements.sanitization.length,
          average: this.calculateAverage(this.measurements.sanitization),
          max: Math.max(...this.measurements.sanitization, 0),
          min: Math.min(...this.measurements.sanitization, Infinity),
          threshold: this.performanceThresholds.maxSanitizationTime
        },
        validation: {
          count: this.measurements.validation.length,
          average: this.calculateAverage(this.measurements.validation),
          max: Math.max(...this.measurements.validation, 0),
          min: Math.min(...this.measurements.validation, Infinity),
          threshold: this.performanceThresholds.maxValidationTime
        },
        rateLimit: {
          count: this.measurements.rateLimit.length,
          average: this.calculateAverage(this.measurements.rateLimit),
          max: Math.max(...this.measurements.rateLimit, 0),
          min: Math.min(...this.measurements.rateLimit, Infinity),
          threshold: this.performanceThresholds.maxRateLimitTime
        },
        fileScan: {
          count: this.measurements.fileScan.length,
          average: this.calculateAverage(this.measurements.fileScan),
          max: Math.max(...this.measurements.fileScan, 0),
          min: Math.min(...this.measurements.fileScan, Infinity),
          threshold: this.performanceThresholds.maxFileScanTime
        },
        sqlPrevention: {
          count: this.measurements.sqlPrevention.length,
          average: this.calculateAverage(this.measurements.sqlPrevention),
          max: Math.max(...this.measurements.sqlPrevention, 0),
          min: Math.min(...this.measurements.sqlPrevention, Infinity),
          threshold: this.performanceThresholds.maxSqlPreventionTime
        },
        responseTime: {
          count: this.measurements.responseTime.length,
          average: this.calculateAverage(this.measurements.responseTime),
          max: Math.max(...this.measurements.responseTime, 0),
          min: Math.min(...this.measurements.responseTime, Infinity)
          // No threshold for response time
        }
      },
      thresholds: this.performanceThresholds,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Get performance alerts
   */
  getPerformanceAlerts(): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];
    const metrics = this.getDetailedMetrics();

    // Check each metric against thresholds
    Object.entries(metrics.measurements).forEach(([key, metric]) => {
      // Only check metrics that have thresholds
      if (metric.threshold && metric.average > metric.threshold) {
        alerts.push({
          type: 'performance_threshold_exceeded',
          metric: key,
          current: metric.average,
          threshold: metric.threshold,
          severity: metric.average > metric.threshold * 2 ? 'high' : 'medium'
        });
      }
    });

    return alerts;
  }

  /**
   * Reset all metrics
   */
  resetMetrics(): void {
    this.metrics = {
      sanitizationTime: 0,
      validationTime: 0,
      rateLimitCheckTime: 0,
      fileScanTime: 0,
      sqlPreventionTime: 0,
      totalSecurityOverhead: 0,
      impactOnResponseTime: 0,
      memoryOverhead: 0,
      cpuOverhead: 0
    };

    this.measurements = {
      sanitization: [],
      validation: [],
      rateLimit: [],
      fileScan: [],
      sqlPrevention: [],
      responseTime: []
    };

    this.startTimes.clear();
  }

  /**
   * Set performance thresholds
   */
  setPerformanceThresholds(thresholds: Partial<typeof this.performanceThresholds>): void {
    this.performanceThresholds = { ...this.performanceThresholds, ...thresholds };
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    const metrics = this.getMetrics();
    const alerts = this.getPerformanceAlerts();

    return alerts.length === 0 && metrics.impactOnResponseTime < 20; // Less than 20% impact
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    const metrics = this.getMetrics();
    const alerts = this.getPerformanceAlerts();

    let score = 100;

    // Deduct points for high overhead
    if (metrics.impactOnResponseTime > 50) score -= 30;
    else if (metrics.impactOnResponseTime > 20) score -= 15;
    else if (metrics.impactOnResponseTime > 10) score -= 5;

    // Deduct points for alerts
    score -= alerts.length * 10;

    // Deduct points for high memory/cpu overhead
    if (metrics.memoryOverhead > 10) score -= 10;
    if (metrics.cpuOverhead > 10) score -= 10;

    return Math.max(0, score);
  }

  // Helper methods
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  private trimMeasurements(): void {
    const maxMeasurements = 1000;
    
    Object.keys(this.measurements).forEach(key => {
      const measurements = this.measurements[key as keyof typeof this.measurements];
      if (measurements.length > maxMeasurements) {
        this.measurements[key as keyof typeof this.measurements] = 
          measurements.slice(-maxMeasurements);
      }
    });
  }

  private checkPerformanceThreshold(operation: string, duration: number): void {
    let threshold = 0;
    switch (operation) {
      case 'sanitization':
        threshold = this.performanceThresholds.maxSanitizationTime;
        break;
      case 'validation':
        threshold = this.performanceThresholds.maxValidationTime;
        break;
      case 'rateLimit':
        threshold = this.performanceThresholds.maxRateLimitTime;
        break;
      case 'fileScan':
        threshold = this.performanceThresholds.maxFileScanTime;
        break;
      case 'sqlPrevention':
        threshold = this.performanceThresholds.maxSqlPreventionTime;
        break;
      default:
        return;
    }

    if (duration > threshold) {
      console.warn(`⚠️ Performance warning: ${operation} took ${duration}ms (threshold: ${threshold}ms)`);
    }
  }

  private calculateMemoryOverhead(): number {
    // Simplified memory overhead calculation
    // In production, you might want to track actual memory usage
    const totalOperations = 
      this.measurements.sanitization.length +
      this.measurements.validation.length +
      this.measurements.rateLimit.length +
      this.measurements.fileScan.length +
      this.measurements.sqlPrevention.length;

    // Estimate memory overhead based on operation count
    return Math.min(totalOperations * 0.01, 10); // Max 10%
  }

  private calculateCpuOverhead(): number {
    // Simplified CPU overhead calculation
    const avgTotalTime = this.metrics.totalSecurityOverhead;
    const avgResponseTime = this.calculateAverage(this.measurements.responseTime);

    if (avgResponseTime === 0) return 0;

    return Math.min((avgTotalTime / avgResponseTime) * 100, 20); // Max 20%
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getDetailedMetrics();

    // Check sanitization performance
    if (metrics.measurements.sanitization.threshold && 
        metrics.measurements.sanitization.average > metrics.measurements.sanitization.threshold) {
      recommendations.push('Consider optimizing input sanitization rules or using more efficient sanitization library');
    }

    // Check file scan performance
    if (metrics.measurements.fileScan.threshold && 
        metrics.measurements.fileScan.average > metrics.measurements.fileScan.threshold) {
      recommendations.push('Consider implementing file scanning in background or using faster scanning methods');
    }

    // Check overall impact
    if (metrics.current.impactOnResponseTime > 20) {
      recommendations.push('Security overhead is high - consider implementing security measures asynchronously where possible');
    }

    // Check memory usage
    if (metrics.current.memoryOverhead > 10) {
      recommendations.push('Consider implementing memory-efficient security measures or garbage collection optimization');
    }

    // Check CPU usage
    if (metrics.current.cpuOverhead > 10) {
      recommendations.push('Consider distributing security checks across multiple CPU cores or implementing caching');
    }

    return recommendations;
  }
} 