// src/features/inventory/inventory.validation.ts
import { z } from 'zod';
import { MedicineStatus } from '@prisma/client';
import { MovementType } from './inventory.types';

// Define missing enums
export enum MedicineCategory {
  ANTIBIOTICS = 'ANTIBIOTICS',
  PAINKILLERS = 'PAINKILLERS',
  VITAMINS = 'VITAMINS',
  SUPPLEMENTS = 'SUPPLEMENTS',
  ANTISEPTICS = 'ANTISEPTICS',
  OTHER = 'OTHER'
}

export enum MedicineType {
  TABLET = 'TABLET',
  CAPSULE = 'CAPSULE',
  LIQUID = 'LIQUID',
  INJECTION = 'INJECTION',
  CREAM = 'CREAM',
  OINTMENT = 'OINTMENT',
  OTHER = 'OTHER'
}

export enum StockStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  EXPIRED = 'EXPIRED'
}

// Packaging validation
const packagingInfoSchema = z.object({
  unitSize: z.number().positive('Unit size must be positive'),
  unitType: z.string().min(1, 'Unit type is required'),
  packageType: z.string().min(1, 'Package type is required'),
  packageSize: z.number().positive('Package size must be positive')
});

// Medicine validation schemas
export const createMedicineSchema = z.object({
  name: z.string()
    .min(1, 'Medicine name is required')
    .max(200, 'Medicine name too long'),
  brand: z.string()
    .min(1, 'Brand is required')
    .max(100, 'Brand name too long'),
  category: z.nativeEnum(MedicineCategory, {
    errorMap: () => ({ message: 'Invalid medicine category' })
  }),
  type: z.nativeEnum(MedicineType, {
    errorMap: () => ({ message: 'Invalid medicine type' })
  }),
  activeIngredient: z.string()
    .min(1, 'Active ingredient is required')
    .max(200, 'Active ingredient name too long'),
  activeIngredientCode: z.string()
    .min(1, 'Active ingredient code is required')
    .max(10, 'Active ingredient code too long')
    .regex(/^[A-Z0-9]+$/, 'Active ingredient code must be alphanumeric uppercase'),
  producer: z.string()
    .min(1, 'Producer is required')
    .max(100, 'Producer name too long'),
  producerCode: z.string()
    .min(1, 'Producer code is required')
    .max(5, 'Producer code too long')
    .regex(/^[A-Z]+$/, 'Producer code must be uppercase letters'),
  description: z.string()
    .max(1000, 'Description too long')
    .optional(),
  instruction: z.string()
    .max(2000, 'Instruction too long')
    .optional(),
  sideEffects: z.string()
    .max(1000, 'Side effects description too long')
    .optional(),
  dosage: z.string()
    .max(500, 'Dosage description too long')
    .optional(),
  packaging: packagingInfoSchema
});

export const updateMedicineSchema = z.object({
  name: z.string()
    .min(1, 'Medicine name is required')
    .max(200, 'Medicine name too long')
    .optional(),
  brand: z.string()
    .min(1, 'Brand is required')
    .max(100, 'Brand name too long')
    .optional(),
  category: z.nativeEnum(MedicineCategory, {
    errorMap: () => ({ message: 'Invalid medicine category' })
  }).optional(),
  type: z.nativeEnum(MedicineType, {
    errorMap: () => ({ message: 'Invalid medicine type' })
  }).optional(),
  activeIngredient: z.string()
    .min(1, 'Active ingredient is required')
    .max(200, 'Active ingredient name too long')
    .optional(),
  activeIngredientCode: z.string()
    .min(1, 'Active ingredient code is required')
    .max(10, 'Active ingredient code too long')
    .regex(/^[A-Z0-9]+$/, 'Active ingredient code must be alphanumeric uppercase')
    .optional(),
  producer: z.string()
    .min(1, 'Producer is required')
    .max(100, 'Producer name too long')
    .optional(),
  producerCode: z.string()
    .min(1, 'Producer code is required')
    .max(5, 'Producer code too long')
    .regex(/^[A-Z]+$/, 'Producer code must be uppercase letters')
    .optional(),
  description: z.string()
    .max(1000, 'Description too long')
    .optional(),
  instruction: z.string()
    .max(2000, 'Instruction too long')
    .optional(),
  sideEffects: z.string()
    .max(1000, 'Side effects description too long')
    .optional(),
  dosage: z.string()
    .max(500, 'Dosage description too long')
    .optional(),
  packaging: packagingInfoSchema.optional(),
  status: z.nativeEnum(MedicineStatus, {
    errorMap: () => ({ message: 'Invalid medicine status' })
  }).optional()
});

