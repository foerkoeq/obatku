// ============================================================================
// APPROVAL WORKFLOW MODULE - TYPE DEFINITIONS
// ============================================================================

export interface ApprovalRequest {
  submissionId: string;
  approverId: string;
  approverNotes?: string;
  approvedItems: ApprovedItem[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDeliveryDate?: Date;
}

export interface ApprovedItem {
  submissionItemId: string;
  medicineId: string;
  requestedQuantity: number;
  approvedQuantity: number;
  selectedBrandId?: string; // ID obat specific brand yang dipilih dinas
  unit: string;
  notes?: string;
  alternativeOptions?: AlternativeOption[];
}

export interface AlternativeOption {
  medicineId: string;
  brandName: string;
  availableStock: number;
  recommendedQuantity: number;
  effectivenessScore: number; // 0-100 based on OPT compatibility
  costPerHectare: number;
  unit: string;
}

export interface ApprovalRecommendation {
  submissionId: string;
  recommendedItems: RecommendedItem[];
  totalEstimatedCost: number;
  availabilityStatus: 'full' | 'partial' | 'unavailable';
  alternativeSuggestions: AlternativeSuggestion[];
  riskAssessment: RiskAssessment;
}

export interface RecommendedItem {
  submissionItemId: string;
  requestedMedicineId: string;
  requestedQuantity: number;
  recommendedOptions: MedicineRecommendation[];
  optimalChoice: MedicineRecommendation;
  quantityCalculation: QuantityCalculation;
}

export interface MedicineRecommendation {
  medicineId: string;
  stockId: string;
  brandName: string;
  activeIngredient: string;
  concentration: string;
  availableStock: number;
  recommendedQuantity: number;
  maxRecommendedQuantity: number; // based on available stock
  unitPrice: number;
  totalCost: number;
  effectivenessScore: number; // 0-100
  compatibilityScore: number; // 0-100 with requested OPT
  expiryDate: Date;
  batchNumber: string;
  supplierInfo: string;
  unit: string;
  applicationRate: string; // e.g., "2-3 ml per liter"
  coveragePerUnit: number; // hectare coverage per unit
}

export interface QuantityCalculation {
  affectedArea: number; // hectare
  baseApplicationRate: number; // per hectare
  intensityFactor: number; // 1.0 = normal, 1.5 = severe infestation
  wasteFactor: number; // 1.1 = 10% extra for waste/spillage
  calculatedQuantity: number;
  roundedQuantity: number;
  unit: string;
  calculationNotes: string;
}

export interface AlternativeSuggestion {
  originalMedicineId: string;
  alternatives: MedicineRecommendation[];
  reason: 'out_of_stock' | 'expired' | 'insufficient_quantity' | 'better_option';
  priority: number; // 1 = highest priority
}

export interface RiskAssessment {
  stockRisk: 'low' | 'medium' | 'high';
  expiryRisk: 'low' | 'medium' | 'high';
  effectivenessRisk: 'low' | 'medium' | 'high';
  overallRisk: 'low' | 'medium' | 'high';
  warnings: string[];
  recommendations: string[];
}

export interface ApprovalHistory {
  id: string;
  submissionId: string;
  approverId: string;
  approverName: string;
  action: 'approve' | 'reject' | 'request_revision' | 'partial_approve';
  previousStatus: string;
  newStatus: string;
  notes: string;
  approvedItems?: ApprovedItem[];
  rejectionReason?: string;
  requestedRevisions?: string[];
  createdAt: Date;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
}

export interface ApprovalQueue {
  id: string;
  submissionId: string;
  submissionNumber: string;
  submissionDetails: SubmissionSummary;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired';
  daysWaiting: number;
  estimatedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
}

export interface SubmissionSummary {
  id: string;
  submissionNumber: string;
  district: string;
  village: string;
  farmerGroup: string;
  groupLeader: string;
  commodity: string;
  totalArea: number;
  affectedArea: number;
  pestTypes: string[];
  submitterName: string;
  submittedAt: Date;
  requestedItems: RequestedItemSummary[];
  totalEstimatedValue: number;
}

export interface RequestedItemSummary {
  id: string;
  medicineName: string;
  requestedQuantity: number;
  unit: string;
  estimatedPrice: number;
  availability: 'available' | 'limited' | 'unavailable';
  targetPests: string[];
}

export interface PestTreatmentKnowledge {
  pestType: string;
  pestScientificName?: string;
  effectiveMedicines: EffectiveMedicine[];
  applicationTiming: string;
  applicationMethod: string;
  notes?: string;
}

export interface EffectiveMedicine {
  activeIngredient: string;
  medicineType: 'insektisida' | 'fungisida' | 'herbisida' | 'bakterisida';
  effectivenessRating: number; // 1-10
  applicationRate: string;
  concentrationRange: string;
  notes?: string;
}

export interface ApprovalStatistics {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  averageProcessingTime: number; // in hours
  totalValue: {
    pending: number;
    approved: number;
    rejected: number;
  };
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  topDistricts: Array<{
    district: string;
    count: number;
    totalValue: number;
  }>;
  medicineUsageStats: Array<{
    medicineId: string;
    medicineName: string;
    timesRequested: number;
    timesApproved: number;
    totalQuantityApproved: number;
    averageApprovalRate: number;
  }>;
}

// API Request/Response types
export interface CreateApprovalRequest {
  submissionId: string;
  action: 'approve' | 'reject' | 'partial_approve' | 'request_revision';
  notes?: string;
  approvedItems?: {
    submissionItemId: string;
    approvedQuantity: number;
    selectedMedicineId?: string;
    notes?: string;
  }[];
  rejectionReason?: string;
  requestedRevisions?: string[];
  estimatedDeliveryDate?: string;
}

export interface GetApprovalQueueRequest {
  status?: 'pending' | 'in_review' | 'approved' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  district?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'priority' | 'estimatedValue' | 'daysWaiting';
  sortOrder?: 'asc' | 'desc';
}

export interface GetRecommendationRequest {
  submissionId: string;
  includeAlternatives?: boolean;
  maxAlternatives?: number;
  riskTolerance?: 'low' | 'medium' | 'high';
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  data?: {
    approvalId: string;
    submissionId: string;
    newStatus: string;
    processedItems: number;
    estimatedValue: number;
  };
  errors?: string[];
}

export interface RecommendationResponse {
  success: boolean;
  data?: ApprovalRecommendation;
  errors?: string[];
}

export interface ApprovalQueueResponse {
  success: boolean;
  data?: {
    approvals: ApprovalQueue[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
    summary: {
      totalPending: number;
      totalValue: number;
      urgentCount: number;
      overdueCo‌unt: number;
    };
  };
  errors?: string[];
}
