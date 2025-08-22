// ======================================
// SQL INJECTION PREVENTION MODULE
// ======================================
// Comprehensive SQL injection prevention and detection

import { Request, Response, NextFunction } from 'express';
import { SQLPreventionConfig, SecurityViolation, ViolationType, RiskLevel } from '../types/security.types';

export class SQLInjectionPrevention {
  private config: SQLPreventionConfig;
  private suspiciousQueries: Map<string, number> = new Map();

  constructor(config: SQLPreventionConfig) {
    this.config = config;
  }

  /**
   * Middleware to detect SQL injection attempts
   */
  detectSQLInjection(): (req: Request, res: Response, next: NextFunction) => void | Response {
    return (req: Request, res: Response, next: NextFunction): void | Response => {
      const violations: SecurityViolation[] = [];

      // Check all input fields
      const inputsToCheck = [
        ...Object.values(req.body || {}),
        ...Object.values(req.query || {}),
        ...Object.values(req.params || {})
      ];

      for (const input of inputsToCheck) {
        if (typeof input === 'string') {
          const detectionResult = this.detectMaliciousSQL(input);
          if (detectionResult.suspicious) {
            violations.push({
              type: ViolationType.SQL_INJECTION_ATTEMPT,
              severity: detectionResult.severity,
              description: `Potential SQL injection: ${detectionResult.pattern}`,
              action: 'Request blocked',
              timestamp: new Date()
            });
          }
        }
      }

      if (violations.length > 0) {
        this.logSQLViolation(violations, req);
        
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Suspicious request detected',
          requestId: this.generateRequestId()
        });
      }

