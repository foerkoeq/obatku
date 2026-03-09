'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { RackLabelData, LabelTemplateConfig } from '@/lib/types/qr-label-template';


// --- QR Code Hook ---
const useQRCode = (data: string, size: number = 200) => {
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

// --- Single Rack Label ---
interface RackLabelProps {
  data: RackLabelData;
  template: LabelTemplateConfig;
}

const RackLabel: React.FC<RackLabelProps> = ({ data, template }) => {
  const qr = useQRCode(data.id, 250);
  const { content } = template;
  const logo = content.logoSet;

  return (
    <div
      className="rack-label-cell"
      style={{
        width: `${template.label.width}mm`,
        height: `${template.label.height}mm`,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, Helvetica, sans-serif',
        overflow: 'hidden',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
      }}
    >
      {/* Top: Left (QR) + Right (Rack Name) */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left Cell — QR Code + ID */}
        <div
          style={{
            width: '45%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2mm',
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
              marginTop: '1mm',
              color: content.qrSet.idStyle.color,
            }}
          >
            {data.id}
          </div>
        </div>

        {/* Right Cell — Rack Name + Location */}
        <div
          style={{
            width: '55%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2mm',
          }}
        >
          <div
            style={{
              fontSize: `${content.rakCore?.lokasiRak.fontSize || 120}pt`,
              fontWeight: 'bold',
              lineHeight: 1,
              textAlign: 'center',
              color: content.rakCore?.lokasiRak.color || '#000',
            }}
          >
            {data.rackName}
          </div>
          <div
            style={{
              fontSize: `${content.rakCore?.detailLokasi.fontSize || 14}pt`,
              textAlign: 'center',
              marginTop: '2mm',
              color: content.rakCore?.detailLokasi.color || '#000',
              fontWeight: content.rakCore?.detailLokasi.bold ? 'bold' : 'normal',
            }}
          >
            {data.fullLocation}
          </div>
        </div>
      </div>

      {/* Bottom Cell — Separator + Logo + Institution */}
      <div
        style={{
          borderTop:
            logo.separator.style !== 'none'
              ? `${logo.separator.thickness}px ${logo.separator.style} ${logo.separator.color}`
              : 'none',
          padding: '1.5mm 2mm',
          display: 'flex',
          alignItems: 'center',
          gap: '2mm',
          minHeight: '18mm',
        }}
      >
        {/* Logo */}
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
                border: '1px solid #ccc',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '5pt',
                color: '#999',
                textAlign: 'center',
                lineHeight: 1.1,
              }}
            >
              LOGO
            </div>
          </div>
        )}

        {/* Text */}
        <div style={{ flex: 1, lineHeight: 1.2 }}>
          <div
            style={{
              fontSize: `${logo.namaDinas.fontSize}pt`,
              fontWeight: logo.namaDinas.bold ? 'bold' : 'normal',
              textTransform: logo.namaDinas.allCaps ? 'uppercase' : 'none',
              color: logo.namaDinas.color,
            }}
          >
            {logo.namaDinasText}
          </div>
          <div
            style={{
              fontSize: `${logo.bidang.fontSize}pt`,
              fontWeight: logo.bidang.bold ? 'bold' : 'normal',
              textTransform: logo.bidang.allCaps ? 'uppercase' : 'none',
              color: logo.bidang.color,
            }}
          >
            {logo.bidangText}
          </div>
          <div
            style={{
              fontSize: `${logo.alamat.fontSize}pt`,
              color: logo.alamat.color,
            }}
          >
            {logo.alamatText}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Full Page Print Layout for No. 119 ---
interface Label119PrintProps {
  data: RackLabelData[];
  template: LabelTemplateConfig;
  showGrid?: boolean;
}

const Label119Print: React.FC<Label119PrintProps> = ({ data, template, showGrid }) => {
  const { paper, margins, spacing, columns, rows } = template;
  const labelsPerPage = columns * rows;

  // Chunk data into pages
  const pages: RackLabelData[][] = [];
  for (let i = 0; i < data.length; i += labelsPerPage) {
    pages.push(data.slice(i, i + labelsPerPage));
  }

  // Fill empty if no data
  if (pages.length === 0) {
    pages.push([]);
  }

  return (
    <div className="label-119-print-container">
      {pages.map((pageData, pageIdx) => (
        <div
          key={pageIdx}
          className="label-119-page"
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
                    'linear-gradient(to right, rgba(0,0,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,255,0.08) 1px, transparent 1px)',
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
                    border: showGrid ? '1px dashed rgba(0,0,255,0.3)' : 'none',
                  }}
                >
                  {item ? (
                    <RackLabel data={item} template={template} />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        border: showGrid ? '1px dashed #ddd' : 'none',
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

export default Label119Print;
export { RackLabel };
