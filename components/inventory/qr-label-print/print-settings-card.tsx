"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import {
  LabelPrintSettings,
  PrintAction,
} from '@/lib/types/qr-label-print';
import { calculatePrintSummary } from '@/lib/utils/qr-label-print-utils';

interface PrintSettingsCardProps {
  printSettings: LabelPrintSettings;
  onPrintSettingsChange: (settings: LabelPrintSettings) => void;
  totalLabels: number;
  totalMedicines: number;
  onPreview: () => void;
  disabled?: boolean;
}

const PrintSettingsCard: React.FC<PrintSettingsCardProps> = ({
  printSettings,
  onPrintSettingsChange,
  totalLabels,
  totalMedicines,
  onPreview,
  disabled = false,
}) => {
  const summary = calculatePrintSummary(
    [],
    printSettings.labelsPerSheet,
    printSettings.startLabelPosition
  );

  const actualTotalPages = totalLabels > 0
    ? Math.ceil((totalLabels - (printSettings.labelsPerSheet - printSettings.startLabelPosition + 1)) / printSettings.labelsPerSheet) + 1
    : 0;

  const handleStartPositionChange = (position: number) => {
    onPrintSettingsChange({
      ...printSettings,
      startLabelPosition: position,
    });
  };

  const handlePrintActionChange = (action: PrintAction) => {
    onPrintSettingsChange({
      ...printSettings,
      printAction: action,
    });
  };

  return (
    <Card className={disabled ? 'opacity-50' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon icon="heroicons:printer" className="w-5 h-5" />
          Pengaturan Cetak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalMedicines}</div>
            <div className="text-xs text-muted-foreground">Obat</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalLabels}</div>
            <div className="text-xs text-muted-foreground">Label</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{actualTotalPages}</div>
            <div className="text-xs text-muted-foreground">Halaman</div>
          </div>
        </div>

        {/* Start Position */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Posisi Label Pertama (Halaman 1)
          </Label>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((pos) => (
              <button
                key={pos}
                onClick={() => handleStartPositionChange(pos)}
                disabled={disabled}
                className={`
                  h-12 rounded-lg border-2 font-medium text-sm transition-all
                  ${printSettings.startLabelPosition === pos
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }
                  ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
              >
                {pos}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {printSettings.startLabelPosition > 1
              ? `Mulai dari posisi ${printSettings.startLabelPosition} untuk memanfaatkan label yang tersisa`
              : 'Mulai dari posisi 1 (default) untuk kertas baru'
            }
          </p>
        </div>

        {/* Print Action */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Aksi Cetak
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handlePrintActionChange('print')}
              disabled={disabled}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${printSettings.printAction === 'print'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon icon="heroicons:printer" className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-sm">Cetak</span>
                <span className="text-xs text-muted-foreground">
                  Langsung print ke printer
                </span>
              </div>
            </button>

            <button
              onClick={() => handlePrintActionChange('pdf')}
              disabled={disabled}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${printSettings.printAction === 'pdf'
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon icon="heroicons:document-arrow-down" className="w-6 h-6 text-green-600" />
                <span className="font-medium text-sm">Simpan PDF</span>
                <span className="text-xs text-muted-foreground">
                  Download sebagai file PDF
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Template Info */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon icon="heroicons:information-circle" className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                Template Label No. 101
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Kertas stiker 21.5 × 16.5 cm (Landscape) • 6 label per halaman
              </p>
            </div>
          </div>
        </div>

        {/* Preview Button */}
        <Button
          onClick={onPreview}
          disabled={disabled || totalLabels === 0}
          className="w-full"
        >
          <Icon icon="heroicons:eye" className="w-4 h-4 mr-2" />
          Lihat Preview ({totalLabels} Label)
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrintSettingsCard;
