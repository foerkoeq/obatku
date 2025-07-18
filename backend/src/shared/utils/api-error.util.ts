/**
 * Custom API Error class for structured error handling
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors?: string[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: string[],
    isOperational: boolean = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    
    // Maintain proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a Bad Request error (400)
   */
  static badRequest(message: string, errors?: string[]): ApiError {
    return new ApiError(message, 400, errors);
  }

  /**
   * Create an Unauthorized error (401)
   */
  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(message, 401);
  }

  /**
   * Create a Forbidden error (403)
   */
  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(message, 403);
  }

  /**
   * Create a Not Found error (404)
   */
  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(message, 404);
  }

  /**
   * Create a Conflict error (409)
   */
  static conflict(message: string): ApiError {
    return new ApiError(message, 409);
  }

  /**
   * Create an Unprocessable Entity error (422)
   */
  static unprocessableEntity(message: string, errors?: string[]): ApiError {
    return new ApiError(message, 422, errors);
  }

  /**
   * Create an Internal Server Error (500)
   */
  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(message, 500);
  }

  /**
   * Create a Validation Error (400)
   */
  static validation(message: string, errors: string[]): ApiError {
    return new ApiError(message, 400, errors);
  }
}
