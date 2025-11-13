/**
 * Services Index
 * Centralized export for all API services
 */

// Base API service
export * from './api';

// Authentication service
export * from './auth.service';

// User management service
export * from './user.service';

// Inventory management service
export * from './inventory.service';

// Transaction service
export * from './transaction.service';

// Service instances for direct usage
export { authService } from './auth.service';
export { userService } from './user.service';
export { inventoryService } from './inventory.service';
export { transactionService } from './transaction.service';
export { masterDataService } from './master-data.service';
