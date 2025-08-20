// src/features/qrcode/qrcode.types.ts
// QR Code Master Data Types
export interface QRCodeMaster {
  id: string;
  fundingSourceCode: string;
  fundingSourceName: string;
  medicineTypeCode: string;
  medicineTypeName: string;
  activeIngredientCode: string;
  activeIngredientName: string;
  producerCode: string;
  producerName: string;
  packageTypeCode: string | null;    // Matches Prisma schema
  packageTypeName: string | null;    // Matches Prisma schema
  status: PrismaQRMasterStatus;      // Use Prisma type
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string | null;          // Matches Prisma schema
}

export interface QRCodeSequence {
  id: string;
  year: string;                // 2 digit year (25)
  month: string;               // 2 digit month (07)
  fundingSourceCode: string;   // 1 digit
  medicineTypeCode: string;    // 1 character (F, I, H)
  activeIngredientCode: string; // 3 digits (111)
  producerCode: string;        // 1 character (A, B, C...)
  packageTypeCode: string | null;    // Matches Prisma schema
  currentSequence: string;     // Current sequence (0001, 000A, etc)
  sequenceType: PrismaSequenceType;  // Use Prisma type
  lastGenerated: Date | null;  // Matches Prisma schema
  totalGenerated: number;
  status: PrismaSequenceStatus;      // Use Prisma type
  createdAt: Date;
  updatedAt: Date;
}

export interface QRCodeData {
  id: string;
  qrCodeString: string;        // Full QR code (25071F111B0001)
  qrCodeImage: string | null;  // Matches Prisma schema
  medicineStockId: string | null;    // Matches Prisma schema
  medicineStock?: any;         // Medicine stock reference
  isBulkPackage: boolean;
  components: any;             // Allow JSON from Prisma
  batchInfo?: any;             // Allow JSON from Prisma
  generatedAt: Date;
  generatedBy: string;
  printedAt: Date | null;      // Matches Prisma schema
  printedBy: string | null;    // Matches Prisma schema
  scannedCount: number;
  lastScannedAt: Date | null;  // Matches Prisma schema
  lastScannedBy: string | null; // Matches Prisma schema
  status: PrismaQRCodeDataStatus;    // Use Prisma type
  notes: string | null;        // Matches Prisma schema
  createdAt: Date;
  updatedAt: Date;
}

export interface QRCodeComponents {
  year: string;              // 25
  month: string;             // 07
  fundingSource: string;     // 1
  medicineType: string;      // F
  activeIngredient: string;  // 111
  producer: string;          // B
  packageType?: string;      // B (for bulk) - keep as undefined for optional
  sequence: string;          // 0001
}

export interface QRBatchInfo {
  batchNumber: string;
  manufactureDate: Date;
  expiryDate: Date;
  quantity: number;
  unitType: string;
}

export interface QRCodeScanLog {
  id: string;
  qrCodeId: string;
  qrCode?: QRCodeData;
  scannedBy: string;
  scannedAt: Date;
  location: string | null;   // Matches Prisma schema
  deviceInfo: string | null; // Matches Prisma schema
  purpose: PrismaScanPurpose; // Use Prisma type
  result: PrismaScanResult;   // Use Prisma type
  notes: string | null;      // Matches Prisma schema
}

// Enums - Updated to match Prisma schema exactly
export enum QRMasterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// Type aliases for Prisma-generated enums
export type PrismaQRMasterStatus = 'ACTIVE' | 'INACTIVE';
export type PrismaSequenceType = 'NUMERIC' | 'ALPHA_SUFFIX' | 'ALPHA_PREFIX';
export type PrismaSequenceStatus = 'ACTIVE' | 'EXHAUSTED' | 'INACTIVE';
export type PrismaQRCodeDataStatus = 'GENERATED' | 'PRINTED' | 'DISTRIBUTED' | 'SCANNED' | 'USED' | 'EXPIRED' | 'INVALID';
export type PrismaScanPurpose = 'VERIFICATION' | 'DISTRIBUTION' | 'INVENTORY_CHECK' | 'TRANSACTION' | 'AUDIT';
export type PrismaScanResult = 'SUCCESS' | 'INVALID_FORMAT' | 'NOT_FOUND' | 'EXPIRED' | 'ALREADY_USED' | 'ERROR';

export enum SequenceStatus {
  ACTIVE = 'ACTIVE',
  EXHAUSTED = 'EXHAUSTED',
  INACTIVE = 'INACTIVE'
}

export enum QRCodeDataStatus {  // Changed from QRCodeStatus to match Prisma
  GENERATED = 'GENERATED',
  PRINTED = 'PRINTED',
  DISTRIBUTED = 'DISTRIBUTED',
  SCANNED = 'SCANNED',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  INVALID = 'INVALID'
}

// Keep QRCodeStatus for backward compatibility
export enum QRCodeStatus {
  GENERATED = 'GENERATED',
  PRINTED = 'PRINTED',
  DISTRIBUTED = 'DISTRIBUTED',
  SCANNED = 'SCANNED',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  INVALID = 'INVALID'
}

export enum ScanPurpose {
  VERIFICATION = 'VERIFICATION',
  DISTRIBUTION = 'DISTRIBUTION',
  INVENTORY_CHECK = 'INVENTORY_CHECK',
  TRANSACTION = 'TRANSACTION',
  AUDIT = 'AUDIT'
}

