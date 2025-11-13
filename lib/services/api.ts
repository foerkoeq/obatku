/**
 * Base API Service Configuration
 * Common utilities and configurations for all API services
 */

import { api, ApiResponse, ApiError } from '../api/client';

// Common API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/v1/auth/login',
    LOGOUT: '/v1/auth/logout',
    REFRESH: '/v1/auth/refresh',
    VERIFY: '/v1/auth/profile',
  },
  
  // Users
  USERS: {
    BASE: '/v1/users',
    PROFILE: '/v1/users/profile',
    ROLES: '/v1/users/roles',
    PERMISSIONS: '/v1/users/permissions',
  },
  
  // Inventory
  INVENTORY: {
    MEDICINES: '/inventory/medicines',
    CATEGORIES: '/inventory/categories',
    STOCK: '/inventory/stock',
    SUPPLIERS: '/inventory/suppliers',
    EXPIRY: '/inventory/expiry',
  },
  
  // Transactions
  TRANSACTIONS: {
    BASE: '/transactions',
    SALES: '/transactions/sales',
    PURCHASES: '/transactions/purchases',
    RETURNS: '/transactions/returns',
    APPROVALS: '/transactions/approvals',
  },
  
  // Berita Acara
  BERITA_ACARA: {
    BASE: '/berita-acara',
    TEMPLATES: '/berita-acara/templates',
    GENERATE: '/berita-acara/generate',
  },
  
  // System Management
  SYSTEM: {
    SETTINGS: '/system/settings',
    LOGS: '/system/logs',
    BACKUP: '/system/backup',
    HEALTH: '/system/health',
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_TRANSACTIONS: '/dashboard/recent-transactions',
    LOW_STOCK: '/dashboard/low-stock',
    SALES_CHART: '/dashboard/sales-chart',
  },
  
  // Reports
  REPORTS: {
    SALES: '/reports/sales',
    INVENTORY: '/reports/inventory',
    TRANSACTIONS: '/reports/transactions',
    EXPIRY: '/reports/expiry',
  },
  
  // Master Data
  MASTER_DATA: {
    FARMER_GROUPS: '/master-data/farmer-groups',
    COMMODITIES: '/master-data/commodities',
    PEST_TYPES: '/master-data/pest-types',
    DISTRICTS: '/master-data/districts',
    VILLAGES: '/master-data/villages',
  },
} as const;

// Common query parameters
export const QUERY_PARAMS = {
  PAGE: 'page',
  LIMIT: 'limit',
  SEARCH: 'search',
  SORT: 'sort',
  ORDER: 'order',
  FILTER: 'filter',
  DATE_FROM: 'dateFrom',
  DATE_TO: 'dateTo',
  STATUS: 'status',
  CATEGORY: 'category',
  SUPPLIER: 'supplier',
} as const;

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and filter interface
export interface SearchFilterParams {
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: Record<string, any>;
  dateFrom?: string;
  dateTo?: string;
}

// Date range interface
export interface DateRangeParams {
  dateFrom?: string;
  dateTo?: string;
}

// Status filter interface
export interface StatusFilterParams {
  status?: string | string[];
}

// Common response types
export interface ListResponse<T> extends ApiResponse<PaginationResponse<T>> {}
export interface SingleResponse<T> extends ApiResponse<T> {}
export interface MessageResponse extends ApiResponse<{ message: string }> {}

// Error handling utilities
export class ApiServiceError extends Error {
  public statusCode: number;
  public error: string;
  public details?: any;

  constructor(message: string, statusCode: number, error?: string, details?: any) {
    super(message);
    this.name = 'ApiServiceError';
    this.statusCode = statusCode;
    this.error = error || 'UNKNOWN_ERROR';
    this.details = details;
  }

  static fromApiError(apiError: ApiError): ApiServiceError {
    return new ApiServiceError(
      apiError.message,
      apiError.statusCode,
      apiError.error,
      apiError.details
    );
  }
}

// Query builder utility
export class QueryBuilder {
  private params: URLSearchParams;

  constructor() {
    this.params = new URLSearchParams();
  }

  addPagination(page?: number, limit?: number): QueryBuilder {
    if (page !== undefined) this.params.set(QUERY_PARAMS.PAGE, page.toString());
    if (limit !== undefined) this.params.set(QUERY_PARAMS.LIMIT, limit.toString());
    return this;
  }

  addSearch(search?: string): QueryBuilder {
    if (search) this.params.set(QUERY_PARAMS.SEARCH, search);
    return this;
  }

  addSort(sort?: string, order?: 'asc' | 'desc'): QueryBuilder {
    if (sort) this.params.set(QUERY_PARAMS.SORT, sort);
    if (order) this.params.set(QUERY_PARAMS.ORDER, order);
    return this;
  }

  addFilter(filter?: Record<string, any>): QueryBuilder {
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          this.params.set(key, value.toString());
        }
      });
    }
    return this;
  }

  addDateRange(dateFrom?: string, dateTo?: string): QueryBuilder {
    if (dateFrom) this.params.set(QUERY_PARAMS.DATE_FROM, dateFrom);
    if (dateTo) this.params.set(QUERY_PARAMS.DATE_TO, dateTo);
    return this;
  }

  addStatus(status?: string | string[]): QueryBuilder {
    if (status) {
      if (Array.isArray(status)) {
        status.forEach(s => this.params.append(QUERY_PARAMS.STATUS, s));
      } else {
        this.params.set(QUERY_PARAMS.STATUS, status);
      }
    }
    return this;
  }

  build(): string {
    const queryString = this.params.toString();
    return queryString ? `?${queryString}` : '';
  }
}

// Export common utilities
export { api };
export type { ApiResponse, ApiError };
