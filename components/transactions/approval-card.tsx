"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Transaction, UserRole } from "@/lib/types/transaction";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { ApprovalWizardModal } from "./approval-wizard";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

// Mock available stock - in real app, this would come from inventory query
const MOCK_INVENTORY = {
  'DRUG-001': { name: 'Virtako 40 WG', stock: 15 },
  'DRUG-002': { name: 'Lannate 40 SP', stock: 10 },
  'DRUG-003': { name: 'Curacon 550 EC', stock: 5 },
  'DRUG-004': { name: 'Pegasus 500 SC', stock: 20 },
};

const approvalSchema = z.object({
  status: z.enum(["approved", "rejected"], { required_error: "Pilih status persetujuan." }),
  noteToSubmitter: z.string().optional(),
  noteToWarehouse: z.string().optional(),
  approvedDrugs: z.array(z.object({
    drugId: z.string(),
    drugName: z.string(),
    requestedQuantity: z.number(),
    approvedQuantity: z.number().min(0, "Jumlah tidak boleh negatif."),
  })).optional(),
}).refine(data => {
  if (data.status === 'rejected') {
    return data.noteToSubmitter && data.noteToSubmitter.length > 0;
  }
  return true;
}, {
  message: "Catatan wajib diisi jika pengajuan ditolak.",
  path: ["noteToSubmitter"],
});

type ApprovalFormData = z.infer<typeof approvalSchema>;

interface ApprovalCardProps {
  transaction: Transaction;
}

const ApprovalCard = ({ transaction }: ApprovalCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { farmerGroup, farmingDetails, submissionDate, priority, bppOfficer, status } = transaction;

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
    urgent: { label: "Sangat Penting", color: "bg-red-500" },
    high: { label: "Penting", color: "bg-orange-500" },
    medium: { label: "Sedang", color: "bg-yellow-500" },
    low: { label: "Rendah", color: "bg-green-500" },
  };

  return (
    <>
      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 ease-in-out">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold leading-tight">{farmerGroup.name}</CardTitle>
            <Badge
              className={cn(
                "text-white text-xs",
                priorityConfig[priority]?.color
              )}
            >
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

          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Icon icon="lucide:tractor" className="w-4 h-4 mr-2 text-gray-500" />
              <span>Komoditas: <strong>{farmingDetails.commodity}</strong></span>
            </div>
            <div className="flex items-center">
              <Icon icon="lucide:bug" className="w-4 h-4 mr-2 text-gray-500" />
              <span>OPT: <strong>{farmingDetails.pestType.join(", ")}</strong></span>
            </div>
             <div className="flex items-center">
              <Icon icon="lucide:clipboard-list" className="w-4 h-4 mr-2 text-gray-500" />
              <span>Status: <Badge color="secondary" className="capitalize">{status.replace("_", " ")}</Badge></span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setIsModalOpen(true)}>
            <Icon icon="lucide:clipboard-check" className="w-4 h-4 mr-2" />
            Review Pengajuan
          </Button>
        </CardFooter>
      </Card>
      
      <ApprovalWizardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={transaction}
      /> 
      
    </>
  );
};

export default ApprovalCard;
