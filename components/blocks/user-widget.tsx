// # START OF User Widget - Widget for displaying user management information (Admin role)
// Purpose: Display user metrics including total users, active users, new users, and user distribution by role
// Props/Params: UserWidgetData interface with user information and BaseWidgetProps
// Returns: JSX element for user widget
// Dependencies: DashboardWidget base component, user data types, utility functions

"use client";

import React from "react";
import { DashboardWidget } from "./dashboard-widget";
import { UserWidgetData, BaseWidgetProps } from "@/lib/types/dashboard";
import { formatNumber, mockChartData } from "@/lib/data/dashboard-demo";
import { cn } from "@/lib/utils";

interface UserWidgetProps extends BaseWidgetProps {
  data: UserWidgetData;
  variant?: 'total' | 'active' | 'new' | 'by-role';
  onActionClick?: () => void;
}

const UserWidget = ({ 
  data, 
  variant = 'total', 
  className, 
  loading = false,
  onActionClick 
}: UserWidgetProps) => {

  const getWidgetConfig = () => {
    switch (variant) {
      case 'total':
        return {
          title: "Total Pengguna",
          icon: "heroicons:users",
          value: data.totalUsers,
          subtitle: "Semua pengguna sistem",
          chartColor: "#6366f1", // indigo
          chartData: [data.totalUsers - 10, data.totalUsers - 8, data.totalUsers - 5, data.totalUsers - 3, data.totalUsers - 1, data.totalUsers, data.totalUsers],
          trend: {
            direction: 'up' as const,
            percentage: Math.round(((data.totalUsers - 80) / 80) * 100), // assuming previous month was 80
            label: "vs bulan lalu"
          },
          actionButton: onActionClick ? {
            label: "Kelola User",
            onClick: onActionClick
          } : undefined
        };

      case 'active':
        return {
          title: "Pengguna Aktif",
          icon: "heroicons:user-circle",
          value: data.activeUsers,
          subtitle: "User aktif bulan ini",
          chartColor: "#10b981", // emerald
          chartData: [data.activeUsers - 5, data.activeUsers - 3, data.activeUsers - 1, data.activeUsers, data.activeUsers + 1, data.activeUsers, data.activeUsers + 2],
          trend: {
            direction: 'up' as const,
            percentage: Math.round((data.activeUsers / data.totalUsers) * 100),
            label: "tingkat aktivitas"
          },
          actionButton: onActionClick ? {
            label: "Lihat Aktivitas",
            onClick: onActionClick
          } : undefined
        };

      case 'new':
        return {
          title: "Pengguna Baru",
          icon: "heroicons:user-plus",
          value: data.newUsers,
          subtitle: "Registrasi bulan ini",
          chartColor: "#3b82f6", // blue
          chartData: [data.newUsers - 2, data.newUsers - 1, data.newUsers + 1, data.newUsers, data.newUsers + 2, data.newUsers - 1, data.newUsers],
          trend: {
            direction: (data.newUsers > 3 ? 'up' : 'stable') as 'up' | 'down' | 'stable',
            percentage: Math.round((data.newUsers / data.totalUsers) * 100),
            label: "dari total user"
          },
          actionButton: onActionClick ? {
            label: "Review Baru",
            onClick: onActionClick
          } : undefined
        };

      case 'by-role':
        const totalRoleUsers = Object.values(data.usersByRole).reduce((a, b) => a + b, 0);
        const dominantRole = Object.entries(data.usersByRole).reduce((a, b) => 
          data.usersByRole[a[0] as keyof typeof data.usersByRole] > data.usersByRole[b[0] as keyof typeof data.usersByRole] ? a : b
        );
        
        return {
          title: "Distribusi Role",
          icon: "heroicons:identification",
          value: `${dominantRole[1]} ${dominantRole[0].toUpperCase()}`,
          subtitle: `Role terbanyak dari ${totalRoleUsers} user`,
          chartColor: "#8b5cf6", // violet
          chartData: Object.values(data.usersByRole),
          trend: {
            direction: 'stable' as const,
            percentage: Math.round((dominantRole[1] / totalRoleUsers) * 100),
            label: "dominasi role"
          },
          actionButton: onActionClick ? {
            label: "Atur Role",
            onClick: onActionClick
          } : undefined
        };

      default:
        return {
          title: "Pengguna",
          icon: "heroicons:users",
          value: data.totalUsers,
          subtitle: "Total pengguna sistem"
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

export { UserWidget };

// # END OF User Widget 