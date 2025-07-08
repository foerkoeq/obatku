// Types for print configuration and label data
export interface PaperSize {
  width: number; // in cm
  height: number; // in cm
  unit: 'cm' | 'mm' | 'in';
}

export interface LabelSize {
  width: number; // in cm
  height: number; // in cm
  unit: 'cm' | 'mm' | 'in';
}

export interface LabelSpacing {
  horizontal: number; // gap between labels horizontally
  vertical: number; // gap between labels vertically
  unit: 'cm' | 'mm' | 'in';
}

export interface PrintMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
  unit: 'cm' | 'mm' | 'in';
}

export interface LabelTemplate {
  id: string;
  name: string;
  description: string;
  paperSize: PaperSize;
  labelSize: LabelSize;
  spacing: LabelSpacing;
  margins: PrintMargins;
  labelsPerRow: number;
  labelsPerColumn: number;
}

export interface MedicineLabelData {
  id: string;
  name: string;
  producer: string;
  content: string;
  category: string;
  batchNumber?: string;
  expiryDate: Date;
  entryDate: Date;
  qrCodeData: string;
  storageLocation: string;
  supplier: string;
}

export interface PrintOptions {
  template: LabelTemplate;
  copies: number;
  startPosition?: {
    row: number;
    column: number;
  };
  includeBorder?: boolean;
  fontSize?: {
    title: number;
    content: number;
    small: number;
  };
}

export type PrintFormat = 'pdf' | 'html' | 'canvas';
