<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UnitFarmasiSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('unit_farmasi')->insertOrIgnore([
            ['id' => '00000000-0000-0000-0000-00000000000a', 'nama_unit' => 'Farmasi Rawat Jalan', 'lokasi' => 'Lantai 1 Gedung A', 'created_at' => now()],
            ['id' => '00000000-0000-0000-0000-00000000000b', 'nama_unit' => 'Farmasi Rawat Inap', 'lokasi' => 'Lantai 2 Gedung B', 'created_at' => now()],
        ]);
    }
}
