"use client";

import { Transaction } from "@/lib/types/transaction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Building, MapPin, Hash, Calendar, Contact } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value, children }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 flex-shrink-0">
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    <div className="flex-grow">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {value && <p className="text-base font-semibold text-foreground">{value}</p>}
      {children && <div className="text-base font-semibold text-foreground">{children}</div>}
    </div>
  </div>
);

export const SubmissionDetailsCard = ({ transaction }: { transaction: Transaction }) => {
  const { letterNumber, submissionDate, bppOfficer, farmerGroup } = transaction;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Pengajuan</CardTitle>
        <CardDescription>
          Informasi dasar mengenai pemohon dan kelompok tani.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <InfoItem 
          icon={Hash} 
          label="Nomor Surat" 
          value={letterNumber} 
        />
        <InfoItem 
          icon={Calendar} 
          label="Tanggal Pengajuan" 
          value={submissionDate ? format(submissionDate, "d MMMM yyyy, HH:mm", { locale: id }) : '-'} 
        />
        <InfoItem 
          icon={User} 
          label="Petugas PPL" 
          value={bppOfficer.name} 
        />
        <InfoItem 
          icon={Contact} 
          label="NIP Petugas" 
          value={bppOfficer.nip} 
        />
        <InfoItem 
          icon={Building} 
          label="Kelompok Tani" 
          value={`${farmerGroup.name} (${farmerGroup.leader})`} 
        />
        <InfoItem 
          icon={MapPin} 
          label="Lokasi" 
          value={`${farmerGroup.village}, ${farmerGroup.subDistrict}, ${farmerGroup.district}`} 
        />
      </CardContent>
    </Card>
  );
};

export default SubmissionDetailsCard;
