// # START OF Step 3 Document Generation Component - PDF generation and printing for Berita Acara
// Purpose: Generate and print Berita Acara serah terima obat with mobile-friendly interface
// Features: PDF generation, print preview, mobile-optimized printing, download option
// Props: transaction, wizardState, onNext, onPrev, onUpdateState
// Dependencies: PDF generation library (jsPDF or similar), print utilities

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Transaction } from "@/lib/types/transaction";
import { WizardState } from "@/app/(dashboard)/transactions/outgoing/process/[id]/page";

interface Step3DocumentGenerationProps {
  transaction: Transaction;
  wizardState: WizardState;
  onNext: () => void;
  onPrev: () => void;
  onUpdateState: (updates: Partial<WizardState>) => void;
}

interface DocumentData {
  transactionId: string;
  letterNumber: string;
  date: string;
  pplOfficer: string;
  farmerGroup: string;
  commodity: string;
  pestType: string;
  approvedDrugs: Array<{
    name: string;
    quantity: number;
    unit: string;
    manufacturer?: string;
  }>;
  staffName: string;
  witnessName?: string;
  notes?: string;
}

export const Step3DocumentGeneration: React.FC<Step3DocumentGenerationProps> = ({
  transaction,
  wizardState,
  onNext,
  onPrev,
  onUpdateState,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printCompleted, setPrintCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract document data from transaction
  const documentData: DocumentData = {
    transactionId: transaction.id,
    letterNumber: transaction.letterNumber,
    date: format(new Date(), 'dd MMMM yyyy', { locale: id }),
    pplOfficer: transaction.applicantData.bppOfficer,
    farmerGroup: transaction.applicantData.farmerGroup,
    commodity: transaction.applicantData.commodity,
    pestType: transaction.applicantData.pestType,
    approvedDrugs: transaction.approval?.approvedDrugs?.map(drug => ({
      name: drug.drugName,
      quantity: drug.approvedQuantity,
      unit: drug.unit,
      manufacturer: drug.manufacturer
    })) || [],
    staffName: 'Staff Gudang', // In real app, get from auth context
    witnessName: '',
    notes: transaction.approval?.notes || ''
  };

  // Generate PDF document
  const generatePDF = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Simulate PDF generation (replace with actual PDF library like jsPDF)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock PDF content
      const pdfContent = createPDFContent(documentData);
      
      // In real implementation, use jsPDF or similar:
      // const pdf = new jsPDF();
      // pdf.text(pdfContent, 10, 10);
      // const blob = pdf.output('blob');

      // For demo, create a text blob
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setPdfBlob(blob);
      setPdfUrl(url);
      
      // Update wizard state
      onUpdateState({
        documentGeneration: {
          pdfBlob: blob,
          printed: false,
          timestamp: new Date()
        }
      });

      toast.success('Berita Acara berhasil dibuat');
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('Gagal membuat Berita Acara. Silakan coba lagi.');
      toast.error('Gagal membuat dokumen');
    } finally {
      setIsGenerating(false);
    }
  }, [documentData, onUpdateState]);

  // Handle print
  const handlePrint = useCallback(async () => {
    if (!pdfUrl) {
      toast.error('Dokumen belum tersedia untuk dicetak');
      return;
    }

    try {
      setIsPrinting(true);

      // Open print dialog
      if (window.print) {
        // For mobile-friendly printing, open in new window
        const printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
            printWindow.onafterprint = () => {
              setPrintCompleted(true);
              onUpdateState({
                documentGeneration: {
                  ...wizardState.documentGeneration,
                  printed: true,
                  timestamp: new Date()
                }
              });
              toast.success('Dokumen berhasil dicetak');
              printWindow.close();
            };
          };
        } else {
          throw new Error('Tidak dapat membuka dialog print');
        }
      } else {
        throw new Error('Browser tidak mendukung fungsi print');
      }
    } catch (err) {
      console.error('Print failed:', err);
      toast.error('Gagal mencetak dokumen');
    } finally {
      setIsPrinting(false);
    }
  }, [pdfUrl, wizardState.documentGeneration, onUpdateState]);

  // Download PDF
  const downloadPDF = useCallback(() => {
    if (!pdfBlob || !pdfUrl) {
      toast.error('Dokumen belum tersedia untuk diunduh');
      return;
    }

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Berita-Acara-${transaction.letterNumber}-${format(new Date(), 'yyyyMMdd')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Dokumen berhasil diunduh');
  }, [pdfBlob, pdfUrl, transaction.letterNumber]);

  // Handle next step
  const handleNext = () => {
    if (!printCompleted) {
      toast.error('Dokumen harus dicetak terlebih dahulu sebelum melanjutkan');
      return;
    }

    onNext();
  };

  // Create PDF content (text format for demo)
  const createPDFContent = (data: DocumentData): string => {
    return `
BERITA ACARA SERAH TERIMA OBAT PERTANIAN

No. Surat: ${data.letterNumber}
Tanggal: ${data.date}

Yang bertanda tangan di bawah ini:
1. Nama: ${data.staffName}
   Jabatan: Staff Gudang
   (Pihak Penyerah)

2. Nama: ${data.pplOfficer}
   Jabatan: PPL (Penyuluh Pertanian Lapangan)
   Kelompok Tani: ${data.farmerGroup}
   (Pihak Penerima)

Dengan ini menyatakan bahwa telah dilakukan serah terima obat pertanian untuk:
- Komoditas: ${data.commodity}
- Jenis OPT: ${data.pestType}

DAFTAR OBAT YANG DISERAHKAN:
${data.approvedDrugs.map((drug, index) => 
  `${index + 1}. ${drug.name} - ${drug.quantity} ${drug.unit}${drug.manufacturer ? ` (${drug.manufacturer})` : ''}`
).join('\n')}

CATATAN:
${data.notes || 'Tidak ada catatan khusus'}

Serah terima dilakukan pada hari ini dan obat telah diterima dalam kondisi baik.

Pihak Penyerah,                    Pihak Penerima,


${data.staffName}                  ${data.pplOfficer}
Staff Gudang                       PPL

${data.witnessName ? `Saksi:\n\n${data.witnessName}` : ''}
    `;
  };

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className="space-y-6">
      {/* Document Generation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon icon="lucide:file-text" className="w-5 h-5" />
            <span>Generate Berita Acara</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert>
              <Icon icon="lucide:alert-circle" className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Document Preview Info */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
            <h4 className="font-medium mb-3">Preview Dokumen:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">No. Surat:</span>
                <p className="font-medium">{documentData.letterNumber}</p>
              </div>
              <div>
                <span className="text-gray-500">Tanggal:</span>
                <p className="font-medium">{documentData.date}</p>
              </div>
              <div>
                <span className="text-gray-500">PPL:</span>
                <p className="font-medium">{documentData.pplOfficer}</p>
              </div>
              <div>
                <span className="text-gray-500">Kelompok Tani:</span>
                <p className="font-medium">{documentData.farmerGroup}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500">Komoditas:</span>
                <p className="font-medium">{documentData.commodity} - {documentData.pestType}</p>
              </div>
            </div>

            <Separator className="my-3" />

            <div>
              <span className="text-gray-500 text-sm">Daftar Obat:</span>
              <div className="mt-2 space-y-1">
                {documentData.approvedDrugs.map((drug, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-sm">{drug.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {drug.quantity} {drug.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          {!pdfBlob && (
            <div className="text-center py-6">
              <Icon icon="lucide:file-plus" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Klik tombol di bawah untuk membuat Berita Acara
              </p>
              <Button
                onClick={generatePDF}
                disabled={isGenerating}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isGenerating && (
                  <Icon icon="lucide:loader-2" className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isGenerating ? 'Membuat Dokumen...' : 'Buat Berita Acara'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Actions Card */}
      {pdfBlob && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Dokumen Siap</span>
              <Badge variant={printCompleted ? "default" : "outline"}>
                {printCompleted ? "Sudah Dicetak" : "Belum Dicetak"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <Icon icon="lucide:file-check" className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-green-600 dark:text-green-400 font-medium mb-2">
                Berita Acara berhasil dibuat
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dokumen siap untuk dicetak dan ditandatangani
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={downloadPDF}
                className="w-full"
              >
                <Icon icon="lucide:download" className="w-4 h-4 mr-2" />
                Unduh PDF
              </Button>

              <Button
                onClick={handlePrint}
                disabled={isPrinting}
                className="w-full"
              >
                {isPrinting && (
                  <Icon icon="lucide:loader-2" className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Icon icon="lucide:printer" className="w-4 h-4 mr-2" />
                {isPrinting ? 'Mencetak...' : 'Cetak Dokumen'}
              </Button>
            </div>

            {printCompleted && (
              <Alert>
                <Icon icon="lucide:check-circle" className="h-4 w-4" />
                <AlertDescription>
                  Dokumen telah dicetak. Pastikan dokumen ditandatangani oleh kedua belah pihak 
                  sebelum melanjutkan ke langkah berikutnya.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Petunjuk Tanda Tangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <Icon icon="lucide:user-check" className="w-4 h-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium">Staff Gudang</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Tanda tangan petugas yang menyerahkan obat
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icon icon="lucide:user-check" className="w-4 h-4 mt-0.5 text-green-500" />
              <div>
                <p className="font-medium">PPL (Penerima)</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Tanda tangan ${documentData.pplOfficer} sebagai penerima
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icon icon="lucide:camera" className="w-4 h-4 mt-0.5 text-orange-500" />
              <div>
                <p className="font-medium">Foto Dokumen</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Setelah ditandatangani, ambil foto dokumen untuk diupload di langkah berikutnya
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
        <Button
          variant="outline"
          onClick={onPrev}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
          Kembali ke Dokumentasi
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!printCompleted}
          size="lg"
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          Lanjut ke Upload BA
          <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// # END OF Step 3 Document Generation Component 