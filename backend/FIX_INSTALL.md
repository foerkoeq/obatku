# Fix Backend Installation

## Masalah
- `@types/csv-parser` tidak ada di npm registry (404 error)
- `tsx` tidak terinstall karena npm install gagal
- Backend tidak bisa dijalankan

## Solusi

### 1. Hapus node_modules dan package-lock.json
```bash
cd backend
rm -rf node_modules
rm package-lock.json
```

Atau di Windows PowerShell:
```powershell
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
```

### 2. Install ulang dependencies
```bash
npm install
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Setup Database (jika belum)
```bash
# Jalankan migration
npm run db:migrate

# Seed database (jika diperlukan)
npm run db:seed
```

### 5. Jalankan backend
```bash
npm run dev
```

## Perubahan yang dilakukan
1. ✅ Menghapus `@types/csv-parser` dari devDependencies (tidak ada di npm)
2. ✅ Menghapus `csv-parser` dari dependencies (tidak digunakan)

## Catatan Penting
- **Backend HARUS dijalankan** karena frontend membutuhkan API dari backend
- Backend akan berjalan di `http://localhost:3001`
- Frontend akan proxy request ke backend melalui middleware

## Troubleshooting

### Jika masih ada error npm install:
1. Cek versi Node.js: `node --version` (harus >= 18.0.0)
2. Cek versi npm: `npm --version` (harus >= 8.0.0)
3. Clear npm cache: `npm cache clean --force`
4. Install ulang: `npm install`

### Jika error tsx tidak ditemukan:
1. Pastikan npm install berhasil
2. Cek apakah tsx terinstall: `npm list tsx`
3. Jika belum, install manual: `npm install tsx --save-dev`

### Jika error database:
1. Pastikan database sudah setup
2. Pastikan .env file sudah dikonfigurasi
3. Jalankan migration: `npm run db:migrate`

## Environment Variables
Pastikan file `.env` atau `.env.local` di folder backend sudah dikonfigurasi dengan benar:
- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- PORT (default: 3001)
- dll

