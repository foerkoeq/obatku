# Template Berita Acara Serah Terima

Fitur untuk membuat dan mengelola Berita Acara Serah Terima bantuan pertanian dengan format yang sesuai dengan standar pemerintahan.

## 🚀 Fitur Utama

### 1. Template Generator
- Template berita acara yang siap cetak (A4)
- Format sesuai standar pemerintahan Indonesia
- Layout yang rapi dan professional
- Kop surat dengan logo instansi
- Tanda tangan dua pihak (Dinas dan BPP)

### 2. Form Input yang Komprehensif
- **Kop Surat**: Logo, nama instansi, alamat, kontak
- **Informasi Dokumen**: Nomor surat, tanggal dengan format Indonesia
- **Data Pihak**: Pejabat dinas dan koordinator BPP
- **Daftar Barang**: Dynamic list dengan kategori obat, OPT, merek dagang, jumlah
- **Kelompok Tani**: Data lengkap poktan dan lahan terserang
- **Narasi Kustom**: Pembukaan, penutup, dan keterangan tambahan

### 3. Manajemen Template
- Multiple template dengan pengaturan berbeda
- Template default dan custom
- Preview real-time
- Import/export template dalam format JSON
- Pengaturan print (margin, orientasi, ukuran kertas)

### 4. Utilitas dan Tools
- Auto-generate nomor surat
- Konversi tanggal ke format Indonesia (angka ke teks)
- Validasi data lengkap
- Print-optimized styling
- Export ke PDF (coming soon)

## 📁 Struktur File

```
components/berita-acara/
├── index.ts                     # Export utama
├── berita-acara-template.tsx    # Komponen template
├── berita-acara-form.tsx        # Form input data
└── logo-uploader.tsx            # Upload logo instansi

lib/types/berita-acara/
└── index.ts                     # Type definitions

lib/utils/
└── berita-acara.ts              # Utility functions

app/(dashboard)/berita-acara/
├── page.tsx                     # Halaman utama
├── settings/page.tsx            # Pengaturan template
└── test/page.tsx                # Testing & preview
```

## 🎯 Penggunaan

### Halaman Utama (`/berita-acara`)
- **Preview Mode**: Lihat hasil akhir berita acara
- **Form Edit Mode**: Input dan edit data berita acara
- Print langsung atau export PDF
- Switch antara preview dan form

### Pengaturan Template (`/berita-acara/settings`)
- Kelola multiple template
- Edit kop surat default
- Atur narasi standar (pembukaan, penutup)
- Pengaturan print (A4, margin, orientasi)
- Preview template dengan sample data

### Test & Preview (`/berita-acara/test`)
- Testing dengan berbagai variasi data
- Preview dengan data sample (pestisida, agen hayati, pesnab)
- Testing format print
- Development tools

## 📋 Format Data

### Struktur Berita Acara
```typescript
interface BeritaAcaraData {
  kopSurat: KopSurat;
  nomorSurat: string;
  namaHari: string;
  tanggal: string;
  bulan: string;
  tahun: string;
  pihakPertama: PejabatDinas;
  pihakKedua: KoordinatorBPP;
  kategoriObat: string;
  daftarBarang: BarangBantuan[];
  suratPermintaan: SuratPermintaan;
  kelompokTani: KelompokTani;
  customNarrative?: {
    pembukaan?: string;
    penutup?: string;
    keterangan?: string;
  };
}
```

### Kategori Obat yang Didukung
- **Pestisida**: Insektisida, fungisida, herbisida, dll
- **Agen Hayati**: Beauveria bassiana, Trichoderma, dll
- **Pesnab**: Pestisida nabati (nimba, tembakau, dll)
- **POC**: Pupuk Organik Cair

## 🛠️ Utility Functions

### Format Tanggal Indonesia
```typescript
formatTanggalIndonesia(new Date()) 
// Output: { namaHari: "Senin", tanggal: "Delapan", bulan: "Juli", tahun: "..." }
```

### Generate Nomor Surat
```typescript
generateNomorSurat(1, 2025) 
// Output: "001/BA-ST/414.106.3/2025"
```

### Validasi Data
```typescript
const { isValid, errors } = validateBeritaAcaraData(data);
```

### Print & Export
```typescript
printBeritaAcara(); // Print dengan styling optimal
exportAsJSON(data, "berita-acara.json"); // Export ke JSON
```

## 🎨 Styling & Print

### CSS Print Optimizations
- Font: Times New Roman 12pt (standar pemerintahan)
- Kertas: A4 Portrait dengan margin 0.5 inch
- Tabel dengan border solid hitam
- Logo auto-resize (maksimal 64x64px)
- Line spacing 1.5 untuk readability

### Responsive Design
- Desktop: Form dan preview side-by-side
- Mobile: Tab-based navigation
- Print: Full-width dengan styling khusus

## 🔧 Kustomisasi

### Template Kop Surat
- Logo instansi (upload file atau URL)
- Nama instansi dan dinas
- Alamat lengkap dengan telepon dan email
- Dapat disimpan sebagai template

### Narasi Fleksibel
- Template default untuk konsistensi
- Custom narrative untuk kasus khusus
- Placeholder untuk data dinamis
- Validasi untuk memastikan kelengkapan

### Print Settings
- Ukuran kertas (A4/Letter)
- Orientasi (Portrait/Landscape)  
- Margin custom (top, bottom, left, right)
- Preview real-time perubahan

## 📝 Best Practices

### Data Input
1. Gunakan format tanggal yang konsisten
2. Pastikan NIP format 18 digit
3. Koordinat lahan dalam format decimal degrees
4. Jumlah barang dengan satuan yang jelas

### Template Management
1. Buat template terpisah untuk setiap dinas/bidang
2. Gunakan naming convention yang jelas
3. Backup template dalam format JSON
4. Test print sebelum distribusi

### Print Quality
1. Gunakan printer laser untuk hasil terbaik
2. Print pada kertas HVS 80gsm
3. Check preview sebelum print
4. Simpan PDF untuk arsip digital

## 🚀 Future Enhancements

- [ ] Export ke PDF langsung (jsPDF integration)
- [ ] QR Code untuk verifikasi dokumen
- [ ] Digital signature integration
- [ ] Batch processing multiple berita acara
- [ ] Integration dengan database inventory
- [ ] Email automation untuk distribusi
- [ ] Audit trail dan versioning
- [ ] OCR untuk scan berita acara lama

## 📞 Support

Untuk bantuan teknis atau request fitur, silakan hubungi tim development atau buat issue di repository ini.
