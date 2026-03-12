"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { getTrendIcon } from "@/lib/data/dashboard-demo";
import type { StatCardConfig, BaseWidgetProps } from "@/lib/types/dashboard";

// ─── Color maps ─────────────────────────────────────────────────────────────

const iconBg: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  secondary: "bg-secondary/10 text-secondary-foreground",
  default: "bg-default-100 text-default-600",
};

const alertRing: Record<string, string> = {
  warning: "ring-2 ring-warning/30",
  destructive: "ring-2 ring-destructive/30",
};

function trendColor(dir: "up" | "down" | "stable", invert?: boolean): string {
  if (dir === "stable") return "text-default-500";
  const good = dir === "up" ? !invert : invert;
  return good ? "text-success" : "text-destructive";
}

// ─── Loading skeleton ───────────────────────────────────────────────────────

function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Stat card ──────────────────────────────────────────────────────────────

interface DashboardStatCardProps extends BaseWidgetProps {
  config: StatCardConfig;
}

function DashboardStatCardInner({
  config,
  className,
  loading = false,
}: DashboardStatCardProps) {
  if (loading) return <StatCardSkeleton className={className} />;

  const { label, value, icon, color, subtitle, trend, alert } = config;

  return (
    <Card
      className={cn(
        "group h-full transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        alert && alertRing[color],
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left: text content */}
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-medium text-default-500 uppercase tracking-wide truncate">
              {label}
            </p>

            <p className="text-2xl font-bold text-default-900 tabular-nums">
              {value.toLocaleString("id-ID")}
            </p>

            {/* Trend or subtitle */}
            {trend ? (
              <div className="flex items-center gap-1 flex-wrap">
                <Icon
                  icon={getTrendIcon(trend.direction)}
                  className={cn("h-3.5 w-3.5", trendColor(trend.direction, trend.invertColor))}
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    trendColor(trend.direction, trend.invertColor)
                  )}
                >
                  {trend.value}%
                </span>
                <span className="text-xs text-default-400">{trend.label}</span>
              </div>
            ) : subtitle ? (
              <p className="text-xs text-default-400 truncate">{subtitle}</p>
            ) : null}
          </div>

          {/* Right: icon */}
          <div
            className={cn(
              "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center",
              "transition-transform duration-200 group-hover:scale-110",
              iconBg[color] ?? iconBg.default
            )}
          >
            <Icon icon={icon} className="h-5 w-5" />
          </div>
        </div>

        {/* Alert badge */}
        {alert && (
          <div className="mt-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                color === "destructive"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-warning/10 text-warning"
              )}
            >
              <Icon icon="heroicons:exclamation-circle-solid" className="h-3 w-3" />
              Butuh perhatian
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Stat card — wraps in <Link> when `config.href` is set */
const DashboardStatCard = React.memo(function DashboardStatCard(
  props: DashboardStatCardProps
) {
  if (props.config.href) {
    return (
      <Link href={props.config.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
        <DashboardStatCardInner {...props} />
      </Link>
    );
  }
  return <DashboardStatCardInner {...props} />;
});

export { DashboardStatCard };
