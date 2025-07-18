// ================================
// OPENAPI SPECIFICATION GENERATOR
// ================================

import { Router } from 'express';
import {
  OpenAPISpec,
  ApiEndpointDoc,
  ApiSchemaDoc,
  ApiSchemaReference
} from './api-documentation.util';

/**
 * OpenAPI Generator Configuration
 */
export interface OpenAPIConfig {
  title: string;
  version: string;
  description?: string;
  baseUrl: string;
  contact?: {
    name?: string;
    email?: string;
    url?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
  tags?: Array<{
    name: string;
    description?: string;
  }>;
}

/**
 * Route Information for OpenAPI Generation
 */
export interface RouteInfo {
  method: string;
  path: string;
  handler: any;
  middleware?: any[];
}

/**
 * OpenAPI Specification Generator
 * Generates OpenAPI 3.0 specification from Express routes and decorators
 */
export class OpenAPIGenerator {
  private config: OpenAPIConfig;
  private routes: RouteInfo[] = [];
  private schemas: Map<string, ApiSchemaDoc | ApiSchemaReference> = new Map();

  constructor(config: OpenAPIConfig) {
    this.config = config;
  }

  /**
   * Add routes from Express Router
   */
  addRouter(router: Router, basePath: string = ''): this {
    // Extract routes from router stack
    const extractRoutes = (layer: any, path: string = '') => {
      if (layer.route) {
        // Regular route
        const routePath = basePath + path + layer.route.path;
        const methods = Object.keys(layer.route.methods);
        
        methods.forEach(method => {
          if (method !== '_all') {
            this.routes.push({
              method: method.toUpperCase(),
              path: this.normalizePath(routePath),
              handler: layer.route.stack[0]?.handle,
              middleware: layer.route.stack.slice(1).map((s: any) => s.handle)
            });
          }
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // Nested router
        const nestedPath = path + layer.regexp.source
          .replace('\\/', '/')
          .replace('(?=\\/|$)', '')
          .replace('^', '');
        
        layer.handle.stack.forEach((nestedLayer: any) => {
          extractRoutes(nestedLayer, nestedPath);
        });
      }
    };

    router.stack.forEach((layer: any) => {
      extractRoutes(layer);
    });

    return this;
  }

  /**
   * Add manual route information
   */
  addRoute(route: RouteInfo): this {
    this.routes.push({
      ...route,
      path: this.normalizePath(route.path)
    });
    return this;
  }

  /**
   * Add API schema
   */
  addSchema(name: string, schema: ApiSchemaDoc | ApiSchemaReference): this {
    this.schemas.set(name, schema);
    return this;
  }

  /**
   * Generate OpenAPI specification
   */
  generate(): OpenAPISpec {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: this.config.title,
        version: this.config.version,
        description: this.config.description,
        ...(this.config.contact && { contact: this.config.contact }),
        ...(this.config.license && { license: this.config.license })
      },
      servers: [
        {
          url: this.config.baseUrl,
          description: 'API Server'
        }
      ],
      ...(this.config.tags && { tags: this.config.tags }),
      paths: this.generatePaths(),
      components: {
        schemas: this.generateSchemas(),
        securitySchemes: this.generateSecuritySchemes(),
        parameters: this.generateCommonParameters(),
        responses: this.generateCommonResponses()
      },
      security: [
        {
          BearerAuth: []
        }
      ]
    };

    return spec;
  }

  /**
   * Generate paths object
   */
  private generatePaths(): Record<string, Record<string, any>> {
    const paths: Record<string, Record<string, any>> = {};

    this.routes.forEach(route => {
      const { method, path, handler } = route;
      
      if (!paths[path]) {
        paths[path] = {};
      }

      // Try to get documentation from handler metadata
      const endpointDoc = this.getEndpointDocumentation(handler);
      
      paths[path][method.toLowerCase()] = {
        summary: endpointDoc?.summary || `${method} ${path}`,
        description: endpointDoc?.description,
        tags: endpointDoc?.tags || this.inferTags(path),
        operationId: endpointDoc?.operationId || `${method.toLowerCase()}${this.pathToOperationId(path)}`,
        parameters: this.generateParameters(path, endpointDoc),
        ...(method !== 'GET' && method !== 'DELETE' && {
          requestBody: this.generateRequestBody(endpointDoc)
        }),
        responses: this.generateResponses(endpointDoc),
        ...(endpointDoc?.deprecated && { deprecated: true }),
        ...(endpointDoc?.security && { security: endpointDoc.security })
      };
    });

    return paths;
  }

