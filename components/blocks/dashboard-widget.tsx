// # START OF Dashboard Widget - Base reusable dashboard widget component
// Purpose: Provide a flexible base component for all dashboard widgets
// Props/Params: DashboardWidgetProps interface with title, value, icon, trend, chart data, etc.
// Returns: JSX element for dashboard widget
// Dependencies: UI components, icons, chart library, utility functions

"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { DashboardWidgetProps } from "@/lib/types/dashboard";
import { getTrendIcon, getTrendColor } from "@/lib/data/dashboard-demo";

const Chart = dynamic(() => import("react-apexcharts"));

const DashboardWidget = ({
  title,
  icon,
  value,
  subtitle,
  trend,
  chartData,
  chartColor = "#0ce7fa",
  actionButton,
  className,
  loading = false
}: DashboardWidgetProps) => {
  const { theme: mode } = useTheme();

  // Chart configuration
  const chartSeries = chartData ? [{ data: chartData }] : [];
  const chartOptions: any = {
    chart: {
      toolbar: { show: false },
      sparkline: { enabled: true },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2
    },
    colors: [chartColor],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light"
    },
    grid: {
      show: false,
      padding: { left: 0, right: 0 }
    },
    yaxis: { show: false },
    fill: {
      type: "solid",
      opacity: 0.1
    },
    legend: { show: false },
    xaxis: {
      show: false,
      labels: { show: false },
      axisBorder: { show: false }
    }
  };

  if (loading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-default-600 truncate">
              {title}
            </h3>
            {icon && (
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-default-100 flex items-center justify-center">
                  <Icon 
                    icon={icon} 
                    className="h-4 w-4 text-default-600" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Main Value */}
          <div className="space-y-1">
            <div className="text-2xl font-bold text-default-900">
              {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
            </div>
            {subtitle && (
              <p className="text-xs text-default-500">
                {subtitle}
              </p>
            )}
          </div>

          {/* Trend Indicator */}
          {trend && (
            <div className="flex items-center gap-1">
              <Icon 
                icon={getTrendIcon(trend.direction)} 
                className={cn("h-3 w-3", getTrendColor(trend.direction))}
              />
              <span className={cn("text-xs font-medium", getTrendColor(trend.direction))}>
                {trend.percentage}%
              </span>
              {trend.label && (
                <span className="text-xs text-default-500">
                  {trend.label}
                </span>
              )}
            </div>
          )}

          {/* Chart */}
          {chartData && chartData.length > 0 && (
            <div className="mt-4">
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={60}
              />
            </div>
          )}

          {/* Action Button */}
          {actionButton && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={actionButton.onClick}
                className="w-full text-xs"
              >
                {actionButton.label}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { DashboardWidget };

// # END OF Dashboard Widget 