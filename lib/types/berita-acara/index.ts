// ============================================================================
// LEGACY TYPES (kept for backward compatibility with berita-acara-form.tsx)
// ============================================================================

export interface KopSurat {
  logo?: string;
  namaInstansi: string;
  namaDinas: string;
  alamat: string;
  telepon: string;
  laman?: string;
  email: string;
}

export interface PejabatDinas {
  nama: string;
  nip: string;
  jabatan: string;
  instansi: string;
}

export interface KoordinatorBPP {
  nama: string;
  jabatan: string;
  instansi: string;
  namaKecamatan: string;
  nip: string;
}

export interface BarangBantuan {
  nomor: number;
  kategoriObat: string;
  opt: string;
  merekDagang: string;
  jumlah: string;
  keterangan?: string;
}

export interface KelompokTani {
  nama: string;
  namaKetua: string;
  lokasiLahan: string;
  luasLahanTerserang: string;
  jenisKomoditas: string;
  jenisOPT: string;
}

export interface SuratPermintaan {
  nomor: string;
  tanggal: string;
}

export interface BeritaAcaraData {
  kopSurat: KopSurat;
  nomorSurat: string;
  namaHari: string;
  tanggal: string;
  bulan: string;
  tahun: string;
  pihakPertama: PejabatDinas;
  pihakKedua: KoordinatorBPP;
  kategoriObat: string;
  daftarBarang: BarangBantuan[];
  suratPermintaan: SuratPermintaan;
  kelompokTani: KelompokTani;
  customNarrative?: {
    pembukaan?: string;
    penutup?: string;
    keterangan?: string;
  };
}

// ============================================================================
// BA TEMPLATE CONFIG TYPES (new system for template settings)
// ============================================================================

export type BAPaperSize = 'A4' | 'F4';

export interface BAPaperConfig {
  size: BAPaperSize;
  orientation: 'portrait' | 'landscape';
}

export interface BAMarginConfig {
  top: number;    // cm
  bottom: number;
  left: number;
  right: number;
}

export interface BAFontConfig {
  family: string;
  baseSizePt: number;
}

export interface BALogoConfig {
  enabled: boolean;
  url?: string;
  widthCm: number;
  heightCm: number;
}

export interface BAKopSuratConfig {
  logo: BALogoConfig;
  namaInstansi: string;
  namaInstansiFontSize: number;
  namaDinas: string;
  namaDinasFontSize: number;
  alamat: string;
  alamatFontSize: number;
  kontak: string;
  kontakFontSize: number;
  separatorThicknessPt: number;
}

export interface BAJudulConfig {
  text: string;
  fontSize: number;
  bold: boolean;
  allCaps: boolean;
  underline: boolean;
}

export interface BANomorConfig {
  format: string; // e.g. "Nomor : 027 / {nomor} / 414.106.3 / {tahun}"
  fontSize: number;
}

export interface BANarrativeConfig {
  pembukaan: string;

  labelPihakPertama: string;
  fieldsPihakPertama: { label: string; defaultValue: string }[];
  redaksiPihakPertama: string;

  labelPihakKedua: string;
  fieldsPihakKedua: { label: string; defaultValue: string }[];
  redaksiPihakKedua: string;

  redaksiDasar: string;
  dasarItems: string[];

  redaksiSerahTerima: string;

  redaksiKetentuan: string;
  ketentuanItems: string[];

  penutup: string;
}

export interface BATandaTanganConfig {
  pihakKedua: {
    label: string;
    jabatanLabel: string;
  };
  pihakPertama: {
    label: string;
    jabatanLabel: string;
  };
}

export interface BATemplateConfig {
  id: string;
  name: string;
  code: string;
  description: string;
  isDefault: boolean;
  isProtected: boolean;

  paper: BAPaperConfig;
  margins: BAMarginConfig;
  font: BAFontConfig;

  kopSurat: BAKopSuratConfig;
  judul: BAJudulConfig;
  nomor: BANomorConfig;
  narratives: BANarrativeConfig;
  tandaTangan: BATandaTanganConfig;

  createdAt: string;
  updatedAt: string;
}

export type BAPageView =
  | 'template-list'
  | 'template-detail'
  | 'template-customize';

// Preview fill data (for live preview)
export interface BAPreviewData {
  nomorSurat: string;
  hari: string;
  tanggal: string;
  bulan: string;
  tahun: string;
  pihakPertama: {
    nama: string;
    nip: string;
    jabatan: string;
    pangkat: string;
  };
  pihakKedua: {
    nama: string;
    namaPoktan: string;
    desa: string;
    kecamatan: string;
  };
  nomorRekomendasiBPP: string;
  tanggalRekomendasiBPP: string;
  nomorRekomendasiPOPT: string;
  tanggalRekomendasiPOPT: string;
}

// ============================================================================
// LEGACY WRAPPER TYPES (kept for backward compatibility)
// ============================================================================

export interface BeritaAcaraTemplate {
  id: string;
  name: string;
  description?: string;
  kopSurat: KopSurat;
  defaultNarrative: {
    pembukaan: string;
    penutup: string;
    keterangan: string;
  };
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BeritaAcaraSettings {
  templates: BeritaAcaraTemplate[];
  defaultTemplateId: string;
  printSettings: {
    pageSize: 'A4' | 'Letter';
    margin: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    orientation: 'portrait' | 'landscape';
  };
}
