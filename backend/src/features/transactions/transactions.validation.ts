/**
 * Transaction Validation Schemas
 * Comprehensive validation with conditional rules based on transaction type and source
 */

import { z } from 'zod';
import { 
  TransactionType, 
  TransactionSource, 
  TransactionStatus
} from './transactions.types';

// Base schemas
export const transactionNumberSchema = z.string()
  .regex(/^TRX-\d{4}-\d{2}-\d{2}-\d{3}$/, 'Invalid transaction number format');

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const positiveNumberSchema = z.number().positive('Must be a positive number');

export const optionalPositiveNumberSchema = z.number().positive().optional();

// Enum schemas
export const transactionTypeSchema = z.nativeEnum(TransactionType);
export const transactionSourceSchema = z.nativeEnum(TransactionSource);
export const transactionStatusSchema = z.nativeEnum(TransactionStatus);

// Stock movement type enum (local definition since it's not in types)
export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER'
}

export const stockMovementTypeSchema = z.nativeEnum(StockMovementType);

// Transaction Item schemas
export const createTransactionItemSchema = z.object({
  medicineId: uuidSchema,
  requestedQuantity: positiveNumberSchema,
  notes: z.string().max(500).optional()
});

export const processTransactionItemSchema = z.object({
  transactionItemId: uuidSchema,
  processedQuantity: positiveNumberSchema,
  qrCodes: z.array(z.string()).optional(),
  batchNumbers: z.array(z.string()).optional(),
  expiryDates: z.array(z.coerce.date()).optional(),
  notes: z.string().max(500).optional()
});

// Main transaction schemas
export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  source: transactionSourceSchema,
  submissionId: uuidSchema.optional(),
  
  // Target information
  targetDistrict: z.string().min(1).max(100).optional(),
  targetSubDistrict: z.string().min(1).max(100).optional(),
  targetVillage: z.string().min(1).max(100).optional(),
  targetAddress: z.string().max(500).optional(),
  targetContact: z.string().max(100).optional(),
  targetPIC: z.string().max(100).optional(),
  
  // Documents (conditional validation will be applied in service)
  requestLetter: z.string().optional(),
  
  // Delivery information
  deliveryMethod: z.string().max(50).optional(),
  deliveryDate: z.coerce.date().optional(),
  deliveryAddress: z.string().max(500).optional(),
  deliveryNotes: z.string().max(500).optional(),
  
  // Additional fields
  notes: z.string().max(1000).optional(),
  priority: z.number().min(1).max(5).default(3),
  isUrgent: z.boolean().default(false),
  isEmergency: z.boolean().default(false),
  
  // Items
  items: z.array(createTransactionItemSchema).min(1, 'At least one item is required')
})
.refine((data) => {
  // Conditional validation: PPL submissions must have submissionId
  if (data.source === TransactionSource.PPL_SUBMISSION) {
    return !!data.submissionId;
  }
  return true;
}, {
  message: 'submissionId is required for PPL submissions',
  path: ['submissionId']
})
.refine((data) => {
  // Emergency transactions must have higher priority
  if (data.isEmergency) {
    return data.priority <= 2;
  }
  return true;
}, {
  message: 'Emergency transactions must have priority 1 or 2',
  path: ['priority']
});

export const updateTransactionSchema = z.object({
  targetDistrict: z.string().min(1).max(100).optional(),
  targetSubDistrict: z.string().min(1).max(100).optional(),
  targetVillage: z.string().min(1).max(100).optional(),
  targetAddress: z.string().max(500).optional(),
  targetContact: z.string().max(100).optional(),
  targetPIC: z.string().max(100).optional(),
  deliveryMethod: z.string().max(50).optional(),
  deliveryDate: z.coerce.date().optional(),
  deliveryAddress: z.string().max(500).optional(),
  deliveryNotes: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  priority: z.number().min(1).max(5).optional(),
  isUrgent: z.boolean().optional(),
  isEmergency: z.boolean().optional()
});

export const processTransactionSchema = z.object({
  items: z.array(processTransactionItemSchema).min(1, 'At least one item is required'),
  deliveryNote: z.string().optional(),
  notes: z.string().max(1000).optional()
});

