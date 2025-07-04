// # START OF Dashboard Widgets Index - Export all dashboard widgets
// Purpose: Centralized exports for all dashboard widget components
// Props/Params: None (export statements)
// Returns: Component exports
// Dependencies: All dashboard widget components

// Base components
export { DashboardWidget } from './dashboard-widget';

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
export { ProgressBlock } from './progress-block';
export { OrdersBlock } from './orders-block';
export { EarningBlock } from './earning-block';
export { UpgradeBlock } from './upgrade-block';
export { WelcomeBlock } from './welcome-block';

// # END OF Dashboard Widgets Index 