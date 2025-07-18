// src/features/qrcode/qrcode.validation.ts
import { z } from 'zod';
import { 
  QRMasterStatus, 
  QRCodeStatus, 
  ScanPurpose, 
  ScanResult, 
  SequenceStatus 
} from './qrcode.types';

// QR Code Master validation schemas
export const createQRCodeMasterSchema = z.object({
  fundingSourceCode: z.string()
    .min(1, 'Funding source code is required')
    .max(2, 'Funding source code too long')
    .regex(/^[0-9]+$/, 'Funding source code must be numeric'),
  fundingSourceName: z.string()
    .min(1, 'Funding source name is required')
    .max(100, 'Funding source name too long'),
  medicineTypeCode: z.string()
    .length(1, 'Medicine type code must be 1 character')
    .regex(/^[FIHB]$/, 'Medicine type code must be F, I, H, or B'),
  medicineTypeName: z.string()
    .min(1, 'Medicine type name is required')
    .max(100, 'Medicine type name too long'),
  activeIngredientCode: z.string()
    .length(3, 'Active ingredient code must be 3 digits')
    .regex(/^[0-9]{3}$/, 'Active ingredient code must be 3 digits'),
  activeIngredientName: z.string()
    .min(1, 'Active ingredient name is required')
    .max(200, 'Active ingredient name too long'),
  producerCode: z.string()
    .length(1, 'Producer code must be 1 character')
    .regex(/^[A-Z]$/, 'Producer code must be uppercase letter'),
  producerName: z.string()
    .min(1, 'Producer name is required')
    .max(100, 'Producer name too long'),
  packageTypeCode: z.string()
    .length(1, 'Package type code must be 1 character')
    .regex(/^[A-Z]$/, 'Package type code must be uppercase letter')
    .optional(),
  packageTypeName: z.string()
    .min(1, 'Package type name is required')
    .max(100, 'Package type name too long')
    .optional()
}).refine(data => {
  const hasPackageType = data.packageTypeCode || data.packageTypeName;
  const hasBoth = data.packageTypeCode && data.packageTypeName;
  return !hasPackageType || hasBoth;
}, {
  message: 'Package type code and name must be provided together',
  path: ['packageTypeCode']
});

export const updateQRCodeMasterSchema = z.object({
  fundingSourceName: z.string()
    .min(1, 'Funding source name is required')
    .max(100, 'Funding source name too long')
    .optional(),
  medicineTypeName: z.string()
    .min(1, 'Medicine type name is required')
    .max(100, 'Medicine type name too long')
    .optional(),
  activeIngredientName: z.string()
    .min(1, 'Active ingredient name is required')
    .max(200, 'Active ingredient name too long')
    .optional(),
  producerName: z.string()
    .min(1, 'Producer name is required')
    .max(100, 'Producer name too long')
    .optional(),
  packageTypeName: z.string()
    .min(1, 'Package type name is required')
    .max(100, 'Package type name too long')
    .optional(),
  status: z.nativeEnum(QRMasterStatus, {
    errorMap: () => ({ message: 'Invalid QR master status' })
  }).optional()
});

// QR Batch Info validation
const qrBatchInfoSchema = z.object({
  batchNumber: z.string()
    .min(1, 'Batch number is required')
    .max(50, 'Batch number too long'),
  manufactureDate: z.coerce.date({
    errorMap: () => ({ message: 'Invalid manufacture date' })
  }),
  expiryDate: z.coerce.date({
    errorMap: () => ({ message: 'Invalid expiry date' })
  }),
  quantity: z.number()
    .positive('Quantity must be positive')
    .max(999999, 'Quantity too large'),
  unitType: z.string()
    .min(1, 'Unit type is required')
    .max(20, 'Unit type too long')
}).refine(data => data.expiryDate > data.manufactureDate, {
  message: 'Expiry date must be after manufacture date',
  path: ['expiryDate']
});

// QR Code generation validation schemas
export const generateQRCodeSchema = z.object({
  medicineStockId: z.string().uuid('Invalid medicine stock ID'),
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Quantity too large (max 10000 per generation)'),
  isBulkPackage: z.boolean().default(false),
  batchInfo: qrBatchInfoSchema.optional(),
  notes: z.string()
    .max(1000, 'Notes too long')
    .optional()
});

export const bulkGenerateQRCodeSchema = z.object({
  medicineStockId: z.string().uuid('Invalid medicine stock ID'),
  totalQuantity: z.number()
    .int('Total quantity must be an integer')
    .min(1, 'Total quantity must be at least 1')
    .max(100000, 'Total quantity too large'),
  bulkPackageSize: z.number()
    .int('Bulk package size must be an integer')
    .min(1, 'Bulk package size must be at least 1')
    .max(1000, 'Bulk package size too large'),
  packageTypeCode: z.string()
    .length(1, 'Package type code must be 1 character')
    .regex(/^[A-Z]$/, 'Package type code must be uppercase letter'),
  batchInfo: qrBatchInfoSchema.optional(),
  notes: z.string()
    .max(1000, 'Notes too long')
    .optional()
}).refine(data => data.totalQuantity % data.bulkPackageSize === 0, {
  message: 'Total quantity must be divisible by bulk package size',
  path: ['totalQuantity']
});

