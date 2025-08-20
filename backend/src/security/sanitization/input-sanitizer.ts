// ======================================
// INPUT SANITIZATION MODULE
// ======================================
// Comprehensive input sanitization untuk mencegah XSS, injection, dll

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';
import { SanitizationConfig, SanitizationResult, SecurityViolation, ViolationType, RiskLevel } from '../types/security.types';

export class InputSanitizer {
  private config: SanitizationConfig;

  constructor(config: SanitizationConfig) {
    this.config = config;
  }

  /**
   * Sanitize any input data (string, object, array)
   */
  sanitize(input: any): SanitizationResult {
    const violations: SecurityViolation[] = [];
    let sanitized: any;
    const startTime = Date.now();
    let fieldsProcessed = 0;
    let fieldsModified = 0;

    try {
      if (typeof input === 'string') {
        sanitized = this.sanitizeString(input, violations);
        fieldsProcessed = 1;
        fieldsModified = violations.length > 0 ? 1 : 0;
      } else if (Array.isArray(input)) {
        sanitized = this.sanitizeArray(input, violations);
        fieldsProcessed = input.length;
        fieldsModified = violations.length > 0 ? 1 : 0;
      } else if (typeof input === 'object' && input !== null) {
        sanitized = this.sanitizeObject(input, violations);
        fieldsProcessed = Object.keys(input).length;
        fieldsModified = violations.length > 0 ? 1 : 0;
      } else {
        sanitized = input;
        fieldsProcessed = 1;
        fieldsModified = 0;
      }

      return {
        original: input,
        sanitized,
        violations,
        isSafe: violations.length === 0,
        sanitizationTime: Date.now() - startTime,
        fieldsProcessed,
        fieldsModified,
        confidence: violations.length === 0 ? 1.0 : Math.max(0.1, 1.0 - (violations.length * 0.2))
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      violations.push({
        type: ViolationType.MALICIOUS_INPUT,
        severity: RiskLevel.HIGH,
        description: `Sanitization error: ${errorMessage}`,
        action: 'Input rejected',
        timestamp: new Date()
      });

      return {
        original: input,
        sanitized: '',
        violations,
        isSafe: false,
        sanitizationTime: Date.now() - startTime,
        fieldsProcessed: 1,
        fieldsModified: 1,
        confidence: 0.0
      };
    }
  }

  /**
   * Sanitize string input
   */
  private sanitizeString(input: string, violations: SecurityViolation[]): string {
    let sanitized = input;

    // Check length
    if (sanitized.length > this.config.maxStringLength) {
      violations.push({
        type: ViolationType.MALICIOUS_INPUT,
        severity: RiskLevel.MEDIUM,
        description: `String length exceeds limit: ${sanitized.length} > ${this.config.maxStringLength}`,
        action: 'String truncated',
        timestamp: new Date()
      });
      sanitized = sanitized.substring(0, this.config.maxStringLength);
    }

    // Strip HTML if enabled
    if (this.config.stripHtml) {
      const originalLength = sanitized.length;
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: this.config.allowedTags,
        ALLOWED_ATTR: Object.values(this.config.allowedAttributes).flat()
      });
      
      if (sanitized.length !== originalLength) {
        violations.push({
          type: ViolationType.XSS_ATTEMPT,
          severity: RiskLevel.HIGH,
          description: 'HTML tags detected and sanitized',
          action: 'HTML stripped',
          timestamp: new Date()
        });
      }
    }

    // Check for SQL injection patterns
    if (this.containsSQLInjectionPatterns(sanitized)) {
      violations.push({
        type: ViolationType.SQL_INJECTION_ATTEMPT,
        severity: RiskLevel.CRITICAL,
        description: 'Potential SQL injection pattern detected',
        action: 'Input sanitized',
        timestamp: new Date()
      });
      sanitized = this.sanitizeSQLPatterns(sanitized);
    }

    // Escape special characters if enabled
    if (this.config.escapeSpecialChars) {
      sanitized = validator.escape(sanitized);
    }

    // Check for script injection
    if (this.containsScriptInjection(sanitized)) {
      violations.push({
        type: ViolationType.XSS_ATTEMPT,
        severity: RiskLevel.CRITICAL,
        description: 'Script injection attempt detected',
        action: 'Script tags removed',
        timestamp: new Date()
      });
      sanitized = this.removeScriptTags(sanitized);
    }

