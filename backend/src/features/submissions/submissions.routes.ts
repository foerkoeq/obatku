// ================================================
// SUBMISSION ROUTES
// ================================================

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { SubmissionController } from './submissions.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { rateLimitMiddleware } from '../../middleware/rate-limit.middleware';
import { UserRole } from '@prisma/client';

// ================================================
// MULTER CONFIGURATION FOR FILE UPLOADS
// ================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/submissions/letters');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `letter-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  router.use(authMiddleware);

  // Apply rate limiting
  router.use(rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window per IP
    message: 'Too many requests from this IP, please try again later.'
  }));

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
    roleMiddleware([UserRole.PPL, UserRole.POPT, UserRole.DINAS, UserRole.ADMIN]),
    upload.single('letterFile'), // Handle file upload
    submissionController.createSubmission
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
    submissionController.getSubmissions
  );

  /**
   * @route   GET /api/v1/submissions/my
   * @desc    Get current user's submissions
   * @access  Private (All authenticated users)
   * @query   page, limit, sortBy, sortOrder, filters
   */
  router.get(
    '/my',
    submissionController.getUserSubmissions
  );

  /**
   * @route   GET /api/v1/submissions/pending-review
   * @desc    Get submissions pending review
   * @access  Private (DINAS, ADMIN)
   */
  router.get(
    '/pending-review',
    roleMiddleware([UserRole.DINAS, UserRole.ADMIN]),
    submissionController.getPendingReview
  );

  /**
   * @route   GET /api/v1/submissions/overdue
   * @desc    Get overdue submissions
   * @access  Private (DINAS, ADMIN)
   */
  router.get(
    '/overdue',
    roleMiddleware([UserRole.DINAS, UserRole.ADMIN]),
    submissionController.getOverdueSubmissions
  );

  /**
   * @route   GET /api/v1/submissions/stats
   * @desc    Get submission statistics
   * @access  Private (DINAS, ADMIN)
   * @query   filters (optional)
   */
  router.get(
    '/stats',
    roleMiddleware([UserRole.DINAS, UserRole.ADMIN]),
    submissionController.getSubmissionStats
  );

  /**
   * @route   GET /api/v1/submissions/my-stats
   * @desc    Get current user's submission statistics
   * @access  Private (All authenticated users)
   */
  router.get(
    '/my-stats',
    submissionController.getUserSubmissionStats
  );

  /**
   * @route   GET /api/v1/submissions/types
   * @desc    Get allowed submission types for current user
   * @access  Private (All authenticated users)
   */
  router.get(
    '/types',
    submissionController.getSubmissionTypes
  );

  /**
   * @route   GET /api/v1/submissions/:id
   * @desc    Get submission by ID
   * @access  Private (Owner, DINAS, ADMIN)
   * @param   id - Submission ID
   */
  router.get(
    '/:id',
    submissionController.getSubmissionById
  );

  /**
   * @route   GET /api/v1/submissions/number/:submissionNumber
   * @desc    Get submission by submission number
   * @access  Private (Owner, DINAS, ADMIN)
   * @param   submissionNumber - Submission number
   */
  router.get(
    '/number/:submissionNumber',
    submissionController.getSubmissionByNumber
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
    submissionController.updateSubmission
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
    roleMiddleware([UserRole.DINAS, UserRole.ADMIN, UserRole.POPT]),
    submissionController.updateSubmissionStatus
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
    roleMiddleware([UserRole.DINAS, UserRole.ADMIN]),
    submissionController.approveSubmission
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
    roleMiddleware([UserRole.DINAS, UserRole.ADMIN]),
    submissionController.rejectSubmission
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
    submissionController.cancelSubmission
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
    roleMiddleware([UserRole.ADMIN]),
    submissionController.deleteSubmission
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
    roleMiddleware([UserRole.DINAS, UserRole.ADMIN]),
    async (req, res, next) => {
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
    roleMiddleware([UserRole.DINAS, UserRole.ADMIN]),
    async (req, res, next) => {
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
    roleMiddleware([UserRole.DINAS, UserRole.ADMIN]),
    async (req, res, next) => {
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
    roleMiddleware([UserRole.DINAS, UserRole.ADMIN]),
    async (req, res, next) => {
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
  router.use((error: any, req: any, res: any, next: any) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds 5MB limit'
          }
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'TOO_MANY_FILES',
            message: 'Only one file is allowed'
          }
        });
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'UNEXPECTED_FILE',
            message: 'Unexpected file field'
          }
        });
      }
    }

    if (error.message && error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: error.message
        }
      });
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
