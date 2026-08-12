<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LoketPendaftaranSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('loket_pendaftaran')->insertOrIgnore([
            ['id' => '00000000-0000-0000-0000-00000000000e', 'nama_loket' => 'Pendaftaran 1', 'lokasi' => 'Lobi Utama Gedung A', 'created_at' => now()],
            ['id' => '00000000-0000-0000-0000-00000000000f', 'nama_loket' => 'Pendaftaran 2', 'lokasi' => 'Lantai 1 Gedung B', 'created_at' => now()],
        ]);
    }
}
