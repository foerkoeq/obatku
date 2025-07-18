// src/features/integration/inventory-qrcode.integration.ts
import { InventoryService } from '../inventory/inventory.service';
import { QRCodeService } from '../qrcode/qrcode.service';
import { PrismaClient } from '@prisma/client';
import { 
  QRCodeType, 
  ScanPurpose, 
  QRCodeStatus,
  GenerateQRCodeDto,
  ScanQRCodeDto 
} from '../qrcode/qrcode.types';
import { 
  StockMovementType,
  StockMovementDto 
} from '../inventory/inventory.types';

export class InventoryQRCodeIntegration {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly qrCodeService: QRCodeService,
    private readonly prisma: PrismaClient
  ) {}

  /**
   * Generate QR codes specifically for a medicine
   */
  async generateQRCodesForMedicine(
    medicineId: string,
    quantity: number,
    qrCodeType: QRCodeType = QRCodeType.INDIVIDUAL,
    userId: string
  ) {
    try {
      // First, get the medicine details
      const medicine = await this.inventoryService.getMedicineById(medicineId);
      if (!medicine) {
        throw new Error('Medicine not found');
      }

      // Create QR Code master if it doesn't exist for this medicine
      let qrMaster = await this.qrCodeService.getQRCodeMasterByMedicine(medicineId);
      
      if (!qrMaster) {
        const qrMasterData = {
          companyCode: 'DSC', // Default company code
          yearCode: new Date().getFullYear().toString().slice(-2),
          monthCode: (new Date().getMonth() + 1).toString().padStart(2, '0'),
          fundingSourceCode: '1', // Default funding source
          medicineTypeCode: medicine.category?.charAt(0).toUpperCase() || 'G',
          activeIngredientCode: medicine.activeIngredient?.slice(0, 3).toUpperCase() || '001',
          producerCode: medicine.manufacturer?.charAt(0).toUpperCase() || 'A',
          medicineId: medicineId,
          description: `QR Master for ${medicine.name}`,
          isActive: true
        };

        qrMaster = await this.qrCodeService.createQRCodeMaster(qrMasterData, userId);
      }

      // Generate QR codes
      const generateDto: GenerateQRCodeDto = {
        qrCodeMasterId: qrMaster.id,
        quantity: quantity,
        qrCodeType: qrCodeType,
        notes: `Generated for medicine: ${medicine.name}`
      };

      const result = await this.qrCodeService.generateQRCodes(generateDto, userId);

      // Update medicine to link with QR codes if successful
      if (result.success && result.qrCodes.length > 0) {
        await this.linkQRCodesToMedicine(
          medicineId, 
          result.qrCodes.map(qr => qr.id), 
          userId
        );
      }

      return {
        success: result.success,
        medicine: medicine,
        qrMaster: qrMaster,
        qrCodes: result.qrCodes,
        generated: result.generated,
        failed: result.failed,
        errors: result.errors
      };
    } catch (error) {
      throw new Error(`Failed to generate QR codes for medicine: ${error.message}`);
    }
  }

  /**
   * Scan QR code for inventory operations
   */
  async scanQRCodeForInventory(
    qrCodeString: string,
    purpose: ScanPurpose,
    location?: string,
    deviceInfo?: string,
    userId?: string
  ) {
    try {
      const scanDto: ScanQRCodeDto = {
        qrCodeString,
        purpose,
        location,
        deviceInfo
      };

      const scanResult = await this.qrCodeService.scanQRCode(scanDto, userId);

      if (!scanResult.success) {
        return scanResult;
      }

      const qrCode = scanResult.qrCode;
      
      // Get associated medicine if exists
      let medicine = null;
      if (qrCode.qrCodeMaster?.medicineId) {
        medicine = await this.inventoryService.getMedicineById(
          qrCode.qrCodeMaster.medicineId
        );
      }

      // Process inventory operations based on scan purpose
      let inventoryAction = null;
      
      switch (purpose) {
        case ScanPurpose.STOCK_IN:
          if (medicine) {
            inventoryAction = await this.processStockIn(qrCode, medicine, userId);
          }
          break;
          
        case ScanPurpose.STOCK_OUT:
          if (medicine) {
            inventoryAction = await this.processStockOut(qrCode, medicine, userId);
          }
          break;
          
        case ScanPurpose.VERIFICATION:
          if (medicine) {
            inventoryAction = await this.verifyMedicineStock(qrCode, medicine);
          }
          break;
          
        case ScanPurpose.AUDIT:
          if (medicine) {
            inventoryAction = await this.auditMedicineItem(qrCode, medicine, userId);
          }
          break;
      }

      return {
        ...scanResult,
        medicine,
        inventoryAction,
        integration: {
          medicineLinked: !!medicine,
          actionProcessed: !!inventoryAction,
          purpose
        }
      };
    } catch (error) {
      throw new Error(`Failed to scan QR code for inventory: ${error.message}`);
    }
  }

  /**
   * Link QR codes to a medicine
   */
  private async linkQRCodesToMedicine(
    medicineId: string,
    qrCodeIds: string[],
    userId: string
  ) {
    try {
      // Update QR codes to be linked with medicine
      await this.prisma.qRCode.updateMany({
        where: {
          id: { in: qrCodeIds }
        },
        data: {
          updatedBy: userId,
          updatedAt: new Date()
        }
      });

      // Record stock movement for QR code generation
      const stockMovementDto: StockMovementDto = {
        medicineId,
        movementType: StockMovementType.QR_GENERATED,
        quantity: qrCodeIds.length,
        notes: `QR codes generated: ${qrCodeIds.length} codes`,
        referenceId: qrCodeIds[0], // Use first QR code as reference
        performedBy: userId
      };

      await this.inventoryService.recordStockMovement(stockMovementDto);
    } catch (error) {
      throw new Error(`Failed to link QR codes to medicine: ${error.message}`);
    }
  }

  /**
   * Process stock in operation
   */
  private async processStockIn(qrCode: any, medicine: any, userId: string) {
    try {
      // Record stock movement
      const stockMovementDto: StockMovementDto = {
        medicineId: medicine.id,
        movementType: StockMovementType.STOCK_IN,
        quantity: 1, // Assuming each QR code represents 1 unit
        notes: `Stock in via QR scan: ${qrCode.qrCodeString}`,
        referenceId: qrCode.id,
        performedBy: userId
      };

      const movement = await this.inventoryService.recordStockMovement(stockMovementDto);

      // Update QR code status to USED
      await this.qrCodeService.updateQRCodeStatus(qrCode.id, QRCodeStatus.USED, userId);

      return {
        type: 'stock_in',
        movement,
        qrCodeUpdated: true
      };
    } catch (error) {
      throw new Error(`Failed to process stock in: ${error.message}`);
    }
  }

  /**
   * Process stock out operation
   */
  private async processStockOut(qrCode: any, medicine: any, userId: string) {
    try {
      // Check if there's sufficient stock
      const stock = await this.inventoryService.getMedicineStock(medicine.id);
      if (!stock || stock.currentStock < 1) {
        throw new Error('Insufficient stock for stock out operation');
      }

      // Record stock movement
      const stockMovementDto: StockMovementDto = {
        medicineId: medicine.id,
        movementType: StockMovementType.STOCK_OUT,
        quantity: 1,
        notes: `Stock out via QR scan: ${qrCode.qrCodeString}`,
        referenceId: qrCode.id,
        performedBy: userId
      };

      const movement = await this.inventoryService.recordStockMovement(stockMovementDto);

      // Update QR code status to CONSUMED
      await this.qrCodeService.updateQRCodeStatus(qrCode.id, QRCodeStatus.CONSUMED, userId);

      return {
        type: 'stock_out',
        movement,
        qrCodeUpdated: true
      };
    } catch (error) {
      throw new Error(`Failed to process stock out: ${error.message}`);
    }
  }

  /**
   * Verify medicine stock
   */
  private async verifyMedicineStock(qrCode: any, medicine: any) {
    try {
      const stock = await this.inventoryService.getMedicineStock(medicine.id);
      
      return {
        type: 'verification',
        medicine,
        stock,
        qrCode,
        verified: true,
        verificationTime: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to verify medicine stock: ${error.message}`);
    }
  }

  /**
   * Audit medicine item
   */
  private async auditMedicineItem(qrCode: any, medicine: any, userId: string) {
    try {
      // Record audit log
      const stockMovementDto: StockMovementDto = {
        medicineId: medicine.id,
        movementType: StockMovementType.AUDIT,
        quantity: 0, // No quantity change for audit
        notes: `Audit scan: ${qrCode.qrCodeString}`,
        referenceId: qrCode.id,
        performedBy: userId
      };

      const movement = await this.inventoryService.recordStockMovement(stockMovementDto);

      return {
        type: 'audit',
        movement,
        auditTime: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to audit medicine item: ${error.message}`);
    }
  }

  /**
   * Get medicine by QR code
   */
  async getMedicineByQRCode(qrCodeString: string) {
    try {
      const qrCode = await this.qrCodeService.getQRCodeByString(qrCodeString);
      
      if (!qrCode || !qrCode.qrCodeMaster?.medicineId) {
        return null;
      }

      return await this.inventoryService.getMedicineById(qrCode.qrCodeMaster.medicineId);
    } catch (error) {
      throw new Error(`Failed to get medicine by QR code: ${error.message}`);
    }
  }

  /**
   * Validate QR code and medicine association
   */
  async validateQRCodeMedicineAssociation(qrCodeString: string, medicineId: string) {
    try {
      const qrCode = await this.qrCodeService.getQRCodeByString(qrCodeString);
      
      if (!qrCode || !qrCode.qrCodeMaster) {
        return false;
      }

      return qrCode.qrCodeMaster.medicineId === medicineId;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get QR codes for a medicine
   */
  async getQRCodesForMedicine(medicineId: string) {
    try {
      return await this.qrCodeService.getQRCodesByMedicine(medicineId);
    } catch (error) {
      throw new Error(`Failed to get QR codes for medicine: ${error.message}`);
    }
  }

  /**
   * Get scan history for a medicine
   */
  async getScanHistoryForMedicine(medicineId: string) {
    try {
      const qrCodes = await this.getQRCodesForMedicine(medicineId);
      const qrCodeIds = qrCodes.map(qr => qr.id);
      
      return await this.qrCodeService.getScanLogsByQRCodes(qrCodeIds);
    } catch (error) {
      throw new Error(`Failed to get scan history for medicine: ${error.message}`);
    }
  }
}
