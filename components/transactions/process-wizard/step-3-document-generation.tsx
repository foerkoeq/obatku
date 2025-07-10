// # START OF Step 3 Document Generation Component - PDF generation and printing for Berita Acara
// Purpose: Generate and print Berita Acara serah terima obat with mobile-friendly interface
// Features: PDF generation, print preview, mobile-optimized printing, download option
// Props: transaction, wizardState, onNext, onPrev, onUpdateState
// Dependencies: Berita Acara template component, print utilities

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
import { BeritaAcaraTemplate } from "@/components/berita-acara/berita-acara-template";
import { BeritaAcaraData } from "@/lib/types/berita-acara";
import Link from "next/link";

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
  const [isPrinting, setIsPrinting] = useState(false);
  const [printCompleted, setPrintCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract document data from transaction
  const documentData: DocumentData = {
    transactionId: transaction.id,
    letterNumber: transaction.letterNumber,
    date: format(new Date(), 'dd MMMM yyyy', { locale: id }),
    pplOfficer: transaction.bppOfficer.name,
    farmerGroup: transaction.farmerGroup.name,
    commodity: transaction.farmingDetails.commodity,
    pestType: transaction.farmingDetails.pestType.join(', '),
    approvedDrugs: transaction.approval?.approvedDrugs?.map(drug => ({
      name: drug.drugName,
      quantity: drug.approvedQuantity,
      unit: drug.unit,
      manufacturer: drug.condition || 'N/A' // Using condition field as manufacturer placeholder
    })) || [],
    staffName: 'Staff Gudang', // In real app, get from auth context
    witnessName: '',
    notes: transaction.approval?.noteToWarehouse || ''
  };

  // Convert transaction data to BeritaAcaraData format
  const createBeritaAcaraData = (): BeritaAcaraData => {
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    return {
      kopSurat: {
        namaInstansi: 'PEMERINTAH KABUPATEN TUBAN',
        namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN',
        alamat: 'Jalan Mastrip No. 5, Sidorejo, Tuban, Jawa Timur 62315',
        telepon: '(0356) 322086',
        laman: 'www.tubankab.go.id',
        email: 'pertanian@tubankab.go.id',
      },
      nomorSurat: transaction.letterNumber,
      namaHari: days[today.getDay()],
      tanggal: today.getDate().toString(),
      bulan: months[today.getMonth()],
      tahun: today.getFullYear().toString(),
      pihakPertama: {
        nama: documentData.staffName,
        nip: '197501012005011001', // Mock NIP
        jabatan: 'Kepala Bidang Sarana dan Prasarana Pertanian',
        instansi: 'Dinas Pertanian dan Ketahanan Pangan Kabupaten Tuban',
      },
      pihakKedua: {
        nama: documentData.pplOfficer,
        jabatan: 'Koordinator Penyuluh',
        instansi: 'BPP Kecamatan Tuban',
        namaKecamatan: 'Tuban',
        nip: '198203152010012002', // Mock NIP
      },
      kategoriObat: 'pestisida',
      daftarBarang: documentData.approvedDrugs.map((drug, index) => ({
        nomor: index + 1,
        kategoriObat: drug.name.includes('Insektisida') ? 'Insektisida' : 
                      drug.name.includes('Fungisida') ? 'Fungisida' : 
                      drug.name.includes('Herbisida') ? 'Herbisida' : 'Pestisida',
        opt: documentData.pestType,
        merekDagang: drug.name,
        jumlah: `${drug.quantity} ${drug.unit}`,
        keterangan: 'Kondisi baik',
      })),
      suratPermintaan: {
        nomor: transaction.letterNumber,
        tanggal: format(today, 'dd MMMM yyyy', { locale: id }),
      },
      kelompokTani: {
        nama: documentData.farmerGroup,
        namaKetua: 'Bapak Sutrisno', // Mock data
        lokasiLahan: 'Desa Sidorejo, Kecamatan Tuban',
        luasLahanTerserang: '5,2 Ha', // Mock data
        jenisKomoditas: documentData.commodity,
        jenisOPT: documentData.pestType,
      },
      customNarrative: {
        pembukaan: 'Pada hari ini, [Nama Hari], tanggal [penyebutan tanggal bukan angka] bulan [Nama Bulan] tahun Dua Ribu Dua Puluh Lima, Kabupaten Tuban, kami yang bertanda tangan di bawah ini:',
        penutup: 'Dengan ditandatanganinya berita acara ini, PIHAK KEDUA menyatakan telah menerima seluruh bantuan tersebut dalam kondisi baik dan jumlah yang sesuai. Bantuan ini akan segera disalurkan oleh PIHAK KEDUA kepada kelompok tani yang terdampak bencana untuk dimanfaatkan sesuai peruntukannya dan tidak untuk diperjualbelikan. Sejak saat ini, tanggung jawab atas pengelolaan, penyimpanan, dan penyaluran bantuan beralih sepenuhnya kepada PIHAK KEDUA.',
        keterangan: 'Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.',
      },
    };
  };

  // Generate PDF document using template
  const generatePDF = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mark as generated (using template component for display)
      onUpdateState({
        documentGeneration: {
          pdfBlob: null, // We'll use the template component directly
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
  }, [onUpdateState]);

  // Handle print using template
  const handlePrint = useCallback(async () => {
    try {
      setIsPrinting(true);

      // Use window.print() with the template component
      window.print();
      
      // Mark as printed
      setPrintCompleted(true);
      onUpdateState({
        documentGeneration: {
          ...wizardState.documentGeneration,
          printed: true,
          timestamp: new Date()
        }
      });

      toast.success('Dokumen berhasil dicetak');
    } catch (err) {
      console.error('Print failed:', err);
      toast.error('Gagal mencetak dokumen');
    } finally {
      setIsPrinting(false);
    }
  }, [wizardState.documentGeneration, onUpdateState]);

  // Handle next step
  const handleNext = () => {
    if (!printCompleted) {
      toast.error('Dokumen harus dicetak terlebih dahulu sebelum melanjutkan');
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Berita Acara Template - Hidden in normal view, shown when printing */}
      <div className="print-only">
        <BeritaAcaraTemplate data={createBeritaAcaraData()} />
      </div>

      {/* Document Generation Card - Hidden when printing */}
      <Card className="no-print">
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
                    <Badge color="secondary" className="text-xs">
                      {drug.quantity} {drug.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          {!wizardState.documentGeneration?.timestamp && (
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

          {/* Document Actions */}
          {wizardState.documentGeneration?.timestamp && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon icon="lucide:check-circle" className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-700 dark:text-green-300">
                    Berita Acara Siap
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Dokumen telah dibuat dan siap untuk dicetak. 
                  Gunakan tombol "Cetak Dokumen" untuk mencetak.
                </p>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Preview Berita Acara</h4>
                  <Link href="/template-settings/berita-acara" target="_blank">
                    <Button variant="outline" size="sm">
                      <Icon icon="lucide:settings" className="w-4 h-4 mr-2" />
                      Pengaturan Template
                    </Button>
                  </Link>
                </div>
                <div style={{ transform: 'scale(0.6)', transformOrigin: 'top left', height: '400px', overflow: 'hidden' }}>
                  <BeritaAcaraTemplate data={createBeritaAcaraData()} isPreview={true} />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="w-full"
                  size="lg"
                >
                  {isPrinting && (
                    <Icon icon="lucide:loader-2" className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  <Icon icon="lucide:printer" className="w-4 h-4 mr-2" />
                  {isPrinting ? 'Mencetak...' : 'Cetak Dokumen'}
                </Button>

                {printCompleted && (
                  <Alert>
                    <Icon icon="lucide:check-circle" className="h-4 w-4" />
                    <AlertDescription>
                      Dokumen telah dicetak. Pastikan dokumen ditandatangani oleh kedua belah pihak 
                      sebelum melanjutkan ke langkah berikutnya.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Actions Card */}
      {wizardState.documentGeneration?.timestamp && (
        <Card className="no-print">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Status Dokumen</span>
              <Badge color={printCompleted ? "success" : "secondary"}>
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

            {/* Print Button */}
            <div className="space-y-3">
              <Button
                onClick={handlePrint}
                disabled={isPrinting}
                className="w-full"
                size="lg"
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
                  Tanda tangan {documentData.pplOfficer} sebagai penerima
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

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

// # END OF Step 3 Document Generation Component 