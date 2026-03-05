// # START OF Approval Types - Type definitions for revamped approval page
// Purpose: Comprehensive types for approval workflow (Pengajuan Dinas, Persetujuan Dinas, Proses Gudang)
// Features: Gapoktan/Poktan hierarchy, document management, medicine selection with unit conversion
// Dependencies: transaction-list types for MedicineStockItem

import { MedicineStockItem } from './transaction-list';

// ========== Status Types ==========

export type ApprovalStatus = 'pengajuan_dinas' | 'persetujuan_dinas' | 'proses_gudang';

export interface ApprovalStatusConfig {
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

export const APPROVAL_STATUS_CONFIG: Record<ApprovalStatus, ApprovalStatusConfig> = {
  pengajuan_dinas: {
    label: 'Pengajuan ke Dinas',
    description: 'Menunggu review & persetujuan Dinas',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-500',
    icon: 'heroicons:document-magnifying-glass',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
  },
  persetujuan_dinas: {
    label: 'Persetujuan Dinas',
    description: 'Disetujui, menunggu proses gudang',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-500',
    icon: 'heroicons:clock',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
  },
  proses_gudang: {
    label: 'Proses Gudang',
    description: 'Sedang diproses oleh petugas gudang',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-fuchsia-500',
    icon: 'heroicons:building-storefront',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
  },
};

// ========== Poktan / Gapoktan ==========

export interface ApprovalPoktanDetail {
  id: string;
  nama: string;
  ketua: string;
  nikKetua: string;
  hpKetua: string;
  komoditas: string[];
  luasTerserang: number;
  luasWaspada: number;
  opt: string[];
}

// ========== Documents ==========

export type DocumentType = 'surat_pengajuan' | 'surat_popt' | 'dokumen_lainnya';

export interface ApprovalDocument {
  id: string;
  tipe: DocumentType;
  label: string;
  nomor?: string;
  filename: string;
  url: string;
  uploadDate: Date;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  surat_pengajuan: 'Surat Pengajuan',
  surat_popt: 'Surat Laporan/Rekomendasi POPT',
  dokumen_lainnya: 'Dokumen Lainnya',
};

// ========== Main Approval Item ==========

export interface ApprovalItem {
  id: string;
  status: ApprovalStatus;

  // Location
  kecamatan: string;
  desa: string;

  // Group info
  tipe: 'poktan' | 'gapoktan';
  namaGrup: string;
  ketuaGrup: string;
  nikKetuaGrup: string;
  hpKetuaGrup: string;

  // Sub-groups (poktan under gapoktan, or single poktan)
  poktanList: ApprovalPoktanDetail[];

  // Submitted by (PPL/BPP officer)
  diajukanOleh: {
    id: string;
    nama: string;
    nip: string;
    jabatan: string;
  };

  // POPT officer
  namaPopt?: string;

  // Dates
  tanggalPengajuan: Date;
  tanggalDisetujui?: Date;

  // Documents
  dokumen: ApprovalDocument[];

  // Aggregated for card display (derived from poktanList)
  komoditas: string[];
  opt: string[];

  // BPP medicine preference
  preferensiObatBpp: string[];

  // Approved medicines (populated after persetujuan)
  obatDisetujui?: ApprovedMedicineDetail[];

  // Notes
  catatan?: string;
  catatanPersetujuan?: string;
}

// ========== Approved Medicine (per Poktan) ==========

export interface ApprovedMedicineDetail {
  id: string;
  medicineId: string;
  nama: string;
  bahanAktif: string;
  poktanId: string;
  poktanNama: string;
  jumlahBesar: number;
  satuanBesar: string;
  jumlahKecil: number;
  satuanKecil: string;
  isiPerSatuanBesar: number; // conversion factor
  isPreferensiBpp: boolean;
  isRekomendasiOpt: boolean;
}

// ========== Medicine Selection State (for wizard step 2) ==========

export interface MedicineSelectionState {
  poktanId: string;
  selectedMedicines: SelectedMedicineInput[];
}

export interface SelectedMedicineInput {
  medicineId: string;
  nama: string;
  bahanAktif: string;
  jumlahBesar: number;
  satuanBesar: string;
  jumlahKecil: number;
  satuanKecil: string;
  isiPerSatuanBesar: number;
  maxBesar: number;
  maxKecil: number;
  rekomendasiBesar?: number; // recommended dosage
  rekomendasiKecil?: number;
}

// ========== Warehouse (Gudang) Scan Types ==========

export interface GudangScannedItem {
  id: string;
  medicineId: string;
  nama: string;
  bahanAktif: string;
  qrCode: string;
  satuanBesar: string;
  satuanKecil: string;
  jumlah: number;
  satuan: string;
  scannedAt: Date;
  isValid: boolean;
  errorMessage?: string;
}

export interface GudangDistributionItem {
  medicineId: string;
  nama: string;
  bahanAktif: string;
  targetJumlahBesar: number;
  targetJumlahKecil: number;
  satuanBesar: string;
  satuanKecil: string;
  scannedCount: number;
  poktanNama: string;
}

// ========== Wizard Step Types ==========

export type PengajuanStep = 'info_dasar' | 'detail_poktan' | 'kesimpulan';
export type GudangStep = 'list_obat' | 'scan_qr';

export const PENGAJUAN_STEPS: { key: PengajuanStep; label: string; icon: string }[] = [
  { key: 'info_dasar', label: 'Info Dasar', icon: 'heroicons:identification' },
  { key: 'detail_poktan', label: 'Detail & Obat', icon: 'heroicons:clipboard-document-list' },
  { key: 'kesimpulan', label: 'Kesimpulan', icon: 'heroicons:check-badge' },
];

export const GUDANG_STEPS: { key: GudangStep; label: string; icon: string }[] = [
  { key: 'list_obat', label: 'Daftar Obat', icon: 'heroicons:clipboard-document-list' },
  { key: 'scan_qr', label: 'Scan & Verifikasi', icon: 'heroicons:qr-code' },
];

// # END OF Approval Types
