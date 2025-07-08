# Setup Template Berita Acara

Template berita acara serah terima telah berhasil dibuat dengan fitur lengkap dan modular. Berikut adalah panduan untuk menggunakan dan mengembangkan lebih lanjut.

## ✅ Fitur yang Telah Dibuat

### 1. Komponen Utama
- **BeritaAcaraTemplate** - Template yang siap print dengan format A4
- **BeritaAcaraForm** - Form input dengan validasi lengkap
- **LogoUploader** - Upload dan manage logo instansi

### 2. Halaman/Routes
- `/berita-acara` - Halaman utama untuk buat/edit berita acara
- `/berita-acara/settings` - Pengaturan template dan format
- `/berita-acara/test` - Testing dengan sample data

### 3. Type Definitions
- Semua interface TypeScript untuk data structure
- Validation schemas dengan Zod
- Type-safe development

### 4. Utility Functions
- Format tanggal Indonesia (angka ke teks)
- Generate nomor surat otomatis
- Validasi data lengkap
- Print optimization
- Export/import JSON

## 🚀 Cara Menggunakan

### 1. Akses Halaman Berita Acara
```
http://localhost:3000/berita-acara
```

### 2. Menu Navigasi
Menu "Dokumen" → "Berita Acara" sudah ditambahkan ke sidebar dengan submenu:
- Buat Berita Acara
- Pengaturan Template  
- Test & Preview

### 3. Workflow Penggunaan
1. **Setup Template** (settings): Konfigurasi kop surat dan narasi default
2. **Input Data** (form): Isi data pihak-pihak dan barang bantuan
3. **Preview & Print** (preview): Review dan cetak dokumen

## 🛠️ Development Setup

### Dependencies
Semua dependencies sudah tersedia di package.json:
- React Hook Form + Zod untuk form management
- Radix UI components untuk UI
- Tailwind CSS untuk styling
- Lucide React untuk icons

### File Structure
```
components/berita-acara/
├── berita-acara-template.tsx    # Template komponen
├── berita-acara-form.tsx        # Form input
├── logo-uploader.tsx            # Upload logo
├── index.ts                     # Exports
└── README.md                    # Dokumentasi

lib/types/berita-acara/
└── index.ts                     # Type definitions

lib/utils/
└── berita-acara.ts              # Utility functions

app/(dashboard)/berita-acara/
├── page.tsx                     # Main page
├── settings/page.tsx            # Settings
└── test/page.tsx                # Testing
```

## 🎯 Fitur Utama

### 1. Template Modular
- Kop surat dengan logo yang bisa diupload
- Format tanggal Indonesia yang proper
- Tabel dinamis untuk daftar barang
- Tanda tangan dua pihak dengan layout yang rapi

### 2. Form Komprehensif
- Multi-section form dengan validasi
- Dynamic array untuk daftar barang (bisa tambah/hapus)
- Auto-complete untuk dropdown
- Custom narrative yang opsional

### 3. Management Template
- Multiple template support
- Default template system
- Print settings (margin, paper size)
- Import/export template

### 4. Print & Export Ready
- CSS optimized untuk print A4
- Font Times New Roman sesuai standar
- Responsive design
- Export JSON untuk backup

## 🔧 Customization

### 1. Mengubah Kop Surat Default
Edit di `lib/utils/berita-acara.ts`:
```typescript
const defaultKopSurat = {
  namaInstansi: 'PEMERINTAH KABUPATEN TUBAN',
  namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN',
  // ... dst
};
```

### 2. Menambah Kategori Obat
Edit di `components/berita-acara/berita-acara-form.tsx`:
```typescript
const kategoriObatOptions = [
  { value: 'pestisida', label: 'Pestisida' },
  { value: 'agen hayati', label: 'Agen Hayati' },
  { value: 'pupuk', label: 'Pupuk' }, // Tambah baru
  // ... dst
];
```

### 3. Custom Print Styling
Edit CSS di `components/berita-acara/berita-acara-template.tsx` atau `lib/utils/berita-acara.ts`

## 🧪 Testing

### Sample Data
Tersedia 3 variasi sample data di `/test`:
- Sample 1: Pestisida (2 items)
- Sample 2: Agen Hayati (3 items, custom narrative)
- Sample 3: Pesnab (4 items)

### Print Testing
1. Buka halaman test
2. Pilih sample data
3. Klik "Print Test" untuk preview print

## 📋 Best Practices

### 1. Data Input
- Gunakan format NIP 18 digit
- Koordinat dalam decimal degrees
- Tanggal dalam format teks Indonesia
- Jumlah barang dengan satuan jelas

### 2. Template Management
- Buat template terpisah per bidang
- Backup template dalam JSON
- Test print sebelum distribusi resmi

### 3. Performance
- Lazy loading untuk halaman yang tidak sering digunakan
- Optimize image untuk logo
- Debounce untuk auto-save

## 🚀 Future Development

### 1. Integration Ideas
- Connect dengan database inventory
- API integration untuk data pegawai
- Email automation
- Digital signature

### 2. Enhancement Ideas
- PDF export dengan jsPDF
- Batch processing
- QR code verification
- OCR untuk scan dokumen lama

### 3. UI/UX Improvements
- Drag & drop untuk logo
- Real-time preview
- Keyboard shortcuts
- Dark mode support

## 🐛 Troubleshooting

### Common Issues

1. **Logo tidak muncul di print**
   - Pastikan image format supported (PNG, JPG, SVG)
   - Check image URL accessibility
   - Try upload file instead of URL

2. **Print layout rusak**
   - Check browser print settings
   - Ensure A4 paper size selected
   - Disable browser margins

3. **Form validation errors**
   - Check required fields
   - Ensure proper data types
   - Validate NIP format (18 digits)

4. **Performance issues**
   - Reduce image file size
   - Clear browser cache
   - Check network connectivity

## 📞 Support & Maintenance

### Development Mode
```bash
npm run dev
```

### Build Production
```bash
npm run build
npm start
```

### Linting & Formatting
```bash
npm run lint
```

Untuk bantuan lebih lanjut atau request fitur baru, silakan hubungi tim development atau buat issue di repository.
