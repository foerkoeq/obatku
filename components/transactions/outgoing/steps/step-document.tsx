// # START OF Step Document - Auto-generate & preview Berita Acara
// Purpose: Generate berita acara PDF for distribution, print/save
// Features: Auto-generated document preview, print button, save PDF

"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { OutgoingItem, OutgoingWizardState } from "@/lib/types/outgoing";
import { formatTanggalOutgoing } from "@/lib/data/outgoing-mock";

interface StepDocumentProps {
  item: OutgoingItem;
  wizardState: OutgoingWizardState;
  onUpdateState: (updates: Partial<OutgoingWizardState>) => void;
}

const StepDocument: React.FC<StepDocumentProps> = ({ item, wizardState, onUpdateState }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { beritaAcaraGenerated, scannedItems } = wizardState;

  const baNomor = `BA/${item.id.replace('OUT-', '')}/${new Date().getFullYear()}`;
  const tanggalNow = formatTanggalOutgoing(new Date());

  // Group scanned items by medicine
  const groupedItems = useMemo(() => {
    const groups: Record<string, { nama: string; bahanAktif: string; satuan: string; items: typeof scannedItems }> = {};
    scannedItems.forEach((s) => {
      if (!groups[s.medicineId]) {
        groups[s.medicineId] = {
          nama: s.nama,
          bahanAktif: s.bahanAktif,
          satuan: s.satuan,
          items: [],
        };
      }
      groups[s.medicineId].items.push(s);
    });
    return groups;
  }, [scannedItems]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate PDF generation
    await new Promise((r) => setTimeout(r, 1500));
    onUpdateState({
      beritaAcaraGenerated: true,
      beritaAcaraPdfUrl: `/uploads/ba/ba_${item.id.toLowerCase()}.pdf`,
    });
    setIsGenerating(false);
    toast.success('Berita Acara berhasil di-generate!');
  };

  const handlePrint = () => {
    // In real app, this would trigger browser print dialog for the PDF
    toast.info('Membuka dialog cetak...', {
      description: 'Cetak Berita Acara untuk ditandatangani secara manual.',
    });
    window.print();
  };

  const handleDownload = () => {
    // In real app, this would trigger a download
    toast.success('Berita Acara berhasil diunduh', {
      description: `File: BA_${item.id}.pdf`,
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pb-4">
        {/* Info */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4">
          <div className="flex items-start gap-3">
            <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Berita Acara Distribusi
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Generate berita acara otomatis berdasarkan data verifikasi.
                Cetak atau simpan PDF untuk ditandatangani secara manual oleh kedua belah pihak.
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        {!beritaAcaraGenerated && (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:from-purple-600 hover:to-fuchsia-600"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Icon icon="heroicons:document-text" className="w-5 h-5 mr-2" />
                Generate Berita Acara
              </>
            )}
          </Button>
        )}

        {/* Document Preview */}
        {beritaAcaraGenerated && (
          <>
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-950/30"
              >
                <Icon icon="heroicons:printer" className="w-4 h-4 mr-1.5" />
                Cetak
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
              >
                <Icon icon="heroicons:arrow-down-tray" className="w-4 h-4 mr-1.5" />
                Simpan PDF
              </Button>
            </div>

            {/* Document Preview Card */}
            <div className="rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 overflow-hidden">
              {/* Header */}
              <div className="text-center p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">
                  Pemerintah Kabupaten Tuban
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Dinas Pertanian dan Ketahanan Pangan
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  BERITA ACARA
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Serah Terima Obat Pertanian
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Nomor: {baNomor}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
                {/* Opening */}
                <p className="text-xs leading-relaxed">
                  Pada hari ini, {tanggalNow}, kami yang bertanda tangan di bawah ini melakukan
                  serah terima obat pertanian dengan rincian sebagai berikut:
                </p>

                {/* Parties */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-1.5">
                    <div className="text-[11px] font-medium text-gray-500 uppercase">Pihak Pertama (Gudang)</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Petugas Gudang Dinas
                    </div>
                    <div className="text-xs text-gray-500">
                      Dinas Pertanian Kab. Tuban
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-1.5">
                    <div className="text-[11px] font-medium text-gray-500 uppercase">Pihak Kedua (Penerima)</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.ketuaGrup}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ketua {item.tipe === 'gapoktan' ? 'Gapoktan' : 'Poktan'} {item.namaGrup}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ds. {item.desa}, Kec. {item.kecamatan}
                    </div>
                  </div>
                </div>

                {/* Item Table */}
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                    Daftar Barang yang Diserahkan:
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">No</th>
                          <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">Nama Obat</th>
                          <th className="text-center p-2 font-medium text-gray-600 dark:text-gray-400">Jml</th>
                          <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">Satuan</th>
                          <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Batch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(groupedItems).map((group, idx) => (
                          <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                            <td className="p-2 text-gray-600 dark:text-gray-400">{idx + 1}</td>
                            <td className="p-2">
                              <div className="font-medium text-gray-900 dark:text-gray-100">{group.nama}</div>
                              <div className="text-[10px] text-gray-500">{group.bahanAktif}</div>
                            </td>
                            <td className="p-2 text-center font-semibold text-gray-900 dark:text-gray-100">
                              {group.items.length}
                            </td>
                            <td className="p-2 text-gray-600 dark:text-gray-400">{group.satuan}</td>
                            <td className="p-2 text-gray-500 hidden sm:table-cell">
                              {group.items.map((i) => i.batchNumber).join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Closing */}
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  Demikian Berita Acara ini dibuat dengan sebenarnya untuk digunakan sebagaimana mestinya.
                </p>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center space-y-12">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Pihak Pertama
                    </div>
                    <div className="text-xs text-gray-400 italic">
                      (tanda tangan)
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 pb-1">
                      Petugas Gudang
                    </div>
                  </div>
                  <div className="text-center space-y-12">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Pihak Kedua
                    </div>
                    <div className="text-xs text-gray-400 italic">
                      (tanda tangan)
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 pb-1">
                      {item.ketuaGrup}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-3 flex items-center gap-3">
              <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500 shrink-0" />
              <div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  Berita Acara Siap
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Cetak dan minta tanda tangan kedua belah pihak, lalu upload di langkah berikutnya.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
};

export default StepDocument;
// # END OF Step Document
