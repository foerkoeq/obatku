import { Express } from 'express';
import { logger } from '@/core/logger/logger';

// Import route modules (Phase 2 - User Management)
import userRoutes from '../../features/users/users.routes';
// import { authRoutes } from '../../features/auth/auth.routes';
// import { inventoryRoutes } from '../../features/inventory/inventory.routes';

export const setupRoutes = (app: Express): void => {
  // API base path
  const API_BASE = '/api/v1';

  // Test route
  app.get(`${API_BASE}/test`, (_req, res) => {
    res.json({
      success: true,
      message: 'API is working!',
      timestamp: new Date().toISOString(),
    });
  });

  // Feature routes (Phase 2 - User Management)
  app.use(`${API_BASE}/users`, userRoutes);
  // app.use(`${API_BASE}/auth`, authRoutes);
  // app.use(`${API_BASE}/inventory`, inventoryRoutes);

  logger.info('✅ Routes configured successfully');
};
