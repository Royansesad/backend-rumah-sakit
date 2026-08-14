<?php

namespace Database\Seeders;

use App\Models\Dokter;
use App\Models\Icd10Code;
use App\Models\Obat;
use App\Models\Pasien;
use App\Models\PemeriksaanRadiologi;
use App\Models\Perawat;
use App\Models\Poli;
use App\Models\RekamMedis;
use App\Models\Resep;
use App\Models\ResepDetail;
use App\Models\UnitFarmasi;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RmeSeeder extends Seeder
{
    public function run(): void
    {
        // --- ICD-10 Codes ---
        $icdData = [
            ['code' => 'A09', 'description' => 'Diare dan gastroenteritis', 'category' => 'Penyakit Infeksi'],
            ['code' => 'A01.0', 'description' => 'Demam Tifoid (Typhoid Fever)', 'category' => 'Penyakit Infeksi'],
            ['code' => 'J06.9', 'description' => 'Infeksi saluran pernapasan atas akut', 'category' => 'Penyakit Sistem Pernapasan'],
            ['code' => 'I10', 'description' => 'Hipertensi esensial (primer)', 'category' => 'Penyakit Sistem Sirkulasi'],
            ['code' => 'E11', 'description' => 'Diabetes mellitus tipe 2', 'category' => 'Penyakit Endokrin'],
            ['code' => 'K29.1', 'description' => 'Gastritis akut lain', 'category' => 'Penyakit Sistem Pencernaan'],
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

        // --- Master Obat ---
        $unitFarmasi = UnitFarmasi::first();
        $obatData = [
            ['kode_obat' => 'OBT-001', 'nama_obat' => 'Amoxicillin 500mg', 'bentuk_sediaan' => 'Kapsul', 'stok' => 500, 'harga' => 5000],
            ['kode_obat' => 'OBT-002', 'nama_obat' => 'Paracetamol 500mg', 'bentuk_sediaan' => 'Tablet', 'stok' => 1000, 'harga' => 2500],
            ['kode_obat' => 'OBT-003', 'nama_obat' => 'Amlodipine 5mg', 'bentuk_sediaan' => 'Tablet', 'stok' => 300, 'harga' => 6500],
            ['kode_obat' => 'OBT-004', 'nama_obat' => 'Vitamin D3 1000 IU', 'bentuk_sediaan' => 'Tablet', 'stok' => 450, 'harga' => 4500],
            ['kode_obat' => 'OBT-005', 'nama_obat' => 'Omeprazole 20mg', 'bentuk_sediaan' => 'Kapsul', 'stok' => 350, 'harga' => 8000],
            ['kode_obat' => 'OBT-006', 'nama_obat' => 'Cetirizine 10mg', 'bentuk_sediaan' => 'Tablet', 'stok' => 600, 'harga' => 3000],
            ['kode_obat' => 'OBT-007', 'nama_obat' => 'Ibuprofen 400mg', 'bentuk_sediaan' => 'Tablet', 'stok' => 450, 'harga' => 3500],
            ['kode_obat' => 'OBT-008', 'nama_obat' => 'Ambroxol Sirup 30ml', 'bentuk_sediaan' => 'Sirup', 'stok' => 200, 'harga' => 15000],
            ['kode_obat' => 'OBT-009', 'nama_obat' => 'Ciprofloxacin 500mg', 'bentuk_sediaan' => 'Tablet', 'stok' => 250, 'harga' => 9000],
        ];

        foreach ($obatData as $obat) {
            Obat::firstOrCreate(
                ['kode_obat' => $obat['kode_obat']],
                array_merge($obat, ['unit_farmasi_id' => $unitFarmasi?->id])
            );
        }

        // --- Sample RekamMedis & Imaging ---
        $pasiens = Pasien::all();
        $dokters = Dokter::all();
        $perawat = Perawat::first();
        $polis = Poli::all();

        if ($pasiens->isEmpty() || $dokters->isEmpty()) {
            $this->command->warn('Skipping RekamMedis & Resep seeding: Pasien or Dokter not found.');
            return;
        }

        $dokterPd = Dokter::where('spesialisasi', 'like', '%Penyakit Dalam%')->first() ?? $dokters->first();
        $dokterIgd = Dokter::where('spesialisasi', 'like', '%Umum%')->first() ?? $dokters->get(1) ?? $dokterPd;

        $poliPd = Poli::where('nama_poli', 'like', '%Penyakit Dalam%')->first() ?? $polis->first();
        $poliIgd = Poli::where('nama_poli', 'like', '%IGD%')->orWhere('nama_poli', 'like', '%Umum%')->first() ?? $polis->first();
        $poliRawatInap = Poli::where('nama_poli', 'like', '%Rawat Inap%')->first() ?? $polis->first();

        $obatAmlodipine = Obat::where('nama_obat', 'like', '%Amlodipine%')->first() ?? Obat::first();
        $obatVitD3 = Obat::where('nama_obat', 'like', '%Vitamin D3%')->first();
        $obatOmeprazole = Obat::where('nama_obat', 'like', '%Omeprazole%')->first();
        $obatCiprofloxacin = Obat::where('nama_obat', 'like', '%Ciprofloxacin%')->first();
        $obatParacetamol = Obat::where('nama_obat', 'like', '%Paracetamol%')->first();

        foreach ($pasiens as $pasien) {
            $cleanRm = preg_replace('/[^A-Za-z0-9]/', '', $pasien->nomor_rekam_medis ?: substr($pasien->id, 0, 8));

            // Update snapshot profil jika belum lengkap
            $pasien->update([
                'alergi' => $pasien->alergi ?: 'Alergi Penisilin',
                'kondisi_terakhir' => $pasien->kondisi_terakhir ?: 'Hipertensi (Terkontrol)',
                'golongan_darah' => $pasien->golongan_darah ?: 'O',
                'tanggal_lahir' => $pasien->tanggal_lahir ?: Carbon::parse('1988-05-15'),
            ]);

            // 1. Diagnosa 2026 (Aktif): Hipertensi Esensial - Dr. Anwar / Dokter PD
            $rm2026 = RekamMedis::updateOrCreate(
                ['pasien_id' => $pasien->id, 'icd10_code' => 'I10'],
                [
                    'pasien_id' => $pasien->id,
                    'dokter_id' => $dokterPd->id,
                    'perawat_id' => $perawat?->id,
                    'poli_id' => $poliPd?->id,
                    'sistol' => 140,
                    'diastol' => 90,
                    'suhu_tubuh' => 36.5,
                    'denyut_nadi' => 82,
                    'spo2' => 98,
                    'kondisi_pasien' => 'stabil',
                    'catatan_keperawatan' => 'Tekanan darah evaluasi bulanan. Pasien rutin minum obat antihipertensi.',
                    'keluhan_utama' => 'Pemeriksaan rutin tekanan darah dan evaluasi obat hipertensi',
                    'diagnosis_deskripsi' => 'Hipertensi Esensial',
                    'status_diagnosa' => 'aktif',
                    'catatan_dokter' => 'Kondisi tekanan darah terkontrol stabil dengan terapi Amlodipine 5mg. Lanjutkan diet rendah natrium dan olahraga teratur.',
                    'status' => 'final',
                    'finalized_at' => Carbon::create(2026, 2, 10, 9, 30, 0),
                    'created_at' => Carbon::create(2026, 2, 10, 9, 0, 0),
                ]
            );

            // Resep Aktif untuk RM 2026 (Amlodipine & Vitamin D3)
            $noResep1 = "RSP-{$cleanRm}-20260210";
            $resepAktif = Resep::updateOrCreate(
                ['no_resep' => $noResep1],
                [
                    'no_resep' => $noResep1,
                    'pasien_id' => $pasien->id,
                    'dokter_id' => $dokterPd->id,
                    'rekam_medis_id' => $rm2026->id,
                    'status' => 'sudah_ditebus',
                    'created_at' => Carbon::create(2026, 2, 10, 9, 30, 0),
                ]
            );

            if ($obatAmlodipine) {
                ResepDetail::updateOrCreate(
                    ['resep_id' => $resepAktif->id, 'obat_id' => $obatAmlodipine->id],
                    [
                        'aturan_pakai' => '1x sehari, sesudah makan pagi',
                        'jumlah_dosis' => 30,
                        'catatan' => 'Pagi hari setelah sarapan',
                        'kategori_obat' => 'Rutin',
                        'sisa_tablet' => 14,
                    ]
                );
            }

            if ($obatVitD3) {
                ResepDetail::updateOrCreate(
                    ['resep_id' => $resepAktif->id, 'obat_id' => $obatVitD3->id],
                    [
                        'aturan_pakai' => '1x sehari, sesudah makan',
                        'jumlah_dosis' => 30,
                        'catatan' => 'Suplemen daya tahan tubuh',
                        'kategori_obat' => 'Suplemen',
                        'sisa_tablet' => 20,
                    ]
                );
            }

            // 2. Diagnosa 2025 (Sembuh): Gastritis Akut - Dr. Budi - IGD
            $rm2025 = RekamMedis::updateOrCreate(
                ['pasien_id' => $pasien->id, 'icd10_code' => 'K29.1'],
                [
                    'pasien_id' => $pasien->id,
                    'dokter_id' => $dokterIgd->id,
                    'perawat_id' => $perawat?->id,
                    'poli_id' => $poliIgd?->id,
                    'sistol' => 120,
                    'diastol' => 80,
                    'suhu_tubuh' => 36.8,
                    'denyut_nadi' => 86,
                    'spo2' => 99,
                    'kondisi_pasien' => 'stabil',
                    'catatan_keperawatan' => 'Pasien mengeluh nyeri ulu hati dan mual setelah makan pedas/asam.',
                    'keluhan_utama' => 'Nyeri ulu hati hebat perih melilit disertai rasa mual',
                    'diagnosis_deskripsi' => 'Gastritis Akut',
                    'status_diagnosa' => 'sembuh',
                    'catatan_dokter' => 'Diberikan terapi antasida dan PPI (Omeprazole). Hindari pemicu asam lambung, pola makan teratur.',
                    'status' => 'final',
                    'finalized_at' => Carbon::create(2025, 8, 14, 14, 15, 0),
                    'created_at' => Carbon::create(2025, 8, 14, 13, 30, 0),
                ]
            );

            // Resep Riwayat 2025 (Omeprazole)
            if ($obatOmeprazole) {
                $noResep2 = "RSP-{$cleanRm}-20250814";
                $resep2025 = Resep::updateOrCreate(
                    ['no_resep' => $noResep2],
                    [
                        'no_resep' => $noResep2,
                        'pasien_id' => $pasien->id,
                        'dokter_id' => $dokterIgd->id,
                        'rekam_medis_id' => $rm2025->id,
                        'status' => 'sudah_ditebus',
                        'created_at' => Carbon::create(2025, 8, 14, 14, 15, 0),
                    ]
                );

                ResepDetail::updateOrCreate(
                    ['resep_id' => $resep2025->id, 'obat_id' => $obatOmeprazole->id],
                    [
                        'aturan_pakai' => '2x sehari, sebelum makan (pagi dan malam)',
                        'jumlah_dosis' => 14,
                        'catatan' => 'Diminum 30 menit sebelum makan',
                        'kategori_obat' => 'Rutin',
                        'sisa_tablet' => 0,
                    ]
                );
            }

            // 3. Diagnosa 2022 (Sembuh): Typus Fever - Rawat Inap - Lt 3
            $rm2022 = RekamMedis::updateOrCreate(
                ['pasien_id' => $pasien->id, 'icd10_code' => 'A01.0'],
                [
                    'pasien_id' => $pasien->id,
                    'dokter_id' => $dokterPd->id,
                    'perawat_id' => $perawat?->id,
                    'poli_id' => $poliRawatInap?->id,
                    'sistol' => 110,
                    'diastol' => 70,
                    'suhu_tubuh' => 38.9,
                    'denyut_nadi' => 92,
                    'spo2' => 97,
                    'kondisi_pasien' => 'stabil',
                    'catatan_keperawatan' => 'Demam bertingkat selama 5 hari, lidah kotor berselaput putih. Rawat inap Gedung Teratai Lt 3.',
                    'keluhan_utama' => 'Demam tinggi malam hari, mual lemas, nafsu makan turun drastis',
                    'diagnosis_deskripsi' => 'Typus Fever',
                    'status_diagnosa' => 'sembuh',
                    'catatan_dokter' => 'Hasil Widal test positif S. Typhi O 1/320. Terapi antibiotik intravena dilanjutkan peroral hingga tuntas. Pulang dalam keadaan sembuh.',
                    'status' => 'final',
                    'finalized_at' => Carbon::create(2022, 11, 20, 10, 0, 0),
                    'created_at' => Carbon::create(2022, 11, 15, 8, 30, 0),
                ]
            );

            // Resep 2022 (Ciprofloxacin & Paracetamol)
            if ($obatCiprofloxacin && $obatParacetamol) {
                $noResep3 = "RSP-{$cleanRm}-20221120";
                $resep2022 = Resep::updateOrCreate(
                    ['no_resep' => $noResep3],
                    [
                        'no_resep' => $noResep3,
                        'pasien_id' => $pasien->id,
                        'dokter_id' => $dokterPd->id,
                        'rekam_medis_id' => $rm2022->id,
                        'status' => 'sudah_ditebus',
                        'created_at' => Carbon::create(2022, 11, 20, 10, 0, 0),
                    ]
                );

                ResepDetail::updateOrCreate(
                    ['resep_id' => $resep2022->id, 'obat_id' => $obatCiprofloxacin->id],
                    [
                        'aturan_pakai' => '2x sehari 1 tablet sesudah makan (habiskan)',
                        'jumlah_dosis' => 10,
                        'catatan' => 'Antibiotik wajib diminum sampai habis',
                        'kategori_obat' => 'Antibiotik',
                        'sisa_tablet' => 0,
                    ]
                );

                ResepDetail::updateOrCreate(
                    ['resep_id' => $resep2022->id, 'obat_id' => $obatParacetamol->id],
                    [
                        'aturan_pakai' => '3x sehari 1 tablet bila demam',
                        'jumlah_dosis' => 10,
                        'catatan' => 'Pereda demam',
                        'kategori_obat' => 'Simtomatik',
                        'sisa_tablet' => 0,
                    ]
                );
            }

            // 4. Pemeriksaan Radiologi & Imaging: CT Scan Kepala (Non-Contrast)
            PemeriksaanRadiologi::updateOrCreate(
                [
                    'pasien_id' => $pasien->id,
                    'judul_pemeriksaan' => 'CT Scan Kepala (Non-Contrast)',
                ],
                [
                    'pasien_id' => $pasien->id,
                    'dokter_id' => $dokterPd->id,
                    'rekam_medis_id' => $rm2026->id,
                    'judul_pemeriksaan' => 'CT Scan Kepala (Non-Contrast)',
                    'kategori' => 'CT Scan',
                    'tanggal_pemeriksaan' => Carbon::create(2023, 8, 2),
                    'dokter_radiologi' => 'Dr. Siska Radiologi',
                    'indikasi_klinis' => 'Evaluasi sefalgia kronis intermiten dan riwayat hipertensi essensial.',
                    'temuan' => 'Potongan aksial tebal 5mm tanpa kontras IV. Struktur parenkim serebri dan serebeli tampak simetris dalam batas normal. Sistem ventrikel lateralis, III, dan IV tidak melebar. Sulci dan gyri intak. Tidak tampak midline shift. Tidak tampak lesi hiperdens (perdarahan) maupun hipodens fokal.',
                    'kesimpulan' => 'CT Scan Kepala Non-Kontras dalam batas normal. Tidak tampak massa intrakranial, perdarahan akut, maupun tanda infark serebri akut.',
                    'status' => 'selesai',
                ]
            );

            // Tambahkan draft rekam medis untuk pasien agar assertion unit test tercover
            RekamMedis::updateOrCreate(
                ['pasien_id' => $pasien->id, 'status' => 'draft'],
                [
                    'pasien_id' => $pasien->id,
                    'dokter_id' => $dokterPd->id,
                    'perawat_id' => $perawat?->id,
                    'poli_id' => $poliPd?->id,
                    'sistol' => 135,
                    'diastol' => 85,
                    'suhu_tubuh' => 36.6,
                    'denyut_nadi' => 80,
                    'spo2' => 99,
                    'kondisi_pasien' => 'stabil',
                    'keluhan_utama' => 'Kontrol berkala tekanan darah rutin (Draft Antrian)',
                    'status_diagnosa' => 'aktif',
                    'status' => 'draft',
                    'finalized_at' => null,
                ]
            );
        }

        $this->command->info('RME Seeder completed successfully with all rich clinical records!');
    }
}
