# Fix Validation Error - NIP Format Issue

## Masalah yang Ditemukan

✅ **Network connection sudah bekerja dengan baik!** 
- Request berhasil sampai ke backend (status 200 di Network tab)
- Backend merespons dengan status 400 (Bad Request)
- **Ini BUKAN network error, tapi validation error!**

### Root Cause

Backend validation schema mengharapkan:
- **NIP**: Harus berupa **angka saja** (`regex(/^[0-9]+$/)`)
- **Password**: String dengan min 1 karakter

Tapi frontend mengirim:
- **NIP**: `"admin@obatku.local"` ❌ (format email, bukan angka)
- **Password**: `"password123"` ✅

### Error Response dari Backend

```json
{
  "success": false,
  "error": {
    "code": "HTTP_400",
    "message": "Validation failed",
    "details": {
      "errors": [
        "body.nip: NIP hanya boleh berisi angka"
      ]
    }
  },
  "meta": {
    "timestamp": "2025-11-14T04:20:20.465Z"
  }
}
```

## Solusi

### 1. Perbaiki Format NIP di Frontend

NIP harus berupa **angka saja**, bukan email. Contoh:
- ✅ `"1234567890"` (angka)
- ❌ `"admin@obatku.local"` (email format)

### 2. Error Handling Sudah Diperbaiki

Error handling sudah diperbaiki untuk menampilkan validation errors dengan lebih baik:
- Menampilkan validation errors di console
- Menampilkan error message yang lebih informatif
- Menampilkan full error details untuk debugging

### 3. Test dengan NIP yang Benar

Coba login dengan NIP yang berupa angka, contoh:
- NIP: `1234567890` (atau NIP yang valid di database)
- Password: `password123` (atau password yang valid)

## Testing

### 1. Periksa Response di Network Tab

Di browser Network tab, klik request ke `/api/v1/auth/login`, lalu:
- Buka tab **Response** atau **Preview**
- Periksa error message dan validation errors

### 2. Periksa Console untuk Validation Errors

Setelah perbaikan, console akan menampilkan:
```
[API Client] Validation errors: [
  "body.nip: NIP hanya boleh berisi angka"
]
```

### 3. Test dengan curl

Test dengan NIP yang benar (angka):

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"nip":"1234567890","password":"password123"}'
```

**Expected**: Response dari backend (bisa 400/401 jika credentials salah, tapi harus ada validation error yang jelas)

## Backend Validation Schema

Dari `backend/src/features/auth/auth.validation.ts`:

```typescript
nip: z
  .string()
  .min(1, 'NIP tidak boleh kosong')
  .max(50, 'NIP maksimal 50 karakter')
  .regex(/^[0-9]+$/, 'NIP hanya boleh berisi angka')  // ← INI!
  .trim(),
```

**Kesimpulan**: NIP harus berupa angka saja, bukan email atau format lain.

## Next Steps

1. **Perbaiki form login** untuk menggunakan NIP (angka) bukan email
2. **Test dengan NIP yang valid** dari database
3. **Periksa validation errors** di console untuk debugging

## Status

✅ Network connection sudah bekerja
✅ Error handling sudah diperbaiki
✅ Validation errors akan ditampilkan dengan jelas
⏳ Perlu perbaiki format NIP di frontend

