// ============================================================================
// QR LABEL PRINT UTILITIES
// Utility functions for QR Label Print modal
// ============================================================================

import { DrugInventory } from '@/lib/types/inventory';
import {
  LabelConfig,
  LabelPreviewItem,
  PreviewPageData,
  PrintSummaryData,
  LabelConfigValidation,
  LabelUnit,
} from '@/lib/types/qr-label-print';
import { extractExpiryDates } from './date-utils';

/**
 * Get label unit display name
 */
export const getLabelUnitDisplayName = (unit: LabelUnit): string => {
  return unit === 'kecil' ? 'Satuan Kecil' : 'Kemasan Besar';
};

/**
 * Get label unit display name (short)
 */
export const getLabelUnitDisplayNameShort = (unit: LabelUnit): string => {
  return unit === 'kecil' ? 'Kecil' : 'Besar';
};

/**
 * Calculate total labels based on config
 */
export const calculateTotalLabels = (config: LabelConfig): number => {
  const stock = config.unit === 'kecil' ? config.smallStock : config.largeStock;

  switch (config.rangeType) {
    case 'all':
      return stock;
    case 'range':
      if (config.rangeFrom !== undefined && config.rangeTo !== undefined) {
        return Math.min(config.rangeTo - config.rangeFrom + 1, stock);
      }
      return 0;
    case 'custom':
      if (config.customItems) {
        const items = parseCustomItems(config.customItems);
        return items.filter(n => n > 0 && n <= stock).length;
      }
      return 0;
    default:
      return 0;
  }
};

/**
 * Parse custom items string (e.g., "1,3,5,7" or "1-5,7,9")
 */
export const parseCustomItems = (customItems: string): number[] => {
  const items: number[] = [];

  const parts = customItems.split(',').map(s => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      // Range format: "1-5"
      const [from, to] = part.split('-').map(n => parseInt(n.trim()));
      if (!isNaN(from) && !isNaN(to) && from <= to) {
        for (let i = from; i <= to; i++) {
          items.push(i);
        }
      }
    } else {
      // Single number: "7"
      const num = parseInt(part);
      if (!isNaN(num)) {
        items.push(num);
      }
    }
  }

  // Remove duplicates and sort
  return [...new Set(items)].sort((a, b) => a - b);
};

/**
 * Generate label numbers based on config
 */
export const generateLabelNumbers = (config: LabelConfig): number[] => {
  const stock = config.unit === 'kecil' ? config.smallStock : config.largeStock;

  switch (config.rangeType) {
    case 'all':
      return Array.from({ length: stock }, (_, i) => i + 1);
    case 'range':
      if (config.rangeFrom !== undefined && config.rangeTo !== undefined) {
        const from = Math.max(1, config.rangeFrom);
        const to = Math.min(stock, config.rangeTo);
        return Array.from({ length: to - from + 1 }, (_, i) => from + i);
      }
      return [];
    case 'custom':
      if (config.customItems) {
        const items = parseCustomItems(config.customItems);
        return items.filter(n => n > 0 && n <= stock);
      }
      return [];
    default:
      return [];
  }
};

/**
 * Validate label config
 */
export const validateLabelConfig = (config: LabelConfig): string[] => {
  const errors: string[] = [];

  const stock = config.unit === 'kecil' ? config.smallStock : config.largeStock;

  if (stock <= 0) {
    errors.push(`Stok ${config.unit} tidak tersedia`);
    return errors;
  }

  switch (config.rangeType) {
    case 'range':
      if (config.rangeFrom === undefined || config.rangeTo === undefined) {
        errors.push('Rentang harus diisi');
      } else if (config.rangeFrom < 1 || config.rangeFrom > stock) {
        errors.push(`Rentang awal harus antara 1 dan ${stock}`);
      } else if (config.rangeTo < config.rangeFrom || config.rangeTo > stock) {
        errors.push(`Rentang akhir harus antara ${config.rangeFrom} dan ${stock}`);
      }
      break;
    case 'custom':
      if (!config.customItems || config.customItems.trim() === '') {
        errors.push('Item kustom harus diisi');
      } else {
        const items = parseCustomItems(config.customItems);
        if (items.length === 0) {
          errors.push('Format item kustom tidak valid. Gunakan format: 1,3,5 atau 1-5,7,9');
        }
      }
      break;
  }

  return errors;
};

/**
 * Validate all label configs
 */
