<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WarehouseSupplierSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        DB::table('warehouses')->insertOrIgnore([
            [
                'id' => '00000000-0000-0000-0000-000000000030',
                'nama_gudang' => 'Gudang Farmasi Pusat',
                'lokasi' => 'Lantai 1 Gedung B',
                'penanggung_jawab' => 'Andi Pratama',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000031',
                'nama_gudang' => 'Gudang Alat Medis',
                'lokasi' => 'Lantai 2 Gedung B',
                'penanggung_jawab' => 'Dewi Lestari',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000032',
                'nama_gudang' => 'Gudang Logistik Umum',
                'lokasi' => 'Lantai 1 Gedung C',
                'penanggung_jawab' => 'Rina Wati',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        DB::table('suppliers')->insertOrIgnore([
            [
                'id' => '00000000-0000-0000-0000-000000000033',
                'nama_supplier' => 'PT Kimia Farma Trading & Distribution',
                'kontak' => 'Bagian Distribusi',
                'telepon' => '021-500600',
                'email' => 'sales@kftd.co.id',
                'alamat' => 'Jl. Veteran No. 9, Jakarta Pusat',
                'npwp' => '01.234.567.8-001.000',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000034',
                'nama_supplier' => 'PT Anugerah Medika Utama',
                'kontak' => 'Hendra',
                'telepon' => '031-8456789',
                'email' => 'cs@anugerahmedika.co.id',
                'alamat' => 'Jl. Raya Darmo No. 45, Surabaya',
                'npwp' => '02.345.678.9-002.000',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000035',
                'nama_supplier' => 'PT Rajawali Nusindo',
                'kontak' => 'Dewi',
                'telepon' => '022-7301234',
                'email' => 'cs@rajawalinusindo.co.id',
                'alamat' => 'Jl. Asia Afrika No. 88, Bandung',
                'npwp' => '03.456.789.0-003.000',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000036',
                'nama_supplier' => 'PT Bina Prima Sejahtera',
                'kontak' => 'Rizky',
                'telepon' => '0271-710456',
                'email' => 'sales@binaprima.co.id',
                'alamat' => 'Jl. Slamet Riyadi No. 120, Surakarta',
                'npwp' => '04.567.890.1-004.000',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
