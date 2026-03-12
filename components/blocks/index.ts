// # START OF Dashboard Widgets Index - Export all dashboard widgets
// Purpose: Centralized exports for all dashboard widget components
// Props/Params: None (export statements)
// Returns: Component exports
// Dependencies: All dashboard widget components

// Base components
export { DashboardWidget } from './dashboard-widget';

// New dashboard widgets (v2)
export { DashboardStatCard } from './dashboard-stat-card';
export { LowStockAlertWidget } from './low-stock-alert-widget';
export { ExpiringItemsWidget } from './expiring-items-widget';
export { RecentActivityWidget } from './recent-activity-widget';

// Specific widgets for different data types
export { StockWidget } from './stock-widget';
export { TransactionWidget } from './transaction-widget';
export { ExpiringDrugsWidget } from './expiring-drugs-widget';
export { SubmissionWidget } from './submission-widget';
export { UserWidget } from './user-widget';
export { QuickActionsWidget } from './quick-actions-widget';

// Existing widgets (if needed for backward compatibility)
export { StatisticsBlock } from './statistics-block';
export { StatusBlock } from './status-block';
export { default as ProgressBlock } from './progress-block';
export { default as OrdersBlock } from './orders-block';
export { default as EarningBlock } from './earning-block';
export { UpgradeBlock } from './upgrade-block';
export { WelcomeBlock } from './welcome-block';

// # END OF Dashboard Widgets Index 