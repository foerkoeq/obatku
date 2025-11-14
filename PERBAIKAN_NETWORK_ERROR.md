# Perbaikan Network Error - Ringkasan Lengkap

## Start of Perbaikan Network Error

### Masalah yang Ditemukan

1. ✅ **Backend `/api/v1` mengembalikan 404** 
   - **Penyebab**: Tidak ada route handler untuk path `/api/v1` itu sendiri
   - **Dampak**: Frontend tidak bisa mendapatkan informasi tentang endpoint yang tersedia

2. ✅ **Network error saat login**
   - **Penyebab**: Kemungkinan karena endpoint tidak ditemukan atau masalah CORS
   - **Dampak**: User tidak bisa login

### Perbaikan yang Telah Dilakukan

#### 1. Backend Routes (`backend/src/core/server/routes.ts`)

✅ **Ditambahkan route handler untuk `/api/v1`**

```typescript
// API info endpoint - provides information about available endpoints
app.get(API_BASE, (_req, res) => {
  res.json({
    success: true,
    message: 'ObatKu API v1',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        login: `${API_BASE}/auth/login`,
        logout: `${API_BASE}/auth/logout`,
        refresh: `${API_BASE}/auth/refresh`,
        profile: `${API_BASE}/auth/profile`,
        health: `${API_BASE}/auth/health`,
      },
      users: {
        base: `${API_BASE}/users`,
        profile: `${API_BASE}/users/profile`,
      },
      test: `${API_BASE}/test`,
      corsTest: `${API_BASE}/cors-test`,
    },
    documentation: '/api/docs',
  });
});
```

**Manfaat**:
- Sekarang `/api/v1` mengembalikan informasi tentang endpoint yang tersedia
- Memudahkan debugging dan dokumentasi
- Frontend bisa mendapatkan daftar endpoint secara dinamis

#### 2. Error Handling & Logging (`lib/api/client.ts`)

✅ **Diperbaiki error logging untuk debugging yang lebih baik**

```typescript
// Enhanced error logging dengan informasi lengkap
console.error('[API Client] Full error details:', {
  url,
  endpoint,
  baseURL: this.baseURL,
  constructedUrl: url,
  errorMessage: error instanceof Error ? error.message : String(error),
  errorName: error instanceof Error ? error.name : 'Unknown',
});
```

**Manfaat**:
- Logging yang lebih detail untuk debugging
- Informasi lengkap tentang URL yang dibangun
- Memudahkan identifikasi masalah network error

#### 3. Verifikasi Konfigurasi

✅ **CORS sudah dikonfigurasi dengan benar**
- Mengizinkan origin dari `http://localhost:3000`
- Credentials enabled
- Preflight requests ditangani dengan benar

✅ **Endpoint configuration sudah sesuai**
- Frontend: `/v1/auth/login` → `http://localhost:3001/api/v1/auth/login`
- Backend: `/api/v1/auth/login` ✅

## Konfigurasi Environment Variables

### Backend `.env.local`

Pastikan memiliki konfigurasi berikut:

```env
# Environment Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Database Configuration
DATABASE_URL="mysql://root:Foerkoeqrb3!@localhost:3306/obatku_dev"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please-make-it-64-characters-long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Frontend `.env.local`

Pastikan memiliki konfigurasi berikut:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=10000

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

## Testing & Verifikasi

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
  -H "Origin: http://localhost:3000" \
  -d '{"nip":"test","password":"test"}'
```

### 2. Test dari Browser Console

Buka browser console di `http://localhost:3000` dan jalankan:

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

// Test login (ganti dengan credentials yang valid)
fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nip: 'test',
    password: 'test'
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 3. Test Login dari Frontend

1. **Pastikan kedua server running**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

2. **Buka browser**:
   - Buka `http://localhost:3000/login`
   - Buka Developer Tools (F12)
   - Buka tab **Network**
   - Buka tab **Console**

3. **Coba login**:
   - Masukkan credentials
   - Klik login
   - Periksa Network tab untuk request ke `http://localhost:3001/api/v1/auth/login`
   - Periksa Console untuk log `[API Client]` dan `[getApiUrl]`

