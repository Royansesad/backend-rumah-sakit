<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PoliSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('poli')->insertOrIgnore([
            ['id' => '00000000-0000-0000-0000-000000000001', 'nama_poli' => 'Poli Umum', 'keterangan' => 'Layanan kesehatan umum', 'created_at' => now()],
            ['id' => '00000000-0000-0000-0000-000000000002', 'nama_poli' => 'Poli Gigi', 'keterangan' => 'Layanan kesehatan gigi dan mulut', 'created_at' => now()],
            ['id' => '00000000-0000-0000-0000-000000000003', 'nama_poli' => 'Poli Anak', 'keterangan' => 'Layanan kesehatan anak dan balita', 'created_at' => now()],
            ['id' => '00000000-0000-0000-0000-000000000004', 'nama_poli' => 'Poli Kandungan', 'keterangan' => 'Layanan kesehatan ibu dan kandungan', 'created_at' => now()],
            ['id' => '00000000-0000-0000-0000-000000000005', 'nama_poli' => 'Poli Mata', 'keterangan' => 'Layanan kesehatan mata', 'created_at' => now()],
        ]);
    }
}
