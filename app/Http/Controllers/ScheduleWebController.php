<?php

namespace App\Http\Controllers;

use App\Models\Bangsal;
use App\Models\Dokter;
use App\Models\JadwalDokter;
use App\Models\JadwalShiftPerawat;
use App\Models\PengajuanCuti;
use App\Models\PengajuanTukarJadwal;
use App\Models\Perawat;
use App\Models\Poli;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleWebController extends Controller
{
    /**
     * Layar 1: Jadwal Praktik Dokter (Self-Service & Pengajuan)
     */
    public function dokterSchedule(Request $request): Response
    {
        $user = session('simrs_user');
        $role = session('simrs_role', 'dokter');

        $dokter = Dokter::where('email', $user['email'] ?? '')->first() ?? Dokter::first();

        $startDate = now()->startOfWeek()->toDateString();
        $endDate = now()->endOfWeek()->toDateString();

        $jadwalMandiri = JadwalDokter::with(['poli', 'ruangan'])
            ->when($dokter, fn($q) => $q->where('dokter_id', $dokter->id))
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->get();

        $riwayatPengajuan = PengajuanCuti::where('pemohon_id', $dokter->id ?? null)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $riwayatTukar = PengajuanTukarJadwal::where('pemohon_id', $dokter->id ?? null)
            ->orWhere('target_pengganti_id', $dokter->id ?? null)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $dokterList = Dokter::select('id', 'nama_lengkap', 'spesialisasi')->get();

        return Inertia::render('jadwal-praktik', [
            'user' => $user ?? $dokter,
            'role' => $role,
            'jadwalMandiri' => $jadwalMandiri,
            'riwayatPengajuan' => $riwayatPengajuan,
            'riwayatTukar' => $riwayatTukar,
            'dokterList' => $dokterList,
        ]);
    }

    /**
     * Layar 2: Manajemen Jadwal Shift Perawat
     */
    public function nurseShiftSchedule(Request $request): Response
    {
        $user = session('simrs_user');
        $role = session('simrs_role', 'perawat');

        $perawat = Perawat::where('email', $user['email'] ?? '')->first() ?? Perawat::first();

        $bangsalList = Bangsal::where('is_aktif', true)->get();
        $selectedBangsalId = $request->query('bangsal_id', $bangsalList->first()->id ?? null);

        $startDate = now()->startOfWeek()->toDateString();
        $endDate = now()->endOfWeek()->toDateString();

        $shifts = JadwalShiftPerawat::with(['perawat', 'bangsal'])
            ->when($selectedBangsalId, fn($q) => $q->where('bangsal_id', $selectedBangsalId))
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->get();

        $perawatList = Perawat::select('id', 'nama_lengkap')->get();

        $riwayatTukar = PengajuanTukarJadwal::where('kategori_tukar', 'shift_perawat')
            ->where(function ($q) use ($perawat) {
                if ($perawat) {
                    $q->where('pemohon_id', $perawat->id)
                      ->orWhere('target_pengganti_id', $perawat->id);
                }
            })
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('jadwal-shift', [
            'user' => $user ?? $perawat,
            'role' => $role,
            'bangsalList' => $bangsalList,
            'selectedBangsalId' => $selectedBangsalId,
            'shifts' => $shifts,
            'perawatList' => $perawatList,
            'riwayatTukar' => $riwayatTukar,
        ]);
    }

    /**
     * Layar 3: Manajemen Jadwal Dokter (Admin Panel)
     */
    public function adminDoctorSchedule(Request $request): Response
    {
        $user = session('simrs_user');
        $role = session('simrs_role', 'admin');

        $startDate = now()->startOfWeek()->toDateString();
        $endDate = now()->endOfWeek()->toDateString();

        $jadwalGrid = JadwalDokter::with(['dokter', 'poli', 'ruangan'])
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->get();

        $dokters = Dokter::with('poli')->get()->map(function ($doc) use ($startDate, $endDate) {
            $schedules = JadwalDokter::where('dokter_id', $doc->id)
                ->whereBetween('tanggal', [$startDate, $endDate])
                ->get();

            $totalMinutes = 0;
            $conflictHours = 0;
            $hasConflict = false;

            foreach ($schedules as $s) {
                $start = strtotime($s->jam_mulai);
                $end = strtotime($s->jam_selesai);
                $diff = max(0, ($end - $start) / 60);
                $totalMinutes += $diff;

                if ($s->ada_bentrok) {
                    $hasConflict = true;
                    $conflictHours += round($diff / 60, 1);
                }
            }

            $loggedHours = round($totalMinutes / 60, 1);
            $targetHours = 40;
            $percentage = min(100, round(($loggedHours / $targetHours) * 100));

            return [
                'id' => $doc->id,
                'nama_lengkap' => $doc->nama_lengkap,
                'spesialisasi' => $doc->spesialisasi,
                'logged_hours' => $loggedHours,
                'target_hours' => $targetHours,
                'percentage' => $percentage,
                'has_conflict' => $hasConflict,
                'conflict_hours' => $conflictHours,
            ];
        });

        $poliList = Poli::all();
        $ruanganList = Ruangan::all();

        $pendingCutiList = PengajuanCuti::where('status', 'menunggu')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('jadwal-dokter-admin', [
            'user' => $user,
            'role' => $role,
            'jadwalGrid' => $jadwalGrid,
            'workloadSummary' => $dokters,
            'dokters' => Dokter::all(),
            'poliList' => $poliList,
            'ruanganList' => $ruanganList,
            'pendingCutiList' => $pendingCutiList,
        ]);
    }

    /**
     * Layar Public TV Display Antrian Pasien
     */
    public function publicQueueBoard(): Response
    {
        $poliList = Poli::all();

        return Inertia::render('papan-antrian', [
            'poliList' => $poliList,
        ]);
    }
}
