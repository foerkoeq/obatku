// # START OF Stock Opname Daily Table Component
// Purpose: Display per-day stock movements when "Per Bulan" period is selected
// Features: Day columns (1-28/29/30/31), M/K sub-headers, clickable cells, totals row

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
  StockMovement,
  NAMA_BULAN,
} from "@/lib/types/stock-opname";
import { formatNumber, getDailyMovements, getDaysInMonth } from "@/lib/data/stock-opname-demo";

export interface StockOpnameDailyTableProps {
  items: StockOpnameItem[];
  bulan: number;
  tahun: number;
  onCellClick?: (itemId: string, tanggal: number, bulan: number) => void;
  onItemClick?: (item: StockOpnameItem) => void;
}

const StockOpnameDailyTable: React.FC<StockOpnameDailyTableProps> = ({
  items,
  bulan,
  tahun,
  onCellClick,
  onItemClick,
}) => {
  const daysInMonth = useMemo(() => getDaysInMonth(tahun, bulan), [tahun, bulan]);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  // Pre-compute daily movements for all items
  const itemDailyData = useMemo(() => {
    const data: Record<string, Record<number, StockMovement>> = {};
    items.forEach((item) => {
      data[item.id] = getDailyMovements(item.id, bulan, tahun);
    });
    return data;
  }, [items, bulan, tahun]);

  // Stok awal for this month = stokAwal + sum of movements from month 1 to (bulan-1)
  const getStokAwalBulan = (item: StockOpnameItem): number => {
    let stock = item.stokAwal;
    for (let m = 1; m < bulan; m++) {
      const mov = item.pergerakan[m];
      if (mov) stock += mov.masuk - mov.keluar;
    }
    return stock;
  };

  // Stok akhir for this month
  const getStokAkhirBulan = (item: StockOpnameItem): number => {
    let stock = getStokAwalBulan(item);
    const daily = itemDailyData[item.id] || {};
    days.forEach((d) => {
      const mov = daily[d] || { masuk: 0, keluar: 0 };
      stock += mov.masuk - mov.keluar;
    });
    return stock;
  };

  const getMasukStyle = (value: number) =>
    value > 0
      ? "text-emerald-700 font-semibold bg-emerald-50/60"
      : "text-muted-foreground/40";

  const getKeluarStyle = (value: number) =>
    value > 0
      ? "text-rose-700 font-semibold bg-rose-50/60"
      : "text-muted-foreground/40";

  const hasActivity = (itemId: string, day: number) => {
    const mov = itemDailyData[itemId]?.[day];
    return mov && (mov.masuk > 0 || mov.keluar > 0);
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="min-w-max">
        <Table>
          <TableHeader>
            {/* Row 1: Main headers */}
            <TableRow className="bg-muted/50">
              <TableHead
                rowSpan={2}
                className="text-center font-bold border-r w-10 sticky left-0 bg-muted/50 z-20"
              >
                No
              </TableHead>
              <TableHead
                rowSpan={2}
                className="font-bold border-r sticky left-10 bg-muted/50 z-20 min-w-[180px]"
              >
                Jenis Pestisida
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-center font-bold border-r bg-blue-50/80 w-16"
              >
                Stok Awal
              </TableHead>
              {days.map((d) => (
                <TableHead
                  key={d}
                  colSpan={2}
                  className={cn(
                    "text-center font-bold border-r text-xs px-0",
                    d % 2 === 0 ? "bg-slate-50/80" : "bg-white"
                  )}
                >
                  {d}
                </TableHead>
              ))}
              <TableHead
                rowSpan={2}
                className="text-center font-bold border-r bg-amber-50/80 w-16"
              >
                Stok Akhir
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-center font-bold min-w-[120px]"
              >
                Ket.
              </TableHead>
            </TableRow>
            {/* Row 2: M/K sub-headers */}
            <TableRow className="bg-muted/30">
              {days.map((d) => (
                <React.Fragment key={`sub-${d}`}>
                  <TableHead
                    className={cn(
                      "text-center text-[10px] font-medium border-r w-7 px-0",
                      d % 2 === 0 ? "bg-slate-50/50" : "bg-white",
                      "text-emerald-600"
                    )}
                  >
                    M
                  </TableHead>
                  <TableHead
                    className={cn(
                      "text-center text-[10px] font-medium border-r w-7 px-0",
                      d % 2 === 0 ? "bg-slate-50/50" : "bg-white",
                      "text-rose-600"
                    )}
                  >
                    K
                  </TableHead>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item, index) => {
              const stokAwal = getStokAwalBulan(item);
              const stokAkhir = getStokAkhirBulan(item);
              const daily = itemDailyData[item.id] || {};

              return (
                <TableRow
                  key={item.id}
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    index % 2 === 0 ? "bg-white" : "bg-muted/10"
                  )}
                >
                  {/* No */}
                  <TableCell className="text-center font-medium border-r sticky left-0 bg-inherit z-10 text-xs">
                    {index + 1}
                  </TableCell>

                  {/* Jenis Pestisida */}
                  <TableCell
                    className="border-r sticky left-10 bg-inherit z-10 text-xs cursor-pointer hover:text-primary"
                    onClick={() => onItemClick?.(item)}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium truncate max-w-[170px]">{item.jenisPestisida}</span>
                      <Badge className="text-[9px] px-1 py-0 border w-fit">
                        {item.kategori}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Stok Awal */}
                  <TableCell className="text-center border-r bg-blue-50/20 font-semibold text-xs">
                    {formatNumber(stokAwal)}
                  </TableCell>

                  {/* Daily M/K cells */}
                  {days.map((d) => {
                    const mov = daily[d] || { masuk: 0, keluar: 0 };
                    const active = hasActivity(item.id, d);
                    return (
                      <React.Fragment key={`${item.id}-${d}`}>
                        <TableCell
                          className={cn(
                            "text-center border-r text-[10px] px-0 py-1",
                            d % 2 === 0 ? "bg-slate-50/20" : "",
                            getMasukStyle(mov.masuk),
                            active && "cursor-pointer hover:bg-emerald-100/60"
                          )}
                          onClick={() => {
                            if (active) onCellClick?.(item.id, d, bulan);
                          }}
                        >
                          {mov.masuk > 0 ? mov.masuk : ""}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-center border-r text-[10px] px-0 py-1",
                            d % 2 === 0 ? "bg-slate-50/20" : "",
                            getKeluarStyle(mov.keluar),
                            active && "cursor-pointer hover:bg-rose-100/60"
                          )}
                          onClick={() => {
                            if (active) onCellClick?.(item.id, d, bulan);
                          }}
                        >
                          {mov.keluar > 0 ? mov.keluar : ""}
                        </TableCell>
                      </React.Fragment>
                    );
                  })}

                  {/* Stok Akhir */}
                  <TableCell className="text-center border-r bg-amber-50/20 font-semibold text-xs">
                    {formatNumber(stokAkhir)}
                  </TableCell>

                  {/* Keterangan */}
                  <TableCell className="text-[10px] max-w-[120px] truncate" title={item.keterangan}>
                    {item.keterangan}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Total Row */}
            <TableRow className="bg-muted/60 font-bold border-t-2">
              <TableCell
                colSpan={2}
                className="text-center font-bold border-r sticky left-0 bg-muted/60 z-10 text-xs"
              >
                TOTAL
              </TableCell>

              {/* Total Stok Awal */}
              <TableCell className="text-center border-r bg-blue-100/30 font-bold text-xs">
                {formatNumber(items.reduce((sum, i) => sum + getStokAwalBulan(i), 0))}
              </TableCell>

              {/* Total per day */}
              {days.map((d) => {
                const totalMasuk = items.reduce(
                  (sum, i) => sum + (itemDailyData[i.id]?.[d]?.masuk || 0),
                  0
                );
                const totalKeluar = items.reduce(
                  (sum, i) => sum + (itemDailyData[i.id]?.[d]?.keluar || 0),
                  0
                );
                return (
                  <React.Fragment key={`total-${d}`}>
                    <TableCell
                      className={cn(
                        "text-center border-r text-[10px] px-0 font-bold",
                        getMasukStyle(totalMasuk)
                      )}
                    >
                      {totalMasuk > 0 ? totalMasuk : ""}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-center border-r text-[10px] px-0 font-bold",
                        getKeluarStyle(totalKeluar)
                      )}
                    >
                      {totalKeluar > 0 ? totalKeluar : ""}
                    </TableCell>
                  </React.Fragment>
                );
              })}

              {/* Total Stok Akhir */}
              <TableCell className="text-center border-r bg-amber-100/30 font-bold text-xs">
                {formatNumber(items.reduce((sum, i) => sum + getStokAkhirBulan(i), 0))}
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

export default StockOpnameDailyTable;

// # END OF Stock Opname Daily Table Component
