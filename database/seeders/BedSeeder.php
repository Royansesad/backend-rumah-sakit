<?php

namespace Database\Seeders;

use App\Models\Bangsal;
use App\Models\Bed;
use App\Models\Ruangan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BedSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure default bangsal exist
        $bangsalMawar = Bangsal::firstOrCreate(
            ['kode_bangsal' => 'BANGSAL-MAWAR'],
            ['nama_bangsal' => 'Bangsal Mawar (Rawat Inap Utama)', 'kapasitas' => 20, 'is_aktif' => true]
        );

        $bangsalMelati = Bangsal::firstOrCreate(
            ['kode_bangsal' => 'BANGSAL-MELATI'],
            ['nama_bangsal' => 'Bangsal Melati (Perawatan Intensif)', 'kapasitas' => 10, 'is_aktif' => true]
        );

        $bangsalAnggrek = Bangsal::firstOrCreate(
            ['kode_bangsal' => 'BANGSAL-ANGGREK'],
            ['nama_bangsal' => 'Bangsal Anggrek (Rawat Inap VIP)', 'kapasitas' => 10, 'is_aktif' => true]
        );

        $ruanganICU = Ruangan::where('nama_ruangan', 'ICU')->first();
        $ruanganInapA = Ruangan::where('nama_ruangan', 'Ruang Inap A')->first();
        $ruanganInapB = Ruangan::where('nama_ruangan', 'Ruang Inap B')->first();

        // Sample beds data
        $bedsData = [
            // VIP Beds (Bangsal Anggrek / Ruang Inap A)
            ['nomor_bed' => 'BED-VIP-01', 'ruangan_id' => $ruanganInapA?->id, 'bangsal_id' => $bangsalAnggrek->id, 'kelas' => 'VIP', 'tarif_per_hari' => 1200000, 'status' => 'tersedia', 'catatan' => 'Fasilitas TV, AC, Sofa Bed'],
            ['nomor_bed' => 'BED-VIP-02', 'ruangan_id' => $ruanganInapA?->id, 'bangsal_id' => $bangsalAnggrek->id, 'kelas' => 'VIP', 'tarif_per_hari' => 1200000, 'status' => 'tersedia', 'catatan' => 'Fasilitas TV, AC, Kulkas'],
            ['nomor_bed' => 'BED-VIP-03', 'ruangan_id' => $ruanganInapA?->id, 'bangsal_id' => $bangsalAnggrek->id, 'kelas' => 'VIP', 'tarif_per_hari' => 1200000, 'status' => 'pemeliharaan', 'catatan' => 'Perbaikan AC'],

            // Kelas 1 Beds (Bangsal Mawar / Ruang Inap B)
            ['nomor_bed' => 'BED-K1-01', 'ruangan_id' => $ruanganInapB?->id, 'bangsal_id' => $bangsalMawar->id, 'kelas' => 'Kelas 1', 'tarif_per_hari' => 600000, 'status' => 'tersedia', 'catatan' => '2 Bed per kamar'],
            ['nomor_bed' => 'BED-K1-02', 'ruangan_id' => $ruanganInapB?->id, 'bangsal_id' => $bangsalMawar->id, 'kelas' => 'Kelas 1', 'tarif_per_hari' => 600000, 'status' => 'tersedia', 'catatan' => '2 Bed per kamar'],
            ['nomor_bed' => 'BED-K1-03', 'ruangan_id' => $ruanganInapB?->id, 'bangsal_id' => $bangsalMawar->id, 'kelas' => 'Kelas 1', 'tarif_per_hari' => 600000, 'status' => 'dibersihkan', 'catatan' => 'Sterilisasi kamar'],

            // Kelas 2 & 3 Beds
            ['nomor_bed' => 'BED-K2-01', 'ruangan_id' => $ruanganInapB?->id, 'bangsal_id' => $bangsalMawar->id, 'kelas' => 'Kelas 2', 'tarif_per_hari' => 400000, 'status' => 'tersedia', 'catatan' => '4 Bed per kamar'],
            ['nomor_bed' => 'BED-K3-01', 'ruangan_id' => $ruanganInapB?->id, 'bangsal_id' => $bangsalMawar->id, 'kelas' => 'Kelas 3', 'tarif_per_hari' => 200000, 'status' => 'tersedia', 'catatan' => '6 Bed per kamar (Jaminan BPJS)'],
            ['nomor_bed' => 'BED-K3-02', 'ruangan_id' => $ruanganInapB?->id, 'bangsal_id' => $bangsalMawar->id, 'kelas' => 'Kelas 3', 'tarif_per_hari' => 200000, 'status' => 'tersedia', 'catatan' => '6 Bed per kamar (Jaminan BPJS)'],

            // ICU Beds (Bangsal Melati / ICU)
            ['nomor_bed' => 'BED-ICU-01', 'ruangan_id' => $ruanganICU?->id, 'bangsal_id' => $bangsalMelati->id, 'kelas' => 'ICU', 'tarif_per_hari' => 1800000, 'status' => 'tersedia', 'catatan' => 'Ventilator & Monitor Bedside'],
            ['nomor_bed' => 'BED-ICU-02', 'ruangan_id' => $ruanganICU?->id, 'bangsal_id' => $bangsalMelati->id, 'kelas' => 'ICU', 'tarif_per_hari' => 1800000, 'status' => 'tersedia', 'catatan' => 'Monitor Central & Syringe Pump'],
        ];

        foreach ($bedsData as $data) {
            Bed::firstOrCreate(
                ['nomor_bed' => $data['nomor_bed']],
                $data
            );
        }
    }
}
