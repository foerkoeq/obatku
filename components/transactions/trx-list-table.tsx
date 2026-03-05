// # START OF TrxListTable - Responsive table for revamped transaction list
// Purpose: Display transactions in table (desktop) and cards (mobile)
// Features: Sortable, responsive, row-click, action buttons
// Props: data, loading, onRowClick, onProcess, onEdit, onDelete
// Dependencies: Table UI, TrxStatusBadge, Icon

"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import TrxStatusBadge from "./trx-status-badge";
import {
  TrxListItem,
  TrxSortDirection,
  TrxSortKey,
} from "@/lib/types/transaction-list";

interface TrxListTableProps {
  data: TrxListItem[];
  loading?: boolean;
  sortKey?: TrxSortKey;
  sortDirection?: TrxSortDirection;
  onSort?: (key: TrxSortKey) => void;
  onRowClick?: (item: TrxListItem) => void;
  onProcess?: (item: TrxListItem) => void;
  onEdit?: (item: TrxListItem) => void;
  onDelete?: (item: TrxListItem) => void;
}

// ========== Mobile Card Component ==========

const MobileCard: React.FC<{
  item: TrxListItem;
  onTap?: () => void;
  onProcess?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ item, onTap, onProcess, onEdit, onDelete }) => {
  const obatDisplay =
    (item.persetujuanObat && item.persetujuanObat.length > 0
      ? item.persetujuanObat
      : item.permintaanObat
    ).join(", ");

  return (
    <div
      className="border rounded-xl p-4 space-y-3 bg-card hover:shadow-md transition-shadow cursor-pointer active:bg-default-50"
      onClick={onTap}
    >
      {/* Header: Status + Poktan */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-default-900 text-sm truncate">
            {item.poktan.nama}
          </p>
          <p className="text-xs text-default-500 mt-0.5">
            {item.poktan.kecamatan} &middot; {item.luasTerserang} ha
          </p>
        </div>
        <TrxStatusBadge status={item.status} size="sm" />
      </div>

      {/* Info rows */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {(item.status === "pengambilan" || item.status === "selesai") && item.noBast && (
          <div className="col-span-2">
            <span className="text-default-500">No. BAST:</span>{" "}
            <span className="font-medium text-default-800">{item.noBast}</span>
          </div>
        )}
        <div>
          <span className="text-default-500">OPT:</span>{" "}
          <span className="text-default-700">{item.opt.join(", ")}</span>
        </div>
        <div>
          <span className="text-default-500">Luasan:</span>{" "}
          <span className="text-default-700">{item.luasTerserang} ha</span>
        </div>
        <div>
          <span className="text-default-500">Tahun:</span>{" "}
          <span className="text-default-700">{item.tanggalDiajukan.getFullYear()}</span>
        </div>
      </div>

      {/* Obat */}
      <div className="text-xs">
        <span className="text-default-500">
          {item.persetujuanObat && item.persetujuanObat.length > 0
            ? "Persetujuan Obat"
            : "Permintaan Obat"}
          :
        </span>{" "}
        <span className="text-default-700">{obatDisplay || "-"}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t" onClick={(e) => e.stopPropagation()}>
        {item.status === "pengajuan_dinas" && onProcess && (
          <Button
            size="sm"
            variant="default"
            className="h-8 text-xs flex-1 gap-1.5"
            onClick={onProcess}
          >
            <Icon icon="heroicons:cog-6-tooth" className="h-3.5 w-3.5" />
            Proses
          </Button>
        )}
        {(item.status === "draft_bpp" || item.status === "dikembalikan") && onEdit && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs flex-1 gap-1.5"
            onClick={onEdit}
          >
            <Icon icon="heroicons:pencil-square" className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
        {item.status === "draft_bpp" && onDelete && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
            onClick={onDelete}
          >
            <Icon icon="heroicons:trash" className="h-3.5 w-3.5" />
            Hapus
          </Button>
        )}
        {!["draft_bpp", "pengajuan_dinas", "dikembalikan"].includes(item.status) && (
          <span className="text-[11px] text-default-400 italic">Lihat detail →</span>
        )}
      </div>
    </div>
  );
};

// ========== Loading Skeleton ==========

const TableSkeleton: React.FC = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="border rounded-xl p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>
    ))}
  </div>
);

