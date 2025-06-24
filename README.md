# Sistem Manajemen Stok Obat-Obatan Pertanian

Aplikasi web untuk pencatatan internal gudang dan transaksi keluar masuk obat berdasarkan permintaan. Dibangun dengan Next.js, Tailwind CSS, dan komponen UI yang modular.

## 🚀 Fitur Utama

### Menu Sidebar
- **Dashboard** - Halaman utama dengan ringkasan data
- **Inventori/Data Stok Obat** - Manajemen data stok obat-obatan
- **Transaksi** - Sistem transaksi dengan sub-menu:
  - Daftar Transaksi
  - Pengajuan (untuk role PPL)
  - Persetujuan (untuk role Dinas)
  - Transaksi Keluar
- **Pengguna** - Manajemen user dengan sub-menu:
  - Manajemen Pengguna
  - Peran Pengguna
- **Pengaturan** - Konfigurasi sistem
- **Keluar/Sign Out** - Logout dari sistem

### Role Pengguna
- **Administrator** - Akses penuh ke semua fitur
- **PPL (Penyuluh Pertanian Lapangan)** - Dapat membuat pengajuan
- **Dinas Pertanian** - Dapat menyetujui pengajuan
- **Gudang** - Manajemen stok dan transaksi keluar

## 🛠️ Teknologi

- **Framework**: Next.js 15 dengan App Router
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Internationalization**: next-intl
- **Icons**: Heroicons
- **State Management**: React Hooks
- **Authentication**: NextAuth.js (direncanakan)

## 📁 Struktur Proyek

```
obatku-1/
├── app/
│   └── [locale]/
│       └── (protected)/
│           ├── layout.tsx
│           └── page.tsx
├── components/
│   ├── partials/
│   │   ├── sidebar/
│   │   │   ├── menu/
│   │   │   │   ├── menu-classic.tsx
│   │   │   │   └── index.tsx
│   │   │   └── common/
│   │   │       ├── collapse-menu-button.tsx
│   │   │       └── classic-multi-collapse-button.tsx
│   │   └── header/
│   └── ui/
├── lib/
│   ├── menus.ts          # Konfigurasi menu sidebar
│   └── utils.ts
├── messages/
│   ├── en.json           # Bahasa Inggris
│   ├── ar.json           # Bahasa Arab
│   └── id.json           # Bahasa Indonesia
├── config/
│   └── index.ts          # Konfigurasi locales
└── providers/
```

## 🎨 Komponen Sidebar

### Struktur Menu
Menu sidebar menggunakan struktur data yang modular:

```typescript
export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
};

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};
```

### Fitur Sidebar
- **Collapsible Menu** - Menu dapat di-collapse/expand
- **Multi-level Navigation** - Mendukung sub-menu bertingkat
- **Responsive Design** - Menyesuaikan dengan ukuran layar
- **Internationalization** - Mendukung multi-bahasa
- **Active State** - Menunjukkan halaman aktif
- **Icon Support** - Menggunakan Heroicons

## 🌐 Internationalization

Aplikasi mendukung 3 bahasa:
- **English (en)** - Bahasa default
- **Arabic (ar)** - Bahasa Arab
- **Indonesian (id)** - Bahasa Indonesia

### Menambah Terjemahan Baru
1. Edit file `messages/[locale].json`
2. Tambahkan key-value pair untuk terjemahan
3. Gunakan `useTranslations()` hook untuk mengakses terjemahan

## 🔧 Konfigurasi

### Menambah Menu Baru
1. Edit file `lib/menus.ts`
2. Tambahkan menu baru ke array `getMenuList()`
3. Tambahkan terjemahan di file bahasa yang sesuai
4. Pastikan icon menggunakan format Heroicons

### Contoh Menambah Menu:
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

## 🚀 Cara Menjalankan

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment variables**:
   ```bash
   cp .env.example .env.local
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📝 Catatan Pengembangan

### Error yang Sudah Diperbaiki
- **TypeError: Cannot read properties of undefined (reading 'some')**
  - Penyebab: Submenu array undefined
  - Solusi: Menambahkan pengecekan `submenus || []`

- **ClientFetchError: Unexpected token '<'**
  - Penyebab: NextAuth.js configuration issue
  - Solusi: Perlu setup NextAuth.js dengan benar

### Best Practices
1. **Modular Components** - Setiap komponen dibuat terpisah dan reusable
2. **Type Safety** - Menggunakan TypeScript untuk type checking
3. **Internationalization** - Semua teks menggunakan sistem i18n
4. **Responsive Design** - Menggunakan Tailwind CSS untuk responsive layout
5. **Accessibility** - Mengikuti standar a11y

## 🔮 Roadmap

### Phase 1: Foundation ✅
- [x] Setup Next.js dengan App Router
- [x] Konfigurasi Tailwind CSS dan Shadcn/ui
- [x] Implementasi sidebar menu
- [x] Setup internationalization
- [x] Struktur menu untuk sistem manajemen stok

### Phase 2: Authentication & Authorization
- [ ] Setup NextAuth.js
- [ ] Implementasi role-based access control
- [ ] Halaman login/logout
- [ ] Middleware untuk proteksi route

### Phase 3: Core Features
- [ ] Dashboard dengan statistik
- [ ] CRUD untuk data stok obat
- [ ] Sistem transaksi
- [ ] Manajemen pengguna

### Phase 4: Advanced Features
- [ ] Laporan dan analytics
- [ ] Export/import data
- [ ] Notifikasi sistem
- [ ] Backup dan restore

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Kontak

- **Email**: [your-email@example.com]
- **Project Link**: [https://github.com/your-username/obatku-1]

---

**Note**: Template ini menggunakan Dashcode - Admin Dashboard Template yang telah dimodifikasi untuk kebutuhan sistem manajemen stok obat-obatan pertanian.
