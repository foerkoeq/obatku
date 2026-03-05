// # START OF Stock Opname Demo Data
// Purpose: Provide comprehensive mock data for stock opname feature
// Dependencies: Stock opname types, inventory data

import {
  StockOpnameItem,
  StockOpnameReport,
  StockOpnameStats,
  StockMovement,
  KopSuratDinas,
  StockCheckEntry,
  NAMA_BULAN,
  StorageLocation,
  MedicineUnit,
  DailyTransactionDetail,
  DailyTransactionMasuk,
  DailyTransactionKeluar,
  DailyMovements,
} from '@/lib/types/stock-opname';

// === Default Kop Surat Dinas ===
export const defaultKopSuratDinas: KopSuratDinas = {
  namaInstansi: 'PEMERINTAH KABUPATEN TUBAN',
  namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN',
  alamat: 'Jl. Dr. Wahidin Sudirohusodo No. 800, Tuban, Jawa Timur 62319',
  telepon: '(0356) 321234',
  email: 'dkppp@tubankab.go.id',
  website: 'https://dkppp.tubankab.go.id',
  kabupaten: 'Tuban',
  provinsi: 'Jawa Timur',
};

// === Helper: Generate random movement for a month ===
const generateMovement = (
  baseIn: number,
  baseOut: number,
  variance: number = 5
): StockMovement => ({
  masuk: Math.max(0, baseIn + Math.floor(Math.random() * variance * 2) - variance),
  keluar: Math.max(0, baseOut + Math.floor(Math.random() * variance * 2) - variance),
});

