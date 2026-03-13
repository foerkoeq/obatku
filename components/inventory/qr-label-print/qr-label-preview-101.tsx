"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import QRCode from 'qrcode';
import {
  PreviewPageData,
  LabelPrintSettings,
  LabelPreviewItem,
} from '@/lib/types/qr-label-print';
import './qr-label-print.css';

interface QRLabelPreview101Props {
  pages: PreviewPageData[];
  printSettings: LabelPrintSettings;
  onBack: () => void;
  onPrint: () => void;
}

const QRLabelPreview101: React.FC<QRLabelPreview101Props> = ({
  pages,
  printSettings,
  onBack,
  onPrint,
}) => {
  const [previewScale, setPreviewScale] = useState(0.7);
  const [qrCodes, setQrCodes] = useState<Map<string, string>>(new Map());

  // Generate QR codes
  React.useEffect(() => {
    const generateQRCodes = async () => {
      const newQrCodes = new Map<string, string>();

      for (const page of pages) {
        for (const label of page.labels) {
          try {
            const url = await QRCode.toDataURL(label.qrData, {
              width: 120,
              margin: 1,
              color: {
                dark: '#000000',
                light: '#FFFFFF',
              },
            });
            newQrCodes.set(label.id, url);
          } catch (error) {
            console.error('Error generating QR code:', error);
          }
        }
      }

      setQrCodes(newQrCodes);
    };

    generateQRCodes();
  }, [pages]);

  const handleZoomIn = () => {
    setPreviewScale(prev => Math.min(prev + 0.1, 1.2));
  };

  const handleZoomOut = () => {
    setPreviewScale(prev => Math.max(prev - 0.1, 0.4));
  };

  const handleResetZoom = () => {
    setPreviewScale(0.7);
  };

  // Calculate summary
  const totalLabels = pages.reduce((sum, page) => sum + page.labels.length, 0);
  const totalPages = pages.length;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon icon="heroicons:document-text" className="w-5 h-5" />
              Ringkasan Cetak
            </CardTitle>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={previewScale <= 0.4}
              >
                <Icon icon="heroicons:minus" className="w-4 h-4" />
              </Button>
              <Badge variant="secondary" className="min-w-[60px] text-center">
                {Math.round(previewScale * 100)}%
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={previewScale >= 1.2}
              >
                <Icon icon="heroicons:plus" className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{pages.length}</div>
              <div className="text-xs text-muted-foreground">Obat</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalLabels}</div>
              <div className="text-xs text-muted-foreground">Total Label</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{totalPages}</div>
              <div className="text-xs text-muted-foreground">Halaman</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">101</div>
              <div className="text-xs text-muted-foreground">Template</div>
            </div>
          </div>

          {/* Print Settings Info */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-medium">Posisi awal:</span> Label {printSettings.startLabelPosition}
              </div>
              <div>
                <span className="font-medium">Label/halaman:</span> {printSettings.labelsPerSheet}
              </div>
              <div>
                <span className="font-medium">Kertas:</span> 21.5 × 16.5 cm
              </div>
              <div>
                <span className="font-medium">Output:</span> {printSettings.printAction === 'pdf' ? 'Simpan PDF' : 'Cetak'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Pages */}
      <div className="space-y-4 no-print max-h-[calc(100vh-400px)] overflow-y-auto">
        {pages.map((page, pageIndex) => (
          <Card key={pageIndex} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Halaman {page.pageNumber}</span>
                <Badge variant="secondary">
                  {page.labels.length} / {printSettings.labelsPerSheet} label
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 overflow-x-auto">
              <div
                className="transform-gpu transition-transform duration-200 origin-top-left inline-block"
                style={{ transform: `scale(${previewScale})` }}
              >
                <div className="qr-label-page-101">
                  <div className="qr-label-grid-101">
                    {/* Render all 6 label positions */}
                    {Array.from({ length: printSettings.labelsPerSheet }).map((_, labelIndex) => {
                      const label = page.labels.find(l => {
                        const relativeIndex = page.labels.indexOf(l);
                        return relativeIndex === labelIndex;
                      });

                      // Calculate actual position
                      const position = page.pageNumber === 1
                        ? labelIndex + page.startLabelPosition - 1
                        : labelIndex;

                      const labelAtPosition = page.labels.find(l => {
                        const relativeIndex = page.labels.indexOf(l);
                        return relativeIndex === position;
                      });

                      return (
                        <div
                          key={labelIndex}
                          className={`qr-label-101 ${!labelAtPosition ? 'qr-label-empty' : ''}`}
                        >
                          {labelAtPosition ? (
                            <>
                              {/* Header with color block */}
                              <div className="qr-label-header">
                                <div className="qr-label-color-block" />
                                <div className="qr-label-content">
                                  <div className="qr-label-name">{labelAtPosition.medicineName}</div>
                                  <div className="qr-label-producer">{labelAtPosition.producer}</div>
                                  <div className="qr-label-ingredient">{labelAtPosition.content}</div>
                                  <div className="qr-label-source">{labelAtPosition.source}</div>
                                </div>
                              </div>

                              {/* Footer with QR and info */}
                              <div className="qr-label-footer">
                                {qrCodes.get(labelAtPosition.id) && (
                                  <div className="qr-label-qr">
                                    <img
                                      src={qrCodes.get(labelAtPosition.id)}
                                      alt="QR Code"
                                      className="qr-label-qr-image"
                                    />
                                  </div>
                                )}
                                <div className="qr-label-info">
                                  <div className="qr-label-expiry">
                                    Kadaluarsa: {labelAtPosition.expiryDate}
                                  </div>
                                  <div className="qr-label-location">
                                    {labelAtPosition.location}
                                  </div>
                                  <div className="qr-label-number">
                                    #{labelAtPosition.labelNumber}
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="qr-label-empty-state" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hidden Print Content */}
      <div className="print-only" style={{ display: 'none' }}>
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="print-page-101">
            <div className="qr-label-page-101">
              <div className="qr-label-grid-101">
                {Array.from({ length: printSettings.labelsPerSheet }).map((_, labelIndex) => {
                  const position = page.pageNumber === 1
                    ? labelIndex + page.startLabelPosition - 1
                    : labelIndex;

                  const labelAtPosition = page.labels.find(l => {
                    const relativeIndex = page.labels.indexOf(l);
                    return relativeIndex === position;
                  });

                  return (
                    <div
                      key={labelIndex}
                      className={`qr-label-101 ${!labelAtPosition ? 'qr-label-empty' : ''}`}
                    >
                      {labelAtPosition ? (
                        <>
                          <div className="qr-label-header">
                            <div className="qr-label-color-block" />
                            <div className="qr-label-content">
                              <div className="qr-label-name">{labelAtPosition.medicineName}</div>
                              <div className="qr-label-producer">{labelAtPosition.producer}</div>
                              <div className="qr-label-ingredient">{labelAtPosition.content}</div>
                              <div className="qr-label-source">{labelAtPosition.source}</div>
                            </div>
                          </div>

                          <div className="qr-label-footer">
                            {qrCodes.get(labelAtPosition.id) && (
                              <div className="qr-label-qr">
                                <img
                                  src={qrCodes.get(labelAtPosition.id)}
                                  alt="QR Code"
                                  className="qr-label-qr-image"
                                />
                              </div>
                            )}
                            <div className="qr-label-info">
                              <div className="qr-label-expiry">
                                Kadaluarsa: {labelAtPosition.expiryDate}
                              </div>
                              <div className="qr-label-location">
                                {labelAtPosition.location}
                              </div>
                              <div className="qr-label-number">
                                #{labelAtPosition.labelNumber}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="qr-label-empty-state" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t sticky bottom-0 bg-background">
        <div className="text-xs text-muted-foreground">
          Siap mencetak {totalLabels} label dalam {totalPages} halaman
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-2" />
            Ubah Pengaturan
          </Button>

          <Button
            size="sm"
            onClick={onPrint}
            className={printSettings.printAction === 'pdf' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {printSettings.printAction === 'pdf' ? (
              <>
                <Icon icon="heroicons:document-arrow-down" className="w-4 h-4 mr-2" />
                Simpan PDF
              </>
            ) : (
              <>
                <Icon icon="heroicons:printer" className="w-4 h-4 mr-2" />
                Cetak Sekarang
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRLabelPreview101;
