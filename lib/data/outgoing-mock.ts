// # START OF Outgoing Mock Data - Demo data for outgoing/distribution page
// Purpose: Mock data for warehouse outgoing workflow with FIFO stock tracking
// Dependencies: outgoing types, approval types

import {
  OutgoingItem,
  OutgoingStatus,
  StockBatchItem,
} from '@/lib/types/outgoing';

// ========== Stock Batch Items (available in warehouse with expiry for FIFO) ==========

export const mockStockBatches: StockBatchItem[] = [
  // Regent 50 SC - 3 batches
  {
    id: 'STK-001',
    medicineId: 'MED-003',
    nama: 'Regent 50 SC',
    bahanAktif: 'Fipronil 50 g/l',
    batchNumber: 'RGT-2025-001',
    barcode: 'RGT2025001A',
    expiryDate: new Date('2026-06-15'),
    quantity: 3,
    satuan: 'botol (500ml)',
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    lokasi: 'Rak A-1',
    isExpiringSoon: true,
  },
  {
    id: 'STK-002',
    medicineId: 'MED-003',
    nama: 'Regent 50 SC',
    bahanAktif: 'Fipronil 50 g/l',
    batchNumber: 'RGT-2025-002',
    barcode: 'RGT2025002B',
    expiryDate: new Date('2027-01-20'),
    quantity: 5,
    satuan: 'botol (500ml)',
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    lokasi: 'Rak A-1',
    isExpiringSoon: false,
  },
  {
    id: 'STK-003',
    medicineId: 'MED-003',
    nama: 'Regent 50 SC',
    bahanAktif: 'Fipronil 50 g/l',
    batchNumber: 'RGT-2026-001',
    barcode: 'RGT2026001C',
    expiryDate: new Date('2028-03-10'),
    quantity: 10,
    satuan: 'botol (500ml)',
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    lokasi: 'Rak A-2',
    isExpiringSoon: false,
  },

  // Virtako 300/60 WG - 2 batches
  {
    id: 'STK-004',
    medicineId: 'MED-002',
    nama: 'Virtako 300/60 WG',
    bahanAktif: 'Klorantraniliprol 300 g/kg + Tiametoksam 60 g/kg',
    batchNumber: 'VTK-2025-001',
    barcode: 'VTK2025001A',
    expiryDate: new Date('2026-04-30'),
    quantity: 4,
    satuan: 'pack (250g)',
    satuanBesar: 'pack (250g)',
    isiPerSatuanBesar: 250,
    lokasi: 'Rak B-2',
    isExpiringSoon: true,
  },
  {
    id: 'STK-005',
    medicineId: 'MED-002',
    nama: 'Virtako 300/60 WG',
    bahanAktif: 'Klorantraniliprol 300 g/kg + Tiametoksam 60 g/kg',
    batchNumber: 'VTK-2026-001',
    barcode: 'VTK2026001B',
    expiryDate: new Date('2028-08-15'),
    quantity: 8,
    satuan: 'pack (250g)',
    satuanBesar: 'pack (250g)',
    isiPerSatuanBesar: 250,
    lokasi: 'Rak B-2',
    isExpiringSoon: false,
  },

  // Marshal 200 EC - 2 batches
  {
    id: 'STK-006',
    medicineId: 'MED-007',
    nama: 'Marshal 200 EC',
    bahanAktif: 'Karbosulfan 200 g/l',
    batchNumber: 'MSL-2025-001',
    barcode: 'MSL2025001A',
    expiryDate: new Date('2026-05-20'),
    quantity: 3,
    satuan: 'botol (1L)',
    satuanBesar: 'botol (1L)',
    isiPerSatuanBesar: 1000,
    lokasi: 'Rak C-1',
    isExpiringSoon: true,
  },
  {
    id: 'STK-007',
    medicineId: 'MED-007',
    nama: 'Marshal 200 EC',
    bahanAktif: 'Karbosulfan 200 g/l',
    batchNumber: 'MSL-2026-001',
    barcode: 'MSL2026001B',
    expiryDate: new Date('2028-02-28'),
    quantity: 5,
    satuan: 'botol (1L)',
    satuanBesar: 'botol (1L)',
    isiPerSatuanBesar: 1000,
    lokasi: 'Rak C-1',
    isExpiringSoon: false,
  },

  // Demolish 18 EC - 2 batches
  {
    id: 'STK-008',
    medicineId: 'MED-006',
    nama: 'Demolish 18 EC',
    bahanAktif: 'Abamektin 18 g/l',
    batchNumber: 'DML-2025-001',
    barcode: 'DML2025001A',
    expiryDate: new Date('2026-07-10'),
    quantity: 5,
    satuan: 'botol (500ml)',
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    lokasi: 'Rak D-1',
    isExpiringSoon: true,
  },
  {
    id: 'STK-009',
    medicineId: 'MED-006',
    nama: 'Demolish 18 EC',
    bahanAktif: 'Abamektin 18 g/l',
    batchNumber: 'DML-2026-001',
    barcode: 'DML2026001B',
    expiryDate: new Date('2028-11-05'),
    quantity: 10,
    satuan: 'botol (500ml)',
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    lokasi: 'Rak D-1',
    isExpiringSoon: false,
  },

  // Antracol 70 WP - 2 batches
  {
    id: 'STK-010',
    medicineId: 'MED-008',
    nama: 'Antracol 70 WP',
    bahanAktif: 'Propineb 700 g/kg',
    batchNumber: 'ATC-2025-001',
    barcode: 'ATC2025001A',
    expiryDate: new Date('2026-08-22'),
    quantity: 3,
    satuan: 'pack (1kg)',
    satuanBesar: 'pack (1kg)',
    isiPerSatuanBesar: 1000,
    lokasi: 'Rak E-1',
    isExpiringSoon: true,
  },
  {
    id: 'STK-011',
    medicineId: 'MED-008',
    nama: 'Antracol 70 WP',
    bahanAktif: 'Propineb 700 g/kg',
    batchNumber: 'ATC-2026-001',
    barcode: 'ATC2026001B',
    expiryDate: new Date('2029-01-15'),
    quantity: 8,
    satuan: 'pack (1kg)',
    satuanBesar: 'pack (1kg)',
    isiPerSatuanBesar: 1000,
    lokasi: 'Rak E-1',
    isExpiringSoon: false,
  },

  // Pegasus 500 SC - 2 batches
  {
    id: 'STK-012',
    medicineId: 'MED-009',
    nama: 'Pegasus 500 SC',
    bahanAktif: 'Diafentiuron 500 g/l',
    batchNumber: 'PGS-2025-001',
    barcode: 'PGS2025001A',
    expiryDate: new Date('2026-09-05'),
    quantity: 2,
    satuan: 'botol (500ml)',
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    lokasi: 'Rak F-1',
    isExpiringSoon: true,
  },
  {
    id: 'STK-013',
    medicineId: 'MED-009',
    nama: 'Pegasus 500 SC',
    bahanAktif: 'Diafentiuron 500 g/l',
    batchNumber: 'PGS-2026-001',
    barcode: 'PGS2026001B',
    expiryDate: new Date('2028-06-20'),
    quantity: 6,
    satuan: 'botol (500ml)',
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    lokasi: 'Rak F-1',
    isExpiringSoon: false,
  },
];

