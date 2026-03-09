// # START OF Step Complete - Confirmation & finish
// Purpose: Final summary and confirmation to complete the distribution process
// Features: Summary of all steps, confirmation button, success animation

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { OutgoingItem, OutgoingWizardState, OUTGOING_WIZARD_STEPS } from "@/lib/types/outgoing";
import { formatTanggalOutgoing } from "@/lib/data/outgoing-mock";

interface StepCompleteProps {
  item: OutgoingItem;
  wizardState: OutgoingWizardState;
  onUpdateState: (updates: Partial<OutgoingWizardState>) => void;
  onComplete: () => void;
}

const StepComplete: React.FC<StepCompleteProps> = ({ item, wizardState, onUpdateState, onComplete }) => {
  const { scannedItems, photos, beritaAcaraGenerated, signedDocumentUrl, isSubmitted } = wizardState;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check step completion status
  const stepStatus = [
    { key: 'detail', done: true, label: 'Detail permintaan dilihat' },
    {
      key: 'scan',
      done: scannedItems.length > 0,
      label: `${scannedItems.length} item obat ter-scan`,
    },
    {
      key: 'photo',
      done: photos.length > 0,
      label: `${photos.length} foto dokumentasi`,
    },
    {
      key: 'document',
      done: beritaAcaraGenerated,
      label: 'Berita acara di-generate',
    },
    {
      key: 'upload',
      done: !!signedDocumentUrl,
      label: 'BA bertanda tangan diunggah',
    },
  ];

  const allDone = stepStatus.every((s) => s.done);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000));
    onUpdateState({ isSubmitted: true });
    setIsSubmitting(false);
    toast.success('Distribusi obat berhasil diselesaikan!', {
      description: `Obat untuk ${item.namaGrup} telah berhasil didistribusikan.`,
    });
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center animate-in zoom-in duration-500">
          <Icon icon="heroicons:check-badge" className="w-12 h-12 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
          Distribusi Selesai!
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
          Obat untuk <strong>{item.namaGrup}</strong> ({item.tipe === 'gapoktan' ? 'Gapoktan' : 'Poktan'})
          telah berhasil didistribusikan. Notifikasi telah dikirim ke PPL terkait.
        </p>

        <div className="flex items-center gap-2 text-xs text-gray-500 animate-in fade-in duration-500 delay-500">
          <Icon icon="heroicons:clock" className="w-4 h-4" />
          {formatTanggalOutgoing(new Date())}
        </div>

        <Button
          onClick={onComplete}
          className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-700"
        >
          <Icon icon="heroicons:home" className="w-4 h-4 mr-1.5" />
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pb-4">
        {/* Summary Header */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            <Icon icon="heroicons:clipboard-document-check" className="w-5 h-5 text-purple-500" />
            Ringkasan Proses
          </div>

          {/* Distribution target */}
          <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 shrink-0">
              <Icon icon="heroicons:building-storefront" className="w-5 h-5 text-purple-500" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {item.namaGrup}
              </div>
              <div className="text-xs text-gray-500">
                {item.tipe === 'gapoktan' ? 'Gapoktan' : 'Poktan'} · Ds. {item.desa}, Kec. {item.kecamatan}
              </div>
            </div>
          </div>

          {/* Step checklist */}
          <div className="space-y-2">
            {stepStatus.map((step) => (
              <div key={step.key} className="flex items-center gap-2.5">
                <Icon
                  icon={step.done ? "heroicons:check-circle" : "heroicons:x-circle"}
                  className={cn(
                    "w-5 h-5 shrink-0",
                    step.done ? "text-green-500" : "text-gray-300 dark:text-gray-600"
                  )}
                />
                <span className={cn(
                  "text-sm",
                  step.done ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
                )}>
                  {step.label}
                </span>
                {step.done && (
                  <Badge className="text-[10px] px-1 py-0 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 ml-auto">
                    OK
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Warning if incomplete */}
        {!allDone && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex items-start gap-3">
            <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Belum Semua Langkah Selesai
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Beberapa langkah belum diselesaikan. Anda tetap dapat menyelesaikan proses,
                namun disarankan untuk melengkapi semua langkah terlebih dahulu.
              </div>
            </div>
          </div>
        )}

        {/* Scanned Items Summary */}
        {scannedItems.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <Icon icon="heroicons:beaker" className="w-4 h-4 text-purple-500" />
              Obat Didistribusikan
            </div>
            <div className="space-y-1">
              {Object.entries(
                scannedItems.reduce<Record<string, number>>((acc, s) => {
                  acc[s.nama] = (acc[s.nama] || 0) + 1;
                  return acc;
                }, {})
              ).map(([nama, count]) => (
                <div key={nama} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span>{nama}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{count} unit</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || scannedItems.length === 0}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Memproses...
            </>
          ) : (
            <>
              <Icon icon="heroicons:check-badge" className="w-5 h-5 mr-2" />
              Selesaikan Distribusi
            </>
          )}
        </Button>

        {scannedItems.length === 0 && (
          <p className="text-xs text-center text-gray-400">
            Minimal harus scan 1 item obat sebelum menyelesaikan proses.
          </p>
        )}
      </div>
    </ScrollArea>
  );
};

export default StepComplete;
// # END OF Step Complete