// === Mock Stock Opname Items ===
export const mockStockOpnameItems: StockOpnameItem[] = [
  {
    id: 'SO-001',
    jenisPestisida: 'Matros 18 EC 100ml (Abamectin)',
    kategori: 'Insektisida',
    satuan: 'botol',
    stokAwal: 280,
    volAwal: '280 botol',
    pergerakan: {
      1: { masuk: 0, keluar: 14 },
      2: { masuk: 0, keluar: 22 },
      3: { masuk: 50, keluar: 18 },
      4: { masuk: 0, keluar: 25 },
      5: { masuk: 0, keluar: 12 },
      6: { masuk: 100, keluar: 30 },
      7: { masuk: 0, keluar: 15 },
      8: { masuk: 0, keluar: 20 },
      9: { masuk: 0, keluar: 8 },
      10: { masuk: 50, keluar: 16 },
      11: { masuk: 0, keluar: 10 },
      12: { masuk: 0, keluar: 5 },
    },
    stokAkhir: 215,
    stokFisik: 215,
    selisih: 0,
    keterangan: 'Stok sesuai',
    lastChecked: new Date('2026-02-20'),
    checkedBy: 'Admin',
  },
  {
    id: 'SO-002',
    jenisPestisida: 'Matros 18 EC 500ml (Abamectin)',
    kategori: 'Insektisida',
    satuan: 'botol',
    stokAwal: 380,
    volAwal: '380 botol',
    pergerakan: {
      1: { masuk: 0, keluar: 20 },
      2: { masuk: 0, keluar: 15 },
      3: { masuk: 0, keluar: 22 },
      4: { masuk: 100, keluar: 28 },
      5: { masuk: 0, keluar: 18 },
      6: { masuk: 0, keluar: 25 },
      7: { masuk: 50, keluar: 12 },
      8: { masuk: 0, keluar: 20 },
      9: { masuk: 0, keluar: 10 },
      10: { masuk: 0, keluar: 15 },
      11: { masuk: 0, keluar: 8 },
      12: { masuk: 0, keluar: 5 },
    },
    stokAkhir: 232,
    stokFisik: 230,
    selisih: -2,
    keterangan: 'Selisih 2 botol (pecah/rusak)',
    lastChecked: new Date('2026-02-20'),
    checkedBy: 'Admin',
  },
  {
    id: 'SO-003',
    jenisPestisida: 'Montaf 400 SL (Bisultap)',
    kategori: 'Insektisida',
    satuan: 'botol',
    stokAwal: 80,
    volAwal: '80 botol',
    pergerakan: {
      1: { masuk: 0, keluar: 5 },
      2: { masuk: 0, keluar: 8 },
      3: { masuk: 20, keluar: 6 },
      4: { masuk: 0, keluar: 10 },
      5: { masuk: 0, keluar: 4 },
      6: { masuk: 0, keluar: 7 },
      7: { masuk: 0, keluar: 3 },
      8: { masuk: 0, keluar: 5 },
      9: { masuk: 0, keluar: 2 },
      10: { masuk: 0, keluar: 4 },
      11: { masuk: 0, keluar: 2 },
      12: { masuk: 0, keluar: 1 },
    },
    stokAkhir: 23,
    stokFisik: 23,
    selisih: 0,
    keterangan: 'Stok sesuai',
    lastChecked: new Date('2026-02-20'),
    checkedBy: 'Staff Gudang',
  },
  {
    id: 'SO-004',
    jenisPestisida: 'Applaud 10 WP (Buprofezin)',
    kategori: 'Insektisida',
    satuan: 'sachet',
    stokAwal: 40,
    volAwal: '40 sachet',
    pergerakan: {
      1: { masuk: 0, keluar: 3 },
      2: { masuk: 0, keluar: 5 },
      3: { masuk: 0, keluar: 2 },
      4: { masuk: 0, keluar: 4 },
      5: { masuk: 20, keluar: 6 },
      6: { masuk: 0, keluar: 3 },
      7: { masuk: 0, keluar: 2 },
      8: { masuk: 0, keluar: 1 },
      9: { masuk: 0, keluar: 2 },
      10: { masuk: 0, keluar: 1 },
      11: { masuk: 0, keluar: 1 },
      12: { masuk: 0, keluar: 0 },
    },
    stokAkhir: 10,
    stokFisik: 10,
    selisih: 0,
    keterangan: 'Stok rendah, perlu restock',
    lastChecked: new Date('2026-02-18'),
    checkedBy: 'Staff Gudang',
  },
  {
    id: 'SO-005',
    jenisPestisida: 'Kempo 400 SL (Dimehipo)',
    kategori: 'Insektisida',
    satuan: 'botol',
    stokAwal: 20,
    volAwal: '20 botol',
    pergerakan: {
      1: { masuk: 0, keluar: 2 },
      2: { masuk: 0, keluar: 3 },
      3: { masuk: 0, keluar: 1 },
      4: { masuk: 0, keluar: 2 },
      5: { masuk: 0, keluar: 1 },
      6: { masuk: 0, keluar: 2 },
      7: { masuk: 0, keluar: 1 },
      8: { masuk: 0, keluar: 0 },
      9: { masuk: 0, keluar: 1 },
      10: { masuk: 0, keluar: 0 },
      11: { masuk: 0, keluar: 0 },
      12: { masuk: 0, keluar: 0 },
    },
    stokAkhir: 7,
    stokFisik: 7,
    selisih: 0,
    keterangan: 'Mendekati kadaluarsa Mei 2026',
    lastChecked: new Date('2026-02-15'),
    checkedBy: 'Admin',
  },
  {
    id: 'SO-006',
    jenisPestisida: 'Meta-Hipo 400 SL (Dimehipo)',
    kategori: 'Insektisida',
    satuan: 'botol',
    stokAwal: 2000,
    volAwal: '2000 botol',
    pergerakan: {
      1: { masuk: 0, keluar: 85 },
      2: { masuk: 0, keluar: 120 },
      3: { masuk: 0, keluar: 95 },
      4: { masuk: 0, keluar: 110 },
      5: { masuk: 500, keluar: 130 },
      6: { masuk: 0, keluar: 100 },
      7: { masuk: 0, keluar: 75 },
      8: { masuk: 0, keluar: 90 },
      9: { masuk: 0, keluar: 60 },
      10: { masuk: 0, keluar: 70 },
      11: { masuk: 0, keluar: 45 },
      12: { masuk: 0, keluar: 30 },
    },
    stokAkhir: 1490,
    stokFisik: 1488,
    selisih: -2,
    keterangan: 'Selisih minor, kemungkinan pecah saat handling',
    lastChecked: new Date('2026-02-20'),
    checkedBy: 'Staff Gudang',
  },
  {
    id: 'SO-007',
    jenisPestisida: 'Fipros 0.4 GR (Fipronil)',
    kategori: 'Insektisida',
    satuan: 'sachet',
    stokAwal: 1000,
    volAwal: '1000 sachet',
    pergerakan: {
      1: { masuk: 0, keluar: 50 },
      2: { masuk: 0, keluar: 65 },
      3: { masuk: 200, keluar: 80 },
      4: { masuk: 0, keluar: 55 },
      5: { masuk: 0, keluar: 70 },
      6: { masuk: 0, keluar: 45 },
      7: { masuk: 0, keluar: 35 },
      8: { masuk: 0, keluar: 40 },
      9: { masuk: 0, keluar: 25 },
      10: { masuk: 0, keluar: 30 },
      11: { masuk: 0, keluar: 15 },
      12: { masuk: 0, keluar: 10 },
    },
    stokAkhir: 680,
    stokFisik: 680,
    selisih: 0,
    keterangan: 'Stok sesuai',
    lastChecked: new Date('2026-02-19'),
    checkedBy: 'Admin',
  },
  {
    id: 'SO-008',
    jenisPestisida: 'Starfidor 5WP (Imidakloprid)',
    kategori: 'Insektisida',
    satuan: 'sachet',
    stokAwal: 520,
    volAwal: '520 sachet',
    pergerakan: {
      1: { masuk: 0, keluar: 30 },
      2: { masuk: 0, keluar: 25 },
      3: { masuk: 0, keluar: 35 },
      4: { masuk: 100, keluar: 40 },
      5: { masuk: 0, keluar: 28 },
      6: { masuk: 0, keluar: 22 },
      7: { masuk: 0, keluar: 18 },
      8: { masuk: 0, keluar: 20 },
      9: { masuk: 0, keluar: 12 },
      10: { masuk: 0, keluar: 15 },
      11: { masuk: 0, keluar: 8 },
      12: { masuk: 0, keluar: 5 },
    },
    stokAkhir: 262,
    stokFisik: 260,
    selisih: -2,
    keterangan: 'Selisih 2 sachet (sobek)',
    lastChecked: new Date('2026-02-20'),
    checkedBy: 'Staff Gudang',
  },
  {
    id: 'SO-009',
    jenisPestisida: 'Petrofur 3 GR (Karbofuran)',
    kategori: 'Insektisida',
    satuan: 'sachet',
    stokAwal: 1060,
    volAwal: '1060 sachet',
    pergerakan: {
      1: { masuk: 0, keluar: 60 },
      2: { masuk: 0, keluar: 75 },
      3: { masuk: 0, keluar: 50 },
      4: { masuk: 0, keluar: 80 },
      5: { masuk: 200, keluar: 65 },
      6: { masuk: 0, keluar: 55 },
      7: { masuk: 0, keluar: 40 },
      8: { masuk: 0, keluar: 45 },
      9: { masuk: 0, keluar: 30 },
      10: { masuk: 0, keluar: 35 },
      11: { masuk: 0, keluar: 20 },
      12: { masuk: 0, keluar: 15 },
    },
    stokAkhir: 590,
    stokFisik: 590,
    selisih: 0,
    keterangan: 'Stok sesuai',
    lastChecked: new Date('2026-02-19'),
    checkedBy: 'Admin',
  },
  {
    id: 'SO-010',
    jenisPestisida: 'MIPCinta 50WP (MIPC)',
    kategori: 'Insektisida',
    satuan: 'sachet',
    stokAwal: 360,
    volAwal: '360 sachet',
    pergerakan: {
      1: { masuk: 0, keluar: 20 },
      2: { masuk: 0, keluar: 15 },
      3: { masuk: 0, keluar: 25 },
      4: { masuk: 0, keluar: 18 },
      5: { masuk: 0, keluar: 22 },
      6: { masuk: 50, keluar: 15 },
      7: { masuk: 0, keluar: 12 },
      8: { masuk: 0, keluar: 10 },
      9: { masuk: 0, keluar: 8 },
      10: { masuk: 0, keluar: 6 },
      11: { masuk: 0, keluar: 4 },
      12: { masuk: 0, keluar: 2 },
    },
    stokAkhir: 193,
    stokFisik: 193,
    selisih: 0,
    keterangan: 'Stok sesuai',
    lastChecked: new Date('2026-02-18'),
    checkedBy: 'Staff Gudang',
  },
  {
    id: 'SO-011',
    jenisPestisida: 'Running WP (Klorotalonil)',
    kategori: 'Fungisida',
    satuan: 'sachet',
    stokAwal: 140,
    volAwal: '140 sachet',
    pergerakan: {
      1: { masuk: 0, keluar: 8 },
      2: { masuk: 0, keluar: 12 },
      3: { masuk: 0, keluar: 6 },
      4: { masuk: 50, keluar: 10 },
      5: { masuk: 0, keluar: 8 },
      6: { masuk: 0, keluar: 5 },
      7: { masuk: 0, keluar: 4 },
      8: { masuk: 0, keluar: 6 },
      9: { masuk: 0, keluar: 3 },
      10: { masuk: 0, keluar: 5 },
      11: { masuk: 0, keluar: 2 },
      12: { masuk: 0, keluar: 1 },
    },
    stokAkhir: 60,
    stokFisik: 60,
    selisih: 0,
    keterangan: 'Stok sesuai',
    lastChecked: new Date('2026-02-17'),
    checkedBy: 'Admin',
  },
  {
    id: 'SO-012',
    jenisPestisida: 'Topsin 500 SC (Metil Tiofanat)',
    kategori: 'Fungisida',
    satuan: 'botol',
    stokAwal: 40,
    volAwal: '40 botol',
    pergerakan: {
      1: { masuk: 0, keluar: 2 },
      2: { masuk: 0, keluar: 3 },
      3: { masuk: 0, keluar: 2 },
      4: { masuk: 0, keluar: 4 },
      5: { masuk: 0, keluar: 2 },
      6: { masuk: 0, keluar: 1 },
      7: { masuk: 0, keluar: 1 },
      8: { masuk: 0, keluar: 2 },
      9: { masuk: 0, keluar: 1 },
      10: { masuk: 0, keluar: 1 },
      11: { masuk: 0, keluar: 0 },
      12: { masuk: 0, keluar: 0 },
    },
    stokAkhir: 21,
    keterangan: 'Belum dicek',
  },
  {
    id: 'SO-013',
    jenisPestisida: 'Petrokum (Brodifakum)',
    kategori: 'Rodentisida',
    satuan: 'sachet',
    stokAwal: 1660,
    volAwal: '1660 sachet',
    pergerakan: {
      1: { masuk: 0, keluar: 80 },
      2: { masuk: 0, keluar: 95 },
      3: { masuk: 0, keluar: 70 },
      4: { masuk: 0, keluar: 85 },
      5: { masuk: 0, keluar: 60 },
      6: { masuk: 200, keluar: 75 },
      7: { masuk: 0, keluar: 50 },
      8: { masuk: 0, keluar: 55 },
      9: { masuk: 0, keluar: 35 },
      10: { masuk: 0, keluar: 40 },
      11: { masuk: 0, keluar: 25 },
      12: { masuk: 0, keluar: 15 },
    },
    stokAkhir: 875,
    stokFisik: 873,
    selisih: -2,
    keterangan: 'Selisih 2 sachet',
    lastChecked: new Date('2026-02-20'),
    checkedBy: 'Staff Gudang',
  },
  {
    id: 'SO-014',
    jenisPestisida: 'Trichoderma (T. Harzianum)',
    kategori: 'Agen Hayati',
    satuan: 'pack',
    stokAwal: 580,
    volAwal: '580 pack',
    pergerakan: {
      1: { masuk: 0, keluar: 30 },
      2: { masuk: 0, keluar: 25 },
      3: { masuk: 100, keluar: 35 },
      4: { masuk: 0, keluar: 40 },
      5: { masuk: 0, keluar: 20 },
      6: { masuk: 0, keluar: 28 },
      7: { masuk: 0, keluar: 15 },
      8: { masuk: 0, keluar: 18 },
      9: { masuk: 0, keluar: 10 },
      10: { masuk: 0, keluar: 12 },
      11: { masuk: 0, keluar: 8 },
      12: { masuk: 0, keluar: 5 },
    },
    stokAkhir: 334,
    stokFisik: 334,
    selisih: 0,
    keterangan: 'Stok sesuai',
    lastChecked: new Date('2026-02-20'),
    checkedBy: 'Admin',
  },
  {
    id: 'SO-015',
    jenisPestisida: 'Pestisida Nabati (Insektisida Nabati)',
    kategori: 'Pestisida Nabati',
    satuan: 'botol',
    stokAwal: 340,
    volAwal: '340 botol',
    pergerakan: {
      1: { masuk: 0, keluar: 18 },
      2: { masuk: 0, keluar: 22 },
      3: { masuk: 50, keluar: 15 },
      4: { masuk: 0, keluar: 20 },
      5: { masuk: 0, keluar: 12 },
      6: { masuk: 0, keluar: 16 },
      7: { masuk: 0, keluar: 10 },
      8: { masuk: 0, keluar: 8 },
      9: { masuk: 0, keluar: 6 },
      10: { masuk: 0, keluar: 5 },
      11: { masuk: 0, keluar: 3 },
      12: { masuk: 0, keluar: 2 },
    },
    stokAkhir: 193,
    keterangan: 'Belum dicek',
  },
];

