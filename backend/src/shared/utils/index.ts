// ================================
// SHARED UTILITIES INDEX
// ================================

// Enhanced API Utilities
export { ApiResponseUtil, ResponseUtil } from './api-response.util';
export { default as ApiResponseUtilDefault } from './api-response.util';

export { ApiPaginationUtil, PaginationUtil } from './api-pagination.util';
export { default as ApiPaginationUtilDefault } from './api-pagination.util';

export { ApiSortingUtil, SortDirection } from './api-sorting.util';
export { default as ApiSortingUtilDefault } from './api-sorting.util';
export type { SortField, SortConfig, SortResult } from './api-sorting.util';

export { ApiFilteringUtil, FilterOperator } from './api-filtering.util';
export { default as ApiFilteringUtilDefault } from './api-filtering.util';
export type { FilterField, FilterConfig, FilterResult } from './api-filtering.util';

export { 
  ApiController, 
  ApiEndpoint, 
  ApiParam, 
  ApiProperty, 
  ApiSchema 
} from './api-documentation.util';
export { default as ApiDocumentationUtil } from './api-documentation.util';
export type {
  ApiEndpointDoc,
  ApiParameterDoc,
  ApiRequestBodyDoc,
  ApiResponseDoc,
  ApiSchemaDoc,
  OpenAPISpec
} from './api-documentation.util';

export { OpenAPIGenerator } from './openapi-generator.util';
export { default as OpenAPIGeneratorDefault } from './openapi-generator.util';
export type { OpenAPIConfig, RouteInfo } from './openapi-generator.util';

export { ApiSecurityUtil } from './api-security.util';
export { default as ApiSecurityUtilDefault } from './api-security.util';
export type {
  RateLimitConfig,
  CorsConfig,
  SecurityConfig,
  ApiKeyConfig
} from './api-security.util';

// Legacy exports (for backward compatibility)
export * from './api-error.util';
export * from './errors';
export * from './response';
export * from './response.util';
export * from './pagination.util';
