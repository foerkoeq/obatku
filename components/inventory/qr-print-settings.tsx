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
    paperSize: "A4" | "Letter";
    orientation: "portrait" | "landscape";
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
    paperSize: "A4",
    orientation: "portrait",
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
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon icon="heroicons:information-circle" className="w-5 h-5" />
            Ringkasan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{selectedMedicines.length}</div>
              <div className="text-sm text-muted-foreground">Item Dipilih</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalLabels}</div>
              <div className="text-sm text-muted-foreground">Total Label</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.ceil(totalLabels / 12)}
              </div>
              <div className="text-sm text-muted-foreground">Halaman</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Range Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon icon="heroicons:adjustments-horizontal" className="w-5 h-5" />
              Pengaturan Rentang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={rangeType} onValueChange={(value) => setRangeType(value as "all" | "date" | "id" | "custom")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Cetak semua item yang dipilih</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="date" id="date" />
                <Label htmlFor="date">Berdasarkan rentang tanggal masuk</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="id" id="id" />
                <Label htmlFor="id">Berdasarkan rentang ID obat</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">ID kustom (pisahkan dengan koma)</Label>
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

        {/* Print Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon icon="heroicons:printer" className="w-5 h-5" />
              Pengaturan Cetak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="labelsPerItem">Jumlah label per item</Label>
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

            <div className="space-y-3">
              <h4 className="font-medium">Informasi yang ditampilkan:</h4>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeItemInfo"
                  checked={printSettings.includeItemInfo}
                  onCheckedChange={(checked) => handlePrintSettingsChange("includeItemInfo", checked)}
                />
                <Label htmlFor="includeItemInfo">Info obat (nama, produsen, kandungan)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDates"
                  checked={printSettings.includeDates}
                  onCheckedChange={(checked) => handlePrintSettingsChange("includeDates", checked)}
                />
                <Label htmlFor="includeDates">Tanggal masuk & kadaluarsa</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeLocation"
                  checked={printSettings.includeLocation}
                  onCheckedChange={(checked) => handlePrintSettingsChange("includeLocation", checked)}
                />
                <Label htmlFor="includeLocation">Lokasi penyimpanan</Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Format kertas:</h4>
              
              <RadioGroup
                value={printSettings.paperSize}
                onValueChange={(value) => handlePrintSettingsChange("paperSize", value as "A4" | "Letter")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="A4" id="paperA4" />
                  <Label htmlFor="paperA4">A4 (21 x 29.7 cm)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Letter" id="paperLetter" />
                  <Label htmlFor="paperLetter">Letter (21.6 x 27.9 cm)</Label>
                </div>
              </RadioGroup>

              <RadioGroup
                value={printSettings.orientation}
                onValueChange={(value) => handlePrintSettingsChange("orientation", value as "portrait" | "landscape")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="portrait" id="portrait" />
                  <Label htmlFor="portrait">Portrait (vertikal)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="landscape" id="landscape" />
                  <Label htmlFor="landscape">Landscape (horizontal)</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
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
