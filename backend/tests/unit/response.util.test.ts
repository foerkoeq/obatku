import { Response } from 'express';
import { ResponseUtil, sendErrorResponse } from '../../src/shared/utils/response.util';

// Mock Express Response
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('Response Utilities', () => {
  let res: Response;

  beforeEach(() => {
    res = mockResponse();
  });

  describe('ResponseUtil.success', () => {
    it('should return success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Success';
      
      ResponseUtil.success(res, data, message);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message,
        meta: {
          timestamp: expect.any(String)
        }
      });
    });

    it('should return success response without message', () => {
      const data = { id: 1, name: 'Test' };
      
      ResponseUtil.success(res, data);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: undefined,
        meta: {
          timestamp: expect.any(String)
        }
      });
    });

    it('should return success response with custom status code', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Created';
      const statusCode = 201;
      
      ResponseUtil.success(res, data, message, statusCode);
      
      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message,
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('ResponseUtil.error', () => {
    it('should return error response with custom status', () => {
      const code = 'CUSTOM_ERROR';
      const message = 'Something went wrong';
      const status = 400;
      
      ResponseUtil.error(res, code, message, null, status);
      
      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code,
          message,
          details: null
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });

    it('should return error response with default status 400', () => {
      const code = 'INTERNAL_ERROR';
      const message = 'Internal server error';
      
      ResponseUtil.error(res, code, message);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code,
          message,
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
      const message = 'Validation failed';
      const details = ['Field is required', 'Invalid email format'];
      
      ResponseUtil.validationError(res, message, details);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message,
          details
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('ResponseUtil.notFound', () => {
    it('should return not found response', () => {
      const message = 'Resource not found';
      
      ResponseUtil.notFound(res, message);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message,
          details: null
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });

    it('should return not found response with default message', () => {
      ResponseUtil.notFound(res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
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
      const message = 'Unauthorized access';
      
      ResponseUtil.unauthorized(res, message);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message,
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
      const message = 'Access forbidden';
      
      ResponseUtil.forbidden(res, message);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message,
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
      const message = 'Internal server error';
      
      ResponseUtil.internalError(res, message);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message,
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
      const data = { id: 1, name: 'Test' };
      const message = 'Resource created successfully';
      
      ResponseUtil.created(res, data, message);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message,
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('ResponseUtil.deleted', () => {
    it('should return deleted response', () => {
      const message = 'Resource deleted successfully';
      
      ResponseUtil.deleted(res, message);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message,
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('sendErrorResponse', () => {
    it('should return error response with status code and message', () => {
      const statusCode = 400;
      const message = 'Bad request';
      const errors = ['Field is required'];
      
      sendErrorResponse(res, statusCode, message, errors);
      
      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'HTTP_400',
          message,
          details: { errors }
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });

    it('should return error response without errors', () => {
      const statusCode = 500;
      const message = 'Internal server error';
      
      sendErrorResponse(res, statusCode, message);
      
      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'HTTP_500',
          message,
          details: undefined
        },
        meta: {
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('createPaginationMeta', () => {
    it('should create pagination metadata correctly', () => {
      const { createPaginationMeta } = require('../../src/shared/utils/response.util');
      
      const result = createPaginationMeta(2, 10, 25);
      
      expect(result).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrevious: true
      });
    });
  });

  describe('parsePaginationParams', () => {
    it('should parse pagination parameters correctly', () => {
      const { parsePaginationParams } = require('../../src/shared/utils/response.util');
      
      const query = {
        page: '2',
        limit: '15',
        sortBy: 'name',
        sortOrder: 'asc',
        search: 'test'
      };
      
      const result = parsePaginationParams(query);
      
      expect(result).toEqual({
        page: 2,
        limit: 15,
        sortBy: 'name',
        sortOrder: 'asc',
        search: 'test',
        skip: 15
      });
    });

    it('should handle missing pagination parameters', () => {
      const { parsePaginationParams } = require('../../src/shared/utils/response.util');
      
      const result = parsePaginationParams({});
      
      expect(result).toEqual({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: '',
        skip: 0
      });
    });
  });
});
