// QR Label Print Components
// Export semua komponen terkait QR Label Print

export { default as QRLabelPrintModal } from './qr-label-print-modal';
export { default as LabelUnitSelector } from './label-unit-selector';
export { default as PrintRangeSelector } from './print-range-selector';
export { default as PrintSettingsCard } from './print-settings-card';
export { default as QRLabelPreview101 } from './qr-label-preview-101';

// Re-export types for convenience
export type {
  LabelUnit,
  PrintRangeType,
  PrintAction,
  LabelConfig,
  LabelPrintSettings,
  PreviewPageData,
  LabelPreviewItem,
  PrintSummaryData,
  QRLabelPrintStep,
  QRLabelPrintOptions,
  LabelConfigValidation,
} from '@/lib/types/qr-label-print';

// Re-export utilities for convenience
export {
  getLabelUnitDisplayName,
  getLabelUnitDisplayNameShort,
  calculateTotalLabels,
  parseCustomItems,
  generateLabelNumbers,
  validateLabelConfig,
  validateAllConfigs,
  createDefaultLabelConfig,
  generatePreviewItems,
  generatePreviewPages,
  calculatePrintSummary,
  formatCustomItemsDisplay,
  getStockForUnit,
  getUnitLabelWithStock,
  isConfigValid,
  parseRangeInput,
  formatRangeDisplay,
} from '@/lib/utils/qr-label-print-utils';
