// # START OF Outgoing Transaction Process Wizard Page - Mobile-first multi-step distribution process
// Purpose: Handle complete process flow from QR scan to final submission for obat distribution
// Features: 5-step wizard, mobile-optimized, real-time validation, camera integration, PDF generation
// Routes: /transactions/outgoing/process/[transactionId]
// Dependencies: Wizard components, camera hooks, PDF generation, file upload

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Transaction } from "@/lib/types/transaction";
import { mockTransactionData } from "@/lib/data/transaction-demo";

// Wizard Components
import { WizardLayout } from "@/components/transactions/process-wizard/wizard-layout";
import { Step1Validation } from "@/components/transactions/process-wizard/step-1-validation";
import { Step2Photography } from "@/components/transactions/process-wizard/step-2-photography";
import { Step3DocumentGeneration } from "@/components/transactions/process-wizard/step-3-document-generation";
import { Step4FileUpload } from "@/components/transactions/process-wizard/step-4-file-upload";
import { Step5Submission } from "@/components/transactions/process-wizard/step-5-submission";

// Types for wizard state
export interface WizardState {
  currentStep: number;
  transaction: Transaction | null;
  scanResults: {
    scannedItems: Record<string, number>;
    isComplete: boolean;
    timestamp?: Date;
  };
  photoDocumentation: {
    photos: File[];
    timestamp?: Date;
  };
  documentGeneration: {
    pdfBlob: Blob | null;
    printed: boolean;
    timestamp?: Date;
  };
  fileUpload: {
    signedDocument: File | null;
    uploaded: boolean;
    timestamp?: Date;
  };
  submission: {
    submitted: boolean;
    submissionId?: string;
    timestamp?: Date;
  };
}

const WIZARD_STEPS = [
  { id: 1, title: "Validasi", description: "Scan QR & Validasi Sistem" },
  { id: 2, title: "Dokumentasi", description: "Foto Bukti Serah Terima" },
  { id: 3, title: "Berita Acara", description: "Generate & Cetak BA" },
  { id: 4, title: "Upload", description: "Upload BA Bertanda Tangan" },
  { id: 5, title: "Selesai", description: "Konfirmasi & Notifikasi" },
];

const OutgoingProcessPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const transactionId = params?.id as string;

  // Wizard state management
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 1,
    transaction: null,
    scanResults: {
      scannedItems: {},
      isComplete: false,
    },
    photoDocumentation: {
      photos: [],
    },
    documentGeneration: {
      pdfBlob: null,
      printed: false,
    },
    fileUpload: {
      signedDocument: null,
      uploaded: false,
    },
    submission: {
      submitted: false,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize transaction data
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        setIsLoading(true);
        
        // In real app, fetch from API
        // const response = await fetch(`/api/transactions/${transactionId}`);
        // const transaction = await response.json();
        
        // For demo, find from mock data
        const transaction = mockTransactionData.find(t => t.id === transactionId);
        
        if (!transaction) {
          throw new Error("Transaksi tidak ditemukan");
        }

        if (!['approved', 'ready_distribution'].includes(transaction.status)) {
          throw new Error("Transaksi belum dapat diproses");
        }

        setWizardState(prev => ({
          ...prev,
          transaction
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        toast.error("Gagal memuat data transaksi");
      } finally {
        setIsLoading(false);
      }
    };

    if (transactionId) {
      loadTransaction();
    }
  }, [transactionId]);

  // Navigation handlers
  const handleNextStep = () => {
    if (wizardState.currentStep < WIZARD_STEPS.length) {
      setWizardState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
    }
  };

  const handlePrevStep = () => {
    if (wizardState.currentStep > 1) {
      setWizardState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  };

  const handleStepClick = (step: number) => {
    // Allow going back to completed steps only
    if (step < wizardState.currentStep) {
      setWizardState(prev => ({
        ...prev,
        currentStep: step
      }));
    }
  };

  const handleExit = () => {
    if (wizardState.currentStep > 1) {
      if (confirm("Yakin ingin keluar? Progress akan hilang.")) {
        router.push("/transactions/outgoing");
      }
    } else {
      router.push("/transactions/outgoing");
    }
  };

  const handleWizardStateUpdate = (updates: Partial<WizardState>) => {
    setWizardState(prev => ({ ...prev, ...updates }));
  };

  // Render current step content
  const renderStepContent = () => {
    const { currentStep, transaction } = wizardState;

    if (!transaction) return null;

    switch (currentStep) {
      case 1:
        return (
          <Step1Validation
            transaction={transaction}
            wizardState={wizardState}
            onNext={handleNextStep}
            onUpdateState={handleWizardStateUpdate}
          />
        );
      case 2:
        return (
          <Step2Photography
            transaction={transaction}
            wizardState={wizardState}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onUpdateState={handleWizardStateUpdate}
          />
        );
      case 3:
        return (
          <Step3DocumentGeneration
            transaction={transaction}
            wizardState={wizardState}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onUpdateState={handleWizardStateUpdate}
          />
        );
      case 4:
        return (
          <Step4FileUpload
            transaction={transaction}
            wizardState={wizardState}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onUpdateState={handleWizardStateUpdate}
          />
        );
      case 5:
        return (
          <Step5Submission
            transaction={transaction}
            wizardState={wizardState}
            onPrev={handlePrevStep}
            onUpdateState={handleWizardStateUpdate}
            onComplete={() => router.push("/transactions/outgoing")}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <WizardLayout
        steps={WIZARD_STEPS}
        currentStep={1}
        onStepClick={() => {}}
        onExit={handleExit}
        isLoading={true}
      >
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-default-600">Memuat data transaksi...</p>
        </div>
      </WizardLayout>
    );
  }

  if (error || !wizardState.transaction) {
    return (
      <WizardLayout
        steps={WIZARD_STEPS}
        currentStep={1}
        onStepClick={() => {}}
        onExit={handleExit}
        error={error}
      >
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 text-center max-w-sm">
            {error || "Terjadi kesalahan saat memuat data"}
          </p>
          <button
            onClick={() => router.push("/transactions/outgoing")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
          >
            Kembali ke List
          </button>
        </div>
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      steps={WIZARD_STEPS}
      currentStep={wizardState.currentStep}
      onStepClick={handleStepClick}
      onExit={handleExit}
      transaction={wizardState.transaction}
    >
      {renderStepContent()}
    </WizardLayout>
  );
};

export default OutgoingProcessPage;

// # END OF Outgoing Transaction Process Wizard Page 