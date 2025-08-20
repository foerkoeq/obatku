// ======================================
// SECURITY MONITORING HELPERS
// ======================================
// Helper functions untuk security monitoring
// Memudahkan setup dan konfigurasi monitoring

import { SecurityEvent, SecurityAlert, SecurityMonitoringConfig, RiskLevel } from '../types/security.types';

// Helper untuk format event data
export const formatSecurityEvent = (event: SecurityEvent): string => {
  const timestamp = event.timestamp.toISOString();
  const severity = event.severity.toUpperCase();
  const source = event.source;
  const type = event.type;
  const message = event.data.message || 'No message provided';
  
  return `[${timestamp}] [${severity}] [${source}] [${type}] ${message}`;
};

// Helper untuk categorize events
export const categorizeSecurityEvents = (events: SecurityEvent[]): {
  critical: SecurityEvent[];
  high: SecurityEvent[];
  medium: SecurityEvent[];
  low: SecurityEvent[];
} => {
  return {
    critical: events.filter(e => e.severity === RiskLevel.CRITICAL),
    high: events.filter(e => e.severity === RiskLevel.HIGH),
    medium: events.filter(e => e.severity === RiskLevel.MEDIUM),
    low: events.filter(e => e.severity === RiskLevel.LOW)
  };
};

// Helper untuk detect patterns in events
export const detectEventPatterns = (events: SecurityEvent[]): {
  pattern: string;
  count: number;
  severity: RiskLevel;
  timeRange: { start: Date; end: Date };
}[] => {
  const patterns: Map<string, SecurityEvent[]> = new Map();
  
  events.forEach(event => {
    const key = `${event.type}_${event.source}`;
    if (!patterns.has(key)) {
      patterns.set(key, []);
    }
    patterns.get(key)!.push(event);
  });
  
  return Array.from(patterns.entries())
    .filter(([_, events]) => events.length >= 3)
    .map(([pattern, events]) => {
      const sortedEvents = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const maxSeverity = events.reduce((max, event) => {
        const severityOrder = { 
          [RiskLevel.CRITICAL]: 4, 
          [RiskLevel.HIGH]: 3, 
          [RiskLevel.MEDIUM]: 2, 
          [RiskLevel.LOW]: 1 
        };
        return severityOrder[event.severity] > severityOrder[max] ? event.severity : max;
      }, RiskLevel.LOW);
      
      return {
        pattern,
        count: events.length,
        severity: maxSeverity,
        timeRange: {
          start: sortedEvents[0].timestamp,
          end: sortedEvents[sortedEvents.length - 1].timestamp
        }
      };
    });
};