// ========== Outgoing Items ==========

export const mockOutgoingItems: OutgoingItem[] = [
  // ─── 1. Proses Gudang – Poktan (from APR-006) ───
  {
    id: 'OUT-001',
    outgoingStatus: 'proses_gudang',
    kecamatan: 'Rengel',
    desa: 'Sumberejo',
    tipe: 'poktan',
    namaGrup: 'Sri Rejeki',
    ketuaGrup: 'Parman',
    nikKetuaGrup: '3523051609850012',
    hpKetuaGrup: '081234567812',
    poktanList: [
      {
        id: 'PKT-F01',
        nama: 'Sri Rejeki',
        ketua: 'Parman',
        nikKetua: '3523051609850012',
        hpKetua: '081234567812',
        komoditas: ['Padi'],
        luasTerserang: 6.0,
        luasWaspada: 3.0,
        opt: ['Wereng Batang Coklat', 'Penggerek Batang'],
      },
    ],
    diajukanOleh: {
      id: 'USR-001',
      nama: 'Budi Santoso',
      nip: '197803251999031001',
      jabatan: 'Koordinator PPL Kec. Rengel',
    },
    namaPopt: 'Ir. Siti Aminah',
    tanggalPengajuan: new Date('2026-02-05'),
    tanggalDisetujui: new Date('2026-02-08'),
    dokumen: [
      {
        id: 'DOC-012',
        tipe: 'surat_pengajuan',
        label: 'Surat Pengajuan Obat',
        nomor: 'SURAT/001/PPL-RGL/2026',
        filename: 'surat_pengajuan_001.pdf',
        url: '/uploads/letters/surat_pengajuan_001.pdf',
        uploadDate: new Date('2026-02-05'),
      },
    ],
    komoditas: ['Padi'],
    opt: ['Wereng Batang Coklat', 'Penggerek Batang'],
    preferensiObatBpp: ['Regent 50 SC', 'Virtako 300/60 WG'],
    obatDisetujui: [
      {
        id: 'AMD-007',
        medicineId: 'MED-003',
        nama: 'Regent 50 SC',
        bahanAktif: 'Fipronil 50 g/l',
        poktanId: 'PKT-F01',
        poktanNama: 'Sri Rejeki',
        jumlahBesar: 6,
        satuanBesar: 'botol (500ml)',
        jumlahKecil: 3000,
        satuanKecil: 'ml',
        isiPerSatuanBesar: 500,
        isPreferensiBpp: true,
        isRekomendasiOpt: true,
      },
      {
        id: 'AMD-008',
        medicineId: 'MED-002',
        nama: 'Virtako 300/60 WG',
        bahanAktif: 'Klorantraniliprol 300 g/kg + Tiametoksam 60 g/kg',
        poktanId: 'PKT-F01',
        poktanNama: 'Sri Rejeki',
        jumlahBesar: 4,
        satuanBesar: 'pack (250g)',
        jumlahKecil: 1000,
        satuanKecil: 'gram',
        isiPerSatuanBesar: 250,
        isPreferensiBpp: true,
        isRekomendasiOpt: true,
      },
      {
        id: 'AMD-009',
        medicineId: 'MED-007',
        nama: 'Marshal 200 EC',
        bahanAktif: 'Karbosulfan 200 g/l',
        poktanId: 'PKT-F01',
        poktanNama: 'Sri Rejeki',
        jumlahBesar: 3,
        satuanBesar: 'botol (1L)',
        jumlahKecil: 3000,
        satuanKecil: 'ml',
        isiPerSatuanBesar: 1000,
        isPreferensiBpp: false,
        isRekomendasiOpt: true,
      },
    ],
    catatan: 'Serangan tinggi, segera distribusi',
    catatanPersetujuan: 'Disetujui dengan penambahan Marshal 200 EC sebagai cadangan',
  },

  // ─── 2. Proses Gudang – Gapoktan (from APR-007) ───
  {
    id: 'OUT-002',
    outgoingStatus: 'proses_gudang',
    kecamatan: 'Kerek',
    desa: 'Margomulyo',
    tipe: 'gapoktan',
    namaGrup: 'Tani Jaya Makmur',
    ketuaGrup: 'Suparno',
    nikKetuaGrup: '3523051408700013',
    hpKetuaGrup: '081234567813',
    poktanList: [
      {
        id: 'PKT-G01',
        nama: 'Tani Jaya I',
        ketua: 'Suparno',
        nikKetua: '3523051408700013',
        hpKetua: '081234567813',
        komoditas: ['Cabai', 'Tomat'],
        luasTerserang: 2.0,
        luasWaspada: 1.5,
        opt: ['Antraknosa', 'Thrips'],
      },
      {
        id: 'PKT-G02',
        nama: 'Tani Jaya II',
        ketua: 'Kasimin',
        nikKetua: '3523052706720014',
        hpKetua: '081234567814',
        komoditas: ['Cabai'],
        luasTerserang: 1.5,
        luasWaspada: 1.0,
        opt: ['Kutu Daun', 'Thrips'],
      },
    ],
    diajukanOleh: {
      id: 'USR-003',
      nama: 'Dwi Hartono',
      nip: '199002101999031002',
      jabatan: 'Penyuluh Pertanian Lapangan',
    },
    namaPopt: 'Ir. Agung Prasetyo',
    tanggalPengajuan: new Date('2026-01-28'),
    tanggalDisetujui: new Date('2026-02-01'),
    dokumen: [
      {
        id: 'DOC-014',
        tipe: 'surat_pengajuan',
        label: 'Surat Pengajuan Obat Gapoktan',
        nomor: 'SURAT/010/PPL-KRK/2026',
        filename: 'surat_pengajuan_gapoktan_010.pdf',
        url: '/uploads/letters/surat_pengajuan_gapoktan_010.pdf',
        uploadDate: new Date('2026-01-28'),
      },
    ],
    komoditas: ['Cabai', 'Tomat'],
    opt: ['Antraknosa', 'Thrips', 'Kutu Daun'],
    preferensiObatBpp: ['Demolish 18 EC', 'Antracol 70 WP', 'Pegasus 500 SC'],
    obatDisetujui: [
      {
        id: 'AMD-010',
        medicineId: 'MED-006',
        nama: 'Demolish 18 EC',
        bahanAktif: 'Abamektin 18 g/l',
        poktanId: 'PKT-G01',
        poktanNama: 'Tani Jaya I',
        jumlahBesar: 3,
        satuanBesar: 'botol (500ml)',
        jumlahKecil: 1500,
        satuanKecil: 'ml',
        isiPerSatuanBesar: 500,
        isPreferensiBpp: true,
        isRekomendasiOpt: true,
      },
      {
        id: 'AMD-011',
        medicineId: 'MED-008',
        nama: 'Antracol 70 WP',
        bahanAktif: 'Propineb 700 g/kg',
        poktanId: 'PKT-G01',
        poktanNama: 'Tani Jaya I',
        jumlahBesar: 2,
        satuanBesar: 'pack (1kg)',
        jumlahKecil: 2000,
        satuanKecil: 'gram',
        isiPerSatuanBesar: 1000,
        isPreferensiBpp: true,
        isRekomendasiOpt: true,
      },
      {
        id: 'AMD-012',
        medicineId: 'MED-009',
        nama: 'Pegasus 500 SC',
        bahanAktif: 'Diafentiuron 500 g/l',
        poktanId: 'PKT-G02',
        poktanNama: 'Tani Jaya II',
        jumlahBesar: 2,
        satuanBesar: 'botol (500ml)',
        jumlahKecil: 1000,
        satuanKecil: 'ml',
        isiPerSatuanBesar: 500,
        isPreferensiBpp: true,
        isRekomendasiOpt: true,
      },
      {
        id: 'AMD-013',
        medicineId: 'MED-006',
        nama: 'Demolish 18 EC',
        bahanAktif: 'Abamektin 18 g/l',
        poktanId: 'PKT-G02',
        poktanNama: 'Tani Jaya II',
        jumlahBesar: 2,
        satuanBesar: 'botol (500ml)',
        jumlahKecil: 1000,
        satuanKecil: 'ml',
        isiPerSatuanBesar: 500,
        isPreferensiBpp: true,
        isRekomendasiOpt: true,
      },
    ],
    catatan: 'Mendekati musim panen, perlu penanganan segera',
    catatanPersetujuan: 'Disetujui. Prioritaskan distribusi Poktan I terlebih dahulu.',
  },

  // ─── 3. Proses Gudang – Poktan baru ───
  {
    id: 'OUT-003',
    outgoingStatus: 'proses_gudang',
    kecamatan: 'Semanding',
    desa: 'Bektiharjo',
    tipe: 'poktan',
    namaGrup: 'Harapan Baru',
    ketuaGrup: 'Mulyono',
    nikKetuaGrup: '3523051205870015',
    hpKetuaGrup: '081234567815',
    poktanList: [
      {
        id: 'PKT-H01',
        nama: 'Harapan Baru',
        ketua: 'Mulyono',
        nikKetua: '3523051205870015',
        hpKetua: '081234567815',
        komoditas: ['Padi', 'Jagung'],
        luasTerserang: 3.5,
        luasWaspada: 2.0,
        opt: ['Ulat Grayak', 'Belalang Kembara'],
      },
    ],
    diajukanOleh: {
      id: 'USR-002',
      nama: 'Sri Wahyuni',
      nip: '198505141999032001',
      jabatan: 'Penyuluh Pertanian Lapangan',
    },
    namaPopt: 'Ir. Agung Prasetyo',
    tanggalPengajuan: new Date('2026-02-20'),
    tanggalDisetujui: new Date('2026-02-25'),
    dokumen: [],
    komoditas: ['Padi', 'Jagung'],
    opt: ['Ulat Grayak', 'Belalang Kembara'],
    preferensiObatBpp: ['Regent 50 SC', 'Demolish 18 EC'],
    obatDisetujui: [
      {
        id: 'AMD-014',
        medicineId: 'MED-003',
        nama: 'Regent 50 SC',
        bahanAktif: 'Fipronil 50 g/l',
        poktanId: 'PKT-H01',
        poktanNama: 'Harapan Baru',
        jumlahBesar: 4,
        satuanBesar: 'botol (500ml)',
        jumlahKecil: 2000,
        satuanKecil: 'ml',
        isiPerSatuanBesar: 500,
        isPreferensiBpp: true,
        isRekomendasiOpt: true,
      },
      {
        id: 'AMD-015',
        medicineId: 'MED-006',
        nama: 'Demolish 18 EC',
        bahanAktif: 'Abamektin 18 g/l',
        poktanId: 'PKT-H01',
        poktanNama: 'Harapan Baru',
        jumlahBesar: 3,
        satuanBesar: 'botol (500ml)',
        jumlahKecil: 1500,
        satuanKecil: 'ml',
        isiPerSatuanBesar: 500,
        isPreferensiBpp: true,
        isRekomendasiOpt: false,
      },
    ],
    catatan: 'Serangan meluas di blok barat',
    catatanPersetujuan: 'Disetujui sesuai rekomendasi',
  },

  // ─── 4. Selesai – Poktan ───
  {
    id: 'OUT-004',
    outgoingStatus: 'selesai',
    kecamatan: 'Jenu',
    desa: 'Mentoso',
    tipe: 'poktan',
    namaGrup: 'Sejahtera',
    ketuaGrup: 'Hadi Pramono',
    nikKetuaGrup: '3523052205900009',
    hpKetuaGrup: '081234567809',
    poktanList: [
      {
        id: 'PKT-D01',
        nama: 'Sejahtera',
        ketua: 'Hadi Pramono',
        nikKetua: '3523052205900009',
        hpKetua: '081234567809',
        komoditas: ['Padi'],
        luasTerserang: 8.5,
        luasWaspada: 4.0,
        opt: ['Blast', 'Hawar Daun Bakteri'],
      },
    ],
    diajukanOleh: {
      id: 'USR-005',
      nama: 'Muhammad Iqbal',
      nip: '199208151999031003',
      jabatan: 'Penyuluh Pertanian Lapangan',
    },
    namaPopt: 'Ir. Siti Aminah',
    tanggalPengajuan: new Date('2026-01-10'),
    tanggalDisetujui: new Date('2026-01-15'),
    tanggalProsesGudang: new Date('2026-01-16'),
    tanggalSelesai: new Date('2026-01-16'),
    petugasGudang: {
      id: 'USR-010',
      nama: 'Ahmad Fauzi',
      nip: '198811201999031004',
    },
    dokumen: [],
    komoditas: ['Padi'],
    opt: ['Blast', 'Hawar Daun Bakteri'],
    preferensiObatBpp: ['Score 250 EC', 'Trichoderma harzianum'],
    obatDisetujui: [
      {
        id: 'AMD-001',
        medicineId: 'MED-001',
        nama: 'Score 250 EC',
        bahanAktif: 'Difenokonazol 250 g/l',
        poktanId: 'PKT-D01',
        poktanNama: 'Sejahtera',
        jumlahBesar: 5,
        satuanBesar: 'botol (500ml)',
        jumlahKecil: 2500,
        satuanKecil: 'ml',
        isiPerSatuanBesar: 500,
        isPreferensiBpp: true,
        isRekomendasiOpt: true,
      },
    ],
    beritaAcara: {
      id: 'BA-001',
      nomor: 'BA/001/GDG/2026',
      generatedAt: new Date('2026-01-16'),
      pdfUrl: '/uploads/ba/ba_001.pdf',
      signedPdfUrl: '/uploads/ba/ba_001_signed.pdf',
      isSigned: true,
    },
    catatan: 'Luas serangan cukup besar, prioritas tinggi',
    catatanPersetujuan: 'Disetujui sesuai rekomendasi POPT',
  },

  // ─── 5. Selesai – Gapoktan ───
  {
    id: 'OUT-005',
    outgoingStatus: 'selesai',
    kecamatan: 'Soko',
    desa: 'Pandanwangi',
    tipe: 'gapoktan',
    namaGrup: 'Mekar Sari Jaya',
    ketuaGrup: 'Suroto',
    nikKetuaGrup: '3523050804780010',
    hpKetuaGrup: '081234567810',
    poktanList: [
      {
        id: 'PKT-E01',
        nama: 'Mekar Sari I',
        ketua: 'Suroto',
        nikKetua: '3523050804780010',
        hpKetua: '081234567810',
        komoditas: ['Padi'],
        luasTerserang: 4.2,
        luasWaspada: 2.5,
        opt: ['Belalang Kembara', 'Ulat Grayak'],
      },
      {
        id: 'PKT-E02',
        nama: 'Mekar Sari II',
        ketua: 'Wagiran',
        nikKetua: '3523051703760011',
        hpKetua: '081234567811',
        komoditas: ['Padi', 'Jagung'],
        luasTerserang: 3.0,
        luasWaspada: 1.8,
        opt: ['Ulat Grayak', 'Penggerek Batang'],
      },
    ],
    diajukanOleh: {
      id: 'USR-002',
      nama: 'Sri Wahyuni',
      nip: '198505141999032001',
      jabatan: 'Penyuluh Pertanian Lapangan',
    },
    namaPopt: 'Ir. Agung Prasetyo',
    tanggalPengajuan: new Date('2026-01-05'),
    tanggalDisetujui: new Date('2026-01-08'),
    tanggalProsesGudang: new Date('2026-01-10'),
    tanggalSelesai: new Date('2026-01-10'),
    petugasGudang: {
      id: 'USR-010',
      nama: 'Ahmad Fauzi',
      nip: '198811201999031004',
    },
    dokumen: [],
    komoditas: ['Padi', 'Jagung'],
    opt: ['Belalang Kembara', 'Ulat Grayak', 'Penggerek Batang'],
    preferensiObatBpp: ['Petrokum 555 EC', 'BioNeem EC'],
    obatDisetujui: [
      {
        id: 'AMD-003',
        medicineId: 'MED-005',
        nama: 'Petrokum 555 EC',
        bahanAktif: 'Permetrin 55.5 g/l + Profenofos 500 g/l',
        poktanId: 'PKT-E01',
        poktanNama: 'Mekar Sari I',
        jumlahBesar: 4,
        satuanBesar: 'botol (500ml)',
        jumlahKecil: 2000,
        satuanKecil: 'ml',
        isiPerSatuanBesar: 500,
        isPreferensiBpp: true,
        isRekomendasiOpt: true,
      },
    ],
    beritaAcara: {
      id: 'BA-002',
      nomor: 'BA/002/GDG/2026',
      generatedAt: new Date('2026-01-10'),
      pdfUrl: '/uploads/ba/ba_002.pdf',
      signedPdfUrl: '/uploads/ba/ba_002_signed.pdf',
      isSigned: true,
    },
    catatan: 'Serangan bersamaan di dua poktan',
    catatanPersetujuan: 'Disetujui dengan tambahan Virtako untuk Poktan II',
  },
];

