'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, CaseSensitive } from 'lucide-react';
import type { TextStyle, TextAlign } from '@/lib/types/qr-label-template';
import { cn } from '@/lib/utils';

interface TextStyleEditorProps {
  label: string;
  value: TextStyle;
  onChange: (style: TextStyle) => void;
  compact?: boolean;
  hideAllCaps?: boolean;
}

const TextStyleEditor: React.FC<TextStyleEditorProps> = ({
  label: fieldLabel,
  value,
  onChange,
  compact = false,
  hideAllCaps = false,
}) => {
  const update = (partial: Partial<TextStyle>) => onChange({ ...value, ...partial });

  const toggleBtn = (
    active: boolean,
    onClick: () => void,
    icon: React.ReactNode,
    title: string
  ) => (
    <button
      type="button"
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors',
        active
          ? 'border-primary bg-primary text-white'
          : 'border-input bg-background text-foreground hover:bg-muted'
      )}
      onClick={onClick}
      title={title}
    >
      {icon}
    </button>
  );

  if (compact) {
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">{fieldLabel}</Label>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Font Size */}
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={value.fontSize}
              onChange={(e) => update({ fontSize: Number(e.target.value) || 1 })}
              className="h-8 w-14 text-xs"
              min={1}
              max={200}
            />
            <span className="text-[10px] text-muted-foreground">pt</span>
          </div>

          {/* Format toggles */}
          {toggleBtn(value.bold, () => update({ bold: !value.bold }), <Bold className="h-3.5 w-3.5" />, 'Bold')}
          {toggleBtn(value.italic, () => update({ italic: !value.italic }), <Italic className="h-3.5 w-3.5" />, 'Italic')}
          {toggleBtn(value.underline, () => update({ underline: !value.underline }), <Underline className="h-3.5 w-3.5" />, 'Underline')}
          {!hideAllCaps &&
            toggleBtn(value.allCaps, () => update({ allCaps: !value.allCaps }), <CaseSensitive className="h-3.5 w-3.5" />, 'ALL CAPS')}

          {/* Alignment */}
          {toggleBtn(value.align === 'left', () => update({ align: 'left' }), <AlignLeft className="h-3.5 w-3.5" />, 'Rata Kiri')}
          {toggleBtn(value.align === 'center', () => update({ align: 'center' }), <AlignCenter className="h-3.5 w-3.5" />, 'Tengah')}
          {toggleBtn(value.align === 'right', () => update({ align: 'right' }), <AlignRight className="h-3.5 w-3.5" />, 'Rata Kanan')}

          {/* Color */}
          <input
            type="color"
            value={value.color}
            onChange={(e) => update({ color: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border"
            title="Warna"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <Label className="text-sm font-medium">{fieldLabel}</Label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Font Size */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Ukuran Font</Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={value.fontSize}
              onChange={(e) => update({ fontSize: Number(e.target.value) || 1 })}
              className="h-9"
              min={1}
              max={200}
            />
            <span className="text-xs text-muted-foreground">pt</span>
          </div>
        </div>

        {/* Color */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Warna</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value.color}
              onChange={(e) => update({ color: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border"
            />
            <Input
              value={value.color}
              onChange={(e) => update({ color: e.target.value })}
              className="h-9 font-mono text-xs"
              placeholder="#000000"
              maxLength={7}
            />
          </div>
        </div>

        {/* Alignment */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Posisi</Label>
          <Select value={value.align} onValueChange={(v: TextAlign) => update({ align: v })}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Rata Kiri</SelectItem>
              <SelectItem value="center">Tengah</SelectItem>
              <SelectItem value="right">Rata Kanan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Format Toggles */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Format</Label>
          <div className="flex flex-wrap gap-1">
            {toggleBtn(value.bold, () => update({ bold: !value.bold }), <Bold className="h-4 w-4" />, 'Bold')}
            {toggleBtn(value.italic, () => update({ italic: !value.italic }), <Italic className="h-4 w-4" />, 'Italic')}
            {toggleBtn(value.underline, () => update({ underline: !value.underline }), <Underline className="h-4 w-4" />, 'Underline')}
            {!hideAllCaps &&
              toggleBtn(value.allCaps, () => update({ allCaps: !value.allCaps }), <CaseSensitive className="h-4 w-4" />, 'ALL CAPS')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextStyleEditor;
