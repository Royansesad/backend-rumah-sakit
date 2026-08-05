<?php

use App\Http\Controllers\Api\AuditLogApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientApiController;
use App\Http\Controllers\Api\PendaftaranApiController;
use App\Http\Controllers\Api\RbacApiController;
use App\Http\Controllers\Api\UserApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| REST API Routes (v1) - Backend SIMRS
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Auth REST API Endpoints (public, token issued on success)
    Route::post('/login', [AuthController::class, 'loginGuest'])->middleware('throttle:login');          // 1. API Login Tamu / Pasien
    Route::post('/admin-login', [AuthController::class, 'loginAdmin'])->middleware('throttle:login');     // 2. API Login Admin / Staff (Dropdown Role)

    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

    // Authenticated REST API Endpoints (Sanctum Bearer Token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Pasien API
        Route::get('/pasien', [PatientApiController::class, 'index']);
        Route::post('/pasien', [PatientApiController::class, 'store'])
            ->middleware('role:admin,resepsionis');
        Route::get('/pasien/{id}', [PatientApiController::class, 'show']);
        Route::put('/pasien/{id}', [PatientApiController::class, 'update'])
            ->middleware('role:admin,resepsionis,manajemen');
        Route::delete('/pasien/{id}', [PatientApiController::class, 'destroy'])
            ->middleware('role:admin,manajemen');

        // Pendaftaran API (Admin, Manajemen, Resepsionis)
        Route::middleware('role:admin,manajemen,resepsionis')->prefix('pendaftaran')->group(function () {
            Route::get('/statistik', [PendaftaranApiController::class, 'statistik']);
            Route::get('/', [PendaftaranApiController::class, 'index']);
            Route::post('/', [PendaftaranApiController::class, 'store']);
            Route::get('/{id}', [PendaftaranApiController::class, 'show']);
            Route::put('/{id}', [PendaftaranApiController::class, 'update']);
            Route::patch('/{id}/status', [PendaftaranApiController::class, 'updateStatus']);
            Route::delete('/{id}/batalkan', [PendaftaranApiController::class, 'batalkan']);
        });

        // User Management & Audit Log API (Management only)
        Route::middleware('role:admin,manajemen')->group(function () {
            Route::get('/users', [UserApiController::class, 'index']);
            Route::post('/users', [UserApiController::class, 'store']);
            Route::put('/users/{role}/{id}', [UserApiController::class, 'update']);

            // Audit Log API
            Route::get('/audit-logs', [AuditLogApiController::class, 'index']);
        });

        // RBAC Matrix API (Admin only)
        Route::get('/rbac', [RbacApiController::class, 'index'])
            ->middleware('role:admin');
    });
});
