# Add Medicine Form Documentation

## Overview
Halaman tambah obat adalah komponen form yang komprehensif untuk menambahkan obat pertanian baru ke dalam sistem inventory. Form ini dirancang dengan pendekatan mobile-first, validasi client-side yang ketat, dan dokumentasi lengkap sesuai spesifikasi proyek.

## Components Structure

### Main Components
1. **AddMedicinePage** (`app/[locale]/(protected)/inventory/add/page.tsx`)
   - Main page component untuk form tambah obat
   - Menangani routing, authorization, dan form submission

2. **useAddMedicineForm** (`hooks/use-add-medicine-form.ts`)
   - Custom hook untuk mengelola state dan logic form
   - Menyediakan validasi, submission handler, dan utilities

3. **MedicineFormSections** (`components/form/medicine-form-sections.tsx`)
   - Komponen modular untuk section-section form
   - Memisahkan form menjadi bagian-bagian yang dapat digunakan kembali

4. **DatePicker** (`components/ui/date-picker.tsx`)
   - Komponen date picker yang terintegrasi dengan calendar
   - Digunakan untuk tanggal masuk dan expired

## Form Fields

### Basic Information Section
- **Nama Obat** (required) - Text input dengan validasi minimal 3 karakter
- **Produsen** (required) - Text input untuk nama produsen obat
- **Kandungan** (required) - Text input untuk bahan aktif dan konsentrasi
- **Kategori Obat** (required) - Dropdown dengan pilihan kategori obat
- **Supplier** (required) - Dropdown dengan pilihan supplier

### Stock Information Section
- **Jumlah Stok Awal** (required) - Number input untuk stok awal
- **Satuan** (required) - Dropdown dengan pilihan satuan (kg, liter, botol, dll)
- **Harga per Unit** (optional) - Number input untuk harga

### Large Pack Information Section
- **Jumlah Kemasan Besar** - Number input untuk jumlah kemasan
- **Satuan Kemasan Besar** - Dropdown untuk satuan kemasan (dus, box, karton, dll)
- **Jumlah per Kemasan** - Number input untuk isi per kemasan

### Date Information Section
- **Tanggal Masuk** (required) - Date picker untuk tanggal masuk
- **Tanggal Expired** (required) - Date picker untuk tanggal expired

### Additional Information Section
- **Jenis OPT** (required) - Text input untuk target organisme pengganggu tumbuhan
- **Lokasi Penyimpanan** (required) - Text input untuk lokasi gudang
- **Catatan/Deskripsi** (optional) - Textarea untuk catatan tambahan

## Validation Rules

### Client-Side Validation
1. **Required Fields**
   - Nama obat, produsen, kandungan wajib diisi
   - Kategori dan supplier wajib dipilih
   - Stok awal, satuan, tanggal wajib diisi
   - Jenis OPT dan lokasi penyimpanan wajib diisi

2. **Format Validation**
   - Nama obat minimal 3 karakter
   - Stok dan harga tidak boleh negatif
   - Tanggal expired harus lebih dari tanggal masuk
   - Jumlah per kemasan minimal 1

3. **Business Rules**
   - Tanggal masuk tidak boleh di masa depan
   - Tanggal expired harus di masa depan
   - Target pest dipisahkan dengan koma untuk multiple values

### Server-Side Validation
- Validasi duplikasi nama obat
- Validasi ketersediaan kategori dan supplier
- Validasi authorization berdasarkan user role

## User Role Access

### Admin
- Akses penuh ke semua fitur form
- Dapat menambah, edit, dan hapus obat

### Dinas Pertanian & POPT
- Dapat menambah dan edit obat
- Akses ke semua field form

### PPL (Penyuluh Pertanian Lapangan)
- **TIDAK MEMILIKI AKSES** ke form tambah obat
- Redirect ke halaman inventory dengan pesan error

## Mobile-First Design

### Responsive Breakpoints
- **Mobile** (< 640px): Single column layout, full-width buttons
- **Tablet** (640px - 1024px): Two-column grid untuk beberapa field
- **Desktop** (> 1024px): Multi-column layout dengan spacing optimal

### Touch-Friendly Elements
- Minimum 44px touch target untuk buttons
- Adequate spacing between form fields
- Large dropdown dan date picker untuk mobile

## Error Handling

### Form Validation Errors
- Real-time validation saat user mengetik
- Error messages yang jelas dan actionable
- Visual indicators (red border, icon) untuk field error

### API Errors
- Toast notification untuk error network
- Retry mechanism untuk failed submissions
- Graceful degradation untuk offline state

### Authorization Errors
- Redirect ke halaman inventory untuk unauthorized users
- Clear error message untuk role restrictions

## Success Handling

### Successful Submission
- Toast notification dengan success message
- Automatic redirect ke halaman inventory
- Clear indication bahwa data telah tersimpan

### Loading States
- Button disabled dengan loading spinner
- Form fields disabled during submission
- Visual feedback untuk user bahwa proses sedang berjalan

## Performance Optimizations

### Form Performance
- Debounced validation untuk expensive operations
- Memoized components untuk prevent unnecessary re-renders
- Optimized re-renders dengan React.memo

### Data Loading
- Lazy loading untuk dropdown options
- Cached category dan supplier data
- Optimistic updates untuk better UX

## Accessibility

### ARIA Support
- Proper ARIA labels untuk form fields
- Error announcements untuk screen readers
- Keyboard navigation support

### Focus Management
- Logical tab order
- Focus trapping dalam modals
- Clear focus indicators

## Testing Strategy

### Unit Tests
- Form validation logic
- Custom hooks functionality
- Component rendering

### Integration Tests
- Form submission flow
- Error handling scenarios
- User role authorization

### E2E Tests
- Complete add medicine workflow
- Mobile responsive behavior
- Cross-browser compatibility

## Development Guidelines

### Code Documentation
- Setiap komponen dan fungsi memiliki dokumentasi header
- TypeScript interfaces untuk semua props
- Clear naming conventions

### Maintainability
- Modular component structure
- Separated concerns (validation, API calls, UI)
- Reusable utility functions

### Future Enhancements
- File upload untuk gambar obat
- Barcode scanner integration
- Bulk import functionality
- Advanced search dan filter options

## API Integration

### Endpoints
- `POST /api/medicines` - Create new medicine
- `GET /api/categories` - Fetch medicine categories
- `GET /api/suppliers` - Fetch supplier list

### Data Format
```typescript
interface MedicineCreateRequest {
  name: string;
  producer: string;
  content: string;
  categoryId: string;
  supplier: string;
  stock: number;
  unit: string;
  largePack: {
    quantity: number;
    unit: string;
    itemsPerPack: number;
  };
  entryDate: Date;
  expiryDate: Date;
  pricePerUnit?: number;
  targetPest: string[];
  storageLocation: string;
  notes?: string;
}
```

## Security Considerations

### Input Sanitization
- XSS protection untuk text inputs
- SQL injection prevention
- Input length limitations

### Authorization
- JWT token validation
- Role-based access control
- Session management

## Browser Support
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement untuk older browsers 