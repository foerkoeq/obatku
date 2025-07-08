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
  // Header Information
  kopSurat: KopSurat;
  nomorSurat: string;
  
  // Date Information
  namaHari: string;
  tanggal: string;
  bulan: string;
  tahun: string;
  
  // Parties Information
  pihakPertama: PejabatDinas;
  pihakKedua: KoordinatorBPP;
  
  // Content Information
  kategoriObat: string; // pestisida/agen hayati/pesnab/poc
  daftarBarang: BarangBantuan[];
  
  // Reference Information
  suratPermintaan: SuratPermintaan;
  kelompokTani: KelompokTani;
  
  // Custom narrative sections
  customNarrative?: {
    pembukaan?: string;
    penutup?: string;
    keterangan?: string;
  };
}

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
