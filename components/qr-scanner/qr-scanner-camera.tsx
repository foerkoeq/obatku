"use client";

/**
 * QR Scanner Camera View
 * 
 * Komponen kamera untuk scanning QR code.
 * Menggunakan html5-qrcode untuk akses kamera dan decode QR code.
 * Komponen ini hanya bertanggung jawab untuk rendering kamera dan scanning.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { QrScannerConfig } from "@/lib/types/qr-scanner";

interface QrScannerCameraProps {
  /** Callback saat QR berhasil di-decode */
  onScanSuccess: (decodedText: string) => void;
  /** Callback saat ada error scanning */
  onScanError?: (error: string) => void;
  /** Konfigurasi scanner */
  config?: QrScannerConfig;
  /** Apakah scanner aktif */
  active?: boolean;
  /** Custom class */
  className?: string;
}

const SCANNER_ELEMENT_ID = "qr-scanner-region";

const QrScannerCamera: React.FC<QrScannerCameraProps> = ({
  onScanSuccess,
  onScanError,
  config = {},
  active = true,
  className,
}) => {
  const scannerRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const hasScannedRef = useRef(false);

  const {
    fps = 10,
    qrbox = { width: 250, height: 250 },
    facingMode = "environment",
  } = config;

  const startScanner = useCallback(async () => {
    if (scannerRef.current || !active) return;
    
    try {
      // Dynamic import untuk menghindari SSR issues
      const { Html5Qrcode } = await import("html5-qrcode");
      
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;
      hasScannedRef.current = false;

      await scanner.start(
        { facingMode },
        { fps, qrbox },
        (decodedText: string) => {
          // Prevent multiple scans
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          
          // Haptic feedback jika tersedia
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          
          onScanSuccess(decodedText);
        },
        (errorMessage: string) => {
          onScanError?.(errorMessage);
        }
      );
      
      setIsInitialized(true);
      setCameraError(null);
    } catch (err: any) {
      const message = err?.message || "Gagal mengakses kamera";
      setCameraError(message);
      console.error("QR Scanner error:", err);
    }
  }, [active, fps, qrbox, facingMode, onScanSuccess, onScanError]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // State 2 = SCANNING
        if (state === 2) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn("Error stopping scanner:", err);
      }
      scannerRef.current = null;
      setIsInitialized(false);
    }
  }, []);

  useEffect(() => {
    if (active) {
      // Delay sedikit agar DOM sudah ready
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [active, startScanner, stopScanner]);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Camera viewport */}
      <div
        id={SCANNER_ELEMENT_ID}
        className={cn(
          "w-full overflow-hidden rounded-lg bg-black",
          "[&_video]:!rounded-lg",
          "[&_#qr-shaded-region]:!border-primary/30",
          // Hide the default html5-qrcode UI elements
          "[&_img]:hidden",
          "[&_a]:hidden",
        )}
        style={{ minHeight: "300px" }}
      />

      {/* Loading overlay */}
      {!isInitialized && !cameraError && active && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-white/80 text-sm">Mengakses kamera...</p>
        </div>
      )}

      {/* Error state */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 rounded-lg p-4">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-white text-sm text-center font-medium mb-1">Tidak dapat mengakses kamera</p>
          <p className="text-white/60 text-xs text-center max-w-[250px]">
            Pastikan Anda memberikan izin akses kamera pada browser
          </p>
          <button
            onClick={() => {
              setCameraError(null);
              startScanner();
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Scan guide overlay */}
      {isInitialized && !cameraError && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
            Arahkan kamera ke QR Code
          </div>
        </div>
      )}
    </div>
  );
};

export default QrScannerCamera;
