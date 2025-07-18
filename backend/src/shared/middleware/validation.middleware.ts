import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ApiError } from '@/shared/utils/api-error.util';

/**
 * Middleware to validate request data using Zod schemas
 */
export const validateRequest = (schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      // Validate route parameters
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        next(ApiError.validation('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware to validate only request body
 */
export const validateBody = (schema: z.ZodSchema) => {
  return validateRequest({ body: schema });
};

/**
 * Middleware to validate only query parameters
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return validateRequest({ query: schema });
};

/**
 * Middleware to validate only route parameters
 */
export const validateParams = (schema: z.ZodSchema) => {
  return validateRequest({ params: schema });
};
