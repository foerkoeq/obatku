// # START OF Stock Update Dialog Component (v3) - Rack-based Stock Management
// Purpose: Rack-centric stock management with QR scanning & manual input
// Flow: Home (scan/pick rack) → Rack Detail (view items) → Adjust Stock (scan/manual/per-row actions)
// Mobile-first: Uses Drawer on mobile, Dialog on desktop
// ID Format: Rak = xxx-xxx-xxx | Satuan Besar = xxx-xxx-xxx-xx-xx-xxxx | Satuan Kecil = xxx-xxx-xxx-xx-xx-xxxx-xxxx

"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// QR Scanner
import QrScannerCamera from "@/components/qr-scanner/qr-scanner-camera";

// Types & Data
import {
  StockOpnameItem,
  StockUpdateEntry,
  StorageLocation,
  MedicineUnit,
} from "@/lib/types/stock-opname";
import {
  formatNumber,
  mockStorageLocations,
  getItemsByLocationId,
  findStorageLocation,
  findMedicineUnit,
  identifyQrCodeType,
  getStockOpnameItemById,
  validateQrFormat,
} from "@/lib/data/stock-opname-demo";

// ============================================================
// Internal Types
// ============================================================

type UpdateView = "home" | "rack_detail" | "adjust_stock";
type AdjustMode = "scan" | "manual";

/** Represents an item in the current rack session */
interface RackItem {
  itemId: string;
  jenisPestisida: string;
  kategori: string;
  satuan: string;
  stokAkhir: number;
  batchNumber?: string;
  expiryDate?: Date;
  /** Whether item has been verified via QR scan */
  scanned: boolean;
  /** Whether item is newly discovered (not originally in rack) */
  isNew: boolean;
  /** Pending action for this item */
  pendingAction: "none" | "pindahkan" | "hapus";
  /** Medicine unit info from QR scan */
  unitInfo?: MedicineUnit;
}

// ============================================================
// Props
// ============================================================

export interface StockUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: StockOpnameItem[];
  tahun: number;
  onSubmit: (entries: StockUpdateEntry[]) => void;
}

// ============================================================
// Helpers
// ============================================================

/** Get category icon color class */
const getCategoryColor = (kategori: string) => {
  switch (kategori) {
    case "Insektisida":
      return "bg-red-100 dark:bg-red-900/30 text-red-600";
    case "Fungisida":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600";
    case "Herbisida":
      return "bg-green-100 dark:bg-green-900/30 text-green-600";
    case "Rodentisida":
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-600";
    case "Agen Hayati":
      return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600";
    case "Pestisida Nabati":
      return "bg-lime-100 dark:bg-lime-900/30 text-lime-600";
    default:
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-600";
  }
};

/** Format date for display */
const formatExpiry = (date?: Date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
};

// ============================================================
// Component
// ============================================================

