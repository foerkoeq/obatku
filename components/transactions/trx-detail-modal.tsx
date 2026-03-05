// # START OF TrxDetailModal - Detail modal for transaction info
// Purpose: Show comprehensive transaction details in a dialog
// Features: All detail fields, responsive layout, action buttons
// Props: open, onClose, item, onProcess, onEdit, onDelete
// Dependencies: Dialog, TrxStatusBadge, Icon, date-fns

"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import TrxStatusBadge from "./trx-status-badge";
import {
  TrxListItem,
  JENIS_PESTISIDA_LABELS,
  JenisPestisida,
} from "@/lib/types/transaction-list";

interface TrxDetailModalProps {
  open: boolean;
  onClose: () => void;
  item: TrxListItem | null;
  onProcess?: (item: TrxListItem) => void;
  onEdit?: (item: TrxListItem) => void;
  onDelete?: (item: TrxListItem) => void;
}

// ========== Detail Row Helper ==========

const DetailRow: React.FC<{
  label: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, children, className }) => (
  <div
    className={cn(
      "flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0 py-2.5 border-b border-default-100 last:border-0",
      className
    )}
  >
    <span className="text-sm text-default-500 font-medium sm:min-w-[200px] sm:max-w-[200px] flex-shrink-0">
      {label}
    </span>
    <span className="text-sm text-default-900 flex-1">{children}</span>
  </div>
);

// ========== Main Component ==========

const TrxDetailModal: React.FC<TrxDetailModalProps> = ({
  open,
  onClose,
  item,
  onProcess,
  onEdit,
  onDelete,
}) => {
  if (!item) return null;

  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return format(new Date(date), "dd MMMM yyyy", { locale: localeId });
  };

  const poktanLabel = item.poktan.tipe === "gapoktan" ? "Gapoktan" : "Poktan";
  const canProcess = item.status === "pengajuan_dinas";
  const canEdit = item.status === "draft_bpp" || item.status === "dikembalikan";
  const canDelete = item.status === "draft_bpp";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 bg-card px-5 pt-5 pb-3 border-b">
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-lg font-bold text-default-900">
              Detail Transaksi
            </DialogTitle>
            <TrxStatusBadge status={item.status} />
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-5 py-4 space-y-1">
          <DetailRow label="Status">
            <TrxStatusBadge status={item.status} size="sm" />
          </DetailRow>

          <DetailRow label="Diajukan oleh">
            <div>
              <span className="font-medium">{item.diajukanOleh.nama}</span>
              <span className="text-default-400 text-xs ml-2">NIP: {item.diajukanOleh.nip}</span>
            </div>
          </DetailRow>

          <DetailRow label="Nama POPT">
            {item.namaPopt || <span className="text-default-400 italic">Belum ditentukan</span>}
          </DetailRow>

          <DetailRow label="Tanggal Diajukan">
            {formatDate(item.tanggalDiajukan)}
          </DetailRow>

          <DetailRow label="Tanggal Disetujui">
            {item.tanggalDisetujui ? (
              formatDate(item.tanggalDisetujui)
            ) : (
              <span className="text-default-400 italic">Belum disetujui</span>
            )}
          </DetailRow>

          <Separator className="!my-3" />

          <DetailRow label={`Nama ${poktanLabel}`}>
            <span className="font-medium">{item.poktan.nama}</span>
            <Badge className="ml-2 text-[10px] px-1.5 py-0 bg-default-100 text-default-600 border-0">
              {item.poktan.tipe.toUpperCase()}
            </Badge>
          </DetailRow>

          <DetailRow label={`Ketua ${poktanLabel}`}>
            {item.poktan.ketua}
          </DetailRow>

          <DetailRow label="Desa">{item.poktan.desa}</DetailRow>

          <DetailRow label="Kecamatan">{item.poktan.kecamatan}</DetailRow>

          <Separator className="!my-3" />

          <DetailRow label="Luas Lahan Terserang">
            <span className="font-semibold text-red-600">{item.luasTerserang} ha</span>
          </DetailRow>

          <DetailRow label="Luas Lahan Waspada">
            <span className="font-semibold text-amber-600">{item.luasWaspada} ha</span>
          </DetailRow>

          <DetailRow label="OPT">
            <div className="flex flex-wrap gap-1.5">
              {item.opt.map((o, idx) => (
                <Badge
                  key={idx}
                  className="text-xs bg-orange-50 text-orange-700 border border-orange-200"
                >
                  {o}
                </Badge>
              ))}
            </div>
          </DetailRow>

          <Separator className="!my-3" />

          <DetailRow label="Jenis Pestisida">
            <div className="flex flex-wrap gap-1.5">
              {item.jenisPestisida.map((jp) => (
                <Badge
                  key={jp}
                  className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {JENIS_PESTISIDA_LABELS[jp]}
                </Badge>
              ))}
            </div>
          </DetailRow>

          <DetailRow label="Kandungan Dikehendaki">
            {item.kandunganDikehendaki || <span className="text-default-400">-</span>}
          </DetailRow>

          {/* Permintaan Obat */}
          {item.permintaanObat.length > 0 && (
            <DetailRow label="Permintaan Obat">
              <div className="flex flex-wrap gap-1.5">
                {item.permintaanObat.map((o, idx) => (
                  <Badge
                    key={idx}
                    className="text-xs bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {o}
                  </Badge>
                ))}
              </div>
            </DetailRow>
          )}

          {/* Persetujuan Obat */}
          {item.persetujuanObat && item.persetujuanObat.length > 0 && (
            <DetailRow label="Persetujuan Obat">
              <div className="flex flex-wrap gap-1.5">
                {item.persetujuanObat.map((o, idx) => (
                  <Badge
                    key={idx}
                    className="text-xs bg-green-50 text-green-700 border border-green-200"
                  >
                    {o}
                  </Badge>
                ))}
              </div>
            </DetailRow>
          )}

          {/* No BAST */}
          {item.noBast && (
            <DetailRow label="No. BAST">
              <span className="font-semibold">{item.noBast}</span>
            </DetailRow>
          )}

          {/* Catatan */}
          {item.catatan && (
            <DetailRow label="Catatan">
              <span className="text-default-600 italic">{item.catatan}</span>
            </DetailRow>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-card border-t px-5 py-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} className="sm:order-1">
            Tutup
          </Button>

          {canProcess && onProcess && (
            <Button
              onClick={() => {
                onClose();
                onProcess(item);
              }}
              className="sm:order-3 bg-primary hover:bg-primary/90 gap-2"
            >
              <Icon icon="heroicons:cog-6-tooth" className="h-4 w-4" />
              Proses
            </Button>
          )}

          {canEdit && onEdit && (
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="sm:order-2 gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Icon icon="heroicons:pencil-square" className="h-4 w-4" />
              Edit
            </Button>
          )}

          {canDelete && onDelete && (
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onDelete(item);
              }}
              className="sm:order-4 gap-2 border-red-300 text-red-600 hover:bg-red-50"
            >
              <Icon icon="heroicons:trash" className="h-4 w-4" />
              Hapus
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrxDetailModal;

// # END OF TrxDetailModal
