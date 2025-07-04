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

// # END OF Dashboard Types 