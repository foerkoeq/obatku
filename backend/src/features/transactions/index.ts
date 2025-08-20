/**
 * Transaction Module Index
 * Exports all transaction-related components for easy import
 */

// Types and interfaces
export * from './transactions.types';

// Validation schemas
export * from './transactions.validation';

// Repository for database operations
export { TransactionRepository } from './transactions.repository';

// Service for business logic
export { TransactionService } from './transactions.service';

// Controller for HTTP handling
export { TransactionController } from './transactions.controller';

// Routes configuration
export { createTransactionRoutes } from './transactions.routes';

// Dependency injection factory
export { createTransactionModule } from './transactions.module';
