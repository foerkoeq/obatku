# Dokumentasi Sidebar - Sistem Manajemen Stok Obat Pertanian

## 📋 Ringkasan

Sidebar telah berhasil dikonfigurasi dengan menu-menu yang sesuai untuk sistem manajemen stok obat-obatan pertanian. Menu menggunakan struktur modular dan mendukung multi-bahasa.

## 🎯 Menu yang Telah Ditambahkan

### 1. Dashboard
- **Path**: `/`
- **Icon**: `heroicons-outline:home`
- **Fungsi**: Halaman utama dengan ringkasan data

### 2. Inventori
- **Path**: `/inventory/stock-data`
- **Icon**: `heroicons-outline:cube`
- **Fungsi**: Manajemen data stok obat-obatan

### 3. Transaksi (dengan Sub-menu)
- **Path**: `/transactions`
- **Icon**: `heroicons-outline:document-text`
- **Sub-menu**:
  - **Daftar Transaksi** (`/transactions/list`) - Icon: `heroicons-outline:list-bullet`
  - **Pengajuan** (`/transactions/request`) - Icon: `heroicons-outline:document-plus`
  - **Persetujuan** (`/transactions/approval`) - Icon: `heroicons-outline:check-circle`
  - **Transaksi Keluar** (`/transactions/out`) - Icon: `heroicons-outline:arrow-right`

### 4. Pengguna (dengan Sub-menu)
- **Path**: `/users`
- **Icon**: `heroicons-outline:users`
- **Sub-menu**:
  - **Manajemen Pengguna** (`/users/management`) - Icon: `heroicons-outline:user-group`
  - **Peran Pengguna** (`/users/roles`) - Icon: `heroicons-outline:shield-check`

### 5. Pengaturan
- **Path**: `/settings`
- **Icon**: `heroicons-outline:cog-6-tooth`
- **Fungsi**: Konfigurasi sistem

### 6. Keluar/Sign Out
- **Path**: `/auth/logout`
- **Icon**: `heroicons-outline:arrow-right-on-rectangle`
- **Fungsi**: Logout dari sistem

## 🌐 Dukungan Bahasa

### Bahasa Indonesia (id.json)
```json
{
  "Menu": {
    "dashboard": "Dashboard",
    "inventory": "Inventori",
    "stock_data": "Data Stok Obat",
    "transactions": "Transaksi",
    "transaction_list": "Daftar Transaksi",
    "transaction_request": "Pengajuan",
    "transaction_approval": "Persetujuan",
    "transaction_out": "Transaksi Keluar",
    "users": "Pengguna",
    "user_management": "Manajemen Pengguna",
    "user_roles": "Peran Pengguna",
    "settings": "Pengaturan",
    "sign_out": "Keluar / Sign Out"
  }
}
```

### Bahasa Inggris (en.json)
```json
{
  "Menu": {
    "dashboard": "Dashboard",
    "inventory": "Inventory",
    "stock_data": "Stock Data",
    "transactions": "Transactions",
    "transaction_list": "Transaction List",
    "transaction_request": "Request",
    "transaction_approval": "Approval",
    "transaction_out": "Transaction Out",
    "users": "Users",
    "user_management": "User Management",
    "user_roles": "User Roles",
    "settings": "Settings",
    "sign_out": "Sign Out"
  }
}
```

### Bahasa Arab (ar.json)
```json
{
  "Menu": {
    "dashboard": "لوحة التحكم",
    "inventory": "المخزون",
    "stock_data": "بيانات المخزون",
    "transactions": "المعاملات",
    "transaction_list": "قائمة المعاملات",
    "transaction_request": "طلب",
    "transaction_approval": "موافقة",
    "transaction_out": "معاملة خروج",
    "users": "المستخدمون",
    "user_management": "إدارة المستخدمين",
    "user_roles": "أدوار المستخدمين",
    "settings": "الإعدادات",
    "sign_out": "تسجيل الخروج"
  }
}
```

## 🔧 Konfigurasi File

### 1. lib/menus.ts
File utama untuk konfigurasi menu sidebar. Berisi struktur data menu dan fungsi untuk mendapatkan daftar menu.

### 2. config/index.ts
```typescript
export const locales = ['en', 'ar', 'id'];
```

