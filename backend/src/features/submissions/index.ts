// ================================================
// SUBMISSION FEATURE MODULE INDEX
// ================================================

export * from './submissions.types';
export * from './submissions.validation';
export * from './submissions.repository';
export * from './submissions.service';
export * from './submissions.controller';
export * from './submissions.routes';

// Re-export commonly used types for convenience
export type {
  SubmissionRequest,
  SubmissionResponse,
  SubmissionFilters,
  SubmissionListQuery,
  SubmissionStats,
  UserSubmissionStats,
  SubmissionStatusUpdate,
  CreateSubmissionData,
  UpdateSubmissionData
} from './submissions.types';

export {
  SubmissionType,
  SubmissionStatus,
  SubmissionPriority,
  POPTActivityType,
  SubmissionErrorCode
} from './submissions.types';

// Re-export validation functions
export {
  createSubmissionSchema,
  updateSubmissionSchema,
  submissionStatusUpdateSchema,
  submissionListQuerySchema,
  validateSubmissionTypeForRole,
  validateStatusTransition,
  validateUserCanEditSubmission
} from './submissions.validation';
