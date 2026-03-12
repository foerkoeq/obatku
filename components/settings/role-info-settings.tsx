'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, MapPin, Info } from 'lucide-react';
import { User, UserRoleType } from '@/lib/types/user';

const ROLE_DESCRIPTIONS: Record<UserRoleType, string> = {
  Admin: 'Akses penuh ke seluruh sistem',
  Kabid: 'Kepala Bidang – monitoring & persetujuan',
  Kasubbid: 'Kepala Sub Bidang – supervisi kegiatan bidang',
  'Staf Dinas': 'Staf administrasi Dinas Pertanian',
  BPP: 'Balai Penyuluhan Pertanian – koordinator kecamatan',
  PPL: 'Penyuluh Pertanian Lapangan – tugas di 1 kecamatan',
  POPT: 'Pengamat OPT – bisa di beberapa kecamatan',
};

const ROLE_COLOR: Record<UserRoleType, 'primary' | 'info' | 'success' | 'warning' | 'purple' | 'teal' | 'indigo'> = {
  Admin: 'primary',
  Kabid: 'indigo',
  Kasubbid: 'purple',
  'Staf Dinas': 'teal',
  BPP: 'info',
  PPL: 'success',
  POPT: 'warning',
};

function getLokasiDisplay(user: User): string {
  if (user.role === 'Admin') return 'Administrator Sistem';
  if (['Kabid', 'Kasubbid', 'Staf Dinas'].includes(user.role)) {
    return 'Dinas Pertanian Kab. Tuban';
  }
  return `Kec. ${user.lokasi}`;
}

interface RoleInfoSettingsProps {
  user: User;
}

const RoleInfoSettings = ({ user }: RoleInfoSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role & Penugasan</CardTitle>
        <CardDescription>
          Informasi role, status, dan lokasi penugasan Anda. Hubungi Admin jika perlu perubahan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Role */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Role</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge color={ROLE_COLOR[user.role]} className="text-sm px-3 py-1">
              {user.role}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {ROLE_DESCRIPTIONS[user.role]}
            </span>
          </div>
        </div>

        <Separator />

        {/* Status */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Status Akun</div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                user.isActive ? 'bg-success' : 'bg-destructive'
              }`}
            />
            <span className="text-sm font-medium">
              {user.isActive ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
        </div>

        <Separator />

        {/* Lokasi */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Lokasi Penugasan</span>
          </div>
          <p className="text-sm font-medium">{getLokasiDisplay(user)}</p>
        </div>

        {/* Info box */}
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-info/30 bg-info/5 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Role, status, dan lokasi penugasan hanya dapat diubah oleh Administrator. 
            Jika ada perubahan yang diperlukan, silakan hubungi Admin sistem Anda.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleInfoSettings;
