// src/features/qrcode/qrcode.repository.ts
import { PrismaClient } from '@prisma/client';
import {
  CreateQRCodeMasterDto,
  UpdateQRCodeMasterDto,
  QRCodeMasterQuery,
  QRCodeQuery,
  QRCodeScanQuery
} from './qrcode.types';
import { PaginationUtil } from '../../shared/utils/pagination.util';

export class QRCodeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // QR Code Master Repository Methods
  async findQRCodeMasters(query: QRCodeMasterQuery) {
    const { page, limit } = PaginationUtil.parseQuery(query);
    const { offset } = PaginationUtil.paginate({ page, limit, total: 0 });

    const where: any = {};

    // Search in name fields
    if (query.search) {
      where.OR = [
        { fundingSourceName: { contains: query.search, mode: 'insensitive' } },
        { medicineTypeName: { contains: query.search, mode: 'insensitive' } },
        { activeIngredientName: { contains: query.search, mode: 'insensitive' } },
        { producerName: { contains: query.search, mode: 'insensitive' } }
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
    const total = await this.prisma.qRCodeMaster.count({ where });

    // Get masters with pagination
    const masters = await this.prisma.qRCodeMaster.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit
    });

    const meta = PaginationUtil.createMeta(page, limit, total);

    return { masters, meta };
  }

  async findQRCodeMasterById(id: string) {
    return this.prisma.qRCodeMaster.findUnique({
      where: { id }
    });
  }

  async findQRCodeMaster(
    fundingSourceCode: string,
    medicineTypeCode: string,
    activeIngredientCode: string,
    producerCode: string,
    packageTypeCode?: string
  ) {
    return this.prisma.qRCodeMaster.findFirst({
      where: {
        fundingSourceCode,
        medicineTypeCode,
        activeIngredientCode,
        producerCode,
        packageTypeCode: packageTypeCode || null
      }
    });
  }

  async createQRCodeMaster(data: CreateQRCodeMasterDto, userId: string) {
    return this.prisma.qRCodeMaster.create({
      data: {
        ...data,
        status: 'ACTIVE',
        createdBy: userId
      }
    });
  }

  async updateQRCodeMaster(
    id: string,
    data: UpdateQRCodeMasterDto,
    userId: string
  ) {
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
      updatedBy: userId
    };
    
    // Remove status if it's not provided to avoid type conflicts
    if (!data.status) {
      delete updateData.status;
    }
    
    return this.prisma.qRCodeMaster.update({
      where: { id },
      data: updateData
    });
  }

  async deleteQRCodeMaster(id: string): Promise<void> {
    await this.prisma.qRCodeMaster.delete({
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
    let qrCodePattern = `${fundingSourceCode}${medicineTypeCode}${activeIngredientCode}${producerCode}`;
    
    // If packageTypeCode is provided, include it in the pattern for bulk packages
    if (packageTypeCode && packageTypeCode.trim() !== '') {
      qrCodePattern += `-${packageTypeCode}`;
    }
    
    const count = await this.prisma.qRCodeData.count({
      where: {
        qrCodeString: {
          contains: qrCodePattern
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
  ) {
    return this.prisma.qRCodeSequence.findFirst({
      where: {
        year,
        month,
        fundingSourceCode,
        medicineTypeCode,
        activeIngredientCode,
        producerCode,
        packageTypeCode: packageTypeCode || null
      }
    });
  }

  async findSequenceById(id: string) {
    return this.prisma.qRCodeSequence.findUnique({
      where: { id }
    });
  }

  async createSequence(data: any) {
    return this.prisma.qRCodeSequence.create({
      data: {
        ...data,
        packageTypeCode: data.packageTypeCode || null,
        lastGenerated: data.lastGenerated || new Date()
      }
    });
  }

  async updateSequence(
    id: string,
    data: Partial<Pick<any, 'currentSequence' | 'totalGenerated' | 'lastGenerated'>>
  ) {
    return this.prisma.qRCodeSequence.update({
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
    const total = await this.prisma.qRCodeData.count({ where });

    // Get QR codes with pagination
    const qrCodes = await this.prisma.qRCodeData.findMany({
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
                category: true,
                activeIngredient: true,
                producer: true
              }
            }
          }
        }
      }
    });

    const meta = PaginationUtil.createMeta(page, limit, total);

    return { qrCodes, meta };
  }

  async findQRCodeById(id: string) {
    return this.prisma.qRCodeData.findUnique({
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

  async findQRCodeByString(qrCodeString: string) {
    return this.prisma.qRCodeData.findUnique({
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

  async createQRCode(data: any) {
    return this.prisma.qRCodeData.create({
      data: {
        ...data,
        qrCodeImage: data.qrCodeImage || null,
        medicineStockId: data.medicineStockId || null,
        printedAt: data.printedAt || null,
        printedBy: data.printedBy || null,
        batchInfo: data.batchInfo || null,
        notes: data.notes || null,
        components: data.components,
        scannedCount: 0,
        generatedAt: new Date()
      }
    });
  }

  async updateQRCodeStatus(id: string, status: string, userId: string) {
    return this.prisma.qRCodeData.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date()
      }
    });
  }

  async updateQRCodeScanInfo(id: string, userId: string) {
    return this.prisma.qRCodeData.update({
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
    await this.prisma.qRCodeData.delete({
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
    const total = await this.prisma.qRCodeScanLog.count({ where });

    // Get scan logs with pagination
    const scans = await this.prisma.qRCodeScanLog.findMany({
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

  async createScanLog(data: any) {
    return this.prisma.qRCodeScanLog.create({
      data: {
        ...data,
        location: data.location || null,
        deviceInfo: data.deviceInfo || null,
        notes: data.notes || null,
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
            category: true,
            activeIngredient: true,
            producer: true
          }
        }
      }
    });
  }

  // Statistics Methods
  async getQRCodeStatistics() {
    const totalGenerated = await this.prisma.qRCodeData.count();
    
    const totalPrinted = await this.prisma.qRCodeData.count({
      where: { printedAt: { not: null } }
    });

    const totalScanned = await this.prisma.qRCodeData.count({
      where: { scannedCount: { gt: 0 } }
    });

    const totalUsed = await this.prisma.qRCodeData.count({
      where: { status: 'USED' }
    });

    // Group by status
    const byStatus = await this.prisma.qRCodeData.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const statusCounts = byStatus.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Group by medicine type (parse from QR code string)
    const allQRCodes = await this.prisma.qRCodeData.findMany({
      select: { qrCodeString: true }
    });

    const byMedicineType = allQRCodes.reduce((acc: Record<string, number>, qr: any) => {
      // Extract medicine type from position 5 (0-indexed)
      const medicineType = qr.qrCodeString.charAt(5);
      acc[medicineType] = (acc[medicineType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent generation trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentGeneration = await this.prisma.qRCodeData.count({
      where: {
        generatedAt: { gte: thirtyDaysAgo }
      }
    });

    // Most scanned QR codes
    const mostScanned = await this.prisma.qRCodeData.findMany({
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
                category: true
              }
            }
          }
        }
      }
    });

    // Scan statistics
    const totalScanLogs = await this.prisma.qRCodeScanLog.count();
    
    const successfulScans = await this.prisma.qRCodeScanLog.count({
      where: { result: 'SUCCESS' }
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
  async bulkUpdateQRCodeStatus(ids: string[], status: string): Promise<number> {
    const result = await this.prisma.qRCodeData.updateMany({
      where: { id: { in: ids } },
      data: { 
        status: status as any,
        updatedAt: new Date()
      }
    });

    return result.count;
  }

  async bulkDeleteQRCodes(ids: string[]): Promise<number> {
    const result = await this.prisma.qRCodeData.deleteMany({
      where: { id: { in: ids } }
    });

    return result.count;
  }

  // Health check for QR code system
  async getSystemHealth() {
    const activeSequences = await this.prisma.qRCodeSequence.count({
      where: { status: 'ACTIVE' }
    });

    const exhaustedSequences = await this.prisma.qRCodeSequence.count({
      where: { status: 'EXHAUSTED' }
    });

    const activeMasters = await this.prisma.qRCodeMaster.count({
      where: { status: 'ACTIVE' }
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
