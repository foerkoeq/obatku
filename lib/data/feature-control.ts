import type { Feature, RoleFeatureConfig } from "@/lib/types/feature-control";
import type { UserRoleType } from "@/lib/types/user";
import { USER_ROLES } from "@/lib/types/user";

// ─── Feature tree ───────────────────────────────────────────────────────────

export const FEATURES: Feature[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: "heroicons-outline:squares-2x2",
    description: "Widget statistik & ringkasan di halaman utama",
    subFeatures: [
      { id: "dashboard.total_stok", name: "Total Stok Obat" },
      { id: "dashboard.kadaluarsa_6bln", name: "Total Obat Kadaluarsa 6 Bulan" },
      { id: "dashboard.draft_pengajuan", name: "Draft Pengajuan Dinas" },
      { id: "dashboard.trx_menunggu_persetujuan", name: "Transaksi Menunggu Persetujuan Dinas" },
      { id: "dashboard.trx_proses_gudang", name: "Transaksi Proses Gudang" },
      { id: "dashboard.total_pengguna", name: "Total Pengguna" },
      { id: "dashboard.stok_menipis", name: "Stok Menipis" },
    ],
  },
  {
    id: "inventory",
    name: "Inventori Obat",
    icon: "heroicons-outline:archive-box",
    description: "Kelola daftar obat & stok gudang",
    subFeatures: [
      { id: "inventory.tambah", name: "Tambah Obat" },
      { id: "inventory.edit", name: "Edit Obat" },
      { id: "inventory.hapus", name: "Hapus Obat" },
    ],
  },
  {
    id: "stock_opname",
    name: "Stok Opname",
    icon: "heroicons-outline:clipboard-document-check",
    description: "Pengecekan & penyesuaian stok fisik",
    subFeatures: [
      { id: "stock_opname.cek", name: "Cek Stok" },
      { id: "stock_opname.update", name: "Update Stok" },
      { id: "stock_opname.cetak", name: "Cetak Laporan" },
    ],
  },
  {
    id: "transaction_list",
    name: "Daftar Transaksi",
    icon: "heroicons-outline:clipboard-document-list",
    description: "Daftar semua transaksi pengajuan",
    subFeatures: [
      { id: "transaction_list.buat", name: "Buat Pengajuan" },
      { id: "transaction_list.proses", name: "Proses Pengajuan" },
      { id: "transaction_list.hapus", name: "Hapus Pengajuan" },
      { id: "transaction_list.edit", name: "Edit Pengajuan" },
    ],
  },
  {
    id: "pengajuan",
    name: "Pengajuan",
    icon: "heroicons-outline:document-plus",
    description: "Halaman buat & kirim pengajuan baru",
    subFeatures: [],
  },
  {
    id: "persetujuan",
    name: "Persetujuan",
    icon: "heroicons-outline:check-badge",
    description: "Alur persetujuan pengajuan dinas",
    subFeatures: [
      { id: "persetujuan.proses", name: "Proses Pengajuan" },
      { id: "persetujuan.kembalikan", name: "Kembalikan Pengajuan" },
      { id: "persetujuan.review", name: "Review Pengajuan" },
    ],
  },
  {
    id: "transaksi_keluar",
    name: "Transaksi Keluar",
    icon: "heroicons-outline:arrow-right-on-rectangle",
    description: "Proses pengeluaran barang dari gudang",
    subFeatures: [
      { id: "transaksi_keluar.proses_gudang", name: "Proses Gudang" },
      { id: "transaksi_keluar.review", name: "Review Pengajuan" },
    ],
  },
  {
    id: "template_qr",
    name: "Pengaturan Template Label QR Code",
    icon: "heroicons-outline:qr-code",
    description: "Kelola template label QR code obat",
    subFeatures: [
      { id: "template_qr.edit", name: "Edit Template" },
      { id: "template_qr.tambah", name: "Tambah Template" },
      { id: "template_qr.hapus", name: "Hapus Template" },
      { id: "template_qr.set_default", name: "Menentukan Template" },
    ],
  },
  {
    id: "template_ba",
    name: "Pengaturan Template Berita Acara",
    icon: "heroicons-outline:document-text",
    description: "Kelola template berita acara",
    subFeatures: [
      { id: "template_ba.edit", name: "Edit Template" },
      { id: "template_ba.tambah", name: "Tambah Template" },
      { id: "template_ba.hapus", name: "Hapus Template" },
      { id: "template_ba.set_default", name: "Menentukan Template" },
    ],
  },
  {
    id: "user_management",
    name: "Manajemen Pengguna",
    icon: "heroicons-outline:users",
    description: "Kelola akun & hak akses pengguna",
    subFeatures: [
      { id: "user_management.tambah", name: "Tambah Pengguna" },
      { id: "user_management.edit", name: "Edit Pengguna" },
      { id: "user_management.hapus", name: "Hapus Pengguna" },
    ],
  },
  {
    id: "data_history",
    name: "Manajemen Data – History Data",
    icon: "heroicons-outline:clock",
    description: "Riwayat perubahan data sistem",
    subFeatures: [],
  },
  {
    id: "data_backup",
    name: "Manajemen Data – Backup & Restore",
    icon: "heroicons-outline:arrow-path",
    description: "Pencadangan & pemulihan data sistem",
    subFeatures: [],
  },
  {
    id: "system_features",
    name: "Manajemen Sistem – Kontrol Fitur",
    icon: "heroicons-outline:adjustments-horizontal",
    description: "Pengaturan fitur aktif/nonaktif per role",
    subFeatures: [],
  },
  {
    id: "system_maintenance",
    name: "Manajemen Sistem – Mode Maintenance",
    icon: "heroicons-outline:wrench-screwdriver",
    description: "Pengaturan mode pemeliharaan sistem",
    subFeatures: [],
  },
  {
    id: "data_poktan",
    name: "Data Poktan",
    icon: "heroicons-outline:building-office",
    description: "Kelola data kelompok tani",
    subFeatures: [
      { id: "data_poktan.tambah", name: "Tambah Data" },
      { id: "data_poktan.edit", name: "Edit Data" },
      { id: "data_poktan.hapus", name: "Hapus Data" },
    ],
  },
];

