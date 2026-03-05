// # START OF Transaction Detail Modal Component
// Purpose: Show transaction details when clicking on a daily table cell
// Features: Display masuk/keluar details, kelompok tani, kecamatan, areal serangan, etc.
// Mobile-first: Uses Drawer on mobile, Dialog on desktop

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DailyTransactionDetail,
  NAMA_BULAN,
} from "@/lib/types/stock-opname";

export interface TransactionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DailyTransactionDetail | null;
  onViewFullDetail?: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  open,
  onOpenChange,
  data,
  onViewFullDetail,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!data) return null;

  const totalMasuk = data.masuk.reduce((s, m) => s + m.jumlah, 0);
  const totalKeluar = data.keluar.reduce((s, k) => s + k.jumlah, 0);

  const content = (
    <div className="space-y-4">
      {/* Header info */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge color="info" className="text-xs">
          <Icon icon="heroicons:calendar" className="w-3 h-3 mr-1" />
          {data.tanggal} {NAMA_BULAN[data.bulan]} {data.tahun}
        </Badge>
        <span className="text-sm font-medium text-muted-foreground truncate">
          {data.jenisPestisida}
        </span>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3">
        {totalMasuk > 0 && (
          <div className="flex-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 text-center">
            <Icon icon="heroicons:arrow-down-tray" className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-emerald-700">+{totalMasuk}</p>
            <p className="text-[10px] text-emerald-600 font-medium">Masuk</p>
          </div>
        )}
        {totalKeluar > 0 && (
          <div className="flex-1 bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3 text-center">
            <Icon icon="heroicons:arrow-up-tray" className="w-5 h-5 text-rose-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-rose-700">-{totalKeluar}</p>
            <p className="text-[10px] text-rose-600 font-medium">Keluar</p>
          </div>
        )}
      </div>

      {/* Masuk Details */}
      {data.masuk.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5 mb-2">
            <Icon icon="heroicons:arrow-down-tray" className="w-4 h-4" />
            Obat Masuk
          </h4>
          <div className="space-y-2">
            {data.masuk.map((m, idx) => (
              <div
                key={idx}
                className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-emerald-700">
                    +{m.jumlah} unit
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sumber</span>
                    <span className="font-medium text-right">{m.sumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lokasi Penyimpanan</span>
                    <span className="font-medium text-right">{m.lokasiPenyimpanan}</span>
                  </div>
                  {m.catatan && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Catatan</span>
                      <span className="font-medium text-right">{m.catatan}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keluar Details */}
      {data.keluar.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-rose-700 flex items-center gap-1.5 mb-2">
            <Icon icon="heroicons:arrow-up-tray" className="w-4 h-4" />
            Obat Keluar
          </h4>
          <div className="space-y-2">
            {data.keluar.map((k, idx) => (
              <div
                key={idx}
                className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-rose-700">
                    -{k.jumlah} unit
                  </span>
                  <Badge className="text-[10px] bg-rose-100 text-rose-700 border-rose-200">
                    {k.jenisSerangan}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kelompok Tani</span>
                    <span className="font-medium text-right">{k.kelompokTani}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kecamatan</span>
                    <span className="font-medium text-right">{k.kecamatan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Areal Serangan</span>
                    <span className="font-medium text-right">{k.arealSerangan} ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jenis Serangan</span>
                    <span className="font-medium text-right">{k.jenisSerangan}</span>
                  </div>
                  {k.catatan && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Catatan</span>
                      <span className="font-medium text-right">{k.catatan}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No transactions */}
      {data.masuk.length === 0 && data.keluar.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <Icon icon="heroicons:inbox" className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Tidak ada transaksi pada tanggal ini</p>
        </div>
      )}

      {/* View full detail button */}
      {onViewFullDetail && (data.masuk.length > 0 || data.keluar.length > 0) && (
        <>
          <Separator />
          <Button
            variant="outline"
            className="w-full"
            onClick={onViewFullDetail}
          >
            <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4 mr-2" />
            Lihat Detail Lengkap
          </Button>
        </>
      )}
    </div>
  );

  const title = (
    <span className="flex items-center gap-2">
      <Icon icon="heroicons:document-text" className="w-5 h-5 text-primary" />
      Detail Transaksi
    </span>
  );

  const description = `${data.jenisPestisida} — ${data.tanggal} ${NAMA_BULAN[data.bulan]} ${data.tahun}`;

  // Mobile: Drawer
  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription className="text-xs truncate">
              {description}
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="px-4 pb-6 max-h-[calc(85vh-80px)]">
            {content}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-xs truncate">
            {description}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-100px)] pr-2">
          {content}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;

// # END OF Transaction Detail Modal Component