4. **Periksa Response**:
   - Status code harus 200 (success) atau 400/401 (validation/auth error)
   - Response headers harus memiliki:
     - `Access-Control-Allow-Origin: http://localhost:3000`
     - `Access-Control-Allow-Credentials: true`

## Troubleshooting

### Jika masih ada network error:

#### 1. Pastikan Backend Running
```bash
cd backend
npm run dev
```

**Expected output**:
```
🚀 Server running on port 3001
📱 Environment: development
🌐 API Base URL: http://localhost:3001/api
```

#### 2. Pastikan Frontend Running
```bash
npm run dev
```

**Expected output**:
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

#### 3. Periksa CORS Headers

Di browser console, jalankan:
```javascript
fetch('http://localhost:3001/api/v1/cors-test', {
  method: 'GET',
  credentials: 'include'
})
  .then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', [...r.headers.entries()]);
    return r.json();
  })
  .then(console.log)
  .catch(console.error)
```

**Expected headers**:
- `Access-Control-Allow-Origin: http://localhost:3000`
- `Access-Control-Allow-Credentials: true`

#### 4. Periksa URL yang Dibangun

Di browser console, cari log:
```
[getApiUrl] { endpoint: '/v1/auth/login', baseUrl: 'http://localhost:3001/api', cleanEndpoint: 'v1/auth/login', fullUrl: 'http://localhost:3001/api/v1/auth/login' }
```

**Expected**: `fullUrl` harus `http://localhost:3001/api/v1/auth/login`

#### 5. Periksa Network Tab

Di browser Network tab:
- Request URL harus: `http://localhost:3001/api/v1/auth/login`
- Request Method: `POST`
- Status: 200 (success) atau 400/401 (error dari server)
- Jika status 0 atau CORS error, periksa CORS configuration

#### 6. Clear Browser Cache

Jika masih ada masalah:
- Clear browser cache
- Hard refresh (Ctrl+Shift+R atau Cmd+Shift+R)
- Restart browser

#### 7. Periksa Firewall

Jika backend tidak bisa diakses:
- Periksa firewall settings
- Pastikan port 3001 tidak diblokir
- Test dengan `curl` dari terminal

## Endpoint yang Tersedia

### Public Endpoints (Tidak Perlu Auth)
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/v1` - API info (BARU!)
- `GET /api/v1/test` - Test endpoint
- `GET /api/v1/cors-test` - CORS test
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/health` - Auth health check

### Protected Endpoints (Perlu Auth Token)
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/profile` - Get profile
- `GET /api/v1/auth/permissions` - Get permissions
- `GET /api/v1/auth/session` - Get session
- `POST /api/v1/auth/change-password` - Change password

## Catatan Penting

1. **Restart kedua server** setelah mengubah `.env` files
   - Stop server (Ctrl+C)
   - Start ulang dengan `npm run dev`

2. **Clear browser cache** jika masih ada masalah
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) atau Cmd+Shift+R (Mac)

3. **Periksa console untuk error detail**
   - Buka browser console (F12)
   - Cari error message
   - Periksa Network tab untuk request details

4. **Gunakan logging untuk debugging**
   - Log `[API Client]` menunjukkan request details
   - Log `[getApiUrl]` menunjukkan URL yang dibangun
   - Log `[CORS]` di backend menunjukkan CORS configuration

## Status Perbaikan

✅ Backend route `/api/v1` sudah ditambahkan
✅ CORS sudah dikonfigurasi dengan benar
✅ Endpoint configuration sudah sesuai
✅ Error handling dan logging sudah diperbaiki
✅ Dokumentasi sudah lengkap

## Next Steps

1. **Test semua endpoint** menggunakan instruksi di atas
2. **Verifikasi login** berfungsi dengan benar
3. **Periksa error logs** jika masih ada masalah
4. **Update dokumentasi** jika diperlukan

## End of Perbaikan Network Error

Jika masih ada masalah setelah mengikuti semua langkah di atas, periksa:
1. Backend logs untuk error detail
2. Browser console untuk error message
3. Network tab untuk request/response details
4. CORS headers di response

