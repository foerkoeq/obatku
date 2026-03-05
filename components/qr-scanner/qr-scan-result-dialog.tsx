"use client";

/**
 * QR Scan Result Dialog
 * 
 * Dialog untuk menampilkan hasil scan QR code.
 * Menampilkan informasi item yang di-scan dengan aksi navigasi.
 */

import React from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Icon } from "@/components/ui/icon";
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
import type { QrScanResult } from "@/lib/types/qr-scanner";
import {
  getQrTypeLabel,
  getQrTypeIcon,
  getQrTypeColor,
  getNavigationUrl,
} from "@/lib/utils/qr-parser";

interface QrScanResultDialogProps {
  /** Hasil scan */
  result: QrScanResult | null;
  /** Apakah dialog terbuka */
  open: boolean;
  /** Callback saat dialog dibuka/ditutup */
  onOpenChange: (open: boolean) => void;
  /** Callback navigasi */
  onNavigate?: (url: string) => void;
  /** Callback scan ulang */
  onRescan?: () => void;
}

const QrScanResultDialog: React.FC<QrScanResultDialogProps> = ({
  result,
  open,
  onOpenChange,
  onNavigate,
  onRescan,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!result) return null;

  const typeLabel = getQrTypeLabel(result.type);
  const typeIcon = getQrTypeIcon(result.type);
  const typeColor = getQrTypeColor(result.type);
  const navUrl = getNavigationUrl(result);

  const colorClasses: Record<string, string> = {
    info: "bg-info/10 text-info border-info/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    success: "bg-success/10 text-success border-success/20",
    default: "bg-default/10 text-default-600 border-default/20",
  };

  const iconBgClasses: Record<string, string> = {
    info: "bg-info/20 text-info",
    warning: "bg-warning/20 text-warning",
    success: "bg-success/20 text-success",
    default: "bg-default/20 text-default-600",
  };

  const resultContent = (
    <div className="space-y-4">
      {/* Type Badge */}
      <div className="flex items-center justify-center">
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium",
          colorClasses[typeColor]
        )}>
          <Icon icon={typeIcon} className="w-4 h-4" />
          {typeLabel}
        </div>
      </div>

      {/* Item Info Card */}
      <div className="bg-default-100 dark:bg-default-50/10 rounded-xl p-4 space-y-3">
        {/* Icon + Name */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            iconBgClasses[typeColor]
          )}>
            <Icon icon={typeIcon} className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            {result.data.name && (
              <h4 className="font-semibold text-default-900 truncate">
                {result.data.name}
              </h4>
            )}
            {result.data.code && (
              <p className="text-sm text-muted-foreground font-mono">
                {result.data.code}
              </p>
            )}
            {!result.data.name && !result.data.code && (
              <p className="text-sm text-muted-foreground break-all">
                {result.rawValue}
              </p>
            )}
          </div>
        </div>

        {/* Detail Info */}
        <div className="space-y-2 text-sm">
          {result.data.id && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID</span>
              <span className="font-mono text-default-700">{result.data.id}</span>
            </div>
          )}
          {result.data.description && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deskripsi</span>
              <span className="text-default-700 text-right max-w-[60%]">
                {result.data.description}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Waktu Scan</span>
            <span className="text-default-700">
              {result.scannedAt.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Raw Value (collapsible) */}
      <details className="text-xs">
        <summary className="text-muted-foreground cursor-pointer hover:text-default-600 transition-colors">
          Lihat data mentah
        </summary>
        <pre className="mt-2 p-3 bg-default-100 dark:bg-default-50/10 rounded-lg overflow-x-auto text-default-600 font-mono">
          {result.rawValue}
        </pre>
      </details>
    </div>
  );

  const footerActions = (
    <>
      <Button
        variant="outline"
        color="default"
        onClick={onRescan}
        className="gap-2"
      >
        <Icon icon="heroicons:camera-20-solid" className="w-4 h-4" />
        Scan Ulang
      </Button>
      {navUrl && (
        <Button
          color="primary"
          onClick={() => onNavigate?.(navUrl)}
          className="gap-2"
        >
          <Icon icon="heroicons:arrow-right-20-solid" className="w-4 h-4" />
          Lihat Detail
        </Button>
      )}
    </>
  );

  // Mobile: Drawer
  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Icon icon="heroicons:check-circle-20-solid" className="w-5 h-5 text-success" />
              QR Code Terdeteksi
            </DrawerTitle>
            <DrawerDescription>
              Berikut adalah informasi dari QR code yang di-scan
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            {resultContent}
          </div>
          <DrawerFooter className="flex-row justify-end gap-2">
            {footerActions}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="default">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="heroicons:check-circle-20-solid" className="w-5 h-5 text-success" />
            QR Code Terdeteksi
          </DialogTitle>
          <DialogDescription>
            Berikut adalah informasi dari QR code yang di-scan
          </DialogDescription>
        </DialogHeader>
        {resultContent}
        <DialogFooter>
          {footerActions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrScanResultDialog;
