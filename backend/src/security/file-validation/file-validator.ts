// ======================================
// FILE VALIDATION MODULE
// ======================================
// Comprehensive file upload security validation

import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import { FileUploadConfig, FileValidationResult, SecurityViolation, ViolationType, RiskLevel } from '../types/security.types';

const execAsync = promisify(exec);

export class FileValidator {
  private config: FileUploadConfig;
  private maliciousSignatures: Map<string, string[]> = new Map();

  constructor(config: FileUploadConfig) {
    this.config = config;
    this.initializeMaliciousSignatures();
  }

  /**
   * Initialize known malicious file signatures
   */
  private initializeMaliciousSignatures(): void {
    this.maliciousSignatures = new Map([
      // Executable files
      ['exe', ['4D5A', 'MZ']],
      ['dll', ['4D5A', 'MZ']],
      ['scr', ['4D5A', 'MZ']],
      ['bat', ['echo', 'ECHO', '@echo', '@ECHO']],
      ['cmd', ['echo', 'ECHO', '@echo', '@ECHO']],
      ['ps1', ['Invoke-', 'powershell', 'cmd.exe']],
      
      // Script files
      ['js', ['eval(', 'document.write', 'window.location', 'document.cookie']],
      ['php', ['<?php', '<?=', 'eval(', 'exec(', 'shell_exec(', 'system(']],
      ['asp', ['<%', 'Server.CreateObject', 'eval(']],
      ['jsp', ['<%', 'Runtime.getRuntime()', 'ProcessBuilder']],
      
      // Archive with executables
      ['zip', ['PK\x03\x04']],
      ['rar', ['Rar!']],
      ['7z', ['7z\xBC\xAF\x27\x1C']],
    ]);
  }

