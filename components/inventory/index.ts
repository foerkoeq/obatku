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
import type { ComponentProps } from 'react';

export type InventoryTableProps = ComponentProps<typeof import('./inventory-table').default>;
export type InventorySearchProps = ComponentProps<typeof import('./inventory-search').default>;
export type InventoryDetailModalProps = ComponentProps<typeof import('./inventory-detail-modal').default>;
export type MedicineDetailModalProps = ComponentProps<typeof import('./medicine-detail-modal').default>;
export type FilterSidebarProps = ComponentProps<typeof import('./filter-sidebar').default>;
export type StatusIndicatorProps = ComponentProps<typeof import('./status-indicator').default>;
export type ExportModalProps = ComponentProps<typeof import('./export-modal').default>;
export type BarcodeModalProps = ComponentProps<typeof import('./barcode-modal').default>;
export type QRPrintModalProps = ComponentProps<typeof import('./qr-print-modal').default>;
export type QRPrintSettingsProps = ComponentProps<typeof import('./qr-print-settings').default>;
export type QRPrintPreviewProps = ComponentProps<typeof import('./qr-print-preview').default>;
export type QRRangeConfiguratorProps = ComponentProps<typeof import('./qr-range-configurator').default>;

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