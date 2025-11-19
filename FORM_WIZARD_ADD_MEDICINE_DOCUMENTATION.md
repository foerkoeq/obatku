# 📋 Form Wizard Add Medicine - Dokumentasi Lengkap

## 🎯 Overview

Halaman **Add Medicine** telah di-revamp menjadi **Modern Form Wizard** dengan 4 langkah yang intuitif, aesthetic, dan user-friendly. Form wizard ini dirancang untuk memaksimalkan UX dengan progress indicator yang jelas, validasi per-step, dan desain responsive yang optimal.

---

## ✨ Fitur Utama

### 🎨 **Modern & Aesthetic Design**
- **Progress Bar** dengan persentase dan indikator step yang jelas
- **Gradient Header** untuk setiap step dengan icon yang relevan
- **Smooth Transitions** dengan animasi fade-in antar step
- **Card-based Layout** dengan shadow dan border yang modern
- **Color-coded Elements** untuk feedback visual yang lebih baik

### 📱 **Fully Responsive**
- **Desktop View**: Grid 4-column untuk step indicator
- **Mobile View**: Compact stepper dengan informasi step saat ini
- **Adaptive Form Layout**: Grid responsif yang menyesuaikan screen size
- **Touch-friendly**: Button dan input yang mudah diakses di mobile

### 🔐 **Smart Validation**
- **Per-Step Validation**: Validasi hanya field yang relevan di setiap step
- **Real-time Feedback**: Error message yang jelas dan kontekstual
- **Required Field Indicators**: Tanda (*) untuk field wajib
- **Prevent Progression**: User tidak bisa next step jika ada error

### 💡 **Enhanced UX**
- **Tooltips**: Info icon dengan penjelasan untuk setiap field
- **Info Banners**: Panduan kontekstual di setiap step
- **Auto-scroll**: Smooth scroll ke top saat navigasi antar step
- **Loading States**: Feedback visual saat submit
- **Success Notification**: Toast dengan icon dan description

---

## 📐 Struktur Form Wizard

### **Step 1: Informasi Dasar** 🏥
**Icon**: `Pill` | **Warna**: Primary

**Fields:**
- ✅ **Produsen Obat** (Required)
  - Placeholder: "PT. Syngenta Indonesia"
  - Tooltip: Nama perusahaan yang memproduksi obat
  
- ✅ **Merek Obat** (Required)
  - Placeholder: "Decis 2.5 EC"
  - Tooltip: Nama merek/brand obat
  - Min: 3 karakter
  
- ✅ **Kandungan / Bahan Aktif** (Required)
  - Placeholder: "Deltamethrin 25 g/l"
  - Tooltip: Kandungan bahan aktif dan konsentrasinya
  - Grid: Full width (col-span-2)
  
- ✅ **Kategori Obat** (Required)
  - Type: Fixed Dropdown
  - Options: Insektisida, Moluskisida, Herbisida, Rodentisida, Fungisida, Pestisida Nabati, Agen Hayati (Antagonis), Agen Hayati (Predator), Lainnya
  - Tooltip: Jenis kategori pestisida
  
- ✅ **Sumber** (Required)
  - Type: Fixed Dropdown
  - Options: APBD, APBD I, APBD II, APBN, Dinas Pertanian Prov. Jatim, Dinas Perkebunan Prov. Jatim, Kementerian Pertanian, CSR
  - Tooltip: Sumber pendanaan atau asal obat

---

### **Step 2: Kuantitas & Stok** 📦
**Icon**: `Package` | **Warna**: Primary

**Fields:**
- ✅ **Tanggal Masuk** (Required)
  - Type: Date Picker
  - Default: Today
  - Tooltip: Tanggal obat masuk ke gudang/inventory

- 🔄 **Multi-Batch Manager** (Required, Min: 1 batch)
  - **Komponen**: `MultiDateExpiryManager`
  - **Features**:
    - ➕ Tambah batch baru untuk tanggal kadaluarsa berbeda
    - 🗑️ Hapus batch (minimal 1 batch harus ada)
    - 📊 Total stok otomatis dihitung
    - 🎯 Batch indicator dengan nomor urut
  
  **Per Batch:**
  - ✅ **Jumlah Stok Satuan** (Required, Min: 1)
  - ✅ **Satuan** (Required, Dropdown dengan 8 opsi default)
  - 📝 **Harga per Satuan** (Optional)
  - 📦 **Jumlah Kemasan Besar** (Optional)
  - 📦 **Satuan Kemasan Besar** (Optional, Dropdown dengan 7 opsi default)
  - 📦 **Jumlah Satuan per Kemasan** (Optional, Default: 1)
  - ✅ **Tanggal Kadaluarsa** (Required, Date Picker)

