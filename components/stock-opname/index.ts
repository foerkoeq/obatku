// Stock Opname Components Index
// Export all stock-opname-related components for easy importing

export { default as StockOpnameStatsCards } from './stock-opname-stats-cards';
export { default as StockOpnameTable } from './stock-opname-table';
export { default as StockCheckDialog } from './stock-check-dialog';
export { default as StockUpdateDialog } from './stock-update-dialog';
export { default as KopSuratDinas } from './kop-surat-dinas';
export { default as StockOpnameReportPrint } from './stock-opname-report-print';
export { default as StockOpnameDailyTable } from './stock-opname-daily-table';
export { default as TransactionDetailModal } from './transaction-detail-modal';

// Types re-export
export type { StockOpnameTableProps } from './stock-opname-table';
export type { StockCheckDialogProps } from './stock-check-dialog';
export type { StockUpdateDialogProps } from './stock-update-dialog';
export type { StockOpnameStatsCardsProps } from './stock-opname-stats-cards';
export type { KopSuratDinasProps } from './kop-surat-dinas';
export type { StockOpnameReportPrintProps } from './stock-opname-report-print';
export type { StockOpnameDailyTableProps } from './stock-opname-daily-table';
export type { TransactionDetailModalProps } from './transaction-detail-modal';

// Demo data re-export
export {
  mockStockOpnameItems,
  mockStockOpnameReport,
  defaultKopSuratDinas,
  getStockOpnameStats,
  calculateStokAkhir,
  getTotalMasuk,
  getTotalKeluar,
  filterByKategori,
  filterByCheckStatus,
  getUniqueKategori,
  formatNumber,
  getDailyMovements,
  getTransactionDetails,
  getDaysInMonth,
  mockStorageLocations,
} from '@/lib/data/stock-opname-demo';
