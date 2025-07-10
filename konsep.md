# FRONTEND APLIKASI MANAJEMEN OBAT PERTANIAN 
## KONTEKS PROYEK 
Saya membutuhkan bantuan untuk membuat frontend aplikasi web manajemen obat pertanian 
menggunakan Next.js 15 (App Router) + Tailwind CSS. Aplikasi ini berfungsi untuk: 
• Mencatat stok obat pertanian di gudang 
• proses transaksi keluar (pengajuan dari role user PPL, persetujuan dari role user Dinas, pencatatan keluar gudang oleh role staff/dinas)
• Tracking keluar masuk obat (bukan e-commerce, hanya pencatatan) 
• Manajemen user dengan role-based access 
• Responsif untuk digunakan di berbagai device (mobile-first approach) 
STACK TEKNOLOGI YANG DIGUNAKAN 
• Frontend: Next.js 15 (App Router) + Tailwind CSS 
• Backend: Node.js + Express.js + MySQL (akan dibuat terpisah) 
• State Management: React hooks (useState, useEffect, useContext) 
• Authentication: JWT-based authentication 

### Role Pengguna
- **Administrator** - Akses penuh ke semua fitur
- **PPL (Penyuluh Pertanian Lapangan)** - Dapat membuat pengajuan, Melihat list obat tanpa bisa menambahkan obat, dapat melihat list transaksi tapi hanya list yang telah diajukan untuk melihat history atau progress.
- **Dinas Pertanian** - Dapat menyetujui pengajuan
- **POPT** - Manajemen stok dan transaksi keluar

### REQUIREMENT HALAMAN & FITUR 
1. HALAMAN AUTENTIKASI 
• Login Page (/login) 
o Form login dengan email/username dan password 
o Remember me checkbox 
o Responsive design dengan logo aplikasi 
o Error handling untuk login gagal 
o Success handling dengan toast untuk login berhasil 

2. HALAMAN DASHBOARD (/dashboard) 
• Widget Summary Cards:
Untuk role Dinas Pertanian / POPT : 
o Total stok obat 
o Obat hampir habis (< 10 unit) 
o Transaksi hari ini 
o Transaksi bulan ini 
o Obat expired dalam 30 hari 
• Recent Activities: Log aktivitas terbaru (masuk/keluar obat) 
• Quick Actions: Tombol cepat untuk fitur utama 
• Chart/Graph: Grafik stok bulanan (gunakan library chart yang simple) 
untuk role PPL :
o Total transaksi
o riwayat pengajuan
o progress pengajuan
untuk role admin
semua widget dengan tambahan widget user dan pengaturan web

3. HALAMAN DATA STOK OBAT (/inventory) 
• user role PPL hanya bisa melihat saja tanpa bisa mengedit,hapus atau tambah.
• Data Table dengan fitur: 
o Search/filter obat 
o Sort berdasarkan nama, kategori, stok, expired date, jenis OPT 
o Pagination 
o setiap row bisa di klik untuk keluar modal detail
o Status indicator (stok normal/hampir habis/expired) 
• Action Buttons: Edit, Delete, View Detail 
• Export Data: Button untuk export ke PDF, Excel, Print,CSV. Jika di klik muncul modal pilihan 
data yang akan diexport, data yang saat ini tampil saja atau seluruh data atau data 
berdasarkan filter. 
• Cetak QR code : cetak barcode sesuai data yang terpilih atau sesuai data berdasarkan filter. 
Ada 2 tipe QR code, QR code untuk pack besar seperti kardus dll. dan barcode per item. 


4. HALAMAN TAMBAH OBAT (/inventory/add) 
• Form Input dengan field: 
o Nama obat (required) 
o Produsen Obat 
o Kandungan
o Kategori/jenis obat (dropdown) 
o Supplier/sumber (dropdown atau input) 
o Jumlah stok awal (number) 
o Satuan (kg, liter, botol, dll) 
o Jumlah dalam kemasan besar 
o Satuan dalam jumlah kemasan besar (dus,box,pack) 
o Jumlah dalam 1 kemasan besar 
o Tanggal masuk (date picker) 
o Tanggal expired (date picker) 
o Harga per unit (optional) 
o Jenis OPT (textbox dengan opsi tambah) 
o Lokasi penyimpanan 
o Catatan/deskripsi (textarea) 
• Form Validation: Client-side validation 
• Success/Error Handling: Toast notification 

5. HALAMAN EDIT STOK (/inventory/[id]) 
• Form Edit: Similar dengan form tambah tapi pre-filled 
• History Log: Riwayat perubahan stok obat tersebut 
• Adjustment Stock: Fitur untuk adjust stok (tambah/kurang dengan alasan)

6. HALAMAN TRANSAKSI MASUK (/transactions/in) 
• Form Transaksi Masuk: 
o Pilih obat (searchable dropdown) 
o Jumlah masuk 
o Supplier/sumber 
o Tanggal transaksi 
o Catatan 
• History Transaksi Masuk: Table dengan filter tanggal 

7. HALAMAN TRANSAKSI KELUAR (/transactions/out) 
• Form Transaksi Keluar: 
o Nomor Surat Permintaan 
o Permintaan Oleh 
o Kecamatan 
o Pilih obat (dengan info stok tersedia) 
o Jumlah keluar 
o Tujuan/penerima (petani/petugas) 
o Tanggal transaksi 
o Catatan 
• History Transaksi Keluar: Table dengan filter tanggal 

