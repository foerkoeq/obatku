import { Response } from 'express';
import { 
  SuccessResponse, 
  ErrorResponse, 
  PaginatedResponse, 
  PaginationMeta 
} from '@/shared/types/common.types';

/**
 * Standardized API response utility
 */
export class ResponseUtil {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200
  ): Response<SuccessResponse<T>> {
    const response: SuccessResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString()
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
    message?: string,
    statusCode = 200
  ): Response<SuccessResponse<PaginatedResponse<T>>> {
    const response: SuccessResponse<PaginatedResponse<T>> = {
      success: true,
      data: {
        data,
        meta: pagination
      },
      message,
      meta: {
        pagination,
        timestamp: new Date().toISOString()
      }
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    code: string,
    message: string,
    details?: any,
    statusCode = 400
  ): Response<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    message: string,
    details?: any
  ): Response<ErrorResponse> {
    return this.error(res, 'VALIDATION_ERROR', message, details, 400);
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message = 'Resource not found'
  ): Response<ErrorResponse> {
    return this.error(res, 'NOT_FOUND', message, null, 404);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message = 'Unauthorized access'
  ): Response<ErrorResponse> {
    return this.error(res, 'UNAUTHORIZED', message, null, 401);
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message = 'Forbidden access'
  ): Response<ErrorResponse> {
    return this.error(res, 'FORBIDDEN', message, null, 403);
  }

  /**
   * Send internal server error response
   */
  static internalError(
    res: Response,
    message = 'Internal server error'
  ): Response<ErrorResponse> {
    return this.error(res, 'INTERNAL_ERROR', message, null, 500);
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message = 'Resource created successfully'
  ): Response<SuccessResponse<T>> {
    return this.success(res, data, message, 201);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send accepted response
   */
  static accepted<T>(
    res: Response,
    data: T,
    message = 'Request accepted'
  ): Response<SuccessResponse<T>> {
    return this.success(res, data, message, 202);
  }

  /**
   * Send unauthenticated response
   */
  static unauthenticated(
    res: Response,
    message = 'Authentication required'
  ): Response<ErrorResponse> {
    return this.error(res, 'UNAUTHENTICATED', message, null, 401);
  }

  /**
   * Send duplicate entry response
   */
  static duplicateEntry(
    res: Response,
    resource: string,
    identifier: string
  ): Response<ErrorResponse> {
    return this.error(
      res, 
      'DUPLICATE_ENTRY', 
      `${resource} with identifier '${identifier}' already exists`, 
      null, 
      409
    );
  }

  /**
   * Send business logic error response
   */
  static businessLogicError(
    res: Response,
    message: string,
    details?: any
  ): Response<ErrorResponse> {
    return this.error(res, 'BUSINESS_LOGIC_ERROR', message, details, 422);
  }

  /**
   * Send deleted response
   */
  static deleted(
    res: Response,
    message = 'Resource deleted successfully'
  ): Response<SuccessResponse<null>> {
    return this.success(res, null, message, 200);
  }

  /**
   * Send bulk operation response
   */
  static bulkOperation<T>(
    res: Response,
    data: T[],
    total: number,
    successful: number,
    failed: number,
    errors?: Array<{ index: number; error: string }>,
    message?: string
  ): Response<SuccessResponse<{ 
    data: T[], 
    summary: { 
      total: number, 
      successful: number, 
      failed: number,
      errors?: Array<{ index: number; error: string }>
    } 
  }>> {
    const defaultMessage = `Bulk operation completed: ${successful} successful, ${failed} failed`;
    
    return this.success(res, {
      data,
      summary: {
        total,
        successful,
        failed,
        errors
      }
    }, message || defaultMessage, 200);
  }
}

/**
 * Create pagination metadata
 */
export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const pages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1
  };
};

/**
 * Parse pagination parameters
 */
export const parsePaginationParams = (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const search = query.search || '';

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    skip: (page - 1) * limit
  };
};

/**
 * Simple error response function (for middleware compatibility)
 */
export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: string[]
): Response<ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: `HTTP_${statusCode}`,
      message,
      details: errors ? { errors } : undefined
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  return res.status(statusCode).json(response);
};
