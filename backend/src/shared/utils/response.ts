/**
 * Shared Response Utilities
 * 
 * Standardized response format for all API endpoints
 */

import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    timestamp: string;
  };
}

/**
 * Send success response
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: any
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      ...meta,
      timestamp: new Date().toISOString()
    }
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errorCode: string = 'INTERNAL_SERVER_ERROR',
  details?: any
): Response => {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: errorCode,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  },
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    message,
    meta: {
      pagination,
      timestamp: new Date().toISOString()
    }
  };

  return res.status(statusCode).json(response);
};
