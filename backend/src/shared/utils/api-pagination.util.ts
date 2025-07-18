// ================================
// ENHANCED PAGINATION UTILITY
// ================================

import { 
  PaginationQuery, 
  PaginationMeta, 
  PaginationLinks
} from '@/shared/types/api.types';

/**
 * Pagination Configuration
 */
export interface PaginationConfig {
  defaultPage: number;
  defaultLimit: number;
  maxLimit: number;
  allowedLimits?: number[];
}

/**
 * Pagination Options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
  baseUrl?: string;
  config?: Partial<PaginationConfig>;
}

/**
 * Pagination Result
 */
export interface PaginationResult {
  offset: number;
  limit: number;
  meta: PaginationMeta;
}

/**
 * Enhanced Pagination Utility
 * Provides comprehensive pagination functionality with customizable options
 */
export class ApiPaginationUtil {
  // Default configuration
  static readonly DEFAULT_CONFIG: PaginationConfig = {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
    allowedLimits: [10, 20, 50, 100]
  };

  /**
   * Parse and validate pagination query parameters
   */
  static parseQuery(
    query: PaginationQuery, 
    config: Partial<PaginationConfig> = {}
  ): { page: number; limit: number } {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    let page = parseInt(String(query.page || finalConfig.defaultPage));
    let limit = parseInt(String(query.limit || finalConfig.defaultLimit));

    // Validate page
    if (isNaN(page) || page < 1) {
      page = finalConfig.defaultPage;
    }

    // Validate limit
    if (isNaN(limit) || limit < 1) {
      limit = finalConfig.defaultLimit;
    }

    // Enforce max limit
    if (limit > finalConfig.maxLimit) {
      limit = finalConfig.maxLimit;
    }

    // Check against allowed limits if specified
    if (finalConfig.allowedLimits && finalConfig.allowedLimits.length > 0) {
      if (!finalConfig.allowedLimits.includes(limit)) {
        // Find the closest allowed limit
        const closest = finalConfig.allowedLimits.reduce((prev, curr) => 
          Math.abs(curr - limit) < Math.abs(prev - limit) ? curr : prev
        );
        limit = closest;
      }
    }

    return { page, limit };
  }

  /**
   * Calculate pagination offset and create metadata
   */
  static paginate(options: PaginationOptions): PaginationResult {
    const { page, limit, total, baseUrl } = options;
    
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    // Generate pagination links if baseUrl is provided
    let links: PaginationLinks | undefined;
    if (baseUrl) {
      links = this.generateLinks(baseUrl, page, totalPages, limit);
    }
    
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      ...(links && { links })
    };

    return { offset, limit, meta };
  }

  /**
   * Generate pagination links
   */
  private static generateLinks(
    baseUrl: string, 
    currentPage: number, 
    totalPages: number, 
    limit: number
  ): PaginationLinks {
    const createUrl = (page: number) => 
      `${baseUrl}?page=${page}&limit=${limit}`;

    const links: PaginationLinks = {
      current: createUrl(currentPage)
    };

    if (totalPages > 0) {
      links.first = createUrl(1);
      links.last = createUrl(totalPages);
    }

    if (currentPage > 1) {
      links.previous = createUrl(currentPage - 1);
    }

    if (currentPage < totalPages) {
      links.next = createUrl(currentPage + 1);
    }

    return links;
  }

  /**
   * Create pagination metadata without calculating offset
   */
  static createMeta(
    page: number,
    limit: number,
    total: number,
    baseUrl?: string
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    
    let links: PaginationLinks | undefined;
    if (baseUrl) {
      links = this.generateLinks(baseUrl, page, totalPages, limit);
    }

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      ...(links && { links })
    };
  }

  /**
   * Get SQL LIMIT and OFFSET values
   */
  static getSqlPagination(page: number, limit: number): { limit: number; offset: number } {
    const offset = (page - 1) * limit;
    return { limit, offset };
  }

  /**
   * Get Prisma pagination parameters
   */
  static getPrismaPagination(page: number, limit: number): { take: number; skip: number } {
    const skip = (page - 1) * limit;
    return { take: limit, skip };
  }

  /**
   * Calculate page number from offset
   */
  static getPageFromOffset(offset: number, limit: number): number {
    return Math.floor(offset / limit) + 1;
  }

  /**
   * Validate if page exists for given total
   */
  static isValidPage(page: number, limit: number, total: number): boolean {
    const totalPages = Math.ceil(total / limit);
    return page >= 1 && page <= totalPages;
  }

  /**
   * Get pagination info for display
   */
  static getDisplayInfo(page: number, limit: number, total: number): {
    start: number;
    end: number;
    showing: string;
  } {
    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    const showing = `Showing ${start}-${end} of ${total} results`;
    
    return { start, end, showing };
  }

  /**
   * Create cursor-based pagination metadata
   */
  static createCursorMeta(
    hasNext: boolean,
    hasPrevious: boolean,
    nextCursor?: string,
    previousCursor?: string
  ): {
    hasNext: boolean;
    hasPrevious: boolean;
    nextCursor?: string;
    previousCursor?: string;
  } {
    return {
      hasNext,
      hasPrevious,
      ...(nextCursor && { nextCursor }),
      ...(previousCursor && { previousCursor })
    };
  }
}

/**
 * Legacy compatibility - keeps existing PaginationUtil working
 */
export class PaginationUtil {
  static readonly DEFAULT_PAGE = ApiPaginationUtil.DEFAULT_CONFIG.defaultPage;
  static readonly DEFAULT_LIMIT = ApiPaginationUtil.DEFAULT_CONFIG.defaultLimit;
  static readonly MAX_LIMIT = ApiPaginationUtil.DEFAULT_CONFIG.maxLimit;

  static paginate = ApiPaginationUtil.paginate;
  static parseQuery = ApiPaginationUtil.parseQuery;
}

export default ApiPaginationUtil;
