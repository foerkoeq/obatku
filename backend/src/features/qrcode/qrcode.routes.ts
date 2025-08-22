// src/features/qrcode/qrcode.routes.ts
import { Router } from 'express';
import { QRCodeController } from './qrcode.controller';
import { PrismaClient } from '@prisma/client';
import { QRCodeRepository } from './qrcode.repository';
import { QRCodeService } from './qrcode.service';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole, UserRole } from '../../middleware/role.middleware';

const router = Router();

// Initialize Dependencies
const prisma = new PrismaClient();
const qrCodeRepository = new QRCodeRepository(prisma);
const qrCodeService = new QRCodeService(qrCodeRepository);
const qrCodeController = new QRCodeController(qrCodeService);

// Apply auth middleware to all routes
router.use(authenticateToken);

// QR Code Master Management Routes
router.get('/masters', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  qrCodeController.getAllQRCodeMasters
);

router.get('/masters/:id', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  qrCodeController.getQRCodeMasterById
);

router.post('/masters', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  qrCodeController.createQRCodeMaster
);

router.put('/masters/:id', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  qrCodeController.updateQRCodeMaster
);

router.delete('/masters/:id', 
  requireRole([UserRole.ADMIN]),
  qrCodeController.deleteQRCodeMaster
);

// QR Code Generation Routes
router.post('/generate', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  qrCodeController.generateQRCodes
);

router.post('/generate/bulk', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  qrCodeController.bulkGenerateQRCodes
);

// QR Code Management Routes
router.get('/', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  qrCodeController.getAllQRCodes
);

router.get('/:id', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  qrCodeController.getQRCodeById
);

router.put('/:id/status', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  qrCodeController.updateQRCodeStatus
);

router.delete('/:id', 
  requireRole([UserRole.ADMIN]),
  qrCodeController.deleteQRCode
);

// QR Code Scanning Routes
router.post('/scan', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  qrCodeController.scanQRCode
);

// QR Code Validation Routes
router.post('/validate', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  qrCodeController.validateQRCode
);

// Scan Log Management Routes
router.get('/scans/logs', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  qrCodeController.getScanLogs
);

// Statistics and Reports Routes
router.get('/statistics', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  qrCodeController.getQRCodeStatistics
);

// Bulk Operations Routes
router.put('/bulk/status', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  qrCodeController.bulkUpdateQRCodeStatus
);

router.delete('/bulk', 
  requireRole([UserRole.ADMIN]),
  qrCodeController.bulkDeleteQRCodes
);

// Utility Routes
router.get('/:id/download', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  qrCodeController.downloadQRCodeImage
);

router.put('/:id/print', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  qrCodeController.printQRCode
);

// Format Information Routes
router.get('/info/formats', 
  requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  qrCodeController.getQRCodeFormats
);

export default router;
