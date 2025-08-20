/**
 * Transaction Repository
 * Handles all database operations for transactions with optimized queries
 * Adapted to work with existing Prisma schema
 */

import { PrismaClient, TransactionType } from '@prisma/client';
import {
  TransactionQuery,
  TransactionSummary,
  CreateTransactionData,
  CreateTransactionItemData,
  UpdateTransactionData,
  ProcessTransactionData,
  CompleteTransactionData
} from './transactions.types';

export class TransactionRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find all transactions with filtering, sorting, and pagination
   */
  async findAll(query: TransactionQuery) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      type,
      status,
      processedBy,
      verifiedBy,
      dateFrom,
      dateTo,
      submissionId
    } = query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { transactionNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (processedBy) where.processedBy = processedBy;
    if (verifiedBy) where.verifiedBy = verifiedBy;
    if (submissionId) where.submissionId = submissionId;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    // Execute query
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          items: {
            include: {
              medicineStock: {
                include: {
                  medicine: true
                }
              }
            }
          },
          submission: true,
          processor: {
            select: { id: true, name: true, email: true, role: true }
          },
          verifier: {
            select: { id: true, name: true, email: true, role: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit
      }),
      this.prisma.transaction.count({ where })
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    };
  }

  /**
   * Find transaction by ID with all relations
   */
  async findById(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            medicineStock: {
              include: {
                medicine: true
              }
            }
          }
        },
        submission: {
          include: {
            submitter: {
              select: { id: true, name: true, role: true }
            }
          }
        },
        processor: {
          select: { id: true, name: true, email: true, role: true }
        },
        verifier: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  /**
   * Find transaction by transaction number
   */
  async findByTransactionNumber(transactionNumber: string) {
    return this.prisma.transaction.findUnique({
      where: { transactionNumber },
      include: {
        items: {
          include: {
            medicineStock: {
              include: {
                medicine: true
              }
            }
          }
        },
        processor: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  /**
   * Create new transaction with items
   */
  async create(data: CreateTransactionData, processedBy: string) {
    const transactionNumber = await this.generateTransactionNumber();

    // Map our transaction types to Prisma schema types
    const transactionType = this.mapTransactionType(data.type);

    return this.prisma.transaction.create({
      data: {
        transactionNumber,
        type: transactionType,
        status: 'PENDING',
        submissionId: data.submissionId,
        description: data.notes,
        processedBy,
        processedAt: new Date(),
        totalItems: data.items.length,
        items: {
          create: data.items.map((item: CreateTransactionItemData) => ({
            medicineStockId: item.medicineId, // Using medicineId as medicineStockId for now
            quantity: item.requestedQuantity,
            notes: item.notes
          }))
        }
      },
      include: {
        items: {
          include: {
            medicineStock: {
              include: {
                medicine: true
              }
            }
          }
        },
        processor: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  /**
   * Update transaction
   */
  async update(id: string, data: UpdateTransactionData) {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        description: data.notes,
        updatedAt: new Date()
      },
      include: {
        items: {
          include: {
            medicineStock: {
              include: {
                medicine: true
              }
            }
          }
        },
        processor: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  /**
   * Approve transaction (mark as completed for now)
   */
  async approve(
    id: string,
    verifiedBy: string,
    notes?: string
  ) {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        verifiedBy,
        verifiedAt: new Date(),
        notes: notes ? `Approved: ${notes}` : 'Approved'
      }
    });
  }

  /**
   * Reject transaction (mark as cancelled)
   */
  async reject(id: string, verifiedBy: string, reason: string) {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        verifiedBy,
        verifiedAt: new Date(),
        notes: `Rejected: ${reason}`
      }
    });
  }

  /**
   * Process transaction
   */
  async process(id: string, data: ProcessTransactionData, processedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      // Update transaction status
      const transaction = await tx.transaction.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          processedBy,
          processedAt: new Date(),
          notes: data.notes ? `Processing: ${data.notes}` : 'Processing started'
        }
      });

      // Update stock quantities (simplified implementation)
      for (const item of data.items) {
        // Find the transaction item
        const transactionItem = await tx.transactionItem.findUnique({
          where: { id: item.transactionItemId },
          include: {
            medicineStock: true
          }
        });

        if (transactionItem) {
          // Update medicine stock
          await tx.medicineStock.update({
            where: { id: transactionItem.medicineStockId },
            data: {
              currentStock: {
                decrement: item.processedQuantity
              },
              updatedAt: new Date()
            }
          });

          // Update transaction item with processed quantity
          await tx.transactionItem.update({
            where: { id: item.transactionItemId },
            data: {
              quantity: item.processedQuantity,
              notes: item.notes
            }
          });
        }
      }

      // Log activity
      await this.logActivity(tx, id, 'PROCESSED', 'Transaction processing started', processedBy);

      return transaction;
    });
  }

  /**
   * Complete transaction
   */
  async complete(id: string, data: CompleteTransactionData, completedBy: string) {
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        verifiedBy: completedBy,
        verifiedAt: new Date(),
        notes: data.completionNotes ? `Completed: ${data.completionNotes}` : 'Transaction completed'
      }
    });

    await this.logActivity(null, id, 'COMPLETED', 'Transaction completed successfully', completedBy);

    return transaction;
  }

  /**
   * Cancel transaction
   */
  async cancel(id: string, cancelledBy: string, reason: string) {
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        verifiedBy: cancelledBy,
        verifiedAt: new Date(),
        notes: `Cancelled: ${reason}`
      }
    });

    await this.logActivity(null, id, 'CANCELLED', `Transaction cancelled: ${reason}`, cancelledBy);

    return transaction;
  }

  /**
   * Delete transaction (soft delete)
   */
  async delete(id: string): Promise<void> {
    await this.prisma.transaction.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });
  }

  /**
   * Get transaction summary/statistics
   */
  async getSummary(filters?: Partial<TransactionQuery>): Promise<TransactionSummary> {
    const where: any = {};

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    if (filters?.processedBy) where.processedBy = filters.processedBy;

    const [
      totalTransactions,
      pendingCount,
      completedCount,
      valueAgg,
      typeStats,
      statusStats
    ] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.transaction.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.transaction.aggregate({
        where,
        _sum: { totalValue: true },
        _avg: { totalValue: true }
      }),
      this.getStatsByField('type', where),
      this.getStatsByField('status', where)
    ]);

    return {
      totalTransactions,
      pendingTransactions: pendingCount,
      inProgressTransactions: 0, // Not used in current schema
      completedTransactions: completedCount,
      totalValue: Number(valueAgg._sum.totalValue) || 0,
      averageProcessingTime: await this.calculateAverageProcessingTime(where),
      byType: typeStats,
      bySource: {}, // Not available in current schema
      byStatus: statusStats
    };
  }

  /**
   * Find transactions by user (for dashboard)
   */
  async findByUser(userId: string, query?: Partial<TransactionQuery>) {
    return this.findAll({
      ...query,
      processedBy: userId
    });
  }

  /**
   * Find pending approvals for dinas users
   */
  async findPendingApprovals(query?: Partial<TransactionQuery>) {
    return this.findAll({
      ...query,
      status: 'PENDING' as any
    });
  }

  // Private helper methods

  private async generateTransactionNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `TRX-${year}-${month}-${day}`;

    // Get count of transactions created today
    const count = await this.prisma.transaction.count({
      where: {
        transactionNumber: {
          startsWith: datePrefix
        }
      }
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `${datePrefix}-${sequence}`;
  }

  private mapTransactionType(type: string): TransactionType {
    // Map our transaction types to Prisma schema types
    switch (type) {
      case 'submission_based':
      case 'direct_request':
      case 'emergency':
        return 'OUT';
      case 'stock_transfer':
        return 'ADJUSTMENT';
      default:
        return 'OUT';
    }
  }

  private async logActivity(
    tx: any,
    transactionId: string,
    action: string,
    description: string,
    performedBy: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const prismaClient = tx || this.prisma;
    
    await prismaClient.activityLog.create({
      data: {
        userId: performedBy,
        action,
        resourceType: 'transaction',
        resourceId: transactionId,
        details: {
          description,
          ...metadata
        }
      }
    });
  }

  private async getStatsByField(field: string, where: any): Promise<Record<string, number>> {
    const results = await this.prisma.transaction.groupBy({
      by: [field as any],
      where,
      _count: true
    });

    const stats: Record<string, number> = {};
    results.forEach((result: any) => {
      stats[result[field]] = result._count;
    });

    return stats;
  }

  private async calculateAverageProcessingTime(where: any): Promise<number> {
    const completedTransactions = await this.prisma.transaction.findMany({
      where: {
        ...where,
        status: 'COMPLETED',
        processedAt: { not: null },
        verifiedAt: { not: null }
      },
      select: {
        processedAt: true,
        verifiedAt: true
      }
    });

    if (completedTransactions.length === 0) return 0;

    const totalTime = completedTransactions.reduce((sum, transaction) => {
      const start = new Date(transaction.processedAt).getTime();
      const end = new Date(transaction.verifiedAt!).getTime();
      return sum + (end - start);
    }, 0);

    // Return average time in hours
    return totalTime / completedTransactions.length / (1000 * 60 * 60);
  }
}
