// src/data/mockKategoriObat.ts

// Import cetakan/aturan yang kita buat di file types
import { KategoriObat } from '../types/kategoriObat';

/**
 * KATEGORI_OBAT_PERTANIAN
 * Tanda titik dua dan kurung siku `: KategoriObat[]` artinya:
 * Variable ini HARUS berupa Array (kumpulan) yang setiap isinya 
 * mematuhi aturan KategoriObat.
 */
export const KATEGORI_OBAT_PERTANIAN: KategoriObat[] = [
  // --- PESTISIDA KIMIA / SINTETIK ---
  { id: 100, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Serangga & Tungau' },
  { id: 101, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Insektisida' },
  { id: 102, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Akarisida' },
  { id: 103, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Termitisida' },
  { id: 104, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Ovisida' },
  { id: 105, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Larvasida' },
  { id: 106, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Adultisida' },
  
  { id: 110, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Serangan Hama Lain' },
  { id: 111, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Rodentisida' },
  { id: 112, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Moluskisida' },
  { id: 113, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Nematisida' },
  { id: 114, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Avisida' },
  { id: 115, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Piskisida' },
  
  { id: 120, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Sasaran Penyakit & Mikroba' },
  { id: 121, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Fungisida' },
  { id: 122, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Bakterisida' },
  { id: 123, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Algasida' },
  { id: 124, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Lichenisida' },
  
  { id: 130, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Sasaran Tumbuhan & Fisiologi' },
  { id: 131, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Herbisida' },
  { id: 132, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Silvisida' },
  { id: 133, kategori: 'Pestisida Kimia / Sintetik', jenis: 'ZPT (Zat Pengatur Tumbuh)' },
  { id: 134, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Defolian' },
  { id: 135, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Desikan' },
  
  { id: 140, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Pendukung & Khusus' },
  { id: 141, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Atraktan Kimia' },
  { id: 142, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Repelan Kimia' },
  { id: 143, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Fumigan' },
  { id: 144, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Pengawet Kayu' },
  { id: 145, kategori: 'Pestisida Kimia / Sintetik', jenis: 'Adjuvan (Perekat/Perata)' },

  // --- PESTISIDA NABATI ---
  { id: 200, kategori: 'Pestisida Nabati', jenis: 'Racun Nabati' },
  { id: 201, kategori: 'Pestisida Nabati', jenis: 'Insektisida Nabati' },
  { id: 202, kategori: 'Pestisida Nabati', jenis: 'Fungisida Nabati' },
  { id: 203, kategori: 'Pestisida Nabati', jenis: 'Bakterisida Nabati' },
  { id: 204, kategori: 'Pestisida Nabati', jenis: 'Moluskisida Nabati' },
  { id: 205, kategori: 'Pestisida Nabati', jenis: 'Rodentisida Nabati' },
  { id: 206, kategori: 'Pestisida Nabati', jenis: 'Herbisida Nabati' },
  
  { id: 210, kategori: 'Pestisida Nabati', jenis: 'Pengendali Perilaku' },
  { id: 211, kategori: 'Pestisida Nabati', jenis: 'Repelan Nabati' },
  { id: 212, kategori: 'Pestisida Nabati', jenis: 'Antifeedant' },
  { id: 213, kategori: 'Pestisida Nabati', jenis: 'Attractant Nabati' },
  { id: 214, kategori: 'Pestisida Nabati', jenis: 'IGR Nabati (Growth Regulator)' },
  { id: 215, kategori: 'Pestisida Nabati', jenis: 'Chemosterilant' },

  // --- AGEN HAYATI ---
  { id: 300, kategori: 'Agen Hayati', jenis: 'Mikroorganisme' },
  { id: 301, kategori: 'Agen Hayati', jenis: 'Cendawan (Fungi)' },
  { id: 302, kategori: 'Agen Hayati', jenis: 'Bakteri' },
  { id: 303, kategori: 'Agen Hayati', jenis: 'Virus Entomopatogen' },
  
  { id: 310, kategori: 'Agen Hayati', jenis: 'Makroorganisme' },
  { id: 311, kategori: 'Agen Hayati', jenis: 'Predator' },
  { id: 312, kategori: 'Agen Hayati', jenis: 'Parasitoid' },
];