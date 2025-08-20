import { z } from 'zod';

// ============================================================================
// APPROVAL WORKFLOW VALIDATION SCHEMAS
// ============================================================================

// Create Approval Validation (for body only, submissionId comes from URL)
export const createApprovalBodySchema = z.object({
  action: z.enum(['approve', 'reject', 'partial_approve', 'request_revision'], {
    errorMap: () => ({ message: 'Action must be approve, reject, partial_approve, or request_revision' })
  }),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  approvedItems: z.array(z.object({
    submissionItemId: z.string().uuid('Invalid submission item ID'),
    approvedQuantity: z.number()
      .min(0, 'Approved quantity must be non-negative')
      .max(999999, 'Approved quantity too large'),
    selectedMedicineId: z.string().uuid('Invalid medicine ID').optional(),
    notes: z.string().max(500, 'Item notes cannot exceed 500 characters').optional()
  })).optional(),
  rejectionReason: z.string()
    .max(500, 'Rejection reason cannot exceed 500 characters')
    .optional(),
  requestedRevisions: z.array(z.string().max(200, 'Revision request too long'))
    .max(10, 'Maximum 10 revision requests allowed')
    .optional(),
  estimatedDeliveryDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .optional()
}).refine((data) => {
  // Validation rules based on action
  switch (data.action) {
    case 'approve':
    case 'partial_approve':
      return data.approvedItems && data.approvedItems.length > 0;
    case 'reject':
      return data.rejectionReason && data.rejectionReason.trim().length > 0;
    case 'request_revision':
      return data.requestedRevisions && data.requestedRevisions.length > 0;
    default:
      return true;
  }
}, {
  message: 'Invalid data for the specified action',
  path: ['action']
});

// Create Approval Validation (full schema including submissionId)
export const createApprovalSchema = z.object({
  submissionId: z.string().uuid('Invalid submission ID format'),
  action: z.enum(['approve', 'reject', 'partial_approve', 'request_revision'], {
    errorMap: () => ({ message: 'Action must be approve, reject, partial_approve, or request_revision' })
  }),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  approvedItems: z.array(z.object({
    submissionItemId: z.string().uuid('Invalid submission item ID'),
    approvedQuantity: z.number()
      .min(0, 'Approved quantity must be non-negative')
      .max(999999, 'Approved quantity too large'),
    selectedMedicineId: z.string().uuid('Invalid medicine ID').optional(),
    notes: z.string().max(500, 'Item notes cannot exceed 500 characters').optional()
  })).optional(),
  rejectionReason: z.string()
    .max(500, 'Rejection reason cannot exceed 500 characters')
    .optional(),
  requestedRevisions: z.array(z.string().max(200, 'Revision request too long'))
    .max(10, 'Maximum 10 revision requests allowed')
    .optional(),
  estimatedDeliveryDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .optional()
}).refine((data) => {
  // Validation rules based on action
  switch (data.action) {
    case 'approve':
    case 'partial_approve':
      return data.approvedItems && data.approvedItems.length > 0;
    case 'reject':
      return data.rejectionReason && data.rejectionReason.trim().length > 0;
    case 'request_revision':
      return data.requestedRevisions && data.requestedRevisions.length > 0;
    default:
      return true;
  }
}, {
  message: 'Invalid data for the specified action',
  path: ['action']
});