const DesktopTableSkeleton: React.FC = () => (
  <Table>
    <TableHeader>
      <TableRow>
        {Array.from({ length: 9 }).map((_, i) => (
          <TableHead key={i}><Skeleton className="h-4 w-full" /></TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 9 }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

// ========== Empty State ==========

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-4">
      <Icon icon="heroicons:inbox" className="h-8 w-8 text-default-400" />
    </div>
    <p className="text-default-500 font-medium">Tidak ada transaksi ditemukan</p>
    <p className="text-default-400 text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
  </div>
);

// ========== Main Table Component ==========

const TrxListTable: React.FC<TrxListTableProps> = ({
  data,
  loading = false,
  sortKey,
  sortDirection = "asc",
  onSort,
  onRowClick,
  onProcess,
  onEdit,
  onDelete,
}) => {
  const renderSortableHeader = (label: string, key: TrxSortKey, className?: string) => {
    const isActive = sortKey === key;
    const icon = isActive
      ? sortDirection === "asc"
        ? "heroicons:arrow-up"
        : "heroicons:arrow-down"
      : "heroicons:arrows-up-down";

    return (
      <TableHead className={className}>
        <button
          type="button"
          onClick={() => onSort?.(key)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-default-700 hover:text-default-900 transition-colors"
        >
          <span>{label}</span>
          <Icon
            icon={icon}
            className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-default-400")}
          />
        </button>
      </TableHead>
    );
  };

  if (loading) {
    return (
      <>
        <div className="md:hidden"><TableSkeleton /></div>
        <div className="hidden md:block"><DesktopTableSkeleton /></div>
      </>
    );
  }

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {/* ===== Mobile: Card Layout ===== */}
      <div className="md:hidden space-y-3 p-4">
        {data.map((item) => (
          <MobileCard
            key={item.id}
            item={item}
            onTap={() => onRowClick?.(item)}
            onProcess={() => onProcess?.(item)}
            onEdit={() => onEdit?.(item)}
            onDelete={() => onDelete?.(item)}
          />
        ))}
      </div>

      {/* ===== Desktop: Table Layout ===== */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-default-50/60">
              {renderSortableHeader("Status", "status", "whitespace-nowrap w-[150px]")}
              {renderSortableHeader("Tahun", "tahun", "whitespace-nowrap w-[90px]")}
              <TableHead className="whitespace-nowrap w-[170px]">No. BAST</TableHead>
              {renderSortableHeader("Poktan", "poktan", "whitespace-nowrap")}
              {renderSortableHeader("Kecamatan", "kecamatan", "whitespace-nowrap")}
              <TableHead className="whitespace-nowrap">OPT</TableHead>
              {renderSortableHeader("Luasan (ha)", "luasTerserang", "whitespace-nowrap text-right w-[90px]")}
              <TableHead className="whitespace-nowrap">Permintaan / Persetujuan Obat</TableHead>
              <TableHead className="whitespace-nowrap text-center w-[140px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const obatList =
                item.persetujuanObat && item.persetujuanObat.length > 0
                  ? item.persetujuanObat
                  : item.permintaanObat;
              const showBast = item.status === "pengambilan" || item.status === "selesai";

              return (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-default-50/80 transition-colors"
                  onClick={() => onRowClick?.(item)}
                >
                  {/* Status */}
                  <TableCell className="py-3">
                    <TrxStatusBadge status={item.status} size="sm" />
                  </TableCell>

                  {/* Tahun */}
                  <TableCell className="py-3">
                    <span className="text-sm text-default-700">{item.tanggalDiajukan.getFullYear()}</span>
                  </TableCell>

                  {/* No. BAST */}
                  <TableCell className="py-3">
                    {showBast && item.noBast ? (
                      <span className="text-sm font-medium text-default-900">{item.noBast}</span>
                    ) : (
                      <span className="text-sm text-default-400">-</span>
                    )}
                  </TableCell>

                  {/* Poktan */}
                  <TableCell className="py-3">
                    <span className="text-sm font-medium text-default-800 max-w-[160px] truncate block" title={item.poktan.nama}>
                      {item.poktan.nama}
                    </span>
                  </TableCell>

                  {/* Kecamatan */}
                  <TableCell className="py-3">
                    <span className="text-sm text-default-700">{item.poktan.kecamatan}</span>
                  </TableCell>

                  {/* OPT */}
                  <TableCell className="py-3">
                    <div className="text-sm text-default-700 max-w-[180px]">
                      <span className="truncate block" title={item.opt.join(", ")}>
                        {item.opt.slice(0, 2).join(", ")}
                        {item.opt.length > 2 && (
                          <span className="text-default-400"> +{item.opt.length - 2}</span>
                        )}
                      </span>
                    </div>
                  </TableCell>

                  {/* Luasan */}
                  <TableCell className="py-3 text-right">
                    <span className="text-sm font-medium text-default-800">{item.luasTerserang}</span>
                  </TableCell>

                  {/* Permintaan / Persetujuan Obat */}
                  <TableCell className="py-3">
                    <div className="text-sm text-default-700 max-w-[220px]">
                      <span className="truncate block" title={obatList.join(", ")}>
                        {obatList.length > 0 ? obatList.join(", ") : <span className="text-default-400">-</span>}
                      </span>
                    </div>
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {item.status === "pengajuan_dinas" && onProcess && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          title="Proses"
                          onClick={() => onProcess(item)}
                        >
                          <Icon icon="heroicons:cog-6-tooth" className="h-4 w-4" />
                        </Button>
                      )}
                      {(item.status === "draft_bpp" || item.status === "dikembalikan") && onEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          title="Edit"
                          onClick={() => onEdit(item)}
                        >
                          <Icon icon="heroicons:pencil-square" className="h-4 w-4" />
                        </Button>
                      )}
                      {item.status === "draft_bpp" && onDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Hapus"
                          onClick={() => onDelete(item)}
                        >
                          <Icon icon="heroicons:trash" className="h-4 w-4" />
                        </Button>
                      )}
                      {!["draft_bpp", "pengajuan_dinas", "dikembalikan"].includes(item.status) && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-default-500 hover:text-default-700"
                          title="Lihat Detail"
                          onClick={() => onRowClick?.(item)}
                        >
                          <Icon icon="heroicons:eye" className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default TrxListTable;

// # END OF TrxListTable
