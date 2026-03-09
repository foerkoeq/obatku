// # START OF Step Detail - Request detail view for outgoing wizard
// Purpose: Display request details (farmer, commodities, notes, approved medicines with FIFO)
// Read-only informational step

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OutgoingItem } from "@/lib/types/outgoing";
import { StockBatchItem } from "@/lib/types/outgoing";
import { ApprovedMedicineDetail } from "@/lib/types/approval";
import {
  getStockBatchesByMedicine,
  formatTanggalOutgoing,
  daysUntilExpiry,
} from "@/lib/data/outgoing-mock";

interface StepDetailProps {
  item: OutgoingItem;
}

const StepDetail: React.FC<StepDetailProps> = ({ item }) => {
  const obatList = item.obatDisetujui ?? [];

  // Group by poktan
  const obatByPoktan = obatList.reduce<Record<string, ApprovedMedicineDetail[]>>((acc, med) => {
    if (!acc[med.poktanNama]) acc[med.poktanNama] = [];
    acc[med.poktanNama].push(med);
    return acc;
  }, {});

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pb-4">
        {/* Request Info Card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-500" />
            Informasi Permintaan
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Farmer Group */}
            <InfoRow
              icon="heroicons:user-group-mini"
              label="Kelompok Tani"
              value={item.namaGrup}
              sub={item.tipe === 'gapoktan' ? `Gapoktan · ${item.poktanList.length} poktan` : 'Poktan'}
            />
            {/* Ketua */}
            <InfoRow
              icon="heroicons:user-mini"
              label="Ketua"
              value={item.ketuaGrup}
              sub={item.hpKetuaGrup}
            />
            {/* Location */}
            <InfoRow
              icon="heroicons:map-pin-mini"
              label="Lokasi"
              value={`Ds. ${item.desa}, Kec. ${item.kecamatan}`}
            />
            {/* PPL */}
            <InfoRow
              icon="heroicons:identification-mini"
              label="Diajukan oleh"
              value={item.diajukanOleh.nama}
              sub={item.diajukanOleh.jabatan}
            />
            {/* Date */}
            <InfoRow
              icon="heroicons:calendar-mini"
              label="Tanggal Disetujui"
              value={formatTanggalOutgoing(item.tanggalDisetujui ?? item.tanggalPengajuan)}
            />
            {/* POPT */}
            {item.namaPopt && (
              <InfoRow
                icon="heroicons:academic-cap-mini"
                label="POPT"
                value={item.namaPopt}
              />
            )}
          </div>

          {/* Komoditas & OPT */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Komoditas</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.komoditas.map((k) => (
                  <Badge key={k} className="text-[11px] px-1.5 py-0 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">OPT</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.opt.map((o) => (
                  <Badge key={o} className="text-[11px] px-1.5 py-0 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">
                    {o}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notes from Dinas */}
        {(item.catatan || item.catatanPersetujuan) && (
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
              <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4" />
              Catatan
            </div>
            {item.catatanPersetujuan && (
              <div className="text-sm text-blue-600 dark:text-blue-400">
                <span className="font-medium">Dinas:</span> {item.catatanPersetujuan}
              </div>
            )}
            {item.catatan && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">PPL:</span> {item.catatan}
              </div>
            )}
          </div>
        )}

        {/* Approved Medicines List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <Icon icon="heroicons:beaker" className="w-5 h-5 text-purple-500" />
            Daftar Obat yang Dikeluarkan
          </div>

          {Object.entries(obatByPoktan).map(([poktanNama, medicines]) => (
            <div key={poktanNama} className="space-y-2">
              {Object.keys(obatByPoktan).length > 1 && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                  <Icon icon="heroicons:user-group-mini" className="w-3.5 h-3.5" />
                  {poktanNama}
                </div>
              )}

              {medicines.map((med) => (
                <MedicineItemCard key={med.id} medicine={med} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

// ─── Info Row ───
const InfoRow: React.FC<{
  icon: string;
  label: string;
  value: string;
  sub?: string;
}> = ({ icon, label, value, sub }) => (
  <div className="flex items-start gap-2">
    <Icon icon={icon} className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
    <div className="min-w-0">
      <div className="text-[11px] text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{value}</div>
      {sub && <div className="text-[11px] text-gray-500 dark:text-gray-400">{sub}</div>}
    </div>
  </div>
);

// ─── Medicine Item Card with FIFO recommendation ───
const MedicineItemCard: React.FC<{ medicine: ApprovedMedicineDetail }> = ({ medicine }) => {
  const stockBatches = getStockBatchesByMedicine(medicine.medicineId);
  const nearestExpiry = stockBatches[0]; // first = nearest expiry (FIFO)

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {medicine.nama}
            </h4>
            {medicine.isPreferensiBpp && (
              <Badge className="text-[10px] px-1 py-0 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shrink-0">
                BPP
              </Badge>
            )}
            {medicine.isRekomendasiOpt && (
              <Badge className="text-[10px] px-1 py-0 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 shrink-0">
                OPT
              </Badge>
            )}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {medicine.bahanAktif}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
            {medicine.jumlahBesar}
          </div>
          <div className="text-[11px] text-gray-500">{medicine.satuanBesar}</div>
        </div>
      </div>

      {/* FIFO Recommendation */}
      {nearestExpiry && (
        <div className={cn(
          "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs",
          nearestExpiry.isExpiringSoon
            ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
            : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
        )}>
          <Icon
            icon={nearestExpiry.isExpiringSoon ? "heroicons:exclamation-triangle-mini" : "heroicons:light-bulb-mini"}
            className={cn(
              "w-4 h-4 shrink-0",
              nearestExpiry.isExpiringSoon ? "text-amber-500" : "text-blue-500"
            )}
          />
          <div className="min-w-0 flex-1">
            <span className={cn(
              "font-medium",
              nearestExpiry.isExpiringSoon ? "text-amber-700 dark:text-amber-300" : "text-gray-700 dark:text-gray-300"
            )}>
              Rekomendasi FIFO:
            </span>{' '}
            <span className="text-gray-600 dark:text-gray-400">
              Batch {nearestExpiry.batchNumber} · {nearestExpiry.lokasi} · Exp{' '}
              {formatTanggalOutgoing(nearestExpiry.expiryDate)}
              {nearestExpiry.isExpiringSoon && (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {' '}({daysUntilExpiry(nearestExpiry.expiryDate)} hari lagi)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Stock availability */}
      {stockBatches.length > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <Icon icon="heroicons:archive-box-mini" className="w-3 h-3" />
          Stok tersedia: {stockBatches.reduce((sum, b) => sum + b.quantity, 0)} {medicine.satuanBesar}
          {stockBatches.length > 1 && ` (${stockBatches.length} batch)`}
        </div>
      )}
    </div>
  );
};

export default StepDetail;
// # END OF Step Detail
