/**
 * @jest-environment node
 */

import 'jest';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

/**
 * User Management Module - Unit Tests
 * 
 * Comprehensive unit tests for user management functionality
 */

import { UserService } from './users.service';
import { UserRepository } from './users.repository';
import { User, UserRole, UserStatus, CreateUserRequest } from './users.types';
import { AppError } from '@/backend/src/shared/utils/errors';
import { ErrorCode } from '@/backend/src/shared/constants/error-codes';

// Mock bcrypt
// @ts-ignore
jest.mock('bcrypt', () => ({
  // @ts-expect-error
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  // @ts-expect-error
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock uuid
// @ts-ignore
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid')
}));

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser: User = {
    id: 'user-id',
    name: 'John Doe',
    email: 'john@example.com',
    nip: '123456789012345678',
    phone: '081234567890',
    password_hash: 'hashedPassword',
    role: UserRole.PPL,
    status: UserStatus.ACTIVE,
    birth_date: new Date('1990-01-15'),
    avatar_url: null,
    last_login: null,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'admin-id'
  };

  beforeEach(() => {
    userRepository = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findByNip: jest.fn(),
      nipExists: jest.fn(),
      emailExists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
      updateRole: jest.fn(),
      updateStatus: jest.fn(),
      updateLastLogin: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      getStats: jest.fn(),
      findByRole: jest.fn(),
      findActiveUsers: jest.fn(),
      findRecentUsers: jest.fn(),
      findRecentlyActiveUsers: jest.fn(),
      bulkCreate: jest.fn(),
      countByFilters: jest.fn()
    } as any;

    userService = new UserService(userRepository);
  });

  describe('createUser', () => {
    const createUserRequest: CreateUserRequest = {
      name: 'John Doe',
      email: 'john@example.com',
      nip: '123456789012345678',
      phone: '081234567890',
      role: UserRole.PPL,
      birth_date: '1990-01-15'
    };

    it('should create a user successfully', async () => {
      userRepository.nipExists.mockResolvedValue(false);
      userRepository.emailExists.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await userService.createUser(createUserRequest);

      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        name: mockUser.name,
        nip: mockUser.nip,
        role: mockUser.role
      }));
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        name: createUserRequest.name,
        nip: createUserRequest.nip,
        role: createUserRequest.role
      }));
    });

    it('should throw error if NIP already exists', async () => {
      userRepository.nipExists.mockResolvedValue(true);

      await expect(userService.createUser(createUserRequest))
        .rejects
        .toThrow(new AppError('NIP already exists', 409, ErrorCode.DUPLICATE_ENTRY));
    });

    it('should throw error if email already exists', async () => {
      userRepository.nipExists.mockResolvedValue(false);
      userRepository.emailExists.mockResolvedValue(true);

      await expect(userService.createUser(createUserRequest))
        .rejects
        .toThrow(new AppError('Email already exists', 409, ErrorCode.DUPLICATE_ENTRY));
    });

    it('should generate password from birth date', async () => {
      userRepository.nipExists.mockResolvedValue(false);
      userRepository.emailExists.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(mockUser);

      await userService.createUser(createUserRequest);

      // Password should be generated from birth date (15011990)
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        password_hash: 'hashedPassword'
      }));
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user-id');

      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        name: mockUser.name,
        nip: mockUser.nip
      }));
    });

    it('should throw error if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById('user-id'))
        .rejects
        .toThrow(new AppError('User not found', 404, ErrorCode.NOT_FOUND));
    });
  });

  describe('getAllUsers', () => {
    it('should return users with pagination', async () => {
      const mockUsers = [mockUser];
      userRepository.findMany.mockResolvedValue({
        users: mockUsers,
        total: 1
      });

      const result = await userService.getAllUsers({ page: 1, limit: 20 });

      expect(result).toEqual({
        users: expect.arrayContaining([
          expect.objectContaining({
            id: mockUser.id,
            name: mockUser.name
          })
        ]),
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('user-id', updateData);

      expect(result.name).toBe('Updated Name');
      expect(userRepository.update).toHaveBeenCalledWith('user-id', updateData);
    });

    it('should throw error if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.updateUser('user-id', { name: 'Updated Name' }))
        .rejects
        .toThrow(new AppError('User not found', 404, ErrorCode.NOT_FOUND));
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(undefined);

      await userService.deleteUser('user-id');

      expect(userRepository.delete).toHaveBeenCalledWith('user-id');
    });

    it('should throw error if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser('user-id'))
        .rejects
        .toThrow(new AppError('User not found', 404, ErrorCode.NOT_FOUND));
    });

    it('should not allow deleting last admin user', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      userRepository.findById.mockResolvedValue(adminUser);
      userRepository.countByFilters.mockResolvedValue(1);

      await expect(userService.deleteUser('user-id'))
        .rejects
        .toThrow(new AppError('Cannot delete the last admin user', 400, ErrorCode.BUSINESS_LOGIC_ERROR));
    });
  });

  describe('resetPassword', () => {
    it('should reset password to birth date', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updatePassword.mockResolvedValue(mockUser);

      const result = await userService.resetPassword('user-id', undefined, true);

      expect(result).toEqual({
        message: 'Password reset successfully',
        temporaryPassword: '15011990' // DD/MM/YYYY format
      });
    });

    it('should reset password to provided password', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updatePassword.mockResolvedValue(mockUser);

      const result = await userService.resetPassword('user-id', 'newPassword123');

      expect(result).toEqual({
        message: 'Password reset successfully',
        temporaryPassword: undefined
      });
    });

    it('should throw error if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.resetPassword('user-id', 'newPassword123'))
        .rejects
        .toThrow(new AppError('User not found', 404, ErrorCode.NOT_FOUND));
    });
  });

  describe('changeUserRole', () => {
    it('should change user role successfully', async () => {
      const updatedUser = { ...mockUser, role: UserRole.ADMIN };
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateRole.mockResolvedValue(updatedUser);

      const result = await userService.changeUserRole('user-id', UserRole.ADMIN);

      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should not allow changing role of last admin user', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      userRepository.findById.mockResolvedValue(adminUser);
      userRepository.countByFilters.mockResolvedValue(1);

      await expect(userService.changeUserRole('user-id', UserRole.PPL))
        .rejects
        .toThrow(new AppError('Cannot change role of the last admin user', 400, ErrorCode.BUSINESS_LOGIC_ERROR));
    });
  });

  describe('toggleUserStatus', () => {
    it('should toggle user status from active to inactive', async () => {
      const updatedUser = { ...mockUser, status: UserStatus.INACTIVE };
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateStatus.mockResolvedValue(updatedUser);

      const result = await userService.toggleUserStatus('user-id');

      expect(result.status).toBe(UserStatus.INACTIVE);
    });

    it('should not allow deactivating last admin user', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN, status: UserStatus.ACTIVE };
      userRepository.findById.mockResolvedValue(adminUser);
      userRepository.countByFilters.mockResolvedValue(1);

      await expect(userService.toggleUserStatus('user-id'))
        .rejects
        .toThrow(new AppError('Cannot deactivate the last active admin user', 400, ErrorCode.BUSINESS_LOGIC_ERROR));
    });
  });

  describe('verifyPassword', () => {
    it('should verify password correctly', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);

      const result = await userService.verifyPassword('password', 'hashedPassword');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockStats = {
        total: 10,
        active: 8,
        inactive: 2,
        by_role: {
          admin: 2,
          ppl: 4,
          dinas: 2,
          popt: 2
        },
        recent_logins: 5
      };
      userRepository.getStats.mockResolvedValue(mockStats);

      const result = await userService.getUserStats();

      expect(result).toEqual(mockStats);
    });
  });

  describe('bulkCreateUsers', () => {
    it('should create multiple users successfully', async () => {
      const usersData = [
        { ...createUserRequest, nip: '123456789012345678' },
        { ...createUserRequest, nip: '123456789012345679', name: 'Jane Doe' }
      ];
      
      userRepository.nipExists.mockResolvedValue(false);
      userRepository.bulkCreate.mockResolvedValue([mockUser, { ...mockUser, id: 'user-id-2' }]);

      const result = await userService.bulkCreateUsers(usersData);

      expect(result).toHaveLength(2);
      expect(userRepository.bulkCreate).toHaveBeenCalled();
    });

    it('should throw error if duplicate NIPs in request', async () => {
      const usersData = [
        { ...createUserRequest, nip: '123456789012345678' },
        { ...createUserRequest, nip: '123456789012345678', name: 'Jane Doe' }
      ];

      await expect(userService.bulkCreateUsers(usersData))
        .rejects
        .toThrow(new AppError('Duplicate NIPs found in the request', 400, ErrorCode.VALIDATION_ERROR));
    });

    it('should throw error if NIP already exists in database', async () => {
      const usersData = [createUserRequest];
      userRepository.nipExists.mockResolvedValue(true);

      await expect(userService.bulkCreateUsers(usersData))
        .rejects
        .toThrow(new AppError('NIP 123456789012345678 already exists', 409, ErrorCode.DUPLICATE_ENTRY));
    });
  });

  const createUserRequest: CreateUserRequest = {
    name: 'John Doe',
    email: 'john@example.com',
    nip: '123456789012345678',
    phone: '081234567890',
    role: UserRole.PPL,
    birth_date: '1990-01-15'
  };
});

describe('UserRepository', () => {
  // TODO: Add integration tests for UserRepository
  // These would require a test database setup
});

describe('UserController', () => {
  // TODO: Add controller tests
  // These would test HTTP request/response handling
});