// Stock validation schemas
export const createMedicineStockSchema = z.object({
  medicineId: z.string().uuid('Invalid medicine ID'),
  batchNumber: z.string()
    .min(1, 'Batch number is required')
    .max(50, 'Batch number too long'),
  manufactureDate: z.coerce.date({
    errorMap: () => ({ message: 'Invalid manufacture date' })
  }),
  expiryDate: z.coerce.date({
    errorMap: () => ({ message: 'Invalid expiry date' })
  }),
  initialStock: z.number()
    .positive('Initial stock must be positive')
    .max(999999, 'Initial stock too large'),
  unitCost: z.number()
    .positive('Unit cost must be positive')
    .max(999999999, 'Unit cost too large')
    .optional(),
  supplierId: z.string().uuid('Invalid supplier ID').optional(),
  supplierName: z.string()
    .min(1, 'Supplier name is required')
    .max(200, 'Supplier name too long')
    .optional(),
  receivedDate: z.coerce.date({
    errorMap: () => ({ message: 'Invalid received date' })
  }),
  notes: z.string()
    .max(1000, 'Notes too long')
    .optional()
}).refine(data => data.expiryDate > data.manufactureDate, {
  message: 'Expiry date must be after manufacture date',
  path: ['expiryDate']
}).refine(data => data.receivedDate >= data.manufactureDate, {
  message: 'Received date cannot be before manufacture date',
  path: ['receivedDate']
});

export const updateMedicineStockSchema = z.object({
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(-999999, 'Quantity adjustment too large (negative)')
    .max(999999, 'Quantity adjustment too large (positive)'),
  reason: z.string()
    .min(1, 'Reason is required')
    .max(500, 'Reason too long'),
  type: z.nativeEnum(MovementType, {
    errorMap: () => ({ message: 'Invalid movement type' })
  }),
  notes: z.string()
    .max(1000, 'Notes too long')
    .optional()
});

// Query validation schemas
export const medicineQuerySchema = z.object({
  search: z.string().max(200, 'Search term too long').optional(),
  category: z.nativeEnum(MedicineCategory).optional(),
  type: z.nativeEnum(MedicineType).optional(),
  status: z.nativeEnum(MedicineStatus).optional(),
  producer: z.string().max(100).optional(),
  activeIngredient: z.string().max(200).optional(),
  sortBy: z.enum(['name', 'brand', 'category', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const stockQuerySchema = z.object({
  medicineId: z.string().uuid().optional(),
  status: z.nativeEnum(StockStatus).optional(),
  lowStock: z.coerce.boolean().optional(),
  expiringSoon: z.coerce.boolean().optional(),
  expired: z.coerce.boolean().optional(),
  batchNumber: z.string().max(50).optional(),
  supplierId: z.string().uuid().optional(),
  sortBy: z.enum(['expiryDate', 'currentStock', 'receivedDate', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const movementQuerySchema = z.object({
  medicineStockId: z.string().uuid().optional(),
  type: z.nativeEnum(MovementType).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  performedBy: z.string().uuid().optional(),
  sortBy: z.enum(['performedAt', 'quantity', 'type']).default('performedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
}).refine(data => {
  if (data.dateFrom && data.dateTo) {
    return data.dateTo >= data.dateFrom;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['dateTo']
});

// ID validation
export const uuidSchema = z.string().uuid('Invalid ID format');

// Bulk operations validation
export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid('Invalid ID format'))
    .min(1, 'At least one ID is required')
    .max(50, 'Too many IDs (max 50)')
});

export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string().uuid('Invalid ID format'))
    .min(1, 'At least one ID is required')
    .max(50, 'Too many IDs (max 50)'),
  status: z.nativeEnum(MedicineStatus, {
    errorMap: () => ({ message: 'Invalid status' })
  })
});

// Export type inference
export type CreateMedicineSchema = z.infer<typeof createMedicineSchema>;
export type UpdateMedicineSchema = z.infer<typeof updateMedicineSchema>;
export type CreateMedicineStockSchema = z.infer<typeof createMedicineStockSchema>;
export type UpdateMedicineStockSchema = z.infer<typeof updateMedicineStockSchema>;
export type MedicineQuerySchema = z.infer<typeof medicineQuerySchema>;
export type StockQuerySchema = z.infer<typeof stockQuerySchema>;
export type MovementQuerySchema = z.infer<typeof movementQuerySchema>;
