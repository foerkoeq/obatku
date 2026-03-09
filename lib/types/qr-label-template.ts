// ============================================================================
// QR LABEL TEMPLATE TYPES
// Types for the complete QR Label template management system
// Supports Label Rak (No. 119) and Label Obat (No. 101)
// ============================================================================

// --- Enums & Constants ---

export type LabelCategory = 'rak' | 'obat';

export type TextAlign = 'left' | 'center' | 'right';

export type CellLayout =
  | '1-cell'                   // 1 sel penuh
  | '2-cell-horizontal'        // 2 sel kanan kiri
  | '2-cell-vertical'          // 2 sel atas bawah
  | '3-cell-2top-1bottom'      // 2 atas (kanan-kiri) + 1 bawah (merge)
  | '3-cell-1top-2bottom'      // 1 atas (merge) + 2 bawah (kanan-kiri)
  | '3-cell-1left-2right'      // 1 kiri + 2 kanan (atas-bawah)
  | '3-cell-2left-1right'      // 2 kiri (atas-bawah) + 1 kanan
  | '4-cell-grid';             // 4 sel sama rata (2x2)

export type SeparatorStyle = 'none' | 'solid' | 'dashed' | 'dotted' | 'double';

export type Orientation = 'portrait' | 'landscape';

// --- Text Style ---

export interface TextStyle {
  fontSize: number;        // in pt
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;           // hex color
  align: TextAlign;
  allCaps: boolean;
}

// --- Paper & Label Dimensions ---

export interface PaperConfig {
  width: number;           // in cm
  height: number;          // in cm
  orientation: Orientation;
}

export interface LabelDimension {
  width: number;           // in mm
  height: number;          // in mm
}

export interface MarginConfig {
  top: number;             // in cm
  bottom: number;          // in cm
  left: number;            // in cm
  right: number;           // in cm
}

export interface SpacingConfig {
  horizontal: number;      // in cm (jarak antar label kanan-kiri)
  vertical: number;        // in cm (jarak antar label atas-bawah)
}

// --- Pesticide Color Map ---

export interface PesticideColorEntry {
  id: number;              // references KategoriObat id
  jenis: string;
  color: string;           // hex color
}

// --- Content Configuration ---

export interface QRSetConfig {
  qrSize: number;          // in cm (width = height)
  qrPosition: TextAlign;
  idStyle: TextStyle;
}

export interface RakCoreConfig {
  lokasiRak: TextStyle;
  detailLokasi: TextStyle;
}

export interface ObatCoreConfig {
  jenisPestisida: TextStyle;
  merekObat: TextStyle;
  kandungan: TextStyle;
  colorBlock: {
    enabled: boolean;
    height: number;        // in mm
    colors: PesticideColorEntry[];
  };
  kadaluarsa: TextStyle;
  sumberDana: TextStyle;
}

export interface LogoSetConfig {
  separator: {
    style: SeparatorStyle;
    color: string;
    thickness: number;     // in px
  };
  logo: {
    enabled: boolean;
    url: string;           // URL or path to logo image
    width: number;         // in mm
    height: number;        // in mm
    position: TextAlign;
  };
  namaDinasText: string;
  namaDinas: TextStyle;
  bidangText: string;
  bidang: TextStyle;
  alamatText: string;
  alamat: TextStyle;
  catatanTambahan: {
    lines: {
      text: string;
      style: TextStyle;
    }[];
  };
}

// --- Template Configuration ---

export interface LabelContentConfig {
  cellLayout: CellLayout;
  qrSet: QRSetConfig;
  rakCore?: RakCoreConfig;    // only for label rak
  obatCore?: ObatCoreConfig;  // only for label obat
  logoSet: LogoSetConfig;
}

export interface LabelTemplateConfig {
  id: string;
  name: string;
  description: string;
  category: LabelCategory;
  labelNumber: string;        // e.g., "101", "119"
  isDefault: boolean;
  isArchived: boolean;

  // Paper & layout
  paper: PaperConfig;
  label: LabelDimension;
  labelsPerSheet: number;
  columns: number;
  rows: number;
  margins: MarginConfig;
  spacing: SpacingConfig;

  // Content
  content: LabelContentConfig;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// --- Mock Data Types ---

export interface RackLabelData {
  id: string;              // QR ID e.g., "GNK-LR1-A01"
  rackCode: string;        // e.g., "A01"
  rackName: string;        // e.g., "A01"
  location: string;        // e.g., "Gudang Obat Pertanian Nakula"
  aisle: string;           // e.g., "Lorong 1"
  fullLocation: string;    // e.g., "Gudang Obat Pertanian Nakula – Lorong 1"
}

export interface MedicineLabelData {
  id: string;              // QR ID e.g., "101-020-003-23-03-0003"
  jenisPestisida: string;  // e.g., "Insektisida"
  idJenis: number;         // e.g., 101
  merek: string;           // e.g., "Montaf 400 SL"
  kandungan: string;       // e.g., "Bisultrap"
  kadaluarsa: string;      // e.g., "Juli 2028"
  sumberDana: string;      // e.g., "APBD-II-2023"
  tahunAnggaran: string;   // e.g., "2023"
}

// --- Page State ---

export type PageView =
  | 'category-select'     // Pilih Label Rak / Label Obat
  | 'template-list'        // Daftar template per kategori
  | 'template-detail'      // Detail template (preview + actions)
  | 'template-form'        // Tambah/Edit template
  | 'content-editor';      // Editor konten label

export interface PageState {
  view: PageView;
  selectedCategory: LabelCategory | null;
  selectedTemplateId: string | null;
  isEditing: boolean;
}
