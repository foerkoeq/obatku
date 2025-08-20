// ================================================
// SUBMISSION SERVICE - BUSINESS LOGIC
// ================================================

import { UserRole } from '@prisma/client';
import { SubmissionRepository } from './submissions.repository';
import { 
  SubmissionRequest,
  SubmissionResponse, 
  SubmissionFilters, 
  SubmissionListQuery,
  CreateSubmissionData,
  UpdateSubmissionData,
  SubmissionStats,
  UserSubmissionStats,
  SubmissionStatusUpdate,
  SubmissionType,
  SubmissionStatus,
  SubmissionPriority,
  POPTActivityType,
  SubmissionError,
  SubmissionErrorCode
} from './submissions.types';
import {
  createSubmissionSchema,
  updateSubmissionSchema,
  submissionStatusUpdateSchema,
  validateSubmissionTypeForRole,
  validateStatusTransition,
  validateUserCanEditSubmission,
  validateSubmissionCanBeCancelled
} from './submissions.validation';

export class SubmissionService {
  constructor(
    private submissionRepository: SubmissionRepository,
    private inventoryService: any, // Will be injected - for stock checking
    private fileService: any,      // Will be injected - for file upload
    private notificationService: any // Will be injected - for notifications
  ) {}

  // ================================================
  // CREATE OPERATIONS
  // ================================================

  async createSubmission(
    request: SubmissionRequest, 
    submitterId: string, 
    submitterRole: UserRole
  ): Promise<SubmissionResponse> {
    // Determine submission type based on role and data
    const submissionType = this.determineSubmissionType(request, submitterRole);
    
    // Validate submission type for user role
    if (!validateSubmissionTypeForRole(submissionType, submitterRole)) {
      throw this.createError(
        SubmissionErrorCode.INVALID_SUBMISSION_TYPE,
        `User role ${submitterRole} cannot create ${submissionType} submissions`
      );
    }

    // Prepare validation data
    const validationData = {
      ...request,
      submissionType
    };

    // Validate input data
    const validation = createSubmissionSchema.safeParse(validationData);
    if (!validation.success) {
      throw this.createError(
        SubmissionErrorCode.MISSING_REQUIRED_FIELDS,
        'Invalid submission data',
        validation.error.issues
      );
    }

    const validatedData = validation.data;

    // Check medicine availability
    await this.validateMedicineAvailability(validatedData.items);

    // Handle file upload for PPL submissions
    let letterFileUrl: string | undefined;
    if (submissionType === SubmissionType.PPL_REGULAR && request.letterFile) {
      letterFileUrl = await this.uploadLetterFile(request.letterFile);
    }

    // Determine priority
    const priority = this.determinePriority(submissionType, validatedData);

    // Create submission data
    const createData: CreateSubmissionData = {
      submissionType,
      district: validatedData.district,
      village: validatedData.village,
      farmerGroup: validatedData.farmerGroup,
      groupLeader: validatedData.groupLeader,
      commodity: validatedData.commodity,
      totalArea: validatedData.totalArea,
      affectedArea: validatedData.affectedArea,
      pestTypes: validatedData.pestTypes,
      // Use validated data if available, otherwise fallback to request data
      letterNumber: 'letterNumber' in validatedData ? validatedData.letterNumber : request.letterNumber,
      letterDate: 'letterDate' in validatedData ? validatedData.letterDate : request.letterDate,
      letterFileUrl,
      activityType: 'activityType' in validatedData ? validatedData.activityType : request.activityType,
      urgencyReason: 'urgencyReason' in validatedData ? validatedData.urgencyReason : request.urgencyReason,
      requestedBy: 'requestedBy' in validatedData ? validatedData.requestedBy : request.requestedBy,
      activityDate: 'activityDate' in validatedData ? validatedData.activityDate : request.activityDate,
      priority,
      submitterId,
      items: validatedData.items
    };

    // Create submission
    const submission = await this.submissionRepository.create(createData);

    // Send notification to DINAS users
    await this.notifyNewSubmission(submission);

    return submission;
  }

  // ================================================
  // READ OPERATIONS
  // ================================================

  async getSubmissionById(
    id: string, 
    userId: string, 
    userRole: UserRole
  ): Promise<SubmissionResponse> {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      throw this.createError(
        SubmissionErrorCode.SUBMISSION_NOT_FOUND,
        'Submission not found'
      );
    }

    // Check access permissions
    this.validateReadAccess(submission, userId, userRole);

