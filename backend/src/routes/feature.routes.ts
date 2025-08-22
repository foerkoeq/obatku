// src/routes/feature.routes.ts
import { Router } from 'express';
import { inventoryRoutes } from '../features/inventory';
import { qrCodeRoutes } from '../features/qrcode';

const router = Router();

// Mount feature routes
router.use('/inventory', inventoryRoutes);
router.use('/qrcode', qrCodeRoutes);

// Health check for features
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    features: {
      inventory: 'active',
      qrcode: 'active'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
