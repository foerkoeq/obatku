// # START OF Transaction List Mock Data - Demo data for revamped transaction list
// Purpose: Provide comprehensive mock data covering all statuses + medicine stock
// Features: 8 transactions (one per status), 13 medicine stock items
// Dependencies: transaction-list types

import {
  TrxListItem,
  TrxStatus,
  MedicineStockItem,
  TRX_STATUS_CONFIG,
} from '@/lib/types/transaction-list';

// ========== Mock Transactions (1 per status) ==========

export const mockTrxList: TrxListItem[] = [
  // 1. Draft BPP
  {
    id: 'TRX-001',
    status: 'draft_bpp',
    diajukanOleh: { id: 'USR-001', nama: 'Budi Santoso', nip: '197803251999031001' },
    tanggalDiajukan: new Date('2026-02-20'),
    poktan: {
      id: 'PKT-001',
      nama: 'Tani Mandiri',
      tipe: 'poktan',
      ketua: 'Slamet Riyadi',
      desa: 'Jambanan',
      kecamatan: 'Gondang',
    },
    luasTerserang: 3.5,
    luasWaspada: 2.0,
    opt: ['Wereng Batang Coklat'],
    jenisPestisida: ['kimia'],
    kandunganDikehendaki: 'Fipronil',
    permintaanObat: ['Regent 50 SC'],
    catatan: 'Masih dalam penyusunan data lapangan',
    createdAt: new Date('2026-02-20T08:00:00Z'),
    updatedAt: new Date('2026-02-20T08:00:00Z'),
  },
  // 2. Pengajuan ke Dinas
  {
    id: 'TRX-002',
    status: 'pengajuan_dinas',
    diajukanOleh: { id: 'USR-002', nama: 'Sri Wahyuni', nip: '198505141999032001' },
    namaPopt: 'Ir. Agung Prasetyo',
    tanggalDiajukan: new Date('2026-02-22'),
    poktan: {
      id: 'PKT-002',
      nama: 'Subur Jaya',
      tipe: 'poktan',
      ketua: 'Agus Purnomo',
      desa: 'Kraguman',
      kecamatan: 'Kalijambe',
    },
    luasTerserang: 5.0,
    luasWaspada: 3.0,
    opt: ['Ulat Grayak', 'Belalang Kembara'],
    jenisPestisida: ['kimia', 'nabati'],
    kandunganDikehendaki: 'Permetrin, Azadirachtin',
    permintaanObat: ['Petrokum 555 EC', 'BioNeem EC'],
    catatan: 'Serangan meluas, perlu penanganan segera',
    createdAt: new Date('2026-02-22T09:15:00Z'),
    updatedAt: new Date('2026-02-22T09:15:00Z'),
  },
  // 3. Persetujuan Dinas
  {
    id: 'TRX-003',
    status: 'persetujuan_dinas',
    diajukanOleh: { id: 'USR-003', nama: 'Dwi Hartono', nip: '199002101999031002' },
    namaPopt: 'Ir. Siti Aminah',
    tanggalDiajukan: new Date('2026-02-18'),
    tanggalDisetujui: new Date('2026-02-24'),
    poktan: {
      id: 'PKT-003',
      nama: 'Maju Bersama',
      tipe: 'poktan',
      ketua: 'Bambang Sutrisno',
      desa: 'Blumbang',
      kecamatan: 'Masaran',
    },
    luasTerserang: 1.8,
    luasWaspada: 1.2,
    opt: ['Thrips', 'Kutu Daun'],
    jenisPestisida: ['kimia'],
    kandunganDikehendaki: 'Abamektin, Diafentiuron',
    permintaanObat: ['Demolish 18 EC', 'Pegasus 500 SC'],
    persetujuanObat: ['Demolish 18 EC', 'Pegasus 500 SC'],
    createdAt: new Date('2026-02-18T10:45:00Z'),
    updatedAt: new Date('2026-02-24T14:30:00Z'),
  },
  // 4. Ditolak
  {
    id: 'TRX-004',
    status: 'ditolak',
    diajukanOleh: { id: 'USR-004', nama: 'Retno Wulandari', nip: '199506201999032003' },
    namaPopt: 'Ir. Agung Prasetyo',
    tanggalDiajukan: new Date('2026-02-15'),
    poktan: {
      id: 'PKT-004',
      nama: 'Harapan Baru',
      tipe: 'poktan',
      ketua: 'Sugeng Rianto',
      desa: 'Pilangsari',
      kecamatan: 'Gesi',
    },
    luasTerserang: 0.5,
    luasWaspada: 0.3,
    opt: ['Penggerek Batang'],
    jenisPestisida: ['kimia'],
    kandunganDikehendaki: 'Klorantraniliprol',
    permintaanObat: ['Virtako 300/60 WG'],
    catatan: 'Ditolak: Luas serangan belum memenuhi syarat minimal',
    createdAt: new Date('2026-02-15T11:20:00Z'),
    updatedAt: new Date('2026-02-17T09:00:00Z'),
  },
  // 5. Dikembalikan
  {
    id: 'TRX-005',
    status: 'dikembalikan',
    diajukanOleh: { id: 'USR-005', nama: 'Muhammad Iqbal', nip: '199208151999031003' },
    namaPopt: 'Ir. Siti Aminah',
    tanggalDiajukan: new Date('2026-02-19'),
    poktan: {
      id: 'PKT-005',
      nama: 'Sejahtera',
      tipe: 'poktan',
      ketua: 'Hadi Pramono',
      desa: 'Segaran',
      kecamatan: 'Tanon',
    },
    luasTerserang: 8.5,
    luasWaspada: 4.0,
    opt: ['Blast', 'Hawar Daun Bakteri'],
    jenisPestisida: ['kimia', 'agen_hayati'],
    kandunganDikehendaki: 'Difenokonazol, Trichoderma',
    permintaanObat: ['Score 250 EC', 'Trichoderma harzianum'],
    catatan: 'Dikembalikan: Data luasan perlu diverifikasi ulang oleh POPT',
    createdAt: new Date('2026-02-19T14:10:00Z'),
    updatedAt: new Date('2026-02-21T10:30:00Z'),
  },
  // 6. Proses Gudang
  {
    id: 'TRX-006',
    status: 'proses_gudang',
    diajukanOleh: { id: 'USR-002', nama: 'Sri Wahyuni', nip: '198505141999032001' },
    namaPopt: 'Ir. Agung Prasetyo',
    tanggalDiajukan: new Date('2026-02-10'),
    tanggalDisetujui: new Date('2026-02-12'),
    poktan: {
      id: 'PKT-006',
      nama: 'Mekar Sari',
      tipe: 'poktan',
      ketua: 'Suroto',
      desa: 'Banaran',
      kecamatan: 'Sambungmacan',
    },
    luasTerserang: 4.2,
    luasWaspada: 2.5,
    opt: ['Belalang Kembara', 'Ulat Grayak'],
    jenisPestisida: ['kimia', 'nabati'],
    kandunganDikehendaki: 'Permetrin, Azadirachtin',
    permintaanObat: ['Petrokum 555 EC', 'BioNeem EC'],
    persetujuanObat: ['Petrokum 555 EC', 'BioNeem EC', 'MimbaPlus'],
    createdAt: new Date('2026-02-10T07:30:00Z'),
    updatedAt: new Date('2026-02-14T11:00:00Z'),
  },
  // 7. Pengambilan (with BAST)
  {
    id: 'TRX-007',
    status: 'pengambilan',
    noBast: 'BAST/007/DISTAN-SRG/II/2026',
    diajukanOleh: { id: 'USR-001', nama: 'Budi Santoso', nip: '197803251999031001' },
    namaPopt: 'Ir. Siti Aminah',
    tanggalDiajukan: new Date('2026-02-05'),
    tanggalDisetujui: new Date('2026-02-07'),
    poktan: {
      id: 'PKT-007',
      nama: 'Sri Rejeki',
      tipe: 'poktan',
      ketua: 'Parman',
      desa: 'Nglorog',
      kecamatan: 'Sragen',
    },
    luasTerserang: 6.0,
    luasWaspada: 3.0,
    opt: ['Wereng Batang Coklat', 'Penggerek Batang'],
    jenisPestisida: ['kimia'],
    kandunganDikehendaki: 'Fipronil, Klorantraniliprol',
    permintaanObat: ['Regent 50 SC', 'Virtako 300/60 WG'],
    persetujuanObat: ['Regent 50 SC', 'Virtako 300/60 WG', 'Marshal 200 EC'],
    createdAt: new Date('2026-02-05T08:00:00Z'),
    updatedAt: new Date('2026-02-20T15:00:00Z'),
  },
  // 8. Selesai (with BAST)
  {
    id: 'TRX-008',
    status: 'selesai',
    noBast: 'BAST/008/DISTAN-SRG/I/2026',
    diajukanOleh: { id: 'USR-003', nama: 'Dwi Hartono', nip: '199002101999031002' },
    namaPopt: 'Ir. Agung Prasetyo',
    tanggalDiajukan: new Date('2026-01-20'),
    tanggalDisetujui: new Date('2026-01-22'),
    poktan: {
      id: 'PKT-008',
      nama: 'Tani Jaya',
      tipe: 'gapoktan',
      ketua: 'Suparno',
      desa: 'Pilangsari',
      kecamatan: 'Ngrampal',
    },
    luasTerserang: 2.0,
    luasWaspada: 1.5,
    opt: ['Antraknosa'],
    jenisPestisida: ['kimia'],
    kandunganDikehendaki: 'Propineb',
    permintaanObat: ['Antracol 70 WP'],
    persetujuanObat: ['Antracol 70 WP', 'Score 250 EC'],
    createdAt: new Date('2026-01-20T09:00:00Z'),
    updatedAt: new Date('2026-02-01T16:00:00Z'),
  },
];

