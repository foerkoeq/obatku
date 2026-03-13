"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Icon } from '@iconify/react';
import { LabelUnit, LabelConfig } from '@/lib/types/qr-label-print';
import { DrugInventory } from '@/lib/types/inventory';
import {
  getLabelUnitDisplayName,
  getLabelUnitDisplayNameShort,
  getStockForUnit,
  getUnitLabelWithStock,
} from '@/lib/utils/qr-label-print-utils';

interface LabelUnitSelectorProps {
  medicine: DrugInventory;
  config: LabelConfig;
  onConfigChange: (config: LabelConfig) => void;
  disabled?: boolean;
  index?: number; // For multiple medicines display
  showMedicineName?: boolean;
}

const LabelUnitSelector: React.FC<LabelUnitSelectorProps> = ({
  medicine,
  config,
  onConfigChange,
  disabled = false,
  index,
  showMedicineName = true,
}) => {
  const handleUnitChange = (unit: LabelUnit) => {
    onConfigChange({
      ...config,
      unit,
      // Reset range when changing unit
      rangeType: 'all',
      rangeFrom: undefined,
      rangeTo: undefined,
      customItems: undefined,
    });
  };

  const smallStock = getStockForUnit(medicine, 'kecil');
  const largeStock = getStockForUnit(medicine, 'besar');

  return (
    <Card className={disabled ? 'opacity-50' : ''}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {index !== undefined && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {index + 1}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {showMedicineName && (
              <h4 className="font-semibold text-sm truncate">{medicine.name}</h4>
            )}
            <p className="text-xs text-muted-foreground truncate">
              {medicine.producer} • {medicine.content}
            </p>
          </div>
        </div>

        {/* Stock Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Icon icon="heroicons:cube" className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                Satuan Kecil
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{smallStock}</div>
            <div className="text-xs text-blue-600/70">
              {medicine.unit} tersedia
            </div>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Icon icon="heroicons:cube-transparent" className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-900 dark:text-green-100">
                Kemasan Besar
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600">{largeStock}</div>
            <div className="text-xs text-green-600/70">
              {medicine.largePack.unit} tersedia
            </div>
          </div>
        </div>

        {/* Unit Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Pilih Ukuran Label
          </Label>
          <RadioGroup
            value={config.unit}
            onValueChange={handleUnitChange}
            disabled={disabled}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor={`unit-kecil-${medicine.id}`}
              className={`
                cursor-pointer border-2 rounded-lg p-3 transition-all
                ${config.unit === 'kecil'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              <RadioGroupItem
                value="kecil"
                id={`unit-kecil-${medicine.id}`}
                className="sr-only"
                disabled={disabled}
              />
              <div className="flex items-center gap-2">
                <Icon
                  icon={config.unit === 'kecil' ? 'heroicons:check-circle' : 'heroicons:circle'}
                  className={`w-5 h-5 ${config.unit === 'kecil' ? 'text-blue-600' : 'text-gray-400'}`}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">Satuan Kecil</div>
                  <div className="text-xs text-muted-foreground">
                    {getUnitLabelWithStock(medicine, 'kecil')}
                  </div>
                </div>
              </div>
            </Label>

            <Label
              htmlFor={`unit-besar-${medicine.id}`}
              className={`
                cursor-pointer border-2 rounded-lg p-3 transition-all
                ${config.unit === 'besar'
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              <RadioGroupItem
                value="besar"
                id={`unit-besar-${medicine.id}`}
                className="sr-only"
                disabled={disabled}
              />
              <div className="flex items-center gap-2">
                <Icon
                  icon={config.unit === 'besar' ? 'heroicons:check-circle' : 'heroicons:circle'}
                  className={`w-5 h-5 ${config.unit === 'besar' ? 'text-green-600' : 'text-gray-400'}`}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">Kemasan Besar</div>
                  <div className="text-xs text-muted-foreground">
                    {getUnitLabelWithStock(medicine, 'besar')}
                  </div>
                </div>
              </div>
            </Label>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default LabelUnitSelector;
