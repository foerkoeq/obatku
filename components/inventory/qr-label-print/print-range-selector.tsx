"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import {
  LabelConfig,
  PrintRangeType,
} from '@/lib/types/qr-label-print';
import {
  calculateTotalLabels,
  parseCustomItems,
  formatCustomItemsDisplay,
  validateLabelConfig,
} from '@/lib/utils/qr-label-print-utils';

interface PrintRangeSelectorProps {
  config: LabelConfig;
  onConfigChange: (config: LabelConfig) => void;
  disabled?: boolean;
}

const PrintRangeSelector: React.FC<PrintRangeSelectorProps> = ({
  config,
  onConfigChange,
  disabled = false,
}) => {
  const [rangeInput, setRangeInput] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [customPreview, setCustomPreview] = useState<string[]>([]);

  // Initialize inputs from config
  useEffect(() => {
    if (config.rangeType === 'range' && config.rangeFrom && config.rangeTo) {
      setRangeInput(`${config.rangeFrom}-${config.rangeTo}`);
    } else {
      setRangeInput('');
    }

    if (config.rangeType === 'custom' && config.customItems) {
      setCustomInput(config.customItems);
    } else {
      setCustomInput('');
    }
  }, [config.rangeType, config.rangeFrom, config.rangeTo, config.customItems]);

  // Update custom preview when custom input changes
  useEffect(() => {
    if (customInput) {
      const items = parseCustomItems(customInput);
      setCustomPreview(items.map(String));
    } else {
      setCustomPreview([]);
    }
  }, [customInput]);

  const handleRangeTypeChange = (type: PrintRangeType) => {
    onConfigChange({
      ...config,
      rangeType: type,
      rangeFrom: undefined,
      rangeTo: undefined,
      customItems: undefined,
    });
  };

  const handleRangeInputChange = (value: string) => {
    setRangeInput(value);

    // Parse range input
    const parts = value.split('-').map(s => s.trim());
    if (parts.length === 2) {
      const from = parseInt(parts[0]);
      const to = parseInt(parts[1]);

      if (!isNaN(from) && !isNaN(to)) {
        onConfigChange({
          ...config,
          rangeFrom: from,
          rangeTo: to,
        });
      }
    } else {
      // Clear range if invalid format
      onConfigChange({
        ...config,
        rangeFrom: undefined,
        rangeTo: undefined,
      });
    }
  };

  const handleCustomInputChange = (value: string) => {
    setCustomInput(value);
    onConfigChange({
      ...config,
      customItems: value || undefined,
    });
  };

  const getStock = () => {
    return config.unit === 'kecil' ? config.smallStock : config.largeStock;
  };

  const stock = getStock();
  const totalLabels = calculateTotalLabels(config);
  const errors = validateLabelConfig(config);

  return (
    <Card className={disabled ? 'opacity-50' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon icon="heroicons:queue-list" className="w-5 h-5" />
          Jumlah Label
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Range Type Selection */}
        <RadioGroup
          value={config.rangeType}
          onValueChange={(value) => handleRangeTypeChange(value as PrintRangeType)}
          disabled={disabled}
          className="space-y-3"
        >
          {/* All Labels */}
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="all" id={`all-${config.medicineId}`} className="mt-1" />
            <div className="flex-1">
              <Label htmlFor={`all-${config.medicineId}`} className="cursor-pointer font-medium text-sm">
                Cetak Semua
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Mencetak semua {stock} label {config.unit} yang tersedia
              </p>
            </div>
          </div>

          {/* Range */}
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="range" id={`range-${config.medicineId}`} className="mt-1" />
            <div className="flex-1 space-y-2">
              <Label htmlFor={`range-${config.medicineId}`} className="cursor-pointer font-medium text-sm">
                Rentang Nomor Urut
              </Label>
              <p className="text-xs text-muted-foreground">
                Mencetak label dari nomor awal sampai akhir (misal: 1-10)
              </p>
              {config.rangeType === 'range' && (
                <div className="flex items-center gap-2">
                  <Input
                    value={rangeInput}
                    onChange={(e) => handleRangeInputChange(e.target.value)}
                    placeholder="1-10"
                    className="flex-1 h-9"
                    disabled={disabled}
                  />
                  <Badge variant="secondary" className="shrink-0">
                    {totalLabels} label
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Custom */}
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="custom" id={`custom-${config.medicineId}`} className="mt-1" />
            <div className="flex-1 space-y-2">
              <Label htmlFor={`custom-${config.medicineId}`} className="cursor-pointer font-medium text-sm">
                Nomor Urut Kustom
              </Label>
              <p className="text-xs text-muted-foreground">
                Pilih nomor tertentu, pisahkan dengan koma (misal: 1,3,5 atau 1-5,7,9)
              </p>
              {config.rangeType === 'custom' && (
                <div className="space-y-2">
                  <Textarea
                    value={customInput}
                    onChange={(e) => handleCustomInputChange(e.target.value)}
                    placeholder="1,3,5,7 atau 1-5,7,9"
                    rows={2}
                    className="text-sm"
                    disabled={disabled}
                  />
                  {customPreview.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Terpilih: {customPreview.length} nomor
                      </span>
                      <Badge variant="secondary" className="shrink-0">
                        {totalLabels} label
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </RadioGroup>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <Icon icon="heroicons:exclamation-triangle" className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Perhatian:</p>
              <ul className="text-xs text-destructive/80 mt-1 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Summary */}
        {errors.length === 0 && config.rangeType !== 'all' && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <Icon icon="heroicons:information-circle" className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {config.rangeType === 'range' && `Akan mencetak ${totalLabels} label dari nomor ${config.rangeFrom} sampai ${config.rangeTo}`}
              {config.rangeType === 'custom' && `Akan mencetak ${totalLabels} label dari ${customPreview.length} nomor yang dipilih`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrintRangeSelector;
