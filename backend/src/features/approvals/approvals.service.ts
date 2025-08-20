import { ApprovalsRepository } from './approvals.repository';
import { RecommendationEngine } from './recommendation.engine';
import {
  ApprovalStatistics,
  CreateApprovalRequest,
  GetApprovalQueueRequest,
  GetRecommendationRequest,
  ApprovalResponse
} from './approvals.types';

// ============================================================================
// APPROVAL WORKFLOW SERVICE - BUSINESS LOGIC LAYER
// ============================================================================

export class ApprovalsService {
  constructor(
    private repository: ApprovalsRepository,
    private recommendationEngine: RecommendationEngine
  ) {}

  // ==================== APPROVAL QUEUE MANAGEMENT ====================

  /**
   * Get approval queue with filtering and pagination
   */
  async getApprovalQueue(params: GetApprovalQueueRequest) {
    try {
      const result = await this.repository.getApprovalQueue(params);
      
      // Calculate summary statistics
      const summary = {
        totalPending: result.approvals.filter(a => a.status === 'pending').length,
        totalValue: result.approvals.reduce((sum, a) => sum + a.estimatedValue, 0),
        urgentCount: result.approvals.filter(a => a.priority === 'urgent').length,
        overdueCount: result.approvals.filter(a => a.daysWaiting > 7).length
      };

      return {
        success: true,
        data: {
          approvals: result.approvals,
          pagination: {
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalItems: result.totalCount,
            itemsPerPage: params.limit || 20
          },
          summary
        }
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to get approval queue']
      };
    }
  }

  /**
   * Get detailed submission for approval review
   */
  async getSubmissionForApproval(submissionId: string, userId: string) {
    try {
      // Verify user has approval permissions
      if (!this.hasApprovalPermission(userId)) {
        throw new Error('Insufficient permissions for approval operations');
      }

      const submission = await this.repository.getSubmissionForApproval(submissionId);
      
      if (!submission) {
        throw new Error('Submission not found');
      }

      if (!this.canApproveSubmission(submission.status)) {
        throw new Error(`Cannot approve submission with status: ${submission.status}`);
      }

      return {
        success: true,
        data: submission
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to get submission details']
      };
    }
  }

  // ==================== APPROVAL ACTIONS ====================

