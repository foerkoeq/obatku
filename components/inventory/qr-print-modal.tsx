"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { DrugInventory } from "@/lib/types/inventory";
import QRPrintSettings, { QRPrintOptions } from "../inventory/qr-print-settings";
import QRPrintPreview from "../inventory/qr-print-preview";
import { convertDrugToMedicine } from "@/lib/utils/qr-conversion";
import "./qr-print-modal.css";

interface QRPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: string[];
  inventoryData: DrugInventory[];
}

type ModalStep = "settings" | "preview";

const QRPrintModal: React.FC<QRPrintModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  inventoryData,
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>("settings");
  const [printOptions, setPrintOptions] = useState<QRPrintOptions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get selected medicines data
  const selectedMedicines = useMemo(() => {
    return inventoryData.filter(item => selectedItems.includes(item.id));
  }, [inventoryData, selectedItems]);

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep("settings");
      setPrintOptions(null);
    }
  }, [isOpen]);

  const handleSettingsComplete = async (options: QRPrintOptions) => {
    setIsGenerating(true);
    try {
      setPrintOptions(options);
      setCurrentStep("preview");
      toast.success("Preview QR code berhasil dihasilkan");
    } catch (error) {
      toast.error("Gagal membuat preview QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToSettings = () => {
    setCurrentStep("settings");
  };

  const handlePrint = async () => {
    if (!printOptions) return;

    try {
      // Add delay to ensure DOM is ready
      setTimeout(() => {
        window.print();
        toast.success("Dokumen QR code siap dicetak");
      }, 100);
    } catch (error) {
      toast.error("Gagal mencetak QR code");
    }
  };

  const handleClose = () => {
    if (currentStep === "preview") {
      handleBackToSettings();
    } else {
      onClose();
    }
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case "settings":
        return "Pengaturan Cetak QR Code";
      case "preview":
        return "Preview QR Code";
      default:
        return "Cetak QR Code";
    }
  };

  const getModalDescription = () => {
    switch (currentStep) {
      case "settings":
        return `Atur opsi cetak untuk ${selectedItems.length} item terpilih`;
      case "preview":
        return "Preview sebelum mencetak - pastikan layout sudah sesuai";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Icon icon="heroicons:qr-code" className="w-5 h-5" />
            {getModalTitle()}
          </DialogTitle>
          {getModalDescription() && (
            <p className="text-sm text-muted-foreground">
              {getModalDescription()}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 py-4">
          {currentStep === "settings" && (
            <QRPrintSettings
              selectedMedicines={selectedMedicines}
              onComplete={handleSettingsComplete}
              onCancel={onClose}
              isLoading={isGenerating}
            />
          )}

          {currentStep === "preview" && printOptions && (
            <div className="h-full overflow-y-auto">
              <QRPrintPreview
                medicines={selectedMedicines}
                options={printOptions}
                onBack={handleBackToSettings}
                onPrint={handlePrint}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRPrintModal;
