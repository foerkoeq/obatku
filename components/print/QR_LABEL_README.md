# QR Label Template Documentation

Template label QR code untuk obat yang siap cetak pada stiker label no 121.

## Spesifikasi Template

### Ukuran Kertas dan Label
- **Ukuran Kertas**: 17.58cm × 22.27cm
- **Ukuran Label**: 7.44cm × 3.36cm  
- **Layout**: 2 kolom × 6 baris = 12 label per halaman
- **Jarak antar label**: 0.42cm
- **Margin**: Top 0.7cm, Right 0.51cm, Bottom 1.27cm, Left 0.77cm

### Struktur Label

#### 1. Bagian Kiri (Informasi Obat)
- **Nama Produk** - Font bold, 9pt
- **Nama Produsen** - Font regular, 7pt  
- **Kandungan Aktif** - Font regular, 7pt
- **Sumber/Supplier** - Font regular, 7pt (contoh: APBN-2024, APBD-2024, CSR PT. A-2024)

#### 2. Bagian Kanan (QR Code)
- **QR Code** - 70pt × 70pt
- **ID Obat** - Font 6pt, di bawah QR code untuk antisipasi gagal scan

#### 3. Bagian Bawah (Footer)
- **Garis Pembatas** - Line horizontal untuk kerapihan
- **Bagian Kiri Footer**:
  - Masuk (tanggal) - Font 6pt
  - Kadaluarsa (tanggal) - Font 6pt
- **Bagian Kanan Footer**:
  - Lokasi obat - Font 6pt

## Komponen Utama

### 1. QRLabelTemplate
```tsx
import { QRLabelTemplate, MedicineData } from '@/components/print';

const medicines: MedicineData[] = [
  {
    id: 'MED001',
    name: 'Paracetamol 500mg',
    producer: 'PT. Kimia Farma',
    activeIngredient: 'Paracetamol',
    source: 'APBN-2024',
    entryDate: '2024-01-15',
    expiryDate: '2025-01-15',
    location: 'Rak A-1'
  }
];

<QRLabelTemplate medicines={medicines} />
```

### 2. QRLabelPreview
Komponen preview dengan kontrol untuk debugging dan print:
```tsx
<QRLabelPreview 
  medicines={medicines}
  onPrint={() => console.log('Printing...')}
/>
```

### 3. QRLabelForm
Form input untuk mengelola data obat:
```tsx
<QRLabelForm 
  onMedicinesChange={setMedicines}
  initialMedicines={medicines}
/>
```

## Interface Data

```typescript
interface MedicineData {
  id: string;                    // ID unik obat
  name: string;                  // Nama produk obat
  producer: string;              // Nama produsen/manufacturer
  activeIngredient: string;      // Kandungan aktif
  source: string;               // Sumber dana (APBN/APBD/CSR)
  entryDate: string;            // Tanggal masuk (ISO format)
  expiryDate: string;           // Tanggal kadaluarsa (ISO format)
  location: string;             // Lokasi penyimpanan
}
```

## Utility Functions

### 1. generateQRData
Menghasilkan data QR code dari informasi obat:
```typescript
const qrData = generateQRData(medicine);
```

### 2. validateMedicineData
Validasi data obat sebelum generate label:
```typescript
const { isValid, errors } = validateMedicineData(medicine);
```

### 3. formatSource
Format string sumber dana:
```typescript
const source = formatSource('APBN', 2024); // "APBN-2024"
const sourceCsr = formatSource('CSR', 2024, 'PT. ABC'); // "CSR PT. ABC-2024"
```

### 4. chunkMedicinesForPages
Bagi data obat ke halaman-halaman (12 per halaman):
```typescript
const pages = chunkMedicinesForPages(medicines);
```

### 5. generateTestMedicines
Generate data test untuk development:
```typescript
const testData = generateTestMedicines(12);
```

## Cara Penggunaan

### 1. Import Komponen
```tsx
import { 
  QRLabelTemplate, 
  QRLabelPreview, 
  QRLabelForm,
  MedicineData 
} from '@/components/print';
```

### 2. Setup Data
```tsx
const [medicines, setMedicines] = useState<MedicineData[]>([]);
```

### 3. Render Komponen
```tsx
<QRLabelForm onMedicinesChange={setMedicines} />
<QRLabelPreview medicines={medicines} />
```

## Print Setup

### 1. Browser Print Settings
- **Paper Size**: Custom atau A4
- **Margins**: Minimum atau None
- **Scale**: 100%
- **Background Graphics**: Enabled

### 2. CSS Print Rules
Template sudah termasuk `@media print` rules untuk:
- Hide kontrol UI saat print
- Optimasi warna dan border
- Page break handling
- Exact sizing

### 3. Export PDF
Gunakan browser "Print to PDF" atau library seperti Puppeteer untuk generate PDF.

## Troubleshooting

### 1. QR Code Tidak Muncul
- Pastikan package `qrcode` sudah terinstall
- Check data ID obat tidak kosong
- Pastikan JavaScript enabled

### 2. Layout Tidak Sesuai
- Check CSS import di file utama
- Verifikasi ukuran container
- Gunakan showGrid={true} untuk debugging

### 3. Print Tidak Akurat
- Set printer margin ke minimum
- Gunakan scale 100%
- Check paper size setting
- Test print pada kertas biasa dulu

## Dependencies

```json
{
  "qrcode": "^1.5.3",
  "@types/qrcode": "^1.5.2"
}
```

## Browser Support

- Chrome 80+ ✅
- Firefox 75+ ✅  
- Safari 13+ ✅
- Edge 80+ ✅

Template telah dioptimalkan untuk kompatibilitas maksimum dengan browser modern dan printer standar.
