// =============================================
// Mock Data: Komoditas Pertanian
// =============================================

export interface Komoditas {
  id: string;
  nama: string;
  jenis: "Pangan" | "Hortikultura" | "Perkebunan";
}

export const KOMODITAS_LIST: Komoditas[] = [
  // Pangan
  { id: "KOM-001", nama: "Padi", jenis: "Pangan" },
  { id: "KOM-002", nama: "Jagung", jenis: "Pangan" },
  { id: "KOM-003", nama: "Kedelai", jenis: "Pangan" },
  { id: "KOM-004", nama: "Kacang Tanah", jenis: "Pangan" },
  { id: "KOM-005", nama: "Kacang Hijau", jenis: "Pangan" },
  { id: "KOM-006", nama: "Ubi Kayu", jenis: "Pangan" },
  { id: "KOM-007", nama: "Ubi Jalar", jenis: "Pangan" },

  // Hortikultura
  { id: "KOM-010", nama: "Cabai Merah", jenis: "Hortikultura" },
  { id: "KOM-011", nama: "Cabai Rawit", jenis: "Hortikultura" },
  { id: "KOM-012", nama: "Bawang Merah", jenis: "Hortikultura" },
  { id: "KOM-013", nama: "Bawang Putih", jenis: "Hortikultura" },
  { id: "KOM-014", nama: "Tomat", jenis: "Hortikultura" },
  { id: "KOM-015", nama: "Semangka", jenis: "Hortikultura" },
  { id: "KOM-016", nama: "Melon", jenis: "Hortikultura" },
  { id: "KOM-017", nama: "Mentimun", jenis: "Hortikultura" },
  { id: "KOM-018", nama: "Terong", jenis: "Hortikultura" },

  // Perkebunan
  { id: "KOM-020", nama: "Tembakau", jenis: "Perkebunan" },
  { id: "KOM-021", nama: "Tebu", jenis: "Perkebunan" },
  { id: "KOM-022", nama: "Kelapa", jenis: "Perkebunan" },
  { id: "KOM-023", nama: "Kapas", jenis: "Perkebunan" },
  { id: "KOM-024", nama: "Lontar/Siwalan", jenis: "Perkebunan" },
  { id: "KOM-025", nama: "Kopi", jenis: "Perkebunan" },
  { id: "KOM-026", nama: "Jambu Mete", jenis: "Perkebunan" },
];

export const KOMODITAS_GROUPED = {
  Pangan: KOMODITAS_LIST.filter((k) => k.jenis === "Pangan"),
  Hortikultura: KOMODITAS_LIST.filter((k) => k.jenis === "Hortikultura"),
  Perkebunan: KOMODITAS_LIST.filter((k) => k.jenis === "Perkebunan"),
};
