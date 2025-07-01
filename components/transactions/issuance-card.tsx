"use client";

import { useState } from "react";
import { Transaction } from "@/lib/types/transaction";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { IssuanceModal } from "./issuance-modal";

interface IssuanceCardProps {
  transaction: Transaction;
}

const IssuanceCard = ({ transaction }: IssuanceCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { farmerGroup, bppOfficer, submissionDate, priority, status } = transaction;

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

  const priorityConfig = {
    urgent: { label: "Sangat Penting", color: "bg-red-500", icon: "lucide:siren" },
    high: { label: "Penting", color: "bg-orange-500", icon: "lucide:alert-triangle" },
    medium: { label: "Sedang", color: "bg-yellow-500", icon: "lucide:shield-half" },
    low: { label: "Rendah", color: "bg-green-500", icon: "lucide:shield-check" },
  };
  
  const totalApproved = transaction.approval?.approvedDrugs.reduce((sum, drug) => sum + drug.approvedQuantity, 0) ?? 0;

  return (
    <>
      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 ease-in-out group">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold leading-tight">{farmerGroup.name}</CardTitle>
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
            {farmerGroup.district}, {farmerGroup.village}
          </p>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${bppOfficer.name}`} alt={bppOfficer.name} />
              <AvatarFallback>{bppOfficer.name.substring(0, 2)}</AvatarFallback>
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
              <Icon icon="lucide:clipboard-list" className="w-4 h-4 mr-2 text-gray-500" />
              <span>Status: <Badge color="success" className="capitalize">{status.replace("_", " ")}</Badge></span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setIsModalOpen(true)}>
            <Icon icon="lucide:package-open" className="w-4 h-4 mr-2" />
            Proses Pengeluaran
          </Button>
        </CardFooter>
      </Card>
      
      <IssuanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={transaction}
      />
    </>
  );
};

export default IssuanceCard; 