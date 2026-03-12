// # START OF Dashboard Mock Data - Mock data for dashboard widgets
// Purpose: Provide realistic mock data for dashboard widgets development and testing
// Props/Params: None (exported data objects)
// Returns: Mock data objects for different dashboard widgets
// Dependencies: Dashboard type definitions

import type {
  StockWidgetData,
  TransactionWidgetData,
  ExpiringDrugsData,
  SubmissionWidgetData,
  UserWidgetData,
  QuickAction,
  DashboardSummary,
  StatCardConfig,
  LowStockItem,
  RecentActivity,
  ExpiringItem,
} from "@/lib/types/dashboard";

// ─── Legacy mock data (kept for backward compat) ───────────────────────────

export const mockStockData: StockWidgetData = {
  totalStock: 1250,
  lowStockCount: 8,
  stockValue: 125000000,
  trend: "up",
  trendPercentage: 12.5,
};

export const mockTransactionData: TransactionWidgetData = {
  dailyTransactions: 15,
  monthlyTransactions: 342,
  totalValue: 45000000,
  trend: "up",
  trendPercentage: 8.3,
};

export const mockExpiringDrugsData: ExpiringDrugsData = {
  expiringSoon: 23,
  expired: 5,
  urgent: 7,
  trend: "down",
};

export const mockSubmissionData: SubmissionWidgetData = {
  totalSubmissions: 45,
  pending: 8,
  approved: 32,
  rejected: 5,
  trend: "up",
  trendPercentage: 15.2,
};

export const mockUserData: UserWidgetData = {
  totalUsers: 87,
  activeUsers: 72,
  newUsers: 5,
  usersByRole: { admin: 3, ppl: 45, dinas: 12, popt: 27 },
};

export const mockQuickActions: QuickAction[] = [
  {
    id: "add-stock",
    title: "Tambah Stok",
    description: "Tambah obat baru ke inventory",
    icon: "heroicons:plus-circle",
    href: "/inventory",
    color: "text-success-600",
    bgColor: "bg-success-100",
    role: ["Admin", "Staf Dinas"],
  },
  {
    id: "create-submission",
    title: "Buat Pengajuan",
    description: "Ajukan permintaan obat",
    icon: "heroicons:document-plus",
    href: "/transactions/list",
    color: "text-info-600",
    bgColor: "bg-info-100",
    role: ["BPP", "PPL", "POPT"],
  },
  {
    id: "approve-submissions",
    title: "Persetujuan",
    description: "Review pengajuan masuk",
    icon: "heroicons:check-circle",
    href: "/transactions/list",
    color: "text-warning-600",
    bgColor: "bg-warning-100",
    role: ["Kabid", "Kasubbid"],
  },
  {
    id: "stock-opname",
    title: "Stok Opname",
    description: "Cek & sesuaikan stok fisik",
    icon: "heroicons:clipboard-document-check",
    href: "/stock-opname",
    color: "text-primary-600",
    bgColor: "bg-primary-100",
    role: ["Admin", "Staf Dinas"],
  },
  {
    id: "user-management",
    title: "Kelola User",
    description: "Manajemen pengguna sistem",
    icon: "heroicons:users",
    href: "/users",
    color: "text-violet-600",
    bgColor: "bg-violet-100",
    role: ["Admin"],
  },
  {
    id: "expiring-drugs",
    title: "Obat Kadaluarsa",
    description: "Monitor obat akan expired",
    icon: "heroicons:exclamation-triangle",
    href: "/inventory",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    role: ["Admin", "Staf Dinas", "Kabid", "Kasubbid"],
  },
  {
    id: "data-poktan",
    title: "Data Poktan",
    description: "Kelola kelompok tani",
    icon: "heroicons:building-office",
    href: "/farmers",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    role: ["BPP", "PPL", "POPT"],
  },
  {
    id: "proses-gudang",
    title: "Proses Gudang",
    description: "Proses transaksi keluar",
    icon: "heroicons:truck",
    href: "/transactions/list",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    role: ["Admin", "Staf Dinas"],
  },
];

// ─── New dashboard summary data ─────────────────────────────────────────────

export const mockDashboardSummary: DashboardSummary = {
  totalStok: 1250,
  kadaluarsa6Bulan: 42,
  kadaluarsaSegera: 7,
  draftPengajuan: 5,
  menungguPersetujuan: 12,
  prosesGudang: 8,
  totalPengguna: 87,
  stokMenipis: 14,
};

/**
 * Build stat cards from summary data. Each card maps to a feature-control id
 * so role-based visibility can be toggled later.
 */
