// ================================================
// SUBMISSION CONTROLLER
// ================================================

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { SubmissionService } from './submissions.service';
import { 
  SubmissionRequest,
  SubmissionListQuery, 
  SubmissionStatusUpdate
} from './submissions.types';
import { 
  submissionListQuerySchema,
  submissionFiltersSchema 
} from './submissions.validation';
import { AuthenticatedUser } from '../auth/auth.types';

// Extend Request type to include user information
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  file?: Express.Multer.File;
}

export class SubmissionController {
  constructor(private submissionService: SubmissionService) {}

  // ================================================
  // CREATE ENDPOINTS
  // ================================================

  createSubmission = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      // Extract submission data from request
      const submissionRequest: SubmissionRequest = {
        district: req.body.district,
        village: req.body.village,
        farmerGroup: req.body.farmerGroup,
        groupLeader: req.body.groupLeader,
        commodity: req.body.commodity,
        totalArea: parseFloat(req.body.totalArea),
        affectedArea: parseFloat(req.body.affectedArea),
        pestTypes: Array.isArray(req.body.pestTypes) ? req.body.pestTypes : JSON.parse(req.body.pestTypes || '[]'),
        letterNumber: req.body.letterNumber,
        letterDate: req.body.letterDate ? new Date(req.body.letterDate) : undefined,
        letterFile: req.file,
        activityType: req.body.activityType,
        urgencyReason: req.body.urgencyReason,
        requestedBy: req.body.requestedBy,
        activityDate: req.body.activityDate ? new Date(req.body.activityDate) : undefined,
        items: Array.isArray(req.body.items) ? req.body.items : JSON.parse(req.body.items || '[]')
      };

      const submission = await this.submissionService.createSubmission(
        submissionRequest,
        userId,
        userRole as UserRole
      );

