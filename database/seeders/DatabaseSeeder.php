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
            WarehouseSupplierSeeder::class,
            UnitFarmasiSeeder::class,
            LoketKasirSeeder::class,
            LoketPendaftaranSeeder::class,
            UserStaffSeeder::class,
            PasienSeeder::class,
            InventorySeeder::class,
            AssetSeeder::class,
            AuditLogSeeder::class,
            MasterIcdSeeder::class,
            MasterObatSeeder::class,
            RmeSeeder::class,
            BedSeeder::class,
            TagihanSeeder::class,
        ]);
    }
}
