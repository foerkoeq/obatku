// # START OF Transaction Widget - Widget for displaying transaction information
// Purpose: Display transaction metrics including daily and monthly transaction counts and values
// Props/Params: TransactionWidgetData interface with transaction information and BaseWidgetProps
// Returns: JSX element for transaction widget
// Dependencies: DashboardWidget base component, transaction data types, utility functions

"use client";

import React from "react";
import { DashboardWidget } from "./dashboard-widget";
import { TransactionWidgetData, BaseWidgetProps } from "@/lib/types/dashboard";
import { formatCurrency, formatNumber, mockChartData } from "@/lib/data/dashboard-demo";
import { cn } from "@/lib/utils";

interface TransactionWidgetProps extends BaseWidgetProps {
  data: TransactionWidgetData;
  variant?: 'daily' | 'monthly' | 'value';
  onActionClick?: () => void;
}

const TransactionWidget = ({ 
  data, 
  variant = 'daily', 
  className, 
  loading = false,
  onActionClick 
}: TransactionWidgetProps) => {

  const getWidgetConfig = () => {
    switch (variant) {
      case 'daily':
        return {
          title: "Transaksi Hari Ini",
          icon: "heroicons:calendar-days",
          value: data.dailyTransactions,
          subtitle: "Transaksi keluar obat",
          chartColor: "#8b5cf6", // violet
          chartData: mockChartData.transactionTrend,
          trend: {
            direction: data.trend,
            percentage: data.trendPercentage,
            label: "vs kemarin"
          },
          actionButton: onActionClick ? {
            label: "Lihat Detail",
            onClick: onActionClick
          } : undefined
        };

      case 'monthly':
        return {
          title: "Transaksi Bulan Ini",
          icon: "heroicons:chart-bar",
          value: data.monthlyTransactions,
          subtitle: "Total transaksi bulanan",
          chartColor: "#06b6d4", // cyan
          chartData: mockChartData.monthly.slice(-7), // last 7 days of month
          trend: {
            direction: data.trend,
            percentage: data.trendPercentage,
            label: "vs bulan lalu"
          },
          actionButton: onActionClick ? {
            label: "Lihat Laporan",
            onClick: onActionClick
          } : undefined
        };

      case 'value':
        return {
          title: "Nilai Transaksi",
          icon: "heroicons:currency-dollar",
          value: formatCurrency(data.totalValue),
          subtitle: "Total nilai transaksi bulan ini",
          chartColor: "#10b981", // emerald
          chartData: mockChartData.weekly,
          trend: {
            direction: data.trend,
            percentage: data.trendPercentage,
            label: "vs bulan lalu"
          },
          actionButton: onActionClick ? {
            label: "Export Data",
            onClick: onActionClick
          } : undefined
        };

      default:
        return {
          title: "Transaksi",
          icon: "heroicons:arrow-right-circle",
          value: data.dailyTransactions,
          subtitle: "Transaksi hari ini"
        };
    }
  };

  const config = getWidgetConfig();

  return (
    <DashboardWidget
      {...config}
      className={cn(className)}
      loading={loading}
    />
  );
};

export { TransactionWidget };

// # END OF Transaction Widget 