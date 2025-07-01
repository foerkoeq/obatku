"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Transaction, ApprovedDrug } from "@/lib/types/transaction";
import { Icon } from "@/components/ui/icon";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface IssuanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

type ScannedItemsState = {
  [drugId: string]: number;
};

export const IssuanceModal = ({
  isOpen,
  onClose,
  transaction,
}: IssuanceModalProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [scannedItems, setScannedItems] = useState<ScannedItemsState>({});

  const approvedDrugs = transaction.approval?.approvedDrugs ?? [];

  const handleScan = (drugId: string) => {
    setScannedItems((prev) => {
      const currentCount = prev[drugId] ?? 0;
      const approvedDrug = approvedDrugs.find(d => d.drugId === drugId);
      const approvedQuantity = approvedDrug?.approvedQuantity ?? 0;
      if (currentCount >= approvedQuantity) {
        // Here you would show a toast/error that all items are already scanned
        return prev;
      }
      return { ...prev, [drugId]: currentCount + 1 };
    });
  };

  const totalScannedCount = useMemo(() => Object.values(scannedItems).reduce((sum, count) => sum + count, 0), [scannedItems]);
  const totalRequiredCount = useMemo(() => approvedDrugs.reduce((sum, drug) => sum + drug.approvedQuantity, 0), [approvedDrugs]);
  const isComplete = totalScannedCount === totalRequiredCount;

  const ModalContent = () => (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <h4 className="font-semibold mb-2 text-sm">Informasi Pengeluaran</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <p className="text-gray-500">Kelompok Tani</p>
            <p className="font-medium">{transaction.farmerGroup.name}</p>
          </div>
           <div>
            <p className="text-gray-500">Penerima</p>
            <p className="font-medium">{transaction.farmerGroup.leader}</p>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-sm">Item untuk Dikeluarkan</h4>
            <span className="text-xs font-mono p-1 rounded bg-gray-100 dark:bg-gray-900">{totalScannedCount}/{totalRequiredCount}</span>
        </div>
        <Progress value={(totalScannedCount / totalRequiredCount) * 100} className="h-2" />
      </div>

      <ScrollArea className="h-[200px] -mr-4 pr-4">
        <div className="space-y-3">
          {approvedDrugs.map((drug) => {
            const scannedCount = scannedItems[drug.drugId] ?? 0;
            const isDrugComplete = scannedCount === drug.approvedQuantity;
            return (
              <div key={drug.drugId} className="flex items-center p-3 border rounded-lg bg-white dark:bg-gray-800">
                <div className="flex-grow">
                  <p className="font-semibold">{drug.drugName}</p>
                  <p className="text-sm text-gray-500">
                    {scannedCount} / {drug.approvedQuantity} {drug.unit}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleScan(drug.drugId)}
                  disabled={isDrugComplete}
                  className="shrink-0"
                >
                  <Icon icon={isDrugComplete ? "lucide:check" : "lucide:scan-line"} className="w-4 h-4 mr-2" />
                  {isDrugComplete ? "Lengkap" : "Scan"}
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  const renderFooter = () => (
    <>
      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={!isComplete}
      >
        <Icon icon="lucide:check-circle" className="w-4 h-4 mr-2" />
        Konfirmasi & Cetak Bukti
      </Button>
      {isDesktop ? (
         <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
      ) : (
        <DrawerClose asChild>
          <Button variant="outline">Batal</Button>
        </DrawerClose>
      )}
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Proses Pengeluaran: {transaction.id}</DialogTitle>
            <DialogDescription>
              Scan setiap item/box yang akan dikeluarkan dari gudang.
            </DialogDescription>
          </DialogHeader>
          <ModalContent />
          <DialogFooter className="mt-4 flex-row-reverse justify-start sm:flex-row">
            {renderFooter()}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Proses Pengeluaran: {transaction.id}</DrawerTitle>
          <DrawerDescription>
            Scan setiap item/box yang akan dikeluarkan dari gudang.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <ModalContent />
        </div>
        <DrawerFooter className="pt-4">
          {renderFooter()}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}; 