// ========== Helper Functions ==========

/** Filter by status */
export const getOutgoingByStatus = (status: OutgoingStatus): OutgoingItem[] =>
  mockOutgoingItems.filter((item) => item.outgoingStatus === status);

/** Get stats */
export const getOutgoingStats = () => {
  const stats: Record<OutgoingStatus, number> = {
    proses_gudang: 0,
    selesai: 0,
  };
  mockOutgoingItems.forEach((item) => {
    stats[item.outgoingStatus]++;
  });
  return { ...stats, total: mockOutgoingItems.length };
};

/** Get stock batches for a medicine (sorted by expiry - FIFO) */
export const getStockBatchesByMedicine = (medicineId: string): StockBatchItem[] =>
  mockStockBatches
    .filter((b) => b.medicineId === medicineId && b.quantity > 0)
    .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());

/** Lookup stock batch by barcode */
export const getStockByBarcode = (barcode: string): StockBatchItem | undefined =>
  mockStockBatches.find((b) => b.barcode === barcode);

/** Get total medicine items count from an outgoing item */
export const getTotalMedicineCount = (item: OutgoingItem): number =>
  (item.obatDisetujui ?? []).reduce((sum, med) => sum + med.jumlahBesar, 0);

/** Format date */
export const formatTanggalOutgoing = (date: Date): string =>
  date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

/** Truncate list */
export const truncateOutgoingList = (items: string[], max: number = 2): { visible: string[]; overflow: number } => {
  if (items.length <= max) return { visible: items, overflow: 0 };
  return { visible: items.slice(0, max), overflow: items.length - max };
};

/** Calculate days since date */
export const daysSince = (date: Date): number => {
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
};

/** Calculate days until expiry */
export const daysUntilExpiry = (date: Date): number => {
  const now = new Date();
  return Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

// # END OF Outgoing Mock Data
