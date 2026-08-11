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
            $prefixPoli = $this->getPrefixPoli($poli);

            // Hitung nomor antrian berikutnya secara presisi (max + 1 per poli hari ini)
            $maxAngka = Antrian::where('poli_id', $jadwal->poli_id)
                ->whereDate('created_at', $hariIni)
                ->max('angka_antrian') ?? 0;

            $angkaAntrian = ((int) $maxAngka) + 1;
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
     * Generate Kode Prefix Unik per Poli (misal: Poli Umum -> UMU, Poli Gigi -> GIG, Poli Anak -> ANK)
     */
    public function getPrefixPoli(Poli $poli): string
    {
        $nama = strtolower($poli->nama_poli);

        if (str_contains($nama, 'umum')) return 'UMU';
        if (str_contains($nama, 'gigi')) return 'GIG';
        if (str_contains($nama, 'anak')) return 'ANK';
        if (str_contains($nama, 'kandungan') || str_contains($nama, 'obgyn')) return 'KND';
        if (str_contains($nama, 'mata')) return 'MAT';
        if (str_contains($nama, 'dalam')) return 'PDL';
        if (str_contains($nama, 'bedah')) return 'BDH';

        $words = explode(' ', trim($poli->nama_poli));
        $lastWord = end($words);
        return strtoupper(substr($lastWord, 0, 3));
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

    /**
     * Panggil pasien berikutnya (antrian menunggu/skrining dengan angka terkecil)
     */
    public function panggilBerikutnya(string $jadwalDokterId, ?string $loketId = null): ?Antrian
    {
        $antrian = Antrian::where('jadwal_dokter_id', $jadwalDokterId)
            ->whereDate('created_at', now()->toDateString())
            ->whereIn('status', ['menunggu', 'skrining'])
            ->orderBy('angka_antrian')
            ->first();

        if (! $antrian) {
            return null;
        }

        return $this->updateStatusAntrian($antrian, 'dipanggil', $loketId);
    }

    /**
     * Hitung statistik antrian hari ini
     *
     * @return array<string, mixed>
     */
    public function hitungStatistikHariIni(?string $poliId = null): array
    {
        $query = Antrian::whereDate('created_at', now()->toDateString());

        if ($poliId) {
            $query->where('poli_id', $poliId);
        }

        $statusCounts = (clone $query)->selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN status = 'menunggu' THEN 1 ELSE 0 END) as menunggu,
            SUM(CASE WHEN status = 'skrining' THEN 1 ELSE 0 END) as skrining,
            SUM(CASE WHEN status = 'dipanggil' THEN 1 ELSE 0 END) as dipanggil,
            SUM(CASE WHEN status = 'sedang_dilayani' THEN 1 ELSE 0 END) as sedang_dilayani,
            SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as selesai,
            SUM(CASE WHEN status = 'dilewati' THEN 1 ELSE 0 END) as dilewati,
            SUM(CASE WHEN status = 'dibatalkan' THEN 1 ELSE 0 END) as dibatalkan
        ")->first();

        // Rata-rata waktu tunggu (dari created_at hingga waktu_dipanggil) dalam menit
        $avgWaitMinutes = (clone $query)
            ->whereNotNull('waktu_dipanggil')
            ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, created_at, waktu_dipanggil)) as avg_wait')
            ->value('avg_wait');

        return [
            'total' => (int) ($statusCounts->total ?? 0),
            'menunggu' => (int) ($statusCounts->menunggu ?? 0),
            'skrining' => (int) ($statusCounts->skrining ?? 0),
            'dipanggil' => (int) ($statusCounts->dipanggil ?? 0),
            'sedang_dilayani' => (int) ($statusCounts->sedang_dilayani ?? 0),
            'selesai' => (int) ($statusCounts->selesai ?? 0),
            'dilewati' => (int) ($statusCounts->dilewati ?? 0),
            'dibatalkan' => (int) ($statusCounts->dibatalkan ?? 0),
            'rata_rata_tunggu_menit' => $avgWaitMinutes !== null ? round((float) $avgWaitMinutes, 1) : null,
        ];
    }
}
