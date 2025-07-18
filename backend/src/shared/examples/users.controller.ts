// ================================
// EXAMPLE: USERS CONTROLLER
// ================================

import { Response } from 'express';
import { BaseApiController } from '@/shared/controllers/base-api.controller';
import { ApiRequest } from '@/shared/types/api.types';
import { 
  ApiController,
  ApiSchema,
  ApiProperty
} from '@/shared/utils/api-documentation.util';

/**
 * User DTO Schema
 * @example
 * This class demonstrates how to create API documentation schemas
 */
@ApiSchema('User', 'User entity schema')
export class UserDto {
  @ApiProperty({
    type: 'string',
    description: 'User unique identifier',
    example: 'user_123'
  })
  id!: string;

  @ApiProperty({
    type: 'string',
    description: 'User full name',
    example: 'John Doe'
  })
  name!: string;

  @ApiProperty({
    type: 'string',
    format: 'email',
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  email!: string;

  @ApiProperty({
    type: 'string',
    description: 'User role',
    enum: ['admin', 'user', 'manager'],
    example: 'user'
  })
  role!: string;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'User creation date',
    readOnly: true
  })
  createdAt!: string;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'User last update date',
    readOnly: true
  })
  updatedAt!: string;
}

/**
 * Create User DTO Schema
 * @example
 * This class demonstrates how to create API documentation schemas for request bodies
 */
@ApiSchema('CreateUser', 'Schema for creating new user')
export class CreateUserDto {
  @ApiProperty({
    type: 'string',
    description: 'User full name',
    minLength: 2,
    maxLength: 100,
    example: 'John Doe'
  })
  name!: string;

