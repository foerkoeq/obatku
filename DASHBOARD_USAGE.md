# 🎯 Dashboard Usage Guide

Panduan lengkap untuk menggunakan dashboard widget yang telah dibuat untuk aplikasi manajemen obat pertanian.

## 🚀 Quick Start

Dashboard sudah terintegrasi dan siap digunakan! Ketika Anda membuka `localhost:3000`, dashboard akan otomatis menampilkan widget-widget yang sesuai dengan role pengguna.

### Mengakses Dashboard
1. Jalankan aplikasi: `npm run dev`
2. Buka browser: `http://localhost:3000`
3. Dashboard akan langsung muncul dengan widget lengkap

## 👥 Testing Role Berbeda

Untuk testing dashboard dengan role yang berbeda, ubah konfigurasi di file dashboard:

### Lokasi File
`app/[locale]/(protected)/page.tsx`

### Cara Mengubah Role
```typescript
// Cari baris ini di file page.tsx:
const MOCK_USER = {
  role: 'admin' as UserRole, // 👈 Ubah di sini
  name: 'Admin User',
  district: 'Kabupaten Sragen'
};

// Opsi role yang tersedia:
// 'admin'  - Dashboard lengkap dengan semua widget
// 'ppl'    - Dashboard khusus untuk pengajuan
// 'dinas'  - Dashboard untuk persetujuan dan monitoring
// 'popt'   - Dashboard untuk management stok
```

## 📊 Widget yang Tersedia Per Role

### 🔑 Admin Role
**Akses:** Semua fitur dan widget
- **Row 1:** Total Stok | Transaksi Harian | Obat Expired | Total User
- **Row 2:** Stok Hampir Habis | Transaksi Bulanan | Obat Urgent | User Aktif  
- **Row 3:** Nilai Stok | Nilai Transaksi | Quick Actions

**Quick Actions:**
- ✅ Tambah Stok
- ✅ Kelola User  
- ✅ Laporan Stok
- ✅ Obat Kadaluarsa

### 👨‍🌾 PPL Role
**Akses:** Pengajuan dan riwayat transaksi
- **Row 1:** Total Pengajuan | Menunggu Persetujuan | Riwayat Transaksi
- **Row 2:** Pengajuan Disetujui | Pengajuan Ditolak | Quick Actions

**Quick Actions:**
- ✅ Buat Pengajuan

### 🏛️ Dinas Pertanian Role  
**Akses:** Monitoring dan persetujuan
- **Row 1:** Total Stok | Stok Hampir Habis | Transaksi Harian | Transaksi Bulanan
- **Row 2:** Obat Akan Expired | Obat Urgent | Quick Actions

**Quick Actions:**
- ✅ Persetujuan
- ✅ Laporan Stok
- ✅ Tambah Stok

### 🏭 POPT Role
**Akses:** Management stok dan distribusi
- **Row 1:** Total Stok | Stok Hampir Habis | Transaksi Harian | Transaksi Bulanan  
- **Row 2:** Obat Akan Expired | Obat Urgent | Quick Actions

**Quick Actions:**
- ✅ Tambah Stok
- ✅ Laporan Stok

## 🎨 Fitur Widget

### ✨ Interaktif
- **Klik Widget:** Navigasi ke halaman detail
- **Trend Indicators:** Panah naik/turun dengan persentase
- **Charts:** Mini charts untuk visualisasi data
- **Action Buttons:** Tombol aksi cepat pada setiap widget

### 📱 Responsive
- **Mobile:** Single column layout
- **Tablet:** 2-3 columns layout  
- **Desktop:** 4 columns layout

### 🔄 Real-time Ready
- **Loading States:** Skeleton loading saat data dimuat
- **Error Handling:** Graceful error states
- **Mock Data:** Data realistis untuk development

## 🛠️ Customization

### Mengubah Data Widget
Edit mock data di: `lib/data/dashboard-demo.ts`

```typescript
export const mockStockData = {
  totalStock: 1500,        // 👈 Ubah nilai
  lowStockCount: 12,       // 👈 Ubah nilai  
  stockValue: 150000000,   // 👈 Ubah nilai
  trend: 'up',
  trendPercentage: 15.5
};
```

### Menambah Quick Action Baru
Edit file: `lib/data/dashboard-demo.ts`

```typescript
export const mockQuickActions: QuickAction[] = [
  // Tambahkan action baru
  {
    id: 'new-action',
    title: 'Action Baru',
    description: 'Deskripsi action',
    icon: 'heroicons:plus',
    href: '/new-page',
    color: 'text-primary-600',
    bgColor: 'bg-primary-100',
    role: ['admin', 'popt'] // Role yang bisa akses
  }
];
```

### Mengubah Warna Chart
Edit di komponen widget:

```typescript
<StockWidget
  data={mockStockData}
  variant="total"
  chartColor="#10b981" // 👈 Ubah warna chart
/>
```

## 🔗 Navigasi

Widget akan otomatis navigate ke halaman yang sesuai saat diklik:

- **Stock Widgets** → `/inventory`
- **Transaction Widgets** → `/transactions/list` 
- **User Widgets** → `/users`
- **Quick Actions** → Sesuai href yang didefinisikan

## 🚨 Development Notes

### Mode Development
Dashboard menampilkan banner development mode yang menunjukkan role saat ini:

```
Mode Development: Dashboard untuk role "admin". 
Ubah MOCK_USER.role untuk melihat dashboard role lain.
```

### Future Integration
Untuk production, ganti `MOCK_USER` dengan:
- Session dari NextAuth
- Context dari authentication provider
- User data dari API

```typescript
// Contoh integrasi dengan NextAuth
import { useSession } from "next-auth/react";

const { data: session } = useSession();
const userRole = session?.user?.role as UserRole;
```

## 📋 Checklist Testing

- [ ] Dashboard admin menampilkan 8 widget + quick actions
- [ ] Dashboard PPL menampilkan 5 widget pengajuan + quick actions  
- [ ] Dashboard Dinas menampilkan 6 widget monitoring + quick actions
- [ ] Dashboard POPT menampilkan 6 widget stok + quick actions
- [ ] Semua widget dapat diklik dan navigate dengan benar
- [ ] Quick actions filter berdasarkan role
- [ ] Responsive di mobile, tablet, dan desktop
- [ ] Loading states bekerja dengan baik
- [ ] Trend indicators menampilkan data yang benar

## 🎉 Selesai!

Dashboard sudah siap digunakan dengan semua fitur yang diperlukan sesuai konsep aplikasi manajemen obat pertanian. Sistem widget ini modular, mudah di-maintenance, dan siap untuk integrasi dengan backend dan authentication system yang sesungguhnya. 