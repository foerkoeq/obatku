// # START OF Submission Widget - Widget for displaying submission information (PPL role)
// Purpose: Display submission metrics including total, pending, approved, and rejected submissions
// Props/Params: SubmissionWidgetData interface with submission information and BaseWidgetProps
// Returns: JSX element for submission widget
// Dependencies: DashboardWidget base component, submission data types, utility functions

"use client";

import React from "react";
import { DashboardWidget } from "./dashboard-widget";
import { SubmissionWidgetData, BaseWidgetProps } from "@/lib/types/dashboard";
import { formatNumber, mockChartData } from "@/lib/data/dashboard-demo";
import { cn } from "@/lib/utils";

interface SubmissionWidgetProps extends BaseWidgetProps {
  data: SubmissionWidgetData;
  variant?: 'total' | 'pending' | 'approved' | 'rejected';
  onActionClick?: () => void;
}

const SubmissionWidget = ({ 
  data, 
  variant = 'total', 
  className, 
  loading = false,
  onActionClick 
}: SubmissionWidgetProps) => {

  const getWidgetConfig = () => {
    switch (variant) {
      case 'total':
        return {
          title: "Total Pengajuan",
          icon: "heroicons:document-text",
          value: data.totalSubmissions,
          subtitle: "Semua pengajuan Anda",
          chartColor: "#3b82f6", // blue
          chartData: mockChartData.submissionTrend,
          trend: {
            direction: data.trend,
            percentage: data.trendPercentage,
            label: "vs bulan lalu"
          },
          actionButton: onActionClick ? {
            label: "Lihat Semua",
            onClick: onActionClick
          } : undefined
        };

      case 'pending':
        return {
          title: "Menunggu Persetujuan",
          icon: "heroicons:clock",
          value: data.pending,
          subtitle: "Pengajuan dalam proses",
          chartColor: "#f59e0b", // amber
          chartData: [data.pending + 2, data.pending - 1, data.pending + 1, data.pending, data.pending + 3, data.pending - 2, data.pending],
          trend: {
            direction: data.pending > 5 ? 'up' : 'stable',
            percentage: Math.round((data.pending / data.totalSubmissions) * 100),
            label: "dari total pengajuan"
          },
          actionButton: onActionClick ? {
            label: "Cek Status",
            onClick: onActionClick
          } : undefined
        };

      case 'approved':
        return {
          title: "Disetujui",
          icon: "heroicons:check-circle",
          value: data.approved,
          subtitle: "Pengajuan yang disetujui",
          chartColor: "#10b981", // emerald
          chartData: [data.approved - 5, data.approved - 3, data.approved - 1, data.approved - 2, data.approved, data.approved + 1, data.approved],
          trend: {
            direction: data.trend,
            percentage: Math.round((data.approved / data.totalSubmissions) * 100),
            label: "tingkat persetujuan"
          },
          actionButton: onActionClick ? {
            label: "Lihat Detail",
            onClick: onActionClick
          } : undefined
        };

      case 'rejected':
        return {
          title: "Ditolak",
          icon: "heroicons:x-circle",
          value: data.rejected,
          subtitle: "Pengajuan yang ditolak",
          chartColor: "#ef4444", // red
          chartData: [data.rejected + 1, data.rejected, data.rejected + 2, data.rejected - 1, data.rejected, data.rejected + 1, data.rejected],
          trend: {
            direction: data.rejected < 3 ? 'down' : 'up',
            percentage: Math.round((data.rejected / data.totalSubmissions) * 100),
            label: "tingkat penolakan"
          },
          actionButton: onActionClick ? {
            label: "Lihat Alasan",
            onClick: onActionClick
          } : undefined
        };

      default:
        return {
          title: "Pengajuan",
          icon: "heroicons:document-text",
          value: data.totalSubmissions,
          subtitle: "Total pengajuan"
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

export { SubmissionWidget };

// # END OF Submission Widget 