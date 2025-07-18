// Authentication request interface
export interface AuthRequest {
  user?: {
    id: string;
    role: string;
    nip: string;
  };
  [key: string]: any;
}

// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
  meta?: {
    pagination?: PaginationMeta;
    filters?: any;
    timestamp?: string;
  };
}

// Success response
export interface SuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  data: T;
}

// Error response
export interface ErrorResponse extends ApiResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Enhanced Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Pagination query parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Paginated data response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Common query parameters
export interface BaseQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Filter options
export interface FilterOptions {
  [key: string]: any;
}

// Sort options
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// Error types
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR'
}

// User context type (for authenticated requests)
export interface UserContext {
  id: string;
  name: string;
  email?: string;
  role: string;
  permissions: string[];
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  database?: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
}

// File upload info
export interface FileUploadInfo {
  originalName: string;
  fileName: string;
  path: string;
  size: number;
  mimetype: string;
  url: string;
}

// Audit fields
export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Base entity structure
export interface BaseEntity extends AuditFields {
  id: string;
}
