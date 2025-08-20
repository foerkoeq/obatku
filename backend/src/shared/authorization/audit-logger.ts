/**
 * Audit Logger
 * 
 * Comprehensive audit logging system for tracking user actions and access attempts.
 * This system provides detailed logging for security, compliance, and monitoring.
 */

import { Request } from 'express';
import {
  AuditLogEntry,
  AuditLogOptions,
} from './types';
import {
  AUDIT_SETTINGS,
} from './constants';

export class AuditLogger {
  private static instance: AuditLogger;
  private logQueue: AuditLogEntry[] = [];
  private isProcessing = false;
  private flushTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.startPeriodicFlush();
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  // ================================================
  // PUBLIC LOGGING METHODS
  // ================================================

  /**
   * Log an access attempt or permission check
   */
  public async logAccess(
    entry: Omit<AuditLogEntry, 'id' | 'timestamp'>,
    req?: Request,
    options: AuditLogOptions = {}
  ): Promise<void> {
    if (!AUDIT_SETTINGS.ENABLED) return;

    try {
      const auditEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date(),
        ipAddress: this.extractIpAddress(req),
        userAgent: req?.headers['user-agent'],
        metadata: this.buildMetadata(req, options),
      };

      this.addToQueue(auditEntry);
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Log authentication events
   */
  public async logAuthentication(
    userId: string,
    action: 'login' | 'logout' | 'token_refresh' | 'password_reset',
    result: 'success' | 'failure',
    reason?: string,
    req?: Request
  ): Promise<void> {
    await this.logAccess({
      userId,
      action: `auth_${action}`,
      resource: 'authentication',
      result: result === 'success' ? 'granted' : 'denied',
      reason,
    }, req);
  }

  /**
   * Log authorization events
   */
  public async logAuthorization(
    userId: string,
    resource: string,
    action: string,
    result: 'granted' | 'denied',
    reason?: string,
    req?: Request
  ): Promise<void> {
    await this.logAccess({
      userId,
      action: `authz_${action}`,
      resource,
      result,
      reason,
    }, req);
  }

  /**
   * Log resource operations
   */
  public async logResourceOperation(
    userId: string,
    operation: 'create' | 'read' | 'update' | 'delete',
    resource: string,
    resourceId?: string,
    result: 'success' | 'failure' = 'success',
    req?: Request
  ): Promise<void> {
    await this.logAccess({
      userId,
      action: `resource_${operation}`,
      resource,
      resourceId,
      result: result === 'success' ? 'granted' : 'denied',
    }, req);
  }

  /**
   * Log security events
   */
  public async logSecurityEvent(
    userId: string,
    event: 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access' | 'data_breach_attempt',
    details: any,
    req?: Request
  ): Promise<void> {
    await this.logAccess({
      userId,
      action: `security_${event}`,
      resource: 'security',
      result: 'denied',
      reason: 'Security event detected',
      context: details,
    }, req, { level: 'full' });
  }

  /**
   * Log system events
   */
  public async logSystemEvent(
    action: 'startup' | 'shutdown' | 'configuration_change' | 'maintenance',
    details?: any
  ): Promise<void> {
    await this.logAccess({
      userId: 'system',
      action: `system_${action}`,
      resource: 'system',
      result: 'granted',
      context: details,
    });
  }

  // ================================================
  // QUEUE MANAGEMENT
  // ================================================

  private addToQueue(entry: AuditLogEntry): void {
    this.logQueue.push(entry);

    // If queue is getting full, process immediately
    if (this.logQueue.length >= AUDIT_SETTINGS.MAX_QUEUE_SIZE) {
      this.processQueue();
    }
  }

  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.logQueue.length > 0) {
        this.processQueue();
      }
    }, AUDIT_SETTINGS.FLUSH_INTERVAL);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.logQueue.splice(0, AUDIT_SETTINGS.BATCH_SIZE);

    try {
      await this.persistBatch(batch);
    } catch (error) {
      console.error('Failed to persist audit log batch:', error);
      // Re-add failed entries to queue for retry
      this.logQueue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  // ================================================
  // PERSISTENCE
  // ================================================

  private async persistBatch(entries: AuditLogEntry[]): Promise<void> {
    try {
      // TODO: Implement actual database persistence
      // For now, we'll log to console and file
      
      for (const entry of entries) {
        this.logToConsole(entry);
        await this.logToFile(entry);
      }
      
      // In a real implementation, you would:
      // await this.databaseService.insertAuditLogs(entries);
      
    } catch (error) {
      console.error('Error persisting audit logs:', error);
      throw error;
    }
  }

  private logToConsole(entry: AuditLogEntry): void {
    const level = entry.result === 'denied' ? 'warn' : 'info';
    const message = `[AUDIT] ${entry.userId} ${entry.action} ${entry.resource} - ${entry.result}`;
    
    console[level](message, {
      timestamp: entry.timestamp,
      reason: entry.reason,
      context: entry.context,
    });
  }

  private async logToFile(entry: AuditLogEntry): Promise<void> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, 'audit.log');
      
      // Ensure directory exists
      await fs.mkdir(logDir, { recursive: true });
      
      const logLine = JSON.stringify({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
      }) + '\n';
      
      await fs.appendFile(logFile, logLine);
    } catch (error) {
      console.error('Failed to write audit log to file:', error);
    }
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  private extractIpAddress(req?: Request): string | undefined {
    if (!req) return undefined;
    
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip
    );
  }

  private buildMetadata(req?: Request, options: AuditLogOptions = {}): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    if (!req) return metadata;
    
    // Basic request information
    metadata.method = req.method;
    metadata.url = req.url;
    metadata.path = req.path;
    
    // Headers (filtered)
    if (options.includeHeaders) {
      metadata.headers = this.filterSensitiveData(req.headers, options.excludeFields);
    }
    
    // Request body (filtered)
    if (options.includeBody && req.body) {
      metadata.body = this.filterSensitiveData(req.body, options.excludeFields);
    }
    
    // Query parameters
    if (req.query && Object.keys(req.query).length > 0) {
      metadata.query = this.filterSensitiveData(req.query, options.excludeFields);
    }
    
    // Route parameters
    if (req.params && Object.keys(req.params).length > 0) {
      metadata.params = req.params;
    }
    
    return metadata;
  }

  private filterSensitiveData(data: any, excludeFields: string[] = []): any {
    if (!data || typeof data !== 'object') return data;
    
    const sensitiveFields = [
      ...AUDIT_SETTINGS.SENSITIVE_FIELDS,
      ...excludeFields,
    ];
    
    const filtered = { ...data };
    
    for (const field of sensitiveFields) {
      if (field in filtered) {
        filtered[field] = '[REDACTED]';
      }
    }
    
    return filtered;
  }

  // ================================================
  // QUERY METHODS
  // ================================================

  /**
   * Get audit logs for a specific user
   */
  public async getAuditLogsForUser(
    userId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      actions?: string[];
      resources?: string[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AuditLogEntry[]> {
    // TODO: Implement database query
    // This would typically query the audit_logs table
    console.log('Getting audit logs for user:', userId, options);
    return [];
  }

  /**
   * Get audit logs for a specific resource
   */
  public async getAuditLogsForResource(
    resource: string,
    resourceId?: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      actions?: string[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AuditLogEntry[]> {
    // TODO: Implement database query
    console.log('Getting audit logs for resource:', resource, resourceId, options);
    return [];
  }

  /**
   * Get security events
   */
  public async getSecurityEvents(
    options: {
      startDate?: Date;
      endDate?: Date;
      severity?: 'low' | 'medium' | 'high';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AuditLogEntry[]> {
    // TODO: Implement database query for security events
    console.log('Getting security events:', options);
    return [];
  }

  // ================================================
  // CLEANUP METHODS
  // ================================================

  /**
   * Clean up old audit logs based on retention policy
   */
  public async cleanupOldLogs(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - AUDIT_SETTINGS.RETENTION_DAYS);
      
      // TODO: Implement database cleanup
      // await this.databaseService.deleteAuditLogsBefore(cutoffDate);
      
      console.log(`Cleaned up audit logs older than ${cutoffDate.toISOString()}`);
    } catch (error) {
      console.error('Failed to cleanup old audit logs:', error);
    }
  }

  /**
   * Graceful shutdown - flush remaining logs
   */
  public async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Process remaining queue
    if (this.logQueue.length > 0) {
      await this.processQueue();
    }
  }
}