### 3. components/partials/sidebar/
- `menu/menu-classic.tsx` - Komponen menu utama
- `common/collapse-menu-button.tsx` - Komponen untuk menu collapse
- `common/classic-multi-collapse-button.tsx` - Komponen untuk multi-level menu

## 🐛 Error yang Telah Diperbaiki

### 1. TypeError: Cannot read properties of undefined (reading 'some')
**Penyebab**: Submenu array undefined saat diakses
**Solusi**: Menambahkan pengecekan `submenus || []`

**File yang diperbaiki**:
- `components/partials/sidebar/common/classic-multi-collapse-button.tsx`
- `components/partials/sidebar/common/collapse-menu-button.tsx`

**Perubahan**:
```typescript
// Sebelum
const isSubmenuActive = submenus.some((submenu) => submenu.active);

// Sesudah
const safeSubmenus = submenus || [];
const isSubmenuActive = safeSubmenus.some((submenu) => submenu.active);
```

### 2. Struktur Data Menu
**Penyebab**: Perbedaan struktur antara `SubChildren` dan `Submenu`
**Solusi**: Menambahkan property `children: []` ke semua submenu

**Perubahan di lib/menus.ts**:
```typescript
{
  href: "/transactions/list",
  label: t("transaction_list"),
  active: pathname.includes("/transactions/list"),
  icon: "heroicons-outline:list-bullet",
  submenus: [],
  children: [], // Ditambahkan
}
```

## 🎨 Fitur Sidebar

### 1. Collapsible Menu
- Menu dengan sub-menu dapat di-collapse/expand
- Menggunakan komponen `Collapsible` dari Shadcn/ui
- Animasi smooth saat collapse/expand

### 2. Active State
- Menu aktif ditandai dengan background color berbeda
- Sub-menu aktif juga ditandai dengan indikator visual
- Menggunakan `pathname.includes()` untuk deteksi halaman aktif

### 3. Responsive Design
- Sidebar menyesuaikan dengan ukuran layar
- Pada mobile, sidebar dapat disembunyikan
- Collapse state disimpan dalam konfigurasi

### 4. Icon Support
- Menggunakan Heroicons outline
- Format: `heroicons-outline:icon-name`
- Icon ditampilkan di sebelah kiri label menu

### 5. Internationalization
- Mendukung 3 bahasa: EN, AR, ID
- Menggunakan `useTranslations()` hook
- Terjemahan disimpan dalam file JSON terpisah

## 📝 Cara Menambah Menu Baru

### 1. Tambah Terjemahan
Edit file `messages/id.json`:
```json
{
  "Menu": {
    "new_menu": "Menu Baru"
  }
}
```

### 2. Tambah ke Konfigurasi Menu
Edit file `lib/menus.ts`:
```typescript
{
  id: "new_menu",
  href: "/new-menu",
  label: t("new_menu"),
  active: pathname.includes("/new-menu"),
  icon: "heroicons-outline:new-icon",
  submenus: [],
}
```

### 3. Tambah Sub-menu (Opsional)
```typescript
{
  id: "parent_menu",
  href: "/parent",
  label: t("parent_menu"),
  active: pathname.includes("/parent"),
  icon: "heroicons-outline:parent-icon",
  submenus: [
    {
      href: "/parent/child",
      label: t("child_menu"),
      active: pathname.includes("/parent/child"),
      icon: "heroicons-outline:child-icon",
      submenus: [],
      children: [],
    }
  ],
}
```

## 🔮 Langkah Selanjutnya

### 1. Membuat Halaman
- Buat halaman untuk setiap menu yang telah dikonfigurasi
- Implementasi CRUD untuk data stok obat
- Implementasi sistem transaksi

### 2. Authentication
- Setup NextAuth.js
- Implementasi role-based access control
- Proteksi route berdasarkan role

### 3. Database
- Setup database (PostgreSQL/MySQL)
- Implementasi model data
- API endpoints untuk CRUD operations

### 4. Testing
- Unit testing untuk komponen sidebar
- Integration testing untuk menu navigation
- E2E testing untuk user flow

## 📞 Support

Jika ada masalah dengan sidebar atau menu, periksa:
1. Console browser untuk error JavaScript
2. Network tab untuk error API
3. File konfigurasi menu di `lib/menus.ts`
4. File terjemahan di `messages/`

---

**Catatan**: Sidebar ini menggunakan template Dashcode yang telah dimodifikasi untuk kebutuhan sistem manajemen stok obat-obatan pertanian. 