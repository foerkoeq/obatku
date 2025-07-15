# Obatku Backend API

Backend API untuk sistem manajemen obat pertanian yang dibangun dengan Node.js, Express, TypeScript, dan Prisma.

## 🚀 Features

- **Feature-Based Modular Architecture** - Setiap fitur dalam module terpisah
- **TypeScript** - Type safety dan development experience yang baik
- **Prisma ORM** - Database management dengan type safety
- **JWT Authentication** - Secure authentication system
- **Role-Based Access Control** - Granular permissions
- **File Upload** - Multer dengan validasi keamanan
- **Comprehensive Logging** - Winston untuk structured logging
- **Input Validation** - Zod untuk schema validation
- **Unit & Integration Testing** - Jest dengan high coverage
- **API Documentation** - Swagger/OpenAPI (coming soon)
- **Security Headers** - Helmet untuk security hardening
- **Rate Limiting** - Protection terhadap abuse
- **CORS** - Cross-origin resource sharing
- **Environment Configuration** - Flexible configuration management

## 🏗️ Architecture

```
backend/
├── src/
│   ├── features/          # Feature modules (users, inventory, etc.)
│   ├── shared/           # Shared utilities, types, constants
│   ├── core/             # Core app configuration
│   └── uploads/          # File uploads
├── prisma/               # Database schema & migrations
├── tests/                # Test files
└── scripts/              # Utility scripts
```

### Feature-Based Modular Structure

Setiap feature memiliki struktur yang konsisten:

```
src/features/{feature}/
├── {feature}.controller.ts   # Route handlers
├── {feature}.service.ts      # Business logic
├── {feature}.repository.ts   # Database operations
├── {feature}.types.ts        # Type definitions
├── {feature}.validation.ts   # Input validation
├── {feature}.routes.ts       # Route definitions
└── {feature}.test.ts         # Unit tests
```

## 📋 Prerequisites

- Node.js 18+
- MySQL 8.0+ (atau MariaDB)
- npm 9+

## 🛠️ Installation

1. **Clone repository**
   ```bash
   git clone [repository-url]
   cd obatku/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local dengan konfigurasi database Anda
   ```

4. **Setup database**
   ```bash
   # Buat database di MySQL/MariaDB
   CREATE DATABASE obatku_dev;
   CREATE DATABASE obatku_test;
   
   # Buat user untuk development
   CREATE USER 'obatku_dev'@'localhost' IDENTIFIED BY 'password123';
   GRANT ALL PRIVILEGES ON obatku_dev.* TO 'obatku_dev'@'localhost';
   GRANT ALL PRIVILEGES ON obatku_test.* TO 'obatku_dev'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed database (optional)**
   ```bash
   npm run db:seed
   ```

## 🚀 Development

### Start development server
```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server dengan hot reload
- `npm run build` - Build untuk production
- `npm run start` - Start production server
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests dalam watch mode
- `npm run test:coverage` - Run tests dengan coverage report
- `npm run test:integration` - Run integration tests
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database dengan data awal
- `npm run db:reset` - Reset database (⚠️ hapus semua data)
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run format` - Format code dengan Prettier

## 🔧 Configuration

### Environment Variables

Copy `.env.example` ke `.env.local` dan sesuaikan:

```env
# Database
DATABASE_URL="mysql://obatku_dev:password123@localhost:3306/obatku_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# File Upload
UPLOAD_DIR="./src/uploads"
MAX_FILE_SIZE="5242880"  # 5MB
ALLOWED_FILE_TYPES="jpg,jpeg,png,pdf,doc,docx"

# Security
BCRYPT_ROUNDS="12"
RATE_LIMIT_WINDOW="15"  # minutes
RATE_LIMIT_MAX="100"    # requests per window

