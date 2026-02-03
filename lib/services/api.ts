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
    MEDICINES: '/v1/inventory/medicines',
    CATEGORIES: '/v1/inventory/categories',
    STOCK: '/v1/inventory/stock',
    SUPPLIERS: '/v1/inventory/suppliers',
    EXPIRY: '/v1/inventory/expiry',
  },
  
  // Transactions
  TRANSACTIONS: {
    BASE: '/v1/transactions',
    SALES: '/v1/transactions/sales',
    PURCHASES: '/v1/transactions/purchases',
    RETURNS: '/v1/transactions/returns',
    APPROVALS: '/v1/transactions/approvals',
  },
  
  // Berita Acara
  BERITA_ACARA: {
    BASE: '/v1/berita-acara',
    TEMPLATES: '/v1/berita-acara/templates',
    GENERATE: '/v1/berita-acara/generate',
  },
  
  // System Management
  SYSTEM: {
    SETTINGS: '/v1/system/settings',
    LOGS: '/v1/system/logs',
    BACKUP: '/v1/system/backup',
    HEALTH: '/v1/system/health',
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/v1/dashboard/stats',
    RECENT_TRANSACTIONS: '/v1/dashboard/recent-transactions',
    LOW_STOCK: '/v1/dashboard/low-stock',
    SALES_CHART: '/v1/dashboard/sales-chart',
  },
  
  // Reports
  REPORTS: {
    SALES: '/v1/reports/sales',
    INVENTORY: '/v1/reports/inventory',
    TRANSACTIONS: '/v1/reports/transactions',
    EXPIRY: '/v1/reports/expiry',
  },
  
  // Master Data
  MASTER_DATA: {
    FARMER_GROUPS: '/v1/master-data/farmer-groups',
    COMMODITIES: '/v1/master-data/commodities',
    PEST_TYPES: '/v1/master-data/pest-types',
    DISTRICTS: '/v1/master-data/districts',
    VILLAGES: '/v1/master-data/villages',
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
