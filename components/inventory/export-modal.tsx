// # START OF Export Modal Component - Modal for data export options
// Purpose: Provide export functionality with multiple formats and scope options
// Props: isOpen, onClose, onExport, totalRecords, filteredRecords
// Returns: Modal with export form
// Dependencies: Dialog, Button, RadioGroup, Form components

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import { ExportOptions } from "@/lib/types/inventory";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  totalRecords: number;
  filteredRecords: number;
  currentPageRecords: number;
  title?: string;
  description?: string;
}

const exportFormats = [
  {
    value: 'pdf',
    label: 'PDF',
    icon: 'heroicons:document-arrow-down',
    description: 'Format PDF untuk laporan'
  },
  {
    value: 'excel',
    label: 'Excel',
    icon: 'heroicons:table-cells',
    description: 'Spreadsheet Excel (.xlsx)'
  },
  {
    value: 'csv',
    label: 'CSV',
    icon: 'heroicons:document-text',
    description: 'Comma Separated Values'
  },
  {
    value: 'print',
    label: 'Print',
    icon: 'heroicons:printer',
    description: 'Cetak langsung'
  }
] as const;

const exportScopes = [
  {
    value: 'current',
    label: 'Halaman Saat Ini',
    description: 'Data yang sedang ditampilkan'
  },
  {
    value: 'filtered',
    label: 'Hasil Filter',
    description: 'Semua data hasil filter'
  },
  {
    value: 'all',
    label: 'Seluruh Data',
    description: 'Semua data dalam database'
  }
] as const;

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  totalRecords,
  filteredRecords,
  currentPageRecords,
  title = "Export Data",
  description = "Pilih format dan scope export data inventory"
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportOptions['format']>('pdf');
  const [selectedScope, setSelectedScope] = useState<ExportOptions['scope']>('current');

  const getRecordCount = (scope: ExportOptions['scope']) => {
    switch (scope) {
      case 'current':
        return currentPageRecords;
      case 'filtered':
        return filteredRecords;
      case 'all':
        return totalRecords;
    }
  };

  const handleExport = () => {
    onExport({
      format: selectedFormat,
      scope: selectedScope
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="heroicons:arrow-down-tray" className="w-5 h-5" />
            {title}
          </DialogTitle>
          <p className="text-sm text-default-600">{description}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Pilih Format Export</Label>
            <RadioGroup
              value={selectedFormat}
              onValueChange={(value) => setSelectedFormat(value as ExportOptions['format'])}
              className="grid grid-cols-2 gap-3"
            >
              {exportFormats.map((format) => (
                <div key={format.value} className="relative">
                  <RadioGroupItem
                    value={format.value}
                    id={format.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={format.value}
                    className="flex flex-col items-center p-4 border border-default-200 rounded-lg cursor-pointer hover:bg-default-50 peer-checked:border-primary peer-checked:bg-primary/5 transition-colors"
                  >
                    <Icon icon={format.icon} className="w-6 h-6 mb-2 text-default-600" />
                    <span className="font-medium text-sm">{format.label}</span>
                    <span className="text-xs text-default-500 text-center">
                      {format.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Scope Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Pilih Data yang Akan Diexport</Label>
            <RadioGroup
              value={selectedScope}
              onValueChange={(value) => setSelectedScope(value as ExportOptions['scope'])}
              className="space-y-3"
            >
              {exportScopes.map((scope) => (
                <div key={scope.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={scope.value} id={scope.value} />
                  <Label
                    htmlFor={scope.value}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{scope.label}</span>
                        <p className="text-sm text-default-500">{scope.description}</p>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {getRecordCount(scope.value)} records
                      </span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4"
          >
            Batal
          </Button>
          <Button
            onClick={handleExport}
            className="px-6"
          >
            <Icon icon="heroicons:arrow-down-tray" className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;

// # END OF Export Modal Component 