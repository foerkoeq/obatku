# QR Print Modal System

## Overview

Sistem modal komprehensif untuk mencetak QR code label obat pertanian. Modal ini terintegrasi dengan inventory page dan menyediakan konfigurasi yang fleksibel untuk mencetak label QR code.

## Fitur Utama

### 1. **Multi-Step Modal**
- **Step 1**: Pengaturan cetak (Print Settings)
- **Step 2**: Preview sebelum cetak (Print Preview)
- Navigation yang mudah antara steps

### 2. **Range Configuration**
- **Semua item**: Cetak semua item yang dipilih
- **Range tanggal**: Filter berdasarkan tanggal masuk obat
- **Range ID**: Filter berdasarkan rentang ID obat (A-Z)
- **Custom ID**: Pilih ID spesifik dengan pemisah koma

### 3. **Print Settings**
- Jumlah label per item (1-10)
- Kontrol informasi yang ditampilkan:
  - Info obat (nama, produsen, kandungan)
  - Tanggal masuk & kadaluarsa
  - Lokasi penyimpanan
- Format kertas (A4, Letter)
- Orientasi (Portrait, Landscape)

### 4. **Preview System**
- Preview real-time sebelum cetak
- Zoom controls (30% - 150%)
- Pagination untuk multiple pages
- Layout grid 2x6 (12 labels per page)

## Komponen Architecture

```
QRPrintModal/
├── qr-print-modal.tsx          # Main modal container
├── qr-print-settings.tsx       # Step 1: Configuration
├── qr-print-preview.tsx        # Step 2: Preview
├── qr-range-configurator.tsx   # Range settings component
├── qr-print-modal.css          # Modal-specific styles
└── index.ts                    # Export barrel
```

## Komponen Dependencies

### External Components
- `QRLabelTemplate` dari `@/components/print/qr-label-template`
- UI components dari `@/components/ui/`
- Utility functions dari `@/lib/utils/qr-conversion`

### Types
```typescript
interface QRPrintOptions {
  rangeType: "all" | "date" | "id" | "custom";
  rangeSettings: {
    dateFrom?: Date;
    dateTo?: Date;
    idFrom?: string;
    idTo?: string;
    customIds?: string[];
  };
  printSettings: {
    labelsPerItem: number;
    includeItemInfo: boolean;
    includeDates: boolean;
    includeLocation: boolean;
    paperSize: "A4" | "Letter";
    orientation: "portrait" | "landscape";
  };
  totalLabels: number;
}
```

## Usage

### 1. Import dan Setup
```tsx
import { QRPrintModal } from "@/components/inventory";

const InventoryPage = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  return (
    <>
      {/* Your inventory UI */}
      
      <QRPrintModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        selectedItems={selectedItems}
        inventoryData={inventoryData}
      />
    </>
  );
};
```

### 2. Trigger Modal
```tsx
const handlePrintQRCodes = () => {
  if (selectedItems.length === 0) {
    toast.error('Pilih item terlebih dahulu');
    return;
  }
  setShowQRModal(true);
};
```

## Data Flow

1. **User selects items** → `selectedItems` array
2. **User clicks QR print button** → Modal opens at settings step
3. **User configures settings** → Range & print options
4. **User clicks preview** → Data filtering & preview generation
5. **User confirms print** → Browser print dialog
6. **Print completion** → Modal closes

## Range Filtering Logic

### Date Range
```typescript
const filteredByDate = medicines.filter(med => {
  const entryDate = new Date(med.entryDate);
  return entryDate >= dateFrom && entryDate <= dateTo;
});
```

### ID Range
```typescript
const filteredById = medicines.filter(med => {
  return med.id >= idFrom && med.id <= idTo;
});
```

### Custom IDs
```typescript
const filteredByCustom = medicines.filter(med => 
  customIds.includes(med.id)
);
```

## Print System

### Layout Specifications
- **Grid**: 2 columns × 6 rows = 12 labels per page
- **Paper size**: A4 (17.58cm × 22.27cm) 
- **Label size**: 7.44cm × 3.36cm
- **Gap**: 0.42cm between labels
- **Margins**: Top: 0.7cm, Right: 0.51cm, Bottom: 1.27cm, Left: 0.77cm

### CSS Print Rules
```css
@media print {
  body * { visibility: hidden; }
  .print-page, .print-page * { visibility: visible; }
  .print-page { 
    position: absolute; 
    left: 0; 
    top: 0; 
    transform: none !important; 
  }
}
```

## Customization

### Adding New Range Types
1. Update `QRPrintOptions` type
2. Add new case in `QRRangeConfigurator`
3. Implement filtering logic in `QRPrintPreview`

### Modifying Label Content
1. Update `convertDrugToMedicine` function
2. Modify `printSettings` interface
3. Update checkbox options in settings

### Styling Customization
1. Modify `qr-print-modal.css` for modal styling
2. Update `qr-label.css` for label appearance
3. Adjust print media queries as needed

## Best Practices

### Performance
- Use `useMemo` for heavy computations
- Debounce preview generation
- Lazy load heavy components

### User Experience
- Clear validation messages
- Loading states for all async operations
- Intuitive step navigation
- Responsive design

### Maintainability
- Modular component architecture
- Type-safe interfaces
- Comprehensive error handling
- Clear documentation

## Error Handling

### Validation
- Check for required fields
- Validate date ranges
- Ensure valid ID formats
- Verify data completeness

### User Feedback
```tsx
// Example error handling
const validateSettings = (options: QRPrintOptions) => {
  if (options.rangeType === "date" && !options.rangeSettings.dateFrom) {
    toast.error("Tanggal mulai harus diisi");
    return false;
  }
  return true;
};
```

## Testing

### Unit Tests
- Component rendering
- State management
- Data filtering logic
- Type validation

### Integration Tests
- Modal flow navigation
- Print functionality
- Range filtering accuracy
- Preview generation

### Manual Testing
- Cross-browser print compatibility
- Various screen sizes
- Different data scenarios
- Edge cases handling

## Future Enhancements

1. **Batch Processing**: Handle large datasets efficiently
2. **Template Customization**: Allow custom label templates
3. **Export Options**: PDF export in addition to print
4. **Print Queue**: Queue multiple print jobs
5. **Analytics**: Track print usage statistics
6. **Offline Support**: Cache data for offline printing

## Troubleshooting

### Common Issues

#### QR Codes not generating
- Check if `qrcode` package is installed
- Verify data format in `generateQRData`
- Check browser console for errors

#### Print layout broken
- Verify CSS print media queries
- Check paper size settings
- Ensure margins are correct

#### Modal not opening
- Check state management
- Verify component imports
- Check for JavaScript errors

#### Preview not updating
- Check `useMemo` dependencies
- Verify data filtering logic
- Check component re-rendering