      next();
    };
  }

  /**
   * Detect malicious SQL patterns
   */
  detectMaliciousSQL(input: string): { suspicious: boolean; pattern?: string; severity: RiskLevel } {
    const normalizedInput = input.toLowerCase().trim();

    // High-risk patterns (immediate block)
    const criticalPatterns = [
      /(\b(exec|execute|sp_|xp_)\b)/i,
      /(drop\s+(table|database|schema|view|index|procedure|function))/i,
      /(delete\s+from\s+\w+)/i,
      /(truncate\s+table)/i,
      /(alter\s+(table|database|schema))/i,
      /(create\s+(table|database|schema|view|index|procedure|function))/i,
      /(grant|revoke)\s+/i,
      /(\|\||\|)/i, // Concatenation attacks
      /(waitfor\s+delay)/i,
      /(benchmark\s*\()/i,
      /(sleep\s*\()/i,
      /(load_file\s*\()/i,
      /(into\s+(outfile|dumpfile))/i
    ];

    for (const pattern of criticalPatterns) {
      if (pattern.test(normalizedInput)) {
        return {
          suspicious: true,
          pattern: pattern.source,
          severity: RiskLevel.CRITICAL
        };
      }
    }

    // Medium-risk patterns
    const mediumPatterns = [
      /(union\s+(all\s+)?select)/i,
      /(select\s+.*\s+from\s+)/i,
      /(insert\s+into\s+)/i,
      /(update\s+.*\s+set)/i,
      /('.*'.*=.*'.*')/i, // String equality comparisons
      /(or\s+1\s*=\s*1)/i,
      /(and\s+1\s*=\s*1)/i,
      /(or\s+'.*'\s*=\s*'.*')/i,
      /(and\s+'.*'\s*=\s*'.*')/i,
      /(having\s+)/i,
      /(group\s+by\s+)/i,
      /(order\s+by\s+)/i,
      /(limit\s+\d+)/i,
      /(offset\s+\d+)/i
    ];

    for (const pattern of mediumPatterns) {
      if (pattern.test(normalizedInput)) {
        return {
          suspicious: true,
          pattern: pattern.source,
          severity: RiskLevel.HIGH
        };
      }
    }

    // Low-risk patterns (suspicious but might be false positives)
    const lowPatterns = [
      /(--\s*$)/m, // SQL comments
      /(\s*#\s*)/i,
      /(\s*\/\*.*\*\/\s*)/i,
      /(\s*;\s*)/i, // Statement separators
      /(char\s*\(\s*\d+\s*\))/i,
      /(ascii\s*\()/i,
      /(substring\s*\()/i,
      /(concat\s*\()/i,
      /(length\s*\()/i,
      /(count\s*\()/i,
      /(sum\s*\()/i,
      /(avg\s*\()/i,
      /(min\s*\()/i,
      /(max\s*\()/i
    ];

    for (const pattern of lowPatterns) {
      if (pattern.test(normalizedInput)) {
        return {
          suspicious: true,
          pattern: pattern.source,
          severity: RiskLevel.MEDIUM
        };
      }
    }

    // Check for custom suspicious patterns
    if (this.config.suspiciousPatterns) {
      for (const customPattern of this.config.suspiciousPatterns) {
        const regex = new RegExp(customPattern, 'i');
        if (regex.test(normalizedInput)) {
          return {
            suspicious: true,
            pattern: customPattern,
            severity: RiskLevel.HIGH
          };
        }
      }
    }

    return { suspicious: false, severity: RiskLevel.LOW };
  }

  /**
   * Sanitize SQL input (basic sanitization)
   */
  sanitizeSQL(input: string): string {
    if (typeof input !== 'string') return input;

    return input
      // Remove SQL comments
      .replace(/--.*$/gm, '')
      .replace(/\/\*.*\*\//g, '')
      .replace(/#.*$/gm, '')
      
      // Remove dangerous characters
      .replace(/[;\|\&\$\>\<\`\\]/g, '')
      
      // Escape single quotes
      .replace(/'/g, "''")
      
      // Remove multiple whitespaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Validate query before execution (for custom queries)
   */
  validateQuery(query: string, allowedOperations: string[] = ['SELECT']): { valid: boolean; reason?: string } {
    const normalizedQuery = query.toLowerCase().trim();

    // Check if operation is allowed
    const operation = normalizedQuery.split(' ')[0];
    if (!allowedOperations.includes(operation.toUpperCase())) {
      return {
        valid: false,
        reason: `Operation ${operation.toUpperCase()} not allowed`
      };
    }

    // Check for suspicious patterns
    const detectionResult = this.detectMaliciousSQL(query);
    if (detectionResult.suspicious && detectionResult.severity === RiskLevel.CRITICAL) {
      return {
        valid: false,
        reason: `Suspicious pattern detected: ${detectionResult.pattern}`
      };
    }

    // Additional validation rules
    if (normalizedQuery.includes('information_schema')) {
      return {
        valid: false,
        reason: 'Access to information_schema not allowed'
      };
    }

    if (normalizedQuery.includes('mysql.')) {
      return {
        valid: false,
        reason: 'Access to mysql system database not allowed'
      };
    }

    return { valid: true };
  }

  /**
   * Create prepared statement validator
   */
  createPreparedStatementValidator() {
    return {
      validateParameters: (params: any[]): { valid: boolean; sanitized: any[] } => {
        const sanitized = params.map(param => {
          if (typeof param === 'string') {
            const detectionResult = this.detectMaliciousSQL(param);
            if (detectionResult.suspicious && detectionResult.severity === RiskLevel.CRITICAL) {
              throw new Error(`SQL injection attempt detected in parameter: ${param}`);
            }
            return this.sanitizeSQL(param);
          }
          return param;
        });

        return { valid: true, sanitized };
      },

      createSafeQuery: (template: string, params: any[]) => {
        const validation = this.validateQuery(template);
        if (!validation.valid) {
          throw new Error(`Invalid query template: ${validation.reason}`);
        }

        const paramValidation = this.createPreparedStatementValidator().validateParameters(params);
        if (!paramValidation.valid) {
          throw new Error('Invalid parameters for prepared statement');
        }

        return {
          query: template,
          params: paramValidation.sanitized
        };
      }
    };
  }

  /**
   * Query logging for monitoring
   */
  logQuery(query: string, params: any[], userId?: string): void {
    if (!this.config.enableQueryLogging) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      query: this.sanitizeForLogging(query),
      paramCount: params?.length || 0,
      userId: userId || 'anonymous',
      suspicious: this.detectMaliciousSQL(query).suspicious
    };

    console.log('SQL Query Log:', logEntry);

    // Track suspicious query patterns
    if (logEntry.suspicious) {
      const key = this.generateQuerySignature(query);
      const count = this.suspiciousQueries.get(key) || 0;
      this.suspiciousQueries.set(key, count + 1);

      if (count + 1 >= 5) { // Alert after 5 suspicious queries
        console.error('SECURITY ALERT: Multiple suspicious SQL patterns detected', {
          signature: key,
          count: count + 1,
          userId
        });
      }
    }
  }

  /**
   * Sanitize query for safe logging
   */
  private sanitizeForLogging(query: string): string {
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password='***'")
      .replace(/token\s*=\s*'[^']*'/gi, "token='***'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret='***'");
  }

  /**
   * Generate query signature for tracking
   */
  private generateQuerySignature(query: string): string {
    return query
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\d+/g, 'N')
      .replace(/'[^']*'/g, "'X'")
      .trim()
      .substring(0, 100);
  }

  /**
   * Log SQL injection violation
   */
  private logSQLViolation(violations: SecurityViolation[], req: Request): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      violations: violations.map(v => ({
        type: v.type,
        severity: v.severity,
        description: v.description
      })),
      body: this.sanitizeForLogging(JSON.stringify(req.body || {})),
      query: this.sanitizeForLogging(JSON.stringify(req.query || {}))
    };

    console.error('SQL INJECTION ATTEMPT:', logEntry);

    // Here you could send to SIEM, database, etc.
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create whitelist validator for specific endpoints
   */
  createWhitelistValidator(allowedFields: string[], allowedValues?: Record<string, string[]>) {
    return (req: Request, _res: Response, next: NextFunction) => {
      const violations: SecurityViolation[] = [];

      // Check body fields
      if (req.body) {
        for (const [field, value] of Object.entries(req.body)) {
          if (!allowedFields.includes(field)) {
            violations.push({
              type: ViolationType.UNAUTHORIZED_ACCESS,
              severity: RiskLevel.MEDIUM,
              description: `Unexpected field in request: ${field}`,
              action: 'Field removed',
              timestamp: new Date()
            });
            delete req.body[field];
            continue;
          }

          if (allowedValues && allowedValues[field]) {
            if (!allowedValues[field].includes(String(value))) {
              violations.push({
                type: ViolationType.MALICIOUS_INPUT,
                severity: RiskLevel.MEDIUM,
                description: `Invalid value for field ${field}: ${value}`,
                action: 'Request rejected',
                timestamp: new Date()
              });
            }
          }
        }
      }

      // Log violations but continue (non-blocking)
      if (violations.length > 0) {
        console.warn('Field validation violations:', violations);
      }

      next();
    };
  }
}
