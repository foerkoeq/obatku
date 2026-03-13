"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { DrugInventory } from '@/lib/types/inventory';
import {
  LabelConfig,
  LabelPrintSettings,
  QRLabelPrintStep,
  QRLabelPrintOptions,
  PrintAction,
  PreviewPageData,
  LabelPreviewItem,
} from '@/lib/types/qr-label-print';
import {
  createDefaultLabelConfig,
  calculatePrintSummary,
  generatePreviewPages,
  generatePreviewItems,
  validateAllConfigs,
  calculateTotalLabels,
} from '@/lib/utils/qr-label-print-utils';
import LabelUnitSelector from './label-unit-selector';
import PrintRangeSelector from './print-range-selector';
import PrintSettingsCard from './print-settings-card';
import QRLabelPreview101 from './qr-label-preview-101';

interface QRLabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: string[];
  inventoryData: DrugInventory[];
}

const QRLabelPrintModal: React.FC<QRLabelPrintModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  inventoryData,
}) => {
  const [currentStep, setCurrentStep] = useState<QRLabelPrintStep>('config');
  const [configs, setConfigs] = useState<LabelConfig[]>([]);
  const [printSettings, setPrintSettings] = useState<LabelPrintSettings>({
    templateId: '101',
    labelsPerSheet: 6,
    startLabelPosition: 1,
    printAction: 'print',
  });
  const [previewPages, setPreviewPages] = useState<PreviewPageData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get selected medicines
  const selectedMedicines = useMemo(() => {
    return inventoryData.filter(item => selectedItems.includes(item.id));
  }, [inventoryData, selectedItems]);

  // Initialize configs when medicines change
  useEffect(() => {
    if (selectedMedicines.length > 0 && isOpen) {
      const defaultConfigs = selectedMedicines.map(createDefaultLabelConfig);
      setConfigs(defaultConfigs);
    }
  }, [selectedMedicines, isOpen]);

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('config');
      setPrintSettings({
        templateId: '101',
        labelsPerSheet: 6,
        startLabelPosition: 1,
        printAction: 'print',
      });
      setPreviewPages([]);
    }
  }, [isOpen]);

  // Handle config change
  const handleConfigChange = (index: number, newConfig: LabelConfig) => {
    setConfigs(prev => {
      const updated = [...prev];
      updated[index] = newConfig;
      return updated;
    });
  };

  // Calculate total labels
  const totalLabels = useMemo(() => {
    return configs.reduce((sum, config) => sum + calculateTotalLabels(config), 0);
  }, [configs]);

  // Validate configs
  const validation = useMemo(() => {
    return validateAllConfigs(configs);
  }, [configs]);

  // Handle preview
  const handlePreview = () => {
    if (!validation.isValid) {
      toast.error('Mohon perbaiki error sebelum melanjutkan');
      return;
    }

    if (totalLabels === 0) {
      toast.error('Tidak ada label untuk dicetak');
      return;
    }

    setIsGenerating(true);

    // Generate preview items
    let allItems: LabelPreviewItem[] = [];
    let startIndex = 0;

    for (const config of configs) {
      const medicine = selectedMedicines.find(m => m.id === config.medicineId);
      if (medicine) {
        const items = generatePreviewItems(config, medicine, startIndex);
        allItems = [...allItems, ...items];
        startIndex += items.length;
      }
    }

    // Generate pages
    const pages = generatePreviewPages(
      allItems,
      printSettings.labelsPerSheet,
      printSettings.startLabelPosition
    );

    setPreviewPages(pages);
    setCurrentStep('preview');
    setIsGenerating(false);

    toast.success('Preview berhasil dihasilkan');
  };

  // Handle back to config
  const handleBackToConfig = () => {
    setCurrentStep('config');
  };

  // Handle print/PDF
  const handlePrint = async () => {
    try {
      if (printSettings.printAction === 'pdf') {
        // Save as PDF
        toast.info('Menyiapkan PDF...');
        // TODO: Implement PDF generation
        setTimeout(() => {
          window.print();
          toast.success('PDF siap diunduh');
        }, 100);
      } else {
        // Print directly
        window.print();
        toast.success('Dokumen siap dicetak');
      }
    } catch (error) {
      toast.error('Gagal mencetak label');
    }
  };

  // Get modal title
  const getModalTitle = () => {
    switch (currentStep) {
      case 'config':
        return 'Cetak Label QR Code';
      case 'preview':
        return 'Preview Label';
      default:
        return 'Cetak Label';
    }
  };

  // Get modal description
  const getModalDescription = () => {
    switch (currentStep) {
      case 'config':
        return `Atur pengaturan cetak untuk ${selectedMedicines.length} obat terpilih`;
      case 'preview':
        return `Preview ${totalLabels} label sebelum dicetak`;
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col p-0">
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

        <ScrollArea className="flex-1 px-6 py-4">
          {currentStep === 'config' && (
            <div className="space-y-6">
              {/* Multiple medicines */}
              {selectedMedicines.length > 0 && (
                <div className="space-y-4">
                  {selectedMedicines.map((medicine, index) => (
                    <div key={medicine.id} className="space-y-4">
                      {/* Unit Selector */}
                      <LabelUnitSelector
                        medicine={medicine}
                        config={configs[index] || createDefaultLabelConfig(medicine)}
                        onConfigChange={(newConfig) => handleConfigChange(index, newConfig)}
                        index={index}
                      />

                      {/* Range Selector */}
                      <PrintRangeSelector
                        config={configs[index] || createDefaultLabelConfig(medicine)}
                        onConfigChange={(newConfig) => handleConfigChange(index, newConfig)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Print Settings */}
              <PrintSettingsCard
                printSettings={printSettings}
                onPrintSettingsChange={setPrintSettings}
                totalLabels={totalLabels}
                totalMedicines={selectedMedicines.length}
                onPreview={handlePreview}
                disabled={!validation.isValid || totalLabels === 0}
              />
            </div>
          )}

          {currentStep === 'preview' && (
            <QRLabelPreview101
              pages={previewPages}
              printSettings={printSettings}
              onBack={handleBackToConfig}
              onPrint={handlePrint}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default QRLabelPrintModal;
