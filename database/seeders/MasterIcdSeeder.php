<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class MasterIcdSeeder extends Seeder
{
    public function run(): void
    {
        $sqlPath = base_path('master_icd_x.sql');
        if (! File::exists($sqlPath)) {
            $this->command->error("File master_icd_x.sql tidak ditemukan di {$sqlPath}");

            return;
        }

        $this->command->info('Membaca dan memproses master_icd_x.sql...');

        $handle = fopen($sqlPath, 'r');
        if (! $handle) {
            $this->command->error('Gagal membuka file master_icd_x.sql');

            return;
        }

        $now = now()->toDateTimeString();
        $records = [];
        $insertedCount = 0;
        $chunkSize = app()->environment('testing') ? 20 : 500;

        while (($line = fgets($handle)) !== false) {
            $trimmed = trim($line);

            // Skip lines that don't start with tuple prefix ('
            if (! str_starts_with($trimmed, "('")) {
                continue;
            }

            // Remove leading (' and trailing '), or ');
            $clean = preg_replace("/^\(\s*'/", '', $trimmed);
            $clean = preg_replace("/'\s*\)\s*;?,\s*$/", '', $clean);

            // Split by ', ' (up to 3 parts)
            $parts = explode("', '", $clean, 3);

            if (count($parts) >= 3) {
                $code = trim($parts[0]);
                $nameEn = trim(stripslashes($parts[1]));
                $nameId = trim(stripslashes($parts[2]));

                if ($code === '') {
                    continue;
                }

                $description = ($nameId !== '') ? $nameId : $nameEn;

                $records[] = [
                    'code' => $code,
                    'description' => $description,
                    'name_en' => $nameEn,
                    'category' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                if (count($records) >= $chunkSize) {
                    DB::table('icd10_codes')->insertOrIgnore($records);
                    $insertedCount += count($records);
                    $records = [];

                    if (app()->environment('testing') && $insertedCount >= 50) {
                        break;
                    }
                }
            }
        }

        fclose($handle);

        if (! empty($records)) {
            DB::table('icd10_codes')->insertOrIgnore($records);
            $insertedCount += count($records);
        }

        $this->command->info("Berhasil mengimpor {$insertedCount} kode ICD-10 dari master_icd_x.sql!");
    }
}
