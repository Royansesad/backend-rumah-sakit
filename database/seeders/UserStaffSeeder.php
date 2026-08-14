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
        DB::table('admins')->insertOrIgnore([
            'id' => '00000000-0000-0000-0000-000000000010',
            'nama_lengkap' => 'Budi Santoso',
            'email' => 'budi.admin@simrs.id',
            'password' => $password,
            'level_akses' => 'standard',
            'status_akun' => 'aktif',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Dokters (Semua Poli)
        DB::table('dokters')->insertOrIgnore([
            [
                'id' => '00000000-0000-0000-0000-000000000011',
                'nama_lengkap' => 'Dr. Siti Rahayu',
                'email' => 'siti.rahayu@simrs.id',
                'password' => $password,
                'no_hp' => '081234567801',
                'nomor_str' => 'STR-DK-001',
                'nomor_sip' => 'SIP-2023-0011',
                'spesialisasi' => 'Umum',
                'poli_id' => '00000000-0000-0000-0000-000000000001', // Poli Umum
                'status_praktik' => 'aktif',
                'status_akun' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000012',
                'nama_lengkap' => 'Dr. Ahmad Fauzi, Sp.A',
                'email' => 'ahmad.fauzi@simrs.id',
                'password' => $password,
                'no_hp' => '081234567802',
                'nomor_str' => 'STR-DK-002',
                'nomor_sip' => 'SIP-2023-0012',
                'spesialisasi' => 'Spesialis Anak',
                'poli_id' => '00000000-0000-0000-0000-000000000003', // Poli Anak
                'status_praktik' => 'aktif',
                'status_akun' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000019',
                'nama_lengkap' => 'Dr. Ratna Sari, Sp.KG',
                'email' => 'ratna.sari@simrs.id',
                'password' => $password,
                'no_hp' => '081234567803',
                'nomor_str' => 'STR-DK-003',
                'nomor_sip' => 'SIP-2023-0019',
                'spesialisasi' => 'Konservasi Gigi',
                'poli_id' => '00000000-0000-0000-0000-000000000002', // Poli Gigi
                'status_praktik' => 'aktif',
                'status_akun' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000020',
                'nama_lengkap' => 'Dr. Maya Indah, Sp.OG',
                'email' => 'maya.indah@simrs.id',
                'password' => $password,
                'no_hp' => '081234567804',
                'nomor_str' => 'STR-DK-004',
                'nomor_sip' => 'SIP-2023-0020',
                'spesialisasi' => 'Kebidanan & Kandungan',
                'poli_id' => '00000000-0000-0000-0000-000000000004', // Poli Kandungan
                'status_praktik' => 'aktif',
                'status_akun' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000021',
                'nama_lengkap' => 'Dr. Hendra Wijaya, Sp.M',
                'email' => 'hendra.wijaya.dokter@simrs.id',
                'password' => $password,
                'no_hp' => '081234567805',
                'nomor_str' => 'STR-DK-005',
                'nomor_sip' => 'SIP-2023-0021',
                'spesialisasi' => 'Spesialis Mata',
                'poli_id' => '00000000-0000-0000-0000-000000000005', // Poli Mata
                'status_praktik' => 'aktif',
                'status_akun' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000022',
                'nama_lengkap' => 'Dr. Bambang Hermanto, Sp.PD',
                'email' => 'bambang.hermanto@simrs.id',
                'password' => $password,
                'no_hp' => '081234567806',
                'nomor_str' => 'STR-DK-006',
                'nomor_sip' => 'SIP-2023-0022',
                'spesialisasi' => 'Penyakit Dalam',
                'poli_id' => '00000000-0000-0000-0000-000000000001', // Poli Penyakit Dalam
                'status_praktik' => 'aktif',
                'status_akun' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // Perawats
        DB::table('perawats')->insertOrIgnore([
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
        DB::table('apotekers')->insertOrIgnore([
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
        DB::table('kasirs')->insertOrIgnore([
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
        DB::table('resepsionis')->insertOrIgnore([
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
        DB::table('manajemen')->insertOrIgnore([
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