  /**
   * Generate parameters for a path
   */
  private generateParameters(path: string, endpointDoc?: ApiEndpointDoc): any[] {
    const parameters: any[] = [];

    // Add path parameters
    const pathParams = path.match(/:(\w+)/g);
    if (pathParams) {
      pathParams.forEach(param => {
        const paramName = param.substring(1);
        const docParam = endpointDoc?.parameters?.find(p => p.name === paramName && p.in === 'path');
        
        parameters.push({
          name: paramName,
          in: 'path',
          required: true,
          schema: docParam?.schema || { type: 'string' },
          description: docParam?.description || `${paramName} parameter`
        });
      });
    }

    // Add documented parameters
    if (endpointDoc?.parameters) {
      endpointDoc.parameters.forEach(param => {
        if (param.in !== 'path' || !pathParams?.includes(`:${param.name}`)) {
          parameters.push(param);
        }
      });
    }

    // Add common query parameters for GET requests
    const hasGetMethod = this.routes.some(r => r.path === path && r.method === 'GET');
    if (hasGetMethod) {
      parameters.push(
        {
          $ref: '#/components/parameters/PageParam'
        },
        {
          $ref: '#/components/parameters/LimitParam'
        },
        {
          $ref: '#/components/parameters/SortParam'
        },
        {
          $ref: '#/components/parameters/SearchParam'
        }
      );
    }

    return parameters;
  }

