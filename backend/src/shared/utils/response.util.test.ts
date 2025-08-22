/**
 * Response Utilities Test Suite
 * Tests for API response formatting and standardization
 */

import { describe, it, expect } from '@jest/globals';
import { ResponseUtil } from './response.util';
import { Response } from 'express';

// Mock Express Response
const createMockResponse = (): Partial<Response> => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
});

describe('Response Utilities', () => {
  describe('ResponseUtil.success', () => {
    it('should create basic success response', () => {
      const mockRes = createMockResponse() as Response;
      const data = { id: 1, name: 'Test' };
      
      ResponseUtil.success(mockRes, data, 'Data retrieved successfully');

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: data,
        message: 'Data retrieved successfully',
        meta: {
          timestamp: expect.any(String)
        }
      });
    });

    it('should create success response without message', () => {
      const mockRes = createMockResponse() as Response;
      const data = { id: 1, name: 'Test' };
      
      ResponseUtil.success(mockRes, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: data,
        message: undefined,
        meta: {
          timestamp: expect.any(String)
        }
      });
    });

    it('should create success response with custom status code', () => {
      const mockRes = createMockResponse() as Response;
      const data = { id: 1, name: 'Test' };
      
      ResponseUtil.success(mockRes, data, 'Created', 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: data,
        message: 'Created',
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('ResponseUtil.error', () => {
    it('should create basic error response', () => {
      const mockRes = createMockResponse() as Response;
      
      ResponseUtil.error(mockRes, 'INTERNAL_ERROR', 'Something went wrong', null, 500);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Something went wrong',
          details: null
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });

    it('should create error response with default status 400', () => {
      const mockRes = createMockResponse() as Response;
      
      ResponseUtil.error(mockRes, 'VALIDATION_ERROR', 'Validation failed');

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: undefined
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('ResponseUtil.validationError', () => {
    it('should return validation error response', () => {
      const mockRes = createMockResponse() as Response;
      
      ResponseUtil.validationError(mockRes, 'Invalid input');

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: undefined
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('ResponseUtil.notFound', () => {
    it('should return not found response', () => {
      const mockRes = createMockResponse() as Response;
      
      ResponseUtil.notFound(mockRes, 'Resource not found');

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          details: null
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });

    it('should return not found response with default message', () => {
      const mockRes = createMockResponse() as Response;
      
      ResponseUtil.notFound(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          details: null
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('ResponseUtil.unauthorized', () => {
    it('should return unauthorized response', () => {
      const mockRes = createMockResponse() as Response;
      
      ResponseUtil.unauthorized(mockRes, 'Authentication required');

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          details: null
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('ResponseUtil.forbidden', () => {
    it('should return forbidden response', () => {
      const mockRes = createMockResponse() as Response;
      
      ResponseUtil.forbidden(mockRes, 'Access denied');

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied',
          details: null
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('ResponseUtil.internalError', () => {
    it('should return internal server error response', () => {
      const mockRes = createMockResponse() as Response;
      
      ResponseUtil.internalError(mockRes, 'Internal server error');

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: null
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('ResponseUtil.created', () => {
    it('should return created response', () => {
      const mockRes = createMockResponse() as Response;
      const data = { id: 1, name: 'New Resource' };
      
      ResponseUtil.created(mockRes, data, 'Resource created successfully');

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: data,
        message: 'Resource created successfully',
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('ResponseUtil.deleted', () => {
    it('should return deleted response', () => {
      const mockRes = createMockResponse() as Response;
      
      ResponseUtil.deleted(mockRes, 'Resource deleted successfully');

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Resource deleted successfully',
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });
});
