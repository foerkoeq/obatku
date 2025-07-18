// ================================================
// SUBMISSION SYSTEM TYPES
// ================================================

import { UserRole } from '@prisma/client';

// ================================================
// SUBMISSION TYPES
// ================================================

export interface SubmissionRequest {
  district: string;
  village: string;
  farmerGroup: string;
  groupLeader: string;
  commodity: string;
  totalArea: number;
  affectedArea: number;
  pestTypes: string[];
  
  // For PPL submissions (required)
  letterNumber?: string;
  letterDate?: Date;
  letterFile?: Express.Multer.File;
  
  // For POPT submissions (additional info)
  activityType?: POPTActivityType;
  urgencyReason?: string;
  requestedBy?: string; // Atasan yang memerintahkan
  activityDate?: Date;
  
  // Common items
  items: SubmissionItemRequest[];
}

export interface SubmissionItemRequest {
  medicineId: string;
  requestedQuantity: number;
  unit: string;
  notes?: string;
}

export interface SubmissionResponse {
  id: string;
  submissionNumber: string;
  submissionType: SubmissionType;
  district: string;
  village: string;
  farmerGroup: string;
  groupLeader: string;
  commodity: string;
  totalArea: number;
  affectedArea: number;
  pestTypes: string[];
  
  // PPL specific
  letterNumber?: string;
  letterDate?: Date;
  letterFileUrl?: string;
  
  // POPT specific
  activityType?: POPTActivityType;
  urgencyReason?: string;
  requestedBy?: string;
  activityDate?: Date;
  
  status: SubmissionStatus;
  priority: SubmissionPriority;
  
  submitterId: string;
  submitter: {
    id: string;
    name: string;
    role: UserRole;
    nip: string;
  };
  
  reviewerId?: string;
  reviewer?: {
    id: string;
    name: string;
    role: UserRole;
  };
  
  reviewedAt?: Date;
  reviewerNotes?: string;
  
  distributorId?: string;
  distributor?: {
    id: string;
    name: string;
    role: UserRole;
  };
  
  distributedAt?: Date;
  completionNotes?: string;
  
  items: SubmissionItemResponse[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionItemResponse {
  id: string;
  medicineId: string;
  medicine: {
    id: string;
    name: string;
    producer?: string;
    category: string;
    unit: string;
  };
  requestedQuantity: number;
  approvedQuantity: number;
  distributedQuantity: number;
  unit: string;
  notes?: string;
  createdAt: Date;
}

// ================================================
// SUBMISSION ENUMS
// ================================================

export enum SubmissionType {
  PPL_REGULAR = 'PPL_REGULAR',           // PPL dengan surat rekomendasi
  POPT_EMERGENCY = 'POPT_EMERGENCY',     // POPT untuk kegiatan mendesak
  POPT_SCHEDULED = 'POPT_SCHEDULED'      // POPT untuk kegiatan terjadwal
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
  REJECTED = 'REJECTED',
  DISTRIBUTED = 'DISTRIBUTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum SubmissionPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum POPTActivityType {
  PEST_CONTROL = 'PEST_CONTROL',           // Kegiatan basmi hama
  SURVEILLANCE = 'SURVEILLANCE',           // Pengawasan/monitoring
  EMERGENCY_RESPONSE = 'EMERGENCY_RESPONSE', // Respons darurat
  TRAINING_DEMO = 'TRAINING_DEMO',         // Pelatihan/demo
  FIELD_INSPECTION = 'FIELD_INSPECTION'    // Inspeksi lapangan
}

// ================================================
// WORKFLOW TYPES
// ================================================

export interface SubmissionWorkflow {
  currentStatus: SubmissionStatus;
  allowedTransitions: SubmissionStatus[];
  requiredRole: UserRole[];
  requiredFields?: string[];
}

export interface SubmissionStatusUpdate {
  status: SubmissionStatus;
  notes?: string;
  reviewerId?: string;
  distributorId?: string;
  approvedItems?: ApprovedItemUpdate[];
}

export interface ApprovedItemUpdate {
  submissionItemId: string;
  approvedQuantity: number;
  notes?: string;
}

// ================================================
// FILTER & SEARCH TYPES
// ================================================

export interface SubmissionFilters {
  status?: SubmissionStatus[];
  submissionType?: SubmissionType[];
  priority?: SubmissionPriority[];
  district?: string[];
  village?: string[];
  submitterId?: string[];
  reviewerId?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string; // Search in submission number, district, village, farmer group
}

export interface SubmissionListQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  filters?: SubmissionFilters;
}

// ================================================
// STATISTICS TYPES
// ================================================

export interface SubmissionStats {
  total: number;
  byStatus: Record<SubmissionStatus, number>;
  byType: Record<SubmissionType, number>;
  byPriority: Record<SubmissionPriority, number>;
  byMonth: Array<{
    month: string;
    year: number;
    count: number;
  }>;
  pendingReview: number;
  overdue: number;
  averageProcessingTime: number; // in hours
}

export interface UserSubmissionStats {
  submitted: number;
  approved: number;
  rejected: number;
  pending: number;
  thisMonth: number;
  avgApprovalTime: number; // in hours
}

// ================================================
// FILE UPLOAD TYPES
// ================================================

export interface FileUploadConfig {
  allowedTypes: string[];
  maxFileSize: number;
  maxFiles: number;
  uploadPath: string;
}

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

// ================================================
// NOTIFICATION TYPES
// ================================================

export interface SubmissionNotification {
  type: 'EMAIL' | 'IN_APP' | 'SMS';
  recipient: string;
  subject: string;
  message: string;
  data: {
    submissionId: string;
    submissionNumber: string;
    status: SubmissionStatus;
    submitterName: string;
  };
}

// ================================================
// ERROR TYPES
// ================================================

export enum SubmissionErrorCode {
  SUBMISSION_NOT_FOUND = 'SUBMISSION_NOT_FOUND',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INVALID_SUBMISSION_TYPE = 'INVALID_SUBMISSION_TYPE',
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  UNAUTHORIZED_ACTION = 'UNAUTHORIZED_ACTION',
  INVALID_APPROVAL_DATA = 'INVALID_APPROVAL_DATA'
}

export interface SubmissionError {
  code: SubmissionErrorCode;
  message: string;
  details?: any;
}

// ================================================
// SERVICE LAYER TYPES
// ================================================

export interface CreateSubmissionData {
  submissionType: SubmissionType;
  district: string;
  village: string;
  farmerGroup: string;
  groupLeader: string;
  commodity: string;
  totalArea: number;
  affectedArea: number;
  pestTypes: string[];
  letterNumber?: string;
  letterDate?: Date;
  letterFileUrl?: string;
  activityType?: POPTActivityType;
  urgencyReason?: string;
  requestedBy?: string;
  activityDate?: Date;
  priority: SubmissionPriority;
  submitterId: string;
  items: SubmissionItemRequest[];
}

export interface UpdateSubmissionData {
  district?: string;
  village?: string;
  farmerGroup?: string;
  groupLeader?: string;
  commodity?: string;
  totalArea?: number;
  affectedArea?: number;
  pestTypes?: string[];
  letterNumber?: string;
  letterDate?: Date;
  letterFileUrl?: string;
  activityType?: POPTActivityType;
  urgencyReason?: string;
  requestedBy?: string;
  activityDate?: Date;
  priority?: SubmissionPriority;
  items?: SubmissionItemRequest[];
}
