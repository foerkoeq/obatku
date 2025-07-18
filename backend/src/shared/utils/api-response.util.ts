// ================================
// ENHANCED API RESPONSE UTILITY
// ================================

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  ApiSuccessResponse, 
  ApiErrorResponse, 
  ApiPaginatedResponse,
  PaginationMeta,
  ApiResponseMeta
} from '@/shared/types/api.types';

/**
 * Enhanced API Response Utility
 * Provides standardized response methods with comprehensive features
 */
export class ApiResponseUtil {
  private static readonly API_VERSION = '1.0.0';

  /**
   * Generate base response metadata
   */
  private static generateMeta(processingTime?: number): ApiResponseMeta {
    return {
      timestamp: new Date().toISOString(),
      processingTime,
      source: 'obatku-api'
    };
  }

  /**
   * Calculate processing time from start time
   */
  private static calculateProcessingTime(startTime?: number): number | undefined {
    return startTime ? Date.now() - startTime : undefined;
  }

  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    options: {
      message?: string;
      statusCode?: number;
      requestId?: string;
      startTime?: number;
      meta?: Record<string, any>;
    } = {}
  ): Response<ApiSuccessResponse<T>> {
    const {
      message = 'Success',
      statusCode = 200,
      requestId = uuidv4(),
      startTime,
      meta = {}
    } = options;

    const processingTime = this.calculateProcessingTime(startTime);
    
    const response: ApiSuccessResponse<T> = {
      success: true,
      timestamp: new Date().toISOString(),
      requestId,
      version: this.API_VERSION,
      data,
      message,
      meta: {
        ...this.generateMeta(processingTime),
        ...meta
      }
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated success response
   */
  static successPaginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    options: {
      message?: string;
      statusCode?: number;
      requestId?: string;
      startTime?: number;
      meta?: Record<string, any>;
    } = {}
  ): Response<ApiPaginatedResponse<T>> {
    const {
      message = 'Data retrieved successfully',
      statusCode = 200,
      requestId = uuidv4(),
      startTime,
      meta = {}
    } = options;

    const processingTime = this.calculateProcessingTime(startTime);
    
    const response: ApiPaginatedResponse<T> = {
      success: true,
      timestamp: new Date().toISOString(),
      requestId,
      version: this.API_VERSION,
      data,
      message,
      meta: {
        ...pagination,
        ...this.generateMeta(processingTime),
        ...meta
      }
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    error: {
      code: string;
      message: string;
      details?: any;
      stack?: string;
    },
    options: {
      statusCode?: number;
      requestId?: string;
      path?: string;
      method?: string;
      startTime?: number;
    } = {}
  ): Response<ApiErrorResponse> {
    const {
      statusCode = 500,
      requestId = uuidv4(),
      path,
      method,
      startTime
    } = options;

    const processingTime = this.calculateProcessingTime(startTime);
    
    const response: ApiErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      requestId,
      version: this.API_VERSION,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        ...(process.env.NODE_ENV === 'development' && error.stack && { stack: error.stack })
      },
      path,
      method,
      ...(processingTime && { 
        meta: this.generateMeta(processingTime) 
      })
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created<T>(
    res: Response,
    data: T,
    options: {
      message?: string;
      requestId?: string;
      startTime?: number;
      location?: string;
    } = {}
  ): Response<ApiSuccessResponse<T>> {
    const { location, ...restOptions } = options;
    
    if (location) {
      res.set('Location', location);
    }

    return this.success(res, data, {
      ...restOptions,
      statusCode: 201,
      message: options.message || 'Resource created successfully'
    });
  }

  /**
   * Send accepted response (202)
   */
  static accepted<T>(
    res: Response,
    data: T,
    options: {
      message?: string;
      requestId?: string;
      startTime?: number;
    } = {}
  ): Response<ApiSuccessResponse<T>> {
    return this.success(res, data, {
      ...options,
      statusCode: 202,
      message: options.message || 'Request accepted for processing'
    });
  }

  /**
   * Send no content response (204)
   */
  static noContent(
    res: Response,
    _options: {
      requestId?: string;
      startTime?: number;
    } = {}
  ): Response {
    return res.status(204).send();
  }

  /**
   * Send bad request error (400)
   */
  static badRequest(
    res: Response,
    message: string = 'Bad Request',
    details?: any,
    options: {
      requestId?: string;
      path?: string;
      method?: string;
      startTime?: number;
    } = {}
  ): Response<ApiErrorResponse> {
    return this.error(res, {
      code: 'BAD_REQUEST',
      message,
      details
    }, {
      ...options,
      statusCode: 400
    });
  }

  /**
   * Send unauthorized error (401)
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized',
    options: {
      requestId?: string;
      path?: string;
      method?: string;
      startTime?: number;
    } = {}
  ): Response<ApiErrorResponse> {
    return this.error(res, {
      code: 'UNAUTHORIZED',
      message
    }, {
      ...options,
      statusCode: 401
    });
  }

  /**
   * Send forbidden error (403)
   */
  static forbidden(
    res: Response,
    message: string = 'Forbidden',
    options: {
      requestId?: string;
      path?: string;
      method?: string;
      startTime?: number;
    } = {}
  ): Response<ApiErrorResponse> {
    return this.error(res, {
      code: 'FORBIDDEN',
      message
    }, {
      ...options,
      statusCode: 403
    });
  }

  /**
   * Send not found error (404)
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found',
    options: {
      requestId?: string;
      path?: string;
      method?: string;
      startTime?: number;
    } = {}
  ): Response<ApiErrorResponse> {
    return this.error(res, {
      code: 'NOT_FOUND',
      message
    }, {
      ...options,
      statusCode: 404
    });
  }

  /**
   * Send conflict error (409)
   */
  static conflict(
    res: Response,
    message: string = 'Conflict',
    details?: any,
    options: {
      requestId?: string;
      path?: string;
      method?: string;
      startTime?: number;
    } = {}
  ): Response<ApiErrorResponse> {
    return this.error(res, {
      code: 'CONFLICT',
      message,
      details
    }, {
      ...options,
      statusCode: 409
    });
  }

  /**
   * Send validation error (422)
   */
  static validationError(
    res: Response,
    message: string = 'Validation failed',
    details?: any,
    options: {
      requestId?: string;
      path?: string;
      method?: string;
      startTime?: number;
    } = {}
  ): Response<ApiErrorResponse> {
    return this.error(res, {
      code: 'VALIDATION_ERROR',
      message,
      details
    }, {
      ...options,
      statusCode: 422
    });
  }

  /**
   * Send too many requests error (429)
   */
  static tooManyRequests(
    res: Response,
    message: string = 'Too many requests',
    options: {
      requestId?: string;
      path?: string;
      method?: string;
      startTime?: number;
      retryAfter?: number;
    } = {}
  ): Response<ApiErrorResponse> {
    const { retryAfter, ...restOptions } = options;
    
    if (retryAfter) {
      res.set('Retry-After', retryAfter.toString());
    }

    return this.error(res, {
      code: 'TOO_MANY_REQUESTS',
      message
    }, {
      ...restOptions,
      statusCode: 429
    });
  }

  /**
   * Send internal server error (500)
   */
  static internalError(
    res: Response,
    message: string = 'Internal server error',
    error?: Error,
    options: {
      requestId?: string;
      path?: string;
      method?: string;
      startTime?: number;
    } = {}
  ): Response<ApiErrorResponse> {
    return this.error(res, {
      code: 'INTERNAL_ERROR',
      message,
      stack: error?.stack
    }, {
      ...options,
      statusCode: 500
    });
  }
}

/**
 * Legacy compatibility - keeps existing ResponseUtil working
 */
export class ResponseUtil extends ApiResponseUtil {}

export default ApiResponseUtil;
