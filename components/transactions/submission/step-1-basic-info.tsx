"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Users,
  User,
  Phone,
  CreditCard,
  Info,
  X,
  Building2,
  ChevronDown,
  ChevronUp,
  Trash2,
  UserMinus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TUBAN_DAERAH } from "@/lib/data/tuban-daerah";
import {
  SubmissionFormData,
  SelectedGroupInfo,
} from "./schema";
import { FarmerGroupModal } from "./farmer-group-modal";
import { AddFarmerGroupModal } from "./add-farmer-group-modal";

interface Step1BasicInfoProps {
  formData: SubmissionFormData;
  onChange: (updates: Partial<SubmissionFormData>) => void;
}

export function Step1BasicInfo({ formData, onChange }: Step1BasicInfoProps) {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Derived data
  const kecamatanOptions = useMemo(
    () =>
      TUBAN_DAERAH.map((item) => item.kecamatan).sort((a, b) =>
        a.localeCompare(b, "id")
      ),
    []
  );

  const desaOptions = useMemo(() => {
    if (!formData.kecamatan) return [];
    return (
      TUBAN_DAERAH.find((item) => item.kecamatan === formData.kecamatan)
        ?.desa ?? []
    );
  }, [formData.kecamatan]);

  const canSelectGroup = !!formData.kecamatan && !!formData.desa;

  // Handlers
  const handleKecamatanChange = (value: string) => {
    onChange({
      kecamatan: value,
      desa: "",
      selectedGroups: [],
      poktanAttacks: [],
      poktanPreferences: [],
    });
  };

  const handleDesaChange = (value: string) => {
    onChange({
      desa: value,
      selectedGroups: [],
      poktanAttacks: [],
      poktanPreferences: [],
    });
  };

  const handleGroupsConfirmed = (groups: SelectedGroupInfo[]) => {
    onChange({
      selectedGroups: groups,
      poktanAttacks: [],
      poktanPreferences: [],
    });
  };

  const handleRemoveGroup = (groupId: string) => {
    const updated = formData.selectedGroups.filter((g) => g.id !== groupId);
    onChange({
      selectedGroups: updated,
      poktanAttacks: [],
      poktanPreferences: [],
    });
  };

  const handleRemovePoktanFromGapoktan = (
    groupId: string,
    poktanName: string
  ) => {
    const updated = formData.selectedGroups.map((g) => {
      if (g.id === groupId && g.jenis === "Gapoktan") {
        const newActive = g.activePoktanNames.filter((n) => n !== poktanName);
        if (newActive.length === 0) return null; // Remove group if no poktan left
        return { ...g, activePoktanNames: newActive };
      }
      return g;
    });

    onChange({
      selectedGroups: updated.filter(Boolean) as SelectedGroupInfo[],
      poktanAttacks: [],
      poktanPreferences: [],
    });
  };

  return (
    <div className="space-y-5">
      {/* Info */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary flex-shrink-0" />
        <AlertDescription className="text-xs sm:text-sm text-black">
          Pilih lokasi lalu pilih kelompok tani yang mengajukan. Bisa memilih
          beberapa poktan dan maksimal 1 gapoktan.
        </AlertDescription>
      </Alert>

      {/* Location Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kecamatan */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            Kecamatan <span className="text-destructive">*</span>
          </label>
          <Select
            value={formData.kecamatan}
            onValueChange={handleKecamatanChange}
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
          <p className="text-[11px] text-muted-foreground">
            Kabupaten Tuban
          </p>
        </div>

        {/* Desa */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            Desa <span className="text-destructive">*</span>
          </label>
          <Select
            value={formData.desa}
            onValueChange={handleDesaChange}
            disabled={!formData.kecamatan}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !formData.kecamatan
                    ? "Pilih kecamatan terlebih dahulu"
                    : "Pilih desa"
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
          {formData.kecamatan && (
            <p className="text-[11px] text-muted-foreground">
              Desa di Kec. {formData.kecamatan}
            </p>
          )}
        </div>
      </div>

      {/* Kelompok Tani Button */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          Kelompok Tani <span className="text-destructive">*</span>
        </label>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsGroupModalOpen(true)}
          disabled={!canSelectGroup}
          className={cn(
            "w-full justify-between h-10 font-normal",
            !canSelectGroup && "opacity-50"
          )}
        >
          <span className="text-sm">
            {formData.selectedGroups.length > 0
              ? `${formData.selectedGroups.length} kelompok dipilih`
              : canSelectGroup
              ? "Pilih Kelompok Tani"
              : "Pilih kecamatan & desa terlebih dahulu"}
          </span>
          <Users className="w-4 h-4 text-muted-foreground" />
        </Button>
        {formData.selectedGroups.length === 0 && canSelectGroup && (
          <p className="text-[11px] text-muted-foreground">
            Klik untuk memilih poktan/gapoktan yang mengajukan
          </p>
        )}
      </div>

      {/* Selected Groups Info */}
      {formData.selectedGroups.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Kelompok Tani Terpilih
          </h4>
          <div className="space-y-3">
            {formData.selectedGroups.map((group) => (
              <SelectedGroupCard
                key={group.id}
                group={group}
                onRemoveGroup={() => handleRemoveGroup(group.id)}
                onRemovePoktan={(poktanName) =>
                  handleRemovePoktanFromGapoktan(group.id, poktanName)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <FarmerGroupModal
        open={isGroupModalOpen}
        onOpenChange={setIsGroupModalOpen}
        kecamatan={formData.kecamatan}
        desa={formData.desa}
        selectedGroups={formData.selectedGroups}
        onConfirm={handleGroupsConfirmed}
        onAddNew={() => {
          setIsGroupModalOpen(false);
          setIsAddModalOpen(true);
        }}
      />

      <AddFarmerGroupModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        defaultKecamatan={formData.kecamatan}
        defaultDesa={formData.desa}
        onSaved={() => {
          setIsAddModalOpen(false);
          setIsGroupModalOpen(true);
        }}
      />
    </div>
  );
}

// =============================================
// Sub-component: Selected Group Card
// =============================================

function SelectedGroupCard({
  group,
  onRemoveGroup,
  onRemovePoktan,
}: {
  group: SelectedGroupInfo;
  onRemoveGroup: () => void;
  onRemovePoktan: (poktanName: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isGapoktan = group.jenis === "Gapoktan";
  const activePoktans = group.poktan.filter((p) =>
    group.activePoktanNames.includes(p.namaPoktan)
  );

  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2.5 bg-primary/5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isGapoktan ? (
            <Building2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
          ) : (
            <User className="w-4 h-4 text-green-600 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold truncate">
            {group.namaKelompokTani}
          </span>
          <Badge
            color="secondary"
            className={cn(
              "text-[10px] px-1.5 py-0 flex-shrink-0",
              isGapoktan
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            )}
          >
            {group.jenis}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveGroup();
            }}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <CardContent className="p-3 space-y-3">
          {/* Gapoktan Leader Info */}
          {isGapoktan && group.ketuaGapoktan && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                Info Gapoktan
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <InfoRow
                  icon={<User className="w-3 h-3" />}
                  label="Ketua"
                  value={group.ketuaGapoktan.nama}
                />
                <InfoRow
                  icon={<CreditCard className="w-3 h-3" />}
                  label="NIK"
                  value={group.ketuaGapoktan.nik}
                />
                <InfoRow
                  icon={<Phone className="w-3 h-3" />}
                  label="No. HP"
                  value={group.ketuaGapoktan.noHp}
                />
              </div>
              <Separator className="my-2" />
            </div>
          )}

          {/* Poktan List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {isGapoktan
                  ? `Poktan Mengajukan (${activePoktans.length}/${group.poktan.length})`
                  : "Data Poktan"}
              </h5>
              {isGapoktan && activePoktans.length > 1 && (
                <span className="text-[10px] text-muted-foreground italic">
                  Tap &times; untuk hapus poktan
                </span>
              )}
            </div>
            <div className="space-y-2">
              {activePoktans.map((poktan) => (
                <div
                  key={poktan.namaPoktan}
                  className={cn(
                    "rounded-lg border p-2.5 transition-colors",
                    isGapoktan && activePoktans.length > 1
                      ? "border-border bg-muted/30 hover:border-destructive/30"
                      : "border-border bg-muted/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">
                          {poktan.namaPoktan}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        <InfoRow
                          icon={<User className="w-3 h-3" />}
                          label="Ketua"
                          value={poktan.ketua.nama}
                          compact
                        />
                        <InfoRow
                          icon={<CreditCard className="w-3 h-3" />}
                          label="NIK"
                          value={poktan.ketua.nik}
                          compact
                        />
                        <InfoRow
                          icon={<Phone className="w-3 h-3" />}
                          label="HP"
                          value={poktan.ketua.noHp}
                          compact
                        />
                      </div>
                    </div>
                    {/* Poktan removal — visible, touch-friendly button */}
                    {isGapoktan && activePoktans.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRemovePoktan(poktan.namaPoktan)}
                        className="min-h-[36px] min-w-[36px] h-auto px-2 py-1.5 text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/5 flex-shrink-0 gap-1"
                        title="Hapus poktan dari pengajuan ini"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span className="text-[11px] hidden sm:inline">Hapus</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Removed poktan indicator */}
              {isGapoktan && group.poktan.length > activePoktans.length && (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 px-3 py-2 bg-muted/10">
                  <p className="text-[11px] text-muted-foreground text-center">
                    {group.poktan.length - activePoktans.length} poktan tidak diikutkan dalam pengajuan ini
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// =============================================
// Sub-component: Info Row
// =============================================

function InfoRow({
  icon,
  label,
  value,
  compact = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground flex-shrink-0">{icon}</span>
      <span
        className={cn(
          "text-muted-foreground flex-shrink-0",
          compact ? "text-[10px]" : "text-xs"
        )}
      >
        {label}:
      </span>
      <span
        className={cn(
          "font-medium truncate",
          compact ? "text-[11px]" : "text-xs"
        )}
      >
        {value}
      </span>
    </div>
  );
}
