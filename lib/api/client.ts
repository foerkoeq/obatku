/**
 * API Client Configuration
 * Centralized HTTP client setup for ObatKu Frontend
 */

import { env, getApiUrl } from '../config/env';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  withCredentials?: boolean;
}

/**
 * Custom API Client Class
 */
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = env.backendApiUrl;
    this.defaultTimeout = env.apiTimeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(env.jwtStorageKey);
    }
    return null;
  }

  /**
   * Set authentication token to storage
   */
  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(env.jwtStorageKey, token);
    }
  }

  /**
   * Remove authentication token from storage
   */
  private removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(env.jwtStorageKey);
    }
  }

  /**
   * Get request headers with authentication
   */
  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const token = this.getAuthToken();
    const headers = { ...this.defaultHeaders, ...customHeaders };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: any;

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || `HTTP ${response.status}`,
        statusCode: response.status,
        error: data?.error || 'Request failed',
        details: data,
      };

      // Handle authentication errors
      if (response.status === 401) {
        this.removeAuthToken();
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      throw error;
    }

    // Handle different response formats
    // Backend returns: { success, message, data }
    // If data already has the structure (success, message, data), return it as is
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        data: data.data as T,
        message: data.message,
        statusCode: response.status,
      };
    }
    
    // If data is the response itself (wrapped in success/message/data)
    return {
      success: true,
      data: data as T,
      message: data?.message,
      statusCode: response.status,
    };
  }

  /**
   * Make HTTP request
   */
  async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      withCredentials = true,
    } = config;

    const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
    const requestHeaders = this.getHeaders(headers);

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Client] Making request:', {
        method,
        url,
        headers: requestHeaders,
        hasBody: !!body,
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: withCredentials ? 'include' : 'omit',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Client] Response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        });
      }
      
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      // Enhanced error logging
      if (process.env.NODE_ENV === 'development') {
        console.error('[API Client] Request failed:', {
          url,
          method,
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          } : error,
        });
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw {
            message: 'Request timeout',
            statusCode: 408,
            error: 'TIMEOUT',
          } as ApiError;
        }
        
        // Check for CORS errors
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
          throw {
            message: `CORS error: ${error.message}. Please check backend CORS configuration.`,
            statusCode: 0,
            error: 'CORS_ERROR',
            details: { url, method },
          } as ApiError;
        }
      }

      throw {
        message: error instanceof Error ? error.message : 'Network error',
        statusCode: 0,
        error: 'NETWORK_ERROR',
        details: { url, method },
      } as ApiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body: data });
  }

  /**
   * Upload file
   */
  async upload<T>(endpoint: string, file: File, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = { ...this.getHeaders(config?.headers) };
    delete headers['Content-Type']; // Let browser set content-type for FormData

    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: formData,
      headers,
    });
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.setAuthToken(token);
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.removeAuthToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiResponse, ApiError, ApiRequestConfig };

// Export convenience methods
export const api = {
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
  patch: apiClient.patch.bind(apiClient),
  upload: apiClient.upload.bind(apiClient),
  setToken: apiClient.setToken.bind(apiClient),
  clearToken: apiClient.clearToken.bind(apiClient),
  isAuthenticated: apiClient.isAuthenticated.bind(apiClient),
};