8. HALAMAN USER MANAGEMENT (/users) - Admin Only 
• User List Table: Daftar user dengan role (admin only) 
• Add User Form: Form tambah user baru (admin only) 
• Edit User: Edit info user dan role 
• User Activity Log: Log aktivitas user 

9. HALAMAN PENGATURAN (/settings) 
• Profile Settings: Edit profile user 
• App Settings: Pengaturan aplikasi (kategori obat, supplier, dll) 
• Backup/Export: Fitur backup data (admin only) 
• System Info: Info versi aplikasi 

10. HALAMAN LAPORAN (/reports) 
• Stock Report: Laporan stok per periode 
• Transaction Report: Laporan transaksi masuk/keluar 
• Low Stock Alert: Daftar obat yang perlu restock 
• Expired Drug Alert: Daftar obat yang akan/sudah expired 

11. HALAMAN LIST TRANSAKSI (/transaction/list)
• Data Table dengan fitur: 
o Search/filter Transaksi 
o Sort berdasarkan row 
o Pagination 
o setiap row bisa di klik untuk keluar modal detail
• Action Buttons: Delete, View Detail 
• Export Data: Button untuk export ke PDF, Excel, Print,CSV. Jika di klik muncul modal pilihan 
data yang akan diexport, data yang saat ini tampil saja atau seluruh data atau data 
berdasarkan filter. 

12. HALAMAN PENGAJUAN (/transaction/submission)
• Form Input dengan field :
o Nama Kelompok Tani
o Ketua Kelompok Tani
o Komoditas
o Luas Lahan
o Jenis OPT 
o file upload surat pengajuan (wajib)

13. HALAMAN DETAIL PENGAJUAN (/transaction/[id]/detail)
• berisi informasi detail tentang pengajuan permintaan obat
• progres atau status pengajuan
• feedback dari dinas, disetujui ditolak atau catatan

14. HALAMAN PERSETUJUAN (/transaction/approval)
• list atau card waiting list persetujuan permintaan obat
• ketika di klik langsung ke detail permintaan dengan preview surat pengajuan
• approval dengan memilih jenis obat yang akan diberikan (tidak wajib) dan catatan ke ppl dan catatan ke gudang.


### DESIGN REQUIREMENTS 
UX/UI Principles 
• Mobile-First Design: Prioritas untuk mobile, kemudian desktop 
• Clean & Minimalist: Tidak terlalu ramai, fokus pada fungsi 
• Consistent Spacing: Gunakan Tailwind spacing yang konsisten 
• Clear Navigation: Sidebar untuk desktop, bottom nav untuk mobile 
• Loading States: Skeleton loading untuk semua data fetching 
• Error States: User-friendly error messages 
• Success Feedback: Toast notifications untuk aksi berhasil 
Responsive Breakpoints 
• Mobile: < 640px (sidebar collapse, stack layout) 
• Tablet: 640px - 1024px (sidebar semi-collapse) 
• Desktop: > 1024px (full sidebar, multi-column layout) 

3. Component Styling Patterns 
Consistent Styling Approach: 
1. Use CSS Variables for theming - Easy to change globally 
2. Combine with Tailwind classes - Best of both worlds 
3. Component-specific classes - For complex styling 
4. Responsive modifiers - Mobile-first approach 

4. Maintenance Benefits 
• Centralized theming - Change colors in one place 
• Consistent spacing - No more random pixel values 
• Easy dark mode - Just override CSS variables 
• Future-proof - Easy to extend and modify 
• Developer-friendly - Clear naming conventions 

 

### DOKUMENTASI CODE YANG DIBUTUHKAN 
Setiap komponen dan fungsi harus memiliki dokumentasi dengan format: 
typescript 
// # START OF [Nama Komponen/Fungsi] - [Deskripsi singkat] 
// Purpose: [Tujuan komponen/fungsi] 
// Props/Params: [Daftar props atau parameter] 
// Returns: [Apa yang dikembalikan] 
// Dependencies: [Library atau komponen lain yang digunakan] 

 

[Code here] 

 

// # END OF [Nama Komponen/Fungsi] 

### FUNCTIONAL REQUIREMENTS 
1. Authentication & Authorization 
• JWT token handling 
• Protected routes 
• Role-based access control (Admin, User) 

2. State Management 
• Global state untuk user authentication 
• Local state untuk form handling 
• Context API untuk shared data 

3. Data Handling 
• API integration dengan error handling 
• Form validation (client-side) 
• Optimistic updates untuk better UX 
• Caching untuk frequently used data 

4. Performance Optimization 
• Lazy loading untuk routes 
• Image optimization 
• Debounced search 
• Pagination untuk large datasets 

### SPECIFIC REQUESTS 
3. Mobile-first approach dengan breakpoints yang jelas 
4. TypeScript untuk type safety 
5. Dokumentasi lengkap pada setiap file dengan format yang sudah ditentukan 
6. Error boundaries untuk handle unexpected errors 
7. Loading states yang smooth dan informatif 
8. Form validation yang user-friendly 
9. Consistent styling menggunakan Tailwind utility classes 
10. Future Proof 