    return sanitized;
  }

  /**
   * Sanitize array input
   */
  private sanitizeArray(input: any[], violations: SecurityViolation[]): any[] {
    return input.map(item => {
      const result = this.sanitize(item);
      violations.push(...result.violations);
      return result.sanitized;
    });
  }

  /**
   * Sanitize object input
   */
  private sanitizeObject(input: any, violations: SecurityViolation[]): any {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(input)) {
      // Sanitize key
      const keyResult = this.sanitize(key);
      violations.push(...keyResult.violations);
      
      // Sanitize value
      const valueResult = this.sanitize(value);
      violations.push(...valueResult.violations);

      sanitized[keyResult.sanitized] = valueResult.sanitized;
    }

    return sanitized;
  }

  /**
   * Check for SQL injection patterns
   */
  private containsSQLInjectionPatterns(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
      /(UNION.*SELECT)/i,
      /(OR.*1.*=.*1)/i,
      /(AND.*1.*=.*1)/i,
      /('.*OR.*'.*=.*')/i,
      /(;.*--)/i,
      /(\*.*\*)/i,
      /(\/\*.*\*\/)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Sanitize SQL patterns
   */
  private sanitizeSQLPatterns(input: string): string {
    return input
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi, '')
      .replace(/(UNION.*SELECT)/gi, '')
      .replace(/(OR.*1.*=.*1)/gi, '')
      .replace(/(AND.*1.*=.*1)/gi, '')
      .replace(/('.*OR.*'.*=.*')/gi, '')
      .replace(/(;.*--)/gi, '')
      .replace(/(\*.*\*)/gi, '')
      .replace(/(\/\*.*\*\/)/gi, '');
  }

  /**
   * Check for script injection
   */
  private containsScriptInjection(input: string): boolean {
    const scriptPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<link/gi,
      /<meta/gi
    ];

    return scriptPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Remove script tags
   */
  private removeScriptTags(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe/gi, '')
      .replace(/<object/gi, '')
      .replace(/<embed/gi, '')
      .replace(/<link/gi, '')
      .replace(/<meta/gi, '');
  }

  /**
   * Sanitize email
   */
  sanitizeEmail(email: string): SanitizationResult {
    const violations: SecurityViolation[] = [];
    let sanitized = email;
    const startTime = Date.now();

    if (this.config.normalizeEmail) {
      sanitized = validator.normalizeEmail(sanitized) || sanitized;
    }

    if (!validator.isEmail(sanitized)) {
      violations.push({
        type: ViolationType.MALICIOUS_INPUT,
        severity: RiskLevel.MEDIUM,
        description: 'Invalid email format',
        action: 'Email rejected',
        timestamp: new Date()
      });
    }

    return {
      original: email,
      sanitized,
      violations,
      isSafe: violations.length === 0,
      sanitizationTime: Date.now() - startTime,
      fieldsProcessed: 1,
      fieldsModified: violations.length > 0 ? 1 : 0,
      confidence: violations.length === 0 ? 1.0 : 0.5
    };
  }

  /**
   * Sanitize phone number
   */
  sanitizePhone(phone: string): SanitizationResult {
    const violations: SecurityViolation[] = [];
    let sanitized = phone.replace(/[^\d+\-\s()]/g, '');
    const startTime = Date.now();

    if (!validator.isMobilePhone(sanitized, 'id-ID')) {
      violations.push({
        type: ViolationType.MALICIOUS_INPUT,
        severity: RiskLevel.LOW,
        description: 'Invalid phone number format',
        action: 'Phone number sanitized',
        timestamp: new Date()
      });
    }

    return {
      original: phone,
      sanitized,
      violations,
      isSafe: violations.length === 0,
      sanitizationTime: Date.now() - startTime,
      fieldsProcessed: 1,
      fieldsModified: violations.length > 0 ? 1 : 0,
      confidence: violations.length === 0 ? 1.0 : 0.7
    };
  }

  /**
   * Sanitize URL
   */
  sanitizeURL(url: string): SanitizationResult {
    const violations: SecurityViolation[] = [];
    let sanitized = url;
    const startTime = Date.now();

    if (!validator.isURL(sanitized, { protocols: ['http', 'https'] })) {
      violations.push({
        type: ViolationType.MALICIOUS_INPUT,
        severity: RiskLevel.MEDIUM,
        description: 'Invalid URL format or protocol',
        action: 'URL rejected',
        timestamp: new Date()
      });
      sanitized = '';
    }

    return {
      original: url,
      sanitized,
      violations,
      isSafe: violations.length === 0,
      sanitizationTime: Date.now() - startTime,
      fieldsProcessed: 1,
      fieldsModified: violations.length > 0 ? 1 : 0,
      confidence: violations.length === 0 ? 1.0 : 0.3
    };
  }
}
