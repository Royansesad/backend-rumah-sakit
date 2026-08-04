<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientApiController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\AuditLogApiController;
use App\Http\Controllers\Api\RbacApiController;

/*
|--------------------------------------------------------------------------
| REST API Routes (v1) - Backend SIMRS
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Auth REST API Endpoints
    Route::post('/login', [AuthController::class, 'loginGuest']);          // 1. API Login Tamu / Pasien
    Route::post('/admin-login', [AuthController::class, 'loginAdmin']);     // 2. API Login Admin / Staff (Dropdown Role)

    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Pasien API
    Route::get('/pasien', [PatientApiController::class, 'index']);
    Route::post('/pasien', [PatientApiController::class, 'store']);
    Route::get('/pasien/{id}', [PatientApiController::class, 'show']);

    // User Management API
    Route::get('/users', [UserApiController::class, 'index']);
    Route::post('/users', [UserApiController::class, 'store']);
    Route::put('/users/{role}/{id}', [UserApiController::class, 'update']);

    // Audit Log API
    Route::get('/audit-logs', [AuditLogApiController::class, 'index']);

    // RBAC Matrix API
    Route::get('/rbac', [RbacApiController::class, 'index']);
});
