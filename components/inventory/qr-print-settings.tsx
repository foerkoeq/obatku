"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/react";
import { DrugInventory } from "@/lib/types/inventory";
import QRRangeConfigurator from "./qr-range-configurator";

export interface QRPrintOptions {
  rangeType: "all" | "date" | "id" | "custom";
  rangeSettings: {
    dateFrom?: Date;
    dateTo?: Date;
    idFrom?: string;
    idTo?: string;
    customIds?: string[];
  };
  printSettings: {
    labelsPerItem: number;
    includeItemInfo: boolean;
    includeDates: boolean;
    includeLocation: boolean;
  };
  totalLabels: number;
}

interface QRPrintSettingsProps {
  selectedMedicines: DrugInventory[];
  onComplete: (options: QRPrintOptions) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const QRPrintSettings: React.FC<QRPrintSettingsProps> = ({
  selectedMedicines,
  onComplete,
  onCancel,
  isLoading = false,
}) => {
  const [rangeType, setRangeType] = useState<"all" | "date" | "id" | "custom">("all");
  const [rangeSettings, setRangeSettings] = useState<QRPrintOptions["rangeSettings"]>({});
  const [printSettings, setPrintSettings] = useState<QRPrintOptions["printSettings"]>({
    labelsPerItem: 1,
    includeItemInfo: true,
    includeDates: true,
    includeLocation: true,
  });

  // Calculate total labels based on current settings
  const calculateTotalLabels = (): number => {
    let itemCount = selectedMedicines.length;

    // Filter based on range type
    if (rangeType === "date" && rangeSettings.dateFrom && rangeSettings.dateTo) {
      itemCount = selectedMedicines.filter(med => {
        const entryDate = new Date(med.entryDate);
        return entryDate >= rangeSettings.dateFrom! && entryDate <= rangeSettings.dateTo!;
      }).length;
    } else if (rangeType === "id" && rangeSettings.idFrom && rangeSettings.idTo) {
      itemCount = selectedMedicines.filter(med => {
        return med.id >= rangeSettings.idFrom! && med.id <= rangeSettings.idTo!;
      }).length;
    } else if (rangeType === "custom" && rangeSettings.customIds) {
      itemCount = rangeSettings.customIds.length;
    }

    return itemCount * printSettings.labelsPerItem;
  };

  const totalLabels = calculateTotalLabels();

  const handleRangeSettingsChange = (newSettings: QRPrintOptions["rangeSettings"]) => {
    setRangeSettings(newSettings);
  };

  const handlePrintSettingsChange = (key: keyof QRPrintOptions["printSettings"], value: any) => {
    setPrintSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleComplete = () => {
    const options: QRPrintOptions = {
      rangeType,
      rangeSettings,
      printSettings,
      totalLabels,
    };

    onComplete(options);
  };

  const isFormValid = () => {
    if (rangeType === "date") {
      return rangeSettings.dateFrom && rangeSettings.dateTo;
    }
    if (rangeType === "id") {
      return rangeSettings.idFrom && rangeSettings.idTo;
    }
    if (rangeType === "custom") {
      return rangeSettings.customIds && rangeSettings.customIds.length > 0;
    }
    return true; // "all" type is always valid
  };

  return (
    <div className="space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto px-1">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon icon="heroicons:information-circle" className="w-5 h-5" />
            Ringkasan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-primary">{selectedMedicines.length}</div>
              <div className="text-xs text-muted-foreground">Item Dipilih</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-600">{totalLabels}</div>
              <div className="text-xs text-muted-foreground">Total Label</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">
                {Math.ceil(totalLabels / 12)}
              </div>
              <div className="text-xs text-muted-foreground">Halaman</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Range Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon icon="heroicons:adjustments-horizontal" className="w-5 h-5" />
              Pengaturan Rentang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <RadioGroup value={rangeType} onValueChange={(value) => setRangeType(value as "all" | "date" | "id" | "custom")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="text-sm">Cetak semua item yang dipilih</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="date" id="date" />
                <Label htmlFor="date" className="text-sm">Berdasarkan rentang tanggal masuk</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="id" id="id" />
                <Label htmlFor="id" className="text-sm">Berdasarkan rentang ID obat</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="text-sm">ID kustom (pisahkan dengan koma)</Label>
              </div>
            </RadioGroup>

            <QRRangeConfigurator
              rangeType={rangeType}
              selectedMedicines={selectedMedicines}
              value={rangeSettings}
              onChange={handleRangeSettingsChange}
            />
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon icon="heroicons:document-text" className="w-5 h-5" />
              Pengaturan Label
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="labelsPerItem" className="text-sm">Jumlah label per item</Label>
              <Input
                id="labelsPerItem"
                type="number"
                min={1}
                max={10}
                value={printSettings.labelsPerItem}
                onChange={(e) => handlePrintSettingsChange("labelsPerItem", parseInt(e.target.value) || 1)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Berapa banyak label yang akan dicetak untuk setiap item obat
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Informasi yang ditampilkan:</h4>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeItemInfo"
                  checked={printSettings.includeItemInfo}
                  onCheckedChange={(checked) => handlePrintSettingsChange("includeItemInfo", checked)}
                />
                <Label htmlFor="includeItemInfo" className="text-sm">Info obat (nama, produsen, kandungan)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDates"
                  checked={printSettings.includeDates}
                  onCheckedChange={(checked) => handlePrintSettingsChange("includeDates", checked)}
                />
                <Label htmlFor="includeDates" className="text-sm">Tanggal masuk & kadaluarsa</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeLocation"
                  checked={printSettings.includeLocation}
                  onCheckedChange={(checked) => handlePrintSettingsChange("includeLocation", checked)}
                />
                <Label htmlFor="includeLocation" className="text-sm">Lokasi penyimpanan</Label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
              <p className="text-xs text-blue-700">
                <strong>Info:</strong> Label akan dicetak pada kertas stiker label no 121 
                (17.58 × 22.27 cm) dengan layout 2 kolom × 6 baris per halaman.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 sticky bottom-0 bg-background pb-1">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          <Icon icon="heroicons:x-mark" className="w-4 h-4 mr-2" />
          Batal
        </Button>

        <Button 
          onClick={handleComplete} 
          disabled={!isFormValid() || isLoading || totalLabels === 0}
        >
          {isLoading && <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />}
          <Icon icon="heroicons:eye" className="w-4 h-4 mr-2" />
          Lihat Preview ({totalLabels} label)
        </Button>
      </div>
    </div>
  );
};

export default QRPrintSettings;
