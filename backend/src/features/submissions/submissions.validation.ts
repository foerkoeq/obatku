// ================================================
// SUBMISSION VALIDATION SCHEMAS
// ================================================

import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { 
  SubmissionType, 
  SubmissionStatus, 
  SubmissionPriority, 
  POPTActivityType 
} from './submissions.types';

// ================================================
// BASE SCHEMAS
// ================================================

export const submissionItemSchema = z.object({
  medicineId: z.string().uuid('Medicine ID must be a valid UUID'),
  requestedQuantity: z.number()
    .positive('Requested quantity must be positive')
    .max(99999, 'Requested quantity cannot exceed 99,999'),
  unit: z.string()
    .min(1, 'Unit is required')
    .max(50, 'Unit cannot exceed 50 characters'),
  notes: z.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
});

export const baseSubmissionSchema = z.object({
  district: z.string()
    .min(1, 'District is required')
    .max(100, 'District cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s.-]+$/, 'District contains invalid characters'),
  
  village: z.string()
    .min(1, 'Village is required')
    .max(100, 'Village cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s.-]+$/, 'Village contains invalid characters'),
  
  farmerGroup: z.string()
    .min(1, 'Farmer group is required')
    .max(255, 'Farmer group cannot exceed 255 characters'),
  
  groupLeader: z.string()
    .min(1, 'Group leader is required')
    .max(255, 'Group leader cannot exceed 255 characters')
    .regex(/^[a-zA-Z\s.-]+$/, 'Group leader name contains invalid characters'),
  
  commodity: z.string()
    .min(1, 'Commodity is required')
    .max(255, 'Commodity cannot exceed 255 characters'),
  
  totalArea: z.number()
    .positive('Total area must be positive')
    .max(99999.99, 'Total area cannot exceed 99,999.99 hectares'),
  
  affectedArea: z.number()
    .positive('Affected area must be positive')
    .max(99999.99, 'Affected area cannot exceed 99,999.99 hectares'),
  
  pestTypes: z.array(z.string().min(1, 'Pest type cannot be empty'))
    .min(1, 'At least one pest type is required')
    .max(10, 'Cannot have more than 10 pest types'),
  
  items: z.array(submissionItemSchema)
    .min(1, 'At least one medicine item is required')
    .max(20, 'Cannot request more than 20 different medicines')
})
.refine(data => data.affectedArea <= data.totalArea, {
  message: 'Affected area cannot be greater than total area',
  path: ['affectedArea']
});

// ================================================
// PPL SUBMISSION SCHEMAS
// ================================================

export const pplSubmissionSchema = baseSubmissionSchema.extend({
  submissionType: z.literal(SubmissionType.PPL_REGULAR),
  
  letterNumber: z.string()
    .min(1, 'Letter number is required for PPL submissions')
    .max(100, 'Letter number cannot exceed 100 characters')
    .regex(/^[A-Z0-9\/\-\.]+$/i, 'Invalid letter number format'),
  
  letterDate: z.coerce.date()
    .refine(date => date <= new Date(), {
      message: 'Letter date cannot be in the future'
    })
    .refine(date => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return date >= sixMonthsAgo;
    }, {
      message: 'Letter date cannot be older than 6 months'
    }),
  
  priority: z.nativeEnum(SubmissionPriority).default(SubmissionPriority.MEDIUM)
});

// ================================================
// POPT SUBMISSION SCHEMAS
// ================================================

export const poptSubmissionSchema = baseSubmissionSchema.extend({
  submissionType: z.enum([SubmissionType.POPT_EMERGENCY, SubmissionType.POPT_SCHEDULED]),
  
  activityType: z.nativeEnum(POPTActivityType, {
    required_error: 'Activity type is required for POPT submissions'
  }),
  
  urgencyReason: z.string()
    .min(10, 'Urgency reason must be at least 10 characters')
    .max(1000, 'Urgency reason cannot exceed 1000 characters'),
  
  requestedBy: z.string()
    .min(1, 'Requested by field is required')
    .max(255, 'Requested by cannot exceed 255 characters')
    .optional(),
  
  activityDate: z.coerce.date()
    .refine(date => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return date >= threeDaysAgo;
    }, {
      message: 'Activity date cannot be more than 3 days in the past'
    })
    .refine(date => {
      const oneMonthAhead = new Date();
      oneMonthAhead.setMonth(oneMonthAhead.getMonth() + 1);
      return date <= oneMonthAhead;
    }, {
      message: 'Activity date cannot be more than 1 month in the future'
    }),
  
  // Override priority logic for POPT
  priority: z.nativeEnum(SubmissionPriority)
    .transform(priority => {
      // Auto-set priority based on activity type if not provided
      return priority;
    })
});

