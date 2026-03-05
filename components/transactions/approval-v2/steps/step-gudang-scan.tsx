// # START OF Step Gudang Scan - Warehouse step 2: QR scan & verification
// Purpose: Scan QR codes or manual input to verify medicine items for distribution
// Features: Camera QR scan, manual ID input, scanned items list, matching validation
// Pattern: Based on stock-opname stock-update-dialog scan pattern

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ApprovalItem,
  ApprovedMedicineDetail,
  GudangScannedItem,
} from "@/lib/types/approval";

// ─── Types ───

interface StepGudangScanProps {
  item: ApprovalItem;
  scannedItems: GudangScannedItem[];
  onScannedItemsChange: (items: GudangScannedItem[]) => void;
}

// ─── Main Component ───

const StepGudangScan: React.FC<StepGudangScanProps> = ({
  item,
  scannedItems,
  onScannedItemsChange,
}) => {
  const [scannerActive, setScannerActive] = useState(false);
  const [manualId, setManualId] = useState("");

  const obatDisetujui = item.obatDisetujui || [];

  // Calculate progress
  const expectedItems = useMemo(() => {
    const map = new Map<string, { med: ApprovedMedicineDetail; target: number }>();
    obatDisetujui.forEach((med) => {
      const key = med.medicineId;
      const existing = map.get(key);
      if (existing) {
        existing.target += med.jumlahBesar;
      } else {
        map.set(key, { med, target: med.jumlahBesar });
      }
    });
    return map;
  }, [obatDisetujui]);

  const scannedCounts = useMemo(() => {
    const counts = new Map<string, number>();
    scannedItems.forEach((si) => {
      if (si.isValid) {
        counts.set(si.medicineId, (counts.get(si.medicineId) || 0) + 1);
      }
    });
    return counts;
  }, [scannedItems]);

  const totalExpected = useMemo(
    () => Array.from(expectedItems.values()).reduce((sum, e) => sum + e.target, 0),
    [expectedItems]
  );
  const totalScanned = useMemo(
    () => Array.from(scannedCounts.values()).reduce((sum, c) => sum + c, 0),
    [scannedCounts]
  );
  const progressPercent = totalExpected > 0 ? Math.round((totalScanned / totalExpected) * 100) : 0;

  // Handle scan result (from QR camera or manual input)
  const handleScanResult = useCallback(
    (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;

      // Parse the QR/ID — in production this would validate against backend
      // For demo: extract medicine ID from code format "MED-XXX" or any prefix
      const medId = extractMedicineId(trimmed);

      if (!medId) {
        const newItem: GudangScannedItem = {
          id: `SCAN-${Date.now()}`,
          medicineId: '',
          nama: 'Unknown',
          bahanAktif: '',
          qrCode: trimmed,
          satuanBesar: '',
          satuanKecil: '',
          jumlah: 0,
          satuan: '',
          scannedAt: new Date(),
          isValid: false,
          errorMessage: 'ID obat tidak dikenali',
        };
        onScannedItemsChange([newItem, ...scannedItems]);
        toast.error('ID obat tidak dikenali', { description: trimmed });
        return;
      }

      // Check if this medicine is in the approved list
      const expected = expectedItems.get(medId);
      if (!expected) {
        const newItem: GudangScannedItem = {
          id: `SCAN-${Date.now()}`,
          medicineId: medId,
          nama: medId,
          bahanAktif: '',
          qrCode: trimmed,
          satuanBesar: '',
          satuanKecil: '',
          jumlah: 0,
          satuan: '',
          scannedAt: new Date(),
          isValid: false,
          errorMessage: 'Obat tidak ada dalam daftar persetujuan',
        };
        onScannedItemsChange([newItem, ...scannedItems]);
        toast.error('Obat tidak sesuai!', {
          description: 'Obat yang di-scan tidak ada dalam daftar persetujuan',
        });
        return;
      }

      // Check if already exceeds target
      const currentCount = scannedCounts.get(medId) || 0;
      if (currentCount >= expected.target) {
        const newItem: GudangScannedItem = {
          id: `SCAN-${Date.now()}`,
          medicineId: medId,
          nama: expected.med.nama,
          bahanAktif: expected.med.bahanAktif,
          qrCode: trimmed,
          satuanBesar: expected.med.satuanBesar,
          satuanKecil: expected.med.satuanKecil,
          jumlah: 1,
          satuan: expected.med.satuanBesar,
          scannedAt: new Date(),
          isValid: false,
          errorMessage: `Jumlah sudah mencukupi (${currentCount}/${expected.target})`,
        };
        onScannedItemsChange([newItem, ...scannedItems]);
        toast.warning('Jumlah sudah cukup!', {
          description: `${expected.med.nama}: ${currentCount}/${expected.target} sudah terpenuhi`,
        });
        return;
      }

      // Valid scan
      const newItem: GudangScannedItem = {
        id: `SCAN-${Date.now()}`,
        medicineId: medId,
        nama: expected.med.nama,
        bahanAktif: expected.med.bahanAktif,
        qrCode: trimmed,
        satuanBesar: expected.med.satuanBesar,
        satuanKecil: expected.med.satuanKecil,
        jumlah: 1,
        satuan: expected.med.satuanBesar,
        scannedAt: new Date(),
        isValid: true,
      };
      onScannedItemsChange([newItem, ...scannedItems]);
      toast.success(`${expected.med.nama} berhasil di-scan`, {
        description: `${currentCount + 1}/${expected.target}`,
      });
    },
    [scannedItems, onScannedItemsChange, expectedItems, scannedCounts]
  );

  const handleManualSubmit = () => {
    if (!manualId.trim()) return;
    handleScanResult(manualId);
    setManualId("");
  };

  const handleRemoveScanned = (id: string) => {
    onScannedItemsChange(scannedItems.filter((si) => si.id !== id));
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-2 pb-4">
        {/* Progress */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Progress Verifikasi
            </span>
            <span className="font-mono text-sm font-bold text-purple-700 dark:text-purple-300">
              {totalScanned}/{totalExpected}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
          <p className="text-[11px] text-gray-500">
            {progressPercent === 100
              ? 'Semua obat sudah terverifikasi!'
              : `${totalExpected - totalScanned} item tersisa`}
          </p>
        </div>

        {/* Scan Input Section */}
        <div className="rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-800 p-4 bg-purple-50/30 dark:bg-purple-950/20">
          {/* QR Scanner Toggle */}
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant={scannerActive ? "default" : "outline"}
              size="sm"
              onClick={() => setScannerActive(!scannerActive)}
              className={cn(
                "flex-1",
                scannerActive && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              <Icon
                icon={scannerActive ? "heroicons:video-camera-slash" : "heroicons:qr-code"}
                className="w-4 h-4 mr-1.5"
              />
              {scannerActive ? 'Tutup Kamera' : 'Buka Kamera QR'}
            </Button>
          </div>

          {/* QR Camera placeholder */}
          {scannerActive && (
            <div className="mb-3 rounded-lg overflow-hidden bg-gray-900 aspect-square max-h-[200px] flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Icon icon="heroicons:camera" className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Kamera QR Scanner</p>
                <p className="text-[10px] opacity-60">
                  (Demo mode — gunakan input manual)
                </p>
                {/* In production: <QrScannerCamera onScanSuccess={handleScanResult} active={scannerActive} /> */}
              </div>
            </div>
          )}

          {/* Manual ID Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Input ID Obat manual (contoh: MED-003)"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleManualSubmit();
              }}
              className="flex-1 h-10"
            />
            <Button
              onClick={handleManualSubmit}
              disabled={!manualId.trim()}
              size="sm"
              className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Icon icon="heroicons:plus" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Scanned Items List */}
        {scannedItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Item Discan ({scannedItems.filter((s) => s.isValid).length} valid)
            </h4>
            <div className="space-y-1.5">
              {scannedItems.map((si) => (
                <div
                  key={si.id}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-lg border transition-colors",
                    si.isValid
                      ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20"
                      : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-full shrink-0",
                      si.isValid
                        ? "bg-green-100 dark:bg-green-900/40"
                        : "bg-red-100 dark:bg-red-900/40"
                    )}
                  >
                    <Icon
                      icon={si.isValid ? "heroicons:check-mini" : "heroicons:x-mark-mini"}
                      className={cn(
                        "w-3.5 h-3.5",
                        si.isValid
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      {si.nama}
                    </p>
                    {si.bahanAktif && (
                      <p className="text-[10px] text-gray-500 truncate">{si.bahanAktif}</p>
                    )}
                    {si.errorMessage && (
                      <p className="text-[10px] text-red-500 dark:text-red-400">
                        {si.errorMessage}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 font-mono">{si.qrCode}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => handleRemoveScanned(si.id)}
                  >
                    <Icon icon="heroicons:trash-mini" className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expected items reference */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Rekomendasi Obat yang Dikeluarkan
          </h4>
          <div className="space-y-1.5">
            {Array.from(expectedItems.entries()).map(([medId, { med, target }]) => {
              const scanned = scannedCounts.get(medId) || 0;
              const isFulfilled = scanned >= target;
              return (
                <div
                  key={medId}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border",
                    isFulfilled
                      ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg shrink-0",
                    isFulfilled ? "bg-green-100 dark:bg-green-900/40" : "bg-gray-100 dark:bg-gray-800"
                  )}>
                    <Icon
                      icon={isFulfilled ? "heroicons:check-circle" : "heroicons:beaker"}
                      className={cn(
                        "w-4 h-4",
                        isFulfilled ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "text-xs font-medium",
                      isFulfilled
                        ? "text-green-700 dark:text-green-300 line-through"
                        : "text-gray-800 dark:text-gray-200"
                    )}>
                      {med.nama}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">{med.bahanAktif}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-xs font-bold",
                      isFulfilled
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-700 dark:text-gray-300"
                    )}>
                      {scanned}/{target}
                    </p>
                    <p className="text-[10px] text-gray-500">{med.satuanBesar}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

// ─── Helper: Extract medicine ID from QR code / manual input ───

function extractMedicineId(code: string): string | null {
  // Direct ID match (e.g., "MED-003")
  const directMatch = code.match(/^(MED-\d+)$/i);
  if (directMatch) return directMatch[1].toUpperCase();

  // QR code format: "MED:SO-001:..." → extract medicine reference
  const qrMatch = code.match(/MED[:\-](\d+)/i);
  if (qrMatch) return `MED-${qrMatch[1].padStart(3, '0')}`;

  // Try numeric only
  const numMatch = code.match(/^(\d+)$/);
  if (numMatch) return `MED-${numMatch[1].padStart(3, '0')}`;

  return null;
}

export default StepGudangScan;
