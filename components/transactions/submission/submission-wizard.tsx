"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormWizardStepper, WizardStep } from "@/components/form/form-wizard-stepper";
import { submissionSchema, SubmissionFormData } from "./schema";
import { Step1BasicInfo } from "./step-1-basic-info";
import { Step2FarmingDetails } from "./step-2-farming-details";
import { Step3MedicineRequest } from "./step-3-medicine-request";
import { Step4Documents } from "./step-4-documents";
import { ArrowLeft, ArrowRight, Save, User, Sprout, Pill, FileText, Info } from "lucide-react";

const STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Informasi Dasar",
    description: "Data pemohon dan kelompok tani",
    icon: <User className="w-6 h-6" />
  },
  {
    id: 2,
    title: "Detail Pertanian",
    description: "Data lahan dan komoditas",
    icon: <Sprout className="w-6 h-6" />
  },
  {
    id: 3,
    title: "Permintaan Obat",
    description: "Pilih obat yang dibutuhkan",
    icon: <Pill className="w-6 h-6" />
  },
  {
    id: 4,
    title: "Dokumen Pengajuan",
    description: "Unggah dokumen pendukung",
    icon: <FileText className="w-6 h-6" />
  }
];

// Fields to validate per step
const STEP_FIELDS: Record<number, (keyof SubmissionFormData)[]> = {
  1: ["district", "village", "farmerGroupId", "farmerGroupName", "groupLeader", "phoneNumber"],
  2: ["landArea", "commodities", "pestTypes", "affectedArea"],
  3: ["drugItems"],
  4: ["letterNumber", "letterDate", "pickupDate", "letterFile", "poptRecommendationFile"]
};

export function SubmissionWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      district: "",
      village: "",
      farmerGroupId: "",
      farmerGroupName: "",
      groupLeader: "",
      phoneNumber: "",
      landArea: 0,
      commodities: [],
      pestTypes: [],
      affectedArea: 0,
      drugItems: [],
      letterNumber: "",
      letterDate: new Date(),
      pickupDate: undefined,
    },
    mode: "onChange"
  });

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    const isValid = await form.trigger(fields);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    } else {
      toast.error("Mohon lengkapi data yang wajib diisi");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting data:", data);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Pengajuan berhasil dikirim!");
      router.push("/dashboard/transactions/submission");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Gagal mengirim pengajuan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Wizard Stepper */}
        <FormWizardStepper 
          steps={STEPS} 
          currentStep={currentStep}
          allowStepClick={true}
          onStepClick={(step) => {
            // Only allow clicking previous steps or current step
            if (step <= currentStep) {
              setCurrentStep(step);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />

        {/* Step Content Card */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                {STEPS[currentStep - 1].icon}
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold">{STEPS[currentStep - 1].title}</CardTitle>
                <CardDescription className="text-base mt-1">
                  {STEPS[currentStep - 1].description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="animate-in fade-in-50 duration-500">
              {currentStep === 1 && <Step1BasicInfo />}
              {currentStep === 2 && <Step2FarmingDetails />}
              {currentStep === 3 && <Step3MedicineRequest />}
              {currentStep === 4 && <Step4Documents />}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6 bg-muted/30">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>

            {currentStep < STEPS.length ? (
              <Button 
                type="button" 
                onClick={handleNext}
                size="lg"
                className="min-w-[140px]"
              >
                Selanjutnya
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                size="lg"
                className="min-w-[180px]"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Kirim Pengajuan
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
