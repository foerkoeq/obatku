// # START OF TrxDeleteDialog - Delete confirmation dialog for transactions
// Purpose: Confirm before deleting a transaction
// Props: open, onClose, onConfirm, transactionId
// Returns: AlertDialog with confirmation
// Dependencies: AlertDialog, Button, toast

"use client";

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
import { Icon } from "@iconify/react";
import { useState } from "react";

interface TrxDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  transactionId?: string;
}

const TrxDeleteDialog: React.FC<TrxDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  transactionId,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-2">
            <Icon icon="heroicons:trash" className="h-6 w-6 text-red-600" />
          </div>
          <AlertDialogTitle className="text-center">Hapus Transaksi?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Transaksi <span className="font-semibold text-default-900">{transactionId}</span> akan
            dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onClose} className="w-full sm:w-auto">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Icon icon="heroicons:arrow-path" className="h-4 w-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Icon icon="heroicons:trash" className="h-4 w-4 mr-2" />
                Ya, Hapus
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TrxDeleteDialog;

// # END OF TrxDeleteDialog
