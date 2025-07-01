// # START OF Transaction Components Index - Central export for all transaction components
// Purpose: Provide centralized exports for easy importing
// Usage: import { TransactionTable, TransactionStatusIndicator } from '@/components/transactions'
// Dependencies: All transaction components

// Main components
export { default as TransactionTable } from './transaction-table';
export { default as TransactionStatusIndicator } from './transaction-status-indicator';
export { default as TransactionDetailModal } from './transaction-detail-modal';
export { default as TransactionSearch } from './transaction-search';

// Helper functions
export { getStatusGroup, statusNeedsAction } from './transaction-status-indicator';

// Types
export type {
  Transaction,
  TransactionStatus,
  TransactionFilters,
  TransactionPaginationConfig,
  TransactionExportOptions,
  UserRole,
  Priority,
  RolePermissions
} from '@/lib/types/transaction';

// Demo data
export {
  mockTransactionData,
  getTransactionsByStatus,
  getTransactionsByRole,
  getTransactionsByPriority,
  getTransactionsByDistrict,
  getPendingApprovals,
  getPendingDistributions,
  getTransactionStats
} from '@/lib/data/transaction-demo';

// # END OF Transaction Components Index 