"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SubmissionWizard } from "@/components/transactions/submission/submission-wizard";
import PageTitle from "@/components/page-title";
import { UserRole } from "@/lib/types/transaction";

export default function SubmissionPage() {
  const router = useRouter();
  
  // Mock Auth - In real app use session
  const [userRole] = useState<UserRole>("ppl"); 

  useEffect(() => {
    if (userRole !== "ppl") {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      router.push("/dashboard");
    }
  }, [userRole, router]);

  if (userRole !== "ppl") {
    return null; // Or loading spinner
  }

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Pengajuan Permintaan Obat" 
        description="Buat pengajuan permintaan obat baru untuk kelompok tani" 
      />
      
      <SubmissionWizard />
    </div>
  );
}
