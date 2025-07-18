// src/features/qrcode/qrcode.service.ts
import {
  QRCodeMaster,
  QRCodeData,
  QRCodeSequence,
  CreateQRCodeMasterDto,
  UpdateQRCodeMasterDto,
  GenerateQRCodeDto,
  BulkGenerateQRCodeDto,
  ScanQRCodeDto,
  QRCodeComponents,
  QRCodeGenerationResult,
  QRCodeValidationResult,
  QRCodeScanResult,
  SequenceType,
  QRCodeStatus,
  ScanPurpose,
  ScanResult,
  QR_CODE_FORMATS,
  SEQUENCE_CONFIGS
} from './qrcode.types';
import { QRCodeRepository } from './qrcode.repository';
import QRCode from 'qrcode';

export class QRCodeService {
  constructor(private readonly qrCodeRepository: QRCodeRepository) {}

  // QR Code Master Management
  async createQRCodeMaster(data: CreateQRCodeMasterDto, userId: string): Promise<QRCodeMaster> {
    // Check if master already exists
    const exists = await this.qrCodeRepository.findQRCodeMaster(
      data.fundingSourceCode,
      data.medicineTypeCode,
      data.activeIngredientCode,
      data.producerCode,
      data.packageTypeCode
    );

    if (exists) {
      throw new Error('QR Code master with these codes already exists');
    }

    return this.qrCodeRepository.createQRCodeMaster(data, userId);
  }

  async updateQRCodeMaster(
    id: string,
    data: UpdateQRCodeMasterDto,
    userId: string
  ): Promise<QRCodeMaster> {
    const master = await this.qrCodeRepository.findQRCodeMasterById(id);
    if (!master) {
      throw new Error('QR Code master not found');
    }

    return this.qrCodeRepository.updateQRCodeMaster(id, data, userId);
  }

  async getQRCodeMasters(query: any) {
    return this.qrCodeRepository.findQRCodeMasters(query);
  }

  async getQRCodeMasterById(id: string): Promise<QRCodeMaster | null> {
    return this.qrCodeRepository.findQRCodeMasterById(id);
  }

  async deleteQRCodeMaster(id: string): Promise<void> {
    const master = await this.qrCodeRepository.findQRCodeMasterById(id);
    if (!master) {
      throw new Error('QR Code master not found');
    }

    // Check if there are any QR codes using this master
    const hasQRCodes = await this.qrCodeRepository.hasQRCodesForMaster(
      master.fundingSourceCode,
      master.medicineTypeCode,
      master.activeIngredientCode,
      master.producerCode,
      master.packageTypeCode
    );

    if (hasQRCodes) {
      throw new Error('Cannot delete QR Code master that is being used');
    }

    await this.qrCodeRepository.deleteQRCodeMaster(id);
  }

  // QR Code Generation
  async generateQRCodes(data: GenerateQRCodeDto, userId: string): Promise<QRCodeGenerationResult> {
    const result: QRCodeGenerationResult = {
      success: false,
      generated: 0,
      failed: 0,
      qrCodes: [],
      errors: []
    };

    try {
      // Get medicine stock info
      const medicineStock = await this.qrCodeRepository.getMedicineStockForQR(data.medicineStockId);
      if (!medicineStock) {
        throw new Error('Medicine stock not found');
      }

      // Find or create sequence
      const sequence = await this.getOrCreateSequence(medicineStock, data.isBulkPackage);

      // Generate QR codes
      for (let i = 0; i < data.quantity; i++) {
        try {
          const nextSequence = await this.generateNextSequence(sequence.id);
          const qrCodeString = this.formatQRCodeString(sequence, nextSequence, data.isBulkPackage);
          const qrCodeImage = await this.generateQRCodeImage(qrCodeString);

          const components = this.parseQRCodeComponents(qrCodeString);

          const qrCode = await this.qrCodeRepository.createQRCode({
            qrCodeString,
            qrCodeImage,
            medicineStockId: data.medicineStockId,
            isBulkPackage: data.isBulkPackage || false,
            components,
            batchInfo: data.batchInfo,
            generatedBy: userId,
            status: QRCodeStatus.GENERATED,
            notes: data.notes
          });

          result.qrCodes.push(qrCode);
          result.generated++;
        } catch (error) {
          result.failed++;
          result.errors?.push(`Failed to generate QR code ${i + 1}: ${error.message}`);
        }
      }

      result.success = result.generated > 0;
      return result;
    } catch (error) {
      result.errors?.push(error.message);
      return result;
    }
  }

