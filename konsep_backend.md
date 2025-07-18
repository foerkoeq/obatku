# BACKEND APLIKASI MANAJEMEN OBAT PERTANIAN

## KONTEKS PROYEK BACKEND
Backend untuk aplikasi web manajemen obat pertanian yang terintegrasi dengan frontend Next.js 15. Aplikasi ini menyediakan API untuk:
• Manajemen stok obat pertanian 
• Proses transaksi keluar (pengajuan → persetujuan → distribusi)
• Sistem autentikasi dan otorisasi berbasis role
• Tracking inventori dan pelaporan
• Upload dan manajemen file dokumen

## STACK TEKNOLOGI BACKEND (LAPTOP-FRIENDLY)
• **Runtime**: Node.js 18+ (native installation)
• **Framework**: Express.js + TypeScript
• **Database**: MySQL 8.0+ local (existing MySQL + Workbench)
• **ORM**: Prisma (with MySQL connector)
• **Authentication**: JWT (JSON Web Token)
• **File Upload**: Multer + Sharp (image processing)
• **QR Code**: qrcode (generation) + qrcode-reader (scanning)
• **Validation**: Zod
• **Security**: Helmet, CORS, bcrypt
• **Documentation**: Swagger/OpenAPI (optional)
• **Testing**: Jest + Supertest
• **Development**: nodemon + ts-node (hot reload)
• **Production**: PM2 (process manager)
• **Environment**: **Full Offline** - No Docker, No Cloud Dependencies

## ARSITEKTUR BACKEND - FEATURE-BASED MODULAR (RECOMMENDED)

### Struktur Direktori Backend
```
backend/
├── src/
│   ├── features/                # Feature-based modules (Best Practice)
│   │   ├── auth/               # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.types.ts
│   │   │   ├── auth.validation.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.test.ts
│   │   ├── users/              # User management module
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── users.types.ts
│   │   │   ├── users.validation.ts
│   │   │   ├── users.routes.ts
│   │   │   └── users.test.ts
│   │   ├── inventory/          # Inventory management module
│   │   │   ├── inventory.controller.ts
│   │   │   ├── inventory.service.ts
│   │   │   ├── inventory.repository.ts
│   │   │   ├── inventory.types.ts
│   │   │   ├── inventory.validation.ts
│   │   │   ├── inventory.routes.ts
│   │   │   └── inventory.test.ts
│   │   ├── qrcode/             # QR Code generation module
│   │   │   ├── qrcode.controller.ts
│   │   │   ├── qrcode.service.ts
│   │   │   ├── qrcode.repository.ts
│   │   │   ├── qrcode.types.ts
│   │   │   ├── qrcode.validation.ts
│   │   │   ├── qrcode.routes.ts
│   │   │   └── qrcode.test.ts
│   │   ├── submissions/        # Submission module
│   │   │   ├── submissions.controller.ts
│   │   │   ├── submissions.service.ts
│   │   │   ├── submissions.repository.ts
│   │   │   ├── submissions.types.ts
│   │   │   ├── submissions.validation.ts
│   │   │   ├── submissions.routes.ts
│   │   │   └── submissions.test.ts
│   │   ├── approvals/          # Approval workflow module
│   │   │   ├── approvals.controller.ts
│   │   │   ├── approvals.service.ts
│   │   │   ├── approvals.repository.ts
│   │   │   ├── approvals.types.ts
│   │   │   ├── approvals.validation.ts
│   │   │   ├── approvals.routes.ts
│   │   │   └── approvals.test.ts
│   │   ├── transactions/       # Transaction module
│   │   │   ├── transactions.controller.ts
│   │   │   ├── transactions.service.ts
│   │   │   ├── transactions.repository.ts
│   │   │   ├── transactions.types.ts
│   │   │   ├── transactions.validation.ts
│   │   │   ├── transactions.routes.ts
│   │   │   └── transactions.test.ts
│   │   └── reports/            # Reporting module
│   │       ├── reports.controller.ts
│   │       ├── reports.service.ts
│   │       ├── reports.repository.ts
│   │       ├── reports.types.ts
│   │       ├── reports.validation.ts
│   │       ├── reports.routes.ts
│   │       └── reports.test.ts
│   ├── shared/                 # Shared utilities & common code
│   │   ├── middleware/         # Common middlewares
│   │   │   ├── error.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── upload.middleware.ts
│   │   │   └── logger.middleware.ts
│   │   ├── utils/              # Utility functions
│   │   │   ├── response.util.ts
│   │   │   ├── crypto.util.ts
│   │   │   ├── date.util.ts
│   │   │   └── file.util.ts
│   │   ├── types/              # Global types
│   │   │   ├── api.types.ts
│   │   │   ├── common.types.ts
│   │   │   └── database.types.ts
│   │   └── constants/          # Application constants
│   │       ├── roles.constants.ts
│   │       ├── status.constants.ts
│   │       └── config.constants.ts
│   ├── core/                   # Core application setup
│   │   ├── database/           # Database configuration
│   │   │   ├── prisma.client.ts
│   │   │   ├── connection.ts
│   │   │   └── migrations/
│   │   ├── config/             # App configuration
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   └── security.config.ts
│   │   ├── server/             # Server setup
│   │   │   ├── app.ts
│   │   │   ├── routes.ts
│   │   │   └── middleware.ts
│   │   └── logger/             # Logging setup
│   │       ├── logger.ts
│   │       └── winston.config.ts
│   ├── uploads/                # File uploads (local storage)
│   └── main.ts                 # Application entry point
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── tests/                      # Test files
│   ├── integration/
│   ├── unit/
│   └── fixtures/
├── scripts/                    # Utility scripts
│   ├── dev.ts
│   ├── build.ts
│   └── seed.ts
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### Keuntungan Feature-Based Architecture:
- ✅ **Self-contained**: Setiap feature memiliki semua yang dibutuhkan
- ✅ **Easy maintenance**: Mudah untuk modify/extend feature tertentu
- ✅ **Team collaboration**: Developer bisa fokus pada feature tertentu
- ✅ **Testing**: Isolated testing per feature
- ✅ **Scalability**: Mudah untuk add/remove features
- ✅ **Clear boundaries**: Tidak ada dependency antar features

## DATABASE SCHEMA

### Tabel Users
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  nip VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'ppl', 'dinas', 'popt') NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  birth_date DATE NOT NULL,
  avatar_url VARCHAR(255),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  INDEX idx_role (role),
  INDEX idx_status (status),
  INDEX idx_nip (nip)
);
```