// Helper untuk generate monitoring report
export const generateMonitoringReport = (
  events: SecurityEvent[],
  alerts: SecurityAlert[]
): {
  summary: {
    totalEvents: number;
    totalAlerts: number;
    criticalEvents: number;
    unacknowledgedAlerts: number;
    timeRange: { start: Date; end: Date };
  };
  events: {
    bySeverity: Record<string, number>;
    bySource: Record<string, number>;
    byType: Record<string, number>;
  };
  alerts: {
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    unacknowledged: SecurityAlert[];
  };
  patterns: ReturnType<typeof detectEventPatterns>;
} => {
  const categorizedEvents = categorizeSecurityEvents(events);
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  
  const eventBySeverity = {
    [RiskLevel.CRITICAL]: categorizedEvents.critical.length,
    [RiskLevel.HIGH]: categorizedEvents.high.length,
    [RiskLevel.MEDIUM]: categorizedEvents.medium.length,
    [RiskLevel.LOW]: categorizedEvents.low.length
  };
  
  const eventBySource = events.reduce((acc, event) => {
    acc[event.source] = (acc[event.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const eventByType = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const alertBySeverity = alerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const alertByStatus = alerts.reduce((acc, alert) => {
    const status = alert.acknowledged ? 'acknowledged' : 'unacknowledged';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sortedEvents = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  return {
    summary: {
      totalEvents: events.length,
      totalAlerts: alerts.length,
      criticalEvents: categorizedEvents.critical.length,
      unacknowledgedAlerts: unacknowledgedAlerts.length,
      timeRange: {
        start: sortedEvents[0]?.timestamp || new Date(),
        end: sortedEvents[sortedEvents.length - 1]?.timestamp || new Date()
      }
    },
    events: {
      bySeverity: eventBySeverity,
      bySource: eventBySource,
      byType: eventByType
    },
    alerts: {
      bySeverity: alertBySeverity,
      byStatus: alertByStatus,
      unacknowledged: unacknowledgedAlerts
    },
    patterns: detectEventPatterns(events)
  };
};

// Helper untuk check monitoring health
export const checkMonitoringHealth = (
  events: SecurityEvent[],
  alerts: SecurityAlert[],
  config: SecurityMonitoringConfig
): {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check for too many critical events
  const criticalEvents = events.filter(e => e.severity === RiskLevel.CRITICAL);
  if (criticalEvents.length > 10) {
    issues.push(`Too many critical events: ${criticalEvents.length}`);
    recommendations.push('Review security configuration and investigate root causes');
  }
  
  // Check for unacknowledged critical alerts
  const unacknowledgedCritical = alerts.filter(a => !a.acknowledged && a.severity === RiskLevel.CRITICAL);
  if (unacknowledgedCritical.length > 0) {
    issues.push(`${unacknowledgedCritical.length} critical alerts unacknowledged`);
    recommendations.push('Acknowledge or resolve critical alerts immediately');
  }
  
  // Check for event patterns
  const patterns = detectEventPatterns(events);
  const criticalPatterns = patterns.filter(p => p.severity === RiskLevel.CRITICAL);
  if (criticalPatterns.length > 0) {
    issues.push(`${criticalPatterns.length} critical event patterns detected`);
    recommendations.push('Investigate and address recurring security issues');
  }
  
  // Check monitoring configuration
  if (!config.enableRealTimeAlerts) {
    recommendations.push('Consider enabling real-time alerts for better security monitoring');
  }
  
  if (!config.enableDetailedLogging) {
    recommendations.push('Consider enabling detailed logging for better insights');
  }
  
  const status = issues.length === 0 ? 'healthy' : 
                 issues.some(i => i.includes('critical')) ? 'critical' : 'warning';
  
  return {
    status,
    issues,
    recommendations
  };
};

// Helper untuk filter events by time range
export const filterEventsByTimeRange = (
  events: SecurityEvent[],
  startTime: Date,
  endTime: Date
): SecurityEvent[] => {
  return events.filter(event => 
    event.timestamp >= startTime && event.timestamp <= endTime
  );
};

// Helper untuk get recent events
export const getRecentEvents = (
  events: SecurityEvent[],
  hours: number = 24
): SecurityEvent[] => {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  return filterEventsByTimeRange(events, cutoffTime, new Date());
};

// Helper untuk calculate event statistics
export const calculateEventStatistics = (events: SecurityEvent[]): {
  totalEvents: number;
  averageEventsPerHour: number;
  peakHour: { hour: number; count: number };
  mostCommonSource: { source: string; count: number };
  mostCommonType: { type: string; count: number };
} => {
  if (events.length === 0) {
    return {
      totalEvents: 0,
      averageEventsPerHour: 0,
      peakHour: { hour: 0, count: 0 },
      mostCommonSource: { source: '', count: 0 },
      mostCommonType: { type: '', count: 0 }
    };
  }
  
  // Calculate average events per hour
  const sortedEvents = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const timeSpan = sortedEvents[sortedEvents.length - 1].timestamp.getTime() - sortedEvents[0].timestamp.getTime();
  const hoursSpan = timeSpan / (1000 * 60 * 60);
  const averageEventsPerHour = events.length / hoursSpan;
  
  // Find peak hour
  const hourlyCounts = new Map<number, number>();
  events.forEach(event => {
    const hour = event.timestamp.getHours();
    hourlyCounts.set(hour, (hourlyCounts.get(hour) || 0) + 1);
  });
  
  let peakHour = { hour: 0, count: 0 };
  hourlyCounts.forEach((count, hour) => {
    if (count > peakHour.count) {
      peakHour = { hour, count };
    }
  });
  
  // Find most common source
  const sourceCounts = new Map<string, number>();
  events.forEach(event => {
    sourceCounts.set(event.source, (sourceCounts.get(event.source) || 0) + 1);
  });
  
  let mostCommonSource = { source: '', count: 0 };
  sourceCounts.forEach((count, source) => {
    if (count > mostCommonSource.count) {
      mostCommonSource = { source, count };
    }
  });
  
  // Find most common type
  const typeCounts = new Map<string, number>();
  events.forEach(event => {
    typeCounts.set(event.type, (typeCounts.get(event.type) || 0) + 1);
  });
  
  let mostCommonType = { type: '', count: 0 };
  typeCounts.forEach((count, type) => {
    if (count > mostCommonType.count) {
      mostCommonType = { type, count };
    }
  });
  
  return {
    totalEvents: events.length,
    averageEventsPerHour,
    peakHour,
    mostCommonSource,
    mostCommonType
  };
};
