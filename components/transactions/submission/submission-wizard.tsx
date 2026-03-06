"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormWizardStepper,
  WizardStep,
} from "@/components/form/form-wizard-stepper";
import {
  SubmissionFormData,
  DEFAULT_FORM_DATA,
  STEP_VALIDATORS,
} from "./schema";
import { Step1BasicInfo } from "./step-1-basic-info";
import { Step2FarmingDetails } from "./step-2-farming-details";
import { Step3MedicineRequest } from "./step-3-medicine-request";
import { Step4Documents } from "./step-4-documents";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  User,
  Sprout,
  Pill,
  FileText,
  Loader2,
  CheckCircle2,
  SaveAll,
} from "lucide-react";

const SUBMISSION_DRAFT_KEY = "obatku:submission-wizard:draft:v1";

type SubmissionDraftStorage = {
  updatedAt: string;
  data: SubmissionFormData;
};

function createSerializableDraft(data: SubmissionFormData): SubmissionFormData {
  return {
    ...data,
    suratPengajuanBPP: null,
    rekomendasiPOPT: null,
    dokumenLainnya: [],
  };
}

const STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Lokasi & Poktan",
    description: "Pilih lokasi dan kelompok tani",
    icon: <User className="w-6 h-6" />,
  },
  {
    id: 2,
    title: "Detail Serangan",
    description: "Data komoditas, luas & OPT",
    icon: <Sprout className="w-6 h-6" />,
  },
  {
    id: 3,
    title: "Preferensi Obat",
    description: "Pilih jenis obat (opsional)",
    icon: <Pill className="w-6 h-6" />,
  },
  {
    id: 4,
    title: "Dokumen",
    description: "Unggah dokumen pendukung",
    icon: <FileText className="w-6 h-6" />,
  },
];

export function SubmissionWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [formData, setFormData] = useState<SubmissionFormData>(DEFAULT_FORM_DATA);

  useEffect(() => {
    if (isDraftLoaded) return;

    try {
      const rawDraft = localStorage.getItem(SUBMISSION_DRAFT_KEY);
      if (!rawDraft) {
        setIsDraftLoaded(true);
        return;
      }

      const parsedDraft = JSON.parse(rawDraft) as SubmissionDraftStorage;
      if (!parsedDraft?.data) {
        setIsDraftLoaded(true);
        return;
      }

      const mergedData: SubmissionFormData = {
        ...DEFAULT_FORM_DATA,
        ...parsedDraft.data,
        suratPengajuanBPP: null,
        rekomendasiPOPT: null,
        dokumenLainnya: [],
      };

      setFormData(mergedData);
      toast.success("Draft pengajuan dimuat", {
        description: "Data form dipulihkan. Dokumen unggahan perlu dipilih ulang.",
      });
    } catch (error) {
      console.error("Failed to restore draft:", error);
    } finally {
      setIsDraftLoaded(true);
    }
  }, [isDraftLoaded]);

  const handleChange = useCallback(
    (updates: Partial<SubmissionFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleNext = () => {
    const validate = STEP_VALIDATORS[currentStep - 1];
    const errors = validate(formData);

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    // Final validation of all steps
    for (let i = 0; i < STEP_VALIDATORS.length; i++) {
      const errs = STEP_VALIDATORS[i](formData);
      if (errs.length > 0) {
        toast.error(`Step ${i + 1}: ${errs[0]}`);
        setCurrentStep(i + 1);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting data:", formData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      localStorage.removeItem(SUBMISSION_DRAFT_KEY);

      toast.success("Pengajuan berhasil dikirim!", {
        description: "Data akan diproses oleh Dinas terkait.",
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      });
      router.push("/transactions");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Gagal mengirim pengajuan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    try {
      const payload: SubmissionDraftStorage = {
        updatedAt: new Date().toISOString(),
        data: createSerializableDraft(formData),
      };

      localStorage.setItem(SUBMISSION_DRAFT_KEY, JSON.stringify(payload));
      toast.success("Draft berhasil disimpan", {
        description: "Dokumen file tidak tersimpan dan perlu diunggah ulang saat melanjutkan.",
      });
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Gagal menyimpan draft. Coba lagi.");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Wizard Stepper */}
      <FormWizardStepper
        steps={STEPS}
        currentStep={currentStep}
        allowStepClick={true}
        onStepClick={handleStepClick}
      />

      {/* Step Content Card */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 text-primary flex-shrink-0">
              {STEPS[currentStep - 1].icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-2xl font-bold">
                {STEPS[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                {STEPS[currentStep - 1].description}
              </CardDescription>
            </div>
            <span className="text-xs text-muted-foreground font-medium flex-shrink-0">
              {currentStep}/{STEPS.length}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3">
          <div className="animate-in fade-in-50 duration-300">
            {currentStep === 1 && (
              <Step1BasicInfo formData={formData} onChange={handleChange} />
            )}
            {currentStep === 2 && (
              <Step2FarmingDetails formData={formData} onChange={handleChange} />
            )}
            {currentStep === 3 && (
              <Step3MedicineRequest formData={formData} onChange={handleChange} />
            )}
            {currentStep === 4 && (
              <Step4Documents formData={formData} onChange={handleChange} />
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between border-t p-4 sm:p-6 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="h-10 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Kembali</span>
            <span className="sm:hidden">Kembali</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              color="secondary"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="h-10 flex-1 sm:flex-none"
            >
              <SaveAll className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Simpan sebagai draft</span>
              <span className="sm:hidden">Draft</span>
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                className="h-10 min-w-[120px] flex-1 sm:flex-none"
              >
                Selanjutnya
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-10 min-w-[140px] flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Kirim Pengajuan
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