  /**
   * Generate request body
   */
  private generateRequestBody(endpointDoc?: ApiEndpointDoc): any {
    if (endpointDoc?.requestBody) {
      return endpointDoc.requestBody;
    }

    return {
      description: 'Request body',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object'
          }
        }
      }
    };
  }

  /**
   * Generate responses
   */
  private generateResponses(endpointDoc?: ApiEndpointDoc): Record<string, any> {
    if (endpointDoc?.responses) {
      return endpointDoc.responses;
    }

    return {
      '200': {
        $ref: '#/components/responses/SuccessResponse'
      },
      '400': {
        $ref: '#/components/responses/BadRequestResponse'
      },
      '401': {
        $ref: '#/components/responses/UnauthorizedResponse'
      },
      '403': {
        $ref: '#/components/responses/ForbiddenResponse'
      },
      '404': {
        $ref: '#/components/responses/NotFoundResponse'
      },
      '500': {
        $ref: '#/components/responses/InternalErrorResponse'
      }
    };
  }

  /**
   * Generate schemas object
   */
  private generateSchemas(): Record<string, ApiSchemaDoc | ApiSchemaReference> {
    const schemas: Record<string, ApiSchemaDoc | ApiSchemaReference> = {};

    // Add custom schemas
    this.schemas.forEach((schema, name) => {
      schemas[name] = schema;
    });

    // Add global schemas if available
    if (global._apiSchemas) {
      global._apiSchemas.forEach((schema, name) => {
        schemas[name] = schema;
      });
    }

    // Add standard response schemas
    schemas.ApiSuccessResponse = {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        timestamp: { type: 'string', format: 'date-time' },
        requestId: { type: 'string', format: 'uuid' },
        version: { type: 'string', example: '1.0.0' },
        data: { type: 'object' },
        message: { type: 'string' },
        meta: { $ref: '#/components/schemas/ApiResponseMeta' }
      },
      required: ['success', 'timestamp', 'data']
    };

    schemas.ApiErrorResponse = {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        timestamp: { type: 'string', format: 'date-time' },
        requestId: { type: 'string', format: 'uuid' },
        version: { type: 'string', example: '1.0.0' },
        error: { $ref: '#/components/schemas/ApiError' },
        path: { type: 'string' },
        method: { type: 'string' }
      },
      required: ['success', 'timestamp', 'error']
    };

    schemas.ApiPaginatedResponse = {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        timestamp: { type: 'string', format: 'date-time' },
        requestId: { type: 'string', format: 'uuid' },
        version: { type: 'string', example: '1.0.0' },
        data: { type: 'array', items: { type: 'object' } },
        message: { type: 'string' },
        meta: { $ref: '#/components/schemas/PaginationMeta' }
      },
      required: ['success', 'timestamp', 'data', 'meta']
    };

    schemas.ApiResponseMeta = {
      type: 'object',
      properties: {
        timestamp: { type: 'string', format: 'date-time' },
        processingTime: { type: 'number' },
        source: { type: 'string' }
      }
    };

    schemas.ApiError = {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        details: { type: 'object' },
        stack: { type: 'string' }
      },
      required: ['code', 'message']
    };

    schemas.PaginationMeta = {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1 },
        limit: { type: 'integer', minimum: 1 },
        total: { type: 'integer', minimum: 0 },
        totalPages: { type: 'integer', minimum: 0 },
        hasNext: { type: 'boolean' },
        hasPrevious: { type: 'boolean' },
        links: { $ref: '#/components/schemas/PaginationLinks' }
      },
      required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrevious']
    };

    schemas.PaginationLinks = {
      type: 'object',
      properties: {
        first: { type: 'string', format: 'uri' },
        previous: { type: 'string', format: 'uri' },
        current: { type: 'string', format: 'uri' },
        next: { type: 'string', format: 'uri' },
        last: { type: 'string', format: 'uri' }
      },
      required: ['current']
    };

    return schemas;
  }

  /**
   * Generate security schemes
   */
  private generateSecuritySchemes(): Record<string, any> {
    return {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key authorization header'
      }
    };
  }

  /**
   * Generate common parameters
   */
  private generateCommonParameters(): Record<string, any> {
    return {
      PageParam: {
        name: 'page',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        },
        description: 'Page number for pagination'
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20
        },
        description: 'Number of items per page'
      },
      SortParam: {
        name: 'sort',
        in: 'query',
        required: false,
        schema: {
          type: 'string'
        },
        description: 'Sort criteria in the format: field:direction,field:direction'
      },
      SearchParam: {
        name: 'search',
        in: 'query',
        required: false,
        schema: {
          type: 'string'
        },
        description: 'Search term for filtering results'
      }
    };
  }

  /**
   * Generate common responses
   */
  private generateCommonResponses(): Record<string, any> {
    return {
      SuccessResponse: {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiSuccessResponse'
            }
          }
        }
      },
      BadRequestResponse: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiErrorResponse'
            }
          }
        }
      },
      UnauthorizedResponse: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiErrorResponse'
            }
          }
        }
      },
      ForbiddenResponse: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiErrorResponse'
            }
          }
        }
      },
      NotFoundResponse: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiErrorResponse'
            }
          }
        }
      },
      InternalErrorResponse: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiErrorResponse'
            }
          }
        }
      }
    };
  }

  /**
   * Get endpoint documentation from handler metadata
   */
  private getEndpointDocumentation(handler: any): ApiEndpointDoc | undefined {
    if (handler && handler._apiDoc && handler._apiDoc.endpoints) {
      // Get the first endpoint documentation (assumes one per handler)
      const entries = Array.from(handler._apiDoc.endpoints.entries()) as Array<[string, ApiEndpointDoc]>;
      return entries.length > 0 ? entries[0][1] : undefined;
    }
    return undefined;
  }

  /**
   * Infer tags from path
   */
  private inferTags(path: string): string[] {
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
      // Use the first segment as tag
      const tag = segments[0].replace(/[^a-zA-Z0-9]/g, '');
      return [tag.charAt(0).toUpperCase() + tag.slice(1)];
    }
    return ['API'];
  }

  /**
   * Convert path to operation ID
   */
  private pathToOperationId(path: string): string {
    return path
      .split('/')
      .filter(Boolean)
      .map(segment => segment.replace(/[^a-zA-Z0-9]/g, ''))
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
  }

  /**
   * Normalize path for OpenAPI
   */
  private normalizePath(path: string): string {
    // Convert Express-style parameters (:id) to OpenAPI style ({id})
    return path.replace(/:(\w+)/g, '{$1}');
  }

  /**
   * Export specification to JSON file
   */
  async exportToFile(filePath: string): Promise<void> {
    const spec = this.generate();
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, JSON.stringify(spec, null, 2));
  }

  /**
   * Export specification to YAML file
   */
  async exportToYaml(filePath: string): Promise<void> {
    const spec = this.generate();
    const yaml = await import('yaml');
    const yamlString = yaml.stringify(spec);
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, yamlString);
  }
}

export default OpenAPIGenerator;
