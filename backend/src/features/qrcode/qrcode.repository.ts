// src/features/qrcode/qrcode.repository.ts
import { PrismaClient } from '@prisma/client';
import {
  QRCodeMaster,
  QRCodeData,
  QRCodeSequence,
  QRCodeScanLog,
  CreateQRCodeMasterDto,
  UpdateQRCodeMasterDto,
  QRCodeMasterQuery,
  QRCodeQuery,
  QRCodeScanQuery,
  QRMasterStatus,
  QRCodeStatus,
  ScanResult,
  SequenceStatus
} from './qrcode.types';
import { PaginationUtil } from '../../shared/utils/pagination.util';

export class QRCodeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // QR Code Master Repository Methods
  async findQRCodeMasters(query: QRCodeMasterQuery) {
    const { page, limit } = PaginationUtil.parseQuery(query);
    const { offset } = PaginationUtil.paginate({ page, limit, total: 0 });

    const where: any = {};

    // Search across multiple fields
    if (query.search) {
      where.OR = [
        { fundingSourceName: { contains: query.search, mode: 'insensitive' } },
        { medicineTypeName: { contains: query.search, mode: 'insensitive' } },
        { activeIngredientName: { contains: query.search, mode: 'insensitive' } },
        { producerName: { contains: query.search, mode: 'insensitive' } },
        { packageTypeName: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    // Filter by codes
    if (query.fundingSourceCode) {
      where.fundingSourceCode = query.fundingSourceCode;
    }
    if (query.medicineTypeCode) {
      where.medicineTypeCode = query.medicineTypeCode;
    }
    if (query.activeIngredientCode) {
      where.activeIngredientCode = query.activeIngredientCode;
    }
    if (query.producerCode) {
      where.producerCode = query.producerCode;
    }
    if (query.packageTypeCode) {
      where.packageTypeCode = query.packageTypeCode;
    }

    // Filter by status
    if (query.status) {
      where.status = query.status;
    }

    // Build order by
    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Get total count
    const total = await this.prisma.qrCodeMaster.count({ where });

    // Get masters with pagination
    const masters = await this.prisma.qrCodeMaster.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit
    });

    const meta = PaginationUtil.createMeta(page, limit, total);

    return { masters, meta };
  }

  async findQRCodeMasterById(id: string): Promise<QRCodeMaster | null> {
    return this.prisma.qrCodeMaster.findUnique({
      where: { id }
    });
  }

  async findQRCodeMaster(
    fundingSourceCode: string,
    medicineTypeCode: string,
    activeIngredientCode: string,
    producerCode: string,
    packageTypeCode?: string
  ): Promise<QRCodeMaster | null> {
    return this.prisma.qrCodeMaster.findFirst({
      where: {
        fundingSourceCode,
        medicineTypeCode,
        activeIngredientCode,
        producerCode,
        packageTypeCode: packageTypeCode || null
      }
    });
  }

  async createQRCodeMaster(data: CreateQRCodeMasterDto, userId: string): Promise<QRCodeMaster> {
    return this.prisma.qrCodeMaster.create({
      data: {
        ...data,
        status: QRMasterStatus.ACTIVE,
        createdBy: userId
      }
    });
  }

  async updateQRCodeMaster(
    id: string,
    data: UpdateQRCodeMasterDto,
    userId: string
  ): Promise<QRCodeMaster> {
    return this.prisma.qrCodeMaster.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
        updatedAt: new Date()
      }
    });
  }

  async deleteQRCodeMaster(id: string): Promise<void> {
    await this.prisma.qrCodeMaster.delete({
      where: { id }
    });
  }

  async hasQRCodesForMaster(
    fundingSourceCode: string,
    medicineTypeCode: string,
    activeIngredientCode: string,
    producerCode: string,
    packageTypeCode?: string
  ): Promise<boolean> {
    // Check QR codes by parsing the qrCodeString
    const qrCodePattern = `%${fundingSourceCode}${medicineTypeCode}${activeIngredientCode}${producerCode}%`;
    
    const count = await this.prisma.qrCodeData.count({
      where: {
        qrCodeString: {
          contains: `${fundingSourceCode}${medicineTypeCode}${activeIngredientCode}${producerCode}`
        }
      }
    });

    return count > 0;
  }

  // QR Code Sequence Repository Methods
  async findSequence(
    year: string,
    month: string,
    fundingSourceCode: string,
    medicineTypeCode: string,
    activeIngredientCode: string,
    producerCode: string,
    packageTypeCode?: string
  ): Promise<QRCodeSequence | null> {
    return this.prisma.qrCodeSequence.findFirst({
      where: {
        year,
        month,
        fundingSourceCode,
        medicineTypeCode,
        activeIngredientCode,
        producerCode,
        packageTypeCode: packageTypeCode || null,
        status: SequenceStatus.ACTIVE
      }
    });
  }

  async findSequenceById(id: string): Promise<QRCodeSequence | null> {
    return this.prisma.qrCodeSequence.findUnique({
      where: { id }
    });
  }

  async createSequence(data: Omit<QRCodeSequence, 'id' | 'createdAt' | 'updatedAt'>): Promise<QRCodeSequence> {
    return this.prisma.qrCodeSequence.create({
      data: {
        ...data,
        status: SequenceStatus.ACTIVE,
        lastGenerated: new Date()
      }
    });
  }

  async updateSequence(
    id: string,
    data: Partial<Pick<QRCodeSequence, 'currentSequence' | 'totalGenerated' | 'lastGenerated' | 'status'>>
  ): Promise<QRCodeSequence> {
    return this.prisma.qrCodeSequence.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  // QR Code Data Repository Methods
  async findQRCodes(query: QRCodeQuery) {
    const { page, limit } = PaginationUtil.parseQuery(query);
    const { offset } = PaginationUtil.paginate({ page, limit, total: 0 });

    const where: any = {};

    // Search in QR code string
    if (query.search) {
      where.qrCodeString = { contains: query.search, mode: 'insensitive' };
    }

    // Filter by medicine stock
    if (query.medicineStockId) {
      where.medicineStockId = query.medicineStockId;
    }

    // Filter by bulk package
    if (typeof query.isBulkPackage === 'boolean') {
      where.isBulkPackage = query.isBulkPackage;
    }

    // Filter by status
    if (query.status) {
      where.status = query.status;
    }

    // Filter by generated by
    if (query.generatedBy) {
      where.generatedBy = query.generatedBy;
    }

    // Filter by date range
    if (query.dateFrom || query.dateTo) {
      where.generatedAt = {};
      if (query.dateFrom) {
        where.generatedAt.gte = query.dateFrom;
      }
      if (query.dateTo) {
        where.generatedAt.lte = query.dateTo;
      }
    }

    // Filter by QR code components
    if (query.year) {
      where.qrCodeString = { startsWith: query.year };
    }
    if (query.month) {
      where.qrCodeString = { 
        ...where.qrCodeString,
        contains: query.year + query.month 
      };
    }
    if (query.fundingSource) {
      // This would need more complex string matching
      where.qrCodeString = {
        ...where.qrCodeString,
        contains: query.fundingSource
      };
    }
    if (query.medicineType) {
      where.qrCodeString = {
        ...where.qrCodeString,
        contains: query.medicineType
      };
    }

    // Build order by
    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.generatedAt = 'desc';
    }

    // Get total count
    const total = await this.prisma.qrCodeData.count({ where });

    // Get QR codes with pagination
    const qrCodes = await this.prisma.qrCodeData.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        medicineStock: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                brand: true,
                category: true
              }
            }
          }
        }
      }
    });

    const meta = PaginationUtil.createMeta(page, limit, total);

    return { qrCodes, meta };
  }

  async findQRCodeById(id: string): Promise<QRCodeData | null> {
    return this.prisma.qrCodeData.findUnique({
      where: { id },
      include: {
        medicineStock: {
          include: {
            medicine: true
          }
        },
        scanLogs: {
          orderBy: { scannedAt: 'desc' },
          take: 10
        }
      }
    });
  }

  async findQRCodeByString(qrCodeString: string): Promise<QRCodeData | null> {
    return this.prisma.qrCodeData.findUnique({
      where: { qrCodeString },
      include: {
        medicineStock: {
          include: {
            medicine: true
          }
        }
      }
    });
  }

  async createQRCode(data: Omit<QRCodeData, 'id' | 'createdAt' | 'updatedAt' | 'scannedCount' | 'lastScannedAt' | 'lastScannedBy'>): Promise<QRCodeData> {
    return this.prisma.qrCodeData.create({
      data: {
        ...data,
        scannedCount: 0,
        generatedAt: new Date()
      }
    });
  }

  async updateQRCodeStatus(id: string, status: QRCodeStatus, userId: string): Promise<QRCodeData> {
    return this.prisma.qrCodeData.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      }
    });
  }

  async updateQRCodeScanInfo(id: string, userId: string): Promise<QRCodeData> {
    return this.prisma.qrCodeData.update({
      where: { id },
      data: {
        scannedCount: { increment: 1 },
        lastScannedAt: new Date(),
        lastScannedBy: userId,
        updatedAt: new Date()
      }
    });
  }

  async deleteQRCode(id: string): Promise<void> {
    await this.prisma.qrCodeData.delete({
      where: { id }
    });
  }

  // QR Code Scan Log Repository Methods
  async findScanLogs(query: QRCodeScanQuery) {
    const { page, limit } = PaginationUtil.parseQuery(query);
    const { offset } = PaginationUtil.paginate({ page, limit, total: 0 });

    const where: any = {};

    // Filter by QR code ID
    if (query.qrCodeId) {
      where.qrCodeId = query.qrCodeId;
    }

    // Filter by scanned by
    if (query.scannedBy) {
      where.scannedBy = query.scannedBy;
    }

    // Filter by purpose
    if (query.purpose) {
      where.purpose = query.purpose;
    }

    // Filter by result
    if (query.result) {
      where.result = query.result;
    }

    // Filter by date range
    if (query.dateFrom || query.dateTo) {
      where.scannedAt = {};
      if (query.dateFrom) {
        where.scannedAt.gte = query.dateFrom;
      }
      if (query.dateTo) {
        where.scannedAt.lte = query.dateTo;
      }
    }

    // Build order by
    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.scannedAt = 'desc';
    }

    // Get total count
    const total = await this.prisma.qrCodeScanLog.count({ where });

    // Get scan logs with pagination
    const scans = await this.prisma.qrCodeScanLog.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        qrCode: {
          select: {
            id: true,
            qrCodeString: true,
            status: true
          }
        }
      }
    });

    const meta = PaginationUtil.createMeta(page, limit, total);

    return { scans, meta };
  }

  async createScanLog(data: Omit<QRCodeScanLog, 'id'>): Promise<QRCodeScanLog> {
    return this.prisma.qrCodeScanLog.create({
      data: {
        ...data,
        scannedAt: new Date()
      }
    });
  }

  // Utility Methods
  async getMedicineStockForQR(medicineStockId: string) {
    return this.prisma.medicineStock.findUnique({
      where: { id: medicineStockId },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            brand: true,
            category: true,
            type: true,
            activeIngredient: true,
            activeIngredientCode: true,
            producer: true,
            producerCode: true
          }
        }
      }
    });
  }

  // Statistics Methods
  async getQRCodeStatistics() {
    const totalGenerated = await this.prisma.qrCodeData.count();
    
    const totalPrinted = await this.prisma.qrCodeData.count({
      where: { printedAt: { not: null } }
    });

    const totalScanned = await this.prisma.qrCodeData.count({
      where: { scannedCount: { gt: 0 } }
    });

    const totalUsed = await this.prisma.qrCodeData.count({
      where: { status: QRCodeStatus.USED }
    });

    // Group by status
    const byStatus = await this.prisma.qrCodeData.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const statusCounts = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<QRCodeStatus, number>);

    // Group by medicine type (parse from QR code string)
    const allQRCodes = await this.prisma.qrCodeData.findMany({
      select: { qrCodeString: true }
    });

    const byMedicineType = allQRCodes.reduce((acc, qr) => {
      // Extract medicine type from position 5 (0-indexed)
      const medicineType = qr.qrCodeString.charAt(5);
      acc[medicineType] = (acc[medicineType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent generation trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentGeneration = await this.prisma.qrCodeData.count({
      where: {
        generatedAt: { gte: thirtyDaysAgo }
      }
    });

    // Most scanned QR codes
    const mostScanned = await this.prisma.qrCodeData.findMany({
      where: { scannedCount: { gt: 0 } },
      orderBy: { scannedCount: 'desc' },
      take: 10,
      select: {
        id: true,
        qrCodeString: true,
        scannedCount: true,
        medicineStock: {
          select: {
            medicine: {
              select: {
                name: true,
                brand: true
              }
            }
          }
        }
      }
    });

    // Scan statistics
    const totalScanLogs = await this.prisma.qrCodeScanLog.count();
    
    const successfulScans = await this.prisma.qrCodeScanLog.count({
      where: { result: ScanResult.SUCCESS }
    });

    const failedScans = totalScanLogs - successfulScans;

    return {
      generation: {
        totalGenerated,
        totalPrinted,
        recentGeneration,
        byStatus: statusCounts,
        byMedicineType
      },
      scanning: {
        totalScanned,
        totalUsed,
        totalScanLogs,
        successfulScans,
        failedScans,
        successRate: totalScanLogs > 0 ? (successfulScans / totalScanLogs) * 100 : 0,
        mostScanned
      }
    };
  }

  // Bulk operations
  async bulkUpdateQRCodeStatus(ids: string[], status: QRCodeStatus): Promise<number> {
    const result = await this.prisma.qrCodeData.updateMany({
      where: { id: { in: ids } },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    return result.count;
  }

  async bulkDeleteQRCodes(ids: string[]): Promise<number> {
    const result = await this.prisma.qrCodeData.deleteMany({
      where: { id: { in: ids } }
    });

    return result.count;
  }

  // Health check for QR code system
  async getSystemHealth() {
    const activeSequences = await this.prisma.qrCodeSequence.count({
      where: { status: SequenceStatus.ACTIVE }
    });

    const exhaustedSequences = await this.prisma.qrCodeSequence.count({
      where: { status: SequenceStatus.EXHAUSTED }
    });

    const activeMasters = await this.prisma.qrCodeMaster.count({
      where: { status: QRMasterStatus.ACTIVE }
    });

    return {
      sequences: {
        active: activeSequences,
        exhausted: exhaustedSequences,
        total: activeSequences + exhaustedSequences
      },
      masters: {
        active: activeMasters
      },
      status: exhaustedSequences > activeSequences ? 'warning' : 'healthy'
    };
  }
}
