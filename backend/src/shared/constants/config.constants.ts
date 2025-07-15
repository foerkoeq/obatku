// Application configuration constants
export const APP_CONFIG = {
  NAME: 'Obatku Backend API',
  VERSION: '1.0.0',
  DESCRIPTION: 'Agricultural Medicine Management System Backend API',
  PREFIX: '/api',
  DOCS_PATH: '/docs',
  HEALTH_PATH: '/health'
} as const;

// Default pagination settings
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;

// File upload configuration
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
} as const;

// Security configuration
export const SECURITY_CONFIG = {
  BCRYPT_ROUNDS: 12,
  JWT_ALGORITHM: 'HS256',
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128
} as const;

// Database configuration
export const DATABASE_CONFIG = {
  CONNECTION_TIMEOUT: 60000, // 60 seconds
  QUERY_TIMEOUT: 30000, // 30 seconds
  POOL_MIN: 2,
  POOL_MAX: 10
} as const;

// Logging configuration
export const LOG_CONFIG = {
  LEVELS: ['error', 'warn', 'info', 'debug'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  DATE_PATTERN: 'YYYY-MM-DD'
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 300, // 5 minutes
  USER_TTL: 300, // 5 minutes
  MEDICINE_TTL: 600, // 10 minutes
  DASHBOARD_TTL: 180, // 3 minutes
  REPORT_TTL: 1800 // 30 minutes
} as const;

// Notification configuration
export const NOTIFICATION_CONFIG = {
  TYPES: {
    EMAIL: 'email',
    SMS: 'sms',
    IN_APP: 'in_app',
    WEBHOOK: 'webhook'
  },
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  }
} as const;
