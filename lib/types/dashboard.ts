// # START OF Dashboard Types - Type definitions for dashboard widgets
// Purpose: Define TypeScript interfaces for all dashboard widget components
// Props/Params: Various widget properties and configurations
// Returns: Type definitions for widgets
// Dependencies: None

export interface BaseWidgetProps {
  className?: string;
  loading?: boolean;
}

export interface StockWidgetData {
  totalStock: number;
  lowStockCount: number;
  stockValue: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface TransactionWidgetData {
  dailyTransactions: number;
  monthlyTransactions: number;
  totalValue: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface ExpiringDrugsData {
  expiringSoon: number; // dalam 30 hari
  expired: number;
  urgent: number; // dalam 7 hari
  trend: 'up' | 'down' | 'stable';
}

export interface SubmissionWidgetData {
  totalSubmissions: number;
  pending: number;
  approved: number;
  rejected: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface UserWidgetData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  usersByRole: {
    admin: number;
    ppl: number;
    dinas: number;
    popt: number;
  };
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  bgColor: string;
  role?: string[]; // roles yang bisa mengakses
}

export interface DashboardWidgetProps extends BaseWidgetProps {
  title: string;
  icon?: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    label?: string;
  };
  chartData?: number[];
  chartColor?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

// ─── Dashboard Summary & Stat Card types ────────────────────────────────────

export type TrendDirection = 'up' | 'down' | 'stable';

export type StatCardColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'secondary'
  | 'default';

/** Configuration for a single stat card on the dashboard */
export interface StatCardConfig {
  /** Matches feature-control id, e.g. "dashboard.total_stok" */
  featureId: string;
  label: string;
  value: number;
  icon: string;
  color: StatCardColor;
  subtitle?: string;
  trend?: {
    direction: TrendDirection;
    value: number;
    label: string;
    /** true = "up" is bad (e.g. expiring drugs going up) */
    invertColor?: boolean;
  };
  href?: string;
  /** Pulse the card border to draw attention */
  alert?: boolean;
}

/** Summary numbers powering the dashboard stat cards */
export interface DashboardSummary {
  totalStok: number;
  kadaluarsa6Bulan: number;
  kadaluarsaSegera: number;
  draftPengajuan: number;
  menungguPersetujuan: number;
  prosesGudang: number;
  totalPengguna: number;
  stokMenipis: number;
}

/** An item shown in the "Stok Menipis" alert table */
export interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  category?: string;
  lastRestocked?: string;
}

/** An entry in the recent activity feed */
export interface RecentActivity {
  id: string;
  type:
    | 'pengajuan'
    | 'persetujuan'
    | 'stok_masuk'
    | 'stok_keluar'
    | 'user'
    | 'opname'
    | 'kadaluarsa';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  status?: 'success' | 'warning' | 'info' | 'error';
}

/** An item shown in the "Obat Segera Kadaluarsa" alert table */
export interface ExpiringItem {
  id: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  stock: number;
  unit: string;
  daysUntilExpiry: number;
}

// # END OF Dashboard Types