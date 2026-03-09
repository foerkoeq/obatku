'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { MedicineLabelData, LabelTemplateConfig } from '@/lib/types/qr-label-template';
import { getPesticideColor } from '@/lib/data/mock-qr-label-templates';

// --- QR Code Hook ---
const useQRCode = (data: string, size: number = 160) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!data) return;
    QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' },
    }).then(setUrl).catch(console.error);
  }, [data, size]);
  return url;
};

// --- Single Medicine Label ---
interface MedicineLabelProps {
  data: MedicineLabelData;
  template: LabelTemplateConfig;
}

const MedicineLabel: React.FC<MedicineLabelProps> = ({ data, template }) => {
  const qr = useQRCode(data.id, 160);
  const { content } = template;
  const obat = content.obatCore;
  const logo = content.logoSet;
  const blockColor = getPesticideColor(data.idJenis);

  return (
    <div
      className="medicine-label-cell"
      style={{
        width: `${template.label.width}mm`,
        height: `${template.label.height}mm`,
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'Arial, Helvetica, sans-serif',
        overflow: 'hidden',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
      }}
    >
      {/* Left Cell — QR Code + ID */}
      <div
        style={{
          width: `${content.qrSet.qrSize + 0.4}cm`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1mm',
          flexShrink: 0,
        }}
      >
        {qr && (
          <img
            src={qr}
            alt={`QR ${data.id}`}
            style={{
              width: `${content.qrSet.qrSize}cm`,
              height: `${content.qrSet.qrSize}cm`,
              objectFit: 'contain',
            }}
          />
        )}
        <div
          style={{
            fontSize: `${content.qrSet.idStyle.fontSize}pt`,
            fontWeight: content.qrSet.idStyle.bold ? 'bold' : 'normal',
            textAlign: 'center',
            marginTop: '0.5mm',
            color: content.qrSet.idStyle.color,
            lineHeight: 1.1,
            wordBreak: 'break-all',
            maxWidth: '100%',
          }}
        >
          {data.id}
        </div>
      </div>

      {/* Right Cell — All info */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1mm 1.5mm 1mm 0',
          overflow: 'hidden',
          justifyContent: 'space-between',
        }}
      >
        {/* Jenis Pestisida */}
        {obat && (
          <div
            style={{
              fontSize: `${obat.jenisPestisida.fontSize}pt`,
              fontWeight: obat.jenisPestisida.bold ? 'bold' : 'normal',
              fontStyle: obat.jenisPestisida.italic ? 'italic' : 'normal',
              textDecoration: obat.jenisPestisida.underline ? 'underline' : 'none',
              textAlign: obat.jenisPestisida.align,
              color: obat.jenisPestisida.color,
              lineHeight: 1.2,
            }}
          >
            {data.jenisPestisida}
          </div>
        )}

        {/* Merek */}
        {obat && (
          <div
            style={{
              fontSize: `${obat.merekObat.fontSize}pt`,
              fontWeight: obat.merekObat.bold ? 'bold' : 'normal',
              textAlign: obat.merekObat.align,
              color: obat.merekObat.color,
              lineHeight: 1.15,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {data.merek}
          </div>
        )}

        {/* Kandungan */}
        {obat && (
          <div
            style={{
              fontSize: `${obat.kandungan.fontSize}pt`,
              textAlign: obat.kandungan.align,
              color: obat.kandungan.color,
              lineHeight: 1.2,
            }}
          >
            {data.kandungan}
          </div>
        )}

        {/* Color Block */}
        {obat?.colorBlock.enabled && (
          <div
            style={{
              backgroundColor: blockColor,
              height: `${obat.colorBlock.height}mm`,
              width: '100%',
              borderRadius: '1px',
              flexShrink: 0,
            }}
          />
        )}

        {/* Kadaluarsa */}
        {obat && (
          <div
            style={{
              fontSize: `${obat.kadaluarsa.fontSize}pt`,
              textAlign: obat.kadaluarsa.align,
              color: obat.kadaluarsa.color,
              lineHeight: 1.2,
            }}
          >
            EXP: {data.kadaluarsa}
          </div>
        )}

        {/* Sumber Dana */}
        {obat && (
          <div
            style={{
              fontSize: `${obat.sumberDana.fontSize}pt`,
              textAlign: obat.sumberDana.align,
              color: obat.sumberDana.color,
              lineHeight: 1.2,
            }}
          >
            {data.sumberDana}
          </div>
        )}

        {/* Logo + DKP2P Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1mm' }}>
          {logo.logo.enabled && (
            <div
              style={{
                width: `${logo.logo.width}mm`,
                height: `${logo.logo.height}mm`,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  border: '0.5px solid #ccc',
                  borderRadius: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4pt',
                  color: '#999',
                }}
              >
                LOGO
              </div>
            </div>
          )}
          <div style={{ flex: 1, lineHeight: 1.1 }}>
            <div
              style={{
                fontSize: `${logo.namaDinas.fontSize}pt`,
                fontWeight: logo.namaDinas.bold ? 'bold' : 'normal',
                textDecoration: logo.namaDinas.underline ? 'underline' : 'none',
                textTransform: logo.namaDinas.allCaps ? 'uppercase' : 'none',
                textAlign: logo.namaDinas.align as React.CSSProperties['textAlign'],
                color: logo.namaDinas.color,
              }}
            >
              {logo.namaDinasText}
            </div>
            {/* Additional notes */}
            {logo.catatanTambahan.lines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: `${line.style.fontSize}pt`,
                  fontWeight: line.style.bold ? 'bold' : 'normal',
                  textTransform: line.style.allCaps ? 'uppercase' : 'none',
                  textAlign: line.style.align as React.CSSProperties['textAlign'],
                  color: line.style.color,
                  lineHeight: 1.1,
                }}
              >
                {line.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Full Page Print Layout for No. 101 ---
interface Label101PrintProps {
  data: MedicineLabelData[];
  template: LabelTemplateConfig;
  showGrid?: boolean;
}

const Label101Print: React.FC<Label101PrintProps> = ({ data, template, showGrid }) => {
  const { paper, margins, spacing, columns, rows } = template;
  const labelsPerPage = columns * rows;

  const pages: MedicineLabelData[][] = [];
  for (let i = 0; i < data.length; i += labelsPerPage) {
    pages.push(data.slice(i, i + labelsPerPage));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <div className="label-101-print-container">
      {pages.map((pageData, pageIdx) => (
        <div
          key={pageIdx}
          className="label-101-page"
          style={{
            width: `${paper.width}cm`,
            height: `${paper.height}cm`,
            padding: `${margins.top}cm ${margins.right}cm ${margins.bottom}cm ${margins.left}cm`,
            backgroundColor: '#fff',
            position: 'relative',
            boxSizing: 'border-box',
            pageBreakAfter: pageIdx < pages.length - 1 ? 'always' : 'auto',
            overflow: 'hidden',
            ...(showGrid
              ? {
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,0,0,0.08) 1px, transparent 1px)',
                  backgroundSize: '1cm 1cm',
                }
              : {}),
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, ${template.label.width}mm)`,
              gridTemplateRows: `repeat(${rows}, ${template.label.height}mm)`,
              gap: `${spacing.vertical}cm ${spacing.horizontal}cm`,
              width: '100%',
              height: '100%',
            }}
          >
            {Array.from({ length: labelsPerPage }).map((_, idx) => {
              const item = pageData[idx];
              return (
                <div
                  key={idx}
                  style={{
                    border: showGrid ? '1px dashed rgba(255,0,0,0.3)' : 'none',
                  }}
                >
                  {item ? (
                    <MedicineLabel data={item} template={template} />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        border: showGrid ? '1px dashed #eee' : 'none',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Label101Print;
export { MedicineLabel };