**Satuan Options (dapat ditambah):**
- kg, liter, botol, sachet, pack, jurigen, kotak, pcs

**Kemasan Besar Options (dapat ditambah):**
- Dus, Box, Karton, Drum, Pack, Bundle, Krat

---

### **Step 3: OPT & Komoditas** 🐛
**Icon**: `Bug` | **Warna**: Primary

**Fields:**
- ✅ **Jenis OPT yang Dikendalikan** (Required, Min: 1)
  - **Komponen**: `TagInput`
  - **Features**:
    - 🏷️ Tag dengan warna berbeda (menggunakan Badge component)
    - ⌨️ Input dengan Enter atau koma (,) untuk tambah tag
    - ❌ Remove tag dengan button X
    - 📊 Max: 20 tags
  - Contoh: Wereng Batang Coklat, Penggerek Batang Padi, Ulat Grayak

- ✅ **Sasaran Komoditas** (Required, Min: 1 selected)
  - **Komponen**: `CommodityDosageManager`
  - **Features**:
    - ☑️ Checkbox untuk memilih komoditas
    - 🎨 Card dengan border highlight saat dipilih
    - ➕ Tambah komoditas custom (opsi "Lainnya")
    - 📊 Counter jumlah komoditas terpilih
  
  **Default Commodities:**
  - Padi, Jagung, Cabai, Melon, Tembakau
  
  **Informasi Dosis per Komoditas** (untuk yang dipilih):
  - ✅ **Jumlah Dosis** (Required, Number)
  - ✅ **Satuan Dosis** (Required, Text input)
    - Contoh: ml, gram, liter
  - ✅ **Luas Lahan (ha)** (Required, Number)

---

### **Step 4: Lokasi & Foto** 📸
**Icon**: `FileImage` | **Warna**: Primary

**Fields:**
- 🏢 **Multi-Location Storage Manager** (Required, Min: 1 location)
  - **Komponen**: `MultiLocationStorageManager`
  - **Features**:
    - ➕ Tambah lokasi penyimpanan multiple
    - 🗑️ Hapus lokasi (minimal 1 harus ada)
    - 📍 Location indicator dengan nomor urut
    - 📊 Summary path (Gudang → Area → Rak)
    - ➕ Tambah opsi baru untuk Gudang, Area, atau Rak via dialog
  
  **Per Location:**
  - ✅ **Lokasi Gudang** (Required, Dropdown)
    - Default: Gudang A, B, C, Gudang Utama
  - ✅ **Tempat Penyimpanan** (Required, Dropdown)
    - Default: Area 1, 2, 3, Area Khusus
  - ✅ **Rak Penyimpanan** (Required, Dropdown)
    - Default: Rak 1, 2, 3, 4, 5

- 📝 **Catatan Tambahan** (Optional)
  - Type: Textarea
  - Min Height: 100px
  - Placeholder: "Tambahkan catatan khusus, instruksi penyimpanan, atau informasi penting lainnya..."
  - Description: "Opsional - Informasi tambahan yang perlu diketahui"