      res.status(201).json({
        success: true,
        data: submission,
        message: 'Submission created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // ================================================
  // READ ENDPOINTS
  // ================================================

  getSubmissions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      // Parse and validate query parameters
      const queryValidation = submissionListQuerySchema.safeParse({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        filters: req.query.filters ? JSON.parse(req.query.filters as string) : undefined
      });

      if (!queryValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_QUERY',
            message: 'Invalid query parameters',
            details: queryValidation.error.issues
          }
        });
        return;
      }

      const query: SubmissionListQuery = queryValidation.data;
      const result = await this.submissionService.getSubmissions(query, userId, userRole as UserRole);

      res.json({
        success: true,
        data: result.data,
        meta: {
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getSubmissionById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const submission = await this.submissionService.getSubmissionById(id, userId, userRole as UserRole);

      res.json({
        success: true,
        data: submission
      });
    } catch (error) {
      next(error);
    }
  };

  getSubmissionByNumber = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { submissionNumber } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const submission = await this.submissionService.getSubmissionByNumber(
        submissionNumber, 
        userId, 
        userRole as UserRole
      );

      res.json({
        success: true,
        data: submission
      });
    } catch (error) {
      next(error);
    }
  };

  getUserSubmissions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      // Parse query parameters
      const queryValidation = submissionListQuerySchema.safeParse({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        filters: req.query.filters ? JSON.parse(req.query.filters as string) : undefined
      });

      if (!queryValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_QUERY',
            message: 'Invalid query parameters',
            details: queryValidation.error.issues
          }
        });
        return;
      }

      const query: SubmissionListQuery = queryValidation.data;
      const result = await this.submissionService.getUserSubmissions(userId, query);

      res.json({
        success: true,
        data: result.data,
        meta: {
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getPendingReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const submissions = await this.submissionService.getPendingReview(userRole as UserRole);

      res.json({
        success: true,
        data: submissions
      });
    } catch (error) {
      next(error);
    }
  };

  getOverdueSubmissions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const submissions = await this.submissionService.getOverdueSubmissions(userRole as UserRole);

      res.json({
        success: true,
        data: submissions
      });
    } catch (error) {
      next(error);
    }
  };

  // ================================================
  // UPDATE ENDPOINTS
  // ================================================

  updateSubmission = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const updateData = req.body;
      
      // Parse items if it's a string
      if (updateData.items && typeof updateData.items === 'string') {
        updateData.items = JSON.parse(updateData.items);
      }

      // Parse pestTypes if it's a string
      if (updateData.pestTypes && typeof updateData.pestTypes === 'string') {
        updateData.pestTypes = JSON.parse(updateData.pestTypes);
      }

      // Convert dates
      if (updateData.letterDate) {
        updateData.letterDate = new Date(updateData.letterDate);
      }
      if (updateData.activityDate) {
        updateData.activityDate = new Date(updateData.activityDate);
      }

      const submission = await this.submissionService.updateSubmission(
        id,
        updateData,
        userId,
        userRole as UserRole
      );

      res.json({
        success: true,
        data: submission,
        message: 'Submission updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  updateSubmissionStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const statusUpdate: SubmissionStatusUpdate = req.body;

      const submission = await this.submissionService.updateSubmissionStatus(
        id,
        statusUpdate,
        userId,
        userRole as UserRole
      );

      res.json({
        success: true,
        data: submission,
        message: 'Submission status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  approveSubmission = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const { approvedItems, notes } = req.body;

      const statusUpdate: SubmissionStatusUpdate = {
        status: 'APPROVED' as any,
        notes,
        approvedItems
      };

      const submission = await this.submissionService.updateSubmissionStatus(
        id,
        statusUpdate,
        userId,
        userRole as UserRole
      );

      res.json({
        success: true,
        data: submission,
        message: 'Submission approved successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  rejectSubmission = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const { reason } = req.body;

      if (!reason || reason.trim().length < 10) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATA',
            message: 'Rejection reason must be at least 10 characters'
          }
        });
        return;
      }

      const statusUpdate: SubmissionStatusUpdate = {
        status: 'REJECTED' as any,
        notes: reason
      };

      const submission = await this.submissionService.updateSubmissionStatus(
        id,
        statusUpdate,
        userId,
        userRole as UserRole
      );

      res.json({
        success: true,
        data: submission,
        message: 'Submission rejected successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  cancelSubmission = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const { reason } = req.body;

      if (!reason || reason.trim().length < 5) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATA',
            message: 'Cancellation reason must be at least 5 characters'
          }
        });
        return;
      }

      const submission = await this.submissionService.cancelSubmission(
        id,
        reason,
        userId,
        userRole as UserRole
      );

      res.json({
        success: true,
        data: submission,
        message: 'Submission cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // ================================================
  // DELETE ENDPOINTS
  // ================================================

  deleteSubmission = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const success = await this.submissionService.deleteSubmission(id, userId, userRole as UserRole);

      if (!success) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SUBMISSION_NOT_FOUND',
            message: 'Submission not found'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Submission deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // ================================================
  // STATISTICS ENDPOINTS
  // ================================================

  getSubmissionStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      // Parse filters if provided
      let filters = undefined;
      if (req.query.filters) {
        const filtersValidation = submissionFiltersSchema.safeParse(
          JSON.parse(req.query.filters as string)
        );
        
        if (!filtersValidation.success) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_FILTERS',
              message: 'Invalid filter parameters',
              details: filtersValidation.error.issues
            }
          });
          return;
        }
        
        filters = filtersValidation.data;
      }

      const stats = await this.submissionService.getSubmissionStats(filters, userRole as UserRole);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  getUserSubmissionStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const stats = await this.submissionService.getUserSubmissionStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  // ================================================
  // UTILITY ENDPOINTS
  // ================================================

  getSubmissionTypes = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      // Return allowed submission types based on user role
      let allowedTypes: string[] = [];
      
      switch (userRole as UserRole) {
        case UserRole.PPL:
          allowedTypes = ['PPL_REGULAR'];
          break;
        case UserRole.POPT:
          allowedTypes = ['POPT_EMERGENCY', 'POPT_SCHEDULED'];
          break;
        case UserRole.DINAS:
        case UserRole.ADMIN:
          allowedTypes = ['PPL_REGULAR', 'POPT_EMERGENCY', 'POPT_SCHEDULED'];
          break;
      }

      res.json({
        success: true,
        data: {
          allowedTypes,
          userRole
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
