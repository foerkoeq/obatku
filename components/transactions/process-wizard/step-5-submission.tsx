// # START OF Step 5 Submission Component - Final submission and confirmation
// Purpose: Display summary, handle final submission, and send notifications to Dinas
// Features: Process summary, confirmation dialog, submission status, notification handling
// Props: transaction, wizardState, onPrev, onUpdateState, onComplete
// Dependencies: Notification services, submission API, summary components

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { transactionService } from '@/lib/services/transaction.service';
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Transaction } from "@/lib/types/transaction";
import { WizardState } from "@/app/(dashboard)/transactions/outgoing/process/[id]/page";

interface Step5SubmissionProps {
  transaction: Transaction;
  wizardState: WizardState;
  onPrev: () => void;
  onUpdateState: (updates: Partial<WizardState>) => void;
  onComplete: () => void;
}

interface SubmissionSummary {
  transactionId: string;
  letterNumber: string;
  pplOfficer: string;
  totalItems: number;
  processStartTime?: Date;
  processEndTime?: Date;
  documentsGenerated: boolean;
  photosCount: number;
  signedDocumentUploaded: boolean;
}

export const Step5Submission: React.FC<Step5SubmissionProps> = ({
  transaction,
  wizardState,
  onPrev,
  onUpdateState,
  onComplete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'pending' | 'submitting' | 'completed' | 'error'>('pending');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<{
    dinas: boolean;
    ppl: boolean;
    admin: boolean;
  }>({
    dinas: false,
    ppl: false,
    admin: false
  });

  // Normalize PPL officer to a string and create submission summary
  const pplOfficerName: string = typeof transaction.bppOfficer === 'string'
    ? transaction.bppOfficer
    : transaction.bppOfficer?.name ?? '';

  const submissionSummary: SubmissionSummary = {
    transactionId: transaction.id,
    letterNumber: transaction.letterNumber,
    pplOfficer: pplOfficerName,
    totalItems: Object.values(wizardState.scanResults.scannedItems).reduce((sum, count) => sum + count, 0),
    processStartTime: wizardState.scanResults.timestamp,
    processEndTime: new Date(),
    documentsGenerated: !!wizardState.documentGeneration.pdfBlob,
    photosCount: wizardState.photoDocumentation.photos.length,
    signedDocumentUploaded: !!wizardState.fileUpload.signedDocument,
  };

  // Calculate process duration
  const processDuration = submissionSummary.processStartTime && submissionSummary.processEndTime
    ? Math.round((submissionSummary.processEndTime.getTime() - submissionSummary.processStartTime.getTime()) / (1000 * 60))
    : 0;

  // Check if all requirements are met
  const allRequirementsMet = 
    wizardState.scanResults.isComplete &&
    wizardState.photoDocumentation.photos.length >= 2 &&
    wizardState.documentGeneration.printed &&
    wizardState.fileUpload.uploaded;

  // Handle final submission
  const handleSubmission = async () => {
    if (!allRequirementsMet) {
      toast.error('Semua tahap harus diselesaikan sebelum submit');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('submitting');

    try {
      // Call backend to mark transaction as processed / distributed
      const payload = {
        scannedItems: wizardState.scanResults.scannedItems,
        photosCount: wizardState.photoDocumentation.photos.length,
        documentsGenerated: !!wizardState.documentGeneration.pdfBlob,
        signedDocumentUploaded: !!wizardState.fileUpload.signedDocument,
        processedAt: new Date().toISOString(),
      } as any;

      const resp = await transactionService.process(transaction.id, payload);

      if (resp && resp.success) {
        const respData: any = resp.data;
        const newSubmissionId = respData?.submissionId || `SUB-${transaction.id}-${Date.now()}`;
        setSubmissionId(newSubmissionId);

        // Send notifications
        await sendNotifications();

        // Update wizard state (explicitly typed to satisfy TS)
        const submissionUpdate: Partial<WizardState> = {
          submission: {
            submitted: true,
            submissionId: newSubmissionId,
            timestamp: new Date()
          }
        };
        onUpdateState(submissionUpdate);

        setSubmissionStatus('completed');
        toast.success(resp.message || 'Proses pengeluaran obat berhasil diselesaikan');

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          onComplete();
        }, 3000);
      } else {
        throw resp;
      }

    } catch (error) {
      console.error('Submission failed:', error);
      setSubmissionStatus('error');
      toast.error('Gagal menyelesaikan proses. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send notifications to relevant parties
  const sendNotifications = async () => {
    // Simulate notification sending
    
    // Notify Dinas
    await new Promise(resolve => setTimeout(resolve, 500));
    setNotificationStatus(prev => ({ ...prev, dinas: true }));
    
    // Notify PPL
    await new Promise(resolve => setTimeout(resolve, 500));
    setNotificationStatus(prev => ({ ...prev, ppl: true }));
    
    // Notify Admin
    await new Promise(resolve => setTimeout(resolve, 500));
    setNotificationStatus(prev => ({ ...prev, admin: true }));
  };

  return (
    <div className="space-y-6">
      {/* Process Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon icon="lucide:clipboard-check" className="w-5 h-5" />
            <span>Ringkasan Proses</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">No. Surat</span>
                <p className="font-medium">{submissionSummary.letterNumber}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">PPL Penerima</span>
                <p className="font-medium">{submissionSummary.pplOfficer}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Item</span>
                <p className="font-medium">{submissionSummary.totalItems} item</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Waktu Proses</span>
                <p className="font-medium">{processDuration} menit</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Foto Dokumentasi</span>
                <p className="font-medium">{submissionSummary.photosCount} foto</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Waktu Selesai</span>
                <p className="font-medium">
                  {submissionSummary.processEndTime ? format(submissionSummary.processEndTime, 'dd MMM yyyy, HH:mm', { locale: id }) : '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist Tahapan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Icon 
                  icon={wizardState.scanResults.isComplete ? "lucide:check-circle" : "lucide:x-circle"} 
                  className={`w-5 h-5 ${wizardState.scanResults.isComplete ? 'text-green-500' : 'text-red-500'}`} 
                />
                <span className="font-medium">Scan QR Code Items</span>
              </div>
              <Badge color={wizardState.scanResults.isComplete ? "default" : "destructive"}>
                {wizardState.scanResults.isComplete ? "Selesai" : "Belum"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Icon 
                  icon={submissionSummary.photosCount >= 2 ? "lucide:check-circle" : "lucide:x-circle"} 
                  className={`w-5 h-5 ${submissionSummary.photosCount >= 2 ? 'text-green-500' : 'text-red-500'}`} 
                />
                <span className="font-medium">Dokumentasi Foto</span>
              </div>
              <Badge color={submissionSummary.photosCount >= 2 ? "default" : "destructive"}>
                {submissionSummary.photosCount >= 2 ? "Selesai" : "Belum"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Icon 
                  icon={wizardState.documentGeneration.printed ? "lucide:check-circle" : "lucide:x-circle"} 
                  className={`w-5 h-5 ${wizardState.documentGeneration.printed ? 'text-green-500' : 'text-red-500'}`} 
                />
                <span className="font-medium">Cetak Berita Acara</span>
              </div>
              <Badge color={wizardState.documentGeneration.printed ? "default" : "destructive"}>
                {wizardState.documentGeneration.printed ? "Selesai" : "Belum"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Icon 
                  icon={wizardState.fileUpload.uploaded ? "lucide:check-circle" : "lucide:x-circle"} 
                  className={`w-5 h-5 ${wizardState.fileUpload.uploaded ? 'text-green-500' : 'text-red-500'}`} 
                />
                <span className="font-medium">Upload BA Bertanda Tangan</span>
              </div>
              <Badge color={wizardState.fileUpload.uploaded ? "default" : "destructive"}>
                {wizardState.fileUpload.uploaded ? "Selesai" : "Belum"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Status */}
      {submissionStatus !== 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon 
                icon={submissionStatus === 'completed' ? "lucide:check-circle" : 
                      submissionStatus === 'error' ? "lucide:x-circle" : "lucide:loader-2"} 
                className={`w-5 h-5 ${
                  submissionStatus === 'completed' ? 'text-green-500' : 
                  submissionStatus === 'error' ? 'text-red-500' : 'text-blue-500 animate-spin'
                }`} 
              />
              <span>Status Submission</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submissionStatus === 'submitting' && (
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-400">
                  Sedang memproses submission dan mengirim notifikasi...
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Notifikasi ke Dinas</span>
                    <Icon 
                      icon={notificationStatus.dinas ? "lucide:check" : "lucide:loader-2"} 
                      className={`w-4 h-4 ${notificationStatus.dinas ? 'text-green-500' : 'text-gray-400 animate-spin'}`} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Notifikasi ke PPL</span>
                    <Icon 
                      icon={notificationStatus.ppl ? "lucide:check" : "lucide:loader-2"} 
                      className={`w-4 h-4 ${notificationStatus.ppl ? 'text-green-500' : 'text-gray-400 animate-spin'}`} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Notifikasi ke Admin</span>
                    <Icon 
                      icon={notificationStatus.admin ? "lucide:check" : "lucide:loader-2"} 
                      className={`w-4 h-4 ${notificationStatus.admin ? 'text-green-500' : 'text-gray-400 animate-spin'}`} 
                    />
                  </div>
                </div>
              </div>
            )}

            {submissionStatus === 'completed' && (
              <div className="text-center py-6">
                <Icon icon="lucide:party-popper" className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  Proses Berhasil Diselesaikan!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Obat telah berhasil diserahkan kepada {submissionSummary.pplOfficer}
                </p>
                {submissionId && (
                  <Badge color="info" className="text-xs">
                    ID Submission: {submissionId}
                  </Badge>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Otomatis kembali ke halaman utama dalam 3 detik...
                </p>
              </div>
            )}

            {submissionStatus === 'error' && (
              <Alert>
                <Icon icon="lucide:alert-circle" className="h-4 w-4" />
                <AlertDescription>
                  Terjadi kesalahan saat memproses submission. Silakan coba lagi atau hubungi admin.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Final Actions */}
      {submissionStatus === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Konfirmasi Final</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Icon icon="lucide:info" className="h-4 w-4" />
                <AlertDescription>
                  Pastikan semua tahap telah diselesaikan dengan benar. Setelah submit, 
                  status transaksi akan berubah menjadi "Selesai" dan notifikasi akan 
                  dikirim ke semua pihak terkait.
                </AlertDescription>
              </Alert>

              {!allRequirementsMet && (
                <Alert>
                  <Icon icon="lucide:alert-triangle" className="h-4 w-4" />
                  <AlertDescription>
                    Beberapa tahap belum diselesaikan. Silakan kembali ke tahap sebelumnya 
                    untuk menyelesaikan semua requirement.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
        {submissionStatus === 'pending' && (
          <>
            <Button
              variant="outline"
              onClick={onPrev}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
              Kembali ke Upload
            </Button>
            
            <Button
              onClick={handleSubmission}
              disabled={!allRequirementsMet || isSubmitting}
              size="lg"
              className="w-full sm:w-auto order-1 sm:order-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting && (
                <Icon icon="lucide:loader-2" className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isSubmitting ? 'Memproses...' : 'Submit & Selesaikan'}
              <Icon icon="lucide:check" className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {submissionStatus === 'completed' && (
          <Button
            onClick={onComplete}
            size="lg"
            className="w-full"
          >
            Kembali ke Halaman Utama
            <Icon icon="lucide:home" className="w-4 h-4 ml-2" />
          </Button>
        )}

        {submissionStatus === 'error' && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full">
            <Button
              variant="outline"
              onClick={onPrev}
              className="w-full sm:w-auto"
            >
              <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <Button
              onClick={handleSubmission}
              size="lg"
              className="w-full sm:w-auto"
            >
              <Icon icon="lucide:refresh-ccw" className="w-4 h-4 mr-2" />
              Coba Lagi
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// # END OF Step 5 Submission Component 