"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Sprout, Bug, Info, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KOMODITAS_GROUPED, type Komoditas } from "@/lib/data/komoditas-mock";
import { getOPTByKomoditas } from "@/lib/data/opt-mock";

export interface CommodityOPTDosage {
  optId: string;
  optName: string;
  customOptName?: string;
  dosageAmount: number;
  dosageUnit: string;
  landArea: number;
}

export interface CommodityDosage {
  commodityId: string;
  commodity: string;
  commodityType: Komoditas["jenis"];
  selected: boolean;
  optDosages: CommodityOPTDosage[];
}

interface CommodityDosageManagerProps {
  commodities: CommodityDosage[];
  onChange: (commodities: CommodityDosage[]) => void;
  className?: string;
}

const ALL_COMMODITIES = Object.values(KOMODITAS_GROUPED).flat();
const COMMODITY_BY_ID = new Map(ALL_COMMODITIES.map((item) => [item.id, item]));
const COMMODITY_BY_NAME = new Map(ALL_COMMODITIES.map((item) => [item.nama, item]));

export const CommodityDosageManager: React.FC<CommodityDosageManagerProps> = ({
  commodities,
  onChange,
  className,
}) => {
  const [optSearch, setOptSearch] = useState<Record<string, string>>({});
  const [localNumericValues, setLocalNumericValues] = useState<Record<string, string>>({});

  const normalizedCommodities = useMemo<CommodityDosage[]>(() => {
    const seen = new Set<string>();

    return commodities
      .map((item) => {
        const fromId = item.commodityId ? COMMODITY_BY_ID.get(item.commodityId) : undefined;
        const fromName = COMMODITY_BY_NAME.get(item.commodity);
        const commodityData = fromId ?? fromName;

        if (!commodityData || seen.has(commodityData.id)) {
          return null;
        }

        seen.add(commodityData.id);

        return {
          commodityId: commodityData.id,
          commodity: commodityData.nama,
          commodityType: commodityData.jenis,
          selected: item.selected ?? true,
          optDosages: Array.isArray(item.optDosages)
            ? item.optDosages.filter((opt) => opt.optId && opt.optName)
            : [],
        };
      })
      .filter((item): item is CommodityDosage => Boolean(item));
  }, [commodities]);

  const selectedCommodities = useMemo(
    () => normalizedCommodities.filter((item) => item.selected),
    [normalizedCommodities]
  );

  const updateCommodities = useCallback(
    (next: CommodityDosage[]) => {
      onChange(next.filter((item) => item.selected));
    },
    [onChange]
  );

  const toggleCommodity = useCallback(
    (commodityData: Komoditas) => {
      const exists = normalizedCommodities.some((item) => item.commodityId === commodityData.id);

      if (exists) {
        updateCommodities(
          normalizedCommodities.filter((item) => item.commodityId !== commodityData.id)
        );
        return;
      }

      updateCommodities([
        ...normalizedCommodities,
        {
          commodityId: commodityData.id,
          commodity: commodityData.nama,
          commodityType: commodityData.jenis,
          selected: true,
          optDosages: [],
        },
      ]);
    },
    [normalizedCommodities, updateCommodities]
  );

  const toggleOPT = useCallback(
    (commodityId: string, optId: string, optName: string) => {
      const next = normalizedCommodities.map((item) => {
        if (item.commodityId !== commodityId) return item;

        const exists = item.optDosages.some((opt) => opt.optId === optId);
        return {
          ...item,
          optDosages: exists
            ? item.optDosages.filter((opt) => opt.optId !== optId)
            : [
                ...item.optDosages,
                {
                  optId,
                  optName,
                  dosageAmount: 0,
                  dosageUnit: "",
                  landArea: 0,
                },
              ],
        };
      });

      updateCommodities(next);
    },
    [normalizedCommodities, updateCommodities]
  );

  const updateOPTDosage = useCallback(
    (
      commodityId: string,
      optId: string,
      updates: Partial<CommodityOPTDosage>
    ) => {
      const next = normalizedCommodities.map((item) => {
        if (item.commodityId !== commodityId) return item;

        return {
          ...item,
          optDosages: item.optDosages.map((opt) =>
            opt.optId === optId ? { ...opt, ...updates } : opt
          ),
        };
      });

      updateCommodities(next);
    },
    [normalizedCommodities, updateCommodities]
  );

  const getLocalKey = (
    commodityId: string,
    optId: string,
    field: "dosageAmount" | "landArea"
  ) => `${commodityId}__${optId}__${field}`;

  const getNumericDisplayValue = (
    commodityId: string,
    optId: string,
    field: "dosageAmount" | "landArea",
    numericValue: number
  ): string => {
    const key = getLocalKey(commodityId, optId, field);
    if (localNumericValues[key] !== undefined) return localNumericValues[key];
    return numericValue > 0 ? String(numericValue) : "";
  };

  const handleNumericChange = (
    commodityId: string,
    optId: string,
    field: "dosageAmount" | "landArea",
    rawValue: string
  ) => {
    const key = getLocalKey(commodityId, optId, field);
    setLocalNumericValues((prev) => ({ ...prev, [key]: rawValue }));

    const numVal = parseFloat(rawValue.replace(",", "."));
    if (!isNaN(numVal)) {
      updateOPTDosage(commodityId, optId, { [field]: numVal });
    }
  };

  const handleNumericBlur = (
    commodityId: string,
    optId: string,
    field: "dosageAmount" | "landArea",
    rawValue: string
  ) => {
    const key = getLocalKey(commodityId, optId, field);
    const numVal = parseFloat(rawValue.replace(",", "."));

    if (isNaN(numVal) || rawValue.trim() === "") {
      updateOPTDosage(commodityId, optId, { [field]: 0 });
      setLocalNumericValues((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    updateOPTDosage(commodityId, optId, { [field]: numVal });
    setLocalNumericValues((prev) => ({ ...prev, [key]: String(numVal) }));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sprout className="w-4 h-4" />
            Sasaran Komoditas
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Pilih komoditas sasaran, lalu tentukan OPT dan dosis per OPT
          </p>
        </div>
        {selectedCommodities.length > 0 && (
          <div className="text-xs font-medium text-primary">
            {selectedCommodities.length} dipilih
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Object.entries(KOMODITAS_GROUPED).map(([kategori, items]) => (
              <div key={kategori} className="space-y-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {kategori}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {items.map((commodityData) => {
                    const isSelected = selectedCommodities.some(
                      (item) => item.commodityId === commodityData.id
                    );

                    return (
                      <label
                        key={commodityData.id}
                        htmlFor={`commodity-${commodityData.id}`}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-2.5 py-2 cursor-pointer transition-all text-xs sm:text-sm",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        <Checkbox
                          id={`commodity-${commodityData.id}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleCommodity(commodityData)}
                          color="primary"
                        />
                        <span className="font-medium leading-tight">{commodityData.nama}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedCommodities.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">OPT dan Dosis per Komoditas</h4>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Pilih satu atau lebih OPT untuk tiap komoditas, lalu isi dosisnya</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {selectedCommodities.map((commodityData) => {
            const query = optSearch[commodityData.commodityId]?.trim().toLowerCase() ?? "";
            const filteredOpt = getOPTByKomoditas(commodityData.commodity).filter((opt) => {
              if (!query) return true;
              return (
                opt.nama.toLowerCase().includes(query) ||
                opt.kategori.toLowerCase().includes(query)
              );
            });

            return (
              <Card key={commodityData.commodityId} className="border-l-4 border-l-primary">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h5 className="text-sm font-semibold text-primary">{commodityData.commodity}</h5>
                    <Badge color="info" className="text-[10px]">
                      {commodityData.optDosages.length} OPT dipilih
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5 text-red-500" />
                      Pilih Jenis OPT *
                    </Label>

                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder={`Cari OPT untuk ${commodityData.commodity}...`}
                        value={optSearch[commodityData.commodityId] ?? ""}
                        onChange={(e) =>
                          setOptSearch((prev) => ({
                            ...prev,
                            [commodityData.commodityId]: e.target.value,
                          }))
                        }
                        className="h-8 pl-8 text-xs"
                      />
                    </div>

                    <div className="max-h-44 overflow-y-auto rounded-lg border p-1.5 space-y-1">
                      {filteredOpt.map((opt) => {
                        const selected = commodityData.optDosages.some(
                          (selectedOpt) => selectedOpt.optId === opt.id
                        );

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleOPT(commodityData.commodityId, opt.id, opt.nama)}
                            className={cn(
                              "w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors border border-transparent",
                              selected
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "hover:bg-primary/5 hover:text-primary"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">{opt.nama}</span>
                              <Badge
                                color={
                                  opt.kategori === "Hama"
                                    ? "warning"
                                    : opt.kategori === "Penyakit"
                                      ? "destructive"
                                      : "info"
                                }
                                className="text-[9px] px-1 py-0"
                              >
                                {opt.kategori}
                              </Badge>
                            </div>
                          </button>
                        );
                      })}

                      {filteredOpt.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          OPT tidak ditemukan
                        </p>
                      )}
                    </div>
                  </div>

                  {commodityData.optDosages.length > 0 && (
                    <div className="space-y-3">
                      {commodityData.optDosages.map((opt) => (
                        <div key={opt.optId} className="rounded-lg border p-3 space-y-3 bg-muted/20">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-primary">{opt.optName}</span>
                            <button
                              type="button"
                              onClick={() =>
                                toggleOPT(commodityData.commodityId, opt.optId, opt.optName)
                              }
                              className="text-[11px] text-muted-foreground hover:text-destructive"
                            >
                              Hapus
                            </button>
                          </div>

                          {opt.optName === "Lainnya" && (
                            <div className="space-y-1.5">
                              <Label className="text-xs">Nama OPT Lainnya *</Label>
                              <Input
                                placeholder="Masukkan nama OPT"
                                value={opt.customOptName ?? ""}
                                onChange={(e) =>
                                  updateOPTDosage(commodityData.commodityId, opt.optId, {
                                    customOptName: e.target.value,
                                  })
                                }
                                className="h-9 text-sm"
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Jumlah Dosis *</Label>
                              <Input
                                type="text"
                                inputMode="decimal"
                                placeholder="Contoh: 2.5"
                                value={getNumericDisplayValue(
                                  commodityData.commodityId,
                                  opt.optId,
                                  "dosageAmount",
                                  opt.dosageAmount
                                )}
                                onChange={(e) =>
                                  handleNumericChange(
                                    commodityData.commodityId,
                                    opt.optId,
                                    "dosageAmount",
                                    e.target.value
                                  )
                                }
                                onBlur={(e) =>
                                  handleNumericBlur(
                                    commodityData.commodityId,
                                    opt.optId,
                                    "dosageAmount",
                                    e.target.value
                                  )
                                }
                                className="h-9 text-sm"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs">Satuan Dosis *</Label>
                              <Input
                                placeholder="Contoh: ml/liter, gr/liter, bungkus"
                                value={opt.dosageUnit}
                                onChange={(e) =>
                                  updateOPTDosage(commodityData.commodityId, opt.optId, {
                                    dosageUnit: e.target.value,
                                  })
                                }
                                className="h-9 text-sm"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs">Efektif Luas Lahan (ha) *</Label>
                              <Input
                                type="text"
                                inputMode="decimal"
                                placeholder="Contoh: 0.25"
                                value={getNumericDisplayValue(
                                  commodityData.commodityId,
                                  opt.optId,
                                  "landArea",
                                  opt.landArea
                                )}
                                onChange={(e) =>
                                  handleNumericChange(
                                    commodityData.commodityId,
                                    opt.optId,
                                    "landArea",
                                    e.target.value
                                  )
                                }
                                onBlur={(e) =>
                                  handleNumericBlur(
                                    commodityData.commodityId,
                                    opt.optId,
                                    "landArea",
                                    e.target.value
                                  )
                                }
                                className="h-9 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
