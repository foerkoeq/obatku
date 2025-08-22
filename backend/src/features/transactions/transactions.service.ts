// src/features/transactions/transactions.service.ts
import { Transaction, TransactionQuery, CreateTransactionData, UpdateTransactionData, ProcessTransactionData } from './transactions.types';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../core/logger/logger';

export class TransactionService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Get all transactions with filtering, sorting, and pagination
   */
  async getAllTransactions(query: TransactionQuery, context: { userId?: string; userRole?: string }) {
    try {
      const { page = 1, limit = 10, search, status, priority, district, commodity, pestType, dateRange } = query;
      const skip = (page - 1) * limit;

      // Build where clause based on filters
      const where: any = {};
      
      if (search) {
        where.OR = [
          { letterNumber: { contains: search, mode: 'insensitive' } },
          { 'farmerGroup.name': { contains: search, mode: 'insensitive' } },
          { 'farmerGroup.leader': { contains: search, mode: 'insensitive' } },
          { 'bppOfficer.name': { contains: search, mode: 'insensitive' } }
        ];
      }

      if (status && status.length > 0) {
        where.status = { in: status };
      }

      if (priority && priority.length > 0) {
        where.priority = { in: priority };
      }

      if (district && district.length > 0) {
        where['farmerGroup.district'] = { in: district };
      }

      if (commodity && commodity.length > 0) {
        where['farmingDetails.commodity'] = { in: commodity };
      }

      if (pestType && pestType.length > 0) {
        where['farmingDetails.pestType'] = { hasSome: pestType };
      }

      if (dateRange?.startDate || dateRange?.endDate) {
        where.submissionDate = {};
        if (dateRange.startDate) {
          where.submissionDate.gte = new Date(dateRange.startDate);
        }
        if (dateRange.endDate) {
          where.submissionDate.lte = new Date(dateRange.endDate);
        }
      }

      // Role-based filtering
      if (context.userRole === 'ppl') {
        where['bppOfficer.id'] = context.userId;
      } else if (context.userRole === 'dinas') {
        // Dinas can see all transactions in their jurisdiction
        // Additional filtering can be added here
      }

      const [transactions, total] = await Promise.all([
        this.prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { submissionDate: 'desc' },
          include: {
            farmerGroup: true,
            bppOfficer: true,
            farmingDetails: true,
            submission: true,
            approval: true,
            distribution: true
          }
        }),
        this.prisma.transaction.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        transactions,
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      };
    } catch (error) {
      logger.error('Error getting all transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string, context: { userId?: string; userRole?: string }): Promise<Transaction | null> {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id },
        include: {
          farmerGroup: true,
          bppOfficer: true,
          farmingDetails: true,
          submission: true,
          approval: true,
          distribution: true
        }
      });

      if (!transaction) {
        return null;
      }

      // Check access permissions
      if (context.userRole === 'ppl' && transaction.bppOfficer.id !== context.userId) {
        throw new Error('Access denied: You can only view your own transactions');
      }

      return transaction;
    } catch (error) {
      logger.error('Error getting transaction by ID:', error);
      throw error;
    }
  }

  /**
   * Get transaction by transaction number
   */
  async getTransactionByNumber(transactionNumber: string, context: { userId?: string; userRole?: string }): Promise<Transaction | null> {
    try {
      const transaction = await this.prisma.transaction.findFirst({
        where: { letterNumber: transactionNumber },
        include: {
          farmerGroup: true,
          bppOfficer: true,
          farmingDetails: true,
          submission: true,
          approval: true,
          distribution: true
        }
      });

      if (!transaction) {
        return null;
      }

      // Check access permissions
      if (context.userRole === 'ppl' && transaction.bppOfficer.id !== context.userId) {
        throw new Error('Access denied: You can only view your own transactions');
      }

      return transaction;
    } catch (error) {
      logger.error('Error getting transaction by number:', error);
      throw error;
    }
  }

  /**
   * Create new transaction (PPL submission)
   */
  async createTransaction(data: CreateTransactionData, userId: string): Promise<Transaction> {
    try {
      // Validate PPL permissions
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, district: true }
      });

      if (user?.role !== 'ppl') {
        throw new Error('Only PPL users can create transactions');
      }

      // Create transaction with initial status
      const transaction = await this.prisma.transaction.create({
        data: {
          ...data,
          status: 'submitted',
          createdBy: userId,
          bppOfficer: {
            connect: { id: userId }
          }
        },
        include: {
          farmerGroup: true,
          bppOfficer: true,
          farmingDetails: true,
          submission: true
        }
      });

      logger.info(`Transaction created: ${transaction.id} by user: ${userId}`);
      return transaction;
    } catch (error) {
      logger.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Update transaction
   */
  async updateTransaction(id: string, data: UpdateTransactionData, context: { userId?: string; userRole?: string }): Promise<Transaction> {
    try {
      // Check if transaction can be updated
      const existingTransaction = await this.prisma.transaction.findUnique({
        where: { id },
        select: { status: true, bppOfficer: { select: { id: true } } }
      });

      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }

      // Only allow updates for draft or needs_revision status
      if (!['draft', 'needs_revision'].includes(existingTransaction.status)) {
        throw new Error('Transaction cannot be updated in current status');
      }

      // PPL can only update their own transactions
      if (context.userRole === 'ppl' && existingTransaction.bppOfficer.id !== context.userId) {
        throw new Error('Access denied: You can only update your own transactions');
      }

      const transaction = await this.prisma.transaction.update({
        where: { id },
        data: {
          ...data,
          updatedBy: context.userId,
          updatedAt: new Date()
        },
        include: {
          farmerGroup: true,
          bppOfficer: true,
          farmingDetails: true,
          submission: true,
          approval: true,
          distribution: true
        }
      });

      logger.info(`Transaction updated: ${id} by user: ${context.userId}`);
      return transaction;
    } catch (error) {
      logger.error('Error updating transaction:', error);
      throw error;
    }
  }

  /**
   * Process transaction (Warehouse distribution)
   */
  async processTransaction(id: string, data: ProcessTransactionData, userId: string): Promise<Transaction> {
    try {
      // Check if transaction can be processed
      const existingTransaction = await this.prisma.transaction.findUnique({
        where: { id },
        select: { status: true, approval: true }
      });

      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }

      if (existingTransaction.status !== 'approved' && existingTransaction.status !== 'partially_approved') {
        throw new Error('Transaction must be approved before processing');
      }

      // Update transaction status and add distribution data
      const transaction = await this.prisma.transaction.update({
        where: { id },
        data: {
          status: 'distributing',
          distribution: {
            create: {
              distributedBy: userId,
              distributedDate: new Date(),
              actualDrugs: data.actualDrugs,
              receivedBy: data.receivedBy,
              notes: data.notes,
              status: 'in_progress'
            }
          },
          updatedBy: userId,
          updatedAt: new Date()
        },
        include: {
          farmerGroup: true,
          bppOfficer: true,
          farmingDetails: true,
          submission: true,
          approval: true,
          distribution: true
        }
      });

      logger.info(`Transaction processing started: ${id} by user: ${userId}`);
      return transaction;
    } catch (error) {
      logger.error('Error processing transaction:', error);
      throw error;
    }
  }

  /**
   * Verify/Approve transaction (Dinas approval)
   */
  async verifyTransaction(id: string, data: any, userId: string): Promise<Transaction> {
    try {
      // Check if user can approve
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!['admin', 'dinas'].includes(user?.role || '')) {
        throw new Error('Only admin or dinas users can approve transactions');
      }

      // Check transaction status
      const existingTransaction = await this.prisma.transaction.findUnique({
        where: { id },
        select: { status: true }
      });

      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }

      if (!['submitted', 'under_review', 'needs_revision'].includes(existingTransaction.status)) {
        throw new Error('Transaction cannot be approved in current status');
      }

      // Update transaction with approval data
      const transaction = await this.prisma.transaction.update({
        where: { id },
        data: {
          status: data.status === 'approved' ? 'approved' : 'partially_approved',
          approval: {
            create: {
              approvedBy: userId,
              approvedDate: new Date(),
              approvedDrugs: data.approvedDrugs,
              noteToSubmitter: data.noteToSubmitter,
              noteToWarehouse: data.noteToWarehouse,
              status: data.status,
              pickupSchedule: data.pickupSchedule ? new Date(data.pickupSchedule) : undefined
            }
          },
          updatedBy: userId,
          updatedAt: new Date()
        },
        include: {
          farmerGroup: true,
          bppOfficer: true,
          farmingDetails: true,
          submission: true,
          approval: true,
          distribution: true
        }
      });

      logger.info(`Transaction approved: ${id} by user: ${userId} with status: ${data.status}`);
      return transaction;
    } catch (error) {
      logger.error('Error verifying transaction:', error);
      throw error;
    }
  }

  /**
   * Cancel/Reject transaction
   */
  async cancelTransaction(id: string, reason: string, context: { userId?: string; userRole?: string }): Promise<Transaction> {
    try {
      // Check if user can cancel
      if (!['admin', 'dinas'].includes(context.userRole || '')) {
        throw new Error('Only admin or dinas users can cancel transactions');
      }

      // Check transaction status
      const existingTransaction = await this.prisma.transaction.findUnique({
        where: { id },
        select: { status: true }
      });

      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }

      if (['completed', 'cancelled'].includes(existingTransaction.status)) {
        throw new Error('Transaction cannot be cancelled in current status');
      }

      const transaction = await this.prisma.transaction.update({
        where: { id },
        data: {
          status: 'cancelled',
          updatedBy: context.userId,
          updatedAt: new Date()
        },
        include: {
          farmerGroup: true,
          bppOfficer: true,
          farmingDetails: true,
          submission: true,
          approval: true,
          distribution: true
        }
      });

      logger.info(`Transaction cancelled: ${id} by user: ${context.userId} with reason: ${reason}`);
      return transaction;
    } catch (error) {
      logger.error('Error cancelling transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction summary for dashboard
   */
  async getTransactionSummary(params: any) {
    try {
      const { district, dateRange, userRole } = params;
      
      const where: any = {};
      
      if (district) {
        where['farmerGroup.district'] = district;
      }
      
      if (dateRange?.startDate || dateRange?.endDate) {
        where.submissionDate = {};
        if (dateRange.startDate) {
          where.submissionDate.gte = new Date(dateRange.startDate);
        }
        if (dateRange.endDate) {
          where.submissionDate.lte = new Date(dateRange.endDate);
        }
      }

      const [
        totalTransactions,
        pendingApprovals,
        approvedTransactions,
        completedTransactions,
        cancelledTransactions
      ] = await Promise.all([
        this.prisma.transaction.count({ where }),
        this.prisma.transaction.count({ where: { ...where, status: { in: ['submitted', 'under_review'] } } }),
        this.prisma.transaction.count({ where: { ...where, status: { in: ['approved', 'partially_approved'] } } }),
        this.prisma.transaction.count({ where: { ...where, status: 'completed' } }),
        this.prisma.transaction.count({ where: { ...where, status: 'cancelled' } })
      ]);

      return {
        totalTransactions,
        pendingApprovals,
        approvedTransactions,
        completedTransactions,
        cancelledTransactions,
        approvalRate: totalTransactions > 0 ? ((approvedTransactions + completedTransactions) / totalTransactions * 100).toFixed(2) : '0',
        completionRate: totalTransactions > 0 ? (completedTransactions / totalTransactions * 100).toFixed(2) : '0'
      };
    } catch (error) {
      logger.error('Error getting transaction summary:', error);
      throw new Error('Failed to retrieve transaction summary');
    }
  }

  /**
   * Bulk process transactions
   */
  async bulkProcessTransactions(data: any, userId: string) {
    try {
      const { transactionIds, action, ...actionData } = data;
      const results = { successful: [], failed: [] };

      for (const transactionId of transactionIds) {
        try {
          switch (action) {
            case 'approve':
              await this.verifyTransaction(transactionId, actionData, userId);
              break;
            case 'process':
              await this.processTransaction(transactionId, actionData, userId);
              break;
            case 'cancel':
              await this.cancelTransaction(transactionId, actionData.reason, { userId, userRole: 'admin' });
              break;
            default:
              throw new Error(`Unknown action: ${action}`);
          }
          results.successful.push(transactionId);
        } catch (error) {
          logger.error(`Failed to process transaction ${transactionId}:`, error);
          results.failed.push({ id: transactionId, error: error.message });
        }
      }

      return results;
    } catch (error) {
      logger.error('Error in bulk processing:', error);
      throw error;
    }
  }

  /**
   * Get transaction items
   */
  async getTransactionItems(id: string, context: { userId?: string; userRole?: string }) {
    try {
      const transaction = await this.getTransactionById(id, context);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return {
        requestedDrugs: transaction.submission?.requestedDrugs || [],
        approvedDrugs: transaction.approval?.approvedDrugs || [],
        distributedDrugs: transaction.distribution?.actualDrugs || []
      };
    } catch (error) {
      logger.error('Error getting transaction items:', error);
      throw error;
    }
  }

  /**
   * Get transaction history/audit trail
   */
  async getTransactionHistory(id: string, context: { userId?: string; userRole?: string }) {
    try {
      const transaction = await this.getTransactionById(id, context);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // This would typically come from an audit log table
      // For now, we'll return the basic transaction data
      return [
        {
          action: 'created',
          timestamp: transaction.createdAt,
          user: transaction.createdBy,
          details: 'Transaction created'
        },
        ...(transaction.approval ? [{
          action: 'approved',
          timestamp: transaction.approval.approvedDate,
          user: transaction.approval.approvedBy,
          details: `Approved with status: ${transaction.approval.status}`
        }] : []),
        ...(transaction.distribution ? [{
          action: 'distributed',
          timestamp: transaction.distribution.distributedDate,
          user: transaction.distribution.distributedBy,
          details: 'Distribution started'
        }] : [])
      ];
    } catch (error) {
      logger.error('Error getting transaction history:', error);
      throw error;
    }
  }

  /**
   * Get emergency transactions
   */
  async getEmergencyTransactions(context: { userId?: string; userRole?: string }) {
    try {
      const where = {
        priority: 'high',
        status: { notIn: ['completed', 'cancelled'] }
      };

      const transactions = await this.prisma.transaction.findMany({
        where,
        orderBy: { submissionDate: 'asc' },
        include: {
          farmerGroup: true,
          bppOfficer: true,
          farmingDetails: true,
          submission: true,
          approval: true
        }
      });

      return transactions;
    } catch (error) {
      logger.error('Error getting emergency transactions:', error);
      throw error;
    }
  }

  /**
   * Add notes to transaction
   */
  async addTransactionNotes(id: string, notes: string, userId: string): Promise<Transaction> {
    try {
      const transaction = await this.prisma.transaction.update({
        where: { id },
        data: {
          updatedBy: userId,
          updatedAt: new Date()
        },
        include: {
          farmerGroup: true,
          bppOfficer: true,
          farmingDetails: true,
          submission: true,
          approval: true,
          distribution: true
        }
      });

      // In a real implementation, you might want to store notes in a separate table
      logger.info(`Notes added to transaction ${id} by user ${userId}: ${notes}`);
      return transaction;
    } catch (error) {
      logger.error('Error adding transaction notes:', error);
      throw error;
    }
  }
}