export const validateAllConfigs = (configs: LabelConfig[]): LabelConfigValidation => {
  const errors = new Map<string, string[]>();
  let isValid = true;

  for (const config of configs) {
    const configErrors = validateLabelConfig(config);
    if (configErrors.length > 0) {
      errors.set(config.medicineId, configErrors);
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Create default label config for a medicine
 */
export const createDefaultLabelConfig = (medicine: DrugInventory): LabelConfig => {
  // Calculate small stock (individual units)
  const smallStock = medicine.stock;
  // Calculate large stock (packages)
  const largeStock = medicine.largePack.quantity;

  return {
    medicineId: medicine.id,
    medicineName: medicine.name,
    unit: 'kecil',
    rangeType: 'all',
    smallStock,
    largeStock,
  };
};

/**
 * Generate preview items from config
 */
export const generatePreviewItems = (
  config: LabelConfig,
  medicine: DrugInventory,
  startIndex: number = 0
): LabelPreviewItem[] => {
  const labelNumbers = generateLabelNumbers(config);
  const items: LabelPreviewItem[] = [];

  // Format dates
  const expiryDates = extractExpiryDates(medicine.expiryDate);
  const primaryExpiryDate = expiryDates[0] || new Date();

  for (let i = 0; i < labelNumbers.length; i++) {
    const labelNumber = labelNumbers[i];
    items.push({
      id: `${medicine.id}-${config.unit}-${labelNumber}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      producer: medicine.producer,
      content: medicine.content,
      unit: config.unit,
      qrData: generateQRData(medicine, config.unit, labelNumber),
      expiryDate: formatDate(primaryExpiryDate),
      location: medicine.storageLocation,
      source: medicine.sumber || medicine.supplier,
      labelNumber: startIndex + i + 1,
    });
  }

  return items;
};

/**
 * Generate QR data string
 */
const generateQRData = (
  medicine: DrugInventory,
  unit: LabelUnit,
  labelNumber: number
): string => {
  const expiryDates = extractExpiryDates(medicine.expiryDate);
  const primaryExpiryDate = expiryDates[0] || new Date();

  return JSON.stringify({
    type: 'MEDICINE',
    id: medicine.id,
    name: medicine.name,
    barcode: medicine.barcode,
    unit,
    labelNumber,
    location: medicine.storageLocation,
    expiryDate: formatDate(primaryExpiryDate),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Format date to string
 */
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Generate preview pages
 */
export const generatePreviewPages = (
  allItems: LabelPreviewItem[],
  labelsPerSheet: number,
  startLabelPosition: number
): PreviewPageData[] => {
  const pages: PreviewPageData[] = [];
  const totalLabels = allItems.length;

  // Calculate available slots on first page
  const firstPageSlots = labelsPerSheet - startLabelPosition + 1;

  let currentIndex = 0;

  // First page
  if (currentIndex < totalLabels) {
    const firstPageCount = Math.min(firstPageSlots, totalLabels);
    pages.push({
      pageNumber: 1,
      labels: allItems.slice(0, firstPageCount),
      startLabelPosition,
      endLabelPosition: startLabelPosition + firstPageCount - 1,
    });
    currentIndex += firstPageCount;
  }

  // Subsequent pages
  let pageNum = 2;
  while (currentIndex < totalLabels) {
    const pageLabels = allItems.slice(currentIndex, currentIndex + labelsPerSheet);
    pages.push({
      pageNumber: pageNum,
      labels: pageLabels,
      startLabelPosition: 1,
      endLabelPosition: pageLabels.length,
    });
    currentIndex += pageLabels.length;
    pageNum++;
  }

  return pages;
};

/**
 * Calculate print summary
 */
export const calculatePrintSummary = (
  configs: LabelConfig[],
  labelsPerSheet: number,
  startLabelPosition: number
): PrintSummaryData => {
  let totalLabels = 0;

  for (const config of configs) {
    totalLabels += calculateTotalLabels(config);
  }

  // Calculate total pages considering start position
  const firstPageSlots = labelsPerSheet - startLabelPosition + 1;
  let remainingLabels = totalLabels - Math.min(firstPageSlots, totalLabels);

  const totalPages = remainingLabels > 0
    ? 1 + Math.ceil(remainingLabels / labelsPerSheet)
    : totalLabels > 0 ? 1 : 0;

  return {
    totalMedicines: configs.length,
    totalLabels,
    totalPages,
    templateInfo: {
      name: 'Label No. 101',
      labelsPerSheet,
      paperSize: '21.5 × 16.5 cm (Landscape)',
    },
    startLabelPosition,
  };
};

/**
 * Format custom items display
 */
export const formatCustomItemsDisplay = (customItems: string): string => {
  const items = parseCustomItems(customItems);

  if (items.length === 0) return '-';

  // Group consecutive numbers
  const groups: (number | string)[] = [];
  let start = items[0];
  let prev = items[0];

  for (let i = 1; i < items.length; i++) {
    if (items[i] === prev + 1) {
      prev = items[i];
    } else {
      if (start === prev) {
        groups.push(start);
      } else {
        groups.push(`${start}-${prev}`);
      }
      start = items[i];
      prev = items[i];
    }
  }

  // Add last group
  if (start === prev) {
    groups.push(start);
  } else {
    groups.push(`${start}-${prev}`);
  }

  return groups.join(', ');
};

/**
 * Get stock info for unit
 */
export const getStockForUnit = (
  medicine: DrugInventory,
  unit: LabelUnit
): number => {
  return unit === 'kecil'
    ? medicine.stock
    : medicine.largePack.quantity;
};

/**
 * Get unit display label with stock
 */
export const getUnitLabelWithStock = (
  medicine: DrugInventory,
  unit: LabelUnit
): string => {
  const stock = getStockForUnit(medicine, unit);
  const unitName = unit === 'kecil' ? 'satuan' : 'kemasan';
  return `${stock} ${unitName}`;
};

/**
 * Check if config is valid for printing
 */
export const isConfigValid = (config: LabelConfig): boolean => {
  return validateLabelConfig(config).length === 0;
};

/**
 * Parse range input (e.g., "1-10" or "1-10")
 */
export const parseRangeInput = (input: string): { from?: number; to?: number } => {
  const parts = input.split('-').map(s => s.trim());

  if (parts.length === 2) {
    const from = parseInt(parts[0]);
    const to = parseInt(parts[1]);

    if (!isNaN(from) && !isNaN(to)) {
      return { from, to };
    }
  }

  return {};
};

/**
 * Format range display
 */
export const formatRangeDisplay = (from: number, to: number): string => {
  return `${from} - ${to}`;
};
