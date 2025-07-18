// src/features/qrcode/qrcode.types.ts
import { z } from 'zod';

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
  packageTypeCode?: string;    // For bulk packages
  packageTypeName?: string;    // For bulk packages
  status: QRMasterStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface QRCodeSequence {
  id: string;
  year: string;                // 2 digit year (25)
  month: string;               // 2 digit month (07)
  fundingSourceCode: string;   // 1 digit
  medicineTypeCode: string;    // 1 character (F, I, H)
  activeIngredientCode: string; // 3 digits (111)
  producerCode: string;        // 1 character (A, B, C...)
  packageTypeCode?: string;    // 1 character for bulk (B, K, S...)
  currentSequence: string;     // Current sequence (0001, 000A, etc)
  lastGenerated: Date;
  totalGenerated: number;
  status: SequenceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface QRCodeData {
  id: string;
  qrCodeString: string;        // Full QR code (25071F111B0001)
  qrCodeImage?: string;        // Base64 or file path
  medicineStockId?: string;    // Associated medicine stock
  medicineStock?: any;         // Medicine stock reference
  isBulkPackage: boolean;
  components: QRCodeComponents;
  batchInfo?: QRBatchInfo;
  generatedAt: Date;
  generatedBy: string;
  printedAt?: Date;
  printedBy?: string;
  scannedCount: number;
  lastScannedAt?: Date;
  lastScannedBy?: string;
  status: QRCodeStatus;
  notes?: string;
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
  packageType?: string;      // B (for bulk)
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
  location?: string;
  deviceInfo?: string;
  purpose: ScanPurpose;
  result: ScanResult;
  notes?: string;
}

// Enums
export enum QRMasterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum SequenceStatus {
  ACTIVE = 'active',
  EXHAUSTED = 'exhausted',
  INACTIVE = 'inactive'
}

export enum QRCodeStatus {
  GENERATED = 'generated',
  PRINTED = 'printed',
  DISTRIBUTED = 'distributed',
  SCANNED = 'scanned',
  USED = 'used',
  EXPIRED = 'expired',
  INVALID = 'invalid'
}

export enum ScanPurpose {
  VERIFICATION = 'verification',
  DISTRIBUTION = 'distribution',
  INVENTORY_CHECK = 'inventory_check',
  TRANSACTION = 'transaction',
  AUDIT = 'audit'
}

export enum ScanResult {
  SUCCESS = 'success',
  INVALID_FORMAT = 'invalid_format',
  NOT_FOUND = 'not_found',
  EXPIRED = 'expired',
  ALREADY_USED = 'already_used',
  ERROR = 'error'
}

export enum SequenceType {
  NUMERIC = 'numeric',        // 0001-9999
  ALPHA_SUFFIX = 'alpha_suffix', // 000A-ZZZZ
  ALPHA_PREFIX = 'alpha_prefix'  // 001A-999Z
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
  status?: QRMasterStatus;
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
  purpose: ScanPurpose;
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
  status?: QRMasterStatus;
  sortBy?: 'fundingSourceCode' | 'medicineTypeCode' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface QRCodeQuery {
  search?: string;
  medicineStockId?: string;
  isBulkPackage?: boolean;
  status?: QRCodeStatus;
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
  purpose?: ScanPurpose;
  result?: ScanResult;
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
