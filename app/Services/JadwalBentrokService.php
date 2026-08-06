<?php

namespace App\Services;

use App\Models\JadwalDokter;

class JadwalBentrokService
{
    /**
     * Memeriksa bentrok jadwal dokter (ruangan fisik & double-booking dokter).
     *
     * @param array $data ['dokter_id', 'ruangan_id', 'tanggal', 'jam_mulai', 'jam_selesai']
     * @param string|null $abaikanJadwalId
     * @return array ['ada_bentrok' => bool, 'catatan' => string|null]
     */
    public function periksaBentrok(array $data, ?string $abaikanJadwalId = null): array
    {
        $catatanBentrok = [];

        $jamMulai = substr($data['jam_mulai'], 0, 5);
        $jamSelesai = substr($data['jam_selesai'], 0, 5);
        $tanggal = is_string($data['tanggal']) ? substr($data['tanggal'], 0, 10) : $data['tanggal']->format('Y-m-d');

        // 1. Cek Bentrok Fisik Ruangan (Ruangan sama, Tanggal sama, Jam beririsan: start < B_end AND end > B_start)
        if (!empty($data['ruangan_id'])) {
            $bentrokRuangan = JadwalDokter::with(['dokter', 'ruangan'])
                ->where('ruangan_id', $data['ruangan_id'])
                ->where('tanggal', '>=', $tanggal)
                ->where('tanggal', '<=', $tanggal . ' 23:59:59')
                ->where('jam_mulai', '<', $jamSelesai)
                ->where('jam_selesai', '>', $jamMulai)
                ->when($abaikanJadwalId, fn($q) => $q->where('id', '!=', $abaikanJadwalId))
                ->first();

            if ($bentrokRuangan) {
                $namaDokter = $bentrokRuangan->dokter->nama_lengkap ?? 'Dokter Lain';
                $namaRuangan = $bentrokRuangan->ruangan->nama_ruangan ?? 'Ruangan';
                $catatanBentrok[] = "Ruangan {$namaRuangan} sedang dipakai oleh {$namaDokter} pada jam {$bentrokRuangan->jam_mulai} - {$bentrokRuangan->jam_selesai}.";
            }
        }

        // 2. Cek Double Booking Dokter (Dokter sama, Tanggal sama, Jam beririsan di Poli/Ruang lain)
        $bentrokDokter = JadwalDokter::with('poli')
            ->where('dokter_id', $data['dokter_id'])
            ->where('tanggal', '>=', $tanggal)
            ->where('tanggal', '<=', $tanggal . ' 23:59:59')
            ->where('jam_mulai', '<', $jamSelesai)
            ->where('jam_selesai', '>', $jamMulai)
            ->when($abaikanJadwalId, fn($q) => $q->where('id', '!=', $abaikanJadwalId))
            ->first();

        if ($bentrokDokter) {
            $namaPoli = $bentrokDokter->poli->nama_poli ?? 'Poli Lain';
            $catatanBentrok[] = "Dokter bersangkutan sudah memiliki jadwal praktik di {$namaPoli} pada jam {$bentrokDokter->jam_mulai} - {$bentrokDokter->jam_selesai}.";
        }

        return [
            'ada_bentrok' => !empty($catatanBentrok),
            'catatan' => implode(' ', $catatanBentrok) ?: null,
        ];
    }
}
