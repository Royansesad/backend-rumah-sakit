<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RuanganSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('ruangan')->insertOrIgnore([
            ['id' => '00000000-0000-0000-0000-000000000006', 'nama_ruangan' => 'ICU', 'tipe_ruangan' => 'Intensive Care', 'kapasitas_bed' => 5, 'created_at' => now()],
            ['id' => '00000000-0000-0000-0000-000000000007', 'nama_ruangan' => 'Ruang Inap A', 'tipe_ruangan' => 'Rawat Inap VIP', 'kapasitas_bed' => 10, 'created_at' => now()],
            ['id' => '00000000-0000-0000-0000-000000000008', 'nama_ruangan' => 'Ruang Inap B', 'tipe_ruangan' => 'Rawat Inap Kelas 1', 'kapasitas_bed' => 15, 'created_at' => now()],
            ['id' => '00000000-0000-0000-0000-000000000009', 'nama_ruangan' => 'UGD', 'tipe_ruangan' => 'Gawat Darurat', 'kapasitas_bed' => 8, 'created_at' => now()],
        ]);
    }
}
