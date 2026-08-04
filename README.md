# SIMRS Backend API — Sistem Informasi Manajemen Rumah Sakit

Repository ini berisi **Backend Service & REST API** untuk Sistem Informasi Manajemen Rumah Sakit (SIMRS). 

> **Catatan:** Fokus utama repository ini adalah **Backend & REST API** yang dirancang untuk dikonsumsi oleh aplikasi klien eksternal (Aplikasi Mobile, SPA terpisah, dsb.). Tampilan frontend yang disertakan di sini berfungsi sebagai *placeholder/preview* sederhana.

---

## Persyaratan Sistem (Prerequisites)

Sebelum menjalankan proyek ini, pastikan sistem Anda telah terpasang:
- **PHP** `>= 8.2` (dengan ekstensi `pdo_mysql`, `mbstring`, `openssl`, `curl`)
- **Composer** `>= 2.x`
- **Node.js** `>= 18.x` & **NPM**
- **Database MySQL / MariaDB** (misalnya via Laravel Herd, XAMPP, atau Laragon)

---

## Langkah Instalasi & Cara Mengoperasikan

### 1. Salin Konfigurasi Environment
Buat file `.env` dari `.env.example`:
```bash
cp .env.example .env
```

Sesuaikan konfigurasi database pada `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_rumahsakit
DB_USERNAME=root
DB_PASSWORD=
```

### 2. Install Dependensi PHP & Node.js
```bash
composer install
npm install
```

### 3. Generate Application Key
```bash
php artisan key:generate
```

### 4. Migrasi & Seeding Database (Membuat Tabel & Akun Placeholder)
Jalankan perintah berikut untuk menginisialisasi tabel database dan mengisi data *placeholder* akun untuk seluruh role:
```bash
php artisan migrate:fresh --seed
```

### 5. Jalankan Server Backend & Frontend Build

**Jalankan Laravel Backend Server:**
```bash
php artisan serve
```
*(Atau akses langsung via Laravel Herd di `http://backend-rumah-sakit.test`)*

**Jalankan Vite Dev Server (Optional for Frontend Preview):**
```bash
npm run dev
```

---

## 🔑 Akun Placeholder / Demo User per Role

Seluruh role telah dibuatkan akun *placeholder* di database. Gunakan kredensial di bawah ini untuk testing:

> 🔓 **Password untuk semua akun placeholder:** `password123`

| Role | Portal Login | Email Placeholder | Password | Nama / Keterangan |
|---|---|---|---|---|
| **Pasien / Tamu** | `/login` | `agus.pasien@simrs.id` | `password123` | Agus Setiawan |
| **Admin** | `/admin-login` | `budi.admin@simrs.id` | `password123` | Budi Santoso |
| **Dokter** | `/admin-login` | `siti.rahayu@simrs.id` | `password123` | Dr. Siti Rahayu |
| **Perawat** | `/admin-login` | `dewi.lestari@simrs.id` | `password123` | Dewi Lestari |
| **Apoteker** | `/admin-login` | `andi.pratama@simrs.id` | `password123` | Andi Pratama |
| **Kasir** | `/admin-login` | `mega.putri@simrs.id` | `password123` | Mega Putri |
| **Resepsionis** | `/admin-login` | `lina.sari@simrs.id` | `password123` | Lina Sari |
| **Manajemen** | `/admin-login` | `hendra.wijaya@simrs.id` | `password123` | Hendra Wijaya |

---

## 🌐 Halaman Web & Panel Login

- **`/login`** — Portal Login khusus Tamu / Pasien (tanpa dropdown role).
- **`/admin-login`** — Portal Login khusus Admin & Staff/Pegawai (dilengkapi Dropdown Role).

---

## 📡 Dokumentasi Endpoint REST API (v1)

Seluruh response REST API dikembalikan dalam format **JSON**.

> **HTTP Request Headers:**
> - `Accept: application/json`
> - `Content-Type: application/json`

### 1. Authentication Endpoints

#### A. Login Tamu / Pasien
- **Endpoint:** `POST /api/v1/login`
- **Body Request:**
  ```json
  {
    "email": "agus.pasien@simrs.id",
    "password": "password123"
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
  *(Role yang tersedia: `admin`, `dokter`, `perawat`, `apoteker`, `kasir`, `resepsionis`, `manajemen`)*

#### C. Profile User Aktif
- **Endpoint:** `GET /api/v1/auth/me`

#### D. Logout
- **Endpoint:** `POST /api/v1/auth/logout`

---

### 2. Resource Data Endpoints

#### A. Manajemen Pasien
- **`GET /api/v1/pasien`** — Daftar & pencarian data pasien (`?search=nama_atau_rm&per_page=15`).
- **`POST /api/v1/pasien`** — Tambah pasien baru.
  ```json
  {
    "name": "Bambang Tri",
    "nik": "3174098765432100",
    "jenis_kelamin": "Laki-laki",
    "golongan_darah": "B",
    "no_hp": "081299887766",
    "alamat": "Jakarta"
  }
  ```
- **`GET /api/v1/pasien/{id}`** — Detail data rekam medis pasien.

#### B. Manajemen User Staff
- **`GET /api/v1/users?role={role}`** — Daftar user staff berdasarkan role (`admin`, `dokter`, `perawat`, dll).
- **`POST /api/v1/users`** — Tambah user staff baru.
- **`PUT /api/v1/users/{role}/{id}`** — Update data user staff.

#### C. Audit Log & Keamanan
- **`GET /api/v1/audit-logs`** — Riwayat & pencarian audit log aktivitas sistem (`?modul=auth&pembuat_type=admin`).

#### D. Hak Akses (RBAC Matrix)
- **`GET /api/v1/rbac`** — Matriks hak akses modul per role.

---

## 📂 Struktur Utama Direktori Backend

```text
backend-rumah-sakit/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/                    # REST API Controllers (Backend Core)
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── PatientApiController.php
│   │   │   │   ├── UserApiController.php
│   │   │   │   ├── AuditLogApiController.php
│   │   │   │   └── RbacApiController.php
│   │   │   ├── AuthController.php      # Web Auth Controller
│   │   │   └── ...
│   └── Models/                         # Eloquent Models (AuditLog, Pasien, dll)
├── database/
│   ├── migrations/                     # Skema Tabel Database
│   └── seeders/                        # Seeders Akun Placeholder per Role
├── routes/
│   ├── api.php                         # REST API Routes (/api/v1/...)
│   └── web.php                         # Web Routes (/login, /admin-login, dsb)
└── README.md
```

---

## Cara Pengujian API (API Testing)

Anda dapat menguji seluruh endpoint API di atas menggunakan **Postman**, **Insomnia**, atau cURL:

```bash
# Contoh Test Login Admin via cURL:
curl -X POST http://127.0.0.1:8000/api/v1/admin-login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"email":"budi.admin@simrs.id","password":"password123","role":"admin"}'
```
