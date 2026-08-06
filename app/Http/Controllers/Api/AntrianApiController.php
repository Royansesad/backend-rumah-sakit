<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Antrian;
use App\Models\JadwalDokter;
use App\Services\AntrianService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AntrianApiController extends Controller
{
    public function __construct(
        protected AntrianService $antrianService
    ) {}

    /**
     * Ambil Nomor Antrian (Loket / Walk-in / Kios)
     */
    public function ambilAntrian(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'jadwal_dokter_id' => 'required|uuid|exists:jadwal_dokter,id',
            'pasien_id' => 'required|uuid|exists:pasien,id',
            'tipe_pasien' => 'nullable|in:umum,bpjs,prioritas',
        ]);

        try {
            $antrian = $this->antrianService->ambilNomorAntrian($validated);

            return response()->json([
                'success' => true,
                'message' => 'Nomor antrian berhasil diterbitkan.',
                'data' => $antrian->load(['poli', 'dokter', 'pasien']),
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * List Antrian Hari Ini Per Dokter / Poli
     */
    public function indexHariIni(Request $request): JsonResponse
    {
        $jadwalDokterId = $request->query('jadwal_dokter_id');
        $poliId = $request->query('poli_id');

        $antrian = Antrian::with(['pasien', 'poli', 'dokter', 'loket'])
            ->whereDate('created_at', now()->toDateString())
            ->when($jadwalDokterId, fn($q) => $q->where('jadwal_dokter_id', $jadwalDokterId))
            ->when($poliId, fn($q) => $q->where('poli_id', $poliId))
            ->orderBy('angka_antrian')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $antrian,
        ]);
    }

    /**
     * Update Status Antrian (skrining perawat, dipanggil dokter, selesai)
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:skrining,dipanggil,sedang_dilayani,selesai,dilewati,dibatalkan',
            'loket_id' => 'nullable|uuid|exists:loket_antrian,id',
        ]);

        $antrian = Antrian::findOrFail($id);

        try {
            $updated = $this->antrianService->updateStatusAntrian(
                $antrian, 
                $validated['status'], 
                $validated['loket_id'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => "Status antrian berhasil diubah menjadi {$validated['status']}.",
                'data' => $updated,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Public TV Display Papan Panggilan Antrian (Public Read-Only)
     */
    public function tvBoard(Request $request): JsonResponse
    {
        $poliId = $request->query('poli_id');

        $sedangDipanggil = Antrian::with(['poli', 'dokter', 'pasien', 'loket'])
            ->whereDate('created_at', now()->toDateString())
            ->when($poliId, fn($q) => $q->where('poli_id', $poliId))
            ->whereIn('status', ['dipanggil', 'sedang_dilayani'])
            ->orderBy('waktu_dipanggil', 'desc')
            ->first();

        $daftarTunggu = Antrian::with(['pasien'])
            ->whereDate('created_at', now()->toDateString())
            ->when($poliId, fn($q) => $q->where('poli_id', $poliId))
            ->whereIn('status', ['menunggu', 'skrining'])
            ->orderBy('angka_antrian')
            ->take(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'sedang_dipanggil' => $sedangDipanggil,
                'daftar_tunggu' => $daftarTunggu,
            ],
        ]);
    }
}
