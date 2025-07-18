/**
 * User Management Module - Controller Layer
 * 
 * Handles HTTP requests and responses for user management
 * Validates input, calls service methods, and returns formatted responses
 */

import { Request, Response, NextFunction } from 'express';
import { UserService } from './users.service';
import { 
  createUserSchema, 
  updateUserSchema, 
  userQuerySchema, 
  passwordResetSchema,
  roleUpdateSchema,
  statusUpdateSchema,
  bulkCreateUsersSchema
} from './users.validation';

// TODO: Import shared utilities (will be created in Phase 3)
// For now, use temporary implementations
const successResponse = (data: any, message: string = 'Success') => ({
  success: true,
  message,
  data
});

const AppError = class extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
  }
};

// Extend Request interface to include user info
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    nip: string;
  };
}

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * Get all users with pagination and filtering
   * GET /api/users
   */
  getAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate query parameters
      const validatedQuery = userQuerySchema.parse(req.query);
      
      const result = await this.userService.getAllUsers(validatedQuery, req.user?.id);
      
      return successResponse(res, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate user ID parameter
      const { id } = userIdSchema.parse(req.params);
      
      const user = await this.userService.getUserById(id);
      
      return successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new user (Admin only)
   * POST /api/users
   */
  createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validatedData = createUserSchema.parse(req.body);
      
      const user = await this.userService.createUser(validatedData, req.user?.id);
      
      return successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user (Admin only)
   * PUT /api/users/:id
   */
  updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate user ID parameter
      const { id } = userIdSchema.parse(req.params);
      
      // Validate request body
      const validatedData = updateUserSchema.parse(req.body);
      
      const user = await this.userService.updateUser(id, validatedData);
      
      return successResponse(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user (Admin only)
   * DELETE /api/users/:id
   */
  deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate user ID parameter
      const { id } = userIdSchema.parse(req.params);
      
      // Prevent users from deleting themselves
      if (req.user?.id === id) {
        throw new AppError('Cannot delete your own account', 400, ErrorCode.BUSINESS_LOGIC_ERROR);
      }
      
      await this.userService.deleteUser(id);
      
      return successResponse(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset user password (Admin only)
   * POST /api/users/:id/reset-password
   */
  resetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate user ID parameter
      const { id } = userIdSchema.parse(req.params);
      
      // Validate request body
      const validatedData = passwordResetSchema.parse(req.body);
      
      const result = await this.userService.resetPassword(
        id, 
        validatedData.new_password, 
        validatedData.reset_to_birth_date
      );
      
      return successResponse(res, result, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change user role (Admin only)
   * PUT /api/users/:id/role
   */
  changeUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate user ID parameter
      const { id } = userIdSchema.parse(req.params);
      
      // Validate request body
      const { role } = changeRoleSchema.parse(req.body);
      
      // Prevent users from changing their own role
      if (req.user?.id === id) {
        throw new AppError('Cannot change your own role', 400, ErrorCode.BUSINESS_LOGIC_ERROR);
      }
      
      const user = await this.userService.changeUserRole(id, role);
      
      return successResponse(res, user, 'User role changed successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Toggle user status (Admin only)
   * PUT /api/users/:id/status
   */
  toggleUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate user ID parameter
      const { id } = userIdSchema.parse(req.params);
      
      // Prevent users from changing their own status
      if (req.user?.id === id) {
        throw new AppError('Cannot change your own status', 400, ErrorCode.BUSINESS_LOGIC_ERROR);
      }
      
      const user = await this.userService.toggleUserStatus(id);
      
      return successResponse(res, user, 'User status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user statistics (Admin only)
   * GET /api/users/stats
   */
  getUserStats = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await this.userService.getUserStats();
      
      return successResponse(res, stats, 'User statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if NIP exists
   * GET /api/users/check-nip/:nip
   */
  checkNipExists = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { nip } = req.params;
      
      if (!nip || nip.length !== 18) {
        throw new AppError('Invalid NIP format', 400, ErrorCode.VALIDATION_ERROR);
      }
      
      const exists = await this.userService.checkNipExists(nip);
      
      return successResponse(res, { exists }, 'NIP check completed');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get users by role
   * GET /api/users/role/:role
   */
  getUsersByRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { role } = req.params;
      
      if (!['admin', 'ppl', 'dinas', 'popt'].includes(role)) {
        throw new AppError('Invalid role', 400, ErrorCode.VALIDATION_ERROR);
      }
      
      const users = await this.userService.getUsersByRole(role as any);
      
      return successResponse(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get active users
   * GET /api/users/active
   */
  getActiveUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getActiveUsers();
      
      return successResponse(res, users, 'Active users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get recently created users
   * GET /api/users/recent
   */
  getRecentUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      
      if (days < 1 || days > 365) {
        throw new AppError('Days must be between 1 and 365', 400, ErrorCode.VALIDATION_ERROR);
      }
      
      const users = await this.userService.getRecentUsers(days);
      
      return successResponse(res, users, 'Recent users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk create users (Admin only)
   * POST /api/users/bulk
   */
  bulkCreateUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const { users: usersData } = bulkCreateUserSchema.parse(req.body);
      
      const users = await this.userService.bulkCreateUsers(usersData, req.user?.id);
      
      return successResponse(res, users, `${users.length} users created successfully`, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user profile
   * GET /api/users/profile
   */
  getCurrentUserProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401, ErrorCode.AUTHENTICATION_ERROR);
      }
      
      const user = await this.userService.getUserById(req.user.id);
      
      return successResponse(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update current user profile
   * PUT /api/users/profile
   */
  updateCurrentUserProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401, ErrorCode.AUTHENTICATION_ERROR);
      }
      
      // Only allow updating certain fields for self-profile
      const allowedFields = ['name', 'email', 'phone', 'avatar_url'];
      const updateData: any = {};
      
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = req.body[key];
        }
      });
      
      // Validate the filtered data
      const validatedData = updateUserSchema.parse(updateData);
      
      const user = await this.userService.updateUser(req.user.id, validatedData);
      
      return successResponse(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
