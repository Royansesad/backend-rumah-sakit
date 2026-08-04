<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LoketKasirSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('loket_kasir')->insert([
            ['id' => '00000000-0000-0000-0000-00000000000c', 'nama_loket' => 'Kasir 1', 'lokasi' => 'Lobi Utama Gedung A', 'created_at' => now()],
            ['id' => '00000000-0000-0000-0000-00000000000d', 'nama_loket' => 'Kasir 2', 'lokasi' => 'Lantai 2 Gedung A', 'created_at' => now()],
        ]);
    }
}
