"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, USER_ROLES, UserRoleType } from "@/lib/types/user";
import { TUBAN_KECAMATAN } from "@/lib/data/daerah-tuban";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, Loader2, MapPin, Shield } from "lucide-react";

// --- Constants ---

const ROLE_COLORS: Record<UserRoleType, string> = {
  Admin: "primary",
  Kabid: "violet",
  Kasubbid: "indigo",
  "Staf Dinas": "info",
  BPP: "warning",
  PPL: "success",
  POPT: "secondary",
};

const ROLE_DESCRIPTIONS: Record<UserRoleType, string> = {
  Admin: "Akses penuh ke seluruh sistem",
  Kabid: "Kepala Bidang – monitoring & persetujuan",
  Kasubbid: "Kepala Sub Bidang – supervisi kegiatan",
  "Staf Dinas": "Staf administrasi Dinas Pertanian",
  BPP: "Koordinator Balai Penyuluhan Pertanian",
  PPL: "Penyuluh Pertanian Lapangan",
  POPT: "Pengamat Organisme Pengganggu Tumbuhan",
};

const LOKASI_AUTO_MAP: Partial<Record<UserRoleType, string>> = {
  Admin: "Admin",
  Kabid: "Dinas",
  Kasubbid: "Dinas",
  "Staf Dinas": "Dinas",
};

const ROLES_NEED_SINGLE_KECAMATAN: UserRoleType[] = ["BPP", "PPL"];
const ROLES_NEED_MULTI_KECAMATAN: UserRoleType[] = ["POPT"];

// --- Helper: multi kecamatan select ---

function MultiKecamatanSelect({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
}) {
  const toggle = (kec: string) => {
    if (value.includes(kec)) {
      onChange(value.filter((v) => v !== kec));
    } else {
      onChange([...value, kec]);
    }
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((kec) => (
            <Badge
              key={kec}
              color="primary"
              className="gap-1 cursor-pointer"
              onClick={() => !disabled && toggle(kec)}
            >
              Kec. {kec}
              <span className="text-[10px] opacity-70">✕</span>
            </Badge>
          ))}
        </div>
      )}
      <div className="border border-default-200 rounded-lg max-h-40 overflow-y-auto">
        {TUBAN_KECAMATAN.map((kec) => {
          const selected = value.includes(kec);
          return (
            <button
              key={kec}
              type="button"
              disabled={disabled}
              onClick={() => toggle(kec)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
                "hover:bg-default-100 focus:bg-default-100",
                selected && "bg-primary/5 text-primary font-medium",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-default-300"
                )}
              >
                {selected && <Check className="h-3 w-3" />}
              </div>
              <span>Kec. {kec}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-default-400">
        {value.length} kecamatan dipilih
      </p>
    </div>
  );
}

// --- Types ---

type ChangeRoleStatusModalProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updatedData: {
    role: UserRoleType;
    isActive: boolean;
    lokasi: string;
  }) => void;
};

// --- Main Component ---

