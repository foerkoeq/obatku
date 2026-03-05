"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Info,
  Sparkles,
  Bug,
  ShieldCheck,
  Leaf,
  FlaskConical,
  Check,
  SkipForward,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SubmissionFormData,
  PoktanPreferenceData,
  PoktanAttackData,
} from "./schema";
import {
  mockMedicineStock,
} from "@/lib/data/transaction-list-mock";
import { type MedicineStockItem } from "@/lib/types/transaction-list";

interface Step3MedicineRequestProps {
  formData: SubmissionFormData;
  onChange: (updates: Partial<SubmissionFormData>) => void;
}

const JENIS_PESTISIDA_OPTIONS = [
  {
    value: "kimia" as const,
    label: "Pestisida Kimia/Sintetik",
    icon: <FlaskConical className="w-4 h-4" />,
    color: "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20",
  },
  {
    value: "nabati" as const,
    label: "Pestisida Nabati",
    icon: <Leaf className="w-4 h-4" />,
    color: "text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20",
  },
  {
    value: "agen_hayati" as const,
    label: "Agen Hayati",
    icon: <Bug className="w-4 h-4" />,
    color:
      "text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900/20",
  },
];

export function Step3MedicineRequest({
  formData,
  onChange,
}: Step3MedicineRequestProps) {
  // Initialize preferences from attacks
  useEffect(() => {
    if (
      formData.poktanAttacks.length > 0 &&
      (!formData.poktanPreferences || formData.poktanPreferences.length === 0)
    ) {
      const prefs: PoktanPreferenceData[] = formData.poktanAttacks.map((a) => ({
        poktanId: a.poktanId,
        namaPoktan: a.namaPoktan,
        opt: a.opt
          .map((optName) =>
            optName === "Lainnya" ? a.optLainnya || "Lainnya" : optName
          )
          .join(", "),
        jenisPestisida: undefined,
        selectedMedicineIds: [],
        skipped: false,
      }));
      onChange({ poktanPreferences: prefs });
    }
  }, [formData.poktanAttacks, formData.poktanPreferences, onChange]);

  const updatePreference = (
    poktanId: string,
    updates: Partial<PoktanPreferenceData>
  ) => {
    const updated = (formData.poktanPreferences || []).map((p) =>
      p.poktanId === poktanId ? { ...p, ...updates } : p
    );
    onChange({ poktanPreferences: updated });
  };

  const skipAll = () => {
    const updated = (formData.poktanPreferences || []).map((p) => ({
      ...p,
      skipped: true,
    }));
    onChange({ poktanPreferences: updated });
  };

  const allSkipped = (formData.poktanPreferences || []).every((p) => p.skipped);

  return (
    <div className="space-y-5">
      {/* Info */}
      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800">
        <Info className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <AlertDescription className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
          <strong>Opsional:</strong> Pilih preferensi jenis obat untuk setiap
          poktan, atau skip agar dipilihkan oleh Dinas.
        </AlertDescription>
      </Alert>

      {/* Skip All Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant={allSkipped ? "default" : "outline"}
          size="sm"
          onClick={skipAll}
          className="text-xs"
        >
          <SkipForward className="w-3.5 h-3.5 mr-1.5" />
          {allSkipped ? "Semua Di-skip" : "Skip Semua (Dipilihkan Dinas)"}
        </Button>
      </div>

      {/* Per-Poktan Preference Cards */}
      <div className="space-y-4">
        {(formData.poktanPreferences || []).map((pref, index) => {
          const attack = formData.poktanAttacks.find(
            (a) => a.poktanId === pref.poktanId
          );
          return (
            <PoktanPreferenceCard
              key={pref.poktanId}
              preference={pref}
              attack={attack}
              index={index}
              total={(formData.poktanPreferences || []).length}
              onUpdate={(updates) => updatePreference(pref.poktanId, updates)}
            />
          );
        })}
      </div>
    </div>
  );
}

// =============================================
// Sub-component: Poktan Preference Card
// =============================================

