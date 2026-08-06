<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dokter;
use App\Models\JadwalDokter;
use App\Services\JadwalBentrokService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JadwalDokterApiController extends Controller
{
    public function __construct(
        protected JadwalBentrokService $bentrokService
    ) {}

    /**
     * List Jadwal Praktik Dokter Mandiri (Dokter POV - Layar 1)
     */
    public function mandiri(Request $request): JsonResponse
    {
        $user = $request->user();
        $dokter = Dokter::where('email', $user->email)->orWhere('id', $user->id)->first();

        $startDate = $request->query('start_date', now()->startOfWeek()->toDateString());
        $endDate = $request->query('end_date', now()->endOfWeek()->toDateString());

        $jadwal = JadwalDokter::with(['poli', 'ruangan'])
            ->when($dokter, fn($q) => $q->where('dokter_id', $dokter->id))
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->orderBy('tanggal')
            ->orderBy('jam_mulai')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil jadwal mandiri dokter',
            'data' => $jadwal,
        ]);
    }

    /**
     * Calendar Grid & Workload Summary (Admin POV - Layar 3)
     */
    public function gridAdmin(Request $request): JsonResponse
    {
        $startDate = $request->query('start_date', now()->startOfWeek()->toDateString());
        $endDate = $request->query('end_date', now()->endOfWeek()->toDateString());
        $dokterId = $request->query('dokter_id');

        $jadwal = JadwalDokter::with(['dokter', 'poli', 'ruangan'])
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->when($dokterId, fn($q) => $q->where('dokter_id', $dokterId))
            ->orderBy('tanggal')
            ->orderBy('jam_mulai')
            ->get();

        // Workload summary per dokter
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
            $targetHours = $doc->target_weekly_hours ?? 40;
            $percentage = $targetHours > 0 ? min(100, round(($loggedHours / $targetHours) * 100)) : 0;

            return [
                'dokter_id' => $doc->id,
                'nama_dokter' => $doc->nama_lengkap,
                'spesialisasi' => $doc->spesialisasi,
                'logged_hours' => $loggedHours,
                'target_hours' => $targetHours,
                'percentage' => $percentage,
                'has_conflict' => $hasConflict,
                'conflict_hours' => $conflictHours,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'schedules' => $jadwal,
                'workload_summary' => $dokters,
            ],
        ]);
    }

    /**
     * Tambah Jadwal Praktik Baru (Admin POV)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dokter_id' => 'required|uuid|exists:dokters,id',
            'poli_id' => 'required|uuid|exists:poli,id',
            'ruangan_id' => 'nullable|uuid|exists:ruangan,id',
            'tanggal' => 'required|date',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'kuota_maksimal' => 'integer|min:1',
        ]);

        $hari = date('N', strtotime($validated['tanggal']));
        $validated['hari'] = $hari;

        // Cek bentrok
        $conflictCheck = $this->bentrokService->periksaBentrok($validated);
        $validated['ada_bentrok'] = $conflictCheck['ada_bentrok'];
        $validated['catatan_bentrok'] = $conflictCheck['catatan'];

        $jadwal = JadwalDokter::create($validated);

        return response()->json([
            'success' => true,
            'message' => $validated['ada_bentrok'] 
                ? 'Jadwal berhasil disimpan, namun terdeteksi bentrok!' 
                : 'Jadwal praktik berhasil ditambahkan.',
            'data' => $jadwal->load(['dokter', 'poli', 'ruangan']),
        ], 201);
    }
}