  async bulkGenerateQRCodes(
    data: BulkGenerateQRCodeDto,
    userId: string
  ): Promise<QRCodeGenerationResult> {
    const result: QRCodeGenerationResult = {
      success: false,
      generated: 0,
      failed: 0,
      qrCodes: [],
      errors: []
    };

    try {
      // Calculate number of bulk packages needed
      const bulkPackagesNeeded = Math.ceil(data.totalQuantity / data.bulkPackageSize);

      // Generate individual item QR codes
      const individualResult = await this.generateQRCodes({
        medicineStockId: data.medicineStockId,
        quantity: data.totalQuantity,
        isBulkPackage: false,
        batchInfo: data.batchInfo,
        notes: data.notes
      }, userId);

      result.qrCodes.push(...individualResult.qrCodes);
      result.generated += individualResult.generated;
      result.failed += individualResult.failed;
      if (individualResult.errors) {
        result.errors?.push(...individualResult.errors);
      }

      // Generate bulk package QR codes
      const bulkResult = await this.generateQRCodes({
        medicineStockId: data.medicineStockId,
        quantity: bulkPackagesNeeded,
        isBulkPackage: true,
        batchInfo: data.batchInfo,
        notes: `Bulk package (${data.bulkPackageSize} items per package). ${data.notes || ''}`
      }, userId);

      result.qrCodes.push(...bulkResult.qrCodes);
      result.generated += bulkResult.generated;
      result.failed += bulkResult.failed;
      if (bulkResult.errors) {
        result.errors?.push(...bulkResult.errors);
      }

      result.success = result.generated > 0;
      return result;
    } catch (error) {
      result.errors?.push(error.message);
      return result;
    }
  }

  // QR Code Scanning
  async scanQRCode(data: ScanQRCodeDto, userId: string): Promise<QRCodeScanResult> {
    try {
      // Validate QR code format
      const validation = this.validateQRCodeFormat(data.qrCodeString);
      if (!validation.isValid) {
        return {
          success: false,
          scanLog: await this.qrCodeRepository.createScanLog({
            qrCodeString: data.qrCodeString,
            scannedBy: userId,
            purpose: data.purpose,
            result: ScanResult.INVALID_FORMAT,
            location: data.location,
            deviceInfo: data.deviceInfo,
            notes: data.notes
          }),
          result: ScanResult.INVALID_FORMAT,
          message: validation.errors.join(', ')
        };
      }

      // Find QR code in database
      const qrCode = await this.qrCodeRepository.findQRCodeByString(data.qrCodeString);
      if (!qrCode) {
        return {
          success: false,
          scanLog: await this.qrCodeRepository.createScanLog({
            qrCodeString: data.qrCodeString,
            scannedBy: userId,
            purpose: data.purpose,
            result: ScanResult.NOT_FOUND,
            location: data.location,
            deviceInfo: data.deviceInfo,
            notes: data.notes
          }),
          result: ScanResult.NOT_FOUND,
          message: 'QR code not found in system'
        };
      }

      // Check if QR code is expired
      if (qrCode.status === QRCodeStatus.EXPIRED) {
        return {
          success: false,
          qrCode,
          scanLog: await this.qrCodeRepository.createScanLog({
            qrCodeId: qrCode.id,
            qrCodeString: data.qrCodeString,
            scannedBy: userId,
            purpose: data.purpose,
            result: ScanResult.EXPIRED,
            location: data.location,
            deviceInfo: data.deviceInfo,
            notes: data.notes
          }),
          result: ScanResult.EXPIRED,
          message: 'QR code has expired'
        };
      }

      // Update QR code scan count and last scanned info
      await this.qrCodeRepository.updateQRCodeScanInfo(qrCode.id, userId);

      // Create successful scan log
      const scanLog = await this.qrCodeRepository.createScanLog({
        qrCodeId: qrCode.id,
        qrCodeString: data.qrCodeString,
        scannedBy: userId,
        purpose: data.purpose,
        result: ScanResult.SUCCESS,
        location: data.location,
        deviceInfo: data.deviceInfo,
        notes: data.notes
      });

      return {
        success: true,
        qrCode,
        scanLog,
        result: ScanResult.SUCCESS,
        message: 'QR code scanned successfully'
      };
    } catch (error) {
      return {
        success: false,
        scanLog: await this.qrCodeRepository.createScanLog({
          qrCodeString: data.qrCodeString,
          scannedBy: userId,
          purpose: data.purpose,
          result: ScanResult.ERROR,
          location: data.location,
          deviceInfo: data.deviceInfo,
          notes: `Error: ${error.message}`
        }),
        result: ScanResult.ERROR,
        message: `Scan failed: ${error.message}`
      };
    }
  }

