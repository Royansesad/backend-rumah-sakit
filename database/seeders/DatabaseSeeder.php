<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PoliSeeder::class,
            RuanganSeeder::class,
            UnitFarmasiSeeder::class,
            LoketKasirSeeder::class,
            LoketPendaftaranSeeder::class,
            UserStaffSeeder::class,
            PasienSeeder::class,
            AuditLogSeeder::class,
            RmeSeeder::class,
        ]);
    }
}
