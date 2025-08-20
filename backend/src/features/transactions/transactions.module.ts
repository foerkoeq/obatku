/**
 * Transaction Module Factory
 * Creates and configures the complete transaction module with all dependencies
 */

import { PrismaClient } from '@prisma/client';
import { TransactionRepository } from './transactions.repository';
import { TransactionService } from './transactions.service';
import { TransactionController } from './transactions.controller';
import { createTransactionRoutes } from './transactions.routes';
import { Logger } from '../../shared/logger';
import { Router } from 'express';

export interface TransactionModuleDependencies {
  prisma: PrismaClient;
  logger: Logger;
}

export interface TransactionModule {
  repository: TransactionRepository;
  service: TransactionService;
  controller: TransactionController;
  routes: Router;
}

/**
 * Creates the complete transaction module with all dependencies properly injected
 */
export function createTransactionModule(dependencies: TransactionModuleDependencies): TransactionModule {
  const { prisma } = dependencies;

  // Create repository - hanya butuh prisma
  const repository = new TransactionRepository(prisma);

  // Create service - hanya butuh repository (tidak butuh logger)
  const service = new TransactionService();

  // Create controller - hanya butuh service (tidak butuh logger)
  const controller = new TransactionController(service);

  // Create routes with controller
  const routes = createTransactionRoutes(controller);

  // Logger adalah static class, gunakan Logger.info()
  Logger.info('Transaction module created successfully');

  return {
    repository,
    service,
    controller,
    routes
  };
}

/**
 * Transaction module configuration
 */
export const transactionModuleConfig = {
  name: 'transactions',
  version: '1.0.0',
  description: 'Comprehensive transaction management system',
  features: [
    'Multiple transaction sources (PPL, POPT, Dinas)',
    'Flexible approval workflow',
    'Stock integration and validation',
    'Document management',
    'QR code tracking',
    'Activity logging',
    'Comprehensive reporting'
  ],
  dependencies: [
    'prisma',
    'logger',
    'auth-middleware',
    'rbac-middleware',
    'upload-middleware'
  ],
  routes: {
    base: '/api/v1/transactions',
    endpoints: [
      'GET /',
      'GET /summary',
      'GET /my-transactions',
      'GET /pending-approvals',
      'POST /',
      'GET /number/:transactionNumber',
      'GET /:id',
      'PUT /:id',
      'POST /:id/approve',
      'POST /:id/reject',
      'POST /:id/process',
      'POST /:id/complete',
      'POST /:id/cancel',
      'POST /:id/upload',
      'GET /:id/documents/:documentId',
      'GET /:id/activities'
    ]
  },
  permissions: {
    ['/api/v1/transactions']: {
      GET: ['admin', 'dinas', 'popt'],
      POST: ['admin', 'ppl', 'popt', 'dinas']
    },
    ['/api/v1/transactions/summary']: {
      GET: ['admin', 'dinas']
    },
    ['/api/v1/transactions/my-transactions']: {
      GET: ['admin', 'ppl', 'popt', 'dinas']
    },
    ['/api/v1/transactions/pending-approvals']: {
      GET: ['dinas']
    },
    ['/api/v1/transactions/:id/approve']: {
      POST: ['admin', 'dinas']
    },
    ['/api/v1/transactions/:id/reject']: {
      POST: ['admin', 'dinas']
    },
    ['/api/v1/transactions/:id/process']: {
      POST: ['admin', 'popt', 'dinas']
    },
    ['/api/v1/transactions/:id/complete']: {
      POST: ['admin', 'popt', 'dinas']
    },
    ['/api/v1/transactions/:id/cancel']: {
      POST: ['admin', 'dinas']
    }
  }
};
