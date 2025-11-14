# Fix Network Error - Dokumentasi Lengkap

## Masalah yang Ditemukan

1. **Backend `/api/v1` mengembalikan 404** - Tidak ada route handler untuk path ini
2. **Network error saat login** - Kemungkinan karena endpoint tidak ditemukan atau CORS issue

## Perbaikan yang Telah Dilakukan

### 1. Backend Routes (`backend/src/core/server/routes.ts`)

✅ **Ditambahkan route handler untuk `/api/v1`**
- Sekarang `/api/v1` mengembalikan informasi tentang endpoint yang tersedia
- Menyediakan dokumentasi endpoint secara otomatis

### 2. Konfigurasi CORS

✅ **CORS sudah dikonfigurasi dengan benar**
- Mengizinkan origin dari `http://localhost:3000`
- Credentials enabled
- Preflight requests ditangani dengan benar

### 3. Endpoint Configuration

✅ **Endpoint sudah sesuai**
- Frontend: `/v1/auth/login` → `http://localhost:3001/api/v1/auth/login`
- Backend: `/api/v1/auth/login` ✅

## Verifikasi Konfigurasi

### Backend `.env.local`
```env
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
PORT=3001
HOST=localhost
NODE_ENV=development
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Testing Steps

### 1. Test Backend Endpoints

```bash
# Test root endpoint
curl http://localhost:3001

# Test health endpoint
curl http://localhost:3001/health

# Test API v1 endpoint (sekarang sudah ada handler)
curl http://localhost:3001/api/v1

# Test CORS
curl http://localhost:3001/api/v1/cors-test

# Test login endpoint (POST)
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nip":"test","password":"test"}'
```

### 2. Test dari Browser Console

```javascript
// Test CORS
fetch('http://localhost:3001/api/v1/cors-test')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// Test API v1 info
fetch('http://localhost:3001/api/v1')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 3. Test Login dari Frontend

1. Buka `http://localhost:3000/login`
2. Buka Developer Tools (F12)
3. Periksa Network tab
4. Coba login
5. Periksa request URL: harus `http://localhost:3001/api/v1/auth/login`
6. Periksa response headers untuk CORS headers

## Troubleshooting

### Jika masih ada network error:

1. **Pastikan backend running**
   ```bash
   cd backend
   npm run dev
   ```

2. **Pastikan frontend running**
   ```bash
   npm run dev
   ```

3. **Periksa CORS headers di response**
   - `Access-Control-Allow-Origin: http://localhost:3000`
   - `Access-Control-Allow-Credentials: true`

4. **Periksa console untuk error detail**
   - Buka browser console
   - Cari error message
   - Periksa Network tab untuk request details

5. **Test dengan curl untuk memastikan backend bekerja**
   ```bash
   curl -X POST http://localhost:3001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -H "Origin: http://localhost:3000" \
     -d '{"nip":"test","password":"test"}'
   ```

## Endpoint yang Tersedia

### Public Endpoints
- `GET /api/v1` - API info
- `GET /api/v1/test` - Test endpoint
- `GET /api/v1/cors-test` - CORS test
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/health` - Auth health check

### Protected Endpoints (Requires Auth Token)
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/profile` - Get profile
- `GET /api/v1/auth/permissions` - Get permissions
- `GET /api/v1/auth/session` - Get session
- `POST /api/v1/auth/change-password` - Change password

## Catatan Penting

1. **Restart kedua server** setelah mengubah `.env` files
2. **Clear browser cache** jika masih ada masalah
3. **Periksa firewall** jika backend tidak bisa diakses
4. **Gunakan browser console** untuk debugging

## Status

✅ Backend route `/api/v1` sudah ditambahkan
✅ CORS sudah dikonfigurasi dengan benar
✅ Endpoint configuration sudah sesuai
⏳ Perlu testing untuk memastikan semua bekerja

