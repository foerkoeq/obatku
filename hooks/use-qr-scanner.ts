"use client";

/**
 * useQrScanner Hook
 * 
 * Custom hook untuk mengelola state dan logika QR Code Scanner.
 * Menggunakan jotai untuk global state agar scanner bisa diakses dari mana saja.
 */

import { useCallback, useState } from "react";
import { atom, useAtom } from "jotai";
import type { QrScanResult, ScanStatus, QrScannerConfig } from "@/lib/types/qr-scanner";
import { parseQrCode, getNavigationUrl } from "@/lib/utils/qr-parser";
import { useRouter } from "@/components/navigation";

/** Global state: apakah scanner dialog terbuka */
const scannerOpenAtom = atom<boolean>(false);

/** Global state: hasil scan terakhir */
const lastScanResultAtom = atom<QrScanResult | null>(null);

/** Global state: status scanner */
const scanStatusAtom = atom<ScanStatus>("idle");

/** Global state: apakah result dialog terbuka */
const resultOpenAtom = atom<boolean>(false);

/** Default config scanner */
const DEFAULT_CONFIG: QrScannerConfig = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  facingMode: "environment",
  torch: false,
  disableBeep: false,
};

export function useQrScanner(config?: Partial<QrScannerConfig>) {
  const router = useRouter();
  const [scannerOpen, setScannerOpen] = useAtom(scannerOpenAtom);
  const [lastResult, setLastResult] = useAtom(lastScanResultAtom);
  const [status, setStatus] = useAtom(scanStatusAtom);
  const [resultOpen, setResultOpen] = useAtom(resultOpenAtom);
  const [error, setError] = useState<string | null>(null);

  const mergedConfig: QrScannerConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  /** Buka scanner */
  const openScanner = useCallback(() => {
    setError(null);
    setStatus("scanning");
    setScannerOpen(true);
  }, [setScannerOpen, setStatus]);

  /** Tutup scanner */
  const closeScanner = useCallback(() => {
    setScannerOpen(false);
    setStatus("idle");
  }, [setScannerOpen, setStatus]);

  /** Toggle scanner */
  const toggleScanner = useCallback(() => {
    if (scannerOpen) {
      closeScanner();
    } else {
      openScanner();
    }
  }, [scannerOpen, openScanner, closeScanner]);

  /** Handle scan success */
  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      setStatus("processing");
      
      const result = parseQrCode(decodedText);
      setLastResult(result);
      setStatus("success");
      
      // Tutup scanner dan buka result dialog
      setScannerOpen(false);
      setResultOpen(true);
    },
    [setLastResult, setStatus, setScannerOpen, setResultOpen]
  );

  /** Handle scan error */
  const handleScanError = useCallback(
    (errorMessage: string) => {
      // html5-qrcode mengirim error setiap frame saat belum ada QR code
      // Jadi kita hanya log error yang penting
      if (errorMessage.includes("No MultiFormat Readers") || 
          errorMessage.includes("NotFoundException")) {
        return; // Normal - belum ada QR terdeteksi
      }
      setError(errorMessage);
    },
    []
  );

  /** Navigasi ke halaman hasil scan */
  const navigateToResult = useCallback(() => {
    if (!lastResult) return;
    
    const url = getNavigationUrl(lastResult);
    if (url) {
      setResultOpen(false);
      router.push(url);
    }
  }, [lastResult, router, setResultOpen]);

  /** Scan ulang */
  const rescan = useCallback(() => {
    setResultOpen(false);
    setLastResult(null);
    setError(null);
    openScanner();
  }, [setResultOpen, setLastResult, openScanner]);

  /** Reset semua state */
  const reset = useCallback(() => {
    setScannerOpen(false);
    setResultOpen(false);
    setLastResult(null);
    setStatus("idle");
    setError(null);
  }, [setScannerOpen, setResultOpen, setLastResult, setStatus]);

  return {
    // State
    scannerOpen,
    resultOpen,
    lastResult,
    status,
    error,
    config: mergedConfig,

    // Actions
    openScanner,
    closeScanner,
    toggleScanner,
    handleScanSuccess,
    handleScanError,
    navigateToResult,
    rescan,
    reset,

    // Dialog controls
    setScannerOpen,
    setResultOpen,
  };
}
