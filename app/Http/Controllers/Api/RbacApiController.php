<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class RbacApiController extends Controller
{
    public function index()
    {
        $matrix = [
            'roles' => ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis', 'manajemen', 'pasien'],
            'modules' => [
                ['key' => 'dashboard', 'label' => 'Dashboard'],
                ['key' => 'user_management', 'label' => 'Manajemen User'],
                ['key' => 'patient_management', 'label' => 'Manajemen Pasien'],
                ['key' => 'medical_records', 'label' => 'Rekam Medis'],
                ['key' => 'pharmacy', 'label' => 'Farmasi'],
                ['key' => 'billing', 'label' => 'Billing & Kasir'],
                ['key' => 'registration', 'label' => 'Pendaftaran'],
                ['key' => 'reports', 'label' => 'Laporan'],
                ['key' => 'audit_log', 'label' => 'Audit Log'],
            ]
        ];

        return response()->json([
            'status' => 'success',
            'data' => $matrix
        ]);
    }
}
