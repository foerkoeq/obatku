// ======================================
// SECURITY TESTING MODULE
// ======================================
// Automated security testing dan vulnerability scanning

import { SecurityTestConfig, SecurityViolation, ViolationType, RiskLevel } from '../types/security.types';

interface SecurityTestResult {
  testName: string;
  passed: boolean;
  vulnerabilities: SecurityViolation[];
  recommendations: string[];
  score: number;
  timestamp: Date;
}

interface PenetrationTestPayload {
  name: string;
  payload: string;
  expectedResponse?: string;
  shouldBeBlocked: boolean;
  severity: RiskLevel;
}

export class SecurityTester {
  private config: SecurityTestConfig;

  constructor(config: SecurityTestConfig, _baseUrl: string = 'http://localhost:3000') {
    this.config = config;
    // baseUrl parameter kept for future use but not stored as class property
  }

  /**
   * Run comprehensive security test suite
   */
  async runSecurityTestSuite(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    console.log('[SECURITY TEST] Starting comprehensive security test suite...');

    try {
      // 1. SQL Injection Tests
      results.push(await this.testSQLInjection());

      // 2. XSS Tests
      results.push(await this.testXSSPrevention());

      // 3. File Upload Tests
      results.push(await this.testFileUploadSecurity());

      // 4. Rate Limiting Tests
      results.push(await this.testRateLimiting());

      // 5. Input Sanitization Tests
      results.push(await this.testInputSanitization());

      // 6. Authentication Tests
      results.push(await this.testAuthenticationSecurity());

      // 7. Security Headers Tests
      results.push(await this.testSecurityHeaders());

      // 8. CSRF Tests
      results.push(await this.testCSRFProtection());

      // Generate report
      await this.generateSecurityReport(results);

      console.log('[SECURITY TEST] Security test suite completed');
      return results;

    } catch (error) {
      console.error('[SECURITY TEST] Test suite failed:', error);
      throw error;
    }
  }

