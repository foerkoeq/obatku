/**
 * Validation Utilities Test Suite
 * Tests for input validation, sanitization, and data verification
 */

import { describe, it, expect } from '@jest/globals';
import {
  validateEmail,
  validatePasswordStrength,
  validateApiKeyFormat
} from './validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'a@b.c'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'test@example.com.',
        '.test@example.com',
        'test..test@example.com',
        'user..name@example.com', // Double dots
        'user@example..com',      // Double dots in domain
        'user name@example.com',  // Space in local part
        'user@example com',       // Space in domain
        'test@',                  // Missing domain
        '@example.com',           // Missing local part
        'test@.com',              // Domain starts with dot
        'test@example.',          // Domain ends with dot
        'test..@example.com',     // Local part ends with dots
        '..test@example.com',     // Local part starts with dots
        'test@example..com',      // Domain has consecutive dots
        'test@@example.com',      // Multiple @ symbols
        'test@example@com',       // Multiple @ symbols
        'test@example..com',      // Domain has consecutive dots
        'test@example.com..',     // Domain ends with dots
        '..test@example.com',     // Local part starts with dots
        'test..@example.com'      // Local part ends with dots
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MySecurePass1@',
        'Str0ng#P@ss',
        'Complex123$Pass'
      ];

      strongPasswords.forEach(password => {
        const result = validatePasswordStrength(password);
        expect(result.isValid).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(70);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'password', // No uppercase, no number, no special char
        'PASSWORD', // No lowercase, no number, no special char
        '12345678', // No letters, no special char
        'Pass',     // Too short
        'Pass1',    // Too short
        'Pass@',    // Too short
        'Pass1@',   // Too short
        'weakpass', // No uppercase, no number, no special char
        'WEAKPASS', // No lowercase, no number, no special char
        'weak123',  // Too short, no uppercase, no special char
        'abc',      // Too short
        '123',      // Too short
        'a',        // Too short
        'test',     // Too short
        'simple',   // Too short
        'basic',    // Too short
        'easy',     // Too short
        'simple123', // Too short, no uppercase, no special char
        'basic456',  // Too short, no uppercase, no special char
        'easy789',   // Too short, no uppercase, no special char
        'test123',   // Too short, no uppercase, no special char
        'demo',      // Too short
        'demo123',   // Too short, no uppercase, no special char
        'sample',    // Too short
        'sample123', // Too short, no uppercase, no special char
        'example',   // Too short
        'example123' // Too short, no uppercase, no special char
      ];

      weakPasswords.forEach(password => {
        const result = validatePasswordStrength(password);
        // All these should score below 70 or be 0 (capped)
        expect(result.score).toBeLessThanOrEqual(70);
        expect(result.isValid).toBe(false);
      });
    });

    it('should provide detailed feedback', () => {
      const weakPassword = 'weak';
      const result = validatePasswordStrength(weakPassword);
      
      expect(result.feedback).toContain('Password must be at least 8 characters long');
      expect(result.feedback.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(70);
    });

    it('should handle edge cases', () => {
      const nullResult = validatePasswordStrength(null as any);
      expect(nullResult.isValid).toBe(false);
      expect(nullResult.score).toBe(0);
      expect(nullResult.feedback).toContain('Password is required');

      const undefinedResult = validatePasswordStrength(undefined as any);
      expect(undefinedResult.isValid).toBe(false);
      expect(undefinedResult.score).toBe(0);
      expect(undefinedResult.feedback).toContain('Password is required');

      const emptyResult = validatePasswordStrength('');
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.score).toBe(0);
      expect(emptyResult.feedback).toContain('Password is required');
    });
  });

  describe('validateApiKeyFormat', () => {
    it('should validate correct API key formats', () => {
      const validApiKeys = [
        'sk_test_1234567890abcdef12345678',
        'sk_live_abcdef1234567890abcdef12',
        'pk_test_9876543210fedcba98765432',
        'pk_live_fedcba0987654321fedcba09'
      ];

      validApiKeys.forEach(apiKey => {
        expect(validateApiKeyFormat(apiKey)).toBe(true);
      });
    });

    it('should reject invalid API key formats', () => {
      const invalidApiKeys = [
        'invalid-key',
        'sk_test_',
        'sk_live',
        'pk_test_',
        'pk_live',
        'test_123',
        'live_abc',
        'sk_test_123', // Too short
        'pk_live_abc', // Too short
        ''
      ];

      invalidApiKeys.forEach(apiKey => {
        expect(validateApiKeyFormat(apiKey)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validateApiKeyFormat('')).toBe(false);
      expect(validateApiKeyFormat(null as any)).toBe(false);
      expect(validateApiKeyFormat(undefined as any)).toBe(false);
    });
  });

  describe('Validation Integration', () => {
    it('should validate complete user registration data', () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      expect(validateEmail(userData.email)).toBe(true);
      expect(validatePasswordStrength(userData.password).isValid).toBe(true);
    });

    it('should handle validation errors consistently', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak'
      };

      expect(validateEmail(invalidData.email)).toBe(false);
      expect(validatePasswordStrength(invalidData.password).isValid).toBe(false);
    });
  });
});
