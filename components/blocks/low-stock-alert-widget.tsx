"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LowStockItem, BaseWidgetProps } from "@/lib/types/dashboard";

// ─── Helpers ────────────────────────────────────────────────────────────────

function stockPercentage(current: number, min: number): number {
  if (min <= 0) return 100;
  return Math.min(Math.round((current / min) * 100), 100);
}

function stockSeverity(current: number, min: number) {
  const pct = stockPercentage(current, min);
  if (pct <= 20) return { label: "Kritis", color: "destructive" as const, progressColor: "destructive" as const };
  if (pct <= 50) return { label: "Rendah", color: "warning" as const, progressColor: "warning" as const };
  return { label: "Perhatian", color: "orange" as const, progressColor: "warning" as const };
}

// ─── Loading ────────────────────────────────────────────────────────────────

function LowStockSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

interface LowStockAlertWidgetProps extends BaseWidgetProps {
  items: LowStockItem[];
  maxItems?: number;
  onViewAll?: () => void;
}

function LowStockAlertWidget({
  items,
  maxItems = 7,
  className,
  loading = false,
  onViewAll,
}: LowStockAlertWidgetProps) {
  const displayed = items.slice(0, maxItems);

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Icon icon="heroicons:exclamation-triangle" className="h-4 w-4 text-destructive" />
            </div>
            <CardTitle className="text-sm font-semibold">Stok Menipis</CardTitle>
          </div>
          <Badge color="destructive" rounded="full" className="text-[10px]">
            {items.length} item
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {loading ? (
          <div className="px-6 pb-4">
            <LowStockSkeleton />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
            <Icon icon="heroicons:check-badge" className="h-10 w-10 text-success mb-2" />
            <p className="text-sm font-medium text-default-700">Semua stok aman</p>
            <p className="text-xs text-default-400">Tidak ada obat di bawah batas minimum</p>
          </div>
        ) : (
          <ScrollArea className="h-full max-h-[360px]">
            <div className="divide-y divide-default-100">
              {displayed.map((item) => {
                const pct = stockPercentage(item.currentStock, item.minStock);
                const sev = stockSeverity(item.currentStock, item.minStock);

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-default-50 transition-colors"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold",
                        pct <= 20
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning"
                      )}
                    >
                      {pct}%
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-default-800 truncate">
                          {item.name}
                        </p>
                        <Badge color={sev.color} rounded="full" className="text-[10px] flex-shrink-0">
                          {sev.label}
                        </Badge>
                      </div>

                      <Progress
                        value={pct}
                        size="sm"
                        color={sev.progressColor}
                        className="h-1.5"
                      />

                      <div className="flex items-center justify-between text-[11px] text-default-400">
                        <span>
                          {item.currentStock} / {item.minStock} {item.unit}
                        </span>
                        {item.category && <span>{item.category}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* View all */}
      {onViewAll && items.length > 0 && (
        <div className="flex-shrink-0 border-t border-default-100 px-6 py-2.5">
          <button
            onClick={onViewAll}
            className="flex items-center justify-center gap-1 w-full text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Lihat semua stok menipis
            <Icon icon="heroicons:arrow-right-mini" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </Card>
  );
}

export { LowStockAlertWidget };
