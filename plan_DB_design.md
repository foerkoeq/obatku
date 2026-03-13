# OBATKU — Database Design Document
**Sistem Distribusi & Manajemen Obat Pertanian**
_Version 1.0 | Draft_

---

## Skema Database Lengkap & Final

---

## A. Tabel Master / Basic

### `tbl_role`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| roles | VARCHAR(50) | NOT NULL, UNIQUE | UQ | Contoh: admin, popt, bpp, dinas |
| deskripsi | VARCHAR(255) | NULL | - | Penjelasan role (opsional) |
| is_active | TINYINT(1) | DEFAULT 1 | - | 1=aktif, 0=nonaktif |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_pangkat`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| pangkat | VARCHAR(100) | NOT NULL, UNIQUE | UQ | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_golongan`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| pangkat_id | INT UNSIGNED | FK -> tbl_pangkat.id | IDX | Relasi ke pangkat |
| golongan | VARCHAR(10) | NOT NULL | IDX | Contoh: III/a, III/b |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_kecamatan`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kecamatan | VARCHAR(100) | NOT NULL, UNIQUE | UQ | |
| kode_kecamatan | VARCHAR(20) | NULL, UNIQUE | UQ | Kode BPS jika diperlukan |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_desa`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kecamatan_id | INT UNSIGNED | FK -> tbl_kecamatan.id | IDX | |
| desa | VARCHAR(100) | NOT NULL | IDX | |
| kode_desa | VARCHAR(20) | NULL | - | Kode BPS jika diperlukan |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_user`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| nip | VARCHAR(30) | UNIQUE, NULL | UQ | NULL jika non-PNS |
| username | VARCHAR(50) | NOT NULL, UNIQUE | UQ | Untuk login |
| password | VARCHAR(255) | NOT NULL | - | Bcrypt hash — JANGAN plain text |
| email | VARCHAR(150) | UNIQUE, NULL | UQ | |
| phone | VARCHAR(20) | NULL | - | |
| nama | VARCHAR(150) | NOT NULL | IDX | |
| ttl | DATE | NULL | - | Tanggal lahir |
| pangkat_id | INT UNSIGNED | FK -> tbl_pangkat.id, NULL | IDX | |
| golongan_id | INT UNSIGNED | FK -> tbl_golongan.id, NULL | IDX | |
| jabatan | VARCHAR(100) | NULL | - | |
| alamat | TEXT | NULL | - | |
| foto_profil | VARCHAR(255) | NULL | - | Path file, contoh: uploads/user/123.jpg |
| role_id | INT UNSIGNED | FK -> tbl_role.id, NOT NULL | IDX | |
| kecamatan_id | INT UNSIGNED | FK -> tbl_kecamatan.id, NULL | IDX | Lokasi penugasan |
| status | ENUM('aktif','nonaktif') | DEFAULT 'aktif' | IDX | |
| last_login | TIMESTAMP | NULL | - | Untuk audit keamanan |
| email_verified_at | TIMESTAMP | NULL | - | Untuk verifikasi email |
| created_by | INT UNSIGNED | FK -> tbl_user.id, NULL | IDX | Siapa yang input user ini |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |
| deleted_at | TIMESTAMP | NULL | - | Soft delete |

> ⚠ Password wajib di-hash menggunakan bcrypt atau Argon2 — JANGAN simpan plain text.
> ⚠ Tambahkan indeks komposit `(role_id, status)` untuk query filter user aktif per role.
> ⚠ `deleted_at NULL` = aktif, `deleted_at IS NOT NULL` = sudah dihapus (soft delete).

---

## B. Tabel Master Obat

### `tbl_kategori_obat`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kategori_obat | VARCHAR(100) | NOT NULL, UNIQUE | UQ | Contoh: Pestisida, Fungisida, Herbisida |
| kode | VARCHAR(100) | UNIQUE, NOT NULL | UQ | Kode untuk QRcode labeling |
| is_active | TINYINT(1) | DEFAULT 1 | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_jenis_obat`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kategori_obat_id | INT UNSIGNED | FK -> tbl_kategori_obat.id | IDX | |
| jenis_obat | VARCHAR(100) | NOT NULL | IDX | |
| kode | VARCHAR(100) | UNIQUE, NOT NULL | UQ | Kode untuk QRcode labeling |
| is_active | TINYINT(1) | DEFAULT 1 | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_kandungan_obat`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| jenis_obat_id | INT UNSIGNED | FK -> tbl_jenis_obat.id | IDX | |
| kandungan_obat | VARCHAR(200) | NOT NULL | IDX | Bahan aktif, contoh: Klorantraniliprol 50 g/L |
| kode | VARCHAR(100) | UNIQUE, NOT NULL | UQ | Kode untuk QRcode labeling |
| is_active | TINYINT(1) | DEFAULT 1 | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_merek_obat`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kategori_obat_id | INT UNSIGNED | FK -> tbl_kategori_obat.id | IDX | |
| jenis_obat_id | INT UNSIGNED | FK -> tbl_jenis_obat.id | IDX | |
| kandungan_obat_id | INT UNSIGNED | FK -> tbl_kandungan_obat.id, NULL | IDX | |
| merek_obat | VARCHAR(150) | NOT NULL | IDX | |
| produsen | VARCHAR(150) | NULL | - | Nama produsen/distributor |
| kode | VARCHAR(100) | NOT NULL, UNIQUE | UQ | Kode untuk QRcode labeling |
| is_active | TINYINT(1) | DEFAULT 1 | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_satuan`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| satuan | VARCHAR(30) | NOT NULL, UNIQUE | UQ | Contoh: ml, liter, gram, kg, sachet, botol |
| tipe | ENUM('kecil','besar') | NOT NULL | IDX | Gabung tbl_satuan_kecil dan tbl_satuan_besar |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_sumber_pendanaan`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| sumber_pendanaan | VARCHAR(100) | NOT NULL, UNIQUE | UQ | Contoh: APBD, APBN, Bantuan Provinsi, DAK |
| kode | VARCHAR(100) | NOT NULL, UNIQUE | UQ | Kode untuk QRcode labeling |
| tahun_anggaran | YEAR | NULL | - | |
| is_active | TINYINT(1) | DEFAULT 1 | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

