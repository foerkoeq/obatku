"use client";

/**
 * QR Scanner Provider
 * 
 * Komponen utama yang menggabungkan semua bagian QR scanner:
 * - Floating button (desktop)
 * - Scanner dialog/drawer
 * - Result dialog/drawer
 * 
 * Tinggal taruh di layout dan semuanya berjalan otomatis.
 */

import React from "react";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import FloatingScanButton from "./floating-scan-button";
import QrScannerDialog from "./qr-scanner-dialog";
import QrScanResultDialog from "./qr-scan-result-dialog";
import type { QrScannerConfig } from "@/lib/types/qr-scanner";

interface QrScannerProviderProps {
  /** Konfigurasi scanner (opsional) */
  config?: QrScannerConfig;
  /** Sembunyikan floating button */
  hideFloatingButton?: boolean;
}

const QrScannerProvider: React.FC<QrScannerProviderProps> = ({
  config,
  hideFloatingButton = false,
}) => {
  const {
    scannerOpen,
    resultOpen,
    lastResult,
    handleScanSuccess,
    handleScanError,
    navigateToResult,
    rescan,
    openScanner,
    setScannerOpen,
    setResultOpen,
    config: mergedConfig,
  } = useQrScanner(config);

  return (
    <>
      {/* Floating Action Button - hanya desktop */}
      {!hideFloatingButton && (
        <FloatingScanButton onClick={openScanner} />
      )}

      {/* Scanner Dialog */}
      <QrScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
        config={mergedConfig}
      />

      {/* Result Dialog */}
      <QrScanResultDialog
        result={lastResult}
        open={resultOpen}
        onOpenChange={setResultOpen}
        onNavigate={navigateToResult}
        onRescan={rescan}
      />
    </>
  );
};

export default QrScannerProvider;
