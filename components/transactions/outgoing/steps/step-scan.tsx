// # START OF Step Scan - QR scan & manual input for medicine verification
// Purpose: Scan barcodes or manually input medicine IDs, validate against request
// Features: Camera QR scan, manual input, error handling, progress tracking

"use client";

import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  OutgoingItem,
  DistribusiItem,
  ScanResult,
  OutgoingWizardState,
} from "@/lib/types/outgoing";
import { ApprovedMedicineDetail } from "@/lib/types/approval";
import {
  getStockByBarcode,
  getStockBatchesByMedicine,
  formatTanggalOutgoing,
  daysUntilExpiry,
} from "@/lib/data/outgoing-mock";

interface StepScanProps {
  item: OutgoingItem;
  wizardState: OutgoingWizardState;
  onUpdateState: (updates: Partial<OutgoingWizardState>) => void;
}

const StepScan: React.FC<StepScanProps> = ({ item, wizardState, onUpdateState }) => {
  const [manualInput, setManualInput] = useState("");
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const obatList = item.obatDisetujui ?? [];
  const { scannedItems } = wizardState;

  // Calculate progress per medicine
  const progressMap = obatList.reduce<Record<string, { target: number; scanned: number; medicine: ApprovedMedicineDetail }>>((acc, med) => {
    const key = `${med.medicineId}-${med.poktanId}`;
    if (!acc[key]) {
      acc[key] = { target: med.jumlahBesar, scanned: 0, medicine: med };
    }
    acc[key].scanned = scannedItems.filter(
      (s) => s.medicineId === med.medicineId && s.poktanId === med.poktanId
    ).length;
    return acc;
  }, {});

  const totalTarget = obatList.reduce((sum, m) => sum + m.jumlahBesar, 0);
  const totalScanned = scannedItems.length;
  const isAllScanned = Object.values(progressMap).every((p) => p.scanned >= p.target);

  // ─── Process a barcode ───
  const processBarcode = useCallback((barcode: string) => {
    const trimmed = barcode.trim();
    if (!trimmed) return;

    // Check format
    if (trimmed.length < 5) {
      const result: ScanResult = {
        success: false,
        barcode: trimmed,
        errorType: 'invalid_format',
        errorMessage: 'Format barcode tidak valid. Minimal 5 karakter.',
      };
      setLastScanResult(result);
      toast.error('Format barcode tidak valid');
      return;
    }

    // Check already scanned
    if (scannedItems.some((s) => s.barcode === trimmed)) {
      const result: ScanResult = {
        success: false,
        barcode: trimmed,
        errorType: 'already_scanned',
        errorMessage: 'Barcode ini sudah di-scan sebelumnya.',
      };
      setLastScanResult(result);
      toast.error('Barcode sudah di-scan');
      return;
    }

    // Lookup stock
    const stockItem = getStockByBarcode(trimmed);
    if (!stockItem) {
      const result: ScanResult = {
        success: false,
        barcode: trimmed,
        errorType: 'not_found',
        errorMessage: 'Barcode tidak ditemukan di database gudang. Pastikan barcode benar.',
      };
      setLastScanResult(result);
      toast.error('Barcode tidak ditemukan');
      return;
    }

    // Check if this medicine is in the request
    const matchingMed = obatList.find((m) => m.medicineId === stockItem.medicineId);
    if (!matchingMed) {
      const result: ScanResult = {
        success: false,
        barcode: trimmed,
        stockItem,
        errorType: 'wrong_medicine',
        errorMessage: `"${stockItem.nama}" bukan obat yang diminta dalam permintaan ini.`,
      };
      setLastScanResult(result);
      toast.error('Obat tidak sesuai permintaan');
      return;
    }

    // Check if expired
    if (stockItem.expiryDate < new Date()) {
      const result: ScanResult = {
        success: false,
        barcode: trimmed,
        stockItem,
        errorType: 'expired',
        errorMessage: `Obat ini sudah kedaluwarsa (${formatTanggalOutgoing(stockItem.expiryDate)}).`,
      };
      setLastScanResult(result);
      toast.error('Obat sudah kedaluwarsa');
      return;
    }

    // Check if we need more of this medicine (find matching poktan)
    const needsMore = obatList.some((med) => {
      const key = `${med.medicineId}-${med.poktanId}`;
      const progress = progressMap[key];
      return med.medicineId === stockItem.medicineId && progress && progress.scanned < progress.target;
    });

    if (!needsMore) {
      const result: ScanResult = {
        success: false,
        barcode: trimmed,
        stockItem,
        errorType: 'insufficient',
        errorMessage: `Jumlah "${stockItem.nama}" sudah mencukupi permintaan.`,
      };
      setLastScanResult(result);
      toast.warning('Jumlah sudah cukup');
      return;
    }

    // Find the poktan that still needs this medicine
    const targetMed = obatList.find((med) => {
      const key = `${med.medicineId}-${med.poktanId}`;
      const progress = progressMap[key];
      return med.medicineId === stockItem.medicineId && progress && progress.scanned < progress.target;
    })!;

    // Success - add to scanned items
    const newItem: DistribusiItem = {
      id: `DIST-${Date.now()}`,
      medicineId: stockItem.medicineId,
      nama: stockItem.nama,
      bahanAktif: stockItem.bahanAktif,
      batchNumber: stockItem.batchNumber,
      barcode: stockItem.barcode,
      quantity: 1,
      satuan: stockItem.satuan,
      expiryDate: stockItem.expiryDate,
      scannedAt: new Date(),
      poktanId: targetMed.poktanId,
      poktanNama: targetMed.poktanNama,
    };

    const updatedItems = [...scannedItems, newItem];
    const newIsScanComplete = checkScanComplete(updatedItems);

    onUpdateState({
      scannedItems: updatedItems,
      isScanComplete: newIsScanComplete,
    });

    const result: ScanResult = {
      success: true,
      barcode: trimmed,
      stockItem,
    };
    setLastScanResult(result);
    toast.success(`${stockItem.nama} berhasil di-scan`, {
      description: `Batch: ${stockItem.batchNumber} · Lokasi: ${stockItem.lokasi}`,
    });
  }, [scannedItems, obatList, progressMap, onUpdateState]);

  const checkScanComplete = (items: DistribusiItem[]): boolean => {
    return obatList.every((med) => {
      const scanned = items.filter(
        (s) => s.medicineId === med.medicineId && s.poktanId === med.poktanId
      ).length;
      return scanned >= med.jumlahBesar;
    });
  };

  // ─── Camera Scanner ───
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsScannerActive(true);
    } catch {
      toast.error('Tidak dapat mengakses kamera', {
        description: 'Pastikan izin kamera telah diberikan.',
      });
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScannerActive(false);
  };

  // ─── Manual input submit ───
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processBarcode(manualInput);
    setManualInput("");
    inputRef.current?.focus();
  };

  // ─── Remove scanned item ───
  const handleRemoveScanned = (barcode: string) => {
    const updatedItems = scannedItems.filter((s) => s.barcode !== barcode);
    onUpdateState({
      scannedItems: updatedItems,
      isScanComplete: checkScanComplete(updatedItems),
    });
    toast.info('Item dihapus dari daftar scan');
  };

  // ─── Quick scan demo buttons ───
  const getAvailableBarcodes = () => {
    const scannedBarcodes = new Set(scannedItems.map((s) => s.barcode));
    return obatList.flatMap((med) => {
      const batches = getStockBatchesByMedicine(med.medicineId);
      return batches
        .filter((b) => !scannedBarcodes.has(b.barcode))
        .map((b) => ({
          ...b,
          poktanNama: med.poktanNama,
          isRecommended: b.isExpiringSoon,
        }));
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pb-4">
        {/* Progress Overview */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <Icon icon="heroicons:chart-bar" className="w-5 h-5 text-purple-500" />
              Progress Scan
            </div>
            <Badge className={cn(
              "text-xs px-2 py-0.5",
              isAllScanned
                ? "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300"
                : "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300"
            )}>
              {totalScanned}/{totalTarget}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                isAllScanned ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-purple-500 to-fuchsia-500"
              )}
              style={{ width: `${Math.min((totalScanned / totalTarget) * 100, 100)}%` }}
            />
          </div>

          {/* Per-medicine progress */}
          <div className="space-y-2">
            {Object.values(progressMap).map(({ target, scanned, medicine }) => {
              const key = `${medicine.medicineId}-${medicine.poktanId}`;
              const isDone = scanned >= target;
              return (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <Icon
                    icon={isDone ? "heroicons:check-circle-mini" : "heroicons:clock-mini"}
                    className={cn("w-4 h-4 shrink-0", isDone ? "text-green-500" : "text-gray-400")}
                  />
                  <span className={cn(
                    "flex-1 truncate",
                    isDone ? "text-green-700 dark:text-green-400 line-through" : "text-gray-700 dark:text-gray-300"
                  )}>
                    {medicine.nama}
                    {Object.keys(progressMap).length > obatList.length && (
                      <span className="text-gray-400"> · {medicine.poktanNama}</span>
                    )}
                  </span>
                  <span className={cn(
                    "font-medium tabular-nums",
                    isDone ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-300"
                  )}>
                    {scanned}/{target}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scanner Section */}
        {!isAllScanned && (
          <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
              <Icon icon="heroicons:qr-code" className="w-5 h-5" />
              Scan Barcode
            </div>

            {/* Camera */}
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-h-48">
              {isScannerActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  {/* Scan overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 max-w-[80%] max-h-[80%] border-2 border-white/50 rounded-lg">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-400 rounded-tl" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-400 rounded-tr" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-purple-400 rounded-bl" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-purple-400 rounded-br" />
                    </div>
                  </div>
                  <Button
                    onClick={stopScanner}
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                  >
                    <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <button
                  onClick={startScanner}
                  className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <Icon icon="heroicons:camera" className="w-10 h-10" />
                  <span className="text-xs font-medium">Tap untuk buka kamera</span>
                </button>
              )}
            </div>

            {/* Manual Input */}
            <div className="relative">
              <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1.5">
                <Icon icon="heroicons:pencil-square-mini" className="w-3 h-3" />
                Atau input manual barcode/ID obat:
              </div>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Masukkan barcode..."
                  className="flex-1 text-sm"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!manualInput.trim()}
                  className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shrink-0"
                >
                  <Icon icon="heroicons:magnifying-glass" className="w-4 h-4 mr-1" />
                  Cek
                </Button>
              </form>
            </div>

            {/* Quick scan demo (for demo mode) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <Icon icon="heroicons:bolt-mini" className="w-3 h-3" />
                Demo: klik barcode untuk simulasi scan
              </div>
              <div className="flex flex-wrap gap-1.5">
                {getAvailableBarcodes().slice(0, 8).map((batch) => (
                  <button
                    key={batch.barcode}
                    onClick={() => processBarcode(batch.barcode)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono",
                      "border transition-all hover:shadow-sm active:scale-95",
                      batch.isRecommended
                        ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <Icon icon="heroicons:qr-code-mini" className="w-3 h-3" />
                    {batch.barcode}
                    {batch.isRecommended && (
                      <Icon icon="heroicons:exclamation-triangle-mini" className="w-3 h-3 text-amber-500" />
                    )}
                  </button>
                ))}
                {/* Invalid barcode demo */}
                <button
                  onClick={() => processBarcode("INVALID123")}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 transition-all hover:shadow-sm active:scale-95"
                >
                  <Icon icon="heroicons:x-circle-mini" className="w-3 h-3" />
                  INVALID123
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Last Scan Result */}
        {lastScanResult && (
          <div className={cn(
            "rounded-xl border p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-300",
            lastScanResult.success
              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20"
              : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
          )}>
            <Icon
              icon={lastScanResult.success ? "heroicons:check-circle" : "heroicons:x-circle"}
              className={cn(
                "w-5 h-5 shrink-0 mt-0.5",
                lastScanResult.success ? "text-green-500" : "text-red-500"
              )}
            />
            <div className="min-w-0 flex-1">
              <div className={cn(
                "text-sm font-medium",
                lastScanResult.success ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
              )}>
                {lastScanResult.success
                  ? `Berhasil: ${lastScanResult.stockItem?.nama}`
                  : 'Gagal'
                }
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {lastScanResult.success
                  ? `Batch ${lastScanResult.stockItem?.batchNumber} · Exp ${formatTanggalOutgoing(lastScanResult.stockItem!.expiryDate)}`
                  : lastScanResult.errorMessage
                }
              </div>
            </div>
            <button
              onClick={() => setLastScanResult(null)}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <Icon icon="heroicons:x-mark-mini" className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scanned Items List */}
        {scannedItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <Icon icon="heroicons:check-badge" className="w-5 h-5 text-green-500" />
              Item Ter-scan ({scannedItems.length})
            </div>

            {scannedItems.map((scanned) => (
              <div
                key={scanned.barcode}
                className="flex items-center gap-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 px-3 py-2"
              >
                <Icon icon="heroicons:check-circle-mini" className="w-5 h-5 text-green-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {scanned.nama}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Batch: {scanned.batchNumber} · Barcode: {scanned.barcode} · Untuk: {scanned.poktanNama}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveScanned(scanned.barcode)}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Icon icon="heroicons:trash-mini" className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* All scanned success */}
        {isAllScanned && (
          <div className="rounded-xl border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 p-4 text-center space-y-2">
            <Icon icon="heroicons:check-badge" className="w-10 h-10 text-green-500 mx-auto" />
            <div className="text-sm font-semibold text-green-700 dark:text-green-300">
              Semua obat telah ter-scan dan terverifikasi!
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Lanjut ke langkah berikutnya untuk dokumentasi foto.
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default StepScan;
// # END OF Step Scan
