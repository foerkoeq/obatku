// # START OF Step Detail Poktan - Wizard step 2 for Pengajuan ke Dinas
// Purpose: Show poktan list with farming details + medicine selection (e-commerce style)
// Features: Expandable medicine cards, auto-conversion satuan besar/kecil, BPP/OPT badges
// Dependencies: ApprovalItem, MedicineStockItem, ScrollArea

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ApprovalItem,
  ApprovalPoktanDetail,
  SelectedMedicineInput,
  MedicineSelectionState,
} from "@/lib/types/approval";
import { MedicineStockItem } from "@/lib/types/transaction-list";
import { mockMedicineStock } from "@/lib/data/transaction-list-mock";

// ─── Types ───

interface StepDetailPoktanProps {
  item: ApprovalItem;
  selections: MedicineSelectionState[];
  onSelectionsChange: (selections: MedicineSelectionState[]) => void;
}

// ─── Helper: Get medicines relevant to poktan's OPT ───

const getMedicinesForPoktan = (
  poktan: ApprovalPoktanDetail,
  bppPreferences: string[]
): {
  bppMeds: MedicineStockItem[];
  optMeds: MedicineStockItem[];
  otherMeds: MedicineStockItem[];
} => {
  const bppMeds: MedicineStockItem[] = [];
  const optMeds: MedicineStockItem[] = [];
  const otherMeds: MedicineStockItem[] = [];
  const bppSet = new Set(bppPreferences.map((n) => n.toLowerCase()));
  const usedIds = new Set<string>();

  // 1. BPP preferences
  mockMedicineStock.forEach((med) => {
    if (bppSet.has(med.nama.toLowerCase())) {
      bppMeds.push(med);
      usedIds.add(med.id);
    }
  });

  // 2. OPT recommendations (not already in BPP)
  mockMedicineStock.forEach((med) => {
    if (usedIds.has(med.id)) return;
    const isOptMatch = med.targetOpt.some((target) =>
      poktan.opt.some(
        (o) =>
          target.toLowerCase().includes(o.toLowerCase()) ||
          o.toLowerCase().includes(target.toLowerCase())
      )
    );
    if (isOptMatch) {
      optMeds.push(med);
      usedIds.add(med.id);
    }
  });

  // 3. Other available medicines
  mockMedicineStock.forEach((med) => {
    if (!usedIds.has(med.id) && med.stokBesar > 0) {
      otherMeds.push(med);
    }
  });

  return { bppMeds, optMeds, otherMeds };
};

// ─── Medicine Card Component ───