// Emergency POPT should have higher priority
export const poptEmergencySubmissionSchema = poptSubmissionSchema
  .extend({
    submissionType: z.literal(SubmissionType.POPT_EMERGENCY),
    priority: z.nativeEnum(SubmissionPriority)
      .default(SubmissionPriority.HIGH)
      .transform(priority => {
        // Emergency activities should be at least HIGH priority
        if (priority === SubmissionPriority.LOW || priority === SubmissionPriority.MEDIUM) {
          return SubmissionPriority.HIGH;
        }
        return priority;
      })
  });

// ================================================
// DYNAMIC SUBMISSION CREATION SCHEMA
// ================================================

export const createSubmissionSchema = z.discriminatedUnion('submissionType', [
  pplSubmissionSchema,
  poptEmergencySubmissionSchema,
  poptSubmissionSchema.extend({
    submissionType: z.literal(SubmissionType.POPT_SCHEDULED),
    priority: z.nativeEnum(SubmissionPriority).default(SubmissionPriority.MEDIUM)
  })
]);

// ================================================
// UPDATE SCHEMAS
// ================================================

export const updateSubmissionSchema = z.object({
  district: z.string().min(1).max(100).optional(),
  village: z.string().min(1).max(100).optional(),
  farmerGroup: z.string().min(1).max(255).optional(),
  groupLeader: z.string().min(1).max(255).optional(),
  commodity: z.string().min(1).max(255).optional(),
  totalArea: z.number().positive().max(99999.99).optional(),
  affectedArea: z.number().positive().max(99999.99).optional(),
  pestTypes: z.array(z.string().min(1)).min(1).max(10).optional(),
  letterNumber: z.string().min(1).max(100).optional(),
  letterDate: z.coerce.date().optional(),
  activityType: z.nativeEnum(POPTActivityType).optional(),
  urgencyReason: z.string().min(10).max(1000).optional(),
  requestedBy: z.string().min(1).max(255).optional(),
  activityDate: z.coerce.date().optional(),
  priority: z.nativeEnum(SubmissionPriority).optional(),
  items: z.array(submissionItemSchema).min(1).max(20).optional()
})
.refine(data => {
  if (data.totalArea && data.affectedArea) {
    return data.affectedArea <= data.totalArea;
  }
  return true;
}, {
  message: 'Affected area cannot be greater than total area',
  path: ['affectedArea']
});

// ================================================
// STATUS UPDATE SCHEMAS
// ================================================

export const approvedItemUpdateSchema = z.object({
  submissionItemId: z.string().uuid('Submission item ID must be a valid UUID'),
  approvedQuantity: z.number()
    .min(0, 'Approved quantity cannot be negative')
    .max(99999, 'Approved quantity cannot exceed 99,999'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
});

export const submissionStatusUpdateSchema = z.object({
  status: z.nativeEnum(SubmissionStatus),
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
  reviewerId: z.string().uuid().optional(),
  distributorId: z.string().uuid().optional(),
  approvedItems: z.array(approvedItemUpdateSchema).optional()
})
.refine(data => {
  // Require reviewer notes for rejection
  if (data.status === SubmissionStatus.REJECTED) {
    return data.notes && data.notes.trim().length >= 10;
  }
  return true;
}, {
  message: 'Rejection reason must be at least 10 characters',
  path: ['notes']
})
.refine(data => {
  // Require approved items for approval/partial approval
  if (data.status === SubmissionStatus.APPROVED || data.status === SubmissionStatus.PARTIALLY_APPROVED) {
    return data.approvedItems && data.approvedItems.length > 0;
  }
  return true;
}, {
  message: 'Approved items are required for approval',
  path: ['approvedItems']
});

// ================================================
// QUERY SCHEMAS
// ================================================

export const submissionFiltersSchema = z.object({
  status: z.array(z.nativeEnum(SubmissionStatus)).optional(),
  submissionType: z.array(z.nativeEnum(SubmissionType)).optional(),
  priority: z.array(z.nativeEnum(SubmissionPriority)).optional(),
  district: z.array(z.string()).optional(),
  village: z.array(z.string()).optional(),
  submitterId: z.array(z.string().uuid()).optional(),
  reviewerId: z.array(z.string().uuid()).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().max(255).optional()
})
.refine(data => {
  if (data.dateFrom && data.dateTo) {
    return data.dateFrom <= data.dateTo;
  }
  return true;
}, {
  message: 'Date from cannot be greater than date to',
  path: ['dateFrom']
});

export const submissionListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  filters: submissionFiltersSchema.optional()
});

