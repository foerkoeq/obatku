// src/features/inventory/inventory.repository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { 
  Medicine, 
  MedicineStock,
  CreateMedicineDto,
  UpdateMedicineDto,
  CreateMedicineStockDto,
  UpdateMedicineStockDto,
  MedicineQueryParams,
  StockQueryParams,
  MedicineWithStocks,
  MedicineStockWithMedicine,
  MedicineStatus
} from './inventory.types';

export class InventoryRepository {
  constructor(private prisma: PrismaClient) {}

  // ========================
  // MEDICINE METHODS
  // ========================

  async findMedicines(params: MedicineQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      supplier,
      status,
      sortBy = 'name',
      sortOrder = 'asc'
    } = params;

    const skip = (page - 1) * limit;
    
    const where: Prisma.MedicineWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { producer: { contains: search } },
          { activeIngredient: { contains: search } }
        ]
      }),
      ...(category && { category: { contains: category } }),
      ...(supplier && { supplier: { contains: supplier } }),
      ...(status && { status })
    };

    const orderBy: Prisma.MedicineOrderByWithRelationInput = {
      [sortBy]: sortOrder
    };

    const [medicines, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          stocks: {
            select: {
              id: true,
              currentStock: true,
              minStock: true,
              expiryDate: true
            }
          }
        }
      }),
      this.prisma.medicine.count({ where })
    ]);

    return {
      medicines,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findMedicineById(id: string): Promise<MedicineWithStocks | null> {
    return this.prisma.medicine.findUnique({
      where: { id },
      include: {
        stocks: true
      }
    }) as Promise<MedicineWithStocks | null>;
  }

  async createMedicine(data: CreateMedicineDto, userId: string): Promise<Medicine> {
    return this.prisma.medicine.create({
      data: {
        ...data,
        status: data.status || MedicineStatus.ACTIVE,
        createdBy: userId
      }
    });
  }

  async updateMedicine(id: string, data: UpdateMedicineDto): Promise<Medicine> {
    return this.prisma.medicine.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async deleteMedicine(id: string): Promise<void> {
    await this.prisma.medicine.delete({
      where: { id }
    });
  }

  async findMedicineByName(name: string): Promise<Medicine | null> {
    return this.prisma.medicine.findFirst({
      where: { 
        name: { 
          equals: name
        } 
      }
    });
  }

  async bulkUpdateMedicineStatus(ids: string[], status: MedicineStatus): Promise<number> {
    const result = await this.prisma.medicine.updateMany({
      where: { id: { in: ids } },
      data: { status, updatedAt: new Date() }
    });
    return result.count;
  }

  async bulkDeleteMedicines(ids: string[]): Promise<number> {
    const result = await this.prisma.medicine.deleteMany({
      where: { id: { in: ids } }
    });
    return result.count;
  }

  // ========================
  // MEDICINE STOCK METHODS
  // ========================

  async findMedicineStocks(params: StockQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      medicineId,
      lowStock,
      expiringSoon,
      expired,
      sortBy = 'expiryDate',
      sortOrder = 'asc'
    } = params;

    const skip = (page - 1) * limit;
    const now = new Date();
    
    let where: Prisma.MedicineStockWhereInput = {
      ...(medicineId && { medicineId })
    };

    // Add search condition
    if (search) {
      where = {
        ...where,
        medicine: {
          name: { contains: search }
        }
      };
    }

    // Add lowStock condition
    if (lowStock) {
      where = {
        ...where,
        currentStock: {
          lte: this.prisma.medicineStock.fields.minStock
        }
      };
    }

    // Add expiring soon condition
    if (expiringSoon) {
      where = {
        ...where,
        expiryDate: {
          gte: now,
          lte: new Date(now.getTime() + expiringSoon * 24 * 60 * 60 * 1000)
        }
      };
    }

    // Add expired condition
    if (expired) {
      where = {
        ...where,
        expiryDate: {
          lt: now
        }
      };
    }

    let orderBy: Prisma.MedicineStockOrderByWithRelationInput = {};
    
    if (sortBy === 'medicine') {
      orderBy = { medicine: { name: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const [stocks, total] = await Promise.all([
      this.prisma.medicineStock.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              category: true,
              unit: true
            }
          }
        }
      }),
      this.prisma.medicineStock.count({ where })
    ]);

    // Calculate summary
    const [lowStockCount, expiredCount, expiringSoonCount] = await Promise.all([
      this.prisma.medicineStock.count({
        where: {
          currentStock: {
            lte: this.prisma.medicineStock.fields.minStock
          }
        }
      }),
      this.prisma.medicineStock.count({
        where: {
          expiryDate: { lt: now }
        }
      }),
      this.prisma.medicineStock.count({
        where: {
          expiryDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        }
      })
    ]);

    return {
      stocks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalItems: total,
        lowStockItems: lowStockCount,
        expiredItems: expiredCount,
        expiringSoonItems: expiringSoonCount
      }
    };
  }

  async findMedicineStockById(id: string): Promise<MedicineStockWithMedicine | null> {
    return this.prisma.medicineStock.findUnique({
      where: { id },
      include: {
        medicine: true
      }
    }) as Promise<MedicineStockWithMedicine | null>;
  }

  async createMedicineStock(data: CreateMedicineStockDto): Promise<MedicineStock> {
    return this.prisma.medicineStock.create({
      data: {
        ...data,
        currentStock: data.initialStock,
        minStock: data.minStock || 0
      }
    });
  }

  async updateMedicineStock(id: string, data: UpdateMedicineStockDto): Promise<MedicineStock> {
    return this.prisma.medicineStock.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async deleteMedicineStock(id: string): Promise<void> {
    await this.prisma.medicineStock.delete({
      where: { id }
    });
  }

  async adjustStock(stockId: string, newQuantity: number): Promise<MedicineStock> {
    const currentStock = await this.prisma.medicineStock.findUnique({
      where: { id: stockId }
    });

    if (!currentStock) {
      throw new Error('Stock not found');
    }
    
    // Update stock
    const updatedStock = await this.prisma.medicineStock.update({
      where: { id: stockId },
      data: {
        currentStock: newQuantity,
        updatedAt: new Date()
      }
    });

    return updatedStock;
  }

  // ========================
  // STATISTICS METHODS
  // ========================

  async getInventoryStatistics() {
    const [
      totalMedicines,
      activeMedicines,
      totalStockItems,
      lowStockItems,
      expiredItems,
      expiringSoonItems
    ] = await Promise.all([
      this.prisma.medicine.count(),
      this.prisma.medicine.count({ where: { status: MedicineStatus.ACTIVE } }),
      this.prisma.medicineStock.count(),
      this.prisma.medicineStock.count({
        where: {
          currentStock: {
            lte: this.prisma.medicineStock.fields.minStock
          }
        }
      }),
      this.prisma.medicineStock.count({
        where: {
          expiryDate: { lt: new Date() }
        }
      }),
      this.prisma.medicineStock.count({
        where: {
          expiryDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Calculate total stock value
    const stockValueResult = await this.prisma.medicineStock.aggregate({
      _sum: { currentStock: true },
      where: {
        expiryDate: { gte: new Date() }
      }
    });

    return {
      totalMedicines,
      activeMedicines,
      inactiveMedicines: totalMedicines - activeMedicines,
      totalStockItems,
      lowStockItems,
      expiredItems,
      expiringSoonItems,
      totalStockValue: Number(stockValueResult._sum.currentStock || 0),
      lastUpdateDate: new Date()
    };
  }

  async getStockValueByCategory() {
    const result = await this.prisma.medicine.findMany({
      select: {
        category: true,
        stocks: {
          select: {
            currentStock: true
          },
          where: {
            expiryDate: { gte: new Date() }
          }
        }
      },
      where: {
        status: MedicineStatus.ACTIVE
      }
    });

    const categoryStats = result.reduce((acc, medicine) => {
      const category = medicine.category;
      const totalStock = medicine.stocks.reduce((sum, stock) => sum + Number(stock.currentStock), 0);
      
      if (!acc[category]) {
        acc[category] = {
          category,
          totalValue: 0,
          itemCount: 0,
          averageValue: 0
        };
      }
      
      acc[category].totalValue += totalStock;
      acc[category].itemCount += medicine.stocks.length;
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.values(categoryStats).forEach((stat: any) => {
      stat.averageValue = stat.itemCount > 0 ? stat.totalValue / stat.itemCount : 0;
    });

    return Object.values(categoryStats);
  }

  async getLowStockItems() {
    const items = await this.prisma.medicineStock.findMany({
      where: {
        currentStock: {
          lte: this.prisma.medicineStock.fields.minStock
        }
      },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      },
      orderBy: {
        currentStock: 'asc'
      }
    });

    return items.map(item => ({
      id: item.id,
      medicineName: item.medicine?.name || '',
      category: item.medicine?.category || '',
      currentStock: Number(item.currentStock),
      minStock: Number(item.minStock),
      stockRatio: Number(item.currentStock) / Number(item.minStock),
      expiryDate: item.expiryDate
    }));
  }

  async getExpiringSoonItems(days: number = 30) {
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    const items = await this.prisma.medicineStock.findMany({
      where: {
        expiryDate: {
          gte: new Date(),
          lte: cutoffDate
        }
      },
      include: {
        medicine: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        expiryDate: 'asc'
      }
    });

    return items.map(item => ({
      id: item.id,
      medicineName: item.medicine?.name || '',
      batchNumber: item.batchNumber,
      currentStock: Number(item.currentStock),
      expiryDate: item.expiryDate,
      daysUntilExpiry: Math.ceil((item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    }));
  }
}
