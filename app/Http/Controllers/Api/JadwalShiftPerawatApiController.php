<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalShiftPerawat;
use App\Models\Perawat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JadwalShiftPerawatApiController extends Controller
{
    /**
     * Get Jadwal Shift Perawat Per Bangsal (Perawat POV - Layar 2)
     */
    public function index(Request $request): JsonResponse
    {
        $bangsalId = $request->query('bangsal_id');
        $startDate = $request->query('start_date', now()->startOfWeek()->toDateString());
        $endDate = $request->query('end_date', now()->endOfWeek()->toDateString());

        $user = $request->user();
        $perawatSaya = Perawat::where('email', $user->email)->orWhere('id', $user->id)->first();

        $shifts = JadwalShiftPerawat::with(['perawat', 'bangsal'])
            ->when($bangsalId, fn($q) => $q->where('bangsal_id', $bangsalId))
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->orderBy('tanggal')
            ->orderBy('jam_mulai')
            ->get()
            ->map(function ($s) use ($perawatSaya) {
                $s->is_saya = $perawatSaya && $s->perawat_id === $perawatSaya->id;
                return $s;
            });

        return response()->json([
            'success' => true,
            'data' => $shifts,
        ]);
    }

    /**
     * Tambah/Assign Shift Perawat (Admin / Kepala Ruangan)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'perawat_id' => 'required|uuid|exists:perawats,id',
            'bangsal_id' => 'required|uuid|exists:bangsal,id',
            'tanggal' => 'required|date',
            'jenis_shift' => 'required|in:pagi,siang,malam',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i',
        ]);

        $shift = JadwalShiftPerawat::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal shift perawat berhasil ditambahkan.',
            'data' => $shift->load(['perawat', 'bangsal']),
        ], 201);
    }
}
