import { PrismaClient } from '@prisma/client';
import {
  ApprovalQueue,
  ApprovalStatistics,
  CreateApprovalRequest,
  GetApprovalQueueRequest
} from './approvals.types';

// ============================================================================
// APPROVAL WORKFLOW REPOSITORY - DATA ACCESS LAYER
// ============================================================================

export class ApprovalsRepository {
  constructor(private prisma: PrismaClient) {}

  // ==================== APPROVAL QUEUE OPERATIONS ====================

  async getApprovalQueue(params: GetApprovalQueueRequest) {
    const {
      status,
      priority,
      district,
      assignedTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    } else {
      // Default to pending/under_review for approval queue
      where.status = { in: ['PENDING', 'UNDER_REVIEW'] };
    }
    
    if (priority) where.priority = priority;
    if (district) where.district = { contains: district, mode: 'insensitive' };
    if (assignedTo) where.reviewerId = assignedTo;

    // Get submissions with their items
    const [submissions, totalCount] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        include: {
          submitter: {
            select: { id: true, name: true, email: true }
          },
          reviewer: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  pestTypes: true,
                  pricePerUnit: true
                }
              }
            }
          }
        }
      }),
      this.prisma.submission.count({ where })
    ]);

    // Transform to ApprovalQueue format
    const approvalQueue: ApprovalQueue[] = submissions.map((submission: any) => {
      const requestedItems = submission.items.map((item: any) => {
        // Convert Decimal to number for calculations
        const requestedQuantity = Number(item.requestedQuantity);
        const unitPrice = Number(item.medicine.pricePerUnit || 0);
        const estimatedPrice = requestedQuantity * unitPrice;

        return {
          id: item.id,
          medicineName: item.medicine.name,
          requestedQuantity,
          unit: item.unit,
          estimatedPrice,
          availability: 'available' as const, // TODO: Calculate from stock
          targetPests: (item.medicine.pestTypes as string[]) || []
        };
      });

      const totalEstimatedValue = requestedItems.reduce(
        (sum: number, item: any) => sum + item.estimatedPrice, 0
      );

      const daysWaiting = Math.floor(
        (Date.now() - submission.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: submission.id,
        submissionId: submission.id,
        submissionNumber: submission.submissionNumber,
        submissionDetails: {
          id: submission.id,
          submissionNumber: submission.submissionNumber,
          district: submission.district,
          village: submission.village,
          farmerGroup: submission.farmerGroup,
          groupLeader: submission.groupLeader,
          commodity: submission.commodity,
          totalArea: Number(submission.totalArea),
          affectedArea: Number(submission.affectedArea),
          pestTypes: submission.pestTypes as string[],
          submitterName: submission.submitter.name,
          submittedAt: submission.createdAt,
          requestedItems,
          totalEstimatedValue
        },
        priority: submission.priority as any,
        assignedTo: submission.reviewerId || undefined,
        assignedToName: submission.reviewer?.name || undefined,
        status: submission.status as any,
        daysWaiting,
        estimatedValue: totalEstimatedValue,
        riskLevel: this.calculateRiskLevel(submission, daysWaiting),
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        deadline: submission.reviewedAt || undefined
      };
    });

    return {
      approvals: approvalQueue,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  }

  async getSubmissionForApproval(submissionId: string) {
    return await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        submitter: {
          select: { id: true, name: true, email: true, role: true }
        },
        reviewer: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            medicine: {
              include: {
                stocks: {
                  where: {
                    currentStock: { gt: 0 },
                    expiryDate: { gte: new Date() }
                  },
                  orderBy: { expiryDate: 'asc' }
                }
              }
            }
          }
        }
      }
    });
  }

  // ==================== APPROVAL ACTIONS ====================

  async createApproval(approvalData: CreateApprovalRequest, approverId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Get current submission
      const submission = await tx.submission.findUnique({
        where: { id: approvalData.submissionId },
        include: { items: true }
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      if (submission.status !== 'PENDING' && submission.status !== 'UNDER_REVIEW') {
        throw new Error('Submission cannot be modified in current status');
      }

      // Update submission status
      let newStatus: string;
      switch (approvalData.action) {
        case 'approve':
          newStatus = 'APPROVED';
          break;
        case 'partial_approve':
          newStatus = 'PARTIALLY_APPROVED';
          break;
        case 'reject':
          newStatus = 'REJECTED';
          break;
        case 'request_revision':
          newStatus = 'PENDING';
          break;
        default:
          throw new Error('Invalid approval action');
      }

      // Update submission
      const updatedSubmission = await tx.submission.update({
        where: { id: approvalData.submissionId },
        data: {
          status: newStatus as any,
          reviewerId: approverId,
          reviewedAt: new Date(),
          reviewerNotes: approvalData.notes,
          priority: submission.priority
        }
      });

      // Update submission items if approved quantities provided
      if (approvalData.approvedItems && approvalData.approvedItems.length > 0) {
        for (const item of approvalData.approvedItems) {
          await tx.submissionItem.update({
            where: { id: item.submissionItemId },
            data: {
              approvedQuantity: item.approvedQuantity,
              notes: item.notes
            }
          });
        }
      }

      // Create approval history record
      await tx.activityLog.create({
        data: {
          userId: approverId,
          action: approvalData.action,
          resourceType: 'submission_approval',
          resourceId: approvalData.submissionId,
          details: {
            previousStatus: submission.status,
            newStatus,
            notes: approvalData.notes,
            approvedItems: approvalData.approvedItems,
            rejectionReason: approvalData.rejectionReason,
            requestedRevisions: approvalData.requestedRevisions
          }
        }
      });

      return {
        approvalId: updatedSubmission.id,
        submissionId: approvalData.submissionId,
        newStatus,
        processedItems: approvalData.approvedItems?.length || 0
      };
    });
  }

  async assignApproval(submissionId: string, assignedTo: string) {
    return await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        reviewerId: assignedTo,
        status: 'UNDER_REVIEW',
        updatedAt: new Date()
      }
    });
  }

  async updateApprovalPriority(submissionId: string, priority: string, updatedBy: string, reason?: string) {
    return await this.prisma.$transaction(async (tx) => {
      const updated = await tx.submission.update({
        where: { id: submissionId },
        data: {
          priority: priority as any,
          updatedAt: new Date()
        }
      });

      // Log priority change
      await tx.activityLog.create({
        data: {
          userId: updatedBy,
          action: 'update_priority',
          resourceType: 'submission',
          resourceId: submissionId,
          details: {
            newPriority: priority,
            reason: reason || 'Priority updated'
          }
        }
      });

      return updated;
    });
  }

  // ==================== APPROVAL HISTORY ====================

  async getApprovalHistory(submissionId?: string, approverId?: string, limit: number = 50) {
    const where: any = {
      resourceType: 'submission_approval'
    };

    if (submissionId) where.resourceId = submissionId;
    if (approverId) where.userId = approverId;

    const history = await this.prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return history.map((log: any) => ({
      id: log.id,
      submissionId: log.resourceId!,
      approverId: log.userId,
      approverName: log.user.name,
      action: log.action as any,
      previousStatus: (log.details as any)?.previousStatus,
      newStatus: (log.details as any)?.newStatus,
      notes: (log.details as any)?.notes || '',
      approvedItems: (log.details as any)?.approvedItems,
      rejectionReason: (log.details as any)?.rejectionReason,
      requestedRevisions: (log.details as any)?.requestedRevisions,
      createdAt: log.createdAt,
      metadata: {
        ipAddress: log.ipAddress,
        userAgent: log.userAgent
      }
    }));
  }

  // ==================== STATISTICS ====================

  async getApprovalStatistics(startDate?: Date, endDate?: Date, district?: string): Promise<ApprovalStatistics> {
    const where: any = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }
    
    if (district) {
      where.district = { contains: district, mode: 'insensitive' };
    }

    const [
      statusCounts,
      districtStats,
      medicineStats
    ] = await Promise.all([
      // Status distribution
      this.prisma.submission.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      
      // District statistics
      this.prisma.submission.groupBy({
        by: ['district'],
        where,
        _count: { district: true },
        _sum: { totalArea: true },
        orderBy: { _count: { district: 'desc' } },
        take: 10
      }),
      
      // Medicine usage statistics with medicine details
      this.prisma.submissionItem.findMany({
        where: {
          submission: where
        },
        include: {
          medicine: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    ]);

    // Process status counts
    const pending = statusCounts.find((s: any) => s.status === 'PENDING')?._count.status || 0;
    const approved = statusCounts.find((s: any) => s.status === 'APPROVED')?._count.status || 0;
    const rejected = statusCounts.find((s: any) => s.status === 'REJECTED')?._count.status || 0;

    return {
      totalPending: pending,
      totalApproved: approved,
      totalRejected: rejected,
      averageProcessingTime: 24, // Placeholder - implement proper calculation
      totalValue: {
        pending: 0, // Calculate from submission items
        approved: 0,
        rejected: 0
      },
      riskDistribution: {
        low: 0,
        medium: 0,
        high: 0
      },
      topDistricts: districtStats.map((stat: any) => ({
        district: stat.district,
        count: stat._count.district,
        totalValue: 0 // Calculate from submission items
      })),
      medicineUsageStats: (() => {
        // Group medicine stats by medicineId
        const medicineMap = new Map();
        
        medicineStats.forEach((item: any) => {
          const medicineId = item.medicineId;
          const medicineName = item.medicine.name;
          
          if (!medicineMap.has(medicineId)) {
            medicineMap.set(medicineId, {
              medicineId,
              medicineName,
              timesRequested: 0,
              timesApproved: 0,
              totalQuantityApproved: 0,
              totalQuantityRequested: 0
            });
          }
          
          const stat = medicineMap.get(medicineId);
          stat.timesRequested += 1;
          stat.totalQuantityRequested += Number(item.requestedQuantity || 0);
          
          if (Number(item.approvedQuantity || 0) > 0) {
            stat.timesApproved += 1;
            stat.totalQuantityApproved += Number(item.approvedQuantity || 0);
          }
        });
        
        return Array.from(medicineMap.values()).map(stat => ({
          medicineId: stat.medicineId,
          medicineName: stat.medicineName,
          timesRequested: stat.timesRequested,
          timesApproved: stat.timesApproved,
          totalQuantityApproved: stat.totalQuantityApproved,
          averageApprovalRate: stat.timesRequested > 0 ? (stat.timesApproved / stat.timesRequested) * 100 : 0
        }));
      })()
    };
  }

  // ==================== HELPER METHODS ====================

  private buildOrderBy(sortBy: string, sortOrder: string) {
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    
    switch (sortBy) {
      case 'priority':
        return [
          { priority: order as any },
          { createdAt: 'desc' as any }
        ] as any;
      case 'estimatedValue':
        // This would need a calculated field or subquery
        return { createdAt: order as any };
      case 'daysWaiting':
        return { createdAt: (order === 'asc' ? 'desc' : 'asc') as any };
      default:
        return { createdAt: order as any };
    }
  }

  private calculateRiskLevel(submission: any, daysWaiting: number): 'low' | 'medium' | 'high' {
    // Risk calculation logic
    let riskScore = 0;
    
    // Time-based risk
    if (daysWaiting > 7) riskScore += 2;
    if (daysWaiting > 14) riskScore += 3;
    
    // Priority-based risk
    switch (submission.priority) {
      case 'URGENT': riskScore += 3; break;
      case 'HIGH': riskScore += 2; break;
      case 'MEDIUM': riskScore += 1; break;
    }
    
    // Area-based risk (larger affected areas = higher risk)
    const affectedArea = Number(submission.affectedArea);
    if (affectedArea > 100) riskScore += 2;
    if (affectedArea > 500) riskScore += 3;
    
    if (riskScore >= 6) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  // ==================== BULK OPERATIONS ====================

  async bulkApproval(submissionIds: string[], action: 'approve' | 'reject', approverId: string, notes?: string, rejectionReason?: string) {
    return await this.prisma.$transaction(async (tx) => {
      const results = [];
      
      for (const submissionId of submissionIds) {
        try {
          const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
          
          await tx.submission.update({
            where: { 
              id: submissionId,
              status: { in: ['PENDING', 'UNDER_REVIEW'] }
            },
            data: {
              status: newStatus,
              reviewerId: approverId,
              reviewedAt: new Date(),
              reviewerNotes: action === 'reject' ? rejectionReason : notes
            }
          });

          // Log the action
          await tx.activityLog.create({
            data: {
              userId: approverId,
              action: `bulk_${action}`,
              resourceType: 'submission_approval',
              resourceId: submissionId,
              details: {
                bulkOperation: true,
                newStatus,
                notes: notes || rejectionReason
              }
            }
          });

          results.push({
            submissionId,
            success: true,
            newStatus
          });
        } catch (error) {
          results.push({
            submissionId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      return results;
    });
  }
}