// Get Approval Queue Validation
export const getApprovalQueueSchema = z.object({
  status: z.enum(['pending', 'in_review', 'approved', 'rejected']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  district: z.string().max(100, 'District name too long').optional(),
  assignedTo: z.string().uuid('Invalid user ID').optional(),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  sortBy: z.enum(['createdAt', 'priority', 'estimatedValue', 'daysWaiting']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Get Recommendation Validation (for query params only, submissionId comes from URL)
export const getRecommendationQuerySchema = z.object({
  includeAlternatives: z.coerce.boolean().default(true),
  maxAlternatives: z.coerce.number().int().min(1).max(10).default(3),
  riskTolerance: z.enum(['low', 'medium', 'high']).default('medium')
});

// Get Recommendation Validation (full schema including submissionId)
export const getRecommendationSchema = z.object({
  submissionId: z.string().uuid('Invalid submission ID format'),
  includeAlternatives: z.coerce.boolean().default(true),
  maxAlternatives: z.coerce.number().int().min(1).max(10).default(3),
  riskTolerance: z.enum(['low', 'medium', 'high']).default('medium')
});

// Assign Approval Validation (for body only, submissionId comes from URL)
export const assignApprovalBodySchema = z.object({
  assignedTo: z.string().uuid('Invalid user ID'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  deadline: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid deadline format')
    .optional(),
  notes: z.string().max(500, 'Assignment notes cannot exceed 500 characters').optional()
});

// Assign Approval Validation (full schema including submissionId)
export const assignApprovalSchema = z.object({
  submissionId: z.string().uuid('Invalid submission ID'),
  assignedTo: z.string().uuid('Invalid user ID'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  deadline: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid deadline format')
    .optional(),
  notes: z.string().max(500, 'Assignment notes cannot exceed 500 characters').optional()
});

// Update Approval Priority Validation (for body only, submissionId comes from URL)
export const updatePriorityBodySchema = z.object({
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  reason: z.string().max(300, 'Priority change reason cannot exceed 300 characters').optional()
});

// Update Approval Priority Validation (full schema including submissionId)
export const updatePrioritySchema = z.object({
  submissionId: z.string().uuid('Invalid submission ID'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  reason: z.string().max(300, 'Priority change reason cannot exceed 300 characters').optional()
});

// Bulk Approval Validation
export const bulkApprovalSchema = z.object({
  submissionIds: z.array(z.string().uuid('Invalid submission ID'))
    .min(1, 'At least one submission required')
    .max(50, 'Maximum 50 submissions allowed in bulk operation'),
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(500, 'Bulk notes cannot exceed 500 characters').optional(),
  rejectionReason: z.string()
    .max(300, 'Bulk rejection reason cannot exceed 300 characters')
    .optional()
}).refine((data) => {
  if (data.action === 'reject') {
    return data.rejectionReason && data.rejectionReason.trim().length > 0;
  }
  return true;
}, {
  message: 'Rejection reason is required for bulk rejection',
  path: ['rejectionReason']
});

// Medicine Selection Validation (for recommendation response)
export const medicineSelectionSchema = z.object({
  submissionItemId: z.string().uuid('Invalid submission item ID'),
  selectedMedicineId: z.string().uuid('Invalid medicine ID'),
  selectedStockId: z.string().uuid('Invalid stock ID'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().max(300, 'Selection notes cannot exceed 300 characters').optional()
});

// Approval History Filter Validation
export const approvalHistorySchema = z.object({
  submissionId: z.string().uuid('Invalid submission ID').optional(),
  approverId: z.string().uuid('Invalid approver ID').optional(),
  action: z.enum(['approve', 'reject', 'request_revision', 'partial_approve']).optional(),
  startDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid start date format')
    .optional(),
  endDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid end date format')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  }
  return true;
}, {
  message: 'Start date must be before or equal to end date',
  path: ['startDate']
});

// Statistics Query Validation
export const statisticsQuerySchema = z.object({
  startDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid start date format')
    .optional(),
  endDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid end date format')
    .optional(),
  district: z.string().max(100, 'District name too long').optional(),
  approverId: z.string().uuid('Invalid approver ID').optional(),
  includeDetails: z.coerce.boolean().default(false)
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 365; // Maximum 1 year range
  }
  return true;
}, {
  message: 'Date range cannot exceed 365 days',
  path: ['startDate']
});

// Common validation helpers
export const validateApprovalPermission = (userRole: string): boolean => {
  const allowedRoles = ['dinas', 'admin', 'supervisor'];
  return allowedRoles.includes(userRole.toLowerCase());
};

export const validateApprovalQuantity = (
  requestedQuantity: number,
  availableStock: number,
  approvedQuantity: number
): { valid: boolean; message?: string } => {
  if (approvedQuantity < 0) {
    return { valid: false, message: 'Approved quantity cannot be negative' };
  }
  
  if (approvedQuantity > requestedQuantity) {
    return { valid: false, message: 'Approved quantity cannot exceed requested quantity' };
  }
  
  if (approvedQuantity > availableStock) {
    return { valid: false, message: 'Approved quantity exceeds available stock' };
  }
  
  return { valid: true };
};

export const validateDeadline = (deadline: Date): { valid: boolean; message?: string } => {
  const now = new Date();
  const minDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  const maxDeadline = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
  
  if (deadline < minDeadline) {
    return { valid: false, message: 'Deadline must be at least 24 hours in the future' };
  }
  
  if (deadline > maxDeadline) {
    return { valid: false, message: 'Deadline cannot be more than 90 days in the future' };
  }
  
  return { valid: true };
};

// Export validation middleware helpers
export const validateSchema = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse({
        ...req.body,
        ...req.query,
        ...req.params
      });
      
      req.validated = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

export type CreateApprovalInput = z.infer<typeof createApprovalSchema>;
export type CreateApprovalBodyInput = z.infer<typeof createApprovalBodySchema>;
export type GetApprovalQueueInput = z.infer<typeof getApprovalQueueSchema>;
export type GetRecommendationInput = z.infer<typeof getRecommendationSchema>;
export type GetRecommendationQueryInput = z.infer<typeof getRecommendationQuerySchema>;
export type AssignApprovalInput = z.infer<typeof assignApprovalSchema>;
export type AssignApprovalBodyInput = z.infer<typeof assignApprovalBodySchema>;
export type UpdatePriorityInput = z.infer<typeof updatePrioritySchema>;
export type UpdatePriorityBodyInput = z.infer<typeof updatePriorityBodySchema>;
export type BulkApprovalInput = z.infer<typeof bulkApprovalSchema>;
export type MedicineSelectionInput = z.infer<typeof medicineSelectionSchema>;
export type ApprovalHistoryInput = z.infer<typeof approvalHistorySchema>;
export type StatisticsQueryInput = z.infer<typeof statisticsQuerySchema>;
