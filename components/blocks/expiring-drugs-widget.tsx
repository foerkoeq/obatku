// # START OF Expiring Drugs Widget - Widget for displaying expiring drugs information
// Purpose: Display metrics about drugs that are expiring soon, expired, or urgent
// Props/Params: ExpiringDrugsData interface with expiring drugs information and BaseWidgetProps
// Returns: JSX element for expiring drugs widget
// Dependencies: DashboardWidget base component, expiring drugs data types, utility functions

"use client";

import React from "react";
import { DashboardWidget } from "./dashboard-widget";
import { ExpiringDrugsData, BaseWidgetProps } from "@/lib/types/dashboard";
import { cn } from "@/lib/utils";

interface ExpiringDrugsWidgetProps extends BaseWidgetProps {
  data: ExpiringDrugsData;
  variant?: 'expiring-soon' | 'expired' | 'urgent';
  onActionClick?: () => void;
}

const ExpiringDrugsWidget = ({ 
  data, 
  variant = 'expiring-soon', 
  className, 
  loading = false,
  onActionClick 
}: ExpiringDrugsWidgetProps) => {

  const getWidgetConfig = () => {
    switch (variant) {
      case 'expiring-soon':
        return {
          title: "Akan Kadaluarsa",
          icon: "heroicons:clock",
          value: data.expiringSoon,
          subtitle: "Obat kadaluarsa dalam 30 hari",
          chartColor: "#f59e0b", // amber
          chartData: [data.expiringSoon, data.expiringSoon - 2, data.expiringSoon + 3, data.expiringSoon - 1, data.expiringSoon + 1, data.expiringSoon - 2, data.expiringSoon],
          trend: {
            direction: data.trend === 'down' ? 'down' : 'up', // down trend is good for expiring drugs
            percentage: Math.round(((data.expiringSoon + data.expired) / 100) * 10), // mock percentage
            label: "total bermasalah"
          },
          actionButton: onActionClick ? {
            label: "Lihat Detail",
            onClick: onActionClick
          } : undefined
        };

      case 'expired':
        return {
          title: "Sudah Kadaluarsa",
          icon: "heroicons:x-circle",
          value: data.expired,
          subtitle: "Obat yang sudah expired",
          chartColor: "#ef4444", // red
          chartData: [data.expired + 2, data.expired + 1, data.expired + 3, data.expired, data.expired - 1, data.expired + 1, data.expired],
          trend: {
            direction: data.trend === 'down' ? 'down' : 'up',
            percentage: Math.round((data.expired / (data.expired + data.expiringSoon)) * 100),
            label: "dari total bermasalah"
          },
          actionButton: onActionClick ? {
            label: "Kelola Expired",
            onClick: onActionClick
          } : undefined
        };

      case 'urgent':
        return {
          title: "Sangat Mendesak",
          icon: "heroicons:exclamation-triangle",
          value: data.urgent,
          subtitle: "Kadaluarsa dalam 7 hari",
          chartColor: "#dc2626", // red-600
          chartData: [data.urgent + 1, data.urgent, data.urgent + 2, data.urgent - 1, data.urgent + 1, data.urgent, data.urgent - 1],
          trend: {
            direction: data.trend === 'down' ? 'down' : 'up',
            percentage: Math.round((data.urgent / data.expiringSoon) * 100),
            label: "sangat urgent"
          },
          actionButton: onActionClick ? {
            label: "Tindakan Cepat",
            onClick: onActionClick
          } : undefined
        };

      default:
        return {
          title: "Obat Bermasalah",
          icon: "heroicons:exclamation-triangle",
          value: data.expiringSoon,
          subtitle: "Memerlukan perhatian"
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

export { ExpiringDrugsWidget };

// # END OF Expiring Drugs Widget 