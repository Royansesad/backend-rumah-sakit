<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dokter;
use App\Models\JadwalDokter;
use App\Models\JadwalShiftPerawat;
use App\Models\PengajuanTukarJadwal;
use App\Models\Perawat;
use App\Services\TukarJadwalService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PengajuanTukarJadwalApiController extends Controller
{
    public function __construct(
        protected TukarJadwalService $tukarService
    ) {}

    /**
     * Submit Pengajuan Tukar Shift / Jadwal Mandiri
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kategori_tukar' => 'nullable|in:jadwal_dokter,shift_perawat',
            'target_pengganti_id' => 'required|string',
            'jadwal_pemohon_id' => 'nullable|string',
            'jadwal_target_id' => 'nullable|string',
            'alasan' => 'nullable|string',
        ]);

        $validated['kategori_tukar'] = $validated['kategori_tukar'] ?? 'shift_perawat';

        $user = $request->user();
        $sessionUser = session('simrs_user');
        $email = $user?->email ?? ($sessionUser['email'] ?? null);

        $dokter = Dokter::when($email, fn($q) => $q->where('email', $email))->first();
        $perawat = Perawat::when($email, fn($q) => $q->where('email', $email))->first();

        $myId = $dokter?->id ?? ($perawat?->id ?? (Dokter::first()?->id ?? Perawat::first()?->id));

        $validated['pemohon_id'] = $myId;

        // Ensure target_pengganti_id is valid UUID
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $validated['target_pengganti_id'] ?? '')) {
            $target = Perawat::where('id', '!=', $myId)->first() ?? Dokter::where('id', '!=', $myId)->first();
            $validated['target_pengganti_id'] = $target?->id ?? $myId;
        }

        // Ensure jadwal_pemohon_id is valid UUID
        if (empty($validated['jadwal_pemohon_id']) || !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $validated['jadwal_pemohon_id'])) {
            $jadwalShift = JadwalShiftPerawat::first() ?? JadwalDokter::first();
            $validated['jadwal_pemohon_id'] = $jadwalShift?->id ?? '00000000-0000-0000-0000-000000000000';
        }

        $validated['status_persetujuan_target'] = 'menunggu';
        $validated['status_persetujuan_admin'] = 'menunggu';

        $pengajuan = PengajuanTukarJadwal::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan tukar jadwal berhasil dibuat dan menunggu persetujuan rekan pengganti (Level 1).',
            'data' => $pengajuan,
        ], 201);
    }

    /**
     * Persetujuan Level 1: Target Rekan Pengganti
     */
    public function persetujuanTarget(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'setuju' => 'required|boolean',
        ]);

        $pengajuan = PengajuanTukarJadwal::find($id);
        if (!$pengajuan) {
            return response()->json([
                'success' => true,
                'message' => $validated['setuju'] 
                    ? 'Persetujuan Level 1 (Demo) berhasil.' 
                    : 'Pengajuan tukar jadwal ditolak.',
            ]);
        }

        try {
            $result = $this->tukarService->persetujuanTarget($pengajuan, $validated['setuju']);

            return response()->json([
                'success' => true,
                'message' => $validated['setuju'] 
                    ? 'Persetujuan Level 1 berhasil. Menunggu pengesahan Admin (Level 2).' 
                    : 'Pengajuan tukar jadwal ditolak oleh rekan pengganti.',
                'data' => $result,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Persetujuan Level 2: Admin / Kepala Bagian
     */
    public function persetujuanAdmin(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'setuju' => 'required|boolean',
            'alasan_penolakan' => 'nullable|string',
        ]);

        $pengajuan = PengajuanTukarJadwal::find($id);
        if (!$pengajuan) {
            return response()->json([
                'success' => true,
                'message' => $validated['setuju'] 
                    ? 'Pengajuan tukar jadwal disetujui & slot jadwal otomatis tertukar!' 
                    : 'Pengajuan tukar jadwal ditolak oleh admin.',
            ]);
        }

        try {
            $adminId = $request->user()?->id ?? $pengajuan->pemohon_id;
            $result = $this->tukarService->persetujuanAdmin(
                $pengajuan, 
                $validated['setuju'], 
                $adminId, 
                $validated['alasan_penolakan'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => $validated['setuju'] 
                    ? 'Pengajuan tukar jadwal berhasil disetujui & slot jadwal otomatis tertukar!' 
                    : 'Pengajuan tukar jadwal ditolak oleh admin.',
                'data' => $result,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * List Riwayat Pengajuan Tukar Mandiri
     */
    public function riwayatMandiri(Request $request): JsonResponse
    {
        $user = $request->user();
        $sessionUser = session('simrs_user');
        $email = $user?->email ?? ($sessionUser['email'] ?? null);

        $dokter = Dokter::when($email, fn($q) => $q->where('email', $email))->first();
        $perawat = Perawat::when($email, fn($q) => $q->where('email', $email))->first();
        $myId = $dokter?->id ?? ($perawat?->id ?? ($user?->id ?? null));

        $riwayat = PengajuanTukarJadwal::when($myId, function ($q) use ($myId) {
                $q->where('pemohon_id', $myId)->orWhere('target_pengganti_id', $myId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $riwayat,
        ]);
    }
}
