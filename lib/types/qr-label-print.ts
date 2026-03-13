// ============================================================================
// QR LABEL PRINT TYPES
// Types for QR Label Print modal with label 101 (6 labels per sheet)
// ============================================================================

// Label size/unit types
export type LabelUnit = 'kecil' | 'besar';

// Print range type
export type PrintRangeType = 'all' | 'range' | 'custom';

// Print action type
export type PrintAction = 'print' | 'pdf';

// Label configuration per medicine
export interface LabelConfig {
  medicineId: string;
  medicineName: string;
  unit: LabelUnit;
  rangeType: PrintRangeType;
  rangeFrom?: number; // For range type (e.g., 1-10)
  rangeTo?: number;
  customItems?: string; // For custom type (e.g., "1,3,5,7")
  smallStock: number; // Stock satuan kecil
  largeStock: number; // Stock satuan besar (kemasan besar)
}

// Print settings for label 101
export interface LabelPrintSettings {
  templateId: string; // Label 101
  labelsPerSheet: number; // 6
  startLabelPosition: number; // 1-6 (default: 1)
  printAction: PrintAction;
}

// Preview page data
export interface PreviewPageData {
  pageNumber: number;
  labels: LabelPreviewItem[];
  startLabelPosition: number;
  endLabelPosition: number;
}

// Single label preview item
export interface LabelPreviewItem {
  id: string;
  medicineId: string;
  medicineName: string;
  producer: string;
  content: string;
  unit: LabelUnit;
  qrData: string;
  expiryDate: string;
  location: string;
  source: string;
  labelNumber: number; // Sequential label number
}

// Summary data for preview
export interface PrintSummaryData {
  totalMedicines: number;
  totalLabels: number;
  totalPages: number;
  templateInfo: {
    name: string;
    labelsPerSheet: number;
    paperSize: string;
  };
  startLabelPosition: number;
}

// Modal step
export type QRLabelPrintStep = 'config' | 'preview' | 'summary';

// Complete print options
export interface QRLabelPrintOptions {
  configs: LabelConfig[];
  printSettings: LabelPrintSettings;
  summary: PrintSummaryData;
}

// Validation result
export interface LabelConfigValidation {
  isValid: boolean;
  errors: Map<string, string[]>; // medicineId -> error messages
}
