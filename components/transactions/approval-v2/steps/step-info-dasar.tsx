// # START OF Step Info Dasar - Wizard step 1 for Pengajuan ke Dinas
// Purpose: Display basic information (location, group leaders, documents)
// Features: Responsive layout, document viewer, gapoktan sub-group list
// Dependencies: ApprovalItem type, ScrollArea

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ApprovalItem,
  DOCUMENT_TYPE_LABELS,
} from "@/lib/types/approval";
import { formatTanggal } from "@/lib/data/approval-mock";

// ─── Reusable sub-components ───

const SectionHeader: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
  iconBg?: string;
  iconColor?: string;
}> = ({ icon, title, subtitle, iconBg = 'bg-blue-100 dark:bg-blue-900/40', iconColor = 'text-blue-600 dark:text-blue-400' }) => (
  <div className="flex items-center gap-2.5 mb-3">
    <div className={cn("p-2 rounded-lg", iconBg)}>
      <Icon icon={icon} className={cn("w-4.5 h-4.5", iconColor)} />
    </div>
    <div>
      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{title}</h4>
      {subtitle && <p className="text-[11px] text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

const InfoRow: React.FC<{
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}> = ({ label, value, mono }) => (
  <div className="flex justify-between items-start py-1.5 gap-2">
    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
    <span className={cn(
      "text-xs text-right font-medium text-gray-800 dark:text-gray-200",
      mono && "font-mono"
    )}>
      {value}
    </span>
  </div>
);

// ─── Main Component ───

interface StepInfoDasarProps {
  item: ApprovalItem;
}

const StepInfoDasar: React.FC<StepInfoDasarProps> = ({ item }) => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-5 pr-2 pb-4">
        {/* ── Section: Lokasi ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-800/30">
          <SectionHeader
            icon="heroicons:map-pin"
            title="Lokasi"
            iconBg="bg-emerald-100 dark:bg-emerald-900/40"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <div className="space-y-0.5">
            <InfoRow label="Kecamatan" value={item.kecamatan} />
            <InfoRow label="Desa" value={item.desa} />
          </div>
        </div>

        {/* ── Section: Info Gapoktan/Poktan ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-800/30">
          <SectionHeader
            icon={item.tipe === 'gapoktan' ? 'heroicons:user-group' : 'heroicons:users'}
            title={item.tipe === 'gapoktan' ? 'Informasi Gapoktan' : 'Informasi Poktan'}
            subtitle={item.tipe === 'gapoktan'
              ? `${item.poktanList.length} poktan dibawahi`
              : undefined}
            iconBg="bg-blue-100 dark:bg-blue-900/40"
            iconColor="text-blue-600 dark:text-blue-400"
          />

          <div className="space-y-0.5">
            <InfoRow
              label={item.tipe === 'gapoktan' ? 'Nama Gapoktan' : 'Nama Poktan'}
              value={item.namaGrup}
            />
            <InfoRow
              label={item.tipe === 'gapoktan' ? 'Ketua Gapoktan' : 'Ketua Poktan'}
              value={item.ketuaGrup}
            />
            <InfoRow label="NIK" value={item.nikKetuaGrup} mono />
            <InfoRow label="No. HP" value={item.hpKetuaGrup} mono />
          </div>

          {/* Sub-poktan list for Gapoktan */}
          {item.tipe === 'gapoktan' && item.poktanList.length > 0 && (
            <>
              <Separator className="my-3" />
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Poktan yang diajukan
                </p>
                {item.poktanList.map((poktan, idx) => (
                  <div
                    key={poktan.id}
                    className={cn(
                      "rounded-lg border p-3 space-y-0.5",
                      "border-blue-100 dark:border-blue-900/50",
                      "bg-white dark:bg-gray-900/50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {poktan.nama}
                      </span>
                    </div>
                    <InfoRow label="Ketua" value={poktan.ketua} />
                    <InfoRow label="NIK" value={poktan.nikKetua} mono />
                    <InfoRow label="No. HP" value={poktan.hpKetua} mono />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Single poktan detail (already shown above) */}
          {item.tipe === 'poktan' && item.poktanList.length === 1 && (
            <>
              <Separator className="my-3" />
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Icon icon="heroicons:information-circle" className="w-3.5 h-3.5" />
                Poktan tunggal — data ketua sudah tercantum di atas
              </div>
            </>
          )}
        </div>

        {/* ── Section: Pengajuan oleh (PPL) ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-800/30">
          <SectionHeader
            icon="heroicons:identification"
            title="Diajukan Oleh"
            iconBg="bg-indigo-100 dark:bg-indigo-900/40"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <div className="space-y-0.5">
            <InfoRow label="Nama" value={item.diajukanOleh.nama} />
            <InfoRow label="NIP" value={item.diajukanOleh.nip} mono />
            <InfoRow label="Jabatan" value={item.diajukanOleh.jabatan} />
            {item.namaPopt && <InfoRow label="POPT" value={item.namaPopt} />}
          </div>
        </div>

        {/* ── Section: Dokumen ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-800/30">
          <SectionHeader
            icon="heroicons:document-text"
            title="Dokumen"
            subtitle={`${item.dokumen.length} dokumen terlampir`}
            iconBg="bg-amber-100 dark:bg-amber-900/40"
            iconColor="text-amber-600 dark:text-amber-400"
          />

          <div className="space-y-2.5">
            {item.dokumen.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg border",
                  "border-gray-100 dark:border-gray-800",
                  "bg-white dark:bg-gray-900/50",
                  "hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                )}
              >
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 shrink-0">
                  <Icon
                    icon={
                      doc.filename.endsWith('.pdf')
                        ? 'heroicons:document'
                        : doc.filename.endsWith('.zip')
                          ? 'heroicons:archive-box'
                          : 'heroicons:paper-clip'
                    }
                    className="w-4 h-4 text-red-500 dark:text-red-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                    {DOCUMENT_TYPE_LABELS[doc.tipe]}
                  </p>
                  {doc.nomor && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                      {doc.nomor}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    {doc.filename} · {formatTanggal(doc.uploadDate)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // In production: open file viewer
                    window.open(doc.url, '_blank');
                  }}
                >
                  <Icon icon="heroicons:eye" className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Catatan ── */}
        {item.catatan && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-yellow-50/50 dark:bg-yellow-950/20">
            <div className="flex items-start gap-2">
              <Icon icon="heroicons:chat-bubble-bottom-center-text" className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-0.5">Catatan PPL</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400/80">{item.catatan}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default StepInfoDasar;
