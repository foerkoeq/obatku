/**
 * Transaction Service Tests
 * Comprehensive unit tests for transaction business logic
 */

import { TransactionService } from '../transactions.service';
import { TransactionRepository } from '../transactions.repository';
import { Logger } from '../../../shared/logger';
import { 
  TransactionType, 
  TransactionSource, 
  TransactionStatus,
  CreateTransactionData 
} from '../transactions.types';
import { AppError, ErrorCode } from '../../../shared/errors';

// Mock dependencies
const mockRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByTransactionNumber: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  approve: jest.fn(),
  reject: jest.fn(),
  process: jest.fn(),
  complete: jest.fn(),
  cancel: jest.fn(),
  getSummary: jest.fn(),
  findByUser: jest.fn(),
  findPendingApprovals: jest.fn()
} as jest.Mocked<TransactionRepository>;

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
} as jest.Mocked<Logger>;

describe('TransactionService', () => {
  let transactionService: TransactionService;

  beforeEach(() => {
    jest.clearAllMocks();
    transactionService = new TransactionService(mockRepository, mockLogger);
  });

  describe('createTransaction', () => {
    const mockCreateData: CreateTransactionData = {
      type: TransactionType.SUBMISSION_BASED,
      source: TransactionSource.PPL_SUBMISSION,
      submissionId: 'test-submission-id',
      targetDistrict: 'Test District',
      requestLetter: 'test-letter.pdf',
      items: [
        {
          medicineId: 'test-medicine-id',
          requestedQuantity: 10
        }
      ]
    };

    const mockCreatedTransaction = {
      id: 'test-transaction-id',
      transactionNumber: 'TRX-2025-07-25-001',
      ...mockCreateData,
      status: TransactionStatus.PENDING,
      requestedBy: 'test-user-id',
      items: mockCreateData.items
    };

    it('should create transaction successfully for PPL submission', async () => {
      mockRepository.create.mockResolvedValue(mockCreatedTransaction as any);

      const result = await transactionService.createTransaction(mockCreateData, 'test-user-id');

      expect(mockRepository.create).toHaveBeenCalledWith(mockCreateData, 'test-user-id');
      expect(result).toEqual(mockCreatedTransaction);
      expect(mockLogger.info).toHaveBeenCalledWith('Creating new transaction', {
        data: mockCreateData,
        requestedBy: 'test-user-id'
      });
    });

    it('should throw error when PPL submission lacks request letter', async () => {
      const invalidData = {
        ...mockCreateData,
        requestLetter: undefined
      };

      await expect(
        transactionService.createTransaction(invalidData, 'test-user-id')
      ).rejects.toThrow(AppError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should create transaction for POPT request without requiring letter', async () => {
      const poptRequestData = {
        ...mockCreateData,
        source: TransactionSource.POPT_REQUEST,
        requestLetter: undefined,
        submissionId: undefined
      };

      const mockPoptTransaction = {
        ...mockCreatedTransaction,
        ...poptRequestData
      };

      mockRepository.create.mockResolvedValue(mockPoptTransaction as any);

      const result = await transactionService.createTransaction(poptRequestData, 'test-user-id');

      expect(mockRepository.create).toHaveBeenCalledWith(poptRequestData, 'test-user-id');
      expect(result).toEqual(mockPoptTransaction);
    });

    it('should throw error when stock is insufficient', async () => {
      // Mock stock validation to return insufficient stock
      jest.spyOn(transactionService as any, 'validateMedicineStock')
        .mockResolvedValue({
          isValid: false,
          message: 'Insufficient stock',
          availableStock: 5,
          shortfall: 5
        });

      await expect(
        transactionService.createTransaction(mockCreateData, 'test-user-id')
      ).rejects.toThrow(AppError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('approveTransaction', () => {
    const mockTransaction = {
      id: 'test-transaction-id',
      status: TransactionStatus.PENDING,
      items: [
        {
          id: 'item-1',
          medicineId: 'medicine-1',
          requestedQuantity: 10
        }
      ]
    };

    it('should approve pending transaction successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction as any);
      mockRepository.approve.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.APPROVED
      } as any);

      const result = await transactionService.approveTransaction(
        'test-transaction-id',
        'approver-id',
        'Approval notes'
      );

      expect(mockRepository.findById).toHaveBeenCalledWith('test-transaction-id');
      expect(mockRepository.approve).toHaveBeenCalledWith(
        'test-transaction-id',
        'approver-id',
        'Approval notes',
        undefined
      );
      expect(result.status).toBe(TransactionStatus.APPROVED);
    });

    it('should throw error when trying to approve non-pending transaction', async () => {
      mockRepository.findById.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.COMPLETED
      } as any);

      await expect(
        transactionService.approveTransaction('test-transaction-id', 'approver-id')
      ).rejects.toThrow(AppError);

      expect(mockRepository.approve).not.toHaveBeenCalled();
    });

    it('should approve with quantity adjustments', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction as any);
      mockRepository.approve.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.APPROVED
      } as any);

      const adjustments = [{
        transactionItemId: 'item-1',
        approvedQuantity: 8
      }];

      await transactionService.approveTransaction(
        'test-transaction-id',
        'approver-id',
        'Reduced quantity due to stock limitation',
        adjustments
      );

      expect(mockRepository.approve).toHaveBeenCalledWith(
        'test-transaction-id',
        'approver-id',
        'Reduced quantity due to stock limitation',
        adjustments
      );
    });
  });

  describe('processTransaction', () => {
    const mockTransaction = {
      id: 'test-transaction-id',
      status: TransactionStatus.APPROVED,
      items: [
        {
          id: 'item-1',
          medicineId: 'medicine-1',
          requestedQuantity: 10,
          approvedQuantity: 8
        }
      ]
    };

    const mockProcessData = {
      items: [
        {
          transactionItemId: 'item-1',
          processedQuantity: 8,
          qrCodes: ['QR001', 'QR002'],
          batchNumbers: ['BATCH001'],
          expiryDates: [new Date('2025-12-31')]
        }
      ],
      deliveryNote: 'DN-001',
      notes: 'Processed successfully'
    };

    it('should process approved transaction successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction as any);
      mockRepository.process.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.IN_PROGRESS
      } as any);

      const result = await transactionService.processTransaction(
        'test-transaction-id',
        mockProcessData,
        'processor-id'
      );

      expect(mockRepository.findById).toHaveBeenCalledWith('test-transaction-id');
      expect(mockRepository.process).toHaveBeenCalledWith(
        'test-transaction-id',
        mockProcessData,
        'processor-id'
      );
      expect(result.status).toBe(TransactionStatus.IN_PROGRESS);
    });

    it('should throw error when trying to process non-approved transaction', async () => {
      mockRepository.findById.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.PENDING
      } as any);

      await expect(
        transactionService.processTransaction(
          'test-transaction-id',
          mockProcessData,
          'processor-id'
        )
      ).rejects.toThrow(AppError);

      expect(mockRepository.process).not.toHaveBeenCalled();
    });
  });

  describe('completeTransaction', () => {
    const mockTransaction = {
      id: 'test-transaction-id',
      status: TransactionStatus.IN_PROGRESS
    };

    const mockCompleteData = {
      receivingProof: 'receipt.pdf',
      completionNotes: 'Delivered successfully',
      additionalDocuments: ['doc1.pdf', 'doc2.pdf']
    };

    it('should complete in-progress transaction successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction as any);
      mockRepository.complete.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.COMPLETED
      } as any);

      const result = await transactionService.completeTransaction(
        'test-transaction-id',
        mockCompleteData,
        'completer-id'
      );

      expect(mockRepository.findById).toHaveBeenCalledWith('test-transaction-id');
      expect(mockRepository.complete).toHaveBeenCalledWith(
        'test-transaction-id',
        mockCompleteData,
        'completer-id'
      );
      expect(result.status).toBe(TransactionStatus.COMPLETED);
    });

    it('should throw error when trying to complete non-in-progress transaction', async () => {
      mockRepository.findById.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.PENDING
      } as any);

      await expect(
        transactionService.completeTransaction(
          'test-transaction-id',
          mockCompleteData,
          'completer-id'
        )
      ).rejects.toThrow(AppError);

      expect(mockRepository.complete).not.toHaveBeenCalled();
    });
  });

  describe('cancelTransaction', () => {
    it('should cancel non-completed transaction successfully', async () => {
      const mockTransaction = {
        id: 'test-transaction-id',
        status: TransactionStatus.PENDING
      };

      mockRepository.findById.mockResolvedValue(mockTransaction as any);
      mockRepository.cancel.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.CANCELLED
      } as any);

      const result = await transactionService.cancelTransaction(
        'test-transaction-id',
        'canceller-id',
        'No longer needed'
      );

      expect(mockRepository.cancel).toHaveBeenCalledWith(
        'test-transaction-id',
        'canceller-id',
        'No longer needed'
      );
      expect(result.status).toBe(TransactionStatus.CANCELLED);
    });

    it('should throw error when trying to cancel completed transaction', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'test-transaction-id',
        status: TransactionStatus.COMPLETED
      } as any);

      await expect(
        transactionService.cancelTransaction(
          'test-transaction-id',
          'canceller-id',
          'Test reason'
        )
      ).rejects.toThrow(AppError);

      expect(mockRepository.cancel).not.toHaveBeenCalled();
    });
  });

  describe('getTransactionSummary', () => {
    it('should return transaction summary successfully', async () => {
      const mockSummary = {
        totalTransactions: 100,
        pendingTransactions: 10,
        inProgressTransactions: 5,
        completedTransactions: 85,
        totalValue: 1000000,
        averageProcessingTime: 24,
        byType: {},
        bySource: {},
        byStatus: {}
      };

      mockRepository.getSummary.mockResolvedValue(mockSummary);

      const result = await transactionService.getTransactionSummary();

      expect(mockRepository.getSummary).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockSummary);
    });
  });

  describe('business rule validation', () => {
    it('should validate PPL submission requires letter', () => {
      const service = transactionService as any;
      const rules = service.getBusinessRules(
        TransactionType.SUBMISSION_BASED,
        TransactionSource.PPL_SUBMISSION
      );

      expect(rules.requiresLetter).toBe(true);
      expect(rules.allowedSources).toContain(TransactionSource.PPL_SUBMISSION);
    });

    it('should validate POPT request does not require letter', () => {
      const service = transactionService as any;
      const rules = service.getBusinessRules(
        TransactionType.DIRECT_REQUEST,
        TransactionSource.POPT_REQUEST
      );

      expect(rules.requiresLetter).toBe(false);
      expect(rules.allowedSources).toContain(TransactionSource.POPT_REQUEST);
    });

    it('should validate Dinas directive may not require approval', () => {
      const service = transactionService as any;
      const rules = service.getBusinessRules(
        TransactionType.ADMINISTRATIVE,
        TransactionSource.DINAS_DIRECTIVE
      );

      expect(rules.requiresLetter).toBe(false);
      expect(rules.requiresApproval).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(
        transactionService.getAllTransactions({ page: 1, limit: 20 })
      ).rejects.toThrow(AppError);

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle transaction not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        transactionService.getTransactionById('non-existent-id')
      ).rejects.toThrow(AppError);

      expect(mockLogger.error).not.toHaveBeenCalled(); // Should not log error for not found
    });
  });
});
