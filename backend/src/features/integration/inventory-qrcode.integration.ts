// src/features/integration/inventory-qrcode.integration.ts
import { InventoryService } from '../inventory/inventory.service';
import { QRCodeService } from '../qrcode/qrcode.service';
import { PrismaClient } from '@prisma/client';
import { 
  QRCodeStatus,
  GenerateQRCodeDto,
  ScanQRCodeDto,
  ScanPurpose
} from '../qrcode/qrcode.types';

export class InventoryQRCodeIntegration {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly qrCodeService: QRCodeService,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // @ts-ignore
    private readonly _prisma: PrismaClient
  ) {}

  /**
   * Generate QR codes specifically for a medicine
   */
  async generateQRCodesForMedicine(
    medicineId: string,
    quantity: number,
    userId: string
  ) {
    try {
      // First, get the medicine details
      const medicine = await this.inventoryService.getMedicineById(medicineId);
      if (!medicine) {
        throw new Error('Medicine not found');
      }

      // Get medicine stock for QR code generation
      const stocks = await this.inventoryService.getAllMedicineStocks({ medicineId });
      if (!stocks.stocks || stocks.stocks.length === 0) {
        throw new Error('No medicine stock found for QR code generation');
      }

      const medicineStock = stocks.stocks[0]; // Use first stock entry

      // Generate QR codes using the stock ID
      const generateDto: GenerateQRCodeDto = {
        medicineStockId: medicineStock.id,
        quantity: quantity,
        notes: `Generated for medicine: ${medicine.name}`
      };

      const result = await this.qrCodeService.generateQRCodes(generateDto, userId);

      return {
        success: result.success,
        medicine: medicine,
        medicineStock: medicineStock,
        qrCodes: result.qrCodes,
        generated: result.generated,
        failed: result.failed,
        errors: result.errors
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate QR codes for medicine: ${errorMessage}`);
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

      const scanResult = await this.qrCodeService.scanQRCode(scanDto, userId || 'system');

      if (!scanResult.success) {
        return scanResult;
      }

      const qrCode = scanResult.qrCode;
      
      if (!qrCode) {
        return {
          ...scanResult,
          medicine: null,
          inventoryAction: null,
          integration: {
            medicineLinked: false,
            actionProcessed: false,
            purpose
          }
        };
      }
      
      // Get associated medicine if exists
      let medicine = null;
      if (qrCode.medicineStock?.medicineId) {
        medicine = await this.inventoryService.getMedicineById(
          qrCode.medicineStock.medicineId
        );
      }

      // Process inventory operations based on scan purpose
      let inventoryAction = null;
      
      switch (purpose) {
        case ScanPurpose.DISTRIBUTION:
          if (medicine) {
            inventoryAction = await this.processStockOut(qrCode, medicine, userId);
          }
          break;
          
        case ScanPurpose.INVENTORY_CHECK:
          if (medicine) {
            inventoryAction = await this.verifyMedicineStock(qrCode, medicine);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to scan QR code for inventory: ${errorMessage}`);
    }
  }

  /**
   * Process stock out operation
   */
  private async processStockOut(qrCode: any, medicine: any, userId?: string) {
    try {
      // Get medicine stock
      const stocks = await this.inventoryService.getAllMedicineStocks({ medicineId: medicine.id });
      if (!stocks.stocks || stocks.stocks.length === 0) {
        throw new Error('No medicine stock found');
      }

      const stock = stocks.stocks[0];
      
      // Check if there's sufficient stock
      if (Number(stock.currentStock) < 1) {
        throw new Error('Insufficient stock for stock out operation');
      }

      // Adjust stock (decrease by 1)
      await this.inventoryService.adjustStock(
        stock.id, 
        -1, 
        'Stock out via QR scan', 
        userId || 'system', 
        `Stock out via QR scan: ${qrCode.qrCodeString}`
      );

      // Update QR code status to USED
      await this.qrCodeService.updateQRCodeStatus(qrCode.id, QRCodeStatus.USED, userId || 'system');

      return {
        type: 'stock_out',
        stockId: stock.id,
        qrCodeUpdated: true,
        quantity: 1
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to process stock out: ${errorMessage}`);
    }
  }

  /**
   * Verify medicine stock
   */
  private async verifyMedicineStock(qrCode: any, medicine: any) {
    try {
      const stocks = await this.inventoryService.getAllMedicineStocks({ medicineId: medicine.id });
      
      return {
        type: 'verification',
        medicine,
        stocks: stocks.stocks,
        qrCode,
        verified: true,
        verificationTime: new Date()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to verify medicine stock: ${errorMessage}`);
    }
  }

  /**
   * Audit medicine item
   */
  private async auditMedicineItem(qrCode: any, medicine: any, userId?: string) {
    try {
      // Get current stock information
      const stocks = await this.inventoryService.getAllMedicineStocks({ medicineId: medicine.id });
      
      return {
        type: 'audit',
        medicine,
        stocks: stocks.stocks,
        qrCode,
        auditTime: new Date(),
        performedBy: userId || 'system'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to audit medicine item: ${errorMessage}`);
    }
  }

  /**
   * Get medicine by QR code
   */
  async getMedicineByQRCode(qrCodeString: string) {
    try {
      const qrCode = await this.qrCodeService.getQRCodeById(qrCodeString);
      
      if (!qrCode || !qrCode.medicineStock?.medicineId) {
        return null;
      }

      return await this.inventoryService.getMedicineById(qrCode.medicineStock.medicineId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get medicine by QR code: ${errorMessage}`);
    }
  }

  /**
   * Validate QR code and medicine association
   */
  async validateQRCodeMedicineAssociation(qrCodeString: string, medicineId: string) {
    try {
      const qrCode = await this.qrCodeService.getQRCodeById(qrCodeString);
      
      if (!qrCode || !qrCode.medicineStock) {
        return false;
      }

      return qrCode.medicineStock.medicineId === medicineId;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get QR codes for a medicine
   */
  async getQRCodesForMedicine(medicineId: string) {
    try {
      // Get medicine stocks first
      const stocks = await this.inventoryService.getAllMedicineStocks({ medicineId });
      if (!stocks.stocks || stocks.stocks.length === 0) {
        return [];
      }

      const stockIds = stocks.stocks.map(stock => stock.id);
      
      // Get QR codes for these stocks
      const qrCodes = await this.qrCodeService.getQRCodes({ 
        medicineStockId: { in: stockIds } 
      });

      return qrCodes.qrCodes || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get QR codes for medicine: ${errorMessage}`);
    }
  }

  /**
   * Get scan history for a medicine
   */
  async getScanHistoryForMedicine(medicineId: string) {
    try {
      const qrCodes = await this.getQRCodesForMedicine(medicineId);
      const qrCodeIds = qrCodes.map(qr => qr.id);
      
      if (qrCodeIds.length === 0) {
        return { scans: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      }

      return await this.qrCodeService.getScanLogs({ 
        qrCodeId: { in: qrCodeIds } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get scan history for medicine: ${errorMessage}`);
    }
  }
}