    return submission;
  }

  async getSubmissionByNumber(
    submissionNumber: string, 
    userId: string, 
    userRole: UserRole
  ): Promise<SubmissionResponse> {
    const submission = await this.submissionRepository.findBySubmissionNumber(submissionNumber);
    if (!submission) {
      throw this.createError(
        SubmissionErrorCode.SUBMISSION_NOT_FOUND,
        'Submission not found'
      );
    }

    this.validateReadAccess(submission, userId, userRole);

    return submission;
  }

  async getSubmissions(
    query: SubmissionListQuery, 
    userId: string, 
    userRole: UserRole
  ): Promise<{
    data: SubmissionResponse[];
    pagination: any;
  }> {
    // Apply role-based filtering
    const filteredQuery = this.applyRoleBasedFiltering(query, userId, userRole);

    return await this.submissionRepository.findMany(filteredQuery);
  }

  async getUserSubmissions(
    userId: string, 
    query: SubmissionListQuery
  ): Promise<{
    data: SubmissionResponse[];
    pagination: any;
  }> {
    return await this.submissionRepository.findByUserId(userId, query);
  }

  async getPendingReview(userRole: UserRole): Promise<SubmissionResponse[]> {
    // Only DINAS and ADMIN can view pending reviews
    if (userRole !== UserRole.DINAS && userRole !== UserRole.ADMIN) {
      return [];
    }

    return await this.submissionRepository.findPendingReview();
  }

  async getOverdueSubmissions(userRole: UserRole): Promise<SubmissionResponse[]> {
    // Only DINAS and ADMIN can view overdue submissions
    if (userRole !== UserRole.DINAS && userRole !== UserRole.ADMIN) {
      return [];
    }

    return await this.submissionRepository.findOverdue();
  }

  // ================================================
  // UPDATE OPERATIONS
  // ================================================

  async updateSubmission(
    id: string, 
    updateData: UpdateSubmissionData, 
    userId: string, 
    userRole: UserRole
  ): Promise<SubmissionResponse> {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      throw this.createError(
        SubmissionErrorCode.SUBMISSION_NOT_FOUND,
        'Submission not found'
      );
    }

    // Validate edit permissions
    if (!validateUserCanEditSubmission(submission.submitterId, userId, userRole, submission.status)) {
      throw this.createError(
        SubmissionErrorCode.UNAUTHORIZED_ACTION,
        'You are not authorized to edit this submission'
      );
    }

    // Validate update data
    const validation = updateSubmissionSchema.safeParse(updateData);
    if (!validation.success) {
      throw this.createError(
        SubmissionErrorCode.MISSING_REQUIRED_FIELDS,
        'Invalid update data',
        validation.error.issues
      );
    }

    const validatedData = validation.data;

    // Check medicine availability if items are being updated
    if (validatedData.items) {
      await this.validateMedicineAvailability(validatedData.items);
    }

    // Update submission
    const updatedSubmission = await this.submissionRepository.update(id, validatedData);
    if (!updatedSubmission) {
      throw this.createError(
        SubmissionErrorCode.SUBMISSION_NOT_FOUND,
        'Failed to update submission'
      );
    }

    return updatedSubmission;
  }

  async updateSubmissionStatus(
    id: string, 
    statusUpdate: SubmissionStatusUpdate, 
    userId: string, 
    userRole: UserRole
  ): Promise<SubmissionResponse> {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      throw this.createError(
        SubmissionErrorCode.SUBMISSION_NOT_FOUND,
        'Submission not found'
      );
    }

    // Validate status transition
    if (!validateStatusTransition(submission.status, statusUpdate.status, userRole)) {
      throw this.createError(
        SubmissionErrorCode.INVALID_STATUS_TRANSITION,
        `Cannot transition from ${submission.status} to ${statusUpdate.status}`
      );
    }

    // Validate status update data
    const validation = submissionStatusUpdateSchema.safeParse(statusUpdate);
    if (!validation.success) {
      throw this.createError(
        SubmissionErrorCode.MISSING_REQUIRED_FIELDS,
        'Invalid status update data',
        validation.error.issues
      );
    }

    const validatedStatusUpdate = validation.data;

    // Set reviewer/distributor ID based on status
    if (validatedStatusUpdate.status === SubmissionStatus.UNDER_REVIEW || 
        validatedStatusUpdate.status === SubmissionStatus.APPROVED ||
        validatedStatusUpdate.status === SubmissionStatus.PARTIALLY_APPROVED ||
        validatedStatusUpdate.status === SubmissionStatus.REJECTED) {
      validatedStatusUpdate.reviewerId = userId;
    }

    if (validatedStatusUpdate.status === SubmissionStatus.DISTRIBUTED ||
        validatedStatusUpdate.status === SubmissionStatus.COMPLETED) {
      validatedStatusUpdate.distributorId = userId;
    }

    // Validate stock availability for approved items
    if (validatedStatusUpdate.status === SubmissionStatus.APPROVED ||
        validatedStatusUpdate.status === SubmissionStatus.PARTIALLY_APPROVED) {
      await this.validateApprovedItemsStock(validatedStatusUpdate.approvedItems || []);
    }

    // Update submission status
    const updatedSubmission = await this.submissionRepository.updateStatus(id, validatedStatusUpdate);
    if (!updatedSubmission) {
      throw this.createError(
        SubmissionErrorCode.SUBMISSION_NOT_FOUND,
        'Failed to update submission status'
      );
    }

    // Handle stock allocation for approved submissions
    if (validatedStatusUpdate.status === SubmissionStatus.APPROVED ||
        validatedStatusUpdate.status === SubmissionStatus.PARTIALLY_APPROVED) {
      await this.allocateStock(updatedSubmission, validatedStatusUpdate.approvedItems || []);
    }

    // Send notifications
    await this.notifyStatusUpdate(updatedSubmission, submission.status);

    return updatedSubmission;
  }

  async cancelSubmission(
    id: string, 
    reason: string, 
    userId: string, 
    userRole: UserRole
  ): Promise<SubmissionResponse> {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      throw this.createError(
        SubmissionErrorCode.SUBMISSION_NOT_FOUND,
        'Submission not found'
      );
    }

    // Validate cancellation permissions
    if (!validateSubmissionCanBeCancelled(submission.status)) {
      throw this.createError(
        SubmissionErrorCode.INVALID_STATUS_TRANSITION,
        'Submission cannot be cancelled in current status'
      );
    }

    // Only submitter, DINAS, or ADMIN can cancel
    if (submission.submitterId !== userId && 
        userRole !== UserRole.DINAS && 
        userRole !== UserRole.ADMIN) {
      throw this.createError(
        SubmissionErrorCode.UNAUTHORIZED_ACTION,
        'You are not authorized to cancel this submission'
      );
    }

    const statusUpdate: SubmissionStatusUpdate = {
      status: SubmissionStatus.CANCELLED,
      notes: reason,
      reviewerId: userRole === UserRole.DINAS || userRole === UserRole.ADMIN ? userId : undefined
    };

    return await this.updateSubmissionStatus(id, statusUpdate, userId, userRole);
  }

  // ================================================
  // DELETE OPERATIONS
  // ================================================

  async deleteSubmission(
    id: string, 
    userId: string, 
    userRole: UserRole
  ): Promise<boolean> {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      return false;
    }

    // Only ADMIN can delete submissions
    if (userRole !== UserRole.ADMIN) {
      throw this.createError(
        SubmissionErrorCode.UNAUTHORIZED_ACTION,
        'Only administrators can delete submissions'
      );
    }

    // Cannot delete submissions that are not in PENDING or CANCELLED status
    if (submission.status !== SubmissionStatus.PENDING && 
        submission.status !== SubmissionStatus.CANCELLED) {
      throw this.createError(
        SubmissionErrorCode.INVALID_STATUS_TRANSITION,
        'Cannot delete submission in current status'
      );
    }

    // Log the deletion action for audit trail
    console.log(`Submission ${id} deleted by user ${userId} (${userRole}) at ${new Date().toISOString()}`);

    return await this.submissionRepository.delete(id);
  }

  // ================================================
  // STATISTICS & ANALYTICS
  // ================================================

  async getSubmissionStats(
    filters?: SubmissionFilters, 
    userRole?: UserRole
  ): Promise<SubmissionStats> {
    // Apply role-based filtering for stats
    const roleBasedFilters = this.applyRoleBasedFiltering(
      { filters }, 
      '', // userId not needed for stats
      userRole || UserRole.ADMIN
    ).filters;

    return await this.submissionRepository.getSubmissionStats(roleBasedFilters);
  }

  async getUserSubmissionStats(userId: string): Promise<UserSubmissionStats> {
    return await this.submissionRepository.getUserSubmissionStats(userId);
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  private determineSubmissionType(request: SubmissionRequest, userRole: UserRole): SubmissionType {
    // PPL users can only create PPL_REGULAR submissions
    if (userRole === UserRole.PPL) {
      return SubmissionType.PPL_REGULAR;
    }

    // POPT users create POPT submissions
    if (userRole === UserRole.POPT) {
      // Determine if emergency or scheduled based on activity type and urgency
      if (request.activityType === POPTActivityType.EMERGENCY_RESPONSE ||
          request.activityType === POPTActivityType.PEST_CONTROL) {
        return SubmissionType.POPT_EMERGENCY;
      }
      return SubmissionType.POPT_SCHEDULED;
    }

    // ADMIN and DINAS can create any type - default to PPL_REGULAR if letter info provided
    if (request.letterNumber && request.letterDate) {
      return SubmissionType.PPL_REGULAR;
    }

    return SubmissionType.POPT_SCHEDULED;
  }

  private determinePriority(submissionType: SubmissionType, data: any): SubmissionPriority {
    // Emergency POPT submissions get HIGH priority
    if (submissionType === SubmissionType.POPT_EMERGENCY) {
      return SubmissionPriority.HIGH;
    }

    // Use provided priority or default to MEDIUM
    return data.priority || SubmissionPriority.MEDIUM;
  }

  private async validateMedicineAvailability(items: any[]): Promise<void> {
    for (const item of items) {
      // Check if medicine exists and is active
      const medicine = await this.inventoryService?.getMedicineById(item.medicineId);
      if (!medicine || medicine.status !== 'ACTIVE') {
        throw this.createError(
          SubmissionErrorCode.SUBMISSION_NOT_FOUND,
          `Medicine with ID ${item.medicineId} is not available`
        );
      }

      // Check if there's sufficient stock (basic check)
      const totalStock = await this.inventoryService?.getTotalStock(item.medicineId);
      if (totalStock < item.requestedQuantity) {
        throw this.createError(
          SubmissionErrorCode.INSUFFICIENT_STOCK,
          `Insufficient stock for ${medicine.name}. Available: ${totalStock}, Requested: ${item.requestedQuantity}`
        );
      }
    }
  }

  private async validateApprovedItemsStock(approvedItems: any[]): Promise<void> {
    for (const item of approvedItems) {
      const submissionItem = await this.submissionRepository.findById(item.submissionItemId);
      if (submissionItem) {
        const totalStock = await this.inventoryService?.getTotalStock(submissionItem.items[0]?.medicineId);
        if (totalStock < item.approvedQuantity) {
          throw this.createError(
            SubmissionErrorCode.INSUFFICIENT_STOCK,
            `Insufficient stock for approved quantity`
          );
        }
      }
    }
  }

  private async uploadLetterFile(file: Express.Multer.File): Promise<string> {
    try {
      const uploadResult = await this.fileService?.uploadFile(file, 'submissions/letters');
      return uploadResult.url;
    } catch (error) {
      throw this.createError(
        SubmissionErrorCode.FILE_UPLOAD_ERROR,
        'Failed to upload letter file',
        error
      );
    }
  }

  private async allocateStock(submission: SubmissionResponse, approvedItems: any[]): Promise<void> {
    // This would integrate with inventory service to allocate stock
    // Implementation depends on your inventory management system
    try {
      for (const item of approvedItems) {
        await this.inventoryService?.allocateStock(
          item.submissionItemId, 
          item.approvedQuantity,
          submission.id
        );
      }
    } catch (error) {
      // Log error but don't fail the submission
      console.error('Stock allocation error:', error);
    }
  }

  private validateReadAccess(
    submission: SubmissionResponse, 
    userId: string, 
    userRole: UserRole
  ): void {
    // ADMIN and DINAS can view any submission
    if (userRole === UserRole.ADMIN || userRole === UserRole.DINAS) {
      return;
    }

    // Users can only view their own submissions
    if (submission.submitterId !== userId) {
      throw this.createError(
        SubmissionErrorCode.UNAUTHORIZED_ACTION,
        'You are not authorized to view this submission'
      );
    }
  }

  private applyRoleBasedFiltering(
    query: SubmissionListQuery, 
    userId: string, 
    userRole: UserRole
  ): SubmissionListQuery {
    const filteredQuery = { ...query };

    // PPL and POPT can only see their own submissions
    if (userRole === UserRole.PPL || userRole === UserRole.POPT) {
      filteredQuery.filters = {
        ...filteredQuery.filters,
        submitterId: [userId]
      };
    }

    return filteredQuery;
  }

  private async notifyNewSubmission(submission: SubmissionResponse): Promise<void> {
    // Send notification to DINAS users about new submission
    try {
      await this.notificationService?.notifyNewSubmission(submission);
    } catch (error) {
      // Log error but don't fail the submission creation
      console.error('Notification error:', error);
    }
  }

  private async notifyStatusUpdate(
    submission: SubmissionResponse, 
    previousStatus: SubmissionStatus
  ): Promise<void> {
    try {
      await this.notificationService?.notifyStatusUpdate(submission, previousStatus);
    } catch (error) {
      console.error('Notification error:', error);
    }
  }

  private createError(
    code: SubmissionErrorCode, 
    message: string, 
    details?: any
  ): SubmissionError {
    return {
      code,
      message,
      details
    } as SubmissionError;
  }
}
