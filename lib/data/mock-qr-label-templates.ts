// ============================================================================
// MOCK DATA FOR QR LABEL TEMPLATES
// Contains default templates, sample data, and pesticide color mapping
// ============================================================================

import {
  LabelTemplateConfig,
  RackLabelData,
  MedicineLabelData,
  PesticideColorEntry,
  TextStyle,
} from '@/lib/types/qr-label-template';

// --- Default Text Styles ---

const defaultTextStyle = (overrides: Partial<TextStyle> = {}): TextStyle => ({
  fontSize: 11,
  bold: false,
  italic: false,
  underline: false,
  color: '#000000',
  align: 'left',
  allCaps: false,
  ...overrides,
});

// --- Pesticide Color Map ---

export const PESTICIDE_COLORS: PesticideColorEntry[] = [
  { id: 101, jenis: 'Insektisida', color: '#F1A983' },
  { id: 102, jenis: 'Akarisida', color: '#E07B39' },
  { id: 103, jenis: 'Termitisida', color: '#8D6E63' },
  { id: 104, jenis: 'Ovisida', color: '#FFAB91' },
  { id: 105, jenis: 'Larvasida', color: '#FF8A65' },
  { id: 106, jenis: 'Adultisida', color: '#D4845E' },
  { id: 111, jenis: 'Rodentisida', color: '#EE0000' },
  { id: 112, jenis: 'Moluskisida', color: '#607D8B' },
  { id: 113, jenis: 'Nematisida', color: '#9C27B0' },
  { id: 114, jenis: 'Avisida', color: '#F06292' },
  { id: 115, jenis: 'Piskisida', color: '#4DB6AC' },
  { id: 121, jenis: 'Fungisida', color: '#0F9ED5' },
  { id: 122, jenis: 'Bakterisida', color: '#FF9800' },
  { id: 123, jenis: 'Algasida', color: '#26A69A' },
  { id: 124, jenis: 'Lichenisida', color: '#78909C' },
  { id: 131, jenis: 'Herbisida', color: '#8BC34A' },
  { id: 132, jenis: 'Silvisida', color: '#689F38' },
  { id: 133, jenis: 'ZPT', color: '#AED581' },
  { id: 134, jenis: 'Defolian', color: '#C5E1A5' },
  { id: 135, jenis: 'Desikan', color: '#A1887F' },
  { id: 141, jenis: 'Atraktan Kimia', color: '#CE93D8' },
  { id: 142, jenis: 'Repelan Kimia', color: '#BA68C8' },
  { id: 143, jenis: 'Fumigan', color: '#B0BEC5' },
  { id: 200, jenis: 'Pestisida Nabati', color: '#38D04E' },
  { id: 201, jenis: 'Insektisida Nabati', color: '#66BB6A' },
  { id: 202, jenis: 'Fungisida Nabati', color: '#43A047' },
  { id: 203, jenis: 'Bakterisida Nabati', color: '#2E7D32' },
  { id: 300, jenis: 'Agen Hayati', color: '#A02B93' },
  { id: 301, jenis: 'Cendawan (Fungi)', color: '#AB47BC' },
  { id: 302, jenis: 'Bakteri', color: '#8E24AA' },
  { id: 303, jenis: 'Virus Entomopatogen', color: '#7B1FA2' },
  { id: 311, jenis: 'Predator', color: '#6A1B9A' },
  { id: 312, jenis: 'Parasitoid', color: '#4A148C' },
];

export const getPesticideColor = (idJenis: number): string => {
  const entry = PESTICIDE_COLORS.find((c) => c.id === idJenis);
  if (entry) return entry.color;
  // Fallback: check by category range
  if (idJenis >= 100 && idJenis < 110) return '#F1A983';
  if (idJenis >= 110 && idJenis < 120) return '#EE0000';
  if (idJenis >= 120 && idJenis < 130) return '#0F9ED5';
  if (idJenis >= 130 && idJenis < 140) return '#8BC34A';
  if (idJenis >= 140 && idJenis < 200) return '#CE93D8';
  if (idJenis >= 200 && idJenis < 300) return '#38D04E';
  if (idJenis >= 300 && idJenis < 400) return '#A02B93';
  return '#9E9E9E';
};

// --- Default Template: Label No. 119 (Rack Label) ---

