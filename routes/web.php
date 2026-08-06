<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\RbacController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// 1. Portal Login Tamu / Pasien (/login)
Route::get('/', [AuthController::class, 'showGuestLogin'])->name('home');
Route::get('/login', [AuthController::class, 'showGuestLogin'])->name('login');
Route::post('/login', [AuthController::class, 'loginGuest']);

// 2. Portal Login Admin / Pegawai / Staff (/admin-login) dengan Dropdown Role
Route::get('/admin-login', [AuthController::class, 'showAdminLogin'])->name('login.admin');
Route::post('/admin-login', [AuthController::class, 'loginAdmin']);

// Logout
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Authenticated Routes
Route::middleware(['web.auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Modul Jadwal Praktik & Shift (Dokter, Perawat, Admin)
    Route::get('/jadwal-praktik', [\App\Http\Controllers\ScheduleWebController::class, 'dokterSchedule'])->name('jadwal.praktik');
    Route::get('/jadwal-shift', [\App\Http\Controllers\ScheduleWebController::class, 'nurseShiftSchedule'])->name('jadwal.shift');
    Route::get('/jadwal-dokter-admin', [\App\Http\Controllers\ScheduleWebController::class, 'adminDoctorSchedule'])->name('jadwal.admin');
    Route::get('/papan-antrian', [\App\Http\Controllers\ScheduleWebController::class, 'publicQueueBoard'])->name('papan.antrian');

    Route::middleware('web.role:admin,manajemen')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{role}/{id}', [UserController::class, 'update'])->name('users.update');

        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    });

    // Modul Data Pasien (Admin, Dokter, Perawat, Resepsionis, Manajemen)
    Route::middleware('web.role:admin,dokter,perawat,resepsionis,manajemen')->group(function () {
        Route::get('/pasien', [PatientController::class, 'index'])->name('pasien.index');
    });

    // Modul RME & Resep Digital (Hanya Admin, Dokter, Perawat, Apoteker)
    Route::middleware('web.role:admin,dokter,perawat,apoteker')->group(function () {
        Route::get('/rme', [\App\Http\Controllers\RmeWebController::class, 'index'])->name('rme.index');
    });

    Route::middleware('web.role:admin,resepsionis')->group(function () {
        Route::post('/pasien', [PatientController::class, 'store'])->name('pasien.store');
    });

    Route::middleware('web.role:admin')->group(function () {
        Route::get('/rbac', [RbacController::class, 'index'])->name('rbac.index');
    });
});

