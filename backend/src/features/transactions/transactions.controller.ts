// src/features/transactions/transactions.controller.ts
import { Request, Response } from 'express';
import { TransactionService } from './transactions.service';
import { ResponseUtil } from '../../shared/utils/response.util';
import {
  createTransactionSchema,
  updateTransactionSchema,
  processTransactionSchema,
  approveTransactionSchema as verifyTransactionSchema,
  transactionQuerySchema,
  uuidSchema,
  transactionNumberSchema
} from './transactions.validation';
import { 
  TransactionType,
  TransactionStatus,
  TransactionSource,
  CreateTransactionData,
  UpdateTransactionData,
  ProcessTransactionData
} from './transactions.types';

export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * GET /api/transactions
   * Get all transactions with filtering, sorting, and pagination
   */
  getAllTransactions = async (req: Request, res: Response) => {
    try {
      const query = transactionQuerySchema.parse(req.query);
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const result = await this.transactionService.getAllTransactions(query, {
        userId,
        userRole
      });

      return ResponseUtil.successPaginated(
        res,
        result.transactions,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrevious: result.page > 1
        },
        'Transactions retrieved successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * GET /api/transactions/:id
   * Get transaction detail by ID
   */
  getTransactionById = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const transaction = await this.transactionService.getTransactionById(id, {
        userId,
        userRole
      });

      if (!transaction) {
        return ResponseUtil.notFound(res, 'Transaction not found');
      }

      return ResponseUtil.success(
        res,
        transaction,
        'Transaction retrieved successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * GET /api/transactions/number/:transactionNumber
   * Get transaction by transaction number
   */
  getTransactionByNumber = async (req: Request, res: Response) => {
    try {
      const transactionNumber = transactionNumberSchema.parse(req.params.transactionNumber);
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const transaction = await this.transactionService.getTransactionByNumber(
        transactionNumber,
        { userId, userRole }
      );

      if (!transaction) {
        return ResponseUtil.notFound(res, 'Transaction not found');
      }

      return ResponseUtil.success(
        res,
        transaction,
        'Transaction retrieved successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * POST /api/transactions
   * Create new transaction (manual or from submission)
   */
  createTransaction = async (req: Request, res: Response) => {
    try {
      const transactionData: CreateTransactionData = createTransactionSchema.parse(req.body);
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Validate user permissions for transaction creation
      if (!this.canCreateTransaction(userRole, transactionData.type, transactionData.source)) {
        return ResponseUtil.forbidden(res, 'Insufficient permissions to create this type of transaction');
      }

      const transaction = await this.transactionService.createTransaction(
        transactionData,
        userId!
      );

      return ResponseUtil.created(
        res,
        transaction,
        'Transaction created successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      if (error.name === 'BusinessError') {
        return ResponseUtil.error(res, 'BUSINESS_ERROR', error.message, null, 400);
      }
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * PUT /api/transactions/:id
   * Update transaction (only pending transactions)
   */
  updateTransaction = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const updateData: UpdateTransactionData = updateTransactionSchema.parse(req.body);
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const transaction = await this.transactionService.updateTransaction(
        id,
        updateData,
        { userId, userRole }
      );

      return ResponseUtil.success(
        res,
        transaction,
        'Transaction updated successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      if (error.name === 'BusinessError') {
        return ResponseUtil.error(res, 'BUSINESS_ERROR', error.message, null, 400);
      }
      if (error.name === 'NotFoundError') {
        return ResponseUtil.notFound(res, error.message);
      }
      if (error.name === 'ForbiddenError') {
        return ResponseUtil.forbidden(res, error.message);
      }
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * POST /api/transactions/:id/process
   * Process transaction (fulfill items, update stock)
   */
  processTransaction = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const processData: ProcessTransactionData = processTransactionSchema.parse(req.body);
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Validate user permissions for transaction processing
      if (!this.canProcessTransaction(userRole)) {
        return ResponseUtil.forbidden(res, 'Insufficient permissions to process transactions');
      }

      const transaction = await this.transactionService.processTransaction(
        id,
        processData,
        userId!
      );

      return ResponseUtil.success(
        res,
        transaction,
        'Transaction processed successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      if (error.name === 'BusinessError') {
        return ResponseUtil.error(res, 'BUSINESS_ERROR', error.message, null, 400);
      }
      if (error.name === 'NotFoundError') {
        return ResponseUtil.notFound(res, error.message);
      }
      if (error.name === 'ForbiddenError') {
        return ResponseUtil.forbidden(res, error.message);
      }
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * POST /api/transactions/:id/verify
   * Verify transaction (supervisor approval)
   */
  verifyTransaction = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const verifyData = verifyTransactionSchema.parse(req.body);
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Validate user permissions for transaction verification
      if (!this.canVerifyTransaction(userRole)) {
        return ResponseUtil.forbidden(res, 'Insufficient permissions to verify transactions');
      }

      const transaction = await this.transactionService.verifyTransaction(
        id,
        verifyData,
        userId!
      );

      return ResponseUtil.success(
        res,
        transaction,
        'Transaction verified successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      if (error.name === 'BusinessError') {
        return ResponseUtil.error(res, 'BUSINESS_ERROR', error.message, null, 400);
      }
      if (error.name === 'NotFoundError') {
        return ResponseUtil.notFound(res, error.message);
      }
      if (error.name === 'ForbiddenError') {
        return ResponseUtil.forbidden(res, error.message);
      }
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * DELETE /api/transactions/:id
   * Cancel transaction (only pending transactions)
   */
  cancelTransaction = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const reason = req.body.reason || 'Cancelled by user';

      const transaction = await this.transactionService.cancelTransaction(
        id,
        reason,
        { userId, userRole }
      );

      return ResponseUtil.success(
        res,
        transaction,
        'Transaction cancelled successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      if (error.name === 'BusinessError') {
        return ResponseUtil.error(res, 'BUSINESS_ERROR', error.message, null, 400);
      }
      if (error.name === 'NotFoundError') {
        return ResponseUtil.notFound(res, error.message);
      }
      if (error.name === 'ForbiddenError') {
        return ResponseUtil.forbidden(res, error.message);
      }
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * GET /api/transactions/summary
   * Get transaction summary statistics
   */
  getTransactionSummary = async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo, status } = req.query;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const summary = await this.transactionService.getTransactionSummary({
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        status: status as TransactionStatus,
        userId,
        userRole
      });

      return ResponseUtil.success(
        res,
        summary,
        'Transaction summary retrieved successfully'
      );
    } catch (error: any) {
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * POST /api/transactions/bulk
   * Bulk process multiple transactions
   */
  bulkProcessTransactions = async (req: Request, res: Response) => {
    try {
      const { transactionIds, notes } = req.body;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Validate user permissions for bulk processing
      if (!this.canProcessTransaction(userRole || '')) {
        return ResponseUtil.forbidden(res, 'Insufficient permissions to process transactions');
      }

      const result = await this.transactionService.bulkProcessTransactions(
        { transactionIds, notes },
        userId!
      );

      return ResponseUtil.success(
        res,
        result,
        `Successfully processed ${result.successful?.length || 0} transactions, ${result.failed?.length || 0} failed`
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * GET /api/transactions/:id/items
   * Get transaction items details
   */
  getTransactionItems = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const items = await this.transactionService.getTransactionItems(id, {
        userId,
        userRole
      });

      return ResponseUtil.success(
        res,
        items,
        'Transaction items retrieved successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      if (error.name === 'NotFoundError') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * GET /api/transactions/:id/history
   * Get transaction history and status changes
   */
  getTransactionHistory = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const history = await this.transactionService.getTransactionHistory(id, {
        userId,
        userRole
      });

      return ResponseUtil.success(
        res,
        history,
        'Transaction history retrieved successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      if (error.name === 'NotFoundError') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * GET /api/transactions/emergency
   * Get emergency transactions requiring immediate attention
   */
  getEmergencyTransactions = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const emergencyTransactions = await this.transactionService.getEmergencyTransactions({
        userId,
        userRole
      });

      return ResponseUtil.success(
        res,
        emergencyTransactions,
        'Emergency transactions retrieved successfully'
      );
    } catch (error: any) {
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  /**
   * POST /api/transactions/:id/notes
   * Add notes to transaction
   */
  addTransactionNotes = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const { notes } = req.body;
      const userId = req.user?.id;

      if (!notes || typeof notes !== 'string') {
        return ResponseUtil.error(res, 'VALIDATION_ERROR', 'Notes are required', null, 400);
      }

      const transaction = await this.transactionService.addTransactionNotes(
        id,
        notes,
        userId!
      );

      return ResponseUtil.success(
        res,
        transaction,
        'Notes added successfully'
      );
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, 'INTERNAL_ERROR', error.message, null, 500);
    }
  };

  // Permission validation methods
  private canCreateTransaction(userRole: string | undefined, _type: TransactionType, source: TransactionSource): boolean {
    if (!userRole) return false;
    
    // Admin can create any transaction
    if (userRole === 'admin') return true;

    // PPL can create submissions
    if (userRole === 'ppl' && source === TransactionSource.PPL_SUBMISSION) return true;

    // POPT can create requests
    if (userRole === 'popt' && source === TransactionSource.POPT_REQUEST) return true;

    // Dinas can create directives and emergency responses
    if (userRole === 'dinas' && [
      TransactionSource.DINAS_DIRECTIVE,
      TransactionSource.EMERGENCY_RESPONSE
    ].includes(source)) return true;

    return false;
  }

  private canProcessTransaction(userRole: string | undefined): boolean {
    if (!userRole) return false;
    return ['admin', 'dinas'].includes(userRole);
  }

  private canVerifyTransaction(userRole: string | undefined): boolean {
    if (!userRole) return false;
    return ['admin', 'dinas'].includes(userRole);
  }
}
