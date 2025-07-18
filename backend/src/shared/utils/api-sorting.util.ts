// ================================
// SORTING UTILITY
// ================================

import { SortingQuery } from '@/shared/types/api.types';

/**
 * Sort Direction Enum
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Sort Field Configuration
 */
export interface SortField {
  field: string;
  direction: SortDirection;
  alias?: string; // For database column aliases
}

/**
 * Sort Configuration
 */
export interface SortConfig {
  allowedFields: string[];
  defaultField?: string;
  defaultDirection?: SortDirection;
  fieldMapping?: Record<string, string>; // Map API fields to DB fields
}

/**
 * Sort Result
 */
export interface SortResult {
  fields: SortField[];
  sqlOrderBy?: string;
  prismaOrderBy?: Record<string, any>;
}

/**
 * Enhanced Sorting Utility
 * Provides comprehensive sorting functionality with field validation and security
 */
export class ApiSortingUtil {
  static readonly DEFAULT_DIRECTION = SortDirection.ASC;

  /**
   * Parse sorting query parameters
   */
  static parseQuery(
    query: SortingQuery,
    config: SortConfig
  ): SortResult {
    const { allowedFields, defaultField, defaultDirection = this.DEFAULT_DIRECTION, fieldMapping = {} } = config;
    const fields: SortField[] = [];

    // Handle combined sort parameter (e.g., "name:asc,createdAt:desc")
    if (query.sort) {
      const sortPairs = query.sort.split(',');
      for (const pair of sortPairs) {
        const [field, direction] = pair.split(':');
        if (field && this.isAllowedField(field, allowedFields)) {
          fields.push({
            field: fieldMapping[field] || field,
            direction: this.validateDirection(direction),
            alias: field !== (fieldMapping[field] || field) ? field : undefined
          });
        }
      }
    }

    // Handle separate sortBy and sortOrder parameters
    if (query.sortBy && this.isAllowedField(query.sortBy, allowedFields)) {
      const field = query.sortBy;
      const existingField = fields.find(f => f.alias === field || f.field === field);
      
      if (!existingField) {
        fields.push({
          field: fieldMapping[field] || field,
          direction: this.validateDirection(query.sortOrder),
          alias: field !== (fieldMapping[field] || field) ? field : undefined
        });
      }
    }

    // Apply default sorting if no valid fields found
    if (fields.length === 0 && defaultField && this.isAllowedField(defaultField, allowedFields)) {
      fields.push({
        field: fieldMapping[defaultField] || defaultField,
        direction: defaultDirection,
        alias: defaultField !== (fieldMapping[defaultField] || defaultField) ? defaultField : undefined
      });
    }

    return {
      fields,
      sqlOrderBy: this.generateSqlOrderBy(fields),
      prismaOrderBy: this.generatePrismaOrderBy(fields)
    };
  }

  /**
   * Validate if field is allowed
   */
  private static isAllowedField(field: string, allowedFields: string[]): boolean {
    return allowedFields.includes(field);
  }

  /**
   * Validate and normalize sort direction
   */
  private static validateDirection(direction?: string): SortDirection {
    if (!direction) return this.DEFAULT_DIRECTION;
    
    const normalized = direction.toLowerCase();
    return normalized === 'desc' ? SortDirection.DESC : SortDirection.ASC;
  }

  /**
   * Generate SQL ORDER BY clause
   */
  private static generateSqlOrderBy(fields: SortField[]): string {
    if (fields.length === 0) return '';
    
    const orderClauses = fields.map(field => `${field.field} ${field.direction.toUpperCase()}`);
    return `ORDER BY ${orderClauses.join(', ')}`;
  }

  /**
   * Generate Prisma orderBy object
   */
  private static generatePrismaOrderBy(fields: SortField[]): Record<string, any> {
    if (fields.length === 0) return {};
    
    if (fields.length === 1) {
      return { [fields[0].field]: fields[0].direction };
    }
    
    // Multiple fields
    return fields.reduce((acc, field) => {
      acc[field.field] = field.direction;
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Create sort configuration for common use cases
   */
  static createConfig(options: {
    allowedFields: string[];
    defaultField?: string;
    defaultDirection?: SortDirection;
    fieldMapping?: Record<string, string>;
  }): SortConfig {
    return {
      allowedFields: options.allowedFields,
      defaultField: options.defaultField || 'id',
      defaultDirection: options.defaultDirection || SortDirection.ASC,
      fieldMapping: options.fieldMapping || {}
    };
  }
}

export default ApiSortingUtil;
