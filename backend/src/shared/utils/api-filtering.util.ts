// ================================
// FILTERING UTILITY
// ================================

import { FilteringQuery } from '@/shared/types/api.types';

/**
 * Filter Operator Types
 */
export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  IN = 'in',
  NOT_IN = 'notIn',
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
  BETWEEN = 'between',
  LIKE = 'like',
  ILIKE = 'ilike', // Case-insensitive like
  REGEX = 'regex'
}

/**
 * Filter Field Configuration
 */
export interface FilterField {
  field: string;
  operator: FilterOperator;
  value: any;
  alias?: string;
}

/**
 * Filter Configuration
 */
export interface FilterConfig {
  allowedFields: string[];
  fieldTypes?: Record<string, 'string' | 'number' | 'boolean' | 'date'>;
  fieldMapping?: Record<string, string>;
  searchFields?: string[]; // Fields to search in global search
  allowedOperators?: Record<string, FilterOperator[]>;
}

/**
 * Filter Result
 */
export interface FilterResult {
  fields: FilterField[];
  searchQuery?: {
    term: string;
    fields: string[];
  };
  sqlWhere?: string;
  sqlParams?: any[];
  prismaWhere?: Record<string, any>;
}

/**
 * Enhanced Filtering Utility
 * Provides comprehensive filtering functionality with type validation and security
 */
export class ApiFilteringUtil {
  /**
   * Parse filtering query parameters
   */
  static parseQuery(
    query: FilteringQuery,
    config: FilterConfig
  ): FilterResult {
    const {
      allowedFields,
      fieldTypes = {},
      fieldMapping = {},
      searchFields = [],
      allowedOperators = {}
    } = config;

    const fields: FilterField[] = [];
    let searchQuery: { term: string; fields: string[] } | undefined;

    // Handle global search
    if (query.search && searchFields.length > 0) {
      searchQuery = {
        term: query.search,
        fields: searchFields.filter(field => allowedFields.includes(field))
      };
    }

    // Handle structured filters
    if (query.filter) {
      // Check if filter is a string before parsing
      if (typeof query.filter === 'string') {
        const filters = this.parseFilterString(query.filter);
        for (const filter of filters) {
          if (this.isAllowedField(filter.field, allowedFields)) {
            const allowedOps = allowedOperators[filter.field] || Object.values(FilterOperator);
            if (allowedOps.includes(filter.operator)) {
              const validatedValue = this.validateValue(filter.value, fieldTypes[filter.field]);
              if (validatedValue !== null) {
                fields.push({
                  field: fieldMapping[filter.field] || filter.field,
                  operator: filter.operator,
                  value: validatedValue,
                  alias: filter.field !== (fieldMapping[filter.field] || filter.field) ? filter.field : undefined
                });
              }
            }
          }
        }
      } else if (typeof query.filter === 'object') {
        // Handle filter as object (similar to where object)
        const filterObject = this.parseWhereObject(query.filter, allowedFields, fieldMapping);
        fields.push(...filterObject);
      }
    }

    // Handle where object (for complex queries)
    if (query.where && typeof query.where === 'object') {
      const whereFilters = this.parseWhereObject(query.where, allowedFields, fieldMapping);
      fields.push(...whereFilters);
    }

    // Handle date range filters
    if (query.dateFrom || query.dateTo) {
      const dateField = 'createdAt'; // Default date field, should be configurable
      if (allowedFields.includes(dateField)) {
        if (query.dateFrom) {
          fields.push({
            field: fieldMapping[dateField] || dateField,
            operator: FilterOperator.GREATER_THAN_OR_EQUAL,
            value: new Date(query.dateFrom)
          });
        }
        if (query.dateTo) {
          fields.push({
            field: fieldMapping[dateField] || dateField,
            operator: FilterOperator.LESS_THAN_OR_EQUAL,
            value: new Date(query.dateTo)
          });
        }
      }
    }

    return {
      fields,
      searchQuery,
      sqlWhere: this.generateSqlWhere(fields, searchQuery),
      sqlParams: this.generateSqlParams(fields, searchQuery),
      prismaWhere: this.generatePrismaWhere(fields, searchQuery)
    };
  }

  /**
   * Parse filter string (e.g., "name:eq:John,age:gt:18")
   */
  private static parseFilterString(filterStr: string): Array<{
    field: string;
    operator: FilterOperator;
    value: any;
  }> {
    if (typeof filterStr !== 'string') return [];

    const filters: Array<{ field: string; operator: FilterOperator; value: any }> = [];
    const filterPairs = filterStr.split(',');

    for (const pair of filterPairs) {
      const parts = pair.split(':');
      if (parts.length >= 3) {
        const [field, operator, ...valueParts] = parts;
        const value = valueParts.join(':'); // Rejoin in case value contains colons

        if (Object.values(FilterOperator).includes(operator as FilterOperator)) {
          filters.push({
            field: field.trim(),
            operator: operator as FilterOperator,
            value: this.parseValue(value)
          });
        }
      }
    }

    return filters;
  }

