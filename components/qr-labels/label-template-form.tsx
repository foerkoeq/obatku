'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CellLayoutPicker from './cell-layout-picker';
import type { LabelTemplateConfig, CellLayout, Orientation } from '@/lib/types/qr-label-template';
import { Ruler, FileText, Grid3X3, Move } from 'lucide-react';

interface LabelTemplateFormProps {
  value: LabelTemplateConfig;
  onChange: (template: LabelTemplateConfig) => void;
  onNext: () => void;
  onCancel: () => void;
}

const LabelTemplateForm: React.FC<LabelTemplateFormProps> = ({
  value,
  onChange,
  onNext,
  onCancel,
}) => {
  const update = (partial: Partial<LabelTemplateConfig>) => {
    onChange({ ...value, ...partial });
  };

  const autoCalcLabels = (
    paperW: number, paperH: number,
    labelW: number, labelH: number,
    marginT: number, marginB: number, marginL: number, marginR: number,
    gapH: number, gapV: number
  ) => {
    const availW = (paperW * 10) - (marginL * 10) - (marginR * 10); // mm
    const availH = (paperH * 10) - (marginT * 10) - (marginB * 10); // mm
    const cols = Math.max(1, Math.floor((availW + gapH * 10) / (labelW + gapH * 10)));
    const rows = Math.max(1, Math.floor((availH + gapV * 10) / (labelH + gapV * 10)));
    return { cols, rows, total: cols * rows };
  };

  const handleAutoCalc = () => {
    const { cols, rows, total } = autoCalcLabels(
      value.paper.width, value.paper.height,
      value.label.width, value.label.height,
      value.margins.top, value.margins.bottom, value.margins.left, value.margins.right,
      value.spacing.horizontal, value.spacing.vertical
    );
    update({ columns: cols, rows, labelsPerSheet: total });
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Informasi Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-name">Nama Template</Label>
              <Input
                id="tpl-name"
                value={value.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="cth. Label No. 101"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tpl-number">Nomor Label</Label>
              <Input
                id="tpl-number"
                value={value.labelNumber}
                onChange={(e) => update({ labelNumber: e.target.value })}
                placeholder="cth. 101, 119"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-desc">Deskripsi</Label>
            <Input
              id="tpl-desc"
              value={value.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Deskripsi singkat tentang template..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Paper Size & Orientation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="h-4 w-4" />
            Ukuran Kertas & Label
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Lebar Kertas (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={value.paper.width}
                onChange={(e) => update({ paper: { ...value.paper, width: Number(e.target.value) } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tinggi Kertas (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={value.paper.height}
                onChange={(e) => update({ paper: { ...value.paper, height: Number(e.target.value) } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Orientasi</Label>
              <Select
                value={value.paper.orientation}
                onValueChange={(v: Orientation) => update({ paper: { ...value.paper, orientation: v } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">Lanskap</SelectItem>
                  <SelectItem value="portrait">Potret</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Lebar Label (mm)</Label>
              <Input
                type="number"
                step="0.5"
                value={value.label.width}
                onChange={(e) => update({ label: { ...value.label, width: Number(e.target.value) } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tinggi Label (mm)</Label>
              <Input
                type="number"
                step="0.5"
                value={value.label.height}
                onChange={(e) => update({ label: { ...value.label, height: Number(e.target.value) } })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Margins */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Move className="h-4 w-4" />
            Margin & Jarak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Atas (cm)</Label>
              <Input
                type="number"
                step="0.05"
                value={value.margins.top}
                onChange={(e) => update({ margins: { ...value.margins, top: Number(e.target.value) } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Bawah (cm)</Label>
              <Input
                type="number"
                step="0.05"
                value={value.margins.bottom}
                onChange={(e) => update({ margins: { ...value.margins, bottom: Number(e.target.value) } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Kiri (cm)</Label>
              <Input
                type="number"
                step="0.05"
                value={value.margins.left}
                onChange={(e) => update({ margins: { ...value.margins, left: Number(e.target.value) } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Kanan (cm)</Label>
              <Input
                type="number"
                step="0.05"
                value={value.margins.right}
                onChange={(e) => update({ margins: { ...value.margins, right: Number(e.target.value) } })}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Jarak Kanan-Kiri (cm)</Label>
              <Input
                type="number"
                step="0.05"
                value={value.spacing.horizontal}
                onChange={(e) => update({ spacing: { ...value.spacing, horizontal: Number(e.target.value) } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Jarak Atas-Bawah (cm)</Label>
              <Input
                type="number"
                step="0.05"
                value={value.spacing.vertical}
                onChange={(e) => update({ spacing: { ...value.spacing, vertical: Number(e.target.value) } })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Grid3X3 className="h-4 w-4" />
            Tata Letak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Kolom</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={value.columns}
                onChange={(e) => {
                  const cols = Number(e.target.value) || 1;
                  update({ columns: cols, labelsPerSheet: cols * value.rows });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Baris</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={value.rows}
                onChange={(e) => {
                  const rows = Number(e.target.value) || 1;
                  update({ rows, labelsPerSheet: value.columns * rows });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Label/Lembar</Label>
              <Input
                type="number"
                value={value.labelsPerSheet}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAutoCalc}>
            Hitung Otomatis dari Ukuran
          </Button>

          <Separator />

          {/* Cell Layout Picker */}
          <CellLayoutPicker
            value={value.content.cellLayout}
            onChange={(layout: CellLayout) =>
              update({ content: { ...value.content, cellLayout: layout } })
            }
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button onClick={onNext}>
          Lanjut ke Pengaturan Konten
        </Button>
      </div>
    </div>
  );
};

export default LabelTemplateForm;
