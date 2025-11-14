# Fix Prisma Seed Configuration

## Masalah yang Ditemukan

1. ✅ **Prisma seed configuration tidak ada** di `package.json`
2. ✅ **User tidak ditemukan** setelah reset database
3. ✅ **Seed tidak bisa dijalankan** karena konfigurasi missing

## Perbaikan yang Telah Dilakukan

### 1. Package.json (`backend/package.json`)

✅ **Ditambahkan konfigurasi prisma.seed**:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

**Catatan**: Menggunakan `tsx` karena project sudah menggunakan tsx untuk development (bukan ts-node).

## Cara Menjalankan Seed

### Opsi 1: Menggunakan Prisma Command (Recommended)

```bash
cd backend
npx prisma db seed
```

### Opsi 2: Menggunakan Script yang Sudah Ada

```bash
cd backend
npm run db:seed
```

### Opsi 3: Reset Database + Seed Otomatis

```bash
cd backend
npm run db:reset
```

**Catatan**: `db:reset` akan:
1. Drop semua tables
2. Run migrations
3. Run seed otomatis (karena sudah ada konfigurasi prisma.seed)

## Test Credentials Setelah Seed

Setelah seed berhasil, gunakan credentials berikut:

### 1. Administrator (ADMIN)
- **NIP**: `1001`
- **Password**: `password123`

### 2. PPL (Petugas Penyuluh Lapangan)
- **NIP**: `2001`
- **Password**: `password123`

### 3. DINAS
- **NIP**: `3001`
- **Password**: `password123`

### 4. POPT (Pengamat Organisme Pengganggu Tumbuhan)
- **NIP**: `4001`
- **Password**: `password123`

## Troubleshooting

### Jika masih error "user not found":

1. **Pastikan seed berhasil dijalankan**:
   ```bash
   cd backend
   npx prisma db seed
   ```

2. **Periksa output seed**:
   - Harus ada: `✅ Users seeded successfully`
   - Harus ada: `🔑 Default login credentials:`

3. **Periksa database**:
   ```bash
   cd backend
   npx prisma studio
   ```
   - Buka browser ke `http://localhost:5555`
   - Periksa table `User`
   - Pastikan ada 4 user dengan NIP: `1001`, `2001`, `3001`, `4001`

4. **Test dengan curl**:
   ```bash
   curl -X POST http://localhost:3001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"nip":"1001","password":"password123"}'
   ```

### Jika seed error:

1. **Pastikan database connection**:
   - Periksa `.env.local` di folder `backend`
   - Pastikan `DATABASE_URL` benar

2. **Pastikan dependencies terinstall**:
   ```bash
   cd backend
   npm install
   ```

3. **Generate Prisma Client**:
   ```bash
   cd backend
   npx prisma generate
   ```

## Status

✅ **Prisma seed configuration**: Sudah ditambahkan
✅ **Seed file**: Sudah diperbaiki (NIP berupa angka)
✅ **Test credentials**: Sudah tersedia

## Next Steps

1. **Jalankan seed**:
   ```bash
   cd backend
   npx prisma db seed
   ```

2. **Test login** dengan credentials di atas

3. **Periksa console** untuk error (jika masih ada masalah)

