// ================================================
// SUBMISSION MODULE TESTS
// ================================================

import { UserRole } from '@prisma/client';
import { SubmissionService } from './submissions.service';
import { SubmissionRepository } from './submissions.repository';
import { 
  SubmissionType, 
  SubmissionStatus, 
  SubmissionPriority,
  POPTActivityType,
  SubmissionRequest,
  SubmissionErrorCode
} from './submissions.types';

// ================================================
// MOCK DEPENDENCIES
// ================================================

const mockSubmissionRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySubmissionNumber: jest.fn(),
  findMany: jest.fn(),
  findByUserId: jest.fn(),
  findPendingReview: jest.fn(),
  findOverdue: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  delete: jest.fn(),
  getSubmissionStats: jest.fn(),
  getUserSubmissionStats: jest.fn()
} as jest.Mocked<SubmissionRepository>;

const mockInventoryService = {
  getMedicineById: jest.fn(),
  getTotalStock: jest.fn(),
  allocateStock: jest.fn()
};

const mockFileService = {
  uploadFile: jest.fn()
};

const mockNotificationService = {
  notifyNewSubmission: jest.fn(),
  notifyStatusUpdate: jest.fn()
};

// ================================================
// TEST SETUP
// ================================================

describe('SubmissionService', () => {
  let submissionService: SubmissionService;

  beforeEach(() => {
    submissionService = new SubmissionService(
      mockSubmissionRepository,
      mockInventoryService,
      mockFileService,
      mockNotificationService
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  // ================================================
  // CREATE SUBMISSION TESTS
  // ================================================

  describe('createSubmission', () => {
    const mockPPLUser = {
      id: 'user-ppl-1',
      role: UserRole.PPL
    };

    const mockPOPTUser = {
      id: 'user-popt-1',
      role: UserRole.POPT
    };

    const validPPLRequest: SubmissionRequest = {
      district: 'District A',
      village: 'Village B',
      farmerGroup: 'Farmer Group C',
      groupLeader: 'John Doe',
      commodity: 'Rice',
      totalArea: 10.5,
      affectedArea: 5.0,
      pestTypes: ['brown planthopper', 'stem borer'],
      letterNumber: 'LTR/001/2024',
      letterDate: new Date('2024-01-15'),
      items: [{
        medicineId: 'medicine-1',
        requestedQuantity: 10,
        unit: 'liter',
        notes: 'Urgent needed'
      }]
    };

    const validPOPTRequest: SubmissionRequest = {
      district: 'District A',
      village: 'Village B',
      farmerGroup: 'Farmer Group C',
      groupLeader: 'Jane Doe',
      commodity: 'Corn',
      totalArea: 15.0,
      affectedArea: 8.0,
      pestTypes: ['armyworm'],
      activityType: POPTActivityType.PEST_CONTROL,
      urgencyReason: 'Emergency pest outbreak detected in multiple fields',
      requestedBy: 'Head of Agriculture Department',
      activityDate: new Date('2024-02-01'),
      items: [{
        medicineId: 'medicine-2',
        requestedQuantity: 20,
        unit: 'kg'
      }]
    };

    it('should create PPL submission successfully', async () => {
      // Mock dependencies
      mockInventoryService.getMedicineById.mockResolvedValue({
        id: 'medicine-1',
        name: 'Test Medicine',
        status: 'ACTIVE'
      });
      mockInventoryService.getTotalStock.mockResolvedValue(100);
      mockSubmissionRepository.create.mockResolvedValue({
        id: 'submission-1',
        submissionNumber: 'SUB240001',
        submissionType: SubmissionType.PPL_REGULAR,
        status: SubmissionStatus.PENDING,
        ...validPPLRequest,
        submitterId: mockPPLUser.id,
        submitter: { id: mockPPLUser.id, name: 'PPL User', role: UserRole.PPL, nip: '123456' },
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      const result = await submissionService.createSubmission(
        validPPLRequest,
        mockPPLUser.id,
        mockPPLUser.role
      );

      expect(result).toBeDefined();
      expect(result.submissionType).toBe(SubmissionType.PPL_REGULAR);
      expect(result.status).toBe(SubmissionStatus.PENDING);
      expect(mockSubmissionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          submissionType: SubmissionType.PPL_REGULAR,
          letterNumber: validPPLRequest.letterNumber,
          letterDate: validPPLRequest.letterDate,
          submitterId: mockPPLUser.id
        })
      );
    });

    it('should create POPT emergency submission successfully', async () => {
      // Mock dependencies
      mockInventoryService.getMedicineById.mockResolvedValue({
        id: 'medicine-2',
        name: 'Test Pesticide',
        status: 'ACTIVE'
      });
      mockInventoryService.getTotalStock.mockResolvedValue(50);
      mockSubmissionRepository.create.mockResolvedValue({
        id: 'submission-2',
        submissionNumber: 'SUB240002',
        submissionType: SubmissionType.POPT_EMERGENCY,
        status: SubmissionStatus.PENDING,
        priority: SubmissionPriority.HIGH,
        ...validPOPTRequest,
        submitterId: mockPOPTUser.id,
        submitter: { id: mockPOPTUser.id, name: 'POPT User', role: UserRole.POPT, nip: '789012' },
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      const result = await submissionService.createSubmission(
        validPOPTRequest,
        mockPOPTUser.id,
        mockPOPTUser.role
      );

      expect(result).toBeDefined();
      expect(result.submissionType).toBe(SubmissionType.POPT_EMERGENCY);
      expect(result.priority).toBe(SubmissionPriority.HIGH);
      expect(mockSubmissionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          submissionType: SubmissionType.POPT_EMERGENCY,
          activityType: validPOPTRequest.activityType,
          urgencyReason: validPOPTRequest.urgencyReason,
          submitterId: mockPOPTUser.id
        })
      );
    });

    it('should reject PPL creating POPT submission', async () => {
      await expect(
        submissionService.createSubmission(
          validPOPTRequest,
          mockPPLUser.id,
          mockPPLUser.role
        )
      ).rejects.toEqual(
        expect.objectContaining({
          code: SubmissionErrorCode.INVALID_SUBMISSION_TYPE
        })
      );
    });

    it('should reject submission with insufficient stock', async () => {
      mockInventoryService.getMedicineById.mockResolvedValue({
        id: 'medicine-1',
        name: 'Test Medicine',
        status: 'ACTIVE'
      });
      mockInventoryService.getTotalStock.mockResolvedValue(5); // Less than requested

      await expect(
        submissionService.createSubmission(
          validPPLRequest,
          mockPPLUser.id,
          mockPPLUser.role
        )
      ).rejects.toEqual(
        expect.objectContaining({
          code: SubmissionErrorCode.INSUFFICIENT_STOCK
        })
      );
    });

    it('should reject submission with inactive medicine', async () => {
      mockInventoryService.getMedicineById.mockResolvedValue({
        id: 'medicine-1',
        name: 'Test Medicine',
        status: 'INACTIVE'
      });

      await expect(
        submissionService.createSubmission(
          validPPLRequest,
          mockPPLUser.id,
          mockPPLUser.role
        )
      ).rejects.toEqual(
        expect.objectContaining({
          code: SubmissionErrorCode.SUBMISSION_NOT_FOUND // Medicine not available
        })
      );
    });
  });

  // ================================================
  // UPDATE SUBMISSION STATUS TESTS
  // ================================================

  describe('updateSubmissionStatus', () => {
    const mockSubmission = {
      id: 'submission-1',
      submissionNumber: 'SUB240001',
      submissionType: SubmissionType.PPL_REGULAR,
      status: SubmissionStatus.PENDING,
      submitterId: 'user-ppl-1',
      submitter: { id: 'user-ppl-1', name: 'PPL User', role: UserRole.PPL, nip: '123456' },
      items: [{
        id: 'item-1',
        medicineId: 'medicine-1',
        requestedQuantity: 10,
        approvedQuantity: 0,
        distributedQuantity: 0,
        unit: 'liter'
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    const mockDinasUser = {
      id: 'user-dinas-1',
      role: UserRole.DINAS
    };

    it('should approve submission successfully', async () => {
      mockSubmissionRepository.findById.mockResolvedValue(mockSubmission);
      mockSubmissionRepository.updateStatus.mockResolvedValue({
        ...mockSubmission,
        status: SubmissionStatus.APPROVED,
        reviewerId: mockDinasUser.id,
        reviewedAt: new Date()
      });

      const statusUpdate = {
        status: SubmissionStatus.APPROVED,
        notes: 'Approved for distribution',
        approvedItems: [{
          submissionItemId: 'item-1',
          approvedQuantity: 8,
          notes: 'Partially approved due to stock constraints'
        }]
      };

      const result = await submissionService.updateSubmissionStatus(
        'submission-1',
        statusUpdate,
        mockDinasUser.id,
        mockDinasUser.role
      );

      expect(result.status).toBe(SubmissionStatus.APPROVED);
      expect(mockSubmissionRepository.updateStatus).toHaveBeenCalledWith(
        'submission-1',
        expect.objectContaining({
          status: SubmissionStatus.APPROVED,
          reviewerId: mockDinasUser.id,
          approvedItems: statusUpdate.approvedItems
        })
      );
    });

    it('should reject submission with reason', async () => {
      mockSubmissionRepository.findById.mockResolvedValue(mockSubmission);
      mockSubmissionRepository.updateStatus.mockResolvedValue({
        ...mockSubmission,
        status: SubmissionStatus.REJECTED,
        reviewerId: mockDinasUser.id,
        reviewedAt: new Date(),
        reviewerNotes: 'Insufficient documentation'
      });

      const statusUpdate = {
        status: SubmissionStatus.REJECTED,
        notes: 'Insufficient documentation provided'
      };

      const result = await submissionService.updateSubmissionStatus(
        'submission-1',
        statusUpdate,
        mockDinasUser.id,
        mockDinasUser.role
      );

      expect(result.status).toBe(SubmissionStatus.REJECTED);
      expect(mockSubmissionRepository.updateStatus).toHaveBeenCalledWith(
        'submission-1',
        expect.objectContaining({
          status: SubmissionStatus.REJECTED,
          reviewerId: mockDinasUser.id,
          notes: statusUpdate.notes
        })
      );
    });

    it('should reject invalid status transition', async () => {
      const completedSubmission = {
        ...mockSubmission,
        status: SubmissionStatus.COMPLETED
      };

      mockSubmissionRepository.findById.mockResolvedValue(completedSubmission);

      const statusUpdate = {
        status: SubmissionStatus.PENDING,
        notes: 'Cannot go back to pending'
      };

      await expect(
        submissionService.updateSubmissionStatus(
          'submission-1',
          statusUpdate,
          mockDinasUser.id,
          mockDinasUser.role
        )
      ).rejects.toEqual(
        expect.objectContaining({
          code: SubmissionErrorCode.INVALID_STATUS_TRANSITION
        })
      );
    });

    it('should reject unauthorized status update', async () => {
      mockSubmissionRepository.findById.mockResolvedValue(mockSubmission);

      const statusUpdate = {
        status: SubmissionStatus.APPROVED,
        notes: 'Unauthorized approval attempt'
      };

      const mockPPLUser = {
        id: 'user-ppl-2',
        role: UserRole.PPL
      };

      await expect(
        submissionService.updateSubmissionStatus(
          'submission-1',
          statusUpdate,
          mockPPLUser.id,
          mockPPLUser.role
        )
      ).rejects.toEqual(
        expect.objectContaining({
          code: SubmissionErrorCode.INVALID_STATUS_TRANSITION
        })
      );
    });
  });

  // ================================================
  // ACCESS CONTROL TESTS
  // ================================================

  describe('getSubmissionById - Access Control', () => {
    const mockSubmission = {
      id: 'submission-1',
      submitterId: 'user-ppl-1',
      submissionType: SubmissionType.PPL_REGULAR,
      status: SubmissionStatus.PENDING
    } as any;

    it('should allow owner to view their submission', async () => {
      mockSubmissionRepository.findById.mockResolvedValue(mockSubmission);

      const result = await submissionService.getSubmissionById(
        'submission-1',
        'user-ppl-1',
        UserRole.PPL
      );

      expect(result).toBeDefined();
      expect(mockSubmissionRepository.findById).toHaveBeenCalledWith('submission-1');
    });

    it('should allow DINAS to view any submission', async () => {
      mockSubmissionRepository.findById.mockResolvedValue(mockSubmission);

      const result = await submissionService.getSubmissionById(
        'submission-1',
        'user-dinas-1',
        UserRole.DINAS
      );

      expect(result).toBeDefined();
    });

    it('should deny non-owner PPL from viewing other submissions', async () => {
      mockSubmissionRepository.findById.mockResolvedValue(mockSubmission);

      await expect(
        submissionService.getSubmissionById(
          'submission-1',
          'user-ppl-2', // Different user
          UserRole.PPL
        )
      ).rejects.toEqual(
        expect.objectContaining({
          code: SubmissionErrorCode.UNAUTHORIZED_ACTION
        })
      );
    });
  });

  // ================================================
  // VALIDATION TESTS
  // ================================================

  describe('Validation Tests', () => {
    it('should validate submission types for roles', () => {
      expect(
        submissionService['determineSubmissionType'](
          { letterNumber: 'LTR/001', letterDate: new Date() } as any,
          UserRole.PPL
        )
      ).toBe(SubmissionType.PPL_REGULAR);

      expect(
        submissionService['determineSubmissionType'](
          { activityType: POPTActivityType.EMERGENCY_RESPONSE } as any,
          UserRole.POPT
        )
      ).toBe(SubmissionType.POPT_EMERGENCY);

      expect(
        submissionService['determineSubmissionType'](
          { activityType: POPTActivityType.SURVEILLANCE } as any,
          UserRole.POPT
        )
      ).toBe(SubmissionType.POPT_SCHEDULED);
    });

    it('should determine correct priority for submission types', () => {
      expect(
        submissionService['determinePriority'](
          SubmissionType.POPT_EMERGENCY,
          {}
        )
      ).toBe(SubmissionPriority.HIGH);

      expect(
        submissionService['determinePriority'](
          SubmissionType.PPL_REGULAR,
          { priority: SubmissionPriority.MEDIUM }
        )
      ).toBe(SubmissionPriority.MEDIUM);
    });
  });

  // ================================================
  // STATISTICS TESTS
  // ================================================

  describe('getSubmissionStats', () => {
    it('should return submission statistics', async () => {
      const mockStats = {
        total: 100,
        byStatus: {
          [SubmissionStatus.PENDING]: 20,
          [SubmissionStatus.APPROVED]: 50,
          [SubmissionStatus.REJECTED]: 10,
          [SubmissionStatus.COMPLETED]: 20
        },
        byType: {
          [SubmissionType.PPL_REGULAR]: 60,
          [SubmissionType.POPT_EMERGENCY]: 25,
          [SubmissionType.POPT_SCHEDULED]: 15
        },
        byPriority: {
          LOW: 20,
          MEDIUM: 50,
          HIGH: 25,
          URGENT: 5
        },
        byMonth: [],
        pendingReview: 30,
        overdue: 5,
        averageProcessingTime: 48
      };

      mockSubmissionRepository.getSubmissionStats.mockResolvedValue(mockStats);

      const result = await submissionService.getSubmissionStats(undefined, UserRole.ADMIN);

      expect(result).toEqual(mockStats);
      expect(mockSubmissionRepository.getSubmissionStats).toHaveBeenCalled();
    });
  });

  // ================================================
  // ERROR HANDLING TESTS
  // ================================================

  describe('Error Handling', () => {
    it('should handle submission not found', async () => {
      mockSubmissionRepository.findById.mockResolvedValue(null);

      await expect(
        submissionService.getSubmissionById('nonexistent', 'user-1', UserRole.PPL)
      ).rejects.toEqual(
        expect.objectContaining({
          code: SubmissionErrorCode.SUBMISSION_NOT_FOUND
        })
      );
    });

    it('should handle file upload errors gracefully', async () => {
      mockFileService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      const request = {
        ...validPPLRequest,
        letterFile: { filename: 'test.pdf' } as any
      };

      await expect(
        submissionService.createSubmission(request, 'user-1', UserRole.PPL)
      ).rejects.toEqual(
        expect.objectContaining({
          code: SubmissionErrorCode.FILE_UPLOAD_ERROR
        })
      );
    });
  });
});

// ================================================
// INTEGRATION TESTS
// ================================================

describe('Submission Integration Tests', () => {
  // These would test the full flow with real database
  // Skip for unit tests, implement in separate integration test file
  
  it.skip('should create, approve, and distribute submission end-to-end', async () => {
    // TODO: Implement integration tests
  });

  it.skip('should handle concurrent submission updates correctly', async () => {
    // TODO: Test concurrency scenarios
  });
});

// ================================================
// PERFORMANCE TESTS
// ================================================

describe('Submission Performance Tests', () => {
  it.skip('should handle large submission lists efficiently', async () => {
    // TODO: Test performance with large datasets
  });

  it.skip('should optimize database queries for statistics', async () => {
    // TODO: Test query performance
  });
});
