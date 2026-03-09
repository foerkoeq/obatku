'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import type { CellLayout } from '@/lib/types/qr-label-template';
import { cn } from '@/lib/utils';

interface CellLayoutPickerProps {
  value: CellLayout;
  onChange: (layout: CellLayout) => void;
}

interface LayoutOption {
  id: CellLayout;
  label: string;
  render: React.ReactNode;
}

const CELL_SIZE = 48;

const CellBox: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className, children }) => (
  <div
    className={cn(
      'flex items-center justify-center rounded-sm border border-muted-foreground/40 bg-muted/30 text-[8px] text-muted-foreground',
      className
    )}
  >
    {children}
  </div>
);

const layoutOptions: LayoutOption[] = [
  {
    id: '1-cell',
    label: '1 Sel',
    render: (
      <div className="grid h-full w-full p-0.5">
        <CellBox>1</CellBox>
      </div>
    ),
  },
  {
    id: '2-cell-horizontal',
    label: '2 Sel (K-Kr)',
    render: (
      <div className="grid h-full w-full grid-cols-2 gap-0.5 p-0.5">
        <CellBox>K</CellBox>
        <CellBox>Kr</CellBox>
      </div>
    ),
  },
  {
    id: '2-cell-vertical',
    label: '2 Sel (A-B)',
    render: (
      <div className="grid h-full w-full grid-rows-2 gap-0.5 p-0.5">
        <CellBox>A</CellBox>
        <CellBox>B</CellBox>
      </div>
    ),
  },
  {
    id: '3-cell-2top-1bottom',
    label: '3 Sel (2A+1B)',
    render: (
      <div className="grid h-full w-full grid-rows-[1fr_auto] gap-0.5 p-0.5">
        <div className="grid grid-cols-2 gap-0.5">
          <CellBox>K</CellBox>
          <CellBox>Kr</CellBox>
        </div>
        <CellBox className="h-3">B</CellBox>
      </div>
    ),
  },
  {
    id: '3-cell-1top-2bottom',
    label: '3 Sel (1A+2B)',
    render: (
      <div className="grid h-full w-full grid-rows-[auto_1fr] gap-0.5 p-0.5">
        <CellBox className="h-3">A</CellBox>
        <div className="grid grid-cols-2 gap-0.5">
          <CellBox>K</CellBox>
          <CellBox>Kr</CellBox>
        </div>
      </div>
    ),
  },
  {
    id: '3-cell-1left-2right',
    label: '3 Sel (1K+2Kr)',
    render: (
      <div className="grid h-full w-full grid-cols-[1fr_1fr] gap-0.5 p-0.5">
        <CellBox>K</CellBox>
        <div className="grid grid-rows-2 gap-0.5">
          <CellBox>A</CellBox>
          <CellBox>B</CellBox>
        </div>
      </div>
    ),
  },
  {
    id: '3-cell-2left-1right',
    label: '3 Sel (2K+1Kr)',
    render: (
      <div className="grid h-full w-full grid-cols-[1fr_1fr] gap-0.5 p-0.5">
        <div className="grid grid-rows-2 gap-0.5">
          <CellBox>A</CellBox>
          <CellBox>B</CellBox>
        </div>
        <CellBox>Kr</CellBox>
      </div>
    ),
  },
  {
    id: '4-cell-grid',
    label: '4 Sel (2×2)',
    render: (
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5 p-0.5">
        <CellBox>1</CellBox>
        <CellBox>2</CellBox>
        <CellBox>3</CellBox>
        <CellBox>4</CellBox>
      </div>
    ),
  },
];

const CellLayoutPicker: React.FC<CellLayoutPickerProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Komposisi Sel Label</Label>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {layoutOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg border-2 p-1.5 transition-all',
              value === opt.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50'
            )}
          >
            <div
              style={{ width: CELL_SIZE, height: CELL_SIZE }}
              className="overflow-hidden rounded"
            >
              {opt.render}
            </div>
            <span className="text-[10px] leading-tight text-center">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CellLayoutPicker;
