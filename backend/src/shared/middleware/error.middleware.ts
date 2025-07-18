import { Request, Response, NextFunction } from 'express';
import { logger } from '@/core/logger/logger';
import { ApiError } from '@/shared/utils/api-error.util';
import { sendErrorResponse } from '@/shared/utils/response.util';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Global error handler caught an error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle custom API errors
  if (err instanceof ApiError) {
    sendErrorResponse(res, err.statusCode, err.message, err.errors);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    handlePrismaError(err, res);
    return;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    sendErrorResponse(res, 400, 'Validation Error', [err.message]);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendErrorResponse(res, 401, 'Invalid token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendErrorResponse(res, 401, 'Token expired');
    return;
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    handleMulterError(err, res);
    return;
  }

  // Handle syntax errors
  if (err instanceof SyntaxError && 'body' in err) {
    sendErrorResponse(res, 400, 'Invalid JSON format');
    return;
  }

  // Default error response
  const statusCode = process.env.NODE_ENV === 'production' ? 500 : 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Internal Server Error';

  sendErrorResponse(res, statusCode, message);
};

const handlePrismaError = (err: any, res: Response): void => {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      sendErrorResponse(res, 409, 'Resource already exists');
      break;
    case 'P2025':
      // Record not found
      sendErrorResponse(res, 404, 'Resource not found');
      break;
    case 'P2003':
      // Foreign key constraint violation
      sendErrorResponse(res, 400, 'Invalid reference');
      break;
    default:
      sendErrorResponse(res, 500, 'Database error');
  }
};

const handleMulterError = (err: any, res: Response): void => {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      sendErrorResponse(res, 400, 'File size too large');
      break;
    case 'LIMIT_FILE_COUNT':
      sendErrorResponse(res, 400, 'Too many files');
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      sendErrorResponse(res, 400, 'Unexpected file field');
      break;
    default:
      sendErrorResponse(res, 400, 'File upload error');
  }
};
