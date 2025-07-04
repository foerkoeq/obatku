// # START OF Dashboard Mock Data - Mock data for dashboard widgets
// Purpose: Provide realistic mock data for dashboard widgets development and testing
// Props/Params: None (exported data objects)
// Returns: Mock data objects for different dashboard widgets
// Dependencies: Dashboard type definitions

import { 
  StockWidgetData, 
  TransactionWidgetData, 
  ExpiringDrugsData, 
  SubmissionWidgetData, 
  UserWidgetData, 
  QuickAction 
} from "@/lib/types/dashboard";

// Mock data untuk widget stok obat
export const mockStockData: StockWidgetData = {
  totalStock: 1250,
  lowStockCount: 8,
  stockValue: 125000000, // dalam rupiah
  trend: 'up',
  trendPercentage: 12.5
};

// Mock data untuk widget transaksi
export const mockTransactionData: TransactionWidgetData = {
  dailyTransactions: 15,
  monthlyTransactions: 342,
  totalValue: 45000000, // dalam rupiah
  trend: 'up',
  trendPercentage: 8.3
};

// Mock data untuk obat yang akan expired
export const mockExpiringDrugsData: ExpiringDrugsData = {
  expiringSoon: 23, // dalam 30 hari
  expired: 5,
  urgent: 7, // dalam 7 hari
  trend: 'down' // trending down is good for expiring drugs
};

// Mock data untuk pengajuan (role PPL)
export const mockSubmissionData: SubmissionWidgetData = {
  totalSubmissions: 45,
  pending: 8,
  approved: 32,
  rejected: 5,
  trend: 'up',
  trendPercentage: 15.2
};

// Mock data untuk user management (role admin)
export const mockUserData: UserWidgetData = {
  totalUsers: 87,
  activeUsers: 72,
  newUsers: 5,
  usersByRole: {
    admin: 3,
    ppl: 45,
    dinas: 12,
    popt: 27
  }
};

// Mock data untuk quick actions berdasarkan role
export const mockQuickActions: QuickAction[] = [
  {
    id: 'add-stock',
    title: 'Tambah Stok',
    description: 'Tambah obat baru ke inventory',
    icon: 'heroicons:plus-circle',
    href: '/inventory/add',
    color: 'text-success-600',
    bgColor: 'bg-success-100',
    role: ['admin', 'popt', 'dinas']
  },
  {
    id: 'create-submission',
    title: 'Buat Pengajuan',
    description: 'Ajukan permintaan obat',
    icon: 'heroicons:document-plus',
    href: '/transactions/submission',
    color: 'text-info-600',
    bgColor: 'bg-info-100',
    role: ['ppl']
  },
  {
    id: 'approve-submissions',
    title: 'Persetujuan',
    description: 'Review pengajuan obat',
    icon: 'heroicons:check-circle',
    href: '/transactions/approval',
    color: 'text-warning-600',
    bgColor: 'bg-warning-100',
    role: ['dinas']
  },
  {
    id: 'stock-report',
    title: 'Laporan Stok',
    description: 'Export laporan stok obat',
    icon: 'heroicons:chart-bar',
    href: '/reports/stock',
    color: 'text-primary-600',
    bgColor: 'bg-primary-100',
    role: ['admin', 'popt', 'dinas']
  },
  {
    id: 'user-management',
    title: 'Kelola User',
    description: 'Manajemen pengguna sistem',
    icon: 'heroicons:users',
    href: '/users',
    color: 'text-destructive-600',
    bgColor: 'bg-destructive-100',
    role: ['admin']
  },
  {
    id: 'expiring-drugs',
    title: 'Obat Kadaluarsa',
    description: 'Monitor obat yang akan expired',
    icon: 'heroicons:exclamation-triangle',
    href: '/inventory?filter=expiring',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    role: ['admin', 'popt', 'dinas']
  }
];

// Mock chart data untuk berbagai widget
export const mockChartData = {
  // Data untuk chart 7 hari terakhir
  weekly: [120, 132, 101, 134, 90, 230, 210],
  
  // Data untuk chart bulanan
  monthly: [800, 600, 1000, 800, 600, 1000, 800, 900, 750, 850, 950, 1100],
  
  // Data untuk trend stok
  stockTrend: [450, 420, 380, 410, 470, 490, 520],
  
  // Data untuk trend transaksi
  transactionTrend: [15, 12, 18, 20, 16, 25, 22],
  
  // Data untuk pengajuan trend
  submissionTrend: [5, 8, 6, 12, 9, 15, 11]
};

// Helper function untuk format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper function untuk format number with thousand separator
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

// Helper function untuk get trend icon
export const getTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return 'heroicons:arrow-trending-up';
    case 'down':
      return 'heroicons:arrow-trending-down';
    case 'stable':
      return 'heroicons:minus';
    default:
      return 'heroicons:minus';
  }
};

// Helper function untuk get trend color
export const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return 'text-success-600';
    case 'down':
      return 'text-destructive-600';
    case 'stable':
      return 'text-default-600';
    default:
      return 'text-default-600';
  }
};

// # END OF Dashboard Mock Data 