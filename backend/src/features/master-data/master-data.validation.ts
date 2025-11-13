// # START OF Master Data Validation - Validation schemas for master data
// Purpose: Define validation schemas for farmer groups, commodities, pest types
// Dependencies: Zod validation library
// Returns: Validation schemas for master data operations

import { z } from 'zod';

// ================================================
// FARMER GROUP VALIDATION
// ================================================

export const farmerGroupSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters')
    .regex(/^[a-zA-Z0-9\s.-]+$/, 'Name contains invalid characters'),
  
  leader: z.string()
    .min(1, 'Leader name is required')
    .max(255, 'Leader name cannot exceed 255 characters')
    .regex(/^[a-zA-Z\s.-]+$/, 'Leader name contains invalid characters'),
  
  district: z.string()
    .min(1, 'District is required')
    .max(100, 'District cannot exceed 100 characters'),
  
  village: z.string()
    .min(1, 'Village is required')
    .max(100, 'Village cannot exceed 100 characters'),
  
  memberCount: z.number()
    .int('Member count must be an integer')
    .min(0, 'Member count cannot be negative')
    .max(9999, 'Member count cannot exceed 9999'),
  
  establishedDate: z.string()
    .datetime('Invalid date format'),
  
  contactInfo: z.object({
    phone: z.string()
      .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
      .optional(),
    email: z.string()
      .email('Invalid email format')
      .optional()
  }).optional()
});

// ================================================
// COMMODITY VALIDATION
// ================================================

export const commoditySchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters')
    .regex(/^[a-zA-Z0-9\s.-]+$/, 'Name contains invalid characters'),
  
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category cannot exceed 100 characters'),
  
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  
  commonPestTypes: z.array(z.string())
    .max(20, 'Cannot have more than 20 common pest types')
    .optional()
});

// ================================================
// PEST TYPE VALIDATION
// ================================================

export const pestTypeSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters')
    .regex(/^[a-zA-Z0-9\s.-]+$/, 'Name contains invalid characters'),
  
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category cannot exceed 100 characters'),
  
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  
  affectedCommodities: z.array(z.string())
    .max(20, 'Cannot have more than 20 affected commodities')
    .optional(),
  
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .default('MEDIUM')
});

// ================================================
// DISTRICT VALIDATION
// ================================================

export const districtSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  
  code: z.string()
    .max(10, 'Code cannot exceed 10 characters')
    .optional(),
  
  province: z.string()
    .max(100, 'Province cannot exceed 100 characters')
    .optional()
});

// ================================================
// VILLAGE VALIDATION
// ================================================

export const villageSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  
  district: z.string()
    .min(1, 'District is required')
    .max(100, 'District cannot exceed 100 characters'),
  
  code: z.string()
    .max(10, 'Code cannot exceed 10 characters')
    .optional()
});

// ================================================
// QUERY PARAMETER VALIDATION
// ================================================

export const farmerGroupQuerySchema = z.object({
  district: z.string().optional(),
  village: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

export const commodityQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

export const pestTypeQuerySchema = z.object({
  category: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

// ================================================
// EXPORTED VALIDATION OBJECT
// ================================================

export const validateMasterData = {
  farmerGroup: farmerGroupSchema,
  commodity: commoditySchema,
  pestType: pestTypeSchema,
  district: districtSchema,
  village: villageSchema,
  farmerGroupQuery: farmerGroupQuerySchema,
  commodityQuery: commodityQuerySchema,
  pestTypeQuery: pestTypeQuerySchema
};

// # END OF Master Data Validation
