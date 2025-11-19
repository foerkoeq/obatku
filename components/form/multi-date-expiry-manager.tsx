"use client";

import React from "react";
import { Plus, Trash2, Calendar, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface ExpiryBatch {
  id: string;
  expiryDate: Date | null;
  quantity: number;
  unit: string;
  largePackQuantity?: number;
  largePackUnit?: string;
  itemsPerLargePack?: number;
  pricePerUnit?: number;
}

interface MultiDateExpiryManagerProps {
  batches: ExpiryBatch[];
  onChange: (batches: ExpiryBatch[]) => void;
  unitOptions: string[];
  largePackUnitOptions: string[];
  onAddUnit?: (unit: string) => void;
  onAddLargePackUnit?: (unit: string) => void;
  className?: string;
}

export const MultiDateExpiryManager: React.FC<MultiDateExpiryManagerProps> = ({
  batches,
  onChange,
  unitOptions,
  largePackUnitOptions,
  onAddUnit,
  onAddLargePackUnit,
  className,
}) => {
  const addBatch = () => {
    const newBatch: ExpiryBatch = {
      id: `batch-${Date.now()}`,
      expiryDate: null,
      quantity: 0,
      unit: "",
      largePackQuantity: 0,
      largePackUnit: "",
      itemsPerLargePack: 1,
      pricePerUnit: 0,
    };
    onChange([...batches, newBatch]);
  };

  const removeBatch = (id: string) => {
    if (batches.length > 1) {
      onChange(batches.filter((batch) => batch.id !== id));
    }
  };

  const updateBatch = (id: string, updates: Partial<ExpiryBatch>) => {
    onChange(
      batches.map((batch) => (batch.id === id ? { ...batch, ...updates } : batch))
    );
  };

  const getTotalQuantity = () => {
    return batches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with total */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <PackageOpen className="w-4 h-4" />
            Batch & Tanggal Kadaluarsa
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Total Stok: <span className="font-semibold text-primary">{getTotalQuantity()}</span> unit
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              onClick={addBatch}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Batch
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tambah batch baru untuk tanggal kadaluarsa berbeda</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Batches */}
      <div className="space-y-4">
        {batches.map((batch, index) => (
          <Card key={batch.id} className="relative">
            <CardContent className="pt-6">
              {/* Batch number indicator */}
              <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Batch #{index + 1}
              </div>

              {/* Delete button */}
              {batches.length > 1 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeBatch(batch.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Hapus batch ini</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Quantity & Unit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    Jumlah Stok Satuan *
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={batch.quantity || ""}
                    onChange={(e) =>
                      updateBatch(batch.id, {
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Satuan *</Label>
                  <Select
                    value={batch.unit}
                    onValueChange={(value) => updateBatch(batch.id, { unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Harga per Satuan</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={batch.pricePerUnit || ""}
                    onChange={(e) =>
                      updateBatch(batch.id, {
                        pricePerUnit: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              {/* Large Pack Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-xs">Jumlah Kemasan Besar</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={batch.largePackQuantity || ""}
                    onChange={(e) =>
                      updateBatch(batch.id, {
                        largePackQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Satuan Kemasan Besar</Label>
                  <Select
                    value={batch.largePackUnit || ""}
                    onValueChange={(value) =>
                      updateBatch(batch.id, { largePackUnit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {largePackUnitOptions.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Jumlah Satuan per Kemasan</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={batch.itemsPerLargePack || ""}
                    onChange={(e) =>
                      updateBatch(batch.id, {
                        itemsPerLargePack: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Tanggal Kadaluarsa *
                </Label>
                <DatePicker
                  value={batch.expiryDate || undefined}
                  onChange={(date) => updateBatch(batch.id, { expiryDate: date || null })}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
