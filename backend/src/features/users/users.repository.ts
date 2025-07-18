/**
 * User Management Module - Repository Layer
 * 
 * Handles all database operations for user management
 * Uses Prisma ORM with MySQL database
 */

import { PrismaClient } from '@prisma/client';
import { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  UserFilters, 
  UserSortOptions, 
  UserStats,
  UserRole,
  UserStatus
} from './users.types';

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Map Prisma User to User interface
   */
  private mapPrismaUserToUser(prismaUser: any): User {
    return {
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email || undefined,
      nip: prismaUser.nip,
      phone: prismaUser.phone,
      password_hash: prismaUser.passwordHash,
      role: prismaUser.role,
      status: prismaUser.status,
      birth_date: prismaUser.birthDate,
      avatar_url: prismaUser.avatarUrl || undefined,
      last_login: prismaUser.lastLogin || undefined,
      created_at: prismaUser.createdAt,
      updated_at: prismaUser.updatedAt,
      created_by: prismaUser.createdBy || undefined
    };
  }

  /**
   * Map CreateUserData to Prisma input
   */
  private mapCreateUserDataToPrisma(userData: CreateUserData): any {
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      nip: userData.nip,
      phone: userData.phone,
      passwordHash: userData.password_hash,
      role: userData.role,
      status: userData.status,
      birthDate: userData.birth_date,
      avatarUrl: userData.avatar_url,
      createdBy: userData.created_by
    };
  }

  /**
   * Find all users with pagination and filtering
   */
  async findMany(
    filters: UserFilters = {},
    sortOptions: UserSortOptions = { sortBy: 'created_at', sortOrder: 'desc' },
    page: number = 1,
    limit: number = 20
  ): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;
    
    // Build where clause
    const whereClause: any = {};
    
    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search } },
        { nip: { contains: filters.search } }
      ];
    }
    
    if (filters.role) {
      whereClause.role = filters.role as any;
    }
    
    if (filters.status) {
      whereClause.status = filters.status as any;
    }

    // Build order clause - map to Prisma field names
    const orderByField = sortOptions.sortBy === 'created_at' ? 'createdAt' : 
                        sortOptions.sortBy === 'last_login' ? 'lastLogin' : 
                        sortOptions.sortBy;
    
    const orderBy = {
      [orderByField]: sortOptions.sortOrder
    };

    // Execute queries
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.user.count({
        where: whereClause
      })
    ]);

    // Map Prisma results to User interface
    const mappedUsers: User[] = users.map(user => this.mapPrismaUserToUser(user));

    return { users: mappedUsers, total };
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });
    
    return user ? this.mapPrismaUserToUser(user) : null;
  }

  /**
   * Find user by NIP (for authentication)
   */
  async findByNip(nip: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { nip }
    });
    
    return user ? this.mapPrismaUserToUser(user) : null;
  }

  /**
   * Check if NIP already exists
   */
  async nipExists(nip: string, excludeId?: string): Promise<boolean> {
    const whereClause: any = { nip };
    
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const user = await this.prisma.user.findFirst({
      where: whereClause,
      select: { id: true }
    });

    return !!user;
  }

  /**
   * Check if email already exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const whereClause: any = { email };
    
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const user = await this.prisma.user.findFirst({
      where: whereClause,
      select: { id: true }
    });

    return !!user;
  }

  /**
   * Create new user
   */
  async create(userData: CreateUserData): Promise<User> {
    const prismaData = this.mapCreateUserDataToPrisma(userData);
    const user = await this.prisma.user.create({
      data: prismaData
    });
    
    return this.mapPrismaUserToUser(user);
  }

  /**
   * Update user by ID
   */
  async update(id: string, userData: UpdateUserData): Promise<User> {
    const updateData: any = {};
    
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.phone !== undefined) updateData.phone = userData.phone;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.status !== undefined) updateData.status = userData.status;
    if (userData.birth_date !== undefined) updateData.birthDate = userData.birth_date;
    if (userData.avatar_url !== undefined) updateData.avatarUrl = userData.avatar_url;
    
    // Always update the updatedAt field
    updateData.updatedAt = new Date();
    
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData
    });
    
    return this.mapPrismaUserToUser(user);
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, passwordHash: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        updatedAt: new Date()
      }
    });
    
    return this.mapPrismaUserToUser(user);
  }

  /**
   * Update user role
   */
  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        role: role as any,
        updatedAt: new Date()
      }
    });
    
    return this.mapPrismaUserToUser(user);
  }

  /**
   * Update user status
   */
  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date()
      }
    });
    
    return this.mapPrismaUserToUser(user);
  }

  /**
   * Update last login time
   */
  async updateLastLogin(id: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        lastLogin: new Date()
      }
    });
    
    return this.mapPrismaUserToUser(user);
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }

  /**
   * Soft delete user (set status to inactive)
   */
  async softDelete(id: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        status: 'inactive' as any,
        updatedAt: new Date()
      }
    });
    
    return this.mapPrismaUserToUser(user);
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<UserStats> {
    const [
      total,
      activeUsers,
      inactiveUsers,
      adminCount,
      pplCount,
      dinasCount,
      poptCount,
      recentLogins
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'active' as any } }),
      this.prisma.user.count({ where: { status: 'inactive' as any } }),
      this.prisma.user.count({ where: { role: 'admin' as any } }),
      this.prisma.user.count({ where: { role: 'ppl' as any } }),
      this.prisma.user.count({ where: { role: 'dinas' as any } }),
      this.prisma.user.count({ where: { role: 'popt' as any } }),
      this.prisma.user.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }
      })
    ]);

    return {
      total,
      active: activeUsers,
      inactive: inactiveUsers,
      by_role: {
        admin: adminCount,
        ppl: pplCount,
        dinas: dinasCount,
        popt: poptCount
      },
      recent_logins: recentLogins
    };
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { role: role as any },
      orderBy: { name: 'asc' }
    });
    
    return users.map(user => this.mapPrismaUserToUser(user));
  }

  /**
   * Find active users
   */
  async findActiveUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { status: 'active' as any },
      orderBy: { name: 'asc' }
    });
    
    return users.map(user => this.mapPrismaUserToUser(user));
  }

  /**
   * Find recently created users
   */
  async findRecentUsers(days: number = 7): Promise<User[]> {
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const users = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: dateFrom
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return users.map(user => this.mapPrismaUserToUser(user));
  }

  /**
   * Find users with recent login activity
   */
  async findRecentlyActiveUsers(days: number = 30): Promise<User[]> {
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const users = await this.prisma.user.findMany({
      where: {
        lastLogin: {
          gte: dateFrom
        }
      },
      orderBy: { lastLogin: 'desc' }
    });
    
    return users.map(user => this.mapPrismaUserToUser(user));
  }

  /**
   * Bulk create users
   */
  async bulkCreate(usersData: CreateUserData[]): Promise<User[]> {
    const prismaData = usersData.map(userData => this.mapCreateUserDataToPrisma(userData));
    
    const result = await this.prisma.$transaction(
      prismaData.map(data => 
        this.prisma.user.create({
          data
        })
      )
    );

    return result.map(user => this.mapPrismaUserToUser(user));
  }

  /**
   * Count users by filters
   */
  async countByFilters(filters: UserFilters): Promise<number> {
    const whereClause: any = {};
    
    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search } },
        { nip: { contains: filters.search } }
      ];
    }
    
    if (filters.role) {
      whereClause.role = filters.role as any;
    }
    
    if (filters.status) {
      whereClause.status = filters.status as any;
    }

    return await this.prisma.user.count({
      where: whereClause
    });
  }
}