  @ApiProperty({
    type: 'string',
    format: 'email',
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  email!: string;

  @ApiProperty({
    type: 'string',
    description: 'User password',
    minLength: 8,
    writeOnly: true
  })
  password!: string;

  @ApiProperty({
    type: 'string',
    description: 'User role',
    enum: ['admin', 'user', 'manager'],
    example: 'user'
  })
  role!: string;
}

/**
 * Users Controller
 * Demonstrates comprehensive API Foundation implementation
 */
@ApiController('Users', 'User management endpoints')
export class UsersController extends BaseApiController {
  constructor() {
    super({
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
        allowedLimits: [10, 20, 50, 100]
      },
      sorting: {
        allowedFields: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
        defaultField: 'createdAt',
        defaultDirection: 'desc' as any,
        fieldMapping: {
          'name': 'full_name', // Map API field to DB field
          'email': 'email_address'
        }
      },
      filtering: {
        allowedFields: ['id', 'name', 'email', 'role', 'createdAt'],
        fieldTypes: {
          'id': 'string',
          'name': 'string',
          'email': 'string',
          'role': 'string',
          'createdAt': 'date'
        },
        searchFields: ['name', 'email'],
        allowedOperators: {
          'role': ['eq', 'in', 'notIn'] as any[]
        }
      },
      defaultExcludes: ['password', 'passwordHash']
    });
  }

  /**
   * Get all users with pagination, sorting, and filtering
   */
  public getAllUsers = this.asyncHandler(async (req: ApiRequest, res: Response) => {
    const parsedQuery = this.parseQuery(req);
    const { pagination, include, exclude } = parsedQuery;

    // Build database query options
    const queryOptions = this.buildQueryOptions(parsedQuery);

    try {
      // Simulate database call (replace with actual implementation)
      const { users, total } = await this.fetchUsersFromDatabase(queryOptions);

      // Transform data based on includes/excludes
      const transformedUsers = this.transformData(users, include, exclude);

      return this.successPaginated(
        res,
        transformedUsers,
        total,
        pagination.page,
        pagination.limit,
        'Users retrieved successfully',
        {
          startTime: parsedQuery.meta.startTime,
          requestId: parsedQuery.meta.requestId
        }
      );
    } catch (error) {
      return this.internalError(
        res,
        'Failed to retrieve users',
        error as Error,
        {
          startTime: parsedQuery.meta.startTime,
          requestId: parsedQuery.meta.requestId
        }
      );
    }
  });

  /**
   * Get user by ID
   */
  public getUserById = this.asyncHandler(async (req: ApiRequest, res: Response) => {
    const { id } = req.params;
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string;

    try {
      const user = await this.findUserById(id);

      if (!user) {
        return this.notFound(res, 'User not found', {
          startTime,
          requestId
        });
      }

      // Transform data to exclude sensitive fields
      const transformedUser = this.transformData(user, [], this.config.defaultExcludes!);

      return this.success(
        res,
        transformedUser,
        'User retrieved successfully',
        { startTime, requestId }
      );
    } catch (error) {
      return this.internalError(
        res,
        'Failed to retrieve user',
        error as Error,
        { startTime, requestId }
      );
    }
  });

  /**
   * Create new user
   */
  public createUser = this.asyncHandler(async (req: ApiRequest, res: Response) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string;

    // Validate required fields
    if (!this.validateRequired(req, res, ['name', 'email', 'password', 'role'])) {
      return;
    }

    // Check authorization
    if (!this.authorize(req, res, ['users:create'])) {
      return;
    }

    try {
      const { name, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await this.findUserByEmail(email);
      if (existingUser) {
        return this.conflict(
          res,
          'User with this email already exists',
          { email },
          { startTime, requestId }
        );
      }

      // Create user (simulate database call)
      const newUser = await this.createUserInDatabase({
        name,
        email,
        password,
        role
      });

      // Transform data to exclude sensitive fields
      const transformedUser = this.transformData(newUser, [], this.config.defaultExcludes!);

      return this.created(
        res,
        transformedUser,
        'User created successfully',
        {
          startTime,
          requestId,
          location: `/users/${newUser.id}`
        }
      );
    } catch (error) {
      return this.internalError(
        res,
        'Failed to create user',
        error as Error,
        { startTime, requestId }
      );
    }
  });

  /**
   * Update user
   */
  public updateUser = this.asyncHandler(async (req: ApiRequest, res: Response) => {
    const { id } = req.params;
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string;

    // Check authorization
    if (!this.authorize(req, res, ['users:update'])) {
      return;
    }

    try {
      const user = await this.findUserById(id);
      if (!user) {
        return this.notFound(res, 'User not found', { startTime, requestId });
      }

      const updatedUser = await this.updateUserInDatabase(id, req.body);
      const transformedUser = this.transformData(updatedUser, [], this.config.defaultExcludes!);

      return this.success(
        res,
        transformedUser,
        'User updated successfully',
        { startTime, requestId }
      );
    } catch (error) {
      return this.internalError(
        res,
        'Failed to update user',
        error as Error,
        { startTime, requestId }
      );
    }
  });

  /**
   * Delete user
   */
  public deleteUser = this.asyncHandler(async (req: ApiRequest, res: Response) => {
    const { id } = req.params;
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string;

    // Check authorization
    if (!this.authorize(req, res, ['users:delete'])) {
      return;
    }

    try {
      const user = await this.findUserById(id);
      if (!user) {
        return this.notFound(res, 'User not found', { startTime, requestId });
      }

      await this.deleteUserFromDatabase(id);

      return this.noContent(res, { startTime, requestId });
    } catch (error) {
      return this.internalError(
        res,
        'Failed to delete user',
        error as Error,
        { startTime, requestId }
      );
    }
  });

  // Private helper methods (simulate database operations)
  private async fetchUsersFromDatabase(queryOptions: any): Promise<{ users: any[]; total: number }> {
    // Simulate database call with pagination, sorting, and filtering
    // Replace with actual Prisma/database implementation
    
    const mockUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return {
      users: mockUsers.slice(queryOptions.skip, queryOptions.skip + queryOptions.take),
      total: mockUsers.length
    };
  }

  private async findUserById(id: string): Promise<any> {
    // Simulate database call
    return {
      id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async findUserByEmail(_email: string): Promise<any> {
    // Simulate database call
    return null; // Return null if not found
  }

  private async createUserInDatabase(userData: any): Promise<any> {
    // Simulate database call
    return {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async updateUserInDatabase(id: string, userData: any): Promise<any> {
    // Simulate database call
    return {
      id,
      ...userData,
      updatedAt: new Date()
    };
  }

  private async deleteUserFromDatabase(id: string): Promise<void> {
    // Simulate database call
    console.log(`User ${id} deleted`);
  }
}

export default UsersController;
