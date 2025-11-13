# Debug Network Error - Login Issue

## Masalah
Network error saat login dengan pesan: `ApiServiceError: Network error`

## Perbaikan yang Sudah Dilakukan

### 1. ✅ Konfigurasi API URL
- **File**: `lib/config/env.ts`
- **Perubahan**: Menggunakan URL backend langsung `http://localhost:3001/api` tanpa proxy
- **URL Final**: `http://localhost:3001/api/v1/auth/login`

### 2. ✅ CORS Configuration
- **File**: `backend/src/core/server/app.ts`
- **Perubahan**: 
  - CORS middleware dipindah sebelum body parsing
  - Menambahkan explicit OPTIONS handler
  - Development mode lebih permissive untuk debugging
  - Menambahkan logging untuk blocked origins

### 3. ✅ API Client Logging
- **File**: `lib/api/client.ts`
- **Perubahan**: Menambahkan detailed logging untuk:
  - Request details (method, URL, headers)
  - Response details (status, headers)
  - Error details (CORS errors, network errors)

### 4. ✅ Root Route Handler
- **File**: `backend/src/core/server/app.ts`
- **Perubahan**: Menambahkan handler untuk route `/` yang menampilkan info API

## Langkah Debugging

### 1. Cek Console Browser
Setelah restart frontend, coba login lagi dan periksa console browser untuk:
- `[getApiUrl]` - URL yang digunakan
- `[API Client] Making request` - Detail request
- `[API Client] Request failed` - Detail error

### 2. Cek Network Tab
Di browser DevTools → Network tab:
- Cari request ke `/api/v1/auth/login`
- Periksa:
  - Status code
  - Request URL (harus `http://localhost:3001/api/v1/auth/login`)
  - Request headers
  - Response headers (terutama CORS headers)
  - Response body

### 3. Cek Backend Logs
Di terminal backend, periksa apakah request sampai:
- Request log dari morgan
- CORS warning (jika ada)
- Error logs

### 4. Test Manual dengan curl
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"nip":"admin001","password":"yourpassword"}'
```

### 5. Test CORS Preflight
```bash
curl -X OPTIONS http://localhost:3001/api/v1/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

## Kemungkinan Masalah

### 1. CORS Preflight Gagal
**Gejala**: Request tidak pernah dikirim, langsung error
**Solusi**: Pastikan OPTIONS request di-handle dengan benar

### 2. URL Salah
**Gejala**: 404 Not Found
**Solusi**: Pastikan URL adalah `http://localhost:3001/api/v1/auth/login`

### 3. Backend Tidak Running
**Gejala**: Connection refused
**Solusi**: Pastikan backend berjalan di port 3001

### 4. Format Request Body Salah
**Gejala**: 400 Bad Request
**Solusi**: Pastikan format adalah `{nip: string, password: string}`

## Checklist

- [ ] Backend running di port 3001
- [ ] Frontend running di port 3000
- [ ] Console browser menunjukkan URL yang benar
- [ ] Network tab menunjukkan request yang dikirim
- [ ] Backend logs menunjukkan request diterima
- [ ] CORS headers ada di response
- [ ] Format request body sesuai (nip, bukan email)

## Next Steps

1. Restart kedua server (frontend & backend)
2. Buka browser console
3. Coba login
4. Periksa semua log yang muncul
5. Share hasil debugging untuk analisis lebih lanjut

