"use client";

import React, { useState, useCallback, useMemo } from "react";
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

  // Filter out empty or invalid commodities for display
  // This ensures empty commodities don't show up as checkboxes
  const validCommodities = useMemo(
    () => commodities.filter((c) => c.commodity && c.commodity.trim() !== ""),
    [commodities]
  );

  // Memoized toggle function to prevent infinite loops
  const toggleCommodity = useCallback(
    (commodity: string) => {
      if (!commodity || commodity.trim() === "") return;

      const trimmedCommodity = commodity.trim();
      const existingIndex = validCommodities.findIndex((c) => c.commodity === trimmedCommodity);

      if (existingIndex >= 0) {
        // Toggle selection - only update if state actually changes
        const currentCommodity = validCommodities[existingIndex];
        const newSelectedState = !currentCommodity.selected;
        
        // Prevent unnecessary updates if state is already what we want
        if (currentCommodity.selected === newSelectedState) return;

        const updated = validCommodities.map((c, idx) =>
          idx === existingIndex ? { ...c, selected: newSelectedState } : c
        );
        onChange(updated);
      } else {
        // Add new commodity - check if it doesn't already exist
        const alreadyExists = validCommodities.some((c) => c.commodity === trimmedCommodity);
        if (alreadyExists) return;

        onChange([
          ...validCommodities,
          {
            commodity: trimmedCommodity,
            selected: true,
            dosageAmount: 0,
            dosageUnit: "",
            landArea: 0,
          },
        ]);
      }
    },
    [validCommodities, onChange]
  );

  // Memoized update dosage function
  const updateDosage = useCallback(
    (
      commodity: string,
      updates: Partial<Omit<CommodityDosage, "commodity">>
    ) => {
      onChange(
        validCommodities.map((c) =>
          c.commodity === commodity ? { ...c, ...updates } : c
        )
      );
    },
    [validCommodities, onChange]
  );

  // Memoized add custom commodity function
  const addCustomCommodity = useCallback(() => {
    const trimmed = customCommodity.trim();
    if (trimmed && !validCommodities.find((c) => c.commodity === trimmed)) {
      toggleCommodity(trimmed);
      setCustomCommodity("");
      setShowCustomInput(false);
    }
  }, [customCommodity, validCommodities, toggleCommodity]);

  // Memoized selected commodities
  const selectedCommodities = useMemo(
    () => validCommodities.filter((c) => c.selected),
    [validCommodities]
  );

  // Memoized custom commodities (non-default)
  const customCommodities = useMemo(
    () =>
      validCommodities.filter((c) => !defaultCommodities.includes(c.commodity)),
    [validCommodities]
  );

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
          <div className="space-y-4">
            {/* Default commodities */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {defaultCommodities.map((commodity) => {
                const commodityData = validCommodities.find((c) => c.commodity === commodity);
                const isSelected = commodityData?.selected || false;

                return (
                  <div
                    key={commodity}
                    className={cn(
                      "flex items-center space-x-2 p-3 rounded-lg border-2 transition-all",
                      {
                        "border-primary bg-primary/5": isSelected,
                        "border-default-200 hover:border-primary/50": !isSelected,
                      }
                    )}
                  >
                    <Checkbox
                      id={`commodity-${commodity}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleCommodity(commodity)}
                      color="primary"
                    />
                    <Label
                      htmlFor={`commodity-${commodity}`}
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {commodity}
                    </Label>
                  </div>
                );
              })}
            </div>

            {/* Custom commodities - only show if there are any */}
            {customCommodities.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium mb-2">
                  Komoditas Tambahan:
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {customCommodities.map((commodityData) => (
                    <div
                      key={`custom-${commodityData.commodity}`}
                      className={cn(
                        "flex items-center space-x-2 p-3 rounded-lg border-2 transition-all",
                        {
                          "border-primary bg-primary/5": commodityData.selected,
                          "border-default-200 hover:border-primary/50": !commodityData.selected,
                        }
                      )}
                    >
                      <Checkbox
                        id={`commodity-custom-${commodityData.commodity}`}
                        checked={commodityData.selected}
                        onCheckedChange={() => toggleCommodity(commodityData.commodity)}
                        color="primary"
                      />
                      <Label
                        htmlFor={`commodity-custom-${commodityData.commodity}`}
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {commodityData.commodity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add custom commodity - unified button */}
            {showCustomInput ? (
              <div className="flex gap-2 pt-2 border-t">
                <Input
                  placeholder="Nama komoditas lainnya..."
                  value={customCommodity}
                  onChange={(e) => setCustomCommodity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomCommodity();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      setShowCustomInput(false);
                      setCustomCommodity("");
                    }
                  }}
                  autoFocus
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addCustomCommodity}
                  size="sm"
                  disabled={!customCommodity.trim()}
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
