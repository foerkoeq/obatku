// src/shared/utils/pagination.util.ts
import { PaginationQuery, PaginationMeta } from '../types/common.types';

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

export interface PaginationResult {
  offset: number;
  limit: number;
  meta: PaginationMeta;
}

export class PaginationUtil {
  static readonly DEFAULT_PAGE = 1;
  static readonly DEFAULT_LIMIT = 20;
  static readonly MAX_LIMIT = 100;

  /**
   * Calculate pagination offset and create metadata
   */
  static paginate(options: PaginationOptions): PaginationResult {
    const { page, limit, total } = options;
    
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };

    return { offset, limit, meta };
  }

  /**
   * Parse and validate pagination query parameters
   */
  static parseQuery(query: PaginationQuery): { page: number; limit: number } {
    let page = parseInt(String(query.page || this.DEFAULT_PAGE));
    let limit = parseInt(String(query.limit || this.DEFAULT_LIMIT));

    // Validate page
    if (isNaN(page) || page < 1) {
      page = this.DEFAULT_PAGE;
    }

    // Validate limit
    if (isNaN(limit) || limit < 1) {
      limit = this.DEFAULT_LIMIT;
    } else if (limit > this.MAX_LIMIT) {
      limit = this.MAX_LIMIT;
    }

    return { page, limit };
  }

  /**
   * Create pagination metadata without database query
   */
  static createMeta(page: number, limit: number, total: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };
  }

  /**
   * Calculate offset for SQL queries
   */
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Validate pagination parameters
   */
  static validateParams(page: number, limit: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Number.isInteger(page) || page < 1) {
      errors.push('Page must be a positive integer');
    }

    if (!Number.isInteger(limit) || limit < 1) {
      errors.push('Limit must be a positive integer');
    }

    if (limit > this.MAX_LIMIT) {
      errors.push(`Limit cannot exceed ${this.MAX_LIMIT}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create paginated response helper
   */
  static createResponse<T>(
    items: T[],
    page: number,
    limit: number,
    total: number
  ): { items: T[]; meta: PaginationMeta } {
    const meta = this.createMeta(page, limit, total);
    return { items, meta };
  }

  /**
   * Get pagination info text for logging
   */
  static getInfoText(meta: PaginationMeta): string {
    const start = (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    return `Showing ${start}-${end} of ${meta.total} items (Page ${meta.page}/${meta.totalPages})`;
  }

  /**
   * Create pagination links (for REST API HATEOAS)
   */
  static createLinks(baseUrl: string, meta: PaginationMeta): Record<string, string> {
    const links: Record<string, string> = {};
    
    // Self link
    links.self = `${baseUrl}?page=${meta.page}&limit=${meta.limit}`;
    
    // First page link
    links.first = `${baseUrl}?page=1&limit=${meta.limit}`;
    
    // Last page link
    links.last = `${baseUrl}?page=${meta.totalPages}&limit=${meta.limit}`;
    
    // Previous page link
    if (meta.hasPrevious) {
      links.prev = `${baseUrl}?page=${meta.page - 1}&limit=${meta.limit}`;
    }
    
    // Next page link
    if (meta.hasNext) {
      links.next = `${baseUrl}?page=${meta.page + 1}&limit=${meta.limit}`;
    }

    return links;
  }
}
