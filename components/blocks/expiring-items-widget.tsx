"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ExpiringItem, BaseWidgetProps } from "@/lib/types/dashboard";

// ─── Helpers ────────────────────────────────────────────────────────────────

function expirySeverity(days: number) {
  if (days <= 7)
    return { label: "Kritis", color: "destructive" as const, bg: "bg-destructive/10 text-destructive" };
  if (days <= 30)
    return { label: "Segera", color: "warning" as const, bg: "bg-warning/10 text-warning" };
  return { label: "Peringatan", color: "orange" as const, bg: "bg-orange-100 text-orange-600" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Loading ────────────────────────────────────────────────────────────────

function ExpiringSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

interface ExpiringItemsWidgetProps extends BaseWidgetProps {
  items: ExpiringItem[];
  maxItems?: number;
  onViewAll?: () => void;
}

function ExpiringItemsWidget({
  items,
  maxItems = 5,
  className,
  loading = false,
  onViewAll,
}: ExpiringItemsWidgetProps) {
  // Sort by most urgent first
  const sorted = [...items].sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  const displayed = sorted.slice(0, maxItems);

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <Icon icon="heroicons:clock" className="h-4 w-4 text-warning" />
            </div>
            <CardTitle className="text-sm font-semibold">Segera Kadaluarsa</CardTitle>
          </div>
          <Badge color="warning" rounded="full" className="text-[10px]">
            {items.length} item
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {loading ? (
          <div className="px-6 pb-4">
            <ExpiringSkeleton />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
            <Icon icon="heroicons:check-badge" className="h-10 w-10 text-success mb-2" />
            <p className="text-sm font-medium text-default-700">Tidak ada obat kadaluarsa</p>
            <p className="text-xs text-default-400">Semua obat masih dalam masa berlaku</p>
          </div>
        ) : (
          <ScrollArea className="h-full max-h-[360px]">
            <div className="divide-y divide-default-100">
              {displayed.map((item) => {
                const sev = expirySeverity(item.daysUntilExpiry);

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-default-50 transition-colors"
                  >
                    {/* Days countdown */}
                    <div
                      className={cn(
                        "flex-shrink-0 h-10 w-10 rounded-lg flex flex-col items-center justify-center",
                        sev.bg
                      )}
                    >
                      <span className="text-sm font-bold leading-none">
                        {item.daysUntilExpiry}
                      </span>
                      <span className="text-[8px] font-medium leading-none mt-0.5">hari</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-default-800 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-default-400">
                        <span>Batch: {item.batchNumber}</span>
                        <span>·</span>
                        <span>{item.stock} {item.unit}</span>
                      </div>
                      <p className="text-[11px] text-default-400">
                        Exp: {formatDate(item.expiryDate)}
                      </p>
                    </div>

                    {/* Severity badge */}
                    <Badge color={sev.color} rounded="full" className="text-[10px] flex-shrink-0">
                      {sev.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {onViewAll && items.length > 0 && (
        <div className="flex-shrink-0 border-t border-default-100 px-6 py-2.5">
          <button
            onClick={onViewAll}
            className="flex items-center justify-center gap-1 w-full text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Lihat semua obat kadaluarsa
            <Icon icon="heroicons:arrow-right-mini" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </Card>
  );
}

export { ExpiringItemsWidget };
