"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Transaction } from "@/lib/types/transaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Step1Details } from "./step-1-details";
import { Step2Approval } from "./step-2-approval";
import { Step3Summary } from "./step-3-summary";
import { approvalWizardSchema } from "./types";
import type { ApprovalWizardSchema } from "./types";
import { transactionService } from '@/lib/services/transaction.service';
import { Icon } from "@/components/ui/icon";
import { RejectConfirmationDialog } from "./reject-confirmation-dialog";

interface ApprovalWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

const STEPS = {
  DETAILS: 1,
  APPROVAL: 2,
  SUMMARY: 3,
};

export const ApprovalWizardModal = ({
  isOpen,
  onClose,
  transaction,
}: ApprovalWizardModalProps) => {
  const [currentStep, setCurrentStep] = useState(STEPS.DETAILS);
  const [isRejecting, setIsRejecting] = useState(false);

  const form = useForm<ApprovalWizardSchema>({
    resolver: zodResolver(approvalWizardSchema),
    defaultValues: {
      approvedDrugs: [],
      noteToSubmitter: "",
      noteToWarehouse: "",
      pickupDate: undefined,
    },
    mode: "onChange"
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        approvedDrugs: [],
        noteToSubmitter: "",
        noteToWarehouse: "",
        pickupDate: undefined,
      });
      setCurrentStep(STEPS.DETAILS);
    }
  }, [isOpen, form]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof ApprovalWizardSchema)[] = [];
    if (currentStep === STEPS.DETAILS) {
      setCurrentStep(STEPS.APPROVAL);
      return;
    }
    if (currentStep === STEPS.APPROVAL) {
      fieldsToValidate = ['approvedDrugs'];
       const isValid = await form.trigger(fieldsToValidate);
      if (isValid) {
        setCurrentStep(STEPS.SUMMARY);
      }
      return;
    }
     if (currentStep === STEPS.SUMMARY) {
      const isValid = await form.trigger();
      if(isValid) {
         form.handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = (data: ApprovalWizardSchema) => {
    (async () => {
      try {
        const payload = {
          status: 'approved',
          noteToSubmitter: data.noteToSubmitter,
          noteToWarehouse: data.noteToWarehouse,
          approvedDrugs: data.approvedDrugs,
          pickupDate: data.pickupDate?.toISOString(),
        } as any;

        const resp = await transactionService.approve(transaction.id, payload);
        if (resp && resp.success) {
          toast.success(resp.message || 'Permintaan Berhasil Disetujui', {
            description: `Pengajuan dari ${transaction.farmerGroup.name} telah disetujui.`,
          });
          onClose();
        } else {
          throw resp;
        }
      } catch (err) {
        console.error(err);
        toast.error('Gagal memproses persetujuan');
      }
    })();
  };
  
  const handleConfirmRejection = (reason: string) => {
    console.log("Rejection Reason:", reason);
    toast.warning("Permintaan Dikembalikan untuk Revisi", {
     description: `Pengajuan dari ${transaction.farmerGroup.name} telah dikembalikan dengan catatan.`,
    });
    setIsRejecting(false);
    onClose();
  }
  
  const totalSteps = Object.keys(STEPS).length;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Review Pengajuan: {transaction.letterNumber} (Langkah {currentStep}/{totalSteps})
            </DialogTitle>
            <DialogDescription>
              {currentStep === STEPS.DETAILS && "Periksa detail pemohon dan informasi pertanian."}
              {currentStep === STEPS.APPROVAL && "Tentukan persetujuan dan alokasi obat."}
              {currentStep === STEPS.SUMMARY && "Ringkasan akhir sebelum finalisasi persetujuan."}
            </DialogDescription>
             <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-2">
              <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </DialogHeader>

          <div className="h-[calc(90vh-220px)] overflow-hidden">
            <div className="h-full">
              {currentStep === STEPS.DETAILS && (
                <Step1Details transaction={transaction} />
              )}
              {currentStep === STEPS.APPROVAL && (
                <Step2Approval form={form} transaction={transaction} />
              )}
              {currentStep === STEPS.SUMMARY && <Step3Summary form={form} transaction={transaction} />}
            </div>
          </div>
          
          <DialogFooter>
            <div className="w-full flex justify-between">
              <div>
                <Button
                  type="button"
                  color="destructive"
                  onClick={() => setIsRejecting(true)}
                >
                  Tolak
                </Button>
              </div>
              <div className="flex gap-2">
                {currentStep > STEPS.DETAILS && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Kembali
                  </Button>
                )}

                {currentStep < STEPS.SUMMARY ? (
                  <Button type="button" onClick={handleNext}>
                    Selanjutnya
                  </Button>
                ) : (
                  <Button type="button" onClick={handleNext}>
                     <Icon icon="lucide:send" className="w-4 h-4 mr-2" />
                    Kirim Persetujuan
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RejectConfirmationDialog
          isOpen={isRejecting}
          onClose={() => setIsRejecting(false)}
          onConfirm={handleConfirmRejection}
          farmerGroupName={transaction.farmerGroup.name}
      />
    </>
  );
}; 