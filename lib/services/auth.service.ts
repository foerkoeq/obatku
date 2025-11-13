/**
 * Authentication Service
 * Handles user authentication, token management, and user verification
 */

import { api, API_ENDPOINTS, SingleResponse, MessageResponse, ApiServiceError } from './api';
import tokenStorage from '@/lib/utils/token-storage';

// Authentication interfaces
export interface LoginCredentials {
  nip: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    nip: string;
    email?: string;
    phone?: string;
    role: string;
    permissions: string[];
    avatar?: string;
    avatarUrl?: string;
    lastLogin?: string;
    status?: string;
    mustChangePassword?: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    tokenType: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  name: string;
  nip: string;
  email?: string;
  phone?: string;
  role: string;
  permissions: string[];
  avatar?: string;
  avatarUrl?: string;
  lastLogin?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
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
      const response = await api.post<{ user: LoginResponse['user']; tokens: LoginResponse['tokens'] }>(
        API_ENDPOINTS.AUTH.LOGIN, 
        credentials
      );
      
      // Transform response to match expected format
      if (response.data) {
        const loginResponse: LoginResponse = {
          user: response.data.user,
          tokens: response.data.tokens,
        };
        
        // Store tokens
        api.setToken(loginResponse.tokens.accessToken);
        
        // Store tokens using token storage utility
        tokenStorage.setAccessToken(loginResponse.tokens.accessToken);
        if (loginResponse.tokens.refreshToken) {
          tokenStorage.setRefreshToken(loginResponse.tokens.refreshToken);
        }
        
        // Calculate and store expiry time
        const expiresAt = Date.now() + (loginResponse.tokens.expiresIn * 1000);
        tokenStorage.setTokenExpiry(expiresAt);
        
        // Store user data
        tokenStorage.setUserData({
          id: loginResponse.user.id,
          email: loginResponse.user.email || '',
          name: loginResponse.user.name,
          role: loginResponse.user.role,
          permissions: loginResponse.user.permissions,
          avatar: loginResponse.user.avatar || loginResponse.user.avatarUrl,
        });
        
        return {
          success: response.success,
          data: loginResponse,
          message: response.message,
        };
      }
      
      return response as any;
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

      const response = await api.post<{ tokens: RefreshTokenResponse }>(
        API_ENDPOINTS.AUTH.REFRESH, 
        { refreshToken }
      );
      
      // Transform response to match expected format
      if (response.data && 'tokens' in response.data) {
        const refreshResponse: RefreshTokenResponse = {
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          expiresIn: response.data.tokens.expiresIn,
        };
        
        // Update tokens
        api.setToken(refreshResponse.accessToken);
        tokenStorage.setAccessToken(refreshResponse.accessToken);
        if (refreshResponse.refreshToken) {
          tokenStorage.setRefreshToken(refreshResponse.refreshToken);
        }
        
        // Calculate and store expiry time
        const expiresAt = Date.now() + (refreshResponse.expiresIn * 1000);
        tokenStorage.setTokenExpiry(expiresAt);
        
        return {
          success: response.success,
          data: refreshResponse,
          message: response.message,
        };
      }
      
      return response as any;
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
      const response = await api.get<{ user: UserProfile } | UserProfile>(API_ENDPOINTS.AUTH.VERIFY);
      
      // Transform response if needed
      if (response.data && 'user' in response.data) {
        return {
          success: response.success,
          data: (response.data as any).user,
          message: response.message,
        };
      }
      
      return response as SingleResponse<UserProfile>;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<SingleResponse<UserProfile>> {
    try {
      const response = await api.get<{ user: UserProfile } | UserProfile>(API_ENDPOINTS.AUTH.VERIFY);
      
      // Transform response if needed
      if (response.data && 'user' in response.data) {
        return {
          success: response.success,
          data: (response.data as any).user,
          message: response.message,
        };
      }
      
      return response as SingleResponse<UserProfile>;
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
        `${API_ENDPOINTS.AUTH.VERIFY}/change-password`,
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
      // Backend might not have forgot password endpoint yet
      // For now, return error or implement later
      throw new ApiServiceError('Forgot password not implemented yet', 501, 'NOT_IMPLEMENTED');
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