  // QR Code Validation
  validateQRCodeFormat(qrCodeString: string): QRCodeValidationResult {
    const result: QRCodeValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    try {
      // Check basic format
      if (!qrCodeString || qrCodeString.length < 13 || qrCodeString.length > 20) {
        result.errors.push('Invalid QR code length');
        return result;
      }

      // Parse components
      const components = this.parseQRCodeComponents(qrCodeString);
      if (!components) {
        result.errors.push('Unable to parse QR code components');
        return result;
      }

      // Validate year (should be current year ± 5 years)
      const currentYear = new Date().getFullYear() % 100;
      const qrYear = parseInt(components.year);
      if (Math.abs(qrYear - currentYear) > 5) {
        result.warnings.push('QR code year is unusual');
      }

      // Validate month
      const month = parseInt(components.month);
      if (month < 1 || month > 12) {
        result.errors.push('Invalid month in QR code');
        return result;
      }

      // Validate medicine type
      if (!['F', 'I', 'H', 'B'].includes(components.medicineType)) {
        result.errors.push('Invalid medicine type code');
        return result;
      }

      // Validate active ingredient (3 digits)
      if (!/^[0-9]{3}$/.test(components.activeIngredient)) {
        result.errors.push('Invalid active ingredient code');
        return result;
      }

      // Validate producer (1 uppercase letter)
      if (!/^[A-Z]$/.test(components.producer)) {
        result.errors.push('Invalid producer code');
        return result;
      }

      // Validate sequence
      if (!this.isValidSequence(components.sequence)) {
        result.errors.push('Invalid sequence format');
        return result;
      }

      result.isValid = result.errors.length === 0;
      result.components = components;
      return result;
    } catch (error) {
      result.errors.push(`Validation error: ${error.message}`);
      return result;
    }
  }

  // Helper Methods
  private async getOrCreateSequence(medicineStock: any, isBulkPackage?: boolean): Promise<QRCodeSequence> {
    const now = new Date();
    const year = (now.getFullYear() % 100).toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    // Find existing sequence
    let sequence = await this.qrCodeRepository.findSequence(
      year,
      month,
      medicineStock.medicine.fundingSourceCode,
      medicineStock.medicine.medicineTypeCode,
      medicineStock.medicine.activeIngredientCode,
      medicineStock.medicine.producerCode,
      isBulkPackage ? medicineStock.packageTypeCode : undefined
    );

    if (!sequence) {
      // Create new sequence
      sequence = await this.qrCodeRepository.createSequence({
        year,
        month,
        fundingSourceCode: medicineStock.medicine.fundingSourceCode,
        medicineTypeCode: medicineStock.medicine.medicineTypeCode,
        activeIngredientCode: medicineStock.medicine.activeIngredientCode,
        producerCode: medicineStock.medicine.producerCode,
        packageTypeCode: isBulkPackage ? medicineStock.packageTypeCode : undefined,
        currentSequence: '0000', // Will be incremented to 0001 on first use
        totalGenerated: 0
      });
    }

    return sequence;
  }

  private async generateNextSequence(sequenceId: string): Promise<string> {
    const sequence = await this.qrCodeRepository.findSequenceById(sequenceId);
    if (!sequence) {
      throw new Error('Sequence not found');
    }

    const nextSequence = this.calculateNextSequence(sequence.currentSequence);
    
    await this.qrCodeRepository.updateSequence(sequenceId, {
      currentSequence: nextSequence,
      totalGenerated: sequence.totalGenerated + 1,
      lastGenerated: new Date()
    });

    return nextSequence;
  }

  private calculateNextSequence(currentSequence: string): string {
    // Determine sequence type
    const type = this.getSequenceType(currentSequence);

    switch (type) {
      case SequenceType.NUMERIC:
        return this.incrementNumericSequence(currentSequence);
      case SequenceType.ALPHA_SUFFIX:
        return this.incrementAlphaSuffixSequence(currentSequence);
      case SequenceType.ALPHA_PREFIX:
        return this.incrementAlphaPrefixSequence(currentSequence);
      default:
        throw new Error('Unknown sequence type');
    }
  }

  private getSequenceType(sequence: string): SequenceType {
    if (/^[0-9]{4}$/.test(sequence)) {
      return SequenceType.NUMERIC;
    } else if (/^[0-9]{3}[A-Z]$/.test(sequence)) {
      return SequenceType.ALPHA_SUFFIX;
    } else if (/^[0-9]{2}[A-Z][0-9]$/.test(sequence)) {
      return SequenceType.ALPHA_PREFIX;
    } else {
      throw new Error('Invalid sequence format');
    }
  }

  private incrementNumericSequence(sequence: string): string {
    const num = parseInt(sequence);
    if (num >= 9999) {
      return '000A'; // Transition to alpha suffix
    }
    return (num + 1).toString().padStart(4, '0');
  }

