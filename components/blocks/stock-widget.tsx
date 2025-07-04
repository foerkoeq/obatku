// # START OF Stock Widget - Widget for displaying stock information
// Purpose: Display stock-related metrics including total stock, low stock alerts, and stock value
// Props/Params: StockWidgetData interface with stock information and BaseWidgetProps
// Returns: JSX element for stock widget
// Dependencies: DashboardWidget base component, stock data types, utility functions

"use client";

import React from "react";
import { DashboardWidget } from "./dashboard-widget";
import { StockWidgetData, BaseWidgetProps } from "@/lib/types/dashboard";
import { formatCurrency, formatNumber, mockChartData } from "@/lib/data/dashboard-demo";
import { cn } from "@/lib/utils";

interface StockWidgetProps extends BaseWidgetProps {
  data: StockWidgetData;
  variant?: 'total' | 'low-stock' | 'value';
  onActionClick?: () => void;
}

const StockWidget = ({ 
  data, 
  variant = 'total', 
  className, 
  loading = false,
  onActionClick 
}: StockWidgetProps) => {

  const getWidgetConfig = () => {
    switch (variant) {
      case 'total':
        return {
          title: "Total Stok Obat",
          icon: "heroicons:archive-box",
          value: data.totalStock,
          subtitle: "Total obat di gudang",
          chartColor: "#0ea5e9", // blue
          chartData: mockChartData.stockTrend,
          trend: {
            direction: data.trend,
            percentage: data.trendPercentage,
            label: "vs bulan lalu"
          },
          actionButton: onActionClick ? {
            label: "Lihat Detail",
            onClick: onActionClick
          } : undefined
        };

      case 'low-stock':
        return {
          title: "Stok Hampir Habis",
          icon: "heroicons:exclamation-triangle",
          value: data.lowStockCount,
          subtitle: "Obat dengan stok < 10 unit",
          chartColor: "#f59e0b", // amber
          chartData: [data.lowStockCount, data.lowStockCount - 2, data.lowStockCount + 1, data.lowStockCount - 1, data.lowStockCount],
          trend: {
            direction: data.lowStockCount > 5 ? 'up' : 'down',
            percentage: Math.round((data.lowStockCount / data.totalStock) * 100),
            label: "dari total stok"
          },
          actionButton: onActionClick ? {
            label: "Lihat Daftar",
            onClick: onActionClick
          } : undefined
        };

      case 'value':
        return {
          title: "Nilai Total Stok",
          icon: "heroicons:banknotes",
          value: formatCurrency(data.stockValue),
          subtitle: "Estimasi nilai inventory",
          chartColor: "#10b981", // emerald
          chartData: mockChartData.weekly,
          trend: {
            direction: data.trend,
            percentage: data.trendPercentage,
            label: "vs bulan lalu"
          },
          actionButton: onActionClick ? {
            label: "Export Laporan",
            onClick: onActionClick
          } : undefined
        };

      default:
        return {
          title: "Stok Obat",
          icon: "heroicons:archive-box",
          value: data.totalStock,
          subtitle: "Total obat di gudang"
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

export { StockWidget };

// # END OF Stock Widget 