export const TEMPLATE_LABEL_119: LabelTemplateConfig = {
  id: 'tpl-119-default',
  name: 'Label No. 119',
  description: 'Stiker label rak No. 119 – 2 label per lembar, susunan atas-bawah',
  category: 'rak',
  labelNumber: '119',
  isDefault: true,
  isArchived: false,

  paper: { width: 21.5, height: 16.5, orientation: 'landscape' },
  label: { width: 190, height: 75 },
  labelsPerSheet: 2,
  columns: 1,
  rows: 2,
  margins: { top: 0.5, bottom: 0, left: 1.25, right: 1.25 },
  spacing: { horizontal: 0, vertical: 0.3 },

  content: {
    cellLayout: '3-cell-2top-1bottom',
    qrSet: {
      qrSize: 4,
      qrPosition: 'center',
      idStyle: defaultTextStyle({ fontSize: 10, align: 'center' }),
    },
    rakCore: {
      lokasiRak: defaultTextStyle({ fontSize: 72, bold: true, align: 'center' }),
      detailLokasi: defaultTextStyle({ fontSize: 12, align: 'center' }),
    },
    logoSet: {
      separator: { style: 'solid', color: '#000000', thickness: 1 },
      logo: {
        enabled: true,
        url: '/images/logo-pemkab-tuban.png',
        width: 12,
        height: 14,
        position: 'left',
      },
      namaDinasText: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN KABUPATEN TUBAN',
      namaDinas: defaultTextStyle({
        fontSize: 14,
        bold: true,
        allCaps: true,
        align: 'left',
      }),
      bidangText: 'BIDANG SARANA PERTANIAN',
      bidang: defaultTextStyle({
        fontSize: 12,
        bold: true,
        allCaps: true,
        align: 'left',
      }),
      alamatText: 'Jl. Mastrip gg. Nakula, Sidorejo, Kab. Tuban',
      alamat: defaultTextStyle({ fontSize: 9, align: 'left' }),
      catatanTambahan: { lines: [] },
    },
  },

  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
};

// --- Default Template: Label No. 101 (Medicine Label) ---

export const TEMPLATE_LABEL_101: LabelTemplateConfig = {
  id: 'tpl-101-default',
  name: 'Label No. 101',
  description: 'Stiker label obat No. 101 – 6 label per lembar, orientasi lanskap',
  category: 'obat',
  labelNumber: '101',
  isDefault: true,
  isArchived: false,

  paper: { width: 21.5, height: 16.5, orientation: 'landscape' },
  label: { width: 95, height: 50 },
  labelsPerSheet: 6,
  columns: 2,
  rows: 3,
  margins: { top: 1, bottom: 0, left: 0.4, right: 0.4 },
  spacing: { horizontal: 0.8, vertical: 0.2 },

  content: {
    cellLayout: '2-cell-horizontal',
    qrSet: {
      qrSize: 4,
      qrPosition: 'center',
      idStyle: defaultTextStyle({ fontSize: 10, bold: true, align: 'center' }),
    },
    obatCore: {
      jenisPestisida: defaultTextStyle({
        fontSize: 12,
        bold: true,
        underline: true,
        align: 'left',
      }),
      merekObat: defaultTextStyle({
        fontSize: 16,
        bold: true,
        align: 'left',
      }),
      kandungan: defaultTextStyle({ fontSize: 11, align: 'left' }),
      colorBlock: {
        enabled: true,
        height: 4,
        colors: PESTICIDE_COLORS,
      },
      kadaluarsa: defaultTextStyle({ fontSize: 11, align: 'left' }),
      sumberDana: defaultTextStyle({ fontSize: 11, align: 'left' }),
    },
    logoSet: {
      separator: { style: 'none', color: '#000000', thickness: 0 },
      logo: {
        enabled: true,
        url: '/images/logo-pemkab-tuban.png',
        width: 8,
        height: 10,
        position: 'left',
      },
      namaDinasText: 'DKP2P KAB. TUBAN',
      namaDinas: defaultTextStyle({
        fontSize: 9,
        bold: true,
        underline: true,
        allCaps: true,
        align: 'center',
      }),
      bidangText: 'BIDANG SARANA PERTANIAN',
      bidang: defaultTextStyle({ fontSize: 7, allCaps: true, align: 'center' }),
      alamatText: 'Jl. Mastrip gg. Nakula, Sidorejo, Kab. Tuban',
      alamat: defaultTextStyle({ fontSize: 7, align: 'center' }),
      catatanTambahan: {
        lines: [
          {
            text: 'TIDAK UNTUK DIPERJUAL BELIKAN',
            style: defaultTextStyle({
              fontSize: 7,
              allCaps: true,
              align: 'center',
            }),
          },
        ],
      },
    },
  },

  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
};

// --- All Default Templates ---

export const DEFAULT_TEMPLATES: LabelTemplateConfig[] = [
  TEMPLATE_LABEL_119,
  TEMPLATE_LABEL_101,
];

// --- Sample Rack Data ---