export enum ScanResult {
  SUCCESS = 'SUCCESS',
  INVALID_FORMAT = 'INVALID_FORMAT',
  NOT_FOUND = 'NOT_FOUND',
  EXPIRED = 'EXPIRED',
  ALREADY_USED = 'ALREADY_USED',
  ERROR = 'ERROR'
}

export enum SequenceType {
  NUMERIC = 'NUMERIC',        // 0001-9999
  ALPHA_SUFFIX = 'ALPHA_SUFFIX', // 000A-ZZZZ
  ALPHA_PREFIX = 'ALPHA_PREFIX'  // 001A-999Z
}

// Create/Update DTOs
export interface CreateQRCodeMasterDto {
  fundingSourceCode: string;
  fundingSourceName: string;
  medicineTypeCode: string;
  medicineTypeName: string;
  activeIngredientCode: string;
  activeIngredientName: string;
  producerCode: string;
  producerName: string;
  packageTypeCode?: string;
  packageTypeName?: string;
}

export interface UpdateQRCodeMasterDto {
  fundingSourceName?: string;
  medicineTypeName?: string;
  activeIngredientName?: string;
  producerName?: string;
  packageTypeName?: string;
  status?: PrismaQRMasterStatus;
}

export interface GenerateQRCodeDto {
  medicineStockId: string;
  quantity: number;
  isBulkPackage?: boolean;
  batchInfo?: QRBatchInfo;
  notes?: string;
}

export interface BulkGenerateQRCodeDto {
  medicineStockId: string;
  totalQuantity: number;
  bulkPackageSize: number;     // Items per bulk package
  packageTypeCode: string;     // B, K, S, etc
  batchInfo?: QRBatchInfo;
  notes?: string;
}

export interface ScanQRCodeDto {
  qrCodeString: string;
  purpose: PrismaScanPurpose;
  location?: string;
  deviceInfo?: string;
  notes?: string;
}

// Query DTOs
export interface QRCodeMasterQuery {
  search?: string;
  fundingSourceCode?: string;
  medicineTypeCode?: string;
  activeIngredientCode?: string;
  producerCode?: string;
  packageTypeCode?: string;
  status?: PrismaQRMasterStatus;
  sortBy?: 'fundingSourceCode' | 'medicineTypeCode' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface QRCodeQuery {
  search?: string;
  medicineStockId?: string;
  isBulkPackage?: boolean;
  status?: PrismaQRCodeDataStatus;
  generatedBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  year?: string;
  month?: string;
  fundingSource?: string;
  medicineType?: string;
  sortBy?: 'generatedAt' | 'qrCodeString' | 'scannedCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface QRCodeScanQuery {
  qrCodeId?: string;
  scannedBy?: string;
  purpose?: PrismaScanPurpose;
  result?: PrismaScanResult;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'scannedAt' | 'purpose' | 'result';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Response Types
export interface QRCodeMasterListResponse {
  masters: QRCodeMaster[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QRCodeListResponse {
  qrCodes: QRCodeData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary?: QRCodeSummary;
}

export interface QRCodeSummary {
  totalGenerated: number;
  totalPrinted: number;
  totalScanned: number;
  totalUsed: number;
  byStatus: Record<QRCodeStatus, number>;
  byMedicineType: Record<string, number>;
}

export interface QRCodeScanListResponse {
  scans: QRCodeScanLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QRCodeGenerationResult {
  success: boolean;
  generated: number;
  failed: number;
  qrCodes: QRCodeData[];
  errors?: string[];
}

export interface QRCodeValidationResult {
  isValid: boolean;
  qrCode?: QRCodeData;
  components?: QRCodeComponents;
  errors: string[];
  warnings: string[];
}

export interface QRCodeScanResult {
  success: boolean;
  qrCode?: QRCodeData;
  scanLog: QRCodeScanLog;
  result: ScanResult;
  message: string;
}

// Utility Types
export interface QRCodeFormat {
  pattern: string;              // Format pattern
  description: string;          // Description
  example: string;              // Example
  components: string[];         // Component names
}

export interface SequenceConfig {
  type: SequenceType;
  pattern: string;
  start: string;
  end: string;
  length: number;
}

// Constants for QR Code Format
export const QR_CODE_FORMATS = {
  INDIVIDUAL: {
    pattern: 'YYMMSTTTIIP####',
    description: 'Individual item QR code',
    example: '25071F111B0001',
    components: ['year', 'month', 'fundingSource', 'medicineType', 'activeIngredient', 'producer', 'sequence']
  },
  BULK: {
    pattern: 'YYMMSTTTIIP-K####',
    description: 'Bulk package QR code',
    example: '25071F111B-B0001',
    components: ['year', 'month', 'fundingSource', 'medicineType', 'activeIngredient', 'producer', 'packageType', 'sequence']
  }
} as const;

export const SEQUENCE_CONFIGS = {
  [SequenceType.NUMERIC]: {
    type: SequenceType.NUMERIC,
    pattern: '####',
    start: '0001',
    end: '9999',
    length: 4
  },
  [SequenceType.ALPHA_SUFFIX]: {
    type: SequenceType.ALPHA_SUFFIX,
    pattern: '###L',
    start: '000A',
    end: 'ZZZZ',
    length: 4
  },
  [SequenceType.ALPHA_PREFIX]: {
    type: SequenceType.ALPHA_PREFIX,
    pattern: '##L#',
    start: '001A',
    end: '999Z',
    length: 4
  }
} as const;