  /**
   * Validate uploaded file
   */
  async validateFile(filePath: string, originalName: string, mimeType: string): Promise<FileValidationResult> {
    const startTime = Date.now();
    const violations: SecurityViolation[] = [];
    let isValid = true;
    let quarantined = false;

    try {
      // Basic file info
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;
      const extension = path.extname(originalName).toLowerCase();

      // 1. Check file size
      if (fileSize > this.config.maxFileSize) {
        violations.push({
          type: ViolationType.SUSPICIOUS_FILE,
          severity: RiskLevel.MEDIUM,
          description: `File size ${fileSize} exceeds limit ${this.config.maxFileSize}`,
          action: 'File rejected',
          timestamp: new Date()
        });
        isValid = false;
      }

      // 2. Check file extension
      if (!this.config.allowedExtensions.includes(extension)) {
        violations.push({
          type: ViolationType.SUSPICIOUS_FILE,
          severity: RiskLevel.HIGH,
          description: `File extension ${extension} not allowed`,
          action: 'File rejected',
          timestamp: new Date()
        });
        isValid = false;
      }

      // 3. Check MIME type
      if (!this.config.allowedMimeTypes.includes(mimeType)) {
        violations.push({
          type: ViolationType.SUSPICIOUS_FILE,
          severity: RiskLevel.HIGH,
          description: `MIME type ${mimeType} not allowed`,
          action: 'File rejected',
          timestamp: new Date()
        });
        isValid = false;
      }

      // 4. Check file signature (magic bytes)
      const signatureValid = await this.validateFileSignature(filePath, extension);
      if (!signatureValid) {
        violations.push({
          type: ViolationType.SUSPICIOUS_FILE,
          severity: RiskLevel.HIGH,
          description: 'File signature does not match extension/MIME type',
          action: 'File rejected',
          timestamp: new Date()
        });
        isValid = false;
      }

      // 5. Check for malicious content
      const maliciousContent = await this.scanForMaliciousContent(filePath, extension);
      if (maliciousContent.length > 0) {
        violations.push(...maliciousContent);
        isValid = false;
        quarantined = true;
      }

      // 6. Scan for malware (if enabled)
      if (this.config.scanForMalware && isValid) {
        const malwareScanResult = await this.scanForMalware(filePath);
        if (!malwareScanResult.clean) {
          violations.push({
            type: ViolationType.SUSPICIOUS_FILE,
            severity: RiskLevel.CRITICAL,
            description: `Malware detected: ${malwareScanResult.threat}`,
            action: 'File quarantined',
            timestamp: new Date()
          });
          isValid = false;
          quarantined = true;
        }
      }

      // 7. Check filename for suspicious patterns
      const filenameViolations = this.validateFilename(originalName);
      violations.push(...filenameViolations);
      if (filenameViolations.length > 0) {
        isValid = false;
      }

      // Quarantine file if necessary
      if (quarantined) {
        await this.quarantineFile(filePath, originalName);
      }

      // Generate file hash and get magic bytes
      const checksum = await this.generateFileHash(filePath);
      const magicBytes = await this.getMagicBytes(filePath);
      const fileSignature = await this.getFileSignature(filePath);

      return {
        isValid,
        fileName: originalName,
        fileSize,
        mimeType,
        extension,
        violations,
        quarantined,
        magicBytes,
        fileSignature,
        processingTime: Date.now() - startTime,
        checksum
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      violations.push({
        type: ViolationType.SUSPICIOUS_FILE,
        severity: RiskLevel.HIGH,
        description: `File validation error: ${errorMessage}`,
        action: 'File rejected',
        timestamp: new Date()
      });

      return {
        isValid: false,
        fileName: originalName,
        fileSize: 0,
        mimeType,
        extension: path.extname(originalName).toLowerCase(),
        violations,
        quarantined: false,
        magicBytes: '',
        fileSignature: '',
        processingTime: Date.now() - startTime,
        checksum: ''
      };
    }
  }

  /**
   * Validate file signature (magic bytes)
   */
  private async validateFileSignature(filePath: string, extension: string): Promise<boolean> {
    try {
      const buffer = await fs.readFile(filePath);
      const signature = buffer.toString('hex', 0, 8).toUpperCase();

      // Common file signatures
      const signatures: Record<string, string[]> = {
        '.jpg': ['FFD8FF'],
        '.jpeg': ['FFD8FF'],
        '.png': ['89504E47'],
        '.gif': ['47494638'],
        '.webp': ['52494646'],
        '.pdf': ['25504446'],
        '.doc': ['D0CF11E0'],
        '.docx': ['504B0304'],
        '.xls': ['D0CF11E0'],
        '.xlsx': ['504B0304'],
        '.zip': ['504B0304'],
        '.rar': ['526172211A0700'],
      };

      const expectedSignatures = signatures[extension];
      if (!expectedSignatures) {
        return true; // Unknown extension, skip signature check
      }

      return expectedSignatures.some(expected => signature.startsWith(expected));
    } catch (error) {
      return false;
    }
  }

  /**
   * Get magic bytes from file
   */
  private async getMagicBytes(filePath: string): Promise<string> {
    try {
      const buffer = await fs.readFile(filePath);
      return buffer.toString('hex', 0, 8).toUpperCase();
    } catch (error) {
      return '';
    }
  }

  /**
   * Get file signature (first 16 bytes)
   */
  private async getFileSignature(filePath: string): Promise<string> {
    try {
      const buffer = await fs.readFile(filePath);
      return buffer.toString('hex', 0, 16).toUpperCase();
    } catch (error) {
      return '';
    }
  }

  /**
   * Scan file for malicious content
   */
  private async scanForMaliciousContent(filePath: string, extension: string): Promise<SecurityViolation[]> {
    const violations: SecurityViolation[] = [];

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const suspiciousPatterns = this.maliciousSignatures.get(extension.substring(1));

      if (suspiciousPatterns) {
        for (const pattern of suspiciousPatterns) {
          if (content.includes(pattern)) {
            violations.push({
              type: ViolationType.SUSPICIOUS_FILE,
              severity: RiskLevel.CRITICAL,
              description: `Malicious pattern detected: ${pattern}`,
              action: 'File quarantined',
              timestamp: new Date()
            });
          }
        }
      }

      // Check for embedded scripts in images
      if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
        const scriptPatterns = ['<script', 'javascript:', 'vbscript:', 'onload=', 'onerror='];
        for (const pattern of scriptPatterns) {
          if (content.toLowerCase().includes(pattern)) {
            violations.push({
              type: ViolationType.SUSPICIOUS_FILE,
              severity: RiskLevel.HIGH,
              description: `Script injection in image file: ${pattern}`,
              action: 'File quarantined',
              timestamp: new Date()
            });
          }
        }
      }

      // Check for SQL injection in text files
      if (['.txt', '.csv'].includes(extension)) {
        const sqlPatterns = ['DROP TABLE', 'DELETE FROM', 'INSERT INTO', 'UPDATE SET', 'UNION SELECT'];
        for (const pattern of sqlPatterns) {
          if (content.toUpperCase().includes(pattern)) {
            violations.push({
              type: ViolationType.SQL_INJECTION_ATTEMPT,
              severity: RiskLevel.HIGH,
              description: `SQL injection pattern in file: ${pattern}`,
              action: 'File quarantined',
              timestamp: new Date()
            });
          }
        }
      }

    } catch (error) {
      // File might be binary, skip content scan
    }

