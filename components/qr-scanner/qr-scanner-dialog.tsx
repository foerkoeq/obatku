"use client";

/**
 * QR Scanner Dialog
 * 
 * Dialog/modal fullscreen untuk scanning QR code.
 * Di mobile: tampil sebagai drawer dari bawah  
 * Di desktop: tampil sebagai dialog center
 */

import React from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
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
import QrScannerCamera from "./qr-scanner-camera";
import type { QrScannerConfig } from "@/lib/types/qr-scanner";

interface QrScannerDialogProps {
  /** Apakah dialog terbuka */
  open: boolean;
  /** Callback saat dialog dibuka/ditutup */
  onOpenChange: (open: boolean) => void;
  /** Callback saat QR berhasil di-decode */
  onScanSuccess: (decodedText: string) => void;
  /** Callback saat ada error */
  onScanError?: (error: string) => void;
  /** Konfigurasi scanner */
  config?: QrScannerConfig;
}

const QrScannerDialog: React.FC<QrScannerDialogProps> = ({
  open,
  onOpenChange,
  onScanSuccess,
  onScanError,
  config,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const scannerContent = (
    <div className="w-full">
      <QrScannerCamera
        onScanSuccess={onScanSuccess}
        onScanError={onScanError}
        config={config}
        active={open}
      />
      <div className="flex items-center justify-center gap-4 mt-4 px-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-info animate-pulse" />
          <span>Rak Gudang</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          <span>Kardus Obat</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>Obat Satuan</span>
        </div>
      </div>
    </div>
  );

  // Mobile: gunakan Drawer (slide dari bawah) 
  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Scan QR Code
            </DrawerTitle>
            <DrawerDescription>
              Arahkan kamera ke QR code rak, kardus, atau obat
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {scannerContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: gunakan Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="default" className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scan QR Code
          </DialogTitle>
          <DialogDescription>
            Arahkan kamera ke QR code rak gudang, kardus obat, atau obat satuan
          </DialogDescription>
        </DialogHeader>
        {scannerContent}
      </DialogContent>
    </Dialog>
  );
};

export default QrScannerDialog;
