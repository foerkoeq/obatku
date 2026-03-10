"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Shield,
  Briefcase,
  Award,
  Hash,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, UserRoleType } from "@/lib/types/user";

interface UserDetailModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onChangeRoleStatus?: (user: User) => void;
}

const ROLE_COLORS: Record<UserRoleType, string> = {
  Admin: "primary",
  Kabid: "violet",
  Kasubbid: "indigo",
  "Staf Dinas": "info",
  BPP: "warning",
  PPL: "success",
  POPT: "secondary",
};

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd MMMM yyyy", { locale: idLocale });
  } catch {
    return dateStr;
  }
}

function getLokasiLabel(lokasi: string) {
  if (lokasi === "Admin") return "Administrator Sistem";
  if (lokasi === "Dinas") return "Dinas Pertanian Kab. Tuban";
  return `BPP Kec. ${lokasi}`;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-default-100 text-default-500">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-default-400 mb-0.5">{label}</p>
        <p className="text-sm text-default-800 font-medium break-words">{value || "-"}</p>
      </div>
    </div>
  );
}

export function UserDetailModal({
  open,
  user,
  onClose,
  onEdit,
  onDelete,
  onChangeRoleStatus,
}: UserDetailModalProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="md" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <DialogTitle className="text-lg sm:text-xl">Detail Pengguna</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge color={ROLE_COLORS[user.role] as any}>{user.role}</Badge>
              <Badge
                color={user.isActive ? "success" : "default"}
                className="text-[11px]"
              >
                {user.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
          </div>
          <DialogDescription>
            Informasi lengkap pengguna {user.name}
          </DialogDescription>
        </DialogHeader>

        {/* User Header Card */}
        <div className="rounded-xl border border-default-200 bg-default-50/50 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-default-900 text-base sm:text-lg truncate">
                {user.name}
              </h3>
              <p className="text-sm text-default-500">@{user.username}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InfoRow icon={UserIcon} label="Username" value={`@${user.username}`} />
          <InfoRow icon={Hash} label="NIP / NIPPPK" value={user.nip} />
          <InfoRow icon={Award} label="Pangkat" value={user.pangkat} />
          <InfoRow icon={Shield} label="Golongan" value={user.golongan} />
          <InfoRow icon={Briefcase} label="Jabatan" value={user.jabatan} />
          <InfoRow
            icon={Calendar}
            label="Tanggal Lahir"
            value={formatDate(user.birthDate)}
          />
          <InfoRow icon={MapPin} label="Lokasi Penugasan" value={getLokasiLabel(user.lokasi)} />
          <InfoRow
            icon={Calendar}
            label="Tanggal Terdaftar"
            value={formatDate(user.createdAt)}
          />
          {user.phone && (
            <InfoRow icon={Phone} label="No. Telepon" value={user.phone} />
          )}
          {user.email && (
            <InfoRow icon={Mail} label="Email" value={user.email} />
          )}
        </div>

        {/* Actions */}
        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            className="gap-2 w-full sm:w-auto order-4 sm:order-1"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto order-1 sm:order-2">
            {onChangeRoleStatus && (
              <Button
                variant="soft"
                color="primary"
                className="gap-2 flex-1 sm:flex-none"
                onClick={() => onChangeRoleStatus(user)}
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden xs:inline">Ubah</span> Role & Status
              </Button>
            )}
            <Button
              variant="outline"
              className="gap-2 flex-1 sm:flex-none"
              onClick={() => onEdit(user)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              color="destructive"
              className="gap-2 flex-1 sm:flex-none"
              onClick={() => onDelete(user)}
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
