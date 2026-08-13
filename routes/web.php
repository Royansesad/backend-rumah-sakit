<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientPortalController;
use App\Http\Controllers\RbacController;
use App\Http\Controllers\AntrianWebController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// 1. Portal Login Tamu / Pasien (/login)
Route::get('/', [AuthController::class, 'showGuestLogin'])->name('home');
Route::get('/login', [AuthController::class, 'showGuestLogin'])->name('login');
Route::post('/login', [AuthController::class, 'loginGuest']);

// 2. Portal Login Admin / Pegawai / Staff (/admin-login) dengan Dropdown Role
Route::get('/admin-login', [AuthController::class, 'showAdminLogin'])->name('login.admin');
Route::post('/admin-login', [AuthController::class, 'loginAdmin']);

// 3. Permintaan Akses Akun Staf (/admin-request-access)
Route::get('/admin-request-access', [AuthController::class, 'showRequestAccess'])->name('admin.request-access');
Route::post('/admin-request-access', [AuthController::class, 'submitRequestAccess']);
Route::get('/hubungi-admin', [AuthController::class, 'showRequestAccess']);

// 4. Reset Kata Sandi Staf (/admin-forgot-password)
Route::get('/admin-forgot-password', [AuthController::class, 'showForgotPassword'])->name('admin.forgot-password');
Route::post('/admin-forgot-password', [AuthController::class, 'submitForgotPassword']);
Route::post('/admin-reset-password', [AuthController::class, 'resetPassword'])->name('admin.reset-password');
Route::get('/lupa-password', [AuthController::class, 'showForgotPassword']);

// Logout
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Authenticated Routes
Route::middleware(['web.auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Portal Pasien (Lihat Rekam Medis, Riwayat Kunjungan, & Booking Online)
    Route::prefix('portal')->middleware('web.role:pasien')->group(function () {
        Route::get('/', [PatientPortalController::class, 'portal'])->name('portal.index');
        Route::get('/rekam-medis', [PatientPortalController::class, 'rekamMedis'])->name('portal.rekam-medis');
        Route::get('/rekam-medis/{id}', [PatientPortalController::class, 'rekamMedisShow'])->name('portal.rekam-medis.show');
        Route::get('/riwayat', [PatientPortalController::class, 'riwayat'])->name('portal.riwayat');
        Route::get('/booking', [PatientPortalController::class, 'booking'])->name('portal.booking');
        Route::post('/booking', [PatientPortalController::class, 'bookingStore'])->name('portal.booking.store');
        Route::post('/booking/{id}/batal', [PatientPortalController::class, 'bookingCancel'])->name('portal.booking.cancel');
    });

    // Modul Jadwal Praktik & Shift (Dokter, Perawat, Admin)
    Route::get('/jadwal-praktik', [\App\Http\Controllers\ScheduleWebController::class, 'dokterSchedule'])->name('jadwal.praktik');
    Route::get('/jadwal-shift', [\App\Http\Controllers\ScheduleWebController::class, 'nurseShiftSchedule'])->name('jadwal.shift');
    Route::get('/jadwal-dokter-admin', [\App\Http\Controllers\ScheduleWebController::class, 'adminDoctorSchedule'])->name('jadwal.admin');
    Route::get('/papan-antrian', [\App\Http\Controllers\ScheduleWebController::class, 'publicQueueBoard'])->name('papan.antrian');
    Route::get('/manajemen-antrian', [AntrianWebController::class, 'index'])->name('antrian.index');

    Route::middleware('web.role:admin,manajemen')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{role}/{id}', [UserController::class, 'update'])->name('users.update');

        Route::get('/audit-logs/export', [AuditLogController::class, 'export'])->name('audit-logs.export');
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    });

    // Modul Data Pasien (Admin, Dokter, Perawat, Resepsionis, Manajemen)
    Route::middleware('web.role:admin,dokter,perawat,resepsionis,manajemen')->group(function () {
        Route::get('/pasien', [PatientController::class, 'index'])->name('pasien.index');
        Route::get('/pasien/export', [PatientController::class, 'exportExcel'])->name('pasien.export');
        Route::get('/pendaftaran-pasien', [PatientController::class, 'create'])->name('pasien.create');
        Route::put('/pasien/{id}', [PatientController::class, 'update'])->name('pasien.update');
        Route::delete('/pasien/{id}', [PatientController::class, 'destroy'])->name('pasien.destroy');
        Route::get('/api/check-nik', [PatientController::class, 'checkNik'])->name('pasien.check-nik');
    });

    // Modul RME & Resep Digital (Hanya Admin, Dokter, Perawat, Apoteker)
    Route::middleware('web.role:admin,dokter,perawat,apoteker')->group(function () {
        Route::get('/rme', [\App\Http\Controllers\RmeWebController::class, 'index'])->name('rme.index');
    });

    // Modul Rawat Inap & Bed Management (Admin, Dokter, Perawat, Resepsionis, Manajemen)
    Route::middleware('web.role:admin,dokter,perawat,resepsionis,manajemen')->group(function () {
        Route::get('/rawat-inap', [\App\Http\Controllers\RawatInapWebController::class, 'index'])->name('rawat-inap.index');
    });

    Route::middleware('web.role:admin,resepsionis')->group(function () {
        Route::post('/pasien', [PatientController::class, 'store'])->name('pasien.store');
    });

    Route::middleware('web.role:admin')->group(function () {
        Route::get('/rbac', [RbacController::class, 'index'])->name('rbac.index');
        Route::post('/rbac', [RbacController::class, 'update'])->name('rbac.update');
    });

    // Modul Billing & Tagihan Kasir (Admin, Kasir, Manajemen)
    Route::middleware('web.role:admin,kasir,manajemen')->group(function () {
        Route::get('/laporan-kasir', [\App\Http\Controllers\TagihanWebController::class, 'laporan'])->name('laporan.kasir');
        Route::post('/tagihan/{id}/bayar', [\App\Http\Controllers\TagihanWebController::class, 'bayar'])->name('tagihan.bayar');
    });

    // Modul Apoteker & Penebusan Resep / Stok Obat (Admin, Apoteker)
    Route::middleware('web.role:admin,apoteker')->group(function () {
        Route::post('/resep/{id}/tebus', [\App\Http\Controllers\ApotekerWebController::class, 'tebusResep'])->name('resep.tebus');
        Route::post('/obat/{id}/stok', [\App\Http\Controllers\ApotekerWebController::class, 'updateStokObat'])->name('obat.stok');
        Route::post('/obat', [\App\Http\Controllers\ApotekerWebController::class, 'storeObat'])->name('obat.store');
    });

    // Modul Manajemen Inventaris & Aset (Admin, Manajemen, Apoteker)
    Route::middleware('web.role:admin,manajemen,apoteker')->group(function () {
        Route::get('/inventaris', [\App\Http\Controllers\InventarisWebController::class, 'index'])->name('inventaris.index');
        Route::get('/inventaris/export', [\App\Http\Controllers\InventarisWebController::class, 'export'])->name('inventaris.export');
    });
    Route::middleware('web.role:admin,manajemen')->group(function () {
        Route::get('/aset', [\App\Http\Controllers\AsetWebController::class, 'index'])->name('aset.index');
    });
});