// === Mock Stock Opname Report ===
export const mockStockOpnameReport: StockOpnameReport = {
  id: 'RPT-SO-2026-001',
  tahun: 2026,
  bulanDari: 1,
  bulanSampai: 12,
  tanggalOpname: new Date('2026-02-20'),
  items: mockStockOpnameItems,
  createdBy: 'Admin',
  createdAt: new Date('2026-02-20'),
  status: 'in_progress',
  catatan: 'Stock opname rutin bulanan Februari 2026',
};

// === Helper Functions ===

/** Calculate stock opname statistics */
export const getStockOpnameStats = (items: StockOpnameItem[]): StockOpnameStats => {
  const checkedItems = items.filter((i) => i.stokFisik !== undefined);
  const discrepancyItems = items.filter((i) => i.selisih !== undefined && i.selisih !== 0);
  const matchedItems = checkedItems.filter((i) => i.selisih === 0);
  const lastCheckedDates = checkedItems
    .filter((i) => i.lastChecked)
    .map((i) => i.lastChecked!.getTime());

  return {
    totalItems: items.length,
    checkedItems: checkedItems.length,
    discrepancyItems: discrepancyItems.length,
    matchedItems: matchedItems.length,
    lastOpnameDate: lastCheckedDates.length > 0
      ? new Date(Math.max(...lastCheckedDates))
      : undefined,
    completionPercentage: items.length > 0
      ? Math.round((checkedItems.length / items.length) * 100)
      : 0,
  };
};