## C. Tabel Inventori Obat

### `tbl_inventori_obat`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | ID batch penerimaan |
| merek_obat_id | INT UNSIGNED | FK -> tbl_merek_obat.id | IDX | |
| sumber_pendanaan_id | INT UNSIGNED | FK -> tbl_sumber_pendanaan.id | IDX | |
| no_batch | VARCHAR(50) | NULL | IDX | |
| tanggal_masuk | DATE | NOT NULL | IDX | |
| stok_awal_satuan | INT UNSIGNED | NOT NULL | - | Stok masuk dalam satuan kecil |
| satuan_kecil_id | INT UNSIGNED | FK -> tbl_satuan.id | IDX | |
| harga_satuan | DECIMAL(15,2) | NOT NULL | - | Pakai DECIMAL, bukan FLOAT/INT |
| stok_awal_besar | INT UNSIGNED | NULL | - | Stok masuk dalam satuan besar |
| satuan_besar_id | INT UNSIGNED | FK -> tbl_satuan.id, NULL | IDX | |
| konversi_kecil_per_besar | INT UNSIGNED | NULL | - | Berapa satuan kecil per satuan besar |
| tanggal_kadaluarsa | DATE | NOT NULL | IDX | Wajib — untuk alert expired |
| catatan | TEXT | NULL | - | |
| foto_satuan | VARCHAR(255) | NULL | - | Path foto satuan kecil |
| foto_besar | VARCHAR(255) | NULL | - | Path foto satuan besar |
| created_by | INT UNSIGNED | FK -> tbl_user.id | IDX | Siapa yang input |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

> ⚠ Gunakan `DECIMAL(15,2)` untuk harga, BUKAN `FLOAT` (menghindari error pembulatan).
> ⚠ Kolom stok di tabel ini adalah stok MASUK (penerimaan). Stok real-time dihitung dari `inventori - transaksi_keluar`.
> ⚠ `no_batch` sangat penting untuk recall produk jika ada masalah kualitas.
> ⚠ `tanggal_kadaluarsa` wajib diisi — buat scheduler/cron yang kirim notifikasi jika < 30/60/90 hari.

