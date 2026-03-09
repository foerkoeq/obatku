// # START OF Outgoing Types - Type definitions for revamped outgoing/distribution page
// Purpose: Comprehensive types for warehouse outgoing workflow
// Features: Stock items with FIFO/expiry, scan tracking, process wizard state, documentation

import { ApprovalItem, ApprovedMedicineDetail } from './approval';

// ========== Status Types ==========

export type OutgoingStatus = 'proses_gudang' | 'selesai';

export interface OutgoingStatusConfig {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  badgeClass: string;
}

export const OUTGOING_STATUS_CONFIG: Record<OutgoingStatus, OutgoingStatusConfig> = {
  proses_gudang: {
    label: 'Proses Gudang',
    description: 'Menunggu proses pengeluaran oleh petugas gudang',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-fuchsia-500',
    icon: 'heroicons:building-storefront',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
  },
  selesai: {
    label: 'Selesai',
    description: 'Proses distribusi telah selesai',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-green-500',
    icon: 'heroicons:check-badge',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
  },
};

// ========== Outgoing Item (extends ApprovalItem) ==========

export interface OutgoingItem extends Omit<ApprovalItem, 'status'> {
  outgoingStatus: OutgoingStatus;
  // Warehouse-specific fields
  tanggalProsesGudang?: Date;
  tanggalSelesai?: Date;
  petugasGudang?: {
    id: string;
    nama: string;
    nip: string;
  };
  // Distribution details
  distribusiItems?: DistribusiItem[];
  // Documentation
  fotoDokumentasi?: string[]; // base64 or URLs
  beritaAcara?: {
    id: string;
    nomor: string;
    generatedAt: Date;
    pdfUrl?: string;
    signedPdfUrl?: string;
    isSigned: boolean;
  };
}

// ========== Stock Item with Expiry (for FIFO recommendation) ==========

export interface StockBatchItem {
  id: string;
  medicineId: string;
  nama: string;
  bahanAktif: string;
  batchNumber: string;
  barcode: string; // unique barcode per batch
  expiryDate: Date;
  quantity: number;
  satuan: string;
  satuanBesar: string;
  isiPerSatuanBesar: number;
  lokasi: string; // warehouse location (e.g. "Rak A-3")
  isExpiringSoon: boolean; // < 6 months
}

// ========== Distribution Item (scanned/verified) ==========

export interface DistribusiItem {
  id: string;
  medicineId: string;
  nama: string;
  bahanAktif: string;
  batchNumber: string;
  barcode: string;
  quantity: number;
  satuan: string;
  expiryDate: Date;
  scannedAt: Date;
  poktanId: string;
  poktanNama: string;
}

// ========== Scan Result ==========

export interface ScanResult {
  success: boolean;
  barcode: string;
  stockItem?: StockBatchItem;
  errorType?: 'not_found' | 'wrong_medicine' | 'expired' | 'insufficient' | 'already_scanned' | 'invalid_format';
  errorMessage?: string;
}

// ========== Process Wizard State ==========

export type OutgoingWizardStep =
  | 'detail'
  | 'scan'
  | 'photo'
  | 'document'
  | 'upload'
  | 'complete';

export const OUTGOING_WIZARD_STEPS: { key: OutgoingWizardStep; label: string; icon: string; description: string }[] = [
  { key: 'detail', label: 'Detail', icon: 'heroicons:clipboard-document-list', description: 'Lihat data permintaan' },
  { key: 'scan', label: 'Scan', icon: 'heroicons:qr-code', description: 'Scan & verifikasi obat' },
  { key: 'photo', label: 'Foto', icon: 'heroicons:camera', description: 'Dokumentasi penyerahan' },
  { key: 'document', label: 'Berita Acara', icon: 'heroicons:document-text', description: 'Generate & cetak BA' },
  { key: 'upload', label: 'Upload', icon: 'heroicons:cloud-arrow-up', description: 'Unggah BA bertanda tangan' },
  { key: 'complete', label: 'Selesai', icon: 'heroicons:check-circle', description: 'Konfirmasi penyelesaian' },
];

export interface OutgoingWizardState {
  currentStep: number;
  // Step 1: Detail (read-only)
  detailViewed: boolean;
  // Step 2: Scan
  scannedItems: DistribusiItem[];
  scanProgress: Record<string, { target: number; scanned: number }>; // medicineId -> progress
  isScanComplete: boolean;
  // Step 3: Photo
  photos: string[]; // base64
  // Step 4: Document
  beritaAcaraGenerated: boolean;
  beritaAcaraPdfUrl?: string;
  // Step 5: Upload
  signedDocumentUrl?: string;
  signedDocumentFile?: File | null;
  // Step 6: Complete
  isSubmitted: boolean;
}

export const initialWizardState: OutgoingWizardState = {
  currentStep: 0,
  detailViewed: false,
  scannedItems: [],
  scanProgress: {},
  isScanComplete: false,
  photos: [],
  beritaAcaraGenerated: false,
  signedDocumentFile: null,
  isSubmitted: false,
};

// # END OF Outgoing Types
