// src/types/kategoriObat.ts

/**
 * 1. Union Type
 * Ini ibarat aturan "Pilihan Ganda".
 * Kategori utama HANYA BISA diisi oleh salah satu dari 3 teks di bawah ini.
 * Kalau nanti di data ada yang ngetik "Pestisida Kimiawi" (salah ketik),
 * TypeScript akan langsung ngasih garis merah (error).
 */
export type KategoriUtama = 
  | 'Pestisida Kimia / Sintetik' 
  | 'Pestisida Nabati' 
  | 'Agen Hayati';

/**
 * 2. Interface
 * Ini adalah "Cetakan Tabel"-nya.
 * Kita mewajibkan setiap baris data kategori harus punya id, kategori, dan jenis.
 */
export interface KategoriObat {
  id: number;           // Menggunakan angka (number) karena ID-nya berupa angka 100, 101, dst.
  kategori: KategoriUtama; // Menggunakan aturan pilihan ganda di atas
  jenis: string;        // String (teks bebas) untuk nama jenisnya
}