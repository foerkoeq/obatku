"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TUBAN_DAERAH } from "@/lib/data/tuban-daerah";

interface PoktanEntry {
  namaPoktan: string;
  namaKetuaPoktan: string;
  nikPoktan: string;
  noHpPoktan: string;
}

interface AddFarmerFormState {
  kecamatan: string;
  desa: string;
  jenisKelompok: "Poktan" | "Gapoktan";
  namaGapoktan: string;
  namaKetuaGapoktan: string;
  nikGapoktan: string;
  noHpGapoktan: string;
  poktanMembers: PoktanEntry[];
}

interface AddFarmerGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultKecamatan?: string;
  defaultDesa?: string;
  onSaved?: () => void;
}

const createEmptyPoktan = (): PoktanEntry => ({
  namaPoktan: "",
  namaKetuaPoktan: "",
  nikPoktan: "",
  noHpPoktan: "",
});

const normalizeNumericInput = (value: string) => value.replace(/\D/g, "");

export function AddFarmerGroupModal({
  open,
  onOpenChange,
  defaultKecamatan = "",
  defaultDesa = "",
  onSaved,
}: AddFarmerGroupModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<AddFarmerFormState>({
    kecamatan: defaultKecamatan,
    desa: defaultDesa,
    jenisKelompok: "Poktan",
    namaGapoktan: "",
    namaKetuaGapoktan: "",
    nikGapoktan: "",
    noHpGapoktan: "",
    poktanMembers: [createEmptyPoktan()],
  });

  const kecamatanOptions = useMemo(
    () =>
      TUBAN_DAERAH.map((item) => item.kecamatan).sort((a, b) =>
        a.localeCompare(b, "id")
      ),
    []
  );

  const desaOptions = useMemo(() => {
    return (
      TUBAN_DAERAH.find((item) => item.kecamatan === form.kecamatan)?.desa ?? []
    );
  }, [form.kecamatan]);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setForm({
        kecamatan: defaultKecamatan,
        desa: defaultDesa,
        jenisKelompok: "Poktan",
        namaGapoktan: "",
        namaKetuaGapoktan: "",
        nikGapoktan: "",
        noHpGapoktan: "",
        poktanMembers: [createEmptyPoktan()],
      });
    }
  }, [open, defaultKecamatan, defaultDesa]);

  const updateForm = (updates: Partial<AddFarmerFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const updatePoktan = (index: number, updates: Partial<PoktanEntry>) => {
    setForm((prev) => ({
      ...prev,
      poktanMembers: prev.poktanMembers.map((p, i) =>
        i === index ? { ...p, ...updates } : p
      ),
    }));
  };

  const addPoktan = () => {
    setForm((prev) => ({
      ...prev,
      poktanMembers: [...prev.poktanMembers, createEmptyPoktan()],
    }));
  };

  const removePoktan = (index: number) => {
    if (form.poktanMembers.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      poktanMembers: prev.poktanMembers.filter((_, i) => i !== index),
    }));
  };

  const validate = (): string[] => {
    const errors: string[] = [];
    if (!form.kecamatan) errors.push("Kecamatan wajib dipilih");
    if (!form.desa) errors.push("Desa wajib dipilih");

    if (form.jenisKelompok === "Gapoktan") {
      if (!form.namaGapoktan.trim())
        errors.push("Nama gapoktan wajib diisi");
      if (!form.namaKetuaGapoktan.trim())
        errors.push("Nama ketua gapoktan wajib diisi");
      if (!form.nikGapoktan || form.nikGapoktan.length !== 16)
        errors.push("NIK ketua gapoktan harus 16 digit");
      if (
        !form.noHpGapoktan ||
        form.noHpGapoktan.length < 10 ||
        form.noHpGapoktan.length > 15
      )
        errors.push("No. HP ketua gapoktan harus 10-15 digit");
    }

    form.poktanMembers.forEach((p, i) => {
      const label = `Poktan ${i + 1}`;
      if (!p.namaPoktan.trim()) errors.push(`${label}: Nama poktan wajib diisi`);
      if (!p.namaKetuaPoktan.trim())
        errors.push(`${label}: Nama ketua wajib diisi`);
      if (!p.nikPoktan || p.nikPoktan.length !== 16)
        errors.push(`${label}: NIK harus 16 digit`);
      if (!p.noHpPoktan || p.noHpPoktan.length < 10 || p.noHpPoktan.length > 15)
        errors.push(`${label}: No. HP harus 10-15 digit`);
    });

    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setIsSaving(true);
    try {
      // Mock save
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Mock save farmer group:", form);
      toast.success("Data kelompok tani berhasil ditambahkan");
      onSaved?.();
      onOpenChange(false);
    } catch {
      toast.error("Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6 pb-0">
          <DialogTitle className="text-lg">Tambah Data Kelompok Tani</DialogTitle>
          <DialogDescription className="text-sm">
            Isi data poktan/gapoktan secara lengkap untuk mendukung pendataan
            yang akurat.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-4 sm:px-6">
          <div className="space-y-4 py-3">
            {/* Kecamatan & Desa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Kecamatan *</Label>
                <Select
                  value={form.kecamatan}
                  onValueChange={(v) =>
                    updateForm({ kecamatan: v, desa: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {kecamatanOptions.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Desa *</Label>
                <Select
                  value={form.desa}
                  onValueChange={(v) => updateForm({ desa: v })}
                  disabled={!form.kecamatan}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        form.kecamatan
                          ? "Pilih desa"
                          : "Pilih kecamatan dulu"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {desaOptions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Jenis Kelompok */}
            <div className="space-y-1.5">
              <Label className="text-sm">Jenis Kelompok *</Label>
              <RadioGroup
                className="grid grid-cols-2 gap-3"
                value={form.jenisKelompok}
                onValueChange={(v) => {
                  updateForm({ jenisKelompok: v as "Poktan" | "Gapoktan" });
                  if (v === "Poktan" && form.poktanMembers.length > 1) {
                    updateForm({ poktanMembers: [form.poktanMembers[0]] });
                  }
                }}
              >
                <label className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="Poktan" />
                  <span className="text-sm font-medium">Poktan</span>
                </label>
                <label className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="Gapoktan" />
                  <span className="text-sm font-medium">Gapoktan</span>
                </label>
              </RadioGroup>
            </div>

            {/* Gapoktan Fields */}
            {form.jenisKelompok === "Gapoktan" && (
              <div className="rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10 p-3 space-y-3">
                <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                  Data Gapoktan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs">Nama Gapoktan *</Label>
                    <Input
                      value={form.namaGapoktan}
                      onChange={(e) =>
                        updateForm({ namaGapoktan: e.target.value })
                      }
                      placeholder="Contoh: Gapoktan Tani Makmur"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nama Ketua *</Label>
                    <Input
                      value={form.namaKetuaGapoktan}
                      onChange={(e) =>
                        updateForm({ namaKetuaGapoktan: e.target.value })
                      }
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">NIK Ketua * (16 digit)</Label>
                    <Input
                      value={form.nikGapoktan}
                      onChange={(e) =>
                        updateForm({
                          nikGapoktan: normalizeNumericInput(e.target.value),
                        })
                      }
                      placeholder="3523xxxxxxxxxxxx"
                      maxLength={16}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">No. HP Ketua *</Label>
                    <Input
                      value={form.noHpGapoktan}
                      onChange={(e) =>
                        updateForm({
                          noHpGapoktan: normalizeNumericInput(e.target.value),
                        })
                      }
                      placeholder="08xxxxxxxxxx"
                      maxLength={15}
                      inputMode="tel"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Poktan Members */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  {form.jenisKelompok === "Gapoktan"
                    ? "Data Poktan di bawah Gapoktan"
                    : "Data Poktan"}
                </h4>
                {form.jenisKelompok === "Gapoktan" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPoktan}
                    className="h-7 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Tambah Poktan
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {form.poktanMembers.map((poktan, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-muted/30 p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {form.jenisKelompok === "Gapoktan"
                          ? `Poktan ${index + 1}`
                          : "Poktan"}
                      </span>
                      {form.jenisKelompok === "Gapoktan" &&
                        form.poktanMembers.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePoktan(index)}
                            className="h-6 text-xs text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Hapus
                          </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Nama Poktan *</Label>
                        <Input
                          value={poktan.namaPoktan}
                          onChange={(e) =>
                            updatePoktan(index, {
                              namaPoktan: e.target.value,
                            })
                          }
                          placeholder="Contoh: Poktan Sumber Rejeki"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Nama Ketua *</Label>
                        <Input
                          value={poktan.namaKetuaPoktan}
                          onChange={(e) =>
                            updatePoktan(index, {
                              namaKetuaPoktan: e.target.value,
                            })
                          }
                          placeholder="Nama lengkap"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">NIK * (16 digit)</Label>
                        <Input
                          value={poktan.nikPoktan}
                          onChange={(e) =>
                            updatePoktan(index, {
                              nikPoktan: normalizeNumericInput(e.target.value),
                            })
                          }
                          placeholder="3523xxxxxxxxxxxx"
                          maxLength={16}
                          inputMode="numeric"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">No. HP *</Label>
                        <Input
                          value={poktan.noHpPoktan}
                          onChange={(e) =>
                            updatePoktan(index, {
                              noHpPoktan: normalizeNumericInput(e.target.value),
                            })
                          }
                          placeholder="08xxxxxxxxxx"
                          maxLength={15}
                          inputMode="tel"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Batal
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
