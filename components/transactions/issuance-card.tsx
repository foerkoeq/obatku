// # START OF Issuance Card Component - Card for distribution-ready transactions
// Purpose: Display transaction cards for ready-to-distribute items with navigation to wizard
// Features: Transaction info display, priority indicators, navigation to process wizard
// Props: transaction
// Dependencies: Card components, navigation utilities, transaction types

"use client";

import { useRouter } from "next/navigation";
import { Transaction } from "@/lib/types/transaction";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface IssuanceCardProps {
  transaction: Transaction;
}

const IssuanceCard = ({ transaction }: IssuanceCardProps) => {
  const router = useRouter();
  const { submissionDate, priority, status, farmerGroup, bppOfficer, farmingDetails } = transaction;

  // Calculate time since submission
  const timeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return Math.floor(seconds) + " detik lalu";
  };

  // Priority configuration for display
  const priorityConfig = {
    urgent: { label: "Sangat Penting", color: "bg-red-500", icon: "lucide:siren" },
    high: { label: "Penting", color: "bg-orange-500", icon: "lucide:alert-triangle" },
    medium: { label: "Sedang", color: "bg-yellow-500", icon: "lucide:shield-half" },
    low: { label: "Rendah", color: "bg-green-500", icon: "lucide:shield-check" },
  };
  
  // Calculate total approved items
  const totalApproved = transaction.approval?.approvedDrugs.reduce((sum, drug) => sum + drug.approvedQuantity, 0) ?? 0;

  // Handle start distribution process
  const handleStartProcess = () => {
    router.push(`/transactions/outgoing/process/${transaction.id}`);
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 ease-in-out group">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold leading-tight">
            {farmerGroup.name}
          </CardTitle>
          <Badge
            className={cn(
              "text-white text-xs",
              priorityConfig[priority]?.color
            )}
          >
            <Icon icon={priorityConfig[priority]?.icon} className="w-3 h-3 mr-1" />
            {priorityConfig[priority]?.label || "Normal"}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {farmerGroup.district} - {farmingDetails.commodity}
        </p>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${bppOfficer.name}`} 
              alt={bppOfficer.name} 
            />
            <AvatarFallback>
              {bppOfficer.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{bppOfficer.name}</p>
            <p className="text-xs text-gray-500">
              Diajukan {timeSince(submissionDate)}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm pt-2">
          <div className="flex items-center">
            <Icon icon="lucide:boxes" className="w-4 h-4 mr-2 text-gray-500" />
            <span>Total item disetujui: <strong>{totalApproved} unit</strong></span>
          </div>
          <div className="flex items-center">
            <Icon icon="lucide:bug" className="w-4 h-4 mr-2 text-gray-500" />
            <span>Jenis OPT: <strong>{farmingDetails.pestType.join(', ')}</strong></span>
          </div>
          <div className="flex items-center">
            <Icon icon="lucide:clipboard-list" className="w-4 h-4 mr-2 text-gray-500" />
            <span>Status: </span>
            <Badge className="ml-1 capitalize text-xs border border-gray-300">
              {status.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* Quick Info */}
        <div className="border-t pt-3">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>No. Surat:</span>
              <span className="font-medium">{transaction.letterNumber}</span>
            </div>
            {transaction.approval?.pickupSchedule && (
              <div className="flex justify-between">
                <span>Jadwal Ambil:</span>
                <span className="font-medium">
                  {new Date(transaction.approval.pickupSchedule).toLocaleDateString('id-ID')}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="whitespace-normal break-words text-sm h-auto" 
          onClick={handleStartProcess}
          size="lg"
        >
          <Icon icon="lucide:package-open" className="w-4 h-4 mr-2" />
          Mulai Proses Pengeluaran
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IssuanceCard;

// # END OF Issuance Card Component 