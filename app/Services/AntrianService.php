<?php

namespace App\Services;

use App\Models\Antrian;
use App\Models\JadwalDokter;
use App\Models\Poli;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AntrianService
{
    /**
     * Ambil nomor antrian baru (Atomic Increment per Poli per Hari)
     */
    public function ambilNomorAntrian(array $data): Antrian
    {
        $jadwal = JadwalDokter::with(['poli', 'dokter'])
            ->withCount(['antrian' => fn($q) => $q->where('status', '!=', 'dibatalkan')])
            ->findOrFail($data['jadwal_dokter_id']);

        $hariIni = now()->toDateString();

        // 1. Validasi Tanggal Praktik
        if ($jadwal->tanggal->toDateString() !== $hariIni) {
            throw new Exception("Pendaftaran antrian hanya dibuka untuk jadwal praktik hari ini ({$jadwal->tanggal->format('d-m-Y')}).");
        }

        // 2. Validasi Status Dokter
        if ($jadwal->status !== 'tersedia') {
            throw new Exception("Dokter bersangkutan sedang tidak tersedia untuk pelayanan hari ini.");
        }

        // 3. Validasi Kuota
        if ($jadwal->antrian_count >= $jadwal->kuota_maksimal) {
            throw new Exception("Kuota antrian untuk dokter {$jadwal->dokter->nama_lengkap} hari ini telah habis (Maksimal {$jadwal->kuota_maksimal} pasien).");
        }

        return DB::transaction(function () use ($data, $jadwal, $hariIni) {
            $poli = $jadwal->poli;
            $prefixPoli = strtoupper($poli->kode_poli ?? substr($poli->nama_poli ?? 'POLI', 0, 3));
            $cacheKey = "sekuens_antrian:{$poli->id}:{$hariIni}";

            // Atomic Increment nomor antrian
            $angkaAntrian = Cache::increment($cacheKey);
            if ($angkaAntrian === 1) {
                Cache::put($cacheKey, 1, now()->endOfDay());
            }

            $nomorFormatted = sprintf("%s-%03d", $prefixPoli, $angkaAntrian);

            return Antrian::create([
                'nomor_antrian' => $nomorFormatted,
                'angka_antrian' => $angkaAntrian,
                'poli_id' => $jadwal->poli_id,
                'dokter_id' => $jadwal->dokter_id,
                'jadwal_dokter_id' => $jadwal->id,
                'pasien_id' => $data['pasien_id'],
                'tipe_pasien' => $data['tipe_pasien'] ?? 'umum',
                'status' => 'menunggu',
            ]);
        });
    }

    /**
     * Transisi Status Antrian Pasien
     */
    public function updateStatusAntrian(Antrian $antrian, string $statusBaru, ?string $loketId = null): Antrian
    {
        $payload = ['status' => $statusBaru];

        switch ($statusBaru) {
            case 'skrining':
                $payload['waktu_skrining'] = now();
                break;
            case 'dipanggil':
                $payload['waktu_dipanggil'] = now();
                if ($loketId) {
                    $payload['loket_id'] = $loketId;
                }
                break;
            case 'sedang_dilayani':
                $payload['waktu_dilayani'] = now();
                break;
            case 'selesai':
                $payload['waktu_selesai'] = now();
                break;
        }

        $antrian->update($payload);
        return $antrian->fresh(['poli', 'dokter', 'pasien', 'loket']);
    }
}
