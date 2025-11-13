# Fix Environment Variables untuk Network Error

## Masalah
Frontend `.env` tidak memiliki `NEXT_PUBLIC_BACKEND_API_URL`, yang menyebabkan network error saat login.

## Solusi

### 1. Tambahkan ke Frontend `.env` atau `.env.local`

Tambahkan baris berikut ke file `.env` di root frontend (atau buat `.env.local`):

```env
# Backend API Configuration
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=10000

# Existing variables (jangan dihapus)
AUTH_SECRET=1kc7Cf4Z2V2XX0WfGLrET9iZzWyDkar9RlqjIK3Vkxo
NEXT_PUBLIC_SITE_URL=http://localhost:3000
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

### 2. Tambahkan ke Backend `.env` atau `.env.local`

Pastikan backend `.env` memiliki:

```env
# CORS Configuration
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Server Configuration
PORT=3001
HOST=localhost
NODE_ENV=development
```

### 3. Restart Kedua Server

Setelah menambahkan environment variables:

1. **Stop** kedua server (Ctrl+C)
2. **Start backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Start frontend** (terminal baru):
   ```bash
   npm run dev
   ```

### 4. Verifikasi

Setelah restart, test dengan:

1. **Test Backend Root**:
   - Buka: http://localhost:3001
   - Harus menampilkan info API

2. **Test CORS** (di browser console):
   ```javascript
   fetch('http://localhost:3001/api/v1/cors-test')
     .then(r => r.json())
     .then(console.log)
     .catch(console.error)
   ```

3. **Test Login**:
   - Buka: http://localhost:3000/login
   - Coba login
   - Periksa console browser untuk log `[API Client]` dan `[getApiUrl]`

## Catatan Penting

- File `.env.local` akan override `.env`
- Next.js hanya membaca environment variables yang dimulai dengan `NEXT_PUBLIC_` di client-side
- Pastikan tidak ada spasi di sekitar `=` di file `.env`
- Setelah mengubah `.env`, **harus restart server**

## Troubleshooting

Jika masih error setelah menambahkan env variables:

1. **Cek Console Browser**:
   - Buka DevTools (F12)
   - Tab Console
   - Cari log `[getApiUrl]` dan `[API Client]`
   - Periksa URL yang digunakan

2. **Cek Network Tab**:
   - DevTools → Network
   - Cari request ke `/api/v1/auth/login`
   - Periksa:
     - Request URL (harus `http://localhost:3001/api/v1/auth/login`)
     - Status code
     - Response headers (terutama CORS headers)

3. **Cek Backend Logs**:
   - Periksa terminal backend
   - Cari request log
   - Cari error atau warning

4. **Test Manual dengan curl**:
   ```bash
   curl -X POST http://localhost:3001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -H "Origin: http://localhost:3000" \
     -d '{"nip":"admin001","password":"yourpassword"}'
   ```