export function buildStatCards(s: DashboardSummary): StatCardConfig[] {
  return [
    {
      featureId: "dashboard.total_stok",
      label: "Total Stok Obat",
      value: s.totalStok,
      icon: "heroicons:archive-box",
      color: "primary",
      subtitle: "Jenis obat tersedia di gudang",
      trend: { direction: "up", value: 4.2, label: "vs bulan lalu" },
      href: "/inventory",
    },
    {
      featureId: "dashboard.kadaluarsa_6bln",
      label: "Kadaluarsa 6 Bulan",
      value: s.kadaluarsa6Bulan,
      icon: "heroicons:clock",
      color: "warning",
      subtitle: "Obat kadaluarsa dalam 6 bulan",
      trend: {
        direction: s.kadaluarsa6Bulan > 30 ? "up" : "down",
        value: 8.1,
        label: "vs bulan lalu",
        invertColor: true,
      },
      href: "/inventory",
      alert: s.kadaluarsa6Bulan > 30,
    },
    {
      featureId: "dashboard.draft_pengajuan",
      label: "Draft Pengajuan",
      value: s.draftPengajuan,
      icon: "heroicons:document-text",
      color: "info",
      subtitle: "Pengajuan belum dikirim",
      href: "/transactions/list",
    },
    {
      featureId: "dashboard.trx_menunggu_persetujuan",
      label: "Menunggu Persetujuan",
      value: s.menungguPersetujuan,
      icon: "heroicons:inbox-arrow-down",
      color: "secondary",
      subtitle: "Transaksi menunggu persetujuan dinas",
      trend: {
        direction: s.menungguPersetujuan > 10 ? "up" : "stable",
        value: 2,
        label: "pengajuan baru hari ini",
      },
      href: "/transactions/list",
      alert: s.menungguPersetujuan > 10,
    },
    {
      featureId: "dashboard.trx_proses_gudang",
      label: "Proses Gudang",
      value: s.prosesGudang,
      icon: "heroicons:truck",
      color: "info",
      subtitle: "Transaksi sedang diproses gudang",
      href: "/transactions/list",
    },
    {
      featureId: "dashboard.total_pengguna",
      label: "Total Pengguna",
      value: s.totalPengguna,
      icon: "heroicons:users",
      color: "success",
      subtitle: "Pengguna aktif sistem",
      trend: { direction: "up", value: 3, label: "pengguna baru bulan ini" },
      href: "/users",
    },
    {
      featureId: "dashboard.stok_menipis",
      label: "Stok Menipis",
      value: s.stokMenipis,
      icon: "heroicons:exclamation-triangle",
      color: "destructive",
      subtitle: "Obat dengan stok di bawah minimum",
      trend: {
        direction: s.stokMenipis > 10 ? "up" : "down",
        value: s.stokMenipis > 10 ? 12 : 5,
        label: "vs bulan lalu",
        invertColor: true,
      },
      href: "/inventory",
      alert: s.stokMenipis > 10,
    },
  ];
}

// ─── Low stock items ────────────────────────────────────────────────────────

export const mockLowStockItems: LowStockItem[] = [
  {
    id: "LS001",
    name: "Roundup 486 SL",
    currentStock: 5,
    minStock: 50,
    unit: "Botol",
    category: "Herbisida",
    lastRestocked: "2026-02-15",
  },
  {
    id: "LS002",
    name: "Score 250 EC",
    currentStock: 12,
    minStock: 100,
    unit: "Botol",
    category: "Fungisida",
    lastRestocked: "2026-02-20",
  },
  {
    id: "LS003",
    name: "Diazinon 60 EC",
    currentStock: 3,
    minStock: 20,
    unit: "Botol",
    category: "Insektisida",
    lastRestocked: "2026-01-28",
  },
  {
    id: "LS004",
    name: "Mancozeb 80 WP",
    currentStock: 8,
    minStock: 30,
    unit: "Pak",
    category: "Fungisida",
    lastRestocked: "2026-02-10",
  },
  {
    id: "LS005",
    name: "Confidor 200 SL",
    currentStock: 2,
    minStock: 15,
    unit: "Botol",
    category: "Insektisida",
    lastRestocked: "2026-01-05",
  },
  {
    id: "LS006",
    name: "Carbofuran 3G",
    currentStock: 7,
    minStock: 25,
    unit: "Pak",
    category: "Insektisida",
    lastRestocked: "2026-02-01",
  },
  {
    id: "LS007",
    name: "Deltamethrin 25 EC",
    currentStock: 4,
    minStock: 20,
    unit: "Botol",
    category: "Insektisida",
    lastRestocked: "2026-02-18",
  },
];

// ─── Expiring items ─────────────────────────────────────────────────────────