// ─── Helper: collect all toggle-able IDs from the feature tree ──────────────

function allFeatureIds(): string[] {
  const ids: string[] = [];
  for (const f of FEATURES) {
    ids.push(f.id);
    for (const sf of f.subFeatures) {
      ids.push(sf.id);
    }
  }
  return ids;
}

function buildMap(value: boolean): Record<string, boolean> {
  const m: Record<string, boolean> = {};
  for (const id of allFeatureIds()) m[id] = value;
  return m;
}

// ─── Default mock data per role ─────────────────────────────────────────────

/** Admin gets everything enabled by default */
const adminDefaults = buildMap(true);

/** Kabid – supervisory: dashboards, approvals, reports, read-only on most */
const kabidDefaults: Record<string, boolean> = {
  ...buildMap(false),
  // dashboard
  dashboard: true,
  "dashboard.total_stok": true,
  "dashboard.kadaluarsa_6bln": true,
  "dashboard.draft_pengajuan": true,
  "dashboard.trx_menunggu_persetujuan": true,
  "dashboard.trx_proses_gudang": true,
  "dashboard.total_pengguna": true,
  "dashboard.stok_menipis": true,
  // inventory (view only, no add/edit/delete)
  inventory: true,
  // stock opname view
  stock_opname: true,
  "stock_opname.cetak": true,
  // transaction list
  transaction_list: true,
  // persetujuan
  persetujuan: true,
  "persetujuan.proses": true,
  "persetujuan.kembalikan": true,
  "persetujuan.review": true,
  // transaksi keluar (view)
  transaksi_keluar: true,
  "transaksi_keluar.review": true,
  // data poktan view
  data_poktan: true,
};

