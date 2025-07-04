# Dashboard Widgets

Kumpulan widget dashboard yang telah dibuat untuk aplikasi manajemen obat pertanian. Widgets ini dirancang untuk berbagai role pengguna dan mengikuti design system yang konsisten.

## Struktur dan Komponen

### Base Components

#### `DashboardWidget`
Base component yang dapat digunakan untuk semua jenis widget dashboard.

**Props:**
- `title`: string - Judul widget
- `icon`: string - Icon Heroicons
- `value`: string | number - Nilai utama yang ditampilkan
- `subtitle`: string - Subtitle atau keterangan
- `trend`: object - Informasi trend (direction, percentage, label)
- `chartData`: number[] - Data untuk chart
- `chartColor`: string - Warna chart
- `actionButton`: object - Button aksi (label, onClick)
- `className`: string - Custom CSS classes
- `loading`: boolean - Loading state

**Contoh Penggunaan:**
```tsx
<DashboardWidget
  title="Total Stok Obat"
  icon="heroicons:archive-box"
  value={1250}
  subtitle="Total obat di gudang"
  trend={{
    direction: 'up',
    percentage: 12.5,
    label: 'vs bulan lalu'
  }}
  chartData={[120, 132, 101, 134, 90, 230, 210]}
  chartColor="#0ea5e9"
  actionButton={{
    label: "Lihat Detail",
    onClick: () => console.log("Action clicked")
  }}
/>
```

### Specific Widgets

#### `StockWidget`
Widget untuk menampilkan informasi stok obat.

**Variants:**
- `total`: Total stok obat
- `low-stock`: Obat dengan stok hampir habis
- `value`: Nilai total stok dalam rupiah

**Props:**
```tsx
interface StockWidgetProps {
  data: StockWidgetData;
  variant?: 'total' | 'low-stock' | 'value';
  onActionClick?: () => void;
  className?: string;
  loading?: boolean;
}
```

#### `TransactionWidget`
Widget untuk menampilkan informasi transaksi.

**Variants:**
- `daily`: Transaksi hari ini
- `monthly`: Transaksi bulan ini
- `value`: Nilai total transaksi

#### `ExpiringDrugsWidget`
Widget untuk menampilkan informasi obat yang akan kadaluarsa.

**Variants:**
- `expiring-soon`: Obat yang akan kadaluarsa dalam 30 hari
- `expired`: Obat yang sudah kadaluarsa
- `urgent`: Obat yang akan kadaluarsa dalam 7 hari

#### `SubmissionWidget`
Widget untuk menampilkan informasi pengajuan (khusus role PPL).

**Variants:**
- `total`: Total semua pengajuan
- `pending`: Pengajuan yang menunggu persetujuan
- `approved`: Pengajuan yang disetujui
- `rejected`: Pengajuan yang ditolak

#### `UserWidget`
Widget untuk menampilkan informasi pengguna (khusus role admin).

**Variants:**
- `total`: Total semua pengguna
- `active`: Pengguna yang aktif
- `new`: Pengguna baru
- `by-role`: Distribusi pengguna berdasarkan role

#### `QuickActionsWidget`
Widget untuk menampilkan tombol aksi cepat berdasarkan role pengguna.

**Props:**
```tsx
interface QuickActionsWidgetProps {
  actions: QuickAction[];
  userRole: string;
  maxActions?: number;
  layout?: 'grid' | 'list';
  onActionClick?: (action: QuickAction) => void;
}
```

## Role-based Widget Distribution

### Admin Role
- Semua widget stok (total, low-stock, value)
- Semua widget transaksi (daily, monthly, value)
- Semua widget obat kadaluarsa (expiring-soon, urgent)
- Semua widget user management (total, active, new, by-role)
- Quick actions: Add stock, User management, Reports, Settings

### PPL Role
- Widget pengajuan (total, pending, approved, rejected)
- Widget transaksi (monthly - untuk melihat history)
- Quick actions: Create submission, View submissions, Check status

### Dinas Pertanian Role
- Widget stok (total, low-stock)
- Widget transaksi (daily, monthly)
- Widget obat kadaluarsa (expiring-soon, urgent)
- Quick actions: Approve submissions, View reports, Add stock

### POPT Role
- Widget stok (total, low-stock, value)
- Widget transaksi (daily, monthly, value)
- Widget obat kadaluarsa (expiring-soon, urgent)
- Quick actions: Add stock, Manage transactions, Reports

## Mock Data

Semua widget menggunakan mock data yang realistis untuk development dan testing. Mock data tersedia di `@/lib/data/dashboard-demo.ts`:

- `mockStockData`: Data stok obat
- `mockTransactionData`: Data transaksi
- `mockExpiringDrugsData`: Data obat kadaluarsa
- `mockSubmissionData`: Data pengajuan
- `mockUserData`: Data pengguna
- `mockQuickActions`: Data quick actions
- `mockChartData`: Data chart untuk berbagai periode

## Type Definitions

Semua types didefinisikan di `@/lib/types/dashboard.ts`:

- `BaseWidgetProps`: Props dasar untuk semua widget
- `DashboardWidgetProps`: Props untuk base DashboardWidget
- `StockWidgetData`: Interface untuk data stok
- `TransactionWidgetData`: Interface untuk data transaksi
- `ExpiringDrugsData`: Interface untuk data obat kadaluarsa
- `SubmissionWidgetData`: Interface untuk data pengajuan
- `UserWidgetData`: Interface untuk data pengguna
- `QuickAction`: Interface untuk quick actions

## Responsive Design

Semua widget menggunakan Tailwind CSS dengan pendekatan mobile-first:

- **Mobile (< 640px)**: Single column layout
- **Tablet (640px - 1024px)**: 2-3 columns layout
- **Desktop (> 1024px)**: 4 columns layout untuk widgets utama

## Styling Guidelines

### Colors
- Primary: `#3b82f6` (blue)
- Success: `#10b981` (emerald)
- Warning: `#f59e0b` (amber)
- Danger: `#ef4444` (red)
- Info: `#06b6d4` (cyan)

### Icons
Menggunakan Heroicons melalui `@iconify/react`:
- Stock: `heroicons:archive-box`
- Transaction: `heroicons:arrow-right-circle`
- Warning: `heroicons:exclamation-triangle`
- User: `heroicons:users`
- Clock: `heroicons:clock`

## Installation & Usage

1. Import widget yang dibutuhkan:
```tsx
import { StockWidget, TransactionWidget } from '@/components/blocks';
```

2. Import mock data:
```tsx
import { mockStockData, mockTransactionData } from '@/lib/data/dashboard-demo';
```

3. Gunakan dalam component:
```tsx
<StockWidget
  data={mockStockData}
  variant="total"
  onActionClick={() => router.push('/inventory')}
/>
```

## Features

- ✅ **Type Safe**: Full TypeScript support
- ✅ **Responsive**: Mobile-first design
- ✅ **Role-based**: Different widgets for different user roles
- ✅ **Interactive**: Charts dan action buttons
- ✅ **Loading States**: Skeleton loading components
- ✅ **Customizable**: Flexible props dan styling
- ✅ **Accessible**: Following accessibility best practices
- ✅ **Performance**: Optimized dengan lazy loading charts
- ✅ **Consistent**: Following design system
- ✅ **Modular**: Easy to extend dan customize

## Future Enhancements

- [ ] Real-time data updates
- [ ] More chart types (pie, donut, bar)
- [ ] Animation transitions
- [ ] Export functionality
- [ ] Drill-down capabilities
- [ ] Advanced filtering
- [ ] Custom date ranges
- [ ] Notification integration 