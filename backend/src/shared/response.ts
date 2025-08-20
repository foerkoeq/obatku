/**
 * Shared Response Utilities
 * Standard API response formatters
 */

import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const successResponse = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
  pagination?: any
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    pagination
  };

  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string,
  errors?: string[],
  statusCode: number = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    errors
  };

  return res.status(statusCode).json(response);
};
