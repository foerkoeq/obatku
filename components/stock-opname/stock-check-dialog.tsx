// # START OF Stock Check Dialog Component (v2) - QR-based "Cek Stok"
// Purpose: QR code-based stock check with two modes (manual count + scan)
// Flow: Scan location QR → see items list → manual count OR scan individual items
// Mobile-first: Uses Drawer on mobile, Dialog on desktop

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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

// QR Scanner
import QrScannerCamera from "@/components/qr-scanner/qr-scanner-camera";

// Types & Data
import {
  StockOpnameItem,
  StockCheckEntry,
  StockCheckSessionItem,
  StorageLocation,
} from "@/lib/types/stock-opname";
import {
  formatNumber,
  getStorageLocationByQr,
  getMedicineUnitByQr,
  mockStorageLocations,
} from "@/lib/data/stock-opname-demo";

export interface StockCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: StockOpnameItem[];
  onSubmit: (entries: StockCheckEntry[]) => void;
}

type CheckStep = 'scan_location' | 'check_items';
type CheckMode = 'manual' | 'scan';

const StockCheckDialog: React.FC<StockCheckDialogProps> = ({
  open,
  onOpenChange,
  items,
  onSubmit,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // === State ===
  const [step, setStep] = useState<CheckStep>('scan_location');
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null);
  const [checkMode, setCheckMode] = useState<CheckMode>('manual');
  const [sessionItems, setSessionItems] = useState<StockCheckSessionItem[]>([]);
  const [scannerActive, setScannerActive] = useState(false);
  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);
  const [physicalCount, setPhysicalCount] = useState("");
  const [catatan, setCatatan] = useState("");
  const [lastScannedItem, setLastScannedItem] = useState<string | null>(null);

  // Progress
  const checkedCount = useMemo(
    () => sessionItems.filter((i) => i.stokFisik !== undefined).length,
    [sessionItems]
  );
  const progress = sessionItems.length > 0
    ? Math.round((checkedCount / sessionItems.length) * 100)
    : 0;

  // === Reset on close ===
  useEffect(() => {
    if (!open) {
      setStep('scan_location');
      setSelectedLocation(null);
      setCheckMode('manual');
      setSessionItems([]);
      setScannerActive(false);
      setSelectedItemIdx(null);
      setPhysicalCount("");
      setCatatan("");
      setLastScannedItem(null);
    }
  }, [open]);

  // === Handlers ===

  const initLocationSession = useCallback((location: StorageLocation) => {
    setSelectedLocation(location);
    const locItems = items.filter((i) => location.itemIds.includes(i.id));
    setSessionItems(
      locItems.map((item) => ({
        itemId: item.id,
        jenisPestisida: item.jenisPestisida,
        satuan: item.satuan,
        stokSistem: item.stokAkhir,
        scanned: false,
        scanCount: 0,
        keterangan: '',
      }))
    );
    setStep('check_items');
  }, [items]);

  const handleLocationScan = useCallback((decodedText: string) => {
    const location = getStorageLocationByQr(decodedText);
    if (location) {
      setScannerActive(false);
      initLocationSession(location);
      toast.success(`Lokasi: ${location.nama}`);
    } else {
      toast.error("QR code lokasi tidak dikenali");
    }
  }, [initLocationSession]);

  const handleMedicineScan = useCallback((decodedText: string) => {
    const unit = getMedicineUnitByQr(decodedText);
    if (!unit) {
      toast.error("QR code obat tidak dikenali");
      return;
    }
    const idx = sessionItems.findIndex((si) => si.itemId === unit.itemId);
    if (idx < 0) {
      toast.error("Obat ini tidak ada di lokasi ini");
      return;
    }
    setSessionItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[idx] };
      item.scanned = true;
      item.scanCount += unit.jumlahPerUnit;
      item.stokFisik = item.scanCount;
      item.selisih = item.scanCount - item.stokSistem;
      item.batchNumber = unit.batchNumber;
      item.expiryDate = unit.expiryDate;
      updated[idx] = item;
      return updated;
    });
    setLastScannedItem(unit.jenisPestisida);
    if (navigator.vibrate) navigator.vibrate(100);
    toast.success(
      `${unit.jenisPestisida} (${unit.tipe === 'satuan_besar' ? 'Kardus' : 'Satuan'}: +${unit.jumlahPerUnit})`,
      { duration: 2000 }
    );
  }, [sessionItems]);

  const handleManualCountSave = useCallback(() => {
    if (selectedItemIdx === null || physicalCount === "") return;
    setSessionItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[selectedItemIdx] };
      item.stokFisik = Number(physicalCount);
      item.selisih = Number(physicalCount) - item.stokSistem;
      item.keterangan = catatan;
      updated[selectedItemIdx] = item;
      return updated;
    });
    toast.success("Jumlah fisik disimpan");
    setSelectedItemIdx(null);
    setPhysicalCount("");
    setCatatan("");
  }, [selectedItemIdx, physicalCount, catatan]);

  const handleSubmitAll = useCallback(() => {
    const entries: StockCheckEntry[] = sessionItems
      .filter((si) => si.stokFisik !== undefined)
      .map((si) => ({
        itemId: si.itemId,
        jenisPestisida: si.jenisPestisida,
        stokSistem: si.stokSistem,
        stokFisik: si.stokFisik!,
        selisih: si.selisih || 0,
        catatan: si.keterangan || (si.selisih === 0 ? 'Stok sesuai' : `Selisih ${si.selisih}`),
        checkedBy: 'Petugas',
        checkedAt: new Date(),
      }));
    if (entries.length === 0) {
      toast.error("Belum ada item yang dicek");
      return;
    }
    const unchecked = sessionItems.filter((si) => si.stokFisik === undefined);
    if (unchecked.length > 0) {
      toast.info(`${unchecked.length} item belum dicek di lokasi ini`);
    }
    onSubmit(entries);
    onOpenChange(false);
    toast.success(`${entries.length} item berhasil disimpan`);
  }, [sessionItems, onSubmit, onOpenChange]);

  // === Render: Scan Location Step ===
  const renderScanLocationStep = () => (
    <div className="space-y-4">
      {scannerActive ? (
        <div className="space-y-3">
          <QrScannerCamera
            onScanSuccess={handleLocationScan}
            active={scannerActive}
            config={{ qrbox: { width: 220, height: 220 }, facingMode: "environment" }}
          />
          <Button variant="outline" className="w-full" onClick={() => setScannerActive(false)}>
            <Icon icon="heroicons:x-mark" className="w-4 h-4 mr-2" />
            Tutup Kamera
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setScannerActive(true)}
            className={cn(
              "w-full flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed",
              "border-blue-300 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 dark:border-blue-700",
              "transition-all active:scale-[0.98]"
            )}
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <Icon icon="heroicons:qr-code" className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-blue-700 dark:text-blue-400">Scan QR Lokasi</p>
              <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                Arahkan kamera ke QR code rak gudang
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">atau pilih manual</span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-2">
            {mockStorageLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => initLocationSession(loc)}
                className="w-full text-left p-3 rounded-xl border transition-all hover:bg-muted/50 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon icon="heroicons:archive-box" className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{loc.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      {loc.gedung} &bull; {loc.itemIds.length} jenis obat
                    </p>
                  </div>
                  <Icon icon="heroicons:chevron-right" className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // === Render: Check Items Step ===
  const renderCheckItemsStep = () => (
    <div className="space-y-4">
      {/* Location header */}
      {selectedLocation && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon icon="heroicons:archive-box" className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{selectedLocation.nama}</p>
            <p className="text-xs text-muted-foreground">{selectedLocation.gedung}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7"
            onClick={() => { setStep('scan_location'); setSelectedLocation(null); setSessionItems([]); }}
          >
            Ganti
          </Button>
        </div>
      )}

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{checkedCount}/{sessionItems.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => { setCheckMode('manual'); setScannerActive(false); }}
          className={cn(
            "flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all text-xs font-medium",
            checkMode === 'manual'
              ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
              : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          Hitung Manual
        </button>
        <button
          onClick={() => { setCheckMode('scan'); setScannerActive(true); }}
          className={cn(
            "flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all text-xs font-medium",
            checkMode === 'scan'
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          <Icon icon="heroicons:qr-code" className="w-4 h-4" />
          Scan Obat
        </button>
      </div>

      {/* Scan mode camera */}
      {checkMode === 'scan' && scannerActive && (
        <div className="space-y-2">
          <QrScannerCamera
            onScanSuccess={handleMedicineScan}
            active={scannerActive}
            config={{ qrbox: { width: 200, height: 200 }, facingMode: "environment" }}
          />
          {lastScannedItem && (
            <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-xs text-emerald-700 dark:text-emerald-400">
              <Icon icon="heroicons:check-circle-solid" className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Terakhir: {lastScannedItem}</span>
            </div>
          )}
          <Button variant="outline" size="sm" className="w-full" onClick={() => setScannerActive(false)}>
            <Icon icon="heroicons:pause" className="w-3.5 h-3.5 mr-1.5" />
            Jeda Scan
          </Button>
        </div>
      )}
      {checkMode === 'scan' && !scannerActive && (
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setScannerActive(true)}>
          <Icon icon="heroicons:qr-code" className="w-4 h-4 mr-2" />
          Lanjutkan Scan
        </Button>
      )}

      {/* Manual mode: input form */}
      {checkMode === 'manual' && selectedItemIdx !== null && (
        <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-3 space-y-3 bg-blue-50/30 dark:bg-blue-950/20">
          <div>
            <p className="text-sm font-semibold">{sessionItems[selectedItemIdx].jenisPestisida}</p>
            <p className="text-xs text-muted-foreground">
              Stok sistem: {formatNumber(sessionItems[selectedItemIdx].stokSistem)} {sessionItems[selectedItemIdx].satuan}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-100/50 dark:bg-blue-900/30 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-blue-600 font-medium">Sistem</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {formatNumber(sessionItems[selectedItemIdx].stokSistem)}
              </p>
            </div>
            <div>
              <Label className="text-xs">Jumlah Fisik</Label>
              <Input
                type="number"
                min={0}
                value={physicalCount}
                onChange={(e) => setPhysicalCount(e.target.value)}
                placeholder="0"
                className="mt-1"
                autoFocus
              />
            </div>
          </div>
          {physicalCount !== "" && (
            <div className={cn(
              "rounded-lg p-2 text-center text-sm font-medium",
              Number(physicalCount) - sessionItems[selectedItemIdx].stokSistem === 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
            )}>
              {Number(physicalCount) - sessionItems[selectedItemIdx].stokSistem === 0
                ? "Stok Sesuai"
                : `Selisih: ${(Number(physicalCount) - sessionItems[selectedItemIdx].stokSistem) > 0 ? '+' : ''}${Number(physicalCount) - sessionItems[selectedItemIdx].stokSistem}`}
            </div>
          )}
          <Textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Catatan (opsional)"
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1"
              onClick={() => { setSelectedItemIdx(null); setPhysicalCount(""); setCatatan(""); }}
            >
              Batal
            </Button>
            <Button size="sm" className="flex-1" disabled={physicalCount === ""} onClick={handleManualCountSave}>
              <Icon icon="heroicons:check" className="w-3.5 h-3.5 mr-1" />
              Simpan
            </Button>
          </div>
        </div>
      )}

      {/* Item list */}
      <div>
        <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
          <Icon icon="heroicons:list-bullet" className="w-3.5 h-3.5" />
          Daftar Obat ({checkedCount}/{sessionItems.length})
        </h4>
        <ScrollArea className={cn(
          checkMode === 'scan' && scannerActive ? "h-[140px]" : "h-[220px]"
        )}>
          <div className="space-y-1.5 pr-1">
            {sessionItems.map((si, idx) => {
              const isChecked = si.stokFisik !== undefined;
              const hasDiscrepancy = isChecked && si.selisih !== 0;
              const isSelected = selectedItemIdx === idx;
              return (
                <button
                  key={si.itemId}
                  onClick={() => {
                    if (checkMode === 'manual') {
                      setSelectedItemIdx(idx);
                      setPhysicalCount(si.stokFisik !== undefined ? String(si.stokFisik) : "");
                      setCatatan(si.keterangan);
                    }
                  }}
                  className={cn(
                    "w-full text-left p-2.5 rounded-lg border transition-all",
                    isSelected && "ring-2 ring-blue-400 border-blue-300",
                    isChecked && !hasDiscrepancy && "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
                    hasDiscrepancy && "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800",
                    !isChecked && !isSelected && "hover:bg-muted/50",
                    checkMode === 'scan' && "pointer-events-none opacity-80"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs",
                      isChecked && !hasDiscrepancy && "bg-emerald-100 dark:bg-emerald-900/50",
                      hasDiscrepancy && "bg-rose-100 dark:bg-rose-900/50",
                      !isChecked && "bg-muted"
                    )}>
                      <Icon
                        icon={isChecked && !hasDiscrepancy ? "heroicons:check-circle-solid" : hasDiscrepancy ? "heroicons:exclamation-triangle-solid" : "heroicons:minus-circle"}
                        className={cn("w-3.5 h-3.5",
                          isChecked && !hasDiscrepancy && "text-emerald-600",
                          hasDiscrepancy && "text-rose-600",
                          !isChecked && "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{si.jenisPestisida}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          Sistem: {formatNumber(si.stokSistem)}
                        </span>
                        {isChecked && (
                          <span className={cn("text-[10px] font-semibold",
                            hasDiscrepancy ? "text-rose-600" : "text-emerald-600"
                          )}>
                            Fisik: {formatNumber(si.stokFisik!)}
                            {si.selisih !== 0 && ` (${si.selisih! > 0 ? '+' : ''}${si.selisih})`}
                          </span>
                        )}
                      </div>
                    </div>
                    {checkMode === 'manual' && !isChecked && (
                      <Icon icon="heroicons:chevron-right" className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  const renderContent = () => step === 'scan_location' ? renderScanLocationStep() : renderCheckItemsStep();

  const title = (
    <span className="flex items-center gap-2">
      <Icon icon="heroicons:clipboard-document-check" className="w-5 h-5 text-blue-600" />
      Cek Stok
    </span>
  );
  const description = step === 'scan_location'
    ? "Scan QR code lokasi penyimpanan untuk mulai"
    : `${selectedLocation?.nama || ''} — ${checkMode === 'manual' ? 'Hitung Manual' : 'Scan Obat'}`;

  const footer = step === 'check_items' ? (
    <div className="flex gap-2 w-full">
      <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
        Batal
      </Button>
      <Button className="flex-1" disabled={checkedCount === 0} onClick={handleSubmitAll}>
        <Icon icon="heroicons:check-circle" className="w-4 h-4 mr-1.5" />
        Simpan ({checkedCount})
      </Button>
    </div>
  ) : null;

  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription className="text-xs truncate">{description}</DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="px-4 max-h-[calc(92vh-140px)]">
            {renderContent()}
          </ScrollArea>
          {footer && <DrawerFooter className="pt-2">{footer}</DrawerFooter>}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-xs truncate">{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-150px)] pr-1">
          {renderContent()}
        </ScrollArea>
        {footer && <DialogFooter className="pt-2">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

export default StockCheckDialog;

// # END OF Stock Check Dialog Component