function PoktanPreferenceCard({
  preference,
  attack,
  index,
  total,
  onUpdate,
}: {
  preference: PoktanPreferenceData;
  attack?: PoktanAttackData;
  index: number;
  total: number;
  onUpdate: (updates: Partial<PoktanPreferenceData>) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card
      className={cn(
        "border-2 overflow-hidden transition-all",
        preference.skipped
          ? "opacity-60 border-muted"
          : preference.selectedMedicineIds.length > 0
          ? "border-green-200 dark:border-green-800"
          : "border-border"
      )}
    >
      <CardHeader className="p-3 pb-2 bg-muted/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">{index + 1}</span>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold truncate">
                {preference.namaPoktan}
              </h4>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                {attack && (
                  <>
                    <span className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium">
                      {attack.komoditas}
                    </span>
                    <span className="inline-flex items-center rounded-md border border-red-200 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                      <Bug className="w-2.5 h-2.5 mr-0.5" />
                      {attack.opt.length > 0
                        ? attack.opt
                            .map((optName) =>
                              optName === "Lainnya"
                                ? attack.optLainnya || "Lainnya"
                                : optName
                            )
                            .join(", ")
                        : "-"}
                    </span>
                    <span className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium">
                      {attack.luasSerangan} Ha
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {preference.skipped && (
              <Badge
                color="secondary"
                className="text-[10px]"
              >
                Skipped
              </Badge>
            )}
            {preference.selectedMedicineIds.length > 0 && (
              <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Check className="w-2.5 h-2.5 mr-0.5" />
                {preference.selectedMedicineIds.length} obat
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        {/* Toggle Skip */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {preference.skipped
              ? "Akan dipilihkan oleh Dinas"
              : "Pilih preferensi obat"}
          </span>
          <Button
            type="button"
            variant={preference.skipped ? "outline" : "ghost"}
            size="sm"
            onClick={() =>
              onUpdate({
                skipped: !preference.skipped,
                jenisPestisida: undefined,
                selectedMedicineIds: [],
              })
            }
            className="text-xs h-7"
          >
            {preference.skipped ? "Pilih Sendiri" : "Skip"}
          </Button>
        </div>

        {/* Preference Form */}
        {!preference.skipped && (
          <>
            <Separator />
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="w-full justify-center gap-2 h-10"
            >
              <ShieldCheck className="w-4 h-4" />
              {preference.selectedMedicineIds.length > 0
                ? `${preference.selectedMedicineIds.length} obat dipilih — Ubah`
                : "Preferensi Pengendalian"}
            </Button>

            {/* Selected Medicines Summary */}
            {preference.selectedMedicineIds.length > 0 && (
              <div className="space-y-1">
                {preference.selectedMedicineIds.map((id) => {
                  const med = mockMedicineStock.find((m) => m.id === id);
                  if (!med) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5"
                    >
                      <span className="text-xs font-medium truncate">
                        {med.nama}
                      </span>
                      <span className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium">
                        {med.jenis === "kimia"
                          ? "Kimia"
                          : med.jenis === "nabati"
                          ? "Nabati"
                          : "Agen Hayati"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Preference Modal */}
      <PreferenceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        preference={preference}
        optNames={
          attack
            ? attack.opt.map((optName) =>
                optName === "Lainnya"
                  ? attack.optLainnya || "Lainnya"
                  : optName
              )
            : []
        }
        onConfirm={(jenis, medicineIds) => {
          onUpdate({
            jenisPestisida: jenis,
            selectedMedicineIds: medicineIds,
            skipped: false,
          });
          setIsModalOpen(false);
        }}
      />
    </Card>
  );
}

// =============================================
// Sub-component: Preference Modal
// =============================================

function PreferenceModal({
  open,
  onOpenChange,
  preference,
  optNames,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preference: PoktanPreferenceData;
  optNames: string[];
  onConfirm: (
    jenis: "kimia" | "nabati" | "agen_hayati" | undefined,
    medicineIds: string[]
  ) => void;
}) {
  const [selectedJenis, setSelectedJenis] = useState<
    "kimia" | "nabati" | "agen_hayati" | undefined
  >(preference.jenisPestisida);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    preference.selectedMedicineIds
  );

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setSelectedJenis(preference.jenisPestisida);
      setSelectedIds([...preference.selectedMedicineIds]);
    }
  }, [open, preference.jenisPestisida, preference.selectedMedicineIds]);

  // Filter medicines by jenis and OPT match
  const recommendations = useMemo(() => {
    if (!selectedJenis) return [];

    const normalizedOptNames = optNames
      .map((name) => name.toLowerCase().trim())
      .filter(Boolean);

    const matchesAnyOPT = (targets: string[]) => {
      if (normalizedOptNames.length === 0) return false;
      return targets.some((target) => {
        const normalizedTarget = target.toLowerCase();
        return normalizedOptNames.some(
          (optName) =>
            normalizedTarget.includes(optName) ||
            optName.includes(normalizedTarget)
        );
      });
    };

    return mockMedicineStock
      .filter((m) => m.jenis === selectedJenis)
      .sort((a, b) => {
        const aMatch = matchesAnyOPT(a.targetOpt);
        const bMatch = matchesAnyOPT(b.targetOpt);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return a.nama.localeCompare(b.nama);
      });
  }, [selectedJenis, optNames]);

  const matchedMeds = recommendations.filter((m) =>
    m.targetOpt.some((target) =>
      optNames.some((optName) => {
        const normalizedTarget = target.toLowerCase();
        const normalizedOptName = optName.toLowerCase();
        return (
          normalizedTarget.includes(normalizedOptName) ||
          normalizedOptName.includes(normalizedTarget)
        );
      })
    )
  );
  const otherMeds = recommendations.filter(
    (m) =>
      !m.targetOpt.some(
        (target) =>
          optNames.some((optName) => {
            const normalizedTarget = target.toLowerCase();
            const normalizedOptName = optName.toLowerCase();
            return (
              normalizedTarget.includes(normalizedOptName) ||
              normalizedOptName.includes(normalizedTarget)
            );
          })
      )
  );

  const toggleMedicine = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] max-h-[85svh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Preferensi Pengendalian
          </DialogTitle>
          <DialogDescription className="text-sm">
            {preference.namaPoktan} — OPT: {optNames.join(", ") || "-"}
          </DialogDescription>
        </DialogHeader>

        {/* Content — native scroll for reliable mobile scrolling */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6">
          <div className="space-y-4 py-3">
            {/* Jenis Pestisida */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Jenis Pestisida</Label>
              <RadioGroup
                value={selectedJenis || ""}
                onValueChange={(v) => {
                  setSelectedJenis(v as "kimia" | "nabati" | "agen_hayati");
                  setSelectedIds([]);
                }}
                className="grid grid-cols-1 gap-2"
              >
                {JENIS_PESTISIDA_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all",
                      selectedJenis === opt.value
                        ? `${opt.color} ring-1 ring-offset-1`
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <RadioGroupItem value={opt.value} />
                    <span className="flex items-center gap-2">
                      {opt.icon}
                      <span className="text-sm font-medium">{opt.label}</span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Medicine Recommendations */}
            {selectedJenis && (
              <>
                <Separator />

                {/* Matched */}
                {matchedMeds.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-semibold">
                        Rekomendasi untuk OPT terpilih
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchedMeds.map((med) => (
                        <MedicinePickCard
                          key={med.id}
                          medicine={med}
                          isSelected={selectedIds.includes(med.id)}
                          onToggle={() => toggleMedicine(med.id)}
                          recommended
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Others */}
                {otherMeds.length > 0 && (
                  <div className="space-y-2">
                    {matchedMeds.length > 0 && (
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        Obat Lainnya
                      </h4>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {otherMeds.map((med) => (
                        <MedicinePickCard
                          key={med.id}
                          medicine={med}
                          isSelected={selectedIds.includes(med.id)}
                          onToggle={() => toggleMedicine(med.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">
                      Tidak ada obat tersedia untuk jenis ini
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={() => onConfirm(selectedJenis, selectedIds)}>
            <Check className="w-4 h-4 mr-2" />
            Simpan ({selectedIds.length} obat)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================
// Sub-component: Medicine Pick Card (E-commerce style)
// =============================================

function MedicinePickCard({
  medicine,
  isSelected,
  onToggle,
  recommended = false,
}: {
  medicine: MedicineStockItem;
  isSelected: boolean;
  onToggle: () => void;
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative w-full text-left rounded-xl border-2 p-3 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary/30",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
          : "border-border hover:border-primary/40 hover:shadow-sm"
      )}
    >
      {/* Recommended badge */}
      {recommended && !isSelected && (
        <div className="absolute -top-2 -right-1">
          <Badge
            color="primary"
            className="text-[9px] px-1.5 py-0 shadow-sm"
          >
            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
            Cocok
          </Badge>
        </div>
      )}

      {/* Selected check */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-1.5 pr-6">
        <h5 className="text-sm font-semibold line-clamp-1">{medicine.nama}</h5>
        <p className="text-[11px] text-muted-foreground line-clamp-1">
          {medicine.bahanAktif}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-medium",
              medicine.jenis === "kimia"
                ? "text-blue-600 border-blue-200"
                : medicine.jenis === "nabati"
                ? "text-green-600 border-green-200"
                : "text-purple-600 border-purple-200"
            )}
          >
            {medicine.jenis === "kimia"
              ? "Kimia"
              : medicine.jenis === "nabati"
              ? "Nabati"
              : "Agen Hayati"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Stok: {medicine.stokBesar} {medicine.satuanBesar}
          </span>
        </div>
        {medicine.targetOpt.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {medicine.targetOpt.slice(0, 3).map((opt: string) => (
              <Badge
                key={opt}
                color="secondary"
                className="text-[9px] px-1 py-0"
              >
                {opt}
              </Badge>
            ))}
            {medicine.targetOpt.length > 3 && (
              <span className="text-[9px] text-muted-foreground">
                +{medicine.targetOpt.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
