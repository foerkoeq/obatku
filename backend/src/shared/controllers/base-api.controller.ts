// ================================
// BASE API CONTROLLER
// ================================

import { Request, Response } from 'express';
import { ApiResponseUtil } from '../utils/api-response.util';
import { ApiPaginationUtil } from '../utils/api-pagination.util';
import { ApiSortingUtil, SortConfig } from '../utils/api-sorting.util';
import { ApiFilteringUtil, FilterConfig } from '../utils/api-filtering.util';
import { ApiRequest } from '../types/api.types';

/**
 * Base Controller Configuration
 */
export interface BaseControllerConfig {
  pagination?: {
    defaultLimit?: number;
    maxLimit?: number;
    allowedLimits?: number[];
  };
  sorting?: SortConfig;
  filtering?: FilterConfig;
  defaultIncludes?: string[];
  defaultExcludes?: string[];
}

/**
 * Controller Action Options
 */
export interface ActionOptions {
  startTime?: number;
  requestId?: string;
  skipPagination?: boolean;
  skipSorting?: boolean;
  skipFiltering?: boolean;
}

/**
 * Enhanced Base API Controller
 * Provides common functionality for all API controllers with built-in
 * pagination, sorting, filtering, and response standardization
 */
export abstract class BaseApiController {
  protected config: BaseControllerConfig;