  /**
   * Process approval decision (approve/reject/partial approve)
   */
  async processApproval(approvalData: CreateApprovalRequest, approverId: string): Promise<ApprovalResponse> {
    try {
      // Verify user permissions
      if (!this.hasApprovalPermission(approverId)) {
        throw new Error('Insufficient permissions for approval operations');
      }

      // Validate approval data
      await this.validateApprovalData(approvalData);

      // Get submission details for validation
      const submission = await this.repository.getSubmissionForApproval(approvalData.submissionId);
      if (!submission) {
        throw new Error('Submission not found');
      }

      // Validate submission status
      if (!this.canApproveSubmission(submission.status)) {
        throw new Error(`Cannot approve submission with status: ${submission.status}`);
      }

      // For approvals, validate quantities and stock availability
      if (approvalData.action === 'approve' || approvalData.action === 'partial_approve') {
        await this.validateApprovalQuantities(approvalData, submission);
      }

      // Process the approval
      const result = await this.repository.createApproval(approvalData, approverId);

      // Calculate estimated value for approved items
      let estimatedValue = 0;
      if (approvalData.approvedItems) {
        for (const item of approvalData.approvedItems) {
          const submissionItem = submission.items.find((si: any) => si.id === item.submissionItemId);
          if (submissionItem) {
            estimatedValue += item.approvedQuantity * (Number(submissionItem.medicine.pricePerUnit) || 0);
          }
        }
      }

      // Trigger post-approval processes
      await this.handlePostApprovalProcesses(approvalData, submission, approverId);

      return {
        success: true,
        message: this.getApprovalSuccessMessage(approvalData.action),
        data: {
          ...result,
          estimatedValue
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Approval processing failed',
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  /**
   * Generate smart recommendations for submission approval
   */
  async getApprovalRecommendations(params: GetRecommendationRequest, userId: string) {
    try {
      // Verify user permissions
      if (!this.hasApprovalPermission(userId)) {
        throw new Error('Insufficient permissions for approval operations');
      }

      const recommendations = await this.recommendationEngine.generateRecommendations(
        params.submissionId,
        {
          includeAlternatives: params.includeAlternatives,
          maxAlternatives: params.maxAlternatives,
          riskTolerance: params.riskTolerance
        }
      );

      return {
        success: true,
        data: recommendations
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to generate recommendations']
      };
    }
  }

  /**
   * Assign approval to specific user
   */
  async assignApproval(submissionId: string, assignedTo: string, assignedBy: string) {
    try {
      // Verify assigner permissions
      if (!this.hasApprovalPermission(assignedBy)) {
        throw new Error('Insufficient permissions to assign approvals');
      }

      // Verify assignee permissions
      if (!this.hasApprovalPermission(assignedTo)) {
        throw new Error('Cannot assign to user without approval permissions');
      }

      const result = await this.repository.assignApproval(submissionId, assignedTo);

      return {
        success: true,
        message: 'Approval assigned successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to assign approval']
      };
    }
  }

  /**
   * Update approval priority
   */
  async updatePriority(submissionId: string, priority: string, updatedBy: string, reason?: string) {
    try {
      if (!this.hasApprovalPermission(updatedBy)) {
        throw new Error('Insufficient permissions to update priority');
      }

      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        throw new Error('Invalid priority level');
      }

      const result = await this.repository.updateApprovalPriority(
        submissionId, priority, updatedBy, reason
      );

      return {
        success: true,
        message: 'Priority updated successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to update priority']
      };
    }
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Process bulk approvals/rejections
   */
  async processBulkApproval(
    submissionIds: string[],
    action: 'approve' | 'reject',
    approverId: string,
    notes?: string,
    rejectionReason?: string
  ) {
    try {
      if (!this.hasApprovalPermission(approverId)) {
        throw new Error('Insufficient permissions for bulk approval operations');
      }

      if (submissionIds.length === 0) {
        throw new Error('No submissions provided for bulk operation');
      }

      if (submissionIds.length > 50) {
        throw new Error('Maximum 50 submissions allowed in bulk operation');
      }

      const results = await this.repository.bulkApproval(
        submissionIds, action, approverId, notes, rejectionReason
      );

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      return {
        success: true,
        message: `Bulk ${action} completed: ${successCount} successful, ${failureCount} failed`,
        data: {
          results,
          summary: {
            total: submissionIds.length,
            successful: successCount,
            failed: failureCount
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Bulk approval operation failed']
      };
    }
  }

  // ==================== HISTORY AND STATISTICS ====================

  /**
   * Get approval history
   */
  async getApprovalHistory(submissionId?: string, approverId?: string, limit: number = 50) {
    try {
      const history = await this.repository.getApprovalHistory(submissionId, approverId, limit);
      
      return {
        success: true,
        data: history
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to get approval history']
      };
    }
  }

  /**
   * Get approval statistics
   */
  async getApprovalStatistics(
    startDate?: Date,
    endDate?: Date,
    district?: string
  ): Promise<{ success: boolean; data?: ApprovalStatistics; errors?: string[] }> {
    try {
      const stats = await this.repository.getApprovalStatistics(startDate, endDate, district);
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to get approval statistics']
      };
    }
  }

  // ==================== VALIDATION HELPERS ====================

  private async validateApprovalData(approvalData: CreateApprovalRequest) {
    // Validate required fields based on action
    switch (approvalData.action) {
      case 'approve':
      case 'partial_approve':
        if (!approvalData.approvedItems || approvalData.approvedItems.length === 0) {
          throw new Error('Approved items are required for approval actions');
        }
        break;
      
      case 'reject':
        if (!approvalData.rejectionReason?.trim()) {
          throw new Error('Rejection reason is required for rejection');
        }
        break;
      
      case 'request_revision':
        if (!approvalData.requestedRevisions || approvalData.requestedRevisions.length === 0) {
          throw new Error('Revision requests are required for revision action');
        }
        break;
    }
  }

  private async validateApprovalQuantities(approvalData: CreateApprovalRequest, submission: any) {
    if (!approvalData.approvedItems) return;

    for (const approvedItem of approvalData.approvedItems) {
      const submissionItem = submission.items.find(
        (si: any) => si.id === approvedItem.submissionItemId
      );

      if (!submissionItem) {
        throw new Error(`Submission item ${approvedItem.submissionItemId} not found`);
      }

      // Validate approved quantity doesn't exceed requested
      if (approvedItem.approvedQuantity > submissionItem.requestedQuantity) {
        throw new Error(
          `Approved quantity (${approvedItem.approvedQuantity}) cannot exceed requested quantity (${submissionItem.requestedQuantity}) for ${submissionItem.medicine.name}`
        );
      }

      // Validate stock availability
      const availableStock = submissionItem.medicine.stocks.reduce(
        (sum: number, stock: any) => sum + Number(stock.currentStock), 0
      );

      if (approvedItem.approvedQuantity > availableStock) {
        throw new Error(
          `Approved quantity (${approvedItem.approvedQuantity}) exceeds available stock (${availableStock}) for ${submissionItem.medicine.name}`
        );
      }
    }
  }

  private async handlePostApprovalProcesses(
    approvalData: CreateApprovalRequest,
    submission: any,
    approverId: string
  ) {
    try {
      // Handle different post-approval processes based on action
      switch (approvalData.action) {
        case 'approve':
          await this.handleFullApproval(submission, approverId);
          break;
        
        case 'partial_approve':
          await this.handlePartialApproval(submission, approvalData.approvedItems!, approverId);
          break;
        
        case 'reject':
          await this.handleRejection(submission, approvalData.rejectionReason!, approverId);
          break;
        
        case 'request_revision':
          await this.handleRevisionRequest(submission, approvalData.requestedRevisions!, approverId);
          break;
      }
    } catch (error) {
      // Log error but don't fail the main approval process
      console.error('Post-approval process error:', error);
    }
  }

  private async handleFullApproval(submission: any, approverId: string) {
    // TODO: Implement notification system
    // TODO: Reserve stock for approved items
    // TODO: Generate distribution tasks
    console.log(`Full approval processed for submission ${submission.id} by ${approverId}`);
  }

  private async handlePartialApproval(submission: any, _approvedItems: any[], approverId: string) {
    // TODO: Handle partial approval logic
    console.log(`Partial approval processed for submission ${submission.id} by ${approverId}`);
  }

  private async handleRejection(submission: any, reason: string, approverId: string) {
    // TODO: Send rejection notification
    console.log(`Rejection processed for submission ${submission.id} by ${approverId}: ${reason}`);
  }

  private async handleRevisionRequest(submission: any, _revisions: string[], approverId: string) {
    // TODO: Send revision request notification
    console.log(`Revision request sent for submission ${submission.id} by ${approverId}`);
  }

  // ==================== PERMISSION HELPERS ====================

  private hasApprovalPermission(_userId: string): boolean {
    // TODO: Implement proper permission check with user service
    // For now, assume all users with dinas role have approval permissions
    return true; // Placeholder
  }

  private canApproveSubmission(status: string): boolean {
    const approvableStatuses = ['pending', 'under_review'];
    return approvableStatuses.includes(status);
  }

  private getApprovalSuccessMessage(action: string): string {
    const messages: Record<string, string> = {
      'approve': 'Submission approved successfully',
      'partial_approve': 'Submission partially approved successfully',
      'reject': 'Submission rejected successfully',
      'request_revision': 'Revision request sent successfully'
    };

    return messages[action] || 'Approval action completed successfully';
  }
}
