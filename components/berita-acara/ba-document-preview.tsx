'use client';

import React from 'react';
import type { BATemplateConfig, BAPreviewData } from '@/lib/types/berita-acara';
import { resolveNarrative, PAPER_SIZES } from '@/lib/data/mock-berita-acara-templates';
import { cn } from '@/lib/utils';

interface BADocumentPreviewProps {
  template: BATemplateConfig;
  previewData: BAPreviewData;
  className?: string;
  scale?: number;
}

/**
 * Renders a full document preview of the Berita Acara Serah Terima
 * matching the exact MS Word format specification.
 */
export const BADocumentPreview: React.FC<BADocumentPreviewProps> = ({
  template,
  previewData,
  className,
  scale = 1,
}) => {
  const { kopSurat, judul, nomor, narratives, tandaTangan, font, margins, paper } = template;
  const paperDim = PAPER_SIZES[paper.size] || PAPER_SIZES.A4;

  const resolve = (text: string) => resolveNarrative(text, previewData);

  // Build nomor surat from format
  const nomorSurat = resolve(nomor.format);

  // Resolve field values for pihak pertama
  const getPihakPertamaValue = (label: string) => {
    const field = narratives.fieldsPihakPertama.find((f) => f.label === label);
    switch (label) {
      case 'Nama': return previewData.pihakPertama.nama || field?.defaultValue || '......................................................................';
      case 'NIP': return previewData.pihakPertama.nip || field?.defaultValue || '......................................................................';
      case 'Jabatan': return previewData.pihakPertama.jabatan || field?.defaultValue || '......................................................................';
      case 'Unit Kerja': return field?.defaultValue || 'Dinas Ketahanan Pangan, Pertanian dan Perikanan Kabupaten Tuban';
      default: return field?.defaultValue || '......................................................................';
    }
  };

  // Resolve field values for pihak kedua
  const getPihakKeduaValue = (label: string) => {
    const field = narratives.fieldsPihakKedua.find((f) => f.label === label);
    switch (label) {
      case 'Nama': return previewData.pihakKedua.nama || field?.defaultValue || '......................................................................';
      case 'Jabatan': return field?.defaultValue || 'Ketua Kelompok Tani / Gapoktan';
      case 'Nama Poktan/Gapoktan': return previewData.pihakKedua.namaPoktan || '......................................................................';
      case 'Desa / Kecamatan':
        return `${previewData.pihakKedua.desa || '..............................'} / Kec. ${previewData.pihakKedua.kecamatan || '..............................'}`;
      default: return field?.defaultValue || '......................................................................';
    }
  };

  const dotFill = '......................................................................';

  return (
    <div
      className={cn('bg-white text-black mx-auto shadow-lg', className)}
      style={{
        width: `${paperDim.width}mm`,
        minHeight: `${paperDim.height}mm`,
        fontFamily: `${font.family}, sans-serif`,
        fontSize: `${font.baseSizePt}pt`,
        lineHeight: 1.5,
        padding: `${margins.top}cm ${margins.right}cm ${margins.bottom}cm ${margins.left}cm`,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {/* ================================================================ */}
      {/* KOP SURAT (HEADER) */}
      {/* ================================================================ */}
      <header className="mb-0">
        <div className="flex items-start gap-3">
          {/* Logo */}
          {kopSurat.logo.enabled && (
            <div
              className="flex-shrink-0"
              style={{
                width: `${kopSurat.logo.widthCm}cm`,
                height: `${kopSurat.logo.heightCm}cm`,
              }}
            >
              {kopSurat.logo.url ? (
                <img
                  src={kopSurat.logo.url}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full border border-gray-300 flex items-center justify-center text-[7pt] text-gray-400 bg-gray-50">
                  LOGO
                </div>
              )}
            </div>
          )}

          {/* Header Text */}
          <div className="flex-1 text-center">
            <p
              className="uppercase leading-tight"
              style={{ fontSize: `${kopSurat.namaInstansiFontSize}pt` }}
            >
              {kopSurat.namaInstansi}
            </p>
            <p
              className="uppercase font-bold leading-tight"
              style={{ fontSize: `${kopSurat.namaDinasFontSize}pt` }}
            >
              {kopSurat.namaDinas}
            </p>
            <p
              className="leading-tight mt-0.5"
              style={{ fontSize: `${kopSurat.alamatFontSize}pt` }}
            >
              {kopSurat.alamat}
            </p>
            <p
              className="leading-tight"
              style={{ fontSize: `${kopSurat.kontakFontSize}pt` }}
            >
              {kopSurat.kontak}
            </p>
          </div>
        </div>

        {/* Separator Line */}
        <div
          className="mt-2 border-black"
          style={{
            borderBottomWidth: `${kopSurat.separatorThicknessPt}pt`,
            borderBottomStyle: 'solid',
          }}
        />
      </header>

      {/* ================================================================ */}
      {/* JUDUL SURAT */}
      {/* ================================================================ */}
      <div className="text-center mt-6 mb-1">
        <p
          className={cn(
            judul.bold && 'font-bold',
            judul.allCaps && 'uppercase',
            judul.underline && 'underline'
          )}
          style={{ fontSize: `${judul.fontSize}pt` }}
        >
          {judul.text}
        </p>
      </div>

      {/* NOMOR SURAT */}
      <div className="text-center mb-6">
        <p style={{ fontSize: `${nomor.fontSize}pt` }}>{nomorSurat}</p>
      </div>

      {/* ================================================================ */}
      {/* ISI SURAT */}
      {/* ================================================================ */}
      <div className="text-justify space-y-3" style={{ fontSize: `${font.baseSizePt}pt` }}>
        {/* Pembukaan */}
        <p className="indent-[2em]">{resolve(narratives.pembukaan)}</p>

        {/* ============================================================ */}
        {/* PIHAK PERTAMA */}
        {/* ============================================================ */}
        <div className="mt-3">
          <p className="font-bold">{narratives.labelPihakPertama}</p>
          <table className="ml-2 mt-1" style={{ fontSize: `${font.baseSizePt}pt` }}>
            <tbody>
              {narratives.fieldsPihakPertama.map((field, i) => (
                <tr key={i}>
                  <td className="align-top pr-2 whitespace-nowrap py-0.5">{field.label}</td>
                  <td className="align-top px-2 py-0.5">:</td>
                  <td className="align-top py-0.5">{getPihakPertamaValue(field.label)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2">{narratives.redaksiPihakPertama}</p>
        </div>

        {/* ============================================================ */}
        {/* PIHAK KEDUA */}
        {/* ============================================================ */}
        <div className="mt-3">
          <p className="font-bold">{narratives.labelPihakKedua}</p>
          <table className="ml-2 mt-1" style={{ fontSize: `${font.baseSizePt}pt` }}>
            <tbody>
              {narratives.fieldsPihakKedua.map((field, i) => (
                <tr key={i}>
                  <td className="align-top pr-2 whitespace-nowrap py-0.5">{field.label}</td>
                  <td className="align-top px-2 py-0.5">:</td>
                  <td className="align-top py-0.5">{getPihakKeduaValue(field.label)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2">{narratives.redaksiPihakKedua}</p>
        </div>

        {/* ============================================================ */}
        {/* DASAR SERAH TERIMA */}
        {/* ============================================================ */}
        <p className="indent-[2em] mt-3">{narratives.redaksiDasar}</p>
        <ol className="list-decimal ml-8 space-y-1">
          {narratives.dasarItems.map((item, i) => (
            <li key={i}>{resolve(item)}</li>
          ))}
        </ol>

        {/* ============================================================ */}
        {/* PERNYATAAN SERAH TERIMA */}
        {/* ============================================================ */}
        <p className="indent-[2em] mt-3">{narratives.redaksiSerahTerima}</p>

        {/* ============================================================ */}
        {/* KETENTUAN */}
        {/* ============================================================ */}
        <p className="indent-[2em] mt-3">{narratives.redaksiKetentuan}</p>
        <ol className="list-decimal ml-8 space-y-1">
          {narratives.ketentuanItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>

        {/* ============================================================ */}
        {/* PENUTUP */}
        {/* ============================================================ */}
        <p className="indent-[2em] mt-3">{narratives.penutup}</p>
      </div>

      {/* ================================================================ */}
      {/* TANDA TANGAN */}
      {/* ================================================================ */}
      <div className="mt-10 flex justify-between" style={{ fontSize: `${font.baseSizePt}pt` }}>
        {/* Pihak Kedua (left) */}
        <div className="text-center" style={{ width: '45%' }}>
          <p>{tandaTangan.pihakKedua.label}</p>
          <p className="text-sm mt-0.5">{tandaTangan.pihakKedua.jabatanLabel}</p>
          <div className="mt-16 mb-1">
            <p className="font-bold underline">
              {previewData.pihakKedua.nama || dotFill}
            </p>
          </div>
        </div>

        {/* Pihak Pertama (right) */}
        <div className="text-center" style={{ width: '45%' }}>
          <p>{tandaTangan.pihakPertama.label}</p>
          <p className="text-sm mt-0.5 whitespace-pre-line">
            {tandaTangan.pihakPertama.jabatanLabel}
          </p>
          <div className="mt-10 mb-1">
            <p className="font-bold underline">
              {previewData.pihakPertama.nama || dotFill}
            </p>
            <p className="text-sm">{previewData.pihakPertama.pangkat}</p>
            <p className="text-sm">NIP. {previewData.pihakPertama.nip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