  /**
   * Parse where object for complex queries
   */
  private static parseWhereObject(
    whereObj: any,
    allowedFields: string[],
    fieldMapping: Record<string, string>
  ): FilterField[] {
    const fields: FilterField[] = [];

    for (const [field, condition] of Object.entries(whereObj)) {
      if (!this.isAllowedField(field, allowedFields)) continue;

      const mappedField = fieldMapping[field] || field;

      if (typeof condition === 'object' && condition !== null) {
        // Handle operators like { age: { gt: 18, lt: 65 } }
        for (const [op, value] of Object.entries(condition)) {
          if (Object.values(FilterOperator).includes(op as FilterOperator)) {
            fields.push({
              field: mappedField,
              operator: op as FilterOperator,
              value,
              alias: field !== mappedField ? field : undefined
            });
          }
        }
      } else {
        // Handle simple equality { name: "John" }
        fields.push({
          field: mappedField,
          operator: FilterOperator.EQUALS,
          value: condition,
          alias: field !== mappedField ? field : undefined
        });
      }
    }

    return fields;
  }

  /**
   * Parse value from string
   */
  private static parseValue(value: string): any {
    // Handle null and undefined
    if (value === 'null' || value === 'NULL') return null;
    if (value === 'undefined') return undefined;

    // Handle boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Handle arrays (comma-separated values)
    if (value.includes(',')) {
      return value.split(',').map(v => this.parseValue(v.trim()));
    }

    // Handle numbers
    if (!isNaN(Number(value)) && value !== '') {
      return Number(value);
    }

    // Handle dates (ISO format)
    if (value.match(/^\d{4}-\d{2}-\d{2}/) || value.match(/^\d{4}-\d{2}-\d{2}T/)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date;
    }

    // Return as string
    return value;
  }

  /**
   * Validate field access
   */
  private static isAllowedField(field: string, allowedFields: string[]): boolean {
    return allowedFields.includes(field);
  }

  /**
   * Validate and convert value based on field type
   */
  private static validateValue(value: any, fieldType?: string): any {
    if (value === null || value === undefined) return value;

    switch (fieldType) {
      case 'number':
        const num = Number(value);
        return isNaN(num) ? null : num;
      
      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        return null;
      
      case 'date':
        if (value instanceof Date) return value;
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      
      case 'string':
      default:
        return String(value);
    }
  }

