// ======================================
// SECURITY PERFORMANCE HELPERS
// ======================================
// Helper functions untuk security performance
// Memudahkan monitoring dan optimasi performance

import { PerformanceMetrics, PerformanceThresholds } from '../types/security.types';

// Helper untuk calculate performance score
export const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
  const weights = {
    responseTime: 0.4,
    memoryUsage: 0.3,
    cpuUsage: 0.2,
    throughput: 0.1
  };
  
  const scores = {
    responseTime: Math.max(0, 100 - (metrics.responseTime / 100)), // 0-100ms = 100 score
    memoryUsage: Math.max(0, 100 - (metrics.memoryUsage / 10)), // 0-1000MB = 100 score
    cpuUsage: Math.max(0, 100 - metrics.cpuUsage), // 0-100% = 100 score
    throughput: Math.min(100, metrics.throughput / 10) // 0-1000 req/s = 100 score
  };
  
  return Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scores[key as keyof typeof scores] * weight);
  }, 0);
};

// Helper untuk check performance thresholds
export const checkPerformanceThresholds = (
  metrics: PerformanceMetrics,
  thresholds: PerformanceThresholds
): {
  passed: boolean;
  violations: string[];
  warnings: string[];
} => {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  // Check response time
  if (metrics.responseTime > thresholds.responseTime.critical) {
    violations.push(`Response time critical: ${metrics.responseTime}ms > ${thresholds.responseTime.critical}ms`);
  } else if (metrics.responseTime > thresholds.responseTime.warning) {
    warnings.push(`Response time warning: ${metrics.responseTime}ms > ${thresholds.responseTime.warning}ms`);
  }
  
  // Check memory usage
  if (metrics.memoryUsage > thresholds.memoryUsage.critical) {
    violations.push(`Memory usage critical: ${metrics.memoryUsage}MB > ${thresholds.memoryUsage.critical}MB`);
  } else if (metrics.memoryUsage > thresholds.memoryUsage.warning) {
    warnings.push(`Memory usage warning: ${metrics.memoryUsage}MB > ${thresholds.memoryUsage.warning}MB`);
  }
  
  // Check CPU usage
  if (metrics.cpuUsage > thresholds.cpuUsage.critical) {
    violations.push(`CPU usage critical: ${metrics.cpuUsage}% > ${thresholds.cpuUsage.critical}%`);
  } else if (metrics.cpuUsage > thresholds.cpuUsage.warning) {
    warnings.push(`CPU usage warning: ${metrics.cpuUsage}% > ${thresholds.cpuUsage.warning}%`);
  }
  
  // Check throughput
  if (metrics.throughput < thresholds.throughput.critical) {
    violations.push(`Throughput critical: ${metrics.throughput} req/s < ${thresholds.throughput.critical} req/s`);
  } else if (metrics.throughput < thresholds.throughput.warning) {
    warnings.push(`Throughput warning: ${metrics.throughput} req/s < ${thresholds.throughput.warning} req/s`);
  }
  
  return {
    passed: violations.length === 0,
    violations,
    warnings
  };
};

// Helper untuk generate performance report
export const generatePerformanceReport = (
  currentMetrics: PerformanceMetrics,
  historicalMetrics: PerformanceMetrics[],
  thresholds: PerformanceThresholds
): {
  summary: {
    currentScore: number;
    averageScore: number;
    trend: 'improving' | 'stable' | 'declining';
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  };
  metrics: {
    responseTime: {
      current: number;
      average: number;
      min: number;
      max: number;
      trend: number;
    };
    memoryUsage: {
      current: number;
      average: number;
      min: number;
      max: number;
      trend: number;
    };
    cpuUsage: {
      current: number;
      average: number;
      min: number;
      max: number;
      trend: number;
    };
    throughput: {
      current: number;
      average: number;
      min: number;
      max: number;
      trend: number;
    };
  };
  analysis: {
    bottlenecks: string[];
    recommendations: string[];
    alerts: string[];
  };
} => {
  const currentScore = calculatePerformanceScore(currentMetrics);
  
  // Calculate historical averages and trends
  const responseTimeStats = calculateMetricStats(historicalMetrics.map(m => m.responseTime));
  const memoryUsageStats = calculateMetricStats(historicalMetrics.map(m => m.memoryUsage));
  const cpuUsageStats = calculateMetricStats(historicalMetrics.map(m => m.cpuUsage));
  const throughputStats = calculateMetricStats(historicalMetrics.map(m => m.throughput));
  
  // Calculate overall trend
  const recentScores = historicalMetrics.slice(-10).map(m => calculatePerformanceScore(m));
  const trend = calculateTrend(recentScores);
  
  // Determine status
  const status = currentScore >= 90 ? 'excellent' :
                 currentScore >= 75 ? 'good' :
                 currentScore >= 60 ? 'fair' :
                 currentScore >= 40 ? 'poor' : 'critical';
  
  // Analyze bottlenecks and generate recommendations
  const bottlenecks: string[] = [];
  const recommendations: string[] = [];
  const alerts: string[] = [];
  
  // Response time analysis
  if (currentMetrics.responseTime > thresholds.responseTime.warning) {
    bottlenecks.push('High response time');
    recommendations.push('Consider implementing caching or optimizing database queries');
  }
  
  // Memory usage analysis
  if (currentMetrics.memoryUsage > thresholds.memoryUsage.warning) {
    bottlenecks.push('High memory usage');
    recommendations.push('Consider implementing memory cleanup or increasing memory limits');
  }
  
  // CPU usage analysis
  if (currentMetrics.cpuUsage > thresholds.cpuUsage.warning) {
    bottlenecks.push('High CPU usage');
    recommendations.push('Consider implementing load balancing or optimizing algorithms');
  }
  
  // Throughput analysis
  if (currentMetrics.throughput < thresholds.throughput.warning) {
    bottlenecks.push('Low throughput');
    recommendations.push('Consider implementing connection pooling or optimizing request handling');
  }
  
  // Generate alerts for critical issues
  const thresholdCheck = checkPerformanceThresholds(currentMetrics, thresholds);
  alerts.push(...thresholdCheck.violations);
  
  return {
    summary: {
      currentScore,
      averageScore: recentScores.reduce((a, b) => a + b, 0) / recentScores.length,
      trend,
      status
    },
    metrics: {
      responseTime: {
        current: currentMetrics.responseTime,
        average: responseTimeStats.average,
        min: responseTimeStats.min,
        max: responseTimeStats.max,
        trend: responseTimeStats.trend
      },
      memoryUsage: {
        current: currentMetrics.memoryUsage,
        average: memoryUsageStats.average,
        min: memoryUsageStats.min,
        max: memoryUsageStats.max,
        trend: memoryUsageStats.trend
      },
      cpuUsage: {
        current: currentMetrics.cpuUsage,
        average: cpuUsageStats.average,
        min: cpuUsageStats.min,
        max: cpuUsageStats.max,
        trend: cpuUsageStats.trend
      },
      throughput: {
        current: currentMetrics.throughput,
        average: throughputStats.average,
        min: throughputStats.min,
        max: throughputStats.max,
        trend: throughputStats.trend
      }
    },
    analysis: {
      bottlenecks,
      recommendations,
      alerts
    }
  };
};

