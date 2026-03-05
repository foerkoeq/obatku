"use client";

import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Users,
  User,
  Check,
  Plus,
  Building2,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  farmerGroupsMock,
  FarmerGroup,
} from "@/lib/data/farmer-groups-mock";
import { SelectedGroupInfo } from "./schema";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FarmerGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kecamatan: string;
  desa: string;
  selectedGroups: SelectedGroupInfo[];
  onConfirm: (groups: SelectedGroupInfo[]) => void;
  onAddNew: () => void;
}

function toSelectedGroupInfo(group: FarmerGroup): SelectedGroupInfo {
  return {
    id: group.id,
    jenis: group.jenis,
    namaKelompokTani: group.namaKelompokTani,
    namaGapoktan: group.namaGapoktan,
    ketuaGapoktan: group.ketuaGapoktan
      ? {
          nama: group.ketuaGapoktan.nama,
          nik: group.ketuaGapoktan.nik,
          noHp: group.ketuaGapoktan.noHp,
        }
      : undefined,
    poktan: group.poktan.map((p) => ({
      namaPoktan: p.namaPoktan,
      ketua: { nama: p.ketua.nama, nik: p.ketua.nik, noHp: p.ketua.noHp },
    })),
    activePoktanNames: group.poktan.map((p) => p.namaPoktan),
  };
}