- 📷 **Foto Obat** (Optional)
  - **Komponen**: `ImageUpload`
  - **Specs**:
    - Max Files: 5
    - Max Size: 5MB per file
    - Format: image/* (JPG, PNG, GIF)
    - Preview dengan thumbnail
  - Description: "Format yang didukung: JPG, PNG, GIF. Maksimal 5 foto."

---

## 🎨 Component Architecture

### **New Components Created:**

#### 1. **FormWizardStepper** (`components/form/form-wizard-stepper.tsx`)
```typescript
interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}
```
- **Desktop View**: Grid dengan 4 cards untuk setiap step
- **Features**:
  - Progress bar dengan persentase
  - Step indicator dengan check icon untuk completed steps
  - Click navigation (jika diaktifkan)
  - Current step highlight dengan badge "Current"
  - Color coding: Primary (current), Success (completed), Muted (upcoming)

**Compact Version** (`FormWizardStepperCompact`):
- **Mobile View**: Single card dengan info step saat ini
- Progress bar dengan persentase
- Step counter (1/4, 2/4, dst)

---

#### 2. **MultiDateExpiryManager** (`components/form/multi-date-expiry-manager.tsx`)
```typescript
interface ExpiryBatch {
  id: string;
  expiryDate: Date | null;
  quantity: number;
  unit: string;
  largePackQuantity?: number;
  largePackUnit?: string;
  itemsPerLargePack?: number;
  pricePerUnit?: number;
}
```
- **Features**:
  - Dynamic batch management
  - Total quantity calculator
  - Batch number indicator
  - Delete button (disabled jika hanya 1 batch)
  - Grid responsive untuk form fields
  - Section untuk large pack dengan background muted

---

#### 3. **CommodityDosageManager** (`components/form/commodity-dosage-manager.tsx`)
```typescript
interface CommodityDosage {
  commodity: string;
  selected: boolean;
  dosageAmount: number;
  dosageUnit: string;
  landArea: number;
}
```
- **Features**:
  - Checkbox selection dengan card highlight
  - Default commodities + custom commodity support
  - Selected counter
  - Dynamic dosage form untuk selected commodities
  - Card dengan border-left primary untuk dosage info

---

#### 4. **MultiLocationStorageManager** (`components/form/multi-location-storage-manager.tsx`)
```typescript
interface StorageLocation {
  id: string;
  warehouse: string;
  storageArea: string;
  rack: string;
}
```
- **Features**:
  - Multiple location support
  - Dropdowns dengan opsi tambah baru via Dialog
  - Location summary path
  - Delete button (disabled jika hanya 1 location)
  - Dynamic options management

---

## 🎯 Navigation Flow

```
┌─────────────────────────────────────────────────────┐
│  [Breadcrumb: Home > Inventory > Add]               │
│  [Button: Kembali ke Inventory]                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Tambah Obat Baru                                   │
│  Gunakan form wizard di bawah untuk menambahkan... │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  [Progress Bar: 0% - 100%]                          │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │Step 1│  │Step 2│  │Step 3│  │Step 4│           │
│  └──────┘  └──────┘  └──────┘  └──────┘           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  [Card Header: Icon + Title + Description]          │
│  ┌───────────────────────────────────────────────┐ │
│  │ [Info Banner: Panduan untuk step ini]        │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Form Fields dengan Tooltips & Validation]        │
│                                                     │
│  ┌─────────────┐              ┌─────────────────┐ │
│  │ Batal/Back  │              │ Next/Save       │ │
│  └─────────────┘              └─────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Validation Strategy

### **Per-Step Validation:**
```typescript
Step 1: ["producer", "name", "content", "category", "sumber"]
Step 2: ["entryDate", "batches"]
Step 3: ["targetPest", "commodities"]
Step 4: ["storageLocations"]
```

### **Validation Rules:**
- ✅ Required fields must be filled
- ✅ Min/max length validation
- ✅ Number validation (min, max, step)
- ✅ Date validation
- ✅ Array validation (min items)
- ✅ Custom refine validation untuk complex rules

### **Error Handling:**
- 🚫 Block navigation jika ada error
- 📢 Toast notification "Mohon lengkapi semua field yang wajib diisi"
- 🎯 Error message di bawah field yang bermasalah
- 🔴 Field highlight dengan border merah

---

## 📱 Responsive Breakpoints

### **Desktop (md+):**
- Grid 2-column untuk form fields
- Grid 4-column untuk step indicator
- Full wizard stepper dengan semua steps visible

### **Mobile (<md):**
- Grid 1-column untuk form fields
- Compact stepper (current step only)
- Stack navigation buttons

### **Touch Optimization:**
- Button size minimal 44x44px
- Adequate spacing antar elements
- Large tap targets untuk checkbox & radio

---

## 🎨 Color Scheme

### **Status Colors:**
- **Current Step**: `border-primary bg-primary/5 text-primary`
- **Completed Step**: `border-success bg-success/5 text-success`
- **Upcoming Step**: `border-default-200 bg-default-50 text-muted-foreground`

### **UI Elements:**
- **Info Banner**: `bg-primary/5 border-primary/20`
- **Card Header**: `bg-gradient-to-r from-primary/5 to-primary/10`
- **Batch/Location Card**: `border-l-4 border-l-primary`
- **Muted Section**: `bg-muted/50`

---

## 🚀 API Integration

### **Endpoints Used:**
```typescript
// Create medicine
inventoryService.createMedicine(medicineData)

// Upload images
inventoryService.uploadMedicineImage(medicineId, imageFile)

// Create stock batch
inventoryService.createStock(stockData)
```

### **Data Transformation:**
```typescript
// Medicine Data
{
  name: data.name,
  genericName: data.producer,
  categoryId: data.category,
  supplierId: data.sumber,
  description: data.notes,
  activeIngredient: data.content,
  // ... other fields
}

// Stock Data (per batch)
{
  medicineId: response.data.id,
  batchNumber: batch.id,
  quantity: batch.quantity,
  expiryDate: batch.expiryDate.toISOString(),
  location: locations.join("; "),
  // ... other fields
}
```

---

## ✅ Best Practices Implemented

### **1. Component Modularity:**
- ✅ Reusable wizard stepper
- ✅ Standalone batch manager
- ✅ Independent commodity manager
- ✅ Separate location manager
- ✅ Each component self-contained

### **2. Type Safety:**
- ✅ TypeScript interfaces untuk semua data structures
- ✅ Zod schema untuk runtime validation
- ✅ Type inference dari schema
- ✅ Proper typing untuk form data

### **3. User Experience:**
- ✅ Clear visual hierarchy
- ✅ Contextual help (tooltips)
- ✅ Progress indication
- ✅ Error prevention
- ✅ Success feedback
- ✅ Loading states

### **4. Performance:**
- ✅ Conditional rendering
- ✅ Memoization ready (dapat ditambahkan useMemo/useCallback)
- ✅ Lazy validation (per-step)
- ✅ Debounced inputs (dapat ditambahkan)

### **5. Accessibility:**
- ✅ Semantic HTML
- ✅ ARIA labels (via shadcn/ui)
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader friendly

---

## 🔧 Customization Guide

### **Add New Step:**
```typescript
// 1. Add to wizardSteps array
const wizardSteps: WizardStep[] = [
  // ... existing steps
  {
    id: 5,
    title: "New Step",
    description: "Description",
    icon: <IconComponent className="w-6 h-6" />,
  },
];

// 2. Add validation schema
const addMedicineSchema = z.object({
  // ... existing fields
  newStepField: z.string().min(1, "Required"),
});

// 3. Add case in renderStepContent()
case 5:
  return <YourNewStepContent />;

// 4. Add to handleNext validation
case 5:
  fieldsToValidate = ["newStepField"];
  break;
```

### **Modify Step Content:**
```typescript
// Edit renderStepContent() → case X
case 1:
  return (
    <div className="space-y-6">
      {/* Add or modify fields here */}
    </div>
  );