---

## D. Tabel Komoditas & OPT

### `tbl_kategori_komoditas`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kategori_komoditas | VARCHAR(100) | NOT NULL, UNIQUE | UQ | Contoh: Tanaman Pangan, Hortikultura, Perkebunan |
| is_active | TINYINT(1) | DEFAULT 1 | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_komoditas`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kategori_komoditas_id | INT UNSIGNED | FK -> tbl_kategori_komoditas.id | IDX | |
| komoditas | VARCHAR(100) | NOT NULL | IDX | Contoh: Padi Sawah, Jagung, Cabai |
| is_active | TINYINT(1) | DEFAULT 1 | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_kategori_opt`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kategori_opt | VARCHAR(100) | NOT NULL, UNIQUE | UQ | Contoh: Hama, Penyakit, Gulma |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_opt`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kategori_komoditas_id | INT UNSIGNED | FK -> tbl_kategori_komoditas.id | IDX | |
| komoditas_id | INT UNSIGNED | FK -> tbl_komoditas.id | IDX | |
| kategori_opt_id | INT UNSIGNED | FK -> tbl_kategori_opt.id | IDX | |
| opt | VARCHAR(150) | NOT NULL | IDX | Nama OPT, contoh: Wereng Batang Coklat |
| is_active | TINYINT(1) | DEFAULT 1 | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_dosis_obat`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| merek_obat_id | INT UNSIGNED | FK -> tbl_merek_obat.id | IDX | |
| komoditas_id | INT UNSIGNED | FK -> tbl_komoditas.id | IDX | |
| opt_id | INT UNSIGNED | FK -> tbl_opt.id, NULL | IDX | NULL jika dosis generik komoditas |
| jumlah_dosis | DECIMAL(10,3) | NOT NULL | - | Jumlah dosis per satuan lahan |
| satuan_dosis_id | INT UNSIGNED | FK -> tbl_satuan.id | IDX | |
| efektif_lahan | DECIMAL(10,2) | NOT NULL | - | Luas lahan (ha) yang bisa dilayani |
| satuan_lahan | VARCHAR(20) | DEFAULT 'ha' | - | |
| catatan | TEXT | NULL | - | Cara aplikasi, waktu semprot, dll |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

> ⚠ Tabel ini menjadi referensi otomatis saat BPP input pengajuan — sistem bisa hitung estimasi kebutuhan obat dari luas serangan.

---

## E. Tabel Lokasi & Penyimpanan Gudang

### `tbl_gudang`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | Rename dari tbl_lokasi_gudang |
| nama_gudang | VARCHAR(150) | NOT NULL | IDX | |
| alamat | TEXT | NULL | - | |
| is_active | TINYINT(1) | DEFAULT 1 | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_tempat_penyimpanan`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | Contoh: Ruang A, Ruang B |
| gudang_id | INT UNSIGNED | FK -> tbl_gudang.id | IDX | |
| nama_lorong | VARCHAR(100) | NOT NULL | IDX | |
| deskripsi | TEXT | NULL | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_rak`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | Contoh: Rak A1, Rak B3 |
| gudang_id | INT UNSIGNED | FK -> tbl_gudang.id | IDX | |
| tempat_penyimpanan_id | INT UNSIGNED | FK -> tbl_tempat_penyimpanan.id | IDX | |
| kode_rak | VARCHAR(30) | NOT NULL | IDX | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_lokasi_penyimpanan`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | Lokasi spesifik 1 batch obat |
| inventori_obat_id | INT UNSIGNED | FK -> tbl_inventori_obat.id | IDX | Relasi ke batch masuk |
| rak_id | INT UNSIGNED | FK -> tbl_rak.id | IDX | |
| stok_di_lokasi_besar | INT | NOT NULL DEFAULT 0 | - | Stok saat ini di lokasi ini |
| satuan_besar_id | INT UNSIGNED | FK -> tbl_satuan.id, NULL | IDX | |
| catatan | VARCHAR(255) | NULL | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

> ⚠ Tabel ini tracking posisi fisik stok. Setiap kali ada pengeluaran, update `stok_di_lokasi`.

---

## F. Tabel Petani & Kelompok Tani

### `tbl_gapoktan`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kecamatan_id | INT UNSIGNED | FK -> tbl_kecamatan.id | IDX | |
| nama_gapoktan | VARCHAR(150) | NOT NULL | IDX | |
| nama_ketua | VARCHAR(150) | NOT NULL | - | |
| nik_ketua | VARCHAR(20) | NULL | IDX | |
| phone_ketua | VARCHAR(20) | NULL | - | |
| is_active | TINYINT(1) | DEFAULT 1 | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_poktan`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kecamatan_id | INT UNSIGNED | FK -> tbl_kecamatan.id | IDX | |
| desa_id | INT UNSIGNED | FK -> tbl_desa.id | IDX | |
| gapoktan_id | INT UNSIGNED | FK -> tbl_gapoktan.id, NULL | IDX | NULL jika mandiri |
| nama_poktan | VARCHAR(150) | NOT NULL | IDX | |
| nama_ketua | VARCHAR(150) | NOT NULL | - | |
| nik_ketua | VARCHAR(20) | NULL | IDX | |
| phone_ketua | VARCHAR(20) | NULL | - | |
| luas_lahan_total | DECIMAL(10,2) | NULL | - | Ha, opsional tapi berguna |
| is_active | TINYINT(1) | DEFAULT 1 | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

