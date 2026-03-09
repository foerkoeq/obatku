// # START OF Outgoing Card - Card component for outgoing/distribution items
// Purpose: Display outgoing item with status theming, medicine count, FIFO alerts
// Style: Matches ApprovalCardV2 pattern with warehouse-specific info

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  OutgoingItem,
  OUTGOING_STATUS_CONFIG,
} from "@/lib/types/outgoing";
import {
  formatTanggalOutgoing,
  truncateOutgoingList,
  getTotalMedicineCount,
  daysSince,
} from "@/lib/data/outgoing-mock";

interface OutgoingCardProps {
  item: OutgoingItem;
  onProcess: (item: OutgoingItem) => void;
}

const OutgoingCard: React.FC<OutgoingCardProps> = ({ item, onProcess }) => {
  const statusConfig = OUTGOING_STATUS_CONFIG[item.outgoingStatus];
  const isSelesai = item.outgoingStatus === 'selesai';

  const poktanNames = item.tipe === 'gapoktan'
    ? item.poktanList.map((p) => p.nama)
    : [];
  const truncatedPoktan = truncateOutgoingList(poktanNames, 2);
  const truncatedKomoditas = truncateOutgoingList(item.komoditas, 2);
  const truncatedOpt = truncateOutgoingList(item.opt, 2);

  const totalMeds = getTotalMedicineCount(item);
  const medTypes = new Set((item.obatDisetujui ?? []).map((m) => m.medicineId)).size;
  const waitingDays = daysSince(item.tanggalDisetujui ?? item.tanggalPengajuan);

  return (
    <div
      onClick={() => onProcess(item)}
      className={cn(
        "group relative flex flex-col rounded-xl border-2 overflow-hidden",
        "bg-white dark:bg-gray-900",
        "transition-all duration-300 ease-out cursor-pointer",
        "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20",
        "hover:-translate-y-1 hover:border-opacity-80",
        "active:scale-[0.98]",
        statusConfig.borderColor
      )}
    >
      {/* Top gradient accent bar */}
      <div
        className={cn(
          "h-1.5 w-full bg-gradient-to-r",
          statusConfig.gradientFrom,
          statusConfig.gradientTo
        )}
      />

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-4 space-y-3">
        {/* Header: Name + Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              {item.tipe === 'gapoktan' && (
                <span
                  className={cn(
                    "shrink-0 inline-flex items-center justify-center",
                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    "bg-gradient-to-r text-white",
                    statusConfig.gradientFrom,
                    statusConfig.gradientTo
                  )}
                >
                  Gapoktan
                </span>
              )}
              <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate">
                {item.namaGrup}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Icon icon="heroicons:map-pin-mini" className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Ds. {item.desa}, Kec. {item.kecamatan}
              </span>
            </div>
          </div>

          <span
            className={cn(
              "shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium",
              statusConfig.badgeClass
            )}
          >
            <Icon icon={statusConfig.icon} className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{statusConfig.label}</span>
          </span>
        </div>

        {/* Submitted by */}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full shrink-0",
            statusConfig.bgColor
          )}>
            <Icon icon="heroicons:user-mini" className={cn("w-3.5 h-3.5", statusConfig.color)} />
          </div>
          <span className="truncate">
            PPL: <strong className="text-gray-800 dark:text-gray-200">{item.diajukanOleh.nama}</strong>
          </span>
        </div>

        {/* Gapoktan sub-groups */}
        {item.tipe === 'gapoktan' && poktanNames.length > 0 && (
          <div className="flex items-start gap-2 text-xs">
            <Icon icon="heroicons:user-group-mini" className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", statusConfig.color)} />
            <div className="flex flex-wrap gap-1">
              {truncatedPoktan.visible.map((name) => (
                <span
                  key={name}
                  className={cn(
                    "inline-flex px-1.5 py-0.5 rounded text-[11px]",
                    statusConfig.bgColor,
                    statusConfig.color
                  )}
                >
                  {name}
                </span>
              ))}
              {truncatedPoktan.overflow > 0 && (
                <span
                  className={cn(
                    "inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium",
                    statusConfig.bgColor,
                    statusConfig.color
                  )}
                >
                  +{truncatedPoktan.overflow}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Medicine summary */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg",
          statusConfig.bgColor,
        )}>
          <div className="flex items-center gap-1.5">
            <Icon icon="heroicons:beaker-mini" className={cn("w-4 h-4", statusConfig.color)} />
            <span className={cn("text-xs font-semibold", statusConfig.color)}>
              {medTypes} jenis
            </span>
          </div>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-1.5">
            <Icon icon="heroicons:cube-mini" className={cn("w-4 h-4", statusConfig.color)} />
            <span className={cn("text-xs font-semibold", statusConfig.color)}>
              {totalMeds} unit
            </span>
          </div>
          {!isSelesai && waitingDays > 3 && (
            <>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-1">
                <Icon icon="heroicons:clock-mini" className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  {waitingDays}h
                </span>
              </div>
            </>
          )}
        </div>

        {/* Info Grid: Komoditas & OPT */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <Icon icon="heroicons:squares-2x2-mini" className="w-3 h-3" />
              Komoditas
            </div>
            <div className="flex flex-wrap gap-1">
              {truncatedKomoditas.visible.map((k) => (
                <Badge
                  key={k}
                  className="text-[11px] px-1.5 py-0 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {k}
                </Badge>
              ))}
              {truncatedKomoditas.overflow > 0 && (
                <Badge className="text-[11px] px-1.5 py-0 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  +{truncatedKomoditas.overflow}
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <Icon icon="heroicons:bug-ant-mini" className="w-3 h-3" />
              OPT
            </div>
            <div className="flex flex-wrap gap-1">
              {truncatedOpt.visible.map((o) => (
                <Badge
                  key={o}
                  className="text-[11px] px-1.5 py-0 bg-transparent border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                >
                  {o}
                </Badge>
              ))}
              {truncatedOpt.overflow > 0 && (
                <Badge
                  className="text-[11px] px-1.5 py-0 bg-transparent border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                >
                  +{truncatedOpt.overflow}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
          <Icon icon="heroicons:calendar-mini" className="w-3 h-3" />
          Disetujui {formatTanggalOutgoing(item.tanggalDisetujui ?? item.tanggalPengajuan)}
        </div>
      </div>

      {/* Footer: Action Button */}
      <div className="px-4 pb-4 pt-0">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onProcess(item);
          }}
          className={cn(
            "w-full text-sm font-medium bg-gradient-to-r text-white",
            "transition-all duration-200",
            "shadow-sm hover:shadow-md",
            statusConfig.gradientFrom,
            statusConfig.gradientTo
          )}
          size="sm"
        >
          <Icon
            icon={isSelesai ? "heroicons:eye" : "heroicons:arrow-right-circle"}
            className="w-4 h-4 mr-1.5"
          />
          {isSelesai ? 'Lihat Detail' : 'Proses Pengeluaran'}
        </Button>
      </div>
    </div>
  );
};

export default OutgoingCard;
// # END OF Outgoing Card