/** Calculate actual stock akhir from movements */
export const calculateStokAkhir = (
  stokAwal: number,
  pergerakan: Record<number, StockMovement>,
  bulanDari: number,
  bulanSampai: number
): number => {
  let saldo = stokAwal;
  for (let m = bulanDari; m <= bulanSampai; m++) {
    const mov = pergerakan[m];
    if (mov) {
      saldo += mov.masuk - mov.keluar;
    }
  }
  return saldo;
};

/** Get total masuk for a range of months */
export const getTotalMasuk = (
  pergerakan: Record<number, StockMovement>,
  bulanDari: number,
  bulanSampai: number
): number => {
  let total = 0;
  for (let m = bulanDari; m <= bulanSampai; m++) {
    total += pergerakan[m]?.masuk || 0;
  }
  return total;
};

/** Get total keluar for a range of months */
export const getTotalKeluar = (
  pergerakan: Record<number, StockMovement>,
  bulanDari: number,
  bulanSampai: number
): number => {
  let total = 0;
  for (let m = bulanDari; m <= bulanSampai; m++) {
    total += pergerakan[m]?.keluar || 0;
  }
  return total;
};

/** Filter items by category */
export const filterByKategori = (
  items: StockOpnameItem[],
  kategori: string
): StockOpnameItem[] => {
  return items.filter((i) => i.kategori === kategori);
};

