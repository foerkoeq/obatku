/**
 * Transaction System Types & Interfaces
 * Aligned with existing Prisma schema
 */

import { TransactionType, TransactionStatus } from '@prisma/client';

// Re-export Prisma types
export { TransactionType, TransactionStatus };

// Custom enums for business logic
export enum TransactionSource {
  PPL_SUBMISSION = 'ppl_submission',        // Dari submission PPL
  POPT_REQUEST = 'popt_request',           // Permintaan POPT
  DINAS_DIRECTIVE = 'dinas_directive',     // Perintah Dinas
  ADMIN_ACTION = 'admin_action',           // Tindakan Admin
  EMERGENCY_RESPONSE = 'emergency_response' // Tanggap darurat
}

export enum Priority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
  EMERGENCY = 5
}

// Base transaction interface (mapped to Prisma model)
export interface Transaction {
  id: string;
  transactionNumber: string;
  type: TransactionType;
  status: TransactionStatus;
  
  // User relations (from Prisma schema)
  processedBy?: string | null;
  processedAt?: Date | null;
  verifiedBy?: string | null;
  verifiedAt?: Date | null;
  
  // Related data
  submissionId?: string | null;
  description?: string | null;
  notes?: string | null;
  totalItems?: number | null;
  totalValue?: number | null;
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date | null;
  
  // Relations
  items?: TransactionItem[];
  submission?: any;
  processor?: UserInfo;
  verifier?: UserInfo;
}

// Transaction item (mapped to Prisma TransactionItem model)
export interface TransactionItem {
  id: string;
  transactionId: string;
  medicineStockId: string;
  quantity: number;
  notes?: string | null;
  
  // Relations
  medicineStock?: MedicineStock;
}

// Medicine stock reference
export interface MedicineStock {
  id: string;
  medicineId: string;
  currentStock: number;
  
  // Relations
  medicine?: Medicine;
}

// Medicine reference
export interface Medicine {
  id: string;
  name: string;
  genericName?: string | null;
  type?: string | null;
  unit?: string | null;
  price?: number | null;
}

// User info for relations
export interface UserInfo {
  id: string;
  name: string;
  email?: string | null;
  role: string;
}

// Query interface for filtering
export interface TransactionQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  source?: TransactionSource;
  processedBy?: string;
  verifiedBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  submissionId?: string;
  medicineId?: string;
  priority?: Priority;
  isUrgent?: boolean;
  isEmergency?: boolean;
}

// Create transaction data
export interface CreateTransactionData {
  type: TransactionType;
  source: TransactionSource;
  submissionId?: string;
  notes?: string;
  priority?: Priority;
  isUrgent?: boolean;
  isEmergency?: boolean;
  items: CreateTransactionItemData[];
}

// Create transaction item data
export interface CreateTransactionItemData {
  medicineId: string;
  requestedQuantity: number;
  notes?: string;
}

// Update transaction data
export interface UpdateTransactionData {
  notes?: string;
  description?: string;
}

// Process transaction data
export interface ProcessTransactionData {
  notes?: string;
  items: ProcessTransactionItemData[];
}

// Process transaction item data
export interface ProcessTransactionItemData {
  transactionItemId: string;
  processedQuantity: number;
  notes?: string;
}

// Complete transaction data
export interface CompleteTransactionData {
  completionNotes?: string;
  additionalDocuments?: string[];
}

// Transaction summary for statistics
export interface TransactionSummary {
  totalTransactions: number;
  pendingTransactions: number;
  inProgressTransactions: number;
  completedTransactions: number;
  totalValue: number;
  averageProcessingTime: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
}

// Pagination interface
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Response interfaces
export interface TransactionListResponse extends PaginationResult<Transaction> {}

export interface TransactionResponse {
  success: boolean;
  message: string;
  data?: Transaction;
  errors?: string[];
}

export interface TransactionSummaryResponse {
  success: boolean;
  message: string;
  data?: TransactionSummary;
}

// Business rule interfaces
export interface ApprovalRule {
  source: TransactionSource;
  requiresApproval: boolean;
  approverRoles: string[];
  conditions?: {
    totalValueLimit?: number;
    itemCountLimit?: number;
    priorityLevel?: Priority;
  };
}

export interface StockValidationRule {
  medicineId: string;
  minimumStock: number;
  reservedStock: number;
  allowNegative: boolean;
}

// Activity log interface
export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: Date;
  metadata?: Record<string, any>;
}

// Error types
export class TransactionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

export class ValidationError extends TransactionError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class StockError extends TransactionError {
  constructor(message: string, details?: any) {
    super(message, 'STOCK_ERROR', 422, details);
    this.name = 'StockError';
  }
}

export class PermissionError extends TransactionError {
  constructor(message: string, details?: any) {
    super(message, 'PERMISSION_ERROR', 403, details);
    this.name = 'PermissionError';
  }
}

// Utility types
export type TransactionCreateInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'transactionNumber'>;
export type TransactionUpdateInput = Partial<Pick<Transaction, 'notes' | 'description'>>;

// Business rules interface for backward compatibility
export interface TransactionBusinessRules {
  requiresApproval: boolean;
  requiresLetter: boolean;
  approverRoles: string[];
  stockValidation: boolean;
  emergencyBypass: boolean;
}

// Stock validation result for backward compatibility  
export interface StockValidationResult {
  isValid: boolean;
  availableStock: number;
  requestedQuantity: number;
  errors: string[];
}