### Tabel Medicines (Obat)
```sql
CREATE TABLE medicines (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  producer VARCHAR(255),
  active_ingredient TEXT,
  category VARCHAR(100) NOT NULL,
  supplier VARCHAR(255),
  unit VARCHAR(50) NOT NULL, -- kg, liter, botol, dll
  pack_unit VARCHAR(50), -- dus, box, pack
  quantity_per_pack INT, -- jumlah dalam 1 kemasan besar
  price_per_unit DECIMAL(15,2),
  pest_types JSON, -- ["ulat", "hama", "penyakit"]
  storage_location VARCHAR(255),
  description TEXT,
  qr_code VARCHAR(255) UNIQUE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  INDEX idx_category (category),
  INDEX idx_supplier (supplier),
  INDEX idx_status (status),
  INDEX idx_qr_code (qr_code),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Tabel Medicine Stocks
```sql
CREATE TABLE medicine_stocks (
  id VARCHAR(36) PRIMARY KEY,
  medicine_id VARCHAR(36) NOT NULL,
  batch_number VARCHAR(100),
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  initial_stock DECIMAL(10,2) NOT NULL,
  min_stock DECIMAL(10,2) DEFAULT 10,
  entry_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  supplier VARCHAR(255),
  notes TEXT,
  qr_code VARCHAR(255) UNIQUE, -- QR code untuk batch/kemasan besar
  is_bulk_package BOOLEAN DEFAULT FALSE, -- true untuk kemasan besar
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
  INDEX idx_medicine_id (medicine_id),
  INDEX idx_expiry_date (expiry_date),
  INDEX idx_current_stock (current_stock),
  INDEX idx_qr_code (qr_code)
);
```

### Tabel QR Code Masters (Master Data untuk QR Code)
```sql
CREATE TABLE qr_code_masters (
  id VARCHAR(36) PRIMARY KEY,
  funding_source_code VARCHAR(1) NOT NULL, -- 1=APBN, 2=APBD-Prov, 3=APBD-Kab, dst
  funding_source_name VARCHAR(100) NOT NULL,
  medicine_type_code VARCHAR(1) NOT NULL, -- F=Fungisida, I=Insektisida, H=Herbisida, dst
  medicine_type_name VARCHAR(100) NOT NULL,
  active_ingredient_code VARCHAR(3) NOT NULL, -- 111, 112, dst
  active_ingredient_name VARCHAR(255) NOT NULL,
  producer_code VARCHAR(1) NOT NULL, -- A, B, C, dst
  producer_name VARCHAR(255) NOT NULL,
  package_type_code VARCHAR(1) DEFAULT NULL, -- B=Box, K=Karton, S=Sak, dst (null untuk item satuan)
  package_type_name VARCHAR(100) DEFAULT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  INDEX idx_funding_source (funding_source_code),
  INDEX idx_medicine_type (medicine_type_code),
  INDEX idx_active_ingredient (active_ingredient_code),
  INDEX idx_producer (producer_code),
  INDEX idx_package_type (package_type_code),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Tabel QR Code Sequences (Counter untuk QR Code)
```sql
CREATE TABLE qr_code_sequences (
  id VARCHAR(36) PRIMARY KEY,
  year VARCHAR(2) NOT NULL,
  month VARCHAR(2) NOT NULL,
  funding_source_code VARCHAR(1) NOT NULL,
  medicine_type_code VARCHAR(1) NOT NULL,
  active_ingredient_code VARCHAR(3) NOT NULL,
  producer_code VARCHAR(1) NOT NULL,
  package_type_code VARCHAR(1) DEFAULT NULL, -- null untuk item satuan
  current_sequence VARCHAR(4) NOT NULL DEFAULT '0001', -- bisa 0001-9999, 000A-ZZZZ, 001A-dst
  sequence_type ENUM('numeric', 'alpha_suffix', 'alpha_prefix') DEFAULT 'numeric',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_sequence (year, month, funding_source_code, medicine_type_code, active_ingredient_code, producer_code, package_type_code),
  INDEX idx_sequence_lookup (year, month, funding_source_code, medicine_type_code, active_ingredient_code, producer_code)
);
```

### Tabel Submissions (Pengajuan)
```sql
CREATE TABLE submissions (
  id VARCHAR(36) PRIMARY KEY,
  submission_number VARCHAR(50) UNIQUE NOT NULL,
  district VARCHAR(100) NOT NULL,
  village VARCHAR(100) NOT NULL,
  farmer_group VARCHAR(255) NOT NULL,
  group_leader VARCHAR(255) NOT NULL,
  commodity VARCHAR(255) NOT NULL,
  total_area DECIMAL(10,2) NOT NULL,
  affected_area DECIMAL(10,2) NOT NULL,
  pest_types JSON NOT NULL, -- ["ulat grayak", "wereng"]
  letter_number VARCHAR(100) NOT NULL,
  letter_date DATE NOT NULL,
  letter_file_url VARCHAR(255) NOT NULL,
  status ENUM(
    'pending', 'under_review', 'approved', 
    'partially_approved', 'rejected', 'distributed', 
    'completed', 'cancelled', 'expired'
  ) DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  submitter_id VARCHAR(36) NOT NULL, -- PPL yang mengajukan
  reviewer_id VARCHAR(36), -- Dinas yang mereview
  reviewed_at TIMESTAMP,
  reviewer_notes TEXT,
  distributor_id VARCHAR(36), -- Staff yang distribusi
  distributed_at TIMESTAMP,
  completion_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (submitter_id) REFERENCES users(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id),
  FOREIGN KEY (distributor_id) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_submitter_id (submitter_id),
  INDEX idx_district (district),
  INDEX idx_submission_date (created_at)
);
```

### Tabel Submission Items (Detail Obat yang Diajukan)
```sql
CREATE TABLE submission_items (
  id VARCHAR(36) PRIMARY KEY,
  submission_id VARCHAR(36) NOT NULL,
  medicine_id VARCHAR(36) NOT NULL,
  requested_quantity DECIMAL(10,2) NOT NULL,
  approved_quantity DECIMAL(10,2) DEFAULT 0,
  distributed_quantity DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id),
  INDEX idx_submission_id (submission_id),
  INDEX idx_medicine_id (medicine_id)
);
```

### Tabel Transactions (Transaksi Keluar/Masuk)
```sql
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('in', 'out', 'adjustment') NOT NULL,
  submission_id VARCHAR(36), -- null untuk transaksi manual
  reference_number VARCHAR(100), -- nomor surat/referensi
  description TEXT,
  total_items INT DEFAULT 0,
  total_value DECIMAL(15,2) DEFAULT 0,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  processed_by VARCHAR(36) NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_by VARCHAR(36),
  verified_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id),
  FOREIGN KEY (processed_by) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_processed_date (processed_at),
  INDEX idx_transaction_number (transaction_number)
);
```

### Tabel Transaction Items (Detail Item Transaksi)
```sql
CREATE TABLE transaction_items (
  id VARCHAR(36) PRIMARY KEY,
  transaction_id VARCHAR(36) NOT NULL,
  medicine_stock_id VARCHAR(36) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(15,2),
  total_price DECIMAL(15,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_stock_id) REFERENCES medicine_stocks(id),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_medicine_stock_id (medicine_stock_id)
);
```

### Tabel Activity Logs
```sql
CREATE TABLE activity_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', etc
  resource_type VARCHAR(50) NOT NULL, -- 'submission', 'transaction', 'medicine'
  resource_id VARCHAR(36),
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_resource_type (resource_type),
  INDEX idx_created_at (created_at)
);
```

## API ENDPOINTS

### Authentication Routes
```
POST   /api/auth/login              # User login
POST   /api/auth/logout             # User logout
POST   /api/auth/refresh            # Refresh JWT token
POST   /api/auth/forgot-password    # Request password reset
POST   /api/auth/reset-password     # Reset password with token
GET    /api/auth/me                 # Get current user info
```

### User Management Routes
```
GET    /api/users                   # Get all users (admin only)
POST   /api/users                   # Create new user (admin only)
GET    /api/users/:id               # Get user by ID
PUT    /api/users/:id               # Update user
DELETE /api/users/:id               # Delete user (admin only)
POST   /api/users/:id/reset-password # Reset user password (admin only)
PUT    /api/users/:id/role          # Change user role (admin only)
GET    /api/users/:id/activities    # Get user activity logs
POST   /api/users/:id/avatar        # Upload user avatar
```

### Medicine/Inventory Routes
```
GET    /api/medicines               # Get all medicines
POST   /api/medicines               # Add new medicine
GET    /api/medicines/:id           # Get medicine by ID
PUT    /api/medicines/:id           # Update medicine
DELETE /api/medicines/:id           # Delete medicine
GET    /api/medicines/:id/stocks    # Get medicine stock history
POST   /api/medicines/:id/stocks    # Add stock (stock in)
PUT    /api/medicines/:id/stocks/:stockId # Update stock
GET    /api/medicines/low-stock     # Get medicines with low stock
GET    /api/medicines/expiring      # Get medicines expiring soon
POST   /api/medicines/qr-generate   # Generate QR codes
GET    /api/medicines/qr/:code      # Get medicine by QR code
```

### QR Code Management Routes
```
GET    /api/qrcodes/masters         # Get all QR code masters
POST   /api/qrcodes/masters         # Create QR code master
PUT    /api/qrcodes/masters/:id     # Update QR code master
DELETE /api/qrcodes/masters/:id     # Delete QR code master
POST   /api/qrcodes/generate        # Generate new QR code for medicine/stock
GET    /api/qrcodes/validate/:code  # Validate QR code format
GET    /api/qrcodes/decode/:code    # Decode QR code information
POST   /api/qrcodes/bulk-generate   # Bulk generate QR codes
GET    /api/qrcodes/sequences       # Get sequence status
POST   /api/qrcodes/sequences/reset # Reset sequence counter (admin only)
```

### Submission Routes (PPL)
```
GET    /api/submissions             # Get submissions (filtered by role)
POST   /api/submissions             # Create new submission (PPL only)
GET    /api/submissions/:id         # Get submission detail
PUT    /api/submissions/:id         # Update submission (PPL only, if pending)
DELETE /api/submissions/:id         # Cancel submission (PPL only)
POST   /api/submissions/:id/upload  # Upload supporting documents
GET    /api/submissions/:id/timeline # Get submission timeline/history
```

### Approval Routes (Dinas)
```
GET    /api/approvals               # Get pending approvals (Dinas only)
POST   /api/approvals/:submissionId/approve   # Approve submission
POST   /api/approvals/:submissionId/reject    # Reject submission
PUT    /api/approvals/:submissionId/items     # Update approved quantities
GET    /api/approvals/:submissionId/preview   # Preview submission for approval
```

### Transaction Routes
```
GET    /api/transactions            # Get all transactions
POST   /api/transactions            # Create manual transaction
GET    /api/transactions/:id        # Get transaction detail
PUT    /api/transactions/:id        # Update transaction
DELETE /api/transactions/:id        # Cancel transaction
POST   /api/transactions/:id/verify # Verify transaction (supervisor)
GET    /api/transactions/summary    # Get transaction summary
POST   /api/transactions/bulk       # Bulk transaction processing
```

### Report Routes
```
GET    /api/reports/stock           # Stock reports
GET    /api/reports/transactions    # Transaction reports
GET    /api/reports/submissions     # Submission reports
GET    /api/reports/dashboard       # Dashboard statistics
POST   /api/reports/export          # Export reports (PDF, Excel)
GET    /api/reports/alerts          # Get system alerts
```

### File/Upload Routes
```
POST   /api/uploads/documents       # Upload documents
POST   /api/uploads/images          # Upload images
GET    /api/uploads/:filename       # Serve uploaded files
DELETE /api/uploads/:filename       # Delete uploaded files
```

## ROLE-BASED ACCESS CONTROL (RBAC)

### Permission Matrix
| Feature | Admin | PPL | Dinas | POPT |
|---------|-------|-----|-------|------|
| User Management | ✅ | ❌ | ❌ | ❌ |
| Medicine CRUD | ✅ | ❌ | ✅ | ✅ |
| View Medicine | ✅ | ✅ | ✅ | ✅ |
| Stock Management | ✅ | ❌ | ✅ | ✅ |
| QR Code Generation | ✅ | ❌ | ✅ | ✅ |
| QR Code Masters | ✅ | ❌ | ✅ | ❌ |
| QR Code Scanning | ✅ | ✅ | ✅ | ✅ |
| Create Submission | ✅ | ✅ | ❌ | ❌ |
| View Own Submissions | ✅ | ✅ | ❌ | ❌ |
| Approve Submissions | ✅ | ❌ | ✅ | ❌ |
| Process Distribution | ✅ | ❌ | ✅ | ✅ |
| View All Transactions | ✅ | ❌ | ✅ | ✅ |
| View Own Transactions | ✅ | ✅ | ✅ | ✅ |
| Generate Reports | ✅ | ❌ | ✅ | ✅ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

### Middleware Implementation
```typescript
// Role-based access middleware
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role 
      });
    }
    
    next();
  };
};

// Usage in routes
router.get('/users', authenticate, requireRole(['admin']), userController.getAll);
router.post('/submissions', authenticate, requireRole(['ppl']), submissionController.create);
router.get('/approvals', authenticate, requireRole(['dinas']), approvalController.getPending);
```

## BUSINESS LOGIC FLOWS

### 1. Submission to Distribution Flow
```
PPL Create Submission → 
Upload Letter → 
Dinas Review → 
Approve/Reject → 
(if approved) Generate Distribution → 
POPT/Staff Process → 
Update Stock → 
Complete Transaction
```

### 2. Stock Management Flow
```
Add Medicine → 
Set Initial Stock → 
Monitor Stock Levels → 
Alert on Low Stock → 
Process Outgoing → 
Update Current Stock → 
Track Expiry Dates
```

### 3. Authentication Flow
```
User Login → 
Validate Credentials → 
Generate JWT → 
Set Role Permissions → 
Access Protected Routes → 
Token Refresh → 
Activity Logging
```

### 4. QR Code Generation Flow
```typescript
// QR Code Generation Business Logic

// Format per item: 25071F111B0001
// 25 = tahun 2025
// 07 = bulan juli
// 1 = sumber (APBN, APBD-Prov, ...)
// F = Jenis Obat (fungisida)
// 111 = kandungan
// B = produsen
// 0001 = no urut

// Format kemasan besar: 25071F111B-B0001
// Additional B = jenis kemasan besar (box, dll)

interface QRCodeComponents {
  year: string;        // 2 digit tahun (25)
  month: string;       // 2 digit bulan (07)
  fundingSource: string;  // 1 digit sumber dana (1)
  medicineType: string;   // 1 digit jenis obat (F)
  activeIngredient: string; // 3 digit kandungan (111)
  producer: string;       // 1 digit produsen (B)
  packageType?: string;   // 1 digit kemasan (B) - optional untuk bulk
  sequence: string;       // 4 digit urutan (0001)
}

// QR Code Generation Process:
// 1. Validate medicine master data
// 2. Get or create sequence counter
// 3. Generate next sequence number
// 4. Format QR code string
// 5. Generate QR code image
// 6. Save to database
// 7. Update sequence counter

// Sequence Number Logic:
// 0001 → 9999 (numeric)
// 000A → ZZZZ (alpha suffix)
// 001A → 999Z (alpha prefix if needed)
```

### 5. QR Code Sequence Management
```typescript
// Sequence progression logic
const generateNextSequence = (currentSequence: string, type: SequenceType): string => {
  switch (type) {
    case 'numeric':
      // 0001 → 9999
      const num = parseInt(currentSequence);
      if (num < 9999) {
        return String(num + 1).padStart(4, '0');
      }
      // Switch to alpha_suffix
      return '000A';
      
    case 'alpha_suffix':
      // 000A → ZZZZ
      const prefix = currentSequence.substring(0, 3);
      const suffix = currentSequence.substring(3);
      const nextSuffix = incrementChar(suffix);
      if (nextSuffix <= 'Z') {
        return prefix + nextSuffix;
      }
      // Increment prefix
      const nextPrefix = incrementNumericPrefix(prefix);
      if (nextPrefix <= '999') {
        return nextPrefix + 'A';
      }
      // Switch to alpha_prefix
      return '001A';
      
    case 'alpha_prefix':
      // 001A → 999Z
      const numPart = currentSequence.substring(0, 3);
      const alphaPart = currentSequence.substring(3);
      // Continue logic...
      break;
  }
};
```

## SECURITY IMPLEMENTATION

### 1. Authentication Security
```typescript
// JWT Configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  algorithm: 'HS256'
};

// Password Security
const passwordPolicy = {
  minLength: 6,
  requireNumbers: true,
  requireSpecialChars: false,
  hashRounds: 12
};
```

### 2. Input Validation
```typescript
// Example validation schema
export const createSubmissionSchema = z.object({
  district: z.string().min(1).max(100),
  village: z.string().min(1).max(100),
  farmerGroup: z.string().min(1).max(255),
  groupLeader: z.string().min(1).max(255),
  commodity: z.string().min(1).max(255),
  totalArea: z.number().positive(),
  affectedArea: z.number().positive(),
  pestTypes: z.array(z.string()).min(1),
  letterNumber: z.string().min(1).max(100),
  letterDate: z.date(),
  items: z.array(z.object({
    medicineId: z.string().uuid(),
    requestedQuantity: z.number().positive(),
    unit: z.string().min(1)
  })).min(1)
});
```

### 3. File Upload Security
```typescript
// File upload configuration
const uploadConfig = {
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 5,
  uploadPath: '/uploads',
  virusScan: true
};
```

## NOTIFICATION SYSTEM

### 1. Event-Based Notifications
```typescript
// Notification events
export enum NotificationEvent {
  SUBMISSION_CREATED = 'submission.created',
  SUBMISSION_APPROVED = 'submission.approved',
  SUBMISSION_REJECTED = 'submission.rejected',
  STOCK_LOW = 'stock.low',
  MEDICINE_EXPIRING = 'medicine.expiring',
  TRANSACTION_COMPLETED = 'transaction.completed'
}

// Notification channels
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook'
}
```

### 2. Notification Rules
- PPL: Notifikasi saat pengajuan disetujui/ditolak
- Dinas: Notifikasi saat ada pengajuan baru
- POPT: Notifikasi stok rendah dan obat expired
- Admin: Notifikasi sistem dan user management

## PERFORMANCE OPTIMIZATION

### 1. Database Optimization
```sql
-- Indexes for performance
CREATE INDEX idx_medicines_category_status ON medicines(category, status);
CREATE INDEX idx_submissions_status_created ON submissions(status, created_at);
CREATE INDEX idx_transactions_type_date ON transactions(type, processed_at);
CREATE INDEX idx_medicine_stocks_expiry ON medicine_stocks(expiry_date, current_stock);

-- Composite indexes for complex queries
CREATE INDEX idx_submission_search ON submissions(district, status, created_at);
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, created_at);
```

### 2. Caching Strategy
```typescript
// Redis caching for frequently accessed data
const cacheConfig = {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    ttl: {
      user: 300,      // 5 minutes
      medicines: 600, // 10 minutes
      dashboard: 180, // 3 minutes
      reports: 1800   // 30 minutes
    }
  }
};
```

### 3. Pagination and Filtering
```typescript
// Standardized pagination
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Default pagination settings
export const defaultPagination = {
  page: 1,
  limit: 20,
  maxLimit: 100
};
```

## ERROR HANDLING

### 1. Error Types
```typescript
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export class AppError extends Error {
  public statusCode: number;
  public errorCode: ErrorCode;
  public isOperational: boolean;
  
  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
  }
}
```

### 2. Global Error Handler
```typescript
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
  }

  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
```

## TESTING STRATEGY

### 1. Test Structure
```
tests/
├── unit/                    # Unit tests
│   ├── services/
│   ├── repositories/
│   └── utils/
├── integration/             # Integration tests
│   ├── auth.test.ts
│   ├── submissions.test.ts
│   └── transactions.test.ts
├── e2e/                     # End-to-end tests
│   ├── submission-flow.test.ts
│   └── user-management.test.ts
├── fixtures/                # Test data
└── helpers/                 # Test utilities
```

### 2. Test Coverage Targets
- Unit Tests: > 90%
- Integration Tests: > 80%
- E2E Tests: Critical user flows
- API Tests: All endpoints

## DEPLOYMENT & INFRASTRUCTURE (NATIVE SETUP)

### 1. Development Environment Setup
```bash
# Prerequisites yang sudah ada di laptop kamu:
✅ Node.js 18+ 
✅ MySQL 8.0 + MySQL Workbench
✅ Git

# Setup development dependencies
npm init -y
npm install express typescript prisma @prisma/client mysql2 bcrypt jsonwebtoken
npm install zod multer sharp helmet cors express-rate-limit
npm install qrcode qrcode-terminal @types/qrcode
npm install -D @types/node @types/express @types/bcrypt @types/jsonwebtoken
npm install -D @types/multer nodemon ts-node jest supertest @types/jest
npm install -D eslint prettier typescript-eslint
```

### 2. Database Configuration (Local MySQL)
```sql
-- Setup database di MySQL Workbench
CREATE DATABASE obatku_dev;
CREATE DATABASE obatku_test;

-- Create user untuk development
CREATE USER 'obatku_dev'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON obatku_dev.* TO 'obatku_dev'@'localhost';
GRANT ALL PRIVILEGES ON obatku_test.* TO 'obatku_dev'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Environment Configuration
```env
# .env.local (development)
NODE_ENV=development
PORT=3001
HOST=localhost

# Database (Local MySQL)
DATABASE_URL="mysql://obatku_dev:password123@localhost:3306/obatku_dev"
DATABASE_URL_TEST="mysql://obatku_dev:password123@localhost:3306/obatku_test"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# File Upload (Local Storage)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf

# QR Code Configuration
QR_CODE_IMAGE_SIZE=256
QR_CODE_MARGIN=2
QR_CODE_ERROR_CORRECTION=M
QR_CODE_UPLOAD_DIR=./uploads/qrcodes

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=debug
LOG_DIR=./logs
```

### 4. Development Scripts
```json
{
  "scripts": {
    "dev": "nodemon src/main.ts",
    "build": "tsc",
    "start": "node dist/main.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset --force",
    "db:studio": "prisma studio",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

### 5. QR Code Master Data Seed
```sql
-- Insert funding source codes
INSERT INTO qr_code_masters (id, funding_source_code, funding_source_name, medicine_type_code, medicine_type_name, active_ingredient_code, active_ingredient_name, producer_code, producer_name, status, created_by) VALUES
(UUID(), '1', 'APBN', 'F', 'Fungisida', '111', 'Mankozeb', 'A', 'Syngenta', 'active', 'system'),
(UUID(), '1', 'APBN', 'F', 'Fungisida', '111', 'Mankozeb', 'B', 'Bayer', 'active', 'system'),
(UUID(), '1', 'APBN', 'F', 'Fungisida', '112', 'Karbendazim', 'A', 'Syngenta', 'active', 'system'),
(UUID(), '1', 'APBN', 'I', 'Insektisida', '201', 'Klorprifos', 'A', 'Syngenta', 'active', 'system'),
(UUID(), '1', 'APBN', 'I', 'Insektisida', '201', 'Klorprifos', 'B', 'Bayer', 'active', 'system'),
(UUID(), '1', 'APBN', 'H', 'Herbisida', '301', 'Glifosat', 'A', 'Syngenta', 'active', 'system'),
(UUID(), '2', 'APBD-Provinsi', 'F', 'Fungisida', '111', 'Mankozeb', 'A', 'Syngenta', 'active', 'system'),
(UUID(), '3', 'APBD-Kabupaten', 'F', 'Fungisida', '111', 'Mankozeb', 'A', 'Syngenta', 'active', 'system');

-- Insert package type codes
INSERT INTO qr_code_masters (id, funding_source_code, funding_source_name, medicine_type_code, medicine_type_name, active_ingredient_code, active_ingredient_name, producer_code, producer_name, package_type_code, package_type_name, status, created_by) VALUES
(UUID(), '1', 'APBN', 'F', 'Fungisida', '111', 'Mankozeb', 'A', 'Syngenta', 'B', 'Box', 'active', 'system'),
(UUID(), '1', 'APBN', 'F', 'Fungisida', '111', 'Mankozeb', 'A', 'Syngenta', 'K', 'Karton', 'active', 'system'),
(UUID(), '1', 'APBN', 'F', 'Fungisida', '111', 'Mankozeb', 'A', 'Syngenta', 'S', 'Sak', 'active', 'system');
```

### 6. Production Deployment (VPS/Local Server)
```bash
# Option A: PM2 (Process Manager)
npm install -g pm2
pm2 start dist/main.js --name obatku-backend
pm2 startup
pm2 save

# Option B: Systemd Service (Linux)
sudo nano /etc/systemd/system/obatku-backend.service
sudo systemctl enable obatku-backend
sudo systemctl start obatku-backend
```

## API DOCUMENTATION

### 1. Response Format
```typescript
// Success Response
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    pagination?: PaginationMeta;
    filters?: any;
  };
}

// Error Response
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
}
```

### 2. API Versioning
```
/api/v1/...  # Current version
/api/v2/...  # Future versions
```

### 3. Rate Limiting
```typescript
// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
};
```

## MONITORING & LOGGING

### 1. Logging Strategy
```typescript
// Log levels and structure
export const logger = {
  levels: ['error', 'warn', 'info', 'debug'],
  format: 'json',
  transports: ['console', 'file', 'database'],
  metadata: {
    timestamp: true,
    requestId: true,
    userId: true,
    ipAddress: true
  }
};
```

### 2. Health Checks
```typescript
// Health check endpoints
GET /health           # Basic health check
GET /health/database  # Database connectivity
GET /health/detailed  # Comprehensive system status
```

### 3. Metrics Tracking
- Request/response times
- Database query performance  
- Error rates
- User activity patterns
- System resource usage

## BACKUP & RECOVERY

### 1. Database Backup
```sql
-- Daily automated backup
mysqldump --single-transaction --routines --triggers obatku > backup_$(date +%Y%m%d).sql

-- Point-in-time recovery setup
SET GLOBAL binlog_format = 'ROW';
SET GLOBAL log_bin = ON;
```

### 2. File Backup
- Daily backup file uploads
- Versioning untuk dokumen penting
- Cloud storage redundancy

### 3. Disaster Recovery
- Database replication
- Application server clustering
- Automated failover procedures
- Recovery time objective (RTO): < 4 jam
- Recovery point objective (RPO): < 1 jam

## INTEGRATION DENGAN FRONTEND

### 1. API Contract
Backend menyediakan API yang sesuai dengan kebutuhan frontend:
- Endpoint sesuai dengan halaman frontend
- Response format yang konsisten
- Error handling yang user-friendly
- Real-time updates melalui WebSocket (opsional)

### 2. File Serving
```typescript
// Static file serving
app.use('/uploads', express.static('uploads', {
  maxAge: '1h',
  setHeaders: (res, path) => {
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));
```

### 3. CORS Configuration
```typescript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
```

---

## FUTURE ENHANCEMENTS

### Phase 2 Features
1. **Real-time Notifications**
   - WebSocket integration
   - Push notifications
   - Email notifications

2. **Advanced Analytics**
   - Predictive analytics untuk stok
   - Usage patterns analysis
   - Cost optimization insights

3. **Mobile API**
   - Dedicated mobile endpoints
   - Offline sync capabilities
   - QR code scanning integration

4. **Enhanced QR Code Features**
   - Batch QR code printing
   - QR code analytics & tracking
   - Dynamic QR codes with URLs
   - QR code lifecycle management
   - Custom QR code templates
   - QR code expiration handling
   - Mobile scanning optimization

5. **Third-party Integrations**
   - ERP system integration
   - Government reporting APIs
   - Weather data integration

6. **Advanced Security**
   - OAuth2 integration
   - Multi-factor authentication
   - Audit trail encryption

### Scalability Considerations
- Microservices architecture
- Event-driven architecture
- Horizontal scaling
- Database sharding
- Caching layers (Redis/Memcached)

---

*Konsep backend ini dirancang untuk mendukung semua fitur frontend yang telah didefinisikan dengan fokus pada keamanan, performa, dan maintainability. Implementasi dapat dilakukan secara bertahap sesuai prioritas bisnis.*

## ALTERNATIF DEPLOYMENT (TANPA DOCKER)

### 1. Development Native Setup
```bash
# Requirement minimal
- Node.js 18+ (via nvm untuk version management)
- MySQL 8.0 / MariaDB (lebih ringan)
- PM2 (untuk production process management)

# Setup development
npm init -y
npm install express typescript prisma @prisma/client mysql2
npm install -D nodemon @types/node ts-node
```

### 2. Database Options (Pilih salah satu)
```bash
# Option A: Local MySQL/MariaDB
- Install MySQL 8.0 atau MariaDB
- Lebih control, tapi butuh setup

# Option B: Cloud Database (Recommended)
- PlanetScale (MySQL compatible, free tier)
- Railway (PostgreSQL/MySQL, free tier)
- Supabase (PostgreSQL, free tier)
- Lebih mudah, automatic backup

# Option C: SQLite (untuk development awal)
- File-based database
- Zero configuration
- Good untuk prototyping
```

### 3. Production Deployment
```bash
# Option A: VPS Traditional
- Ubuntu server + Nginx
- PM2 untuk process management
- MySQL/MariaDB lokal

# Option B: Platform as a Service
- Railway.app (recommended)
- Render.com
- Heroku alternative

# Option C: Serverless
- Vercel Functions
- Netlify Functions
- AWS Lambda (dengan Serverless Framework)
```

## MODULAR BACKEND ARCHITECTURE

### 1. Layer-based Modularity
```typescript
// Setiap layer independen dan bisa di-test terpisah
src/
├── presentation/     # Controllers & Routes (API layer)
├── application/      # Use cases & Business logic
├── domain/          # Core business entities & rules
├── infrastructure/   # Database, external services
└── shared/          # Common utilities & types
```

### 2. Feature-based Modularity
```typescript
// Setiap feature self-contained
src/
├── features/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.types.ts
│   │   └── auth.routes.ts
│   ├── inventory/
│   │   ├── inventory.controller.ts
│   │   ├── inventory.service.ts
│   │   └── ...
│   └── transactions/
├── shared/          # Common utilities
└── core/           # App configuration
```

### 3. Plugin-based Architecture
```typescript
// Setiap modul bisa di-enable/disable
interface BackendModule {
  name: string;
  version: string;
  dependencies: string[];
  routes: Router;
  services: any[];
  initialize: () => Promise<void>;
}

// Contoh implementasi
const inventoryModule: BackendModule = {
  name: 'inventory',
  version: '1.0.0',
  dependencies: ['auth'],
  routes: inventoryRoutes,
  services: [InventoryService],
  initialize: async () => {
    // Setup inventory module
  }
};
```

## IMPLEMENTATION ROADMAP & TO-DOs (REVISED)

### 🚀 Phase 1: Foundation Setup (Week 1-2)
```typescript
// ✅ 1.1 Project Initialization - COMPLETED
✅ Create backend directory structure (feature-based)
✅ Initialize Node.js project with TypeScript
✅ Setup development environment & scripts
✅ Configure ESLint, Prettier, Jest
✅ Create .env.local configuration

// ✅ 1.2 Database Setup (Local MySQL) - COMPLETED
✅ Create databases in MySQL Workbench (dev + test)
✅ Setup Prisma ORM with MySQL connector
✅ Create initial Prisma schema
✅ Setup migration system
✅ Create seed data untuk development

// ✅ 1.3 Core Infrastructure
✅ Setup Express.js server with TypeScript
✅ Configure middleware (CORS, Helmet, Morgan)
✅ Setup global error handling
✅ Create response utilities
✅ Setup logging system (Winston)
✅ Configure file upload handling (Multer)
```

### 🏗️ Phase 2: Core Features (Week 3-4)
```typescript
// ✅ 2.1 User Management Module (Priority #1)
✅ Create users feature module structure
✅ Implement user CRUD operations
✅ Setup password hashing (bcrypt)
✅ Create user validation schemas (Zod)
✅ Implement user repository & service
✅ Create user routes & controller
✅ Write unit tests for user module

// ✅ 2.2 Inventory Management Module (Priority #2)
✅ Create inventory feature module structure
✅ Implement medicine CRUD operations
✅ Setup stock management system
✅ Create inventory validation schemas
✅ Implement search & filtering
✅ Create inventory routes & controller
✅ Write unit tests for inventory module

// ✅ 2.3 QR Code Management Module (Priority #2B)
✅ Create QR code feature module structure
✅ Setup QR code masters & sequences tables
✅ Implement QR code generation algorithm
✅ Create QR code validation schemas
✅ Implement sequence management (0001-9999, 000A-ZZZZ)
✅ Setup QR code image generation (qrcode library)
✅ Create QR code routes & controller
✅ Write unit tests for QR code module

// ✅ 2.4 API Foundation
✅ Standardize API response format
✅ Implement pagination utilities
✅ Setup sorting & filtering helpers
✅ Create API documentation structure
✅ Implement basic security measures
```

### 🔄 Phase 3: Business Logic (Week 5-6)
```typescript
// ✅ 3.1 Submission System Module (Priority #3)
□ Create submissions feature module structure
□ Implement submission CRUD operations
□ Setup file upload for letters
□ Create submission validation schemas
□ Implement submission workflow status
□ Create submission routes & controller
□ Write unit tests for submission module

// ✅ 3.2 Approval Workflow Module (Priority #4)
□ Create approvals feature module structure
□ Implement approval queue system
□ Setup approval actions (approve/reject)
□ Create approval validation schemas
□ Implement approval history tracking
□ Create approval routes & controller
□ Write unit tests for approval module

// ✅ 3.3 Transaction System Module (Priority #5)
□ Create transactions feature module structure
□ Implement transaction CRUD operations
□ Setup stock update integration
□ Create transaction validation schemas
□ Implement transaction history
□ Create transaction routes & controller
□ Write unit tests for transaction module
```

### 🔐 Phase 4: Authentication & Security (Week 7)
```typescript
// ✅ 4.1 Authentication Module (Priority #6 - LAST!)
□ Create auth feature module structure
□ Implement JWT token generation
□ Setup login/logout endpoints
□ Create password reset system
□ Implement token refresh mechanism
□ Create auth validation schemas
□ Write unit tests for auth module

// ✅ 4.2 Authorization System
□ Create role-based middleware
□ Implement permission checking
□ Setup route protection
□ Create resource access control
□ Implement audit logging
□ Integrate auth with all modules

// ✅ 4.3 Security Hardening
□ Implement input sanitization
□ Setup rate limiting
□ Add security headers
□ Secure file upload validation
□ Add SQL injection prevention
□ Security testing
```

### 📊 Phase 5: Advanced Features (Week 8+)
```typescript
// ✅ 5.1 Reports Module (Priority #7)
□ Create reports feature module structure
□ Implement dashboard statistics
□ Setup export functionality (PDF, Excel)
□ Create custom report generators
□ Implement data visualization endpoints
□ Create report routes & controller
□ Write unit tests for reports module

// ✅ 5.2 File Management Enhancement
□ Implement image processing (Sharp)
□ Setup file serving optimization
□ Create file storage management
□ Implement file security scanning
□ Add file cleanup utilities

// ✅ 5.3 System Integration
□ Integration testing between modules
□ End-to-end testing
□ Performance optimization
□ Documentation completion
□ Deployment preparation
```

### 🎯 Development Priority Order:
1. **Users** → Foundation untuk semua fitur
2. **Inventory** → Core business logic
3. **QR Code** → Tracking & identification system
4. **Submissions** → Business workflow
5. **Approvals** → Workflow continuation
6. **Transactions** → Stock management
7. **Auth** → Security layer (LAST!)
8. **Reports** → Analytics & insights

### 📋 QR Code System Features:
- **Automatic ID Generation**: Format 25071F111B0001 (item) & 25071F111B-B0001 (bulk)
- **Smart Sequence Management**: 0001→9999 → 000A→ZZZZ → 001A→999Z
- **Master Data Management**: Funding source, medicine type, ingredient, producer codes
- **Image Generation**: PNG QR code images with customizable size
- **Validation & Decoding**: Format validation and component extraction
- **Bulk Operations**: Generate multiple QR codes at once
- **Integration**: Seamless integration with inventory & stock management

## FULL OFFLINE DEVELOPMENT WORKFLOW

### 1. Completely Offline Development
```bash
# ✅ Semua tools berjalan offline di laptop
- Node.js (local)
- MySQL + MySQL Workbench (local) 
- File storage (local filesystem)
- Development server (local)
- Testing (local)

# ✅ No external dependencies
- No cloud database
- No external APIs
- No Docker containers
- No internet required for development
```

### 2. Local Development Benefits
```bash
# ✅ Performance
- Faster database queries (no network latency)
- Instant file access
- Quick development cycles

# ✅ Control
- Full control over database
- Custom MySQL configuration
- Direct file system access
- No API rate limits

# ✅ Reliability
- Works without internet
- No service outages
- Consistent performance
- Predictable behavior
```

### 3. Feature Module Template
```typescript
// Template untuk setiap feature module
// Contoh: src/features/users/

// users.types.ts - Type definitions
export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  // ... other fields
}

// users.validation.ts - Zod schemas
export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'ppl', 'dinas', 'popt']),
  // ... other validations
});

// users.repository.ts - Database operations
export class UserRepository {
  async findAll(): Promise<User[]> { /* ... */ }
  async findById(id: string): Promise<User | null> { /* ... */ }
  async create(data: CreateUserData): Promise<User> { /* ... */ }
  async update(id: string, data: UpdateUserData): Promise<User> { /* ... */ }
  async delete(id: string): Promise<void> { /* ... */ }
}

// users.service.ts - Business logic
export class UserService {
  constructor(private userRepository: UserRepository) {}
  
  async getAllUsers(): Promise<User[]> { /* ... */ }
  async getUserById(id: string): Promise<User> { /* ... */ }
  async createUser(data: CreateUserData): Promise<User> { /* ... */ }
  async updateUser(id: string, data: UpdateUserData): Promise<User> { /* ... */ }
  async deleteUser(id: string): Promise<void> { /* ... */ }
}

// users.controller.ts - Route handlers
export class UserController {
  constructor(private userService: UserService) {}
  
  getAllUsers = async (req: Request, res: Response) => { /* ... */ }
  getUserById = async (req: Request, res: Response) => { /* ... */ }
  createUser = async (req: Request, res: Response) => { /* ... */ }
  updateUser = async (req: Request, res: Response) => { /* ... */ }
  deleteUser = async (req: Request, res: Response) => { /* ... */ }
}

// users.routes.ts - Route definitions
const router = express.Router();
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// users.test.ts - Unit tests
describe('UserService', () => {
  test('should create user successfully', async () => { /* ... */ });
  test('should get user by id', async () => { /* ... */ });
  // ... other tests
});
```

### 3. QR Code Module Example Implementation
```typescript
// qrcode.types.ts - QR Code type definitions
export interface QRCodeComponents {
  year: string;           // 25 (2025)
  month: string;          // 07 (Juli)
  fundingSource: string;  // 1 (APBN)
  medicineType: string;   // F (Fungisida)
  activeIngredient: string; // 111 (kandungan)
  producer: string;       // B (produsen)
  packageType?: string;   // B (Box) - optional untuk bulk
  sequence: string;       // 0001 (urutan)
}

// qrcode.service.ts - Key methods
export class QRCodeService {
  async generateQRCode(medicineId: string, isBulkPackage: boolean = false): Promise<QRCodeData> {
    // 1. Get medicine master data
    // 2. Build QR code components (year, month, codes, sequence)
    // 3. Format QR code string
    // 4. Generate QR code image
    // 5. Save to database
  }
  
  private formatQRCode(components: QRCodeComponents, isBulkPackage: boolean): string {
    const { year, month, fundingSource, medicineType, activeIngredient, producer, packageType, sequence } = components;
    
    if (isBulkPackage && packageType) {
      // Format: 25071F111B-B0001
      return `${year}${month}${fundingSource}${medicineType}${activeIngredient}${producer}-${packageType}${sequence}`;
    } else {
      // Format: 25071F111B0001  
      return `${year}${month}${fundingSource}${medicineType}${activeIngredient}${producer}${sequence}`;
    }
  }
  
  private generateNextSequence(current: string, type: SequenceType): { sequence: string; type: SequenceType } {
    switch (type) {
      case 'numeric':
        const num = parseInt(current);
        if (num < 9999) {
          return { sequence: String(num + 1).padStart(4, '0'), type: 'numeric' };
        }
        return { sequence: '000A', type: 'alpha_suffix' };
        
      case 'alpha_suffix':
        // Logic untuk 000A → ZZZZ → 001A
        return this.incrementAlphaSuffix(current);
        
      default:
        throw new Error('Invalid sequence type');
    }
  }
  
  async decodeQRCode(code: string): Promise<QRCodeComponents> {
    // Validate format & parse components
    const isBulkPackage = code.includes('-');
    
    if (isBulkPackage) {
      // Parse: 25071F111B-B0001
      const [mainPart, packagePart] = code.split('-');
      return {
        year: mainPart.substring(0, 2),
        month: mainPart.substring(2, 4),
        fundingSource: mainPart.substring(4, 5),
        medicineType: mainPart.substring(5, 6),
        activeIngredient: mainPart.substring(6, 9),
        producer: mainPart.substring(9, 10),
        packageType: packagePart.substring(0, 1),
        sequence: packagePart.substring(1, 5)
      };
    } else {
      // Parse: 25071F111B0001
      return {
        year: code.substring(0, 2),
        month: code.substring(2, 4),
        fundingSource: code.substring(4, 5),
        medicineType: code.substring(5, 6),
        activeIngredient: code.substring(6, 9),
        producer: code.substring(9, 10),
        sequence: code.substring(10, 14)
      };
    }
  }
}

## COLLABORATION-READY DOCUMENTATION

### 1. Konsep ini Collaboration-Friendly untuk:
```
✅ Team Developer     - Clear module boundaries
✅ AI Assistant       - Structured patterns
✅ Code Review        - Consistent architecture
✅ New Contributors   - Easy onboarding
✅ Maintenance        - Modular updates
```

### 2. Module Development Pattern
```typescript
// Setiap developer (atau AI) bisa fokus pada 1 module
// Tanpa mengganggu module lain

// Contoh: Developer A mengerjakan inventory module
src/features/inventory/
├── inventory.controller.ts  ← API endpoints
├── inventory.service.ts     ← Business logic
├── inventory.repository.ts  ← Database operations
├── inventory.types.ts       ← Type definitions
├── inventory.validation.ts  ← Input validation
├── inventory.routes.ts      ← Route configuration
└── inventory.test.ts        ← Unit tests

// Developer B mengerjakan submissions module
src/features/submissions/
├── submissions.controller.ts
├── submissions.service.ts
├── submissions.repository.ts
├── submissions.types.ts
├── submissions.validation.ts
├── submissions.routes.ts
└── submissions.test.ts

// Zero conflict, independent development
```

### 3. AI Assistant Instructions
```markdown
# Untuk AI Assistant yang akan membantu development:

## Context:
- Backend menggunakan Node.js + Express + TypeScript + Prisma + MySQL
- Architecture: Feature-based modular
- Pattern: Repository → Service → Controller → Routes
- Testing: Jest untuk unit tests
- Database: Local MySQL (offline)

## Module Structure:
Setiap feature harus mengikuti pattern:
1. `{feature}.types.ts` - Type definitions
2. `{feature}.validation.ts` - Zod validation schemas
3. `{feature}.repository.ts` - Database operations
4. `{feature}.service.ts` - Business logic
5. `{feature}.controller.ts` - Route handlers
6. `{feature}.routes.ts` - Route definitions
7. `{feature}.test.ts` - Unit tests

## Development Rules:
- No external dependencies antar modules
- Always use TypeScript types
- Always validate input dengan Zod
- Always write unit tests
- Follow established patterns
- Use Prisma for database operations
```

### 4. Onboarding Checklist
```markdown

# Untuk developer baru atau AI yang join project:

## ✅ Setup Requirements:
1. Node.js 18+ installed
2. MySQL 8.0 + MySQL Workbench
3. Git configured
4. IDE dengan TypeScript support

## ✅ Development Setup:
1. Clone repository
2. Run `npm install`
3. Copy `.env.example` to `.env.local`
4. Setup database di MySQL Workbench
5. Run `npm run db:migrate`
6. Run `npm run db:seed`
7. Run `npm run dev`

## ✅ Code Contribution:
1. Pick 1 module to work on
2. Follow module template pattern
3. Write unit tests
4. Update documentation
5. Test integration dengan modules lain
```

---

## 🎯 KONSEP SUMMARY

### ✅ **Architecture Decision: Feature-Based Modular**
- **Best for**: Maintenance, collaboration, scalability
- **Each module**: Self-contained, testable, independent
- **Pattern**: Repository → Service → Controller → Routes

### ✅ **Technology Stack: Laptop-Friendly**
- **Runtime**: Node.js 18+ (native)
- **Database**: MySQL local + Workbench
- **Framework**: Express.js + TypeScript
- **ORM**: Prisma
- **Testing**: Jest
- **Development**: 100% offline

### ✅ **Development Workflow: Auth-Last**
1. **Foundation** (Week 1-2)
2. **Core Features** (Week 3-4): Users → Inventory → QR Code
3. **Business Logic** (Week 5-6): Submissions → Approvals → Transactions
4. **Authentication** (Week 7): JWT + Role-based auth
5. **Advanced Features** (Week 8+): Reports + optimizations

### ✅ **QR Code System Integration**
- **Format**: 25071F111B0001 (item) & 25071F111B-B0001 (bulk package)
- **Components**: Year + Month + Funding + Medicine Type + Ingredient + Producer + Sequence
- **Sequence Logic**: 0001→9999 → 000A→ZZZZ → 001A→999Z (automatic progression)
- **Master Data**: Configurable codes for all components
- **Integration**: Seamlessly integrated with inventory & stock management
- **Image Generation**: PNG QR code images with customizable settings

### ✅ **Collaboration Ready**
- Clear module boundaries
- Consistent patterns
- Self-contained features
- Easy for AI assistance
- Good for team development

---

## 🚀 **NEXT STEPS**

1. **✅ Konsep finalized** - Clear, modular, laptop-friendly
2. **✅ QR Code system added** - Complete automatic ID generation system
3. **✅ Frontend review** - Kamu check frontend dulu
4. **⏳ Foundation setup** - Setelah konsep clear
5. **⏳ Development guide** - Detailed implementation steps
6. **⏳ Frontend integration** - Connect backend to Next.js

**Konsep ini sudah mature dan collaboration-ready dengan QR Code system!** 🎉

### 📋 **QR Code System Summary:**
- ✅ **Format Definition**: 25071F111B0001 (item) & 25071F111B-B0001 (bulk)
- ✅ **Database Schema**: qr_code_masters & qr_code_sequences tables
- ✅ **API Endpoints**: Complete CRUD operations for QR codes
- ✅ **Business Logic**: Smart sequence management & validation
- ✅ **Implementation**: TypeScript service with example code
- ✅ **Integration**: Seamless integration with inventory system
- ✅ **Future Ready**: Extensible for advanced features
