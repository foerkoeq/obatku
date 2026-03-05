// # START OF Approval Mock Data - Demo data for revamped approval page
// Purpose: Provide comprehensive mock data for all 3 approval statuses
// Features: Mixed poktan/gapoktan, documents, medicines, realistic Indonesian data
// Dependencies: approval types, transaction-list mock (medicine stock)

import {
  ApprovalItem,
  ApprovalPoktanDetail,
  ApprovalDocument,
  ApprovedMedicineDetail,
  ApprovalStatus,
} from '@/lib/types/approval';

// ========== Mock Approval Items ==========

export const mockApprovalItems: ApprovalItem[] = [
  // ─── 1. Pengajuan ke Dinas – Poktan (single) ───
  {
    id: 'APR-001',
    status: 'pengajuan_dinas',
    kecamatan: 'Semanding',
    desa: 'Bektiharjo',
    tipe: 'poktan',
    namaGrup: 'Subur Jaya',
    ketuaGrup: 'Agus Purnomo',
    nikKetuaGrup: '3523051205870001',
    hpKetuaGrup: '081234567801',
    poktanList: [
      {
        id: 'PKT-A01',
        nama: 'Subur Jaya',
        ketua: 'Agus Purnomo',
        nikKetua: '3523051205870001',
        hpKetua: '081234567801',
        komoditas: ['Padi', 'Jagung'],
        luasTerserang: 5.0,
        luasWaspada: 3.0,
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
    tanggalPengajuan: new Date('2026-02-22'),
    dokumen: [
      {
        id: 'DOC-001',
        tipe: 'surat_pengajuan',
        label: 'Surat Pengajuan Obat',
        nomor: 'SURAT/002/PPL-SMD/2026',
        filename: 'surat_pengajuan_002.pdf',
        url: '/uploads/letters/surat_pengajuan_002.pdf',
        uploadDate: new Date('2026-02-22'),
      },
      {
        id: 'DOC-002',
        tipe: 'surat_popt',
        label: 'Rekomendasi POPT',
        nomor: 'POPT/012/REC/2026',
        filename: 'rekomendasi_popt_012.pdf',
        url: '/uploads/letters/rekomendasi_popt_012.pdf',
        uploadDate: new Date('2026-02-21'),
      },
    ],
    komoditas: ['Padi', 'Jagung'],
    opt: ['Ulat Grayak', 'Belalang Kembara'],
    preferensiObatBpp: ['Petrokum 555 EC', 'BioNeem EC'],
    catatan: 'Serangan meluas di blok barat, perlu penanganan segera',
  },

  // ─── 2. Pengajuan ke Dinas – Gapoktan (multi-poktan) ───
  {
    id: 'APR-002',
    status: 'pengajuan_dinas',
    kecamatan: 'Plumpang',
    desa: 'Kedungsoko',
    tipe: 'gapoktan',
    namaGrup: 'Tani Mandiri Jaya',
    ketuaGrup: 'Slamet Riyadi',
    nikKetuaGrup: '3523051507750002',
    hpKetuaGrup: '081234567802',
    poktanList: [
      {
        id: 'PKT-B01',
        nama: 'Tani Mandiri I',
        ketua: 'Bambang Sutrisno',
        nikKetua: '3523052301800003',
        hpKetua: '081234567803',
        komoditas: ['Padi'],
        luasTerserang: 3.5,
        luasWaspada: 2.0,
        opt: ['Wereng Batang Coklat', 'Penggerek Batang'],
      },
      {
        id: 'PKT-B02',
        nama: 'Tani Mandiri II',
        ketua: 'Suroto',
        nikKetua: '3523050804780004',
        hpKetua: '081234567804',
        komoditas: ['Padi', 'Kedelai'],
        luasTerserang: 2.8,
        luasWaspada: 1.5,
        opt: ['Wereng Batang Coklat'],
      },
      {
        id: 'PKT-B03',
        nama: 'Tani Mandiri III',
        ketua: 'Parman',
        nikKetua: '3523051609850005',
        hpKetua: '081234567805',
        komoditas: ['Jagung'],
        luasTerserang: 1.2,
        luasWaspada: 0.8,
        opt: ['Ulat Grayak', 'Belalang Kembara'],
      },
      {
        id: 'PKT-B04',
        nama: 'Tani Mandiri IV',
        ketua: 'Hadi Pramono',
        nikKetua: '3523052205900006',
        hpKetua: '081234567806',
        komoditas: ['Padi'],
        luasTerserang: 4.0,
        luasWaspada: 2.5,
        opt: ['Blast', 'Hawar Daun Bakteri'],
      },
      {
        id: 'PKT-B05',
        nama: 'Tani Mandiri V',
        ketua: 'Sugeng Rianto',
        nikKetua: '3523051103820007',
        hpKetua: '081234567807',
        komoditas: ['Padi', 'Jagung'],
        luasTerserang: 2.0,
        luasWaspada: 1.0,
        opt: ['Penggerek Batang'],
      },
    ],
    diajukanOleh: {
      id: 'USR-001',
      nama: 'Budi Santoso',
      nip: '197803251999031001',
      jabatan: 'Koordinator PPL Kec. Plumpang',
    },
    namaPopt: 'Ir. Siti Aminah',
    tanggalPengajuan: new Date('2026-02-25'),
    dokumen: [
      {
        id: 'DOC-003',
        tipe: 'surat_pengajuan',
        label: 'Surat Pengajuan Obat Gapoktan',
        nomor: 'SURAT/005/PPL-PLP/2026',
        filename: 'surat_pengajuan_gapoktan_005.pdf',
        url: '/uploads/letters/surat_pengajuan_gapoktan_005.pdf',
        uploadDate: new Date('2026-02-25'),
      },
      {
        id: 'DOC-004',
        tipe: 'surat_popt',
        label: 'Rekomendasi POPT',
        nomor: 'POPT/019/REC/2026',
        filename: 'rekomendasi_popt_019.pdf',
        url: '/uploads/letters/rekomendasi_popt_019.pdf',
        uploadDate: new Date('2026-02-24'),
      },
      {
        id: 'DOC-005',
        tipe: 'dokumen_lainnya',
        label: 'Foto Dokumentasi Serangan',
        filename: 'foto_serangan_plumpang.zip',
        url: '/uploads/docs/foto_serangan_plumpang.zip',
        uploadDate: new Date('2026-02-24'),
      },
    ],
    komoditas: ['Padi', 'Jagung', 'Kedelai'],
    opt: ['Wereng Batang Coklat', 'Penggerek Batang', 'Ulat Grayak', 'Belalang Kembara', 'Blast', 'Hawar Daun Bakteri'],
    preferensiObatBpp: ['Regent 50 SC', 'Virtako 300/60 WG', 'Petrokum 555 EC', 'BioNeem EC'],
    catatan: 'Gapoktan dengan 5 poktan terdampak di wilayah Kec. Plumpang, perlu penanganan terpadu',
  },

  // ─── 3. Pengajuan ke Dinas – Poktan ───
  {
    id: 'APR-003',
    status: 'pengajuan_dinas',
    kecamatan: 'Palang',
    desa: 'Gesikharjo',
    tipe: 'poktan',
    namaGrup: 'Maju Bersama',
    ketuaGrup: 'Bambang Sutrisno',
    nikKetuaGrup: '3523050506830008',
    hpKetuaGrup: '081234567808',
    poktanList: [
      {
        id: 'PKT-C01',
        nama: 'Maju Bersama',
        ketua: 'Bambang Sutrisno',
        nikKetua: '3523050506830008',
        hpKetua: '081234567808',
        komoditas: ['Cabai'],
        luasTerserang: 1.8,
        luasWaspada: 1.2,
        opt: ['Thrips', 'Kutu Daun', 'Antraknosa'],
      },
    ],
    diajukanOleh: {
      id: 'USR-003',
      nama: 'Dwi Hartono',
      nip: '199002101999031002',
      jabatan: 'Penyuluh Pertanian Lapangan',
    },
    namaPopt: 'Ir. Siti Aminah',
    tanggalPengajuan: new Date('2026-02-28'),
    dokumen: [
      {
        id: 'DOC-006',
        tipe: 'surat_pengajuan',
        label: 'Surat Pengajuan Obat',
        nomor: 'SURAT/008/PPL-PLG/2026',
        filename: 'surat_pengajuan_008.pdf',
        url: '/uploads/letters/surat_pengajuan_008.pdf',
        uploadDate: new Date('2026-02-28'),
      },
      {
        id: 'DOC-007',
        tipe: 'surat_popt',
        label: 'Rekomendasi POPT',
        nomor: 'POPT/022/REC/2026',
        filename: 'rekomendasi_popt_022.pdf',
        url: '/uploads/letters/rekomendasi_popt_022.pdf',
        uploadDate: new Date('2026-02-27'),
      },
    ],
    komoditas: ['Cabai'],
    opt: ['Thrips', 'Kutu Daun', 'Antraknosa'],
    preferensiObatBpp: ['Demolish 18 EC', 'Pegasus 500 SC'],
    catatan: 'Serangan thrips intensitas sedang, perlu penanganan cepat sebelum masa panen',
  },

  // ─── 4. Persetujuan Dinas – Poktan ───
  {
    id: 'APR-004',
    status: 'persetujuan_dinas',
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
    tanggalPengajuan: new Date('2026-02-15'),
    tanggalDisetujui: new Date('2026-02-20'),
    dokumen: [
      {
        id: 'DOC-008',
        tipe: 'surat_pengajuan',
        label: 'Surat Pengajuan Obat',
        nomor: 'SURAT/003/PPL-JNU/2026',
        filename: 'surat_pengajuan_003.pdf',
        url: '/uploads/letters/surat_pengajuan_003.pdf',
        uploadDate: new Date('2026-02-15'),
      },
      {
        id: 'DOC-009',
        tipe: 'surat_popt',
        label: 'Rekomendasi POPT',
        nomor: 'POPT/009/REC/2026',
        filename: 'rekomendasi_popt_009.pdf',
        url: '/uploads/letters/rekomendasi_popt_009.pdf',
        uploadDate: new Date('2026-02-14'),
      },
    ],
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
      {
        id: 'AMD-002',
        medicineId: 'MED-013',
        nama: 'Trichoderma harzianum',
        bahanAktif: 'Cendawan Antagonis (10⁹ konidia/g)',
        poktanId: 'PKT-D01',
        poktanNama: 'Sejahtera',
        jumlahBesar: 3,
        satuanBesar: 'pack (1kg)',
        jumlahKecil: 3000,
        satuanKecil: 'gram',
        isiPerSatuanBesar: 1000,
        isPreferensiBpp: true,
        isRekomendasiOpt: true,
      },
    ],
    catatan: 'Luas serangan cukup besar, prioritas tinggi',
    catatanPersetujuan: 'Disetujui sesuai rekomendasi POPT, segera proses distribusi',
  },

  // ─── 5. Persetujuan Dinas – Gapoktan ───
  {
    id: 'APR-005',
    status: 'persetujuan_dinas',
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
    tanggalPengajuan: new Date('2026-02-10'),
    tanggalDisetujui: new Date('2026-02-14'),
    dokumen: [
      {
        id: 'DOC-010',
        tipe: 'surat_pengajuan',
        label: 'Surat Pengajuan Obat Gapoktan',
        nomor: 'SURAT/001/PPL-SKO/2026',
        filename: 'surat_pengajuan_gapoktan_001.pdf',
        url: '/uploads/letters/surat_pengajuan_gapoktan_001.pdf',
        uploadDate: new Date('2026-02-10'),
      },
      {
        id: 'DOC-011',
        tipe: 'surat_popt',
        label: 'Rekomendasi POPT',
        nomor: 'POPT/006/REC/2026',
        filename: 'rekomendasi_popt_006.pdf',
        url: '/uploads/letters/rekomendasi_popt_006.pdf',
        uploadDate: new Date('2026-02-09'),
      },
    ],
    komoditas: ['Padi', 'Jagung'],
    opt: ['Belalang Kembara', 'Ulat Grayak', 'Penggerek Batang'],
    preferensiObatBpp: ['Petrokum 555 EC', 'BioNeem EC', 'MimbaPlus'],
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
      {
        id: 'AMD-004',
        medicineId: 'MED-010',
        nama: 'BioNeem EC',
        bahanAktif: 'Azadirachtin 10 g/l',
        poktanId: 'PKT-E01',
        poktanNama: 'Mekar Sari I',
        jumlahBesar: 3,
        satuanBesar: 'botol (500ml)',
        jumlahKecil: 1500,
        satuanKecil: 'ml',
        isiPerSatuanBesar: 500,
        isPreferensiBpp: true,
        isRekomendasiOpt: true,
      },
      {
        id: 'AMD-005',
        medicineId: 'MED-005',
        nama: 'Petrokum 555 EC',
        bahanAktif: 'Permetrin 55.5 g/l + Profenofos 500 g/l',
        poktanId: 'PKT-E02',
        poktanNama: 'Mekar Sari II',
        jumlahBesar: 3,
        satuanBesar: 'botol (500ml)',
        jumlahKecil: 1500,
        satuanKecil: 'ml',
        isiPerSatuanBesar: 500,
        isPreferensiBpp: true,
        isRekomendasiOpt: true,
      },
      {
        id: 'AMD-006',
        medicineId: 'MED-002',
        nama: 'Virtako 300/60 WG',
        bahanAktif: 'Klorantraniliprol 300 g/kg + Tiametoksam 60 g/kg',
        poktanId: 'PKT-E02',
        poktanNama: 'Mekar Sari II',
        jumlahBesar: 2,
        satuanBesar: 'pack (250g)',
        jumlahKecil: 500,
        satuanKecil: 'gram',
        isiPerSatuanBesar: 250,
        isPreferensiBpp: false,
        isRekomendasiOpt: true,
      },
    ],
    catatan: 'Serangan bersamaan di dua poktan',
    catatanPersetujuan: 'Disetujui dengan tambahan Virtako untuk Poktan II sesuai rekomendasi POPT',
  },

  // ─── 6. Proses Gudang – Poktan ───
  {
    id: 'APR-006',
    status: 'proses_gudang',
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
      {
        id: 'DOC-013',
        tipe: 'surat_popt',
        label: 'Rekomendasi POPT',
        nomor: 'POPT/003/REC/2026',
        filename: 'rekomendasi_popt_003.pdf',
        url: '/uploads/letters/rekomendasi_popt_003.pdf',
        uploadDate: new Date('2026-02-04'),
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

  // ─── 7. Proses Gudang – Gapoktan ───
  {
    id: 'APR-007',
    status: 'proses_gudang',
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
      {
        id: 'DOC-015',
        tipe: 'surat_popt',
        label: 'Rekomendasi POPT',
        nomor: 'POPT/001/REC/2026',
        filename: 'rekomendasi_popt_001.pdf',
        url: '/uploads/letters/rekomendasi_popt_001.pdf',
        uploadDate: new Date('2026-01-27'),
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
];

// ========== Helper Functions ==========

/** Get approval items by status */
export const getApprovalsByStatus = (status: ApprovalStatus): ApprovalItem[] =>
  mockApprovalItems.filter((item) => item.status === status);

/** Get all pending approvals (pengajuan_dinas + persetujuan_dinas + proses_gudang) */
export const getAllPendingApprovals = (): ApprovalItem[] =>
  mockApprovalItems;

/** Get stats by status */
export const getApprovalStats = () => {
  const stats: Record<ApprovalStatus, number> = {
    pengajuan_dinas: 0,
    persetujuan_dinas: 0,
    proses_gudang: 0,
  };
  mockApprovalItems.forEach((item) => {
    stats[item.status]++;
  });
  return { ...stats, total: mockApprovalItems.length };
};

/** Get recommended medicines for given OPT list */
export const getRecommendedMedicinesByOpt = (
  optList: string[],
  allMedicines: { id: string; nama: string; targetOpt: string[] }[]
): string[] => {
  const ids = new Set<string>();
  allMedicines.forEach((med) => {
    if (
      med.targetOpt.some((target) =>
        optList.some(
          (o) =>
            target.toLowerCase().includes(o.toLowerCase()) ||
            o.toLowerCase().includes(target.toLowerCase())
        )
      )
    ) {
      ids.add(med.id);
    }
  });
  return Array.from(ids);
};

/** Format date to Indonesian locale string */
export const formatTanggal = (date: Date): string => {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/** Truncate array and show +N */
export const truncateList = (items: string[], max: number = 2): { visible: string[]; overflow: number } => {
  if (items.length <= max) return { visible: items, overflow: 0 };
  return { visible: items.slice(0, max), overflow: items.length - max };
};

// # END OF Approval Mock Data
