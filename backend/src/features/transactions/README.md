# Transaction System Module Documentation

## Overview

The Transaction System Module adalah komponen komprehensif yang mengelola seluruh proses distribusi obat pertanian dengan dukungan untuk multiple sources (PPL, POPT, Dinas) dan workflow approval yang fleksibel.

## Features

### 🎯 Core Features
- **Multiple Transaction Sources**: PPL Submission, POPT Request, Dinas Directive, Emergency Response
- **Flexible Workflow**: Conditional approval requirements based on source
- **Stock Integration**: Real-time stock validation and automatic updates
- **Document Management**: Support untuk surat permintaan, surat jalan, bukti terima
- **QR Code Tracking**: Integration dengan QR code system untuk tracking item
- **Activity Logging**: Comprehensive audit trail untuk semua aktivitas

### 🔄 Transaction Sources & Rules

| Source | Request Letter Required | Auto Approval | Description |
|--------|------------------------|---------------|-------------|
| PPL Submission | ✅ Yes | ❌ No | Traditional submission dari PPL dengan surat permintaan |
| POPT Request | ❌ No | ❌ No | Permintaan langsung dari POPT |
| Dinas Directive | ❌ No | ✅ Optional | Perintah langsung dari Dinas |
| Emergency Response | ❌ No | ⚡ Fast Track | Tanggap darurat dengan prioritas tinggi |

### 📊 Transaction Statuses
- `PENDING` - Menunggu persetujuan
- `APPROVED` - Disetujui, siap diproses
- `IN_PROGRESS` - Sedang diproses/distribusi
- `COMPLETED` - Selesai dengan bukti terima
- `CANCELLED` - Dibatalkan
- `REJECTED` - Ditolak dengan alasan

## API Endpoints

### Transaction Management
```typescript
GET    /api/v1/transactions                    // List all transactions
POST   /api/v1/transactions                    // Create new transaction
GET    /api/v1/transactions/:id               // Get transaction by ID
PUT    /api/v1/transactions/:id               // Update transaction
GET    /api/v1/transactions/number/:number    // Get by transaction number
```

### Workflow Actions
```typescript
POST   /api/v1/transactions/:id/approve       // Approve transaction
POST   /api/v1/transactions/:id/reject        // Reject transaction
POST   /api/v1/transactions/:id/process       // Start processing
POST   /api/v1/transactions/:id/complete      // Complete transaction
POST   /api/v1/transactions/:id/cancel        // Cancel transaction
```

### Specialized Endpoints
```typescript
GET    /api/v1/transactions/summary           // Get statistics
GET    /api/v1/transactions/my-transactions   // User's transactions
GET    /api/v1/transactions/pending-approvals // Pending approvals
GET    /api/v1/transactions/:id/activities    // Transaction history
```

### Document Management
```typescript
POST   /api/v1/transactions/:id/upload        // Upload documents
GET    /api/v1/transactions/:id/documents/:docId // Download document
```

## Usage Examples

### 1. Create PPL Submission Transaction
```typescript
const pplTransaction = {
  type: 'submission_based',
  source: 'ppl_submission',
  submissionId: 'sub-123',
  targetDistrict: 'Sleman',
  targetPIC: 'Budi Santoso',
  requestLetter: 'surat-permintaan.pdf',
  items: [
    {
      medicineId: 'med-456',
      requestedQuantity: 50
    }
  ]
};

const response = await fetch('/api/v1/transactions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(pplTransaction)
});
```

### 2. Create POPT Direct Request
```typescript
const poptRequest = {
  type: 'direct_request',
  source: 'popt_request',
  targetDistrict: 'Bantul',
  targetPIC: 'Sari Indah',
  priority: 2,
  isUrgent: true,
  items: [
    {
      medicineId: 'med-789',
      requestedQuantity: 25
    }
  ]
  // No requestLetter required for POPT
};
```

### 3. Approve Transaction with Adjustments
```typescript
const approval = {
  approvalNotes: 'Disetujui dengan penyesuaian quantity',
  itemAdjustments: [
    {
      transactionItemId: 'item-123',
      approvedQuantity: 40, // Reduced from 50
      adjustmentReason: 'Stock terbatas'
    }
  ]
};

await fetch(`/api/v1/transactions/${transactionId}/approve`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + dinasToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(approval)
});
```