  constructor(config: BaseControllerConfig = {}) {
    this.config = {
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
        allowedLimits: [10, 20, 50, 100],
        ...config.pagination
      },
      sorting: config.sorting || {
        allowedFields: ['id', 'createdAt', 'updatedAt'],
        defaultField: 'id',
        defaultDirection: 'asc' as any
      },
      filtering: config.filtering || {
        allowedFields: ['id'],
        searchFields: []
      },
      defaultIncludes: config.defaultIncludes || [],
      defaultExcludes: config.defaultExcludes || []
    };
  }

  /**
   * Parse request query parameters
   */
  protected parseQuery(req: ApiRequest) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string;

    // Parse pagination
    const paginationConfig = this.config.pagination!;
    const { page, limit } = ApiPaginationUtil.parseQuery(req.query, paginationConfig);

    // Parse sorting
    const sortResult = ApiSortingUtil.parseQuery(req.query, this.config.sorting!);

    // Parse filtering
    const filterResult = ApiFilteringUtil.parseQuery(req.query, this.config.filtering!);

    // Parse includes/excludes
    const include = req.query.include ? req.query.include.split(',') : this.config.defaultIncludes;
    const exclude = req.query.exclude ? req.query.exclude.split(',') : this.config.defaultExcludes;

    return {
      pagination: { page, limit },
      sorting: sortResult,
      filtering: filterResult,
      include,
      exclude,
      format: req.query.format || 'json',
      meta: {
        startTime,
        requestId
      }
    };
  }

  /**
   * Send success response
   */
  protected success<T>(
    res: Response,
    data: T,
    message?: string,
    options: ActionOptions = {}
  ) {
    return ApiResponseUtil.success(res, data, {
      message,
      requestId: options.requestId,
      startTime: options.startTime
    });
  }

  /**
   * Send paginated response
   */
  protected successPaginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string,
    options: ActionOptions = {}
  ) {
    const paginationMeta = ApiPaginationUtil.createMeta(page, limit, total);
    
    return ApiResponseUtil.successPaginated(res, data, paginationMeta, {
      message,
      requestId: options.requestId,
      startTime: options.startTime
    });
  }

  /**
   * Send created response
   */
  protected created<T>(
    res: Response,
    data: T,
    message?: string,
    options: ActionOptions & { location?: string } = {}
  ) {
    return ApiResponseUtil.created(res, data, {
      message,
      requestId: options.requestId,
      startTime: options.startTime,
      location: options.location
    });
  }

  /**
   * Send accepted response
   */
  protected accepted<T>(
    res: Response,
    data: T,
    message?: string,
    options: ActionOptions = {}
  ) {
    return ApiResponseUtil.accepted(res, data, {
      message,
      requestId: options.requestId,
      startTime: options.startTime
    });
  }

  /**
   * Send no content response
   */
  protected noContent(res: Response, options: ActionOptions = {}) {
    return ApiResponseUtil.noContent(res, {
      requestId: options.requestId,
      startTime: options.startTime
    });
  }

  /**
   * Send bad request error
   */
  protected badRequest(
    res: Response,
    message: string = 'Bad Request',
    details?: any,
    options: ActionOptions = {}
  ) {
    return ApiResponseUtil.badRequest(res, message, details, {
      requestId: options.requestId,
      startTime: options.startTime
    });
  }

  /**
   * Send unauthorized error
   */
  protected unauthorized(
    res: Response,
    message: string = 'Unauthorized',
    details?: any,
    options: ActionOptions = {}
  ) {
    // Log details for debugging if provided
    if (details && process.env.NODE_ENV === 'development') {
      console.warn('Unauthorized access details:', details);
    }
    
    return ApiResponseUtil.unauthorized(res, message, {
      requestId: options.requestId,
      startTime: options.startTime
    });
  }

  /**
   * Send forbidden error
   */
  protected forbidden(
    res: Response,
    message: string = 'Forbidden',
    details?: any,
    options: ActionOptions = {}
  ) {
    // Log details for debugging if provided
    if (details && process.env.NODE_ENV === 'development') {
      console.warn('Forbidden access details:', details);
    }
    
    return ApiResponseUtil.forbidden(res, message, {
      requestId: options.requestId,
      startTime: options.startTime
    });
  }

  /**
   * Send not found error
   */
  protected notFound(
    res: Response,
    message: string = 'Resource not found',
    details?: any,
    options: ActionOptions = {}
  ) {
    // Log details for debugging if provided
    if (details && process.env.NODE_ENV === 'development') {
      console.warn('Not found details:', details);
    }
    
    return ApiResponseUtil.notFound(res, message, {
      requestId: options.requestId,
      startTime: options.startTime
    });
  }

  /**
   * Send conflict error
   */
  protected conflict(
    res: Response,
    message: string = 'Conflict',
    details?: any,
    options: ActionOptions = {}
  ) {
    return ApiResponseUtil.conflict(res, message, details, {
      requestId: options.requestId,
      startTime: options.startTime
    });
  }

  /**
   * Send validation error
   */
  protected validationError(
    res: Response,
    message: string = 'Validation failed',
    details?: any,
    options: ActionOptions = {}
  ) {
    return ApiResponseUtil.validationError(res, message, details, {
      requestId: options.requestId,
      startTime: options.startTime
    });
  }

  /**
   * Send internal server error
   */
  protected internalError(
    res: Response,
    message: string = 'Internal server error',
    error?: Error,
    options: ActionOptions = {}
  ) {
    // Log the error for debugging
    console.error('Internal Server Error:', error);
    
    return ApiResponseUtil.internalError(res, message, error, {
      requestId: options.requestId,
      startTime: options.startTime
    });
  }

  /**
   * Handle async controller methods with error catching
   */
  protected asyncHandler(
    fn: (req: ApiRequest, res: Response) => Promise<any>
  ) {
    return (req: Request, res: Response) => {
      const startTime = Date.now();
      const apiReq = req as ApiRequest;
      
      Promise.resolve(fn(apiReq, res)).catch((error: Error) => {
        this.internalError(res, 'An unexpected error occurred', error, {
          requestId: req.headers['x-request-id'] as string,
          startTime
        });
      });
    };
  }

  /**
   * Validate required fields in request body
   */
  protected validateRequired(
    req: ApiRequest,
    res: Response,
    fields: string[]
  ): boolean {
    const missing: string[] = [];
    
    for (const field of fields) {
      if (!req.body || req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      this.validationError(res, 'Missing required fields', {
        missingFields: missing,
        providedFields: req.body ? Object.keys(req.body) : []
      }, {
        requestId: req.headers['x-request-id'] as string,
        startTime: Date.now()
      });
      return false;
    }

    return true;
  }

  /**
   * Validate request body schema
   */
  protected validateSchema(
    req: ApiRequest,
    res: Response,
    validator: (data: any) => { valid: boolean; errors?: any[] }
  ): boolean {
    const result = validator(req.body);
    
    if (!result.valid) {
      this.validationError(res, 'Schema validation failed', {
        errors: result.errors
      }, {
        requestId: req.headers['x-request-id'] as string,
        startTime: Date.now()
      });
      return false;
    }

    return true;
  }

  /**
   * Extract user information from request
   */
  protected getCurrentUser(req: ApiRequest) {
    return req.user;
  }

  /**
   * Check if user has required permissions
   */
  protected hasPermission(req: ApiRequest, permission: string): boolean {
    const user = this.getCurrentUser(req);
    return user?.permissions?.includes(permission) || false;
  }

  /**
   * Check if user has required role
   */
  protected hasRole(req: ApiRequest, role: string): boolean {
    const user = this.getCurrentUser(req);
    return user?.role === role;
  }

  /**
   * Authorize request based on permissions
   */
  protected authorize(
    req: ApiRequest,
    res: Response,
    permissions: string | string[]
  ): boolean {
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const user = this.getCurrentUser(req);

    if (!user) {
      this.unauthorized(res, 'Authentication required', undefined, {
        requestId: req.headers['x-request-id'] as string,
        startTime: Date.now()
      });
      return false;
    }

    const hasPermission = requiredPermissions.some(permission => 
      this.hasPermission(req, permission)
    );

    if (!hasPermission) {
      this.forbidden(res, 'Insufficient permissions', {
        requiredPermissions,
        userPermissions: user.permissions || []
      }, {
        requestId: req.headers['x-request-id'] as string,
        startTime: Date.now()
      });
      return false;
    }

    return true;
  }

  /**
   * Get pagination options for database queries
   */
  protected getPaginationOptions(page: number, limit: number) {
    return ApiPaginationUtil.getPrismaPagination(page, limit);
  }

  /**
   * Get sorting options for database queries
   */
  protected getSortingOptions(sortResult: any) {
    return sortResult.prismaOrderBy || {};
  }

  /**
   * Get filtering options for database queries
   */
  protected getFilteringOptions(filterResult: any) {
    return filterResult.prismaWhere || {};
  }

  /**
   * Combine database query options
   */
  protected buildQueryOptions(parsedQuery: any) {
    const { pagination, sorting, filtering } = parsedQuery;
    
    return {
      ...this.getPaginationOptions(pagination.page, pagination.limit),
      orderBy: this.getSortingOptions(sorting),
      where: this.getFilteringOptions(filtering)
    };
  }

  /**
   * Transform data based on includes/excludes
   */
  protected transformData<T>(
    data: T | T[],
    include: string[] = [],
    exclude: string[] = []
  ): any {
    const transform = (item: any) => {
      if (!item || typeof item !== 'object') return item;

      let result = { ...item };

      // Handle includes (if specified, only include these fields)
      if (include.length > 0) {
        const included: any = {};
        include.forEach(field => {
          if (result[field] !== undefined) {
            included[field] = result[field];
          }
        });
        result = included;
      }

      // Handle excludes
      exclude.forEach(field => {
        delete result[field];
      });

      return result;
    };

    return Array.isArray(data) 
      ? data.map(item => transform(item))
      : transform(data);
  }
}

export default BaseApiController;
