"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { FormWizardStepper, WizardStep } from "@/components/form/form-wizard-stepper";
import { submissionSchema, SubmissionFormData } from "./schema";
import { Step1BasicInfo } from "./step-1-basic-info";
import { Step2FarmingDetails } from "./step-2-farming-details";
import { Step3MedicineRequest } from "./step-3-medicine-request";
import { Step4Documents } from "./step-4-documents";
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from "lucide-react";

const STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Informasi Dasar",
    description: "Data pemohon dan kelompok tani",
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  {
    id: 2,
    title: "Detail Pertanian",
    description: "Data lahan dan komoditas",
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  {
    id: 3,
    title: "Permintaan Obat",
    description: "Pilih obat yang dibutuhkan",
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  {
    id: 4,
    title: "Dokumen",
    description: "Unggah dokumen pendukung",
    icon: <CheckCircle2 className="w-4 h-4" />
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
      district: "Kecamatan Tuban",
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormWizardStepper 
          steps={STEPS} 
          currentStep={currentStep}
          onStepClick={(step) => {
            // Only allow clicking previous steps or current step
            if (step < currentStep) setCurrentStep(step);
          }}
        />

        <Card className="border-2">
          <CardHeader>
            <h2 className="text-xl font-semibold">{STEPS[currentStep - 1].title}</h2>
            <p className="text-sm text-muted-foreground">{STEPS[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && <Step1BasicInfo />}
            {currentStep === 2 && <Step2FarmingDetails />}
            {currentStep === 3 && <Step3MedicineRequest />}
            {currentStep === 4 && <Step4Documents />}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={handleNext}>
                Selanjutnya
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Kirim Pengajuan"}
                <Save className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
