// ================================
// API DOCUMENTATION TYPES & DECORATORS
// ================================

/**
 * API Endpoint Documentation
 */
export interface ApiEndpointDoc {
  summary: string;
  description?: string;
  tags?: string[];
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  operationId?: string;
  deprecated?: boolean;
  security?: Array<Record<string, string[]>>;
  parameters?: ApiParameterDoc[];
  requestBody?: ApiRequestBodyDoc;
  responses: Record<string, ApiResponseDoc>;
  examples?: Record<string, any>;
}

/**
 * API Parameter Documentation
 */
export interface ApiParameterDoc {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required: boolean;
  schema: ApiSchemaDoc | ApiSchemaReference;
  description?: string;
  example?: any;
  deprecated?: boolean;
}

/**
 * API Request Body Documentation
 */
export interface ApiRequestBodyDoc {
  description?: string;
  required: boolean;
  content: Record<string, {
    schema: ApiSchemaDoc | ApiSchemaReference;
    example?: any;
    examples?: Record<string, any>;
  }>;
}

/**
 * API Response Documentation
 */
export interface ApiResponseDoc {
  description: string;
  headers?: Record<string, ApiHeaderDoc>;
  content?: Record<string, {
    schema: ApiSchemaDoc | ApiSchemaReference;
    example?: any;
    examples?: Record<string, any>;
  }>;
}

/**
 * API Header Documentation
 */
export interface ApiHeaderDoc {
  description?: string;
  required?: boolean;
  schema: ApiSchemaDoc | ApiSchemaReference;
  example?: any;
}

/**
 * API Schema Documentation
 */
export interface ApiSchemaDoc {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  format?: string;
  description?: string;
  enum?: any[];
  items?: ApiSchemaDoc | ApiSchemaReference;
  properties?: Record<string, ApiSchemaDoc | ApiSchemaReference>;
  required?: string[];
  example?: any;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  $ref?: string;
}

/**
 * API Schema Reference
 */
export interface ApiSchemaReference {
  $ref: string;
}

/**
 * OpenAPI Specification
 */
export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: {
      name?: string;
      email?: string;
      url?: string;
    };
    license?: {
      name: string;
      url?: string;
    };
  };
  servers: Array<{
    url: string;
    description?: string;
  }>;
  tags?: Array<{
    name: string;
    description?: string;
  }>;
  paths: Record<string, Record<string, any>>;
  components?: {
    schemas?: Record<string, ApiSchemaDoc | ApiSchemaReference>;
    securitySchemes?: Record<string, any>;
    parameters?: Record<string, ApiParameterDoc>;
    responses?: Record<string, ApiResponseDoc>;
    examples?: Record<string, any>;
  };
  security?: Array<Record<string, string[]>>;
}

/**
 * API Documentation Decorator Metadata
 */
export interface ApiDocMetadata {
  endpoints: Map<string, ApiEndpointDoc>;
  schemas: Map<string, ApiSchemaDoc | ApiSchemaReference>;
  tags: string[];
}

/**
 * Class decorator for API documentation
 */
export function ApiController(tag: string, description?: string) {
  return function (target: any) {
    if (!target.prototype._apiDoc) {
      target.prototype._apiDoc = { endpoints: new Map(), schemas: new Map(), tags: [] };
    }
    target.prototype._apiDoc.tags.push({ name: tag, description });
  };
}

/**
 * Method decorator for API endpoint documentation
 */
export function ApiEndpoint(doc: Partial<ApiEndpointDoc>) {
  return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
    if (!target._apiDoc) {
      target._apiDoc = { endpoints: new Map(), schemas: new Map(), tags: [] };
    }
    
    const endpoint: ApiEndpointDoc = {
      summary: doc.summary || propertyKey,
      method: doc.method || 'GET',
      path: doc.path || `/${propertyKey}`,
      responses: doc.responses || {
        '200': {
          description: 'Success',
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        }
      },
      ...doc
    };

    target._apiDoc.endpoints.set(propertyKey, endpoint);
  };
}

/**
 * Parameter decorator for API parameter documentation
 */
export function ApiParam(param: Omit<ApiParameterDoc, 'in'> & { in?: 'query' | 'path' | 'header' }) {
  return function (target: any, propertyKey: string, _parameterIndex: number) {
    if (!target._apiDoc) {
      target._apiDoc = { endpoints: new Map(), schemas: new Map(), tags: [] };
    }

    const endpoint = target._apiDoc.endpoints.get(propertyKey);
    if (endpoint) {
      if (!endpoint.parameters) endpoint.parameters = [];
      endpoint.parameters.push({
        in: param.in || 'query',
        ...param
      } as ApiParameterDoc);
    }
  };
}

/**
 * Property decorator for API schema documentation
 */
export function ApiProperty(schema: Partial<ApiSchemaDoc>) {
  return function (target: any, propertyKey: string) {
    if (!target.constructor._apiSchemas) {
      target.constructor._apiSchemas = new Map();
    }
    
    target.constructor._apiSchemas.set(propertyKey, schema);
  };
}

/**
 * Global API Schemas Storage
 */
declare global {
  var _apiSchemas: Map<string, ApiSchemaDoc> | undefined;
}

/**
 * Class decorator for API schema documentation
 */
export function ApiSchema(name: string, description?: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T & { _apiSchemas?: Map<string, any> }) {
    const properties: Record<string, ApiSchemaDoc> = {};
    const required: string[] = [];

    // Collect properties from class metadata
    if (constructor._apiSchemas) {
      for (const [key, schema] of constructor._apiSchemas) {
        properties[key] = schema as ApiSchemaDoc;
        if (schema.required !== false) {
          required.push(key);
        }
      }
    }

    const schemaDoc: ApiSchemaDoc = {
      type: 'object',
      description,
      properties,
      required: required.length > 0 ? required : undefined
    };

    // Store schema globally
    if (!global._apiSchemas) {
      global._apiSchemas = new Map();
    }
    global._apiSchemas.set(name, schemaDoc);

    return constructor;
  };
}

export default {
  ApiController,
  ApiEndpoint,
  ApiParam,
  ApiProperty,
  ApiSchema
};
