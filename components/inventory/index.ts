// Inventory Components Index
// Export all inventory-related components for easy importing

export { default as InventoryTable } from './inventory-table';
export { default as InventorySearch } from './inventory-search';
export { default as InventoryDetailModal } from './inventory-detail-modal';
export { default as MedicineDetailModal } from './medicine-detail-modal';
export { default as FilterSidebar } from './filter-sidebar';
export { default as StatusIndicator } from './status-indicator';
export { default as ExportModal } from './export-modal';
export { default as BarcodeModal } from './barcode-modal';
export { default as QRPrintModal } from './qr-print-modal';
export { default as QRPrintSettings } from './qr-print-settings';
export { default as QRPrintPreview } from './qr-print-preview';
export { default as QRRangeConfigurator } from './qr-range-configurator';

// New Inventory Management Forms
export { default as StockManagementForm } from './stock-management-form';
export { default as CategoryManagementForm } from './category-management-form';

// Types
export type { InventoryTableProps } from './inventory-table';
export type { InventorySearchProps } from './inventory-search';
export type { InventoryDetailModalProps } from './inventory-detail-modal';
export type { MedicineDetailModalProps } from './medicine-detail-modal';
export type { FilterSidebarProps } from './filter-sidebar';
export type { StatusIndicatorProps } from './status-indicator';
export type { ExportModalProps } from './export-modal';
export type { BarcodeModalProps } from './barcode-modal';
export type { QRPrintModalProps } from './qr-print-modal';
export type { QRPrintSettingsProps } from './qr-print-settings';
export type { QRPrintPreviewProps } from './qr-print-preview';
export type { QRRangeConfiguratorProps } from './qr-range-configurator';

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