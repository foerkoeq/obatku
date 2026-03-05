# Frontend-only Dummy Data Notes

Mode frontend-only sekarang aktif default lewat `NEXT_PUBLIC_FRONTEND_ONLY_MODE=true`.

## Sumber dummy data yang dipakai

- `lib/data/inventory-demo.ts`
- `lib/data/user-demo.ts`
- `lib/data/transaction-demo.ts`
- `lib/data/tuban-data.ts`
- `lib/data/settings-demo.ts`
- Router dummy terpusat: `lib/api/mock-router.ts`

## Endpoint yang sudah disiapkan dummy

- Auth: login, logout, refresh, profile, change password, reset password
- Users: list/detail/create/update/delete, bulk status/delete, roles, permissions, stats, profile update
- Inventory: medicines, stock, categories, suppliers, stats, stock adjustment, upload image
- Transactions: submit/list/detail, approve/process/complete, upload, report transaksi
- Master data: farmer groups, commodities, pest types, districts, villages
- Export: users dan inventory (CSV blob dummy)

## Dummy data yang BELUM ada (masih fallback generic)

Berikut endpoint yang belum punya struktur dummy spesifik, jadi saat dipanggil akan kena fallback umum dari `mock-router`:

- Berita Acara
  - `/v1/berita-acara`
  - `/v1/berita-acara/templates`
  - `/v1/berita-acara/generate`
- System Management
  - `/v1/system/settings`
  - `/v1/system/logs`
  - `/v1/system/backup`
  - `/v1/system/health`
- Dashboard
  - `/v1/dashboard/stats`
  - `/v1/dashboard/recent-transactions`
  - `/v1/dashboard/low-stock`
  - `/v1/dashboard/sales-chart`
- Reports (selain transaksi)
  - `/v1/reports/sales`
  - `/v1/reports/inventory`
  - `/v1/reports/expiry`
- Inventory expiry endpoint khusus
  - `/v1/inventory/expiry`

## Catatan

- Fallback generic tetap mengembalikan response `success: true` agar UI tidak putus, tetapi `data` bisa `null`.
- Kalau halaman tertentu butuh shape data spesifik, tambahkan mapping endpoint tersebut di `lib/api/mock-router.ts`.
- Untuk halaman pengaturan frontend-only, preferensi aplikasi sementara menggunakan mock lokal dari `lib/data/settings-demo.ts`.