export const completeTransactionSchema = z.object({
  receivingProof: z.string().optional(),
  completionNotes: z.string().max(1000).optional(),
  additionalDocuments: z.array(z.string()).optional()
});

export const approveTransactionSchema = z.object({
  approvalNotes: z.string().max(1000).optional(),
  itemAdjustments: z.array(z.object({
    transactionItemId: uuidSchema,
    approvedQuantity: positiveNumberSchema,
    adjustmentReason: z.string().max(500).optional()
  })).optional()
});

export const rejectTransactionSchema = z.object({
  rejectionReason: z.string().min(1).max(1000)
});

// Query schemas
export const transactionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  type: transactionTypeSchema.optional(),
  source: transactionSourceSchema.optional(),
  status: transactionStatusSchema.optional(),
  requestedBy: uuidSchema.optional(),
  processedBy: uuidSchema.optional(),
  approvedBy: uuidSchema.optional(),
  targetDistrict: z.string().optional(),
  priority: z.coerce.number().min(1).max(5).optional(),
  isUrgent: z.coerce.boolean().optional(),
  isEmergency: z.coerce.boolean().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  submissionId: uuidSchema.optional(),
  medicineId: uuidSchema.optional()
});

// Stock movement schemas
export const createStockMovementSchema = z.object({
  transactionItemId: uuidSchema,
  medicineId: uuidSchema,
  movementType: stockMovementTypeSchema,
  quantity: positiveNumberSchema,
  previousStock: z.number().min(0),
  newStock: z.number().min(0),
  unitCost: optionalPositiveNumberSchema,
  totalCost: optionalPositiveNumberSchema,
  batchNumber: z.string().max(50).optional(),
  expiryDate: z.coerce.date().optional(),
  qrCode: z.string().max(50).optional(),
  locationFrom: z.string().max(100).optional(),
  locationTo: z.string().max(100).optional(),
  notes: z.string().max(500).optional()
});

// Business rule validation schemas
export const stockValidationSchema = z.object({
  medicineId: uuidSchema,
  requestedQuantity: positiveNumberSchema,
  allowBackorder: z.boolean().default(false)
});

export const businessRuleValidationSchema = z.object({
  transactionType: transactionTypeSchema,
  source: transactionSourceSchema,
  requestedBy: uuidSchema,
  items: z.array(z.object({
    medicineId: uuidSchema,
    quantity: positiveNumberSchema
  }))
});

// File upload schemas
export const fileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine((type) => 
    ['image/jpeg', 'image/png', 'application/pdf'].includes(type),
    'Only JPEG, PNG, and PDF files are allowed'
  ),
  size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  buffer: z.instanceof(Buffer)
});

// Bulk operation schemas
export const bulkProcessTransactionSchema = z.object({
  transactionIds: z.array(uuidSchema).min(1).max(10),
  action: z.enum(['approve', 'reject', 'process', 'complete']),
  reason: z.string().max(1000).optional(),
  batchNotes: z.string().max(1000).optional()
});

// Export validation with error formatting
export const validateWithZod = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    
    return {
      success: false,
      errors,
      data: null
    };
  }
  
  return {
    success: true,
    errors: null,
    data: result.data
  };
};

// Custom validation functions
export const validateTransactionBusinessRules = (
  type: TransactionType,
  source: TransactionSource,
  requestLetter?: string
) => {
  const errors: string[] = [];
  
  // PPL must provide request letter
  if (source === TransactionSource.PPL_SUBMISSION && !requestLetter) {
    errors.push('Request letter is required for PPL submissions');
  }
  
  // Emergency transactions must be high priority
  if (type === TransactionType.OUT && source === TransactionSource.EMERGENCY_RESPONSE) {
    // Additional emergency validations can be added here
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStockAvailability = (
  availableStock: number,
  requestedQuantity: number,
  allowBackorder: boolean = false
) => {
  if (!allowBackorder && availableStock < requestedQuantity) {
    return {
      isValid: false,
      message: `Insufficient stock. Available: ${availableStock}, Requested: ${requestedQuantity}`,
      availableStock,
      shortfall: requestedQuantity - availableStock
    };
  }
  
  return {
    isValid: true,
    message: 'Stock validation passed',
    availableStock,
    shortfall: Math.max(0, requestedQuantity - availableStock)
  };
};
