<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('audit_logs')->insert([
            [
                'id' => '00000000-0000-0000-0000-000000000031',
                'pembuat_type' => 'admin',
                'pembuat_id' => '00000000-0000-0000-0000-000000000010',
                'modul' => 'system',
                'aksi' => 'INITIALIZE',
                'data_sebelum' => null,
                'data_sesudah' => json_encode(['status' => 'initialized']),
                'ip_address' => '127.0.0.1',
                'created_at' => now(),
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000032',
                'pembuat_type' => 'resepsionis',
                'pembuat_id' => '00000000-0000-0000-0000-000000000017',
                'modul' => 'pasien',
                'aksi' => 'CREATE',
                'data_sebelum' => null,
                'data_sesudah' => json_encode(['nomor_rekam_medis' => 'RM-2024-0001', 'nama_lengkap' => 'Agus Setiawan']),
                'ip_address' => '192.168.1.10',
                'created_at' => now(),
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000033',
                'pembuat_type' => 'admin',
                'pembuat_id' => '00000000-0000-0000-0000-000000000010',
                'modul' => 'user_management',
                'aksi' => 'CREATE',
                'data_sebelum' => null,
                'data_sesudah' => json_encode(['role' => 'dokter', 'email' => 'siti.rahayu@simrs.id']),
                'ip_address' => '127.0.0.1',
                'created_at' => now(),
            ]
        ]);
    }
}