/** Kasubbid – similar to Kabid with slightly less */
const kasubbidDefaults: Record<string, boolean> = {
  ...buildMap(false),
  dashboard: true,
  "dashboard.total_stok": true,
  "dashboard.kadaluarsa_6bln": true,
  "dashboard.draft_pengajuan": true,
  "dashboard.trx_menunggu_persetujuan": true,
  "dashboard.trx_proses_gudang": true,
  "dashboard.stok_menipis": true,
  inventory: true,
  stock_opname: true,
  "stock_opname.cetak": true,
  transaction_list: true,
  persetujuan: true,
  "persetujuan.proses": true,
  "persetujuan.review": true,
  transaksi_keluar: true,
  "transaksi_keluar.review": true,
  data_poktan: true,
};

/** Staf Dinas – operational: inventory, transactions, stock opname */
const stafDinasDefaults: Record<string, boolean> = {
  ...buildMap(false),
  dashboard: true,
  "dashboard.total_stok": true,
  "dashboard.kadaluarsa_6bln": true,
  "dashboard.draft_pengajuan": true,
  "dashboard.trx_menunggu_persetujuan": true,
  "dashboard.trx_proses_gudang": true,
  "dashboard.stok_menipis": true,
  inventory: true,
  "inventory.tambah": true,
  "inventory.edit": true,
  "inventory.hapus": true,
  stock_opname: true,
  "stock_opname.cek": true,
  "stock_opname.update": true,
  "stock_opname.cetak": true,
  transaction_list: true,
  "transaction_list.proses": true,
  "transaction_list.edit": true,
  transaksi_keluar: true,
  "transaksi_keluar.proses_gudang": true,
  "transaksi_keluar.review": true,
  template_qr: true,
  "template_qr.edit": true,
  "template_qr.tambah": true,
  "template_qr.hapus": true,
  "template_qr.set_default": true,
  template_ba: true,
  "template_ba.edit": true,
  "template_ba.tambah": true,
  "template_ba.hapus": true,
  "template_ba.set_default": true,
  data_poktan: true,
};

/** BPP – field coordinator: pengajuan, view inventory */
const bppDefaults: Record<string, boolean> = {
  ...buildMap(false),
  dashboard: true,
  "dashboard.total_stok": true,
  "dashboard.kadaluarsa_6bln": true,
  "dashboard.stok_menipis": true,
  inventory: true,
  transaction_list: true,
  "transaction_list.buat": true,
  "transaction_list.edit": true,
  pengajuan: true,
  data_poktan: true,
  "data_poktan.tambah": true,
  "data_poktan.edit": true,
};

/** PPL – field extension worker: pengajuan, poktan */
const pplDefaults: Record<string, boolean> = {
  ...buildMap(false),
  dashboard: true,
  "dashboard.total_stok": true,
  "dashboard.stok_menipis": true,
  inventory: true,
  transaction_list: true,
  "transaction_list.buat": true,
  "transaction_list.edit": true,
  pengajuan: true,
  data_poktan: true,
  "data_poktan.tambah": true,
  "data_poktan.edit": true,
  "data_poktan.hapus": true,
};

/** POPT – pest observer: limited view */
const poptDefaults: Record<string, boolean> = {
  ...buildMap(false),
  dashboard: true,
  "dashboard.total_stok": true,
  "dashboard.stok_menipis": true,
  inventory: true,
  transaction_list: true,
  "transaction_list.buat": true,
  pengajuan: true,
  data_poktan: true,
};

// ─── Export default config for all roles ────────────────────────────────────

export const DEFAULT_ROLE_FEATURES: Record<string, Record<string, boolean>> = {
  Admin: adminDefaults,
  Kabid: kabidDefaults,
  Kasubbid: kasubbidDefaults,
  "Staf Dinas": stafDinasDefaults,
  BPP: bppDefaults,
  PPL: pplDefaults,
  POPT: poptDefaults,
};
