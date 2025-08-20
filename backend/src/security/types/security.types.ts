// ======================================
// SECURITY TYPES & INTERFACES - ENHANCED
// ======================================

export interface SecurityConfig {
  rateLimiting: RateLimitConfig;
  sanitization: SanitizationConfig;
  fileUpload: FileUploadConfig;
  headers: SecurityHeadersConfig;
  sqlPrevention: SQLPreventionConfig;
  testing: SecurityTestConfig;
  monitoring: SecurityMonitoringConfig;
  advanced: AdvancedSecurityConfig;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  store?: any;
  keyGenerator?: (req: any) => string;
  handler?: (req: any, res: any, next: any) => void;
  onLimitReached?: (req: any, res: any, options: any) => void;
  // Enhanced rate limiting options
  enableProgressiveLimiting: boolean;
  progressivePenalty: number;
  enableSmartLimiting: boolean;
  whitelistIPs: string[];
  blacklistIPs: string[];
  // Authentication specific limits
  authWindowMs: number;
  authMaxRequests: number;
  // API specific limits
  apiWindowMs: number;
  apiMaxRequests: number;
  // Upload specific limits
  uploadWindowMs: number;
  uploadMaxRequests: number;
}

export interface SanitizationConfig {
  stripHtml: boolean;
  normalizeEmail: boolean;
  escapeSpecialChars: boolean;
  maxStringLength: number;
  allowedTags: string[];
  allowedAttributes: Record<string, string[]>;
  // Enhanced sanitization options
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  enablePathTraversalProtection: boolean;
  enableCommandInjectionProtection: boolean;
  // Custom sanitization rules
  customRules: {
    email: SanitizationRule;
    phone: SanitizationRule;
    url: SanitizationRule;
    nip: SanitizationRule;
    [key: string]: SanitizationRule;
  };
  // Field-specific sanitization
  fieldSanitization: Record<string, FieldSanitizationOptions>;
}

export interface SanitizationRule {
  pattern: RegExp;
  maxLength: number;
}

export interface FieldSanitizationOptions {
  stripHtml?: boolean;
  normalizeEmail?: boolean;
  escapeSpecialChars?: boolean;
  maxLength?: number;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

export interface FileUploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  scanForMalware: boolean;
  quarantineFolder: string;
  virusScanCommand?: string;
  // Enhanced file validation
  enableMagicBytesCheck: boolean;
  enableFileSignatureValidation: boolean;
  enableContentTypeValidation: boolean;
  // File processing options
  enableImageProcessing: boolean;
  imageProcessingOptions: {
    resize: { maxWidth: number; maxHeight: number };
    quality: number;
    format: string;
  };
  // Virus scanning configuration
  virusScanTimeout: number;
  // Upload restrictions
  maxFilesPerRequest: number;
  maxTotalSizePerRequest: number;
  // Temporary file handling
  tempFolder: string;
  cleanupTempFiles: boolean;
  tempFileExpiry: number;
}

export interface SecurityHeadersConfig {
  contentSecurityPolicy: CSPConfig;
  hsts: HSTSConfig;
  frameOptions: string;
  contentTypeOptions: boolean;
  xssProtection: boolean;
  referrerPolicy: string;
  permissionsPolicy: Record<string, string[]>;
  // Additional security headers
  crossOriginEmbedderPolicy: string;
  crossOriginOpenerPolicy: string;
  crossOriginResourcePolicy: string;
  originAgentCluster: boolean;
  // Custom headers
  customHeaders: Record<string, string>;
}

export interface CSPConfig {
  directives: Record<string, string[]>;
  reportOnly: boolean;
  reportUri?: string;
}

export interface HSTSConfig {
  maxAge: number;
  includeSubDomains: boolean;
  preload: boolean;
}

export interface SQLPreventionConfig {
  enablePreparedStatements: boolean;
  enableQueryLogging: boolean;
  blockSuspiciousPatterns: boolean;
  suspiciousPatterns: string[];
  enableQueryValidation: boolean;
  // Enhanced SQL prevention
  enableParameterValidation: boolean;
  enableQueryLengthLimit: boolean;
  maxQueryLength: number;
  // Whitelist validation
  allowedFields: string[];
  // Query monitoring
  enableQueryMonitoring: boolean;
  suspiciousQueryThreshold: number;
  // Prepared statement validation
  validatePreparedStatements: boolean;
  requireParameterizedQueries: boolean;
}

export interface SecurityTestConfig {
  enablePenetrationTesting: boolean;
  testFrequency: string;
  reportPath: string;
  alertThreshold: number;
  // Enhanced testing options
  enableAutomatedTesting: boolean;
  testTypes: string[];
  // Test configuration
  testTimeout: number;
  maxTestConcurrency: number;
  // Reporting options
  enableDetailedReports: boolean;
  enableEmailAlerts: boolean;
  alertEmailRecipients: string[];
  // Test data
  testDataPath: string;
  enableTestDataCleanup: boolean;
}

