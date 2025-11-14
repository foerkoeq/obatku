# 🔧 Network Error Troubleshooting Guide

## Start of Network Error Troubleshooting Documentation

Dokumentasi ini menjelaskan cara mengatasi network error antara frontend dan backend.

---

## 📋 Daftar Isi

1. [Penyebab Umum Network Error](#penyebab-umum-network-error)
2. [Langkah-langkah Troubleshooting](#langkah-langkah-troubleshooting)
3. [Verifikasi Konfigurasi](#verifikasi-konfigurasi)
4. [Testing Koneksi Backend](#testing-koneksi-backend)
5. [Error Messages yang Umum](#error-messages-yang-umum)

---

## 🔍 Penyebab Umum Network Error

### 1. Backend Tidak Berjalan
- Backend tidak dijalankan dengan `npm run dev`
- Backend crash atau error saat startup
- Port 3001 sudah digunakan oleh aplikasi lain

### 2. Konfigurasi Environment Salah
- URL backend di `.env` frontend tidak sesuai
- CORS_ORIGIN di backend tidak mencakup origin frontend
- Port tidak sesuai antara frontend dan backend

### 3. CORS Error
- Backend tidak mengizinkan request dari origin frontend
- Konfigurasi CORS di backend salah

### 4. Network/Firewall Issues
- Firewall memblokir koneksi
- Antivirus memblokir localhost connection
- VPN atau proxy mengganggu koneksi

---

## 🛠️ Langkah-langkah Troubleshooting

### Step 1: Verifikasi Backend Berjalan

```bash
# Di folder backend
cd backend
npm run dev
```

**Pastikan:**
- ✅ Tidak ada error saat startup
- ✅ Server berjalan di port 3001
- ✅ Console menampilkan: "Server running on http://localhost:3001"

**Test manual:**
```bash
# Buka browser atau gunakan curl
curl http://localhost:3001/health
# Harus mengembalikan JSON response
```

### Step 2: Verifikasi Konfigurasi Environment

#### Frontend `.env` atau `.env.local`:
```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

#### Backend `.env.local`:
```env
NODE_ENV=development
PORT=3001
HOST=localhost
CORS_ORIGIN=http://localhost:3000
```

**Pastikan:**
- ✅ Port di backend (3001) sesuai dengan URL di frontend
- ✅ CORS_ORIGIN mencakup `http://localhost:3000`
- ✅ Tidak ada typo di URL

### Step 3: Test Koneksi Menggunakan Browser DevTools

1. Buka browser DevTools (F12)
2. Buka tab **Network**
3. Coba login
4. Periksa request yang gagal:
   - **Status**: Apakah 0, CORS error, atau timeout?
   - **URL**: Apakah URL benar?
   - **Headers**: Apakah request headers lengkap?

### Step 4: Periksa Console Logs

#### Frontend Console:
- Cari log `[API Client] Making request:`
- Cari log `[API Client] Request failed:`
- Periksa error message yang detail

#### Backend Console:
- Cari log `[CORS]` untuk melihat CORS issues
- Periksa apakah request sampai ke backend
- Periksa error logs

### Step 5: Test Menggunakan Utility Health Check

Gunakan utility health check yang sudah disediakan:

```typescript
import { testBackendConnectivity } from '@/lib/utils/backend-health-check';

// Di component atau page
const testConnection = async () => {
  const result = await testBackendConnectivity();
  console.log('Backend connectivity test:', result);
  
  if (!result.summary.allPassed) {
    console.error('Issues found:', result.summary.issues);
  }
};
```

---

## ✅ Verifikasi Konfigurasi

### Checklist Konfigurasi

#### Frontend:
- [ ] `.env` atau `.env.local` ada di root folder frontend
- [ ] `NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001/api`
- [ ] `NEXT_PUBLIC_BACKEND_URL=http://localhost:3001`
- [ ] Restart dev server setelah mengubah `.env`

#### Backend:
- [ ] `.env.local` ada di folder `backend`
- [ ] `PORT=3001`
- [ ] `CORS_ORIGIN=http://localhost:3000`
- [ ] `NODE_ENV=development`
- [ ] Restart backend setelah mengubah `.env.local`

### Verifikasi Port

```bash
# Windows PowerShell
netstat -ano | findstr :3001
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3001
lsof -i :3000
```

Pastikan:
- Port 3001 digunakan oleh backend Node.js
- Port 3000 digunakan oleh Next.js frontend
- Tidak ada konflik port

---

## 🧪 Testing Koneksi Backend

### Manual Test dengan curl

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test API endpoint
curl http://localhost:3001/api/v1/test

# Test dengan CORS (simulasi browser request)
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3001/api/v1/auth/login
```

### Test dengan Browser

1. Buka browser console
2. Jalankan:
```javascript
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## 📝 Error Messages yang Umum

### 1. "Failed to fetch" / "NetworkError"

**Penyebab:**
- Backend tidak berjalan
- URL backend salah
- Firewall memblokir koneksi

**Solusi:**
1. Pastikan backend berjalan: `cd backend && npm run dev`
2. Verifikasi URL di `.env` frontend
3. Test dengan curl: `curl http://localhost:3001/health`

### 2. "CORS Error"

**Penyebab:**
- CORS_ORIGIN di backend tidak mencakup origin frontend
- Backend tidak mengizinkan credentials

**Solusi:**
1. Pastikan `CORS_ORIGIN=http://localhost:3000` di backend `.env.local`
2. Restart backend setelah mengubah `.env.local`
3. Periksa log backend untuk melihat origin yang diblokir

### 3. "Request timeout"

**Penyebab:**
- Backend lambat merespons
- Backend hang atau stuck
- Timeout terlalu pendek

**Solusi:**
1. Periksa log backend untuk melihat apakah request sampai
2. Periksa apakah ada proses yang blocking di backend
3. Increase timeout di frontend (default: 10000ms)

### 4. "401 Unauthorized"

**Penyebab:**
- Token tidak valid
- Token expired
- Tidak ada token di request

**Solusi:**
1. Pastikan login berhasil dan token tersimpan
2. Periksa localStorage untuk token
3. Coba logout dan login lagi

---

## 🔧 Quick Fixes

### Fix 1: Restart Semua Services

```bash
# Stop semua proses
# Windows: Ctrl+C di terminal
# Linux/Mac: Ctrl+C

# Start backend
cd backend
npm run dev

# Start frontend (terminal baru)
cd .. # atau cd frontend
npm run dev
```

### Fix 2: Clear Browser Cache & LocalStorage

```javascript
// Di browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Fix 3: Verifikasi Environment Variables

```bash
# Frontend - pastikan NEXT_PUBLIC_* variables ter-load
# Di browser console:
console.log(process.env.NEXT_PUBLIC_BACKEND_API_URL);

# Backend - pastikan variables ter-load
# Di backend console, cek log saat startup
```

### Fix 4: Test dengan Postman/Insomnia

1. Test endpoint langsung dengan Postman:
   - URL: `http://localhost:3001/api/v1/auth/login`
   - Method: POST
   - Body: `{ "nip": "ADMIN001", "password": "password" }`
   
2. Jika berhasil di Postman tapi tidak di browser:
   - Kemungkinan CORS issue
   - Periksa CORS configuration di backend

---

## 📊 Debugging Tips

### 1. Enable Detailed Logging

Frontend sudah otomatis log di development mode. Pastikan:
- `NODE_ENV=development` di frontend
- Console browser terbuka

Backend logging:
- Periksa file `backend/logs/app.log`
- Periksa console output

### 2. Network Tab Analysis

Di browser DevTools Network tab:
- **Status**: 0 = network error, CORS = CORS issue
- **Type**: xhr/fetch = API request
- **Headers**: Periksa Request Headers dan Response Headers
- **Preview/Response**: Lihat response dari backend

### 3. Backend Logs Analysis

Cari di backend logs:
- `[CORS]` - CORS related logs
- Request logs - apakah request sampai ke backend
- Error stack traces

---

## 🎯 Common Solutions

### Solution 1: Backend Tidak Berjalan

```bash
# Di folder backend
npm run dev

# Pastikan output:
# ✅ Server running on http://localhost:3001
# ✅ Database connected
# ✅ Routes configured successfully
```

### Solution 2: CORS Issue

**Backend `.env.local`:**
```env
CORS_ORIGIN=http://localhost:3000
```

**Restart backend** setelah mengubah `.env.local`

### Solution 3: Port Conflict

```bash
# Cek port yang digunakan
netstat -ano | findstr :3001

# Kill process jika perlu (Windows)
taskkill /PID <PID> /F

# Atau ubah port di backend .env.local
PORT=3002
# Dan update frontend .env juga
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3002/api
```

### Solution 4: Environment Variables Tidak Ter-load

**Frontend:**
- Pastikan file `.env.local` ada di root
- Restart dev server: `npm run dev`
- Variables harus prefix `NEXT_PUBLIC_` untuk client-side

**Backend:**
- Pastikan file `.env.local` ada di folder `backend`
- Restart backend: `npm run dev`
- Periksa apakah variables ter-load di startup logs

---

## 📞 Still Having Issues?

Jika masih mengalami masalah setelah mengikuti langkah-langkah di atas:

1. **Periksa semua logs:**
   - Browser console
   - Backend console
   - Backend log files

2. **Test dengan tools eksternal:**
   - Postman/Insomnia untuk test API
   - curl untuk test connectivity

3. **Verifikasi setup:**
   - Node.js version
   - npm packages ter-install
   - Database connection (jika diperlukan)

4. **Check untuk updates:**
   - Pastikan semua dependencies ter-update
   - Periksa apakah ada breaking changes

---

## End of Network Error Troubleshooting Documentation

