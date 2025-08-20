// ======================================
// SECURITY MONITORING & ALERTING
// ======================================
// Comprehensive security monitoring with real-time alerts
// Supports multiple alert channels and configurable thresholds

import { SecurityMonitoringConfig, SecurityAlert, SecurityEvent, RiskLevel, ViolationType } from '../types/security.types';
import { logger } from '@/core/logger/logger';

export class SecurityMonitoring {
  private config: SecurityMonitoringConfig;
  private alerts: SecurityAlert[] = [];
  private events: SecurityEvent[] = [];
  private alertCounts: Record<ViolationType, number> = {} as Record<ViolationType, number>;
  private performanceMetrics: {
    responseTime: number[];
    memoryUsage: number[];
    cpuUsage: number[];
  } = {
    responseTime: [],
    memoryUsage: [],
    cpuUsage: []
  };

  constructor(config: SecurityMonitoringConfig) {
    this.config = config;
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Start performance monitoring if enabled
    if (this.config.enablePerformanceMonitoring) {
      this.startPerformanceMonitoring();
    }

    // Start alert cleanup
    this.startAlertCleanup();

    logger.info('🔒 Security monitoring initialized');
  }

  /**
   * Add a new security alert
   */
  addAlert(alert: SecurityAlert): void {
    this.alerts.push(alert);
    this.alertCounts[alert.type] = (this.alertCounts[alert.type] || 0) + 1;

    // Log the alert
    if (this.config.enableDetailedLogging) {
      logger.warn('🚨 Security Alert:', {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        context: {
          ipAddress: alert.context.ipAddress,
          endpoint: alert.context.endpoint,
          userId: alert.context.userId
        }
      });
    }

    // Send real-time alerts if enabled
    if (this.config.enableRealTimeAlerts) {
      this.sendRealTimeAlert(alert);
    }

    // Check if we need to trigger additional actions
    this.checkAlertThresholds(alert);
  }

  /**
   * Add a new security event
   */
  addEvent(event: SecurityEvent): void {
    this.events.push(event);

    // Log the event
    if (this.config.enableDetailedLogging) {
      logger.info('📊 Security Event:', {
        id: event.id,
        type: event.type,
        severity: event.severity,
        source: event.source,
        timestamp: event.timestamp,
        data: event.data
      });
    }

    // Correlate events
    this.correlateEvents(event);
  }

  /**
   * Get all alerts
   */
  getAlerts(): SecurityAlert[] {
    return [...this.alerts];
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: RiskLevel): SecurityAlert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(type: ViolationType): SecurityAlert[] {
    return this.alerts.filter(alert => alert.type === type);
  }

