/**
 * Transaction Routes
 * Defines all HTTP routes for transaction management with role-based access control
 */

import { Router } from 'express';
import { TransactionController } from './transactions.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole, UserRole } from '../../middleware/role.middleware';
import { upload } from '../../middleware/upload.middleware';
import { rateLimiter } from '../../middleware/rate-limiter.middleware';

export function createTransactionRoutes(transactionController: TransactionController): Router {
  const router = Router();

  // Apply authentication to all routes
  router.use(authenticate);

  // GET /api/v1/transactions - Get all transactions (admin, manager, staff)
  router.get(
    '/',
    requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
    transactionController.getAllTransactions
  );

  // GET /api/v1/transactions/summary - Get transaction summary (admin, manager)
  router.get(
    '/summary',
    requireRole([UserRole.ADMIN, UserRole.MANAGER]),
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
    transactionController.getTransactionSummary
  );

  // GET /api/v1/transactions/my-transactions - Get current user's transactions
  router.get(
    '/my-transactions',
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
    transactionController.getAllTransactions
  );

  // GET /api/v1/transactions/pending-approvals - Get pending approvals (manager, admin)
  router.get(
    '/pending-approvals',
    requireRole([UserRole.ADMIN, UserRole.MANAGER]),
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
    transactionController.getAllTransactions
  );

  // POST /api/v1/transactions - Create new transaction
  router.post(
    '/',
    requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
    transactionController.createTransaction
  );

  // GET /api/v1/transactions/number/:transactionNumber - Get by transaction number
  router.get(
    '/number/:transactionNumber',
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
    transactionController.getTransactionByNumber
  );

  // GET /api/v1/transactions/:id - Get transaction by ID
  router.get(
    '/:id',
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
    transactionController.getTransactionById
  );

  // PUT /api/v1/transactions/:id - Update transaction
  router.put(
    '/:id',
    requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
    transactionController.updateTransaction
  );

  // POST /api/v1/transactions/:id/approve - Approve transaction (manager, admin)
  router.post(
    '/:id/approve',
    requireRole([UserRole.ADMIN, UserRole.MANAGER]),
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
    transactionController.verifyTransaction
  );

  // POST /api/v1/transactions/:id/reject - Reject transaction (manager, admin)
  router.post(
    '/:id/reject',
    requireRole([UserRole.ADMIN, UserRole.MANAGER]),
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
    transactionController.cancelTransaction
  );

  // POST /api/v1/transactions/:id/process - Process transaction (staff, manager, admin)
  router.post(
    '/:id/process',
    requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
    transactionController.processTransaction
  );

  // POST /api/v1/transactions/:id/complete - Complete transaction (staff, manager, admin)
  router.post(
    '/:id/complete',
    requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
    transactionController.processTransaction
  );

  // POST /api/v1/transactions/:id/cancel - Cancel transaction
  router.post(
    '/:id/cancel',
    requireRole([UserRole.ADMIN, UserRole.MANAGER]),
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
    transactionController.cancelTransaction
  );

  // POST /api/v1/transactions/:id/upload - Upload documents
  router.post(
    '/:id/upload',
    requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    upload.fields([
      { name: 'requestLetter', maxCount: 1 },
      { name: 'deliveryNote', maxCount: 1 },
      { name: 'receivingProof', maxCount: 1 },
      { name: 'additionalDocuments', maxCount: 5 }
    ]),
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
    transactionController.addTransactionNotes
  );

  // GET /api/v1/transactions/:id/documents/:documentId - Download document
  router.get(
    '/:id/documents/:documentId',
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
    transactionController.getTransactionItems
  );

  // GET /api/v1/transactions/:id/activities - Get transaction activities
  router.get(
    '/:id/activities',
    rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
    transactionController.getTransactionHistory
  );

  return router;
}