const MedicineCard: React.FC<{
  med: MedicineStockItem;
  tag?: 'bpp' | 'opt';
  selected?: SelectedMedicineInput;
  onSelect: (med: MedicineStockItem) => void;
  onDeselect: (medId: string) => void;
  onQuantityChange: (medId: string, field: 'jumlahBesar' | 'jumlahKecil', value: number) => void;
}> = ({ med, tag, selected, onSelect, onDeselect, onQuantityChange }) => {
  const isSelected = !!selected;
  const isOutOfStock = med.stokBesar <= 0;

  // Recommendation: ~ 2 satuan besar per 1 Ha affected area (simplified heuristic)
  const rekBesar = Math.min(2, med.stokBesar);
  const rekKecil = rekBesar * med.isiPerSatuanBesar;

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-3 transition-all duration-200",
        isSelected
          ? "border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm"
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50",
        isOutOfStock && "opacity-50 pointer-events-none",
        !isSelected && !isOutOfStock && "hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer"
      )}
      onClick={() => !isSelected && !isOutOfStock && onSelect(med)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {med.nama}
            </span>
            {tag === 'bpp' && (
              <Badge className="text-[9px] px-1.5 py-0 bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border-0">
                <Icon icon="heroicons:star-mini" className="w-2.5 h-2.5 mr-0.5" />
                Preferensi BPP
              </Badge>
            )}
            {tag === 'opt' && (
              <Badge className="text-[9px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300 border-0">
                <Icon icon="heroicons:shield-check-mini" className="w-2.5 h-2.5 mr-0.5" />
                Rekomendasi OPT
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{med.bahanAktif}</p>
        </div>
        {isSelected && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
            onClick={(e) => {
              e.stopPropagation();
              onDeselect(med.id);
            }}
          >
            <Icon icon="heroicons:x-mark" className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Stock info */}
      <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mb-2">
        <span className="flex items-center gap-1">
          <Icon icon="heroicons:cube-mini" className="w-3 h-3" />
          Stok: <strong className="text-gray-700 dark:text-gray-300">{med.stokBesar} {med.satuanBesar}</strong>
        </span>
        <span>({med.stokKecil.toLocaleString()} {med.satuanKecil})</span>
      </div>

      {/* Target OPT */}
      <div className="flex flex-wrap gap-1 mb-2">
        {med.targetOpt.slice(0, 3).map((opt) => (
          <span
            key={opt}
            className="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/40"
          >
            {opt}
          </span>
        ))}
        {med.targetOpt.length > 3 && (
          <span className="text-[10px] text-gray-400">+{med.targetOpt.length - 3}</span>
        )}
      </div>

      {/* Quantity inputs (shown when selected) */}
      {isSelected && selected && (
        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Satuan Besar */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                Jumlah ({med.satuanBesar})
              </label>
              <Input
                type="number"
                min={0}
                max={med.stokBesar}
                value={selected.jumlahBesar || ''}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(med.stokBesar, Number(e.target.value) || 0));
                  onQuantityChange(med.id, 'jumlahBesar', val);
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-9 text-sm"
                placeholder="0"
              />
              <p className="text-[10px] text-blue-500 dark:text-blue-400">
                Rekomendasi: {rekBesar} {med.satuanBesar}
              </p>
            </div>

            {/* Satuan Kecil */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                Jumlah ({med.satuanKecil})
              </label>
              <Input
                type="number"
                min={0}
                max={med.stokKecil}
                value={selected.jumlahKecil || ''}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(med.stokKecil, Number(e.target.value) || 0));
                  onQuantityChange(med.id, 'jumlahKecil', val);
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-9 text-sm"
                placeholder="0"
              />
              <p className="text-[10px] text-blue-500 dark:text-blue-400">
                Rekomendasi: {rekKecil.toLocaleString()} {med.satuanKecil}
              </p>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <Icon icon="heroicons:information-circle-mini" className="w-3 h-3" />
            1 {med.satuanBesar} = {med.isiPerSatuanBesar.toLocaleString()} {med.satuanKecil} (otomatis terkonversi)
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Poktan Section Component ───

const PoktanSection: React.FC<{
  poktan: ApprovalPoktanDetail;
  index: number;
  bppPreferences: string[];
  selection: MedicineSelectionState;
  onSelectionChange: (sel: MedicineSelectionState) => void;
}> = ({ poktan, index, bppPreferences, selection, onSelectionChange }) => {
  const [expanded, setExpanded] = useState(false);

  const { bppMeds, optMeds, otherMeds } = useMemo(
    () => getMedicinesForPoktan(poktan, bppPreferences),
    [poktan, bppPreferences]
  );

  const handleSelect = useCallback(
    (med: MedicineStockItem) => {
      const exists = selection.selectedMedicines.find((s) => s.medicineId === med.id);
      if (exists) return;
      onSelectionChange({
        ...selection,
        selectedMedicines: [
          ...selection.selectedMedicines,
          {
            medicineId: med.id,
            nama: med.nama,
            bahanAktif: med.bahanAktif,
            jumlahBesar: 0,
            satuanBesar: med.satuanBesar,
            jumlahKecil: 0,
            satuanKecil: med.satuanKecil,
            isiPerSatuanBesar: med.isiPerSatuanBesar,
            maxBesar: med.stokBesar,
            maxKecil: med.stokKecil,
          },
        ],
      });
    },
    [selection, onSelectionChange]
  );

  const handleDeselect = useCallback(
    (medId: string) => {
      onSelectionChange({
        ...selection,
        selectedMedicines: selection.selectedMedicines.filter(
          (s) => s.medicineId !== medId
        ),
      });
    },
    [selection, onSelectionChange]
  );

  const handleQuantityChange = useCallback(
    (medId: string, field: 'jumlahBesar' | 'jumlahKecil', value: number) => {
      onSelectionChange({
        ...selection,
        selectedMedicines: selection.selectedMedicines.map((s) => {
          if (s.medicineId !== medId) return s;
          if (field === 'jumlahBesar') {
            return {
              ...s,
              jumlahBesar: value,
              jumlahKecil: value * s.isiPerSatuanBesar,
            };
          } else {
            return {
              ...s,
              jumlahKecil: value,
              jumlahBesar: Math.floor(value / s.isiPerSatuanBesar),
            };
          }
        }),
      });
    },
    [selection, onSelectionChange]
  );

  const selectedCount = selection.selectedMedicines.length;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Poktan Header */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[11px] font-bold text-blue-700 dark:text-blue-300">
              {index + 1}
            </span>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {poktan.nama}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Ketua: {poktan.ketua}
              </p>
            </div>
          </div>
          {selectedCount > 0 && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border-0 text-[10px]">
              {selectedCount} obat dipilih
            </Badge>
          )}
        </div>

        {/* Poktan info grid */}
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="text-[11px]">
            <span className="text-gray-500 dark:text-gray-400">Komoditas</span>
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {poktan.komoditas.map((k) => (
                <Badge key={k} className="text-[10px] px-1 py-0 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  {k}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-[11px]">
            <span className="text-gray-500 dark:text-gray-400">Luas Serangan</span>
            <p className="font-medium text-red-600 dark:text-red-400">{poktan.luasTerserang} Ha</p>
          </div>
          <div className="text-[11px]">
            <span className="text-gray-500 dark:text-gray-400">Luas Waspada</span>
            <p className="font-medium text-amber-600 dark:text-amber-400">{poktan.luasWaspada} Ha</p>
          </div>
          <div className="text-[11px]">
            <span className="text-gray-500 dark:text-gray-400">OPT</span>
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {poktan.opt.map((o) => (
                <Badge
                  key={o}
                  className="text-[10px] px-1 py-0 bg-transparent border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400"
                >
                  {o}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Selection Toggle */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "w-full flex items-center justify-between p-3 text-sm font-medium",
            "text-gray-700 dark:text-gray-300",
            "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          )}
        >
          <span className="flex items-center gap-2">
            <Icon icon="heroicons:beaker" className="w-4 h-4 text-green-600 dark:text-green-400" />
            Pilih Obat untuk Poktan ini
            {selectedCount > 0 && (
              <span className="text-xs text-blue-600 dark:text-blue-400">
                ({selectedCount} terpilih)
              </span>
            )}
          </span>
          <Icon
            icon={expanded ? "heroicons:chevron-up" : "heroicons:chevron-down"}
            className="w-4 h-4"
          />
        </button>

        {/* Medicine Cards */}
        {expanded && (
          <div className="p-3 pt-0 space-y-4">
            {/* BPP Preferences */}
            {bppMeds.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Icon icon="heroicons:star" className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Preferensi BPP
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bppMeds.map((med) => (
                    <MedicineCard
                      key={med.id}
                      med={med}
                      tag="bpp"
                      selected={selection.selectedMedicines.find(
                        (s) => s.medicineId === med.id
                      )}
                      onSelect={handleSelect}
                      onDeselect={handleDeselect}
                      onQuantityChange={handleQuantityChange}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* OPT Recommendations */}
            {optMeds.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Icon icon="heroicons:shield-check" className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-[11px] font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider">
                    Rekomendasi Berdasarkan OPT
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {optMeds.map((med) => (
                    <MedicineCard
                      key={med.id}
                      med={med}
                      tag="opt"
                      selected={selection.selectedMedicines.find(
                        (s) => s.medicineId === med.id
                      )}
                      onSelect={handleSelect}
                      onDeselect={handleDeselect}
                      onQuantityChange={handleQuantityChange}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other medicines (collapsible) */}
            {otherMeds.length > 0 && (
              <OtherMedicinesSection
                medicines={otherMeds}
                selection={selection}
                onSelect={handleSelect}
                onDeselect={handleDeselect}
                onQuantityChange={handleQuantityChange}
              />
            )}

            {bppMeds.length === 0 && optMeds.length === 0 && otherMeds.length === 0 && (
              <div className="text-center py-6 text-sm text-gray-400">
                <Icon icon="heroicons:inbox" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Tidak ada obat tersedia
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Other Medicines (collapsible section) ───

const OtherMedicinesSection: React.FC<{
  medicines: MedicineStockItem[];
  selection: MedicineSelectionState;
  onSelect: (med: MedicineStockItem) => void;
  onDeselect: (medId: string) => void;
  onQuantityChange: (medId: string, field: 'jumlahBesar' | 'jumlahKecil', value: number) => void;
}> = ({ medicines, selection, onSelect, onDeselect, onQuantityChange }) => {
  const [showOther, setShowOther] = useState(false);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setShowOther(!showOther)}
        className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <Icon icon="heroicons:ellipsis-horizontal-circle" className="w-3.5 h-3.5" />
        Obat Lainnya ({medicines.length})
        <Icon
          icon={showOther ? "heroicons:chevron-up-mini" : "heroicons:chevron-down-mini"}
          className="w-3 h-3"
        />
      </button>
      {showOther && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {medicines.map((med) => (
            <MedicineCard
              key={med.id}
              med={med}
              selected={selection.selectedMedicines.find(
                (s) => s.medicineId === med.id
              )}
              onSelect={onSelect}
              onDeselect={onDeselect}
              onQuantityChange={onQuantityChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───

const StepDetailPoktan: React.FC<StepDetailPoktanProps> = ({
  item,
  selections,
  onSelectionsChange,
}) => {
  const handleSelectionChange = useCallback(
    (poktanId: string, newSel: MedicineSelectionState) => {
      const newSelections = selections.map((s) =>
        s.poktanId === poktanId ? newSel : s
      );
      onSelectionsChange(newSelections);
    },
    [selections, onSelectionsChange]
  );

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-2 pb-4">
        {/* Summary banner */}
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-3 border border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center gap-2 text-sm">
            <Icon icon="heroicons:clipboard-document-list" className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-800 dark:text-blue-200">
              {item.poktanList.length} Poktan — Pilih obat untuk masing-masing
            </span>
          </div>
          <p className="text-[11px] text-blue-600/70 dark:text-blue-400/70 mt-1 ml-7">
            Klik obat untuk memilih, isi jumlah satuan besar atau kecil (otomatis terkonversi)
          </p>
        </div>

        {/* Poktan list */}
        {item.poktanList.map((poktan, idx) => {
          const sel = selections.find((s) => s.poktanId === poktan.id) || {
            poktanId: poktan.id,
            selectedMedicines: [],
          };

          return (
            <PoktanSection
              key={poktan.id}
              poktan={poktan}
              index={idx}
              bppPreferences={item.preferensiObatBpp}
              selection={sel}
              onSelectionChange={(newSel) => handleSelectionChange(poktan.id, newSel)}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default StepDetailPoktan;
