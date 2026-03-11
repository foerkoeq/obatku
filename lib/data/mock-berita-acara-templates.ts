// ============================================================================
// MOCK DATA FOR BERITA ACARA TEMPLATES
// Default BA-01 template and sample preview data
// ============================================================================

import type {
  BATemplateConfig,
  BAPreviewData,
  BATextFormat,
} from '@/lib/types/berita-acara';

export const DEFAULT_TEXT_FORMAT: BATextFormat = {
  bold: false,
  italic: false,
  underline: false,
};

// ============================================================================
// DEFAULT TEMPLATE: BA-01
// ============================================================================

export const TEMPLATE_BA_01: BATemplateConfig = {
  id: 'ba-01-default',
  name: 'BA-01',
  code: 'BA-01',
  description: 'Template standar Berita Acara Serah Terima obat/pestisida pertanian',
  isDefault: true,
  isProtected: true,

  paper: {
    size: 'A4',
    orientation: 'portrait',
  },

  margins: {
    top: 2.45,
    bottom: 2.45,
    left: 2.45,
    right: 2.45,
  },

  font: {
    family: 'Arial',
    baseSizePt: 12,
  },

  kopSurat: {
    logo: {
      enabled: true,
      url: undefined, // Logo belum ada, menyusul
      widthCm: 2.12,
      heightCm: 1.42,
    },
    namaInstansi: 'PEMERINTAH KABUPATEN TUBAN',
    namaInstansiFontSize: 12,
    namaInstansiFormat: { bold: false, italic: false, underline: false },
    namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN',
    namaDinasFontSize: 14,
    namaDinasFormat: { bold: true, italic: false, underline: false },
    alamat: 'Jalan Mastrip No. 5, Sidorejo Tuban Jawa Timur 62315',
    alamatFontSize: 10,
    alamatFormat: { bold: false, italic: false, underline: false },
    kontak: 'Telepon (0356) 322086 Laman https://dkp2p.tubankab.go.id , Pos-el dkp2p@tubankab.go.id',
    kontakFontSize: 10,
    kontakFormat: { bold: false, italic: false, underline: false },
    separatorThicknessPt: 0.5,
    lineSpacing: 1.15,
  },

  judul: {
    text: 'BERITA ACARA SERAH TERIMA',
    fontSize: 12,
    bold: true,
    allCaps: true,
    underline: true,
  },

  nomor: {
    format: 'Nomor : 027 / {nomor} / 414.106.3 / {tahun}',
    fontSize: 12,
  },

  narratives: {
    pembukaan:
      'Pada hari ini, {hari} tanggal {tanggal} bulan {bulan} tahun Dua Ribu Dua Puluh {tahun}, bertempat di Kantor Dinas Ketahanan Pangan, Pertanian dan Perikanan Kabupaten Tuban, yang bertanda tangan di bawah ini',
    pembukaanFormat: { bold: false, italic: false, underline: false },

    labelPihakPertama: 'Pihak Pertama',
    biodataPihakPertama: {
      nama: '',
      pangkat: '',
      golongan: '',
      nip: '',
      jabatan: '',
      unitKerja: 'Dinas Ketahanan Pangan, Pertanian dan Perikanan Kabupaten Tuban',
    },
    redaksiPihakPertama:
      'Selanjutnya disebut sebagai PIHAK PERTAMA, yaitu pihak yang menyerahkan obat/pestisida pertanian.',
    redaksiPihakPertamaFormat: { bold: false, italic: false, underline: false },

    labelPihakKedua: 'Pihak Kedua',
    fieldLabelsPihakKedua: ['Nama', 'Jabatan', 'Nama Poktan/Gapoktan', 'Desa / Kecamatan'],
    redaksiPihakKedua:
      'Selanjutnya disebut sebagai PIHAK KEDUA, yaitu pihak yang menerima obat/pestisida pertanian.',
    redaksiPihakKeduaFormat: { bold: false, italic: false, underline: false },

    redaksiDasar:
      'Kedua belah pihak sepakat untuk melakukan serah terima obat/pestisida pertanian dalam rangka Pengendalian Organisme Pengganggu Tumbuhan (OPT), berdasarkan:',
    redaksiDasarFormat: { bold: false, italic: false, underline: false },
    dasarItems: [
      'Rekomendasi/Surat Pengantar dari Balai Penyuluhan Pertanian (BPP) Kecamatan Nomor : {nomorBPP} tanggal {tanggalBPP};',
      'Laporan/Rekomendasi Petugas Pengamat Organisme Pengganggu Tumbuhan (POPT) Nomor : {nomorPOPT} tanggal {tanggalPOPT}',
    ],

    redaksiSerahTerima:
      'Dengan ini menyatakan bahwa PIHAK PERTAMA telah menyerahkan kepada PIHAK KEDUA, dan PIHAK KEDUA telah menerima dari PIHAK PERTAMA berupa bantuan obat-obatan/pestisida pertanian dengan rincian sebagaimana tercantum dalam Lampiran Berita Acara ini.',
    redaksiSerahTerimaFormat: { bold: false, italic: false, underline: false },

    redaksiKetentuan:
      'Selanjutnya, PIHAK KEDUA menyatakan kesanggupan dan terikat dengan ketentuan sebagai berikut:',
    redaksiKetentuanFormat: { bold: false, italic: false, underline: false },
    ketentuanItems: [
      'Segera melaksanakan Gerakan Pengendalian (Gerdal) Organisme Pengganggu Tumbuhan (OPT) pada lahan yang terserang/terancam setelah menerima obat/pestisida ini, sesuai dengan dosis dan cara pemakaian yang dianjurkan bersama anggota kelompok tani / petugas lapangan.',
      'Menggunakan obat/pestisida sesuai peruntukan yaitu untuk pengendalian OPT sebagaimana tercantum dalam lampiran dan tidak diperkenankan untuk diperjualbelikan atau dialihfungsikan;',
      'Melaporkan kembali hasil pelaksanaan Gerakan Pengendalian kepada Dinas Ketahanan Pangan, Pertanian dan Perikanan Kabupaten Tuban melalui BPP Kecamatan dan Petugas POPT setempat, selambat-lambatnya 7 (tujuh) hari setelah pelaksanaan Gerakan Pengendalian;',
      'Bertanggung jawab atas penyimpanan dan penggunaan obat/pestisida yang telah diterima sesuai dengan standar keamanan penggunaan pestisida.',
    ],

    penutup:
      'Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya dalam rangkap 2 (dua) untuk dipergunakan sebagaimana mestinya.',
    penutupFormat: { bold: false, italic: false, underline: false },
  },

  tandaTangan: {
    pihakKedua: {
      label: 'Yang Menerima,',
      labelFormat: { bold: false, italic: false, underline: false },
      jabatanLabel: 'Ketua Poktan/Gapoktan',
    },
    pihakPertama: {
      label: 'Yang Menyerahkan,',
      labelFormat: { bold: false, italic: false, underline: false },
      jabatanLabel: 'Kepala Dinas Ketahanan Pangan,\nPertanian dan Perikanan\nKabupaten Tuban',
    },
  },

  lampiran: {
    identity: {
      lampLabel: 'Lampiran',
      lampValue: '1 (satu) berkas',
      nomorLabel: 'Nomor Berita Acara',
      nomorValueFormat: '027 / {nomor} / 414.106.3 / {tahun}',
      fontSize: 12,
      lineSpacing: 1.2,
      textFormat: { bold: false, italic: false, underline: false },
    },
    title: {
      text: 'Rincian Distribusi Obat Pertanian',
      fontSize: 14,
      lineSpacing: 1.2,
      textFormat: { bold: true, italic: false, underline: true },
    },
    table: {
      columns: [
        { key: 'nomor', label: 'No.', widthPercent: 3.5, align: 'center', format: { bold: false, italic: false, underline: false } },
        { key: 'wilayah', label: 'Kec. /\nDesa', widthPercent: 10, align: 'left', format: { bold: false, italic: false, underline: false } },
        { key: 'namaPoktan', label: 'Poktan /\nGapoktan', widthPercent: 10, align: 'left', format: { bold: false, italic: false, underline: false } },
        { key: 'ketuaPoktan', label: 'Ketua &\nNo. HP', widthPercent: 11, align: 'left', format: { bold: false, italic: false, underline: false } },
        { key: 'komoditas', label: 'Komo-\nditas', widthPercent: 8, align: 'left', format: { bold: false, italic: false, underline: false } },
        { key: 'opt', label: 'OPT', widthPercent: 9, align: 'left', format: { bold: false, italic: false, underline: false } },
        { key: 'luasSerangan', label: 'Luas\nSerangan\n(Ha)', widthPercent: 7, align: 'center', format: { bold: false, italic: false, underline: false } },
        { key: 'luasWaspada', label: 'Luas\nWaspada\n(Ha)', widthPercent: 7, align: 'center', format: { bold: false, italic: false, underline: false } },
        { key: 'merekKandungan', label: 'Merek /\nKandungan', widthPercent: 16, align: 'left', format: { bold: false, italic: false, underline: false } },
        { key: 'jumlah', label: 'Jml', widthPercent: 5.5, align: 'center', format: { bold: false, italic: false, underline: false } },
        { key: 'keterangan', label: 'Ket.', widthPercent: 12.5, align: 'left', format: { bold: false, italic: false, underline: false } },
      ],
      design: {
        borderColor: '#111827',
        borderWidthPt: 0.75,
        headerBackgroundColor: '#f3f4f6',
        headerTextColor: '#111827',
        bodyTextColor: '#111827',
        stripedRows: true,
        stripeColor: '#f9fafb',
        lineSpacing: 1.15,
      },
    },
    signature: {
      pihakKeduaLabel: 'Yang Menerima,',
      pihakPertamaLabel: 'Yang Menyerahkan,',
      showJabatan: true,
      showPangkatGolongan: true,
      showNip: true,
      textFormat: { bold: false, italic: false, underline: false },
      lineSpacing: 1.2,
    },
  },

  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-09T00:00:00Z',
};

