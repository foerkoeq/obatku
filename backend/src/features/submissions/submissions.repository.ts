// ================================================
// SUBMISSION REPOSITORY
// ================================================

import { PrismaClient, SubmissionStatus, UserRole } from '@prisma/client';
import { 
  SubmissionResponse, 
  SubmissionFilters, 
  SubmissionListQuery,
  CreateSubmissionData,
  UpdateSubmissionData,
  SubmissionStats,
  UserSubmissionStats,
  SubmissionStatusUpdate,
  SubmissionType
} from './submissions.types';

export class SubmissionRepository {
  constructor(private prisma: PrismaClient) {}

  // ================================================
  // CREATE OPERATIONS
  // ================================================

  async create(data: CreateSubmissionData): Promise<SubmissionResponse> {
    const submissionNumber = await this.generateSubmissionNumber();
    
    const submission = await this.prisma.submission.create({
      data: {
        submissionNumber,
        district: data.district,
        village: data.village,
        farmerGroup: data.farmerGroup,
        groupLeader: data.groupLeader,
        commodity: data.commodity,
        totalArea: data.totalArea,
        affectedArea: data.affectedArea,
        pestTypes: data.pestTypes,
        letterNumber: data.letterNumber,
        letterDate: data.letterDate,
        letterFileUrl: data.letterFileUrl,
        status: SubmissionStatus.PENDING,
        priority: data.priority,
        submitterId: data.submitterId,
        items: {
          create: data.items.map(item => ({
            medicineId: item.medicineId,
            requestedQuantity: item.requestedQuantity,
            unit: item.unit,
            notes: item.notes
          }))
        }
      },
      include: this.getSubmissionIncludes()
    });

    return this.transformToResponse(submission);
  }

