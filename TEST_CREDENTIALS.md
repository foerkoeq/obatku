# Test Credentials untuk Login

## 🔑 Default Login Credentials

Setelah seed database, ada **4 user** dengan role berbeda yang bisa digunakan untuk testing:

### 1. Administrator (ADMIN)
- **NIP**: `1001`
- **Password**: `password123`
- **Email**: `admin@obatku.local`
- **Role**: ADMIN
- **Akses**: Full access ke semua fitur

### 2. PPL (Petugas Penyuluh Lapangan)
- **NIP**: `2001`
- **Password**: `password123`
- **Email**: `budi@obatku.local`
- **Role**: PPL
- **Akses**: Fitur untuk petugas lapangan

### 3. DINAS
- **NIP**: `3001`
- **Password**: `password123`
- **Email**: `siti@obatku.local`
- **Role**: DINAS
- **Akses**: Fitur untuk dinas

### 4. POPT (Pengamat Organisme Pengganggu Tumbuhan)
- **NIP**: `4001`
- **Password**: `password123`
- **Email**: `ahmad@obatku.local`
- **Role**: POPT
- **Akses**: Fitur untuk pengamat

## ⚠️ Catatan Penting

### Format NIP
- ✅ **Benar**: `1001`, `2001`, `3001`, `4001` (angka saja)
- ❌ **Salah**: `ADMIN001`, `PPL001`, `admin@obatku.local` (bukan angka)

### Password
- Semua user menggunakan password yang sama: `password123`
- Password ini di-hash dengan bcrypt (12 rounds)

## 🧪 Testing

### 1. Test dengan curl

```bash
# Test login sebagai Admin
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nip":"1001","password":"password123"}'

# Test login sebagai PPL
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nip":"2001","password":"password123"}'

# Test login sebagai DINAS
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nip":"3001","password":"password123"}'

# Test login sebagai POPT
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nip":"4001","password":"password123"}'
```

### 2. Test dari Frontend

1. Buka `http://localhost:3000/login`
2. Masukkan:
   - **NIP**: `1001` (atau `2001`, `3001`, `4001`)
   - **Password**: `password123`
3. Klik Login
4. Seharusnya berhasil login dan redirect ke dashboard

## 🔄 Reset Database

Jika perlu reset database dan seed ulang:

```bash
cd backend

# Reset database
npx prisma migrate reset

# Atau seed ulang saja
npx prisma db seed
```

## 📝 Perubahan yang Telah Dilakukan

### Seed File (`backend/prisma/seed.ts`)
✅ **Diperbaiki**: NIP dari format `ADMIN001` menjadi `1001` (angka)
✅ **Diperbaiki**: NIP dari format `PPL001` menjadi `2001` (angka)
✅ **Diperbaiki**: NIP dari format `DINAS001` menjadi `3001` (angka)
✅ **Diperbaiki**: NIP dari format `POPT001` menjadi `4001` (angka)

### Validation Schema
✅ **Sudah benar**: Validation schema mengharapkan NIP berupa angka saja (`regex(/^[0-9]+$/)`)

## ✅ Status Perbaikan

- ✅ Network error sudah teratasi
- ✅ Error handling sudah diperbaiki
- ✅ Validation errors akan ditampilkan dengan jelas
- ✅ Seed file sudah diperbaiki (NIP berupa angka)
- ✅ Test credentials sudah tersedia

## 🎯 Next Steps

1. **Reset database** (jika perlu):
   ```bash
   cd backend
   npx prisma migrate reset
   ```

2. **Test login** dengan credentials di atas

3. **Periksa console** untuk validation errors (jika masih ada masalah)

