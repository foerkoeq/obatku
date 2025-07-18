// src/features/qrcode/qrcode.controller.ts
import { Request, Response } from 'express';
import { QRCodeService } from './qrcode.service';
import { ResponseUtil } from '../../shared/utils/response.util';
import {
  createQRCodeMasterSchema,
  updateQRCodeMasterSchema,
  generateQRCodeSchema,
  bulkGenerateQRCodeSchema,
  scanQRCodeSchema,
  qrCodeMasterQuerySchema,
  qrCodeQuerySchema,
  qrCodeScanQuerySchema,
  bulkDeleteQRCodeSchema,
  bulkUpdateQRCodeStatusSchema,
  qrCodeFormatSchema
} from './qrcode.validation';
import {
  CreateQRCodeMasterDto,
  UpdateQRCodeMasterDto,
  GenerateQRCodeDto,
  BulkGenerateQRCodeDto,
  ScanQRCodeDto,
  QRMasterStatus,
  QRCodeStatus
} from './qrcode.types';

export class QRCodeController {
  constructor(private readonly qrCodeService: QRCodeService) {}

  // QR Code Master Controller Methods
  getAllQRCodeMasters = async (req: Request, res: Response) => {
    try {
      const query = qrCodeMasterQuerySchema.parse(req.query);
      const result = await this.qrCodeService.getQRCodeMasters(query);

      return ResponseUtil.successPaginated(
        res,
        result.masters,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrevious: result.page > 1
        },
        'QR Code masters retrieved successfully'
      );
    } catch (error) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  getQRCodeMasterById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const master = await this.qrCodeService.getQRCodeMasterById(id);

      if (!master) {
        return ResponseUtil.notFound(res, 'QR Code master', id);
      }

