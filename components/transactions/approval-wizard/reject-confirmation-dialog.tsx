"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface RejectConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  farmerGroupName: string;
}

export const RejectConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  farmerGroupName,
}: RejectConfirmationDialogProps) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState(false);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError(true);
      return;
    }
    onConfirm(reason);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tolak & Kembalikan untuk Revisi?</AlertDialogTitle>
          <AlertDialogDescription>
            Pengajuan dari <strong>{farmerGroupName}</strong> akan dikembalikan kepada pengaju (PPL) untuk diperbaiki. Mohon berikan alasan yang jelas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
            <Textarea
                placeholder="Contoh: Surat pengajuan tidak terbaca, mohon upload ulang dengan kualitas yang lebih baik."
                value={reason}
                onChange={(e) => {
                    setReason(e.target.value);
                    if (e.target.value.trim()) {
                        setError(false);
                    }
                }}
                className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {error && <p className="text-red-500 text-sm mt-1">Alasan penolakan tidak boleh kosong.</p>}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction asChild>
             <Button onClick={handleConfirm}>
                Ya, Tolak & Kirim Alasan
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 