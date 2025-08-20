import { Router, Request, Response, NextFunction } from 'express';
import { ApprovalsController } from './approvals.controller';
import { validateSchema } from './approvals.validation';
import {
  createApprovalSchema,
  getApprovalQueueSchema,
  getRecommendationSchema,
  assignApprovalSchema,
  updatePrioritySchema,
  bulkApprovalSchema,
  approvalHistorySchema,
  statisticsQuerySchema
} from './approvals.validation';
import { AuthenticatedUser } from '../auth/auth.types';

// ============================================================================
// APPROVAL WORKFLOW ROUTES - API ROUTING
// ============================================================================

export function createApprovalsRoutes(approvalsController: ApprovalsController): Router {
  const router = Router();

  // ==================== APPROVAL QUEUE ROUTES ====================

  /**
   * GET /api/approvals
   * Get approval queue with filtering and pagination
   * Query params: status, priority, district, assignedTo, page, limit, sortBy, sortOrder
   */
  router.get(
    '/',
    validateSchema(getApprovalQueueSchema),
    approvalsController.getApprovalQueue
  );

  /**
   * GET /api/approvals/submissions/:submissionId
   * Get submission details for approval review
   */
  router.get(
    '/submissions/:submissionId',
    approvalsController.getSubmissionForApproval
  );

  /**
   * GET /api/approvals/recommendations/:submissionId
   * Get smart recommendations for submission approval
   * Query params: includeAlternatives, maxAlternatives, riskTolerance
   */
  router.get(
    '/recommendations/:submissionId',
    validateSchema(getRecommendationSchema),
    approvalsController.getRecommendations
  );

  /**
   * GET /api/approvals/:submissionId/preview
   * Get comprehensive approval preview (submission + recommendations)
   */
  router.get(
    '/:submissionId/preview',
    approvalsController.getApprovalPreview
  );

  // ==================== APPROVAL ACTION ROUTES ====================

  /**
   * POST /api/approvals/:submissionId/approve
   * Process approval decision (approve/reject/partial approve/request revision)
   * Body: action, notes, approvedItems, rejectionReason, requestedRevisions, estimatedDeliveryDate
   */
  router.post(
    '/:submissionId/approve',
    validateSchema(createApprovalSchema),
    approvalsController.processApproval
  );

  /**
   * POST /api/approvals/:submissionId/assign
   * Assign approval to specific user
   * Body: assignedTo, priority, deadline, notes
   */
  router.post(
    '/:submissionId/assign',
    validateSchema(assignApprovalSchema),
    approvalsController.assignApproval
  );

  /**
   * PUT /api/approvals/:submissionId/priority
   * Update approval priority
   * Body: priority, reason
   */
  router.put(
    '/:submissionId/priority',
    validateSchema(updatePrioritySchema),
    approvalsController.updatePriority
  );

  // ==================== BULK OPERATIONS ====================

  /**
   * POST /api/approvals/bulk
   * Process bulk approvals/rejections
   * Body: submissionIds, action, notes, rejectionReason
   */
  router.post(
    '/bulk',
    validateSchema(bulkApprovalSchema),
    approvalsController.processBulkApproval
  );

  // ==================== HISTORY AND STATISTICS ====================

  /**
   * GET /api/approvals/history
   * Get approval history with filtering
   * Query params: submissionId, approverId, action, startDate, endDate, page, limit
   */
  router.get(
    '/history',
    validateSchema(approvalHistorySchema),
    approvalsController.getApprovalHistory
  );

  /**
   * GET /api/approvals/statistics
   * Get approval statistics and analytics
   * Query params: startDate, endDate, district, approverId, includeDetails
   */
  router.get(
    '/statistics',
    validateSchema(statisticsQuerySchema),
    approvalsController.getStatistics
  );

  // ==================== HEALTH CHECK ====================

  /**
   * GET /api/approvals/health
   * Health check endpoint for approval service
   */
  router.get('/health', approvalsController.healthCheck);

  return router;
}

// ============================================================================
// ROUTE MIDDLEWARE HELPERS
// ============================================================================

// Define custom request interface for authenticated users
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Middleware to check if user has approval permissions
 */
export const requireApprovalPermission = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const user = req.user;
  
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      errors: ['User not authenticated']
    });
    return;
  }

  // Check if user has dinas role or admin privileges
  const allowedRoles = ['dinas', 'admin', 'supervisor'];
  if (!allowedRoles.includes(user.role?.toLowerCase())) {
    res.status(403).json({
      success: false,
      message: 'Insufficient permissions',
      errors: ['User does not have approval permissions']
    });
    return;
  }

  next();
};

/**
 * Middleware to validate submission ownership for certain operations
 */
export const validateSubmissionAccess = async (_req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
  // This would check if the user can access/modify the specific submission
  // Implementation depends on your specific business rules
  
  // TODO: Implement submission access validation
  // Example: Check if user can access the specific submission
  // - User is the submitter
  // - User has admin privileges
  // - User is assigned to review this submission
  
  next();
};

/**
 * Middleware to rate limit approval operations
 */
export const rateLimitApprovals = (_req: Request, _res: Response, next: NextFunction): void => {
  // Implement rate limiting for approval operations to prevent abuse
  // This is particularly important for bulk operations
  
  // TODO: Implement actual rate limiting logic
  // Example: Check user's approval count in time window
  
  next();
};

/**
 * Apply approval route middlewares
 */
export function applyApprovalMiddlewares(router: Router): Router {
  // Apply authentication middleware to all routes
  // router.use(authMiddleware); // Implement your auth middleware
  
  // Apply approval permission check to all routes except health check
  router.use((req, res, next) => {
    if (req.path === '/health') {
      return next();
    }
    requireApprovalPermission(req as AuthenticatedRequest, res, next);
  });

  // Apply rate limiting to bulk operations
  router.use('/bulk', rateLimitApprovals);

  return router;
}

// ============================================================================
// ROUTE CONSTANTS
// ============================================================================

export const APPROVAL_ROUTES = {
  BASE: '/api/approvals',
  QUEUE: '/',
  SUBMISSION_DETAIL: '/submissions/:submissionId',
  RECOMMENDATIONS: '/recommendations/:submissionId',
  PREVIEW: '/:submissionId/preview',
  APPROVE: '/:submissionId/approve',
  ASSIGN: '/:submissionId/assign',
  UPDATE_PRIORITY: '/:submissionId/priority',
  BULK: '/bulk',
  HISTORY: '/history',
  STATISTICS: '/statistics',
  HEALTH: '/health'
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const;