/** Filter items by check status */
export const filterByCheckStatus = (
  items: StockOpnameItem[],
  status: 'checked' | 'unchecked' | 'discrepancy'
): StockOpnameItem[] => {
  switch (status) {
    case 'checked':
      return items.filter((i) => i.stokFisik !== undefined);
    case 'unchecked':
      return items.filter((i) => i.stokFisik === undefined);
    case 'discrepancy':
      return items.filter((i) => i.selisih !== undefined && i.selisih !== 0);
    default:
      return items;
  }
};

/** Get unique categories from items */
export const getUniqueKategori = (items: StockOpnameItem[]): string[] => {
  return [...new Set(items.map((i) => i.kategori))];
};

/** Format number with Indonesian locale */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('id-ID');
};

// ============================================================
// === NEW: Storage Locations, Medicine Units, Daily Transactions
// ============================================================

// === Mock Storage Locations ===
// QR format for racks: xxx-xxx-xxx (3 segments, e.g., GDU-001-A01)
export const mockStorageLocations: StorageLocation[] = [
  {
    id: 'LOK-001',
    qrCode: 'GDU-001-A01',
    kode: 'R-A1',
    nama: 'Rak A1 Gedung Utama',
    gedung: 'Gudang Utama',
    lantai: 1,
    baris: 'A',
    kapasitas: 500,
    deskripsi: 'Rak untuk insektisida botol',
    itemIds: ['SO-001', 'SO-002', 'SO-003', 'SO-005', 'SO-006'],
  },
  {
    id: 'LOK-002',
    qrCode: 'GDU-002-A02',
    kode: 'R-A2',
    nama: 'Rak A2 Gedung Utama',
    gedung: 'Gudang Utama',
    lantai: 1,
    baris: 'A',
    kapasitas: 800,
    deskripsi: 'Rak untuk insektisida sachet',
    itemIds: ['SO-004', 'SO-007', 'SO-008', 'SO-009', 'SO-010'],
  },
  {
    id: 'LOK-003',
    qrCode: 'GDU-003-B01',
    kode: 'R-B1',
    nama: 'Rak B1 Gedung Utama',
    gedung: 'Gudang Utama',
    lantai: 1,
    baris: 'B',
    kapasitas: 300,
    deskripsi: 'Rak untuk fungisida dan rodentisida',
    itemIds: ['SO-011', 'SO-012', 'SO-013'],
  },
  {
    id: 'LOK-004',
    qrCode: 'GDH-001-C01',
    kode: 'R-C1',
    nama: 'Rak C1 Gedung Hayati',
    gedung: 'Gudang Hayati',
    lantai: 1,
    baris: 'C',
    kapasitas: 400,
    deskripsi: 'Rak untuk agen hayati dan pestisida nabati',
    itemIds: ['SO-014', 'SO-015'],
  },
  {
    id: 'LOK-005',
    qrCode: 'GDU-004-D01',
    kode: 'R-D1',
    nama: 'Rak D1 Gudang Baru',
    gedung: 'Gudang Baru',
    lantai: 1,
    baris: 'D',
    kapasitas: 200,
    deskripsi: 'Rak kosong baru',
    itemIds: [],
  },
];

