/**
 * Authentication Service
 * Handles user authentication, token management, and user verification
 */

import { api, API_ENDPOINTS, SingleResponse, MessageResponse, ApiServiceError } from './api';
import tokenStorage from '@/lib/utils/token-storage';

// Authentication interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Authentication Service Class
 */
class AuthService {
  /**
   * User login
   */
  async login(credentials: LoginCredentials): Promise<SingleResponse<LoginResponse>> {
    try {
      const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
             // Store tokens
       if (response.data) {
         api.setToken(response.data.accessToken);
         
         // Store tokens using token storage utility
         tokenStorage.setAccessToken(response.data.accessToken);
         tokenStorage.setRefreshToken(response.data.refreshToken);
         
         // Calculate and store expiry time
         const expiresAt = Date.now() + (response.data.expiresIn * 1000);
         tokenStorage.setTokenExpiry(expiresAt);
       }
      
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<MessageResponse> {
    try {
      const response = await api.post<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT);
      
             // Clear tokens
       api.clearToken();
       tokenStorage.clearAll();
      
      return response;
    } catch (error) {
             // Even if logout fails, clear local tokens
       api.clearToken();
       tokenStorage.clearAll();
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<SingleResponse<RefreshTokenResponse>> {
    try {
             const refreshToken = tokenStorage.getRefreshToken();
      
      if (!refreshToken) {
        throw new ApiServiceError('No refresh token available', 401, 'NO_REFRESH_TOKEN');
      }

      const response = await api.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken,
      });
      
               // Update tokens
         if (response.data) {
           api.setToken(response.data.accessToken);
           
           // Update tokens using token storage utility
           tokenStorage.setAccessToken(response.data.accessToken);
           tokenStorage.setRefreshToken(response.data.refreshToken);
           
           // Calculate and store expiry time
           const expiresAt = Date.now() + (response.data.expiresIn * 1000);
           tokenStorage.setTokenExpiry(expiresAt);
         }
      
      return response;
    } catch (error) {
             // Clear tokens on refresh failure
       api.clearToken();
       tokenStorage.clearAll();
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Verify current token
   */
  async verifyToken(): Promise<SingleResponse<UserProfile>> {
    try {
      const response = await api.get<UserProfile>(API_ENDPOINTS.AUTH.VERIFY);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<SingleResponse<UserProfile>> {
    try {
      const response = await api.get<UserProfile>(API_ENDPOINTS.USERS.PROFILE);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<SingleResponse<UserProfile>> {
    try {
      const response = await api.put<UserProfile>(API_ENDPOINTS.USERS.PROFILE, profileData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Change password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<MessageResponse> {
    try {
      const response = await api.post<{ message: string }>(
        `${API_ENDPOINTS.USERS.PROFILE}/change-password`,
        passwordData
      );
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(emailData: ForgotPasswordRequest): Promise<MessageResponse> {
    try {
      const response = await api.post<{ message: string }>(
        `${API_ENDPOINTS.AUTH.LOGIN}/forgot-password`,
        emailData
      );
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(resetData: ResetPasswordRequest): Promise<MessageResponse> {
    try {
      const response = await api.post<{ message: string }>(
        `${API_ENDPOINTS.AUTH.LOGIN}/reset-password`,
        resetData
      );
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return api.isAuthenticated();
  }

     /**
    * Get stored access token
    */
   getAccessToken(): string | null {
     return tokenStorage.getAccessToken();
   }

     /**
    * Get stored refresh token
    */
   getRefreshToken(): string | null {
     return tokenStorage.getRefreshToken();
   }

     /**
    * Clear all authentication data
    */
   clearAuth(): void {
     api.clearToken();
     tokenStorage.clearAll();
   }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export types
export type {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  UserProfile,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
};
