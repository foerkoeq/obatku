import { z } from "zod";

// =============================================
// Types untuk Selected Group dari Modal
// =============================================

export interface SelectedPoktanInfo {
  namaPoktan: string;
  ketua: {
    nama: string;
    nik: string;
    noHp: string;
  };
}

export interface SelectedGroupInfo {
  id: string;
  jenis: "Poktan" | "Gapoktan";
  namaKelompokTani: string;
  namaGapoktan?: string;
  ketuaGapoktan?: {
    nama: string;
    nik: string;
    noHp: string;
  };
  poktan: SelectedPoktanInfo[];
  /** Nama poktan yang aktif (untuk gapoktan, bisa hapus beberapa) */
  activePoktanNames: string[];
}

// =============================================
// Types untuk per-poktan data
// =============================================

export interface PoktanAttackData {
  poktanId: string; // "{groupId}_{poktanName}"
  namaPoktan: string;
  namaKetua: string;
  komoditas: string;
  luasSerangan: number;
  luasWaspada: number;
  opt: string[];
  optLainnya?: string;
}

export interface PoktanPreferenceData {
  poktanId: string;
  namaPoktan: string;
  opt: string;
  jenisPestisida?: "kimia" | "nabati" | "agen_hayati";
  selectedMedicineIds: string[];
  skipped: boolean;
}

export interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

// =============================================
// Main Form Data (state-based, bukan zod driven)
// =============================================

export interface SubmissionFormData {
  // Step 1
  kecamatan: string;
  desa: string;
  selectedGroups: SelectedGroupInfo[];

  // Step 2
  poktanAttacks: PoktanAttackData[];

  // Step 3
  poktanPreferences: PoktanPreferenceData[];

  // Step 4
  nomorSuratPengajuanBPP: string;
  suratPengajuanBPP: UploadedFile | null;
  nomorSuratRekomendasiPOPT: string;
  rekomendasiPOPT: UploadedFile | null;
  dokumenLainnya: UploadedFile[];
}

// =============================================
// Validation helpers per step
// =============================================

export function validateStep1(data: SubmissionFormData): string[] {
  const errors: string[] = [];
  if (!data.kecamatan) errors.push("Kecamatan wajib dipilih");
  if (!data.desa) errors.push("Desa wajib dipilih");
  if (data.selectedGroups.length === 0) errors.push("Minimal satu kelompok tani harus dipilih");

  // Validate each group has active poktan
  for (const group of data.selectedGroups) {
    if (group.activePoktanNames.length === 0) {
      errors.push(`Kelompok "${group.namaKelompokTani}" harus memiliki minimal satu poktan aktif`);
    }
  }

  return errors;
}

export function validateStep2(data: SubmissionFormData): string[] {
  const errors: string[] = [];
  if (data.poktanAttacks.length === 0) errors.push("Data serangan wajib diisi");

  for (const attack of data.poktanAttacks) {
    if (!attack.komoditas) errors.push(`Komoditas untuk "${attack.namaPoktan}" wajib dipilih`);
    if (!attack.luasSerangan || attack.luasSerangan <= 0)
      errors.push(`Luas serangan untuk "${attack.namaPoktan}" harus lebih dari 0`);
    if (attack.luasWaspada < 0)
      errors.push(`Luas waspada untuk "${attack.namaPoktan}" tidak boleh negatif`);
    if (!attack.opt || attack.opt.length === 0)
      errors.push(`OPT untuk "${attack.namaPoktan}" wajib dipilih`);
    if (attack.opt.includes("Lainnya") && !attack.optLainnya)
      errors.push(`Keterangan OPT lainnya untuk "${attack.namaPoktan}" wajib diisi`);
  }

  return errors;
}

export function validateStep3(_data: SubmissionFormData): string[] {
  // Step 3 is optional (can be skipped)
  return [];
}

export function validateStep4(data: SubmissionFormData): string[] {
  const errors: string[] = [];
  if (!data.nomorSuratPengajuanBPP.trim()) {
    errors.push("No. surat pengajuan/rekomendasi dari BPP wajib diisi");
  }
  if (!data.suratPengajuanBPP) {
    errors.push("Surat Pengajuan/Rekomendasi dari BPP wajib diunggah");
  }
  return errors;
}

export const STEP_VALIDATORS = [validateStep1, validateStep2, validateStep3, validateStep4];

// =============================================
// Default form data
// =============================================

export const DEFAULT_FORM_DATA: SubmissionFormData = {
  kecamatan: "",
  desa: "",
  selectedGroups: [],
  poktanAttacks: [],
  poktanPreferences: [],
  nomorSuratPengajuanBPP: "",
  suratPengajuanBPP: null,
  nomorSuratRekomendasiPOPT: "",
  rekomendasiPOPT: null,
  dokumenLainnya: [],
};
