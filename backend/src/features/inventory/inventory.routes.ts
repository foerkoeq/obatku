// src/features/inventory/inventory.routes.ts
import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { PrismaClient } from '@prisma/client';
import { InventoryRepository } from './inventory.repository';
import { InventoryService } from './inventory.service';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';

const router = Router();

// Initialize Dependencies
const prisma = new PrismaClient();
const inventoryRepository = new InventoryRepository(prisma);
const inventoryService = new InventoryService(inventoryRepository);
const inventoryController = new InventoryController(inventoryService);

// Apply auth middleware to all routes
router.use(authMiddleware);

// Medicine Management Routes
router.get('/medicines', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  inventoryController.getAllMedicines
);

router.get('/medicines/:id', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  inventoryController.getMedicineById
);

router.post('/medicines', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.createMedicine
);

router.put('/medicines/:id', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.updateMedicine
);

router.delete('/medicines/:id', 
  roleMiddleware(['admin']),
  inventoryController.deleteMedicine
);

// Medicine Stock Management Routes
router.get('/medicines/:medicineId/stock', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  inventoryController.getMedicineStock
);

router.put('/medicines/:medicineId/stock', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.updateMedicineStock
);

router.post('/medicines/:medicineId/stock/adjust', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.adjustStock
);

router.post('/medicines/:medicineId/stock/movement', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.recordStockMovement
);

// Stock Movement History Routes
router.get('/movements', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  inventoryController.getStockMovements
);

router.get('/movements/:id', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  inventoryController.getStockMovementById
);

// Stock Alert Management Routes
router.get('/alerts', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  inventoryController.getStockAlerts
);

router.put('/alerts/:id/resolve', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.resolveStockAlert
);

router.post('/alerts/dismiss/:id', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.dismissStockAlert
);

// Statistics and Reporting Routes
router.get('/statistics', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.getInventoryStatistics
);

router.get('/statistics/low-stock', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.getLowStockSummary
);

router.get('/statistics/expired', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.getExpiredMedicinesSummary
);

router.get('/statistics/expiring-soon', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.getExpiringSoonSummary
);

router.get('/health-score', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.getInventoryHealthScore
);

// Bulk Operations Routes
router.post('/bulk-update', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.bulkUpdateMedicines
);

router.post('/bulk-delete', 
  roleMiddleware(['admin']),
  inventoryController.bulkDeleteMedicines
);

router.post('/bulk-stock-adjustment', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.bulkStockAdjustment
);

// Export Routes
router.get('/export/medicines', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.exportMedicines
);

router.get('/export/stock-movements', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.exportStockMovements
);

router.get('/export/alerts', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.exportStockAlerts
);

// Search and Filter Routes
router.get('/search', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  inventoryController.searchMedicines
);

router.get('/categories', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  inventoryController.getMedicineCategories
);

router.get('/manufacturers', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  inventoryController.getMedicineManufacturers
);

// Medicine Templates and Presets
router.get('/templates', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.getMedicineTemplates
);

router.post('/templates', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.createMedicineTemplate
);

// Medicine Validation Routes
router.post('/validate-medicine', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.validateMedicineData
);

router.post('/check-duplicates', 
  roleMiddleware(['admin', 'pharmacist']),
  inventoryController.checkDuplicateMedicines
);

export default router;