  /**
   * Test SQL Injection vulnerabilities
   */
  private async testSQLInjection(): Promise<SecurityTestResult> {
    const testName = 'SQL Injection Prevention';
    const vulnerabilities: SecurityViolation[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const sqlPayloads: PenetrationTestPayload[] = [
      {
        name: 'Basic SQL Injection',
        payload: "'; DROP TABLE users; --",
        shouldBeBlocked: true,
        severity: RiskLevel.CRITICAL
      },
      {
        name: 'Union-based SQL Injection',
        payload: "' UNION SELECT password FROM users --",
        shouldBeBlocked: true,
        severity: RiskLevel.CRITICAL
      },
      {
        name: 'Boolean-based SQL Injection',
        payload: "' OR 1=1 --",
        shouldBeBlocked: true,
        severity: RiskLevel.HIGH
      },
      {
        name: 'Time-based SQL Injection',
        payload: "'; WAITFOR DELAY '00:00:05' --",
        shouldBeBlocked: true,
        severity: RiskLevel.HIGH
      },
      {
        name: 'Second-order SQL Injection',
        payload: "admin'/**/union/**/select/**/1,2,database()--",
        shouldBeBlocked: true,
        severity: RiskLevel.HIGH
      }
    ];

    for (const payload of sqlPayloads) {
      const testResult = await this.sendTestRequest('/api/test/sql', {
        username: payload.payload,
        password: 'test123'
      });

      if (!testResult.blocked && payload.shouldBeBlocked) {
        vulnerabilities.push({
          type: ViolationType.SQL_INJECTION_ATTEMPT,
          severity: payload.severity,
          description: `SQL injection payload not blocked: ${payload.name}`,
          action: 'Implement SQL injection prevention',
          timestamp: new Date()
        });
        score -= payload.severity === RiskLevel.CRITICAL ? 30 : 20;
      }
    }

    if (vulnerabilities.length > 0) {
      recommendations.push('Implement parameterized queries/prepared statements');
      recommendations.push('Add input validation and sanitization');
      recommendations.push('Use ORM with built-in SQL injection prevention');
      recommendations.push('Enable query logging and monitoring');
    }

    return {
      testName,
      passed: vulnerabilities.length === 0,
      vulnerabilities,
      recommendations,
      score: Math.max(0, score),
      timestamp: new Date()
    };
  }

  /**
   * Test XSS Prevention
   */
  private async testXSSPrevention(): Promise<SecurityTestResult> {
    const testName = 'XSS Prevention';
    const vulnerabilities: SecurityViolation[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const xssPayloads: PenetrationTestPayload[] = [
      {
        name: 'Basic Script Injection',
        payload: '<script>alert("XSS")</script>',
        shouldBeBlocked: true,
        severity: RiskLevel.HIGH
      },
      {
        name: 'Event Handler Injection',
        payload: '<img src=x onerror=alert("XSS")>',
        shouldBeBlocked: true,
        severity: RiskLevel.HIGH
      },
      {
        name: 'JavaScript URL',
        payload: 'javascript:alert("XSS")',
        shouldBeBlocked: true,
        severity: RiskLevel.MEDIUM
      },
      {
        name: 'SVG XSS',
        payload: '<svg onload=alert("XSS")>',
        shouldBeBlocked: true,
        severity: RiskLevel.MEDIUM
      },
      {
        name: 'Data URI XSS',
        payload: 'data:text/html,<script>alert("XSS")</script>',
        shouldBeBlocked: true,
        severity: RiskLevel.MEDIUM
      }
    ];

    for (const payload of xssPayloads) {
      const testResult = await this.sendTestRequest('/api/test/xss', {
        comment: payload.payload,
        name: 'TestUser'
      });

      if (!testResult.blocked && payload.shouldBeBlocked) {
        vulnerabilities.push({
          type: ViolationType.XSS_ATTEMPT,
          severity: payload.severity,
          description: `XSS payload not blocked: ${payload.name}`,
          action: 'Implement XSS prevention',
          timestamp: new Date()
        });
        score -= 20;
      }
    }

    if (vulnerabilities.length > 0) {
      recommendations.push('Implement proper input sanitization');
      recommendations.push('Use Content Security Policy (CSP)');
      recommendations.push('Encode output data properly');
      recommendations.push('Validate and sanitize all user inputs');
    }

    return {
      testName,
      passed: vulnerabilities.length === 0,
      vulnerabilities,
      recommendations,
      score: Math.max(0, score),
      timestamp: new Date()
    };
  }

  /**
   * Test File Upload Security
   */
  private async testFileUploadSecurity(): Promise<SecurityTestResult> {
    const testName = 'File Upload Security';
    const vulnerabilities: SecurityViolation[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test executable file upload
    const maliciousFiles = [
      { name: 'malware.exe', content: 'MZ...', type: 'application/octet-stream' },
      { name: 'script.php', content: '<?php phpinfo(); ?>', type: 'application/x-php' },
      { name: 'shell.jsp', content: '<%@ page import="java.io.*" %>', type: 'application/x-jsp' },
      { name: 'backdoor.asp', content: '<%eval request("cmd")%>', type: 'application/x-asp' },
      { name: 'huge_file.txt', content: 'A'.repeat(50 * 1024 * 1024), type: 'text/plain' }, // 50MB
    ];

    for (const file of maliciousFiles) {
      const uploadResult = await this.testFileUpload(file.name, file.content, file.type);
      
      if (uploadResult.success) {
        vulnerabilities.push({
          type: ViolationType.SUSPICIOUS_FILE,
          severity: RiskLevel.HIGH,
          description: `Malicious file upload allowed: ${file.name}`,
          action: 'Implement file validation',
          timestamp: new Date()
        });
        score -= 25;
      }
    }

    if (vulnerabilities.length > 0) {
      recommendations.push('Implement file type validation');
      recommendations.push('Check file signatures/magic bytes');
      recommendations.push('Set file size limits');
      recommendations.push('Scan uploads for malware');
      recommendations.push('Store uploads outside web root');
    }

    return {
      testName,
      passed: vulnerabilities.length === 0,
      vulnerabilities,
      recommendations,
      score: Math.max(0, score),
      timestamp: new Date()
    };
  }

  /**
   * Test Rate Limiting
   */
  private async testRateLimiting(): Promise<SecurityTestResult> {
    const testName = 'Rate Limiting';
    const vulnerabilities: SecurityViolation[] = [];
    const recommendations: string[] = [];
    let score = 100;

    try {
      // Test burst requests
      const requests = Array.from({ length: 200 }, (_, i) => 
        this.sendTestRequest('/api/test/rate-limit', { test: `request_${i}` })
      );

      const results = await Promise.all(requests);
      const allowedCount = results.filter(r => !r.blocked).length;

      if (allowedCount > 150) { // Expect most requests to be blocked
        vulnerabilities.push({
          type: ViolationType.RATE_LIMIT_EXCEEDED,
          severity: RiskLevel.MEDIUM,
          description: `Rate limiting ineffective: ${allowedCount}/200 requests allowed`,
          action: 'Implement stricter rate limiting',
          timestamp: new Date()
        });
        score -= 30;
      }

      // Test authentication rate limiting
      const authRequests = Array.from({ length: 20 }, (_, i) =>
        this.sendTestRequest('/api/auth/login', { 
          email: 'test@test.com', 
          password: `wrong_password_${i}` 
        })
      );

      const authResults = await Promise.all(authRequests);
      const authBlockedCount = authResults.filter(r => r.blocked).length;

      if (authBlockedCount < 15) { // Expect strict auth rate limiting
        vulnerabilities.push({
          type: ViolationType.BRUTE_FORCE_ATTEMPT,
          severity: RiskLevel.HIGH,
          description: `Authentication rate limiting ineffective: ${20 - authBlockedCount}/20 attempts allowed`,
          action: 'Implement stricter authentication rate limiting',
          timestamp: new Date()
        });
        score -= 40;
      }

    } catch (error) {
      console.error('Rate limiting test failed:', error);
      score -= 50;
    }

    if (vulnerabilities.length > 0) {
      recommendations.push('Implement progressive rate limiting');
      recommendations.push('Use different limits for different endpoints');
      recommendations.push('Implement stricter limits for authentication');
      recommendations.push('Consider using Redis for distributed rate limiting');
    }

    return {
      testName,
      passed: vulnerabilities.length === 0,
      vulnerabilities,
      recommendations,
      score: Math.max(0, score),
      timestamp: new Date()
    };
  }

  /**
   * Test Input Sanitization
   */
  private async testInputSanitization(): Promise<SecurityTestResult> {
    const testName = 'Input Sanitization';
    const vulnerabilities: SecurityViolation[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const maliciousInputs = [
      { field: 'name', value: '<script>alert("XSS")</script>', type: 'XSS' },
      { field: 'email', value: 'test@test.com<script>alert("XSS")</script>', type: 'XSS' },
      { field: 'phone', value: '+1234567890<script>alert("XSS")</script>', type: 'XSS' },
      { field: 'comment', value: 'javascript:alert("XSS")', type: 'XSS' },
      { field: 'username', value: '../../../etc/passwd', type: 'Path Traversal' },
      { field: 'filename', value: '../../../../windows/system32/config/sam', type: 'Path Traversal' },
    ];

    for (const input of maliciousInputs) {
      const testData = { [input.field]: input.value };
      const result = await this.sendTestRequest('/api/test/sanitization', testData);

      // Check if malicious content is still present in response
      if (result.responseBody && result.responseBody.includes(input.value)) {
        vulnerabilities.push({
          type: ViolationType.MALICIOUS_INPUT,
          severity: RiskLevel.MEDIUM,
          description: `Input not sanitized: ${input.type} in ${input.field}`,
          action: 'Implement input sanitization',
          timestamp: new Date()
        });
        score -= 15;
      }
    }

    if (vulnerabilities.length > 0) {
      recommendations.push('Implement comprehensive input sanitization');
      recommendations.push('Validate all inputs on server side');
      recommendations.push('Use whitelist approach for validation');
      recommendations.push('Encode special characters properly');
    }

    return {
      testName,
      passed: vulnerabilities.length === 0,
      vulnerabilities,
      recommendations,
      score: Math.max(0, score),
      timestamp: new Date()
    };
  }

  /**
   * Test Authentication Security
   */
  private async testAuthenticationSecurity(): Promise<SecurityTestResult> {
    const testName = 'Authentication Security';
    const vulnerabilities: SecurityViolation[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test weak passwords
    const weakPasswords = ['123456', 'password', 'admin', 'test', '123'];
    for (const password of weakPasswords) {
      const result = await this.sendTestRequest('/api/auth/register', {
        email: 'test@test.com',
        password: password,
        name: 'Test User'
      });

      if (!result.blocked && result.statusCode < 400) {
        vulnerabilities.push({
          type: ViolationType.UNAUTHORIZED_ACCESS,
          severity: RiskLevel.MEDIUM,
          description: `Weak password accepted: ${password}`,
          action: 'Implement password strength requirements',
          timestamp: new Date()
        });
        score -= 10;
      }
    }

    // Test session security
    const loginResult = await this.sendTestRequest('/api/auth/login', {
      email: 'valid@test.com',
      password: 'ValidPassword123!'
    });

    if (loginResult.headers && !loginResult.headers['set-cookie']?.some((cookie: string) => 
      cookie.includes('httpOnly') && cookie.includes('secure')
    )) {
      vulnerabilities.push({
        type: ViolationType.UNAUTHORIZED_ACCESS,
        severity: RiskLevel.MEDIUM,
        description: 'Session cookies not properly secured',
        action: 'Set httpOnly and secure flags on cookies',
        timestamp: new Date()
      });
      score -= 20;
    }

    if (vulnerabilities.length > 0) {
      recommendations.push('Implement strong password requirements');
      recommendations.push('Use secure session management');
      recommendations.push('Implement account lockout mechanisms');
      recommendations.push('Use secure cookie settings');
    }

    return {
      testName,
      passed: vulnerabilities.length === 0,
      vulnerabilities,
      recommendations,
      score: Math.max(0, score),
      timestamp: new Date()
    };
  }

  /**
   * Test Security Headers
   */
  private async testSecurityHeaders(): Promise<SecurityTestResult> {
    const testName = 'Security Headers';
    const vulnerabilities: SecurityViolation[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const result = await this.sendTestRequest('/api/test/headers', {});

    const requiredHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'strict-transport-security',
      'content-security-policy',
      'x-xss-protection'
    ];

    for (const header of requiredHeaders) {
      if (!result.headers || !result.headers[header]) {
        vulnerabilities.push({
          type: ViolationType.MALICIOUS_INPUT,
          severity: RiskLevel.LOW,
          description: `Missing security header: ${header}`,
          action: 'Add security headers',
          timestamp: new Date()
        });
        score -= 10;
      }
    }

    if (vulnerabilities.length > 0) {
      recommendations.push('Implement all recommended security headers');
      recommendations.push('Configure Content Security Policy');
      recommendations.push('Enable HSTS for HTTPS');
      recommendations.push('Set proper frame options');
    }

    return {
      testName,
      passed: vulnerabilities.length === 0,
      vulnerabilities,
      recommendations,
      score: Math.max(0, score),
      timestamp: new Date()
    };
  }

  /**
   * Test CSRF Protection
   */
  private async testCSRFProtection(): Promise<SecurityTestResult> {
    const testName = 'CSRF Protection';
    const vulnerabilities: SecurityViolation[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Test state-changing operations without CSRF token
    const csrfTests = [
      { endpoint: '/api/users/update', method: 'PUT', data: { name: 'Hacked' } },
      { endpoint: '/api/settings/update', method: 'POST', data: { theme: 'dark' } },
      { endpoint: '/api/admin/users/delete', method: 'DELETE', data: { userId: '123' } }
    ];

    for (const test of csrfTests) {
      const result = await this.sendTestRequest(test.endpoint, test.data, test.method);
      
      if (!result.blocked && result.statusCode < 400) {
        vulnerabilities.push({
          type: ViolationType.UNAUTHORIZED_ACCESS,
          severity: RiskLevel.MEDIUM,
          description: `CSRF vulnerability: ${test.endpoint} allows requests without CSRF token`,
          action: 'Implement CSRF protection',
          timestamp: new Date()
        });
        score -= 20;
      }
    }

    if (vulnerabilities.length > 0) {
      recommendations.push('Implement CSRF tokens for state-changing operations');
      recommendations.push('Validate CSRF tokens on server side');
      recommendations.push('Use SameSite cookie attribute');
      recommendations.push('Consider double-submit cookie pattern');
    }

    return {
      testName,
      passed: vulnerabilities.length === 0,
      vulnerabilities,
      recommendations,
      score: Math.max(0, score),
      timestamp: new Date()
    };
  }

  /**
   * Send test request to API
   */
  private async sendTestRequest(
    _endpoint: string, 
    _data: any, 
    _method: string = 'POST'
  ): Promise<{
    blocked: boolean;
    statusCode: number;
    responseBody?: any;
    headers?: any;
    success: boolean;
  }> {
    try {
      // This is a mock implementation
      // In real scenario, you would use axios or fetch to make actual HTTP requests
      
      return {
        blocked: Math.random() > 0.3, // Mock: 70% chance of being blocked
        statusCode: 200,
        responseBody: { message: 'Test response' },
        headers: {
          'x-frame-options': 'DENY',
          'x-content-type-options': 'nosniff'
        },
        success: true
      };
    } catch (error) {
      return {
        blocked: true,
        statusCode: 500,
        success: false
      };
    }
  }

  /**
   * Test file upload
   */
  private async testFileUpload(filename: string, content: string, _mimeType: string): Promise<{
    success: boolean;
    blocked: boolean;
  }> {
    try {
      // Mock file upload test
      const dangerousExtensions = ['.exe', '.php', '.jsp', '.asp'];
      const isDangerous = dangerousExtensions.some(ext => filename.toLowerCase().endsWith(ext));
      const isOversized = content.length > 10 * 1024 * 1024; // 10MB
      
      return {
        success: !isDangerous && !isOversized,
        blocked: isDangerous || isOversized
      };
    } catch (error) {
      return {
        success: false,
        blocked: true
      };
    }
  }

  /**
   * Generate comprehensive security report
   */
  private async generateSecurityReport(results: SecurityTestResult[]): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      totalVulnerabilities: results.reduce((sum, r) => sum + r.vulnerabilities.length, 0),
      criticalVulnerabilities: results.reduce((sum, r) => 
        sum + r.vulnerabilities.filter(v => v.severity === RiskLevel.CRITICAL).length, 0
      ),
      highVulnerabilities: results.reduce((sum, r) => 
        sum + r.vulnerabilities.filter(v => v.severity === RiskLevel.HIGH).length, 0
      ),
      results: results.map(r => ({
        testName: r.testName,
        passed: r.passed,
        score: r.score,
        vulnerabilityCount: r.vulnerabilities.length,
        recommendations: r.recommendations
      })),
      recommendations: this.generateOverallRecommendations(results)
    };

    console.log('\n=== SECURITY TEST REPORT ===');
    console.log(`Overall Score: ${report.overallScore}/100`);
    console.log(`Tests Passed: ${report.passedTests}/${report.totalTests}`);
    console.log(`Total Vulnerabilities: ${report.totalVulnerabilities}`);
    console.log(`Critical: ${report.criticalVulnerabilities}, High: ${report.highVulnerabilities}`);
    
    if (this.config.reportPath) {
      try {
        const fs = require('fs').promises;
        await fs.writeFile(
          `${this.config.reportPath}/security-report-${Date.now()}.json`,
          JSON.stringify(report, null, 2)
        );
        console.log(`Report saved to: ${this.config.reportPath}`);
      } catch (error) {
        console.error('Failed to save report:', error);
      }
    }
  }

  /**
   * Generate overall recommendations
   */
  private generateOverallRecommendations(results: SecurityTestResult[]): string[] {
    const allRecommendations = results.flatMap(r => r.recommendations);
    const uniqueRecommendations = [...new Set(allRecommendations)];
    
    const prioritizedRecommendations = [
      'Implement comprehensive input sanitization',
      'Add SQL injection prevention',
      'Configure security headers properly',
      'Implement proper rate limiting',
      'Secure file upload validation',
      'Use strong authentication mechanisms',
      'Implement CSRF protection',
      'Regular security testing and monitoring'
    ].filter(rec => uniqueRecommendations.some(ur => ur.includes(rec.split(' ')[1])));

    return prioritizedRecommendations.concat(
      uniqueRecommendations.filter(ur => 
        !prioritizedRecommendations.some(pr => ur.includes(pr.split(' ')[1]))
      )
    );
  }
}
