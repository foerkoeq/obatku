"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Info,
  Sprout,
  Bug,
  ChevronDown,
  ChevronUp,
  Search,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SubmissionFormData,
  SelectedGroupInfo,
  PoktanAttackData,
} from "./schema";
import { KOMODITAS_GROUPED, type Komoditas } from "@/lib/data/komoditas-mock";
import { OPT_LIST, type OPTItem } from "@/lib/data/opt-mock";

interface Step2FarmingDetailsProps {
  formData: SubmissionFormData;
  onChange: (updates: Partial<SubmissionFormData>) => void;
}

// Helper: get all active poktan from selected groups
function getActivePoktanList(
  groups: SelectedGroupInfo[]
): { id: string; namaPoktan: string; namaKetua: string }[] {
  const result: { id: string; namaPoktan: string; namaKetua: string }[] = [];
  for (const group of groups) {
    for (const poktan of group.poktan) {
      if (group.activePoktanNames.includes(poktan.namaPoktan)) {
        result.push({
          id: `${group.id}_${poktan.namaPoktan}`,
          namaPoktan: poktan.namaPoktan,
          namaKetua: poktan.ketua.nama,
        });
      }
    }
  }
  return result;
}

export function Step2FarmingDetails({
  formData,
  onChange,
}: Step2FarmingDetailsProps) {
  const activePoktanList = useMemo(
    () => getActivePoktanList(formData.selectedGroups),
    [formData.selectedGroups]
  );

  // Initialize poktanAttacks if not yet set
  const attacks = formData.poktanAttacks;

  // Ensure we have an entry for each active poktan
  const ensuredAttacks: PoktanAttackData[] = useMemo(() => {
    return activePoktanList.map((p) => {
      const existing = attacks.find((a) => a.poktanId === p.id);
      if (existing) return existing;
      return {
        poktanId: p.id,
        namaPoktan: p.namaPoktan,
        namaKetua: p.namaKetua,
        komoditas: "",
        luasSerangan: 0,
        luasWaspada: 0,
        opt: [],
        optLainnya: "",
      };
    });
  }, [activePoktanList, attacks]);

  const updateAttack = (
    poktanId: string,
    updates: Partial<PoktanAttackData>
  ) => {
    const updated = ensuredAttacks.map((a) =>
      a.poktanId === poktanId ? { ...a, ...updates } : a
    );
    onChange({ poktanAttacks: updated });
  };

  if (activePoktanList.length === 0) {
    return (
      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm text-amber-800 dark:text-amber-300">
          Kembali ke Step 1 untuk memilih kelompok tani terlebih dahulu.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      {/* Info */}
      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800">
        <Sprout className="h-4 w-4 text-green-600 flex-shrink-0" />
        <AlertDescription className="text-xs sm:text-sm text-green-800 dark:text-green-300">
          Isi data serangan untuk setiap poktan. Pilih komoditas, masukkan luas
          area, dan tentukan OPT (Organisme Pengganggu Tumbuhan).
        </AlertDescription>
      </Alert>

      {/* Per-poktan cards */}
      <div className="space-y-4">
        {ensuredAttacks.map((attack, index) => (
          <PoktanAttackCard
            key={attack.poktanId}
            attack={attack}
            index={index}
            total={ensuredAttacks.length}
            onUpdate={(updates) => updateAttack(attack.poktanId, updates)}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================
// Sub-component: Poktan Attack Card
// =============================================

function PoktanAttackCard({
  attack,
  index,
  total,
  onUpdate,
}: {
  attack: PoktanAttackData;
  index: number;
  total: number;
  onUpdate: (updates: Partial<PoktanAttackData>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [optSearch, setOptSearch] = useState("");

  const isComplete =
    attack.komoditas &&
    attack.luasSerangan > 0 &&
    attack.opt.length > 0 &&
    (!attack.opt.includes("Lainnya") || attack.optLainnya);

  // Filter OPT based on search
  const filteredOPT = useMemo(() => {
    if (!optSearch) return OPT_LIST;
    const q = optSearch.toLowerCase();
    return OPT_LIST.filter(
      (o) =>
        o.nama.toLowerCase().includes(q) ||
        o.kategori.toLowerCase().includes(q)
    );
  }, [optSearch]);

  const toggleOPT = (optName: string) => {
    const isSelected = attack.opt.includes(optName);
    const nextOpt = isSelected
      ? attack.opt.filter((item) => item !== optName)
      : [...attack.opt, optName];

    onUpdate({
      opt: nextOpt,
      optLainnya: nextOpt.includes("Lainnya") ? attack.optLainnya : "",
    });
  };

  return (
    <Card
      className={cn(
        "border-2 overflow-hidden transition-all",
        isComplete
          ? "border-green-200 dark:border-green-800"
          : "border-border"
      )}
    >
      {/* Header */}
      <CardHeader
        className="p-3 bg-muted/30 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">{index + 1}</span>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold truncate">
                {attack.namaPoktan}
              </h4>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                {attack.namaKetua}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isComplete && (
              <Badge
                color="success"
                className="text-[10px] px-1.5 py-0"
              >
                Lengkap
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Body */}
      {isExpanded && (
        <CardContent className="p-3 space-y-4">
          {/* Komoditas (Radio) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-green-600" />
              Komoditas Terserang
            </Label>
            {Object.entries(KOMODITAS_GROUPED).map(
              ([kategori, items]) => (
                <div key={kategori} className="space-y-1">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {kategori}
                  </span>
                  <RadioGroup
                    value={attack.komoditas}
                    onValueChange={(v) => onUpdate({ komoditas: v })}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-1.5"
                  >
                    {items.map((k: Komoditas) => (
                      <label
                        key={k.id}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 cursor-pointer transition-all text-xs",
                          attack.komoditas === k.nama
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <RadioGroupItem
                          value={k.nama}
                          className="h-3.5 w-3.5"
                        />
                        {k.nama}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )
            )}
          </div>

          <Separator />

          {/* Luas Area */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Luas Serangan (Ha) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                placeholder="0.0"
                value={attack.luasSerangan || ""}
                onChange={(e) =>
                  onUpdate({
                    luasSerangan: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Luas Waspada (Ha)
              </Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                placeholder="0.0"
                value={attack.luasWaspada || ""}
                onChange={(e) =>
                  onUpdate({
                    luasWaspada: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-9 text-sm"
              />
            </div>
          </div>

          <Separator />

          {/* OPT (Searchable Dropdown) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Bug className="w-3.5 h-3.5 text-red-500" />
              OPT (Organisme Pengganggu Tumbuhan){" "}
              <span className="text-red-500">*</span>
            </Label>

            {/* Current selection */}
            {attack.opt.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    OPT terpilih ({attack.opt.length})
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdate({ opt: [], optLainnya: "" })}
                    className="text-[11px] h-6 px-2 text-muted-foreground"
                  >
                    Reset
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {attack.opt.map((selectedOpt) => (
                    <Badge key={selectedOpt} color="destructive" className="text-[11px] gap-1.5">
                      {selectedOpt}
                      <button
                        type="button"
                        onClick={() => toggleOPT(selectedOpt)}
                        className="inline-flex items-center"
                        aria-label={`Hapus ${selectedOpt}`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari OPT penyerang..."
                value={optSearch}
                onChange={(e) => setOptSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>

            {/* OPT Grid */}
            <div className="max-h-48 overflow-y-auto rounded-lg border p-1.5 space-y-0.5">
              {filteredOPT.map((opt) => {
                const isLainnya = opt.id === "OPT-999";
                const selected = attack.opt.includes(opt.nama);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleOPT(opt.nama)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors border border-transparent",
                      selected
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "hover:bg-primary/5 hover:text-primary",
                      isLainnya && "border-t mt-1 pt-2"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{opt.nama}</span>
                      <div className="flex items-center gap-1.5">
                        {selected && (
                          <Badge className="text-[9px] px-1 py-0" color="primary">
                            Dipilih
                          </Badge>
                        )}
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
                    </div>
                  </button>
                );
              })}
              {filteredOPT.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">
                  OPT tidak ditemukan
                </p>
              )}
            </div>

            {/* Lainnya input */}
            {attack.opt.includes("Lainnya") && (
              <Input
                placeholder="Nama OPT lainnya..."
                value={attack.optLainnya || ""}
                onChange={(e) => onUpdate({ optLainnya: e.target.value })}
                className="h-9 text-sm"
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
