# Process Wizard Components

Mobile-first multi-step wizard for processing obat distribution with hybrid digital-physical workflow.

## Overview

The Process Wizard implements a complete 5-step workflow for processing obat distribution from scan to final submission with mobile-optimized interface and documentation.

## Architecture

```
process-wizard/
├── wizard-layout.tsx      # Main layout with progress stepper
├── step-1-validation.tsx  # QR scan & system validation  
├── step-2-photography.tsx # Photo documentation
├── step-3-document-generation.tsx # PDF generation & printing
├── step-4-file-upload.tsx # Upload signed documents
├── step-5-submission.tsx  # Final submission & notifications
├── index.ts              # Central exports
└── README.md             # This documentation
```

## Workflow Steps

### Step 1: Validation
- **Purpose**: System validation and QR code scanning
- **Features**: 
  - System requirement checks
  - Mobile-optimized QR scanner
  - Real-time item tracking
  - Progress indicators
- **Mobile Focus**: Large scan targets, clear feedback

### Step 2: Photography  
- **Purpose**: Photo documentation of bukti serah terima
- **Features**:
  - Front/back camera switching
  - Multiple photo capture
  - Photo preview & deletion
  - Capture guidelines overlay
- **Mobile Focus**: Full-screen camera, touch-friendly controls

### Step 3: Document Generation
- **Purpose**: Generate and print Berita Acara
- **Features**:
  - PDF generation with transaction data
  - Mobile-friendly print dialog
  - Download functionality
  - Print confirmation tracking
- **Mobile Focus**: Simple print flow, clear instructions

### Step 4: File Upload
- **Purpose**: Upload signed Berita Acara
- **Features**:
  - Drag & drop file upload
  - Camera capture for documents
  - File validation & compression
  - Upload progress tracking
- **Mobile Focus**: Camera integration, touch upload

### Step 5: Submission
- **Purpose**: Final submission and notifications
- **Features**:
  - Process summary display
  - Automated notifications to Dinas/PPL
  - Status tracking
  - Completion confirmation
- **Mobile Focus**: Clear summary, single-tap submission

## Usage

### Basic Implementation

```tsx
import { WizardLayout, Step1Validation } from '@/components/transactions/process-wizard';

// Use in your page component
<WizardLayout
  steps={WIZARD_STEPS}
  currentStep={wizardState.currentStep}
  onStepClick={handleStepClick}
  onExit={handleExit}
  transaction={transaction}
>
  <Step1Validation
    transaction={transaction}
    wizardState={wizardState}
    onNext={handleNextStep}
    onUpdateState={handleWizardStateUpdate}
  />
</WizardLayout>
```

### State Management

```tsx
interface WizardState {
  currentStep: number;
  transaction: Transaction | null;
  scanResults: {
    scannedItems: Record<string, number>;
    isComplete: boolean;
    timestamp?: Date;
  };
  photoDocumentation: {
    photos: File[];
    timestamp?: Date;
  };
  documentGeneration: {
    pdfBlob: Blob | null;
    printed: boolean;
    timestamp?: Date;
  };
  fileUpload: {
    signedDocument: File | null;
    uploaded: boolean;
    timestamp?: Date;
  };
  submission: {
    submitted: boolean;
    submissionId?: string;
    timestamp?: Date;
  };
}
```

## Mobile-First Design

### Responsive Breakpoints
- **Mobile (< 640px)**: Stack layout, full-screen steps
- **Tablet (640px-1024px)**: Semi-sidebar layout
- **Desktop (> 1024px)**: Full sidebar with step navigation

### Touch Optimizations
- Large touch targets (min 44px)
- Swipe gestures for navigation
- Optimized camera controls
- Clear visual feedback

### Performance
- Lazy loading of camera streams
- Image compression for uploads
- Debounced user inputs
- Optimistic UI updates

## Integration Points

### Camera Integration
```tsx
// Camera permissions and setup
const startCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  });
};
```

### File Upload
```tsx
// File validation and upload
const validateFile = (file: File) => {
  return {
    valid: ACCEPTED_FORMATS.includes(file.type) && file.size <= MAX_FILE_SIZE,
    error: 'Format tidak didukung atau file terlalu besar'
  };
};
```

### PDF Generation
```tsx
// PDF document generation
const generatePDF = async (documentData) => {
  // In production, use jsPDF or similar
  const pdf = new jsPDF();
  pdf.text(documentContent, 10, 10);
  return pdf.output('blob');
};
```

## Error Handling

### Network Errors
- Offline mode detection
- Auto-retry mechanisms
- Local storage fallback

### Camera Errors  
- Permission handling
- Fallback to file upload
- Clear error messages

### Validation Errors
- Real-time validation
- User-friendly messages
- Clear remediation steps

## Testing Considerations

### Mobile Testing
- Various device sizes
- Different camera capabilities  
- Touch interaction testing
- Network condition simulation

### Flow Testing
- Complete workflow validation
- Error scenario handling
- State persistence testing
- Navigation edge cases

## Future Enhancements

### Planned Features
- Offline mode support
- Advanced OCR integration
- Real-time QR code scanning
- Digital signature support
- Enhanced PDF templates
- Push notifications

### Performance Optimizations
- Web Workers for heavy operations
- Service Worker caching
- Progressive Web App features
- Image optimization pipelines

## Dependencies

### Core Dependencies
- React 18+ with hooks
- Next.js 15 with App Router
- TypeScript for type safety

### UI Components
- Tailwind CSS for styling
- Radix UI components
- Lucide icons

### Camera & Files
- MediaDevices API
- File API
- Canvas API for image processing

### PDF & Printing
- jsPDF (planned)
- Browser print API
- File download utilities

## Browser Support

### Minimum Requirements
- Modern browsers with ES2018+ support
- Camera API support for mobile features
- File API support for uploads
- Print API support for documents

### Progressive Enhancement
- Fallback for older browsers
- Graceful degradation of features
- Alternative input methods

---

For implementation questions or issues, refer to the individual component documentation or contact the development team. 