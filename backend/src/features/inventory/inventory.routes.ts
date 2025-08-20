// src/features/inventory/inventory.routes.ts
import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { PrismaClient } from '@prisma/client';
import { InventoryRepository } from './inventory.repository';
import { InventoryService } from './inventory.service';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole, UserRole } from '../../middleware/role.middleware';

const router = Router();

// Initialize Dependencies
const prisma = new PrismaClient();
const inventoryRepository = new InventoryRepository(prisma);
const inventoryService = new InventoryService(inventoryRepository);
const inventoryController = new InventoryController(inventoryService);

// Apply auth middleware to all routes
router.use(authenticateToken);

// Medicine Management Routes
router.get('/medicines', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  inventoryController.getAllMedicines
);

router.get('/medicines/:id', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  inventoryController.getMedicineById
);

router.post('/medicines', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.createMedicine
);

router.put('/medicines/:id', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.updateMedicine
);

router.delete('/medicines/:id', 
  requireRole([UserRole.ADMIN]),
  inventoryController.deleteMedicine
);

// Medicine Stock Management Routes
router.get('/medicines/:medicineId/stock', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  inventoryController.getAllMedicineStocks
);

router.put('/medicines/:medicineId/stock', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.updateMedicineStock
);

router.post('/medicines/:medicineId/stock/adjust', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.adjustStock
);

// Stock Movement History Routes
router.get('/movements', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  inventoryController.getStockMovements
);

router.get('/movements/:id', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  inventoryController.getStockMovementsByStockId
);

// Stock Alert Management Routes
router.get('/alerts', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  inventoryController.getStockAlerts
);

router.put('/alerts/:id/resolve', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.markAlertAsRead
);

// Statistics and Reporting Routes
router.get('/statistics', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.getInventoryStatistics
);

router.get('/statistics/low-stock', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.getLowStockItems
);

router.get('/statistics/expired', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.getExpiringSoonItems
);

router.get('/statistics/expiring-soon', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.getExpiringSoonItems
);

router.get('/health-score', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.getStockValueByCategory
);

// Bulk Operations Routes
router.post('/bulk-update', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.bulkUpdateMedicineStatus
);

router.post('/bulk-delete', 
  requireRole([UserRole.ADMIN]),
  inventoryController.bulkDeleteMedicines
);

// Stock Management Routes
router.post('/stocks', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.createMedicineStock
);

router.get('/stocks/:id', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  inventoryController.getMedicineStockById
);

router.delete('/stocks/:id', 
  requireRole([UserRole.ADMIN]),
  inventoryController.deleteStock
);

// Stock Reservation Routes
router.post('/stocks/:id/reserve', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.reserveStock
);

router.post('/stocks/:id/release', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.releaseReservedStock
);

// Alert Management Routes
router.post('/alerts/generate', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.generateStockAlerts
);

router.get('/alerts/unread-count', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  inventoryController.getUnreadAlertsCount
);

export default router;