  async createSubmissionItem(submissionId: string, itemData: {
    medicineId: string;
    requestedQuantity: number;
    unit: string;
    notes?: string;
  }) {
    return await this.prisma.submissionItem.create({
      data: {
        submissionId,
        medicineId: itemData.medicineId,
        requestedQuantity: itemData.requestedQuantity,
        unit: itemData.unit,
        notes: itemData.notes
      },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            producer: true,
            category: true,
            unit: true
          }
        }
      }
    });
  }

  // ================================================
  // READ OPERATIONS
  // ================================================

  async findById(id: string): Promise<SubmissionResponse | null> {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: this.getSubmissionIncludes()
    });

    return submission ? this.transformToResponse(submission) : null;
  }

  async findBySubmissionNumber(submissionNumber: string): Promise<SubmissionResponse | null> {
    const submission = await this.prisma.submission.findUnique({
      where: { submissionNumber },
      include: this.getSubmissionIncludes()
    });

    return submission ? this.transformToResponse(submission) : null;
  }

  async findMany(query: SubmissionListQuery) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', filters } = query;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);
    const orderBy = { [sortBy]: sortOrder };

    const [submissions, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        include: this.getSubmissionIncludes(),
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.submission.count({ where })
    ]);

    return {
      data: submissions.map(submission => this.transformToResponse(submission)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  async findByUserId(userId: string, query: SubmissionListQuery) {
    return this.findMany({
      ...query,
      filters: {
        ...query.filters,
        submitterId: [userId]
      }
    });
  }

  async findPendingReview(): Promise<SubmissionResponse[]> {
    const submissions = await this.prisma.submission.findMany({
      where: {
        status: {
          in: [SubmissionStatus.PENDING, SubmissionStatus.UNDER_REVIEW]
        }
      },
      include: this.getSubmissionIncludes(),
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    return submissions.map(submission => this.transformToResponse(submission));
  }

  async findOverdue(days: number = 7): Promise<SubmissionResponse[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const submissions = await this.prisma.submission.findMany({
      where: {
        status: {
          in: [SubmissionStatus.PENDING, SubmissionStatus.UNDER_REVIEW]
        },
        createdAt: {
          lt: cutoffDate
        }
      },
      include: this.getSubmissionIncludes(),
      orderBy: { createdAt: 'asc' }
    });

    return submissions.map(submission => this.transformToResponse(submission));
  }

  // ================================================
  // UPDATE OPERATIONS
  // ================================================

  async update(id: string, data: UpdateSubmissionData): Promise<SubmissionResponse | null> {
    const updateData: any = { ...data };
    
    // Handle items separately if provided
    if (data.items) {
      // Delete existing items and create new ones
      await this.prisma.submissionItem.deleteMany({
        where: { submissionId: id }
      });

      updateData.items = {
        create: data.items.map(item => ({
          medicineId: item.medicineId,
          requestedQuantity: item.requestedQuantity,
          unit: item.unit,
          notes: item.notes
        }))
      };
    }

    const submission = await this.prisma.submission.update({
      where: { id },
      data: updateData,
      include: this.getSubmissionIncludes()
    });

    return this.transformToResponse(submission);
  }

  async updateStatus(id: string, statusUpdate: SubmissionStatusUpdate): Promise<SubmissionResponse | null> {
    const updateData: any = {
      status: statusUpdate.status,
      updatedAt: new Date()
    };

    // Set reviewer info
    if (statusUpdate.reviewerId) {
      updateData.reviewerId = statusUpdate.reviewerId;
      updateData.reviewedAt = new Date();
    }

    // Set distributor info
    if (statusUpdate.distributorId) {
      updateData.distributorId = statusUpdate.distributorId;
      updateData.distributedAt = new Date();
    }

    // Set notes
    if (statusUpdate.notes) {
      if (statusUpdate.status === SubmissionStatus.REJECTED) {
        updateData.reviewerNotes = statusUpdate.notes;
      } else if (statusUpdate.status === SubmissionStatus.COMPLETED) {
        updateData.completionNotes = statusUpdate.notes;
      } else {
        updateData.reviewerNotes = statusUpdate.notes;
      }
    }

    // Handle approved items
    if (statusUpdate.approvedItems && statusUpdate.approvedItems.length > 0) {
      await Promise.all(
        statusUpdate.approvedItems.map(item =>
          this.prisma.submissionItem.update({
            where: { id: item.submissionItemId },
            data: {
              approvedQuantity: item.approvedQuantity,
              notes: item.notes
            }
          })
        )
      );
    }

    const submission = await this.prisma.submission.update({
      where: { id },
      data: updateData,
      include: this.getSubmissionIncludes()
    });

    return this.transformToResponse(submission);
  }

  async updateItemApproval(submissionItemId: string, approvedQuantity: number, notes?: string) {
    return await this.prisma.submissionItem.update({
      where: { id: submissionItemId },
      data: {
        approvedQuantity,
        notes
      }
    });
  }

  async updateItemDistribution(submissionItemId: string, distributedQuantity: number) {
    return await this.prisma.submissionItem.update({
      where: { id: submissionItemId },
      data: {
        distributedQuantity
      }
    });
  }

  // ================================================
  // DELETE OPERATIONS
  // ================================================

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.submission.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteSubmissionItem(submissionItemId: string): Promise<boolean> {
    try {
      await this.prisma.submissionItem.delete({
        where: { id: submissionItemId }
      });
      return true;
    } catch {
      return false;
    }
  }

  // ================================================
  // STATISTICS & ANALYTICS
  // ================================================

  async getSubmissionStats(filters?: SubmissionFilters): Promise<SubmissionStats> {
    const where = this.buildWhereClause(filters);
    
    const [
      total,
      statusCounts,
      typeCounts,
      priorityCounts,
      monthlyCounts,
      pendingReview,
      overdue,
      avgProcessingTime
    ] = await Promise.all([
      this.prisma.submission.count({ where }),
      this.getStatusCounts(where),
      this.getTypeCounts(where),
      this.getPriorityCounts(where),
      this.getMonthlyCounts(where),
      this.prisma.submission.count({
        where: {
          ...where,
          status: { in: [SubmissionStatus.PENDING, SubmissionStatus.UNDER_REVIEW] }
        }
      }),
      this.getOverdueCount(where),
      this.getAverageProcessingTime(where)
    ]);

    return {
      total,
      byStatus: statusCounts,
      byType: typeCounts,
      byPriority: priorityCounts,
      byMonth: monthlyCounts,
      pendingReview,
      overdue,
      averageProcessingTime: avgProcessingTime
    };
  }

  async getUserSubmissionStats(userId: string): Promise<UserSubmissionStats> {
    const where = { submitterId: userId };
    
    const [
      submitted,
      approved,
      rejected,
      pending,
      thisMonth,
      avgApprovalTime
    ] = await Promise.all([
      this.prisma.submission.count({ where }),
      this.prisma.submission.count({
        where: { ...where, status: { in: [SubmissionStatus.APPROVED, SubmissionStatus.PARTIALLY_APPROVED] } }
      }),
      this.prisma.submission.count({
        where: { ...where, status: SubmissionStatus.REJECTED }
      }),
      this.prisma.submission.count({
        where: { ...where, status: { in: [SubmissionStatus.PENDING, SubmissionStatus.UNDER_REVIEW] } }
      }),
      this.prisma.submission.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      this.getUserAverageApprovalTime(userId)
    ]);

    return {
      submitted,
      approved,
      rejected,
      pending,
      thisMonth,
      avgApprovalTime
    };
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  private async generateSubmissionNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Count submissions this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const count = await this.prisma.submission.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `SUB${year}${month}${sequence}`;
  }

  private getSubmissionIncludes() {
    return {
      submitter: {
        select: {
          id: true,
          name: true,
          role: true,
          nip: true
        }
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          role: true
        }
      },
      distributor: {
        select: {
          id: true,
          name: true,
          role: true
        }
      },
      items: {
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              producer: true,
              category: true,
              unit: true
            }
          }
        }
      }
    };
  }

  private buildWhereClause(filters?: SubmissionFilters) {
    if (!filters) return {};

    const where: any = {};

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }

    if (filters.district && filters.district.length > 0) {
      where.district = { in: filters.district };
    }

    if (filters.village && filters.village.length > 0) {
      where.village = { in: filters.village };
    }

    if (filters.submitterId && filters.submitterId.length > 0) {
      where.submitterId = { in: filters.submitterId };
    }

    if (filters.reviewerId && filters.reviewerId.length > 0) {
      where.reviewerId = { in: filters.reviewerId };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    if (filters.search) {
      where.OR = [
        { submissionNumber: { contains: filters.search } },
        { district: { contains: filters.search } },
        { village: { contains: filters.search } },
        { farmerGroup: { contains: filters.search } },
        { groupLeader: { contains: filters.search } }
      ];
    }

    return where;
  }

  private transformToResponse(submission: any): SubmissionResponse {
    // Determine submission type based on data
    let submissionType: SubmissionType;
    if (submission.letterNumber && submission.letterDate) {
      submissionType = SubmissionType.PPL_REGULAR;
    } else if (submission.activityType) {
      submissionType = submission.priority === 'URGENT' || submission.priority === 'HIGH' 
        ? SubmissionType.POPT_EMERGENCY 
        : SubmissionType.POPT_SCHEDULED;
    } else {
      submissionType = SubmissionType.POPT_SCHEDULED; // Default fallback
    }

    return {
      id: submission.id,
      submissionNumber: submission.submissionNumber,
      submissionType,
      district: submission.district,
      village: submission.village,
      farmerGroup: submission.farmerGroup,
      groupLeader: submission.groupLeader,
      commodity: submission.commodity,
      totalArea: submission.totalArea,
      affectedArea: submission.affectedArea,
      pestTypes: submission.pestTypes,
      letterNumber: submission.letterNumber,
      letterDate: submission.letterDate,
      letterFileUrl: submission.letterFileUrl,
      status: submission.status,
      priority: submission.priority,
      submitterId: submission.submitterId,
      submitter: submission.submitter,
      reviewerId: submission.reviewerId,
      reviewer: submission.reviewer,
      reviewedAt: submission.reviewedAt,
      reviewerNotes: submission.reviewerNotes,
      distributorId: submission.distributorId,
      distributor: submission.distributor,
      distributedAt: submission.distributedAt,
      completionNotes: submission.completionNotes,
      items: submission.items.map((item: any) => ({
        id: item.id,
        medicineId: item.medicineId,
        medicine: item.medicine,
        requestedQuantity: item.requestedQuantity,
        approvedQuantity: item.approvedQuantity,
        distributedQuantity: item.distributedQuantity,
        unit: item.unit,
        notes: item.notes,
        createdAt: item.createdAt
      })),
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt
    };
  }

  // Helper methods for statistics
  private async getStatusCounts(where: any): Promise<Record<SubmissionStatus, number>> {
    const counts = await this.prisma.submission.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    });

    const result = {} as Record<SubmissionStatus, number>;
    Object.values(SubmissionStatus).forEach(status => {
      result[status] = 0;
    });

    counts.forEach(count => {
      result[count.status] = count._count.status;
    });

    return result;
  }

  private async getTypeCounts(where: any): Promise<Record<SubmissionType, number>> {
    // This is a simplified approach - you might want to store submission type in the database
    const submissions = await this.prisma.submission.findMany({
      where,
      select: {
        letterNumber: true,
        letterDate: true,
        priority: true
      }
    });

    const counts: Record<SubmissionType, number> = {
      [SubmissionType.PPL_REGULAR]: 0,
      [SubmissionType.POPT_EMERGENCY]: 0,
      [SubmissionType.POPT_SCHEDULED]: 0
    };

    submissions.forEach(submission => {
      if (submission.letterNumber && submission.letterDate) {
        counts[SubmissionType.PPL_REGULAR]++;
      } else if (submission.priority === 'URGENT' || submission.priority === 'HIGH') {
        counts[SubmissionType.POPT_EMERGENCY]++;
      } else {
        counts[SubmissionType.POPT_SCHEDULED]++;
      }
    });

    return counts;
  }

  private async getPriorityCounts(where: any): Promise<Record<string, number>> {
    const counts = await this.prisma.submission.groupBy({
      by: ['priority'],
      where,
      _count: { priority: true }
    });

    const result: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0
    };

    counts.forEach(count => {
      result[count.priority] = count._count.priority;
    });

    return result;
  }

  private async getMonthlyCounts(where: any): Promise<Array<{ month: string; year: number; count: number }>> {
    // Get last 12 months data
    const result = await this.prisma.$queryRaw<Array<{ month: number; year: number; count: bigint }>>`
      SELECT 
        MONTH(created_at) as month,
        YEAR(created_at) as year,
        COUNT(*) as count
      FROM submissions 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY year DESC, month DESC
    `;

    return result.map(row => ({
      month: new Date(row.year, row.month - 1).toLocaleString('default', { month: 'long' }),
      year: row.year,
      count: Number(row.count)
    }));
  }

  private async getOverdueCount(where: any): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    return await this.prisma.submission.count({
      where: {
        ...where,
        status: { in: [SubmissionStatus.PENDING, SubmissionStatus.UNDER_REVIEW] },
        createdAt: { lt: cutoffDate }
      }
    });
  }

  private async getAverageProcessingTime(where: any): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ avg_hours: number }>>`
      SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, reviewed_at)) as avg_hours
      FROM submissions 
      WHERE reviewed_at IS NOT NULL 
      AND status IN ('APPROVED', 'PARTIALLY_APPROVED', 'REJECTED')
    `;

    return result[0]?.avg_hours || 0;
  }

  private async getUserAverageApprovalTime(userId: string): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ avg_hours: number }>>`
      SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, reviewed_at)) as avg_hours
      FROM submissions 
      WHERE submitter_id = ${userId}
      AND reviewed_at IS NOT NULL 
      AND status IN ('APPROVED', 'PARTIALLY_APPROVED')
    `;

    return result[0]?.avg_hours || 0;
  }
}
