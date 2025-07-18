// ================================
// STANDARD API RESPONSE TYPES
// ================================

/**
 * Base API Response Format
 * Standardized response structure for all API endpoints
 */
export interface BaseApiResponse {
  success: boolean;
  timestamp: string;
  requestId?: string;
  version?: string;
}

/**
 * Success Response Format
 */
export interface ApiSuccessResponse<T = any> extends BaseApiResponse {
  success: true;
  data: T;
  message?: string;
  meta?: ApiResponseMeta;
}

/**
 * Error Response Format
 */
export interface ApiErrorResponse extends BaseApiResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string; // Only in development
  };
  path?: string;
  method?: string;
}

/**
 * Paginated Response Format
 */
export interface ApiPaginatedResponse<T = any> extends BaseApiResponse {
  success: true;
  data: T[];
  message?: string;
  meta: PaginationMeta;
}

/**
 * Response Meta Information
 */
export interface ApiResponseMeta {
  timestamp: string;
  processingTime?: number;
  source?: string;
  [key: string]: any;
}

/**
 * Pagination Meta Information
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  links?: PaginationLinks;
}

/**
 * Pagination Links
 */
export interface PaginationLinks {
  first?: string;
  previous?: string;
  current: string;
  next?: string;
  last?: string;
}

// ================================
// REQUEST INTERFACES
// ================================

/**
 * Authentication request interface
 */
export interface AuthRequest {
  user?: {
    id: string;
    role: string;
    nip: string;
    permissions?: string[];
  };
  [key: string]: any;
}

/**
 * Extended request interface with pagination and filtering
 */
export interface ApiRequest extends AuthRequest {
  query: {
    // Pagination
    page?: string;
    limit?: string;
    
    // Sorting
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    sort?: string; // Alternative format: "field:direction"
    
    // Filtering
    search?: string;
    filter?: string | object;
    where?: object;
    
    // Date range
    dateFrom?: string;
    dateTo?: string;
    
    // Response format
    format?: 'json' | 'csv' | 'xlsx';
    include?: string; // Related data to include
    exclude?: string; // Fields to exclude
    
    [key: string]: any;
  };
}

/**
 * File Upload Request
 */
export interface FileUploadRequest extends AuthRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// ================================
// QUERY INTERFACES
// ================================

/**
 * Pagination Query Parameters
 */
export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
}

/**
 * Sorting Query Parameters
 */
export interface SortingQuery {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  sort?: string;
}

/**
 * Filtering Query Parameters
 */
export interface FilteringQuery {
  search?: string;
  filter?: string | object;
  where?: object;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Combined Query Parameters
 */
export interface ApiQuery extends PaginationQuery, SortingQuery, FilteringQuery {
  include?: string;
  exclude?: string;
  format?: 'json' | 'csv' | 'xlsx';
  [key: string]: any;
}
