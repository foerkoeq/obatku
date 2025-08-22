/**
 * User Management Service
 * Handles user CRUD operations, role management, and permissions
 */

import { api, API_ENDPOINTS, ListResponse, SingleResponse, MessageResponse, ApiServiceError, QueryBuilder, PaginationParams, SearchFilterParams } from './api';

// User interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
  address?: string;
  permissions?: string[];
}

export interface UpdateUserRequest {
  name?: string;
  role?: string;
  phone?: string;
  address?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface UserPermission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
  isActive: boolean;
}

export interface UserFilters extends SearchFilterParams {
  role?: string;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface RoleFilters extends SearchFilterParams {
  isActive?: boolean;
}

/**
 * User Management Service Class
 */
class UserService {
  /**
   * Get all users with pagination and filters
   */
  async getUsers(
    pagination?: PaginationParams,
    filters?: UserFilters
  ): Promise<ListResponse<User>> {
    try {
      const queryBuilder = new QueryBuilder();
      
      if (pagination) {
        queryBuilder.addPagination(pagination.page, pagination.limit);
      }
      
      if (filters) {
        queryBuilder.addSearch(filters.search);
        queryBuilder.addSort(filters.sort, filters.order);
        queryBuilder.addFilter(filters.filter);
        queryBuilder.addDateRange(filters.dateFrom, filters.dateTo);
        queryBuilder.addStatus(filters.isActive ? 'active' : 'inactive');
        if (filters.role) {
          queryBuilder.addFilter({ role: filters.role });
        }
      }
      
      const queryString = queryBuilder.build();
      const response = await api.get<User[]>(`${API_ENDPOINTS.USERS.BASE}${queryString}`);
      
      return response as ListResponse<User>;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<SingleResponse<User>> {
    try {
      const response = await api.get<User>(`${API_ENDPOINTS.USERS.BASE}/${userId}`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserRequest): Promise<SingleResponse<User>> {
    try {
      const response = await api.post<User>(API_ENDPOINTS.USERS.BASE, userData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<SingleResponse<User>> {
    try {
      const response = await api.put<User>(`${API_ENDPOINTS.USERS.BASE}/${userId}`, userData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<MessageResponse> {
    try {
      const response = await api.delete<{ message: string }>(`${API_ENDPOINTS.USERS.BASE}/${userId}`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Activate/deactivate user
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<SingleResponse<User>> {
    try {
      const response = await api.patch<User>(`${API_ENDPOINTS.USERS.BASE}/${userId}/status`, {
        isActive,
      });
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId: string, newPassword: string): Promise<MessageResponse> {
    try {
      const response = await api.post<{ message: string }>(
        `${API_ENDPOINTS.USERS.BASE}/${userId}/reset-password`,
        { newPassword }
      );
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get all roles
   */
  async getRoles(filters?: RoleFilters): Promise<ListResponse<UserRole>> {
    try {
      const queryBuilder = new QueryBuilder();
      
      if (filters) {
        queryBuilder.addSearch(filters.search);
        queryBuilder.addSort(filters.sort, filters.order);
        queryBuilder.addFilter(filters.filter);
        if (filters.isActive !== undefined) {
          queryBuilder.addStatus(filters.isActive ? 'active' : 'inactive');
        }
      }
      
      const queryString = queryBuilder.build();
      const response = await api.get<UserRole[]>(`${API_ENDPOINTS.USERS.ROLES}${queryString}`);
      
      return response as ListResponse<UserRole>;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string): Promise<SingleResponse<UserRole>> {
    try {
      const response = await api.get<UserRole>(`${API_ENDPOINTS.USERS.ROLES}/${roleId}`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Create new role
   */
  async createRole(roleData: CreateRoleRequest): Promise<SingleResponse<UserRole>> {
    try {
      const response = await api.post<UserRole>(API_ENDPOINTS.USERS.ROLES, roleData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Update role
   */
  async updateRole(roleId: string, roleData: UpdateRoleRequest): Promise<SingleResponse<UserRole>> {
    try {
      const response = await api.put<UserRole>(`${API_ENDPOINTS.USERS.ROLES}/${roleId}`, roleData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Delete role
   */
  async deleteRole(roleId: string): Promise<MessageResponse> {
    try {
      const response = await api.delete<{ message: string }>(`${API_ENDPOINTS.USERS.ROLES}/${roleId}`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<ListResponse<UserPermission>> {
    try {
      const response = await api.get<UserPermission[]>(API_ENDPOINTS.USERS.PERMISSIONS);
      return response as ListResponse<UserPermission>;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get permissions by module
   */
  async getPermissionsByModule(module: string): Promise<ListResponse<UserPermission>> {
    try {
      const response = await api.get<UserPermission[]>(
        `${API_ENDPOINTS.USERS.PERMISSIONS}?module=${module}`
      );
      return response as ListResponse<UserPermission>;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Bulk update user status
   */
  async bulkUpdateUserStatus(userIds: string[], isActive: boolean): Promise<MessageResponse> {
    try {
      const response = await api.post<{ message: string }>(
        `${API_ENDPOINTS.USERS.BASE}/bulk-status`,
        { userIds, isActive }
      );
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(userIds: string[]): Promise<MessageResponse> {
    try {
      const response = await api.post<{ message: string }>(
        `${API_ENDPOINTS.USERS.BASE}/bulk-delete`,
        { userIds }
      );
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Export users to Excel/CSV
   */
  async exportUsers(format: 'excel' | 'csv', filters?: UserFilters): Promise<Blob> {
    try {
      const queryBuilder = new QueryBuilder();
      
      if (filters) {
        queryBuilder.addSearch(filters.search);
        queryBuilder.addFilter(filters.filter);
        queryBuilder.addDateRange(filters.dateFrom, filters.dateTo);
        if (filters.role) {
          queryBuilder.addFilter({ role: filters.role });
        }
        if (filters.isActive !== undefined) {
          queryBuilder.addStatus(filters.isActive ? 'active' : 'inactive');
        }
      }
      
      queryBuilder.addFilter({ format });
      const queryString = queryBuilder.build();
      
      const response = await fetch(`${API_ENDPOINTS.USERS.BASE}/export${queryString}`, {
        headers: {
          'Authorization': `Bearer ${api.getAccessToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      return await response.blob();
    } catch (error) {
      throw new ApiServiceError(
        error instanceof Error ? error.message : 'Export failed',
        500,
        'EXPORT_FAILED'
      );
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<SingleResponse<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<string, number>;
    recentRegistrations: number;
  }>> {
    try {
      const response = await api.get(`${API_ENDPOINTS.USERS.BASE}/stats`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }
}

// Export singleton instance
export const userService = new UserService();

// Export types
export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
  CreateRoleRequest,
  UpdateRoleRequest,
  UserPermission,
  UserFilters,
  RoleFilters,
};
