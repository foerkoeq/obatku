"use client";

import { Transaction } from "@/lib/types/transaction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, LandPlot, Bug, FileText } from "lucide-react";

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

export const FarmingInfoCard = ({ transaction }: { transaction: Transaction }) => {
  const { farmingDetails } = transaction;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Pertanian</CardTitle>
        <CardDescription>
          Informasi mengenai lahan dan serangan organisme pengganggu tanaman (OPT).
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <InfoItem 
          icon={Leaf} 
          label="Komoditas" 
          value={farmingDetails.commodity} 
        />
        <InfoItem 
          icon={LandPlot} 
          label="Luas Lahan"
        >
          <p>
            <span className="font-bold">{farmingDetails.affectedArea} Ha</span> terserang dari total{" "}
            <span className="font-bold">{farmingDetails.totalArea} Ha</span>
          </p>
        </InfoItem>
        <InfoItem 
          icon={Bug} 
          label="Jenis OPT"
        >
          <div className="flex flex-wrap gap-2">
            {farmingDetails.pestType.map((pest) => (
              <Badge key={pest} color="secondary">{pest}</Badge>
            ))}
          </div>
        </InfoItem>
        {farmingDetails.pestDescription &&
          <div className="md:col-span-2">
            <InfoItem
              icon={FileText}
              label="Deskripsi Serangan"
              value={farmingDetails.pestDescription}
            />
          </div>
        }
      </CardContent>
    </Card>
  );
};

export default FarmingInfoCard;
