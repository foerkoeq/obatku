"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DrugInventory } from "@/lib/types/inventory";
import { QRPrintOptions } from "./qr-print-settings";

interface QRRangeConfiguratorProps {
  rangeType: "all" | "date" | "id" | "custom";
  selectedMedicines: DrugInventory[];
  value: QRPrintOptions["rangeSettings"];
  onChange: (settings: QRPrintOptions["rangeSettings"]) => void;
}

const QRRangeConfigurator: React.FC<QRRangeConfiguratorProps> = ({
  rangeType,
  selectedMedicines,
  value,
  onChange,
}) => {
  const handleDateFromChange = (dateString: string) => {
    onChange({
      ...value,
      dateFrom: dateString ? new Date(dateString) : undefined,
    });
  };

  const handleDateToChange = (dateString: string) => {
    onChange({
      ...value,
      dateTo: dateString ? new Date(dateString) : undefined,
    });
  };

  const handleIdFromChange = (idFrom: string) => {
    onChange({
      ...value,
      idFrom,
    });
  };

  const handleIdToChange = (idTo: string) => {
    onChange({
      ...value,
      idTo,
    });
  };

  const handleCustomIdsChange = (customIdsText: string) => {
    const customIds = customIdsText
      .split(",")
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    onChange({
      ...value,
      customIds,
    });
  };

  // Get available date range from selected medicines
  const getDateRange = () => {
    if (selectedMedicines.length === 0) return { min: "", max: "" };
    
    const dates = selectedMedicines.map(med => new Date(med.entryDate));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0],
    };
  };

  // Get available ID range from selected medicines
  const getIdRange = () => {
    if (selectedMedicines.length === 0) return { min: "", max: "" };
    
    const ids = selectedMedicines.map(med => med.id).sort();
    return {
      min: ids[0],
      max: ids[ids.length - 1],
    };
  };

  // Get filtered count based on current settings
  const getFilteredCount = () => {
    if (rangeType === "all") {
      return selectedMedicines.length;
    }
    
    if (rangeType === "date" && value.dateFrom && value.dateTo) {
      return selectedMedicines.filter(med => {
        const entryDate = new Date(med.entryDate);
        return entryDate >= value.dateFrom! && entryDate <= value.dateTo!;
      }).length;
    }
    
    if (rangeType === "id" && value.idFrom && value.idTo) {
      return selectedMedicines.filter(med => {
        return med.id >= value.idFrom! && med.id <= value.idTo!;
      }).length;
    }
    
    if (rangeType === "custom" && value.customIds) {
      return value.customIds.filter(id => 
        selectedMedicines.some(med => med.id === id)
      ).length;
    }
    
    return 0;
  };

  if (rangeType === "all") {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Semua {selectedMedicines.length} item yang dipilih akan dicetak.
          </p>
        </CardContent>
      </Card>
    );
  }

  const dateRange = getDateRange();
  const idRange = getIdRange();
  const filteredCount = getFilteredCount();

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4 space-y-4">
        {rangeType === "date" && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="dateFrom">Tanggal Masuk Dari</Label>
              <Input
                id="dateFrom"
                type="date"
                min={dateRange.min}
                max={dateRange.max}
                value={value.dateFrom ? value.dateFrom.toISOString().split('T')[0] : ""}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Tanggal Masuk Sampai</Label>
              <Input
                id="dateTo"
                type="date"
                min={dateRange.min}
                max={dateRange.max}
                value={value.dateTo ? value.dateTo.toISOString().split('T')[0] : ""}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Rentang tersedia: {dateRange.min} s/d {dateRange.max}
            </p>
            {filteredCount > 0 && (
              <p className="text-sm font-medium text-primary">
                {filteredCount} item sesuai kriteria tanggal
              </p>
            )}
          </div>
        )}

        {rangeType === "id" && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="idFrom">ID Obat Dari</Label>
              <Input
                id="idFrom"
                type="text"
                placeholder="Contoh: MED001"
                value={value.idFrom || ""}
                onChange={(e) => handleIdFromChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="idTo">ID Obat Sampai</Label>
              <Input
                id="idTo"
                type="text"
                placeholder="Contoh: MED010"
                value={value.idTo || ""}
                onChange={(e) => handleIdToChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Rentang tersedia: {idRange.min} s/d {idRange.max}
            </p>
            {filteredCount > 0 && (
              <p className="text-sm font-medium text-primary">
                {filteredCount} item sesuai kriteria ID
              </p>
            )}
          </div>
        )}

        {rangeType === "custom" && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="customIds">ID Obat Kustom</Label>
              <Textarea
                id="customIds"
                placeholder="Masukkan ID obat, pisahkan dengan koma. Contoh: MED001, MED003, MED007"
                rows={3}
                value={value.customIds ? value.customIds.join(", ") : ""}
                onChange={(e) => handleCustomIdsChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                ID tersedia: {selectedMedicines.map(med => med.id).join(", ")}
              </p>
              {filteredCount > 0 && (
                <p className="text-sm font-medium text-primary">
                  {filteredCount} item valid dari {value.customIds?.length || 0} ID yang dimasukkan
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRRangeConfigurator;
