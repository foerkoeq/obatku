"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DashboardStatCard,
  LowStockAlertWidget,
  ExpiringItemsWidget,
  RecentActivityWidget,
} from "@/components/blocks";

import {
  buildStatCards,
  mockDashboardSummary,
  mockLowStockItems,
  mockExpiringItems,
  mockRecentActivities,
} from "@/lib/data/dashboard-demo";

import { Icon } from "@/components/ui/icon";

// ─── Mock user (replace with auth context in production) ────────────────────

const MOCK_USER = {
  role: "Admin",
  name: "Admin User",
  district: "Kabupaten Tuban",
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [loading] = useState(false);

  // Build stat cards from summary data
  const statCards = useMemo(
    () => buildStatCards(mockDashboardSummary),
    []
  );

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-default-900">
            Dashboard
          </h1>
          <p className="text-sm text-default-500">
            Selamat datang, {MOCK_USER.name} —{" "}
            <span className="font-medium text-default-600">
              {MOCK_USER.district}
            </span>
          </p>
        </div>

        {/* Date badge */}
        <div className="flex items-center gap-1.5 text-xs text-default-400">
          <Icon icon="heroicons:calendar-days" className="h-3.5 w-3.5" />
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* ── Stat Cards Grid ─────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((card) => (
            <DashboardStatCard
              key={card.featureId}
              config={card}
              loading={loading}
            />
          ))}
        </div>
      </section>

      {/* ── Detail Panels ───────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Low stock alert */}
          <LowStockAlertWidget
            items={mockLowStockItems}
            loading={loading}
            onViewAll={() => router.push("/inventory")}
          />

          {/* Expiring items */}
          <ExpiringItemsWidget
            items={mockExpiringItems}
            loading={loading}
            onViewAll={() => router.push("/inventory")}
          />
        </div>
      </section>

      {/* ── Activity Feed (full width) ──────────────────────────────────── */}
      <section>
        <RecentActivityWidget
          activities={mockRecentActivities}
          loading={loading}
        />
      </section>
    </div>
  );
}
