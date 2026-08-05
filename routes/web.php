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

    Route::middleware('web.role:admin,manajemen')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{role}/{id}', [UserController::class, 'update'])->name('users.update');

        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    });

    Route::middleware('web.role:admin,dokter,perawat,apoteker,kasir,resepsionis,manajemen')->group(function () {
        Route::get('/pasien', [PatientController::class, 'index'])->name('pasien.index');
    });

    Route::middleware('web.role:admin,resepsionis')->group(function () {
        Route::post('/pasien', [PatientController::class, 'store'])->name('pasien.store');
    });

    Route::middleware('web.role:admin')->group(function () {
        Route::get('/rbac', [RbacController::class, 'index'])->name('rbac.index');
    });
});