export const SAMPLE_RACK_DATA: RackLabelData[] = [
  {
    id: 'GNK-LR1-A01',
    rackCode: 'A01',
    rackName: 'A01',
    location: 'Gudang Obat Pertanian Nakula',
    aisle: 'Lorong 1',
    fullLocation: 'Gudang Obat Pertanian Nakula – Lorong 1',
  },
  {
    id: 'GNK-LR1-A02',
    rackCode: 'A02',
    rackName: 'A02',
    location: 'Gudang Obat Pertanian Nakula',
    aisle: 'Lorong 1',
    fullLocation: 'Gudang Obat Pertanian Nakula – Lorong 1',
  },
  {
    id: 'GNK-LR2-B01',
    rackCode: 'B01',
    rackName: 'B01',
    location: 'Gudang Obat Pertanian Nakula',
    aisle: 'Lorong 2',
    fullLocation: 'Gudang Obat Pertanian Nakula – Lorong 2',
  },
  {
    id: 'GNK-LR2-B02',
    rackCode: 'B02',
    rackName: 'B02',
    location: 'Gudang Obat Pertanian Nakula',
    aisle: 'Lorong 2',
    fullLocation: 'Gudang Obat Pertanian Nakula – Lorong 2',
  },
  {
    id: 'GNK-LR3-C01',
    rackCode: 'C01',
    rackName: 'C01',
    location: 'Gudang Obat Pertanian Nakula',
    aisle: 'Lorong 3',
    fullLocation: 'Gudang Obat Pertanian Nakula – Lorong 3',
  },
  {
    id: 'GNK-LR3-C02',
    rackCode: 'C02',
    rackName: 'C02',
    location: 'Gudang Obat Pertanian Nakula',
    aisle: 'Lorong 3',
    fullLocation: 'Gudang Obat Pertanian Nakula – Lorong 3',
  },
];

// --- Sample Medicine Label Data ---

export const SAMPLE_MEDICINE_DATA: MedicineLabelData[] = [
  {
    id: '101-010-001-23-03-0001',
    jenisPestisida: 'Insektisida',
    idJenis: 101,
    merek: 'Matros 18 EC',
    kandungan: 'Abamectin',
    kadaluarsa: 'Juni 2027',
    sumberDana: 'APBD-II-2023',
    tahunAnggaran: '2023',
  },
  {
    id: '101-020-003-23-03-0003',
    jenisPestisida: 'Insektisida',
    idJenis: 101,
    merek: 'Montaf 400 SL',
    kandungan: 'Bisultrap',
    kadaluarsa: 'Juli 2028',
    sumberDana: 'APBD-II-2023',
    tahunAnggaran: '2023',
  },
  {
    id: '111-030-001-24-01-0001',
    jenisPestisida: 'Rodentisida',
    idJenis: 111,
    merek: 'Petrokum',
    kandungan: 'Brodifakum',
    kadaluarsa: 'Desember 2029',
    sumberDana: 'APBN-2024',
    tahunAnggaran: '2024',
  },
  {
    id: '121-110-001-23-03-0001',
    jenisPestisida: 'Fungisida',
    idJenis: 121,
    merek: 'Running WP',
    kandungan: 'Klorotalonil',
    kadaluarsa: 'November 2026',
    sumberDana: 'APBD-II-2023',
    tahunAnggaran: '2023',
  },
  {
    id: '121-130-002-23-03-0001',
    jenisPestisida: 'Fungisida',
    idJenis: 121,
    merek: 'Topsin 500 SC',
    kandungan: 'Metil Tiofanat',
    kadaluarsa: 'September 2028',
    sumberDana: 'APBD-II-2023',
    tahunAnggaran: '2023',
  },
  {
    id: '201-040-001-25-03-0001',
    jenisPestisida: 'Pestisida Nabati',
    idJenis: 201,
    merek: 'Bioneem 50 EC',
    kandungan: 'Azadirachtin',
    kadaluarsa: 'Maret 2028',
    sumberDana: 'APBD-II-2025',
    tahunAnggaran: '2025',
  },
  {
    id: '301-200-200-25-03-0001',
    jenisPestisida: 'Agen Hayati',
    idJenis: 301,
    merek: 'Trichoderma',
    kandungan: 'T. Harzianum',
    kadaluarsa: 'Desember 2027',
    sumberDana: 'APBD-II-2025',
    tahunAnggaran: '2025',
  },
  {
    id: '131-050-001-24-01-0001',
    jenisPestisida: 'Herbisida',
    idJenis: 131,
    merek: 'Roundup 486 SL',
    kandungan: 'Glifosat',
    kadaluarsa: 'Agustus 2029',
    sumberDana: 'APBN-2024',
    tahunAnggaran: '2024',
  },
  {
    id: '122-060-001-23-03-0001',
    jenisPestisida: 'Bakterisida',
    idJenis: 122,
    merek: 'Agrept 20 WP',
    kandungan: 'Streptomisin Sulfat',
    kadaluarsa: 'April 2027',
    sumberDana: 'APBD-II-2023',
    tahunAnggaran: '2023',
  },
  {
    id: '102-070-001-24-03-0001',
    jenisPestisida: 'Akarisida',
    idJenis: 102,
    merek: 'Omite 570 EC',
    kandungan: 'Propargit',
    kadaluarsa: 'Februari 2029',
    sumberDana: 'APBD-II-2024',
    tahunAnggaran: '2024',
  },
  {
    id: '112-080-001-25-01-0001',
    jenisPestisida: 'Moluskisida',
    idJenis: 112,
    merek: 'Bayluscide 250 EC',
    kandungan: 'Niklosamida',
    kadaluarsa: 'Oktober 2030',
    sumberDana: 'APBN-2025',
    tahunAnggaran: '2025',
  },
  {
    id: '113-090-001-24-03-0002',
    jenisPestisida: 'Nematisida',
    idJenis: 113,
    merek: 'Furadan 3G',
    kandungan: 'Karbofuran',
    kadaluarsa: 'Januari 2028',
    sumberDana: 'APBD-II-2024',
    tahunAnggaran: '2024',
  },
];

