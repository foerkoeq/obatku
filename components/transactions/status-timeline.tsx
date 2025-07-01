"use client";

import { Transaction, TransactionStatus } from "@/lib/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, CircleDot, Clock, FileCheck, FileText, Package, Send, Truck, XCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface TimelineStep {
  status: TransactionStatus | 'created';
  title: string;
  description: (t: Transaction) => string;
  icon: React.ElementType;
  isReached: (t: Transaction) => boolean;
}

const timelineSteps: TimelineStep[] = [
  {
    status: 'created',
    title: "Pengajuan Dibuat",
    description: (t) => t.submissionDate ? format(t.submissionDate, "d MMMM yyyy", { locale: id }) : 'Menunggu',
    icon: FileText,
    isReached: (t) => !!t.submissionDate,
  },
  {
    status: 'under_review',
    title: "Verifikasi Dinas",
    description: (t) => {
      if (t.status === 'rejected') return "Pengajuan ditolak";
      if (t.approval?.approvedDate) return `Diverifikasi pada ${format(t.approval.approvedDate, "d MMMM yyyy", { locale: id })}`;
      return "Menunggu persetujuan";
    },
    icon: FileCheck,
    isReached: (t) => !!t.approval || t.status === 'rejected',
  },
  {
    status: 'ready_distribution',
    title: "Obat Disiapkan",
    description: (t) => {
      if (t.status === 'rejected') return "-";
      return t.distribution?.distributedDate ? `Disiapkan oleh gudang` : "Menunggu disiapkan gudang";
    },
    icon: Package,
    isReached: (t) => t.status === 'ready_distribution' || t.status === 'completed',
  },
  {
    status: 'completed',
    title: "Didistribusikan & Selesai",
    description: (t) => {
      if (t.status === 'rejected') return "-";
      return t.distribution?.distributedDate ? `Selesai pada ${format(t.distribution.distributedDate, "d MMMM yyyy", { locale: id })}` : "Menunggu distribusi";
    },
    icon: Truck,
    isReached: (t) => t.status === 'completed',
  },
];

const getStepStatus = (step: TimelineStep, transaction: Transaction) => {
  const isReached = step.isReached(transaction);
  const isRejected = transaction.status === 'rejected' && step.status === 'under_review';
  
  // Find current step index
  const currentStepIndex = timelineSteps.findIndex(s => s.status === transaction.status);
  const thisStepIndex = timelineSteps.findIndex(s => s.status === step.status);

  const isActive = step.status === transaction.status;

  if (isRejected) return "rejected";
  if (isActive) return "active";
  if (isReached) return "completed";
  
  return "pending";
};

export const StatusTimeline = ({ transaction }: { transaction: Transaction }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progres Pengajuan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
          
          <ul className="space-y-8">
            {timelineSteps.map((step, index) => {
              const status = getStepStatus(step, transaction);
              const Icon = status === 'rejected' ? XCircle : step.icon;
              return (
                <li key={index} className="flex items-start gap-4 relative">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center z-10",
                      status === 'completed' && "bg-green-500 text-white",
                      status === 'active' && "bg-blue-500 text-white",
                      status === 'pending' && "bg-muted-foreground/20 text-muted-foreground",
                      status === 'rejected' && "bg-destructive text-white",
                    )}
                  >
                    {status === 'active' ? 
                      <CircleDot size={20} className="animate-pulse" /> : 
                      <Icon size={18} />
                    }
                  </div>
                  <div className="mt-1">
                    <p className={cn("font-semibold", status === 'pending' && "text-muted-foreground")}>
                      {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {step.description(transaction)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusTimeline;