// Helper untuk calculate metric statistics
const calculateMetricStats = (values: number[]): {
  average: number;
  min: number;
  max: number;
  trend: number;
} => {
  if (values.length === 0) {
    return { average: 0, min: 0, max: 0, trend: 0 };
  }
  
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Calculate trend (positive = increasing, negative = decreasing)
  const trend = values.length >= 2 ? 
    (values[values.length - 1] - values[0]) / values.length : 0;
  
  return { average, min, max, trend };
};

// Helper untuk calculate trend
const calculateTrend = (values: number[]): 'improving' | 'stable' | 'declining' => {
  if (values.length < 2) return 'stable';
  
  const recent = values.slice(-5);
  const older = values.slice(-10, -5);
  
  if (recent.length === 0 || older.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const change = recentAvg - olderAvg;
  const threshold = olderAvg * 0.05; // 5% threshold
  
  if (change > threshold) return 'declining';
  if (change < -threshold) return 'improving';
  return 'stable';
};

// Helper untuk optimize performance
export const generatePerformanceOptimizations = (
  metrics: PerformanceMetrics,
  bottlenecks: string[]
): {
  priority: 'high' | 'medium' | 'low';
  action: string;
  expectedImpact: string;
  implementation: string;
}[] => {
  const optimizations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    implementation: string;
  }[] = [];
  
  // High priority optimizations
  if (metrics.responseTime > 200) {
    optimizations.push({
      priority: 'high',
      action: 'Implement response caching',
      expectedImpact: 'Reduce response time by 50-80%',
      implementation: 'Add Redis cache for frequently accessed data'
    });
  }
  
  if (metrics.memoryUsage > 1000) {
    optimizations.push({
      priority: 'high',
      action: 'Implement memory cleanup',
      expectedImpact: 'Reduce memory usage by 30-50%',
      implementation: 'Add garbage collection triggers and memory monitoring'
    });
  }
  
  // Medium priority optimizations
  if (metrics.cpuUsage > 80) {
    optimizations.push({
      priority: 'medium',
      action: 'Optimize CPU-intensive operations',
      expectedImpact: 'Reduce CPU usage by 20-40%',
      implementation: 'Implement async processing and worker threads'
    });
  }
  
  if (metrics.throughput < 100) {
    optimizations.push({
      priority: 'medium',
      action: 'Implement connection pooling',
      expectedImpact: 'Increase throughput by 30-60%',
      implementation: 'Configure database connection pool and HTTP keep-alive'
    });
  }
  
  // Low priority optimizations
  if (bottlenecks.length > 0) {
    optimizations.push({
      priority: 'low',
      action: 'Implement performance monitoring',
      expectedImpact: 'Better visibility into performance issues',
      implementation: 'Add detailed performance metrics and alerting'
    });
  }
  
  return optimizations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

// Helper untuk check if performance is acceptable
export const isPerformanceAcceptable = (
  metrics: PerformanceMetrics,
  thresholds: PerformanceThresholds
): boolean => {
  const check = checkPerformanceThresholds(metrics, thresholds);
  return check.passed;
};

// Helper untuk get performance recommendations
export const getPerformanceRecommendations = (
  metrics: PerformanceMetrics,
  thresholds: PerformanceThresholds
): string[] => {
  const recommendations: string[] = [];
  
  if (metrics.responseTime > thresholds.responseTime.warning) {
    recommendations.push('Consider implementing caching strategies');
    recommendations.push('Optimize database queries and indexes');
    recommendations.push('Use CDN for static assets');
  }
  
  if (metrics.memoryUsage > thresholds.memoryUsage.warning) {
    recommendations.push('Implement memory cleanup routines');
    recommendations.push('Monitor for memory leaks');
    recommendations.push('Consider increasing memory limits');
  }
  
  if (metrics.cpuUsage > thresholds.cpuUsage.warning) {
    recommendations.push('Implement async processing');
    recommendations.push('Use worker threads for CPU-intensive tasks');
    recommendations.push('Consider load balancing');
  }
  
  if (metrics.throughput < thresholds.throughput.warning) {
    recommendations.push('Implement connection pooling');
    recommendations.push('Optimize request handling');
    recommendations.push('Consider horizontal scaling');
  }
  
  return recommendations;
};
