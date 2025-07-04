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

// Additional components
export { default as ApprovalCard } from './approval-card';
export { default as DistributionCard } from './distribution-card';
export { default as DocumentCard } from './document-card';
export { default as FarmingInfoCard } from './farming-info-card';
export { default as IssuanceCard } from './issuance-card';
export { default as IssuanceModal } from './issuance-modal';
export { default as StatusTimeline } from './status-timeline';
export { default as SubmissionDetailsCard } from './submission-details-card';
export { default as TransactionPrintTemplate } from './transaction-print-template';

// # END OF Transaction Components Index 