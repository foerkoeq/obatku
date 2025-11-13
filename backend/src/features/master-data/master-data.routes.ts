// # START OF Master Data Routes - API routes for master data management
// Purpose: Define HTTP routes for farmer groups, commodities, pest types, and reference data
// Dependencies: Express Router, master data controller, authentication middleware
// Returns: Configured Express router with master data endpoints

import { Router } from 'express';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();
const masterDataService = new MasterDataService();
const masterDataController = new MasterDataController(masterDataService);

// Apply authentication to all routes
router.use(authenticateToken);

// ================================================
// FARMER GROUPS ROUTES
// ================================================

// GET /api/master-data/farmer-groups - Get all farmer groups
router.get('/farmer-groups', masterDataController.getFarmerGroups.bind(masterDataController));

// GET /api/master-data/farmer-groups/:id - Get farmer group by ID
router.get('/farmer-groups/:id', masterDataController.getFarmerGroup.bind(masterDataController));

// POST /api/master-data/farmer-groups - Create new farmer group
router.post('/farmer-groups', 
  requireRole(['ADMIN', 'PPL', 'DINAS']),
  masterDataController.createFarmerGroup.bind(masterDataController)
);

// PUT /api/master-data/farmer-groups/:id - Update farmer group
router.put('/farmer-groups/:id', 
  requireRole(['ADMIN', 'PPL', 'DINAS']),
  masterDataController.updateFarmerGroup.bind(masterDataController)
);

// DELETE /api/master-data/farmer-groups/:id - Delete farmer group
router.delete('/farmer-groups/:id', 
  requireRole(['ADMIN']),
  masterDataController.deleteFarmerGroup.bind(masterDataController)
);

// ================================================
// COMMODITIES ROUTES
// ================================================

// GET /api/master-data/commodities - Get all commodities
router.get('/commodities', masterDataController.getCommodities.bind(masterDataController));

// GET /api/master-data/commodities/:id - Get commodity by ID
router.get('/commodities/:id', masterDataController.getCommodity.bind(masterDataController));

// POST /api/master-data/commodities - Create new commodity
router.post('/commodities', 
  requireRole(['ADMIN', 'PPL', 'DINAS']),
  masterDataController.createCommodity.bind(masterDataController)
);

// PUT /api/master-data/commodities/:id - Update commodity
router.put('/commodities/:id', 
  requireRole(['ADMIN', 'PPL', 'DINAS']),
  masterDataController.updateCommodity.bind(masterDataController)
);

// DELETE /api/master-data/commodities/:id - Delete commodity
router.delete('/commodities/:id', 
  requireRole(['ADMIN']),
  masterDataController.deleteCommodity.bind(masterDataController)
);

// ================================================
// PEST TYPES ROUTES
// ================================================

// GET /api/master-data/pest-types - Get all pest types
router.get('/pest-types', masterDataController.getPestTypes.bind(masterDataController));

// GET /api/master-data/pest-types/:id - Get pest type by ID
router.get('/pest-types/:id', masterDataController.getPestType.bind(masterDataController));

// POST /api/master-data/pest-types - Create new pest type
router.post('/pest-types', 
  requireRole(['ADMIN', 'PPL', 'DINAS']),
  masterDataController.createPestType.bind(masterDataController)
);

// PUT /api/master-data/pest-types/:id - Update pest type
router.put('/pest-types/:id', 
  requireRole(['ADMIN', 'PPL', 'DINAS']),
  masterDataController.updatePestType.bind(masterDataController)
);

// DELETE /api/master-data/pest-types/:id - Delete pest type
router.delete('/pest-types/:id', 
  requireRole(['ADMIN']),
  masterDataController.deletePestType.bind(masterDataController)
);

// ================================================
// UTILITY ROUTES
// ================================================

// GET /api/master-data/commodities/categories - Get commodity categories
router.get('/commodities/categories', masterDataController.getCommodityCategories.bind(masterDataController));

// GET /api/master-data/pest-types/categories - Get pest type categories
router.get('/pest-types/categories', masterDataController.getPestTypeCategories.bind(masterDataController));

// GET /api/master-data/districts - Get all districts
router.get('/districts', masterDataController.getDistricts.bind(masterDataController));

// GET /api/master-data/villages - Get villages (optionally filtered by district)
router.get('/villages', masterDataController.getVillages.bind(masterDataController));

export default router;

// # END OF Master Data Routes
