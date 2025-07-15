// Submission status constants
export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  PARTIALLY_APPROVED: 'partially_approved',
  REJECTED: 'rejected',
  DISTRIBUTED: 'distributed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
} as const;

export type SubmissionStatus = typeof SUBMISSION_STATUS[keyof typeof SUBMISSION_STATUS];

// Submission priority constants
export const SUBMISSION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type SubmissionPriority = typeof SUBMISSION_PRIORITY[keyof typeof SUBMISSION_PRIORITY];

// Transaction type constants
export const TRANSACTION_TYPE = {
  IN: 'in',
  OUT: 'out',
  ADJUSTMENT: 'adjustment'
} as const;

export type TransactionType = typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];

// Transaction status constants
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];

// Medicine status constants
export const MEDICINE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const;

export type MedicineStatus = typeof MEDICINE_STATUS[keyof typeof MEDICINE_STATUS];

// Activity log action constants
export const ACTIVITY_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  APPROVE: 'approve',
  REJECT: 'reject',
  DISTRIBUTE: 'distribute',
  COMPLETE: 'complete'
} as const;

export type ActivityAction = typeof ACTIVITY_ACTIONS[keyof typeof ACTIVITY_ACTIONS];

// Resource type constants
export const RESOURCE_TYPES = {
  USER: 'user',
  MEDICINE: 'medicine',
  MEDICINE_STOCK: 'medicine_stock',
  SUBMISSION: 'submission',
  SUBMISSION_ITEM: 'submission_item',
  TRANSACTION: 'transaction',
  TRANSACTION_ITEM: 'transaction_item',
  ACTIVITY_LOG: 'activity_log'
} as const;

export type ResourceType = typeof RESOURCE_TYPES[keyof typeof RESOURCE_TYPES];
