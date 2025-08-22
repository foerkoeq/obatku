/**
 * Shared Error Types
 * Comprehensive error handling system for the application
 * 
 * @description This module provides custom error classes that extend the base Error class
 * with additional properties like statusCode, errorCode, and operational status.
 * Each error class is designed for specific HTTP status codes and use cases.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST'
}

/**
 * Validation Error Class
 * 
 * @description Represents validation errors with detailed information about what failed validation.
 * The details parameter can contain field-specific error messages, validation rules, or any
 * other information that helps identify and resolve the validation issue.
 * 
 * @example
 * ```typescript
 * // Basic usage
 * throw new ValidationError('Invalid input data');
 * 
 * // With detailed validation errors
 * throw new ValidationError('Validation failed', {
 *   email: 'Invalid email format',
 *   password: 'Password must be at least 8 characters',
 *   age: 'Age must be a positive number'
 * });
 * 
 * // In error handling
 * try {
 *   // validation logic
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     const details = error.getValidationDetails();
 *     console.log('Validation details:', details);
 *   }
 * }
 * ```
 */
export class ValidationError extends AppError {
  public details?: Record<string, any>;

  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, ErrorCode.VALIDATION_ERROR);
    this.name = 'ValidationError';
    this.details = details;
  }

  /**
   * Get validation error details
   * @returns The validation details object or undefined if no details provided
   */
  getValidationDetails(): Record<string, any> | undefined {
    return this.details;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, ErrorCode.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, ErrorCode.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, ErrorCode.FORBIDDEN);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, ErrorCode.CONFLICT);
    this.name = 'ConflictError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, ErrorCode.BAD_REQUEST);
    this.name = 'BadRequestError';
  }
}
