// # START OF Transaction List Page - Revamped transaction management page
// Purpose: Display transaction list with search, filter, table, modals
// Features: Mobile-first, responsive, status filter chips, detail/process/delete modals
// Dependencies: New TrxList components, transaction-list types & mock data

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SiteBreadcrumb from "@/components/site-breadcrumb";

// New components
import TrxListTable from "@/components/transactions/trx-list-table";
import TrxDetailModal from "@/components/transactions/trx-detail-modal";
import TrxProcessModal from "@/components/transactions/trx-process-modal";
import TrxDeleteDialog from "@/components/transactions/trx-delete-dialog";

// Types & data
import {
  TrxListItem,
  TrxStatus,
  TrxListFilters,
  ALL_TRX_STATUSES,
  TRX_STATUS_CONFIG,
  SelectedMedicine,
  TrxSortDirection,
  TrxSortKey,
} from "@/lib/types/transaction-list";
import {
  mockTrxList,
  getTrxStats,
  getUniqueKecamatan,
  getUniqueYears,
} from "@/lib/data/transaction-list-mock";

// ========== Constants ==========

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// ========== Main Page Component ==========

const TransactionListPage: React.FC = () => {
  const router = useRouter();

  // Data state
  const [data] = useState<TrxListItem[]>(mockTrxList);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState<TrxListFilters>({
    search: "",
    status: [],
    kecamatan: "",
    tahun: "",
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<TrxSortKey>("tanggalDiajukan");
  const [sortDirection, setSortDirection] = useState<TrxSortDirection>("desc");

  // Modal state
  const [detailItem, setDetailItem] = useState<TrxListItem | null>(null);
  const [processItem, setProcessItem] = useState<TrxListItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<TrxListItem | null>(null);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Derived data
  const stats = useMemo(() => getTrxStats(), []);
  const kecamatanList = useMemo(() => getUniqueKecamatan(), []);
  const yearList = useMemo(() => getUniqueYears(), []);

  // ========== Filtering ==========

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.poktan.nama.toLowerCase().includes(q) ||
          item.poktan.kecamatan.toLowerCase().includes(q) ||
          item.poktan.ketua.toLowerCase().includes(q) ||
          item.opt.some((o) => o.toLowerCase().includes(q)) ||
          item.permintaanObat.some((o) => o.toLowerCase().includes(q)) ||
          (item.persetujuanObat?.some((o) => o.toLowerCase().includes(q)) ?? false) ||
          (item.noBast?.toLowerCase().includes(q) ?? false) ||
          item.diajukanOleh.nama.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter((item) => filters.status.includes(item.status));
    }

    // Kecamatan filter
    if (filters.kecamatan) {
      result = result.filter((item) => item.poktan.kecamatan === filters.kecamatan);
    }

    // Tahun filter
    if (filters.tahun) {
      const selectedYear = Number(filters.tahun);
      result = result.filter((item) => item.tanggalDiajukan.getFullYear() === selectedYear);
    }

    return result;
  }, [data, filters]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case "tanggalDiajukan": {
          comparison = a.tanggalDiajukan.getTime() - b.tanggalDiajukan.getTime();
          break;
        }
        case "tahun": {
          comparison = a.tanggalDiajukan.getFullYear() - b.tanggalDiajukan.getFullYear();
          break;
        }
        case "status": {
          comparison = TRX_STATUS_CONFIG[a.status].order - TRX_STATUS_CONFIG[b.status].order;
          break;
        }
        case "poktan": {
          comparison = a.poktan.nama.localeCompare(b.poktan.nama, "id");
          break;
        }
        case "kecamatan": {
          comparison = a.poktan.kecamatan.localeCompare(b.poktan.kecamatan, "id");
          break;
        }
        case "luasTerserang": {
          comparison = a.luasTerserang - b.luasTerserang;
          break;
        }
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortDirection, sortKey]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // ========== Handlers ==========

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const toggleStatusFilter = useCallback((status: TrxStatus) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  }, []);

  const handleKecamatanChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, kecamatan: value === "all" ? "" : value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ search: "", status: [], kecamatan: "", tahun: "" });
  }, []);

  const handleYearChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, tahun: value === "all" ? "" : value }));
  }, []);

  const handleSortChange = useCallback((key: TrxSortKey) => {
    setSortKey((currentKey) => {
      if (currentKey === key) {
        setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
        return currentKey;
      }

      setSortDirection(key === "tanggalDiajukan" ? "desc" : "asc");
      return key;
    });
  }, []);

  const handleRowClick = useCallback((item: TrxListItem) => {
    setDetailItem(item);
  }, []);

  const handleProcess = useCallback((item: TrxListItem) => {
    setProcessItem(item);
  }, []);

  const handleEdit = useCallback(
    (item: TrxListItem) => {
      router.push(`/transactions/${item.id}/edit`);
    },
    [router]
  );

  const handleDelete = useCallback((item: TrxListItem) => {
    setDeleteItem(item);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteItem) return;
    // Simulate delete
    toast.success("Transaksi berhasil dihapus", {
      description: `Transaksi ${deleteItem.id} telah dihapus`,
    });
    setDeleteItem(null);
  }, [deleteItem]);

  const handleProcessApproved = useCallback(
    (item: TrxListItem, medicines: SelectedMedicine[]) => {
      // In real app, this would call the API
      console.log("Approved:", item.id, medicines);
    },
    []
  );

  const activeFilterCount =
    filters.status.length + (filters.kecamatan ? 1 : 0) + (filters.tahun ? 1 : 0) + (filters.search ? 1 : 0);

  // ========== Render ==========

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb */}
      <SiteBreadcrumb>
        <Button
          onClick={() => router.push("/transactions/submission")}
          size="sm"
          className="gap-2 h-9 px-3 sm:h-10 sm:px-5 sm:text-sm"
        >
          <Icon icon="heroicons:plus" className="h-4 w-4" />
          <span className="hidden sm:inline">Buat Pengajuan</span>
          <span className="sm:hidden">Baru</span>
        </Button>
      </SiteBreadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-default-900">Daftar Transaksi</h1>
        <p className="text-default-500 text-sm mt-0.5">
          Kelola transaksi permintaan obat pertanian
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {[
          { key: "total", label: "Total", value: stats.total, icon: "heroicons:document-text", color: "text-blue-600 bg-blue-50 border-blue-200" },
          { key: "pengajuan", label: "Pengajuan", value: stats.pengajuan_dinas, icon: "heroicons:paper-airplane", color: "text-purple-600 bg-purple-50 border-purple-200" },
          { key: "proses", label: "Proses", value: (stats.persetujuan_dinas || 0) + (stats.proses_gudang || 0), icon: "heroicons:cog-6-tooth", color: "text-amber-600 bg-amber-50 border-amber-200" },
          { key: "selesai", label: "Selesai", value: stats.selesai, icon: "heroicons:check-badge", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
        ].map((stat) => (
          <div
            key={stat.key}
            className={cn(
              "rounded-xl border p-2.5 sm:p-4 transition-shadow hover:shadow-sm",
              stat.color
            )}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg bg-white/60">
                <Icon icon={stat.icon} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold leading-none">{stat.value}</p>
                <p className="text-[11px] sm:text-xs mt-0.5 opacity-80">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Card: Filters + Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 space-y-3">
          {/* Search + Kecamatan filter row */}
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Icon
                icon="heroicons:magnifying-glass"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-default-400"
              />
              <Input
                placeholder="Cari poktan, kecamatan, OPT, obat..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => handleSearchChange("")}
                >
                  <Icon icon="heroicons:x-mark" className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2 sm:gap-3 lg:w-auto">
              {/* Kecamatan dropdown */}
              <Select value={filters.kecamatan || "all"} onValueChange={handleKecamatanChange}>
                <SelectTrigger className="h-9 w-full sm:min-w-[180px] text-sm">
                  <SelectValue placeholder="Semua Kecamatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kecamatan</SelectItem>
                  {kecamatanList.map((kec) => (
                    <SelectItem key={kec} value={kec}>
                      {kec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tahun dropdown */}
              <Select value={filters.tahun || "all"} onValueChange={handleYearChange}>
                <SelectTrigger className="h-9 w-full sm:min-w-[120px] text-sm">
                  <SelectValue placeholder="Semua Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {yearList.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 text-xs text-default-500 gap-1 flex-shrink-0"
              >
                <Icon icon="heroicons:x-mark" className="h-3.5 w-3.5" />
                Hapus filter
              </Button>
            )}
          </div>

          {/* Status filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {ALL_TRX_STATUSES.map((status) => {
              const config = TRX_STATUS_CONFIG[status];
              const isActive = filters.status.includes(status);
              const count = data.filter((d) => d.status === status).length;

              return (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    isActive
                      ? cn(config.bgColor, config.color, config.borderColor, "ring-1 ring-offset-1", config.borderColor.replace("border-", "ring-"))
                      : "bg-default-50 text-default-500 border-default-200 hover:bg-default-100"
                  )}
                >
                  <Icon icon={config.icon} className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden xs:inline">{config.label}</span>
                  <span className="xs:hidden">{config.label.split(" ")[0]}</span>
                  <span
                    className={cn(
                      "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                      isActive ? "bg-white/80 text-inherit" : "bg-default-200 text-default-600"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        {/* Results count */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-b bg-default-50/40 flex items-center justify-between">
          <p className="text-xs text-default-500">
            Menampilkan{" "}
            <span className="font-medium text-default-700">{paginatedData.length}</span> dari{" "}
            <span className="font-medium text-default-700">{sortedData.length}</span> transaksi
          </p>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-default-500">Per halaman:</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-7 w-[65px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <TrxListTable
          data={paginatedData}
          loading={loading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSortChange}
          onRowClick={handleRowClick}
          onProcess={handleProcess}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pb-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={cn(
                    "cursor-pointer",
                    page === 1 && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    onClick={() => setPage(p)}
                    isActive={page === p}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={cn(
                    "cursor-pointer",
                    page === totalPages && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* ===== Modals ===== */}

      {/* Detail Modal */}
      <TrxDetailModal
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
        onProcess={handleProcess}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Process Modal */}
      <TrxProcessModal
        open={!!processItem}
        onClose={() => setProcessItem(null)}
        item={processItem}
        onApproved={handleProcessApproved}
      />

      {/* Delete Dialog */}
      <TrxDeleteDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        transactionId={deleteItem?.id}
      />
    </div>
  );
};

export default TransactionListPage;

// # END OF Transaction List Page
