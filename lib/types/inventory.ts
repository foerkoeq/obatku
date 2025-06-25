// # START OF Inventory Types - Type definitions for inventory management
// Purpose: Provide TypeScript types for drug inventory system
// Dependencies: None

export interface DrugInventory {
  id: string;
  name: string;
  producer: string;
  content: string;
  category: DrugCategory;
  supplier: string;
  stock: number;
  unit: string;
  largePack: {
    quantity: number;
    unit: string;
    itemsPerPack: number;
  };
  entryDate: Date;
  expiryDate: Date;
  pricePerUnit?: number;
  targetPest: string[];
  storageLocation: string;
  notes?: string;
  barcode?: string;
  status: StockStatus;
  lastUpdated: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface DrugCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  address?: string;
}

export type StockStatus = 'normal' | 'low' | 'expired' | 'near_expiry';

export type UserRole = 'admin' | 'ppl' | 'dinas' | 'popt';

export interface InventoryFilters {
  search: string;
  category: string[];
  supplier: string[];
  status: StockStatus[];
  expiryRange: {
    start?: Date;
    end?: Date;
  };
  stockRange: {
    min?: number;
    max?: number;
  };
}

export interface SortConfig {
  field: keyof DrugInventory;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'print';
  scope: 'current' | 'all' | 'filtered';
}

export interface BarcodeOptions {
  type: 'pack' | 'item';
  scope: 'selected' | 'filtered';
}

// # END OF Inventory Types 