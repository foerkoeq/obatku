"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRelativeTime } from "@/lib/data/dashboard-demo";
import type { RecentActivity, BaseWidgetProps } from "@/lib/types/dashboard";

// ─── Type → icon & color map ────────────────────────────────────────────────

const activityMeta: Record<
  RecentActivity["type"],
  { icon: string; defaultColor: string }
> = {
  pengajuan: { icon: "heroicons:document-text", defaultColor: "text-info" },
  persetujuan: { icon: "heroicons:check-badge", defaultColor: "text-success" },
  stok_masuk: { icon: "heroicons:arrow-down-tray", defaultColor: "text-primary" },
  stok_keluar: { icon: "heroicons:arrow-up-tray", defaultColor: "text-violet-500" },
  user: { icon: "heroicons:user-plus", defaultColor: "text-indigo-500" },
  opname: { icon: "heroicons:clipboard-document-check", defaultColor: "text-cyan-500" },
  kadaluarsa: { icon: "heroicons:exclamation-triangle", defaultColor: "text-warning" },
};

const statusDot: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  error: "bg-destructive",
};

// ─── Skeleton ───────────────────────────────────────────────────────────────

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

interface RecentActivityWidgetProps extends BaseWidgetProps {
  activities: RecentActivity[];
  maxItems?: number;
}

function RecentActivityWidget({
  activities,
  maxItems = 8,
  className,
  loading = false,
}: RecentActivityWidgetProps) {
  const displayed = activities.slice(0, maxItems);

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-default-100 flex items-center justify-center">
              <Icon icon="heroicons:bell" className="h-4 w-4 text-default-600" />
            </div>
            <CardTitle className="text-sm font-semibold">Aktivitas Terbaru</CardTitle>
          </div>
          <Badge rounded="full" className="text-[10px]">
            {activities.length} baru
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {loading ? (
          <div className="px-6 pb-4">
            <ActivitySkeleton />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
            <Icon icon="heroicons:inbox" className="h-10 w-10 text-default-300 mb-2" />
            <p className="text-sm font-medium text-default-700">Belum ada aktivitas</p>
            <p className="text-xs text-default-400">Aktivitas sistem akan muncul di sini</p>
          </div>
        ) : (
          <ScrollArea className="h-full max-h-[420px]">
            <div className="relative pl-6 pr-6">
              {/* timeline line */}
              <div className="absolute left-[39px] top-0 bottom-0 w-px bg-default-200" />

              {displayed.map((activity, idx) => {
                const meta = activityMeta[activity.type] ?? activityMeta.pengajuan;
                const isLast = idx === displayed.length - 1;

                return (
                  <div
                    key={activity.id}
                    className={cn(
                      "relative flex gap-3 pb-4",
                      !isLast && "border-default-100"
                    )}
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0 h-8 w-8 rounded-full bg-card border-2 border-default-200 flex items-center justify-center">
                      <Icon icon={meta.icon} className={cn("h-3.5 w-3.5", meta.defaultColor)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5 space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-default-800 leading-snug">
                          {activity.title}
                        </p>
                        {activity.status && (
                          <span
                            className={cn(
                              "flex-shrink-0 h-2 w-2 rounded-full mt-1.5",
                              statusDot[activity.status] ?? statusDot.info
                            )}
                          />
                        )}
                      </div>

                      <p className="text-xs text-default-500 leading-relaxed line-clamp-2">
                        {activity.description}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-default-400">
                        <span>{activity.actor}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export { RecentActivityWidget };
