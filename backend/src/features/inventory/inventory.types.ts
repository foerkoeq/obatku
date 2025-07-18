// src/features/inventory/inventory.types.ts
import { Decimal } from '@prisma/client/runtime/library';
import { MedicineStatus as PrismaMedicineStatus } from '@prisma/client';

// ========================
// ENUMS - Use Prisma enums where possible
// ========================

export { MedicineStatus } from '@prisma/client';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED'
}

export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  EXPIRY_WARNING = 'EXPIRY_WARNING',
  EXPIRED = 'EXPIRED',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export enum AlertPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// ========================
// BASE TYPES FROM PRISMA
// ========================

export interface Medicine {
  id: string;
  name: string;
  producer: string | null;
  activeIngredient: string | null;
  category: string;
  supplier: string | null;
  unit: string;
  packUnit: string | null;
  quantityPerPack: number | null;
  pricePerUnit: Decimal | null;
  pestTypes: any | null;
  storageLocation: string | null;
  description: string | null;
  qrCode: string | null;
  status: PrismaMedicineStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface MedicineStock {
  id: string;
  medicineId: string;
  batchNumber: string | null;
  currentStock: Decimal;
  initialStock: Decimal;
  minStock: Decimal;
  entryDate: Date;
  expiryDate: Date;
  supplier: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Note: StockMovement and StockAlert are not in current Prisma schema
// These would need to be added to schema if needed

// ========================
// DTO TYPES
// ========================

export interface CreateMedicineDto {
  name: string;
  producer?: string;
  activeIngredient?: string;
  category: string;
  supplier?: string;
  unit: string;
  packUnit?: string;
  quantityPerPack?: number;
  pricePerUnit?: number;
  pestTypes?: any;
  storageLocation?: string;
  description?: string;
  status?: PrismaMedicineStatus;
}

export interface UpdateMedicineDto {
  name?: string;
  producer?: string;
  activeIngredient?: string;
  category?: string;
  supplier?: string;
  unit?: string;
  packUnit?: string;
  quantityPerPack?: number;
  pricePerUnit?: number;
  pestTypes?: any;
  storageLocation?: string;
  description?: string;
  status?: PrismaMedicineStatus;
}

export interface CreateMedicineStockDto {
  medicineId: string;
  batchNumber?: string;
  initialStock: number;
  minStock?: number;
  entryDate: Date;
  expiryDate: Date;
  supplier?: string;
  notes?: string;
}

export interface UpdateMedicineStockDto {
  batchNumber?: string;
  currentStock?: number;
  minStock?: number;
  entryDate?: Date;
  expiryDate?: Date;
  supplier?: string;
  notes?: string;
}

// Note: CreateStockMovementDto, MovementQueryParams removed as StockMovement is not in current schema

// ========================
// QUERY TYPES
// ========================

export interface MedicineQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  supplier?: string;
  status?: PrismaMedicineStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StockQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  medicineId?: string;
  lowStock?: boolean;
  expiringSoon?: number; // days
  expired?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Note: MovementQueryParams removed as StockMovement is not in current schema

// ========================
// RESPONSE TYPES
// ========================

export interface MedicineWithStocks extends Medicine {
  stocks?: MedicineStock[];
  totalStock?: number;
  availableStock?: number;
  lowStockCount?: number;
}

export interface MedicineStockWithMedicine extends MedicineStock {
  medicine?: Medicine;
}

export interface MedicineListResponse {
  medicines: Medicine[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StockListResponse {
  stocks: MedicineStock[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  summary?: {
    totalItems: number;
    lowStockItems: number;
    expiredItems: number;
    expiringSoonItems: number;
  };
}

// Note: MovementListResponse removed as StockMovement is not in current schema

// ========================
// STATISTICS TYPES
// ========================

export interface InventoryStatistics {
  totalMedicines: number;
  activeMedicines: number;
  inactiveMedicines: number;
  totalStockItems: number;
  lowStockItems: number;
  expiredItems: number;
  expiringSoonItems: number;
  totalStockValue: number;
  lastUpdateDate: Date;
}

export interface StockValueByCategory {
  category: string;
  totalValue: number;
  itemCount: number;
  averageValue: number;
}

export interface LowStockItem {
  id: string;
  medicineName: string;
  category: string;
  currentStock: number;
  minStock: number;
  stockRatio: number;
  expiryDate: Date;
}

export interface ExpiringSoonItem {
  id: string;
  medicineName: string;
  batchNumber: string | null;
  currentStock: number;
  expiryDate: Date;
  daysUntilExpiry: number;
}

// ========================
// BULK OPERATION TYPES
// ========================

export interface BulkUpdateStatusDto {
  ids: string[];
  status: PrismaMedicineStatus;
}

export interface BulkDeleteDto {
  ids: string[];
}

export interface BulkOperationResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
  updated: number;
}

// ========================
// ALERT TYPES
// ========================

export interface AlertSummary {
  total: number;
  unread: number;
  byType: Record<AlertType, number>;
  byPriority: Record<AlertPriority, number>;
}
