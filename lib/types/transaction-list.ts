// # START OF Transaction List Types - Type definitions for revamped transaction list
// Purpose: Provide clean TypeScript types for the new transaction list system
// Features: New status flow, medicine stock, process modal types
// Dependencies: None

// ========== Status Types ==========

export type TrxStatus =
  | 'draft_bpp'
  | 'pengajuan_dinas'
  | 'persetujuan_dinas'
  | 'ditolak'
  | 'dikembalikan'
  | 'proses_gudang'
  | 'pengambilan'
  | 'selesai';

export type JenisPestisida = 'kimia' | 'nabati' | 'agen_hayati';

// ========== Status Configuration ==========

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  order: number;
}

export const TRX_STATUS_CONFIG: Record<TrxStatus, StatusConfig> = {
  draft_bpp: {
    label: 'Draft BPP',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    icon: 'heroicons:document-text',
    order: 1,
  },
  pengajuan_dinas: {
    label: 'Pengajuan ke Dinas',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: 'heroicons:paper-airplane',
    order: 2,
  },
  persetujuan_dinas: {
    label: 'Persetujuan Dinas',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: 'heroicons:check-circle',
    order: 3,
  },
  ditolak: {
    label: 'Ditolak',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: 'heroicons:x-circle',
    order: 4,
  },
  dikembalikan: {
    label: 'Dikembalikan',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: 'heroicons:arrow-uturn-left',
    order: 5,
  },
  proses_gudang: {
    label: 'Proses Gudang',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: 'heroicons:building-storefront',
    order: 6,
  },
  pengambilan: {
    label: 'Pengambilan',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    icon: 'heroicons:hand-raised',
    order: 7,
  },
  selesai: {
    label: 'Selesai',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: 'heroicons:check-badge',
    order: 8,
  },
};

export const JENIS_PESTISIDA_LABELS: Record<JenisPestisida, string> = {
  kimia: 'Pestisida Kimia/Sintetik',
  nabati: 'Pestisida Nabati',
  agen_hayati: 'Agen Hayati',
};

export const ALL_TRX_STATUSES: TrxStatus[] = [
  'draft_bpp',
  'pengajuan_dinas',
  'persetujuan_dinas',
  'ditolak',
  'dikembalikan',
  'proses_gudang',
  'pengambilan',
  'selesai',
];

// ========== Main Transaction Interface ==========

export interface TrxListItem {
  id: string;
  status: TrxStatus;
  noBast?: string; // Only populated for pengambilan/selesai

  // Submitter info
  diajukanOleh: {
    id: string;
    nama: string;
    nip: string;
  };

  // POPT officer
  namaPopt?: string;

  // Key dates
  tanggalDiajukan: Date;
  tanggalDisetujui?: Date;

  // Farmer group / Poktan / Gapoktan
  poktan: {
    id: string;
    nama: string;
    tipe: 'poktan' | 'gapoktan';
    ketua: string;
    desa: string;
    kecamatan: string;
  };

  // Area in hectares
  luasTerserang: number;
  luasWaspada: number;

  // OPT (Organisme Pengganggu Tumbuhan)
  opt: string[];

  // Pesticide preferences
  jenisPestisida: JenisPestisida[];
  kandunganDikehendaki: string;

  // Medicine names (simplified for table display)
  permintaanObat: string[];
  persetujuanObat?: string[];

  // Notes
  catatan?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ========== Medicine Stock ==========

export interface MedicineStockItem {
  id: string;
  nama: string;
  bahanAktif: string;
  jenis: JenisPestisida;
  targetOpt: string[];
  stokBesar: number;
  satuanBesar: string;
  isiPerSatuanBesar: number; // e.g., 1 botol = 500 ml
  stokKecil: number;
  satuanKecil: string;
}

// ========== Process Modal Types ==========

export interface SelectedMedicine {
  id: string;
  nama: string;
  jumlahBesar: number;
  satuanBesar: string;
  jumlahKecil: number;
  satuanKecil: string;
  maxBesar: number;
  maxKecil: number;
}

// ========== Filter Types ==========

export interface TrxListFilters {
  search: string;
  status: TrxStatus[];
  kecamatan: string;
  tahun: string;
}

export type TrxSortKey =
  | 'tanggalDiajukan'
  | 'tahun'
  | 'status'
  | 'poktan'
  | 'kecamatan'
  | 'luasTerserang';

export type TrxSortDirection = 'asc' | 'desc';

// # END OF Transaction List Types
