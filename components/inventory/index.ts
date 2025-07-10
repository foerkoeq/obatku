// # START OF Inventory Components Index - Central export for all inventory components
// Purpose: Provide centralized exports for easy importing
// Usage: import { InventoryTable, StatusIndicator } from '@/components/inventory'
// Dependencies: All inventory components

// Main components
export { default as InventoryTable } from './inventory-table';
export { default as InventorySearch } from './inventory-search';
export { default as FilterSidebar } from './filter-sidebar';
export { default as StatusIndicator } from './status-indicator';

// Modal components
export { default as InventoryDetailModal } from './inventory-detail-modal';
export { default as ExportModal } from './export-modal';
export { default as BarcodeModal } from './barcode-modal';

// QR Print components
export { default as QRPrintModal } from './qr-print-modal';
export { default as QRPrintSettings } from './qr-print-settings';
export { default as QRPrintPreview } from './qr-print-preview';
export { default as QRRangeConfigurator } from './qr-range-configurator';

// Types
export type {
  DrugInventory,
  InventoryFilters,
  PaginationConfig,
  ExportOptions,
  BarcodeOptions,
  UserRole,
  DrugCategory,
  Supplier,
  StockStatus,
  SortConfig
} from '@/lib/types/inventory';

// QR Print types
export type { QRPrintOptions } from './qr-print-settings';

// Demo data
export {
  mockInventoryData,
  mockCategories,
  mockSuppliers,
  getInventoryByStatus,
  getInventoryByCategory,
  getInventoryBySupplier,
  getLowStockItems,
  getExpiredItems,
  getNearExpiryItems,
  getTotalStockValue
} from '@/lib/data/inventory-demo';

// # END OF Inventory Components Index