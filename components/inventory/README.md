# Komponen Inventory - Manajemen Stok Obat Pertanian

## Overview
Koleksi komponen React untuk mengelola stok obat pertanian dengan fitur lengkap seperti search, filter, export, dan barcode printing. Dibuat dengan TypeScript, Tailwind CSS, dan mengikuti prinsip mobile-first design.

## Struktur Komponen

### 1. **InventoryPage** (`/app/[locale]/(protected)/inventory/page.tsx`)
**Halaman utama untuk manajemen inventory**

**Fitur:**
- State management lengkap untuk filtering, pagination, sorting
- Role-based access control (PPL hanya bisa view)
- Integration dengan semua komponen inventory
- Responsive design dengan sidebar yang collapsible
- Toast notifications untuk feedback user

### 2. **InventoryTable** (`inventory-table.tsx`)
**Komponen tabel data dengan sorting dan actions**

**Props:**
```typescript
interface InventoryTableProps {
  data: DrugInventory[];
  onSort?: (sorting: SortingState) => void;
  onRowClick?: (item: DrugInventory) => void;
  onEdit?: (item: DrugInventory) => void;
  onDelete?: (item: DrugInventory) => void;
  onViewBarcode?: (item: DrugInventory) => void;
  userRole: UserRole;
  loading?: boolean;
  className?: string;
}
```

**Fitur:**
- Sortable columns (nama, stok, tanggal kadaluarsa)
- Row actions dropdown (view, edit, delete, barcode)
- Loading skeleton state
- Empty state dengan ilustrasi
- Role-based action visibility

### 3. **FilterSidebar** (`filter-sidebar.tsx`)
**Sidebar filter dengan berbagai opsi filtering**

**Props:**
```typescript
interface FilterSidebarProps {
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
  categories: DrugCategory[];
  suppliers: Supplier[];
  onReset: () => void;
  className?: string;
}
```

**Fitur:**
- Filter berdasarkan kategori (checkbox)
- Filter berdasarkan supplier (checkbox)
- Filter berdasarkan status stok (checkbox)
- Range filter untuk stok (min-max)
- Date range filter untuk tanggal kadaluarsa
- Mobile-friendly dengan Sheet component
- Reset filter functionality

### 4. **InventorySearch** (`inventory-search.tsx`)
**Komponen search dengan debounced input**

**Props:**
```typescript
interface InventorySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
```

**Fitur:**
- Debounced search (300ms delay)
- Clear button
- Loading indicator saat typing
- Search icon dan placeholder yang informatif

### 5. **StatusIndicator** (`status-indicator.tsx`)
**Badge untuk menampilkan status stok**

**Props:**
```typescript
interface StatusIndicatorProps {
  status: StockStatus;
  className?: string;
}
```

**Status Types:**
- `normal`: Stok normal (hijau)
- `low`: Stok menipis (kuning/warning)
- `expired`: Kadaluarsa (merah)
- `near_expiry`: Mendekati kadaluarsa (orange)

### 6. **InventoryDetailModal** (`inventory-detail-modal.tsx`)
**Modal untuk menampilkan detail lengkap item inventory**

**Props:**
```typescript
interface InventoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DrugInventory | null;
  onEdit?: (item: DrugInventory) => void;
  onViewBarcode?: (item: DrugInventory) => void;
  userRole: UserRole;
}
```

**Fitur:**
- Informasi lengkap obat
- Format currency untuk harga
- Grouping informasi dalam sections
- Action buttons berdasarkan role
- Responsive modal design

### 7. **ExportModal** (`export-modal.tsx`)
**Modal untuk export data dengan berbagai format**

**Props:**
```typescript
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  totalRecords: number;
  filteredRecords: number;
  currentPageRecords: number;
}
```

**Format Export:**
- PDF - Laporan dalam format PDF
- Excel - Spreadsheet (.xlsx)
- CSV - Comma Separated Values
- Print - Cetak langsung

**Scope Export:**
- Current page - Data halaman saat ini
- Filtered results - Semua data hasil filter
- All data - Seluruh data dalam database

### 8. **BarcodeModal** (`barcode-modal.tsx`)
**Modal untuk generate dan print barcode**

**Props:**
```typescript
interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DrugInventory | null;
  onPrint: (options: BarcodeOptions) => void;
}
```

**Tipe Barcode:**
- **Pack**: Untuk kemasan besar (dus, karung, jerigen)
- **Item**: Untuk unit satuan obat

