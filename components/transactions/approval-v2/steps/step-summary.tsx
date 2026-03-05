// # START OF Step Summary (Kesimpulan) - Wizard step 3 for Pengajuan ke Dinas
// Purpose: Display complete summary of data & selected medicines before approval
// Features: Read-only recap, grouped by poktan, document list, action button
// Also used by Persetujuan Dinas modal (readOnly mode)

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ApprovalItem,
  ApprovedMedicineDetail,
  MedicineSelectionState,
  DOCUMENT_TYPE_LABELS,
  APPROVAL_STATUS_CONFIG,
} from "@/lib/types/approval";
import { formatTanggal } from "@/lib/data/approval-mock";
import { mockMedicineStock } from "@/lib/data/transaction-list-mock";

// ─── Types ───

interface StepSummaryProps {
  item: ApprovalItem;
  /** From wizard step 2 (pengajuan flow) */
  selections?: MedicineSelectionState[];
  /** For persetujuan/gudang flow – use pre-approved data */
  readOnly?: boolean;
}

// ─── Reusable ───

const SummarySection: React.FC<{
  icon: string;
  title: string;
  iconBg?: string;
  iconColor?: string;
  children: React.ReactNode;
}> = ({
  icon,
  title,
  iconBg = 'bg-gray-100 dark:bg-gray-800',
  iconColor = 'text-gray-600 dark:text-gray-400',
  children,
}) => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
    <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-800/50">
      <div className={cn("p-1.5 rounded-lg", iconBg)}>
        <Icon icon={icon} className={cn("w-4 h-4", iconColor)} />
      </div>
      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{title}</h4>
    </div>
    <div className="p-3">{children}</div>
  </div>
);

const SummaryRow: React.FC<{
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}> = ({ label, value, mono }) => (
  <div className="flex justify-between items-start py-1 gap-2">
    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
    <span
      className={cn(
        "text-xs text-right font-medium text-gray-800 dark:text-gray-200",
        mono && "font-mono"
      )}
    >
      {value}
    </span>
  </div>
);

// ─── Helper: Convert selections to display items ───

const selectionsToDisplayItems = (
  selections: MedicineSelectionState[]
): {
  poktanId: string;
  medicines: {
    nama: string;
    bahanAktif: string;
    jumlahBesar: number;
    satuanBesar: string;
    jumlahKecil: number;
    satuanKecil: string;
    isPreferensiBpp: boolean;
    isRekomendasiOpt: boolean;
  }[];
}[] => {
  return selections
    .filter((s) => s.selectedMedicines.length > 0)
    .map((s) => ({
      poktanId: s.poktanId,
      medicines: s.selectedMedicines
        .filter((m) => m.jumlahBesar > 0 || m.jumlahKecil > 0)
        .map((m) => {
          const stock = mockMedicineStock.find((ms) => ms.id === m.medicineId);
          return {
            nama: m.nama,
            bahanAktif: m.bahanAktif,
            jumlahBesar: m.jumlahBesar,
            satuanBesar: m.satuanBesar,
            jumlahKecil: m.jumlahKecil,
            satuanKecil: m.satuanKecil,
            isPreferensiBpp: false,
            isRekomendasiOpt: !!stock,
          };
        }),
    }));
};

// ─── Main Component ───