export const mockExpiringItems: ExpiringItem[] = [
  {
    id: "EX001",
    name: "Antracol 70 WP",
    batchNumber: "BTH-2024-001",
    expiryDate: "2026-04-15",
    stock: 120,
    unit: "Pak",
    daysUntilExpiry: 35,
  },
  {
    id: "EX002",
    name: "Mancozeb 80 WP",
    batchNumber: "BTH-2024-015",
    expiryDate: "2026-03-28",
    stock: 45,
    unit: "Pak",
    daysUntilExpiry: 17,
  },
  {
    id: "EX003",
    name: "Diazinon 60 EC",
    batchNumber: "BTH-2023-042",
    expiryDate: "2026-03-18",
    stock: 30,
    unit: "Botol",
    daysUntilExpiry: 7,
  },
  {
    id: "EX004",
    name: "Carbofuran 3G",
    batchNumber: "BTH-2024-008",
    expiryDate: "2026-05-20",
    stock: 60,
    unit: "Pak",
    daysUntilExpiry: 70,
  },
  {
    id: "EX005",
    name: "Gramoxone 276 SL",
    batchNumber: "BTH-2024-022",
    expiryDate: "2026-03-14",
    stock: 80,
    unit: "Botol",
    daysUntilExpiry: 3,
  },
];

// ─── Recent activity ────────────────────────────────────────────────────────

export const mockRecentActivities: RecentActivity[] = [
  {
    id: "ACT001",
    type: "pengajuan",
    title: "Pengajuan baru dibuat",
    description: "Pengajuan obat dari BPP Kec. Tuban (#PGJ-2026-089)",
    timestamp: "2026-03-11T08:30:00",
    actor: "Ahmad Fauzi",
    status: "info",
  },
  {
    id: "ACT002",
    type: "persetujuan",
    title: "Pengajuan disetujui",
    description: "Pengajuan #PGJ-2026-085 disetujui oleh Kabid",
    timestamp: "2026-03-11T07:45:00",
    actor: "Dr. Siti Rahayu",
    status: "success",
  },
  {
    id: "ACT003",
    type: "stok_keluar",
    title: "Stok keluar diproses",
    description: "32 item obat untuk Kec. Palang telah dikirim",
    timestamp: "2026-03-10T16:20:00",
    actor: "Budi Santoso",
    status: "success",
  },
  {
    id: "ACT004",
    type: "kadaluarsa",
    title: "Peringatan kadaluarsa",
    description: "Gramoxone 276 SL (BTH-2024-022) kadaluarsa dalam 3 hari",
    timestamp: "2026-03-10T14:00:00",
    actor: "Sistem",
    status: "error",
  },
  {
    id: "ACT005",
    type: "opname",
    title: "Stok opname selesai",
    description: "Stok opname gudang utama — 3 item selisih ditemukan",
    timestamp: "2026-03-10T11:30:00",
    actor: "Rina Wati",
    status: "warning",
  },
  {
    id: "ACT006",
    type: "stok_masuk",
    title: "Obat baru diterima",
    description: "150 unit Deltamethrin 25 EC masuk ke gudang",
    timestamp: "2026-03-10T09:15:00",
    actor: "Budi Santoso",
    status: "success",
  },
  {
    id: "ACT007",
    type: "user",
    title: "Pengguna baru terdaftar",
    description: "PPL Kec. Jenu — Dimas Prasetyo telah ditambahkan",
    timestamp: "2026-03-09T15:00:00",
    actor: "Admin",
    status: "info",
  },
  {
    id: "ACT008",
    type: "pengajuan",
    title: "Pengajuan dikembalikan",
    description: "Pengajuan #PGJ-2026-082 dikembalikan untuk revisi",
    timestamp: "2026-03-09T10:40:00",
    actor: "Dr. Siti Rahayu",
    status: "warning",
  },
];

// ─── Chart data ─────────────────────────────────────────────────────────────

export const mockChartData = {
  weekly: [120, 132, 101, 134, 90, 230, 210],
  monthly: [800, 600, 1000, 800, 600, 1000, 800, 900, 750, 850, 950, 1100],
  stockTrend: [450, 420, 380, 410, 470, 490, 520],
  transactionTrend: [15, 12, 18, 20, 16, 25, 22],
  submissionTrend: [5, 8, 6, 12, 9, 15, 11],
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat("id-ID").format(num);

export const getTrendIcon = (trend: "up" | "down" | "stable"): string => {
  switch (trend) {
    case "up":
      return "heroicons:arrow-trending-up";
    case "down":
      return "heroicons:arrow-trending-down";
    case "stable":
      return "heroicons:minus";
    default:
      return "heroicons:minus";
  }
};

export const getTrendColor = (trend: "up" | "down" | "stable"): string => {
  switch (trend) {
    case "up":
      return "text-success-600";
    case "down":
      return "text-destructive-600";
    case "stable":
      return "text-default-600";
    default:
      return "text-default-600";
  }
};

/**
 * Format a relative time string, e.g. "2 jam lalu", "Baru saja"
 */
export function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} jam lalu`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// # END OF Dashboard Mock Data

// # END OF Dashboard Mock Data 