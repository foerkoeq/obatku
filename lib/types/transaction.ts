// # START OF Transaction Types - Type definitions for transaction management
// Purpose: Provide TypeScript types for transaction system
// Dependencies: None

export interface Transaction {
  id: string;
  letterNumber: string;
  submissionDate: Date;
  bppOfficer: {
    id: string;
    name: string;
    nip: string;
    position: string;
  };
  farmerGroup: {
    id: string;
    name: string;
    leader: string;
    district: string;
    subDistrict: string;
    village: string;
  };
  farmingDetails: {
    commodity: string;
    affectedArea: number; // in hectares
    totalArea: number;
    pestType: string[];
    pestDescription: string;
  };
  submission: {
    letter: {
      filename: string;
      url: string;
      uploadDate: Date;
    };
    requestedDrugs?: DrugRequest[];
    notes?: string;
  };
  approval?: {
    approvedBy: string;
    approvedDate: Date;
    approvedDrugs: ApprovedDrug[];
    noteToSubmitter?: string;
    noteToWarehouse?: string;
    status: ApprovalStatus;
  };
  distribution?: {
    distributedBy: string;
    distributedDate: Date;
    actualDrugs: DistributedDrug[];
    receivedBy: string;
    notes?: string;
    status: DistributionStatus;
  };
  status: TransactionStatus;
  priority: Priority;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrugRequest {
  drugId: string;
  drugName: string;
  requestedQuantity: number;
  unit: string;
  purpose: string;
}

export interface ApprovedDrug {
  drugId: string;
  drugName: string;
  approvedQuantity: number;
  unit: string;
  condition?: string;
}

export interface DistributedDrug {
  drugId: string;
  drugName: string;
  distributedQuantity: number;
  unit: string;
  batchNumber?: string;
  expiryDate: Date;
}

export type TransactionStatus = 
  | 'draft'           // Draft submission (PPL can still edit)
  | 'submitted'       // Submitted to Dinas for approval
  | 'under_review'    // Being reviewed by Dinas
  | 'approved'        // Approved by Dinas, waiting for distribution
  | 'partially_approved' // Partially approved with conditions
  | 'rejected'        // Rejected by Dinas
  | 'ready_distribution' // Ready for warehouse distribution
  | 'distributing'    // Currently being distributed
  | 'completed'       // Distribution completed
  | 'cancelled'       // Cancelled by system/admin
  | 'expired';        // Request expired due to time limit

export type ApprovalStatus = 
  | 'approved' 
  | 'partially_approved' 
  | 'rejected';

export type DistributionStatus = 
  | 'pending'
  | 'in_progress' 
  | 'completed'
  | 'partial';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type UserRole = 'admin' | 'ppl' | 'dinas' | 'popt' | 'staff';

export interface TransactionFilters {
  search: string;
  status: TransactionStatus[];
  priority: Priority[];
  district: string[];
  commodity: string[];
  pestType: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  bppOfficer: string[];
  approvedBy: string[];
}

export interface TransactionSortConfig {
  field: keyof Transaction | 'submissionDate' | 'letterNumber' | 'farmerGroup.name' | 'bppOfficer.name';
  direction: 'asc' | 'desc';
}

export interface TransactionPaginationConfig {
  page: number;
  limit: number;
  total: number;
}

export interface TransactionExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'print';
  scope: 'current' | 'all' | 'filtered';
  includeDetails: boolean;
}

// Role-based permissions
export interface RolePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canDistribute: boolean;
  canExport: boolean;
  viewScope: 'own' | 'district' | 'all';
}

export const getRolePermissions = (role: UserRole): RolePermissions => {
  switch (role) {
    case 'admin':
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        canApprove: true,
        canDistribute: true,
        canExport: true,
        viewScope: 'all',
      };
    case 'dinas':
      return {
        canView: true,
        canEdit: false,
        canDelete: false,
        canApprove: true,
        canDistribute: false,
        canExport: true,
        viewScope: 'all',
      };
    case 'popt':
    case 'staff':
      return {
        canView: true,
        canEdit: false,
        canDelete: false,
        canApprove: false,
        canDistribute: true,
        canExport: true,
        viewScope: 'all',
      };
    case 'ppl':
      return {
        canView: true,
        canEdit: true,
        canDelete: false,
        canApprove: false,
        canDistribute: false,
        canExport: false,
        viewScope: 'own',
      };
    default:
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canApprove: false,
        canDistribute: false,
        canExport: false,
        viewScope: 'own',
      };
  }
};

// # END OF Transaction Types 