## Types & Interfaces

### Core Types
```typescript
// Status stok obat
type StockStatus = 'normal' | 'low' | 'expired' | 'near_expiry';

// Role pengguna
type UserRole = 'admin' | 'ppl' | 'dinas' | 'popt';

// Interface utama untuk data obat
interface DrugInventory {
  id: string;
  name: string;
  producer: string;
  content: string;
  category: DrugCategory;
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
  barcode?: string;
  status: StockStatus;
  lastUpdated: Date;
  createdBy: string;
  updatedBy?: string;
}
```

## Demo Data
File `lib/data/inventory-demo.ts` menyediakan data contoh yang lengkap dengan:
- 10 item obat dengan status berbeda-beda
- 6 kategori obat (Herbisida, Insektisida, Fungisida, dll)
- 5 supplier
- Helper functions untuk filtering data

## Styling & Responsiveness

### Mobile-First Approach
- Sidebar menjadi modal pada mobile (`lg:hidden`)
- Table responsive dengan horizontal scroll
- Button sizes menyesuaikan breakpoint
- Status indicator dengan text singkat pada mobile

### Breakpoints
- **Mobile**: `< 640px` - Stack layout, modal sidebar
- **Tablet**: `640px - 1024px` - Semi-collapsed sidebar
- **Desktop**: `> 1024px` - Full sidebar, multi-column layout

### Color Scheme
- **Normal**: `text-success` (hijau)
- **Low Stock**: `text-warning` (kuning)
- **Expired**: `text-destructive` (merah)
- **Near Expiry**: `text-orange-600` (orange)

## Best Practices Implementation

### 1. **Type Safety**
- Semua komponen menggunakan TypeScript
- Interface yang well-defined untuk props
- Type guards untuk safety checks

### 2. **Performance**
- Debounced search untuk mengurangi API calls
- Memoized computed values dengan `useMemo`
- Lazy loading dengan React.lazy (bisa ditambahkan)

### 3. **Accessibility**
- Proper ARIA labels
- Screen reader support
- Keyboard navigation support
- Focus management dalam modals

### 4. **Error Handling**
- Try-catch blocks dalam async operations
- User-friendly error messages
- Loading states untuk feedback

### 5. **Maintainability**
- Komponen modular dan reusable
- Clear separation of concerns
- Consistent naming conventions
- Comprehensive documentation

## Usage Example

```tsx
import { useState } from 'react';
import { mockInventoryData, mockCategories, mockSuppliers } from '@/lib/data/inventory-demo';
import InventoryTable from '@/components/inventory/inventory-table';

function MyInventoryPage() {
  const [data, setData] = useState(mockInventoryData);
  const userRole = 'admin';

  const handleRowClick = (item) => {
    console.log('Row clicked:', item);
  };

  return (
    <InventoryTable
      data={data}
      onRowClick={handleRowClick}
      userRole={userRole}
    />
  );
}
```

## Future Enhancements

### Tahap 1 (High Priority)
- [ ] Real API integration
- [ ] Authentication & authorization
- [ ] Bulk operations (delete, export selected)
- [ ] Advanced search with filters

### Tahap 2 (Medium Priority)
- [ ] Real barcode generation library
- [ ] PDF generation untuk export
- [ ] Image upload untuk obat
- [ ] Audit trail / activity log

### Tahap 3 (Nice to Have)
- [ ] Drag & drop file upload
- [ ] Advanced charts untuk analytics
- [ ] Notification system untuk low stock
- [ ] Mobile app dengan PWA

## Dependencies

### UI Components
- `@/components/ui/*` - Shadcn/ui components
- `@iconify/react` - Icon library
- `@tanstack/react-table` - Table functionality

### Utilities
- `date-fns` - Date formatting
- `sonner` - Toast notifications
- `class-variance-authority` - Styling variants

### Development
- `typescript` - Type safety
- `tailwindcss` - Styling
- `next.js` - Framework

## Kontributor
- **Frontend**: Mengikuti konsep yang diberikan user
- **Design System**: Menggunakan Shadcn/ui dengan custom modifications
- **Documentation**: Comprehensive documentation untuk maintainability

---

**Note**: Ini adalah implementasi frontend untuk fase pengembangan. Untuk production, pastikan untuk mengintegrasikan dengan backend API yang sesuai dan menambahkan proper authentication. 