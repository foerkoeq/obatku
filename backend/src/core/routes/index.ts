/**
 * Application Routes - Main Router
 * 
 * Central router configuration for all application routes
 */

import { Router } from 'express';

// Import feature routes
import userRoutes from '../../features/users/users.routes';

const router = Router();

// API Version prefix
const API_VERSION = '/api/v1';

// Register feature routes
router.use(`${API_VERSION}/users`, userRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ObatKu Backend API'
  });
});

// Root endpoint
router.get('/', (_req, res) => {
  res.json({
    message: 'ObatKu Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: `${API_VERSION}/users`,
    }
  });
});

export { router as mainRouter };