// New: Monitoring and alerting configuration
export interface SecurityMonitoringConfig {
  enableSecurityMonitoring: boolean;
  enableRealTimeAlerts: boolean;
  alertChannels: string[];
  // Email alert configuration
  enableEmailAlerts: boolean;
  alertEmailRecipients: string[];
  // Alert thresholds
  alertThresholds: {
    rateLimitViolations: number;
    sqlInjectionAttempts: number;
    xssAttempts: number;
    fileUploadViolations: number;
    authenticationFailures: number;
  };
  // Logging configuration
  enableDetailedLogging: boolean;
  logSecurityEvents: boolean;
  logRetentionDays: number;
  // Performance monitoring
  enablePerformanceMonitoring: boolean;
  performanceThresholds: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

// New: Advanced security features
export interface AdvancedSecurityConfig {
  enableRequestValidation: boolean;
  enableResponseSanitization: boolean;
  enableSessionSecurity: boolean;
  enableCSRFProtection: boolean;
  enableClickjackingProtection: boolean;
  enableMIMESniffingProtection: boolean;
  // Encryption options
  enableResponseEncryption: boolean;
  encryptionAlgorithm: string;
  // Session security
  sessionTimeout: number;
  sessionRenewalThreshold: number;
  maxConcurrentSessions: number;
  // API security
  enableAPIVersioning: boolean;
  enableAPIDocumentation: boolean;
  enableAPIRateLimitPerUser: boolean;
  // Cache security
  enableCacheSecurity: boolean;
  cacheSecurityHeaders: boolean;
  preventCacheLeakage: boolean;
}

// Request Security Context
export interface SecurityContext {
  requestId: string;
  userAgent: string;
  ipAddress: string;
  timestamp: Date;
  riskLevel: RiskLevel;
  violations: SecurityViolation[];
  // Enhanced context
  userId?: string;
  sessionId?: string;
  endpoint: string;
  method: string;
  requestSize: number;
  responseTime?: number;
  // Security metrics
  securityScore: number;
  threatIndicators: string[];
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SecurityViolation {
  type: ViolationType;
  severity: RiskLevel;
  description: string;
  action: string;
  timestamp: Date;
  // Enhanced violation details
  context?: Record<string, any>;
  remediation?: string;
  impact?: string;
  confidence?: number; // 0-100
}

export enum ViolationType {
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  MALICIOUS_INPUT = 'malicious_input',
  SUSPICIOUS_FILE = 'suspicious_file',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  PATH_TRAVERSAL_ATTEMPT = 'path_traversal_attempt',
  COMMAND_INJECTION_ATTEMPT = 'command_injection_attempt',
  FILE_UPLOAD_VIOLATION = 'file_upload_violation',
  SESSION_HIJACKING_ATTEMPT = 'session_hijacking_attempt',
  CSRF_ATTEMPT = 'csrf_attempt',
  CLICKJACKING_ATTEMPT = 'clickjacking_attempt',
  MIME_SNIFFING_ATTEMPT = 'mime_sniffing_attempt',
  PERFORMANCE_VIOLATION = 'performance_violation',
  MEMORY_LEAK_DETECTED = 'memory_leak_detected',
  CPU_OVERLOAD = 'cpu_overload'
}

// Sanitization Types
export interface SanitizationResult {
  original: any;
  sanitized: any;
  violations: SecurityViolation[];
  isSafe: boolean;
  // Enhanced sanitization result
  sanitizationTime: number;
  fieldsProcessed: number;
  fieldsModified: number;
  confidence: number;
}

// File Validation Types
export interface FileValidationResult {
  isValid: boolean;
  fileName: string;
  fileSize: number;
  mimeType: string;
  extension: string;
  violations: SecurityViolation[];
  quarantined: boolean;
  // Enhanced file validation
  magicBytes: string;
  fileSignature: string;
  scanResult?: VirusScanResult;
  processingTime: number;
  checksum: string;
}

export interface VirusScanResult {
  isClean: boolean;
  threats: string[];
  scanEngine: string;
  scanTime: number;
  virusDefinitions: string;
}

// Rate Limiting Types
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalHits: number;
  // Enhanced rate limiting
  limitType: 'general' | 'auth' | 'api' | 'upload';
  penaltyLevel: number;
  isWhitelisted: boolean;
  isBlacklisted: boolean;
  progressivePenalty?: number;
}

// Security Metrics Types
export interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  violationsByType: Record<ViolationType, number>;
  averageResponseTime: number;
  securityScore: number;
  uptime: number;
  lastIncident?: Date;
  // Performance metrics
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
}

// Security Alert Types
export interface SecurityAlert {
  id: string;
  type: ViolationType;
  severity: RiskLevel;
  message: string;
  timestamp: Date;
  context: SecurityContext;
  // Alert management
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  notes?: string;
}

// Security Test Types
export interface SecurityTestResult {
  testType: string;
  passed: boolean;
  score: number;
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  executionTime: number;
  timestamp: Date;
}

export interface SecurityVulnerability {
  type: string;
  severity: RiskLevel;
  description: string;
  location: string;
  remediation: string;
  cveId?: string;
  cvssScore?: number;
}

// Security Event Types
export interface SecurityEvent {
  id: string;
  type: 'violation' | 'alert' | 'test' | 'metric' | 'incident';
  severity: RiskLevel;
  timestamp: Date;
  source: string;
  data: Record<string, any>;
  // Event correlation
  relatedEvents?: string[];
  correlationId?: string;
  // Event processing
  processed: boolean;
  processedAt?: Date;
  actionTaken?: string;
}

// Security Configuration Validation
export interface SecurityConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

// Security Performance Types
export interface SecurityPerformanceMetrics {
  sanitizationTime: number;
  validationTime: number;
  rateLimitCheckTime: number;
  fileScanTime: number;
  sqlPreventionTime: number;
  totalSecurityOverhead: number;
  // Performance impact
  impactOnResponseTime: number;
  memoryOverhead: number;
  cpuOverhead: number;
}
