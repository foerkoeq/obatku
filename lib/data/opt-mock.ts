// =============================================
// Mock Data: OPT (Organisme Pengganggu Tumbuhan)
// =============================================

export interface OPTItem {
  id: string;
  nama: string;
  kategori: "Hama" | "Penyakit" | "Gulma";
  /** Komoditas yang sering diserang */
  komoditasTarget?: string[];
}

export const OPT_LIST: OPTItem[] = [
  // Hama
  { id: "OPT-001", nama: "Wereng Batang Coklat", kategori: "Hama", komoditasTarget: ["Padi"] },
  { id: "OPT-002", nama: "Penggerek Batang", kategori: "Hama", komoditasTarget: ["Padi", "Jagung", "Tebu"] },
  { id: "OPT-003", nama: "Walang Sangit", kategori: "Hama", komoditasTarget: ["Padi"] },
  { id: "OPT-004", nama: "Ulat Grayak", kategori: "Hama", komoditasTarget: ["Jagung", "Kedelai", "Cabai Merah", "Bawang Merah"] },
  { id: "OPT-005", nama: "Thrips", kategori: "Hama", komoditasTarget: ["Cabai Merah", "Cabai Rawit", "Bawang Merah"] },
  { id: "OPT-006", nama: "Kutu Daun", kategori: "Hama", komoditasTarget: ["Cabai Merah", "Cabai Rawit", "Tomat", "Terong"] },
  { id: "OPT-007", nama: "Kutu Kebul", kategori: "Hama", komoditasTarget: ["Tomat", "Cabai Merah", "Kedelai"] },
  { id: "OPT-008", nama: "Ulat Api", kategori: "Hama", komoditasTarget: ["Kelapa", "Tembakau"] },
  { id: "OPT-009", nama: "Belalang Kembara", kategori: "Hama", komoditasTarget: ["Padi", "Jagung"] },
  { id: "OPT-010", nama: "Tikus Sawah", kategori: "Hama", komoditasTarget: ["Padi", "Jagung"] },
  { id: "OPT-011", nama: "Tungau", kategori: "Hama", komoditasTarget: ["Cabai Merah", "Tomat", "Jeruk"] },
  { id: "OPT-012", nama: "Lalat Buah", kategori: "Hama", komoditasTarget: ["Cabai Merah", "Tomat", "Semangka", "Melon"] },
  { id: "OPT-013", nama: "Hama Tanah", kategori: "Hama", komoditasTarget: ["Kacang Tanah", "Ubi Kayu"] },
  { id: "OPT-014", nama: "Ulat Tanah", kategori: "Hama", komoditasTarget: ["Jagung", "Kacang Tanah"] },
  { id: "OPT-015", nama: "Keong Mas", kategori: "Hama", komoditasTarget: ["Padi"] },
  { id: "OPT-016", nama: "Nematoda", kategori: "Hama", komoditasTarget: ["Tomat", "Cabai Merah", "Tembakau"] },
  { id: "OPT-017", nama: "Kepik Hijau", kategori: "Hama", komoditasTarget: ["Kedelai"] },

  // Penyakit
  { id: "OPT-020", nama: "Blast", kategori: "Penyakit", komoditasTarget: ["Padi"] },
  { id: "OPT-021", nama: "Hawar Daun Bakteri", kategori: "Penyakit", komoditasTarget: ["Padi"] },
  { id: "OPT-022", nama: "Bercak Daun", kategori: "Penyakit", komoditasTarget: ["Padi", "Jagung", "Kacang Tanah"] },
  { id: "OPT-023", nama: "Antraknosa", kategori: "Penyakit", komoditasTarget: ["Cabai Merah", "Cabai Rawit", "Bawang Merah"] },
  { id: "OPT-024", nama: "Busuk Buah", kategori: "Penyakit", komoditasTarget: ["Cabai Merah", "Tomat"] },
  { id: "OPT-025", nama: "Layu Fusarium", kategori: "Penyakit", komoditasTarget: ["Tomat", "Cabai Merah", "Semangka"] },
  { id: "OPT-026", nama: "Layu Bakteri", kategori: "Penyakit", komoditasTarget: ["Tomat", "Cabai Merah", "Tembakau"] },
  { id: "OPT-027", nama: "Busuk Batang", kategori: "Penyakit", komoditasTarget: ["Jagung", "Tebu"] },
  { id: "OPT-028", nama: "Karat Daun", kategori: "Penyakit", komoditasTarget: ["Jagung", "Kedelai"] },
  { id: "OPT-029", nama: "Bulai/Downy Mildew", kategori: "Penyakit", komoditasTarget: ["Jagung", "Mentimun", "Semangka"] },
  { id: "OPT-030", nama: "Penyakit Tanah", kategori: "Penyakit", komoditasTarget: ["Tembakau", "Kacang Tanah"] },
  { id: "OPT-031", nama: "Virus Kuning", kategori: "Penyakit", komoditasTarget: ["Cabai Merah", "Tomat"] },
  { id: "OPT-032", nama: "Virus Gemini", kategori: "Penyakit", komoditasTarget: ["Cabai Merah", "Tomat"] },

  // Special option
  { id: "OPT-999", nama: "Lainnya", kategori: "Hama" },
];

/** Get OPT yang relevan berdasarkan komoditas */
export function getOPTByKomoditas(komoditas: string): OPTItem[] {
  if (!komoditas) return OPT_LIST;
  const relevant = OPT_LIST.filter(
    (opt) =>
      opt.id === "OPT-999" || // Always include "Lainnya"
      !opt.komoditasTarget ||
      opt.komoditasTarget.includes(komoditas)
  );
  return relevant.length > 1 ? relevant : OPT_LIST; // If no match, show all
}

/** Get unique OPT names from the list */
export const OPT_NAMES = OPT_LIST.map((opt) => opt.nama);
