/**
 * Error Code Constants
 * 
 * Centralized error codes for the application
 */

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR'
}

export const ERROR_MESSAGES = {
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed',
  [ErrorCode.AUTHENTICATION_ERROR]: 'Authentication failed',
  [ErrorCode.AUTHORIZATION_ERROR]: 'Access denied',
  [ErrorCode.NOT_FOUND]: 'Resource not found',
  [ErrorCode.DUPLICATE_ENTRY]: 'Duplicate entry',
  [ErrorCode.BUSINESS_LOGIC_ERROR]: 'Business logic error',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [ErrorCode.DATABASE_ERROR]: 'Database error',
  [ErrorCode.FILE_UPLOAD_ERROR]: 'File upload error',
  [ErrorCode.RATE_LIMIT_ERROR]: 'Rate limit exceeded'
};