  private incrementAlphaSuffixSequence(sequence: string): string {
    const numPart = sequence.substring(0, 3);
    const alphaPart = sequence.substring(3);

    if (alphaPart === 'Z') {
      const nextNum = parseInt(numPart) + 1;
      if (nextNum > 999) {
        return '001A'; // Transition to alpha prefix
      }
      return nextNum.toString().padStart(3, '0') + 'A';
    }

    const nextChar = String.fromCharCode(alphaPart.charCodeAt(0) + 1);
    return numPart + nextChar;
  }

  private incrementAlphaPrefixSequence(sequence: string): string {
    const numPart1 = sequence.substring(0, 2);
    const alphaPart = sequence.substring(2, 3);
    const numPart2 = sequence.substring(3);

    const nextNum2 = parseInt(numPart2) + 1;
    if (nextNum2 <= 9) {
      return numPart1 + alphaPart + nextNum2.toString();
    }

    // Increment alpha part
    if (alphaPart === 'Z') {
      const nextNum1 = parseInt(numPart1) + 1;
      if (nextNum1 > 99) {
        throw new Error('Sequence exhausted');
      }
      return nextNum1.toString().padStart(2, '0') + 'A1';
    }

    const nextChar = String.fromCharCode(alphaPart.charCodeAt(0) + 1);
    return numPart1 + nextChar + '1';
  }

  private formatQRCodeString(
    sequence: QRCodeSequence,
    nextSequence: string,
    isBulkPackage?: boolean
  ): string {
    let qrCode = sequence.year + sequence.month + sequence.fundingSourceCode +
                 sequence.medicineTypeCode + sequence.activeIngredientCode + 
                 sequence.producerCode;

    if (isBulkPackage && sequence.packageTypeCode) {
      qrCode += '-' + sequence.packageTypeCode;
    }

    qrCode += nextSequence;
    return qrCode;
  }

  private parseQRCodeComponents(qrCodeString: string): QRCodeComponents | null {
    try {
      const isBulk = qrCodeString.includes('-');
      
      if (isBulk) {
        // Format: YYMMSTTTIIP-K####
        const [mainPart, bulkPart] = qrCodeString.split('-');
        const packageType = bulkPart.substring(0, 1);
        const sequence = bulkPart.substring(1);

        return {
          year: mainPart.substring(0, 2),
          month: mainPart.substring(2, 4),
          fundingSource: mainPart.substring(4, 5),
          medicineType: mainPart.substring(5, 6),
          activeIngredient: mainPart.substring(6, 9),
          producer: mainPart.substring(9, 10),
          packageType,
          sequence
        };
      } else {
        // Format: YYMMSTTTIIP####
        return {
          year: qrCodeString.substring(0, 2),
          month: qrCodeString.substring(2, 4),
          fundingSource: qrCodeString.substring(4, 5),
          medicineType: qrCodeString.substring(5, 6),
          activeIngredient: qrCodeString.substring(6, 9),
          producer: qrCodeString.substring(9, 10),
          sequence: qrCodeString.substring(10)
        };
      }
    } catch (error) {
      return null;
    }
  }

  private async generateQRCodeImage(qrCodeString: string): Promise<string> {
    try {
      const options = {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M' as const
      };

      const qrCodeDataURL = await QRCode.toDataURL(qrCodeString, options);
      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`Failed to generate QR code image: ${error.message}`);
    }
  }

  private isValidSequence(sequence: string): boolean {
    const patterns = [
      /^[0-9]{4}$/,      // 0001-9999
      /^[0-9]{3}[A-Z]$/,  // 000A-999Z
      /^[0-9]{2}[A-Z][0-9]$/ // 00A1-99Z9
    ];

    return patterns.some(pattern => pattern.test(sequence));
  }

  // Public utility methods
  async getQRCodeById(id: string): Promise<QRCodeData | null> {
    return this.qrCodeRepository.findQRCodeById(id);
  }

  async getQRCodes(query: any) {
    return this.qrCodeRepository.findQRCodes(query);
  }

  async getScanLogs(query: any) {
    return this.qrCodeRepository.findScanLogs(query);
  }

  async deleteQRCode(id: string): Promise<void> {
    const qrCode = await this.qrCodeRepository.findQRCodeById(id);
    if (!qrCode) {
      throw new Error('QR code not found');
    }

    // Check if QR code has been scanned
    if (qrCode.scannedCount > 0) {
      throw new Error('Cannot delete QR code that has been scanned');
    }

    await this.qrCodeRepository.deleteQRCode(id);
  }

  async updateQRCodeStatus(id: string, status: QRCodeStatus, userId: string): Promise<QRCodeData> {
    const qrCode = await this.qrCodeRepository.findQRCodeById(id);
    if (!qrCode) {
      throw new Error('QR code not found');
    }

    return this.qrCodeRepository.updateQRCodeStatus(id, status, userId);
  }

  async getQRCodeStatistics() {
    return this.qrCodeRepository.getQRCodeStatistics();
  }
}