// ========== Medicine Stock Data ==========

export const mockMedicineStock: MedicineStockItem[] = [
  // Kimia/Sintetik
  {
    id: 'MED-001',
    nama: 'Score 250 EC',
    bahanAktif: 'Difenokonazol 250 g/l',
    jenis: 'kimia',
    targetOpt: ['Blast', 'Bercak Daun', 'Hawar Daun Bakteri', 'Antraknosa'],
    stokBesar: 20,
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    stokKecil: 2500,
    satuanKecil: 'ml',
  },
  {
    id: 'MED-002',
    nama: 'Virtako 300/60 WG',
    bahanAktif: 'Klorantraniliprol 300 g/kg + Tiametoksam 60 g/kg',
    jenis: 'kimia',
    targetOpt: ['Penggerek Batang', 'Wereng Batang Coklat'],
    stokBesar: 15,
    satuanBesar: 'pack (250g)',
    isiPerSatuanBesar: 250,
    stokKecil: 1500,
    satuanKecil: 'gram',
  },
  {
    id: 'MED-003',
    nama: 'Regent 50 SC',
    bahanAktif: 'Fipronil 50 g/l',
    jenis: 'kimia',
    targetOpt: ['Wereng Batang Coklat', 'Walang Sangit', 'Hama Tanah'],
    stokBesar: 25,
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    stokKecil: 3000,
    satuanKecil: 'ml',
  },
  {
    id: 'MED-004',
    nama: 'Sidafur 300 EC',
    bahanAktif: 'Karbofuran 300 g/l',
    jenis: 'kimia',
    targetOpt: ['Wereng Batang Coklat', 'Nematoda'],
    stokBesar: 10,
    satuanBesar: 'botol (1L)',
    isiPerSatuanBesar: 1000,
    stokKecil: 5000,
    satuanKecil: 'ml',
  },
  {
    id: 'MED-005',
    nama: 'Petrokum 555 EC',
    bahanAktif: 'Permetrin 55.5 g/l + Profenofos 500 g/l',
    jenis: 'kimia',
    targetOpt: ['Ulat Grayak', 'Ulat Api', 'Belalang Kembara'],
    stokBesar: 18,
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    stokKecil: 4000,
    satuanKecil: 'ml',
  },
  {
    id: 'MED-006',
    nama: 'Demolish 18 EC',
    bahanAktif: 'Abamektin 18 g/l',
    jenis: 'kimia',
    targetOpt: ['Thrips', 'Kutu Daun', 'Tungau'],
    stokBesar: 22,
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    stokKecil: 5500,
    satuanKecil: 'ml',
  },
  {
    id: 'MED-007',
    nama: 'Marshal 200 EC',
    bahanAktif: 'Karbosulfan 200 g/l',
    jenis: 'kimia',
    targetOpt: ['Wereng Batang Coklat', 'Penggerek Batang'],
    stokBesar: 12,
    satuanBesar: 'botol (1L)',
    isiPerSatuanBesar: 1000,
    stokKecil: 6000,
    satuanKecil: 'ml',
  },
  {
    id: 'MED-008',
    nama: 'Antracol 70 WP',
    bahanAktif: 'Propineb 700 g/kg',
    jenis: 'kimia',
    targetOpt: ['Antraknosa', 'Bercak Daun', 'Busuk Buah'],
    stokBesar: 30,
    satuanBesar: 'pack (1kg)',
    isiPerSatuanBesar: 1000,
    stokKecil: 15000,
    satuanKecil: 'gram',
  },
  {
    id: 'MED-009',
    nama: 'Pegasus 500 SC',
    bahanAktif: 'Diafentiuron 500 g/l',
    jenis: 'kimia',
    targetOpt: ['Thrips', 'Kutu Daun', 'Kutu Kebul'],
    stokBesar: 14,
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    stokKecil: 3500,
    satuanKecil: 'ml',
  },
  // Nabati
  {
    id: 'MED-010',
    nama: 'BioNeem EC',
    bahanAktif: 'Azadirachtin 10 g/l',
    jenis: 'nabati',
    targetOpt: ['Wereng Batang Coklat', 'Ulat Grayak', 'Kutu Daun', 'Belalang Kembara'],
    stokBesar: 16,
    satuanBesar: 'botol (500ml)',
    isiPerSatuanBesar: 500,
    stokKecil: 4000,
    satuanKecil: 'ml',
  },
  {
    id: 'MED-011',
    nama: 'MimbaPlus',
    bahanAktif: 'Ekstrak Mimba 50 g/l',
    jenis: 'nabati',
    targetOpt: ['Ulat Grayak', 'Hama Umum', 'Belalang Kembara'],
    stokBesar: 20,
    satuanBesar: 'botol (1L)',
    isiPerSatuanBesar: 1000,
    stokKecil: 10000,
    satuanKecil: 'ml',
  },
  // Agen Hayati
  {
    id: 'MED-012',
    nama: 'Beauveria bassiana',
    bahanAktif: 'Cendawan Entomopatogen (10⁸ konidia/g)',
    jenis: 'agen_hayati',
    targetOpt: ['Wereng Batang Coklat', 'Penggerek Batang', 'Ulat Grayak'],
    stokBesar: 25,
    satuanBesar: 'pack (500g)',
    isiPerSatuanBesar: 500,
    stokKecil: 6000,
    satuanKecil: 'gram',
  },
  {
    id: 'MED-013',
    nama: 'Trichoderma harzianum',
    bahanAktif: 'Cendawan Antagonis (10⁹ konidia/g)',
    jenis: 'agen_hayati',
    targetOpt: ['Blast', 'Penyakit Tanah', 'Hawar Daun Bakteri'],
    stokBesar: 30,
    satuanBesar: 'pack (1kg)',
    isiPerSatuanBesar: 1000,
    stokKecil: 15000,
    satuanKecil: 'gram',
  },
  {
    id: 'MED-014',
    nama: 'Metarhizium anisopliae',
    bahanAktif: 'Cendawan Entomopatogen (10⁸ konidia/g)',
    jenis: 'agen_hayati',
    targetOpt: ['Wereng Batang Coklat', 'Hama Tanah', 'Ulat Tanah'],
    stokBesar: 18,
    satuanBesar: 'pack (500g)',
    isiPerSatuanBesar: 500,
    stokKecil: 4500,
    satuanKecil: 'gram',
  },
];