const StockUpdateDialog: React.FC<StockUpdateDialogProps> = ({
  open,
  onOpenChange,
  items,
  tahun,
  onSubmit,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // === State ===
  const [view, setView] = useState<UpdateView>("home");
  const [selectedLocation, setSelectedLocation] =
    useState<StorageLocation | null>(null);
  const [rackItems, setRackItems] = useState<RackItem[]>([]);
  const [adjustMode, setAdjustMode] = useState<AdjustMode>("scan");
  const [scannerActive, setScannerActive] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [unknownCode, setUnknownCode] = useState<string | null>(null);

  // === Derived State ===
  const existingItems = useMemo(
    () => rackItems.filter((ri) => !ri.isNew),
    [rackItems]
  );
  const newItems = useMemo(
    () => rackItems.filter((ri) => ri.isNew),
    [rackItems]
  );
  const scannedCount = useMemo(
    () => existingItems.filter((i) => i.scanned).length,
    [existingItems]
  );
  const hasChanges = useMemo(
    () =>
      rackItems.some(
        (ri) => ri.scanned || ri.isNew || ri.pendingAction !== "none"
      ),
    [rackItems]
  );
  const actionCount = useMemo(
    () =>
      rackItems.filter((ri) => ri.isNew || ri.pendingAction !== "none").length,
    [rackItems]
  );

  // === Reset on close ===
  useEffect(() => {
    if (!open) {
      setView("home");
      setSelectedLocation(null);
      setRackItems([]);
      setAdjustMode("scan");
      setScannerActive(false);
      setManualInput("");
      setLastScanned(null);
      setUnknownCode(null);
    }
  }, [open]);

  // === Core Handlers ===

  /** Load items for a given rack from the items prop */
  const loadRackItems = useCallback(
    (location: StorageLocation) => {
      const locItems = items.filter((i) =>
        location.itemIds.includes(i.id)
      );
      setRackItems(
        locItems.map((item) => ({
          itemId: item.id,
          jenisPestisida: item.jenisPestisida,
          kategori: item.kategori,
          satuan: item.satuan,
          stokAkhir: item.stokAkhir,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          scanned: false,
          isNew: false,
          pendingAction: "none",
        }))
      );
    },
    [items]
  );

  /** Select a rack location and navigate to rack detail */
  const handleSelectLocation = useCallback(
    (loc: StorageLocation) => {
      setSelectedLocation(loc);
      loadRackItems(loc);
      setScannerActive(false);
      setView("rack_detail");
      toast.success(`Rak: ${loc.nama}`);
    },
    [loadRackItems]
  );

  /** Handle QR scan for rack identification */
  const handleRackQrScan = useCallback(
    (decodedText: string) => {
      const type = identifyQrCodeType(decodedText);
      if (type !== "rack") {
        toast.error("Bukan kode rak", {
          description: "Format rak: xxx-xxx-xxx",
        });
        return;
      }
      const location = findStorageLocation(decodedText);
      if (location) {
        setScannerActive(false);
        handleSelectLocation(location);
      } else {
        toast.error("Rak tidak ditemukan di database");
      }
    },
    [handleSelectLocation]
  );

  /** Process a medicine code (from scan or manual input) */
  const processMedicineCode = useCallback(
    (code: string) => {
      // First try direct lookup
      let unit = findMedicineUnit(code);

      if (!unit) {
        // Check if it looks like a valid medicine format
        const type = identifyQrCodeType(code);
        if (type === "satuan_besar" || type === "satuan_kecil") {
          setUnknownCode(code);
          toast.error("Obat tidak ditemukan di database", {
            description: "Tambahkan sebagai obat baru?",
            duration: 4000,
          });
        } else if (type === "rack") {
          toast.error("Ini adalah kode rak, bukan obat");
        } else {
          const validation = validateQrFormat(code);
          toast.error("Format ID tidak dikenali", {
            description: validation.message,
          });
        }
        return;
      }

      setUnknownCode(null);

      // Check if item already in rack list
      const existingIdx = rackItems.findIndex(
        (ri) => ri.itemId === unit!.itemId
      );

      if (existingIdx >= 0) {
        // Item exists in rack — mark as scanned/verified
        if (rackItems[existingIdx].scanned) {
          toast.info("Item ini sudah diverifikasi", { duration: 2000 });
          return;
        }
        setRackItems((prev) => {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            scanned: true,
            unitInfo: unit,
          };
          return updated;
        });
        setLastScanned(unit.jenisPestisida);
        if (navigator.vibrate) navigator.vibrate(100);
        toast.success(`✓ ${unit.jenisPestisida}`, { duration: 2000 });
      } else {
        // New item not in rack — add as new entry
        const stockItem = getStockOpnameItemById(unit.itemId);
        const newRackItem: RackItem = {
          itemId: unit.itemId,
          jenisPestisida: unit.jenisPestisida,
          kategori: stockItem?.kategori || "Lainnya",
          satuan: stockItem?.satuan || "unit",
          stokAkhir: unit.jumlahPerUnit,
          batchNumber: unit.batchNumber,
          expiryDate: unit.expiryDate,
          scanned: true,
          isNew: true,
          pendingAction: "none",
          unitInfo: unit,
        };
        setRackItems((prev) => [...prev, newRackItem]);
        setLastScanned(unit.jenisPestisida);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        toast.success(`+ ${unit.jenisPestisida} (Baru di rak ini)`, {
          duration: 3000,
        });
      }
    },
    [rackItems]
  );

  /** Handle medicine QR scan */
  const handleMedicineScan = useCallback(
    (decodedText: string) => {
      processMedicineCode(decodedText);
    },
    [processMedicineCode]
  );

  /** Handle manual ID input submit */
  const handleManualSubmit = useCallback(() => {
    const code = manualInput.trim();
    if (!code) {
      toast.error("Masukkan ID obat");
      return;
    }
    processMedicineCode(code);
    setManualInput("");
  }, [manualInput, processMedicineCode]);

  /** Toggle pindahkan action on an item */
  const handlePindahkan = useCallback((itemId: string) => {
    setRackItems((prev) =>
      prev.map((ri) =>
        ri.itemId === itemId
          ? {
              ...ri,
              pendingAction:
                ri.pendingAction === "pindahkan" ? "none" : "pindahkan",
            }
          : ri
      )
    );
  }, []);

  /** Toggle hapus action on an item */
  const handleHapus = useCallback((itemId: string) => {
    setRackItems((prev) =>
      prev.map((ri) =>
        ri.itemId === itemId
          ? {
              ...ri,
              pendingAction:
                ri.pendingAction === "hapus" ? "none" : "hapus",
            }
          : ri
      )
    );
  }, []);

  /** Remove a new item from the scanned list */
  const handleRemoveNewItem = useCallback((itemId: string) => {
    setRackItems((prev) =>
      prev.filter((item) => !(item.itemId === itemId && item.isNew))
    );
  }, []);

  /** Build StockUpdateEntry array for submission */
  const buildEntries = useCallback((): StockUpdateEntry[] => {
    const entries: StockUpdateEntry[] = [];
    const currentMonth = new Date().getMonth() + 1;

    rackItems.forEach((ri) => {
      if (ri.isNew) {
        // New item added to rack
        entries.push({
          itemId: ri.itemId,
          jenisPestisida: ri.jenisPestisida,
          tipe: "masuk",
          jumlah: ri.stokAkhir,
          bulan: currentMonth,
          tahun,
          catatan: `Ditambahkan ke ${selectedLocation?.nama || "rak"} via scan QR`,
          updatedBy: "Petugas",
          updatedAt: new Date(),
        });
      } else if (ri.pendingAction === "hapus") {
        entries.push({
          itemId: ri.itemId,
          jenisPestisida: ri.jenisPestisida,
          tipe: "keluar",
          jumlah: ri.stokAkhir,
          bulan: currentMonth,
          tahun,
          catatan: `Dihapus dari ${selectedLocation?.nama || "rak"}`,
          updatedBy: "Petugas",
          updatedAt: new Date(),
        });
      } else if (ri.pendingAction === "pindahkan") {
        entries.push({
          itemId: ri.itemId,
          jenisPestisida: ri.jenisPestisida,
          tipe: "keluar",
          jumlah: ri.stokAkhir,
          bulan: currentMonth,
          tahun,
          catatan: `Dipindahkan dari ${selectedLocation?.nama || "rak"} ke rak lain`,
          updatedBy: "Petugas",
          updatedAt: new Date(),
        });
      }
      // Scanned/verified items with no action → no entry needed
    });

    return entries;
  }, [rackItems, tahun, selectedLocation]);

  /** Save and continue to next rack */
  const handleSaveAndContinue = useCallback(() => {
    const entries = buildEntries();
    if (entries.length > 0) onSubmit(entries);
    toast.success(
      actionCount > 0
        ? `${actionCount} perubahan disimpan. Lanjutkan scan rak berikutnya.`
        : "Verifikasi selesai. Lanjutkan scan rak berikutnya."
    );
    // Reset to home
    setRackItems([]);
    setSelectedLocation(null);
    setLastScanned(null);
    setUnknownCode(null);
    setScannerActive(false);
    setView("home");
  }, [buildEntries, onSubmit, actionCount]);

  /** Save and close dialog */
  const handleSaveAndFinish = useCallback(() => {
    const entries = buildEntries();
    if (entries.length > 0) onSubmit(entries);
    toast.success(
      actionCount > 0
        ? `${actionCount} perubahan disimpan. Selesai.`
        : "Verifikasi selesai."
    );
    onOpenChange(false);
  }, [buildEntries, onSubmit, actionCount, onOpenChange]);

  /** Cancel and close dialog */
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      toast.info("Perubahan dibatalkan");
    }
    onOpenChange(false);
  }, [hasChanges, onOpenChange]);

  // ============================================================
  // Render: Home View
  // ============================================================
  const renderHome = () => (
    <div className="space-y-4">
      {/* QR Scan Box */}
      {scannerActive ? (
        <div className="space-y-3">
          <div className="text-center mb-1">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              Pindai Kode QR Rak Gudang
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Format: xxx-xxx-xxx
            </p>
          </div>
          <QrScannerCamera
            onScanSuccess={handleRackQrScan}
            active={scannerActive}
            config={{
              qrbox: { width: 220, height: 220 },
              facingMode: "environment",
            }}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setScannerActive(false)}
          >
            <Icon icon="heroicons:x-mark" className="w-4 h-4 mr-2" />
            Tutup Kamera
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setScannerActive(true)}
          className={cn(
            "w-full flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed",
            "border-amber-300 bg-amber-50/50 hover:bg-amber-50",
            "dark:bg-amber-950/20 dark:hover:bg-amber-950/30 dark:border-amber-700",
            "transition-all active:scale-[0.98]"
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <Icon
              icon="heroicons:qr-code"
              className="w-8 h-8 text-amber-600"
            />
          </div>
          <div className="text-center">
            <p className="font-semibold text-amber-700 dark:text-amber-400">
              Pindai Kode QR Rak Gudang
            </p>
            <p className="text-xs text-amber-500 mt-1">
              Arahkan kamera ke QR code rak gudang
            </p>
          </div>
        </button>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">
          atau pilih lokasi
        </span>
        <Separator className="flex-1" />
      </div>

      {/* Location List */}
      <div className="space-y-2">
        {mockStorageLocations.map((loc) => {
          const itemCount = items.filter((i) =>
            loc.itemIds.includes(i.id)
          ).length;
          return (
            <button
              key={loc.id}
              onClick={() => handleSelectLocation(loc)}
              className="w-full text-left p-3 rounded-xl border transition-all hover:bg-muted/50 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    itemCount > 0
                      ? "bg-amber-100 dark:bg-amber-900/50"
                      : "bg-muted"
                  )}
                >
                  <Icon
                    icon="heroicons:archive-box"
                    className={cn(
                      "w-5 h-5",
                      itemCount > 0
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{loc.nama}</p>
                  <p className="text-xs text-muted-foreground">
                    {loc.gedung} &bull;{" "}
                    {itemCount > 0
                      ? `${itemCount} jenis obat`
                      : "Rak kosong"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    className="text-[10px] font-mono bg-transparent border-border text-muted-foreground"
                  >
                    {loc.kode}
                  </Badge>
                  <Icon
                    icon="heroicons:chevron-right"
                    className="w-4 h-4 text-muted-foreground"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ============================================================
  // Render: Rack Detail View
  // ============================================================
  const renderRackDetail = () => {
    const isEmpty = rackItems.length === 0;

    return (
      <div className="space-y-4">
        {/* Rack Info Header */}
        <div className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
            <Icon
              icon="heroicons:archive-box"
              className="w-5 h-5 text-amber-600"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {selectedLocation?.nama}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedLocation?.gedung} &bull; {selectedLocation?.kode}{" "}
              &bull; Kapasitas {selectedLocation?.kapasitas}
            </p>
          </div>
          <Badge
            className={cn(
              "text-xs font-mono flex-shrink-0 bg-transparent",
              isEmpty
                ? "border-muted-foreground/30 text-muted-foreground"
                : "border-amber-300 text-amber-700 dark:text-amber-400"
            )}
          >
            {rackItems.length} obat
          </Badge>
        </div>

        {/* Items List or Empty State */}
        {isEmpty ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center">
              <Icon
                icon="heroicons:inbox"
                className="w-8 h-8 text-muted-foreground/40"
              />
            </div>
            <div>
              <p className="font-medium text-muted-foreground">
                Rak ini kosong
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Belum ada obat terdaftar di rak ini
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-muted-foreground">
              <Icon icon="heroicons:list-bullet" className="w-3.5 h-3.5" />
              Daftar Obat
            </h4>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-1">
                {rackItems.map((ri) => (
                  <div
                    key={ri.itemId}
                    className="p-3 rounded-xl border hover:bg-muted/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                          getCategoryColor(ri.kategori)
                        )}
                      >
                        <Icon
                          icon="heroicons:beaker"
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {ri.jenisPestisida}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[10px] text-muted-foreground">
                          <span className="inline-flex items-center gap-0.5">
                            <Icon
                              icon="heroicons:tag"
                              className="w-2.5 h-2.5"
                            />
                            {ri.kategori}
                          </span>
                          <span>&bull;</span>
                          <span>
                            {formatNumber(ri.stokAkhir)} {ri.satuan}
                          </span>
                          {ri.batchNumber && (
                            <>
                              <span>&bull;</span>
                              <span className="font-mono">
                                {ri.batchNumber}
                              </span>
                            </>
                          )}
                          {ri.expiryDate && (
                            <>
                              <span>&bull;</span>
                              <span>Exp: {formatExpiry(ri.expiryDate)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <Button
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => {
              setView("adjust_stock");
              setUnknownCode(null);
              setLastScanned(null);
            }}
          >
            <Icon
              icon={
                isEmpty
                  ? "heroicons:plus-circle"
                  : "heroicons:adjustments-horizontal"
              }
              className="w-4 h-4 mr-2"
            />
            {isEmpty ? "Tambah Stok Baru" : "Sesuaikan Stok"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setView("home");
              setSelectedLocation(null);
              setRackItems([]);
            }}
          >
            <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    );
  };

  // ============================================================
  // Render: Adjust Stock View
  // ============================================================
  const renderAdjustStock = () => (
    <div className="space-y-4">
      {/* Compact Rack Header */}
      <div className="flex items-center gap-3 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
          <Icon
            icon="heroicons:archive-box"
            className="w-4 h-4 text-amber-600"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">
            {selectedLocation?.nama}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {selectedLocation?.kode} &bull; {selectedLocation?.gedung}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 flex-shrink-0"
          onClick={() => {
            setView("rack_detail");
            setScannerActive(false);
            setLastScanned(null);
          }}
        >
          <Icon icon="heroicons:arrow-left" className="w-3 h-3 mr-1" />
          Kembali
        </Button>
      </div>

      {/* Verification Progress (only for existing items) */}
      {existingItems.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Verifikasi Obat</span>
            <span className="font-medium">
              {scannedCount}/{existingItems.length} terpindai
            </span>
          </div>
          <Progress
            value={Math.round(
              (scannedCount / existingItems.length) * 100
            )}
            className="h-2"
          />
        </div>
      )}

      {/* Mode Toggle: Scan QR / Input Manual */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setAdjustMode("scan")}
          className={cn(
            "flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all text-xs font-medium",
            adjustMode === "scan"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          <Icon icon="heroicons:qr-code" className="w-4 h-4" />
          Scan QR
        </button>
        <button
          onClick={() => {
            setAdjustMode("manual");
            setScannerActive(false);
          }}
          className={cn(
            "flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all text-xs font-medium",
            adjustMode === "manual"
              ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
              : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          Input Manual
        </button>
      </div>

      {/* Scan Mode */}
      {adjustMode === "scan" && (
        <>
          {scannerActive ? (
            <div className="space-y-2">
              <QrScannerCamera
                onScanSuccess={handleMedicineScan}
                active={scannerActive}
                config={{
                  qrbox: { width: 200, height: 200 },
                  facingMode: "environment",
                }}
              />
              {lastScanned && (
                <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-xs text-emerald-700 dark:text-emerald-400">
                  <Icon
                    icon="heroicons:check-circle-solid"
                    className="w-4 h-4 flex-shrink-0"
                  />
                  <span className="truncate">Terakhir: {lastScanned}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setScannerActive(false)}
              >
                <Icon
                  icon="heroicons:pause"
                  className="w-3.5 h-3.5 mr-1.5"
                />
                Jeda Scan
              </Button>
            </div>
          ) : (
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setScannerActive(true)}
            >
              <Icon
                icon="heroicons:qr-code"
                className="w-4 h-4 mr-2"
              />
              {lastScanned ? "Lanjutkan Scan Obat" : "Mulai Scan Obat"}
            </Button>
          )}
        </>
      )}

      {/* Manual Input Mode */}
      {adjustMode === "manual" && (
        <div className="space-y-2.5 p-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20">
          <Label className="text-xs font-medium text-blue-700 dark:text-blue-400">
            Masukkan ID Obat
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Contoh: MED-001-INS-KB-01-2026"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
              className="text-sm flex-1 font-mono"
            />
            <Button
              size="sm"
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className="px-3"
            >
              <Icon
                icon="heroicons:magnifying-glass"
                className="w-4 h-4"
              />
            </Button>
          </div>
          <div className="text-[10px] text-blue-500 dark:text-blue-400/70 space-y-0.5">
            <p>
              <span className="font-semibold">Kardus:</span>{" "}
              xxx-xxx-xxx-xx-xx-xxxx
            </p>
            <p>
              <span className="font-semibold">Satuan:</span>{" "}
              xxx-xxx-xxx-xx-xx-xxxx-xxxx
            </p>
          </div>
        </div>
      )}

      {/* Unknown QR Alert */}
      {unknownCode && (
        <div className="p-3 rounded-xl border-2 border-dashed border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-start gap-2.5">
            <Icon
              icon="heroicons:exclamation-triangle"
              className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                Obat Tidak Ditemukan
              </p>
              <p className="text-[10px] text-rose-500 mt-0.5 break-all font-mono">
                ID: {unknownCode}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-7 text-xs text-rose-600 border-rose-300 hover:bg-rose-50 dark:border-rose-700 dark:hover:bg-rose-950/30"
                onClick={() => {
                  toast.info(
                    "Fitur tambah obat baru akan segera hadir"
                  );
                  setUnknownCode(null);
                }}
              >
                <Icon icon="heroicons:plus" className="w-3 h-3 mr-1" />
                Tambah Obat Baru
              </Button>
            </div>
            <button
              onClick={() => setUnknownCode(null)}
              className="flex-shrink-0 p-0.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            >
              <Icon
                icon="heroicons:x-mark"
                className="w-4 h-4 text-rose-400"
              />
            </button>
          </div>
        </div>
      )}

      {/* Existing Items in Rack */}
      {existingItems.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <Icon icon="heroicons:list-bullet" className="w-3.5 h-3.5" />
            Obat di Rak ({scannedCount}/{existingItems.length} terpindai)
          </h4>
          <ScrollArea
            className={cn(scannerActive ? "h-[120px]" : "h-[180px]")}
          >
            <div className="space-y-1.5 pr-1">
              {existingItems.map((ri) => (
                <div
                  key={ri.itemId}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-lg border transition-all",
                    // Scanned & no action → green
                    ri.scanned &&
                      ri.pendingAction === "none" &&
                      "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
                    // Pending hapus → red, dimmed
                    ri.pendingAction === "hapus" &&
                      "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 opacity-60",
                    // Pending pindahkan → blue
                    ri.pendingAction === "pindahkan" &&
                      "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
                    // Default
                    !ri.scanned &&
                      ri.pendingAction === "none" &&
                      "bg-background border-border"
                  )}
                >
                  {/* Status indicator */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                      ri.scanned && ri.pendingAction === "none"
                        ? "bg-emerald-100 dark:bg-emerald-900/50"
                        : ri.pendingAction === "hapus"
                          ? "bg-rose-100 dark:bg-rose-900/50"
                          : ri.pendingAction === "pindahkan"
                            ? "bg-blue-100 dark:bg-blue-900/50"
                            : "bg-muted"
                    )}
                  >
                    <Icon
                      icon={
                        ri.scanned && ri.pendingAction === "none"
                          ? "heroicons:check-circle-solid"
                          : ri.pendingAction === "hapus"
                            ? "heroicons:trash-solid"
                            : ri.pendingAction === "pindahkan"
                              ? "heroicons:arrows-right-left"
                              : "heroicons:minus-circle"
                      }
                      className={cn(
                        "w-3.5 h-3.5",
                        ri.scanned && ri.pendingAction === "none"
                          ? "text-emerald-600"
                          : ri.pendingAction === "hapus"
                            ? "text-rose-600"
                            : ri.pendingAction === "pindahkan"
                              ? "text-blue-600"
                              : "text-muted-foreground"
                      )}
                    />
                  </div>

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-xs font-medium truncate",
                        ri.pendingAction === "hapus" && "line-through"
                      )}
                    >
                      {ri.jenisPestisida}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                      <span>
                        {formatNumber(ri.stokAkhir)} {ri.satuan}
                      </span>
                      {ri.pendingAction === "pindahkan" && (
                        <Badge className="text-[9px] bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 px-1 py-0 leading-tight">
                          Pindah
                        </Badge>
                      )}
                      {ri.pendingAction === "hapus" && (
                        <Badge className="text-[9px] bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 px-1 py-0 leading-tight">
                          Hapus
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action buttons (icons) */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => handlePindahkan(ri.itemId)}
                      title="Pindahkan ke rak lain"
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                        ri.pendingAction === "pindahkan"
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon
                        icon="heroicons:arrows-right-left"
                        className={cn(
                          "w-3.5 h-3.5",
                          ri.pendingAction === "pindahkan"
                            ? "text-blue-600"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                    <button
                      onClick={() => handleHapus(ri.itemId)}
                      title="Hapus dari rak"
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                        ri.pendingAction === "hapus"
                          ? "bg-rose-200 dark:bg-rose-800"
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon
                        icon="heroicons:trash"
                        className={cn(
                          "w-3.5 h-3.5",
                          ri.pendingAction === "hapus"
                            ? "text-rose-600"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Empty rack scan prompt */}
      {existingItems.length === 0 && newItems.length === 0 && !scannerActive && (
        <div className="text-center py-4 text-muted-foreground">
          <Icon
            icon="heroicons:qr-code"
            className="w-8 h-8 mx-auto mb-2 opacity-30"
          />
          <p className="text-xs">
            Scan QR obat untuk mulai menambahkan ke rak ini
          </p>
        </div>
      )}

      {/* New Items Found */}
      {newItems.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
            <Icon
              icon="heroicons:plus-circle"
              className="w-3.5 h-3.5"
            />
            Item Baru Ditemukan ({newItems.length})
          </h4>
          <div className="space-y-1.5">
            {newItems.map((ri) => (
              <div
                key={`new-${ri.itemId}`}
                className="flex items-center gap-2 p-2.5 rounded-lg border-2 border-dashed border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20"
              >
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                  <Icon
                    icon="heroicons:plus"
                    className="w-3.5 h-3.5 text-purple-600"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {ri.jenisPestisida}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                    <span>{ri.kategori}</span>
                    <span>&bull;</span>
                    <span>
                      {formatNumber(ri.stokAkhir)} {ri.satuan}
                    </span>
                    {ri.unitInfo && (
                      <>
                        <span>&bull;</span>
                        <span className="font-mono">
                          {ri.unitInfo.tipe === "satuan_besar"
                            ? "Kardus"
                            : "Satuan"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveNewItem(ri.itemId)}
                  title="Hapus item baru"
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors flex-shrink-0"
                >
                  <Icon
                    icon="heroicons:x-mark"
                    className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save / Action Buttons */}
      <Separator />
      <div className="space-y-2">
        <Button
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          onClick={handleSaveAndContinue}
        >
          <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2" />
          Simpan & Lanjutkan
        </Button>
        <Button
          className="w-full"
          onClick={handleSaveAndFinish}
        >
          <Icon
            icon="heroicons:check-circle"
            className="w-4 h-4 mr-2"
          />
          Simpan & Selesai
        </Button>
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/5"
          onClick={handleCancel}
        >
          <Icon icon="heroicons:x-mark" className="w-4 h-4 mr-2" />
          Batalkan
        </Button>
      </div>
    </div>
  );

  // ============================================================
  // Content Router
  // ============================================================
  const renderContent = () => {
    switch (view) {
      case "home":
        return renderHome();
      case "rack_detail":
        return renderRackDetail();
      case "adjust_stock":
        return renderAdjustStock();
    }
  };

  // ============================================================
  // Title & Description
  // ============================================================
  const title = (
    <span className="flex items-center gap-2">
      <Icon
        icon="heroicons:pencil-square"
        className="w-5 h-5 text-amber-600"
      />
      Update Stok
    </span>
  );

  const descriptionText =
    view === "home"
      ? "Pilih atau scan rak gudang untuk mulai"
      : view === "rack_detail"
        ? `${selectedLocation?.nama || "Rak"} — ${rackItems.length} jenis obat`
        : `Sesuaikan stok di ${selectedLocation?.nama || "rak"}`;

  // Step indicator dots
  const stepIndicator = (
    <div className="flex items-center justify-center gap-1 py-1">
      {(["home", "rack_detail", "adjust_stock"] as UpdateView[]).map(
        (s, i) => (
          <React.Fragment key={s}>
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                view === s
                  ? "w-6 bg-amber-500"
                  : "w-2 bg-muted-foreground/30"
              )}
            />
            {i < 2 && (
              <div className="w-3 h-px bg-muted-foreground/20" />
            )}
          </React.Fragment>
        )
      )}
    </div>
  );

  // ============================================================
  // Render: Mobile (Drawer) or Desktop (Dialog)
  // ============================================================
  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="pb-1">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription className="text-xs truncate">
              {descriptionText}
            </DrawerDescription>
            {stepIndicator}
          </DrawerHeader>
          <ScrollArea className="px-4 max-h-[calc(92vh-100px)]">
            {renderContent()}
            <div className="h-4" />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-xs truncate">
            {descriptionText}
          </DialogDescription>
          {stepIndicator}
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-1">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default StockUpdateDialog;

// # END OF Stock Update Dialog Component
