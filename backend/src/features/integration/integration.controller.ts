// src/features/integration/integration.controller.ts
import { Request, Response } from 'express';
import { InventoryQRCodeIntegration } from './inventory-qrcode.integration';
import { ResponseUtil } from '../../shared/utils/response.util';
import { QRCodeType, ScanPurpose } from '../qrcode/qrcode.types';

export class IntegrationController {
  constructor(private readonly integration: InventoryQRCodeIntegration) {}

  // Generate QR codes for a medicine
  generateQRCodesForMedicine = async (req: Request, res: Response) => {
    try {
      const { medicineId } = req.params;
      const { quantity, qrCodeType } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const result = await this.integration.generateQRCodesForMedicine(
        medicineId,
        quantity,
        qrCodeType || QRCodeType.INDIVIDUAL,
        userId
      );

      return ResponseUtil.success(
        res,
        result,
        `Successfully generated ${result.generated} QR codes for medicine`,
        201
      );
    } catch (error) {
      if (error.message.includes('Medicine not found')) {
        return ResponseUtil.notFound(res, 'Medicine', req.params.medicineId);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Scan QR code for inventory operations
  scanQRCodeForInventory = async (req: Request, res: Response) => {
    try {
      const { qrCodeString, purpose, location, deviceInfo } = req.body;
      const userId = req.user?.id;

      if (!qrCodeString || !purpose) {
        return ResponseUtil.validationError(res, ['QR code string and purpose are required']);
      }

      if (!Object.values(ScanPurpose).includes(purpose)) {
        return ResponseUtil.validationError(res, ['Invalid scan purpose']);
      }

      const result = await this.integration.scanQRCodeForInventory(
        qrCodeString,
        purpose,
        location,
        deviceInfo,
        userId
      );

      return ResponseUtil.success(
        res,
        result,
        `QR code scanned successfully for ${purpose}`,
        200,
        {
          integration: result.integration
        }
      );
    } catch (error) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Get medicine by QR code
  getMedicineByQRCode = async (req: Request, res: Response) => {
    try {
      const { qrCodeString } = req.params;
      const medicine = await this.integration.getMedicineByQRCode(qrCodeString);

      if (!medicine) {
        return ResponseUtil.notFound(res, 'Medicine', `with QR code: ${qrCodeString}`);
      }

      return ResponseUtil.success(res, medicine, 'Medicine retrieved by QR code successfully');
    } catch (error) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Validate QR code and medicine association
  validateQRCodeMedicineAssociation = async (req: Request, res: Response) => {
    try {
      const { qrCodeString, medicineId } = req.body;

      if (!qrCodeString || !medicineId) {
        return ResponseUtil.validationError(res, ['QR code string and medicine ID are required']);
      }

      const isValid = await this.integration.validateQRCodeMedicineAssociation(
        qrCodeString,
        medicineId
      );

      return ResponseUtil.success(
        res,
        { isValid, qrCodeString, medicineId },
        isValid ? 'QR code is associated with the medicine' : 'QR code is not associated with the medicine'
      );
    } catch (error) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Get QR codes for a medicine
  getQRCodesForMedicine = async (req: Request, res: Response) => {
    try {
      const { medicineId } = req.params;
      const qrCodes = await this.integration.getQRCodesForMedicine(medicineId);

      return ResponseUtil.success(
        res,
        qrCodes,
        'QR codes for medicine retrieved successfully',
        200,
        {
          summary: {
            total: qrCodes.length,
            medicineId
          }
        }
      );
    } catch (error) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Get scan history for a medicine
  getScanHistoryForMedicine = async (req: Request, res: Response) => {
    try {
      const { medicineId } = req.params;
      const scanHistory = await this.integration.getScanHistoryForMedicine(medicineId);

      return ResponseUtil.success(
        res,
        scanHistory,
        'Scan history for medicine retrieved successfully',
        200,
        {
          summary: {
            total: scanHistory.length,
            medicineId
          }
        }
      );
    } catch (error) {
      return ResponseUtil.internalError(res, error.message);
    }
  };
}