// QR Code scanning validation
export const scanQRCodeSchema = z.object({
  qrCodeString: z.string()
    .min(13, 'QR code string too short')
    .max(20, 'QR code string too long')
    .regex(/^[0-9]{5}[FIHB][0-9]{3}[A-Z](-[A-Z])?[0-9A-Z]{4}$/, 'Invalid QR code format'),
  purpose: z.nativeEnum(ScanPurpose, {
    errorMap: () => ({ message: 'Invalid scan purpose' })
  }),
  location: z.string()
    .max(200, 'Location too long')
    .optional(),
  deviceInfo: z.string()
    .max(500, 'Device info too long')
    .optional(),
  notes: z.string()
    .max(1000, 'Notes too long')
    .optional()
});

// Query validation schemas
export const qrCodeMasterQuerySchema = z.object({
  search: z.string().max(200, 'Search term too long').optional(),
  fundingSourceCode: z.string().max(2).optional(),
  medicineTypeCode: z.string().length(1).optional(),
  activeIngredientCode: z.string().length(3).optional(),
  producerCode: z.string().length(1).optional(),
  packageTypeCode: z.string().length(1).optional(),
  status: z.nativeEnum(QRMasterStatus).optional(),
  sortBy: z.enum(['fundingSourceCode', 'medicineTypeCode', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const qrCodeQuerySchema = z.object({
  search: z.string().max(200, 'Search term too long').optional(),
  medicineStockId: z.string().uuid().optional(),
  isBulkPackage: z.coerce.boolean().optional(),
  status: z.nativeEnum(QRCodeStatus).optional(),
  generatedBy: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  year: z.string().length(2).regex(/^[0-9]{2}$/).optional(),
  month: z.string().length(2).regex(/^(0[1-9]|1[0-2])$/).optional(),
  fundingSource: z.string().max(2).optional(),
  medicineType: z.string().length(1).regex(/^[FIHB]$/).optional(),
  sortBy: z.enum(['generatedAt', 'qrCodeString', 'scannedCount']).default('generatedAt'),
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

export const qrCodeScanQuerySchema = z.object({
  qrCodeId: z.string().uuid().optional(),
  scannedBy: z.string().uuid().optional(),
  purpose: z.nativeEnum(ScanPurpose).optional(),
  result: z.nativeEnum(ScanResult).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(['scannedAt', 'purpose', 'result']).default('scannedAt'),
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

// QR Code format validation
export const qrCodeFormatSchema = z.object({
  qrCodeString: z.string()
    .min(13, 'QR code string too short')
    .max(20, 'QR code string too long')
});

// Bulk operations validation
export const bulkDeleteQRCodeSchema = z.object({
  ids: z.array(z.string().uuid('Invalid QR code ID'))
    .min(1, 'At least one ID is required')
    .max(100, 'Too many IDs (max 100)')
});

export const bulkUpdateQRCodeStatusSchema = z.object({
  ids: z.array(z.string().uuid('Invalid QR code ID'))
    .min(1, 'At least one ID is required')
    .max(100, 'Too many IDs (max 100)'),
  status: z.nativeEnum(QRCodeStatus, {
    errorMap: () => ({ message: 'Invalid QR code status' })
  })
});

// QR Code image configuration validation
export const qrCodeImageConfigSchema = z.object({
  size: z.number().int().min(64).max(1024).default(256),
  margin: z.number().int().min(0).max(10).default(2),
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  color: z.object({
    dark: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
    light: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF')
  }).default({ dark: '#000000', light: '#FFFFFF' })
});

// Sequence validation
export const sequenceUpdateSchema = z.object({
  status: z.nativeEnum(SequenceStatus, {
    errorMap: () => ({ message: 'Invalid sequence status' })
  })
});

// Export type inference
export type CreateQRCodeMasterSchema = z.infer<typeof createQRCodeMasterSchema>;
export type UpdateQRCodeMasterSchema = z.infer<typeof updateQRCodeMasterSchema>;
export type GenerateQRCodeSchema = z.infer<typeof generateQRCodeSchema>;
export type BulkGenerateQRCodeSchema = z.infer<typeof bulkGenerateQRCodeSchema>;
export type ScanQRCodeSchema = z.infer<typeof scanQRCodeSchema>;
export type QRCodeMasterQuerySchema = z.infer<typeof qrCodeMasterQuerySchema>;
export type QRCodeQuerySchema = z.infer<typeof qrCodeQuerySchema>;
export type QRCodeScanQuerySchema = z.infer<typeof qrCodeScanQuerySchema>;
export type QRCodeImageConfigSchema = z.infer<typeof qrCodeImageConfigSchema>;
