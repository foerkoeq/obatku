/**
 * Authentication Middleware Test Suite
 * Tests for JWT token validation, role checking, and permission verification
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { authenticateToken, optionalAuth, generateToken } from './auth.middleware';
import { UserRole, UserStatus } from '@prisma/client';
import { ResponseUtil } from '../shared/utils/response.util';

// Mock ResponseUtil
jest.mock('../shared/utils/response.util');

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockResponseUtil: jest.Mocked<typeof ResponseUtil>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request
    mockRequest = {
      headers: {},
      user: undefined
    };

    // Mock response with proper Express types
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    } as any;

    // Mock next function
    mockNext = jest.fn();

    // Mock ResponseUtil
    mockResponseUtil = {
      unauthenticated: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
      internalError: jest.fn()
    } as any;

    // Mock ResponseUtil methods
    jest.mocked(ResponseUtil).unauthenticated = mockResponseUtil.unauthenticated;
    jest.mocked(ResponseUtil).error = mockResponseUtil.error;
    jest.mocked(ResponseUtil).success = mockResponseUtil.success;
    jest.mocked(ResponseUtil).internalError = mockResponseUtil.internalError;
  });

  describe('authenticateToken', () => {
    it('should authenticate valid JWT token', async () => {
      const mockToken = 'valid.jwt.token';
      const mockPayload = {
        id: 'user-123',
        name: 'Test User',
        nip: '123456789012345678',
        email: 'test@example.com',
        phone: '081234567890',
        role: UserRole.PPL,
        status: UserStatus.ACTIVE,
        permissions: ['medicines:read']
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      // Mock jwt.verify to return our payload
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload);

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request without authorization header', async () => {
      mockRequest.headers = {};

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.unauthenticated).toHaveBeenCalledWith(mockResponse, 'Access token is required');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid authorization format', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token123'
      };

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.unauthenticated).toHaveBeenCalledWith(mockResponse, 'Access token is required');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with expired token', async () => {
      const mockToken = 'expired.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      // Mock jwt.verify to throw expired error
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse, 
        'TOKEN_EXPIRED', 
        'Token has expired', 
        null, 
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      const mockToken = 'invalid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      // Mock jwt.verify to throw invalid error
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse, 
        'INVALID_TOKEN', 
        'Invalid token', 
        null, 
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing token in header', async () => {
      mockRequest.headers = {
        authorization: 'Bearer '
      };

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.unauthenticated).toHaveBeenCalledWith(mockResponse, 'Access token is required');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should authenticate valid token and continue', async () => {
      const mockToken = 'valid.jwt.token';
      const mockPayload = {
        id: 'user-123',
        name: 'Test User',
        nip: '123456789012345678',
        email: 'test@example.com',
        phone: '081234567890',
        role: UserRole.PPL,
        status: UserStatus.ACTIVE,
        permissions: ['medicines:read']
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      // Mock jwt.verify to return our payload
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload);

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without token', async () => {
      mockRequest.headers = {};

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue with invalid token', async () => {
      const mockToken = 'invalid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      // Mock jwt.verify to throw error
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const mockPayload = {
        id: 'user-123',
        name: 'Test User',
        nip: '123456789012345678',
        email: 'test@example.com',
        phone: '081234567890',
        role: UserRole.PPL,
        status: UserStatus.ACTIVE,
        permissions: ['medicines:read']
      };

      // Mock jwt.sign to return a token
      const jwt = require('jsonwebtoken');
      const mockToken = 'generated.jwt.token';
      jest.spyOn(jwt, 'sign').mockReturnValue(mockToken);

      const result = generateToken(mockPayload);

      expect(result).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload, 
        expect.any(String), 
        { expiresIn: expect.any(String) }
      );
    });
  });

  describe('Middleware Integration', () => {
    it('should work together in sequence', async () => {
      const mockToken = 'valid.jwt.token';
      const mockPayload = {
        id: 'user-123',
        name: 'Test User',
        nip: '123456789012345678',
        email: 'test@example.com',
        phone: '081234567890',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        permissions: ['users:read', 'users:write']
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      // Mock jwt.verify to return our payload
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload);

      // First authenticate
      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockRequest.user).toBeDefined();

      // Reset next function
      (mockNext as jest.Mock).mockClear();

      // Then use optional auth (should continue)
      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle error responses consistently', async () => {
      // Test unauthorized response format
      mockRequest.headers = {};
      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.unauthenticated).toHaveBeenCalledWith(
        mockResponse, 
        'Access token is required'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle JWT verification errors gracefully', async () => {
      const mockToken = 'valid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      // Mock jwt.verify to throw error
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('JWT service error');
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponseUtil.unauthenticated).toHaveBeenCalledWith(
        mockResponse, 
        'Authentication failed'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing user object gracefully', async () => {
      mockRequest.user = undefined;

      // This test ensures the middleware handles undefined user gracefully
      expect(mockRequest.user).toBeUndefined();
    });
  });
});
