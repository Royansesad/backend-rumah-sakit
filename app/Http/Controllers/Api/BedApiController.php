<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bed;
use App\Models\Bangsal;
use App\Models\Ruangan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BedApiController extends Controller
{
    /**
     * Display a listing of beds.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Bed::with(['ruangan', 'bangsal', 'activeAdmission.pasien', 'activeAdmission.dpjp']);

        if ($request->filled('ruangan_id')) {
            $query->where('ruangan_id', $request->query('ruangan_id'));
        }

        if ($request->filled('bangsal_id')) {
            $query->where('bangsal_id', $request->query('bangsal_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('kelas')) {
            $query->where('kelas', $request->query('kelas'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('nomor_bed', 'like', "%{$search}%")
                  ->orWhereHas('ruangan', function ($rq) use ($search) {
                      $rq->where('nama_ruangan', 'like', "%{$search}%");
                  })
                  ->orWhereHas('bangsal', function ($bq) use ($search) {
                      $bq->where('nama_bangsal', 'like', "%{$search}%");
                  });
            });
        }

        $beds = $query->orderBy('nomor_bed', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $beds,
        ]);
    }

    /**
     * Store a newly created bed.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nomor_bed' => 'required|string|max:50',
            'ruangan_id' => 'nullable|uuid|exists:ruangan,id',
            'bangsal_id' => 'nullable|uuid|exists:bangsal,id',
            'kelas' => 'required|in:VIP,Kelas 1,Kelas 2,Kelas 3,ICU,HCU,Isolasi',
            'tarif_per_hari' => 'required|numeric|min:0',
            'status' => 'required|in:tersedia,terisi,pemeliharaan,dibersihkan',
            'catatan' => 'nullable|string',
        ]);

        $bed = Bed::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Tempat tidur (Bed) berhasil ditambahkan',
            'data' => $bed->load(['ruangan', 'bangsal']),
        ], 201);
    }

    /**
     * Display the specified bed.
     */
    public function show(string $id): JsonResponse
    {
        $bed = Bed::with(['ruangan', 'bangsal', 'activeAdmission.pasien', 'activeAdmission.dpjp'])->find($id);

        if (! $bed) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tempat tidur tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $bed,
        ]);
    }

    /**
     * Update the specified bed.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $bed = Bed::find($id);

        if (! $bed) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tempat tidur tidak ditemukan',
            ], 404);
        }

        $validated = $request->validate([
            'nomor_bed' => 'sometimes|required|string|max:50',
            'ruangan_id' => 'nullable|uuid|exists:ruangan,id',
            'bangsal_id' => 'nullable|uuid|exists:bangsal,id',
            'kelas' => 'sometimes|required|in:VIP,Kelas 1,Kelas 2,Kelas 3,ICU,HCU,Isolasi',
            'tarif_per_hari' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|in:tersedia,terisi,pemeliharaan,dibersihkan',
            'catatan' => 'nullable|string',
        ]);

        $bed->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Tempat tidur berhasil diperbarui',
            'data' => $bed->load(['ruangan', 'bangsal']),
        ]);
    }

    /**
     * Update bed status specifically.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $bed = Bed::find($id);

        if (! $bed) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tempat tidur tidak ditemukan',
            ], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:tersedia,terisi,pemeliharaan,dibersihkan',
            'catatan' => 'nullable|string',
        ]);

        if ($bed->status === 'terisi' && $validated['status'] === 'tersedia') {
            // Check if there is an active admission
            if ($bed->activeAdmission) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tidak dapat mengubah status bed menjadi tersedia karena masih ditempati pasien aktif. Lakukan Check-Out terlebih dahulu.',
                ], 422);
            }
        }

        $bed->update([
            'status' => $validated['status'],
            'catatan' => $validated['catatan'] ?? $bed->catatan,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Status tempat tidur berhasil diubah',
            'data' => $bed,
        ]);
    }

    /**
     * Remove the specified bed.
     */
    public function destroy(string $id): JsonResponse
    {
        $bed = Bed::find($id);

        if (! $bed) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tempat tidur tidak ditemukan',
            ], 404);
        }

        if ($bed->status === 'terisi' || $bed->activeAdmission) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tempat tidur sedang terisi pasien, tidak dapat dihapus',
            ], 422);
        }

        $bed->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Tempat tidur berhasil dihapus',
        ]);
    }

    /**
     * Get real-time bed occupancy matrix & summary statistics.
     */
    public function matrix(): JsonResponse
    {
        $totalBeds = Bed::count();
        $tersedia = Bed::where('status', 'tersedia')->count();
        $terisi = Bed::where('status', 'terisi')->count();
        $dibersihkan = Bed::where('status', 'dibersihkan')->count();
        $pemeliharaan = Bed::where('status', 'pemeliharaan')->count();

        $bor = $totalBeds > 0 ? round(($terisi / $totalBeds) * 100, 2) : 0;

        $bangsals = Bangsal::with(['beds' => function ($q) {
            $q->with(['ruangan', 'activeAdmission.pasien', 'activeAdmission.dpjp']);
        }])->where('is_aktif', true)->get();

        $ruangans = Ruangan::with(['beds' => function ($q) {
            $q->with(['bangsal', 'activeAdmission.pasien', 'activeAdmission.dpjp']);
        }])->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'statistik' => [
                    'total_bed' => $totalBeds,
                    'tersedia' => $tersedia,
                    'terisi' => $terisi,
                    'dibersihkan' => $dibersihkan,
                    'pemeliharaan' => $pemeliharaan,
                    'bor_percentage' => $bor,
                ],
                'bangsal_matrix' => $bangsals,
                'ruangan_matrix' => $ruangans,
            ],
        ]);
    }
}
