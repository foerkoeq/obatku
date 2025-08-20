// ================================================
// SUBMISSION ROUTES
// ================================================

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { SubmissionController } from './submissions.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { USER_ROLES } from '../../shared/constants/roles.constants';

// ================================================
// TYPE DEFINITIONS
// ================================================

// Note: User information is added by authenticateToken middleware
// req.user will be available in all routes after authentication

// ================================================
// ROLE MIDDLEWARE
// ================================================

/**
 * Role-based access middleware
 */
const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const userRole = req.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions for this action',
            required: allowedRoles,
            current: userRole
          }
        });
        return;
      }

      next();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Role validation failed';
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: errorMessage
        }
      });
    }
  };
};

// ================================================
// MULTER CONFIGURATION FOR FILE UPLOADS
// ================================================

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, 'src/uploads/submissions/letters');
  },
  filename: (_req: any, file: Express.Multer.File, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `letter-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only specific file types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file per request
  }
});

// ================================================
// ROUTE SETUP
// ================================================

export const createSubmissionRoutes = (submissionController: SubmissionController): Router => {
  const router = Router();

  // ================================================
  // MIDDLEWARE SETUP
  // ================================================

  // Apply authentication to all routes
  router.use(authenticateToken);

  // ================================================
  // CREATE ROUTES
  // ================================================

  /**
   * @route   POST /api/v1/submissions
   * @desc    Create a new submission
   * @access  Private (PPL, POPT, DINAS, ADMIN)
   * @body    SubmissionRequest + file upload (for PPL)
   */
  router.post(
    '/',
    requireRole([USER_ROLES.PPL, USER_ROLES.POPT, USER_ROLES.DINAS, USER_ROLES.ADMIN]),
    upload.single('letterFile'), // Handle file upload
    submissionController.createSubmission as any
  );

  // ================================================
  // READ ROUTES
  // ================================================

  /**
   * @route   GET /api/v1/submissions
   * @desc    Get all submissions (filtered by role)
   * @access  Private (All authenticated users)
   * @query   page, limit, sortBy, sortOrder, filters
   */
  router.get(
    '/',
    submissionController.getSubmissions as any
  );

  /**
   * @route   GET /api/v1/submissions/my
   * @desc    Get current user's submissions
   * @access  Private (All authenticated users)
   * @query   page, limit, sortBy, sortOrder, filters
   */
  router.get(
    '/my',
    submissionController.getUserSubmissions as any
  );

  /**
   * @route   GET /api/v1/submissions/pending-review
   * @desc    Get submissions pending review
   * @access  Private (DINAS, ADMIN)
   */
  router.get(
    '/pending-review',
    requireRole([USER_ROLES.DINAS, USER_ROLES.ADMIN]),
    submissionController.getPendingReview as any
  );

  /**
   * @route   GET /api/v1/submissions/overdue
   * @desc    Get overdue submissions
   * @access  Private (DINAS, ADMIN)
   */
  router.get(
    '/overdue',
    requireRole([USER_ROLES.DINAS, USER_ROLES.ADMIN]),
    submissionController.getOverdueSubmissions as any
  );

  /**
   * @route   GET /api/v1/submissions/stats
   * @desc    Get submission statistics
   * @access  Private (DINAS, ADMIN)
   * @query   filters (optional)
   */
  router.get(
    '/stats',
    requireRole([USER_ROLES.DINAS, USER_ROLES.ADMIN]),
    submissionController.getSubmissionStats as any
  );

  /**
   * @route   GET /api/v1/submissions/my-stats
   * @desc    Get current user's submission statistics
   * @access  Private (All authenticated users)
   */
  router.get(
    '/my-stats',
    submissionController.getUserSubmissionStats as any
  );

  /**
   * @route   GET /api/v1/submissions/types
   * @desc    Get allowed submission types for current user
   * @access  Private (All authenticated users)
   */
  router.get(
    '/types',
    submissionController.getSubmissionTypes as any
  );

  /**
   * @route   GET /api/v1/submissions/:id
   * @desc    Get submission by ID
   * @access  Private (Owner, DINAS, ADMIN)
   * @param   id - Submission ID
   */
  router.get(
    '/:id',
    submissionController.getSubmissionById as any
  );

  /**
   * @route   GET /api/v1/submissions/number/:submissionNumber
   * @desc    Get submission by submission number
   * @access  Private (Owner, DINAS, ADMIN)
   * @param   submissionNumber - Submission number
   */
  router.get(
    '/number/:submissionNumber',
    submissionController.getSubmissionByNumber as any
  );

  // ================================================
  // UPDATE ROUTES
  // ================================================

  /**
   * @route   PUT /api/v1/submissions/:id
   * @desc    Update submission
   * @access  Private (Owner in PENDING status, DINAS, ADMIN)
   * @param   id - Submission ID
   * @body    UpdateSubmissionData
   */
  router.put(
    '/:id',
    submissionController.updateSubmission as any
  );

  /**
   * @route   PATCH /api/v1/submissions/:id/status
   * @desc    Update submission status
   * @access  Private (DINAS, ADMIN, POPT for distribution)
   * @param   id - Submission ID
   * @body    SubmissionStatusUpdate
   */
  router.patch(
    '/:id/status',
    requireRole([USER_ROLES.DINAS, USER_ROLES.ADMIN, USER_ROLES.POPT]),
    submissionController.updateSubmissionStatus as any
  );

  /**
   * @route   PATCH /api/v1/submissions/:id/approve
   * @desc    Approve submission
   * @access  Private (DINAS, ADMIN)
   * @param   id - Submission ID
   * @body    { approvedItems: ApprovedItemUpdate[], notes?: string }
   */
  router.patch(
    '/:id/approve',
    requireRole([USER_ROLES.DINAS, USER_ROLES.ADMIN]),
    submissionController.approveSubmission as any
  );

  /**
   * @route   PATCH /api/v1/submissions/:id/reject
   * @desc    Reject submission
   * @access  Private (DINAS, ADMIN)
   * @param   id - Submission ID
   * @body    { reason: string }
   */
  router.patch(
    '/:id/reject',
    requireRole([USER_ROLES.DINAS, USER_ROLES.ADMIN]),
    submissionController.rejectSubmission as any
  );

  /**
   * @route   PATCH /api/v1/submissions/:id/cancel
   * @desc    Cancel submission
   * @access  Private (Owner, DINAS, ADMIN)
   * @param   id - Submission ID
   * @body    { reason: string }
   */
  router.patch(
    '/:id/cancel',
    submissionController.cancelSubmission as any
  );

  // ================================================
  // DELETE ROUTES
  // ================================================

  /**
   * @route   DELETE /api/v1/submissions/:id
   * @desc    Delete submission (only PENDING or CANCELLED)
   * @access  Private (ADMIN only)
   * @param   id - Submission ID
   */
  router.delete(
    '/:id',
    requireRole([USER_ROLES.ADMIN]),
    submissionController.deleteSubmission as any
  );

  // ================================================
  // BULK OPERATIONS (FUTURE ENHANCEMENT)
  // ================================================

  /**
   * @route   POST /api/v1/submissions/bulk-approve
   * @desc    Bulk approve submissions
   * @access  Private (DINAS, ADMIN)
   * @body    { submissionIds: string[], notes?: string }
   */
  router.post(
    '/bulk-approve',
    requireRole([USER_ROLES.DINAS, USER_ROLES.ADMIN]),
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        // TODO: Implement bulk approval
        res.status(501).json({
          success: false,
          error: {
            code: 'NOT_IMPLEMENTED',
            message: 'Bulk approval not yet implemented'
          }
        });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * @route   POST /api/v1/submissions/bulk-reject
   * @desc    Bulk reject submissions
   * @access  Private (DINAS, ADMIN)
   * @body    { submissionIds: string[], reason: string }
   */
  router.post(
    '/bulk-reject',
    requireRole([USER_ROLES.DINAS, USER_ROLES.ADMIN]),
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        // TODO: Implement bulk rejection
        res.status(501).json({
          success: false,
          error: {
            code: 'NOT_IMPLEMENTED',
            message: 'Bulk rejection not yet implemented'
          }
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // ================================================
  // EXPORT ROUTES (FUTURE ENHANCEMENT)
  // ================================================

  /**
   * @route   GET /api/v1/submissions/export/excel
   * @desc    Export submissions to Excel
   * @access  Private (DINAS, ADMIN)
   * @query   filters (optional)
   */
  router.get(
    '/export/excel',
    requireRole([USER_ROLES.DINAS, USER_ROLES.ADMIN]),
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        // TODO: Implement Excel export
        res.status(501).json({
          success: false,
          error: {
            code: 'NOT_IMPLEMENTED',
            message: 'Excel export not yet implemented'
          }
        });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * @route   GET /api/v1/submissions/export/pdf
   * @desc    Export submissions to PDF
   * @access  Private (DINAS, ADMIN)
   * @query   filters (optional)
   */
  router.get(
    '/export/pdf',
    requireRole([USER_ROLES.DINAS, USER_ROLES.ADMIN]),
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        // TODO: Implement PDF export
        res.status(501).json({
          success: false,
          error: {
            code: 'NOT_IMPLEMENTED',
            message: 'PDF export not yet implemented'
          }
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // ================================================
  // ERROR HANDLING MIDDLEWARE
  // ================================================

  // Handle multer errors
  router.use((error: any, _req: Request, res: Response, next: NextFunction): void => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds 5MB limit'
          }
        });
        return;
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        res.status(400).json({
          success: false,
          error: {
            code: 'TOO_MANY_FILES',
            message: 'Only one file is allowed'
          }
        });
        return;
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        res.status(400).json({
          success: false,
          error: {
            code: 'UNEXPECTED_FILE',
            message: 'Unexpected file field'
          }
        });
        return;
      }
    }

    if (error.message && error.message.includes('Invalid file type')) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: error.message
        }
      });
      return;
    }

    next(error);
  });

  return router;
};

// ================================================
// ROUTE DOCUMENTATION
// ================================================

/**
 * SUBMISSION API ENDPOINTS SUMMARY
 * 
 * CREATE:
 * POST   /api/v1/submissions                    - Create new submission
 * 
 * READ:
 * GET    /api/v1/submissions                    - Get all submissions (filtered by role)
 * GET    /api/v1/submissions/my                 - Get user's submissions
 * GET    /api/v1/submissions/pending-review     - Get pending review submissions
 * GET    /api/v1/submissions/overdue            - Get overdue submissions
 * GET    /api/v1/submissions/stats              - Get submission statistics
 * GET    /api/v1/submissions/my-stats           - Get user submission statistics
 * GET    /api/v1/submissions/types              - Get allowed submission types
 * GET    /api/v1/submissions/:id                - Get submission by ID
 * GET    /api/v1/submissions/number/:number     - Get submission by number
 * 
 * UPDATE:
 * PUT    /api/v1/submissions/:id                - Update submission
 * PATCH  /api/v1/submissions/:id/status         - Update submission status
 * PATCH  /api/v1/submissions/:id/approve        - Approve submission
 * PATCH  /api/v1/submissions/:id/reject         - Reject submission
 * PATCH  /api/v1/submissions/:id/cancel         - Cancel submission
 * 
 * DELETE:
 * DELETE /api/v1/submissions/:id                - Delete submission (ADMIN only)
 * 
 * BULK OPERATIONS (Future):
 * POST   /api/v1/submissions/bulk-approve       - Bulk approve submissions
 * POST   /api/v1/submissions/bulk-reject        - Bulk reject submissions
 * 
 * EXPORT (Future):
 * GET    /api/v1/submissions/export/excel       - Export to Excel
 * GET    /api/v1/submissions/export/pdf         - Export to PDF
 * 
 * PERMISSION MATRIX:
 * 
 * PPL:   Can create PPL_REGULAR, view/edit own submissions
 * POPT:  Can create POPT_*, view/edit own submissions, distribute approved items
 * DINAS: Can view all submissions, approve/reject, create any type
 * ADMIN: Full access to all operations
 */
