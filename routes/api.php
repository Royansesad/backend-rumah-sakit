<?php

use App\Http\Controllers\Api\BedApiController;
use App\Http\Controllers\Api\RawatInapApiController;
use App\Http\Controllers\Api\AuditLogApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Icd10CodeApiController;
use App\Http\Controllers\Api\ObatApiController;
use App\Http\Controllers\Api\PatientApiController;
use App\Http\Controllers\Api\PendaftaranApiController;
use App\Http\Controllers\Api\RbacApiController;
use App\Http\Controllers\Api\RekamMedisApiController;
use App\Http\Controllers\Api\ResepApiController;
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

    // Public Read-Only TV Board Display Antrian Pasien
    Route::get('/public/tv-board', [App\Http\Controllers\Api\AntrianApiController::class, 'tvBoard']);

    // Authenticated REST API Endpoints (Sanctum Bearer Token or Toggleable Security)
    Route::middleware('auth.api:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // =====================================================================
        // Modul Manajemen Jadwal Praktik Dokter & Shift Perawat
        // =====================================================================
        Route::get('/dokter/jadwal-mandiri', [App\Http\Controllers\Api\JadwalDokterApiController::class, 'mandiri']);
        Route::get('/admin/jadwal-dokter/grid', [App\Http\Controllers\Api\JadwalDokterApiController::class, 'gridAdmin']);
        Route::post('/admin/jadwal-dokter', [App\Http\Controllers\Api\JadwalDokterApiController::class, 'store']);

        Route::get('/perawat/shift-schedules', [App\Http\Controllers\Api\JadwalShiftPerawatApiController::class, 'index']);
        Route::post('/admin/shift-schedules', [App\Http\Controllers\Api\JadwalShiftPerawatApiController::class, 'store']);

        // =====================================================================
        // Modul Pengajuan Cuti & Tukar Shift (2-Level Approval)
        // =====================================================================
        Route::post('/pengajuan-cuti', [App\Http\Controllers\Api\PengajuanCutiApiController::class, 'store']);
        Route::get('/pengajuan-cuti/mandiri', [App\Http\Controllers\Api\PengajuanCutiApiController::class, 'riwayatMandiri']);
        Route::patch('/admin/pengajuan-cuti/{id}/persetujuan', [App\Http\Controllers\Api\PengajuanCutiApiController::class, 'persetujuanAdmin']);

        Route::post('/pengajuan-tukar-jadwal', [App\Http\Controllers\Api\PengajuanTukarJadwalApiController::class, 'store']);
        Route::get('/pengajuan-tukar-jadwal/mandiri', [App\Http\Controllers\Api\PengajuanTukarJadwalApiController::class, 'riwayatMandiri']);
        Route::patch('/pengajuan-tukar-jadwal/{id}/persetujuan-target', [App\Http\Controllers\Api\PengajuanTukarJadwalApiController::class, 'persetujuanTarget']);
        Route::patch('/admin/pengajuan-tukar-jadwal/{id}/persetujuan-admin', [App\Http\Controllers\Api\PengajuanTukarJadwalApiController::class, 'persetujuanAdmin']);

        // =====================================================================
        // Modul Manajemen Antrian Pasien
        // =====================================================================
        Route::post('/antrian/ambil', [App\Http\Controllers\Api\AntrianApiController::class, 'ambilAntrian']);
        Route::get('/antrian/hari-ini', [App\Http\Controllers\Api\AntrianApiController::class, 'indexHariIni']);
        Route::patch('/antrian/{id}/status', [App\Http\Controllers\Api\AntrianApiController::class, 'updateStatus']);
        Route::post('/antrian/panggil-berikutnya', [App\Http\Controllers\Api\AntrianApiController::class, 'panggilBerikutnya']);
        Route::get('/antrian/statistik', [App\Http\Controllers\Api\AntrianApiController::class, 'statistikHariIni']);

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

        // =====================================================================
        // Modul RME Lokal (Rekam Medis Elektronik)
        // =====================================================================

        // ICD-10 Lookup (semua role medis)
        Route::get('/icd10', [Icd10CodeApiController::class, 'index']);

        // Obat / Master Farmasi (Admin, Apoteker, Dokter)
        Route::prefix('obat')->group(function () {
            Route::get('/', [ObatApiController::class, 'index']);
            Route::get('/{id}', [ObatApiController::class, 'show']);
            Route::post('/', [ObatApiController::class, 'store'])
                ->middleware('role:admin,apoteker');
            Route::put('/{id}', [ObatApiController::class, 'update'])
                ->middleware('role:admin,apoteker');
            Route::delete('/{id}', [ObatApiController::class, 'destroy'])
                ->middleware('role:admin,apoteker');
        });

        // Rekam Medis (Dokter, Perawat, Admin)
        Route::prefix('rekam-medis')->group(function () {
            Route::get('/', [RekamMedisApiController::class, 'index']);
            Route::get('/{id}', [RekamMedisApiController::class, 'show']);
            Route::get('/{pasienId}/monitoring', [RekamMedisApiController::class, 'monitoring']);
            Route::post('/', [RekamMedisApiController::class, 'store'])
                ->middleware('role:admin,dokter,perawat');
            Route::put('/{id}', [RekamMedisApiController::class, 'update'])
                ->middleware('role:admin,dokter,perawat');
            Route::patch('/{id}/finalize', [RekamMedisApiController::class, 'finalize'])
                ->middleware('role:admin,dokter');
        });

        // Resep Digital (Dokter, Apoteker, Admin)
        Route::prefix('resep')->group(function () {
            Route::get('/', [ResepApiController::class, 'index']);
            Route::get('/{id}', [ResepApiController::class, 'show']);
            Route::post('/', [ResepApiController::class, 'store'])
                ->middleware('role:admin,dokter');
            Route::patch('/{id}/tebus', [ResepApiController::class, 'tebus'])
                ->middleware('role:admin,apoteker');
        });

        // =====================================================================
        // Modul Tempat Tidur (Bed) & Rawat Inap
        // =====================================================================
        Route::prefix('beds')->group(function () {
            Route::get('/', [BedApiController::class, 'index']);
            Route::get('/matrix', [BedApiController::class, 'matrix']);
            Route::get('/{id}', [BedApiController::class, 'show']);
            Route::post('/', [BedApiController::class, 'store'])
                ->middleware('role:admin,manajemen,perawat,resepsionis');
            Route::put('/{id}', [BedApiController::class, 'update'])
                ->middleware('role:admin,manajemen,perawat,resepsionis');
            Route::patch('/{id}/status', [BedApiController::class, 'updateStatus'])
                ->middleware('role:admin,manajemen,perawat,resepsionis');
            Route::delete('/{id}', [BedApiController::class, 'destroy'])
                ->middleware('role:admin,manajemen');
        });

        Route::prefix('rawat-inap')->group(function () {
            Route::get('/', [RawatInapApiController::class, 'index']);
            Route::get('/statistik', [RawatInapApiController::class, 'statistik']);
            Route::get('/{id}', [RawatInapApiController::class, 'show']);
            Route::post('/check-in', [RawatInapApiController::class, 'checkIn'])
                ->middleware('role:admin,resepsionis,perawat,dokter');
            Route::post('/{id}/pindah-bed', [RawatInapApiController::class, 'pindahBed'])
                ->middleware('role:admin,resepsionis,perawat,dokter');
            Route::post('/{id}/check-out', [RawatInapApiController::class, 'checkOut'])
                ->middleware('role:admin,resepsionis,perawat,dokter');
        });

        // =====================================================================
        // Modul Kasir & Billing Tagihan
        // =====================================================================
        Route::prefix('tagihan')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\TagihanApiController::class, 'index']);
            Route::get('/laporan', [\App\Http\Controllers\Api\TagihanApiController::class, 'laporan'])
                ->middleware('role:admin,kasir,manajemen');
            Route::get('/{id}', [\App\Http\Controllers\Api\TagihanApiController::class, 'show']);
            Route::post('/', [\App\Http\Controllers\Api\TagihanApiController::class, 'store'])
                ->middleware('role:admin,kasir,manajemen');
            Route::post('/{id}/bayar', [\App\Http\Controllers\Api\TagihanApiController::class, 'bayar'])
                ->middleware('role:admin,kasir');
            Route::patch('/{id}/batalkan', [\App\Http\Controllers\Api\TagihanApiController::class, 'batalkan'])
                ->middleware('role:admin,kasir,manajemen');
        });

        // =====================================================================
        // Modul Manajemen Inventaris (Barang Habis Pakai)
        // =====================================================================
        Route::prefix('inventaris')->middleware('role:admin,manajemen,apoteker')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\InventarisApiController::class, 'index']);
            Route::get('/master', [\App\Http\Controllers\Api\InventarisApiController::class, 'master']);
            Route::get('/laporan', [\App\Http\Controllers\Api\InventarisApiController::class, 'laporan']);
            Route::post('/', [\App\Http\Controllers\Api\InventarisApiController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\Api\InventarisApiController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\InventarisApiController::class, 'update']);
            Route::post('/{id}/mutasi', [\App\Http\Controllers\Api\InventarisApiController::class, 'mutasi']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\InventarisApiController::class, 'destroy']);
        });

        // =====================================================================
        // Modul Manajemen Aset Tetap
        // =====================================================================
        Route::prefix('aset')->middleware('role:admin,manajemen')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\AsetApiController::class, 'index']);
            Route::get('/master', [\App\Http\Controllers\Api\AsetApiController::class, 'master']);
            Route::get('/laporan', [\App\Http\Controllers\Api\AsetApiController::class, 'laporan']);
            Route::post('/', [\App\Http\Controllers\Api\AsetApiController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\Api\AsetApiController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\AsetApiController::class, 'update']);
            Route::post('/{id}/maintenance', [\App\Http\Controllers\Api\AsetApiController::class, 'maintenance']);
            Route::post('/{id}/pinjam', [\App\Http\Controllers\Api\AsetApiController::class, 'pinjam']);
            Route::post('/{id}/kembalikan', [\App\Http\Controllers\Api\AsetApiController::class, 'kembalikan']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\AsetApiController::class, 'destroy']);
        });

        Route::patch('/aset/maintenance/{id}/selesai', [\App\Http\Controllers\Api\AsetApiController::class, 'maintenanceSelesai'])
            ->middleware('role:admin,manajemen');
    });
});

