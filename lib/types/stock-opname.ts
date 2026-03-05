// # START OF Stock Opname Types - Type definitions for stock opname management
// Purpose: Provide TypeScript types for stock opname (stock taking) system
// Dependencies: None

// === Monthly Stock Movement ===
export interface StockMovement {
  masuk: number;   // M - Barang Masuk
  keluar: number;  // K - Barang Keluar
}

// === Stock Opname Item - One row in the opname table ===
export interface StockOpnameItem {
  id: string;
  jenisPestisida: string;
  kategori: 'Insektisida' | 'Fungisida' | 'Herbisida' | 'Rodentisida' | 'Agen Hayati' | 'Pestisida Nabati' | 'Lainnya';
  satuan: string;             // liter, kg, botol, sachet, etc.
  stokAwal: number;           // Opening stock (beginning of period)
  volAwal: string;            // Volume description e.g., "150 liter"
  /** Monthly movements - key is month number (1-12) */
  pergerakan: Record<number, StockMovement>;
  stokAkhir: number;          // Closing stock (calculated)
  stokFisik?: number;         // Physical stock count (from opname check)
  selisih?: number;           // Difference (stokFisik - stokAkhir)
  keterangan: string;
  lastChecked?: Date;
  checkedBy?: string;
  // Extended fields for QR & storage
  lokasiPenyimpananId?: string;  // Reference to StorageLocation
  batchNumber?: string;
  expiryDate?: Date;
  qrCode?: string;             // QR code value e.g., "MED:SO-001:..."
}

// === Stock Opname Report ===
export interface StockOpnameReport {
  id: string;
  tahun: number;
  bulanDari: number;           // Starting month (1-12)
  bulanSampai: number;         // Ending month (1-12)
  tanggalOpname: Date;
  items: StockOpnameItem[];
  createdBy: string;
  createdAt: Date;
  status: StockOpnameStatus;
  catatan?: string;
}

export type StockOpnameStatus = 'draft' | 'in_progress' | 'completed' | 'approved';

// === Filter ===
export interface StockOpnameFilter {
  tahun: number;
  bulanDari: number;
  bulanSampai: number;
  kategori?: string[];
  search?: string;
  statusOpname?: 'all' | 'checked' | 'unchecked' | 'discrepancy';
}

// === Stats for Dashboard Cards ===
export interface StockOpnameStats {
  totalItems: number;
  checkedItems: number;
  discrepancyItems: number;
  matchedItems: number;
  lastOpnameDate?: Date;
  completionPercentage: number;
}

// === Stock Check (Cek Stok) ===
export interface StockCheckEntry {
  itemId: string;
  jenisPestisida: string;
  stokSistem: number;        // System stock
  stokFisik: number;         // Physical count
  selisih: number;           // Difference
  catatan: string;
  checkedBy: string;
  checkedAt: Date;
}

// === Stock Update (Update Stok) ===
export interface StockUpdateEntry {
  itemId: string;
  jenisPestisida: string;
  tipe: 'masuk' | 'keluar' | 'adjustment';
  jumlah: number;
  bulan: number;
  tahun: number;
  catatan: string;
  updatedBy: string;
  updatedAt: Date;
}

// === Kop Surat for Report ===
export interface KopSuratDinas {
  logo?: string;
  namaInstansi: string;
  namaDinas: string;
  alamat: string;
  telepon: string;
  email: string;
  website?: string;
  kabupaten: string;
  provinsi: string;
}

// === Month name helper ===
export const NAMA_BULAN: Record<number, string> = {
  1: 'Januari',
  2: 'Februari',
  3: 'Maret',
  4: 'April',
  5: 'Mei',
  6: 'Juni',
  7: 'Juli',
  8: 'Agustus',
  9: 'September',
  10: 'Oktober',
  11: 'November',
  12: 'Desember',
};

export const NAMA_BULAN_SINGKAT: Record<number, string> = {
  1: 'Jan',
  2: 'Feb',
  3: 'Mar',
  4: 'Apr',
  5: 'Mei',
  6: 'Jun',
  7: 'Jul',
  8: 'Ags',
  9: 'Sep',
  10: 'Okt',
  11: 'Nov',
  12: 'Des',
};

// === Period Mode ===
export type PeriodMode =
  | 'bulan_ini'
  | 'triwulan_1'
  | 'triwulan_2'
  | 'triwulan_3'
  | 'triwulan_4'
  | 'semester_1'
  | 'semester_2'
  | 'setahun'
  | 'per_bulan';

// === Storage Location (Lokasi Penyimpanan / Rak Gudang) ===
export interface StorageLocation {
  id: string;
  qrCode: string;           // QR code value e.g., "RACK:LOK-001:R-A1:Rak Utama Lantai 1"
  kode: string;              // e.g., "R-A1"
  nama: string;              // e.g., "Rak Utama Lantai 1"
  gedung: string;
  lantai: number;
  baris: string;
  kapasitas: number;
  deskripsi?: string;
  itemIds: string[];         // IDs of StockOpnameItems stored here
}

// === Medicine Unit for QR scanning individual items ===
export interface MedicineUnit {
  id: string;
  qrCode: string;           // e.g., "MED:MU-001:MTR-100:Matros 18 EC 100ml"
  itemId: string;            // Reference to StockOpnameItem
  jenisPestisida: string;
  batchNumber: string;
  expiryDate: Date;
  tipe: 'satuan_besar' | 'satuan_kecil';
  jumlahPerUnit: number;     // How many individual items in this unit
  lokasiId: string;          // Storage location ID
}

// === Daily Transaction Detail (for Per Bulan cell-click modal) ===
export interface DailyTransactionDetail {
  tanggal: number;
  bulan: number;
  tahun: number;
  itemId: string;
  jenisPestisida: string;
  masuk: DailyTransactionMasuk[];
  keluar: DailyTransactionKeluar[];
}

export interface DailyTransactionMasuk {
  jumlah: number;
  sumber: string;              // APBD, APBN, CSR, etc.
  lokasiPenyimpanan: string;   // Where it's stored
  catatan?: string;
}

export interface DailyTransactionKeluar {
  jumlah: number;
  kelompokTani: string;
  kecamatan: string;
  arealSerangan: number;       // hectares
  jenisSerangan: string;       // blast, tikus, etc.
  catatan?: string;
}

// === Daily Stock Movement (per item per month per day) ===
export type DailyMovements = Record<number, StockMovement>;
// key = day of month (1-31), value = {masuk, keluar}

// === Stock Check Session (QR-based) ===
export interface StockCheckSession {
  id: string;
  lokasiId: string;
  lokasi: StorageLocation;
  items: StockCheckSessionItem[];
  startedAt: Date;
  checkedBy: string;
  mode: 'manual' | 'scan' | 'hybrid';
  status: 'in_progress' | 'completed';
}

export interface StockCheckSessionItem {
  itemId: string;
  jenisPestisida: string;
  satuan: string;
  stokSistem: number;
  stokFisik?: number;
  selisih?: number;
  scanned: boolean;
  scanCount: number;          // How many units scanned (for auto-count)
  batchNumber?: string;
  expiryDate?: Date;
  keterangan: string;
}

// === Stock Update Session (QR-based) ===
export interface StockUpdateScannedItem {
  id: string;
  unitId: string;
  itemId: string;
  jenisPestisida: string;
  batchNumber: string;
  expiryDate: Date;
  tipe: 'satuan_besar' | 'satuan_kecil';
  jumlah: number;
  lokasiId: string;
  scannedAt: Date;
  confirmed: boolean;
}

// # END OF Stock Opname Types