  /**
   * Generate SQL WHERE clause
   */
  private static generateSqlWhere(fields: FilterField[], searchQuery?: { term: string; fields: string[] }): string {
    const conditions: string[] = [];
    let paramIndex = 1;

    // Add field filters
    for (const field of fields) {
      const condition = this.generateSqlCondition(field, paramIndex);
      if (condition) {
        conditions.push(condition);
        paramIndex++;
      }
    }

    // Add search conditions
    if (searchQuery && searchQuery.fields.length > 0) {
      const searchConditions = searchQuery.fields.map(field => 
        `${field} ILIKE $${paramIndex}`
      );
      if (searchConditions.length > 0) {
        conditions.push(`(${searchConditions.join(' OR ')})`);
        paramIndex++;
      }
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  /**
   * Generate SQL condition for a single filter field
   */
  private static generateSqlCondition(field: FilterField, paramIndex: number): string {
    const { field: fieldName, operator } = field;

    switch (operator) {
      case FilterOperator.EQUALS:
        return `${fieldName} = $${paramIndex}`;
      case FilterOperator.NOT_EQUALS:
        return `${fieldName} != $${paramIndex}`;
      case FilterOperator.GREATER_THAN:
        return `${fieldName} > $${paramIndex}`;
      case FilterOperator.GREATER_THAN_OR_EQUAL:
        return `${fieldName} >= $${paramIndex}`;
      case FilterOperator.LESS_THAN:
        return `${fieldName} < $${paramIndex}`;
      case FilterOperator.LESS_THAN_OR_EQUAL:
        return `${fieldName} <= $${paramIndex}`;
      case FilterOperator.CONTAINS:
      case FilterOperator.LIKE:
        return `${fieldName} LIKE $${paramIndex}`;
      case FilterOperator.ILIKE:
        return `${fieldName} ILIKE $${paramIndex}`;
      case FilterOperator.STARTS_WITH:
        return `${fieldName} LIKE $${paramIndex}`;
      case FilterOperator.ENDS_WITH:
        return `${fieldName} LIKE $${paramIndex}`;
      case FilterOperator.IN:
        return `${fieldName} = ANY($${paramIndex})`;
      case FilterOperator.NOT_IN:
        return `${fieldName} != ALL($${paramIndex})`;
      case FilterOperator.IS_NULL:
        return `${fieldName} IS NULL`;
      case FilterOperator.IS_NOT_NULL:
        return `${fieldName} IS NOT NULL`;
      default:
        return '';
    }
  }

  /**
   * Generate SQL parameters array
   */
  private static generateSqlParams(fields: FilterField[], searchQuery?: { term: string; fields: string[] }): any[] {
    const params: any[] = [];

    // Add field parameters
    for (const field of fields) {
      let value = field.value;
      
      switch (field.operator) {
        case FilterOperator.CONTAINS:
        case FilterOperator.LIKE:
        case FilterOperator.ILIKE:
          value = `%${value}%`;
          break;
        case FilterOperator.STARTS_WITH:
          value = `${value}%`;
          break;
        case FilterOperator.ENDS_WITH:
          value = `%${value}`;
          break;
        case FilterOperator.IS_NULL:
        case FilterOperator.IS_NOT_NULL:
          continue; // No parameter needed
      }
      
      params.push(value);
    }

    // Add search parameter
    if (searchQuery) {
      params.push(`%${searchQuery.term}%`);
    }

    return params;
  }

  /**
   * Generate Prisma where object
   */
  private static generatePrismaWhere(fields: FilterField[], searchQuery?: { term: string; fields: string[] }): Record<string, any> {
    const where: Record<string, any> = {};
    const andConditions: any[] = [];

    // Add field filters
    for (const field of fields) {
      const condition = this.generatePrismaCondition(field);
      if (condition) {
        if (where[field.field]) {
          // If field already exists, combine conditions
          where[field.field] = { ...where[field.field], ...condition };
        } else {
          where[field.field] = condition;
        }
      }
    }

    // Add search conditions
    if (searchQuery && searchQuery.fields.length > 0) {
      const searchConditions = searchQuery.fields.map(field => ({
        [field]: {
          contains: searchQuery.term,
          mode: 'insensitive'
        }
      }));
      
      if (searchConditions.length > 0) {
        andConditions.push({ OR: searchConditions });
      }
    }

    // Combine all conditions
    if (andConditions.length > 0) {
      return {
        AND: [
          where,
          ...andConditions
        ]
      };
    }

    return where;
  }

  /**
   * Generate Prisma condition for a single filter field
   */
  private static generatePrismaCondition(field: FilterField): any {
    const { operator, value } = field;

    switch (operator) {
      case FilterOperator.EQUALS:
        return { equals: value };
      case FilterOperator.NOT_EQUALS:
        return { not: value };
      case FilterOperator.GREATER_THAN:
        return { gt: value };
      case FilterOperator.GREATER_THAN_OR_EQUAL:
        return { gte: value };
      case FilterOperator.LESS_THAN:
        return { lt: value };
      case FilterOperator.LESS_THAN_OR_EQUAL:
        return { lte: value };
      case FilterOperator.CONTAINS:
        return { contains: value, mode: 'insensitive' };
      case FilterOperator.NOT_CONTAINS:
        return { not: { contains: value, mode: 'insensitive' } };
      case FilterOperator.STARTS_WITH:
        return { startsWith: value };
      case FilterOperator.ENDS_WITH:
        return { endsWith: value };
      case FilterOperator.IN:
        return { in: Array.isArray(value) ? value : [value] };
      case FilterOperator.NOT_IN:
        return { notIn: Array.isArray(value) ? value : [value] };
      case FilterOperator.IS_NULL:
        return { equals: null };
      case FilterOperator.IS_NOT_NULL:
        return { not: null };
      case FilterOperator.BETWEEN:
        if (Array.isArray(value) && value.length === 2) {
          return { gte: value[0], lte: value[1] };
        }
        return {};
      default:
        return {};
    }
  }

  /**
   * Create filter configuration for common use cases
   */
  static createConfig(options: {
    allowedFields: string[];
    fieldTypes?: Record<string, 'string' | 'number' | 'boolean' | 'date'>;
    fieldMapping?: Record<string, string>;
    searchFields?: string[];
    allowedOperators?: Record<string, FilterOperator[]>;
  }): FilterConfig {
    return {
      allowedFields: options.allowedFields,
      fieldTypes: options.fieldTypes || {},
      fieldMapping: options.fieldMapping || {},
      searchFields: options.searchFields || [],
      allowedOperators: options.allowedOperators || {}
    };
  }
}

export default ApiFilteringUtil;