// ========== Helper Functions ==========

export const getTrxStats = () => {
  const stats: Record<TrxStatus, number> = {
    draft_bpp: 0,
    pengajuan_dinas: 0,
    persetujuan_dinas: 0,
    ditolak: 0,
    dikembalikan: 0,
    proses_gudang: 0,
    pengambilan: 0,
    selesai: 0,
  };
  mockTrxList.forEach((t) => {
    stats[t.status]++;
  });
  return { ...stats, total: mockTrxList.length };
};

export const getUniqueKecamatan = (): string[] => {
  return [...new Set(mockTrxList.map((t) => t.poktan.kecamatan))].sort();
};

export const getUniqueYears = (): number[] => {
  return [...new Set(mockTrxList.map((t) => t.tanggalDiajukan.getFullYear()))].sort((a, b) => b - a);
};

/** Get recommended medicines based on OPT and BPP request names */
export const getRecommendedMedicines = (
  opt: string[],
  requestedNames: string[]
): MedicineStockItem[] => {
  return mockMedicineStock.filter(
    (med) =>
      med.targetOpt.some((target) =>
        opt.some(
          (o) =>
            target.toLowerCase().includes(o.toLowerCase()) ||
            o.toLowerCase().includes(target.toLowerCase())
        )
      ) ||
      requestedNames.some((name) =>
        med.nama.toLowerCase().includes(name.toLowerCase())
      )
  );
};

// # END OF Transaction List Mock Data
