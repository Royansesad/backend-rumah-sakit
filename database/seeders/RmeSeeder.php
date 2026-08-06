<?php

namespace Database\Seeders;

use App\Models\Dokter;
use App\Models\Icd10Code;
use App\Models\Obat;
use App\Models\Pasien;
use App\Models\Perawat;
use App\Models\Poli;
use App\Models\RekamMedis;
use App\Models\Resep;
use App\Models\ResepDetail;
use App\Models\UnitFarmasi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RmeSeeder extends Seeder
{
    public function run(): void
    {
        // --- ICD-10 Codes ---
        $icdData = [
            ['code' => 'A09', 'description' => 'Diare dan gastroenteritis', 'category' => 'Penyakit Infeksi'],
            ['code' => 'J06.9', 'description' => 'Infeksi saluran pernapasan atas akut', 'category' => 'Penyakit Sistem Pernapasan'],
            ['code' => 'I10', 'description' => 'Hipertensi esensial (primer)', 'category' => 'Penyakit Sistem Sirkulasi'],
            ['code' => 'E11', 'description' => 'Diabetes mellitus tipe 2', 'category' => 'Penyakit Endokrin'],
            ['code' => 'K29.7', 'description' => 'Gastritis, tidak spesifik', 'category' => 'Penyakit Sistem Pencernaan'],
            ['code' => 'M54.5', 'description' => 'Nyeri punggung bawah', 'category' => 'Penyakit Sistem Muskuloskeletal'],
            ['code' => 'R50.9', 'description' => 'Demam, tidak spesifik', 'category' => 'Gejala Umum'],
            ['code' => 'N39.0', 'description' => 'Infeksi saluran kemih', 'category' => 'Penyakit Sistem Genitourinari'],
            ['code' => 'J18.9', 'description' => 'Pneumonia, tidak spesifik', 'category' => 'Penyakit Sistem Pernapasan'],
            ['code' => 'B34.9', 'description' => 'Infeksi virus, tidak spesifik', 'category' => 'Penyakit Infeksi'],
        ];

        foreach ($icdData as $icd) {
            Icd10Code::firstOrCreate(['code' => $icd['code']], $icd);
        }

        // --- Obat ---
        $unitFarmasi = UnitFarmasi::first();
        $obatData = [
            ['kode_obat' => 'OBT-001', 'nama_obat' => 'Amoxicillin 500mg', 'bentuk_sediaan' => 'Kapsul', 'stok' => 500, 'harga' => 5000],
            ['kode_obat' => 'OBT-002', 'nama_obat' => 'Paracetamol 500mg', 'bentuk_sediaan' => 'Tablet', 'stok' => 1000, 'harga' => 2500],
            ['kode_obat' => 'OBT-003', 'nama_obat' => 'Amlodipine 5mg', 'bentuk_sediaan' => 'Tablet', 'stok' => 300, 'harga' => 6500],
            ['kode_obat' => 'OBT-004', 'nama_obat' => 'Metformin 500mg', 'bentuk_sediaan' => 'Tablet', 'stok' => 400, 'harga' => 4000],
            ['kode_obat' => 'OBT-005', 'nama_obat' => 'Omeprazole 20mg', 'bentuk_sediaan' => 'Kapsul', 'stok' => 350, 'harga' => 8000],
            ['kode_obat' => 'OBT-006', 'nama_obat' => 'Cetirizine 10mg', 'bentuk_sediaan' => 'Tablet', 'stok' => 600, 'harga' => 3000],
            ['kode_obat' => 'OBT-007', 'nama_obat' => 'Ibuprofen 400mg', 'bentuk_sediaan' => 'Tablet', 'stok' => 450, 'harga' => 3500],
            ['kode_obat' => 'OBT-008', 'nama_obat' => 'Ambroxol Sirup 30ml', 'bentuk_sediaan' => 'Sirup', 'stok' => 200, 'harga' => 15000],
        ];

        foreach ($obatData as $obat) {
            Obat::firstOrCreate(
                ['kode_obat' => $obat['kode_obat']],
                array_merge($obat, ['unit_farmasi_id' => $unitFarmasi?->id])
            );
        }

        // --- Sample RekamMedis + Resep (only if actors exist) ---
        $pasien = Pasien::first();
        $dokter = Dokter::first();
        $perawat = Perawat::first();
        $poli = Poli::first();

        if (! $pasien || ! $dokter) {
            $this->command->warn('Skipping RekamMedis & Resep seeding: Pasien or Dokter not found.');
            return;
        }

        // RekamMedis 1 - Final
        $rm1 = RekamMedis::firstOrCreate(
            ['pasien_id' => $pasien->id, 'icd10_code' => 'J06.9'],
            [
                'id' => (string) Str::uuid(),
                'pasien_id' => $pasien->id,
                'dokter_id' => $dokter->id,
                'perawat_id' => $perawat?->id,
                'poli_id' => $poli?->id,
                'sistol' => 120,
                'diastol' => 80,
                'suhu_tubuh' => 37.8,
                'denyut_nadi' => 88,
                'spo2' => 97,
                'kondisi_pasien' => 'stabil',
                'catatan_keperawatan' => 'Pasien datang dengan keluhan batuk pilek 3 hari. Vital signs stabil.',
                'keluhan_utama' => 'Batuk pilek dan demam ringan sejak 3 hari yang lalu',
                'diagnosis_deskripsi' => 'ISPA - Infeksi Saluran Pernapasan Atas Akut',
                'catatan_dokter' => 'Diberikan antibiotik dan antihistamin. Istirahat cukup.',
                'status' => 'final',
                'finalized_at' => now()->subDays(2),
            ]
        );

        // RekamMedis 2 - Draft (perlu_perhatian)
        $rm2 = RekamMedis::firstOrCreate(
            ['pasien_id' => $pasien->id, 'icd10_code' => 'I10'],
            [
                'id' => (string) Str::uuid(),
                'pasien_id' => $pasien->id,
                'dokter_id' => $dokter->id,
                'perawat_id' => $perawat?->id,
                'poli_id' => $poli?->id,
                'sistol' => 145,
                'diastol' => 92,
                'suhu_tubuh' => 36.5,
                'denyut_nadi' => 95,
                'spo2' => 96,
                'kondisi_pasien' => 'perlu_perhatian',
                'catatan_keperawatan' => 'Tekanan darah tinggi. Riwayat hipertensi. Perlu monitoring ketat.',
                'keluhan_utama' => 'Pusing dan nyeri tengkuk sejak pagi',
                'diagnosis_deskripsi' => 'Hipertensi esensial grade 1',
                'catatan_dokter' => 'Mulai terapi antihipertensi. Kontrol 1 minggu.',
                'status' => 'draft',
            ]
        );

        // Update kondisi terakhir pasien
        $pasien->update(['kondisi_terakhir' => 'perlu_perhatian']);

        // Resep 1 - menunggu ditebus (terkait rm1)
        $obat1 = Obat::where('kode_obat', 'OBT-001')->first();
        $obat2 = Obat::where('kode_obat', 'OBT-002')->first();
        $obat6 = Obat::where('kode_obat', 'OBT-006')->first();

        if ($obat1 && $obat2) {
            $resep1 = Resep::firstOrCreate(
                ['no_resep' => 'RSP-' . now()->format('Ymd') . '-001'],
                [
                    'id' => (string) Str::uuid(),
                    'no_resep' => 'RSP-' . now()->format('Ymd') . '-001',
                    'pasien_id' => $pasien->id,
                    'dokter_id' => $dokter->id,
                    'rekam_medis_id' => $rm1->id,
                    'status' => 'menunggu_ditebus',
                ]
            );

            ResepDetail::firstOrCreate(
                ['resep_id' => $resep1->id, 'obat_id' => $obat1->id],
                ['aturan_pakai' => '3x1 sesudah makan', 'jumlah_dosis' => 21, 'catatan' => 'Habiskan antibiotik']
            );
            ResepDetail::firstOrCreate(
                ['resep_id' => $resep1->id, 'obat_id' => $obat2->id],
                ['aturan_pakai' => '3x1 jika demam', 'jumlah_dosis' => 10, 'catatan' => null]
            );
            if ($obat6) {
                ResepDetail::firstOrCreate(
                    ['resep_id' => $resep1->id, 'obat_id' => $obat6->id],
                    ['aturan_pakai' => '1x1 malam hari', 'jumlah_dosis' => 7, 'catatan' => 'Untuk meredakan alergi']
                );
            }
        }

        // Resep 2 - sudah ditebus (terkait rm2)
        $obat3 = Obat::where('kode_obat', 'OBT-003')->first();

        if ($obat3) {
            $resep2 = Resep::firstOrCreate(
                ['no_resep' => 'RSP-' . now()->format('Ymd') . '-002'],
                [
                    'id' => (string) Str::uuid(),
                    'no_resep' => 'RSP-' . now()->format('Ymd') . '-002',
                    'pasien_id' => $pasien->id,
                    'dokter_id' => $dokter->id,
                    'rekam_medis_id' => $rm2->id,
                    'status' => 'sudah_ditebus',
                ]
            );

            ResepDetail::firstOrCreate(
                ['resep_id' => $resep2->id, 'obat_id' => $obat3->id],
                ['aturan_pakai' => '1x1 pagi hari', 'jumlah_dosis' => 30, 'catatan' => 'Obat rutin hipertensi']
            );
        }

        $this->command->info('RME Seeder completed successfully!');
    }
}