// Assign storage locations to items
const itemLocationMap: Record<string, string> = {
  'SO-001': 'LOK-001', 'SO-002': 'LOK-001', 'SO-003': 'LOK-001',
  'SO-005': 'LOK-001', 'SO-006': 'LOK-001',
  'SO-004': 'LOK-002', 'SO-007': 'LOK-002', 'SO-008': 'LOK-002',
  'SO-009': 'LOK-002', 'SO-010': 'LOK-002',
  'SO-011': 'LOK-003', 'SO-012': 'LOK-003', 'SO-013': 'LOK-003',
  'SO-014': 'LOK-004', 'SO-015': 'LOK-004',
};

// Enrich items with location and QR data
mockStockOpnameItems.forEach((item) => {
  item.lokasiPenyimpananId = itemLocationMap[item.id];
  item.qrCode = `MED:${item.id}:${item.jenisPestisida.substring(0, 20)}`;
  item.batchNumber = `BATCH-${item.id}-2026`;
  item.expiryDate = new Date('2027-12-31');
});

// === Category code map for QR code generation ===
const kategoriCodeMap: Record<string, string> = {
  'Insektisida': 'INS',
  'Fungisida': 'FNG',
  'Herbisida': 'HRB',
  'Rodentisida': 'ROD',
  'Agen Hayati': 'AGH',
  'Pestisida Nabati': 'PNB',
  'Lainnya': 'LNN',
};

// === Mock Medicine Units (for scan) ===
// QR format satuan_besar: xxx-xxx-xxx-xx-xx-xxxx (6 segments, e.g., MED-001-INS-KB-01-2026)
// QR format satuan_kecil: xxx-xxx-xxx-xx-xx-xxxx-xxxx (7 segments, e.g., MED-001-INS-SK-01-2026-0001)
export const mockMedicineUnits: MedicineUnit[] = mockStockOpnameItems.flatMap((item) => {
  const units: MedicineUnit[] = [];
  const lokasiId = itemLocationMap[item.id] || 'LOK-001';
  const itemNum = item.id.replace('SO-', '');
  const catCode = kategoriCodeMap[item.kategori] || 'LNN';
  // Create 2-3 large units and 3-5 small units per item
  const numLarge = item.stokAkhir > 100 ? 3 : 2;
  const numSmall = item.stokAkhir > 100 ? 5 : 3;
  const perLargeUnit = Math.floor(item.stokAkhir / (numLarge + numSmall * 0.1));

  for (let i = 0; i < numLarge; i++) {
    const seq = String(i + 1).padStart(2, '0');
    units.push({
      id: `MU-${item.id}-L${i + 1}`,
      qrCode: `MED-${itemNum}-${catCode}-KB-${seq}-2026`,
      itemId: item.id,
      jenisPestisida: item.jenisPestisida,
      batchNumber: `BATCH-${item.id}-2026-L${i + 1}`,
      expiryDate: new Date('2027-12-31'),
      tipe: 'satuan_besar',
      jumlahPerUnit: perLargeUnit,
      lokasiId,
    });
  }
  for (let i = 0; i < numSmall; i++) {
    const seq = String(i + 1).padStart(2, '0');
    const subSeq = String(i + 1).padStart(4, '0');
    units.push({
      id: `MU-${item.id}-S${i + 1}`,
      qrCode: `MED-${itemNum}-${catCode}-SK-${seq}-2026-${subSeq}`,
      itemId: item.id,
      jenisPestisida: item.jenisPestisida,
      batchNumber: `BATCH-${item.id}-2026-S${i + 1}`,
      expiryDate: new Date('2027-12-31'),
      tipe: 'satuan_kecil',
      jumlahPerUnit: 1,
      lokasiId,
    });
  }
  return units;
});

// === Kecamatan list for mock data ===
const kecamatanList = [
  'Tuban', 'Palang', 'Semanding', 'Jenu', 'Merakurak', 'Kerek',
  'Tambakboyo', 'Bancar', 'Singgahan', 'Montong', 'Parengan', 'Rengel',
];