export function FarmerGroupModal({
  open,
  onOpenChange,
  kecamatan,
  desa,
  selectedGroups,
  onConfirm,
  onAddNew,
}: FarmerGroupModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelected, setTempSelected] = useState<SelectedGroupInfo[]>([
    ...selectedGroups,
  ]);

  // Reset tempSelected when modal opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempSelected([...selectedGroups]);
      setSearchTerm("");
    }
    onOpenChange(isOpen);
  };

  // Filter groups by kecamatan & desa
  const filteredGroups = useMemo(() => {
    let groups = farmerGroupsMock.filter(
      (g) =>
        g.kecamatan.toLowerCase() === kecamatan.toLowerCase() &&
        g.desa.toLowerCase() === desa.toLowerCase()
    );

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      groups = groups.filter(
        (g) =>
          g.namaKelompokTani.toLowerCase().includes(search) ||
          g.namaGapoktan?.toLowerCase().includes(search) ||
          g.poktan.some((p) => p.namaPoktan.toLowerCase().includes(search))
      );
    }

    return groups;
  }, [kecamatan, desa, searchTerm]);

  const gapoktanGroups = filteredGroups.filter((g) => g.jenis === "Gapoktan");
  const poktanGroups = filteredGroups.filter((g) => g.jenis === "Poktan");

  const selectedGapoktanCount = tempSelected.filter(
    (s) => s.jenis === "Gapoktan"
  ).length;

  const isGroupSelected = (id: string) =>
    tempSelected.some((s) => s.id === id);

  const handleToggleGroup = (group: FarmerGroup) => {
    if (isGroupSelected(group.id)) {
      // Remove
      setTempSelected((prev) => prev.filter((s) => s.id !== group.id));
    } else {
      // Validate: max 1 gapoktan
      if (group.jenis === "Gapoktan" && selectedGapoktanCount >= 1) {
        toast.error("Maksimal 1 Gapoktan yang dapat dipilih");
        return;
      }
      setTempSelected((prev) => [...prev, toSelectedGroupInfo(group)]);
    }
  };

  const handleConfirm = () => {
    if (tempSelected.length === 0) {
      toast.error("Pilih minimal satu kelompok tani");
      return;
    }
    onConfirm(tempSelected);
    onOpenChange(false);
  };

  const handleRemovePoktanFromSelected = (groupId: string, poktanName: string) => {
    setTempSelected((prev) =>
      prev
        .map((group) => {
          if (group.id !== groupId || group.jenis !== "Gapoktan") return group;
          const activePoktanNames = group.activePoktanNames.filter((name) => name !== poktanName);
          if (activePoktanNames.length === 0) return null;
          return {
            ...group,
            activePoktanNames,
          };
        })
        .filter(Boolean) as SelectedGroupInfo[]
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] max-h-[85svh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-primary" />
            Pilih Kelompok Tani
          </DialogTitle>
          <DialogDescription className="text-sm">
            Pilih poktan/gapoktan di {desa}, Kec. {kecamatan}. Bisa pilih
            beberapa poktan, namun maksimal 1 gapoktan.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="px-4 sm:px-6 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kelompok tani..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Content — native scroll for reliable mobile scrolling */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6">
          <div className="space-y-4 py-3">
            {/* Info */}
            {tempSelected.length > 0 && (
              <Alert className="bg-primary/5 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-xs">
                  <strong>{tempSelected.length}</strong> kelompok tani dipilih
                  {selectedGapoktanCount > 0 && (
                    <span> (termasuk 1 Gapoktan)</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Gapoktan Section */}
            {gapoktanGroups.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Gapoktan
                  </h4>
                  <Badge color="secondary" className="text-xs">
                    Maks. 1
                  </Badge>
                </div>
                <div className="space-y-2">
                  {gapoktanGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isSelected={isGroupSelected(group.id)}
                      onToggle={() => handleToggleGroup(group)}
                      selectedGroup={tempSelected.find((item) => item.id === group.id)}
                      onRemovePoktan={(poktanName) =>
                        handleRemovePoktanFromSelected(group.id, poktanName)
                      }
                      disabled={
                        !isGroupSelected(group.id) &&
                        selectedGapoktanCount >= 1
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {gapoktanGroups.length > 0 && poktanGroups.length > 0 && (
              <Separator />
            )}

            {/* Poktan Section */}
            {poktanGroups.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Poktan
                  </h4>
                </div>
                <div className="space-y-2">
                  {poktanGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isSelected={isGroupSelected(group.id)}
                      onToggle={() => handleToggleGroup(group)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredGroups.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium mb-1">
                  Tidak ada data kelompok tani
                </p>
                <p className="text-xs">
                  {searchTerm
                    ? "Coba kata kunci lain"
                    : `Belum ada data di ${desa}, Kec. ${kecamatan}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onAddNew}
            className="w-full sm:w-auto order-last sm:order-first"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Data Petani
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={tempSelected.length === 0}
              className="flex-1 sm:flex-none"
            >
              <Check className="w-4 h-4 mr-2" />
              Pilih ({tempSelected.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================
// Sub-component: Group Card
// =============================================

function GroupCard({
  group,
  isSelected,
  onToggle,
  selectedGroup,
  onRemovePoktan,
  disabled = false,
}: {
  group: FarmerGroup;
  isSelected: boolean;
  onToggle: () => void;
  selectedGroup?: SelectedGroupInfo;
  onRemovePoktan?: (poktanName: string) => void;
  disabled?: boolean;
}) {
  const isGapoktan = group.jenis === "Gapoktan";
  const activePoktanNames = selectedGroup?.activePoktanNames ?? [];

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "w-full text-left rounded-xl border-2 p-3 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary/30",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : disabled
          ? "border-muted bg-muted/30 opacity-50 cursor-not-allowed"
          : "border-border hover:border-primary/40 hover:bg-accent/50 cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          {/* Name & Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate">
              {group.namaKelompokTani}
            </span>
            <Badge
              color={isGapoktan ? "default" : "secondary"}
              className={cn(
                "text-[10px] px-1.5 py-0",
                isGapoktan
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              )}
            >
              {group.jenis}
            </Badge>
          </div>

          {/* Gapoktan leader info */}
          {isGapoktan && group.ketuaGapoktan && (
            <p className="text-xs text-muted-foreground">
              Ketua: {group.ketuaGapoktan.nama}
            </p>
          )}

          {/* Poktan members */}
          {isGapoktan && group.poktan.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mt-1">
              <span className="text-[10px] text-muted-foreground">
                {group.poktan.length} poktan:
              </span>
              {group.poktan.slice(0, 3).map((p) => (
                <Badge
                  key={p.namaPoktan}
                  className="text-[10px] px-1.5 py-0 border"
                >
                  {p.namaPoktan}
                </Badge>
              ))}
              {group.poktan.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{group.poktan.length - 3} lagi
                </span>
              )}
            </div>
          )}

          {isGapoktan && isSelected && activePoktanNames.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <span className="text-[11px] text-muted-foreground font-medium">
                Poktan yang diajukan ({activePoktanNames.length}/{group.poktan.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activePoktanNames.map((poktanName) => (
                  <button
                    key={poktanName}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (activePoktanNames.length <= 1) return;
                      onRemovePoktan?.(poktanName);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs transition-colors",
                      "min-h-[36px]", // mobile touch target
                      activePoktanNames.length > 1
                        ? "border-border hover:border-destructive hover:bg-destructive/5 hover:text-destructive active:bg-destructive/10"
                        : "border-primary/30 bg-primary/5 text-primary cursor-default"
                    )}
                    title={activePoktanNames.length > 1 ? "Tap untuk hapus dari pengajuan" : "Minimal 1 poktan harus aktif"}
                  >
                    <span className="font-medium">{poktanName}</span>
                    {activePoktanNames.length > 1 ? (
                      <X className="h-3.5 w-3.5 flex-shrink-0" />
                    ) : (
                      <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                    )}
                  </button>
                ))}
              </div>
              {activePoktanNames.length > 1 && (
                <p className="text-[10px] text-muted-foreground">
                  Tap poktan untuk menghapus dari pengajuan
                </p>
              )}
            </div>
          )}

          {/* Single poktan leader */}
          {!isGapoktan && group.poktan[0] && (
            <p className="text-xs text-muted-foreground">
              Ketua: {group.poktan[0].ketua.nama}
            </p>
          )}
        </div>

        {/* Selected indicator */}
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
            isSelected
              ? "border-primary bg-primary"
              : "border-muted-foreground/30"
          )}
        >
          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
      </div>
    </button>
  );
}