export function ChangeRoleModal({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ChangeRoleStatusModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRoleType | undefined>();
  const [isActive, setIsActive] = useState(true);
  const [lokasi, setLokasi] = useState("");
  const [lokasiMultiple, setLokasiMultiple] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsSingleKecamatan =
    selectedRole != null && ROLES_NEED_SINGLE_KECAMATAN.includes(selectedRole);
  const needsMultiKecamatan =
    selectedRole != null && ROLES_NEED_MULTI_KECAMATAN.includes(selectedRole);
  const autoLokasi = selectedRole ? LOKASI_AUTO_MAP[selectedRole] : undefined;

  // Reset when user/open changes
  useEffect(() => {
    if (user && open) {
      setSelectedRole(user.role);
      setIsActive(user.isActive);
      // Pre-fill lokasi based on current user data
      if (ROLES_NEED_SINGLE_KECAMATAN.includes(user.role)) {
        setLokasi(user.lokasi || "");
        setLokasiMultiple([]);
      } else if (ROLES_NEED_MULTI_KECAMATAN.includes(user.role)) {
        setLokasi("");
        setLokasiMultiple(user.lokasi ? [user.lokasi] : []);
      } else {
        setLokasi("");
        setLokasiMultiple([]);
      }
    }
  }, [user, open]);

  // Reset lokasi when role changes (but not on initial load)
  const handleRoleChange = (newRole: UserRoleType) => {
    setSelectedRole(newRole);
    // Clear lokasi fields when switching role category
    const newAutoLokasi = LOKASI_AUTO_MAP[newRole];
    if (newAutoLokasi) {
      setLokasi("");
      setLokasiMultiple([]);
    } else if (ROLES_NEED_SINGLE_KECAMATAN.includes(newRole)) {
      setLokasiMultiple([]);
      // Keep lokasi if same category, otherwise clear
      if (!user || !ROLES_NEED_SINGLE_KECAMATAN.includes(user.role)) {
        setLokasi("");
      }
    } else if (ROLES_NEED_MULTI_KECAMATAN.includes(newRole)) {
      setLokasi("");
      // Keep multi if same category, otherwise clear
      if (!user || !ROLES_NEED_MULTI_KECAMATAN.includes(user.role)) {
        setLokasiMultiple([]);
      }
    }
  };

  if (!user) return null;

  // Resolve final lokasi for comparison/saving
  const resolvedLokasi = autoLokasi
    ? autoLokasi
    : needsSingleKecamatan
      ? lokasi
      : needsMultiKecamatan
        ? lokasiMultiple[0] || ""
        : user.lokasi;

  const hasChanges =
    selectedRole !== user.role ||
    isActive !== user.isActive ||
    resolvedLokasi !== user.lokasi;

  // Validate before save
  const canSave = (() => {
    if (!hasChanges) return false;
    if (needsSingleKecamatan && !lokasi) return false;
    if (needsMultiKecamatan && lokasiMultiple.length === 0) return false;
    return true;
  })();

  const handleSave = async () => {
    if (!selectedRole || !canSave) return;

    try {
      setIsSubmitting(true);

      // Simulate API call (frontend-only)
      await new Promise((resolve) => setTimeout(resolve, 600));

      const changes: string[] = [];
      if (selectedRole !== user.role) {
        changes.push(`role menjadi ${selectedRole}`);
      }
      if (resolvedLokasi !== user.lokasi) {
        changes.push(`lokasi menjadi ${resolvedLokasi}`);
      }
      if (isActive !== user.isActive) {
        changes.push(`status menjadi ${isActive ? "Aktif" : "Nonaktif"}`);
      }

      toast.success(`Perubahan berhasil disimpan`, {
        description: `${user.name}: ${changes.join(", ")}.`,
      });

      onOpenChange(false);
      onSuccess?.({ role: selectedRole, isActive, lokasi: resolvedLokasi });
    } catch (error: any) {
      console.error("Error updating role/status:", error);
      toast.error("Gagal menyimpan perubahan", {
        description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="sm" className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base">Ubah Role & Status</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {user.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge color={ROLE_COLORS[user.role] as any} className="text-[11px]">
              {user.role}
            </Badge>
            <Badge
              color={user.isActive ? "success" : "default"}
              className="text-[11px]"
            >
              {user.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
            {hasChanges && (
              <span className="text-[11px] text-warning font-medium">
                • Ada perubahan
              </span>
            )}
          </div>

          <Separator />

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-default-700">Role</label>
            <Select
              value={selectedRole}
              onValueChange={(value: UserRoleType) => handleRoleChange(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    <span className="font-medium">{role}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRole && (
              <p className="text-xs text-default-400">
                {ROLE_DESCRIPTIONS[selectedRole]}
              </p>
            )}
          </div>

          {/* Lokasi — auto */}
          {autoLokasi && (
            <div className="rounded-lg border border-default-200 bg-default-50/50 p-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <MapPin className="h-3.5 w-3.5 text-default-400" />
                <p className="text-xs text-default-500">Lokasi Penugasan</p>
              </div>
              <p className="text-sm font-medium text-default-800">
                {autoLokasi === "Admin"
                  ? "Administrator Sistem"
                  : "Dinas Pertanian Kab. Tuban"}
              </p>
              <p className="text-xs text-default-400 mt-1">
                Lokasi ditetapkan otomatis berdasarkan role.
              </p>
            </div>
          )}

          {/* Lokasi — single kecamatan for BPP & PPL */}
          {needsSingleKecamatan && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-default-700">
                Kecamatan Penugasan <span className="text-destructive">*</span>
              </label>
              <Select
                value={lokasi}
                onValueChange={setLokasi}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kecamatan" />
                </SelectTrigger>
                <SelectContent>
                  {TUBAN_KECAMATAN.map((kec) => (
                    <SelectItem key={kec} value={kec}>
                      Kec. {kec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-default-400">
                {selectedRole === "BPP"
                  ? "BPP ditugaskan di 1 kecamatan sebagai koordinator."
                  : "PPL ditugaskan di 1 kecamatan."}
              </p>
              {needsSingleKecamatan && !lokasi && (
                <p className="text-xs text-destructive">Kecamatan wajib dipilih.</p>
              )}
            </div>
          )}

          {/* Lokasi — multi kecamatan for POPT */}
          {needsMultiKecamatan && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-default-700">
                Kecamatan Penugasan <span className="text-destructive">*</span>
              </label>
              <MultiKecamatanSelect
                value={lokasiMultiple}
                onChange={setLokasiMultiple}
                disabled={isSubmitting}
              />
              <p className="text-xs text-default-400">
                POPT dapat bertugas di beberapa kecamatan. Pilih minimal 1.
              </p>
              {lokasiMultiple.length === 0 && (
                <p className="text-xs text-destructive">Pilih minimal 1 kecamatan.</p>
              )}
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-default-700">Status Akun</label>
            <div className="flex items-center gap-3">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isSubmitting}
                color={isActive ? "success" : "default"}
              />
              <Badge
                color={isActive ? "success" : "default"}
                className="text-xs"
              >
                {isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <p className="text-xs text-default-400">
              Pengguna nonaktif tidak dapat login ke sistem.
            </p>
          </div>

          {/* Preview changes */}
          {hasChanges && (
            <>
              <Separator />
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <p className="text-xs font-medium text-warning mb-1.5">
                  Perubahan yang akan diterapkan:
                </p>
                <ul className="text-xs text-default-600 space-y-1">
                  {selectedRole !== user.role && (
                    <li className="flex items-center gap-1.5">
                      <span className="text-default-400">Role:</span>
                      <Badge
                        color={ROLE_COLORS[user.role] as any}
                        className="text-[10px] py-0 h-4"
                      >
                        {user.role}
                      </Badge>
                      <span className="text-default-400">→</span>
                      <Badge
                        color={ROLE_COLORS[selectedRole!] as any}
                        className="text-[10px] py-0 h-4"
                      >
                        {selectedRole}
                      </Badge>
                    </li>
                  )}
                  {resolvedLokasi !== user.lokasi && (
                    <li className="flex items-center gap-1.5">
                      <span className="text-default-400">Lokasi:</span>
                      <span>{user.lokasi}</span>
                      <span className="text-default-400">→</span>
                      <span className="font-medium">{resolvedLokasi}</span>
                    </li>
                  )}
                  {isActive !== user.isActive && (
                    <li className="flex items-center gap-1.5">
                      <span className="text-default-400">Status:</span>
                      <Badge
                        color={user.isActive ? "success" : "default"}
                        className="text-[10px] py-0 h-4"
                      >
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                      <span className="text-default-400">→</span>
                      <Badge
                        color={isActive ? "success" : "default"}
                        className="text-[10px] py-0 h-4"
                      >
                        {isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !canSave}
            color="primary"
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 