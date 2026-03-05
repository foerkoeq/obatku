// # START OF Stock Opname Print Report Component
// Purpose: Landscape print-ready report for stock opname
// Features: Kop surat, title, full-year table, signature area

"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import KopSuratDinasComponent from "./kop-surat-dinas";
import {
  StockOpnameItem,
  KopSuratDinas,
  NAMA_BULAN,
  NAMA_BULAN_SINGKAT,
} from "@/lib/types/stock-opname";
import { formatNumber } from "@/lib/data/stock-opname-demo";

export interface StockOpnameReportPrintProps {
  items: StockOpnameItem[];
  kopSurat: KopSuratDinas;
  tahun: number;
  bulanDari: number;
  bulanSampai: number;
  className?: string;
}

const StockOpnameReportPrint = forwardRef<
  HTMLDivElement,
  StockOpnameReportPrintProps
>(({ items, kopSurat, tahun, bulanDari, bulanSampai, className }, ref) => {
  // Generate month range
  const months: number[] = [];
  for (let i = bulanDari; i <= bulanSampai; i++) {
    months.push(i);
  }

  return (
    <div
      ref={ref}
      className={cn(
        "bg-white text-black",
        // Landscape A4: 297mm × 210mm
        "w-[297mm] min-h-[210mm] mx-auto",
        "p-6 print:p-4",
        "print:shadow-none print:bg-white",
        className
      )}
      style={{
        fontFamily: "Times New Roman, serif",
        fontSize: "9pt",
        lineHeight: "1.3",
      }}
    >
      {/* Kop Surat */}
      <KopSuratDinasComponent data={kopSurat} compact />

      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="font-bold text-sm uppercase leading-tight">
          LAPORAN STOCK OPNAME
        </h1>
        <h2 className="font-bold text-sm uppercase leading-tight">
          PERSEDIAAN OBAT PERTANIAN
        </h2>
        <h3 className="font-bold text-xs uppercase leading-tight mt-1">
          DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN
        </h3>
        <h3 className="font-bold text-xs uppercase leading-tight">
          KABUPATEN {kopSurat.kabupaten.toUpperCase()}
        </h3>
        <p className="text-xs mt-1">
          Tahun {tahun}
          {bulanDari !== 1 || bulanSampai !== 12
            ? ` (${NAMA_BULAN[bulanDari]} - ${NAMA_BULAN[bulanSampai]})`
            : ""}
        </p>
      </div>

      {/* Table */}
      <table
        className="w-full border-collapse text-[8pt]"
        style={{ borderColor: "black" }}
      >
        <thead>
          {/* Row 1: Main Headers */}
          <tr>
            <th
              rowSpan={2}
              className="border border-black p-1 text-center w-6 align-middle"
            >
              No
            </th>
            <th
              rowSpan={2}
              className="border border-black p-1 text-center min-w-[100px] align-middle"
            >
              Jenis Pestisida
            </th>
            <th
              colSpan={2}
              className="border border-black p-1 text-center bg-blue-50"
            >
              Stok Awal
            </th>
            {months.map((m) => (
              <th
                key={m}
                colSpan={2}
                className="border border-black p-1 text-center"
              >
                {NAMA_BULAN_SINGKAT[m]}
              </th>
            ))}
            <th
              colSpan={2}
              className="border border-black p-1 text-center bg-amber-50"
            >
              Stok Akhir
            </th>
            <th
              rowSpan={2}
              className="border border-black p-1 text-center min-w-[60px] align-middle"
            >
              Ket.
            </th>
          </tr>
          {/* Row 2: Sub-headers */}
          <tr>
            <th className="border border-black p-0.5 text-center text-[7pt] bg-blue-50 w-8">
              Jml
            </th>
            <th className="border border-black p-0.5 text-center text-[7pt] bg-blue-50 w-8">
              Vol
            </th>
            {months.map((m) => (
              <React.Fragment key={`sub-${m}`}>
                <th className="border border-black p-0.5 text-center text-[7pt] w-6">
                  M
                </th>
                <th className="border border-black p-0.5 text-center text-[7pt] w-6">
                  K
                </th>
              </React.Fragment>
            ))}
            <th className="border border-black p-0.5 text-center text-[7pt] bg-amber-50 w-8">
              Sist
            </th>
            <th className="border border-black p-0.5 text-center text-[7pt] bg-amber-50 w-8">
              Fisik
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              {/* No */}
              <td className="border border-black p-0.5 text-center">
                {index + 1}
              </td>

              {/* Jenis Pestisida */}
              <td className="border border-black p-0.5 text-left">
                {item.jenisPestisida}
              </td>

              {/* Stok Awal */}
              <td className="border border-black p-0.5 text-center">
                {formatNumber(item.stokAwal)}
              </td>
              <td className="border border-black p-0.5 text-center text-[7pt]">
                {item.satuan}
              </td>

              {/* Monthly M/K */}
              {months.map((m) => {
                const mov = item.pergerakan[m] || { masuk: 0, keluar: 0 };
                return (
                  <React.Fragment key={`${item.id}-${m}`}>
                    <td className="border border-black p-0.5 text-center">
                      {mov.masuk > 0 ? formatNumber(mov.masuk) : "-"}
                    </td>
                    <td className="border border-black p-0.5 text-center">
                      {mov.keluar > 0 ? formatNumber(mov.keluar) : "-"}
                    </td>
                  </React.Fragment>
                );
              })}

              {/* Stok Akhir */}
              <td className="border border-black p-0.5 text-center font-semibold">
                {formatNumber(item.stokAkhir)}
              </td>
              <td className="border border-black p-0.5 text-center">
                {item.stokFisik !== undefined
                  ? formatNumber(item.stokFisik)
                  : "-"}
              </td>

              {/* Keterangan */}
              <td className="border border-black p-0.5 text-left text-[7pt]">
                {item.keterangan}
              </td>
            </tr>
          ))}

          {/* Total Row */}
          <tr className="font-bold bg-gray-100">
            <td
              colSpan={2}
              className="border border-black p-0.5 text-center"
            >
              TOTAL
            </td>
            <td className="border border-black p-0.5 text-center">
              {formatNumber(
                items.reduce((sum, i) => sum + i.stokAwal, 0)
              )}
            </td>
            <td className="border border-black p-0.5" />
            {months.map((m) => {
              const totalM = items.reduce(
                (sum, i) => sum + (i.pergerakan[m]?.masuk || 0),
                0
              );
              const totalK = items.reduce(
                (sum, i) => sum + (i.pergerakan[m]?.keluar || 0),
                0
              );
              return (
                <React.Fragment key={`t-${m}`}>
                  <td className="border border-black p-0.5 text-center">
                    {totalM > 0 ? formatNumber(totalM) : "-"}
                  </td>
                  <td className="border border-black p-0.5 text-center">
                    {totalK > 0 ? formatNumber(totalK) : "-"}
                  </td>
                </React.Fragment>
              );
            })}
            <td className="border border-black p-0.5 text-center">
              {formatNumber(
                items.reduce((sum, i) => sum + i.stokAkhir, 0)
              )}
            </td>
            <td className="border border-black p-0.5 text-center">
              {formatNumber(
                items.reduce((sum, i) => sum + (i.stokFisik || 0), 0)
              )}
            </td>
            <td className="border border-black p-0.5" />
          </tr>
        </tbody>
      </table>

      {/* Footer: Date & Signatures */}
      <div className="mt-6 flex justify-between">
        {/* Left: Mengetahui */}
        <div className="text-center w-56">
          <p className="font-bold text-[9pt]">Mengetahui,</p>
          <p className="text-[8pt]">
            Kepala Dinas Ketahanan Pangan,
          </p>
          <p className="text-[8pt]">
            Pertanian dan Perikanan
          </p>
          <p className="text-[8pt] mb-14">
            Kabupaten {kopSurat.kabupaten}
          </p>
          <div className="border-b border-black w-40 mx-auto mb-0.5" />
          <p className="text-[8pt]">NIP. ................................</p>
        </div>

        {/* Right: Petugas */}
        <div className="text-center w-56">
          <p className="text-[8pt]">
            {kopSurat.kabupaten}, ..............................
          </p>
          <p className="font-bold text-[9pt] mt-1">Petugas Gudang,</p>
          <p className="mb-16" />
          <div className="border-b border-black w-40 mx-auto mb-0.5" />
          <p className="text-[8pt]">NIP. ................................</p>
        </div>
      </div>
    </div>
  );
});

StockOpnameReportPrint.displayName = "StockOpnameReportPrint";

export default StockOpnameReportPrint;

// # END OF Stock Opname Print Report Component
