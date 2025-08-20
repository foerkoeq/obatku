import { Response } from 'express';
import { ApprovalsService } from './approvals.service';
import {
  CreateApprovalInput,
  CreateApprovalBodyInput,
  GetApprovalQueueInput,
  GetRecommendationInput,
  GetRecommendationQueryInput,
  AssignApprovalBodyInput,
  UpdatePriorityBodyInput,
  BulkApprovalInput,
  ApprovalHistoryInput,
  StatisticsQueryInput
} from './approvals.validation';

// ============================================================================
// APPROVAL WORKFLOW CONTROLLER - API ENDPOINTS
// ============================================================================

// Note: Using 'any' type for request parameters to avoid type conflicts
// with the existing Express Request interface that has custom user and validated properties
// This is a temporary solution until proper type declarations are set up

// Note: Using 'any' type for request parameters to avoid type conflicts
// with the existing Express Request interface that has custom user and validated properties
// This is a temporary solution until proper type declarations are set up

export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  // ==================== APPROVAL QUEUE ENDPOINTS ====================

  /**
   * GET /api/approvals
   * Get approval queue with filtering and pagination
   */
  getApprovalQueue = async (req: any, res: Response): Promise<void> => {
    try {
      const params = req.validated as GetApprovalQueueInput;
      const userId = req.user?.id;

      // Authentication check for approval queue access
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      // Note: userId is available but not currently used in service
      // It can be added to service method signature if needed for user-specific filtering
      const result = await this.approvalsService.getApprovalQueue(params);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  };

  /**
   * GET /api/approvals/submissions/:submissionId
   * Get submission details for approval review
   */
  getSubmissionForApproval = async (req: any, res: Response): Promise<void> => {
    try {
      const { submissionId } = req.params;
      const userId = req.user?.id; // From auth middleware

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          errors: ['User ID not found in request']
        });
        return;
      }

      const result = await this.approvalsService.getSubmissionForApproval(submissionId, userId);

      if (!result.success) {
        const statusCode = result.errors?.[0]?.includes('not found') ? 404 : 400;
        res.status(statusCode).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  };

  /**
   * GET /api/approvals/recommendations/:submissionId
   * Get smart recommendations for submission approval
   */
  getRecommendations = async (req: any, res: Response): Promise<void> => {
    try {
      const { submissionId } = req.params;
      const queryParams = req.validated as GetRecommendationQueryInput;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      const params: GetRecommendationInput = {
        submissionId,
        ...queryParams
      };

      const result = await this.approvalsService.getApprovalRecommendations(params, userId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  };

  // ==================== APPROVAL ACTION ENDPOINTS ====================

  /**
   * POST /api/approvals/:submissionId/approve
   * Process approval decision (approve/reject/partial approve)
   */
  processApproval = async (req: any, res: Response): Promise<void> => {
    try {
      const { submissionId } = req.params;
      const approvalData = req.validated as CreateApprovalBodyInput;
      const approverId = req.user?.id;

      if (!approverId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      // Ensure submissionId matches params
      const requestData: CreateApprovalInput = {
        ...approvalData,
        submissionId
      };

      const result = await this.approvalsService.processApproval(requestData, approverId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  };

  /**
   * POST /api/approvals/:submissionId/assign
   * Assign approval to specific user
   */
  assignApproval = async (req: any, res: Response): Promise<void> => {
    try {
      const { submissionId } = req.params;
      const { assignedTo } = req.validated as AssignApprovalBodyInput;
      const assignedBy = req.user?.id;

      if (!assignedBy) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      const result = await this.approvalsService.assignApproval(submissionId, assignedTo, assignedBy);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  };

  /**
   * PUT /api/approvals/:submissionId/priority
   * Update approval priority
   */
  updatePriority = async (req: any, res: Response): Promise<void> => {
    try {
      const { submissionId } = req.params;
      const { priority, reason } = req.validated as UpdatePriorityBodyInput;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      const result = await this.approvalsService.updatePriority(submissionId, priority, updatedBy, reason);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  };

  // ==================== BULK OPERATIONS ====================

  /**
   * POST /api/approvals/bulk
   * Process bulk approvals/rejections
   */
  processBulkApproval = async (req: any, res: Response): Promise<void> => {
    try {
      const { submissionIds, action, notes, rejectionReason } = req.validated as BulkApprovalInput;
      const approverId = req.user?.id;

      if (!approverId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      const result = await this.approvalsService.processBulkApproval(
        submissionIds,
        action,
        approverId,
        notes,
        rejectionReason
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  };

  // ==================== HISTORY AND STATISTICS ====================

  /**
   * GET /api/approvals/history
   * Get approval history with filtering
   */
  getApprovalHistory = async (req: any, res: Response): Promise<void> => {
    try {
      const {
        submissionId,
        approverId,
        limit
      } = req.validated as ApprovalHistoryInput;

      // Note: action, startDate, endDate, page are available but not currently used in service
      // They can be added to service method signature if needed for advanced filtering
      // Current implementation only supports basic filtering by submissionId and approverId
      const result = await this.approvalsService.getApprovalHistory(
        submissionId,
        approverId,
        limit || 50
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  };

  /**
   * GET /api/approvals/statistics
   * Get approval statistics and analytics
   */
  getStatistics = async (req: any, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        district
      } = req.validated as StatisticsQueryInput;

      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      // Note: approverId and includeDetails are available but not currently used in service
      // They can be added to service method signature if needed for advanced filtering
      // Current implementation only supports basic filtering by date range and district
      const result = await this.approvalsService.getApprovalStatistics(
        startDateObj,
        endDateObj,
        district
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  };

  // ==================== APPROVAL PREVIEW ====================

  /**
   * GET /api/approvals/:submissionId/preview
   * Get approval preview with automatic recommendations
   */
  getApprovalPreview = async (req: any, res: Response): Promise<void> => {
    try {
      const { submissionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      // Get submission details and recommendations in parallel
      const [submissionResult, recommendationResult] = await Promise.all([
        this.approvalsService.getSubmissionForApproval(submissionId, userId),
        this.approvalsService.getApprovalRecommendations(
          {
            submissionId,
            includeAlternatives: true,
            maxAlternatives: 3,
            riskTolerance: 'medium'
          },
          userId
        )
      ]);

      if (!submissionResult.success) {
        const statusCode = submissionResult.errors?.[0]?.includes('not found') ? 404 : 400;
        res.status(statusCode).json(submissionResult);
        return;
      }

      const response = {
        success: true,
        data: {
          submission: submissionResult.data,
          recommendations: recommendationResult.success ? recommendationResult.data : null,
          recommendationError: !recommendationResult.success ? recommendationResult.errors : null
        }
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  };

  // ==================== HEALTH CHECK ====================

  /**
   * GET /api/approvals/health
   * Health check endpoint for approval service
   */
  healthCheck = (_req: any, res: Response): void => {
    try {
      res.status(200).json({
        success: true,
        message: 'Approval service is healthy',
        timestamp: new Date().toISOString(),
        service: 'approvals',
        version: '1.0.0',
        uptime: process.uptime()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Approval service health check failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  };
}
