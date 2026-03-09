'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import Label119Print from './label-119-print';
import Label101Print from './label-101-print';
import type { LabelTemplateConfig, RackLabelData, MedicineLabelData } from '@/lib/types/qr-label-template';
import { SAMPLE_RACK_DATA, SAMPLE_MEDICINE_DATA } from '@/lib/data/mock-qr-label-templates';
import { Printer, ZoomIn, ZoomOut, Grid3X3, Eye, Maximize2 } from 'lucide-react';

interface LabelPreviewProps {
  template: LabelTemplateConfig;
  rackData?: RackLabelData[];
  medicineData?: MedicineLabelData[];
}

const LabelPreview: React.FC<LabelPreviewProps> = ({
  template,
  rackData = SAMPLE_RACK_DATA,
  medicineData = SAMPLE_MEDICINE_DATA,
}) => {
  const [zoom, setZoom] = useState(50);
  const [showGrid, setShowGrid] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!previewRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const { paper, margins } = template;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label ${template.name}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            @page {
              size: ${paper.width}cm ${paper.height}cm ${paper.orientation};
              margin: 0;
            }
            body { margin: 0; padding: 0; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>${previewRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const isRak = template.category === 'rak';

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
        <Button size="sm" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak
        </Button>

        <div className="flex items-center gap-2">
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[zoom]}
            onValueChange={([v]) => setZoom(v)}
            min={20}
            max={100}
            step={5}
            className="w-28"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{zoom}%</span>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="grid-toggle"
            checked={showGrid}
            onCheckedChange={setShowGrid}
          />
          <Label htmlFor="grid-toggle" className="text-xs cursor-pointer">
            <Grid3X3 className="mr-1 inline-block h-3 w-3" />
            Grid
          </Label>
        </div>

        <Badge className="border bg-transparent text-foreground text-xs">
          {template.paper.width}×{template.paper.height}cm • {template.label.width}×{template.label.height}mm •{' '}
          {template.labelsPerSheet} label
        </Badge>
      </div>

      {/* Preview Area */}
      <div className="overflow-auto rounded-lg border bg-gray-100 p-4 dark:bg-gray-900">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${template.paper.width}cm`,
          }}
        >
          <div ref={previewRef}>
            {isRak ? (
              <Label119Print
                data={rackData}
                template={template}
                showGrid={showGrid}
              />
            ) : (
              <Label101Print
                data={medicineData}
                template={template}
                showGrid={showGrid}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelPreview;
