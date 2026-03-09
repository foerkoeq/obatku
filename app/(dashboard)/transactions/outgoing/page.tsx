"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import PageTitle from "@/components/page-title";
import {
  mockOutgoingItems,
  getOutgoingStats,
  getOutgoingByStatus,
} from "@/lib/data/outgoing-mock";
import {
  OutgoingItem,
  OutgoingStatus,
  OUTGOING_STATUS_CONFIG,
} from "@/lib/types/outgoing";
import { OutgoingCard, OutgoingProcessSheet } from "@/components/transactions/outgoing";

// ─── Filter Tab Type ───
type FilterTab = "semua" | OutgoingStatus;

const FILTER_TABS: { key: FilterTab; label: string; icon: string }[] = [
  { key: "semua", label: "Semua", icon: "heroicons:squares-2x2" },
  {
    key: "proses_gudang",
    label: "Proses Gudang",
    icon: OUTGOING_STATUS_CONFIG.proses_gudang.icon,
  },
  {
    key: "selesai",
    label: "Selesai",
    icon: OUTGOING_STATUS_CONFIG.selesai.icon,
  },
];

// ─── Stat Card Styles ───
const STAT_STYLES: Record<
  string,
  { bg: string; text: string; icon: string; ring: string }
> = {
  total: {
    bg: "bg-slate-50 dark:bg-slate-900/50",
    text: "text-slate-700 dark:text-slate-300",
    icon: "heroicons:inbox-stack",
    ring: "ring-slate-200 dark:ring-slate-700",
  },
  proses_gudang: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    icon: OUTGOING_STATUS_CONFIG.proses_gudang.icon,
    ring: "ring-purple-200 dark:ring-purple-800",
  },
  selesai: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: OUTGOING_STATUS_CONFIG.selesai.icon,
    ring: "ring-emerald-200 dark:ring-emerald-800",
  },
};

const STAT_LABELS: Record<string, string> = {
  total: "Total",
  proses_gudang: "Proses Gudang",
  selesai: "Selesai",
};

// ════════════════════════════════════════════════
// Outgoing Transaction Page
// ════════════════════════════════════════════════

const OutgoingTransactionPage = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>("semua");
  const [selectedItem, setSelectedItem] = useState<OutgoingItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Stats
  const stats = useMemo(() => getOutgoingStats(), []);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (activeTab === "semua") return mockOutgoingItems;
    return getOutgoingByStatus(activeTab);
  }, [activeTab]);

  // Handlers
  const handleProcess = (item: OutgoingItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setTimeout(() => setSelectedItem(null), 300);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div>
        <PageTitle title="Pengeluaran Obat" />
        <p className="text-sm text-default-600 mt-1">
          Proses pengeluaran obat yang telah disetujui untuk didistribusikan ke kelompok tani.
        </p>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-3 gap-3">
        {(["total", "proses_gudang", "selesai"] as const).map((key) => {
          const style = STAT_STYLES[key];
          const count =
            key === "total"
              ? stats.total
              : stats[key as OutgoingStatus];
          return (
            <button
              key={key}
              onClick={() =>
                setActiveTab(key === "total" ? "semua" : (key as OutgoingStatus))
              }
              className={`
                relative flex items-center gap-3 rounded-xl p-3.5 ring-1 transition-all duration-200
                ${style.bg} ${style.ring}
                hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
                ${
                  (key === "total" && activeTab === "semua") ||
                  activeTab === key
                    ? "ring-2 shadow-sm"
                    : "ring-1 opacity-80 hover:opacity-100"
                }
              `}
            >
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-lg
                  ${style.bg} ${style.text}
                `}
              >
                <Icon icon={style.icon} className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <div className={`text-2xl font-bold ${style.text}`}>
                  {count}
                </div>
                <div className="text-xs text-default-500 truncate">
                  {STAT_LABELS[key]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── Filter Tabs ─── */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-default-100 dark:bg-default-50 w-fit">
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count =
            tab.key === "semua"
              ? stats.total
              : stats[tab.key as OutgoingStatus];
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-white dark:bg-default-200 text-default-900 shadow-sm"
                    : "text-default-500 hover:text-default-700 hover:bg-default-50 dark:hover:bg-default-100"
                }
              `}
            >
              <Icon icon={tab.icon} className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span
                className={`
                  ml-0.5 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full text-xs font-semibold px-1.5
                  ${
                    isActive
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/60 dark:text-primary-300"
                      : "bg-default-200 dark:bg-default-100 text-default-500"
                  }
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Cards Grid ─── */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <OutgoingCard
              key={item.id}
              item={item}
              onProcess={handleProcess}
            />
          ))}
        </div>
      ) : (
        <EmptyState activeTab={activeTab} />
      )}

      {/* ─── Process Sheet (Modal) ─── */}
      {selectedItem && (
        <OutgoingProcessSheet
          open={modalOpen}
          onOpenChange={handleModalClose}
          item={selectedItem}
        />
      )}
    </div>
  );
};

// ─── Empty State ───
const EmptyState = ({ activeTab }: { activeTab: FilterTab }) => {
  const label =
    activeTab === "semua"
      ? "permintaan"
      : OUTGOING_STATUS_CONFIG[activeTab as OutgoingStatus]?.label?.toLowerCase() ?? "permintaan";
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="p-4 rounded-full bg-default-100 dark:bg-default-50 mb-4">
        <Icon
          icon="heroicons:inbox"
          className="w-10 h-10 text-default-400"
        />
      </div>
      <h3 className="text-lg font-semibold text-default-800">
        Tidak Ada {activeTab === "semua" ? "Permintaan" : "Data"}
      </h3>
      <p className="text-default-500 mt-1 text-sm max-w-sm">
        Saat ini tidak ada {label} yang memerlukan tindakan Anda.
      </p>
    </div>
  );
};

export default OutgoingTransactionPage; 