// # START OF Master Data Service - Business logic for master data management
// Purpose: Handle business logic for farmer groups, commodities, pest types, and reference data
// Dependencies: Prisma client, validation schemas
// Returns: Processed master data operations

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export interface FarmerGroupParams {
  district?: string;
  village?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CommodityParams {
  category?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  search?: string;
  page?: number;
  limit?: number;
}

export interface PestTypeParams {
  category?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'ACTIVE' | 'INACTIVE';
  search?: string;
  page?: number;
  limit?: number;
}

export class MasterDataService {
  // ================================================
  // FARMER GROUPS
  // ================================================

  async getFarmerGroups(params: FarmerGroupParams) {
    const {
      district,
      village,
      status = 'ACTIVE',
      search,
      page = 1,
      limit = 50
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (district) where.district = { contains: district, mode: 'insensitive' };
    if (village) where.village = { contains: village, mode: 'insensitive' };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { leader: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { village: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.farmerGroup.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          },
          updater: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.farmerGroup.count({ where })
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getFarmerGroup(id: string) {
    const farmerGroup = await prisma.farmerGroup.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        updater: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!farmerGroup) {
      throw new Error('Farmer group not found');
    }

    return farmerGroup;
  }

  async createFarmerGroup(data: any, createdBy: string) {
    // Check if farmer group with same name already exists
    const existing = await prisma.farmerGroup.findUnique({
      where: { name: data.name }
    });

    if (existing) {
      throw new Error('Farmer group with this name already exists');
    }

    const farmerGroup = await prisma.farmerGroup.create({
      data: {
        ...data,
        createdBy,
        contactInfo: data.contactInfo || {}
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return farmerGroup;
  }

  async updateFarmerGroup(id: string, data: any, updatedBy: string) {
    const existing = await prisma.farmerGroup.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Farmer group not found');
    }

    // Check if name is being changed and if new name already exists
    if (data.name && data.name !== existing.name) {
      const nameExists = await prisma.farmerGroup.findUnique({
        where: { name: data.name }
      });

      if (nameExists) {
        throw new Error('Farmer group with this name already exists');
      }
    }

    const farmerGroup = await prisma.farmerGroup.update({
      where: { id },
      data: {
        ...data,
        updatedBy
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        updater: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return farmerGroup;
  }

  async deleteFarmerGroup(id: string) {
    const existing = await prisma.farmerGroup.findUnique({
      where: { id },
      include: { submissions: true }
    });

    if (!existing) {
      throw new Error('Farmer group not found');
    }

    // Check if farmer group is being used in submissions
    if (existing.submissions.length > 0) {
      throw new Error('Cannot delete farmer group that is being used in submissions');
    }

    await prisma.farmerGroup.delete({
      where: { id }
    });

    return { message: 'Farmer group deleted successfully' };
  }

  // ================================================
  // COMMODITIES
  // ================================================

  async getCommodities(params: CommodityParams) {
    const {
      category,
      status = 'ACTIVE',
      search,
      page = 1,
      limit = 50
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.commodity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          },
          updater: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.commodity.count({ where })
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getCommodity(id: string) {
    const commodity = await prisma.commodity.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        updater: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!commodity) {
      throw new Error('Commodity not found');
    }

    return commodity;
  }

  async createCommodity(data: any, createdBy: string) {
    // Check if commodity with same name already exists
    const existing = await prisma.commodity.findUnique({
      where: { name: data.name }
    });

    if (existing) {
      throw new Error('Commodity with this name already exists');
    }

    const commodity = await prisma.commodity.create({
      data: {
        ...data,
        createdBy,
        commonPestTypes: data.commonPestTypes || []
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return commodity;
  }

  async updateCommodity(id: string, data: any, updatedBy: string) {
    const existing = await prisma.commodity.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Commodity not found');
    }

    // Check if name is being changed and if new name already exists
    if (data.name && data.name !== existing.name) {
      const nameExists = await prisma.commodity.findUnique({
        where: { name: data.name }
      });

      if (nameExists) {
        throw new Error('Commodity with this name already exists');
      }
    }

    const commodity = await prisma.commodity.update({
      where: { id },
      data: {
        ...data,
        updatedBy
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        updater: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return commodity;
  }

  async deleteCommodity(id: string) {
    const existing = await prisma.commodity.findUnique({
      where: { id },
      include: { submissions: true }
    });

    if (!existing) {
      throw new Error('Commodity not found');
    }

    // Check if commodity is being used in submissions
    if (existing.submissions.length > 0) {
      throw new Error('Cannot delete commodity that is being used in submissions');
    }

    await prisma.commodity.delete({
      where: { id }
    });

    return { message: 'Commodity deleted successfully' };
  }

  // ================================================
  // PEST TYPES
  // ================================================

  async getPestTypes(params: PestTypeParams) {
    const {
      category,
      severity,
      status = 'ACTIVE',
      search,
      page = 1,
      limit = 50
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.pestType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          },
          updater: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.pestType.count({ where })
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getPestType(id: string) {
    const pestType = await prisma.pestType.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        updater: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!pestType) {
      throw new Error('Pest type not found');
    }

    return pestType;
  }

  async createPestType(data: any, createdBy: string) {
    // Check if pest type with same name already exists
    const existing = await prisma.pestType.findUnique({
      where: { name: data.name }
    });

    if (existing) {
      throw new Error('Pest type with this name already exists');
    }

    const pestType = await prisma.pestType.create({
      data: {
        ...data,
        createdBy,
        affectedCommodities: data.affectedCommodities || []
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return pestType;
  }

  async updatePestType(id: string, data: any, updatedBy: string) {
    const existing = await prisma.pestType.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Pest type not found');
    }

    // Check if name is being changed and if new name already exists
    if (data.name && data.name !== existing.name) {
      const nameExists = await prisma.pestType.findUnique({
        where: { name: data.name }
      });

      if (nameExists) {
        throw new Error('Pest type with this name already exists');
      }
    }

    const pestType = await prisma.pestType.update({
      where: { id },
      data: {
        ...data,
        updatedBy
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        updater: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return pestType;
  }

  async deletePestType(id: string) {
    const existing = await prisma.pestType.findUnique({
      where: { id },
      include: { submissions: true }
    });

    if (!existing) {
      throw new Error('Pest type not found');
    }

    // Check if pest type is being used in submissions
    if (existing.submissions.length > 0) {
      throw new Error('Cannot delete pest type that is being used in submissions');
    }

    await prisma.pestType.delete({
      where: { id }
    });

    return { message: 'Pest type deleted successfully' };
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  async getCommodityCategories() {
    const categories = await prisma.commodity.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { status: 'ACTIVE' },
      orderBy: { category: 'asc' }
    });

    return categories.map(c => c.category);
  }

  async getPestTypeCategories() {
    const categories = await prisma.pestType.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { status: 'ACTIVE' },
      orderBy: { category: 'asc' }
    });

    return categories.map(c => c.category);
  }

  async getDistricts() {
    const districts = await prisma.district.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      select: { name: true }
    });

    return districts.map(d => d.name);
  }

  async getVillages(district?: string) {
    const where: any = { status: 'ACTIVE' };
    if (district) {
      where.district = district;
    }

    const villages = await prisma.village.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { name: true }
    });

    return villages.map(v => v.name);
  }
}

// # END OF Master Data Service
