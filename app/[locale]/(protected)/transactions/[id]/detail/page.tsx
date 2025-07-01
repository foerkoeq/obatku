"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTransactionById } from "@/lib/data/transaction-demo";
import { Transaction, UserRole } from "@/lib/types/transaction";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import StatusTimeline from "@/components/transactions/status-timeline";
import SubmissionDetailsCard from "@/components/transactions/submission-details-card";
import FarmingInfoCard from "@/components/transactions/farming-info-card";
import DocumentCard from "@/components/transactions/document-card";
import ApprovalCard from "@/components/transactions/approval-card";
import DistributionCard from "@/components/transactions/distribution-card";

// --- Mock Auth ---
const MOCK_USER = {
  id: 'DINAS-001',
  role: 'dinas' as UserRole, // Switch between 'ppl', 'dinas', 'popt'
  name: 'Dr. Ahmad Fauzi',
};
// -----------------

// Placeholder components - will be created later


const TransactionDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [user] = useState(MOCK_USER);

  useEffect(() => {
    if (id) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const data = getTransactionById(id);
        if (data) {
          setTransaction(data);
        } else {
          toast.error(`Transaksi dengan ID ${id} tidak ditemukan.`);
        }
        setLoading(false);
      }, 500);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center h-[60vh] gap-4">
        <Alert color="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error: Data Tidak Ditemukan</AlertTitle>
          <AlertDescription>
            Pengajuan transaksi dengan ID yang Anda cari tidak dapat ditemukan. Mungkin telah dihapus atau Anda tidak memiliki izin untuk melihatnya.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push('/transactions/list')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Transaksi
        </Button>
      </div>
    );
  }
  
  const canApprove = user.role === 'dinas' && (transaction.status === 'under_review' || transaction.status === 'submitted');
  const canDistribute = user.role === 'popt' && transaction.status === 'ready_distribution';

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <PageTitle title="Detail Pengajuan Transaksi" className="mb-1" />
          <p className="text-sm text-muted-foreground">
            ID Transaksi: {transaction.id}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/transactions/list')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <SubmissionDetailsCard transaction={transaction} />
          <FarmingInfoCard transaction={transaction} />
          <DocumentCard transaction={transaction} />
        </div>
        
        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <StatusTimeline transaction={transaction} />
          {canApprove && <ApprovalCard transaction={transaction} />}
          {canDistribute && <DistributionCard transaction={transaction} userRole={user.role} />}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailPage;