### 4. Process Transaction with QR Codes
```typescript
const processing = {
  items: [
    {
      transactionItemId: 'item-123',
      processedQuantity: 40,
      qrCodes: ['25071F111B0001', '25071F111B0002'],
      batchNumbers: ['BATCH001'],
      expiryDates: ['2025-12-31T00:00:00.000Z']
    }
  ],
  deliveryNote: 'DN-2025-001',
  notes: 'Dikirim via pickup'
};
```

## Database Schema

### Core Tables
```sql
-- Main transaction table
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('submission_based', 'direct_request', 'administrative', 'emergency', 'stock_transfer', 'adjustment') NOT NULL,
  source ENUM('ppl_submission', 'popt_request', 'dinas_directive', 'admin_action', 'emergency_response') NOT NULL,
  status ENUM('pending', 'approved', 'in_progress', 'completed', 'cancelled', 'rejected') NOT NULL DEFAULT 'pending',
  
  -- References
  submission_id VARCHAR(36),
  approval_id VARCHAR(36),
  parent_transaction_id VARCHAR(36),
  
  -- Requestor info
  requested_by VARCHAR(36) NOT NULL,
  requested_by_role VARCHAR(20) NOT NULL,
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Target info
  target_district VARCHAR(100),
  target_sub_district VARCHAR(100),
  target_village VARCHAR(100),
  target_address TEXT,
  target_contact VARCHAR(100),
  target_pic VARCHAR(100),
  
  -- Processing info
  processed_by VARCHAR(36),
  processed_at TIMESTAMP NULL,
  completed_by VARCHAR(36),
  completed_at TIMESTAMP NULL,
  
  -- Approval info
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  rejected_by VARCHAR(36),
  rejected_at TIMESTAMP NULL,
  rejection_reason TEXT,
  
  -- Documents
  request_letter VARCHAR(255),
  delivery_note VARCHAR(255),
  receiving_proof VARCHAR(255),
  additional_documents JSON,
  
  -- Delivery info
  delivery_method VARCHAR(50),
  delivery_date DATE,
  delivery_address TEXT,
  delivery_notes TEXT,
  
  -- Financial
  total_value DECIMAL(15,2),
  shipping_cost DECIMAL(15,2),
  additional_costs DECIMAL(15,2),
  
  -- System fields
  notes TEXT,
  metadata JSON,
  priority INT DEFAULT 3,
  is_urgent BOOLEAN DEFAULT FALSE,
  is_emergency BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_requested_by (requested_by),
  INDEX idx_target_district (target_district),
  INDEX idx_created_at (created_at),
  INDEX idx_transaction_number (transaction_number)
);

-- Transaction items
CREATE TABLE transaction_items (
  id VARCHAR(36) PRIMARY KEY,
  transaction_id VARCHAR(36) NOT NULL,
  medicine_id VARCHAR(36) NOT NULL,
  requested_quantity INT NOT NULL,
  approved_quantity INT,
  processed_quantity INT,
  unit_price DECIMAL(15,2),
  total_price DECIMAL(15,2),
  notes TEXT,
  qr_codes JSON,
  batch_numbers JSON,
  expiry_dates JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_medicine_id (medicine_id)
);

-- Stock movements
CREATE TABLE stock_movements (
  id VARCHAR(36) PRIMARY KEY,
  transaction_item_id VARCHAR(36) NOT NULL,
  medicine_id VARCHAR(36) NOT NULL,
  movement_type ENUM('out', 'in', 'transfer', 'adjustment') NOT NULL,
  quantity INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  unit_cost DECIMAL(15,2),
  total_cost DECIMAL(15,2),
  batch_number VARCHAR(50),
  expiry_date DATE,
  qr_code VARCHAR(50),
  location_from VARCHAR(100),
  location_to VARCHAR(100),
  processed_by VARCHAR(36) NOT NULL,
  processed_at TIMESTAMP NOT NULL,
  notes TEXT,
  
  FOREIGN KEY (transaction_item_id) REFERENCES transaction_items(id),
  FOREIGN KEY (medicine_id) REFERENCES medicines(id),
  FOREIGN KEY (processed_by) REFERENCES users(id),
  INDEX idx_transaction_item_id (transaction_item_id),
  INDEX idx_medicine_id (medicine_id),
  INDEX idx_processed_at (processed_at)
);

-- Transaction activities (audit log)
CREATE TABLE transaction_activities (
  id VARCHAR(36) PRIMARY KEY,
  transaction_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  performed_by VARCHAR(36) NOT NULL,
  performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,
  
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_performed_at (performed_at)
);
```

