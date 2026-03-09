// # START OF Outgoing Process Sheet - Main wizard orchestrator for distribution process
// Purpose: Full-screen drawer (mobile) / large dialog (desktop) for step-by-step process
// Features: 6-step wizard, responsive, progress indicator, state management

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

// UI
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

// Types
import {
  OutgoingItem,
  OUTGOING_STATUS_CONFIG,
  OUTGOING_WIZARD_STEPS,
  OutgoingWizardState,
  initialWizardState,
} from "@/lib/types/outgoing";

// Steps
import StepDetail from "./steps/step-detail";
import StepScan from "./steps/step-scan";
import StepPhoto from "./steps/step-photo";
import StepDocument from "./steps/step-document";
import StepUpload from "./steps/step-upload";
import StepComplete from "./steps/step-complete";

// ─── Types ───

interface OutgoingProcessSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: OutgoingItem | null;
}

// ─── Step Progress Indicator ───

const StepProgressBar: React.FC<{
  steps: typeof OUTGOING_WIZARD_STEPS;
  currentStep: number;
}> = ({ steps, currentStep }) => (
  <div className="flex items-center gap-1 w-full">
    {steps.map((step, idx) => {
      const isActive = idx === currentStep;
      const isCompleted = idx < currentStep;
      return (
        <React.Fragment key={step.key}>
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-all",
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-sm"
                  : isCompleted
                    ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
              )}
            >
              {isCompleted ? (
                <Icon icon="heroicons:check-mini" className="w-4 h-4" />
              ) : (
                <Icon icon={step.icon} className="w-3.5 h-3.5" />
              )}
            </div>
            <span
              className={cn(
                "text-[11px] font-medium truncate hidden lg:inline",
                isActive
                  ? "text-gray-900 dark:text-gray-100"
                  : isCompleted
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-400 dark:text-gray-500"
              )}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 rounded-full min-w-[8px]",
                isCompleted
                  ? "bg-green-300 dark:bg-green-700"
                  : "bg-gray-200 dark:bg-gray-700"
              )}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Main Component ───

const OutgoingProcessSheet: React.FC<OutgoingProcessSheetProps> = ({
  open,
  onOpenChange,
  item,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [wizardState, setWizardState] = useState<OutgoingWizardState>(initialWizardState);

  // Reset state when item changes
  useEffect(() => {
    if (item && open) {
      setWizardState({ ...initialWizardState });
    }
  }, [item, open]);

  const handleUpdateState = useCallback((updates: Partial<OutgoingWizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }));
  }, []);

  if (!item) return null;

  const isSelesai = item.outgoingStatus === 'selesai';
  const statusConfig = OUTGOING_STATUS_CONFIG[item.outgoingStatus];
  const { currentStep } = wizardState;
  const currentStepConfig = OUTGOING_WIZARD_STEPS[currentStep];

  // ── Navigation ──
  const handleNext = () => {
    if (currentStep < OUTGOING_WIZARD_STEPS.length - 1) {
      setWizardState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setWizardState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const handleClose = () => {
    if (wizardState.isSubmitted || isSelesai || currentStep === 0) {
      onOpenChange(false);
      return;
    }
    if (confirm("Yakin ingin keluar? Progress yang belum disimpan akan hilang.")) {
      onOpenChange(false);
    }
  };

  const handleComplete = () => {
    onOpenChange(false);
  };

  // ── Step content ──
  const renderStepContent = () => {
    if (isSelesai) {
      return <StepDetail item={item} />;
    }

    switch (currentStepConfig?.key) {
      case 'detail':
        return <StepDetail item={item} />;
      case 'scan':
        return <StepScan item={item} wizardState={wizardState} onUpdateState={handleUpdateState} />;
      case 'photo':
        return <StepPhoto wizardState={wizardState} onUpdateState={handleUpdateState} />;
      case 'document':
        return <StepDocument item={item} wizardState={wizardState} onUpdateState={handleUpdateState} />;
      case 'upload':
        return <StepUpload wizardState={wizardState} onUpdateState={handleUpdateState} />;
      case 'complete':
        return (
          <StepComplete
            item={item}
            wizardState={wizardState}
            onUpdateState={handleUpdateState}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  // ── Footer actions ──
  const renderActions = () => {
    if (isSelesai) {
      return (
        <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
          Tutup
        </Button>
      );
    }

    if (wizardState.isSubmitted) return null;

    const isFirst = currentStep === 0;
    const isLast = currentStep === OUTGOING_WIZARD_STEPS.length - 1;

    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="sm:flex-1">
          {isFirst ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Tutup
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              className="w-full sm:w-auto"
            >
              <Icon icon="heroicons:chevron-left" className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          )}
        </div>
        <div className="flex gap-2 sm:flex-none">
          {!isLast && (
            <Button
              size="sm"
              onClick={handleNext}
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
            >
              Selanjutnya
              <Icon icon="heroicons:chevron-right" className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  // ── Title & description ──
  const title = isSelesai
    ? `Detail: ${item.namaGrup}`
    : `Proses: ${item.namaGrup}`;

  const description = isSelesai
    ? 'Rincian distribusi yang telah selesai'
    : currentStepConfig?.description ?? '';

  // ── Desktop: Dialog ──
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(v); }}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {title}
              </DialogTitle>
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
                statusConfig.badgeClass
              )}>
                <Icon icon={statusConfig.icon} className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>
            <DialogDescription className="text-sm text-gray-500">
              {description}
            </DialogDescription>
            {!isSelesai && !wizardState.isSubmitted && (
              <div className="mt-3">
                <StepProgressBar steps={OUTGOING_WIZARD_STEPS} currentStep={currentStep} />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 px-6 py-4 overflow-hidden">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-800/30">
            {renderActions()}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Mobile: Drawer (full screen) ──
  return (
    <Drawer open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(v); }}>
      <DrawerContent className="h-[95vh] flex flex-col">
        <DrawerHeader className="text-left shrink-0 pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-base font-bold">{title}</DrawerTitle>
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
              statusConfig.badgeClass
            )}>
              <Icon icon={statusConfig.icon} className="w-3 h-3" />
              {statusConfig.label}
            </span>
          </div>
          <DrawerDescription className="text-xs">{description}</DrawerDescription>
          {!isSelesai && !wizardState.isSubmitted && (
            <div className="mt-2">
              <StepProgressBar steps={OUTGOING_WIZARD_STEPS} currentStep={currentStep} />
            </div>
          )}
        </DrawerHeader>

        <div className="flex-1 min-h-0 px-4 overflow-hidden">
          {renderStepContent()}
        </div>

        <DrawerFooter className="shrink-0 pt-2 pb-4">
          {renderActions()}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default OutgoingProcessSheet;
// # END OF Outgoing Process Sheet