const StepSummary: React.FC<StepSummaryProps> = ({
  item,
  selections,
  readOnly = false,
}) => {
  const statusConfig = APPROVAL_STATUS_CONFIG[item.status];

  // Build display items from either selections or pre-approved data
  const approvedByPoktan = readOnly && item.obatDisetujui
    ? groupApprovedByPoktan(item.obatDisetujui)
    : selections
      ? selectionsToDisplayItems(selections)
      : [];

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-2 pb-4">
        {/* Status banner */}
        {readOnly && (
          <div
            className={cn(
              "rounded-lg p-3 border flex items-center gap-3",
              statusConfig.bgColor,
              statusConfig.borderColor
            )}
          >
            <Icon icon={statusConfig.icon} className={cn("w-5 h-5", statusConfig.color)} />
            <div>
              <p className={cn("text-sm font-semibold", statusConfig.color)}>
                {statusConfig.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {statusConfig.description}
              </p>
            </div>
          </div>
        )}

        {/* Data Pemohon */}
        <SummarySection
          icon="heroicons:identification"
          title="Data Pemohon"
          iconBg="bg-blue-100 dark:bg-blue-900/40"
          iconColor="text-blue-600 dark:text-blue-400"
        >
          <div className="space-y-0.5">
            <SummaryRow label="Kecamatan" value={item.kecamatan} />
            <SummaryRow label="Desa" value={item.desa} />
            <SummaryRow
              label={item.tipe === 'gapoktan' ? 'Gapoktan' : 'Poktan'}
              value={item.namaGrup}
            />
            <SummaryRow label="Ketua" value={item.ketuaGrup} />
            <SummaryRow label="NIK" value={item.nikKetuaGrup} mono />
            <SummaryRow label="No. HP" value={item.hpKetuaGrup} mono />
            <SummaryRow label="Diajukan oleh" value={item.diajukanOleh.nama} />
            {item.namaPopt && <SummaryRow label="POPT" value={item.namaPopt} />}
            <SummaryRow label="Tanggal Pengajuan" value={formatTanggal(item.tanggalPengajuan)} />
            {item.tanggalDisetujui && (
              <SummaryRow label="Tanggal Disetujui" value={formatTanggal(item.tanggalDisetujui)} />
            )}
          </div>
        </SummarySection>

        {/* Detail Pertanian per Poktan */}
        <SummarySection
          icon="heroicons:clipboard-document-list"
          title="Detail Pertanian"
          iconBg="bg-green-100 dark:bg-green-900/40"
          iconColor="text-green-600 dark:text-green-400"
        >
          <div className="space-y-3">
            {item.poktanList.map((poktan, idx) => (
              <div
                key={poktan.id}
                className={cn(
                  "rounded-lg border p-2.5 space-y-1",
                  "border-gray-100 dark:border-gray-800",
                  "bg-gray-50/50 dark:bg-gray-900/30"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/60 text-[10px] font-bold text-green-700 dark:text-green-300">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {poktan.nama}
                  </span>
                </div>
                <SummaryRow
                  label="Komoditas"
                  value={
                    <div className="flex flex-wrap gap-0.5 justify-end">
                      {poktan.komoditas.map((k) => (
                        <Badge key={k} className="text-[10px] px-1 py-0 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  }
                />
                <SummaryRow label="Luas Serangan" value={`${poktan.luasTerserang} Ha`} />
                <SummaryRow label="Luas Waspada" value={`${poktan.luasWaspada} Ha`} />
                <SummaryRow
                  label="OPT"
                  value={
                    <div className="flex flex-wrap gap-0.5 justify-end">
                      {poktan.opt.map((o) => (
                        <Badge
                          key={o}
                          className="text-[10px] px-1 py-0 bg-transparent border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400"
                        >
                          {o}
                        </Badge>
                      ))}
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        </SummarySection>

        {/* Obat yang Disetujui */}
        <SummarySection
          icon="heroicons:beaker"
          title={readOnly ? 'Obat yang Disetujui' : 'Obat yang Dipilih'}
          iconBg="bg-purple-100 dark:bg-purple-900/40"
          iconColor="text-purple-600 dark:text-purple-400"
        >
          {approvedByPoktan.length > 0 ? (
            <div className="space-y-3">
              {approvedByPoktan.map((group) => {
                const poktan = item.poktanList.find((p) => p.id === group.poktanId);
                return (
                  <div key={group.poktanId}>
                    {item.poktanList.length > 1 && (
                      <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        {poktan?.nama || group.poktanId}
                      </p>
                    )}
                    <div className="space-y-1.5">
                      {group.medicines.map((med, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg border",
                            "border-purple-100 dark:border-purple-900/50",
                            "bg-purple-50/50 dark:bg-purple-950/20"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                {med.nama}
                              </span>
                              {med.isPreferensiBpp && (
                                <Icon icon="heroicons:star-mini" className="w-3 h-3 text-blue-500" />
                              )}
                              {med.isRekomendasiOpt && (
                                <Icon icon="heroicons:shield-check-mini" className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              {med.bahanAktif}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
                              {med.jumlahBesar} {med.satuanBesar}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              ({med.jumlahKecil.toLocaleString()} {med.satuanKecil})
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-gray-400">
              <Icon icon="heroicons:inbox" className="w-6 h-6 mx-auto mb-1 opacity-50" />
              Belum ada obat yang dipilih
            </div>
          )}
        </SummarySection>

        {/* Dokumen */}
        <SummarySection
          icon="heroicons:document-text"
          title="Dokumen"
          iconBg="bg-amber-100 dark:bg-amber-900/40"
          iconColor="text-amber-600 dark:text-amber-400"
        >
          <div className="space-y-1.5">
            {item.dokumen.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30"
              >
                <Icon
                  icon="heroicons:document"
                  className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                    {DOCUMENT_TYPE_LABELS[doc.tipe]}
                  </p>
                  {doc.nomor && (
                    <p className="text-[10px] text-gray-500 font-mono truncate">{doc.nomor}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SummarySection>

        {/* Catatan */}
        {(item.catatan || item.catatanPersetujuan) && (
          <SummarySection
            icon="heroicons:chat-bubble-bottom-center-text"
            title="Catatan"
            iconBg="bg-yellow-100 dark:bg-yellow-900/40"
            iconColor="text-yellow-600 dark:text-yellow-400"
          >
            <div className="space-y-2">
              {item.catatan && (
                <div>
                  <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                    Catatan PPL:
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{item.catatan}</p>
                </div>
              )}
              {item.catatanPersetujuan && (
                <div>
                  <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                    Catatan Persetujuan:
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {item.catatanPersetujuan}
                  </p>
                </div>
              )}
            </div>
          </SummarySection>
        )}
      </div>
    </ScrollArea>
  );
};

// ─── Helper: Group approved medicines by poktan ───

function groupApprovedByPoktan(
  medicines: ApprovedMedicineDetail[]
): {
  poktanId: string;
  medicines: {
    nama: string;
    bahanAktif: string;
    jumlahBesar: number;
    satuanBesar: string;
    jumlahKecil: number;
    satuanKecil: string;
    isPreferensiBpp: boolean;
    isRekomendasiOpt: boolean;
  }[];
}[] {
  const grouped = new Map<string, typeof medicines>();
  medicines.forEach((m) => {
    const list = grouped.get(m.poktanId) || [];
    list.push(m);
    grouped.set(m.poktanId, list);
  });

  return Array.from(grouped.entries()).map(([poktanId, meds]) => ({
    poktanId,
    medicines: meds.map((m) => ({
      nama: m.nama,
      bahanAktif: m.bahanAktif,
      jumlahBesar: m.jumlahBesar,
      satuanBesar: m.satuanBesar,
      jumlahKecil: m.jumlahKecil,
      satuanKecil: m.satuanKecil,
      isPreferensiBpp: m.isPreferensiBpp,
      isRekomendasiOpt: m.isRekomendasiOpt,
    })),
  }));
}

export default StepSummary;
