// src/features/inventory/inventory.service.ts
import { PrismaClient } from '@prisma/client';
import {
  MedicineStatus,
  CreateMedicineDto,
  UpdateMedicineDto,
  CreateMedicineStockDto,
  UpdateMedicineStockDto,
  MedicineQueryParams
} from './inventory.types';

export class InventoryService {
  constructor(private readonly prisma: PrismaClient) {}

  // Medicine Service Methods
  async getAllMedicines(query: MedicineQueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const medicines = await this.prisma.medicine.findMany({
      skip,
      take: limit,
      where: {
        ...(query.search && {
          OR: [
            { name: { contains: query.search } },
            { producer: { contains: query.search } },
          ]
        }),
        ...(query.category && { category: query.category }),
        ...(query.supplier && { supplier: query.supplier }),
        ...(query.status && { status: query.status }),
      },
      orderBy: {
        [query.sortBy || 'createdAt']: query.sortOrder || 'desc'
      }
    });

    const total = await this.prisma.medicine.count({
      where: {
        ...(query.search && {
          OR: [
            { name: { contains: query.search } },
            { producer: { contains: query.search } },
          ]
        }),
        ...(query.category && { category: query.category }),
        ...(query.supplier && { supplier: query.supplier }),
        ...(query.status && { status: query.status }),
      }
    });

    return {
      medicines,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getMedicineById(id: string) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id }
    });

    if (!medicine) {
      throw new Error('Medicine not found');
    }

    return medicine;
  }

  async createMedicine(data: CreateMedicineDto, userId: string) {
    return await this.prisma.medicine.create({
      data: {
        ...data,
        createdBy: userId
      }
    });
  }

  async updateMedicine(id: string, data: UpdateMedicineDto, _userId: string) {
    // Validate medicine exists
    await this.getMedicineById(id);
    
    return await this.prisma.medicine.update({
      where: { id },
      data
    });
  }

  async deleteMedicine(id: string) {
    // Validate medicine exists
    await this.getMedicineById(id);
    
    return await this.prisma.medicine.delete({
      where: { id }
    });
  }

  async updateMedicineStatus(id: string, status: MedicineStatus, _userId: string) {
    // Validate medicine exists
    await this.getMedicineById(id);
    
    return await this.prisma.medicine.update({
      where: { id },
      data: { status }
    });
  }

  // Stock Service Methods
  async getAllMedicineStocks(query: any) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const stocks = await this.prisma.medicineStock.findMany({
      skip,
      take: limit,
      include: {
        medicine: true
      }
    });

    const total = await this.prisma.medicineStock.count();

    return {
      stocks,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      summary: {}
    };
  }

  async getMedicineStockById(id: string) {
    const stock = await this.prisma.medicineStock.findUnique({
      where: { id },
      include: {
        medicine: true
      }
    });

    if (!stock) {
      throw new Error('Medicine stock not found');
    }

    return stock;
  }

  async createMedicineStock(data: CreateMedicineStockDto, _userId: string) {
    return await this.prisma.medicineStock.create({
      data: {
        ...data,
        currentStock: data.initialStock
      }
    });
  }

  async updateMedicineStock(id: string, data: UpdateMedicineStockDto, _userId: string) {
    // Validate stock exists
    await this.getMedicineStockById(id);
    
    return await this.prisma.medicineStock.update({
      where: { id },
      data
    });
  }

  async adjustStock(id: string, quantity: number, _reason: string, _userId: string, _notes?: string) {
    const stock = await this.getMedicineStockById(id);
    
    return await this.prisma.medicineStock.update({
      where: { id },
      data: {
        currentStock: stock.currentStock.toNumber() + quantity
      }
    });
  }

  async reserveStock(id: string, quantity: number, _userId: string) {
    const stock = await this.getMedicineStockById(id);
    
    return await this.prisma.medicineStock.update({
      where: { id },
      data: {
        currentStock: stock.currentStock.toNumber() - quantity
      }
    });
  }

  async releaseReservedStock(id: string, quantity: number, _userId: string) {
    const stock = await this.getMedicineStockById(id);
    
    return await this.prisma.medicineStock.update({
      where: { id },
      data: {
        currentStock: stock.currentStock.toNumber() + quantity
      }
    });
  }

  async deleteStock(id: string) {
    // Validate stock exists
    await this.getMedicineStockById(id);
    
    return await this.prisma.medicineStock.delete({
      where: { id }
    });
  }

  // Mock methods for other features
  async getStockMovements(query: any) {
    return {
      movements: [],
      page: query.page || 1,
      limit: query.limit || 20,
      total: 0,
      totalPages: 0
    };
  }

  async getStockMovementsByStockId(_stockId: string, query: any) {
    return {
      movements: [],
      page: query.page || 1,
      limit: query.limit || 20,
      total: 0,
      totalPages: 0
    };
  }

  async generateStockAlerts() {
    // Mock implementation
  }

  async getStockAlerts(_readFilter?: boolean) {
    return [];
  }

  async markAlertAsRead(_id: string, _userId: string) {
    // Mock implementation
  }

  async getUnreadAlertsCount() {
    return 0;
  }

  async getInventoryStatistics() {
    return {};
  }

  async getLowStockItems(_limit: number) {
    return [];
  }

  async getExpiringSoonItems(_days: number, _limit: number) {
    return [];
  }

  async getStockValueByCategory() {
    return [];
  }

  async bulkUpdateMedicineStatus(_ids: string[], _status: MedicineStatus, _userId: string) {
    return {
      updated: 0,
      errors: []
    };
  }
}
