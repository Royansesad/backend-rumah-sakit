<?php

namespace App\Http\Controllers;

use App\Models\Antrian;
use App\Models\Dokter;
use App\Models\JadwalDokter;
use App\Models\LoketAntrian;
use App\Models\Pasien;
use App\Models\Poli;
use App\Models\Ruangan;
use App\Services\AntrianService;
use Inertia\Inertia;
use Inertia\Response;

class AntrianWebController extends Controller
{
    public function __construct(
        protected AntrianService $antrianService
    ) {}

    /**
     * Halaman Manajemen Antrian (Resepsionis / Admin / Perawat / Dokter)
     */
    public function index(): Response
    {
        $user = session('simrs_user');
        $role = session('simrs_role', 'resepsionis');
        $hariIni = now()->toDateString();

        $this->ensureTodaySchedulesExist();

        // Jadwal dokter hari ini yang tersedia, beserta count antrian aktif
        $jadwalDokterHariIni = JadwalDokter::with(['dokter:id,nama_lengkap,spesialisasi', 'poli:id,nama_poli', 'ruangan:id,nama_ruangan'])
            ->withCount(['antrian as antrian_aktif_count' => fn($q) => $q->whereDate('created_at', $hariIni)->where('status', '!=', 'dibatalkan')])
            ->whereDate('tanggal', $hariIni)
            ->where('status', 'tersedia')
            ->orderBy('jam_mulai')
            ->get()
            ->map(function ($jadwal) {
                $jadwal->sisa_kuota = max(0, $jadwal->kuota_maksimal - $jadwal->antrian_aktif_count);
                return $jadwal;
            });

        // Daftar antrian hari ini
        $antrianHariIni = Antrian::with(['pasien:id,nama_lengkap,nomor_rekam_medis', 'poli:id,nama_poli', 'dokter:id,nama_lengkap,spesialisasi', 'loket:id,nama_loket'])
            ->whereDate('created_at', $hariIni)
            ->orderBy('angka_antrian')
            ->get();

        // Loket antrian aktif
        $loketList = LoketAntrian::where('is_aktif', true)->get();

        // Daftar pasien untuk pencarian (limit untuk performa)
        $pasienList = Pasien::select('id', 'nama_lengkap', 'nomor_rekam_medis')
            ->orderBy('nama_lengkap')
            ->limit(500)
            ->get();

        // Statistik hari ini
        $statistik = $this->antrianService->hitungStatistikHariIni();

        return Inertia::render('manajemen-antrian', [
            'user' => $user,
            'role' => $role,
            'jadwalDokterHariIni' => $jadwalDokterHariIni,
            'antrianHariIni' => $antrianHariIni,
            'loketList' => $loketList,
            'pasienList' => $pasienList,
            'statistik' => $statistik,
        ]);
    }

    /**
     * Memastikan seluruh dokter aktif memiliki jadwal praktik untuk hari ini
     */
    private function ensureTodaySchedulesExist(): void
    {
        $hariIni = now()->toDateString();
        $hariNomor = now()->dayOfWeekIso;
        $dokters = Dokter::where('status_praktik', 'aktif')->get();
        $ruangan = Ruangan::first();

        foreach ($dokters as $idx => $doc) {
            $exists = JadwalDokter::where('dokter_id', $doc->id)
                ->whereDate('tanggal', $hariIni)
                ->exists();

            if (! $exists) {
                $jamMulai = ($idx % 2 === 0) ? '08:00' : '13:00';
                $jamSelesai = ($idx % 2 === 0) ? '12:00' : '17:00';

                JadwalDokter::create([
                    'dokter_id' => $doc->id,
                    'poli_id' => $doc->poli_id ?? Poli::first()?->id,
                    'ruangan_id' => $ruangan?->id,
                    'tanggal' => $hariIni,
                    'hari' => $hariNomor,
                    'jam_mulai' => $jamMulai,
                    'jam_selesai' => $jamSelesai,
                    'kuota_maksimal' => 30,
                    'status' => 'tersedia',
                    'ada_bentrok' => false,
                ]);
            }
        }
    }
}