const kelompokTaniList = [
  'Tani Makmur', 'Sumber Rejeki', 'Maju Bersama', 'Harapan Jaya',
  'Sri Tanjung', 'Mekar Sari', 'Karya Tani', 'Makmur Sejahtera',
  'Berkah Tani', 'Lestari Jaya', 'Subur Mandiri', 'Gotong Royong',
];

const jenisSeranganList = ['Blast', 'Wereng', 'Penggerek Batang', 'Tikus', 'Ulat Grayak', 'Busuk Daun', 'Hawar Daun'];
const sumberList = ['APBD Kab. Tuban', 'APBD Prov. Jatim', 'APBN', 'CSR PT. Semen Indonesia', 'Bantuan Kementan'];

// === Helper: Generate daily transaction details for one item, one month ===
function generateDailyTransactionsForItem(
  itemId: string,
  jenisPestisida: string,
  bulan: number,
  tahun: number,
  monthlyMasuk: number,
  monthlyKeluar: number,
): DailyTransactionDetail[] {
  const details: DailyTransactionDetail[] = [];
  const daysInMonth = new Date(tahun, bulan, 0).getDate();

  // Distribute keluar across 3-6 random days
  if (monthlyKeluar > 0) {
    const numDays = Math.min(Math.max(2, Math.floor(monthlyKeluar / 5)), 6);
    const days = new Set<number>();
    while (days.size < numDays) {
      days.add(Math.floor(Math.random() * daysInMonth) + 1);
    }
    const dayArr = Array.from(days).sort((a, b) => a - b);
    let remaining = monthlyKeluar;

    dayArr.forEach((day, idx) => {
      const isLast = idx === dayArr.length - 1;
      const qty = isLast ? remaining : Math.max(1, Math.floor(remaining / (dayArr.length - idx) + Math.random() * 3 - 1));
      remaining -= qty;
      if (qty <= 0) return;

      const existing = details.find((d) => d.tanggal === day);
      const keluar: DailyTransactionKeluar = {
        jumlah: qty,
        kelompokTani: kelompokTaniList[Math.floor(Math.random() * kelompokTaniList.length)],
        kecamatan: kecamatanList[Math.floor(Math.random() * kecamatanList.length)],
        arealSerangan: parseFloat((Math.random() * 10 + 0.5).toFixed(1)),
        jenisSerangan: jenisSeranganList[Math.floor(Math.random() * jenisSeranganList.length)],
      };

      if (existing) {
        existing.keluar.push(keluar);
      } else {
        details.push({
          tanggal: day,
          bulan,
          tahun,
          itemId,
          jenisPestisida,
          masuk: [],
          keluar: [keluar],
        });
      }
    });
  }

  // Distribute masuk across 1-2 days
  if (monthlyMasuk > 0) {
    const numDays = monthlyMasuk > 50 ? 2 : 1;
    const days = new Set<number>();
    while (days.size < numDays) {
      days.add(Math.floor(Math.random() * Math.min(15, daysInMonth)) + 1);
    }
    const dayArr = Array.from(days).sort((a, b) => a - b);
    let remaining = monthlyMasuk;

    dayArr.forEach((day, idx) => {
      const isLast = idx === dayArr.length - 1;
      const qty = isLast ? remaining : Math.floor(remaining / 2);
      remaining -= qty;
      if (qty <= 0) return;

      const lokasiId = itemLocationMap[itemId] || 'LOK-001';
      const lokasi = mockStorageLocations.find((l) => l.id === lokasiId);

      const masuk: DailyTransactionMasuk = {
        jumlah: qty,
        sumber: sumberList[Math.floor(Math.random() * sumberList.length)],
        lokasiPenyimpanan: lokasi?.nama || 'Rak A1 Gedung Utama',
      };

      const existing = details.find((d) => d.tanggal === day);
      if (existing) {
        existing.masuk.push(masuk);
      } else {
        details.push({
          tanggal: day,
          bulan,
          tahun,
          itemId,
          jenisPestisida,
          masuk: [masuk],
          keluar: [],
        });
      }
    });
  }

  return details.sort((a, b) => a.tanggal - b.tanggal);
}

// === Generate all daily transactions for all items ===
// Structure: itemId -> month -> DailyTransactionDetail[]
export const mockDailyTransactions: Record<string, Record<number, DailyTransactionDetail[]>> = {};

mockStockOpnameItems.forEach((item) => {
  mockDailyTransactions[item.id] = {};
  for (let m = 1; m <= 12; m++) {
    const mov = item.pergerakan[m] || { masuk: 0, keluar: 0 };
    mockDailyTransactions[item.id][m] = generateDailyTransactionsForItem(
      item.id,
      item.jenisPestisida,
      m,
      2026,
      mov.masuk,
      mov.keluar,
    );
  }
});

