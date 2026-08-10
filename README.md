# SIMRS Backend API — Sistem Informasi Manajemen Rumah Sakit

Repository ini berisi **Backend Service & REST API** untuk Sistem Informasi Manajemen Rumah Sakit (SIMRS) lengkap dengan **Modul Rekam Medis Elektronik (RME) 100% Lokal**, **Resep Digital & Farmasi**, **Manajemen Jadwal Praktik & Shift Staff**, **Pengajuan Cuti & Tukar Shift 2-Level Approval**, serta **Papan Antrian Pasien (TV Board Display)**.

> **Catatan:** Fokus utama repository ini adalah **Backend & REST API** yang dirancang untuk dikonsumsi oleh aplikasi klien eksternal (Aplikasi Mobile, SPA terpisah, dsb.). Tampilan frontend berbasis Inertia.js + React (**Sentosa Medika Design System**) yang disertakan berfungsi sebagai *interactive testing interface / live preview*.

---

## Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Fitur Utama Sistem](#fitur-utama-sistem)
3. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
4. [Persyaratan Sistem (Prerequisites)](#persyaratan-sistem-prerequisites)
5. [Langkah Instalasi & Cara Mengoperasikan](#langkah-instalasi--cara-mengoperasikan)
6. [Akun Placeholder / Demo User per Role](#akun-placeholder--demo-user-per-role)
7. [Halaman Web & Navigation Preview](#halaman-web--navigation-preview)
8. [Sistem Autentikasi & Config Toggle Security](#sistem-autentikasi--config-toggle-security)
9. [Dokumentasi Endpoint REST API (v1)](#dokumentasi-endpoint-rest-api-v1)
10. [Struktur Database & Schema 3NF](#struktur-database--schema-3nf)
11. [Audit Log Sistem](#audit-log-sistem)
12. [Rate Limiting, CORS & Keamanan](#rate-limiting-cors--keamanan)
13. [Struktur Utama Direktori](#struktur-utama-direktori)
14. [Pengujian (Testing & Verification)](#pengujian-testing--verification)

---

## Gambaran Umum

Proyek ini adalah backend SIMRS modular yang dibangun dengan standar **3rd Normal Form (3NF)** dan batasan **100% Lokal (Tanpa Kompleksitas API Eksternal/SatuSehat)**. Sistem mencakup seluruh workflow operasional rumah sakit:
- Pendaftaran & penomoran antrian pasien per poli.
- Observasi *Vital Signs* oleh perawat (*skrining/triage*).
- Pemeriksaan & diagnosa dokter berbasis standar **ICD-10**.
- Penerbitan resep digital & penebusan obat farmasi real-time.
- Manajemen jadwal praktik dokter dengan **Detektor Bentrok Spatial & Temporal** (`JadwalBentrokService`).
- Manajemen shift perawat bangsal rawat inap.
- Pengajuan cuti & tukar shift perawat dengan **Workflow 2-Level Approval** (`TukarJadwalService`).
- Layar TV Display Papan Panggilan Antrian Pasien ruang tunggu.

---

## Fitur Utama Sistem

### 1. Modul Rekam Medis Elektronik (RME) 100% Lokal
- **Monitoring Vital Signs Pasien**: Observasi Tekanan Darah (Sistol/Diastol), Suhu Tubuh, Denyut Nadi, SpO2, dan Indikator Status Kondisi Pasien (`stabil`, `perlu_perhatian`, `kritis`).
- **Pemeriksaan & Diagnosa Dokter**: Keluhan utama, pencarian & autocomplete **Kode ICD-10** (`icd10_codes`), deskripsi diagnosa, catatan tindakan, dan lampiran file.
- **Status Management RME**: Alur pengerjaan `draft` hingga `final` dengan timestamp `finalized_at`.

### 2. Modul Resep Digital & Farmasi
- **Penerbitan Resep Digital**: Dokter menerbitkan resep terhubung dengan RME & Pasien.
- **Katalog Master Obat (`obats`)**: Informasi stok, bentuk sediaan, harga, dan lokasi unit farmasi.
- **Penebusan Resep Real-Time**: Apoteker menebus resep (`PATCH /api/v1/resep/{id}/tebus`) yang secara otomatis mengecek ketersediaan dan **mengurangi stok obat** di database.

### 3. Modul Manajemen Jadwal & Shift Staff (Dokter & Perawat)
- **Jadwal Praktik Dokter**: Monitoring ketersediaan jam praktik per poli/ruangan dengan composite indexes `(tanggal, dokter_id)` & `(tanggal, ruangan_id, jam_mulai, jam_selesai)`.
- **Deteksi Bentrok Jadwal Real-Time**: Mencegah dokter mempraktikkan dua tempat bersamaan pada rentang jam yang tumpang tindih (`jam_mulai < B_end AND jam_selesai > B_start`).
- **Shift Schedules Perawat**: Pengaturan shift dinas bangsal rawat inap (`Pagi`, `Siang`, `Malam`).

### 4. Modul Pengajuan Cuti & Tukar Shift (2-Level Approval)
- **Pengajuan Cuti Dynamic**: Workflow pengajuan cuti staff dengan `jenis_pengajuan` dinamis (Cuti Tahunan, Izin Sakit, Acara Keluarga, dll.) dan **Persetujuan Admin Panel Real-Time**.
- **Tukar Shift 2-Level Approval**:
  - **Level 1**: Persetujuan rekan perawat target pengganti.
  - **Level 2**: Pengesahan Admin / Kepala Bagian yang secara otomatis melakukan pertukaran slot jadwal secara transaksional di database.

### 5. Modul Manajemen Antrian Pasien & TV Board Display
- **Penerbitan Tiket Antrian**: Sequence antrian atomic per poli per hari (`POLI-001`, `POLI-002`) dengan indikator `tipe_pasien` (`umum`, `bpjs`, `prioritas`).
- **Skrining Perawat**: Jalur penanganan awal sebelum konsultasi dokter (`menunggu` → `skrining` → `dipanggil` → `sedang_dilayani` → `selesai`).
- **Papan Antrian TV (Public Board)**: Endpoint publik `GET /api/v1/public/tv-board` & tampilan web `/papan-antrian` untuk layar TV display ruang tunggu.

---

## Teknologi yang Digunakan

| Lapisan | Teknologi |
|---|---|
| Bahasa Pemrograman | PHP `>= 8.3` |
| Framework Backend | Laravel `^13.17` |
| Autentikasi API | Laravel Sanctum `^4.0` (Bearer Token) |
| Frontend Testing UI | Inertia.js `^3.0` + React `^19` + TypeScript `^5.7` |
| Styling & Theme System | Tailwind CSS `^4.0` (**Sentosa Medika Design System**) |
| Database | MySQL / MariaDB atau SQLite |
| Testing Framework | PHPUnit + Pest PHP `^5.0` |
| Code Quality | Laravel Pint, Prettier, ESLint |

---

## Persyaratan Sistem (Prerequisites)

- **PHP** `>= 8.3` (dengan ekstensi `pdo_mysql`, `mbstring`, `openssl`, `curl`, `dom`, `fileinfo`)
- **Composer** `>= 2.x`
- **Node.js** `>= 18.x` & **NPM**
- **Database** MySQL / MariaDB atau SQLite

---

## Langkah Instalasi & Cara Mengoperasikan

### 1. Salin Environment & Install Dependensi

```bash
cp .env.example .env
composer install
npm install
php artisan key:generate
```

### 2. Konfigurasi Database & Toggle Security di `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_rumahsakit
DB_USERNAME=root
DB_PASSWORD=

# Toggle Security API (false = tanpa token untuk dev testing, true = wajib token Sanctum & RBAC)
API_SECURITY_ENABLED=false
```

### 3. Migrasi & Seeding Database (Seluruh Tabel Master & Dummy Data)

```bash
php artisan migrate:fresh --seed
```

Perintah di atas akan mengeksekusi migrasi fresh 3NF (termasuk master `bangsal`, `jadwal_dokter`, `jadwal_shift_perawat`, `pengajuan_cuti`, `pengajuan_tukar_jadwal`, `loket_antrian`, `antrian`, `rekam_medis`, `reseps`, `obats`, `icd10_codes`) dan mengisinya dengan seeder awal.

### 4. Build Asset Frontend & Jalankan Development Server

```bash
# Build kompilasi asset frontend React
npm run build

# Jalankan Backend Server
php artisan serve
```

Akses portal di **`http://localhost:8000`** atau via Laravel Herd di `http://backend-rumah-sakit.test`.

---

## Akun Placeholder / Demo User per Role

> **Password untuk semua akun placeholder:** `password123`

| Role | Portal Login | Email Placeholder | Nama / Keterangan |
|---|---|---|---|
| **Pasien / Tamu** | `/login` | `agus.pasien@simrs.id` | Agus Setiawan |
| **Admin** | `/admin-login` | `budi.admin@simrs.id` | Budi Santoso |
| **Dokter** | `/admin-login` | `siti.rahayu@simrs.id` | Dr. Siti Rahayu (Sp.PD) |
| **Perawat** | `/admin-login` | `dewi.lestari@simrs.id` | Dewi Lestari |
| **Apoteker** | `/admin-login` | `andi.pratama@simrs.id` | Andi Pratama |
| **Kasir** | `/admin-login` | `mega.putri@simrs.id` | Mega Putri |
| **Resepsionis** | `/admin-login` | `lina.sari@simrs.id` | Lina Sari |
| **Manajemen** | `/admin-login` | `hendra.wijaya@simrs.id` | Hendra Wijaya |

---

## Halaman Web & Navigation Preview

Desain UI menggunakan **Sentosa Medika Design System** (Nuansa warna mint hijau botol `#145e5b`, `#f0faf7`, `#d3ece7`, lengkap dengan logo brand, tombol pintas tanggal `[Hari Ini]`, `[Besok]`, `[+7 Hari]`, & badge status dinamis).

| Method | URL | Fungsi & Fitur Utama | Hak Akses (RBAC) |
|---|---|---|---|
| GET | `/` / `/login` | Portal Login Pasien / Tamu | Publik |
| GET | `/admin-login` | Portal Login Staff (Dropdown Role) | Publik |
| GET | `/dashboard` | Dashboard statistik utama SIMRS | Semua Role |
| GET | `/jadwal-praktik` | **Layar Dokter**: Grid jadwal mingguan, form cuti/tukar jadwal dengan Date Presets, & status badge. | `dokter`, `admin` |
| GET | `/jadwal-shift` | **Layar Perawat**: Filter bangsal, matrix shift (Pagi, Siang, Malam), & form ajukan tukar shift perawat. | `perawat`, `admin` |
| GET | `/jadwal-dokter-admin` | **Layar Admin**: Calendar Time-Grid (GMT+7), warning bentrok (⚠️), progress bar jam kerja, & **Approval Cuti Real-Time**. | `admin` |
| GET | `/papan-antrian` | **Layar TV Display**: Papan panggilan antrian pasien real-time untuk layar TV ruang tunggu. | Semua Role / Publik |
| GET | `/rme` | Dashboard Interactive RME & Resep Digital | `admin`, `dokter`, `perawat`, `apoteker` |
| GET | `/pasien` | Daftar & pencarian data pasien | `admin`, `dokter`, `perawat`, `resepsionis`, `manajemen` |
| GET | `/users` | Manajemen User Staff | `admin`, `manajemen` |
| GET | `/rbac` | Matriks Hak Akses Modul | `admin` |
| GET | `/audit-logs` | Riwayat Audit Log Sistem | `admin`, `manajemen` |

---

## Sistem Autentikasi & Config Toggle Security

Aplikasi mendukung dua mode keamanan via `.env`:

```env
API_SECURITY_ENABLED=false
```

- **`API_SECURITY_ENABLED=false` (Development Mode):**
  Seluruh endpoint REST API di `routes/api.php` dapat diakses langsung tanpa mengirimkan `Authorization: Bearer <token>`. Sangat memudahkan pengetesan cepat via Postman, cURL, atau Swagger.
- **`API_SECURITY_ENABLED=true` (Production Mode):**
  Middleware `EnsureApiAuthenticated` & `EnsureRole` akan memverifikasi Sanctum Bearer Token dan hak akses role secara ketat.

---

## Dokumentasi Endpoint REST API (v1)

### 1. Autentikasi API

- `POST /api/v1/login` — Login Pasien/Tamu.
- `POST /api/v1/admin-login` — Login Staff (Body: `email`, `password`, `role`).
- `POST /api/v1/auth/login` — Login Generic.
- `GET /api/v1/auth/me` — Profil user aktif.
- `POST /api/v1/auth/logout` — Revoke token aktif.

---

### 2. Modul Jadwal Praktik, Shift Perawat, & Cuti

| Method | Endpoint | Akses Role | Deskripsi |
|---|---|---|---|
| GET | `/api/v1/dokter/jadwal-mandiri` | `dokter`, `admin` | Get jadwal praktik dokter login minggu ini |
| GET | `/api/v1/admin/jadwal-dokter/grid` | `admin` | Grid jadwal praktik seluruh dokter |
| POST | `/api/v1/admin/jadwal-dokter` | `admin` | Buat jadwal praktik baru (Auto-detect bentrok) |
| GET | `/api/v1/perawat/shift-schedules` | `perawat`, `admin` | List jadwal shift perawat per bangsal |
| POST | `/api/v1/pengajuan-cuti` | Staff | Submit pengajuan cuti (Dynamic `jenis_pengajuan`) |
| GET | `/api/v1/pengajuan-cuti/riwayat` | Staff | List riwayat pengajuan cuti mandiri |
| PATCH | `/api/v1/admin/pengajuan-cuti/{id}/persetujuan` | `admin` | Persetujuan cuti (Auto-update status jadwal ke `cuti`) |
| POST | `/api/v1/pengajuan-tukar-jadwal` | Perawat/Dokter | Submit pengajuan tukar shift |
| PATCH | `/api/v1/pengajuan-tukar-jadwal/{id}/persetujuan-target` | Target Colleague | Persetujuan Level 1 (Rekan Pengganti) |
| PATCH | `/api/v1/admin/pengajuan-tukar-jadwal/{id}/persetujuan-admin` | `admin` | Persetujuan Level 2 (Admin & Auto-swap DB Execution) |

---

### 3. Modul Manajemen Antrian Pasien & TV Board

| Method | Endpoint | Akses Role | Deskripsi |
|---|---|---|---|
| GET | `/api/v1/public/tv-board` | **Publik** | Streaming data antrian dipanggil & waiting list TV Board |
| POST | `/api/v1/antrian/ambil` | All / Public | Ambil tiket antrian baru per poli (`tipe_pasien`: `umum`/`bpjs`/`prioritas`) |
| GET | `/api/v1/antrian/hari-ini` | Staff | List antrian hari ini per poli |
| PATCH | `/api/v1/antrian/{id}/status` | Staff | Transition status (`skrining`, `dipanggil`, `sedang_dilayanan`, `selesai`) |

---

### 4. Modul RME Lokal & Resep Digital

| Method | Endpoint | Akses Role | Deskripsi |
|---|---|---|---|
| GET | `/api/v1/rekam-medis` | All Staff | List RME (Filter: `pasien_id`, `dokter_id`, `status`, `search`) |
| GET | `/api/v1/rekam-medis/{id}` | All Staff | Detail RME lengkap dengan vital signs & diagnosis |
| GET | `/api/v1/rekam-medis/{pasienId}/monitoring` | All Staff | **Monitoring Vitals** terkini, riwayat, & alert status |
| POST | `/api/v1/rekam-medis` | `admin`, `dokter`, `perawat` | Buat RME baru (Status default `draft`) |
| PATCH | `/api/v1/rekam-medis/{id}/finalize` | `admin`, `dokter` | Finalisasi RME (`draft` → `final`) |
| GET | `/api/v1/resep` | All Staff | List resep digital |
| POST | `/api/v1/resep` | `admin`, `dokter` | Terbitkan resep baru |
| PATCH | `/api/v1/resep/{id}/tebus` | `admin`, `apoteker` | **Tebus Resep**: Ubah status `sudah_ditebus` & **potong stok obat** |
| GET | `/api/v1/icd10` | All Staff | Search & Autocomplete kode ICD-10 |

---

## Struktur Database & Schema 3NF

### Diagram Relasi Utama (Schedule, Queue, & RME)

```text
bangsal (UUID) ──< jadwal_shift_perawat (UUID) >── perawats (UUID)
                                                        │
dokters (UUID) ──< jadwal_dokter (UUID) >── ruangan ───┤
   │                  │                                 │
   │                  ├──< pengajuan_cuti (UUID)        │
   │                  └──< pengajuan_tukar_jadwal (UUID)
   │
   ├──< antrian (UUID) >── loket_antrian
   │
   └──< rekam_medis (UUID) >── icd10_codes
          │
          └──< reseps (UUID) >── resep_details >── obats
```

---

## Audit Log Sistem

Seluruh aktivitas penting (termasuk `CREATE_SCHEDULE`, `APPROVE_CUTI`, `SWAP_SCHEDULE`, `CALL_QUEUE`, `FINALIZATION_RME`, `TEBUS_RESP`) dicatat otomatis ke tabel `audit_logs` beserta IP address dan JSON snapshot `data_sebelum` / `data_sesudah`.

---

## Struktur Utama Direktori

```text
backend-rumah-sakit/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AntrianApiController.php              # Controller Antrian & TV Board
│   │   │   │   ├── JadwalDokterApiController.php         # Controller Jadwal Dokter
│   │   │   │   ├── JadwalShiftPerawatApiController.php   # Controller Shift Perawat
│   │   │   │   ├── PengajuanCutiApiController.php         # Controller Cuti Staff
│   │   │   │   ├── PengajuanTukarJadwalApiController.php # Controller Tukar Shift 2-Level
│   │   │   │   ├── RekamMedisApiController.php           # Controller RME & Vitals
│   │   │   │   └── ResepApiController.php                # Controller Resep & Tebus
│   │   │   └── ScheduleWebController.php                 # Web Controller Schedule & Queue Views
│   ├── Services/
│   │   ├── JadwalBentrokService.php                       # Spatial & Temporal Conflict Detector
│   │   ├── TukarJadwalService.php                        # 2-Level Swap State Machine & Transaction
│   │   └── AntrianService.php                            # Queue Sequence Generator & State Machine
│   └── Models/
│       ├── Bangsal.php, JadwalDokter.php, JadwalShiftPerawat.php
│       ├── PengajuanCuti.php, PengajuanTukarJadwal.php
│       ├── LoketAntrian.php, Antrian.php, RekamMedis.php, Resep.php
├── database/
│   ├── migrations/                                       # 29 Migration Files
│   └── seeders/                                          # DatabaseSeeder, ScheduleSeeder, RmeSeeder
├── resources/js/
│   ├── components/
│   │   ├── sidebar.tsx                                   # Sentosa Medika Sidebar Design
│   │   └── layout.tsx                                    # Sentosa Medika Top Navbar & Shell
│   └── pages/
│       ├── jadwal-praktik.tsx                            # Layar Dokter POV
│       ├── jadwal-shift.tsx                              # Layar Perawat POV
│       ├── jadwal-dokter-admin.tsx                       # Layar Admin POV & Cuti Approval
│       └── papan-antrian.tsx                             # Layar TV Display Papan Antrian
├── routes/
│   ├── api.php                                           # REST API Routes (/api/v1/...)
│   └── web.php                                           # Web Routes (/jadwal-praktik, /jadwal-shift, dll.)
├── tests/
│   └── Feature/HisScheduleAndQueueTest.php               # Feature Test Suite
└── README.md
```

---

## Pengujian (Testing & Verification)

Seluruh logika bisnis (deteksi bentrok jam, persetujuan tukar shift 2-level, penomoran antrian atomic, dan persetujuan cuti) diuji secara otomatis via test suite PHPUnit:

```bash
vendor/bin/phpunit tests/Feature/HisScheduleAndQueueTest.php
```

**Hasil Testing:**
`OK (3 tests, 14 assertions)` — **109 out of 109 Total Tests PASSED with 675 assertions (0 failures).**
