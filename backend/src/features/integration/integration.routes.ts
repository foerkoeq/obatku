// src/features/integration/integration.routes.ts
import { Router } from 'express';
import { IntegrationController } from './integration.controller';
import { InventoryQRCodeIntegration } from './inventory-qrcode.integration';
import { PrismaClient } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';
import { QRCodeRepository } from '../qrcode/qrcode.repository';
import { QRCodeService } from '../qrcode/qrcode.service';

const router = Router();

// Initialize Dependencies
const prisma = new PrismaClient();

// Inventory dependencies
const inventoryService = new InventoryService(prisma);

// QR Code dependencies
const qrCodeRepository = new QRCodeRepository(prisma);
const qrCodeService = new QRCodeService(qrCodeRepository);

// Integration service
const inventoryQRCodeIntegration = new InventoryQRCodeIntegration(
  inventoryService,
  qrCodeService,
  prisma
);

// Integration controller
const integrationController = new IntegrationController(inventoryQRCodeIntegration);

// Note: Auth middleware should be applied at the parent router level

// QR Code generation for medicines
router.post('/medicines/:medicineId/generate-qrcodes', 
  integrationController.generateQRCodesForMedicine
);

// QR Code scanning for inventory operations
router.post('/scan-for-inventory', 
  integrationController.scanQRCodeForInventory
);

// Get medicine by QR code
router.get('/medicine-by-qrcode/:qrCodeString', 
  integrationController.getMedicineByQRCode
);

// Validate QR code and medicine association
router.post('/validate-association', 
  integrationController.validateQRCodeMedicineAssociation
);

// Get QR codes for a medicine
router.get('/medicines/:medicineId/qrcodes', 
  integrationController.getQRCodesForMedicine
);

// Get scan history for a medicine
router.get('/medicines/:medicineId/scan-history', 
  integrationController.getScanHistoryForMedicine
);

export default router;