// ============================================================================
// ALL DEFAULT TEMPLATES
// ============================================================================

export const DEFAULT_BA_TEMPLATES: BATemplateConfig[] = [TEMPLATE_BA_01];

// ============================================================================
// SAMPLE PREVIEW DATA
// ============================================================================

export const SAMPLE_BA_PREVIEW: BAPreviewData = {
  nomorSurat: 'xxxx',
  hari: 'Senin',
  tanggal: 'Sembilan',
  bulan: 'Maret',
  tahun: 'Enam',
  pihakPertama: {
    nama: 'Ir. WAHYU HIDAYAT, M.Si.',
    pangkat: 'Pembina Tk. I',
    golongan: 'IV/b',
    nip: '196805151999031002',
    jabatan: 'Kepala Bidang Tanaman Pangan dan Hortikultura',
    unitKerja: 'Dinas Ketahanan Pangan, Pertanian dan Perikanan Kabupaten Tuban',
  },
  pihakKedua: {
    nama: 'SUTRISNO',
    namaPoktan: 'Tani Makmur Jaya',
    desa: 'Sidorejo',
    kecamatan: 'Tuban',
  },
  nomorRekomendasiBPP: '..........................',
  tanggalRekomendasiBPP: '.........................',
  nomorRekomendasiPOPT: '..........................',
  tanggalRekomendasiPOPT: '..........................',
  lampiran: {
    lampiranNomor: '001',
    rows: [
      {
        nomor: '1',
        kecamatan: 'Tuban',
        desa: 'Sidorejo',
        namaPoktan: 'Tani Makmur Jaya',
        ketuaPoktan: 'Sutrisno',
        nomorHp: '0812-3456-7890',
        komoditas: ['Padi', 'Jagung'],
        opt: ['Wereng batang coklat', 'Penggerek batang'],
        luasSeranganHa: '12.50',
        luasWaspadaHa: '18.75',
        merekKandungan: ['Curacron 500 EC (Profenofos)', 'Matador 25 EC (Lambda Sihalotrin)'],
        jumlah: '40 L',
        keterangan: 'Distribusi tahap I',
      },
      {
        nomor: '2',
        kecamatan: 'Merakurak',
        desa: 'Temayang',
        namaPoktan: 'Gapoktan Sejahtera',
        ketuaPoktan: 'Mulyono',
        nomorHp: '0821-9876-5432',
        komoditas: ['Cabai'],
        opt: ['Thrips', 'Antraknosa'],
        luasSeranganHa: '4.20',
        luasWaspadaHa: '6.10',
        merekKandungan: ['Antracol 70 WP (Propineb)', 'Abacel 18 EC (Abamektin)'],
        jumlah: '18 Kg',
        keterangan: 'Prioritas serangan tinggi',
      },
    ],
  },
};