      return ResponseUtil.success(res, master, 'QR Code master retrieved successfully');
    } catch (error) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  createQRCodeMaster = async (req: Request, res: Response) => {
    try {
      const data = createQRCodeMasterSchema.parse(req.body) as CreateQRCodeMasterDto;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const master = await this.qrCodeService.createQRCodeMaster(data, userId);

      return ResponseUtil.created(res, master, 'QR Code master created successfully');
    } catch (error) {
      if (error.message.includes('already exists')) {
        return ResponseUtil.duplicateEntry(res, 'QR Code master', 'with these codes');
      }
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  updateQRCodeMaster = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = updateQRCodeMasterSchema.parse(req.body) as UpdateQRCodeMasterDto;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const master = await this.qrCodeService.updateQRCodeMaster(id, data, userId);

      return ResponseUtil.success(res, master, 'QR Code master updated successfully');
    } catch (error) {
      if (error.message === 'QR Code master not found') {
        return ResponseUtil.notFound(res, 'QR Code master', id);
      }
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  deleteQRCodeMaster = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await this.qrCodeService.deleteQRCodeMaster(id);

      return ResponseUtil.deleted(res, 'QR Code master deleted successfully');
    } catch (error) {
      if (error.message === 'QR Code master not found') {
        return ResponseUtil.notFound(res, 'QR Code master', id);
      }
      if (error.message.includes('Cannot delete QR Code master that is being used')) {
        return ResponseUtil.businessLogicError(res, error.message);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // QR Code Generation Controller Methods
  generateQRCodes = async (req: Request, res: Response) => {
    try {
      const data = generateQRCodeSchema.parse(req.body) as GenerateQRCodeDto;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const result = await this.qrCodeService.generateQRCodes(data, userId);

      if (!result.success) {
        return ResponseUtil.businessLogicError(res, 'QR Code generation failed', {
          generated: result.generated,
          failed: result.failed,
          errors: result.errors
        });
      }

      return ResponseUtil.success(
        res,
        result,
        `Successfully generated ${result.generated} QR codes`,
        201,
        {
          summary: {
            requested: data.quantity,
            generated: result.generated,
            failed: result.failed
          }
        }
      );
    } catch (error) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  bulkGenerateQRCodes = async (req: Request, res: Response) => {
    try {
      const data = bulkGenerateQRCodeSchema.parse(req.body) as BulkGenerateQRCodeDto;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const result = await this.qrCodeService.bulkGenerateQRCodes(data, userId);

      if (!result.success) {
        return ResponseUtil.businessLogicError(res, 'Bulk QR Code generation failed', {
          generated: result.generated,
          failed: result.failed,
          errors: result.errors
        });
      }

      const bulkPackagesNeeded = Math.ceil(data.totalQuantity / data.bulkPackageSize);

      return ResponseUtil.success(
        res,
        result,
        `Successfully generated ${result.generated} QR codes (${data.totalQuantity} individual + ${bulkPackagesNeeded} bulk packages)`,
        201,
        {
          summary: {
            totalQuantity: data.totalQuantity,
            bulkPackageSize: data.bulkPackageSize,
            bulkPackagesGenerated: bulkPackagesNeeded,
            individualGenerated: data.totalQuantity,
            totalGenerated: result.generated,
            failed: result.failed
          }
        }
      );
    } catch (error) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // QR Code Scanning Controller Methods
  scanQRCode = async (req: Request, res: Response) => {
    try {
      const data = scanQRCodeSchema.parse(req.body) as ScanQRCodeDto;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const result = await this.qrCodeService.scanQRCode(data, userId);

      if (!result.success) {
        return ResponseUtil.businessLogicError(res, result.message, {
          result: result.result,
          scanLog: result.scanLog
        });
      }

      return ResponseUtil.success(
        res,
        {
          qrCode: result.qrCode,
          scanLog: result.scanLog,
          result: result.result
        },
        result.message,
        200,
        {
          scanInfo: {
            purpose: data.purpose,
            location: data.location,
            deviceInfo: data.deviceInfo
          }
        }
      );
    } catch (error) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // QR Code Management Controller Methods
  getAllQRCodes = async (req: Request, res: Response) => {
    try {
      const query = qrCodeQuerySchema.parse(req.query);
      const result = await this.qrCodeService.getQRCodes(query);

      return ResponseUtil.successPaginated(
        res,
        result.qrCodes,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrevious: result.page > 1
        },
        'QR Codes retrieved successfully',
        200,
        { summary: result.summary }
      );
    } catch (error) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  getQRCodeById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const qrCode = await this.qrCodeService.getQRCodeById(id);

      if (!qrCode) {
        return ResponseUtil.notFound(res, 'QR Code', id);
      }

      return ResponseUtil.success(res, qrCode, 'QR Code retrieved successfully');
    } catch (error) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  updateQRCodeStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      if (!Object.values(QRCodeStatus).includes(status)) {
        return ResponseUtil.validationError(res, ['Invalid status value']);
      }

      const qrCode = await this.qrCodeService.updateQRCodeStatus(id, status, userId);

      return ResponseUtil.success(res, qrCode, 'QR Code status updated successfully');
    } catch (error) {
      if (error.message === 'QR code not found') {
        return ResponseUtil.notFound(res, 'QR Code', id);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  deleteQRCode = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await this.qrCodeService.deleteQRCode(id);

      return ResponseUtil.deleted(res, 'QR Code deleted successfully');
    } catch (error) {
      if (error.message === 'QR code not found') {
        return ResponseUtil.notFound(res, 'QR Code', id);
      }
      if (error.message.includes('Cannot delete QR code that has been scanned')) {
        return ResponseUtil.businessLogicError(res, error.message);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // QR Code Validation Controller Methods
  validateQRCode = async (req: Request, res: Response) => {
    try {
      const { qrCodeString } = qrCodeFormatSchema.parse(req.body);

      const validation = this.qrCodeService.validateQRCodeFormat(qrCodeString);

      return ResponseUtil.success(
        res,
        validation,
        validation.isValid ? 'QR Code format is valid' : 'QR Code format is invalid'
      );
    } catch (error) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Scan Log Controller Methods
  getScanLogs = async (req: Request, res: Response) => {
    try {
      const query = qrCodeScanQuerySchema.parse(req.query);
      const result = await this.qrCodeService.getScanLogs(query);

      return ResponseUtil.successPaginated(
        res,
        result.scans,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrevious: result.page > 1
        },
        'Scan logs retrieved successfully'
      );
    } catch (error) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Statistics Controller Methods
  getQRCodeStatistics = async (req: Request, res: Response) => {
    try {
      const stats = await this.qrCodeService.getQRCodeStatistics();
      return ResponseUtil.success(res, stats, 'QR Code statistics retrieved successfully');
    } catch (error) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Bulk Operations Controller Methods
  bulkUpdateQRCodeStatus = async (req: Request, res: Response) => {
    try {
      const { ids, status } = bulkUpdateQRCodeStatusSchema.parse(req.body);
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const errors: string[] = [];
      let updated = 0;

      for (const id of ids) {
        try {
          await this.qrCodeService.updateQRCodeStatus(id, status, userId);
          updated++;
        } catch (error) {
          errors.push(`QR Code ${id}: ${error.message}`);
        }
      }

      return ResponseUtil.bulkOperation(
        res,
        [],
        ids.length,
        updated,
        errors.length,
        errors.map((error, index) => ({ index, error }))
      );
    } catch (error) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  bulkDeleteQRCodes = async (req: Request, res: Response) => {
    try {
      const { ids } = bulkDeleteQRCodeSchema.parse(req.body);
      const errors: string[] = [];
      let deleted = 0;

      for (const id of ids) {
        try {
          await this.qrCodeService.deleteQRCode(id);
          deleted++;
        } catch (error) {
          errors.push(`QR Code ${id}: ${error.message}`);
        }
      }

      return ResponseUtil.bulkOperation(
        res,
        [],
        ids.length,
        deleted,
        errors.length,
        errors.map((error, index) => ({ index, error }))
      );
    } catch (error) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Utility Controller Methods
  downloadQRCodeImage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const qrCode = await this.qrCodeService.getQRCodeById(id);

      if (!qrCode) {
        return ResponseUtil.notFound(res, 'QR Code', id);
      }

      if (!qrCode.qrCodeImage) {
        return ResponseUtil.businessLogicError(res, 'QR Code image not available');
      }

      // If qrCodeImage is a base64 data URL
      if (qrCode.qrCodeImage.startsWith('data:image')) {
        const base64Data = qrCode.qrCodeImage.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="qr-${qrCode.qrCodeString}.png"`);
        return res.send(buffer);
      }

      return ResponseUtil.businessLogicError(res, 'Invalid QR Code image format');
    } catch (error) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  printQRCode = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const qrCode = await this.qrCodeService.updateQRCodeStatus(id, QRCodeStatus.PRINTED, userId);

      return ResponseUtil.success(res, qrCode, 'QR Code marked as printed');
    } catch (error) {
      if (error.message === 'QR code not found') {
        return ResponseUtil.notFound(res, 'QR Code', id);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // QR Code Format Information
  getQRCodeFormats = async (req: Request, res: Response) => {
    try {
      const formats = {
        individual: {
          pattern: 'YYMMSTTTIIP####',
          description: 'Individual item QR code',
          example: '25071F111B0001',
          components: {
            YY: 'Year (2 digits)',
            MM: 'Month (2 digits)', 
            S: 'Funding source (1 digit)',
            TTT: 'Medicine type (1 character)',
            III: 'Active ingredient (3 digits)',
            P: 'Producer (1 character)',
            '####': 'Sequence (4 characters)'
          }
        },
        bulk: {
          pattern: 'YYMMSTTTIIP-K####',
          description: 'Bulk package QR code',
          example: '25071F111B-B0001',
          components: {
            YY: 'Year (2 digits)',
            MM: 'Month (2 digits)',
            S: 'Funding source (1 digit)',
            TTT: 'Medicine type (1 character)',
            III: 'Active ingredient (3 digits)',
            P: 'Producer (1 character)',
            K: 'Package type (1 character)',
            '####': 'Sequence (4 characters)'
          }
        },
        sequenceTypes: {
          numeric: '0001-9999',
          alphaSuffix: '000A-999Z',
          alphaPrefix: '001A-999Z'
        }
      };

      return ResponseUtil.success(res, formats, 'QR Code formats retrieved successfully');
    } catch (error) {
      return ResponseUtil.internalError(res, error.message);
    }
  };
}