```

### **Change Color Scheme:**
```typescript
// Modify color variants in:
// - FormWizardStepper component
// - Info banners (bg-primary/5)
// - Card headers (bg-gradient-to-r)
// - Badges and indicators
```

---

## 📝 Maintenance Notes

### **Dependencies:**
```json
{
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@hookform/resolvers": "^3.x",
  "sonner": "^1.x",
  "lucide-react": "^0.x",
  "date-fns": "^2.x"
}
```

### **Component Dependencies:**
- shadcn/ui components (Button, Card, Input, Select, etc.)
- Custom form components (TagInput, ImageUpload, etc.)
- Site components (SiteBreadcrumb)

### **Future Enhancements:**
- [ ] Add autosave functionality
- [ ] Add draft support
- [ ] Add batch import via CSV
- [ ] Add barcode scanner integration
- [ ] Add duplicate detection
- [ ] Add advanced search untuk existing items
- [ ] Add history/audit trail

---

## 🎉 Summary

Form Wizard Add Medicine telah berhasil di-revamp dengan:
- ✅ **4 Step** yang jelas dan terstruktur
- ✅ **Modern & Aesthetic** design dengan gradient, shadow, dan animations
- ✅ **Fully Responsive** untuk desktop dan mobile
- ✅ **Enhanced UX** dengan tooltips, info banners, dan progress indicator
- ✅ **Smart Validation** per-step dengan error handling
- ✅ **Modular Components** yang reusable dan maintainable
- ✅ **Type-safe** dengan TypeScript dan Zod
- ✅ **Best Practices** implementation

**File Structure:**
```
app/(dashboard)/inventory/add/
  └── page.tsx                              # Main wizard page (REVAMPED)

components/form/
  ├── form-wizard-stepper.tsx               # NEW: Wizard stepper component
  ├── multi-date-expiry-manager.tsx         # NEW: Batch manager component
  ├── commodity-dosage-manager.tsx          # NEW: Commodity selector component
  ├── multi-location-storage-manager.tsx    # NEW: Location manager component
  ├── tag-input.tsx                         # EXISTING: Tag input component
  ├── image-upload.tsx                      # EXISTING: Image upload component
  └── index.ts                              # UPDATED: Export all components
```

---

**Created by**: AI Assistant
**Date**: November 17, 2025
**Version**: 2.0.0 (Form Wizard Edition)
