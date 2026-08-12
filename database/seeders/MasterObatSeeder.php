<?php

namespace Database\Seeders;

use App\Models\UnitFarmasi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class MasterObatSeeder extends Seeder
{
    public function run(): void
    {
        $csvPath = base_path('APP - Master Produk Komoditi Obat-2026-08-11.csv');

        if (! File::exists($csvPath)) {
            $this->command->error("File dataset obat tidak ditemukan di {$csvPath}");

            return;
        }

        $this->command->info('Membaca dan mengimpor dataset master obat dari CSV...');

        $handle = fopen($csvPath, 'r');
        if (! $handle) {
            $this->command->error('Gagal membuka file CSV.');

            return;
        }

        // Baca header CSV
        fgetcsv($handle, 0, ',', '"', '');

        $unitFarmasi = UnitFarmasi::first();
        $unitFarmasiId = $unitFarmasi?->id;
        $now = now()->toDateTimeString();

        $seenHashes = [];
        $nieCounts = [];
        $records = [];
        $totalInserted = 0;
        $chunkSize = app()->environment('testing') ? 20 : 500;

        // Nonaktifkan foreign key checks sementara untuk optimasi bulk insert jika diperlukan
        if (DB::getDriverName() === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }

        while (($row = fgetcsv($handle, 0, ',', '"', '')) !== false) {
            $namaProduk = trim($row[0] ?? '');
            $nie = trim($row[1] ?? '');
            $tglTerbit = trim($row[2] ?? '');
            $masaBerlaku = trim($row[3] ?? '');
            $bentukSediaan = trim($row[4] ?? '');
            $kemasan = trim($row[5] ?? '');
            $komposisi = trim($row[6] ?? '');
            $pendaftar = trim($row[7] ?? '');
            $diterbitkanOleh = trim($row[9] ?? '');

            if ($namaProduk === '' && $nie === '') {
                continue;
            }

            // Hindari duplikasi baris identik
            $rowHash = md5($nie.'|'.$namaProduk.'|'.$bentukSediaan.'|'.$kemasan.'|'.$tglTerbit.'|'.$masaBerlaku);
            if (isset($seenHashes[$rowHash])) {
                continue;
            }
            $seenHashes[$rowHash] = true;

            // Generate kode_obat unik berbasis NIE
            if (! isset($nieCounts[$nie])) {
                $nieCounts[$nie] = 1;
                $kodeObat = $nie ?: ('OBT-'.strtoupper(bin2hex(random_bytes(4))));
            } else {
                $nieCounts[$nie]++;
                $kodeObat = $nie.'-'.$nieCounts[$nie];
            }

            $komposisiClean = preg_replace('/<br\s*\/?>/i', ', ', $komposisi);

            $records[] = [
                'unit_farmasi_id' => $unitFarmasiId,
                'kode_obat' => $kodeObat,
                'nie' => $nie ?: null,
                'nama_obat' => $namaProduk ?: 'OBAT TANPA NAMA',
                'bentuk_sediaan' => $bentukSediaan ?: null,
                'kemasan' => $kemasan ?: null,
                'komposisi' => $komposisiClean ?: null,
                'pendaftar' => $pendaftar ?: null,
                'tanggal_terbit' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $tglTerbit) ? $tglTerbit : null,
                'masa_berlaku' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $masaBerlaku) ? $masaBerlaku : null,
                'diterbitkan_oleh' => $diterbitkanOleh ?: null,
                'stok' => 100,
                'harga' => 15000.00,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($records) >= $chunkSize) {
                DB::table('obats')->insertOrIgnore($records);
                $totalInserted += count($records);
                $records = [];

                if (app()->environment('testing') && $totalInserted >= 50) {
                    break;
                }
            }
        }

        fclose($handle);

        if (! empty($records)) {
            DB::table('obats')->insertOrIgnore($records);
            $totalInserted += count($records);
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $this->command->info("Berhasil mengimpor {$totalInserted} data obat ke database!");
    }
}
