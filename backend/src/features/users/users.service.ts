/**
 * User Management Module - Service Layer
 * 
 * Contains business logic for user management operations
 * Handles password generation, validation, and user operations
 */

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from './users.repository';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserResponse, 
  UserListResponse, 
  UserQuery, 
  UserStats,
  UserRole,
  UserStatus,
  CreateUserData,
  UpdateUserData,
  PasswordGenerationResult,
  UserFilters
} from './users.types';
// TODO: Create proper error handling utilities
// import { AppError } from '../../shared/utils/errors';
// import { ErrorCode } from '../../shared/constants/error-codes';

// Temporary error classes for development
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

const ErrorCode = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  DUPLICATE_NIP: 'DUPLICATE_NIP',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR'
} as const;

export class UserService {
  private userRepository: UserRepository;
  private saltRounds: number = 12;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Generate password from birth date (DDMMYYYY format)
   */
  private generatePasswordFromBirthDate(birthDate: Date): string {
    const day = birthDate.getDate().toString().padStart(2, '0');
    const month = (birthDate.getMonth() + 1).toString().padStart(2, '0');
    const year = birthDate.getFullYear().toString();
    
    return `${day}${month}${year}`;
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Generate password and hash from birth date
   */
  private async generatePasswordAndHash(birthDate: Date): Promise<PasswordGenerationResult> {
    const password = this.generatePasswordFromBirthDate(birthDate);
    const hash = await this.hashPassword(password);
    
    return { password, hash };
  }

  /**
   * Convert User entity to UserResponse
   */
  private mapToUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      nip: user.nip,
      phone: user.phone,
      role: user.role,
      status: user.status,
      birth_date: user.birth_date.toISOString().split('T')[0],
      avatar_url: user.avatar_url || undefined,
      last_login: user.last_login?.toISOString(),
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
      created_by: user.created_by
    };
  }

  /**
   * Convert User entity to UserListResponse
   */
  private mapToUserListResponse(user: User): UserListResponse {
    return {
      id: user.id,
      name: user.name,
      nip: user.nip,
      role: user.role,
      status: user.status,
      last_login: user.last_login?.toISOString(),
      created_at: user.created_at.toISOString()
    };
  }

  /**
   * Get users with pagination and filtering
   */
  async getUsers(query: UserQuery): Promise<{
    users: UserListResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page = 1, limit = 20, search, role, status, sortBy = 'name', sortOrder = 'asc' } = query;

    // Convert string literals to enum values
    const filters: UserFilters = { 
      search, 
      role: role ? this.convertToUserRole(role) : undefined, 
      status: status ? this.convertToUserStatus(status) : undefined 
    };
    const sortOptions = { sortBy, sortOrder };

    const { users, total } = await this.userRepository.findMany(filters, sortOptions, page, limit);
    
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => this.mapToUserListResponse(user)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Convert string literal to UserRole enum
   */
  private convertToUserRole(role: string): UserRole {
    switch (role) {
      case 'admin': return UserRole.ADMIN;
      case 'ppl': return UserRole.PPL;
      case 'dinas': return UserRole.DINAS;
      case 'popt': return UserRole.POPT;
      default: throw new AppError(`Invalid role: ${role}`, 400, ErrorCode.VALIDATION_ERROR);
    }
  }

  /**
   * Convert string literal to UserStatus enum
   */
  private convertToUserStatus(status: string): UserStatus {
    switch (status) {
      case 'active': return UserStatus.ACTIVE;
      case 'inactive': return UserStatus.INACTIVE;
      default: throw new AppError(`Invalid status: ${status}`, 400, ErrorCode.VALIDATION_ERROR);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    }

    return this.mapToUserResponse(user);
  }

  /**
   * Get user by NIP (for authentication)
   */
  async getUserByNip(nip: string): Promise<User | null> {
    return await this.userRepository.findByNip(nip);
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserRequest, createdBy?: string): Promise<UserResponse> {
    // Check if NIP already exists
    const nipExists = await this.userRepository.nipExists(userData.nip);
    if (nipExists) {
      throw new AppError('NIP already exists', 409, ErrorCode.DUPLICATE_ENTRY);
    }

    // Check if email already exists (if provided)
    if (userData.email) {
      const emailExists = await this.userRepository.emailExists(userData.email);
      if (emailExists) {
        throw new AppError('Email already exists', 409, ErrorCode.DUPLICATE_ENTRY);
      }
    }

    // Generate password from birth date
    const birthDate = new Date(userData.birth_date);
    const { hash: passwordHash } = await this.generatePasswordAndHash(birthDate);

    // Create user data
    const createUserData: CreateUserData = {
      id: uuidv4(),
      name: userData.name,
      email: userData.email,
      nip: userData.nip,
      phone: userData.phone,
      password_hash: passwordHash,
      role: this.convertToUserRole(userData.role),
      status: UserStatus.ACTIVE,
      birth_date: birthDate,
      avatar_url: userData.avatar_url,
      created_by: createdBy
    };

    const user = await this.userRepository.create(createUserData);
    
    return this.mapToUserResponse(user);
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: UpdateUserRequest): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    }

    // Check if email already exists (if provided and different from current)
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.userRepository.emailExists(userData.email, id);
      if (emailExists) {
        throw new AppError('Email already exists', 409, ErrorCode.DUPLICATE_ENTRY);
      }
    }

    // Prepare update data
    const updateData: UpdateUserData = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role ? this.convertToUserRole(userData.role) : undefined,
      status: userData.status ? this.convertToUserStatus(userData.status) : undefined,
      birth_date: userData.birth_date ? new Date(userData.birth_date) : undefined,
      avatar_url: userData.avatar_url
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof UpdateUserData] === undefined) {
        delete updateData[key as keyof UpdateUserData];
      }
    });

    const updatedUser = await this.userRepository.update(id, updateData);
    
    return this.mapToUserResponse(updatedUser);
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    }

    // Don't allow deleting the last admin user
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.userRepository.countByFilters({ role: UserRole.ADMIN });
      if (adminCount <= 1) {
        throw new AppError('Cannot delete the last admin user', 400, ErrorCode.BUSINESS_LOGIC_ERROR);
      }
    }

    await this.userRepository.delete(id);
  }

  /**
   * Reset user password
   */
  async resetPassword(id: string, newPassword?: string, resetToBirthDate: boolean = false): Promise<{ 
    message: string; 
    temporaryPassword?: string; 
  }> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    }

    let passwordHash: string;
    let temporaryPassword: string | undefined;

    if (resetToBirthDate) {
      // Reset to birth date password
      const { password, hash } = await this.generatePasswordAndHash(user.birth_date);
      passwordHash = hash;
      temporaryPassword = password;
    } else if (newPassword) {
      // Use provided password
      passwordHash = await this.hashPassword(newPassword);
    } else {
      throw new AppError('Either newPassword or resetToBirthDate must be provided', 400, ErrorCode.VALIDATION_ERROR);
    }

    await this.userRepository.updatePassword(id, passwordHash);

    return {
      message: 'Password reset successfully',
      temporaryPassword
    };
  }

  /**
   * Change user role
   */
  async changeUserRole(id: string, newRole: UserRole): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    }

    // Don't allow changing role of the last admin user
    if (user.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
      const adminCount = await this.userRepository.countByFilters({ role: UserRole.ADMIN });
      if (adminCount <= 1) {
        throw new AppError('Cannot change role of the last admin user', 400, ErrorCode.BUSINESS_LOGIC_ERROR);
      }
    }

    const updatedUser = await this.userRepository.updateRole(id, newRole);
    
    return this.mapToUserResponse(updatedUser);
  }

  /**
   * Toggle user status (active/inactive)
   */
  async toggleUserStatus(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    }

    // Don't allow deactivating the last admin user
    if (user.role === UserRole.ADMIN && user.status === UserStatus.ACTIVE) {
      const activeAdminCount = await this.userRepository.countByFilters({ 
        role: UserRole.ADMIN, 
        status: UserStatus.ACTIVE 
      });
      if (activeAdminCount <= 1) {
        throw new AppError('Cannot deactivate the last active admin user', 400, ErrorCode.BUSINESS_LOGIC_ERROR);
      }
    }

    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    const updatedUser = await this.userRepository.updateStatus(id, newStatus);
    
    return this.mapToUserResponse(updatedUser);
  }

  /**
   * Verify user password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Update user last login
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.updateLastLogin(id);
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    return await this.userRepository.getStats();
  }

  /**
   * Check if NIP exists
   */
  async checkNipExists(nip: string): Promise<boolean> {
    return await this.userRepository.nipExists(nip);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole): Promise<UserListResponse[]> {
    const users = await this.userRepository.findByRole(role);
    return users.map(user => this.mapToUserListResponse(user));
  }

  /**
   * Get active users
   */
  async getActiveUsers(): Promise<UserListResponse[]> {
    const users = await this.userRepository.findActiveUsers();
    return users.map(user => this.mapToUserListResponse(user));
  }

  /**
   * Get recently created users
   */
  async getRecentUsers(days: number = 7): Promise<UserListResponse[]> {
    const users = await this.userRepository.findRecentUsers(days);
    return users.map(user => this.mapToUserListResponse(user));
  }

  /**
   * Bulk create users
   */
  async bulkCreateUsers(usersData: CreateUserRequest[], createdBy?: string): Promise<UserResponse[]> {
    // Validate all NIPs are unique
    const nips = usersData.map(user => user.nip);
    const uniqueNips = new Set(nips);
    
    if (nips.length !== uniqueNips.size) {
      throw new AppError('Duplicate NIPs found in the request', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Check if any NIP already exists
    for (const nip of nips) {
      const exists = await this.userRepository.nipExists(nip);
      if (exists) {
        throw new AppError(`NIP ${nip} already exists`, 409, ErrorCode.DUPLICATE_ENTRY);
      }
    }

    // Prepare user data
    const createUsersData: CreateUserData[] = [];
    
    for (const userData of usersData) {
      const birthDate = new Date(userData.birth_date);
      const { hash: passwordHash } = await this.generatePasswordAndHash(birthDate);

      createUsersData.push({
        id: uuidv4(),
        name: userData.name,
        email: userData.email,
        nip: userData.nip,
        phone: userData.phone,
        password_hash: passwordHash,
        role: this.convertToUserRole(userData.role),
        status: UserStatus.ACTIVE,
        birth_date: birthDate,
        avatar_url: userData.avatar_url,
        created_by: createdBy
      });
    }

    const users = await this.userRepository.bulkCreate(createUsersData);
    
    return users.map(user => this.mapToUserResponse(user));
  }
}
