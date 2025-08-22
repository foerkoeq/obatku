// ======================================
// SECURITY UTILITIES
// ======================================
// Helper functions untuk security operations

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { RiskLevel, SecurityViolation } from '../types/security.types';

/**
 * Generate cryptographically secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Hash password securely
 */
export async function hashPassword(password: string, saltRounds: number = 12): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate secure JWT token
 */
export function generateJWTToken(payload: any, secret: string, expiresIn: string = '24h'): string {
  const options: SignOptions = { 
    expiresIn: expiresIn as any,
    algorithm: 'HS256',
    issuer: 'obatku-api',
    audience: 'obatku-client'
  };
  return jwt.sign(payload, secret, options);
}

/**
 * Verify JWT token
 */
export function verifyJWTToken(token: string, secret: string): any {
  return jwt.verify(token, secret, {
    algorithms: ['HS256'],
    issuer: 'obatku-api',
    audience: 'obatku-client'
  });
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  // Simple validation - in production, use more sophisticated method
  return token === sessionToken && token.length >= 32;
}

/**
 * Encrypt sensitive data
 */
export function encryptData(data: string, key: string): { encrypted: string; iv: string } {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex')
  };
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string, key: string, _iv: string): string {
  const algorithm = 'aes-256-gcm';
  const decipher = crypto.createDecipher(algorithm, key);
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate secure filename
 */
export function generateSecureFilename(originalName: string): string {
  const extension = originalName.split('.').pop() || '';
  const timestamp = Date.now();
  const random = generateSecureRandom(8);
  return `${timestamp}_${random}.${extension}`;
}

/**
 * Validate email format securely
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  // Trim whitespace
  const trimmedEmail = email.trim();
  if (trimmedEmail === '') return false;
  
  // Check for spaces in local part or domain
  if (trimmedEmail.includes(' ')) return false;
  
  // Check for double dots
  if (trimmedEmail.includes('..')) return false;
  
  // Check for dots at start or end
  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) return false;
  
  // Check for dots adjacent to @
  if (trimmedEmail.includes('.@') || trimmedEmail.includes('@.')) return false;
  
  // Check length
  if (trimmedEmail.length > 254) return false;
  
  // Basic format check with stricter regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(trimmedEmail);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string | null | undefined): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Handle null/undefined cases
  if (!password || typeof password !== 'string') {
    feedback.push('Password is required');
    return {
      isValid: false,
      score: 0,
      feedback
    };
  }

  // Length check - Base requirement
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
    // Don't add any points if too short
    return {
      isValid: false,
      score: 0,
      feedback
    };
  }
  
  // Add base length points
  score += 20;
  
  if (password.length >= 12) score += 10;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 15;
  else feedback.push('Include numbers');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
  else feedback.push('Include special characters');

  // Pattern checks
  if (!/(.)\1{2,}/.test(password)) score += 10;
  else feedback.push('Avoid repeating characters');

  // Common password check
  const commonPasswords = ['password', '123456', 'admin', 'qwerty', 'letmein'];
  if (!commonPasswords.includes(password.toLowerCase())) score += 10;
  else feedback.push('Avoid common passwords');

  return {
    isValid: score >= 70,
    score,
    feedback
  };
}

/**
 * Rate limit key generator
 */
export function generateRateLimitKey(ip: string, endpoint: string, userId?: string): string {
  if (userId) {
    return `rate_limit:${endpoint}:user:${userId}`;
  }
  return `rate_limit:${endpoint}:ip:${ip}`;
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  details: any,
  severity: RiskLevel = RiskLevel.LOW
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details: {
      ...details,
      // Remove sensitive data
      password: details.password ? '[REDACTED]' : undefined,
      token: details.token ? '[REDACTED]' : undefined,
    }
  };

  console.log(`[SECURITY EVENT] ${severity.toUpperCase()}: ${event}`, logEntry);

  // In production, send to logging service
  if (severity === RiskLevel.CRITICAL || severity === RiskLevel.HIGH) {
    console.error('[SECURITY ALERT]', logEntry);
    // Send alert notification
  }
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

/**
 * Generate secure session ID
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Time-safe string comparison (prevents timing attacks)
 */
export function timeSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generate API key
 */
export function generateApiKey(prefix: string = 'sk'): string {
  const randomPart = crypto.randomBytes(32).toString('base64url');
  return `${prefix}_${randomPart}`;
}

/**
 * Validate API key format
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') return false;
  
  // Check for Stripe-like API key format: sk_test_... or pk_test_... etc.
  const apiKeyRegex = /^(sk|pk)_(test|live)_[a-zA-Z0-9]{24}$/;
  return apiKeyRegex.test(apiKey);
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour

  return { token, hashedToken, expiresAt };
}

/**
 * Verify password reset token
 */
export function verifyPasswordResetToken(token: string, hashedToken: string): boolean {
  const computedHash = crypto.createHash('sha256').update(token).digest('hex');
  return timeSafeCompare(computedHash, hashedToken);
}

/**
 * Generate OTP
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(5).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}`);
  }
  
  return codes;
}

/**
 * IP address utilities
 */
export const IPUtils = {
  /**
   * Check if IP is private/internal
   */
  isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00::/,
      /^fe80::/
    ];
    
    return privateRanges.some(range => range.test(ip));
  },

  /**
   * Normalize IP address
   */
  normalizeIP(ip: string): string {
    // Remove IPv4-mapped IPv6 prefix
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    return ip;
  },

  /**
   * Get IP reputation (mock implementation)
   */
  async getIPReputation(_ip: string): Promise<{
    reputation: 'good' | 'suspicious' | 'malicious';
    score: number;
    reasons: string[];
  }> {
    // In production, integrate with threat intelligence APIs
    return {
      reputation: 'good',
      score: 95,
      reasons: []
    };
  }
};

/**
 * Security metrics calculator
 */
export const SecurityMetricsCalculator = {
  /**
   * Calculate security score based on violations
   */
  calculateSecurityScore(violations: SecurityViolation[]): number {
    if (violations.length === 0) return 100;

    let deductions = 0;
    violations.forEach(violation => {
      switch (violation.severity) {
        case RiskLevel.CRITICAL:
          deductions += 30;
          break;
        case RiskLevel.HIGH:
          deductions += 20;
          break;
        case RiskLevel.MEDIUM:
          deductions += 10;
          break;
        case RiskLevel.LOW:
          deductions += 5;
          break;
      }
    });

    return Math.max(0, 100 - deductions);
  },

  /**
   * Calculate risk level based on violations
   */
  calculateRiskLevel(violations: SecurityViolation[]): RiskLevel {
    if (violations.some(v => v.severity === RiskLevel.CRITICAL)) {
      return RiskLevel.CRITICAL;
    }
    if (violations.some(v => v.severity === RiskLevel.HIGH)) {
      return RiskLevel.HIGH;
    }
    if (violations.some(v => v.severity === RiskLevel.MEDIUM)) {
      return RiskLevel.MEDIUM;
    }
    return violations.length > 0 ? RiskLevel.LOW : RiskLevel.LOW;
  }
};

/**
 * Anonymize sensitive data for logging
 */
export function anonymizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'credential',
    'auth', 'session', 'cookie', 'authorization'
  ];

  const anonymized = { ...data };

  Object.keys(anonymized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      anonymized[key] = '[REDACTED]';
    } else if (typeof anonymized[key] === 'object') {
      anonymized[key] = anonymizeForLogging(anonymized[key]);
    }
  });

  return anonymized;
}
