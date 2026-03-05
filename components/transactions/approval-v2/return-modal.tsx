// # START OF Return Modal - Alasan pengembalian/penolakan pengajuan
// Purpose: Modal for entering reason when returning/rejecting a submission
// Features: Responsive (Dialog/Drawer), textarea for reason, validation
// Used by: Pengajuan Dinas wizard (Kembalikan), Persetujuan Dinas (Pembenahan)

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Icon } from "@iconify/react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReturnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  confirmIcon?: string;
  variant?: 'return' | 'fix'; // return = kembalikan, fix = pembenahan
  onConfirm: (reason: string) => void;
}

const ReturnModal: React.FC<ReturnModalProps> = ({
  open,
  onOpenChange,
  title = 'Kembalikan Pengajuan',
  description = 'Berikan alasan pengembalian agar PPL dapat memperbaiki pengajuan.',
  confirmLabel = 'Kirim',
  confirmIcon = 'heroicons:paper-airplane',
  variant = 'return',
  onConfirm,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Alasan wajib diisi");
      return;
    }
    if (reason.trim().length < 10) {
      setError("Alasan minimal 10 karakter");
      return;
    }
    onConfirm(reason.trim());
    setReason("");
    setError("");
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onOpenChange(false);
  };

  const variantColors = {
    return: {
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      icon: 'heroicons:arrow-uturn-left',
      btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    fix: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: 'heroicons:wrench-screwdriver',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  };

  const colors = variantColors[variant];

  const ModalContent = () => (
    <div className="space-y-4 px-1">
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-full", colors.iconBg)}>
          <Icon icon={colors.icon} className={cn("w-6 h-6", colors.iconColor)} />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {variant === 'return' ? 'Pengembalian ke PPL' : 'Pembenahan Data'}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {variant === 'return'
              ? 'Pengajuan akan dikembalikan untuk diperbaiki'
              : 'Data akan dibuka kembali untuk pembenahan'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="return-reason" className="text-sm font-medium">
          Alasan <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="return-reason"
          placeholder={
            variant === 'return'
              ? 'Contoh: Data luasan perlu diverifikasi ulang oleh POPT...'
              : 'Contoh: Jumlah obat perlu disesuaikan dengan stok terkini...'
          }
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError("");
          }}
          className={cn(
            "min-h-[100px] resize-none",
            error && "border-red-500 focus:ring-red-500"
          )}
        />
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <Icon icon="heroicons:exclamation-circle-mini" className="w-3.5 h-3.5" />
            {error}
          </p>
        )}
        <p className="text-[11px] text-gray-400">
          {reason.length}/500 karakter (min. 10)
        </p>
      </div>
    </div>
  );

  const renderActions = () => (
    <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        className="flex-1 sm:flex-none"
      >
        Kembali
      </Button>
      <Button
        type="button"
        onClick={handleConfirm}
        className={cn("flex-1 sm:flex-none", colors.btnClass)}
        disabled={!reason.trim()}
      >
        <Icon icon={confirmIcon} className="w-4 h-4 mr-1.5" />
        {confirmLabel}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ModalContent />
          <DialogFooter className="mt-2">
            {renderActions()}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <ModalContent />
        </div>
        <DrawerFooter className="pt-4">
          {renderActions()}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ReturnModal;
