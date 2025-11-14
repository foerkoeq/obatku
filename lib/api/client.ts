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
      // Extract validation errors if available
      const validationErrors = data?.errors || data?.error?.errors || [];
      const errorMessage = data?.message || `HTTP ${response.status}`;
      
      const error: ApiError = {
        message: errorMessage,
        statusCode: response.status,
        error: data?.error || 'Request failed',
        details: {
          ...data,
          validationErrors: Array.isArray(validationErrors) ? validationErrors : [],
          fullError: data,
        },
      };

      // Log validation errors in development
      if (process.env.NODE_ENV === 'development' && validationErrors.length > 0) {
        console.error('[API Client] Validation errors:', validationErrors);
      }

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Debug logging before request
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Client] Making request:', {
          method,
          url,
          endpoint,
          baseURL: this.baseURL,
          headers: Object.keys(requestHeaders),
          hasBody: !!body,
          bodyPreview: body ? (typeof body === 'object' ? JSON.stringify(body).substring(0, 100) : String(body).substring(0, 100)) : null,
        });
      }

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
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Enhanced error logging - capture all error types
      const errorInfo = {
        // Error properties
        name: error?.name || 'Unknown',
        message: error?.message || String(error) || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        // Request info
        url,
        method,
        endpoint,
        baseURL: this.baseURL,
        constructedUrl: url,
        // Additional error properties
        cause: error?.cause || null,
        code: error?.code || null,
        errno: error?.errno || null,
        // Type info
        errorType: typeof error,
        isError: error instanceof Error,
        // Timestamp
        timestamp: new Date().toISOString(),
      };

      if (process.env.NODE_ENV === 'development') {
        console.error('[API Client] Request failed - Full error info:', errorInfo);
        console.error('[API Client] Raw error object:', error);
        console.error('[API Client] Error stringified:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }

      // Extract error message and name
      const errorMessage = error?.message || String(error) || 'Unknown error';
      const errorName = error?.name || (error instanceof Error ? 'Error' : 'UnknownError');
      
      // Handle AbortError (timeout)
      if (errorName === 'AbortError' || errorMessage.includes('aborted')) {
        throw {
          message: `Request timeout setelah ${timeout}ms. Pastikan backend berjalan di ${this.baseURL}`,
          statusCode: 408,
          error: 'TIMEOUT',
          details: { url, method, timeout, errorInfo },
        } as ApiError;
      }
      
      // Check for network errors (Failed to fetch, NetworkError, etc.)
      const isNetworkError = 
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed') ||
        errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
        errorMessage.includes('ERR_NETWORK_CHANGED') ||
        errorMessage.includes('ERR_CONNECTION_REFUSED') ||
        errorMessage.includes('ERR_NAME_NOT_RESOLVED') ||
        errorName === 'TypeError' && (errorMessage.includes('fetch') || errorMessage.includes('network'));

      if (isNetworkError) {
        // Check if it's a CORS error specifically
        const isCorsError = errorMessage.includes('CORS') || 
                           errorMessage.includes('Access-Control-Allow-Origin') ||
                           errorMessage.includes('CORS policy') ||
                           errorMessage.includes('cross-origin');

        if (isCorsError) {
          throw {
            message: `CORS Error: Backend tidak mengizinkan request dari origin ini. Pastikan CORS_ORIGIN di backend mencakup ${typeof window !== 'undefined' ? window.location.origin : 'frontend origin'}`,
            statusCode: 0,
            error: 'CORS_ERROR',
            details: { 
              url, 
              method,
              backendUrl: this.baseURL,
              origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
              errorMessage,
              suggestion: 'Periksa konfigurasi CORS_ORIGIN di backend .env.local'
            },
          } as ApiError;
        }

        // Generic network error
        throw {
          message: `Network Error: Tidak dapat terhubung ke backend di ${url}. Pastikan:\n1. Backend berjalan di port 3001\n2. Backend dapat diakses dari browser\n3. Tidak ada firewall yang memblokir koneksi\n4. CORS sudah dikonfigurasi dengan benar`,
          statusCode: 0,
          error: 'NETWORK_ERROR',
          details: { 
            url, 
            method,
            endpoint,
            backendUrl: this.baseURL,
            originalError: errorMessage,
            errorName,
            suggestion: 'Test dengan: curl -X POST http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d \'{"nip":"test","password":"test"}\''
          },
        } as ApiError;
      }

      // Fallback for unknown errors
      throw {
        message: `Error: ${errorMessage}`,
        statusCode: 0,
        error: 'UNKNOWN_ERROR',
        details: { 
          url, 
          method, 
          endpoint,
          errorInfo,
          originalError: error 
        },
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
