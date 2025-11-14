import { Express } from 'express';
import { logger } from '@/core/logger/logger';
import prisma from '@/core/database/prisma.client';

// Import route modules
import userRoutes from '../../features/users/users.routes';
import { createAuthSystem } from '../../features/auth';

// Initialize authentication system
const authSystem = createAuthSystem(prisma);

export const setupRoutes = (app: Express): void => {
  // API base path
  const API_BASE = '/api/v1';

  // API info endpoint - provides information about available endpoints
  app.get(API_BASE, (_req, res) => {
    res.json({
      success: true,
      message: 'ObatKu API v1',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: {
          login: `${API_BASE}/auth/login`,
          logout: `${API_BASE}/auth/logout`,
          refresh: `${API_BASE}/auth/refresh`,
          profile: `${API_BASE}/auth/profile`,
          health: `${API_BASE}/auth/health`,
        },
        users: {
          base: `${API_BASE}/users`,
          profile: `${API_BASE}/users/profile`,
        },
        test: `${API_BASE}/test`,
        corsTest: `${API_BASE}/cors-test`,
      },
      documentation: '/api/docs',
    });
  });

  // Test route
  app.get(`${API_BASE}/test`, (_req, res) => {
    res.json({
      success: true,
      message: 'API is working!',
      timestamp: new Date().toISOString(),
    });
  });

  // CORS test endpoint
  app.get(`${API_BASE}/cors-test`, (_req, res) => {
    res.json({
      success: true,
      message: 'CORS is working!',
      origin: _req.headers.origin,
      timestamp: new Date().toISOString(),
    });
  });

  // Authentication routes (Phase 4 - Authentication)
  app.use(`${API_BASE}/auth`, authSystem.authRoutes);

  // Feature routes (Phase 2 - User Management)
  app.use(`${API_BASE}/users`, userRoutes);
  
  // Future routes will be added here as features are implemented
  // app.use(`${API_BASE}/inventory`, inventoryRoutes);
  // app.use(`${API_BASE}/qrcode`, qrcodeRoutes);
  // app.use(`${API_BASE}/submissions`, submissionRoutes);
  // app.use(`${API_BASE}/approvals`, approvalRoutes);
  // app.use(`${API_BASE}/transactions`, transactionRoutes);
  // app.use(`${API_BASE}/reports`, reportRoutes);

  logger.info('✅ Routes configured successfully');
  logger.info('🔐 Authentication system initialized');
};

// Export auth system for use in other parts of the application
export { authSystem };