// ================================================
// FILE UPLOAD SCHEMAS
// ================================================

export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  originalName: z.string().min(1, 'Original name is required'),
  mimetype: z.string()
    .refine(mimetype => ['image/jpeg', 'image/png', 'application/pdf'].includes(mimetype), {
      message: 'Only JPEG, PNG, and PDF files are allowed'
    }),
  size: z.number()
    .max(5 * 1024 * 1024, 'File size cannot exceed 5MB')
});

// ================================================
// ROLE-BASED VALIDATION
// ================================================

export const validateSubmissionTypeForRole = (submissionType: SubmissionType, userRole: UserRole): boolean => {
  switch (userRole) {
    case UserRole.PPL:
      return submissionType === SubmissionType.PPL_REGULAR;
    case UserRole.POPT:
      return submissionType === SubmissionType.POPT_EMERGENCY || submissionType === SubmissionType.POPT_SCHEDULED;
    case UserRole.ADMIN:
    case UserRole.DINAS:
      return true; // Can create any type
    default:
      return false;
  }
};

export const validateStatusTransition = (
  currentStatus: SubmissionStatus, 
  newStatus: SubmissionStatus, 
  userRole: UserRole
): boolean => {
  const transitions: Record<SubmissionStatus, { allowed: SubmissionStatus[], roles: UserRole[] }> = {
    [SubmissionStatus.PENDING]: {
      allowed: [SubmissionStatus.UNDER_REVIEW, SubmissionStatus.CANCELLED],
      roles: [UserRole.DINAS, UserRole.ADMIN]
    },
    [SubmissionStatus.UNDER_REVIEW]: {
      allowed: [SubmissionStatus.APPROVED, SubmissionStatus.PARTIALLY_APPROVED, SubmissionStatus.REJECTED],
      roles: [UserRole.DINAS, UserRole.ADMIN]
    },
    [SubmissionStatus.APPROVED]: {
      allowed: [SubmissionStatus.DISTRIBUTED],
      roles: [UserRole.DINAS, UserRole.ADMIN, UserRole.POPT]
    },
    [SubmissionStatus.PARTIALLY_APPROVED]: {
      allowed: [SubmissionStatus.DISTRIBUTED],
      roles: [UserRole.DINAS, UserRole.ADMIN, UserRole.POPT]
    },
    [SubmissionStatus.DISTRIBUTED]: {
      allowed: [SubmissionStatus.COMPLETED],
      roles: [UserRole.DINAS, UserRole.ADMIN, UserRole.POPT]
    },
    [SubmissionStatus.REJECTED]: {
      allowed: [], // Final status
      roles: []
    },
    [SubmissionStatus.COMPLETED]: {
      allowed: [], // Final status
      roles: []
    },
    [SubmissionStatus.CANCELLED]: {
      allowed: [], // Final status
      roles: []
    },
    [SubmissionStatus.EXPIRED]: {
      allowed: [], // Final status
      roles: []
    }
  };

  const transition = transitions[currentStatus];
  return transition.allowed.includes(newStatus) && transition.roles.includes(userRole);
};

// ================================================
// UTILITY VALIDATION FUNCTIONS
// ================================================

export const validateSubmissionCanBeEdited = (status: SubmissionStatus): boolean => {
  return [
    SubmissionStatus.PENDING,
    SubmissionStatus.UNDER_REVIEW
  ].includes(status);
};

export const validateSubmissionCanBeCancelled = (status: SubmissionStatus): boolean => {
  return [
    SubmissionStatus.PENDING,
    SubmissionStatus.UNDER_REVIEW
  ].includes(status);
};

export const validateUserCanEditSubmission = (
  submitterId: string, 
  currentUserId: string, 
  userRole: UserRole,
  status: SubmissionStatus
): boolean => {
  // Admin and DINAS can edit any submission
  if (userRole === UserRole.ADMIN || userRole === UserRole.DINAS) {
    return validateSubmissionCanBeEdited(status);
  }
  
  // Submitter can only edit their own pending submissions
  if (submitterId === currentUserId) {
    return status === SubmissionStatus.PENDING;
  }
  
  return false;
};