// --- Institution Info ---

export const INSTITUTION_INFO = {
  namaKabupaten: 'KABUPATEN TUBAN',
  namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN KABUPATEN TUBAN',
  bidang: 'BIDANG SARANA PERTANIAN',
  alamat: 'Jl. Mastrip gg. Nakula, Sidorejo, Kab. Tuban',
  singkatan: 'DKP2P KAB. TUBAN',
  logoUrl: '/images/logo-pemkab-tuban.png',
};

// --- Helper: create blank template ---

export const createBlankTemplate = (
  category: 'rak' | 'obat',
  id?: string
): LabelTemplateConfig => ({
  id: id || `tpl-${Date.now()}`,
  name: '',
  description: '',
  category,
  labelNumber: '',
  isDefault: false,
  isArchived: false,

  paper: { width: 21.5, height: 16.5, orientation: 'landscape' },
  label: { width: category === 'obat' ? 95 : 95, height: category === 'obat' ? 50 : 152 },
  labelsPerSheet: category === 'obat' ? 6 : 2,
  columns: 2,
  rows: category === 'obat' ? 3 : 1,
  margins: { top: 1, bottom: 0, left: 0.4, right: 0.4 },
  spacing: { horizontal: 0.8, vertical: 0.2 },

  content: {
    cellLayout: category === 'obat' ? '2-cell-horizontal' : '3-cell-2top-1bottom',
    qrSet: {
      qrSize: category === 'obat' ? 4 : 6.8,
      qrPosition: 'center',
      idStyle: defaultTextStyle({ fontSize: 10, bold: true, align: 'center' }),
    },
    ...(category === 'rak'
      ? {
          rakCore: {
            lokasiRak: defaultTextStyle({ fontSize: 120, bold: true, align: 'center' }),
            detailLokasi: defaultTextStyle({ fontSize: 14, align: 'center' }),
          },
        }
      : {
          obatCore: {
            jenisPestisida: defaultTextStyle({ fontSize: 12, bold: true, underline: true, align: 'left' }),
            merekObat: defaultTextStyle({ fontSize: 16, bold: true, align: 'left' }),
            kandungan: defaultTextStyle({ fontSize: 11, align: 'left' }),
            colorBlock: { enabled: true, height: 4, colors: PESTICIDE_COLORS },
            kadaluarsa: defaultTextStyle({ fontSize: 11, align: 'left' }),
            sumberDana: defaultTextStyle({ fontSize: 11, align: 'left' }),
          },
        }),
    logoSet: {
      separator: { style: 'solid', color: '#000000', thickness: 1 },
      logo: { enabled: true, url: '/images/logo-pemkab-tuban.png', width: 10, height: 12, position: 'left' },
      namaDinasText: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN KABUPATEN TUBAN',
      namaDinas: defaultTextStyle({ fontSize: 12, bold: true, allCaps: true, align: 'left' }),
      bidangText: 'BIDANG SARANA PERTANIAN',
      bidang: defaultTextStyle({ fontSize: 10, bold: true, allCaps: true, align: 'left' }),
      alamatText: 'Jl. Mastrip gg. Nakula, Sidorejo, Kab. Tuban',
      alamat: defaultTextStyle({ fontSize: 9, align: 'left' }),
      catatanTambahan: { lines: [] },
    },
  },

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
