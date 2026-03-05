import { KategoriObat, KategoriUtama } from '../types/kategoriObat';
import { KATEGORI_OBAT_PERTANIAN } from '../data/mockKategoriObat';

/**
 * 1. Fungsi untuk mengambil SEMUA data kategori (biasanya untuk tabel master data)
 */
export const getAllKategori = async (): Promise<KategoriObat[]> => {
  return KATEGORI_OBAT_PERTANIAN;
};

/**
 * 2. Fungsi untuk mengambil daftar Kategori Utama saja tanpa duplikat
 * Hasilnya nanti array teks: ['Pestisida Kimia / Sintetik', 'Pestisida Nabati', 'Agen Hayati']
 * Cocok untuk Dropdown pertama di form input obat.
 */
export const getKategoriUtama = async (): Promise<KategoriUtama[]> => {
  // Menggunakan Set untuk menghilangkan nama kategori yang dobel
  const kategoriSet = new Set(KATEGORI_OBAT_PERTANIAN.map(item => item.kategori));
  return Array.from(kategoriSet);
};

/**
 * 3. Fungsi untuk mengambil 'Jenis' berdasarkan 'Kategori Utama' yang dipilih
 * Cocok untuk Dropdown kedua (Dropdown Jenis) yang bergantung pada Dropdown pertama.
 */
export const getJenisByKategori = async (kategoriTerpilih: KategoriUtama): Promise<KategoriObat[]> => {
  return KATEGORI_OBAT_PERTANIAN.filter(item => item.kategori === kategoriTerpilih);
};

/**
 * 4. Fungsi untuk mencari detail satu kategori berdasarkan ID-nya (Misal: ID 101)
 * Sangat berguna saat menampilkan detail obat.
 */
export const getKategoriById = async (id: number): Promise<KategoriObat | undefined> => {
  return KATEGORI_OBAT_PERTANIAN.find(item => item.id === id);
};