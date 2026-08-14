<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PasienSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $password = Hash::make('password123');

        DB::table('pasien')->insertOrIgnore([
            [
                'id' => '00000000-0000-0000-0000-000000000021',
                'nomor_rekam_medis' => 'RM-2023-8942',
                'nama_lengkap' => 'Agus Setiawan',
                'email' => 'agus.pasien@simrs.id',
                'password' => $password,
                'tanggal_lahir' => '1988-05-15',
                'jenis_kelamin' => 'Laki-laki',
                'golongan_darah' => 'O',
                'alamat' => 'Jl. Merdeka No. 10, Jakarta Selatan',
                'no_hp' => '081234567890',
                'nik' => '3174012345678901',
                'alergi' => 'Alergi Penisilin',
                'riwayat_penyakit' => 'Hipertensi Esensial, Gastritis Akut',
                'kondisi_terakhir' => 'Hipertensi (Terkontrol)',
                'status_aktif' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000022',
                'nomor_rekam_medis' => 'RM-2024-0002',
                'nama_lengkap' => 'Maya Anggraeni',
                'email' => 'maya.pasien@simrs.id',
                'password' => $password,
                'tanggal_lahir' => '1992-08-20',
                'jenis_kelamin' => 'Perempuan',
                'golongan_darah' => 'O',
                'alamat' => 'Jl. Braga No. 22, Bandung',
                'no_hp' => '081298765432',
                'nik' => '3273012345678902',
                'alergi' => null,
                'riwayat_penyakit' => null,
                'kondisi_terakhir' => null,
                'status_aktif' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000023',
                'nomor_rekam_medis' => 'RM-2024-0003',
                'nama_lengkap' => 'Rizki Ramadhan',
                'email' => 'rizki.pasien@simrs.id',
                'password' => $password,
                'tanggal_lahir' => '2005-11-10',
                'jenis_kelamin' => 'Laki-laki',
                'golongan_darah' => 'B',
                'alamat' => 'Jl. Pemuda No. 5, Surabaya',
                'no_hp' => '081311223344',
                'nik' => '3578012345678903',
                'alergi' => null,
                'riwayat_penyakit' => null,
                'kondisi_terakhir' => null,
                'status_aktif' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
