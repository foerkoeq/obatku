// src/features/qrcode/qrcode.routes.ts
import { Router } from 'express';
import { QRCodeController } from './qrcode.controller';
import { PrismaClient } from '@prisma/client';
import { QRCodeRepository } from './qrcode.repository';
import { QRCodeService } from './qrcode.service';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';

const router = Router();

// Initialize Dependencies
const prisma = new PrismaClient();
const qrCodeRepository = new QRCodeRepository(prisma);
const qrCodeService = new QRCodeService(qrCodeRepository);
const qrCodeController = new QRCodeController(qrCodeService);

// Apply auth middleware to all routes
router.use(authMiddleware);

// QR Code Master Management Routes
router.get('/masters', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  qrCodeController.getAllQRCodeMasters
);

router.get('/masters/:id', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  qrCodeController.getQRCodeMasterById
);

router.post('/masters', 
  roleMiddleware(['admin', 'pharmacist']),
  qrCodeController.createQRCodeMaster
);

router.put('/masters/:id', 
  roleMiddleware(['admin', 'pharmacist']),
  qrCodeController.updateQRCodeMaster
);

router.delete('/masters/:id', 
  roleMiddleware(['admin']),
  qrCodeController.deleteQRCodeMaster
);

// QR Code Generation Routes
router.post('/generate', 
  roleMiddleware(['admin', 'pharmacist']),
  qrCodeController.generateQRCodes
);

router.post('/generate/bulk', 
  roleMiddleware(['admin', 'pharmacist']),
  qrCodeController.bulkGenerateQRCodes
);

// QR Code Management Routes
router.get('/', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  qrCodeController.getAllQRCodes
);

router.get('/:id', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  qrCodeController.getQRCodeById
);

router.put('/:id/status', 
  roleMiddleware(['admin', 'pharmacist']),
  qrCodeController.updateQRCodeStatus
);

router.delete('/:id', 
  roleMiddleware(['admin']),
  qrCodeController.deleteQRCode
);

// QR Code Scanning Routes
router.post('/scan', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  qrCodeController.scanQRCode
);

// QR Code Validation Routes
router.post('/validate', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  qrCodeController.validateQRCode
);

// Scan Log Management Routes
router.get('/scans/logs', 
  roleMiddleware(['admin', 'pharmacist']),
  qrCodeController.getScanLogs
);

// Statistics and Reports Routes
router.get('/statistics', 
  roleMiddleware(['admin', 'pharmacist']),
  qrCodeController.getQRCodeStatistics
);

// Bulk Operations Routes
router.put('/bulk/status', 
  roleMiddleware(['admin', 'pharmacist']),
  qrCodeController.bulkUpdateQRCodeStatus
);

router.delete('/bulk', 
  roleMiddleware(['admin']),
  qrCodeController.bulkDeleteQRCodes
);

// Utility Routes
router.get('/:id/download', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  qrCodeController.downloadQRCodeImage
);

router.put('/:id/print', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  qrCodeController.printQRCode
);

// Format Information Routes
router.get('/info/formats', 
  roleMiddleware(['admin', 'pharmacist', 'staff']),
  qrCodeController.getQRCodeFormats
);

export default router;