    return violations;
  }

  /**
   * Scan file for malware using external scanner
   */
  private async scanForMalware(filePath: string): Promise<{ clean: boolean; threat?: string }> {
    if (!this.config.virusScanCommand) {
      return { clean: true }; // No scanner configured
    }

    try {
      const command = this.config.virusScanCommand.replace('{file}', filePath);
      const { stdout, stderr } = await execAsync(command);

      // Parse scanner output (this depends on the specific antivirus software)
      if (stderr || stdout.includes('FOUND') || stdout.includes('INFECTED')) {
        return { 
          clean: false, 
          threat: this.extractThreatName(stdout + stderr) 
        };
      }

      return { clean: true };
    } catch (error) {
      // Scanner failed, assume infected for safety
      return { 
        clean: false, 
        threat: 'Scanner execution failed' 
      };
    }
  }

  /**
   * Extract threat name from scanner output
   */
  private extractThreatName(output: string): string {
    // This is a simple implementation - should be customized for specific scanners
    const threatMatch = output.match(/FOUND (.+)/i) || output.match(/INFECTED (.+)/i);
    return threatMatch ? threatMatch[1].trim() : 'Unknown threat';
  }

  /**
   * Validate filename for suspicious patterns
   */
  private validateFilename(filename: string): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Check for null bytes
    if (filename.includes('\0')) {
      violations.push({
        type: ViolationType.SUSPICIOUS_FILE,
        severity: RiskLevel.HIGH,
        description: 'Null byte in filename',
        action: 'File rejected',
        timestamp: new Date()
      });
    }

    // Check for path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      violations.push({
        type: ViolationType.SUSPICIOUS_FILE,
        severity: RiskLevel.HIGH,
        description: 'Path traversal attempt in filename',
        action: 'File rejected',
        timestamp: new Date()
      });
    }

    // Check for suspicious extensions
    const doubleExtensions = ['.exe.jpg', '.exe.png', '.scr.pdf', '.bat.txt'];
    const lowerFilename = filename.toLowerCase();
    for (const ext of doubleExtensions) {
      if (lowerFilename.includes(ext)) {
        violations.push({
          type: ViolationType.SUSPICIOUS_FILE,
          severity: RiskLevel.CRITICAL,
          description: `Suspicious double extension: ${ext}`,
          action: 'File rejected',
          timestamp: new Date()
        });
      }
    }

    // Check filename length
    if (filename.length > 255) {
      violations.push({
        type: ViolationType.SUSPICIOUS_FILE,
        severity: RiskLevel.MEDIUM,
        description: 'Filename too long',
        action: 'File rejected',
        timestamp: new Date()
      });
    }

    return violations;
  }

  /**
   * Quarantine suspicious file
   */
  private async quarantineFile(filePath: string, originalName: string): Promise<void> {
    try {
      // Ensure quarantine directory exists
      await fs.mkdir(this.config.quarantineFolder, { recursive: true });

      // Generate unique quarantine filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const hash = crypto.createHash('md5').update(originalName).digest('hex');
      const quarantineName = `${timestamp}_${hash}_${originalName}`;
      const quarantinePath = path.join(this.config.quarantineFolder, quarantineName);

      // Move file to quarantine
      await fs.rename(filePath, quarantinePath);

      // Create metadata file
      const metadata = {
        originalName,
        originalPath: filePath,
        quarantineTime: new Date().toISOString(),
        reason: 'Security violation detected'
      };

      await fs.writeFile(
        `${quarantinePath}.metadata.json`,
        JSON.stringify(metadata, null, 2)
      );

      console.warn(`File quarantined: ${originalName} -> ${quarantinePath}`);
    } catch (error) {
      console.error(`Failed to quarantine file ${originalName}:`, error);
    }
  }

  /**
   * Generate file hash for integrity checking
   */
  async generateFileHash(filePath: string, algorithm: string = 'sha256'): Promise<string> {
    const buffer = await fs.readFile(filePath);
    const hash = crypto.createHash(algorithm);
    hash.update(buffer);
    return hash.digest('hex');
  }

  /**
   * Clean up old quarantined files
   */
  async cleanupQuarantine(olderThanDays: number = 30): Promise<void> {
    try {
      const files = await fs.readdir(this.config.quarantineFolder);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      for (const file of files) {
        const filePath = path.join(this.config.quarantineFolder, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          console.log(`Cleaned up quarantined file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup quarantine:', error);
    }
  }
}