  /**
   * Get unacknowledged alerts
   */
  getUnacknowledgedAlerts(): SecurityAlert[] {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  /**
   * Get unresolved alerts
   */
  getUnresolvedAlerts(): SecurityAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();

      this.addEvent({
        id: this.generateEventId(),
        type: 'alert',
        severity: alert.severity,
        timestamp: new Date(),
        source: 'security-monitoring',
        data: {
          action: 'alert_acknowledged',
          alertId: alert.id,
          acknowledgedBy: acknowledgedBy
        },
        processed: true,
        processedAt: new Date(),
        actionTaken: 'alert_acknowledged'
      });

      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, resolvedBy: string, notes?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = new Date();
      alert.notes = notes;

      this.addEvent({
        id: this.generateEventId(),
        type: 'alert',
        severity: alert.severity,
        timestamp: new Date(),
        source: 'security-monitoring',
        data: {
          action: 'alert_resolved',
          alertId: alert.id,
          resolvedBy: resolvedBy,
          notes: notes
        },
        processed: true,
        processedAt: new Date(),
        actionTaken: 'alert_resolved'
      });

      return true;
    }
    return false;
  }

  /**
   * Get all events
   */
  getEvents(): SecurityEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Get events by severity
   */
  getEventsBySeverity(severity: RiskLevel): SecurityEvent[] {
    return this.events.filter(event => event.severity === severity);
  }

  /**
   * Get events within time range
   */
  getEventsInTimeRange(startTime: Date, endTime: Date): SecurityEvent[] {
    return this.events.filter(event => 
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  /**
   * Get alert statistics
   */
  getAlertStats() {
    const totalAlerts = this.alerts.length;
    const unacknowledgedAlerts = this.getUnacknowledgedAlerts().length;
    const unresolvedAlerts = this.getUnresolvedAlerts().length;
    const criticalAlerts = this.getAlertsBySeverity(RiskLevel.CRITICAL).length;
    const highAlerts = this.getAlertsBySeverity(RiskLevel.HIGH).length;

    return {
      total: totalAlerts,
      unacknowledged: unacknowledgedAlerts,
      unresolved: unresolvedAlerts,
      critical: criticalAlerts,
      high: highAlerts,
      byType: { ...this.alertCounts },
      averageResponseTime: this.calculateAverageResponseTime(),
      memoryUsage: this.getCurrentMemoryUsage(),
      cpuUsage: this.getCurrentCpuUsage()
    };
  }

  /**
   * Record performance metrics
   */
  recordPerformanceMetrics(metrics: {
    responseTime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  }): void {
    if (metrics.responseTime !== undefined) {
      this.performanceMetrics.responseTime.push(metrics.responseTime);
      // Keep only last 1000 measurements
      if (this.performanceMetrics.responseTime.length > 1000) {
        this.performanceMetrics.responseTime.shift();
      }
    }

    if (metrics.memoryUsage !== undefined) {
      this.performanceMetrics.memoryUsage.push(metrics.memoryUsage);
      if (this.performanceMetrics.memoryUsage.length > 1000) {
        this.performanceMetrics.memoryUsage.shift();
      }
    }

    if (metrics.cpuUsage !== undefined) {
      this.performanceMetrics.cpuUsage.push(metrics.cpuUsage);
      if (this.performanceMetrics.cpuUsage.length > 1000) {
        this.performanceMetrics.cpuUsage.shift();
      }
    }

    // Check performance thresholds
    this.checkPerformanceThresholds(metrics);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      responseTime: {
        current: this.performanceMetrics.responseTime[this.performanceMetrics.responseTime.length - 1] || 0,
        average: this.calculateAverageResponseTime(),
        max: Math.max(...this.performanceMetrics.responseTime, 0),
        min: Math.min(...this.performanceMetrics.responseTime, Infinity),
        threshold: this.config.performanceThresholds.responseTime
      },
      memoryUsage: {
        current: this.getCurrentMemoryUsage(),
        average: this.calculateAverageMemoryUsage(),
        max: Math.max(...this.performanceMetrics.memoryUsage, 0),
        threshold: this.config.performanceThresholds.memoryUsage
      },
      cpuUsage: {
        current: this.getCurrentCpuUsage(),
        average: this.calculateAverageCpuUsage(),
        max: Math.max(...this.performanceMetrics.cpuUsage, 0),
        threshold: this.config.performanceThresholds.cpuUsage
      }
    };
  }

  /**
   * Send real-time alert through configured channels
   */
  private sendRealTimeAlert(alert: SecurityAlert): void {
    this.config.alertChannels.forEach(channel => {
      switch (channel) {
        case 'log':
          this.sendLogAlert(alert);
          break;
        case 'email':
          this.sendEmailAlert(alert);
          break;
        case 'webhook':
          this.sendWebhookAlert(alert);
          break;
        case 'slack':
          this.sendSlackAlert(alert);
          break;
        default:
          logger.warn(`Unknown alert channel: ${channel}`);
      }
    });
  }

  /**
   * Send alert to log
   */
  private sendLogAlert(alert: SecurityAlert): void {
    const logLevel = alert.severity === RiskLevel.CRITICAL ? 'error' : 'warn';
    logger[logLevel]('🚨 SECURITY ALERT', {
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      timestamp: alert.timestamp,
      context: {
        ipAddress: alert.context.ipAddress,
        endpoint: alert.context.endpoint,
        userId: alert.context.userId,
        userAgent: alert.context.userAgent
      }
    });
  }

  /**
   * Send alert via email
   */
  private sendEmailAlert(alert: SecurityAlert): void {
    // This would integrate with your email service
    // For now, just log the intention
    if (this.config.enableEmailAlerts) {
      logger.info('📧 Email alert would be sent:', {
        to: this.config.alertEmailRecipients,
        subject: `Security Alert: ${alert.type}`,
        severity: alert.severity,
        message: alert.message
      });
    }
  }

  /**
   * Send alert via webhook
   */
  private sendWebhookAlert(alert: SecurityAlert): void {
    // This would send to configured webhook endpoints
    logger.info('🔗 Webhook alert would be sent:', {
      type: alert.type,
      severity: alert.severity,
      message: alert.message
    });
  }

  /**
   * Send alert via Slack
   */
  private sendSlackAlert(alert: SecurityAlert): void {
    // This would integrate with Slack webhook
    logger.info('💬 Slack alert would be sent:', {
      type: alert.type,
      severity: alert.severity,
      message: alert.message
    });
  }

  /**
   * Check alert thresholds and trigger additional actions
   */
  private checkAlertThresholds(alert: SecurityAlert): void {
    const thresholds = this.config.alertThresholds;
    const currentCount = this.alertCounts[alert.type] || 0;

    let threshold = 0;
    switch (alert.type) {
      case ViolationType.RATE_LIMIT_EXCEEDED:
        threshold = thresholds.rateLimitViolations;
        break;
      case ViolationType.SQL_INJECTION_ATTEMPT:
        threshold = thresholds.sqlInjectionAttempts;
        break;
      case ViolationType.XSS_ATTEMPT:
        threshold = thresholds.xssAttempts;
        break;
      case ViolationType.FILE_UPLOAD_VIOLATION:
        threshold = thresholds.fileUploadViolations;
        break;
      default:
        return;
    }

    if (currentCount >= threshold) {
      this.triggerThresholdAction(alert.type, currentCount, threshold);
    }
  }

  /**
   * Trigger action when threshold is reached
   */
  private triggerThresholdAction(type: ViolationType, count: number, threshold: number): void {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type: 'incident',
      severity: RiskLevel.HIGH,
      timestamp: new Date(),
      source: 'security-monitoring',
      data: {
        action: 'threshold_reached',
        violationType: type,
        currentCount: count,
        threshold: threshold
      },
      processed: false
    };

    this.addEvent(event);

    logger.error('🚨 Security threshold reached:', {
      type: type,
      count: count,
      threshold: threshold,
      action: 'Additional security measures may be required'
    });
  }

  /**
   * Check performance thresholds
   */
  private checkPerformanceThresholds(metrics: any): void {
    const thresholds = this.config.performanceThresholds;

    if (metrics.responseTime && metrics.responseTime > thresholds.responseTime) {
      this.addPerformanceAlert('response_time', metrics.responseTime, thresholds.responseTime);
    }

    if (metrics.memoryUsage && metrics.memoryUsage > thresholds.memoryUsage) {
      this.addPerformanceAlert('memory_usage', metrics.memoryUsage, thresholds.memoryUsage);
    }

    if (metrics.cpuUsage && metrics.cpuUsage > thresholds.cpuUsage) {
      this.addPerformanceAlert('cpu_usage', metrics.cpuUsage, thresholds.cpuUsage);
    }
  }

  /**
   * Add performance alert
   */
  private addPerformanceAlert(type: string, current: number, threshold: number): void {
    const alert: SecurityAlert = {
      id: this.generateEventId(),
      type: ViolationType.PERFORMANCE_VIOLATION,
      severity: RiskLevel.MEDIUM,
      message: `${type} exceeded threshold: ${current} > ${threshold}`,
      timestamp: new Date(),
      context: {
        requestId: 'performance-monitoring',
        userAgent: 'system',
        ipAddress: 'localhost',
        timestamp: new Date(),
        riskLevel: RiskLevel.MEDIUM,
        violations: [],
        endpoint: 'performance',
        method: 'MONITORING',
        requestSize: 0,
        securityScore: 80,
        threatIndicators: ['performance_degradation']
      },
      acknowledged: false,
      resolved: false
    };

    this.addAlert(alert);
  }

  /**
   * Correlate events to identify patterns
   */
  private correlateEvents(event: SecurityEvent): void {
    // Find related events within the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => 
      e.timestamp >= oneHourAgo && 
      e.id !== event.id &&
      e.source === event.source
    );

    if (recentEvents.length >= 3) {
      // Pattern detected - create correlation event
      const correlationEvent: SecurityEvent = {
        id: this.generateEventId(),
        type: 'incident',
        severity: RiskLevel.HIGH,
        timestamp: new Date(),
        source: 'security-monitoring',
        data: {
          action: 'pattern_detected',
          pattern: 'repeated_events',
          eventCount: recentEvents.length + 1,
          timeWindow: '1_hour',
          source: event.source
        },
        relatedEvents: [event.id, ...recentEvents.map(e => e.id)],
        correlationId: `corr_${Date.now()}`,
        processed: false
      };

      this.events.push(correlationEvent);
    }
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      const memoryUsage = this.getCurrentMemoryUsage();
      const cpuUsage = this.getCurrentCpuUsage();

      this.recordPerformanceMetrics({
        memoryUsage,
        cpuUsage
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Start alert cleanup
   */
  private startAlertCleanup(): void {
    setInterval(() => {
      this.cleanupOldAlerts();
      this.cleanupOldEvents();
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }

  /**
   * Cleanup old alerts
   */
  private cleanupOldAlerts(): void {
    const retentionDays = this.config.logRetentionDays;
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    this.alerts = this.alerts.filter(alert => alert.timestamp >= cutoffDate);
    
    logger.info(`🧹 Cleaned up old alerts, retained ${this.alerts.length} alerts`);
  }

  /**
   * Cleanup old events
   */
  private cleanupOldEvents(): void {
    const retentionDays = this.config.logRetentionDays;
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    this.events = this.events.filter(event => event.timestamp >= cutoffDate);
    
    logger.info(`🧹 Cleaned up old events, retained ${this.events.length} events`);
  }

  // Helper methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateAverageResponseTime(): number {
    if (this.performanceMetrics.responseTime.length === 0) return 0;
    const sum = this.performanceMetrics.responseTime.reduce((a, b) => a + b, 0);
    return sum / this.performanceMetrics.responseTime.length;
  }

  private calculateAverageMemoryUsage(): number {
    if (this.performanceMetrics.memoryUsage.length === 0) return 0;
    const sum = this.performanceMetrics.memoryUsage.reduce((a, b) => a + b, 0);
    return sum / this.performanceMetrics.memoryUsage.length;
  }

  private calculateAverageCpuUsage(): number {
    if (this.performanceMetrics.cpuUsage.length === 0) return 0;
    const sum = this.performanceMetrics.cpuUsage.reduce((a, b) => a + b, 0);
    return sum / this.performanceMetrics.cpuUsage.length;
  }

  private getCurrentMemoryUsage(): number {
    const memUsage = process.memoryUsage();
    return (memUsage.heapUsed / memUsage.heapTotal) * 100;
  }

  private getCurrentCpuUsage(): number {
    // This is a simplified CPU usage calculation
    // In production, you might want to use a more sophisticated approach
    return process.cpuUsage().user / 1000000; // Convert to seconds
  }
} 