// === Generate daily movements (aggregate) from daily transactions ===
// Structure: itemId -> month -> day -> StockMovement
export function getDailyMovements(
  itemId: string,
  bulan: number,
  tahun: number,
): DailyMovements {
  const transactions = mockDailyTransactions[itemId]?.[bulan] || [];
  const daysInMonth = new Date(tahun, bulan, 0).getDate();
  const movements: DailyMovements = {};

  for (let d = 1; d <= daysInMonth; d++) {
    movements[d] = { masuk: 0, keluar: 0 };
  }

  transactions.forEach((t) => {
    const masukTotal = t.masuk.reduce((sum, m) => sum + m.jumlah, 0);
    const keluarTotal = t.keluar.reduce((sum, k) => sum + k.jumlah, 0);
    if (movements[t.tanggal]) {
      movements[t.tanggal].masuk += masukTotal;
      movements[t.tanggal].keluar += keluarTotal;
    }
  });

  return movements;
}

// === Get transaction details for a specific cell (item + day) ===
export function getTransactionDetails(
  itemId: string,
  bulan: number,
  tanggal: number,
): DailyTransactionDetail | null {
  const transactions = mockDailyTransactions[itemId]?.[bulan] || [];
  return transactions.find((t) => t.tanggal === tanggal) || null;
}

// === Lookup helpers ===
export function getStorageLocationById(id: string): StorageLocation | undefined {
  return mockStorageLocations.find((l) => l.id === id);
}

export function getStorageLocationByQr(qrCode: string): StorageLocation | undefined {
  return mockStorageLocations.find((l) => l.qrCode === qrCode);
}

export function getMedicineUnitByQr(qrCode: string): MedicineUnit | undefined {
  return mockMedicineUnits.find((u) => u.qrCode === qrCode);
}

export function getItemsByLocationId(locationId: string): StockOpnameItem[] {
  return mockStockOpnameItems.filter((i) => i.lokasiPenyimpananId === locationId);
}

export function getMedicineUnitsByItemId(itemId: string): MedicineUnit[] {
  return mockMedicineUnits.filter((u) => u.itemId === itemId);
}

/** Get days in a specific month */
export function getDaysInMonth(tahun: number, bulan: number): number {
  return new Date(tahun, bulan, 0).getDate();
}

// ============================================================
// === QR Code ID Helpers
// ============================================================

/** QR code type based on segment count */
export type QrCodeIdType = 'rack' | 'satuan_besar' | 'satuan_kecil' | 'unknown';

/**
 * Identify QR code type by counting dash-separated segments.
 * - 3 segments (xxx-xxx-xxx) → rack
 * - 6 segments (xxx-xxx-xxx-xx-xx-xxxx) → satuan_besar
 * - 7 segments (xxx-xxx-xxx-xx-xx-xxxx-xxxx) → satuan_kecil
 */
export function identifyQrCodeType(code: string): QrCodeIdType {
  if (!code) return 'unknown';
  const segments = code.split('-').length;
  if (segments === 3) return 'rack';
  if (segments === 6) return 'satuan_besar';
  if (segments === 7) return 'satuan_kecil';
  return 'unknown';
}

/** Find storage location by QR code, ID, or kode */
export function findStorageLocation(code: string): StorageLocation | undefined {
  return mockStorageLocations.find(
    (l) => l.qrCode === code || l.id === code || l.kode === code
  );
}

/** Find medicine unit by QR code or ID */
export function findMedicineUnit(code: string): MedicineUnit | undefined {
  return mockMedicineUnits.find(
    (u) => u.qrCode === code || u.id === code
  );
}

/** Get stock opname item by ID */
export function getStockOpnameItemById(id: string): StockOpnameItem | undefined {
  return mockStockOpnameItems.find((i) => i.id === id);
}

/** Validate QR code format and return type info */
export function validateQrFormat(code: string): {
  valid: boolean;
  type: QrCodeIdType;
  message: string;
} {
  const type = identifyQrCodeType(code);
  if (type === 'unknown') {
    return { valid: false, type, message: 'Format ID tidak dikenali. Gunakan format: xxx-xxx-xxx (rak), xxx-xxx-xxx-xx-xx-xxxx (kardus), atau xxx-xxx-xxx-xx-xx-xxxx-xxxx (satuan).' };
  }
  return { valid: true, type, message: `Format ${type === 'rack' ? 'rak gudang' : type === 'satuan_besar' ? 'satuan besar (kardus)' : 'satuan kecil (ecer)'} valid.` };
}

// # END OF Stock Opname Demo Data