## Business Rules

### 1. Source-Based Rules
```typescript
// PPL Submissions
- MUST provide request letter
- MUST reference valid submission
- Requires Dinas approval
- Can have quantity adjustments

// POPT Requests  
- NO request letter required
- Direct request capability
- Requires Dinas approval
- Higher processing priority

// Dinas Directives
- NO request letter required
- May bypass approval process
- Administrative override capability
- Full authority

// Emergency Responses
- NO request letter required
- Fast-track approval
- High priority processing
- Special documentation
```

### 2. Stock Validation
```typescript
// Before transaction creation
- Check current stock availability
- Validate against reserved stock
- Consider pending transactions
- Alert on low stock scenarios

// During processing
- Real-time stock deduction
- QR code assignment and tracking
- Batch number management
- Expiry date tracking

// Stock movements
- Automatic stock updates
- Movement history tracking
- Audit trail maintenance
- Reconciliation support
```

### 3. Approval Workflow
```typescript
// Conditional approval requirements
- PPL submissions: Always require approval
- POPT requests: Require approval
- Dinas directives: Optional approval
- Emergency: Fast-track process

// Approval actions
- Approve with/without adjustments
- Reject with mandatory reason
- Request additional information
- Transfer to different approver
```

## Integration Points

### 1. With Submission Module
- Reference submission for PPL transactions
- Validate submission status
- Link approval records
- Maintain data consistency

### 2. With Inventory Module
- Real-time stock checking
- Automatic stock updates
- Medicine information retrieval
- Stock movement recording

### 3. With QR Code Module
- QR code assignment during processing
- Tracking and validation
- Batch and sequence management
- Integration with physical distribution

### 4. With User Module
- User role validation
- Permission checking
- Activity logging
- Notification targeting

## Error Handling

### Common Error Scenarios
```typescript
// Business Logic Errors
- Insufficient stock
- Invalid transaction status
- Unauthorized action attempt
- Missing required documents

// Validation Errors
- Invalid transaction data
- Malformed request parameters
- File upload issues
- Data type mismatches

// System Errors
- Database connectivity issues
- External service failures
- File system problems
- Network timeouts
```

## Performance Considerations

### 1. Database Optimization
- Proper indexing on frequently queried columns
- Pagination for large result sets
- Efficient JOIN operations
- Query optimization

### 2. Caching Strategy
- Cache frequently accessed transactions
- Medicine information caching
- User permission caching
- Stock level caching

### 3. File Handling
- Efficient file upload/download
- Document storage optimization
- Image compression for receipts
- Background file processing

## Security Measures

### 1. Access Control
- Role-based permissions
- Resource-level security
- Action-specific authorization
- Cross-user data protection

### 2. Data Validation
- Input sanitization
- Schema validation
- Business rule enforcement
- SQL injection prevention

### 3. Audit Trail
- Complete activity logging
- User action tracking
- Data change monitoring
- Security event recording

## Testing Strategy

### 1. Unit Tests
- Service layer business logic
- Repository data operations
- Validation functions
- Utility functions

### 2. Integration Tests
- Complete workflow testing
- Database integration
- API endpoint testing
- Cross-module integration

### 3. E2E Tests
- Full user scenarios
- Multi-user workflows
- Document handling
- Error scenarios

## Deployment Considerations

### 1. Environment Setup
- Database migrations
- Seed data preparation
- Configuration management
- File storage setup

### 2. Monitoring
- Transaction processing metrics
- Error rate monitoring
- Performance tracking
- User activity monitoring

### 3. Backup & Recovery
- Transaction data backup
- Document backup
- Point-in-time recovery
- Disaster recovery procedures

---

*Transaction System Module telah dirancang untuk mendukung semua kebutuhan distribusi obat pertanian dengan fleksibilitas tinggi dan maintainability yang baik.*
