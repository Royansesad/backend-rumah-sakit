<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserStaffSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password123');
        $now = now();

        // Admins
        DB::table('admins')->insert([
            'id' => '00000000-0000-0000-0000-000000000010',
            'nama_lengkap' => 'Budi Santoso',
            'email' => 'budi.admin@simrs.id',
            'password' => $password,
            'level_akses' => 'standard',
            'status_akun' => 'aktif',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Dokters
        DB::table('dokters')->insert([
            [
                'id' => '00000000-0000-0000-0000-000000000011',
                'nama_lengkap' => 'Dr. Siti Rahayu',
                'email' => 'siti.rahayu@simrs.id',
                'password' => $password,
                'nomor_str' => 'STR-DK-001',
                'spesialisasi' => 'Umum',
                'poli_id' => '00000000-0000-0000-0000-000000000001',
                'status_praktik' => 'aktif',
                'status_akun' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000012',
                'nama_lengkap' => 'Dr. Ahmad Fauzi',
                'email' => 'ahmad.fauzi@simrs.id',
                'password' => $password,
                'nomor_str' => 'STR-DK-002',
                'spesialisasi' => 'Sp.A',
                'poli_id' => '00000000-0000-0000-0000-000000000003',
                'status_praktik' => 'aktif',
                'status_akun' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // Perawats
        DB::table('perawats')->insert([
            [
                'id' => '00000000-0000-0000-0000-000000000013',
                'nama_lengkap' => 'Dewi Lestari',
                'email' => 'dewi.lestari@simrs.id',
                'password' => $password,
                'nomor_str' => 'STR-PR-001',
                'ruangan_id' => '00000000-0000-0000-0000-000000000006',
                'shift' => 'pagi',
                'status_akun' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000014',
                'nama_lengkap' => 'Rina Wati',
                'email' => 'rina.wati@simrs.id',
                'password' => $password,
                'nomor_str' => 'STR-PR-002',
                'ruangan_id' => '00000000-0000-0000-0000-000000000007',
                'shift' => 'malam',
                'status_akun' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // Apotekers
        DB::table('apotekers')->insert([
            'id' => '00000000-0000-0000-0000-000000000015',
            'nama_lengkap' => 'Andi Pratama',
            'email' => 'andi.pratama@simrs.id',
            'password' => $password,
            'unit_farmasi_id' => '00000000-0000-0000-0000-00000000000a',
            'status_akun' => 'aktif',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Kasirs
        DB::table('kasirs')->insert([
            'id' => '00000000-0000-0000-0000-000000000016',
            'nama_lengkap' => 'Mega Putri',
            'email' => 'mega.putri@simrs.id',
            'password' => $password,
            'loket_id' => '00000000-0000-0000-0000-00000000000c',
            'shift' => 'pagi',
            'status_akun' => 'aktif',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Resepsionis
        DB::table('resepsionis')->insert([
            'id' => '00000000-0000-0000-0000-000000000017',
            'nama_lengkap' => 'Lina Sari',
            'email' => 'lina.sari@simrs.id',
            'password' => $password,
            'loket_id' => '00000000-0000-0000-0000-00000000000e',
            'shift' => 'pagi',
            'status_akun' => 'aktif',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Manajemen
        DB::table('manajemen')->insert([
            'id' => '00000000-0000-0000-0000-000000000018',
            'nama_lengkap' => 'Hendra Wijaya',
            'email' => 'hendra.wijaya@simrs.id',
            'password' => $password,
            'jabatan' => 'Direktur Operasional',
            'status_akun' => 'aktif',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}