// ============================================================================
// PAPER SIZE DIMENSIONS (mm)
// ============================================================================

export const PAPER_SIZES: Record<string, { width: number; height: number; label: string }> = {
  A4: { width: 210, height: 297, label: 'A4 (210 × 297 mm)' },
  F4: { width: 215, height: 330, label: 'F4 / Folio (215 × 330 mm)' },
};

// ============================================================================
// AVAILABLE FONTS
// ============================================================================

export const AVAILABLE_FONTS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Segoe UI', label: 'Segoe UI' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
];

// ============================================================================
// UTILITIES
// ============================================================================

export function createBlankBATemplate(): BATemplateConfig {
  const now = new Date().toISOString();
  return {
    ...TEMPLATE_BA_01,
    id: `ba-${Date.now()}`,
    name: '',
    code: '',
    description: '',
    isDefault: false,
    isProtected: false,
    createdAt: now,
    updatedAt: now,
  };
}

/** Replace template placeholders with actual data for preview */
export function resolveNarrative(text: string, data: BAPreviewData): string {
  return text
    .replace(/\{hari\}/g, data.hari)
    .replace(/\{tanggal\}/g, data.tanggal)
    .replace(/\{bulan\}/g, data.bulan)
    .replace(/\{tahun\}/g, data.tahun)
    .replace(/\{nomor\}/g, data.nomorSurat)
    .replace(/\{nomorBPP\}/g, data.nomorRekomendasiBPP)
    .replace(/\{tanggalBPP\}/g, data.tanggalRekomendasiBPP)
    .replace(/\{nomorPOPT\}/g, data.nomorRekomendasiPOPT)
    .replace(/\{tanggalPOPT\}/g, data.tanggalRekomendasiPOPT);
}
