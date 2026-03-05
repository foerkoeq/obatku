// # START OF Stock Opname Table Component
// Purpose: Display stock opname data in a table with monthly columns (M/K)
// Features: Dynamic month columns, color-coded cells, responsive scroll

"use client";

import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  StockOpnameItem,
  NAMA_BULAN_SINGKAT,
} from "@/lib/types/stock-opname";
import { formatNumber } from "@/lib/data/stock-opname-demo";

export interface StockOpnameTableProps {
  items: StockOpnameItem[];
  bulanDari: number;
  bulanSampai: number;
  tahun: number;
  onItemClick?: (item: StockOpnameItem) => void;
  compact?: boolean;
}

const StockOpnameTable: React.FC<StockOpnameTableProps> = ({
  items,
  bulanDari,
  bulanSampai,
  tahun,
  onItemClick,
  compact = false,
}) => {
  // Generate month range array
  const months = useMemo(() => {
    const m: number[] = [];
    for (let i = bulanDari; i <= bulanSampai; i++) {
      m.push(i);
    }
    return m;
  }, [bulanDari, bulanSampai]);

  // Calculate running stock for an item up to a certain month
  const getRunningStock = (item: StockOpnameItem, upToMonth: number): number => {
    let stock = item.stokAwal;
    for (let m = 1; m <= upToMonth; m++) {
      const mov = item.pergerakan[m];
      if (mov) {
        stock += mov.masuk - mov.keluar;
      }
    }
    return stock;
  };

  // Get status badge for an item
  const getCheckStatusBadge = (item: StockOpnameItem) => {
    if (item.stokFisik === undefined) {
      return (
        <Badge className="text-xs bg-gray-50 text-gray-600 border border-gray-200">
          <Icon icon="heroicons:clock" className="w-3 h-3 mr-1" />
          Belum dicek
        </Badge>
      );
    }
    if (item.selisih === 0) {
      return (
        <Badge className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Icon icon="heroicons:check-circle" className="w-3 h-3 mr-1" />
          Sesuai
        </Badge>
      );
    }
    return (
      <Badge className="text-xs bg-rose-50 text-rose-700 border border-rose-200">
        <Icon icon="heroicons:exclamation-triangle" className="w-3 h-3 mr-1" />
        Selisih {item.selisih! > 0 ? '+' : ''}{item.selisih}
      </Badge>
    );
  };

  // Cell style for masuk (in) values
  const getMasukStyle = (value: number) =>
    value > 0
      ? "text-emerald-700 font-semibold bg-emerald-50/50"
      : "text-muted-foreground";

  // Cell style for keluar (out) values
  const getKeluarStyle = (value: number) =>
    value > 0
      ? "text-rose-700 font-semibold bg-rose-50/50"
      : "text-muted-foreground";

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="min-w-max">
        <Table>
          <TableHeader>
            {/* Row 1: Main headers */}
            <TableRow className="bg-muted/50">
              <TableHead
                rowSpan={2}
                className="text-center font-bold border-r w-12 sticky left-0 bg-muted/50 z-20"
              >
                No
              </TableHead>
              <TableHead
                rowSpan={2}
                className={cn(
                  "font-bold border-r sticky left-12 bg-muted/50 z-20",
                  compact ? "min-w-[180px]" : "min-w-[220px]"
                )}
              >
                Jenis Pestisida
              </TableHead>
              <TableHead
                colSpan={2}
                className="text-center font-bold border-r bg-blue-50/80"
              >
                Stok Awal
              </TableHead>
              {months.map((m) => (
                <TableHead
                  key={m}
                  colSpan={2}
                  className={cn(
                    "text-center font-bold border-r",
                    m % 2 === 0 ? "bg-slate-50/80" : "bg-white"
                  )}
                >
                  {NAMA_BULAN_SINGKAT[m]}
                </TableHead>
              ))}
              <TableHead
                colSpan={2}
                className="text-center font-bold border-r bg-amber-50/80"
              >
                Stok Akhir
              </TableHead>
              <TableHead
                rowSpan={2}
                className={cn(
                  "text-center font-bold",
                  compact ? "min-w-[120px]" : "min-w-[180px]"
                )}
              >
                Keterangan
              </TableHead>
            </TableRow>
            {/* Row 2: Sub-headers */}
            <TableRow className="bg-muted/30">
              {/* Stok Awal sub */}
              <TableHead className="text-center text-xs font-medium border-r bg-blue-50/50 w-16">
                Jml
              </TableHead>
              <TableHead className="text-center text-xs font-medium border-r bg-blue-50/50 w-16">
                Vol
              </TableHead>
              {/* Monthly sub-headers */}
              {months.map((m) => (
                <React.Fragment key={`sub-${m}`}>
                  <TableHead
                    className={cn(
                      "text-center text-xs font-medium border-r w-12",
                      m % 2 === 0 ? "bg-slate-50/50" : "bg-white",
                      "text-emerald-600"
                    )}
                  >
                    M
                  </TableHead>
                  <TableHead
                    className={cn(
                      "text-center text-xs font-medium border-r w-12",
                      m % 2 === 0 ? "bg-slate-50/50" : "bg-white",
                      "text-rose-600"
                    )}
                  >
                    K
                  </TableHead>
                </React.Fragment>
              ))}
              {/* Stok Akhir sub */}
              <TableHead className="text-center text-xs font-medium border-r bg-amber-50/50 w-16">
                Sistem
              </TableHead>
              <TableHead className="text-center text-xs font-medium border-r bg-amber-50/50 w-16">
                Fisik
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item, index) => {
              const stokAkhirSistem = getRunningStock(item, bulanSampai);
              return (
                <TableRow
                  key={item.id}
                  className={cn(
                    "hover:bg-muted/30 transition-colors cursor-pointer",
                    index % 2 === 0 ? "bg-white" : "bg-muted/10",
                    item.selisih !== undefined && item.selisih !== 0
                      ? "bg-rose-50/30 hover:bg-rose-50/50"
                      : ""
                  )}
                  onClick={() => onItemClick?.(item)}
                >
                  {/* No */}
                  <TableCell className="text-center font-medium border-r sticky left-0 bg-inherit z-10">
                    {index + 1}
                  </TableCell>

                  {/* Jenis Pestisida */}
                  <TableCell
                    className={cn(
                      "border-r sticky left-12 bg-inherit z-10",
                      compact ? "text-xs" : "text-sm"
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{item.jenisPestisida}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          className="text-[10px] px-1.5 py-0 border"
                        >
                          {item.kategori}
                        </Badge>
                        {getCheckStatusBadge(item)}
                      </div>
                    </div>
                  </TableCell>

                  {/* Stok Awal - Jumlah */}
                  <TableCell className="text-center border-r bg-blue-50/20 font-semibold">
                    {formatNumber(item.stokAwal)}
                  </TableCell>

                  {/* Stok Awal - Volume */}
                  <TableCell className="text-center border-r bg-blue-50/20 text-xs text-muted-foreground">
                    {item.satuan}
                  </TableCell>

                  {/* Monthly M/K cells */}
                  {months.map((m) => {
                    const mov = item.pergerakan[m] || { masuk: 0, keluar: 0 };
                    return (
                      <React.Fragment key={`${item.id}-${m}`}>
                        <TableCell
                          className={cn(
                            "text-center border-r text-xs",
                            m % 2 === 0 ? "bg-slate-50/20" : "",
                            getMasukStyle(mov.masuk)
                          )}
                        >
                          {mov.masuk > 0 ? formatNumber(mov.masuk) : "-"}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-center border-r text-xs",
                            m % 2 === 0 ? "bg-slate-50/20" : "",
                            getKeluarStyle(mov.keluar)
                          )}
                        >
                          {mov.keluar > 0 ? formatNumber(mov.keluar) : "-"}
                        </TableCell>
                      </React.Fragment>
                    );
                  })}

                  {/* Stok Akhir - Sistem */}
                  <TableCell className="text-center border-r bg-amber-50/20 font-semibold">
                    {formatNumber(item.stokAkhir)}
                  </TableCell>

                  {/* Stok Akhir - Fisik */}
                  <TableCell
                    className={cn(
                      "text-center border-r bg-amber-50/20 font-semibold",
                      item.selisih !== undefined && item.selisih !== 0
                        ? "text-rose-600"
                        : "text-emerald-600"
                    )}
                  >
                    {item.stokFisik !== undefined
                      ? formatNumber(item.stokFisik)
                      : (
                        <span className="text-muted-foreground text-xs italic">
                          -
                        </span>
                      )}
                  </TableCell>

                  {/* Keterangan */}
                  <TableCell
                    className={cn(
                      "text-xs",
                      compact ? "max-w-[120px]" : "max-w-[180px]",
                      "truncate"
                    )}
                    title={item.keterangan}
                  >
                    {item.keterangan}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Summary / Total Row */}
            <TableRow className="bg-muted/60 font-bold border-t-2">
              <TableCell
                colSpan={2}
                className="text-center font-bold border-r sticky left-0 bg-muted/60 z-10"
              >
                TOTAL
              </TableCell>

              {/* Total Stok Awal */}
              <TableCell className="text-center border-r bg-blue-100/30 font-bold">
                {formatNumber(items.reduce((sum, i) => sum + i.stokAwal, 0))}
              </TableCell>
              <TableCell className="text-center border-r bg-blue-100/30" />

              {/* Total per month */}
              {months.map((m) => {
                const totalMasuk = items.reduce(
                  (sum, i) => sum + (i.pergerakan[m]?.masuk || 0),
                  0
                );
                const totalKeluar = items.reduce(
                  (sum, i) => sum + (i.pergerakan[m]?.keluar || 0),
                  0
                );
                return (
                  <React.Fragment key={`total-${m}`}>
                    <TableCell
                      className={cn(
                        "text-center border-r text-xs font-bold",
                        getMasukStyle(totalMasuk)
                      )}
                    >
                      {totalMasuk > 0 ? formatNumber(totalMasuk) : "-"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-center border-r text-xs font-bold",
                        getKeluarStyle(totalKeluar)
                      )}
                    >
                      {totalKeluar > 0 ? formatNumber(totalKeluar) : "-"}
                    </TableCell>
                  </React.Fragment>
                );
              })}

              {/* Total Stok Akhir */}
              <TableCell className="text-center border-r bg-amber-100/30 font-bold">
                {formatNumber(items.reduce((sum, i) => sum + i.stokAkhir, 0))}
              </TableCell>
              <TableCell className="text-center border-r bg-amber-100/30 font-bold">
                {formatNumber(
                  items.reduce((sum, i) => sum + (i.stokFisik || 0), 0)
                )}
              </TableCell>

              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default StockOpnameTable;

// # END OF Stock Opname Table Component