# CORS
CORS_ORIGIN="http://localhost:3000"
CORS_CREDENTIALS="true"
```

## 🗄️ Database Schema

### Core Tables

- **users** - User management dengan role-based access
- **medicines** - Master data obat pertanian
- **medicine_stocks** - Inventory management
- **submissions** - Pengajuan dari PPL
- **submission_items** - Detail obat yang diajukan
- **transactions** - Transaksi masuk/keluar
- **transaction_items** - Detail transaksi
- **activity_logs** - Audit trail

### Relationships

- User dapat membuat multiple submissions
- Submission berisi multiple submission items
- Medicine dapat memiliki multiple stock entries
- Transaction terkait dengan submission (optional)

## 🔐 Authentication & Authorization

### Roles

- **Admin** - Full access ke semua fitur
- **PPL** - Dapat membuat submission, view own data
- **Dinas** - Dapat approve submission, manage inventory
- **POPT** - Dapat process distribution, manage stock

### JWT Token

- **Access Token** - Expire 15 menit, untuk API calls
- **Refresh Token** - Expire 7 hari, untuk refresh access token

### Protected Routes

Semua routes protected dengan JWT middleware kecuali:
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/health`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Medicines
- `GET /api/medicines` - Get all medicines
- `POST /api/medicines` - Create medicine
- `GET /api/medicines/:id` - Get medicine by ID
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Submissions
- `GET /api/submissions` - Get submissions (filtered by role)
- `POST /api/submissions` - Create submission (PPL only)
- `GET /api/submissions/:id` - Get submission detail
- `PUT /api/submissions/:id` - Update submission
- `DELETE /api/submissions/:id` - Cancel submission

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction detail
- `PUT /api/transactions/:id` - Update transaction

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
npm run test:integration
```

### Test Coverage

```bash
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/           # Unit tests untuk services, repositories
├── integration/    # Integration tests untuk API endpoints
├── fixtures/       # Test data
└── helpers/        # Test utilities
```

## 📝 Logging

### Log Levels

- **error** - Error yang perlu immediate attention
- **warn** - Warning yang perlu dimonitor
- **info** - Informasi general
- **debug** - Detailed debugging information

### Log Files

- `logs/app.log` - All application logs
- `logs/error.log` - Error logs only

### Structured Logging

```typescript
logger.info('User login', {
  userId: user.id,
  role: user.role,
  ip: req.ip,
  userAgent: req.get('user-agent')
});
```

## 🔒 Security

### Security Headers

- Helmet untuk security headers
- CORS configuration
- Rate limiting per IP
- Input validation dengan Zod
- SQL injection protection via Prisma
- XSS protection

### File Upload Security

- File type validation
- File size limits
- Virus scanning (coming soon)
- Secure file storage

## 📈 Performance

### Database Optimization

- Proper indexing
- Connection pooling
- Query optimization
- Pagination untuk large datasets

### Caching Strategy

- In-memory caching untuk frequently accessed data
- Redis integration (coming soon)

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure file upload directory
5. Setup logging directory

### Process Management

Recommended: PM2 untuk process management

```bash
npm install -g pm2
pm2 start dist/main.js --name obatku-backend
pm2 startup
pm2 save
```

## 🤝 Contributing

### Development Workflow

1. Pick satu feature module untuk dikerjakan
2. Follow established patterns
3. Write comprehensive tests
4. Update documentation
5. Test integration dengan modules lain

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- 80%+ test coverage
- Comprehensive error handling

## 📚 Documentation

- API documentation: `http://localhost:3001/docs` (coming soon)
- Database schema: `npm run db:studio`
- Code documentation: JSDoc comments

## 🐛 Troubleshooting

### Common Issues

1. **Database connection error**
   - Check MySQL service running
   - Verify database credentials
   - Ensure database exists

2. **JWT errors**
   - Check JWT_SECRET in .env.local
   - Verify token expiration

3. **File upload errors**
   - Check upload directory permissions
   - Verify file size limits
   - Check allowed file types

4. **Test failures**
   - Ensure test database is setup
   - Check test environment variables

## 📄 License

MIT License - See LICENSE file for details.

---

**Dibuat dengan ❤️ untuk optimasi manajemen obat pertanian**
