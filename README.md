# SIMRS Backend API — Sistem Informasi Manajemen Rumah Sakit

Repository ini berisi **Backend Service & REST API** untuk Sistem Informasi Manajemen Rumah Sakit (SIMRS).

> **Catatan:** Fokus utama repository ini adalah **Backend & REST API** yang dirancang untuk dikonsumsi oleh aplikasi klien eksternal (Aplikasi Mobile, SPA terpisah, dsb.). Tampilan frontend yang disertakan di sini berfungsi sebagai *placeholder/preview* sederhana.

---

## Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
3. [Persyaratan Sistem (Prerequisites)](#persyaratan-sistem-prerequisites)
4. [Langkah Instalasi & Cara Mengoperasikan](#langkah-instalasi--cara-mengoperasikan)
5. [Akun Placeholder / Demo User per Role](#akun-placeholder--demo-user-per-role)
6. [Halaman Web & Panel Login](#halaman-web--panel-login)
7. [Sistem Autentikasi (Web vs API)](#sistem-autentikasi-web-vs-api)
8. [Dokumentasi Endpoint REST API (v1)](#dokumentasi-endpoint-rest-api-v1)
9. [Struktur Database](#struktur-database)
10. [Audit Log](#audit-log)
11. [Rate Limiting, CORS & Keamanan](#rate-limiting-cors--keamanan)
12. [Struktur Utama Direktori](#struktur-utama-direktori)
13. [Pengujian (Testing) & Kualitas Kode](#pengujian-testing--kualitas-kode)
14. [Cara Pengujian API (API Testing)](#cara-pengujian-api-api-testing)

---

## Gambaran Umum

Proyek ini adalah backend SIMRS dengan fitur utama:

- **REST API (v1)** dengan autentikasi token **Laravel Sanctum** (`Bearer` token) untuk dikonsumsi aplikasi eksternal (mobile / SPA terpisah).
- **Pendaftaran Pasien** — API pendaftaran pasien untuk tiga jenis layanan: **Rawat Jalan**, **Rawat Inap**, dan **IGD**, dengan nomor pendaftaran otomatis, validasi kondisional per jenis layanan, dan statistik harian.
- **Role-Based Access Control (RBAC)** — 8 role berbeda: `admin`, `dokter`, `perawat`, `apoteker`, `kasir`, `resepsionis`, `manajemen`, dan `pasien`.
- **Satu tabel per role** — setiap role (kecuali `pasien`) disimpan di tabel tersendiri dengan kolom ERD spesifik (mis. dokter punya `nomor_str`, kasir punya `batas_transaksi_harian`).
- **Audit Log** — setiap aktivitas login/logout/CRUD/pendaftaran tercatat ke tabel `audit_logs` beserta IP address.
- **Frontend preview berbasis Inertia + React** — berfungsi sebagai *placeholder* untuk memverifikasi alur login dan halaman.
- **Password selalu di-hash** dengan bcrypt dan **tidak pernah diekspos** pada response API.

---

## Teknologi yang Digunakan

| Lapisan | Teknologi |
|---|---|
| Bahasa Pemrograman | PHP `>= 8.3` |
| Framework | Laravel `^13.17` |
| Autentikasi API | Laravel Sanctum `^4.0` (Bearer Token) |
| Frontend Preview | Inertia.js `^3.0` + React `^19` + TypeScript `^5.7` |
| Build Frontend | Vite `^8.0` + Tailwind CSS `^4.0` |
| Database | MySQL / MariaDB atau SQLite (default di `.env.example`) |
| Testing | Pest PHP `^5.0` + PHPUnit |
| Kualitas Kode | Laravel Pint, PHPStan (Larastan), ESLint, Prettier, `tsc --noEmit` |
| Utilities | `laravel/tinker`, `laravel/pail`, `laravel/wayfinder` |

---

## Persyaratan Sistem (Prerequisites)

Sebelum menjalankan proyek ini, pastikan sistem Anda telah terpasang:

- **PHP** `>= 8.3` (dengan ekstensi `pdo_mysql`, `mbstring`, `openssl`, `curl`, serta ekstensi inti Laravel: `ctype`, `dom`, `fileinfo`, `filter`, `hash`, `pcre`, `pdo`, `session`, `tokenizer`, `xml`)
- **Composer** `>= 2.x`
- **Node.js** `>= 18.x` & **NPM** (untuk frontend preview / build asset)
- **Database** MySQL / MariaDB (mis. via Laravel Herd, XAMPP, atau Laragon) **atau** SQLite (pilihan termudah, tanpa instalasi database server)

---

## Langkah Instalasi & Cara Mengoperasikan

### Opsi A — Quick Start (Direkomendasikan)

Skrip `composer setup` mengerjakan semuanya otomatis (install dependensi, salin `.env`, generate key, migrasi, install & build frontend):

```bash
composer setup
```

> Skrip ini menggunakan koneksi **SQLite** secara default (karena `.env` baru disalin dari `.env.example`). Jika ingin MySQL, ikuti **Opsi B** lalu ubah `.env` terlebih dahulu.

### Opsi B — Manual Step by Step

#### 1. Salin Konfigurasi Environment

Buat file `.env` dari `.env.example`:

```bash
cp .env.example .env
```

#### 2. Install Dependensi PHP & Node.js

```bash
composer install
npm install
```

#### 3. Generate Application Key

```bash
php artisan key:generate
```

#### 4. Konfigurasi Database

**a) Menggunakan SQLite (tanpa instalasi):**

```env
DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=
```

Pastikan file database ada: `touch database/database.sqlite`

**b) Menggunakan MySQL / MariaDB:**

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_rumahsakit
DB_USERNAME=root
DB_PASSWORD=
```

#### 5. Migrasi & Seeding Database (Membuat Tabel & Akun Placeholder)

Jalankan perintah berikut untuk menginisialisasi tabel database dan mengisi data *placeholder* untuk seluruh role beserta data master (poli, ruangan, unit farmasi, loket):

```bash
php artisan migrate:fresh --seed
```

#### 6. Jalankan Server Backend & Frontend Build

**Jalankan Laravel Backend Server:**

```bash
php artisan serve
```

*(Atau akses langsung via Laravel Herd di `http://backend-rumah-sakit.test`)*

**Jalankan Vite Dev Server (Optional for Frontend Preview):**

```bash
npm run dev
```

**Mode Development Sekaligus (Server + Queue + Vite):**

```bash
composer dev
```

> Perintah di atas menjalankan `php artisan serve`, `php artisan queue:listen --tries=1`, dan `npm run dev` secara bersamaan (menggunakan `concurrently`).

---

## Akun Placeholder / Demo User per Role

Seluruh role telah dibuatkan akun *placeholder* di database. Gunakan kredensial di bawah ini untuk testing:

> **Password untuk semua akun placeholder:** `password123`

| Role | Portal Login | Email Placeholder | Nama / Keterangan |
|---|---|---|---|
| **Pasien / Tamu** | `/login` | `agus.pasien@simrs.id` | Agus Setiawan |
| **Admin** | `/admin-login` | `budi.admin@simrs.id` | Budi Santoso |
| **Dokter** | `/admin-login` | `siti.rahayu@simrs.id` | Dr. Siti Rahayu |
| **Perawat** | `/admin-login` | `dewi.lestari@simrs.id` | Dewi Lestari |
| **Apoteker** | `/admin-login` | `andi.pratama@simrs.id` | Andi Pratama |
| **Kasir** | `/admin-login` | `mega.putri@simrs.id` | Mega Putri |
| **Resepsionis** | `/admin-login` | `lina.sari@simrs.id` | Lina Sari |
| **Manajemen** | `/admin-login` | `hendra.wijaya@simrs.id` | Hendra Wijaya |

**Akun tambahan yang ikut di-seed** (kredensial sama, `password123`):

| Role | Email | Keterangan |
|---|---|---|
| Dokter | `ahmad.fauzi@simrs.id` | Dr. Ahmad Fauzi (Sp.A) |
| Perawat | `rina.wati@simrs.id` | Rina Wati (shift malam) |
| Pasien | `maya.pasien@simrs.id` | Maya Anggraeni |
| Pasien | `rizki.pasien@simrs.id` | Rizki Ramadhan |

---

## Halaman Web & Panel Login

- **`/` & `/login`** — Portal Login khusus Tamu / Pasien (tanpa dropdown role; role dipaksa `pasien`).
- **`/admin-login`** — Portal Login khusus Admin & Staff/Pegawai (dilengkapi Dropdown Role; role `pasien` tidak diterima di portal ini).

### Daftar Halaman Web (Route)

| Method | URL | Fungsi | Hak Akses |
|---|---|---|---|
| GET | `/` | Arahkan ke halaman login pasien | Publik |
| GET | `/login` | Halaman login pasien / tamu | Publik |
| POST | `/login` | Proses login pasien / tamu | Publik |
| GET | `/admin-login` | Halaman login staff (dropdown role) | Publik |
| POST | `/admin-login` | Proses login staff | Publik |
| POST | `/logout` | Logout & invalidasi sesi | Terautentikasi |
| GET | `/dashboard` | Dashboard utama (statistik & audit log terbaru) | Semua role |
| GET | `/users` | Manajemen user staff (list per role) | `admin`, `manajemen` |
| POST | `/users` | Tambah user staff baru | `admin`, `manajemen` |
| PUT | `/users/{role}/{id}` | Update data user staff | `admin`, `manajemen` |
| GET | `/audit-logs` | Riwayat audit log (filter `modul`, `pembuat_type`, `date`) | `admin`, `manajemen` |
| GET | `/pasien` | Daftar & pencarian pasien | `admin`, `dokter`, `perawat`, `apoteker`, `kasir`, `resepsionis`, `manajemen` |
| POST | `/pasien` | Tambah pasien baru (No. RM di-generate otomatis) | `admin`, `dokter`, `perawat`, `apoteker`, `kasir`, `resepsionis`, `manajemen` |
| GET | `/rbac` | Matriks hak akses modul per role | `admin` |
| GET | `/up` | Health check aplikasi | Publik |

> **Catatan pengamanan web:** Pengguna yang tidak login diarahkan ke halaman `/login`. Pengguna yang login namun role-nya tidak berhak mengakses halaman tertentu akan diarahkan kembali ke `/dashboard`.

---

## Sistem Autentikasi (Web vs API)

Terdapat **dua mekanisme autentikasi terpisah**:

1. **Web (session-based)** — Menggunakan sesi Laravel dengan key `simrs_user` & `simrs_role` di session. Dikenakan untuk route `/dashboard`, `/users`, `/pasien`, `/rbac`, `/audit-logs` via middleware `web.auth` & `web.role`.
2. **API (token-based)** — Menggunakan **Laravel Sanctum Bearer Token**. Dikenakan untuk seluruh route `api.php` (kecuali login) via middleware `auth:sanctum` & `role`.

---

## Dokumentasi Endpoint REST API (v1)

Seluruh response REST API dikembalikan dalam format **JSON**.

> **HTTP Request Headers:**
> - `Accept: application/json`
> - `Content-Type: application/json` (untuk request ber-body)
> - `Authorization: Bearer <token>` (untuk endpoint yang membutuhkan autentikasi)

### Konvensi Response

Response sukses umumnya berbentuk:

```json
{
  "status": "success",
  "message": "...",
  "data": { }
}
```

### Kode Error Standar

| HTTP Status | Makna | Contoh Trigger |
|---|---|---|
| `401` | Tidak terautentikasi / kredensial salah | Token tidak dikirim/tidak valid; email/password salah |
| `403` | Forbidden — role tidak berhak | Role `pasien` mengakses `/api/v1/users` |
| `404` | Data tidak ditemukan | `GET /api/v1/pasien/{id}` dengan ID tak dikenal |
| `422` | Validasi gagal / role tidak valid | Email kosong, role `superadmin`, dst. |
| `429` | Too Many Requests — melebihi rate limit | Login > 5x per menit per IP |

Response error autentikasi (`401`) menggunakan bentuk:

```json
{
  "status": "error",
  "message": "Unauthenticated."
}
```

---

### 1. Authentication Endpoints

Semua endpoint login dibatasi **rate limit 5 percobaan per menit per IP** (`throttle:login`).

#### A. Login Tamu / Pasien

- **Endpoint:** `POST /api/v1/login`
- **Body Request:**
  ```json
  {
    "email": "agus.pasien@simrs.id",
    "password": "password123"
  }
  ```
- **Response Sukses (`200`):**
  ```json
  {
    "status": "success",
    "message": "Login berhasil.",
    "data": {
      "user": { "id": "...", "nama_lengkap": "Agus Setiawan", "email": "agus.pasien@simrs.id" },
      "role": "pasien",
      "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "token_type": "Bearer"
    }
  }
  ```

#### B. Login Admin & Staff (dengan Select Role)

- **Endpoint:** `POST /api/v1/admin-login`
- **Body Request:**
  ```json
  {
    "email": "budi.admin@simrs.id",
    "password": "password123",
    "role": "admin"
  }
  ```
- *(Role yang tersedia: `admin`, `dokter`, `perawat`, `apoteker`, `kasir`, `resepsionis`, `manajemen`)*
- Response sukses identik dengan login pasien, namun `data.role` berisi role yang dipilih.

> **Penting:** Role yang dipilih harus cocok dengan akun. Login `budi.admin@simrs.id` dengan `role: "dokter"` akan ditolak (`401`).

#### C. Login Umum (Generic)

- **Endpoint:** `POST /api/v1/auth/login`
- **Body Request:**
  ```json
  {
    "email": "agus.pasien@simrs.id",
    "password": "password123",
    "role": "pasien"
  }
  ```
- Endpoint alternatif untuk integrasi klien; menerima role apa pun termasuk `pasien`.

#### D. Profile User Aktif

- **Endpoint:** `GET /api/v1/auth/me` *(memerlukan Bearer Token)*
- Response berisi `data.user` (tanpa `password`) dan `data.role`.

#### E. Logout

- **Endpoint:** `POST /api/v1/auth/logout` *(memerlukan Bearer Token)*
- Token saat ini langsung **di-revoke** (hapus dari tabel `personal_access_tokens`), sehingga tidak dapat dipakai lagi.
- Setiap login & logout API juga dicatat ke **audit log** (modul `api_auth`, aksi `API_LOGIN` / `API_LOGOUT`).

---

### 2. Resource Data Endpoints

Semua endpoint di bagian ini **wajib menyertakan `Authorization: Bearer <token>`**.

#### A. Manajemen Pasien

| Method | Endpoint | Hak Akses |
|---|---|---|
| GET | `/api/v1/pasien` | Semua role terautentikasi |
| POST | `/api/v1/pasien` | `admin`, `resepsionis` |
| GET | `/api/v1/pasien/{id}` | Semua role terautentikasi |
| PUT | `/api/v1/pasien/{id}` | `admin`, `resepsionis`, `manajemen` |
| DELETE | `/api/v1/pasien/{id}` | `admin`, `manajemen` |

**`GET /api/v1/pasien` — Daftar & pencarian data pasien**

- Parameter query:
  - `search` — cari berdasarkan `nama_lengkap`, `nomor_rekam_medis`, `nik`, atau `no_hp`.
  - `per_page` — jumlah data per halaman (default `15`).
- **Aturan khusus role pasien:** pengguna dengan role `pasien` **hanya melihat data dirinya sendiri** (`total` = 1).

**`POST /api/v1/pasien` — Tambah pasien baru**

Body Request (contoh):

```json
{
  "nama_lengkap": "Bambang Tri",
  "nik": "3174098765432100",
  "jenis_kelamin": "Laki-laki",
  "golongan_darah": "B",
  "no_hp": "081299887766",
  "alamat": "Jakarta"
}
```

- Kolom `nama_lengkap` **wajib** diisi (alias `name` juga diterima).
- `nomor_rekam_medis` otomatis di-generate (`RM-<tahun>-<angka>`) jika tidak dikirim.
- Field opsional lain sesuai ERD: `tanggal_lahir`, `email`, `password`, `nama_kontak_darurat`, `no_hp_kontak_darurat`, `alergi`, `riwayat_penyakit`, `status_akun`, serta pendaftaran layanan langsung: `jenis_layanan` (`rawat_jalan`, `rawat_inap`, `igd`), `penjamin`, `prioritas`, `keluhan`.
- Response sukses: `201 Created`.

**`GET /api/v1/pasien/{id}` — Detail data rekam medis pasien**

- Role `pasien` hanya boleh mengakses rekam medis miliknya sendiri; selain itu mendapat `403`.

#### B. Pendaftaran Pasien

Endpoint untuk mendaftarkan pasien ke layanan rumah sakit (rawat jalan, rawat inap, IGD). Data pendaftaran disimpan langsung di tabel `pasien`.

| Method | Endpoint | Hak Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/v1/pendaftaran` | `admin`, `manajemen`, `resepsionis` | Daftar pasien terdaftar |
| POST | `/api/v1/pendaftaran` | `admin`, `manajemen`, `resepsionis` | Daftarkan pasien ke layanan |
| GET | `/api/v1/pendaftaran/{id}` | `admin`, `manajemen`, `resepsionis` | Detail pendaftaran pasien |
| PUT | `/api/v1/pendaftaran/{id}` | `admin`, `manajemen`, `resepsionis` | Update data pendaftaran |
| PATCH | `/api/v1/pendaftaran/{id}/status` | `admin`, `manajemen`, `resepsionis` | Update status pendaftaran |
| DELETE | `/api/v1/pendaftaran/{id}/batalkan` | `admin`, `manajemen`, `resepsionis` | Batalkan pendaftaran |
| GET | `/api/v1/pendaftaran/statistik` | `admin`, `manajemen`, `resepsionis` | Statistik harian pendaftaran |

**`POST /api/v1/pendaftaran` -- Daftarkan pasien ke layanan**

Body Request (contoh rawat jalan):

```json
{
  "pasien_id": "uuid-pasien",
  "jenis_layanan": "rawat_jalan",
  "poli_id": "uuid-poli",
  "dokter_id": "uuid-dokter",
  "penjamin": "umum",
  "keluhan": "Demam tinggi selama 3 hari"
}
```

Body Request (contoh rawat inap):

```json
{
  "pasien_id": "uuid-pasien",
  "jenis_layanan": "rawat_inap",
  "ruangan_id": "uuid-ruangan",
  "dokter_id": "uuid-dokter",
  "penjamin": "bpjs",
  "nomor_penjamin": "0001234567890",
  "keluhan": "Pasca operasi, perlu observasi"
}
```

Body Request (contoh IGD):

```json
{
  "pasien_id": "uuid-pasien",
  "jenis_layanan": "igd",
  "prioritas": "emergency",
  "penjamin": "umum",
  "keluhan": "Kecelakaan lalu lintas"
}
```

Ketentuan validasi:

- `pasien_id` dan `jenis_layanan` wajib diisi.
- `poli_id` wajib diisi jika `jenis_layanan` = `rawat_jalan`.
- `ruangan_id` wajib diisi jika `jenis_layanan` = `rawat_inap`.
- `prioritas` (`normal` / `urgent` / `emergency`) wajib diisi jika `jenis_layanan` = `igd`.
- `penjamin` wajib diisi (`umum`, `bpjs`, `asuransi`). Jika bukan `umum`, `nomor_penjamin` wajib diisi.
- `nomor_pendaftaran` di-generate otomatis: `RJ-YYYYMMDD-XXXX`, `RI-YYYYMMDD-XXXX`, atau `IGD-YYYYMMDD-XXXX`.
- `tanggal_pendaftaran` default ke hari ini jika tidak dikirim.
- Pasien yang sudah memiliki pendaftaran aktif (status `menunggu` atau `diperiksa`) tidak dapat didaftarkan ulang sebelum pendaftaran sebelumnya diselesaikan atau dibatalkan.
- Response sukses: `201 Created`.

**`GET /api/v1/pendaftaran` -- Daftar pasien terdaftar**

Parameter query:

- `jenis_layanan` -- filter berdasarkan jenis layanan (`rawat_jalan`, `rawat_inap`, `igd`).
- `status` -- filter berdasarkan status pendaftaran (`menunggu`, `diperiksa`, `selesai`, `batal`).
- `tanggal` -- filter berdasarkan tanggal pendaftaran (`YYYY-MM-DD`).
- `tanggal_dari` dan `tanggal_sampai` -- filter berdasarkan rentang tanggal.
- `poli_id` -- filter berdasarkan poli tujuan.
- `dokter_id` -- filter berdasarkan dokter.
- `prioritas` -- filter berdasarkan prioritas IGD.
- `search` -- pencarian berdasarkan `nama_lengkap`, `nomor_pendaftaran`, `nomor_rekam_medis`, atau `nik`.
- `per_page` -- jumlah data per halaman (default `15`).

Response menyertakan data relasi `dokter`, `poli`, dan `ruangan`.

**`PATCH /api/v1/pendaftaran/{id}/status` -- Update status pendaftaran**

```json
{
  "status_pendaftaran": "diperiksa"
}
```

Status yang tersedia: `menunggu`, `diperiksa`, `selesai`, `batal`.

**`DELETE /api/v1/pendaftaran/{id}/batalkan` -- Batalkan pendaftaran**

Membatalkan pendaftaran dan mereset seluruh kolom pendaftaran pada data pasien ke nilai awal.

**`GET /api/v1/pendaftaran/statistik` -- Statistik harian**

Parameter query: `tanggal` (default: hari ini).

Response contoh:

```json
{
  "status": "success",
  "data": {
    "tanggal": "2026-08-05",
    "total": 25,
    "per_jenis_layanan": {
      "rawat_jalan": 15,
      "rawat_inap": 7,
      "igd": 3
    },
    "per_status": {
      "menunggu": 8,
      "diperiksa": 10,
      "selesai": 5,
      "batal": 2
    },
    "igd_prioritas": {
      "normal": 1,
      "urgent": 1,
      "emergency": 1
    }
  }
}
```

#### C. Manajemen User Staff

| Method | Endpoint | Hak Akses |
|---|---|---|
| GET | `/api/v1/users` | `admin`, `manajemen` |
| POST | `/api/v1/users` | `admin`, `manajemen` |
| PUT | `/api/v1/users/{role}/{id}` | `admin`, `manajemen` |

**`GET /api/v1/users?role={role}`** — Daftar user staff

- Parameter `role` default `admin`. Role valid: `admin`, `dokter`, `perawat`, `apoteker`, `kasir`, `resepsionis`, `manajemen`.
- Response berisi `data.selected_role`, `data.users` (kolom `password` dihapus), dan `data.counts` (jumlah user per role).

**`POST /api/v1/users` — Tambah user staff baru**

```json
{
  "role": "kasir",
  "email": "susi.kasir@simrs.id",
  "password": "password123",
  "nama_lengkap": "Susi Susanti",
  "shift": "pagi"
}
```

- Wajib: `email` (format email), `password` (minimal 6 karakter), `role`.
- Kolom lain akan diteruskan sesuai tabel role (mis. `shift`, `loket_id`, `poli_id`, dst.).
- Password di-hash otomatis; tidak pernah dikembalikan pada response.

**`PUT /api/v1/users/{role}/{id}`** — Update data user staff

- Body berisi field yang ingin diperbarui (mis. `nama_lengkap`, `email`, `shift`, `status_akun`, `password`).
- `password` hanya di-hash jika diisi; jika kosong, password lama tidak berubah.
- Field `id` tidak dapat diubah (diabaikan/sanitasi).

#### C. Audit Log & Keamanan

**`GET /api/v1/audit-logs`** *(`admin`, `manajemen`)*

- Parameter query:
  - `modul` — filter pencarian parsial nama modul (mis. `auth`, `api_pasien`).
  - `pembuat_type` — filter role pembuat (mis. `admin`, `resepsionis`).
  - `date` — filter berdasarkan tanggal (`YYYY-MM-DD`).
  - `per_page` — jumlah per halaman (default `20`).
- Urutan hasil: `created_at` menurun (terbaru di atas).

#### D. Hak Akses (RBAC Matrix)

**`GET /api/v1/rbac`** *(`admin` saja)*

- Mengembalikan daftar role dan modul sistem:
  - **Roles:** `admin`, `dokter`, `perawat`, `apoteker`, `kasir`, `resepsionis`, `manajemen`, `pasien`
  - **Modul:** `dashboard`, `user_management`, `patient_management`, `medical_records`, `pharmacy`, `billing`, `registration`, `reports`, `audit_log`

### Ringkasan Hak Akses Role (API v1)

| Endpoint | pasien | admin | manajemen | resepsionis | dokter | perawat | kasir | apoteker |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `POST /login`, `/admin-login` | v | v | v | v | v | v | v | v |
| `GET /auth/me`, `POST /auth/logout` | v | v | v | v | v | v | v | v |
| `GET /pasien` | v (data sendiri) | v | v | v | v | v | v | v |
| `GET /pasien/{id}` | v (data sendiri) | v | v | v | v | v | v | v |
| `POST /pasien` | x | v | v | v | v | v | v | x |
| `GET/POST/PUT/PATCH/DELETE /pendaftaran` | x | v | v | v | x | x | x | x |
| `GET /pendaftaran/statistik` | x | v | v | v | x | x | x | x |
| `GET/POST/PUT /users` | x | v | v | x | x | x | x | x |
| `GET /audit-logs` | x | v | v | x | x | x | x | x |
| `GET /rbac` | x | v | x | x | x | x | x | x |

---

## Struktur Database

Seluruh tabel menggunakan **UUID** sebagai primary key (`HasUuids`). Berikut ringkasan tabel beserta relasinya:

### Tabel Master (data referensi)

| Tabel | Kolom Utama | Diisi Seeder |
|---|---|---|
| `poli` | `nama_poli`, `keterangan` | 5 poli (Umum, Gigi, Anak, Kandungan, Mata) |
| `ruangan` | `nama_ruangan`, `tipe_ruangan`, `kapasitas_bed` | 4 ruangan (ICU, VIP, Kelas 1, UGD) |
| `unit_farmasi` | `nama_unit`, `lokasi` | 2 unit (Rawat Jalan, Rawat Inap) |
| `loket_kasir` | `nama_loket`, `lokasi` | 2 loket |
| `loket_pendaftaran` | `nama_loket`, `lokasi` | 2 loket |

### Tabel User per Role

| Tabel | Kolom Spesifik | Relasi |
|---|---|---|
| `admins` | `level_akses`, `jabatan`, `keterangan` | — |
| `dokters` | `nomor_str`, `nomor_sip`, `spesialisasi`, `status_praktik`, `tanda_tangan_digital` | `poli_id → poli` |
| `perawats` | `nomor_str`, `shift`, `spesialisasi_tambahan`, `sertifikasi_keahlian` | `ruangan_id → ruangan` |
| `apotekers` | `nomor_sipa` | `unit_farmasi_id → unit_farmasi` |
| `kasirs` | `shift`, `batas_transaksi_harian` | `loket_id → loket_kasir` |
| `resepsionis` | `shift` | `loket_id → loket_pendaftaran` |
| `manajemen` | `jabatan`, `lingkup_laporan` | — |
| `pasien` | `nomor_rekam_medis` (unique), `nik` (unique), `tanggal_lahir`, `jenis_kelamin`, `golongan_darah`, `alamat`, `no_hp`, `nama_kontak_darurat`, `no_hp_kontak_darurat`, `alergi`, `riwayat_penyakit`, `status_aktif`, `nomor_pendaftaran` (unique), `jenis_layanan`, `status_pendaftaran`, `tanggal_pendaftaran`, `keluhan`, `penjamin`, `nomor_penjamin`, `prioritas`, `catatan_pendaftaran`, `didaftarkan_oleh`, `tipe_pendaftar` | `dokter_id` -> `dokters`, `poli_id` -> `poli`, `ruangan_id` -> `ruangan` |

Kolom umum di semua tabel user: `nama_lengkap`, `email` (unique), `password` (hash), `no_hp`, `foto_profil`, `status_akun` (`aktif`/`nonaktif`), `last_login_at`, timestamps.

### Tabel Pendukung

| Tabel | Keterangan |
|---|---|
| `audit_logs` | Riwayat aktivitas; kolom `pembuat_type` + `pembuat_id` (polimorfik), `modul`, `aksi`, `data_sebelum`, `data_sesudah`, `ip_address`, `created_at`. |
| `personal_access_tokens` | Token Sanctum untuk autentikasi API. |
| `users` | Tabel default scaffold Laravel (tidak digunakan untuk login SIMRS). |
| `cache`, `jobs`, `sessions` | Tabel infrastruktur Laravel. |

---

## Audit Log

Setiap aktivitas penting dicatat ke tabel `audit_logs`:

| Aksi | Modul | Keterangan |
|---|---|---|
| `LOGIN` / `LOGOUT` | `auth` | Login/logout via portal web |
| `API_LOGIN` / `API_LOGOUT` | `api_auth` | Login/logout via REST API |
| `CREATE_PATIENT` | `pasien` / `api_pasien` | Pembuatan pasien baru |
| `CREATE_PENDAFTARAN` | `api_pendaftaran` | Pendaftaran pasien ke layanan |
| `UPDATE_PENDAFTARAN` | `api_pendaftaran` | Update data pendaftaran |
| `UPDATE_STATUS_PENDAFTARAN` | `api_pendaftaran` | Perubahan status pendaftaran |
| `BATALKAN_PENDAFTARAN` | `api_pendaftaran` | Pembatalan pendaftaran |
| `CREATE_USER` / `UPDATE_USER` | `user_management` / `api_user_management` | Kelola user staff |

Setiap entri menyimpan identitas pembuat (`pembuat_type` = role, `pembuat_id` = UUID), `ip_address`, serta snapshot data `data_sebelum` / `data_sesudah`.

---

## Rate Limiting, CORS & Keamanan

- **Rate Limiting Login** — Endpoint `/api/v1/login`, `/api/v1/admin-login`, dan `/api/v1/auth/login` dibatasi **5 percobaan per menit per IP** (didefinisikan di `AppServiceProvider` → `RateLimiter::for('login')`). Pelanggaran menghasilkan `429 Too Many Requests`.
- **CORS** — Dikonfigurasi di `config/cors.php` untuk mengizinkan konsumsi API dari frontend terpisah. Origin yang diizinkan diatur via env `CORS_ALLOWED_ORIGINS` (default: `http://localhost:3000,http://localhost:5173`).
- **Proteksi Database Produksi** — `DB::prohibitDestructiveCommands()` aktif saat `APP_ENV=production` (mencegah `migrate:fresh` / `migrate:refresh`).
- **Kebijakan Password Produksi** — Di produksi, validasi password minimal 12 karakter dengan campuran huruf besar, angka, simbol, dan tidak terkompromi.
- **JSON Error Rendering** — Semua request ke `api/*` (atau yang meminta JSON) otomatis merender exception sebagai JSON.
- **Hidden Password** — Kolom `password` di semua model disembunyikan dari serialization.

---

## Struktur Utama Direktori

```text
sistem-rumahsakit/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/                    # REST API Controllers (Backend Core)
│   │   │   │   ├── AuthController.php             # Login/logout/me (Bearer token)
│   │   │   │   ├── PatientApiController.php       # CRUD pasien
│   │   │   │   ├── PendaftaranApiController.php   # Pendaftaran pasien (rawat jalan/inap/IGD)
│   │   │   │   ├── UserApiController.php          # Kelola user staff
│   │   │   │   ├── AuditLogApiController.php # Riwayat audit log
│   │   │   │   └── RbacApiController.php     # Matriks RBAC
│   │   │   ├── AuthController.php      # Web Auth Controller (session)
│   │   │   ├── UserController.php      # Web: manajemen user
│   │   │   ├── PatientController.php   # Web: manajemen pasien
│   │   │   ├── AuditLogController.php  # Web: audit log
│   │   │   ├── RbacController.php      # Web: matriks RBAC
│   │   │   └── DashboardController.php # Web: dashboard
│   │   └── Middleware/
│   │       ├── EnsureRole.php          # API RBAC (alias: role)
│   │       ├── EnsureWebAuth.php       # Auth web (alias: web.auth)
│   │       ├── EnsureWebRole.php       # RBAC web (alias: web.role)
│   │       ├── FlushAuthGuards.php
│   │       └── HandleInertiaRequests.php
│   ├── Models/                         # Eloquent Models (per role: Admin, Dokter, Pasien, dll.)
│   │   ├── Concerns/HasRole.php        # Trait role resolver
│   │   └── Contracts/HasSimrsRole.php  # Interface model SIMRS
│   └── Providers/AppServiceProvider.php
├── bootstrap/app.php                   # Registrasi route & middleware alias
├── config/                             # cors.php, auth.php, dll.
├── database/
│   ├── migrations/                     # Skema Tabel Database (18 file)
│   └── seeders/                        # Seeders Akun Placeholder & Data Master
├── resources/js/                       # Frontend Inertia + React (preview)
│   └── pages/                          # auth/, dashboard, pasien/, users/, rbac/, audit-logs/
├── routes/
│   ├── api.php                         # REST API Routes (/api/v1/...)
│   └── web.php                         # Web Routes (/login, /admin-login, dsb.)
├── tests/Feature/                      # Test Pest (API auth, login flow, RBAC web)
├── composer.json
├── package.json
└── README.md
```

---

## Pengujian (Testing) & Kualitas Kode

Proyek menggunakan **Pest** sebagai framework testing. Semua test otomatis menjalankan `RefreshDatabase` dan `seed()`.

**Jalankan seluruh test:**

```bash
php artisan test
```

**Test tertentu:**

```bash
php artisan test --filter=ApiAuthTest
php artisan test --filter=WebRoleFlowTest
php artisan test --filter=LoginFlowTest
```

**Skrip quality assurance lengkap** (lint + static analysis + test):

```bash
composer test
```

**Skrip terpisah:**

| Perintah | Fungsi |
|---|---|
| `composer lint` / `composer lint:check` | Format kode dengan Laravel Pint |
| `composer types:check` | Static analysis dengan PHPStan / Larastan |
| `npm run lint` / `npm run lint:check` | Lint frontend dengan ESLint |
| `npm run format` / `npm run format:check` | Format frontend dengan Prettier |
| `npm run types:check` | Type-check frontend dengan `tsc --noEmit` |
| `composer ci:check` | Semua pengecekan di atas sekaligus |

**Cakupan test yang tersedia:**
- Login API (pasien & seluruh role staff), validasi kredensial/role, response token, rate limiting (`429`), revoke token saat logout.
- RBAC API (403 untuk role yang tidak berhak pada `/users`, `/pasien`, `/rbac`, `/audit-logs`).
- Privasi data pasien (role `pasien` hanya melihat data sendiri).
- Alur login web (guest vs staff, session `simrs_user`/`simrs_role`, regenerate session, redirect logout).
- RBAC web (halaman `/users`, `/pasien`, `/rbac`, `/audit-logs`).
- Sanitasi input (mis. field `id` tidak dapat diubah, extra payload diabaikan).

---

## Cara Pengujian API (API Testing)

Anda dapat menguji seluruh endpoint API di atas menggunakan **Postman**, **Insomnia**, atau cURL.

**Contoh 1 — Login Admin via cURL:**

```bash
curl -X POST http://127.0.0.1:8000/api/v1/admin-login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"email":"budi.admin@simrs.id","password":"password123","role":"admin"}'
```

**Contoh 2 — Login Pasien & pakai token untuk mengambil data diri:**

```bash
# 1. Login, ambil token dari data.token pada response
curl -X POST http://127.0.0.1:8000/api/v1/login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"email":"agus.pasien@simrs.id","password":"password123"}'

# 2. Panggil endpoint terproteksi dengan Bearer token
curl http://127.0.0.1:8000/api/v1/auth/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN_DARI_LANGKAH_1>"
```

**Contoh 3 — Buat pasien baru (role resepsionis):**

```bash
curl -X POST http://127.0.0.1:8000/api/v1/pasien \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"nama_lengkap":"Bambang Tri","nik":"3174098765432100","jenis_kelamin":"Laki-laki"}'
```

**Contoh 4 — Lihat audit log dengan filter (role admin):**

```bash
curl "http://127.0.0.1:8000/api/v1/audit-logs?modul=api_auth&per_page=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>"
```
