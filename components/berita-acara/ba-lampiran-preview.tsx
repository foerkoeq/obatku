'use client';

import React from 'react';
import type { BAPreviewData, BATemplateConfig, BATextFormat } from '@/lib/types/berita-acara';
import { cn } from '@/lib/utils';

interface BALampiranPreviewProps {
  template: BATemplateConfig;
  previewData: BAPreviewData;
  resolve: (text: string) => string;
  widthMm: number;
  heightMm: number;
}

const textAlignClassMap: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const fmtClass = (fmt?: BATextFormat) =>
  fmt ? cn(fmt.bold && 'font-bold', fmt.italic && 'italic', fmt.underline && 'underline') : '';

export const BALampiranPreview: React.FC<BALampiranPreviewProps> = ({
  template,
  previewData,
  resolve,
  widthMm,
  heightMm,
}) => {
  const { font, margins, narratives, lampiran, tandaTangan } = template;

  const tableFontSize = Math.max(font.baseSizePt - 2, 8);
  const headerFontSize = Math.max(font.baseSizePt - 2, 8);

  const getColValue = (row: BAPreviewData['lampiran']['rows'][number], key: string) => {
    switch (key) {
      case 'nomor':
        return row.nomor;
      case 'wilayah':
        return `${row.kecamatan}\n${row.desa}`;
      case 'namaPoktan':
        return row.namaPoktan;
      case 'ketuaPoktan':
        return `${row.ketuaPoktan}\n${row.nomorHp}`;
      case 'komoditas':
        return row.komoditas.join('\n');
      case 'opt':
        return row.opt.join('\n');
      case 'luasSerangan':
        return row.luasSeranganHa;
      case 'luasWaspada':
        return row.luasWaspadaHa;
      case 'merekKandungan':
        return row.merekKandungan.join('\n');
      case 'jumlah':
        return row.jumlah;
      case 'keterangan':
        return row.keterangan;
      default:
        return '-';
    }
  };

  const dotFill = '....................................';

  return (
    <section
      className="bg-white text-black mx-auto mt-6 shadow-lg"
      style={{
        width: `${widthMm}mm`,
        minHeight: `${heightMm}mm`,
        fontFamily: `${font.family}, sans-serif`,
        fontSize: `${font.baseSizePt}pt`,
        lineHeight: 1.5,
        padding: `${margins.top}cm ${margins.right}cm ${margins.bottom}cm ${margins.left}cm`,
      }}
    >
      {/* ================================================================ */}
      {/* IDENTITAS LAMPIRAN (Kanan Atas) */}
      {/* ================================================================ */}
      <div className="flex justify-end">
        <div
          className={cn('text-right whitespace-pre-line', fmtClass(lampiran.identity.textFormat))}
          style={{
            lineHeight: lampiran.identity.lineSpacing,
            fontSize: `${lampiran.identity.fontSize}pt`,
          }}
        >
          <p>{`${lampiran.identity.lampLabel} : ${lampiran.identity.lampValue}`}</p>
          <p>{`${lampiran.identity.nomorLabel} : ${resolve(lampiran.identity.nomorValueFormat)}`}</p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* JUDUL LAMPIRAN */}
      {/* ================================================================ */}
      <div className="mt-3 text-center">
        <p
          className={cn('whitespace-pre-line', fmtClass(lampiran.title.textFormat))}
          style={{
            fontSize: `${lampiran.title.fontSize}pt`,
            lineHeight: lampiran.title.lineSpacing,
          }}
        >
          {lampiran.title.text}
        </p>
      </div>

      {/* ================================================================ */}
      {/* TABEL RINCIAN DISTRIBUSI */}
      {/* ================================================================ */}
      <div className="mt-4">
        <table
          className="w-full border-collapse"
          style={{
            tableLayout: 'fixed',
            borderColor: lampiran.table.design.borderColor,
            color: lampiran.table.design.bodyTextColor,
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: lampiran.table.design.headerBackgroundColor,
                color: lampiran.table.design.headerTextColor,
              }}
            >
              {lampiran.table.columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-1 py-1 align-middle break-words',
                    textAlignClassMap[col.align] || 'text-center',
                    fmtClass(col.format),
                    'font-semibold'
                  )}
                  style={{
                    width: `${col.widthPercent}%`,
                    borderWidth: `${lampiran.table.design.borderWidthPt}pt`,
                    borderStyle: 'solid',
                    borderColor: lampiran.table.design.borderColor,
                    lineHeight: 1.2,
                    fontSize: `${headerFontSize}pt`,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.lampiran.rows.map((row, index) => (
              <tr
                key={`${row.nomor}-${index}`}
                style={{
                  backgroundColor:
                    lampiran.table.design.stripedRows && index % 2 === 1
                      ? lampiran.table.design.stripeColor
                      : 'transparent',
                }}
              >
                {lampiran.table.columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-1 py-0.5 align-top break-words',
                      textAlignClassMap[col.align] || 'text-left',
                      fmtClass(col.format)
                    )}
                    style={{
                      borderWidth: `${lampiran.table.design.borderWidthPt}pt`,
                      borderStyle: 'solid',
                      borderColor: lampiran.table.design.borderColor,
                      lineHeight: lampiran.table.design.lineSpacing,
                      fontSize: `${tableFontSize}pt`,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {getColValue(row, col.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================================ */}
      {/* TANDA TANGAN LAMPIRAN */}
      {/* ================================================================ */}
      <div
        className="mt-10 flex justify-between"
        style={{ fontSize: `${font.baseSizePt}pt` }}
      >
        {/* Pihak Kedua (kiri) - Ketua Poktan/Gapoktan */}
        <div className="text-center" style={{ width: '45%' }}>
          <p
            className={fmtClass(lampiran.signature.textFormat)}
            style={{ lineHeight: lampiran.signature.lineSpacing }}
          >
            {lampiran.signature.pihakKeduaLabel}
          </p>
          {lampiran.signature.showJabatan && (
            <p className="text-sm mt-0.5">
              {tandaTangan.pihakKedua.jabatanLabel}
            </p>
          )}
          {/* Nama poktan/gapoktan */}
          <p className="text-sm mt-0.5">
            {previewData.pihakKedua.namaPoktan || dotFill}
          </p>
          <div className="mt-14 mb-1">
            <p className="font-bold underline">
              {previewData.pihakKedua.nama || dotFill}
            </p>
          </div>
        </div>

        {/* Pihak Pertama (kanan) - Jabatan resmi + Pangkat/Gol + NIP */}
        <div className="text-center" style={{ width: '45%' }}>
          <p
            className={fmtClass(lampiran.signature.textFormat)}
            style={{ lineHeight: lampiran.signature.lineSpacing }}
          >
            {lampiran.signature.pihakPertamaLabel}
          </p>
          {lampiran.signature.showJabatan && (
            <p className="text-sm mt-0.5 whitespace-pre-line">
              {tandaTangan.pihakPertama.jabatanLabel}
            </p>
          )}
          <div className="mt-10 mb-1">
            <p className="font-bold underline">
              {narratives.biodataPihakPertama.nama || previewData.pihakPertama.nama || dotFill}
            </p>
            {lampiran.signature.showPangkatGolongan && (
              <p className="text-sm">
                {narratives.biodataPihakPertama.pangkat || previewData.pihakPertama.pangkat}
                {' ('}
                {narratives.biodataPihakPertama.golongan || previewData.pihakPertama.golongan}
                {')'}
              </p>
            )}
            {lampiran.signature.showNip && (
              <p className="text-sm">
                NIP. {narratives.biodataPihakPertama.nip || previewData.pihakPertama.nip}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
