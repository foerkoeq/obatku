// # START OF Approval Review Modal - Main modal controller for approval workflow
// Purpose: Orchestrate wizard steps based on status (pengajuan/persetujuan/gudang)
// Features: Responsive Dialog/Drawer, step progress, status-aware flows
// Mobile-first: Full-screen drawer on mobile, large dialog on desktop

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  DialogFooter,
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
import { ScrollArea } from "@/components/ui/scroll-area";

// Types
import {
  ApprovalItem,
  ApprovalStatus,
  APPROVAL_STATUS_CONFIG,
  PENGAJUAN_STEPS,
  GUDANG_STEPS,
  MedicineSelectionState,
  GudangScannedItem,
  PengajuanStep,
  GudangStep,
} from "@/lib/types/approval";

// Steps
import StepInfoDasar from "./steps/step-info-dasar";
import StepDetailPoktan from "./steps/step-detail-poktan";
import StepSummary from "./steps/step-summary";
import StepGudangList from "./steps/step-gudang-list";
import StepGudangScan from "./steps/step-gudang-scan";

// Modals
import ReturnModal from "./return-modal";

// ─── Types ───

interface ApprovalReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ApprovalItem | null;
}

// ─── Step Progress Indicator ───

const StepIndicator: React.FC<{
  steps: { key: string; label: string; icon: string }[];
  currentIndex: number;
  statusConfig: (typeof APPROVAL_STATUS_CONFIG)[ApprovalStatus];
}> = ({ steps, currentIndex, statusConfig }) => (
  <div className="flex items-center gap-1 w-full">
    {steps.map((step, idx) => {
      const isActive = idx === currentIndex;
      const isCompleted = idx < currentIndex;
      return (
        <React.Fragment key={step.key}>
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-all",
                isActive
                  ? `bg-gradient-to-r ${statusConfig.gradientFrom} ${statusConfig.gradientTo} text-white shadow-sm`
                  : isCompleted
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              )}
            >
              {isCompleted ? (
                <Icon icon="heroicons:check-mini" className="w-4 h-4" />
              ) : (
                <span className="text-[11px] font-bold">{idx + 1}</span>
              )}
            </div>
            <span
              className={cn(
                "text-[11px] font-medium truncate hidden sm:inline",
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
                "flex-1 h-0.5 rounded-full min-w-[16px]",
                isCompleted
                  ? 'bg-green-300 dark:bg-green-700'
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Main Component ───

const ApprovalReviewModal: React.FC<ApprovalReviewModalProps> = ({
  open,
  onOpenChange,
  item,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // ── State ──
  const [pengajuanStep, setPengajuanStep] = useState(0);
  const [gudangStep, setGudangStep] = useState(0);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showPembenahanModal, setShowPembenahanModal] = useState(false);
  const [redirectToPengajuan, setRedirectToPengajuan] = useState(false);

  // Medicine selections (for pengajuan flow)
  const [selections, setSelections] = useState<MedicineSelectionState[]>([]);

  // Gudang scan items
  const [scannedItems, setScannedItems] = useState<GudangScannedItem[]>([]);

  // ── Initialize selections when item changes ──
  useEffect(() => {
    if (item && open) {
      setPengajuanStep(0);
      setGudangStep(0);
      setShowReturnModal(false);
      setShowPembenahanModal(false);
      setRedirectToPengajuan(false);
      setScannedItems([]);

      // Initialize medicine selections for each poktan
      const initialSelections: MedicineSelectionState[] = item.poktanList.map((p) => ({
        poktanId: p.id,
        selectedMedicines: [],
      }));
      setSelections(initialSelections);
    }
  }, [item, open]);

  if (!item) return null;

  const statusConfig = APPROVAL_STATUS_CONFIG[item.status];

  // ── Determine which flow to show ──
  const effectiveStatus: ApprovalStatus = redirectToPengajuan ? 'pengajuan_dinas' : item.status;

  // ── Pengajuan ke Dinas Flow ──
  const renderPengajuan = () => {
    const steps = PENGAJUAN_STEPS;
    const currentStep = steps[pengajuanStep];

    return (
      <>
        <StepIndicator steps={steps} currentIndex={pengajuanStep} statusConfig={APPROVAL_STATUS_CONFIG.pengajuan_dinas} />
        <div className="flex-1 min-h-0 mt-3">
          {currentStep.key === 'info_dasar' && <StepInfoDasar item={item} />}
          {currentStep.key === 'detail_poktan' && (
            <StepDetailPoktan
              item={item}
              selections={selections}
              onSelectionsChange={setSelections}
            />
          )}
          {currentStep.key === 'kesimpulan' && (
            <StepSummary item={item} selections={selections} />
          )}
        </div>
      </>
    );
  };

  // ── Persetujuan Dinas Flow ──
  const renderPersetujuan = () => (
    <>
      <div className="flex-1 min-h-0">
        <StepSummary item={item} readOnly />
      </div>
    </>
  );

  // ── Proses Gudang Flow ──
  const renderGudang = () => {
    const steps = GUDANG_STEPS;

    return (
      <>
        <StepIndicator steps={steps} currentIndex={gudangStep} statusConfig={APPROVAL_STATUS_CONFIG.proses_gudang} />
        <div className="flex-1 min-h-0 mt-3">
          {steps[gudangStep].key === 'list_obat' && <StepGudangList item={item} />}
          {steps[gudangStep].key === 'scan_qr' && (
            <StepGudangScan
              item={item}
              scannedItems={scannedItems}
              onScannedItemsChange={setScannedItems}
            />
          )}
        </div>
      </>
    );
  };

  // ── Footer Actions ──
  const renderPengajuanActions = () => {
    const isFirstStep = pengajuanStep === 0;
    const isLastStep = pengajuanStep === PENGAJUAN_STEPS.length - 1;

    const hasSelectedMedicines = selections.some(
      (s) => s.selectedMedicines.some((m) => m.jumlahBesar > 0 || m.jumlahKecil > 0)
    );

    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        {/* Left: Kembalikan (only on step 1) */}
        <div className="sm:flex-1">
          {isFirstStep && !redirectToPengajuan && (
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
              onClick={() => setShowReturnModal(true)}
            >
              <Icon icon="heroicons:arrow-uturn-left" className="w-4 h-4 mr-1.5" />
              Kembalikan
            </Button>
          )}
        </div>

        {/* Right: Back / Next / Submit */}
        <div className="flex gap-2 sm:flex-none">
          {!isFirstStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPengajuanStep((p) => p - 1)}
              className="flex-1 sm:flex-none"
            >
              <Icon icon="heroicons:chevron-left" className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          )}
          {!isLastStep ? (
            <Button
              size="sm"
              onClick={() => {
                if (pengajuanStep === 1 && !hasSelectedMedicines) {
                  toast.warning('Pilih minimal 1 obat dengan jumlah > 0');
                  return;
                }
                setPengajuanStep((p) => p + 1);
              }}
              className={cn(
                "flex-1 sm:flex-none bg-gradient-to-r text-white",
                APPROVAL_STATUS_CONFIG.pengajuan_dinas.gradientFrom,
                APPROVAL_STATUS_CONFIG.pengajuan_dinas.gradientTo
              )}
            >
              Selanjutnya
              <Icon icon="heroicons:chevron-right" className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleProcessApproval}
              className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
            >
              <Icon icon="heroicons:check-badge" className="w-4 h-4 mr-1.5" />
              Proses Persetujuan
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderPersetujuanActions = () => (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <div className="sm:flex-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="w-full sm:w-auto"
        >
          Kembali
        </Button>
      </div>
      <div className="flex gap-2 sm:flex-none">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
          onClick={() => setShowPembenahanModal(true)}
        >
          <Icon icon="heroicons:wrench-screwdriver" className="w-4 h-4 mr-1.5" />
          Pembenahan
        </Button>
        <Button
          size="sm"
          onClick={handleProcessGudang}
          className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:from-purple-600 hover:to-fuchsia-600"
        >
          <Icon icon="heroicons:building-storefront" className="w-4 h-4 mr-1.5" />
          Proses Gudang
        </Button>
      </div>
    </div>
  );

  const renderGudangActions = () => {
    const isFirstStep = gudangStep === 0;
    const isLastStep = gudangStep === GUDANG_STEPS.length - 1;

    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="sm:flex-1">
          {!isFirstStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGudangStep((p) => p - 1)}
              className="w-full sm:w-auto"
            >
              <Icon icon="heroicons:chevron-left" className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          )}
        </div>
        <div className="flex gap-2 sm:flex-none">
          {!isLastStep ? (
            <Button
              size="sm"
              onClick={() => setGudangStep((p) => p + 1)}
              className={cn(
                "flex-1 sm:flex-none bg-gradient-to-r text-white",
                APPROVAL_STATUS_CONFIG.proses_gudang.gradientFrom,
                APPROVAL_STATUS_CONFIG.proses_gudang.gradientTo
              )}
            >
              Selanjutnya
              <Icon icon="heroicons:chevron-right" className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleConfirmDistribution}
              className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
            >
              <Icon icon="heroicons:check-badge" className="w-4 h-4 mr-1.5" />
              Konfirmasi Distribusi
            </Button>
          )}
        </div>
      </div>
    );
  };

  // ── Action Handlers ──

  function handleProcessApproval() {
    toast.success('Pengajuan berhasil disetujui!', {
      description: `Pengajuan dari ${item?.namaGrup ?? '-'} telah diproses.`,
    });
    onOpenChange(false);
  }

  function handleProcessGudang() {
    toast.success('Diteruskan ke proses gudang!', {
      description: `Pengajuan ${item?.namaGrup ?? '-'} siap diproses gudang.`,
    });
    onOpenChange(false);
  }

  function handleConfirmDistribution() {
    const validScans = scannedItems.filter((s) => s.isValid).length;
    if (validScans === 0) {
      toast.warning('Scan minimal 1 item obat sebelum konfirmasi');
      return;
    }
    toast.success('Distribusi berhasil dikonfirmasi!', {
      description: `${validScans} item obat telah diverifikasi untuk ${item?.namaGrup ?? '-'}.`,
    });
    onOpenChange(false);
  }

  function handleReturn(reason: string) {
    toast.info('Pengajuan dikembalikan', {
      description: `Alasan: ${reason.substring(0, 50)}...`,
    });
    setShowReturnModal(false);
    onOpenChange(false);
  }

  function handlePembenahan(reason: string) {
    toast.info('Pembenahan dimulai', {
      description: `Alasan: ${reason.substring(0, 50)}...`,
    });
    setShowPembenahanModal(false);
    // Redirect to pengajuan flow for editing
    setRedirectToPengajuan(true);
    setPengajuanStep(0);
  }

  // ── Current title & description ──
  const getTitle = () => {
    if (effectiveStatus === 'pengajuan_dinas') {
      return `Review: ${item.namaGrup}`;
    }
    if (effectiveStatus === 'persetujuan_dinas') {
      return `Persetujuan: ${item.namaGrup}`;
    }
    return `Proses Gudang: ${item.namaGrup}`;
  };

  const getDescription = () => {
    if (effectiveStatus === 'pengajuan_dinas') {
      return PENGAJUAN_STEPS[pengajuanStep]?.label || '';
    }
    if (effectiveStatus === 'persetujuan_dinas') {
      return 'Ringkasan data persetujuan';
    }
    return GUDANG_STEPS[gudangStep]?.label || '';
  };

  // ── Render Content ──
  const renderContent = () => (
    <div className="flex flex-col h-full">
      {effectiveStatus === 'pengajuan_dinas' && renderPengajuan()}
      {effectiveStatus === 'persetujuan_dinas' && !redirectToPengajuan && renderPersetujuan()}
      {effectiveStatus === 'proses_gudang' && renderGudang()}
    </div>
  );

  const renderActions = () => {
    if (effectiveStatus === 'pengajuan_dinas' || redirectToPengajuan) return renderPengajuanActions();
    if (effectiveStatus === 'persetujuan_dinas' && !redirectToPengajuan) return renderPersetujuanActions();
    if (effectiveStatus === 'proses_gudang') return renderGudangActions();
    return null;
  };

  // ── Desktop: Dialog ──
  if (isDesktop) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center justify-between mb-1">
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {getTitle()}
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
                {getDescription()}
              </DialogDescription>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 px-6 py-4 overflow-hidden">
              {renderContent()}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-800/30">
              {renderActions()}
            </div>
          </DialogContent>
        </Dialog>

        <ReturnModal
          open={showReturnModal}
          onOpenChange={setShowReturnModal}
          variant="return"
          onConfirm={handleReturn}
        />
        <ReturnModal
          open={showPembenahanModal}
          onOpenChange={setShowPembenahanModal}
          title="Pembenahan Data"
          description="Berikan alasan pembenahan agar data dapat diperbaiki."
          confirmLabel="Benahi"
          confirmIcon="heroicons:wrench-screwdriver"
          variant="fix"
          onConfirm={handlePembenahan}
        />
      </>
    );
  }

  // ── Mobile: Drawer (full screen) ──
  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[95vh] flex flex-col">
          <DrawerHeader className="text-left shrink-0 pb-2">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-base font-bold">{getTitle()}</DrawerTitle>
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                statusConfig.badgeClass
              )}>
                <Icon icon={statusConfig.icon} className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>
            <DrawerDescription className="text-xs">{getDescription()}</DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 min-h-0 px-4 overflow-hidden">
            {renderContent()}
          </div>

          <DrawerFooter className="shrink-0 pt-2 pb-4">
            {renderActions()}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <ReturnModal
        open={showReturnModal}
        onOpenChange={setShowReturnModal}
        variant="return"
        onConfirm={handleReturn}
      />
      <ReturnModal
        open={showPembenahanModal}
        onOpenChange={setShowPembenahanModal}
        title="Pembenahan Data"
        description="Berikan alasan pembenahan agar data dapat diperbaiki."
        confirmLabel="Benahi"
        confirmIcon="heroicons:wrench-screwdriver"
        variant="fix"
        onConfirm={handlePembenahan}
      />
    </>
  );
};

export default ApprovalReviewModal;