## G. Tabel Pengajuan & Distribusi

### `tbl_surat_pengajuan_bpp`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| user_id | INT UNSIGNED | FK -> tbl_user.id | IDX | BPP yang kirim surat |
| kecamatan_id | INT UNSIGNED | FK -> tbl_kecamatan.id | IDX | |
| nomor_surat | VARCHAR(100) | NOT NULL, UNIQUE | UQ | |
| tanggal_surat | DATE | NOT NULL | - | |
| file_surat | VARCHAR(255) | NOT NULL | - | Path file upload |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_rekomendasi_popt`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| user_id | INT UNSIGNED | FK -> tbl_user.id | IDX | POPT yang buat rekomendasi |
| kecamatan_id | INT UNSIGNED | FK -> tbl_kecamatan.id | IDX | |
| nomor_surat | VARCHAR(100) | NOT NULL, UNIQUE | UQ | |
| tanggal_surat | DATE | NOT NULL | - | |
| file_surat | VARCHAR(255) | NOT NULL | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

### `tbl_pengajuan`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kode_pengajuan | VARCHAR(30) | NOT NULL, UNIQUE | UQ | Generate otomatis: PGJ-2024-0001 |
| kecamatan_id | INT UNSIGNED | FK -> tbl_kecamatan.id | IDX | |
| desa_id | INT UNSIGNED | FK -> tbl_desa.id, NULL | IDX | |
| gapoktan_id | INT UNSIGNED | FK -> tbl_gapoktan.id, NULL | IDX | |
| poktan_id | INT UNSIGNED | FK -> tbl_poktan.id, NULL | IDX | |
| komoditas_id | INT UNSIGNED | FK -> tbl_komoditas.id | IDX | |
| luas_serangan | DECIMAL(10,2) | NULL | - | Ha |
| luas_waspada | DECIMAL(10,2) | NULL | - | Ha |
| opt_id | INT UNSIGNED | FK -> tbl_opt.id | IDX | |
| merek_obat_id | INT UNSIGNED | FK -> tbl_merek_obat.id, NULL | IDX | Tidak wajib, yang menentukan dinas |
| jumlah_diminta | DECIMAL(10,2) | NULL | - | Tidak wajib, yang menentukan dinas |
| satuan_id | INT UNSIGNED | FK -> tbl_satuan.id | IDX | |
| surat_pengajuan_id | INT UNSIGNED | FK -> tbl_surat_pengajuan_bpp.id, NULL | IDX | |
| rekomendasi_popt_id | INT UNSIGNED | FK -> tbl_rekomendasi_popt.id, NULL | IDX | |
| dokumen_pendukung | VARCHAR(255) | NULL | - | Path file tambahan |
| status | ENUM('draft','diajukan','disetujui','ditolak','gudang','selesai') | DEFAULT 'draft' | IDX | |
| catatan | TEXT | NULL | - | |
| catatan_penolakan | TEXT | NULL | - | Alasan jika ditolak |
| created_by | INT UNSIGNED | FK -> tbl_user.id | IDX | BPP yang input |
| verified_by | INT UNSIGNED | FK -> tbl_user.id, NULL | IDX | Siapa yang verifikasi |
| verified_at | TIMESTAMP | NULL | - | |
| approved_by | INT UNSIGNED | FK -> tbl_user.id, NULL | IDX | Siapa yang setuju |
| approved_at | TIMESTAMP | NULL | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

> ⚠ `kode_pengajuan` generate otomatis untuk memudahkan tracking dan referensi di dokumen.
> ⚠ Status ENUM lengkap memungkinkan tracking alur kerja: BPP input → POPT verifikasi → Dinas setuju → Distribusi.
> ⚠ Kolom `approved_by` dan `verified_by` memungkinkan audit trail siapa yang approve.

---

### `tbl_transaksi_keluar`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| kode_transaksi | VARCHAR(30) | NOT NULL, UNIQUE | UQ | Generate otomatis: TRX-OUT-2024-0001 |
| pengajuan_id | INT UNSIGNED | FK -> tbl_pengajuan.id, NULL | IDX | NULL jika keluar tanpa pengajuan |
| inventori_obat_id | INT UNSIGNED | FK -> tbl_inventori_obat.id | IDX | Dari batch mana |
| tanggal_keluar | DATE | NOT NULL | IDX | |
| jumlah_keluar_satuan | INT | NOT NULL | - | Dalam satuan kecil |
| satuan_id | INT UNSIGNED | FK -> tbl_satuan.id | IDX | |
| penerima_poktan_id | INT UNSIGNED | FK -> tbl_poktan.id, NULL | IDX | |
| penerima_gapoktan_id | INT UNSIGNED | FK -> tbl_gapoktan.id, NULL | IDX | |
| nama_penerima | VARCHAR(150) | NULL | - | Jika penerima bukan poktan/gapoktan |
| diterima_oleh | VARCHAR(150) | NULL | - | Nama orang yang tanda tangan terima |
| keterangan | ENUM('distribusi','penghapusan','pengembalian','sample') | DEFAULT 'distribusi' | IDX | Tipe keluar |
| catatan | TEXT | NULL | - | |
| berita_acara_id | INT UNSIGNED | FK -> tbl_berita_acara.id, NULL | IDX | Link ke BA |
| created_by | INT UNSIGNED | FK -> tbl_user.id | IDX | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

> ⚠ Tabel ini adalah **JANTUNG sistem stok**. Setiap baris = 1 kejadian pengeluaran obat.
> ⚠ Stok tersedia = `SUM(inventori.stok_awal) - SUM(transaksi_keluar.jumlah_keluar)` per merek_obat.
> ⚠ Kolom `keterangan` memisahkan distribusi normal vs penghapusan vs pengembalian untuk laporan.
> ⚠ Selalu gunakan **DATABASE TRANSACTION** saat insert ke sini untuk hindari race condition stok negatif.

---

## H. Tabel Dokumen & Berita Acara

### `tbl_template_dokumen`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| nama_template | VARCHAR(150) | NOT NULL | IDX | Contoh: BA Penyerahan Obat, Label QR Satuan |
| tipe | ENUM('berita_acara','label_qr','surat','laporan') | NOT NULL | IDX | |
| isi_template | LONGTEXT | NOT NULL | - | HTML/Twig/Blade template dengan variabel |
| variabel_tersedia | TEXT | NULL | - | JSON list variabel yang bisa dipakai |
| is_active | TINYINT(1) | DEFAULT 1 | - | |
| created_by | INT UNSIGNED | FK -> tbl_user.id | IDX | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

> ⚠ Gabungkan template BA dan template QR Label menjadi satu tabel `tbl_template_dokumen` dengan kolom `tipe`.

---

### `tbl_berita_acara`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| nomor_ba | VARCHAR(100) | NOT NULL, UNIQUE | UQ | |
| tanggal_ba | DATE | NOT NULL | - | |
| tipe_ba | ENUM('penyerahan','penghapusan','stock_opname','lainnya') | NOT NULL | IDX | |
| template_id | INT UNSIGNED | FK -> tbl_template_dokumen.id | IDX | |
| transaksi_keluar_id | INT UNSIGNED | FK -> tbl_transaksi_keluar.id, NULL | IDX | |
| pengajuan_id | INT UNSIGNED | FK -> tbl_pengajuan.id, NULL | IDX | |
| isi_ba | LONGTEXT | NULL | - | HTML rendered final dari template |
| file_ba | VARCHAR(255) | NULL | - | Path PDF yang sudah digenerate |
| status | ENUM('draft','final','ditandatangani') | DEFAULT 'draft' | IDX | |
| signed_by | INT UNSIGNED | FK -> tbl_user.id, NULL | IDX | |
| signed_at | TIMESTAMP | NULL | - | |
| created_by | INT UNSIGNED | FK -> tbl_user.id | IDX | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

---

## I. Tabel Stock Opname

### `tbl_stock_opname`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | Gabungkan opname bulan & tahun jadi 1 tabel |
| tipe_opname | ENUM('bulanan','tahunan') | NOT NULL | IDX | |
| periode | DATE | NOT NULL | IDX | Tanggal awal periode (misal: 2024-01-01) |
| inventori_obat_id | INT UNSIGNED | FK -> tbl_inventori_obat.id | IDX | |
| stok_sistem | INT | NOT NULL | - | Stok menurut sistem (dari perhitungan transaksi) |
| stok_fisik | INT | NOT NULL | - | Stok hasil hitung fisik di lapangan |
| selisih | INT | GENERATED AS (stok_fisik - stok_sistem) STORED | - | Otomatis dari DB |
| satuan_id | INT UNSIGNED | FK -> tbl_satuan.id | IDX | |
| keterangan_selisih | TEXT | NULL | - | Penjelasan jika ada selisih |
| status | ENUM('draft','selesai','dikonfirmasi') | DEFAULT 'draft' | IDX | |
| catatan | TEXT | NULL | - | |
| created_by | INT UNSIGNED | FK -> tbl_user.id | IDX | |
| confirmed_by | INT UNSIGNED | FK -> tbl_user.id, NULL | IDX | |
| confirmed_at | TIMESTAMP | NULL | - | |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

> ⚠ Rekomendasi: gabungkan `tbl_stock_opname_bulan` dan `tbl_stock_opname_tahun` menjadi satu tabel dengan kolom `tipe_opname`.
> ⚠ Kolom `selisih` bisa dijadikan GENERATED COLUMN di MySQL untuk kalkulasi otomatis.
> ⚠ Wajib ada kolom `stok_sistem` dan `stok_fisik` untuk rekonsiliasi.

---

## J. Tabel QR Code & Label Stok

### `tbl_stok_item`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | ID unik per unit/item fisik |
| kode_qr_obat | VARCHAR(50) | NOT NULL, UNIQUE | UQ | Generate otomatis |
| inventori_obat_id | INT UNSIGNED | FK -> tbl_inventori_obat.id | IDX | Dari batch mana |
| tipe_satuan | ENUM('kecil','besar') | NOT NULL | IDX | |
| status | ENUM('tersedia','terdistribusi','expired','rusak') | DEFAULT 'tersedia' | IDX | |
| lokasi_penyimpanan_id | INT UNSIGNED | FK -> tbl_lokasi_penyimpanan.id, NULL | IDX | |
| kode_qr_lokasi | VARCHAR(50) | NULL | - | |
| tanggal_cetak | TIMESTAMP | DEFAULT NOW() | - | Kapan label QR dicetak |
| created_at | TIMESTAMP | DEFAULT NOW() | - | |
| updated_at | TIMESTAMP | ON UPDATE NOW() | - | |

> ⚠ Gabungkan `tbl_stok_obat_satuan_kecil` dan `tbl_stok_obat_satuan_besar` menjadi satu tabel `tbl_stok_item` dengan kolom `tipe_satuan`.
> ⚠ `kode_qr` harus unik dan tidak bisa diubah setelah dicetak — gunakan UUID atau kombinasi ID+timestamp.
> ⚠ Scan QR code item ini akan langsung tampilkan info lengkap obat, expired date, lokasi, dan status.

---

## K. Diagram Relasi Antar Tabel (ERD Summary)

| Dari Tabel | Relasi | Ke Tabel |
|------------|--------|----------|
| tbl_inventori_obat (N) | FK merek_obat_id | tbl_merek_obat (1) |
| tbl_inventori_obat (N) | FK sumber_pendanaan_id | tbl_sumber_pendanaan (1) |
| tbl_transaksi_keluar (N) | FK inventori_obat_id | tbl_inventori_obat (1) |
| tbl_transaksi_keluar (N) | FK pengajuan_id | tbl_pengajuan (1) |
| tbl_pengajuan (N) | FK merek_obat_id | tbl_merek_obat (1) |
| tbl_pengajuan (N) | FK opt_id | tbl_opt (1) |
| tbl_pengajuan (N) | FK poktan_id | tbl_poktan (1) |
| tbl_berita_acara (N) | FK transaksi_keluar_id | tbl_transaksi_keluar (1) |
| tbl_lokasi_penyimpanan (N) | FK inventori_obat_id | tbl_inventori_obat (1) |
| tbl_stok_item (N) | FK inventori_obat_id | tbl_inventori_obat (1) |
| tbl_stock_opname (N) | FK inventori_obat_id | tbl_inventori_obat (1) |
| tbl_poktan (N) | FK gapoktan_id | tbl_gapoktan (1) |
| tbl_user (N) | FK role_id | tbl_role (1) |
| tbl_user (N) | FK kecamatan_id | tbl_kecamatan (1) |

---

## L. Tabel Tambahan

### `tbl_activity_log`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| user_id | INT UNSIGNED | FK -> tbl_user.id | IDX | |
| aksi | VARCHAR(50) | - | - | 'CREATE','UPDATE','DELETE','LOGIN','APPROVE' |
| tabel_terkait | VARCHAR(100) | - | - | FK -> tbl_pengajuan, tbl_inventori, dst. |
| record_id | INT UNSIGNED | - | - | |
| data_lama | JSON | NULL | - | |
| data_baru | JSON | NULL | - | |
| ip_address | VARCHAR(45) | - | - | |
| user_agent | VARCHAR(255) | NULL | - | |
| created_at | TIMESTAMP | - | - | |

---

### `tbl_notifikasi`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| user_id | INT UNSIGNED | FK -> tbl_user.id | IDX | |
| tipe | ENUM('stok_menipis','expired','pengajuan_baru','pengajuan_disetujui','pengajuan_ditolak','stock_opname') | - | - | |
| judul | VARCHAR(150) | - | - | |
| pesan | TEXT | - | - | |
| url_action | VARCHAR(255) | NULL | - | Link ke halaman terkait |
| is_read | TINYINT(1) | DEFAULT 0 | - | |
| read_at | TIMESTAMP | NULL | - | |
| data_referensi | JSON | NULL | - | |
| created_at | TIMESTAMP | - | - | |

---

### `tbl_konfigurasi`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| key | VARCHAR(100) | UNIQUE | - | |
| value | TEXT | - | - | |
| tipe | ENUM('string','integer','boolean','json') | - | - | |
| deskripsi | VARCHAR(255) | NULL | - | |
| updated_by | INT UNSIGNED | FK -> tbl_user.id | - | |
| updated_at | TIMESTAMP | - | - | |

---

### `tbl_batas_stok`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| merek_obat_id | INT UNSIGNED | FK -> tbl_merek_obat.id, UNIQUE | - | |
| satuan_id | INT UNSIGNED | FK -> tbl_satuan.id | - | |
| batas_minimum | INT | NOT NULL | - | Trigger notif jika ada stok |
| batas_kritis | INT | NOT NULL | - | Level merah, harus restock |
| catatan | VARCHAR(255) | NULL | - | |
| created_by | INT UNSIGNED | FK -> tbl_user.id | - | |
| created_at | TIMESTAMP | - | - | |
| updated_at | TIMESTAMP | - | - | |

---

### `tbl_riwayat_status_pengajuan`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| pengajuan_id | INT UNSIGNED | FK -> tbl_pengajuan.id | - | |
| status_dari | ENUM (= status di tbl_pengajuan) | NULL | - | |
| status_ke | ENUM (= status di tbl_pengajuan) | - | - | |
| catatan | TEXT | NULL | - | |
| changed_by | INT UNSIGNED | FK -> tbl_user.id | - | |
| created_at | TIMESTAMP | - | - | Waktu perubahan status |

---

### `tbl_dokumen_pengajuan`

| Kolom | Tipe Data | Constraint | Index | Keterangan |
|-------|-----------|------------|-------|------------|
| id | INT UNSIGNED | PK, AUTO_INC | - | |
| pengajuan_id | INT UNSIGNED | FK -> tbl_pengajuan.id | - | |
| nama_dokumen | VARCHAR(150) | - | - | |
| tipe_dokumen | ENUM('surat_pengajuan','rekomendasi_popt','foto_lahan','lainnya') | - | - | |
| file_path | VARCHAR(255) | NOT NULL | - | |
| ukuran_file | INT | NULL | - | |
| uploaded_by | INT UNSIGNED | FK -> tbl_user.id | - | |
| created_at | TIMESTAMP | - | - | |

---

## Keamanan Data

> 💡 Terapkan semua poin ini sebelum go-live untuk menghindari kebocoran data dan korupsi stok.

- Gunakan **bcrypt/Argon2** untuk hash password, bukan MD5/SHA1
- **Role-Based Access Control (RBAC)** di level aplikasi: `admin`, `kabid`, `kasubbid`, `staf-dinas`, `gudang`, `bpp`, `popt` memiliki akses berbeda
- Aktifkan MySQL **strict mode** untuk mencegah data truncation diam-diam (untuk tahap development diabaikan dulu)
- **Backup otomatis** database setiap hari (minimal), simpan 30 hari terakhir
- Semua operasi stok (masuk/keluar) pakai **DATABASE TRANSACTION** untuk mencegah data inconsistency

---

## Performa & Indexing

- Buat `INDEX` pada kolom yang sering di-`WHERE` atau di-`JOIN`: `status`, `created_at`, semua FK
- Index komposit untuk query umum: `(merek_obat_id, tanggal_kadaluarsa)` untuk alert expired
- Index komposit: `(kecamatan_id, status)` untuk dashboard per kecamatan
- Jangan index kolom dengan kardinalitas rendah (contoh: `is_active` saja) — gabung dengan kolom lain

---

## Fitur yang Disarankan Ditambahkan ke Sistem

- **Notifikasi otomatis**: obat mendekati expired (30, 14, 7 hari sebelumnya)
- **Notifikasi stok menipis**: jika stok < batas minimum yang dikonfigurasi per merek obat
- **Log aktivitas** (`tbl_activity_log`): catat semua operasi INSERT/UPDATE/DELETE penting
- **Tabel `tbl_notifikasi`**: simpan notifikasi di DB agar bisa dibaca dari mobile/web
- **Export laporan**: stok opname, realisasi distribusi, per kecamatan / per periode
- **Dashboard statistik**: stok saat ini, pengajuan pending, distribusi bulan ini

---

## Checklist Sebelum Development

- [ ] Semua tabel sudah punya kolom `created_at`, `updated_at`, dan `deleted_at` (soft delete)
- [ ] Semua FK sudah diberi INDEX
- [ ] Tabel `tbl_transaksi_keluar` sudah lengkap sesuai skema di atas
- [ ] Tabel `tbl_satuan` menggabungkan satuan kecil dan besar (tipe ENUM)
- [ ] Tabel `tbl_template_dokumen` menggabungkan semua jenis template
- [ ] Tabel `tbl_stok_item` menggabungkan stok satuan kecil dan besar
- [ ] Tabel `tbl_stock_opname` menggabungkan opname bulanan dan tahunan
- [ ] `tbl_pengajuan` punya kolom `status`, `jumlah_diminta`, `approved_by`, `approved_at`
- [ ] Password di-hash sebelum disimpan
- [ ] Seeding data master: satuan, role, kategori, sumber pendanaan
- [ ] Test race condition stok: dua user approve pengajuan bersamaan
- [ ] Setup backup otomatis database

---

_ObatKu Database Design Document — v1.0 Draft_