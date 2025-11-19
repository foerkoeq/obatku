"use client";

import React, { useState } from "react";
import { Sprout, Plus, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export interface CommodityDosage {
  commodity: string;
  selected: boolean;
  dosageAmount: number;
  dosageUnit: string;
  landArea: number;
}

interface CommodityDosageManagerProps {
  commodities: CommodityDosage[];
  onChange: (commodities: CommodityDosage[]) => void;
  className?: string;
}

const defaultCommodities = [
  "Padi",
  "Jagung",
  "Cabai",
  "Melon",
  "Tembakau",
];

export const CommodityDosageManager: React.FC<CommodityDosageManagerProps> = ({
  commodities,
  onChange,
  className,
}) => {
  const [customCommodity, setCustomCommodity] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleCommodity = (commodity: string) => {
    const existingIndex = commodities.findIndex((c) => c.commodity === commodity);
    
    if (existingIndex >= 0) {
      // Toggle selection
      const updated = [...commodities];
      updated[existingIndex].selected = !updated[existingIndex].selected;
      onChange(updated);
    } else {
      // Add new commodity
      onChange([
        ...commodities,
        {
          commodity,
          selected: true,
          dosageAmount: 0,
          dosageUnit: "",
          landArea: 0,
        },
      ]);
    }
  };

  const updateDosage = (
    commodity: string,
    updates: Partial<Omit<CommodityDosage, "commodity">>
  ) => {
    onChange(
      commodities.map((c) =>
        c.commodity === commodity ? { ...c, ...updates } : c
      )
    );
  };

  const addCustomCommodity = () => {
    if (customCommodity.trim() && !commodities.find(c => c.commodity === customCommodity.trim())) {
      toggleCommodity(customCommodity.trim());
      setCustomCommodity("");
      setShowCustomInput(false);
    }
  };

  const selectedCommodities = commodities.filter((c) => c.selected);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sprout className="w-4 h-4" />
            Sasaran Komoditas
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Pilih komoditas yang menjadi sasaran (minimal 1)
          </p>
        </div>
        {selectedCommodities.length > 0 && (
          <div className="text-xs font-medium text-primary">
            {selectedCommodities.length} dipilih
          </div>
        )}
      </div>

      {/* Commodity Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {/* Default commodities */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {defaultCommodities.map((commodity) => {
                const commodityData = commodities.find((c) => c.commodity === commodity);
                const isSelected = commodityData?.selected || false;

                return (
                  <div
                    key={commodity}
                    className={cn(
                      "flex items-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer",
                      {
                        "border-primary bg-primary/5": isSelected,
                        "border-default-200 hover:border-primary/50": !isSelected,
                      }
                    )}
                    onClick={() => toggleCommodity(commodity)}
                  >
                    <Checkbox
                      id={`commodity-${commodity}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleCommodity(commodity)}
                      color="primary"
                    />
                    <Label
                      htmlFor={`commodity-${commodity}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {commodity}
                    </Label>
                  </div>
                );
              })}
            </div>

            {/* Custom commodities */}
            <div className="space-y-2">
              {commodities
                .filter((c) => !defaultCommodities.includes(c.commodity))
                .map((commodityData) => (
                  <div
                    key={`custom-${commodityData.commodity}`}
                    className={cn(
                      "flex items-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer",
                      {
                        "border-primary bg-primary/5": commodityData.selected,
                        "border-default-200 hover:border-primary/50": !commodityData.selected,
                      }
                    )}
                    onClick={() => toggleCommodity(commodityData.commodity)}
                  >
                    <Checkbox
                      id={`commodity-custom-${commodityData.commodity}`}
                      checked={commodityData.selected}
                      onCheckedChange={() => toggleCommodity(commodityData.commodity)}
                      color="primary"
                    />
                    <Label
                      htmlFor={`commodity-custom-${commodityData.commodity}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {commodityData.commodity}
                    </Label>
                  </div>
                ))}
            </div>

            {/* Add custom commodity */}
            {showCustomInput ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Nama komoditas lainnya..."
                  value={customCommodity}
                  onChange={(e) => setCustomCommodity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomCommodity();
                    }
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  onClick={addCustomCommodity}
                  size="sm"
                >
                  Tambah
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomCommodity("");
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Batal
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCustomInput(true)}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Komoditas Lainnya
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dosage Information for Selected Commodities */}
      {selectedCommodities.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">Informasi Dosis per Komoditas</h4>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Isi informasi dosis untuk setiap komoditas yang dipilih</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {selectedCommodities.map((commodityData) => (
            <Card key={commodityData.commodity} className="border-l-4 border-l-primary">
              <CardContent className="pt-4">
                <h5 className="text-sm font-semibold mb-3 text-primary">
                  {commodityData.commodity}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">
                      Jumlah Dosis *
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0"
                      value={commodityData.dosageAmount || ""}
                      onChange={(e) =>
                        updateDosage(commodityData.commodity, {
                          dosageAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">
                      Satuan Dosis *
                    </Label>
                    <Input
                      placeholder="Contoh: ml, gram, liter"
                      value={commodityData.dosageUnit}
                      onChange={(e) =>
                        updateDosage(commodityData.commodity, {
                          dosageUnit: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">
                      Luas Lahan (ha) *
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={commodityData.landArea || ""}
                      onChange={(e) =>
                        updateDosage(commodityData.commodity, {
                          landArea: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
