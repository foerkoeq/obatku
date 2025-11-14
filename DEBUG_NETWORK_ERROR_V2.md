# Debug Network Error - Versi 2

## Perbaikan Error Handling

Error handling sudah diperbaiki untuk menangkap detail error dengan lebih baik. Sekarang error logging akan menampilkan:

1. **Error properties lengkap**: name, message, stack, cause, code, errno
2. **Request info**: url, method, endpoint, baseURL
3. **Error type info**: errorType, isError
4. **Raw error object**: untuk debugging lebih lanjut
5. **Stringified error**: dengan semua properties

## Testing Steps

### 1. Restart Frontend

Setelah perubahan, restart frontend untuk memastikan kode baru ter-load:

```bash
# Stop frontend (Ctrl+C)
# Start ulang
npm run dev
```

### 2. Clear Browser Cache

Clear cache browser untuk memastikan tidak ada cached code:

- **Chrome/Edge**: Ctrl+Shift+Delete → Clear cached images and files
- **Firefox**: Ctrl+Shift+Delete → Cache
- Atau gunakan **Hard Refresh**: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)

### 3. Test Login dan Periksa Console

1. Buka `http://localhost:3000/login`
2. Buka Developer Tools (F12)
3. Buka tab **Console**
4. Coba login
5. **Periksa log berikut**:

#### Log yang Diharapkan:

```
[API Client] Making request: {
  method: "POST",
  url: "http://localhost:3001/api/v1/auth/login",
  endpoint: "/v1/auth/login",
  baseURL: "http://localhost:3001/api",
  ...
}
```

#### Jika Error, Akan Muncul:

```
[API Client] Request failed - Full error info: {
  name: "TypeError",
  message: "Failed to fetch",
  url: "http://localhost:3001/api/v1/auth/login",
  ...
}

[API Client] Raw error object: TypeError: Failed to fetch

[API Client] Error stringified: {...}
```

### 4. Periksa Network Tab

Di browser Network tab:
- Cari request ke `http://localhost:3001/api/v1/auth/login`
- Periksa:
  - **Status**: 200 (success), 400/401 (error dari server), atau 0/CORS (network error)
  - **Request Headers**: Pastikan ada `Content-Type: application/json`
  - **Response Headers**: Jika ada, pastikan ada CORS headers

### 5. Test dengan curl

Test backend langsung dari terminal:

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"nip":"test","password":"test"}'
```

**Expected**: Response dari backend (bisa 400/401 jika credentials salah, tapi harus ada response)

## Kemungkinan Masalah

### 1. Error "Failed to fetch"

**Penyebab**:
- Backend tidak running
- Backend tidak bisa diakses dari browser
- CORS error (tapi biasanya ada pesan CORS spesifik)

**Solusi**:
- Pastikan backend running: `cd backend && npm run dev`
- Test dengan curl (lihat di atas)
- Periksa firewall/antivirus

### 2. Error CORS

**Penyebab**:
- CORS_ORIGIN di backend tidak mencakup `http://localhost:3000`

**Solusi**:
- Periksa `backend/.env.local`:
  ```env
  CORS_ORIGIN=http://localhost:3000
  ```
- Restart backend setelah mengubah .env

### 3. Error Timeout

**Penyebab**:
- Backend terlalu lama merespons
- Backend tidak running

**Solusi**:
- Periksa backend logs untuk error
- Test dengan curl untuk melihat response time

### 4. Error 400/401 dari Backend

**Penyebab**:
- Request body tidak valid
- Credentials salah
- Validation error

**Solusi**:
- Ini bukan network error, tapi error dari backend
- Periksa response body untuk detail error
- Periksa request body yang dikirim

## Informasi yang Dibutuhkan

Setelah test, kirimkan informasi berikut:

1. **Log dari Console**:
   - `[API Client] Making request:` - URL yang dipanggil
   - `[API Client] Request failed - Full error info:` - Detail error
   - `[API Client] Raw error object:` - Error object
   - `[API Client] Error stringified:` - Error yang di-stringify

2. **Network Tab Info**:
   - Status code
   - Request URL
   - Request headers
   - Response headers (jika ada)
   - Response body (jika ada)

3. **Backend Logs**:
   - Apakah request sampai ke backend?
   - Error apa yang muncul di backend?

4. **Test curl Result**:
   - Hasil dari test curl di atas

## Next Steps

Setelah mendapatkan error detail yang lengkap, kita bisa:
1. Identifikasi masalah spesifik
2. Perbaiki konfigurasi yang salah
3. Test ulang sampai berhasil

