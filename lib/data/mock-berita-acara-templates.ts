// ============================================================================
// MOCK DATA FOR BERITA ACARA TEMPLATES
// Default BA-01 template and sample preview data
// ============================================================================

import type {
  BATemplateConfig,
  BAPreviewData,
} from '@/lib/types/berita-acara';

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
    namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN',
    namaDinasFontSize: 14,
    alamat: 'Jalan Mastrip No. 5, Sidorejo Tuban Jawa Timur 62315',
    alamatFontSize: 10,
    kontak: 'Telepon (0356) 322086 Laman https://dkp2p.tubankab.go.id , Pos-el dkp2p@tubankab.go.id',
    kontakFontSize: 10,
    separatorThicknessPt: 0.5,
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

    labelPihakPertama: 'Pihak Pertama',
    fieldsPihakPertama: [
      { label: 'Nama', defaultValue: '' },
      { label: 'NIP', defaultValue: '' },
      { label: 'Jabatan', defaultValue: '' },
      { label: 'Unit Kerja', defaultValue: 'Dinas Ketahanan Pangan, Pertanian dan Perikanan Kabupaten Tuban' },
    ],
    redaksiPihakPertama:
      'Selanjutnya disebut sebagai PIHAK PERTAMA, yaitu pihak yang menyerahkan obat/pestisida pertanian.',

    labelPihakKedua: 'Pihak Kedua',
    fieldsPihakKedua: [
      { label: 'Nama', defaultValue: '' },
      { label: 'Jabatan', defaultValue: 'Ketua Kelompok Tani / Gapoktan' },
      { label: 'Nama Poktan/Gapoktan', defaultValue: '' },
      { label: 'Desa / Kecamatan', defaultValue: '' },
    ],
    redaksiPihakKedua:
      'Selanjutnya disebut sebagai PIHAK KEDUA, yaitu pihak yang menerima obat/pestisida pertanian.',

    redaksiDasar:
      'Kedua belah pihak sepakat untuk melakukan serah terima obat/pestisida pertanian dalam rangka Pengendalian Organisme Pengganggu Tumbuhan (OPT), berdasarkan:',
    dasarItems: [
      'Rekomendasi/Surat Pengantar dari Balai Penyuluhan Pertanian (BPP) Kecamatan Nomor : {nomorBPP} tanggal {tanggalBPP};',
      'Laporan/Rekomendasi Petugas Pengamat Organisme Pengganggu Tumbuhan (POPT) Nomor : {nomorPOPT} tanggal {tanggalPOPT}',
    ],

    redaksiSerahTerima:
      'Dengan ini menyatakan bahwa PIHAK PERTAMA telah menyerahkan kepada PIHAK KEDUA, dan PIHAK KEDUA telah menerima dari PIHAK PERTAMA berupa bantuan obat-obatan/pestisida pertanian dengan rincian sebagaimana tercantum dalam Lampiran Berita Acara ini.',

    redaksiKetentuan:
      'Selanjutnya, PIHAK KEDUA menyatakan kesanggupan dan terikat dengan ketentuan sebagai berikut:',
    ketentuanItems: [
      'Segera melaksanakan Gerakan Pengendalian (Gerdal) Organisme Pengganggu Tumbuhan (OPT) pada lahan yang terserang/terancam setelah menerima obat/pestisida ini, sesuai dengan dosis dan cara pemakaian yang dianjurkan bersama anggota kelompok tani / petugas lapangan.',
      'Menggunakan obat/pestisida sesuai peruntukan yaitu untuk pengendalian OPT sebagaimana tercantum dalam lampiran dan tidak diperkenankan untuk diperjualbelikan atau dialihfungsikan;',
      'Melaporkan kembali hasil pelaksanaan Gerakan Pengendalian kepada Dinas Ketahanan Pangan, Pertanian dan Perikanan Kabupaten Tuban melalui BPP Kecamatan dan Petugas POPT setempat, selambat-lambatnya 7 (tujuh) hari setelah pelaksanaan Gerakan Pengendalian;',
      'Bertanggung jawab atas penyimpanan dan penggunaan obat/pestisida yang telah diterima sesuai dengan standar keamanan penggunaan pestisida.',
    ],

    penutup:
      'Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya dalam rangkap 2 (dua) untuk dipergunakan sebagaimana mestinya.',
  },

  tandaTangan: {
    pihakKedua: {
      label: 'Yang Menerima,',
      jabatanLabel: 'Ketua Poktan/Gapoktan',
    },
    pihakPertama: {
      label: 'Yang Menyerahkan,',
      jabatanLabel: 'Kepala Dinas Ketahanan Pangan,\nPertanian dan Perikanan\nKabupaten Tuban',
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
    nip: '196805151999031002',
    jabatan: 'Kepala Bidang Tanaman Pangan dan Hortikultura',
    pangkat: 'Pembina Tk. I (IV/b)',
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
