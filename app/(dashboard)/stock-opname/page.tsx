// # START OF Stock Opname Page
// Purpose: Main stock opname page with table view, filtering, stock check/update, and print report
// Features: Stats cards, month/year filter, interactive table, 3 action buttons, print preview
// Dependencies: All stock-opname components, shadcn/ui, iconify

"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Stock Opname Components
import {
  StockOpnameStatsCards,
  StockOpnameTable,
  StockCheckDialog,
  StockUpdateDialog,
  StockOpnameReportPrint,
  StockOpnameDailyTable,
  TransactionDetailModal,
  mockStockOpnameItems,
  defaultKopSuratDinas,
  getStockOpnameStats,
  filterByKategori,
  filterByCheckStatus,
  getUniqueKategori,
  getDailyMovements,
  getTransactionDetails,
  getDaysInMonth,
} from "@/components/stock-opname";

// Types
import {
  StockOpnameItem,
  StockCheckEntry,
  StockUpdateEntry,
  PeriodMode,
  DailyTransactionDetail,
  NAMA_BULAN,
  NAMA_BULAN_SINGKAT,
} from "@/lib/types/stock-opname";

// Page Title
import PageTitle from "@/components/page-title";

const StockOpnamePage: React.FC = () => {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  // === State ===
  const [items, setItems] = useState<StockOpnameItem[]>(mockStockOpnameItems);
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [bulanDari, setBulanDari] = useState<number>(1);
  const [bulanSampai, setBulanSampai] = useState<number>(new Date().getMonth() + 1);
  const [periodMode, setPeriodMode] = useState<PeriodMode>('bulan_ini');
  const [selectedBulan, setSelectedBulan] = useState<number>(new Date().getMonth() + 1);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "checked" | "unchecked" | "discrepancy" | null
  >(null);

  // Dialog states
  const [showCheckDialog, setShowCheckDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockOpnameItem | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);

  // Daily view state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionDetail, setTransactionDetail] = useState<DailyTransactionDetail | null>(null);

  // === Computed ===
  const categories = useMemo(() => getUniqueKategori(items), [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.jenisPestisida.toLowerCase().includes(q) ||
          i.kategori.toLowerCase().includes(q) ||
          i.keterangan.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (kategoriFilter && kategoriFilter !== "all") {
      result = filterByKategori(result, kategoriFilter);
    }

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      result = filterByCheckStatus(result, statusFilter as "checked" | "unchecked" | "discrepancy");
    }

    return result;
  }, [items, search, kategoriFilter, statusFilter]);

  const stats = useMemo(() => getStockOpnameStats(items), [items]);

  // === Handlers ===
  const handleStockCheck = useCallback(
    (entries: StockCheckEntry[]) => {
      setItems((prev) =>
        prev.map((item) => {
          const entry = entries.find((e) => e.itemId === item.id);
          if (entry) {
            return {
              ...item,
              stokFisik: entry.stokFisik,
              selisih: entry.selisih,
              keterangan:
                entry.selisih === 0
                  ? "Stok sesuai"
                  : entry.catatan || `Selisih ${entry.selisih}`,
              lastChecked: entry.checkedAt,
              checkedBy: entry.checkedBy,
            };
          }
          return item;
        })
      );
    },
    []
  );

  const handleStockUpdate = useCallback(
    (entries: StockUpdateEntry[]) => {
      setItems((prev) =>
        prev.map((item) => {
          const itemEntries = entries.filter((e) => e.itemId === item.id);
          if (itemEntries.length === 0) return item;

          const newPergerakan = { ...item.pergerakan };
          let newStokAkhir = item.stokAkhir;

          itemEntries.forEach((entry) => {
            const existing = newPergerakan[entry.bulan] || { masuk: 0, keluar: 0 };
            if (entry.tipe === "masuk") {
              newPergerakan[entry.bulan] = {
                ...existing,
                masuk: existing.masuk + entry.jumlah,
              };
              newStokAkhir += entry.jumlah;
            } else if (entry.tipe === "keluar") {
              newPergerakan[entry.bulan] = {
                ...existing,
                keluar: existing.keluar + entry.jumlah,
              };
              newStokAkhir -= entry.jumlah;
            } else {
              // adjustment — positive = add, negative = subtract
              newStokAkhir += entry.jumlah;
            }
          });

          return {
            ...item,
            pergerakan: newPergerakan,
            stokAkhir: Math.max(0, newStokAkhir),
          };
        })
      );
    },
    []
  );

  const handlePrint = useCallback(() => {
    setShowPrintPreview(true);
  }, []);

  const executePrint = useCallback(() => {
    // Create a new window for printing in landscape
    const printWindow = window.open("", "_blank");
    if (!printWindow || !printRef.current) return;

    const content = printRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Stock Opname ${tahun}</title>
        <style>
          @page { size: A4 landscape; margin: 8mm; }
          body { margin: 0; padding: 0; }
          * { box-sizing: border-box; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid black; padding: 2px 3px; }
          .font-bold, th { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .uppercase { text-transform: uppercase; }
          .leading-tight { line-height: 1.2; }
          .leading-snug { line-height: 1.4; }
          .border-b-\\[3px\\] { border-bottom: 3px solid black; }
          .border-b { border-bottom: 1px solid black; }
          .border-black { border-color: black; }
          .flex { display: flex; }
          .items-start { align-items: flex-start; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .flex-1 { flex: 1; }
          .flex-shrink-0 { flex-shrink: 0; }
          .gap-4 { gap: 16px; }
          .mb-4 { margin-bottom: 16px; }
          .mb-14 { margin-bottom: 56px; }
          .mb-16 { margin-bottom: 64px; }
          .mt-1 { margin-top: 4px; }
          .mt-6 { margin-top: 24px; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .p-6 { padding: 24px; }
          .p-0\\.5 { padding: 2px; }
          .p-1 { padding: 4px; }
          .pb-3 { padding-bottom: 12px; }
          .w-6 { width: 24px; }
          .w-8 { width: 32px; }
          .w-12 { width: 48px; }
          .w-16 { width: 64px; }
          .w-40 { width: 160px; }
          .w-56 { width: 224px; }
          .h-12 { height: 48px; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .bg-blue-50 { background-color: #eff6ff; }
          .bg-amber-50 { background-color: #fffbeb; }
          .min-w-\\[100px\\] { min-width: 100px; }
          .min-w-\\[60px\\] { min-width: 60px; }
          .align-middle { vertical-align: middle; }
        </style>
      </head>
      <body>
        <div style="font-family: 'Times New Roman', serif; font-size: 9pt; line-height: 1.3; padding: 10px;">
          ${content}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }, [tahun]);

  const handleItemClick = useCallback((item: StockOpnameItem) => {
    setSelectedItem(item);
    setShowItemDetail(true);
  }, []);

  const handleFilterReset = useCallback(() => {
    setSearch("");
    setKategoriFilter("all");
    setStatusFilter(null);
    setBulanDari(1);
    setBulanSampai(new Date().getMonth() + 1);
    setTahun(new Date().getFullYear());
    setPeriodMode('bulan_ini');
    setSelectedBulan(new Date().getMonth() + 1);
  }, []);

  // === Daily cell click handler ===
  const handleDailyCellClick = useCallback((itemId: string, day: number) => {
    const detail = getTransactionDetails(itemId, selectedBulan, day);
    if (detail && (detail.masuk.length > 0 || detail.keluar.length > 0)) {
      setTransactionDetail(detail);
      setShowTransactionModal(true);
    }
  }, [selectedBulan, tahun]);

  // === Quick preset buttons for period selection ===
  const monthPresets = [
    { label: "Bulan Ini", from: new Date().getMonth() + 1, to: new Date().getMonth() + 1, mode: 'bulan_ini' as PeriodMode },
    { label: "Triwulan 1", from: 1, to: 3, mode: 'triwulan_1' as PeriodMode },
    { label: "Triwulan 2", from: 4, to: 6, mode: 'triwulan_2' as PeriodMode },
    { label: "Triwulan 3", from: 7, to: 9, mode: 'triwulan_3' as PeriodMode },
    { label: "Triwulan 4", from: 10, to: 12, mode: 'triwulan_4' as PeriodMode },
    { label: "Semester 1", from: 1, to: 6, mode: 'semester_1' as PeriodMode },
    { label: "Semester 2", from: 7, to: 12, mode: 'semester_2' as PeriodMode },
    { label: "Setahun Penuh", from: 1, to: 12, mode: 'setahun' as PeriodMode },
    { label: "Per Bulan", from: 0, to: 0, mode: 'per_bulan' as PeriodMode },
  ];

  const isPresetActive = (preset: typeof monthPresets[0]) => {
    if (preset.mode === 'per_bulan') return periodMode === 'per_bulan';
    return periodMode === preset.mode && bulanDari === preset.from && bulanSampai === preset.to;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Opname</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pantau dan kelola persediaan obat pertanian secara berkala
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setShowCheckDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Icon icon="heroicons:clipboard-document-check" className="w-4 h-4 mr-2" />
                  Cek Stok
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Periksa stok fisik dan bandingkan dengan sistem</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setShowUpdateDialog(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Icon icon="heroicons:pencil-square" className="w-4 h-4 mr-2" />
                  Update Stok
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Catat pergerakan stok masuk, keluar, atau adjustment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handlePrint}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Icon icon="heroicons:printer" className="w-4 h-4 mr-2" />
                  Cetak Laporan
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cetak laporan stock opname (landscape A4)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Stats Cards */}
      <StockOpnameStatsCards
        stats={stats}
        onFilterClick={(f) => setStatusFilter(f)}
        activeFilter={statusFilter}
      />

      {/* Filter & Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Row 1: Search + Category + Year */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Icon
                  icon="heroicons:magnifying-glass"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                />
                <Input
                  placeholder="Cari jenis pestisida..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
                {search && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setSearch("")}
                  >
                    <Icon icon="heroicons:x-circle" className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* Category */}
              <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year */}
              <Select value={String(tahun)} onValueChange={(v) => setTahun(Number(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Reset */}
              <Button variant="ghost" size="icon" onClick={handleFilterReset} title="Reset filter">
                <Icon icon="heroicons:arrow-path" className="w-4 h-4" />
              </Button>
            </div>

            {/* Row 2: Period presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground mr-1">Periode:</span>
              {monthPresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant={isPresetActive(preset) ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    if (preset.mode === 'per_bulan') {
                      setPeriodMode('per_bulan');
                    } else {
                      setPeriodMode(preset.mode);
                      setBulanDari(preset.from);
                      setBulanSampai(preset.to);
                    }
                  }}
                >
                  {preset.label}
                </Button>
              ))}

              {/* Month picker for "Per Bulan" mode */}
              {periodMode === 'per_bulan' && (
                <>
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  <Select
                    value={String(selectedBulan)}
                    onValueChange={(v) => setSelectedBulan(Number(v))}
                  >
                    <SelectTrigger className="w-[130px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(NAMA_BULAN).map(([key, name]) => (
                        <SelectItem key={key} value={key}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {/* Active filters */}
            {(search || kategoriFilter !== "all" || statusFilter) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Filter aktif:</span>
                {search && (
                  <Badge color="secondary" className="text-xs gap-1">
                    Pencarian: &quot;{search}&quot;
                    <button onClick={() => setSearch("")}>
                      <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {kategoriFilter !== "all" && (
                  <Badge color="secondary" className="text-xs gap-1">
                    {kategoriFilter}
                    <button onClick={() => setKategoriFilter("all")}>
                      <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {statusFilter && (
                  <Badge color="secondary" className="text-xs gap-1">
                    {statusFilter === "checked"
                      ? "Sudah Dicek"
                      : statusFilter === "unchecked"
                        ? "Belum Dicek"
                        : statusFilter === "discrepancy"
                          ? "Ada Selisih"
                          : "Semua"}
                    <button onClick={() => setStatusFilter(null)}>
                      <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon icon={periodMode === 'per_bulan' ? "heroicons:calendar-days" : "heroicons:table-cells"} className="w-5 h-5 text-primary" />
                {periodMode === 'per_bulan' ? 'Tabel Harian' : 'Tabel Stock Opname'}
              </CardTitle>
              <CardDescription className="mt-1">
                {periodMode === 'per_bulan'
                  ? `Menampilkan ${filteredItems.length} item • ${NAMA_BULAN[selectedBulan]} ${tahun} • Klik sel untuk detail`
                  : `Menampilkan ${filteredItems.length} dari ${items.length} item • ${NAMA_BULAN[bulanDari]}${bulanDari !== bulanSampai ? ` - ${NAMA_BULAN[bulanSampai]}` : ''} ${tahun}`
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-xs border">
                <Icon icon="heroicons:arrow-down-tray" className="w-3 h-3 mr-1 text-emerald-500" />
                M = Masuk
              </Badge>
              <Badge className="text-xs border">
                <Icon icon="heroicons:arrow-up-tray" className="w-3 h-3 mr-1 text-rose-500" />
                K = Keluar
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {periodMode === 'per_bulan' ? (
            <StockOpnameDailyTable
              items={filteredItems}
              bulan={selectedBulan}
              tahun={tahun}
              onCellClick={handleDailyCellClick}
              onItemClick={handleItemClick}
            />
          ) : (
            <StockOpnameTable
              items={filteredItems}
              bulanDari={bulanDari}
              bulanSampai={bulanSampai}
              tahun={tahun}
              onItemClick={handleItemClick}
            />
          )}
        </CardContent>
      </Card>

      {/* === Dialogs === */}

      {/* Stock Check Dialog */}
      <StockCheckDialog
        open={showCheckDialog}
        onOpenChange={setShowCheckDialog}
        items={items}
        onSubmit={handleStockCheck}
      />

      {/* Stock Update Dialog */}
      <StockUpdateDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        items={items}
        tahun={tahun}
        onSubmit={handleStockUpdate}
      />

      {/* Transaction Detail Modal (daily view cell click) */}
      <TransactionDetailModal
        open={showTransactionModal}
        onOpenChange={setShowTransactionModal}
        data={transactionDetail}
      />

      {/* Print Preview Dialog */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Icon icon="heroicons:printer" className="w-5 h-5 text-emerald-600" />
              Preview Laporan Stock Opname
            </DialogTitle>
            <DialogDescription>
              Laporan akan dicetak dalam orientasi landscape A4
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 px-4 pb-2">
            <Button onClick={executePrint} className="bg-emerald-600 hover:bg-emerald-700">
              <Icon icon="heroicons:printer" className="w-4 h-4 mr-2" />
              Cetak Sekarang
            </Button>
            <Button variant="outline" onClick={() => setShowPrintPreview(false)}>
              Tutup
            </Button>
          </div>

          <ScrollArea className="max-h-[calc(95vh-120px)]">
            <div className="p-4 overflow-x-auto">
              <StockOpnameReportPrint
                ref={printRef}
                items={filteredItems}
                kopSurat={defaultKopSuratDinas}
                tahun={tahun}
                bulanDari={bulanDari}
                bulanSampai={bulanSampai}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Item Detail Dialog */}
      <Dialog open={showItemDetail} onOpenChange={setShowItemDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-600" />
              Detail Item
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedItem.jenisPestisida}</h3>
                <Badge className="mt-1 border">{selectedItem.kategori}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-blue-600 font-medium">Stok Awal</p>
                  <p className="text-lg font-bold text-blue-700">
                    {selectedItem.stokAwal.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedItem.satuan}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-amber-600 font-medium">Stok Akhir (Sistem)</p>
                  <p className="text-lg font-bold text-amber-700">
                    {selectedItem.stokAkhir.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedItem.satuan}</p>
                </div>
              </div>

              {selectedItem.stokFisik !== undefined && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-emerald-600 font-medium">Stok Fisik</p>
                    <p className="text-lg font-bold text-emerald-700">
                      {selectedItem.stokFisik.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg p-3 text-center",
                      selectedItem.selisih === 0
                        ? "bg-emerald-50"
                        : "bg-rose-50"
                    )}
                  >
                    <p className={cn(
                      "text-xs font-medium",
                      selectedItem.selisih === 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    )}>Selisih</p>
                    <p className={cn(
                      "text-lg font-bold",
                      selectedItem.selisih === 0
                        ? "text-emerald-700"
                        : "text-rose-700"
                    )}>
                      {selectedItem.selisih === 0
                        ? "0 (Sesuai)"
                        : `${selectedItem.selisih! > 0 ? "+" : ""}${selectedItem.selisih}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Movement summary for visible months */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Ringkasan Pergerakan</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {Object.entries(selectedItem.pergerakan)
                    .filter(([m]) => Number(m) >= bulanDari && Number(m) <= bulanSampai)
                    .map(([m, mov]) => (
                      <div key={m} className="border rounded-md p-2 text-center text-xs">
                        <p className="font-medium text-muted-foreground">
                          {NAMA_BULAN_SINGKAT[Number(m)]}
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="text-emerald-600">
                            +{mov.masuk}
                          </span>
                          <span className="text-rose-600">
                            -{mov.keluar}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Keterangan: {selectedItem.keterangan}</p>
                {selectedItem.lastChecked && (
                  <p>
                    Terakhir dicek:{" "}
                    {selectedItem.lastChecked.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    oleh {selectedItem.checkedBy}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockOpnamePage;

// # END OF Stock Opname Page
